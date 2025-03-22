import { executeQuery, executeQuerySingle, getDbConnection, closeDbConnection } from '@/lib/sqlite';

// 책 내용 타입 정의
export interface BookContent {
  bookId: string;
  chinese: string;
  chineseKo: string;
  contentId: number;
  depth: string;
  english: string;
  korean: string;
  level: string;
  path: string;
  sectId: number;
  sectNum: string;
  volumeNum: number;
}

// 책 메타데이터 타입 정의
export interface BookMetadata {
  bookId: string;
  bookNum: number;
  title: string;
  titleChinese?: string;
  author?: string;
  publishYear?: string;
  translator?: string;
  edition?: string;
  language?: string;
  volumes?: number;
}

/**
 * 책의 특정 권(volume)의 모든 내용을 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @param volumeNum 권 번호
 * @returns 책 내용 배열
 */
export async function getBookVolumeContents(bookId: string, volumeNum: number): Promise<BookContent[]> {
  try {
    // 테이블 이름은 bookId와 동일
    const query = `
      SELECT * FROM ${bookId}
      WHERE volumeNum = ?
      ORDER BY contentId ASC
    `;

    const contents = await executeQuery<BookContent[]>(query, [volumeNum]);
    return contents;
  } catch (error) {
    console.error(`책 내용 조회 오류 (${bookId}, 권: ${volumeNum}):`, error);
    return [];
  }
}

/**
 * 책의 특정 권(volume)의 최상위 내용만 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @param volumeNum 권 번호
 * @returns 최상위 내용 배열
 */
export async function getBookVolumeTopLevelContents(bookId: string, volumeNum: number): Promise<BookContent[]> {
  try {
    const db = await getDbConnection();
    const results = await new Promise<BookContent[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM ${bookId}
         WHERE volumeNum = ? AND depth = ''
         ORDER BY contentId`,
        [volumeNum],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows as BookContent[]);
        }
      );
    });
    return results;
  } catch (error) {
    console.error(`최상위 내용 조회 오류 (${bookId}, 권: ${volumeNum}):`, error);
    return [];
  } finally {
    await closeDbConnection();
  }
}

/**
 * 특정 내용의 하위 내용을 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @param contentId 상위 내용 ID
 * @returns 하위 내용 배열
 */
export async function getBookContentChildren(bookId: string, contentId: number): Promise<BookContent[]> {
  try {
    // 먼저 해당 contentId의 sectId와 path를 가져옵니다
    const parentContent = await getBookContent(bookId, contentId);

    if (!parentContent) {
      return [];
    }

    const { sectId, volumeNum, path } = parentContent;

    // 현재 콘텐츠의 path에 sectId를 추가하여 하위 콘텐츠의 path 패턴을 만듭니다
    // path는 'volumeNum,sectId1,sectId2,...'와 같은 형식으로 구성됨
    // 예: '1,136,137'는 volumeNum=1, sectId=136의 하위, sectId=137의 하위를 의미

    // 직접적인 하위 콘텐츠만 가져오기 위해 depth를 고려합니다
    // 현재 콘텐츠의 path에 sectId를 추가한 패턴으로 시작하는 path를 가진 콘텐츠 중
    // 추가 sectId가 하나만 있는 콘텐츠를 가져옵니다

    // 현재 path에서 마지막 콤마 위치를 찾습니다
    const pathPrefix = path ? `${path},${sectId}` : `${volumeNum},${sectId}`;

    const query = `
      SELECT * FROM ${bookId}
      WHERE volumeNum = ? AND path LIKE ?
      ORDER BY sectId ASC
    `;

    // 같은 권에서 path가 현재 콘텐츠의 path로 시작하는 항목 검색
    const contents = await executeQuery<BookContent[]>(query, [volumeNum, `${pathPrefix},%`]);
    return contents;
  } catch (error) {
    console.error(`하위 내용 조회 오류 (${bookId}, 내용 ID: ${contentId}):`, error);
    return [];
  }
}

/**
 * 책의 메타데이터를 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @returns 책 메타데이터
 */
export async function getBookMetadata(bookId: string): Promise<BookMetadata | null> {
  try {
    const db = await getDbConnection();
    const result = await new Promise<BookMetadata | null>((resolve, reject) => {
      db.get(`SELECT * FROM Book WHERE bookId = ?`, [bookId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as BookMetadata | null);
      });
    });
    return result;
  } catch (error) {
    console.error(`책 메타데이터 조회 오류 (${bookId}):`, error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

/**
 * 책의 모든 권(volume) 목록을 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @returns 권 번호 배열
 */
export async function getBookVolumes(bookId: string): Promise<number[]> {
  try {
    const query = `
      SELECT DISTINCT volumeNum FROM ${bookId}
      ORDER BY volumeNum ASC
    `;

    const volumes = await executeQuery<Array<{ volumeNum: number }>>(query);
    return volumes.map((v) => v.volumeNum);
  } catch (error) {
    console.error(`책 권 목록 조회 오류 (${bookId}):`, error);
    return [];
  }
}

/**
 * 특정 내용의 경로를 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @param contentId 내용 ID
 * @returns 경로 정보
 */
export async function getContentPath(bookId: string, contentId: number): Promise<BookContent[]> {
  try {
    const content = await executeQuerySingle<BookContent>(`SELECT * FROM ${bookId} WHERE contentId = ?`, [contentId]);

    if (!content || !content.path) {
      return [];
    }

    // path 필드에서 contentId 목록 추출
    const pathIds = content.path
      .split(',')
      .filter((id) => id.trim() !== '')
      .map((id) => parseInt(id.trim()));

    if (pathIds.length === 0) {
      return [];
    }

    // 경로에 있는 모든 내용 가져오기
    const query = `
      SELECT * FROM ${bookId}
      WHERE contentId IN (${pathIds.join(',')})
      ORDER BY contentId ASC
    `;

    const pathContents = await executeQuery<BookContent[]>(query);
    return pathContents;
  } catch (error) {
    console.error(`내용 경로 조회 오류 (${bookId}, 내용 ID: ${contentId}):`, error);
    return [];
  }
}

/**
 * 특정 contentId에 해당하는 콘텐츠를 가져옵니다.
 * @param bookId 책 ID (예: 'MC_0008')
 * @param contentId 콘텐츠 ID
 * @returns 콘텐츠 정보
 */
export async function getBookContent(bookId: string, contentId: number): Promise<BookContent | null> {
  try {
    const query = `
      SELECT * FROM ${bookId}
      WHERE contentId = ?
    `;

    const content = await executeQuerySingle<BookContent>(query, [contentId]);
    return content;
  } catch (error) {
    console.error(`콘텐츠 조회 오류 (${bookId}, 콘텐츠 ID: ${contentId}):`, error);
    return null;
  }
}

export async function getBookVolumeContent(bookId: string, volumeNum: number, path: string) {
  const db = getDbConnection();
  try {
    // bookId 조거 제거
    const content = db
      .prepare(
        `
        SELECT * FROM ${bookId}
        WHERE volumeNum = ?
        AND path = ?
        ORDER BY contentId ASC
      `
      )
      .get(volumeNum, path);

    return content;
  } finally {
    db.close();
  }
}
