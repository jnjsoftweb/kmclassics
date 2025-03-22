import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchGraphQL, bookQueries } from '@/lib/graphql';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDbConnection, closeDbConnection } from '@/lib/sqlite';

// 책 타입 정의
interface Book {
  bookId: string;
  bookNum: number;
  title: string;
  volumes?: number;
  chars?: number;
  source?: string;
  titleChinese?: string;
  author?: string;
  publishYear?: string;
  translator?: string;
  edition?: string;
  language?: string;
  physicalInfo?: string;
  publisher?: string;
  location?: string;
  confidenceLevel?: string;
  abstract?: string;
  references?: string;
  volume?: string;
  translatorInfo?: string;
  bibliographicInfo?: string;
  authorInfo?: string;
  publicationInfo?: string;
  classification?: string;
  subject?: string;
  keywords?: string;
  ebooks?: string;
  category?: string;
  similars?: string;
}

// GraphQL 응답 타입
interface BookResponse {
  book: Book | null;
}

// 메타데이터 생성 함수
export async function generateMetadata({ params }: { params: { bookId: string } }): Promise<Metadata> {
  const bookId = params.bookId;

  // 유효한 bookId인지 확인
  if (!bookId) {
    return {
      title: '잘못된 책 ID',
      description: '유효하지 않은 책 ID입니다.',
    };
  }

  const book = await getBookData(bookId);

  if (!book) {
    return {
      title: '책을 찾을 수 없습니다',
      description: '요청하신 책을 찾을 수 없습니다.',
    };
  }

  return {
    title: `${book.title} | KM Classics`,
    description: book.abstract || `${book.title} - ${book.author || '저자 미상'}`,
  };
}

// 책 데이터 가져오기
async function getBookData(bookId: string): Promise<Book | null> {
  try {
    const data = await fetchGraphQL<BookResponse>(bookQueries.getBookById, { bookId });

    return data.book;
  } catch (error) {
    console.error('책 데이터 조회 오류:', error);
    return null;
  }
}

export async function getBookMetadata(bookId: string) {
  try {
    const db = await getDbConnection();
    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM Book WHERE bookId = ?`, [bookId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
    return result;
  } catch (error) {
    console.error('책 메타데이터 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

export async function getBookVolumeTopLevelContents(bookId: string, volumeNum: number) {
  try {
    const db = await getDbConnection();
    const results = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM BookContent 
         WHERE bookId = ? AND volumeNum = ? AND parentId IS NULL 
         ORDER BY contentId`,
        [bookId, volumeNum],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
    return results;
  } catch (error) {
    console.error('책 권별 콘텐츠 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

export async function getBookVolumeContents(bookId: string, volumeNum: number, parentId: number | null) {
  try {
    const db = await getDbConnection();
    const results = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM BookContent 
         WHERE bookId = ? AND volumeNum = ? AND parentId = ? 
         ORDER BY contentId`,
        [bookId, volumeNum, parentId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
    return results;
  } catch (error) {
    console.error('책 권별 콘텐츠 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

export default async function BookDetailPage({ params }: { params: { bookId: string } }) {
  const bookId = params.bookId;

  // 유효한 bookId인지 확인
  if (!bookId) {
    notFound();
  }

  const book = await getBookData(bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 사이드바 - 책 기본 정보 */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{book.title}</CardTitle>
              {book.titleChinese && <CardDescription className="text-lg mt-2">{book.titleChinese}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-500">저자</div>
                  <div className="col-span-2">{book.author || '미상'}</div>
                </div>

                {book.translator && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">번역자</div>
                    <div className="col-span-2">{book.translator}</div>
                  </div>
                )}

                {book.publishYear && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">출판년도</div>
                    <div className="col-span-2">{book.publishYear}</div>
                  </div>
                )}

                {book.publisher && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">출판사</div>
                    <div className="col-span-2">{book.publisher}</div>
                  </div>
                )}

                {book.volumes && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">권수</div>
                    <div className="col-span-2">{book.volumes}권</div>
                  </div>
                )}

                {book.language && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">언어</div>
                    <div className="col-span-2">{book.language}</div>
                  </div>
                )}

                {book.category && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">분류</div>
                    <div className="col-span-2">{book.category}</div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col w-full gap-2">
                <Button className="w-full">원문 보기</Button>
                {book.ebooks && (
                  <Button variant="outline" className="w-full">
                    전자책 다운로드
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* 유사 도서 */}
          {book.similars && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">유사 도서</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {book.similars.split(',').map((similar, index) => (
                    <div key={index} className="text-blue-600 hover:underline">
                      {similar.trim()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽 메인 컨텐츠 - 상세 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 초록 */}
          {book.abstract && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">초록</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.abstract}</p>
              </CardContent>
            </Card>
          )}

          {/* 저자 정보 */}
          {book.authorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">저자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.authorInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 번역자 정보 */}
          {book.translatorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">번역자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.translatorInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 서지 정보 */}
          {book.bibliographicInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">서지 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.bibliographicInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 출판 정보 */}
          {book.publicationInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">출판 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.publicationInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 참고 문헌 */}
          {book.references && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">참고 문헌</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.references}</p>
              </CardContent>
            </Card>
          )}

          {/* 키워드 */}
          {book.keywords && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">키워드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {book.keywords.split(',').map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
