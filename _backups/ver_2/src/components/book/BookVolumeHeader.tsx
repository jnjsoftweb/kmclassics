import React from 'react';
import { BookMetadata } from '@/lib/bookContent';

interface BookVolumeHeaderProps {
  book: BookMetadata;
  volumeNum: number;
}

export default function BookVolumeHeader({ book, volumeNum }: BookVolumeHeaderProps) {
  return (
    <div className="book-header mb-4">
      <h1 className="text-2xl font-bold">
        {book.title}
        {book.titleChinese && <span className="ml-2 text-gray-600 text-lg">({book.titleChinese})</span>}
      </h1>
      <div className="text-xl mt-2">
        <span className="font-semibold">제{volumeNum}권</span>
        {book.author && <span className="ml-4 text-gray-700">{book.author} 저</span>}
        {book.translator && <span className="ml-2 text-gray-700">{book.translator} 역</span>}
      </div>
    </div>
  );
}
