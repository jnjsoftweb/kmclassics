import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/sqlite';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const bookId = resolvedParams.bookId;

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const sectId = searchParams.get('sectId');
  const volumeNum = searchParams.get('volumeNum');
  const level = searchParams.get('level');

  if (!sectId || !volumeNum) {
    return NextResponse.json({ error: '필수 매개변수가 누락되었습니다.' }, { status: 400 });
  }

  try {
    const db = getDbConnection();
    try {
      let newPath;
      if (!path || path === '') {
        newPath = sectId;
      } else {
        newPath = `${path},${sectId}`;
      }

      const query =
        level === 'A'
          ? `
          SELECT * FROM ${bookId}
          WHERE volumeNum = ?
          AND path = ?
          AND level = 'X'
          ORDER BY contentId ASC
        `
          : `
          SELECT *, image FROM ${bookId}
          WHERE volumeNum = ?
          AND path = ?
          ORDER BY contentId ASC
        `;

      const children = db.prepare(query).all(parseInt(volumeNum), newPath);
      return NextResponse.json(children || []);
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('하위 콘텐츠 조회 오류:', error);
    return NextResponse.json([]);
  }
}
