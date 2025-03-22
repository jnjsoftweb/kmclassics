import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchGraphQL, bookQueries } from '@/lib/graphql';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDbConnection, closeDbConnection } from '@/lib/sqlite';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from 'lucide-react';
import { getBookMetadata, getBookVolumes } from '@/lib/bookContent';
import BookDetailClient from './BookDetailClient';

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
}

// GraphQL 응답 타입
interface BookResponse {
  book: Book | null;
}

interface PageProps {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const bookId = resolvedParams.bookId;
  const metadata = await getBookMetadata(bookId);

  if (!metadata) {
    return {
      title: '찾을 수 없는 책',
    };
  }

  return {
    title: metadata.title,
    description: `${metadata.title}의 상세 정보입니다.`,
  };
}

export default async function BookPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <BookDetailClient params={resolvedParams} />;
}

export async function getBookMetadata(bookId: string) {
  try {
    const db = await getDbConnection();
    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM Book WHERE bookId = ?`, [bookId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
    return result;
  } catch (error) {
    console.error('책 메타데이터 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

export async function getBookVolumeTopLevelContents(bookId: string, volumeNum: number) {
  try {
    const db = await getDbConnection();
    const results = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM BookContent 
         WHERE bookId = ? AND volumeNum = ? AND parentId IS NULL 
         ORDER BY contentId`,
        [bookId, volumeNum],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
    return results;
  } catch (error) {
    console.error('책 권별 콘텐츠 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}

export async function getBookVolumeContents(bookId: string, volumeNum: number, parentId: number | null) {
  try {
    const db = await getDbConnection();
    const results = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM BookContent 
         WHERE bookId = ? AND volumeNum = ? AND parentId = ? 
         ORDER BY contentId`,
        [bookId, volumeNum, parentId],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        }
      );
    });
    return results;
  } catch (error) {
    console.error('책 권별 콘텐츠 조회 오류:', error);
    return null;
  } finally {
    await closeDbConnection();
  }
}
