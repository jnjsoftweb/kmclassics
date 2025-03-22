import { loadJson } from 'jnu-abc';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ## db 경로

// ```
// C:\JnJ-soft\Projects\external\km-classics\sqlite\km-classics.db
// ```
// C:\JnJ-soft\Projects\external\km-classics\sqlite
// ## json 데이터 경로

// C:\JnJ-soft\Projects\external\km-classics\json\allBookInfos.json

// SQLite 데이터베이스 파일 경로 설정
const DB_PATH = 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics.db';

// 데이터베이스 연결 함수
const getDbConnection = () => {
  // 데이터베이스 파일이 존재하는지 확인
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });
};

// 테이블 존재 여부 확인 함수
const tableExists = (db, tableName) => {
  const result = db
    .prepare(
      `
    SELECT count(*) as count 
    FROM sqlite_master 
    WHERE type='table' AND name=?
  `
    )
    .get(tableName);

  return result.count > 0;
};

// Book 테이블 구조 확인 함수
const checkBookTableStructure = (db) => {
  try {
    // 테이블 구조 확인을 위한 쿼리 실행
    const columns = db.prepare(`PRAGMA table_info(Book)`).all();
    console.log('Book 테이블 구조:', columns.map((col) => `${col.name} (${col.type})`).join(', '));
    return columns;
  } catch (error) {
    console.error('테이블 구조 확인 중 오류:', error);
    return null;
  }
};

// JSON 데이터 구조 확인 함수
const checkJsonStructure = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('JSON 데이터가 배열이 아니거나 비어 있습니다.');
    return false;
  }

  // 첫 번째 항목의 구조 확인
  const firstItem = data[0];
  console.log('JSON 데이터 첫 번째 항목 구조:', Object.keys(firstItem).join(', '));
  console.log('JSON 데이터 첫 번째 항목 샘플:', JSON.stringify(firstItem, null, 2).substring(0, 500) + '...');

  return true;
};

// 데이터 삽입 함수
const insertBooks = (db, books, tableColumns) => {
  // 트랜잭션 시작
  db.exec('BEGIN TRANSACTION');

  try {
    // 테이블 컬럼 이름 목록 가져오기
    const columnNames = tableColumns.map((col) => col.name);
    console.log('사용 가능한 컬럼:', columnNames.join(', '));

    // JSON 데이터의 키와 테이블 컬럼 매핑
    const validColumns = [];
    const placeholders = [];
    const columnsToUse = [];

    // 유효한 컬럼만 선택
    for (const col of columnNames) {
      // 'similars'는 제외 (첫 번째 컬럼이지만 삽입에 문제가 있을 수 있음)
      if (col !== 'similars') {
        // 모든 컬럼 이름을 따옴표로 묶어서 SQL 예약어 문제 방지
        validColumns.push(`"${col}"`);
        placeholders.push('?');
        columnsToUse.push(col);
      }
    }

    // 삽입 쿼리 준비
    const insertQuery = `
      INSERT INTO Book (${validColumns.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;
    console.log('삽입 쿼리:', insertQuery);

    const insertStmt = db.prepare(insertQuery);

    // 각 책 데이터 삽입
    let insertCount = 0;
    let skipCount = 0;

    for (const book of books) {
      try {
        // 필요한 값들을 배열로 준비
        const values = columnsToUse.map((col) => {
          // 숫자형 필드는 숫자로 변환, 없으면 0 반환
          if (['bookNum', 'volumes', 'chars'].includes(col)) {
            const val = book[col];
            return val !== undefined ? Number(val) : 0;
          }
          // 문자열 필드는 문자열로 변환, 없으면 빈 문자열 반환
          return book[col] !== undefined ? String(book[col]) : '';
        });

        // 데이터 삽입 시도
        insertStmt.run(...values);
        insertCount++;

        // 진행 상황 로깅 (10개마다)
        if (insertCount % 10 === 0) {
          console.log(`${insertCount}개 데이터 삽입 완료...`);
        }
      } catch (error) {
        console.error(`데이터 삽입 중 오류 (항목 건너뜀):`, error.message);
        skipCount++;
      }
    }

    // 트랜잭션 커밋
    db.exec('COMMIT');
    console.log(`총 ${insertCount}개의 책 데이터가 성공적으로 삽입되었습니다. (${skipCount}개 건너뜀)`);

    return insertCount;
  } catch (error) {
    // 오류 발생 시 롤백
    db.exec('ROLLBACK');
    console.error('데이터 삽입 중 오류 발생:', error);
    throw error;
  }
};

// 테이블 비우기 함수
const clearTable = (db, tableName) => {
  try {
    db.exec(`DELETE FROM ${tableName}`);
    console.log(`${tableName} 테이블의 모든 데이터가 삭제되었습니다.`);
    return true;
  } catch (error) {
    console.error(`${tableName} 테이블 비우기 오류:`, error);
    return false;
  }
};

// 테스트 함수
const test = async () => {
  try {
    // JSON 데이터 로드
    const data = loadJson(`C:/JnJ-soft/Projects/external/km-classics/json/allBookInfos.json`);
    console.log(`총 ${data.length}개의 책 데이터를 로드했습니다.`);

    // JSON 데이터 구조 확인
    if (!checkJsonStructure(data)) {
      console.error('JSON 데이터 구조에 문제가 있습니다. 프로세스를 중단합니다.');
      return;
    }

    // 데이터베이스 연결
    const db = getDbConnection();
    console.log('SQLite 데이터베이스에 연결되었습니다.');

    // Book 테이블 존재 여부 확인
    const bookTableExists = tableExists(db, 'Book');
    console.log(`Book 테이블 존재 여부: ${bookTableExists ? '존재함' : '존재하지 않음'}`);

    if (!bookTableExists) {
      console.error('Book 테이블이 존재하지 않습니다. 데이터베이스 관리자에게 문의하세요.');
      db.close();
      return;
    }

    // 테이블 구조 확인
    const tableColumns = checkBookTableStructure(db);
    if (!tableColumns) {
      console.error('테이블 구조를 확인할 수 없습니다. 프로세스를 중단합니다.');
      db.close();
      return;
    }

    // 기존 데이터 확인
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM Book').get();
    console.log(`현재 Book 테이블에는 ${existingCount.count}개의 데이터가 있습니다.`);

    // 사용자 확인 (실제 환경에서는 프롬프트 또는 매개변수로 처리)
    const shouldClearTable = true; // 테이블을 비울지 여부

    if (shouldClearTable && existingCount.count > 0) {
      // 테이블 비우기
      if (!clearTable(db, 'Book')) {
        console.error('테이블을 비우는 데 실패했습니다. 프로세스를 중단합니다.');
        db.close();
        return;
      }
    }

    // 데이터 삽입
    const insertedCount = insertBooks(db, data, tableColumns);
    console.log(`데이터 삽입 완료: ${insertedCount}개 추가됨`);

    // 최종 데이터 수 확인
    const finalCount = db.prepare('SELECT COUNT(*) as count FROM Book').get();
    console.log(`최종 Book 테이블에는 ${finalCount.count}개의 데이터가 있습니다.`);

    // 데이터베이스 연결 종료
    db.close();
    console.log('데이터베이스 연결이 종료되었습니다.');
  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', error);
  }
};

// 테스트 실행
test()
  .then(() => console.log('테스트가 완료되었습니다.'))
  .catch((err) => console.error('테스트 실행 중 오류:', err));
