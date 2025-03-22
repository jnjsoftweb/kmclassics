'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  totalItems: number;
}

export function Pagination({ currentPage, totalPages, baseUrl, totalItems }: PaginationProps) {
  const maxVisiblePages = 5;
  const halfMaxPages = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, currentPage - halfMaxPages);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-500">
        총 {totalItems}개의 도서 중 {(currentPage - 1) * 12 + 1}~{Math.min(currentPage * 12, totalItems)}번 도서
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild disabled={currentPage === 1}>
          <Link href={`${baseUrl}?page=${currentPage - 1}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        {startPage > 1 && (
          <>
            <Button variant="outline" size="icon" asChild>
              <Link href={`${baseUrl}?page=1`}>1</Link>
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="icon" asChild>
            <Link href={`${baseUrl}?page=${page}`}>{page}</Link>
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="icon" asChild>
              <Link href={`${baseUrl}?page=${totalPages}`}>{totalPages}</Link>
            </Button>
          </>
        )}

        <Button variant="outline" size="icon" asChild disabled={currentPage === totalPages}>
          <Link href={`${baseUrl}?page=${currentPage + 1}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
