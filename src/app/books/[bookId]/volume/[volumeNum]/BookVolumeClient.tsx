'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Loader2 } from "lucide-react";
import BookVolumeHeader from '@/components/book/BookVolumeHeader';
import BookVolumeContent from '@/components/book/BookVolumeContent';
import type { BookMetadata, BookContent } from '@/lib/bookContent';

interface ContentSettings {
  showChinese: boolean;
  showKorean: boolean;
  showEnglish: boolean;
  showNotes: boolean;
  showPosition: boolean;
  showImage: boolean;
}

interface BookVolumeClientProps {
  params: {
    bookId: string;
    volumeNum: string;
  };
}

export default function BookVolumeClient({ params }: BookVolumeClientProps) {
  const bookId = params.bookId;
  const volumeNum = parseInt(params.volumeNum);
  const [settings, setSettings] = useState<ContentSettings>({
    showChinese: true,
    showKorean: true,
    showEnglish: false,
    showNotes: true,
    showPosition: true,
    showImage: true,
  });
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [contents, setContents] = useState<BookContent[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // 책 메타데이터 가져오기
        const metadataResponse = await fetch(`/api/books/${bookId}`);
        if (!metadataResponse.ok) {
          throw new Error('책 정보를 가져오는데 실패했습니다.');
        }
        const metadata = await metadataResponse.json();
        setBook(metadata);

        // 콘텐츠 가져오기
        const contentsResponse = await fetch(`/api/books/${bookId}/contents?volumeNum=${volumeNum}`);
        if (!contentsResponse.ok) {
          throw new Error('콘텐츠를 가져오는데 실패했습니다.');
        }
        const contentsData = await contentsResponse.json();
        setContents(contentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [bookId, volumeNum]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!book || !contents) {
    return notFound();
  }

  if (isNaN(volumeNum)) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BookVolumeHeader 
        book={book} 
        volumeNum={volumeNum} 
        settings={settings}
        onSettingsChange={setSettings}
      />
      <BookVolumeContent 
        topLevelContents={contents} 
        bookId={bookId}
        settings={settings}
      />
    </div>
  );
} 