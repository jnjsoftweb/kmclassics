'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface SearchFormData {
  title: string;
  author: string;
  category: string;
  publishYear: string;
}

export function BookAdvancedSearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SearchFormData>({
    title: '',
    author: '',
    category: '',
    publishYear: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (formData.title) params.append('title', formData.title);
    if (formData.author) params.append('author', formData.author);
    if (formData.category) params.append('category', formData.category);
    if (formData.publishYear) params.append('publishYear', formData.publishYear);

    const queryString = params.toString();
    if (queryString) {
      router.push(`/books/search?${queryString}`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">상세 검색</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>상세 검색</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="도서 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">저자</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="저자명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">분류</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="분류를 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publishYear">출판년도</Label>
            <Input
              id="publishYear"
              value={formData.publishYear}
              onChange={(e) => setFormData({ ...formData, publishYear: e.target.value })}
              placeholder="출판년도를 입력하세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
