import { Metadata } from 'next';
import { getBookMetadata, getBookVolumeTopLevelContents } from '@/lib/bookContent';
import { notFound } from 'next/navigation';
import BookVolumeContent from '@/components/book/BookVolumeContent';
import BookVolumeHeader from '@/components/book/BookVolumeHeader';
import BookVolumeNav from '@/components/book/BookVolumeNav';

interface PageProps {
  params: Promise<{ bookId: string; volumeNum: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
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
  const resolvedParams = await params;
  const bookId = resolvedParams.bookId;
  const volumeNum = parseInt(resolvedParams.volumeNum);

  if (isNaN(volumeNum)) {
    notFound();
  }

  const metadata = await getBookMetadata(bookId);
  if (!metadata) {
    notFound();
  }

  const contents = await getBookVolumeTopLevelContents(bookId, volumeNum);
  if (!contents || contents.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BookVolumeHeader book={metadata} volumeNum={volumeNum} />

      <BookVolumeNav bookId={bookId} volumes={[]} currentVolume={volumeNum} />

      <div className="book_view mt-6">
        <BookVolumeContent topLevelContents={contents} bookId={bookId} />
      </div>
    </div>
  );
}
