'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { floodKnowledgeData } from '../flood-knowledge-data';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Star,
  Users,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

type ViewMode = 'overview' | 'chapter';

const IMAGE_REGEX = /\[IMG:([^:]+):([^\]]*)\]/;

function parseContentBlocks(content: string): Array<{ type: 'markdown'; text: string } | { type: 'image'; src: string; prompt: string }> {
  const blocks: Array<{ type: 'markdown'; text: string } | { type: 'image'; src: string; prompt: string }> = [];
  let remaining = content;
  while (remaining.length > 0) {
    const match = remaining.match(IMAGE_REGEX);
    if (!match || match.index === undefined) {
      blocks.push({ type: 'markdown', text: remaining });
      break;
    }
    if (match.index > 0) {
      blocks.push({ type: 'markdown', text: remaining.slice(0, match.index) });
    }
    blocks.push({ type: 'image', src: match[1].trim(), prompt: match[2].trim() });
    remaining = remaining.slice(match.index + match[0].length);
  }
  return blocks;
}

function RealImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="aspect-video bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl flex items-center justify-center my-6">
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-red-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">{alt || '图片加载失败'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      <div className="relative w-full">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-contain"
          onError={() => setError(true)}
          loading="lazy"
        />
      </div>
    </div>
  );
}

function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full inline-block flex-shrink-0" />
                {children}
              </h1>
              <div className="w-full h-px bg-gradient-to-r from-red-200 via-orange-200 to-transparent mt-3" />
            </div>
          ),
          h2: ({ children }) => {
            const titleStr = String(children);
            const isRefLink = titleStr.includes('参考链接');
            if (isRefLink) {
              return (
                <div className="my-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl py-4 px-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">📚</span>
                    </div>
                    <span className="font-bold text-blue-700 text-sm">参考链接</span>
                  </div>
                </div>
              );
            }
            return (
              <div className="mb-4 mt-7">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pl-4 relative">
                  <span className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-400 to-red-400 rounded-full" />
                  {children}
                </h2>
              </div>
            );
          },
          h3: ({ children }) => (
            <div className="mb-3 mt-5">
              <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full inline-block flex-shrink-0" />
                {children}
              </h3>
            </div>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-red-800 bg-gradient-to-r from-red-50 to-orange-50 px-2 py-0.5 rounded border-l-2 border-red-400">
              {children}
            </strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline decoration-2 underline-offset-2 hover:text-red-600 hover:decoration-red-600 hover:bg-red-50 px-1 transition-colors rounded"
            >
              {children}
            </a>
          ),
          p: ({ children }) => {
            const content = String(children);
            if (content.startsWith('**参考链接**') || content.startsWith('**参考链接：')) {
              return (
                <div className="my-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl py-4 px-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">📚</span>
                    </div>
                    <span className="font-bold text-blue-700 text-sm">参考链接</span>
                  </div>
                  <div className="text-sm text-blue-600 leading-relaxed space-y-2">
                    {content
                      .replace(/^\*\*参考链接\*\*[：:]?\s*/, '')
                      .split('\n')
                      .filter(line => line.trim())
                      .map((line, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <span className="text-blue-400 mt-1 group-hover:text-blue-600 transition-colors">›</span>
                          <span className="group-hover:text-blue-800 transition-colors">{line.trim()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              );
            }
            if (content.startsWith('核心要点：') || content.startsWith('核心要点:')) {
              return (
                <div className="my-6 p-5 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 border-l-4 border-l-red-500 rounded-r-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-bold text-red-700 text-sm">核心要点</span>
                  </div>
                  <p className="text-base text-gray-800 leading-loose">
                    {content.replace(/^核心要点[：:]/, '')}
                  </p>
                </div>
              );
            }
            if (content.startsWith('拓展思考：') || content.startsWith('拓展思考:')) {
              return (
                <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 border-l-4 border-l-purple-500 rounded-r-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-bold text-purple-700 text-sm">拓展思考</span>
                  </div>
                  <p className="text-base text-gray-700 leading-loose italic">
                    {content.replace(/^拓展思考[：:]/, '')}
                  </p>
                </div>
              );
            }
            return (
              <p className="text-base text-gray-800 leading-loose mb-6">
                {children}
              </p>
            );
          },
          li: ({ children }) => (
            <li className="text-base my-3 leading-loose pl-1">
              {children}
            </li>
          ),
          ul: ({ children }) => (
            <ul className="space-y-3 mb-6 list-none pl-0 [&_li]:before:content-['•'] [&_li]:before:text-red-400 [&_li]:before:font-bold [&_li]:before:mr-3 [&_li]:before:inline-block [&_li]:before:text-lg">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-3 mb-6 list-decimal pl-8 marker:text-red-500 marker:font-bold marker:text-base">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-orange-50 py-4 px-6 rounded-r-xl relative shadow-sm">
              <div className="absolute top-2 right-4 text-red-200 text-5xl font-serif leading-none select-none">"</div>
              <div className="relative z-10 text-base text-gray-700 leading-loose">
                {children}
              </div>
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
              <table className="w-full text-base border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-bold text-gray-900 border border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 leading-relaxed text-gray-800 border border-gray-300 hover:bg-red-50 transition-colors">
              {children}
            </td>
          ),
          em: ({ children }) => (
            <em className="not-italic font-medium text-gray-700 bg-yellow-50 px-2 py-0.5 rounded border-l-2 border-yellow-400">
              {children}
            </em>
          ),
          hr: () => (
            <div className="my-8">
              <div className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function KnowledgeIntroPage() {
  const router = useRouter();
  const course = floodKnowledgeData;
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const currentChapter = course.chapters[currentChapterIndex];
  const pages = currentChapter?.content
    ? currentChapter.content.split('---PAGE---').filter(p => p.trim())
    : [];
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPageBlocks = useMemo(() => {
    if (!pages[currentPageIndex]) return [];
    return parseContentBlocks(pages[currentPageIndex]);
  }, [pages, currentPageIndex]);

  const handleEnterChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setCurrentPageIndex(0);
    setViewMode('chapter');
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentChapterIndex > 0) {
      const prevChapter = course.chapters[currentChapterIndex - 1];
      const prevPages = prevChapter.content.split('---PAGE---').filter(p => p.trim());
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCurrentPageIndex(prevPages.length - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else if (currentChapterIndex < course.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentPageIndex(0);
    }
  };

  const totalProgress = (() => {
    let completed = currentChapterIndex;
    if (viewMode === 'chapter' && pages.length > 0) {
      completed += (currentPageIndex + 1) / pages.length;
    }
    return Math.min(100, Math.round((completed / course.chapters.length) * 100));
  })();

  const getChapterColor = (index: number) => {
    const colors = [
      'bg-emerald-500', 'bg-sky-500', 'bg-amber-400 text-black',
      'bg-rose-500', 'bg-violet-500', 'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  if (viewMode === 'chapter') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('overview')}
              className="border border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回目录
            </Button>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {currentChapter.duration}
              </span>
              <span>·</span>
              <span>进度 {totalProgress}%</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          {/* 页码导航 + 章节跳转 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              {pages.map((_, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setCurrentPageIndex(pIdx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    pIdx === currentPageIndex
                      ? 'bg-red-500 scale-125'
                      : 'bg-gray-300 hover:bg-red-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {course.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentChapterIndex(idx); setCurrentPageIndex(0); }}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all duration-200 ${
                    idx === currentChapterIndex
                      ? 'bg-red-500 text-white'
                      : idx < currentChapterIndex
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 内容卡片 */}
          <div className="bg-white rounded-xl border border-red-100 shadow-sm mb-4 overflow-hidden">
            {/* 章节标题栏 */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                  第 {currentChapterIndex + 1} 章
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-200" />
                  AI图文混合
                </span>
                <span className="text-white/70 text-xs">
                  {currentPageIndex + 1}/{pages.length}
                </span>
              </div>
              <h2 className="text-xl font-black">{currentChapter.title}</h2>
            </div>

            {/* 内容区域 */}
            <div className="p-6 md:p-8 space-y-8">
              {currentPageBlocks.map((block, i) => {
                if (block.type === 'image') {
                  return <RealImage key={i} src={block.src} alt={block.prompt} />;
                }
                return <MarkdownContent key={i} text={block.text} />;
              })}
            </div>
          </div>

          {/* 翻页控制 */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentChapterIndex === 0 && currentPageIndex === 0}
              className="border border-red-300 text-red-700 hover:bg-red-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>

            <span className="text-sm text-gray-400">
              {currentChapterIndex + 1}/{course.chapters.length} 章 · {currentPageIndex + 1}/{pages.length} 页
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={currentChapterIndex === course.chapters.length - 1 && currentPageIndex === pages.length - 1}
              className="border border-red-300 text-red-700 hover:bg-red-50"
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.push('/safety')}
          className="gap-2 border-2 border-black font-bold"
          style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回安全应急培训
        </Button>
      </div>

      <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
          课程简介
        </div>
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="font-black text-2xl md:text-3xl text-black">{course.courseName}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" className={`border-2 font-bold ${isFavorited ? 'border-amber-400 bg-amber-400 text-black' : 'border-amber-400 text-amber-600 hover:bg-amber-400 hover:text-black'}`} style={{ borderRadius: '0' }} onClick={() => setIsFavorited(!isFavorited)}>
              <Star className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: '课程类型', value: course.courseType, color: 'bg-emerald-500', icon: '📖' },
            { label: '总学时', value: `${course.totalHours}学时`, color: 'bg-amber-400', icon: '⏱' },
            { label: '难度等级', value: course.difficulty, color: 'bg-sky-500', icon: '📊' },
            { label: '章节数', value: `${course.chapters.length}章`, color: 'bg-pink-500', icon: '📑' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} border-2 border-black flex items-center gap-2 px-4 py-2 text-white`}
              style={{ boxShadow: '3px 3px 0 0 #000' }}
            >
              <span className="text-base">{stat.icon}</span>
              <span className="text-sm font-black">{stat.value}</span>
              <span className="text-[10px] font-bold opacity-75 ml-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>

        <div className="mt-4 pt-4 border-t-2 border-black">
          <div className="text-sm font-bold text-black mb-2">学习目标</div>
          <ul className="space-y-1.5">
            {course.learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span className="font-bold">目标受众：</span>
            <span>{course.targetAudience}</span>
          </div>
        </div>
      </div>

      <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
          课程章节
        </div>
        <div className="flex items-center justify-between mb-5 mt-2">
          <h3 className="font-black text-xl text-black">共{course.chapters.length}章</h3>
        </div>
        <div className="space-y-3">
          {course.chapters.map((chapter, idx) => (
            <div key={chapter.id} className="p-4 border-2 border-black bg-white relative" style={{ boxShadow: '3px 3px 0 0 #000' }}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className={`w-14 h-14 flex items-center justify-center border-2 border-black font-black text-2xl text-white ${getChapterColor(idx)}`}>
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black text-base">{chapter.title}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs bg-gray-100 border border-black px-2 py-0.5 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {chapter.duration}
                    </span>
                    <span className="text-xs px-2 py-0.5 font-bold border border-black bg-blue-100">
                      📑 图文课
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={() => handleEnterChapter(idx)}>
                    <Play className="h-4 w-4 mr-1" />
                    学习
                  </Button>
                </div>
              </div>
              {chapter.content && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">章节内容预览</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{
                    chapter.content
                      .replace(/\[IMAGE:\s*[^\]]+\]/g, '')
                      .replace(/##\s*第\s*\d+\s*章[·｜][^\n]+/g, '')
                      .replace(/---PAGE---/g, '')
                      .replace(/###\s+/g, '')
                      .replace(/\*\*/g, '')
                      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                      .replace(/\n+/g, ' ')
                      .trim()
                      .substring(0, 200)
                  }</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-2 border-black bg-gray-900 p-5 flex items-center justify-between text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="text-sm">
          课程：<span className="font-bold text-amber-400">{course.courseName}</span> ·
          共<span className="font-bold text-amber-400">{course.chapters.length}</span>章节 ·
          <span className="font-bold text-amber-400">{course.totalHours}</span>学时
        </div>
        <div className="flex gap-3">
          <Button size="lg" className="bg-green-500 text-white font-bold border-2 border-black hover:bg-green-600" style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }} onClick={() => handleEnterChapter(0)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            开始学习
          </Button>
        </div>
      </div>
    </div>
  );
}