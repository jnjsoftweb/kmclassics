// import { loadJson, sleep } from 'jnu-abc';
// import Database from 'better-sqlite3';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { APP_ROOT_PATH, SQLITE_DB_PATH, BOOKS_PER_PAGE } = process.env;

console.log(`APP_ROOT_PATH: ${APP_ROOT_PATH}`);
console.log(`SQLITE_DB_PATH: ${SQLITE_DB_PATH}`);
console.log(`BOOKS_PER_PAGE: ${BOOKS_PER_PAGE}`);

// const DB_PATH = 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics.db';
const DB_PATH = SQLITE_DB_PATH;

// const dropColumnsFromTables = (tableNames, columnNames = ['contentId', 'bookId']) => {
const dropColumnsFromTables = (tableNames, columnNames = ['bookId']) => {
  // const db = new sqlite3.Database(DB_PATH);
  const db = new sqlite3.Database(DB_PATH);
  try {
    db.exec('PRAGMA foreign_keys=OFF');
    db.exec('BEGIN TRANSACTION');

    try {
      for (const tableName of tableNames) {
        for (const columnName of columnNames) {
          db.exec(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
          console.log(`${tableName} 테이블의 ${columnName} 컬럼이 제거되었습니다.`);
        }
      }

      db.exec('COMMIT');
      db.exec('PRAGMA foreign_keys=ON');

      console.log('모든 테이블의 컬럼이 성공적으로 제거되었습니다.');
    } catch (error) {
      db.exec('ROLLBACK');
      db.exec('PRAGMA foreign_keys=ON');
      throw error;
    }
  } catch (error) {
    console.error('테이블 수정 중 오류 발생:', error);
  } finally {
    db.close();
  }
};

const addColumnsFromTables = (tableNames, columnNames = ['image']) => {
  const db = new sqlite3.Database(DB_PATH);
  try {
    db.exec('PRAGMA foreign_keys=OFF');
    db.exec('BEGIN TRANSACTION');

    try {
      for (const tableName of tableNames) {
        for (const columnName of columnNames) {
          db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT DEFAULT ''`);
          // console.log(`${tableName} 테이블의 ${columnName} 컬럼이 추가가되었습니다.`);
        }
      }

      db.exec('COMMIT');
      db.exec('PRAGMA foreign_keys=ON');

      console.log('모든 테이블의 컬럼이 성공적으로 추가되었습니다.');
    } catch (error) {
      db.exec('ROLLBACK');
      db.exec('PRAGMA foreign_keys=ON');
      throw error;
    }
  } catch (error) {
    console.error('테이블 수정 중 오류 발생:', error);
  } finally {
    db.close();
  }
};

const tableList = () => {
  // 데이터베이스 연결
  const db = new sqlite3.Database(DB_PATH);
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

  // 데이터베이스 연결 종료
  db.close();
  return tables.map((table) => table.name).filter((table) => table.startsWith('MC_'));
};

const tables = tableList();
console.log(tables);

// 여러 테이블에서 컬럼 제거
// dropColumnsFromTables(tables);

// 여러 테이블에서 컬럼 추가
// addColumnsFromTables(tables);

// 함수 실행
// dropColumns();
