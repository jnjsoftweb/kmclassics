import { NextRequest, NextResponse } from 'next/server';
import { findImagePath } from '@/lib/local';

export async function GET(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    // params를 비동기적으로 처리
    const resolvedParams = await Promise.resolve(params);
    const imageId = resolvedParams.imageId;

    // 이미지 파일명 찾기
    const imageName = findImagePath(imageId);

    if (!imageName) {
      return NextResponse.json({ error: '이미지를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ imageName });
  } catch (error) {
    console.error('이미지 경로 조회 오류:', error);
    return NextResponse.json({ error: '이미지를 찾을 수 없습니다.' }, { status: 404 });
  }
}
