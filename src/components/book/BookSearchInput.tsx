'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function BookSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    params.delete('page'); // 검색 시 페이지 초기화
    router.push(`/books/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 max-w-md">
      <Input
        type="search"
        placeholder="도서명, 저자, 키워드 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow"
      />
      <Button type="button" onClick={handleSearch} variant="outline" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
