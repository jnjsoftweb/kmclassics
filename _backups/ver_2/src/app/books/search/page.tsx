import { Metadata } from 'next';
import Link from 'next/link';
import { fetchGraphQL, bookQueries } from '@/lib/graphql';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// 책 검색 함수
async function searchBooks(query: string): Promise<Book[]> {
  try {
    const data = await fetchGraphQL<SearchResponse>(bookQueries.searchBooks, { query });
    return data.searchBooks || [];
  } catch (error) {
    console.error('책 검색 오류:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const searchQuery = searchParams.q || '';
  const books = searchQuery ? await searchBooks(searchQuery) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">도서 검색</h1>
        <Button asChild variant="outline">
          <Link href="/books">모든 도서 보기</Link>
        </Button>
      </div>

      {/* 검색 폼 */}
      <div className="mb-8">
        <form action="/books/search" method="get">
          <div className="flex gap-2 max-w-md">
            <Input
              name="q"
              placeholder="도서명, 저자, 키워드 검색..."
              defaultValue={searchQuery}
              className="flex-grow"
            />
            <Button type="submit">검색</Button>
          </div>
        </form>
      </div>

      {/* 검색 결과 */}
      {searchQuery ? (
        <>
          <h2 className="text-xl font-semibold mb-6">
            &quot;{searchQuery}&quot; 검색 결과 ({books.length}건)
          </h2>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">검색 결과가 없습니다.</p>
              <p className="text-gray-500">다른 검색어로 다시 시도해보세요.</p>
            </div>
          ) : (
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
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">검색어를 입력하세요</h2>
          <p className="text-gray-600 mb-6">도서명, 저자, 키워드로 검색할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
