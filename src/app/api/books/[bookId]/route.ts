import { NextResponse } from 'next/server';
import { getBookMetadata } from '@/lib/bookContent';

export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { bookId } = await Promise.resolve(params);
    const metadata = await getBookMetadata(bookId);

    if (!metadata) {
      return NextResponse.json(
        { error: '책을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('책 메타데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 