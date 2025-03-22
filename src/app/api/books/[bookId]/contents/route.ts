import { NextRequest, NextResponse } from 'next/server';
import { getBookContents, getBookVolumeTopLevelContents } from '@/lib/bookContent';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const { bookId } = await Promise.resolve(params);
    const searchParams = request.nextUrl.searchParams;
    const volumeNum = parseInt(searchParams.get('volumeNum') || '0');
    const path = searchParams.get('path');

    if (!volumeNum) {
      return NextResponse.json({ error: 'volumeNum은 필수 파라미터입니다.' }, { status: 400 });
    }

    let contents;
    if (path) {
      // 특정 경로의 컨텐츠 가져오기
      contents = await getBookContents(bookId, volumeNum, path);
    } else {
      // 최상위 레벨 컨텐츠 가져오기
      contents = await getBookVolumeTopLevelContents(bookId, volumeNum);
    }

    if (!contents || contents.length === 0) {
      return NextResponse.json({ error: '컨텐츠를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(contents);
  } catch (error) {
    console.error('컨텐츠 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '컨텐츠를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
