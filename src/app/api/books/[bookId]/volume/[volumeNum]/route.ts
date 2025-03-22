import { NextResponse } from 'next/server';
import { getBookVolumeContents } from '@/lib/bookContent';

export async function GET(request: Request, { params }: { params: { bookId: string; volumeNum: string } }) {
  try {
    // params를 비동기적으로 처리
    const { bookId, volumeNum: volumeNumStr } = await Promise.resolve(params);
    const volumeNum = parseInt(volumeNumStr);

    if (isNaN(volumeNum)) {
      return NextResponse.json({ error: '유효하지 않은 권 번호입니다.' }, { status: 400 });
    }

    // 해당 권의 모든 콘텐츠 가져오기
    const contents = await getBookVolumeContents(bookId, volumeNum);
    return NextResponse.json(contents);
  } catch (error) {
    console.error('권 콘텐츠 조회 오류:', error);
    return NextResponse.json({ error: '권 콘텐츠 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
