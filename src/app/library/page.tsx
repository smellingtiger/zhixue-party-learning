'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  Filter,
  Video,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  Play,
  Lock,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Home,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// 课程分类
const categories = [
  { id: 'politics', name: '时政要闻', count: 12580, color: 'bg-red-600' },
  { id: 'party', name: '党史学习', count: 8960, color: 'bg-orange-500' },
  { id: 'theory', name: '理论学习', count: 4520, color: 'bg-amber-600' },
  { id: 'practice', name: '实务技能', count: 3280, color: 'bg-yellow-500' },
  { id: 'spirit', name: '会议精神', count: 2580, color: 'bg-green-600' },
];

// 课程列表
const courses = [
  {
    id: 1,
    title: '中国共产党纪律处分条例解读',
    category: '党史学习',
    chapterCount: 8,
    completedChapter: 2,
    totalDuration: '2小时30分',
    progress: 25,
    level: '必修',
    chapters: [
      { id: 1, title: '第一讲：总则概述', duration: '15:00', isCompleted: true },
      { id: 2, title: '第二讲：政治纪律', duration: '20:00', isCompleted: true },
      { id: 3, title: '第三讲：组织纪律', duration: '18:00', isCompleted: false },
    ]
  },
  {
    id: 2,
    title: '习近平新时代中国特色社会主义思想概论',
    category: '理论学习',
    chapterCount: 12,
    completedChapter: 8,
    totalDuration: '4小时',
    progress: 67,
    level: '必修',
    chapters: [
      { id: 1, title: '第一讲：思想概述', duration: '20:00', isCompleted: true },
      { id: 2, title: '第二讲：十个明确', duration: '25:00', isCompleted: true },
    ]
  },
  {
    id: 3,
    title: '基层党建工作实务指南',
    category: '实务技能',
    chapterCount: 6,
    completedChapter: 0,
    totalDuration: '1小时45分',
    progress: 0,
    level: '选修',
    chapters: []
  },
  {
    id: 4,
    title: '2024年全国两会精神解读',
    category: '会议精神',
    chapterCount: 4,
    completedChapter: 4,
    totalDuration: '1小时20分',
    progress: 100,
    level: '热门',
    chapters: []
  },
];

// 精选内容
const featuredContents = [
  {
    id: 1,
    type: 'video',
    title: '3分钟读懂新质生产力',
    duration: '3:24',
    views: 12580,
  },
  {
    id: 2,
    type: 'image',
    title: '二十大报告金句摘录',
    duration: '停留阅读',
    views: 45600,
  },
  {
    id: 3,
    type: 'video',
    title: '四个意识 flashcard',
    duration: '5:00',
    views: 28900,
  },
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* 顶部Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                知识库
              </h1>
              <p className="text-white/80">
                系统学习，深入理解
              </p>
            </div>
            <Link href="/">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                <Home className="h-4 w-4 mr-2" />
                返回刷课
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索栏 */}
        <Card className="mb-8 border-red-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索课程、知识点..." 
                  className="pl-10 border-red-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="hot">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">最热</SelectItem>
                  <SelectItem value="latest">最新</SelectItem>
                  <SelectItem value="progress">我的进度</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">系统课程</TabsTrigger>
            <TabsTrigger value="micro">微课速学</TabsTrigger>
            <TabsTrigger value="quotes">金句收藏</TabsTrigger>
          </TabsList>

          {/* 系统课程 */}
          <TabsContent value="courses">
            {/* 分类浏览 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">分类浏览</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/?channel=${cat.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-red-100 hover:border-red-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-sm text-muted-foreground">{cat.count.toLocaleString()} 课程</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* 我的课程 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的课程</h2>
                <Button variant="ghost" size="sm">
                  查看全部
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border-red-100">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* 封面 */}
                        <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0">
                          {course.level === '必修' && (
                            <Badge className="absolute -top-2 -left-2 bg-red-600 text-xs">必修</Badge>
                          )}
                          <Play className="h-8 w-8 text-white/80" />
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{course.category}</Badge>
                            {course.level === '热门' && (
                              <Badge className="text-xs bg-amber-100 text-amber-700">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                热门
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.chapterCount}章 · {course.totalDuration}
                          </p>
                          
                          {/* 进度 */}
                          {course.progress > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">学习进度</span>
                                <span className="text-red-600">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 章节列表 */}
                      {course.progress > 0 && course.chapters.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          {course.chapters.map((chapter, idx) => (
                            <div key={chapter.id} className="flex items-center gap-2 text-sm">
                              {chapter.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={chapter.isCompleted ? 'text-muted-foreground' : ''}>
                                {chapter.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button size="sm" className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-500">
                        {course.progress > 0 ? '继续学习' : '开始学习'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 微课速学 */}
          <TabsContent value="micro">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredContents.map((content) => (
                <Card key={content.id} className="border-red-100 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center relative">
                    {content.type === 'video' && (
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    )}
                    {content.type === 'image' && (
                      <ImageIcon className="h-12 w-12 text-white/80" />
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                      {content.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{content.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Eye className="h-3 w-3 inline mr-1" />
                      {content.views >= 1000 ? `${(content.views/1000).toFixed(1)}k` : content.views}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 金句收藏 */}
          <TabsContent value="quotes">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6">
                    <Lightbulb className="h-6 w-6 text-amber-500 mb-3" />
                    <blockquote className="text-sm italic text-gray-700 mb-3">
                      "奋斗是青春最亮丽的底色，行动是青年最有效的磨砺。有责任有担当，青春才会闪光。"
                    </blockquote>
                    <p className="text-xs text-muted-foreground">—— 习近平</p>
                    <Button variant="ghost" size="sm" className="mt-3 w-full text-amber-700">
                      <Star className="h-4 w-4 mr-1" />
                      收藏金句
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* 返回刷课 */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-500">
              <Sparkles className="h-4 w-4 mr-2" />
              返回首页刷课
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
