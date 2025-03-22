import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { APP_ROOT_PATH, SQLITE_DB_PATH, BOOKS_PER_PAGE } = process.env;

console.log(`APP_ROOT_PATH: ${APP_ROOT_PATH}`);
console.log(`SQLITE_DB_PATH: ${SQLITE_DB_PATH}`);
console.log(`BOOKS_PER_PAGE: ${BOOKS_PER_PAGE}`);
