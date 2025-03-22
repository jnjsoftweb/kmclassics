import { Metadata } from 'next';
import Link from 'next/link';
import { fetchGraphQL, bookQueries } from '@/lib/graphql';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 메타데이터 설정
export const metadata: Metadata = {
  title: '도서 목록 | KM Classics',
  description: '한국 고전 문학 도서 목록을 확인하세요.',
};

// 책 타입 정의
interface Book {
  bookId: string;
  bookNum: number;
  title: string;
  author?: string;
  publishYear?: string;
  abstract?: string;
  category?: string;
}

// GraphQL 응답 타입
interface BooksResponse {
  books: {
    data: Book[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

// 책 목록 가져오기
async function getBooks(): Promise<Book[]> {
  try {
    const data = await fetchGraphQL<BooksResponse>(bookQueries.getBooks, {
      page: 1,
      pageSize: 20,
    });
    return data.books.data || [];
  } catch (error) {
    console.error('책 목록 조회 오류:', error);
    return [];
  }
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">도서 목록</h1>
        <Button asChild>
          <Link href="/books/search">도서 검색</Link>
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">도서가 없습니다</h2>
          <p className="text-gray-600 mb-6">현재 등록된 도서가 없습니다.</p>
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
    </div>
  );
}
