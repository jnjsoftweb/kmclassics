import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CardTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Shadcn UI 컴포넌트 테스트</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 기본 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 카드</CardTitle>
            <CardDescription>기본적인 카드 컴포넌트입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>카드 내용은 여기에 들어갑니다. 텍스트, 이미지 등 다양한 콘텐츠를 포함할 수 있습니다.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">취소</Button>
            <Button>확인</Button>
          </CardFooter>
        </Card>

        {/* 그림자가 있는 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>그림자 카드</CardTitle>
            <CardDescription>그림자 효과가 적용된 카드입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>shadow-lg 클래스를 사용하여 그림자 효과를 적용했습니다.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">자세히 보기</Button>
          </CardFooter>
        </Card>

        {/* 테두리가 있는 카드 */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>테두리 카드</CardTitle>
            <CardDescription>테두리가 강조된 카드입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>border-2와 border-primary 클래스를 사용하여 테두리를 강조했습니다.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              선택하기
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">버튼 변형</h2>
        <div className="flex flex-wrap gap-4">
          <Button>기본</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="outline">외곽선</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="link">링크</Button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">버튼 크기</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">작게</Button>
          <Button>기본</Button>
          <Button size="lg">크게</Button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">입력 컴포넌트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 입력</CardTitle>
              <CardDescription>기본 입력 컴포넌트입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-2 block">
                  이름
                </label>
                <Input id="name" placeholder="이름을 입력하세요" />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-2 block">
                  이메일
                </label>
                <Input id="email" type="email" placeholder="이메일을 입력하세요" />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium mb-2 block">
                  비밀번호
                </label>
                <Input id="password" type="password" placeholder="비밀번호를 입력하세요" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">제출하기</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>입력 변형</CardTitle>
              <CardDescription>다양한 입력 컴포넌트 변형입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="disabled" className="text-sm font-medium mb-2 block">
                  비활성화 입력
                </label>
                <Input id="disabled" disabled placeholder="비활성화된 입력" />
              </div>
              <div>
                <label htmlFor="readonly" className="text-sm font-medium mb-2 block">
                  읽기 전용 입력
                </label>
                <Input id="readonly" readOnly value="읽기 전용 값" />
              </div>
              <div className="flex items-center space-x-2">
                <Input id="search" placeholder="검색어를 입력하세요" />
                <Button>검색</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
