'use client';

import { useState, useEffect, useCallback } from 'react';
import { Library, BookOpen, FileText, Database, Search, Plus, Filter, X, ChevronDown, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KnowledgeProcess } from '@/components/knowledge-process';

interface KnowledgeDoc {
  id: string;
  courseName: string;
  category: string;
  paragraphCount: number;
  fileName: string;
}

interface KnowledgeSegment {
  title: string;
  time: string;
  content: string;
}

interface KnowledgeDocDetail extends KnowledgeDoc {
  segments: KnowledgeSegment[];
}

interface ApiResponse {
  docs: KnowledgeDoc[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
  categoryCounts: Record<string, number>;
}

const categoryIcons: Record<string, typeof Library> = {
  '政治理论': BookOpen,
  '统战理论': Library,
  '国家治理': Database,
};

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocDetail | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showProcess, setShowProcess] = useState(false);

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
      setDocs(data.docs);
      setTotal(data.total);
      setCategories(data.categories);
      if (data.categoryCounts) {
        setCategoryCounts(data.categoryCounts);
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

  const handleDocClick = async (doc: KnowledgeDoc) => {
    setDocLoading(true);
    setSelectedDoc(null);
    try {
      const res = await fetch(`/api/knowledge-base/${encodeURIComponent(doc.id)}`);
      const data: KnowledgeDocDetail = await res.json();
      setSelectedDoc(data);
    } catch (err) {
      console.error('加载文档详情失败:', err);
    } finally {
      setDocLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDocs();
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setPage(1);
    setSelectedDoc(null);
  };

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return total;
    return categoryCounts[cat] || 0;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">知识库</h1>
            <p className="text-sm text-muted-foreground">社院课程知识库 · 共 {total} 份文档</p>
          </div>
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索知识库..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
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
              <Badge variant="secondary" className="text-xs">{total}</Badge>
            </button>
            {categories.map((cat) => {
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
                    {getCategoryCount(cat)}
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
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-red-600">{total}</p>
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
                          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
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
                          <p className="text-2xl font-bold text-green-600">
                            {docs.reduce((sum, d) => sum + d.paragraphCount, 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">总段落数</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-amber-600">
                            {Math.round(docs.filter(d => d.paragraphCount > 0).length / Math.max(total, 1) * 100)}%
                          </p>
                          <p className="text-sm text-muted-foreground">文档覆盖率</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Database className="h-5 w-5 text-amber-600" />
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
                          onClick={() => handleDocClick(doc)}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{doc.courseName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{doc.category}</span>
                                <span>·</span>
                                <span>{doc.paragraphCount} 段</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
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
                    onClick={() => setSelectedDoc(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{selectedDoc.category}</Badge>
                  <span>{selectedDoc.segments.length} 个段落</span>
                </div>
              </div>

              {docLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {selectedDoc.segments.map((seg, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-gray-100 hover:border-red-200 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-red-600">{seg.title}</h4>
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
      </div>
    </div>
  );
}