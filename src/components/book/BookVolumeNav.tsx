import React from 'react';
import Link from 'next/link';

interface BookVolumeNavProps {
  bookId: string;
  volumes: number[];
  currentVolume: number;
}

export default function BookVolumeNav({ bookId, volumes, currentVolume }: BookVolumeNavProps) {
  return (
    <div className="book-nav my-4 p-3 bg-gray-100 rounded-md">
      <div className="flex flex-wrap gap-2">
        <span className="font-medium">권 선택:</span>
        {volumes.map((volume) => (
          <Link
            key={volume}
            href={`/books/${bookId}/volume/${volume}`}
            className={`px-3 py-1 rounded-md ${
              volume === currentVolume ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200'
            }`}
          >
            {volume}권
          </Link>
        ))}
      </div>
    </div>
  );
}
