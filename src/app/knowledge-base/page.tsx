'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Library, BookOpen, FileText, Database, Search, Plus, Filter, X, ChevronDown, Clock, Loader2, Play, Video, FileText as FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KnowledgeProcess } from '@/components/knowledge-process';
import { useRouter } from 'next/navigation';
import { fetchKnowledgeBaseCourses, initTopicNodeMap } from '@/lib/knowledge-graph';

interface KnowledgeDoc {
  id: string;
  courseName: string;
  category: string;
  paragraphCount: number;
  fileName: string;
  videoId: string | null;
  hasVideo: boolean;
}

interface KnowledgeSegment {
  title: string;
  time: string;
  content: string;
  needsTitleGeneration?: boolean;
}

interface VideoInfo {
  has_video: boolean;
  course_code?: string;
  chinese_name?: string;
  video_url?: string;
  video_filename?: string;
}

interface KnowledgeDocDetail extends KnowledgeDoc {
  segments: KnowledgeSegment[];
}

interface ApiResponse {
  docs: KnowledgeDoc[];
  total: number;
  globalTotal: number;
  globalParagraphs: number;
  globalCategories: string[];
  globalCategoryCounts: Record<string, number>;
  globalCategoryParagraphs: Record<string, number>;
  page: number;
  pageSize: number;
  totalPages: number;
}

const categoryIcons: Record<string, typeof Library> = {
  '政治理论': BookOpen,
  '统战理论': Library,
  '国家治理': Database,
};

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalParagraphs, setGlobalParagraphs] = useState(0);
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [globalCategoryCounts, setGlobalCategoryCounts] = useState<Record<string, number>>({});
  const [globalCategoryParagraphs, setGlobalCategoryParagraphs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocDetail | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showProcess, setShowProcess] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoMode, setVideoMode] = useState<'video' | 'text'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      params.set('page', page.toString());
      params.set('pageSize', '50');

      const res = await fetch(`/api/knowledge-base?${params}`);
      const data: ApiResponse = await res.json();
      if (data.docs && Array.isArray(data.docs)) {
        setDocs(data.docs);
        setTotal(data.total ?? 0);
        setGlobalTotal(data.globalTotal ?? 0);
        setGlobalParagraphs(data.globalParagraphs ?? 0);
        setGlobalCategories(data.globalCategories ?? []);
        setGlobalCategoryCounts(data.globalCategoryCounts ?? {});
        setGlobalCategoryParagraphs(data.globalCategoryParagraphs ?? {});
      } else {
        setDocs([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('加载知识库失败:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // 初始化公务员方向动态知识图谱
  useEffect(() => {
    fetchKnowledgeBaseCourses()
      .then(({ graph }) => {
        if (graph) {
          initTopicNodeMap();
          console.log(`[知识库页面] 公务员方向知识图谱已初始化`);
        }
      })
      .catch(err => console.warn('知识图谱初始化失败:', err));
  }, []);

  const [generatingTitles, setGeneratingTitles] = useState(false);

  const handleDocClick = async (doc: KnowledgeDoc) => {
    setDocLoading(true);
    setSelectedDoc(null);
    setVideoInfo(null);
    setVideoLoading(false);
    setVideoMode('video');
    try {
      const res = await fetch(`/api/knowledge-base/${encodeURIComponent(doc.id)}`);
      const data = await res.json();
      if (data.segments) {
        setSelectedDoc(data);
        setDocLoading(false);

        const unnamedSegments = data.segments
          .map((seg: KnowledgeSegment, idx: number) => ({ ...seg, originalIndex: idx }))
          .filter((seg: KnowledgeSegment & { originalIndex: number }) => seg.needsTitleGeneration);

        setVideoLoading(true);

        if (unnamedSegments.length > 0) {
          setGeneratingTitles(true);
          Promise.all([
            fetch('/api/knowledge-base/generate-segment-titles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseName: data.courseName,
                segments: unnamedSegments.map((seg: KnowledgeSegment & { originalIndex: number }) => ({
                  index: seg.originalIndex + 1,
                  content: seg.content,
                })),
              }),
            }).then(async (titleRes) => {
              if (titleRes.ok) {
                const titleData = await titleRes.json();
                if (titleData.titles && Array.isArray(titleData.titles)) {
                  setSelectedDoc((prev: KnowledgeDocDetail | null) => {
                    if (!prev) return prev;
                    const updatedSegments = [...prev.segments];
                    for (const t of titleData.titles) {
                      const segIdx = (t.index as number) - 1;
                      if (segIdx >= 0 && segIdx < updatedSegments.length) {
                        updatedSegments[segIdx] = {
                          ...updatedSegments[segIdx],
                          title: t.title,
                          needsTitleGeneration: false,
                        };
                      }
                    }
                    return { ...prev, segments: updatedSegments };
                  });
                }
              }
            }).catch((te) => {
              console.error('AI生成标题失败:', te);
            }).finally(() => {
              setGeneratingTitles(false);
            }),
            fetch(`/api/knowledge-base/${encodeURIComponent(doc.id)}/video`)
              .then(async (videoRes) => {
                if (videoRes.ok) {
                  const videoData = await videoRes.json();
                  setVideoInfo(videoData);
                }
              })
              .catch((ve) => {
                console.error('加载视频信息失败:', ve);
              })
              .finally(() => {
                setVideoLoading(false);
              }),
          ]);
        } else {
          fetch(`/api/knowledge-base/${encodeURIComponent(doc.id)}/video`)
            .then(async (videoRes) => {
              if (videoRes.ok) {
                const videoData = await videoRes.json();
                setVideoInfo(videoData);
              }
            })
            .catch((ve) => {
              console.error('加载视频信息失败:', ve);
            })
            .finally(() => {
              setVideoLoading(false);
            });
        }
      } else {
        setSelectedDoc({ ...data, segments: [] });
        setDocLoading(false);
      }
    } catch (err) {
      console.error('加载文档详情失败:', err);
      setDocLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    setSelectedDoc(null);
  };

  const displayDocCount =
    selectedCategory === 'all'
      ? globalTotal
      : (globalCategoryCounts[selectedCategory] || 0);

  const displayParagraphCount =
    selectedCategory === 'all'
      ? globalParagraphs
      : (globalCategoryParagraphs[selectedCategory] || 0);

  const displayTitle =
    selectedCategory === 'all'
      ? '社院课程知识库 · 共 ' + globalTotal + ' 份文档'
      : '社院课程知识库 · ' + selectedCategory + ' · 共 ' + (globalCategoryCounts[selectedCategory] || 0) + ' 份文档';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">知识库</h1>
            <p className="text-sm text-muted-foreground">{displayTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索知识库..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" />搜索中</>
                ) : (
                  <><Search className="h-4 w-4 mr-1" />搜索</>
                )}
              </Button>
            </form>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setShowProcess(!showProcess)}
            >
              {showProcess ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {showProcess ? '关闭上传' : '上传课程'}
            </Button>
          </div>
        </div>
      </div>

      {showProcess && (
        <div className="border-b bg-white">
          <KnowledgeProcess onComplete={() => { fetchDocs(); }} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r p-4 overflow-y-auto flex-shrink-0">
          <h3 className="text-sm font-medium mb-3 text-gray-500">知识分类</h3>
          <div className="space-y-1">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === 'all' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
              }`}
            >
              <Library className="h-4 w-4" />
              <span className="flex-1 text-left">全部分类</span>
              <Badge variant="secondary" className="text-xs">{globalTotal}</Badge>
            </button>
            {globalCategories.map((cat) => {
              const Icon = categoryIcons[cat] || FileText;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{cat}</span>
                  <Badge variant="secondary" className="text-xs">
                    {globalCategoryCounts[cat] || 0}
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium mb-3 text-gray-500">快捷筛选</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Button variant="outline" size="sm" className="text-xs">按名称排序</Button>
              <Button variant="outline" size="sm" className="text-xs">按分类</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">加载中，请稍等...</p>
                  <p className="text-xs text-gray-400 mt-1">正在从知识库获取数据</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-red-600">{displayDocCount}</p>
                          <p className="text-sm text-muted-foreground">文档总数</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{globalCategories.length}</p>
                          <p className="text-sm text-muted-foreground">知识分类</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Library className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{displayParagraphCount}</p>
                          <p className="text-sm text-muted-foreground">总段落数</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">文档列表</CardTitle>
                    <span className="text-xs text-muted-foreground">共 {total} 篇</span>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div
                            onClick={() => handleDocClick(doc)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.hasVideo ? 'bg-green-100' : 'bg-red-100'}`}>
                              {doc.hasVideo ? (
                                <Video className="h-5 w-5 text-green-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{doc.courseName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{doc.category}</span>
                                <span>·</span>
                                <span>{doc.paragraphCount} 段</span>
                                {doc.hasVideo ? (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                                    <Video className="h-3 w-3 mr-1" />有视频
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 border-gray-200">无视频</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {doc.hasVideo && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/course/${encodeURIComponent(doc.id)}?courseId=${encodeURIComponent(doc.videoId || doc.id)}`);
                                }}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                播放
                              </Button>
                            )}
                            <ChevronDown
                              className="h-4 w-4 text-gray-400 flex-shrink-0 cursor-pointer"
                              onClick={() => handleDocClick(doc)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {selectedDoc && (
            <div className="w-96 border-l bg-white overflow-y-auto flex-shrink-0">
              <div className="p-4 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm truncate">{selectedDoc.courseName}</h3>
                  <button
                    onClick={() => { setSelectedDoc(null); setVideoInfo(null); }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{selectedDoc.category}</Badge>
                  <span>{selectedDoc.segments?.length ?? 0} 个段落</span>
                  {videoInfo?.has_video && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">有视频</Badge>
                  )}
                </div>
              </div>

              {docLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <p className="text-sm text-gray-500">加载中，请稍等...</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* 视频播放区域 */}
                  {videoInfo?.has_video && videoInfo.video_url && (
                    <div className="mb-4">
                      <div className="flex gap-2 mb-3">
                        <Button
                          size="sm"
                          variant={videoMode === 'video' ? 'default' : 'outline'}
                          className={`text-xs h-8 ${videoMode === 'video' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          onClick={() => setVideoMode('video')}
                        >
                          <Video className="h-3 w-3 mr-1" />
                          视频播放
                        </Button>
                        <Button
                          size="sm"
                          variant={videoMode === 'text' ? 'default' : 'outline'}
                          className={`text-xs h-8 ${videoMode === 'text' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          onClick={() => setVideoMode('text')}
                        >
                          <FileTextIcon className="h-3 w-3 mr-1" />
                          文本内容
                        </Button>
                      </div>

                      {videoMode === 'video' && (
                        <div className="border rounded-lg overflow-hidden bg-black">
                          <video
                            ref={videoRef}
                            src={videoInfo.video_url}
                            className="w-full"
                            controls
                            preload="metadata"
                            playsInline
                            onError={() => console.error('视频加载失败')}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 文本内容区域 */}
                  {(videoMode === 'text' || !videoInfo?.has_video) && (
                    <div className="space-y-3">
                      {generatingTitles && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-xs text-blue-600">AI正在生成段落标题...</span>
                        </div>
                      )}
                      {selectedDoc.segments?.map((seg, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-gray-100 hover:border-red-200 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-red-600">
                              {seg.needsTitleGeneration && generatingTitles ? (
                                <span className="text-gray-400 italic">生成中...</span>
                              ) : seg.title || `第${idx + 1}段`}
                            </h4>
                            {seg.time && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {seg.time}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
                            {seg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
