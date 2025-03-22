// GraphQL 쿼리 실행 함수
export async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  try {
    // 현재 환경에 따라 적절한 URL 생성
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    const graphqlUrl = `${baseUrl}/api/graphql`;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GraphQL 요청 실패: ${response.statusText}`);
    }

    const { data, errors } = await response.json();

    if (errors) {
      console.error('GraphQL 오류:', errors);
      throw new Error(errors[0].message);
    }

    return data as T;
  } catch (error) {
    console.error('GraphQL 요청 오류:', error);
    throw error;
  }
}

// 책 관련 GraphQL 쿼리
export const bookQueries = {
  // 단일 책 조회
  getBookById: `
    query GetBook($bookId: String!) {
      book(bookId: $bookId) {
        bookId
        bookNum
        title
        volumes
        chars
        source
        titleChinese
        author
        publishYear
        translator
        edition
        language
        physicalInfo
        publisher
        location
        confidenceLevel
        abstract
        references
        volume
        translatorInfo
        bibliographicInfo
        authorInfo
        publicationInfo
        classification
        subject
        keywords
        ebooks
        category
        similars
      }
    }
  `,

  // 책 목록 조회
  getBooks: `
    query GetBooks($page: Int, $pageSize: Int, $filter: BookFilterInput) {
      books(page: $page, pageSize: $pageSize, filter: $filter) {
        data {
          bookId
          bookNum
          title
          author
          abstract
          publishYear
          category
        }
        total
        totalPages
        currentPage
      }
    }
  `,

  // 책 검색
  searchBooks: `
    query SearchBooks($query: String!) {
      searchBooks(query: $query) {
        bookId
        bookNum
        title
        author
        abstract
        publishYear
        category
      }
    }
  `,
};
