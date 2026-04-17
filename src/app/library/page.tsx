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
  Video,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  Play,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  { id: 'politics', name: '时政要闻', count: 12580, color: 'bg-red-600' },
  { id: 'party', name: '党史学习', count: 8960, color: 'bg-orange-500' },
  { id: 'theory', name: '理论学习', count: 4520, color: 'bg-amber-600' },
  { id: 'practice', name: '实务技能', count: 3280, color: 'bg-yellow-500' },
  { id: 'spirit', name: '会议精神', count: 2580, color: 'bg-green-600' },
];

const courses = [
  { id: 1, title: '党的二十大精神解读', level: '必修', progress: 75, duration: '45分钟', lessons: 12, completed: 9 },
  { id: 2, title: '中国共产党党史', level: '必修', progress: 30, duration: '60分钟', lessons: 15, completed: 5 },
  { id: 3, title: '党章党规学习', level: '选修', progress: 0, duration: '30分钟', lessons: 8, completed: 0 },
  { id: 4, title: '基层党务工作实务', level: '必修', progress: 50, duration: '40分钟', lessons: 10, completed: 5 },
];

const featuredContents = [
  { id: 1, title: '党的二十大报告金句', type: 'video', duration: '3分钟', views: 12580 },
  { id: 2, title: '党史学习教育专题', type: 'video', duration: '5分钟', views: 8960 },
  { id: 3, title: '入党誓词的演变', type: 'image', duration: '1分钟', views: 5620 },
  { id: 4, title: '党章修正案对比', type: 'video', duration: '4分钟', views: 4200 },
];

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
      <Card className="mb-8 border-orange-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索课程、知识点..." 
                className="pl-10 border-orange-100"
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

        <TabsContent value="courses">
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
                      <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0 relative">
                        {course.level === '必修' && (
                          <Badge className="absolute -top-2 -left-2 bg-red-600 text-xs">必修</Badge>
                        )}
                        <Play className="h-8 w-8 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {course.duration} · {course.lessons}课时
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="self-center">
                        {course.progress > 0 ? '继续' : '开始'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="micro">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredContents.map((content) => (
              <Card key={content.id} className="border-red-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </div>
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

        <TabsContent value="quotes">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <Star className="h-6 w-6 text-amber-500 mb-3" />
                  <blockquote className="text-sm italic text-gray-700 mb-3">
                    奋斗是青春最亮丽的底色，行动是青年最有效的磨砺。有责任有担当，青春才会闪光。
                  </blockquote>
                  <p className="text-xs text-muted-foreground">—— 习近平</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
