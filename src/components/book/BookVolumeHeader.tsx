'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from 'next/link';

interface ContentSettings {
  showChinese: boolean;
  showKorean: boolean;
  showEnglish: boolean;
  showNotes: boolean;
  showPosition: boolean;
  showImage: boolean;
}

interface BookVolumeHeaderProps {
  book: {
    title: string;
    titleChinese?: string;
    author?: string;
    bookId: string;
  };
  volumeNum: number;
  settings: ContentSettings;
  onSettingsChange: (settings: ContentSettings) => void;
}

export default function BookVolumeHeader({ 
  book, 
  volumeNum, 
  settings,
  onSettingsChange 
}: BookVolumeHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Link 
          href={`/books/${book.bookId}`}
          className="text-2xl font-bold hover:text-primary transition-colors"
        >
          {book.title}
        </Link>
        {book.titleChinese && (
          <span className="text-xl text-gray-600">
            {book.titleChinese}
          </span>
        )}
        <span className="text-xl text-muted-foreground">
          제{volumeNum}권
        </span>
        {book.author && (
          <span className="text-gray-600">
            {book.author}
          </span>
        )}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Cog className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="min-w-[400px] p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-semibold">표시 설정</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-chinese" className="text-lg font-medium">한문</Label>
              <Switch
                id="show-chinese"
                checked={settings.showChinese}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showChinese: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-korean" className="text-lg font-medium">한글</Label>
              <Switch
                id="show-korean"
                checked={settings.showKorean}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showKorean: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-english" className="text-lg font-medium">영문</Label>
              <Switch
                id="show-english"
                checked={settings.showEnglish}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showEnglish: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-notes" className="text-lg font-medium">주석</Label>
              <Switch
                id="show-notes"
                checked={settings.showNotes}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showNotes: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-position" className="text-lg font-medium">위치 표시</Label>
              <Switch
                id="show-position"
                checked={settings.showPosition}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showPosition: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="show-image" className="text-lg font-medium">이미지</Label>
              <Switch
                id="show-image"
                checked={settings.showImage}
                onCheckedChange={(checked: boolean) =>
                  onSettingsChange({ ...settings, showImage: checked })
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}