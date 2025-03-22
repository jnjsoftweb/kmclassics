import sqlite3 from 'sqlite3';

const DB_PATH = 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics.db';

const dropColumnsFromTables = (tableNames, columnNames = ['bookId']) => {
  return new Promise((resolve, reject) => {
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
        resolve();
      } catch (error) {
        db.exec('ROLLBACK');
        db.exec('PRAGMA foreign_keys=ON');
        reject(error);
      }
    } catch (error) {
      console.error('테이블 수정 중 오류 발생:', error);
      reject(error);
    } finally {
      db.close();
    }
  });
};

const addColumnsFromTables = (tableNames, columnNames = ['image']) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    try {
      db.exec('PRAGMA foreign_keys=OFF');
      db.exec('BEGIN TRANSACTION');

      try {
        for (const tableName of tableNames) {
          for (const columnName of columnNames) {
            db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT DEFAULT ''`);
          }
        }

        db.exec('COMMIT');
        db.exec('PRAGMA foreign_keys=ON');

        console.log('모든 테이블의 컬럼이 성공적으로 추가되었습니다.');
        resolve();
      } catch (error) {
        db.exec('ROLLBACK');
        db.exec('PRAGMA foreign_keys=ON');
        reject(error);
      }
    } catch (error) {
      console.error('테이블 수정 중 오류 발생:', error);
      reject(error);
    } finally {
      db.close();
    }
  });
};

const tableList = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    db.all(
      `SELECT name 
       FROM sqlite_master 
       WHERE type='table' 
       ORDER BY name;`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        db.close();
        resolve(rows.map((table) => table.name).filter((table) => table.startsWith('MC_')));
      }
    );
  });
};

const main = async () => {
  try {
    const tables = await tableList();
    console.log(tables);

    // 여러 테이블에서 컬럼 제거
    // await dropColumnsFromTables(tables);

    // 여러 테이블에서 컬럼 추가
    // await addColumnsFromTables(tables);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

main().catch(console.error);
