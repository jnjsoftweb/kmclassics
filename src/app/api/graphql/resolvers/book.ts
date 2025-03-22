import { executeQuery, executeQuerySingle, executeRun } from '@/lib/sqlite';

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
  [key: string]: unknown;
}

export const bookResolvers = {
  Query: {
    // 모든 책 조회
    books: async (
      _: unknown,
      { page = 1, pageSize = 10, filter = {} }: { page?: number; pageSize?: number; filter?: Record<string, unknown> }
    ) => {
      try {
        // 필터 조건 생성
        const conditions: string[] = [];
        const params: unknown[] = [];

        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        });

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 전체 개수 조회
        const countQuery = `SELECT COUNT(*) as total FROM Book ${whereClause}`;
        const countResult = await executeQuerySingle<{ total: number }>(countQuery, params);
        const total = countResult?.total || 0;

        // 페이지네이션 계산
        const offset = (page - 1) * pageSize;
        const totalPages = Math.ceil(total / pageSize);

        // 데이터 조회
        const query = `
          SELECT * FROM Book 
          ${whereClause} 
          ORDER BY bookNum ASC
          LIMIT ? OFFSET ?
        `;

        const books = await executeQuery<Book>(query, [...params, pageSize, offset]);

        return {
          data: books,
          total,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        console.error('책 목록 조회 오류:', error);
        return {
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
      }
    },

    // 책 ID로 책 조회
    book: async (_: unknown, { bookId }: { bookId: string }) => {
      try {
        const book = await executeQuerySingle<Book>('SELECT * FROM Book WHERE bookId = ?', [bookId]);
        return book || null;
      } catch (error) {
        console.error('책 조회 오류:', error);
        return null;
      }
    },

    // 책 검색
    searchBooks: async (_: unknown, { query }: { query: string }) => {
      try {
        if (!query) return [];

        const searchQuery = `%${query}%`;
        const books = await executeQuery<Book>(
          `SELECT * FROM Book 
           WHERE title LIKE ? 
           OR author LIKE ? 
           OR abstract LIKE ?
           OR keywords LIKE ?
           ORDER BY bookNum ASC`,
          [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        return books;
      } catch (error) {
        console.error('책 검색 오류:', error);
        return [];
      }
    },
  },

  Mutation: {
    // 책 추가
    addBook: async (_: unknown, { input }: { input: Omit<Book, 'bookNum'> }) => {
      try {
        // 다음 bookNum 값 가져오기
        const maxBookNum = await executeQuerySingle<{ max: number }>('SELECT MAX(bookNum) as max FROM Book');
        const nextBookNum = (maxBookNum?.max || 0) + 1;

        // 필드와 값 배열 생성
        const fields = ['bookNum', ...Object.keys(input)];
        const placeholders = fields.map(() => '?').join(', ');
        const values = [nextBookNum, ...Object.values(input)];

        // 책 추가 쿼리 실행
        const result = await executeRun(`INSERT INTO Book (${fields.join(', ')}) VALUES (${placeholders})`, values);

        if (result.lastID) {
          // 추가된 책 조회
          const newBook = await executeQuerySingle<Book>('SELECT * FROM Book WHERE bookId = ?', [input.bookId]);
          return newBook;
        }

        throw new Error('책 추가 실패');
      } catch (error) {
        console.error('책 추가 오류:', error);
        throw error;
      }
    },

    // 책 수정
    updateBook: async (_: unknown, { bookId, input }: { bookId: string; input: Partial<Book> }) => {
      try {
        // 기존 책 조회
        const existingBook = await executeQuerySingle<Book>('SELECT * FROM Book WHERE bookId = ?', [bookId]);

        if (!existingBook) {
          throw new Error('책을 찾을 수 없습니다');
        }

        // 업데이트할 필드 생성
        const updateFields = Object.keys(input)
          .map((field) => `${field} = ?`)
          .join(', ');

        // 업데이트 쿼리 실행
        await executeRun(`UPDATE Book SET ${updateFields} WHERE bookId = ?`, [...Object.values(input), bookId]);

        // 업데이트된 책 조회
        const updatedBook = await executeQuerySingle<Book>('SELECT * FROM Book WHERE bookId = ?', [bookId]);
        return updatedBook;
      } catch (error) {
        console.error('책 수정 오류:', error);
        throw error;
      }
    },

    // 책 삭제
    deleteBook: async (_: unknown, { bookId }: { bookId: string }) => {
      try {
        // 기존 책 조회
        const existingBook = await executeQuerySingle<Book>('SELECT * FROM Book WHERE bookId = ?', [bookId]);

        if (!existingBook) {
          throw new Error('책을 찾을 수 없습니다');
        }

        // 삭제 쿼리 실행
        await executeRun('DELETE FROM Book WHERE bookId = ?', [bookId]);

        return true;
      } catch (error) {
        console.error('책 삭제 오류:', error);
        throw error;
      }
    },
  },
};
