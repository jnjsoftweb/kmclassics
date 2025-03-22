import { Metadata } from 'next';
import Link from 'next/link';
import { fetchGraphQL, bookQueries } from '@/lib/graphql';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { BookSearchInput } from '@/components/book/BookSearchInput';
import { BookAdvancedSearchModal } from '@/components/book/BookAdvancedSearchModal';

// 메타데이터
export const metadata: Metadata = {
  title: '도서 검색 | KM Classics',
  description: '한국 고전 도서를 검색하세요.',
};

// 책 타입 정의
interface Book {
  bookId: string;
  bookNum: number;
  title: string;
  author?: string;
  abstract?: string;
  publishYear?: string;
  category?: string;
  [key: string]: unknown;
}

// GraphQL 응답 타입
interface SearchResponse {
  searchBooks: Book[];
}

// 페이지 파라미터 타입
interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    title?: string;
    author?: string;
    category?: string;
    publishYear?: string;
  }>;
}

// 책 검색 함수
async function searchBooks(
  query: string = '',
  page: number = 1,
  filters: { title?: string; author?: string; category?: string; publishYear?: string } = {}
): Promise<{
  books: Book[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const booksPerPage = parseInt(process.env.BOOKS_PER_PAGE || '12');
    const data = await fetchGraphQL<SearchResponse>(bookQueries.searchBooks, {
      query: query.trim() || ' ',
      page,
      pageSize: booksPerPage,
      ...filters,
    });
    return {
      books: data.searchBooks || [],
      total: data.searchBooks?.length || 0,
      totalPages: Math.ceil((data.searchBooks?.length || 0) / booksPerPage),
      currentPage: page,
    };
  } catch (error) {
    console.error('책 검색 오류:', error);
    return {
      books: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const searchQuery = params.q || '';
  const filters = {
    title: params.title,
    author: params.author,
    category: params.category,
    publishYear: params.publishYear,
  };

  const { books, total, totalPages, currentPage: page } = await searchBooks(searchQuery, currentPage, filters);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">도서 검색</h1>
        <div className="flex items-center gap-4">
          <BookSearchInput />
          <BookAdvancedSearchModal />
        </div>
      </div>

      {searchQuery ? (
        <h2 className="text-xl font-semibold mb-6">
          &quot;{searchQuery}&quot; 검색 결과 ({total}건)
        </h2>
      ) : (
        <h2 className="text-xl font-semibold mb-6">전체 도서 목록 ({total}건)</h2>
      )}

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">검색 결과가 없습니다.</p>
          <p className="text-gray-500">다른 검색어로 다시 시도해보세요.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.bookId} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link href={`/books/${book.bookId}`} className="hover:text-blue-600 transition-colors">
                      {book.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {book.author && `저자: ${book.author}`}
                    {book.author && book.publishYear && ' | '}
                    {book.publishYear && `출판년도: ${book.publishYear}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {book.abstract ? (
                    <p className="text-gray-600 line-clamp-3">{book.abstract}</p>
                  ) : (
                    <p className="text-gray-500 italic">초록 정보가 없습니다.</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">{book.category || '분류 없음'}</div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/books/${book.bookId}`}>자세히 보기</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/books/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                totalItems={total}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
