'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

interface BookDetailClientProps {
  params: {
    bookId: string;
  };
}

export default function BookDetailClient({ params }: BookDetailClientProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/books/${params.bookId}`);
        if (!response.ok) {
          throw new Error('책 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.bookId]);

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

  if (!book) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 사이드바 - 책 기본 정보 */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{book.title}</CardTitle>
              {book.titleChinese && <CardDescription className="text-lg mt-2">{book.titleChinese}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-500">저자</div>
                  <div className="col-span-2">{book.author || '미상'}</div>
                </div>

                {book.translator && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">번역자</div>
                    <div className="col-span-2">{book.translator}</div>
                  </div>
                )}

                {book.publishYear && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">출판년도</div>
                    <div className="col-span-2">{book.publishYear}</div>
                  </div>
                )}

                {book.publisher && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">출판사</div>
                    <div className="col-span-2">{book.publisher}</div>
                  </div>
                )}

                {book.volumes && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">권수</div>
                    <div className="col-span-2">{book.volumes}권</div>
                  </div>
                )}

                {book.language && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">언어</div>
                    <div className="col-span-2">{book.language}</div>
                  </div>
                )}

                {book.category && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 text-gray-500">분류</div>
                    <div className="col-span-2">{book.category}</div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col w-full gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full justify-between">
                      원문 보기
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {Array.from({ length: book.volumes || 1 }, (_, i) => (
                      <DropdownMenuItem key={i + 1} asChild>
                        <Link href={`/books/${book.bookId}/volume/${i + 1}`} className="w-full">
                          {i + 1}권
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {book.ebooks && (
                  <Button variant="outline" className="w-full">
                    전자책 다운로드
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* 유사 도서 */}
          {book.similars && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">유사 도서</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {book.similars.split(',').map((similar, index) => (
                    <div key={index} className="text-blue-600 hover:underline">
                      {similar.trim()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽 메인 컨텐츠 - 상세 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 초록 */}
          {book.abstract && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">초록</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.abstract}</p>
              </CardContent>
            </Card>
          )}

          {/* 저자 정보 */}
          {book.authorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">저자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.authorInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 번역자 정보 */}
          {book.translatorInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">번역자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.translatorInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 서지 정보 */}
          {book.bibliographicInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">서지 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.bibliographicInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 출판 정보 */}
          {book.publicationInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">출판 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.publicationInfo}</p>
              </CardContent>
            </Card>
          )}

          {/* 참고 문헌 */}
          {book.references && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">참고 문헌</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{book.references}</p>
              </CardContent>
            </Card>
          )}

          {/* 키워드 */}
          {book.keywords && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">키워드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {book.keywords.split(',').map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 