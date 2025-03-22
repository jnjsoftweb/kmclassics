import { loadJson, sleep } from 'jnu-abc';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { TabletSmartphone } from 'lucide-react';

const DB_PATH = 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics.db';

const tableList = () => {
  // 데이터베이스 연결
  const db = new Database(DB_PATH);
  // 테이블 목록 조회
  const tables = db
    .prepare(
      `
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name;
  `
    )
    .all();

  // console.log('\n데이터베이스의 테이블 목록:');
  // tables.forEach((table) => {
  //   console.log(table.name);
  // });

  // 데이터베이스 연결 종료
  db.close();
  return tables.map((table) => table.name).filter((table) => table.startsWith('MC_') && table != 'MC_00000');
};

const bookIds = () => {
  const db = new Database(DB_PATH);
  const bookIds = db.prepare('SELECT DISTINCT bookId FROM Book ORDER BY bookId').all();
  db.close();
  return bookIds.map((bookId) => bookId.bookId);
};

const findMissingTables = () => {
  const tables = tableList();
  const books = bookIds();

  console.log('\n테이블은 없지만 Book 테이블에 존재하는 bookId 목록:');
  const missingTables = books.filter((bookId) => !tables.includes(bookId));
  missingTables.forEach((bookId) => {
    console.log(bookId);
  });
  console.log(`\n총 ${missingTables.length}개의 누락된 테이블이 있습니다.`);

  let mTables = '';
  const db = new Database(DB_PATH);
  missingTables.forEach((bookId) => {
    const name = db.prepare('SELECT titleChinese FROM Book WHERE bookId = ?').get(bookId).titleChinese;
    // mTables.push({ bookId, name });
    mTables += `${bookId}\t${name}\n`;
  });

  db.close();

  return mTables;
};

const checkOverlap = (bookId, db) => {
  // const db = new Database(DB_PATH);
  const names = db.prepare(`SELECT chinese FROM ${bookId} WHERE sectId = 1 and volumeNum = 1`).all();
  // db.close();
  return names.length - 1;
};

const checkBookTable = (bookId) => {
  const db = new Database(DB_PATH);
  const name1 = db.prepare('SELECT titleChinese FROM Book WHERE bookId = ?').get(bookId).titleChinese;
  const name2 = db.prepare(`SELECT chinese FROM ${bookId} WHERE sectId = 1`).get().chinese;

  const checked = name2.includes(name1);
  const overlap = checkOverlap(bookId, db);

  db.close();
  return { bookId, name1, name2, checked, overlap };
};

// const createTables = (excludes = ['MC_00008']) => {
//   // 데이터베이스 연결
//   const db = new Database(DB_PATH);
//   console.log('SQLite 데이터베이스에 연결되었습니다.');

//   // 중복 없는 bookId 목록 조회
//   const distinctBookIds = db.prepare('SELECT DISTINCT bookId FROM Content ORDER BY bookId').all();
//   console.log('\n고유한 bookId 목록:');
//   distinctBookIds.forEach((row) => {
//     console.log(row.bookId);
//   });

//   for (const bookId of distinctBookIds) {
//     if (excludes.includes(bookId.bookId)) {
//       continue;
//     }
//     db.exec(`
//       CREATE TABLE IF NOT EXISTS ${bookId.bookId} AS SELECT * FROM Content WHERE 0;
//       INSERT INTO ${bookId.bookId} SELECT * FROM Content WHERE bookId = '${bookId.bookId}';
//     `);
//   }

//   // db.exec(`
//   //   CREATE TABLE IF NOT EXISTS MC_00008 AS SELECT * FROM Content WHERE 0;
//   //   INSERT INTO MC_00008 SELECT * FROM Content WHERE bookId = 'MC_00008';
//   // `);
// };

// // Content 테이블의 bookId 업데이트 함수
// const updateContentBookIds = (db) => {
//   try {
//     // 외래 키 제약 조건 비활성화
//     db.exec('PRAGMA foreign_keys=OFF');

//     // 트랜잭션 시작
//     db.exec('BEGIN TRANSACTION');

//     try {
//       // 모든 UPDATE 쿼리 실행
//       const updates = [
//         { start: 66844, end: 67952, bookId: 'MC_00101' },
//         { start: 67952, end: 68025, bookId: 'MC_00260' },
//         { start: 68025, end: 72906, bookId: 'MC_00006' },
//         { start: 72906, end: 74077, bookId: 'MC_00149' },
//         { start: 74077, end: 75417, bookId: 'MC_00204' },
//         { start: 75417, end: 76261, bookId: 'MC_00167' },
//         { start: 76261, end: 76495, bookId: 'MC_00217' },
//         { start: 76495, end: 77296, bookId: 'MC_00220' },
//         { start: 77296, end: 85349, bookId: 'MC_00007' },
//         { start: 85349, end: 87004, bookId: 'MC_00099' },
//         { start: 87004, end: 88917, bookId: 'MC_00009' },
//         { start: 88917, end: 89272, bookId: 'MC_00000' },
//         { start: 89272, end: 90178, bookId: 'MC_00182' },
//         { start: 90178, end: 90567, bookId: 'MC_00012' },
//         { start: 90567, end: 90919, bookId: 'MC_00286' },
//         { start: 90919, end: 91767, bookId: 'MC_00114' },
//         { start: 91767, end: 91921, bookId: 'MC_00221' },
//         { start: 91921, end: 97299, bookId: 'MC_00291' },
//         { start: 97299, end: 97398, bookId: 'MC_00168' },
//         { start: 97398, end: 97411, bookId: 'MC_00289' },
//         { start: 97411, end: 97697, bookId: 'MC_00000' },
//         { start: 97697, end: 99395, bookId: 'MC_00125' },
//         { start: 99395, end: 100567, bookId: 'MC_00154' },
//         { start: 100567, end: 101125, bookId: 'MC_00157' },
//         { start: 101125, end: 149611, bookId: 'MC_00190' },
//         { start: 149611, end: 154750, bookId: 'MC_00203' },
//         { start: 154750, end: 154945, bookId: 'MC_00023' },
//         { start: 154945, end: 162162, bookId: 'MC_00024' },
//         { start: 162162, end: 168084, bookId: 'MC_00000' },
//         { start: 168084, end: 168736, bookId: 'MC_00206' },
//         { start: 168736, end: 169629, bookId: 'MC_00278' },
//         { start: 169629, end: 170301, bookId: 'MC_00095' },
//         { start: 170301, end: 171468, bookId: 'MC_00001' },
//         { start: 171468, end: 172684, bookId: 'MC_00169' },
//         { start: 172684, end: 172973, bookId: 'MC_00029' },
//         { start: 172973, end: 173373, bookId: 'MC_00000' },
//         { start: 173373, end: 173809, bookId: 'MC_00030' },
//         { start: 173809, end: 174005, bookId: 'MC_00140' },
//         { start: 174005, end: 174837, bookId: 'MC_00150' },
//         { start: 174837, end: 175329, bookId: 'MC_00135' },
//         { start: 175329, end: 176600, bookId: 'MC_00141' },
//         { start: 176600, end: 177429, bookId: 'MC_00134' },
//         { start: 177429, end: 179492, bookId: 'MC_00144' },
//         { start: 179492, end: 180652, bookId: 'MC_00145' },
//         { start: 180652, end: 181021, bookId: 'MC_00198' },
//         { start: 181021, end: 181611, bookId: 'MC_00211' },
//         { start: 181611, end: 184163, bookId: 'MC_00170' },
//         { start: 184163, end: 184527, bookId: 'MC_00116' },
//         { start: 184527, end: 184633, bookId: 'MC_00117' },
//         { start: 184633, end: 196478, bookId: 'MC_00146' },
//         { start: 196478, end: 197187, bookId: 'MC_00031' },
//         { start: 197187, end: 198109, bookId: 'MC_00164' },
//         { start: 198109, end: 199189, bookId: 'MC_00228' },
//         { start: 199189, end: 200744, bookId: 'MC_00187' },
//         { start: 200744, end: 204439, bookId: 'MC_00111' },
//         { start: 204439, end: 210050, bookId: 'MC_00036' },
//         { start: 210050, end: 210470, bookId: 'MC_00181' },
//         { start: 210470, end: 211747, bookId: 'MC_00000' },
//         { start: 211747, end: 212609, bookId: 'MC_00038' },
//         { start: 212609, end: 213766, bookId: 'MC_00178' },
//         { start: 213766, end: 214568, bookId: 'MC_00119' },
//         { start: 214568, end: 215411, bookId: 'MC_00179' },
//         { start: 215411, end: 217279, bookId: 'MC_00192' },
//         { start: 217279, end: 217985, bookId: 'MC_00129' },
//         { start: 217985, end: 220142, bookId: 'MC_00130' },
//         { start: 220142, end: 221713, bookId: 'MC_00148' },
//         { start: 221713, end: 228907, bookId: 'MC_00041' },
//         { start: 228907, end: 230023, bookId: 'MC_00042' },
//         { start: 230023, end: 231623, bookId: 'MC_00107' },
//         { start: 231623, end: 232142, bookId: 'MC_00216' },
//         { start: 232142, end: 233924, bookId: 'MC_00186' },
//         { start: 233924, end: 233967, bookId: 'MC_00219' },
//         { start: 233967, end: 235288, bookId: 'MC_00120' },
//         { start: 235288, end: 235981, bookId: 'MC_00158' },
//         { start: 235981, end: 238270, bookId: 'MC_00000' },
//         { start: 238270, end: 238724, bookId: 'MC_00043' },
//         { start: 238724, end: 239244, bookId: 'MC_00044' },
//         { start: 239244, end: 239371, bookId: 'MC_00045' },
//         { start: 239371, end: 240155, bookId: 'MC_00046' },
//         { start: 240155, end: 240627, bookId: 'MC_00047' },
//         { start: 240627, end: 242640, bookId: 'MC_00000' },
//         { start: 242640, end: 243185, bookId: 'MC_00171' },
//         { start: 243185, end: 244521, bookId: 'MC_00172' },
//         { start: 244521, end: 245459, bookId: 'MC_00201' },
//         { start: 245459, end: 246286, bookId: 'MC_00122' },
//         { start: 246286, end: 246343, bookId: 'MC_00151' },
//         { start: 246343, end: 247066, bookId: 'MC_00123' },
//         { start: 247066, end: 247549, bookId: 'MC_00048' },
//         { start: 247549, end: 249588, bookId: 'MC_00112' },
//         { start: 249588, end: 251131, bookId: 'MC_00049' },
//         { start: 251131, end: 253941, bookId: 'MC_00051' },
//         { start: 253941, end: 256455, bookId: 'MC_00000' },
//         { start: 256455, end: 256671, bookId: 'MC_00166' },
//         { start: 256671, end: 257191, bookId: 'MC_00223' },
//         { start: 257191, end: 261882, bookId: 'MC_00272' },
//         { start: 261882, end: 269248, bookId: 'MC_00054' },
//         { start: 269248, end: 279060, bookId: 'MC_00058' },
//         { start: 279060, end: 281118, bookId: 'MC_00124' },
//         { start: 281118, end: 286895, bookId: 'MC_00128' },
//         { start: 286895, end: 291214, bookId: 'MC_00275' },
//         { start: 291214, end: 291564, bookId: 'MC_00213' },
//         { start: 291564, end: 296384, bookId: 'MC_00100' },
//         { start: 296384, end: 301636, bookId: 'MC_00059' },
//         { start: 301636, end: 327203, bookId: 'MC_00000' },
//         { start: 327203, end: 328352, bookId: 'MC_00202' },
//         { start: 328352, end: 340695, bookId: 'MC_00060' },
//         { start: 340695, end: 341782, bookId: 'MC_00061' },
//         { start: 341782, end: 349936, bookId: 'MC_00163' },
//         { start: 349936, end: 350595, bookId: 'MC_00067' },
//         { start: 350595, end: 353680, bookId: 'MC_00068' },
//         { start: 353680, end: 353988, bookId: 'MC_00176' },
//         { start: 353988, end: 356391, bookId: 'MC_00000' },
//         { start: 356391, end: 357691, bookId: 'MC_00071' },
//         { start: 357691, end: 357935, bookId: 'MC_00097' },
//         { start: 357935, end: 358016, bookId: 'MC_00290' },
//         { start: 358016, end: 371043, bookId: 'MC_00133' },
//         { start: 371043, end: 372635, bookId: 'MC_00098' },
//         { start: 372635, end: 375000, bookId: 'MC_00153' },
//         { start: 375000, end: 375058, bookId: 'MC_00019' },
//         { start: 375058, end: 376951, bookId: 'MC_00075' },
//         { start: 376951, end: 380935, bookId: 'MC_00076' },
//         { start: 380935, end: 381670, bookId: 'MC_00215' },
//         { start: 381670, end: 397488, bookId: 'MC_00108' },
//         { start: 397488, end: 408075, bookId: 'MC_00134' },
//         { start: 408075, end: 414116, bookId: 'MC_00083' },
//         { start: 414116, end: 414167, bookId: 'MC_00126' },
//         { start: 414167, end: 414194, bookId: 'MC_00084' },
//         { start: 414194, end: 414646, bookId: 'MC_00085' },
//         { start: 414646, end: 415597, bookId: 'MC_00086' },
//         { start: 415597, end: 416449, bookId: 'MC_00087' },
//         { start: 416449, end: 418186, bookId: 'MC_00205' },
//         { start: 418186, end: 420830, bookId: 'MC_00207' },
//         { start: 420830, end: 473635, bookId: 'MC_00135' },
//         { start: 473635, end: 473992, bookId: 'MC_00135' },
//         { start: 473992, end: 477222, bookId: 'MC_00196' },
//         { start: 477222, end: 477421, bookId: 'MC_00118' },
//         { start: 477421, end: 477486, bookId: 'MC_00284' },
//         { start: 477486, end: 503000, bookId: 'MC_00093' },
//         { start: 503000, end: 503191, bookId: 'MC_00094' },
//         { start: 503191, end: 504659, bookId: 'MC_00218' },
//         { start: 504659, end: Infinity, bookId: 'MC_00184' },
//       ];

//       // 각 업데이트 실행
//       const updateStmt = db.prepare(`
//         UPDATE Content
//         SET bookId = ?
//         WHERE contentId >= ? AND contentId < ?
//       `);

//       let updateCount = 0;
//       for (const update of updates) {
//         const result = updateStmt.run(update.bookId, update.start, update.end);
//         updateCount += result.changes;
//         console.log(
//           `contentId ${update.start} ~ ${update.end}: ${result.changes}개 업데이트 (bookId: ${update.bookId})`
//         );
//       }

//       // 트랜잭션 커밋
//       db.exec('COMMIT');

//       // 외래 키 제약 조건 다시 활성화
//       db.exec('PRAGMA foreign_keys=ON');

//       console.log(`총 ${updateCount}개의 레코드가 업데이트되었습니다.`);
//       return updateCount;
//     } catch (error) {
//       // 오류 발생 시 롤백
//       db.exec('ROLLBACK');
//       // 외래 키 제약 조건 다시 활성화
//       db.exec('PRAGMA foreign_keys=ON');
//       throw error;
//     }
//   } catch (error) {
//     console.error('Content 테이블 업데이트 오류:', error);
//     return 0;
//   }
// };

// // 테스트 함수 수정
// const test = async () => {
//   try {
//     // 데이터베이스 연결
//     const db = new Database(DB_PATH);
//     console.log('SQLite 데이터베이스에 연결되었습니다.');

//     // Content 테이블 존재 여부 확인 - 쿼리 수정
//     const contentTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Content'").get();
//     console.log(`Content 테이블 존재 여부: ${contentTableExists ? '존재함' : '존재하지 않음'}`);

//     if (!contentTableExists) {
//       console.error('Content 테이블이 존재하지 않습니다.');
//       db.close();
//       return;
//     }

//     // 기존 데이터 확인
//     const existingCount = db.prepare('SELECT COUNT(*) as count FROM Content').get();
//     console.log(`현재 Content 테이블에는 ${existingCount.count}개의 데이터가 있습니다.`);

//     // bookId 업데이트 실행
//     console.log('Content 테이블의 bookId 업데이트를 시작합니다...');
//     const updatedCount = updateContentBookIds(db);
//     console.log(`bookId 업데이트 완료: ${updatedCount}개의 레코드가 업데이트됨`);

//     // 데이터베이스 연결 종료
//     db.close();
//     console.log('데이터베이스 연결이 종료되었습니다.');
//   } catch (error) {
//     console.error('테스트 실행 중 오류 발생:', error);
//   }
// };

// // 테스트 실행
// test()
//   .then(() => console.log('테스트가 완료되었습니다.'))
//   .catch((err) => console.error('테스트 실행 중 오류:', err));

// createTables();

// console.log(tableList());
// console.log(bookIds());
console.log(findMissingTables());

// let count = 0;
// for (const bookId of tableList()) {
//   const info = checkBookTable(bookId);
//   if (!info.checked || info.overlap > 0) {
//     count++;
//     console.log(info);
//   }
// }
// console.log(count);
