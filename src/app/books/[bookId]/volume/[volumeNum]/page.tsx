import { Metadata } from 'next';
import { getBookMetadata } from '@/lib/bookContent';
import BookVolumeClient from './BookVolumeClient';

interface PageProps {
  params: Promise<{ bookId: string; volumeNum: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const bookId = resolvedParams.bookId;
  const volumeNum = parseInt(resolvedParams.volumeNum);

  if (isNaN(volumeNum)) {
    return {
      title: '잘못된 권 번호',
    };
  }

  const metadata = await getBookMetadata(bookId);
  if (!metadata) {
    return {
      title: '찾을 수 없는 책',
    };
  }

  return {
    title: `${metadata.title} - 제${volumeNum}권`,
    description: `${metadata.title}의 제${volumeNum}권 내용입니다.`,
  };
}

export default async function BookVolumePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <BookVolumeClient params={resolvedParams} />;
}
