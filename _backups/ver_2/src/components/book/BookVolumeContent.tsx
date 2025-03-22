'use client';

import React, { useState } from 'react';
import { BookContent } from '@/lib/bookContent';

interface BookVolumeContentProps {
  topLevelContents: BookContent[];
  bookId: string;
}

interface ContentSettings {
  showChinese: boolean;
  showKorean: boolean;
  showEnglish: boolean;
  showNotes: boolean;
  showPosition: boolean;
}

export default function BookVolumeContent({ topLevelContents, bookId }: BookVolumeContentProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [childContents, setChildContents] = useState<Record<number, BookContent[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [settings, setSettings] = useState<ContentSettings>({
    showChinese: true,
    showKorean: true,
    showEnglish: false,
    showNotes: true,
    showPosition: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  const toggleSection = async (content: BookContent) => {
    const contentId = content.contentId;
    const newExpandedState = !expandedSections[contentId];

    setExpandedSections((prev) => ({
      ...prev,
      [contentId]: newExpandedState,
    }));

    if (newExpandedState && !childContents[contentId]) {
      setLoading((prev) => ({ ...prev, [contentId]: true }));
      try {
        const response = await fetch(
          `/api/books/${bookId}/children?path=${content.path || ''}&sectId=${content.sectId}&volumeNum=${
            content.volumeNum
          }&level=${content.level}`
        );

        const children = await response.json();
        setChildContents((prev) => ({ ...prev, [contentId]: children }));
      } catch (error) {
        console.error(`하위 콘텐츠 로드 오류 (ID: ${contentId}):`, error);
        setChildContents((prev) => ({ ...prev, [contentId]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [contentId]: false }));
      }
    }
  };

  // 섹션 깊이에 따른 들여쓰기 계산
  const getIndentClass = (depth: string) => {
    const depthLevel = depth.split('.').length;
    return `ml-${depthLevel * 4}`;
  };

  // 섹션 레벨에 따른 스타일 적용
  const getSectionStyle = (level: string) => {
    switch (level) {
      case 'A':
        return 'text-xl font-bold';
      case 'B':
        return 'text-lg font-semibold';
      case 'O':
        return 'text-base font-medium';
      case 'S':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  // 주석 처리를 위한 정규식 추가
  const NOTE_REGEX = /\[(.*?)\]{(.*?)}/g;

  // 주석이 있는 텍스트를 변환하는 함수 수정
  const formatTextWithNotes = (text: string, showNotes: boolean) => {
    if (!text) return '';

    // ~로 둘러싸인 텍스트 처리
    let formattedText = text.replace(/~(.*?)~/g, '<small class="text-xs text-gray-500">$1</small>');

    // 주석 처리
    formattedText = formattedText.replace(NOTE_REGEX, (match, text, note) => {
      if (!showNotes) {
        return text; // 주석 비활성화 시 원문만 표시
      }
      return `
        <span class="relative group">
          ${text}<sup class="inline-flex items-center justify-center w-4 h-4 ml-0.5 text-[10px] text-white bg-orange-500 rounded-full cursor-help">!</sup>
          <span class="invisible group-hover:visible absolute z-10 bg-black text-white text-sm rounded p-2 -top-8 left-0 min-w-[200px] whitespace-normal">
            ${note}
          </span>
        </span>
      `;
    });

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // 콘텐츠 렌더링 함수 수정
  const renderContent = (content: BookContent) => {
    const isLeafNode = content.level === 'Z' || content.level === 'X';

    return (
      <div key={content.contentId} className={`mb-6 ${getIndentClass(content.depth)}`}>
        <div className="border rounded-md overflow-hidden">
          {/* 원문 블록 */}
          {settings.showChinese && (
            <div
              className={`flex items-center py-2 px-3 bg-gray-50 border-b ${!isLeafNode ? 'cursor-pointer' : ''}`}
              onClick={() => !isLeafNode && toggleSection(content)}
            >
              <h2 className={getSectionStyle(content.level)}>
                {settings.showPosition && content.sectNum && (
                  <span className="mr-2 text-gray-500">{content.sectNum}</span>
                )}
                {content.chinese && <span>{formatTextWithNotes(content.chinese, settings.showNotes)}</span>}
              </h2>
              {!isLeafNode && (
                <span className="ml-auto">
                  {loading[content.contentId] ? '...' : expandedSections[content.contentId] ? '▼' : '▶'}
                </span>
              )}
            </div>
          )}

          {/* 번역 블록 */}
          {settings.showKorean && content.korean && (
            <div
              className={`py-2 px-3 ${settings.showChinese ? '' : 'bg-gray-50 border-b'} ${
                !isLeafNode ? 'cursor-pointer' : ''
              }`}
              onClick={() => !isLeafNode && toggleSection(content)}
            >
              <div className="flex items-center">
                <h2 className={getSectionStyle(content.level)}>
                  {!settings.showChinese && settings.showPosition && content.sectNum && (
                    <span className="mr-2 text-gray-500">{content.sectNum}</span>
                  )}
                  <span>{formatTextWithNotes(content.korean, settings.showNotes)}</span>
                </h2>
                {/* 원문이 숨겨져 있을 때만 번역 블록에 확장/축소 아이콘 표시 */}
                {!settings.showChinese && !isLeafNode && (
                  <span className="ml-auto">
                    {loading[content.contentId] ? '...' : expandedSections[content.contentId] ? '▼' : '▶'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 영어 블록 */}
          {settings.showEnglish && content.english && (
            <div className="py-2 px-3">
              <span>{formatTextWithNotes(content.english, settings.showNotes)}</span>
            </div>
          )}
        </div>

        {/* 하위 콘텐츠 */}
        {!isLeafNode && expandedSections[content.contentId] && (
          <div className="mt-4 ml-4">
            {loading[content.contentId] && (
              <div className="text-center py-4">
                <p className="text-gray-500">하위 내용 로드 중...</p>
              </div>
            )}

            {!loading[content.contentId] && childContents[content.contentId]?.length > 0 && (
              <div className="child-contents">
                {childContents[content.contentId].map((child) => renderContent(child))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SettingsPanel = () => {
    return (
      <div className="mb-4 p-4 bg-white border rounded-lg shadow-lg">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showChinese}
              onChange={(e) => setSettings((prev) => ({ ...prev, showChinese: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-orange-500"
            />
            <span>원문</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showKorean}
              onChange={(e) => setSettings((prev) => ({ ...prev, showKorean: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-orange-500"
            />
            <span>번역</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showEnglish}
              onChange={(e) => setSettings((prev) => ({ ...prev, showEnglish: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-orange-500"
            />
            <span>영어</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showNotes}
              onChange={(e) => setSettings((prev) => ({ ...prev, showNotes: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-orange-500"
            />
            <span>주석</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.showPosition}
              onChange={(e) => setSettings((prev) => ({ ...prev, showPosition: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-orange-500"
            />
            <span>위치</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          설정
        </button>
      </div>
      {showSettings && <SettingsPanel />}
      <div className="book-content">
        {topLevelContents.sort((a, b) => a.contentId - b.contentId).map((content) => renderContent(content))}
      </div>
    </div>
  );
}
