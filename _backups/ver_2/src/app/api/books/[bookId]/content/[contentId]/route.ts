import { NextResponse } from 'next/server';
import { getBookContent, getBookContentChildren } from '@/lib/bookContent';

export async function GET(request: Request, { params }: { params: { bookId: string; contentId: string } }) {
  try {
    // params를 비동기적으로 처리
    const { bookId, contentId: contentIdStr } = await Promise.resolve(params);
    const contentId = parseInt(contentIdStr);

    if (isNaN(contentId)) {
      return NextResponse.json({ error: '유효하지 않은 콘텐츠 ID입니다.' }, { status: 400 });
    }

    // URL에서 mode 매개변수 가져오기
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') || 'content';

    let result;
    if (mode === 'children') {
      // 하위 콘텐츠 가져오기
      result = await getBookContentChildren(bookId, contentId);
    } else {
      // 특정 콘텐츠 가져오기
      result = await getBookContent(bookId, contentId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('콘텐츠 조회 오류:', error);
    return NextResponse.json({ error: '콘텐츠 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
