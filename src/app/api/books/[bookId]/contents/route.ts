import { NextRequest, NextResponse } from 'next/server';
import { getBookContents } from '@/lib/bookContent';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const volumeNum = parseInt(searchParams.get('volumeNum') || '0');
    const path = searchParams.get('path');

    if (!volumeNum || !path) {
      return NextResponse.json({ error: 'volumeNum과 path는 필수 파라미터입니다.' }, { status: 400 });
    }

    const contents = await getBookContents(params.bookId, volumeNum, path);

    if (!contents || contents.length === 0) {
      return NextResponse.json({ error: '해당 경로의 컨텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(contents);
  } catch (error) {
    console.error('컨텐츠 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '컨텐츠를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
