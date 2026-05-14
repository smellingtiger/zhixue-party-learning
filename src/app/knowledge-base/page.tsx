'use client';

import { Library, BookOpen, FileText, Database, Search, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const knowledgeCategories = [
  { id: 'all', name: '全部', icon: Library, count: 128 },
  { id: 'theory', name: '理论学习', icon: BookOpen, count: 45 },
  { id: 'regulation', name: '党规党纪', icon: FileText, count: 32 },
  { id: 'history', name: '党史资料', icon: Database, count: 28 },
  { id: 'practice', name: '实践案例', icon: BookOpen, count: 23 },
];

const recentDocuments = [
  { id: 1, title: '习近平新时代中国特色社会主义思想学习纲要', category: '理论学习', updatedAt: '2024-03-20' },
  { id: 2, title: '中国共产党章程（2022年版）', category: '党规党纪', updatedAt: '2024-03-18' },
  { id: 3, title: '党的二十大报告学习辅导百问', category: '理论学习', updatedAt: '2024-03-15' },
  { id: 4, title: '党史学习教育资料汇编', category: '党史资料', updatedAt: '2024-03-12' },
];

export default function KnowledgeBasePage() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* 顶部搜索栏 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">知识库</h1>
            <p className="text-sm text-muted-foreground">党建学习资料综合查询平台</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="搜索知识库..." 
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              上传文档
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧分类导航 */}
        <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
          <h3 className="text-sm font-medium mb-3">知识分类</h3>
          <div className="space-y-1">
            {knowledgeCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white hover:shadow-sm transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-left">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">快捷筛选</h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Button variant="outline" size="sm" className="text-xs">按更新时间</Button>
              <Button variant="outline" size="sm" className="text-xs">按热度</Button>
            </div>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">128</p>
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
                    <p className="text-2xl font-bold text-blue-600">5</p>
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
                    <p className="text-2xl font-bold text-green-600">1.2GB</p>
                    <p className="text-sm text-muted-foreground">存储容量</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-600">89%</p>
                    <p className="text-sm text-muted-foreground">文档覆盖率</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近更新 */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">最近更新</CardTitle>
              <Button variant="ghost" size="sm">查看全部</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{doc.updatedAt}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热门文档 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">热门文档</CardTitle>
              <Button variant="ghost" size="sm">查看排行</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {i}
                      </span>
                      <span className="font-medium text-sm">热门文档标题{[i]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      文档简介内容，用于展示文档的核心要点...
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}