'use client';

import { useState } from 'react';
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
  Eye,
  Bookmark,
  BookmarkCheck,
  Heart,
  Trash2,
  Download,
  Share2,
  Layers3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// 书架内容
const bookshelfItems = [
  {
    id: 1,
    title: '深刻理解"两个确立"的决定性意义',
    subtitle: '学习贯彻党的二十大精神专题',
    source: '求是网',
    author: '求是杂志',
    duration: '8分钟',
    category: '理论学习',
    type: 'article',
    progress: 100,
    collectedAt: '2024-03-15',
    lastReadAt: '2024-03-18',
    likeCount: 12580,
    isCompleted: true,
  },
  {
    id: 2,
    title: '中国共产党纪律处分条例解读',
    subtitle: '第1-5讲完整版',
    source: '中央纪委',
    author: '中央纪委',
    duration: '45分钟',
    category: '党纪',
    type: 'video',
    progress: 65,
    collectedAt: '2024-03-10',
    lastReadAt: '2024-03-20',
    likeCount: 8900,
    isCompleted: false,
  },
  {
    id: 3,
    title: '2024年政府工作报告要点',
    subtitle: '十大关键数字速览',
    source: '新华社',
    author: '新华社',
    duration: '3分钟',
    category: '时政',
    type: 'image',
    progress: 100,
    collectedAt: '2024-03-05',
    lastReadAt: '2024-03-05',
    likeCount: 45600,
    isCompleted: true,
  },
  {
    id: 4,
    title: '基层党建工作实务20讲',
    subtitle: '三会一课规范流程',
    source: '党建工作实务',
    author: '党务专家',
    duration: '2小时',
    category: '实务',
    type: 'article',
    progress: 30,
    collectedAt: '2024-02-28',
    lastReadAt: '2024-03-12',
    likeCount: 23400,
    isCompleted: false,
  },
  {
    id: 5,
    title: '党章诵读：第一章 党员',
    subtitle: '音频伴读版',
    source: '有声党课',
    author: '党员教育',
    duration: '5分钟',
    category: '党章',
    type: 'audio',
    progress: 100,
    collectedAt: '2024-02-20',
    lastReadAt: '2024-02-25',
    likeCount: 28900,
    isCompleted: true,
  },
  {
    id: 6,
    title: '延安精神永放光芒',
    subtitle: '传承红色基因',
    source: '求是网',
    author: '理论学习',
    duration: '6分钟',
    category: '党史',
    type: 'article',
    progress: 0,
    collectedAt: '2024-03-22',
    lastReadAt: null,
    likeCount: 18900,
    isCompleted: false,
  },
];

// 学习历史
const historyItems = [
  {
    id: 101,
    title: '深刻理解"两个确立"的决定性意义',
    source: '求是网',
    readAt: '2024-03-22 14:30',
    progress: 45,
  },
  {
    id: 102,
    title: '政府工作报告要点速览',
    source: '新华社',
    readAt: '2024-03-22 10:15',
    progress: 100,
  },
  {
    id: 103,
    title: '党纪处分条例解读',
    source: '中央纪委',
    readAt: '2024-03-21 20:45',
    progress: 65,
  },
];

export default function BookshelfPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('collection');

  const filteredItems = bookshelfItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookshelfItems.length}</p>
                <p className="text-sm text-muted-foreground">收藏内容</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookshelfItems.filter(i => i.isCompleted).length}</p>
                <p className="text-sm text-muted-foreground">已完成</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Layers3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookshelfItems.filter(i => i.progress > 0 && !i.isCompleted).length}</p>
                <p className="text-sm text-muted-foreground">学习中</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{historyItems.length}</p>
                <p className="text-sm text-muted-foreground">最近学习</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="collection" className="gap-2">
                <Bookmark className="h-4 w-4" />
                收藏
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                历史
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                已完成
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="搜索收藏..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>

          {/* 收藏内容 */}
          <TabsContent value="collection" className="space-y-4">
            {activeTab === 'collection' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {item.type === 'article' && <FileText className="h-4 w-4 text-muted-foreground" />}
                          {item.type === 'video' && <Video className="h-4 w-4 text-muted-foreground" />}
                          {item.type === 'image' && <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                          {item.type === 'audio' && <Star className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-red-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{item.subtitle}</p>
                      
                      {item.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">学习进度</span>
                            <span className={item.isCompleted ? 'text-green-600' : 'text-red-600'}>
                              {item.isCompleted ? '已完成' : `${item.progress}%`}
                            </span>
                          </div>
                          <Progress 
                            value={item.progress} 
                            className={`h-1.5 ${item.isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500'}`} 
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{item.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Play className="h-3 w-3" />
                          {item.progress > 0 ? '继续' : '学习'}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600">
                          <BookmarkCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 学习历史 */}
          <TabsContent value="history">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {historyItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="w-16 h-12 rounded bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{item.readAt}</p>
                        <p className="text-xs text-red-600 mt-1">
                          {item.progress === 100 ? '已学完' : `学到${item.progress}%`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        继续
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 已完成 */}
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookshelfItems.filter(i => i.isCompleted).map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        已完成
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.source}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.lastReadAt} 完成</span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(0)}w` : item.likeCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
