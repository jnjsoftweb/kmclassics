import sqlite3 from 'sqlite3';
import path from 'path';
import * as fs from 'fs';

// SQLite 데이터베이스 파일 경로 설정
console.log(`process.env.SQLITE_DB_PATH: ${process.env.SQLITE_DB_PATH}`);
const DB_PATH = process.env.SQLITE_DB_PATH || 'C:/JnJ-soft/Projects/external/km-classics/sqlite/km-classics__.db';

// 데이터베이스 디렉토리 확인 및 생성
const ensureDbDirectory = (): void => {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`데이터베이스 디렉토리 생성: ${dbDir}`);
  }
};

// 데이터베이스 연결 객체
let dbInstance: sqlite3.Database | null = null;

/**
 * 데이터베이스 연결 함수
 */
function getDbConnection(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

/**
 * 데이터베이스 연결 종료
 */
const closeDbConnection = async (): Promise<void> => {
  if (dbInstance) {
    return new Promise((resolve, reject) => {
      dbInstance!.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        dbInstance = null;
        resolve();
      });
    });
  }
};

/**
 * 쿼리 실행 함수
 */
const executeQuery = async <T>(query: string, params: unknown[] = []): Promise<T> => {
  const db = await getDbConnection();
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows as T);
    });
  });
};

/**
 * 단일 결과 쿼리 실행 함수
 */
const executeQuerySingle = async <T>(query: string, params: unknown[] = []): Promise<T | null> => {
  const db = await getDbConnection();
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row as T | null);
    });
  });
};

/**
 * 데이터 변경 쿼리 실행 함수 (INSERT, UPDATE, DELETE)
 */
const executeRun = async (query: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> => {
  const db = await getDbConnection();
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
};

/**
 * CREATE - 데이터 생성 함수
 */
const insertData = async (table: string, data: Record<string, unknown>): Promise<number> => {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;

    const result = await executeRun(query, values);
    return result.lastID;
  } catch (error) {
    console.error('데이터 생성 오류:', error);
    throw new Error('데이터 생성 중 오류가 발생했습니다.');
  }
};

/**
 * READ - 모든 데이터 조회 함수
 */
const getAllData = async <T>(
  table: string,
  options: {
    fields?: string[];
    orderBy?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<T[]> => {
  try {
    const { fields = ['*'], orderBy = '', limit = 0, offset = 0 } = options;

    let query = `SELECT ${fields.join(', ')} FROM ${table}`;
    const params: unknown[] = [];

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    if (limit > 0) {
      query += ' LIMIT ?';
      params.push(limit);

      if (offset > 0) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    return await executeQuery<T[]>(query, params);
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    throw new Error('데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * READ - ID로 단일 데이터 조회 함수
 */
const getDataById = async <T>(
  table: string,
  id: number | string,
  options: {
    fields?: string[];
    idField?: string;
  } = {}
): Promise<T | null> => {
  try {
    const { fields = ['*'], idField = 'id' } = options;

    const query = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      WHERE ${idField} = ?
      LIMIT 1
    `;

    return await executeQuerySingle<T>(query, [id]);
  } catch (error) {
    console.error('ID로 데이터 조회 오류:', error);
    throw new Error('데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * READ - 조건부 데이터 조회 함수
 */
const getDataByCondition = async <T>(
  table: string,
  conditions: Record<string, unknown>,
  options: {
    fields?: string[];
    orderBy?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<T[]> => {
  try {
    const { fields = ['*'], orderBy = '', limit = 0, offset = 0 } = options;

    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    // 조건이 없는 경우 전체 데이터 조회
    if (keys.length === 0) {
      return await getAllData<T>(table, options);
    }

    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');

    let query = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      WHERE ${whereClause}
    `;

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    if (limit > 0) {
      query += ' LIMIT ?';
      values.push(limit);

      if (offset > 0) {
        query += ' OFFSET ?';
        values.push(offset);
      }
    }

    return await executeQuery<T[]>(query, values);
  } catch (error) {
    console.error('조건부 데이터 조회 오류:', error);
    throw new Error('데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * UPDATE - 데이터 수정 함수
 */
const updateData = async (
  table: string,
  data: Record<string, unknown>,
  conditions: Record<string, unknown>
): Promise<number> => {
  try {
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);

    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    // 수정할 데이터나 조건이 없는 경우 오류 발생
    if (dataKeys.length === 0 || conditionKeys.length === 0) {
      throw new Error('수정할 데이터와 조건이 필요합니다.');
    }

    const setClause = dataKeys.map((key) => `${key} = ?`).join(', ');
    const whereClause = conditionKeys.map((key) => `${key} = ?`).join(' AND ');

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
    `;

    const values = [...dataValues, ...conditionValues];

    const result = await executeRun(query, values);
    return result.changes;
  } catch (error) {
    console.error('데이터 수정 오류:', error);
    throw new Error('데이터 수정 중 오류가 발생했습니다.');
  }
};

/**
 * DELETE - 데이터 삭제 함수
 */
const deleteData = async (table: string, conditions: Record<string, unknown>): Promise<number> => {
  try {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    // 조건이 없는 경우 오류 발생 (전체 삭제 방지)
    if (keys.length === 0) {
      throw new Error('삭제 조건이 필요합니다.');
    }

    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');

    const query = `
      DELETE FROM ${table}
      WHERE ${whereClause}
    `;

    const result = await executeRun(query, values);
    return result.changes;
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    throw new Error('데이터 삭제 중 오류가 발생했습니다.');
  }
};

/**
 * 트랜잭션 실행 함수
 */
const executeTransaction = async <T>(callback: (db: sqlite3.Database) => Promise<T>): Promise<T> => {
  const db = await getDbConnection();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      callback(db)
        .then((result) => {
          db.run('COMMIT');
          resolve(result);
        })
        .catch((error) => {
          db.run('ROLLBACK');
          reject(error);
        });
    });
  });
};

/**
 * 페이지네이션 데이터 조회 함수
 */
const getPaginatedData = async <T>(
  table: string,
  options: {
    fields?: string[];
    page?: number;
    pageSize?: number;
    conditions?: Record<string, unknown>;
    orderBy?: string;
  } = {}
): Promise<{ data: T[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const { fields = ['*'], page = 1, pageSize = 10, conditions = {}, orderBy = '' } = options;

    const offset = (page - 1) * pageSize;

    // 조건절 생성
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    let whereClause = '';

    if (conditionKeys.length > 0) {
      whereClause = 'WHERE ' + conditionKeys.map((key) => `${key} = ?`).join(' AND ');
    }

    // 데이터 조회 쿼리
    let query = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      ${whereClause}
    `;

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    query += ' LIMIT ? OFFSET ?';

    // 전체 개수 조회 쿼리
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${table}
      ${whereClause}
    `;

    // 병렬로 쿼리 실행
    const [data, totalResult] = await Promise.all([
      executeQuery<T[]>(query, [...conditionValues, pageSize, offset]),
      executeQuerySingle<{ total: number }>(countQuery, conditionValues),
    ]);

    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('페이지네이션 데이터 조회 오류:', error);
    throw new Error('페이지네이션 데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 검색 쿼리 실행 함수
 */
const searchData = async <T>(
  table: string,
  options: {
    searchFields: string[];
    searchTerm: string;
    fields?: string[];
    page?: number;
    pageSize?: number;
    orderBy?: string;
  }
): Promise<{ data: T[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const { searchFields, searchTerm, fields = ['*'], page = 1, pageSize = 10, orderBy = '' } = options;

    if (!searchFields.length || !searchTerm) {
      throw new Error('검색 필드와 검색어가 필요합니다.');
    }

    const offset = (page - 1) * pageSize;
    const searchValue = `%${searchTerm}%`;

    // 검색 조건 생성
    const searchConditions = searchFields.map((field) => `${field} LIKE ?`).join(' OR ');
    const searchValues = Array(searchFields.length).fill(searchValue);

    // 데이터 조회 쿼리
    let query = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      WHERE (${searchConditions})
    `;

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    query += ' LIMIT ? OFFSET ?';

    // 전체 개수 조회 쿼리
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${table}
      WHERE (${searchConditions})
    `;

    // 병렬로 쿼리 실행
    const [data, totalResult] = await Promise.all([
      executeQuery<T[]>(query, [...searchValues, pageSize, offset]),
      executeQuerySingle<{ total: number }>(countQuery, searchValues),
    ]);

    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('검색 데이터 조회 오류:', error);
    throw new Error('검색 데이터 조회 중 오류가 발생했습니다.');
  }
};

/**
 * 테이블 존재 여부 확인 함수
 */
const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const result = await executeQuerySingle<{ count: number }>(
      `
      SELECT count(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name=?
    `,
      [tableName]
    );

    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('테이블 존재 확인 오류:', error);
    throw new Error('테이블 존재 확인 중 오류가 발생했습니다.');
  }
};

/**
 * 데이터베이스 초기화 함수 (테이블 생성 등)
 */
const initializeDatabase = async (schemas: { name: string; sql: string }[]): Promise<void> => {
  try {
    await executeTransaction(async (db) => {
      for (const schema of schemas) {
        const exists = await tableExists(schema.name);
        if (!exists) {
          db.exec(schema.sql);
          console.log(`테이블 생성됨: ${schema.name}`);
        } else {
          console.log(`테이블 이미 존재함: ${schema.name}`);
        }
      }
    });

    console.log('데이터베이스 초기화 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    throw new Error('데이터베이스 초기화 중 오류가 발생했습니다.');
  }
};

/**
 * 데이터베이스 연결 테스트 함수
 */
const testConnection = async (): Promise<boolean> => {
  try {
    const db = await getDbConnection();
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    return result && result.test === 1;
  } catch (error) {
    console.error('데이터베이스 연결 테스트 오류:', error);
    return false;
  }
};

/**
 * 벌크 삽입 함수 (대량 데이터 삽입)
 */
const bulkInsert = async (table: string, fields: string[], valuesList: unknown[][]): Promise<number> => {
  if (valuesList.length === 0) {
    return 0;
  }

  let totalInserted = 0;

  try {
    await executeTransaction(async (db) => {
      const placeholders = `(${fields.map(() => '?').join(', ')})`;
      const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${placeholders}`;
      const stmt = db.prepare(query);

      for (const values of valuesList) {
        if (values.length !== fields.length) {
          throw new Error('필드 수와 값 수가 일치하지 않습니다.');
        }

        const result = stmt.run(...values);
        totalInserted += result.changes || 0;
      }
    });

    return totalInserted;
  } catch (error) {
    console.error('벌크 삽입 오류:', error);
    throw new Error('대량 데이터 삽입 중 오류가 발생했습니다.');
  }
};

/**
 * 테이블 이름 변경
 * @param oldTableName 현재 테이블 이름
 * @param newTableName 새 테이블 이름
 * @returns 성공 여부
 */
const renameTable = async (oldTableName: string, newTableName: string): Promise<boolean> => {
  try {
    const db = await getDbConnection();

    // 테이블 존재 여부 확인
    const tableExists = db
      .prepare(
        `
      SELECT count(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name=?
    `
      )
      .get(oldTableName) as { count: number };

    if (!tableExists || tableExists.count === 0) {
      throw new Error(`테이블 '${oldTableName}'이(가) 존재하지 않습니다.`);
    }

    // 새 테이블 이름이 이미 존재하는지 확인
    const newTableExists = db
      .prepare(
        `
      SELECT count(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name=?
    `
      )
      .get(newTableName) as { count: number };

    if (newTableExists && newTableExists.count > 0) {
      throw new Error(`테이블 '${newTableName}'이(가) 이미 존재합니다.`);
    }

    // 트랜잭션 시작
    db.prepare('BEGIN TRANSACTION').run();

    try {
      // 테이블 이름 변경
      db.prepare(`ALTER TABLE ${oldTableName} RENAME TO ${newTableName}`).run();

      // 트랜잭션 커밋
      db.prepare('COMMIT').run();

      console.log(`테이블 이름이 '${oldTableName}'에서 '${newTableName}'(으)로 변경되었습니다.`);
      return true;
    } catch (error) {
      // 오류 발생 시 롤백
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('테이블 이름 변경 오류:', error);
    return false;
  }
};

// 모든 함수를 일괄적으로 export
export {
  getDbConnection,
  closeDbConnection,
  executeQuery,
  executeQuerySingle,
  executeRun,
  insertData,
  getAllData,
  getDataById,
  getDataByCondition,
  updateData,
  deleteData,
  executeTransaction,
  getPaginatedData,
  searchData,
  tableExists,
  initializeDatabase,
  testConnection,
  bulkInsert,
  renameTable,
};
