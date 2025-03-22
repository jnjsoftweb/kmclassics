import { loadJson, sleep } from 'jnu-abc';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { TabletSmartphone } from 'lucide-react';

const DB_PATH = 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics.db';

// Content 테이블의 bookId 업데이트 함수
const updateContentBookIds = () => {
  const db = new Database(DB_PATH);
  try {
    // 외래 키 제약 조건 비활성화
    db.exec('PRAGMA foreign_keys=OFF');

    // 트랜잭션 시작
    db.exec('BEGIN TRANSACTION');

    try {
      // 모든 UPDATE 쿼리 실행
      const updates = [
        { start: 57321, end: 58143, bookId: 'MC_00173' },
        { start: 60791, end: 66633, bookId: 'MC_00222' },
        { start: 66633, end: 88917, bookId: 'MC_00159' },
        { start: 88917, end: 162162, bookId: 'MC_00183' },
        { start: 162162, end: 172973, bookId: 'MC_00194' },
        { start: 172973, end: 210470, bookId: 'MC_00096' },
        { start: 210470, end: 235981, bookId: 'MC_00185' },
        { start: 235981, end: 240627, bookId: 'MC_00110' },
        { start: 240627, end: 253941, bookId: 'MC_00208' },
        { start: 253941, end: 301636, bookId: 'MC_00052' },
        { start: 301636, end: 353988, bookId: 'MC_00132' },
        { start: 353988, end: Infinity, bookId: 'MC_00070' },
      ];

      // 각 업데이트 실행
      // const updateStmt = db.prepare(`
      //   UPDATE MC_00000
      //   SET bookId = ?
      //   WHERE contentId >= ? AND contentId < ?
      // `);
      const updateStmt = db.prepare(`
        UPDATE Content
        SET bookId = ?
        WHERE bookId = 'MC_00000' AND contentId >= ? AND contentId < ?
      `);

      let updateCount = 0;
      for (const update of updates) {
        const result = updateStmt.run(update.bookId, update.start, update.end);
        updateCount += result.changes;
        console.log(
          `contentId ${update.start} ~ ${update.end}: ${result.changes}개 업데이트 (bookId: ${update.bookId})`
        );
      }

      // 트랜잭션 커밋
      db.exec('COMMIT');

      // 외래 키 제약 조건 다시 활성화
      db.exec('PRAGMA foreign_keys=ON');

      console.log(`총 ${updateCount}개의 레코드가 업데이트되었습니다.`);
      return updateCount;
    } catch (error) {
      // 오류 발생 시 롤백
      db.exec('ROLLBACK');
      // 외래 키 제약 조건 다시 활성화
      db.exec('PRAGMA foreign_keys=ON');
      throw error;
    }
  } catch (error) {
    console.error('Content 테이블 업데이트 오류:', error);
    return 0;
  }
};

const createTables = (excludes = ['MC_00000']) => {
  // 데이터베이스 연결
  const db = new Database(DB_PATH);
  console.log('SQLite 데이터베이스에 연결되었습니다.');

  // 중복 없는 bookId 목록 조회
  const distinctBookIds = db.prepare('SELECT DISTINCT bookId FROM MC_00000 ORDER BY bookId').all();
  console.log('\n고유한 bookId 목록:');
  distinctBookIds.forEach((row) => {
    console.log(row.bookId);
  });

  for (const bookId of distinctBookIds) {
    if (excludes.includes(bookId.bookId)) {
      continue;
    }
    db.exec(`
      INSERT INTO ${bookId.bookId} SELECT * FROM MC_00000 WHERE bookId = '${bookId.bookId}';
    `);
    // db.exec(`
    //   CREATE TABLE IF NOT EXISTS ${bookId.bookId} AS SELECT * FROM MC_00000 WHERE 0;
    //   INSERT INTO ${bookId.bookId} SELECT * FROM MC_00000 WHERE bookId = '${bookId.bookId}';
    // `);
  }
};

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

// Content 테이블의 bookId 업데이트 함수
const moveContentBookIds = () => {
  const db = new Database(DB_PATH);
  try {
    // 외래 키 제약 조건 비활성화
    db.exec('PRAGMA foreign_keys=OFF');

    // -- UPDATE MC_00172 SET bookId = 'MC_00121' WHERE contentId >= 243323
    // -- UPDATE MC_00218 SET bookId = 'MC_00162' WHERE contentId >= 503536;
    // -- UPDATE MC_00278 SET bookId = 'MC_00193' WHERE contentId >= 169026;
    // -- UPDATE MC_00200 SET bookId = 'MC_00199' WHERE contentId >= 55703;
    // -- UPDATE MC_00041 SET bookId = 'MC_00214' WHERE contentId >= 221939;
    try {
      // 모든 UPDATE 쿼리 실행
      const moves = [
        { start: 243323, srcId: 'MC_00172', dstId: 'MC_00121' },
        { start: 503536, srcId: 'MC_00218', dstId: 'MC_00162' },
        { start: 169026, srcId: 'MC_00278', dstId: 'MC_00193' },
        { start: 55703, srcId: 'MC_00200', dstId: 'MC_00199' },
        { start: 221939, srcId: 'MC_00041', dstId: 'MC_00214' },
        { start: 268690, srcId: 'MC_00054', dstId: 'MC_00056' },
      ];

      for (const move of moves) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS ${move.dstId} AS SELECT * FROM MC_00000 WHERE 0;
          INSERT INTO ${move.dstId} SELECT * FROM ${move.srcId} WHERE contentId >= ${move.start};
          DELETE FROM ${move.srcId} WHERE contentId >= ${move.start};
        `);
      }
    } catch (error) {
      // 오류 발생 시 롤백
      db.exec('ROLLBACK');
      // 외래 키 제약 조건 다시 활성화
      db.exec('PRAGMA foreign_keys=ON');
      throw error;
    }
  } catch (error) {
    console.error('Content 테이블 업데이트 오류:', error);
    return 0;
  }
};

// console.log(findMissingTables());

// updateContentBookIds();

// createTables();

moveContentBookIds();
