import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookNotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">책을 찾을 수 없습니다</h1>
      <p className="text-xl text-gray-600 mb-8">
        요청하신 책을 찾을 수 없습니다. 책 ID를 확인하시거나 다른 책을 검색해보세요.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button asChild>
          <Link href="/books">모든 책 보기</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/books/search">책 검색하기</Link>
        </Button>
      </div>
    </div>
  );
}
