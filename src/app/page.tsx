'use client';

import { useState, useEffect, useRef } from 'react';
import { OnboardingFlow } from '@/components/onboarding-flow';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Bookmark,
  BookmarkCheck,
  Share2,
  MessageCircle,
  Home,
  BookOpen,
  Star,
  TrendingUp,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Check,
  Sparkles,
  Lightbulb,
  FileText,
  Video,
  Image as ImageIcon,
  Layers,
  Notebook,
  Search,
  Bell,
  Settings,
  List,
  Lock,
  Clock,
  Eye,
  Menu,
  Volume2,
  BarChart3,
  Calendar,
  Target,
  Trophy,
  Bot,
  TrendingDown,
  Quote,
  AlignLeft,
  LayoutList,
  ImagePlus,
  Download,
  Save,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Send,
  Mic,
  Highlighter,
  PenTool,
  Users,
  Clock3,
  Flame,
  StarHalf,
  Layers3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// 内容类型
type ContentType = 'quote' | 'card' | 'infographic' | 'audio' | 'article';
type ContentStatus = 'new' | 'hot' | 'reading' | 'completed';

// 内容项
interface ContentItem {
  id: number;
  type: ContentType;
  title: string;
  subtitle?: string;
  source: string;
  author: string;
  duration?: string;
  category: string;
  tags: string[];
  description: string;
  content?: string;
  knowledgePoints: { text: string; highlight: boolean }[];
  keyPoint?: string;
  stats?: { label: string; value: string }[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  learnerCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isCompleted: boolean;
  progress?: number;
  status?: ContentStatus;
  relatedCourseId?: number;
  relatedCourse?: string;
  createdAt: string;
}

// 章节项
interface ChapterItem {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  isActive: boolean;
  progress?: number;
}

// 今日热点
interface HotItem {
  id: number;
  title: string;
  type: string;
  rank: number;
}

// 所有内容数据
const allContents: ContentItem[] = [
  // 精选头条
  {
    id: 1,
    type: 'card',
    title: '深刻理解"两个确立"的决定性意义',
    subtitle: '学习贯彻党的二十大精神专题辅导',
    source: '求是网',
    author: '求是杂志',
    duration: '8分钟阅读',
    category: '理论学习',
    tags: ['两个确立', '二十大', '理论武装'],
    description: '"两个确立"是党在新时代取得的重大政治成果，是推动党和国家事业取得历史性成就、发生历史性变革的决定性因素。',
    content: `党的二十大报告指出，"两个确立"是党在新时代取得的重大政治成果。

**一、"两个确立"的丰富内涵**

"两个确立"，即确立习近平同志党中央的核心、全党的核心地位，确立习近平新时代中国特色社会主义思想的指导地位。

**二、做到"两个维护"**

要把增强"四个意识"、坚定"四个自信"、做到"两个维护"作为最高政治原则。`,
    knowledgePoints: [
      { text: '两个确立：核心地位 + 指导地位', highlight: true },
      { text: '四个意识：政治、大局、核心、看齐', highlight: true },
      { text: '两个维护：维护核心、维护权威', highlight: true },
    ],
    likeCount: 125800,
    commentCount: 8560,
    viewCount: 456000,
    learnerCount: 234000,
    isLiked: true,
    isBookmarked: true,
    isCompleted: false,
    progress: 45,
    status: 'hot',
    createdAt: '2小时前',
  },
  // 金句
  {
    id: 2,
    type: 'quote',
    title: '江山就是人民，人民就是江山',
    subtitle: '习近平谈治国理政',
    source: '人民日报',
    author: '人民日报',
    duration: '3秒',
    category: '金句',
    tags: ['人民至上', '治国理政', '核心理念'],
    description: '党的二十大报告指出，人民是全面建设社会主义现代化国家的力量源泉。',
    keyPoint: '江山就是人民，人民就是江山。这是一切工作的出发点和落脚点。',
    knowledgePoints: [
      { text: '人民至上 — 把人民利益放在最高位置', highlight: true },
      { text: '江山 — 比喻国家政权和领土完整', highlight: false },
      { text: '党的一切工作都是为了人民的根本利益', highlight: true },
    ],
    likeCount: 256000,
    commentCount: 12000,
    viewCount: 890000,
    learnerCount: 456000,
    isLiked: false,
    isBookmarked: false,
    isCompleted: false,
    status: 'hot',
    createdAt: '4小时前',
  },
  // 卡片
  {
    id: 3,
    type: 'card',
    title: '2024年政府工作报告：十大关键数字',
    subtitle: 'GDP增长5%左右、城镇新增就业1200万人',
    source: '新华社',
    author: '新华社',
    duration: '3分钟阅读',
    category: '政策解读',
    tags: ['两会', '政府工作报告', '经济目标'],
    description: 'GDP增长5%左右、城镇新增就业1200万人以上、居民消费价格涨幅3%左右...',
    knowledgePoints: [
      { text: 'GDP目标：5%左右 — 体现稳中求进', highlight: true },
      { text: '就业目标：1200万+ — 民生之本', highlight: true },
      { text: 'CPI目标：3%左右 — 物价稳定', highlight: false },
    ],
    likeCount: 45600,
    commentCount: 2340,
    viewCount: 234000,
    learnerCount: 123000,
    isLiked: true,
    isBookmarked: true,
    isCompleted: false,
    status: 'new',
    createdAt: '6小时前',
  },
  // 信息图表
  {
    id: 4,
    type: 'infographic',
    title: '2023年经济社会发展成就',
    subtitle: '用数据说话',
    source: '国家统计局',
    author: '国家统计局',
    duration: '2分钟',
    category: '数据图表',
    tags: ['经济成就', '数据可视化', '年度回顾'],
    description: 'GDP突破126万亿元、粮食产量创新高、研发投入增长...',
    stats: [
      { label: 'GDP总量', value: '126万亿' },
      { label: '粮食产量', value: '13908亿斤' },
      { label: '研发投入', value: '3.21万亿' },
      { label: '居民收入', value: '+6.1%' },
    ],
    knowledgePoints: [
      { text: 'GDP总量突破126万亿 — 经济实力再上新台阶', highlight: true },
      { text: '粮食产量创历史新高 — 端牢中国饭碗', highlight: true },
      { text: '研发投入增长 — 创新驱动发展战略深入实施', highlight: false },
    ],
    likeCount: 67800,
    commentCount: 3450,
    viewCount: 345000,
    learnerCount: 178000,
    isLiked: false,
    isBookmarked: true,
    isCompleted: false,
    status: 'hot',
    createdAt: '1天前',
  },
  // 听书
  {
    id: 5,
    type: 'audio',
    title: '党章诵读：第一章 党员',
    subtitle: '逐字稿 + 音频伴读',
    source: '有声党课',
    author: '党员教育',
    duration: '5分钟',
    category: '党章学习',
    tags: ['党章', '党员标准', '有声学习'],
    description: '年满十八岁的中国工人、农民、军人、知识分子...',
    content: `年满十八岁的中国工人、农民、军人、知识分子和其他社会阶层的先进分子，承认党的纲领和章程，愿意参加党的一个组织并在其中积极工作、执行党的决议和按期交纳党费的，可以申请加入中国共产党。`,
    knowledgePoints: [
      { text: '入党条件：年满18岁、承认党章、愿意参加组织', highlight: true },
      { text: '党员标准：永远是劳动人民的普通一员', highlight: true },
      { text: '党员义务：不得谋求私利和特权', highlight: true },
    ],
    likeCount: 28900,
    commentCount: 1567,
    viewCount: 156000,
    learnerCount: 89000,
    isLiked: false,
    isBookmarked: true,
    isCompleted: false,
    status: 'new',
    createdAt: '1天前',
  },
  // 实务卡片
  {
    id: 6,
    type: 'card',
    title: '基层党建工作实务20讲',
    subtitle: '第1讲：三会一课规范流程',
    source: '党建工作实务',
    author: '党务专家',
    duration: '8分钟阅读',
    category: '实务',
    tags: ['三会一课', '基层党建', '实务'],
    description: '三会一课是党的组织生活的基本制度，是加强党员教育管理的重要途径。',
    knowledgePoints: [
      { text: '三会：支委会(每月)+党员大会(每季)+党小组会(每月)', highlight: true },
      { text: '一课：党课(每季度至少一次)', highlight: true },
    ],
    likeCount: 23400,
    commentCount: 1560,
    viewCount: 123000,
    learnerCount: 67000,
    isLiked: true,
    isBookmarked: true,
    isCompleted: false,
    relatedCourseId: 301,
    relatedCourse: '基层党建工作实务20讲',
    status: 'reading',
    createdAt: '2天前',
  },
  // 党史卡片
  {
    id: 7,
    type: 'card',
    title: '延安精神永放光芒',
    subtitle: '传承红色基因 赓续红色血脉',
    source: '求是网',
    author: '理论学习',
    duration: '6分钟阅读',
    category: '党史学习',
    tags: ['延安精神', '红色基因', '革命精神'],
    description: '延安精神是中国共产党人取之不尽、用之不竭的宝贵精神财富...',
    knowledgePoints: [
      { text: '坚定正确的政治方向 — 灵魂', highlight: true },
      { text: '解放思想、实事求是 — 精髓', highlight: true },
      { text: '全心全意为人民服务 — 宗旨', highlight: true },
    ],
    likeCount: 18900,
    commentCount: 1230,
    viewCount: 98000,
    learnerCount: 45000,
    isLiked: false,
    isBookmarked: false,
    isCompleted: false,
    status: 'new',
    createdAt: '2天前',
  },
  // 新发展理念
  {
    id: 8,
    type: 'quote',
    title: '新发展理念',
    subtitle: '创新、协调、绿色、开放、共享',
    source: '党的十九届五中全会',
    author: '中央党校',
    duration: '海报',
    category: '时政',
    tags: ['新发展理念', '五大理念', '发展指南'],
    description: '坚持创新、协调、绿色、开放、共享的新发展理念。',
    keyPoint: '创新是第一动力，协调是内生特点，绿色是普遍形态，开放是必由之路，共享是根本目的。',
    knowledgePoints: [
      { text: '创新 — 发展第一动力', highlight: true },
      { text: '协调 — 解决发展不平衡', highlight: false },
      { text: '绿色 — 人与自然和谐共生', highlight: false },
    ],
    likeCount: 89000,
    commentCount: 5600,
    viewCount: 456000,
    learnerCount: 234000,
    isLiked: true,
    isBookmarked: true,
    isCompleted: false,
    status: 'hot',
    createdAt: '3天前',
  },
  // 党纪
  {
    id: 9,
    type: 'card',
    title: '中国共产党纪律处分条例解读',
    subtitle: '第1集：总则与六大纪律',
    source: '中央纪委',
    author: '中央纪委',
    duration: '12分钟',
    category: '党纪',
    tags: ['党纪', '条例', '纪律建设'],
    description: '新修订的《中国共产党纪律处分条例》深入解读...',
    knowledgePoints: [
      { text: '六大纪律：政治、组织、廉洁、群众、工作、生活纪律', highlight: true },
    ],
    likeCount: 34500,
    commentCount: 2340,
    viewCount: 189000,
    learnerCount: 98000,
    isLiked: false,
    isBookmarked: true,
    isCompleted: false,
    progress: 30,
    relatedCourseId: 401,
    relatedCourse: '党纪处分条例解读',
    status: 'reading',
    createdAt: '1周前',
  },
  // 发展党员
  {
    id: 10,
    type: 'card',
    title: '发展党员工作流程详解',
    subtitle: '从申请到转正全流程25个步骤',
    source: '组织工作',
    author: '组织部',
    duration: '10分钟阅读',
    category: '实务',
    tags: ['党员发展', '组织工作', '流程'],
    description: '发展党员工作的25个步骤详解...',
    knowledgePoints: [
      { text: '五个阶段：申请→积极分子→发展对象→预备党员→转正', highlight: true },
      { text: '25个步骤：严格程序、保证质量', highlight: true },
    ],
    likeCount: 34500,
    commentCount: 2340,
    viewCount: 198000,
    learnerCount: 112000,
    isLiked: false,
    isBookmarked: true,
    isCompleted: false,
    status: 'new',
    createdAt: '2周前',
  },
];

// 今日热点数据
const hotContents: HotItem[] = [
  { id: 1, title: '"两个确立"决定性意义', type: '理论', rank: 1 },
  { id: 2, title: '政府工作报告要点', type: '时政', rank: 2 },
  { id: 3, title: '新质生产力解读', type: '经济', rank: 3 },
  { id: 4, title: '延安精神', type: '党史', rank: 4 },
  { id: 5, title: '党章第一章', type: '党章', rank: 5 },
];

// 课程树数据
const courseTree = [
  {
    id: 1,
    title: '党的二十大精神',
    icon: Sparkles,
    progress: 75,
    chapters: [
      { id: 1, title: '大会主题与重要意义', completed: true },
      { id: 2, title: '两个确立', completed: true },
      { id: 3, title: '中国式现代化', completed: true },
      { id: 4, title: '高质量发展', completed: false },
      { id: 5, title: '全面从严治党', completed: false },
    ]
  },
  {
    id: 2,
    title: '党章学习专题',
    icon: BookOpen,
    progress: 40,
    chapters: [
      { id: 6, title: '党员条件', completed: true },
      { id: 7, title: '党员义务', completed: true },
      { id: 8, title: '组织制度', completed: false },
    ]
  },
  {
    id: 3,
    title: '基层党务实务',
    icon: Layers3,
    progress: 20,
    chapters: [
      { id: 9, title: '三会一课', completed: true },
      { id: 10, title: '发展党员', completed: false },
      { id: 11, title: '组织生活会', completed: false },
    ]
  },
  {
    id: 4,
    title: '党纪党规',
    icon: Target,
    progress: 15,
    chapters: [
      { id: 12, title: '纪律处分条例', completed: false },
      { id: 13, title: '廉洁自律准则', completed: false },
    ]
  },
];

// 精选头条组件
function FeaturedCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={onClick}>
      <div className="h-48 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <Badge className="mb-3 bg-white/20 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              精选头条
            </Badge>
            <h2 className="text-2xl font-bold mb-2 leading-tight">{item.title}</h2>
            <p className="text-white/80 text-sm line-clamp-2">{item.subtitle}</p>
          </div>
        </div>
        {item.status === 'hot' && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-0">
            <Flame className="h-3 w-3 mr-1" />
            热门
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">{item.author.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{item.source}</span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{item.createdAt}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {item.viewCount >= 1000 ? `${(item.viewCount/1000).toFixed(0)}w` : item.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(0)}w` : item.likeCount}
            </span>
          </div>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <BookOpen className="h-3 w-3 mr-1" />
            阅读
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 内容卡片组件
function ContentCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:border-orange-200" onClick={onClick}>
      <CardContent className="p-4">
        {/* 顶部：标签 + 状态 */}
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
            {item.category}
          </Badge>
          <div className="flex items-center gap-2">
            {item.status === 'hot' && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                <Flame className="h-3 w-3 mr-1" />
                热门
              </Badge>
            )}
            {item.status === 'new' && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                新
              </Badge>
            )}
            {item.status === 'reading' && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                <Clock3 className="h-3 w-3 mr-1" />
                在学
              </Badge>
            )}
          </div>
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{item.subtitle}</p>
        )}

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.viewCount >= 1000 ? `${(item.viewCount/1000).toFixed(0)}w` : item.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.learnerCount >= 1000 ? `${(item.learnerCount/1000).toFixed(0)}w` : item.learnerCount}人学
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{item.duration}</span>
        </div>

        {/* 进度条 */}
        {item.progress !== undefined && item.progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">学习进度</span>
              <span className="text-orange-600 font-medium">{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-amber-500" />
          </div>
        )}

        {/* 关联课程 */}
        {item.relatedCourse && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers3 className="h-3 w-3" />
              <span>所属课程：{item.relatedCourse}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 左侧栏：课程树
function CourseTreeSidebar() {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-orange-500" />
          学习体系
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {courseTree.map((course) => {
            const Icon = course.icon;
            const isExpanded = expandedId === course.id;
            return (
              <div key={course.id} className="mb-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : course.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isExpanded ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isExpanded ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={course.progress} className="flex-1 h-1 [&>div]:bg-orange-500" />
                      <span className="text-xs text-muted-foreground">{course.progress}%</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-orange-100 pl-3">
                    {course.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          chapter.completed 
                            ? 'text-green-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {chapter.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={chapter.completed ? 'line-through' : ''}>{chapter.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// 右侧栏：数据仪表盘
function DashboardSidebar() {
  const [aiQuestion, setAiQuestion] = useState('');
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 今日热点 */}
      <Card className="m-3 mb-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            今日热点
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {hotContents.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  item.rank <= 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{item.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学习统计 */}
      <Card className="m-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-500" />
            我的学习
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-xs text-muted-foreground">学习天数</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">3.5h</p>
              <p className="text-xs text-muted-foreground">本周学习</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-xs text-muted-foreground">完成课程</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">23</p>
              <p className="text-xs text-muted-foreground">收藏内容</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 待学任务 */}
      <Card className="m-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            待学任务
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-sm">二十大精神</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">必修</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm">党章学习</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">进行中</Badge>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span className="text-sm text-muted-foreground">基层实务</span>
              </div>
              <Badge variant="secondary" className="text-xs">选学</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI助手 */}
      <Card className="m-3 mt-auto border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Bot className="h-4 w-4 text-orange-500" />
            AI学习助手
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              有什么不懂的？问问AI助手
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="输入问题..." 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button size="icon" className="bg-orange-500 hover:bg-orange-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-orange-50 border-orange-200">两个确立</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-orange-50 border-orange-200">党章</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-orange-50 border-orange-200">三会一课</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 阅读弹窗
function ReadingModal({ item, isOpen, onClose }: { item: ContentItem | null; isOpen: boolean; onClose: () => void }) {
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  
  if (!item || !isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 lg:p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-h-full md:max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs md:text-sm">{item.category}</Badge>
            <Badge variant="secondary" className="text-xs md:text-sm hidden sm:inline-flex">{item.duration}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowNote(!showNote)}>
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline">笔记</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 主内容区 - 可滚动 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            {/* 标题 */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{item.title}</h1>
            {item.subtitle && <p className="text-base md:text-lg text-muted-foreground mb-4">{item.subtitle}</p>}
            
            {/* 作者信息 */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-red-100 text-red-600">{item.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.source} · {item.createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{item.viewCount >= 1000 ? `${(item.viewCount/1000).toFixed(0)}w` : item.viewCount}</span>
                <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(0)}w` : item.likeCount}</span>
              </div>
            </div>
            
            {/* 知识点 - 固定在顶部或浮动 */}
            <Card className="mb-6 bg-amber-50 border-amber-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-sm text-amber-800">核心知识点</span>
                </div>
                <ul className="space-y-1 md:space-y-2">
                  {item.knowledgePoints.filter(k => k.highlight).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{point.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* 正文 */}
            <div className="prose prose-base md:prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {item.content || item.description}
              </div>
            </div>
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-red-50 text-red-700 text-xs md:text-sm">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            {/* 笔记区域 - 可展开 */}
            {showNote && (
              <Card className="mt-6 bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    学习笔记
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea 
                    placeholder="记录你的学习心得..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[80px] md:min-h-[100px] text-sm"
                  />
                  <Button className="mt-2 bg-red-600 hover:bg-red-700 text-sm" size="sm">
                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    保存笔记
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* 底部留白 - 确保内容不被遮挡 */}
            <div className="h-20 md:h-32" />
          </div>
        </div>
        
        {/* 底部固定操作栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden md:flex items-center gap-1"><Users className="h-4 w-4" />{item.learnerCount >= 1000 ? `${(item.learnerCount/1000).toFixed(0)}w` : item.learnerCount}人学习</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{item.commentCount >= 1000 ? `${(item.commentCount/1000).toFixed(0)}w` : item.commentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{item.isLiked ? '已赞' : '点赞'}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">{item.isBookmarked ? '已收藏' : '收藏'}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  // 首次访问检测 - 必须在顶部调用
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  // 主站状态 - 必须在顶部调用（Hooks不能在条件返回之后调用）
  const [contents, setContents] = useState<ContentItem[]>(allContents);
  const [featuredContent, setFeaturedContent] = useState<ContentItem | null>(allContents[0]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // 检查是否已完成引导
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    setHasCompletedOnboarding(completed === 'true');
  }, []);
  
  // 完成引导的回调
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };
  
  // 显示加载状态，避免闪烁
  if (hasCompletedOnboarding === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 首次访问：显示引导页
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
  
  // 已完成引导：显示主站首页
  const categories = [
    { id: 'all', name: '全部', icon: Layers3 },
    { id: 'theory', name: '理论', icon: BookOpen },
    { id: 'politics', name: '时政', icon: TrendingUp },
    { id: 'party', name: '党史', icon: Star },
    { id: 'practice', name: '实务', icon: Target },
  ];
  
  const filteredContents = activeCategory === 'all' 
    ? contents.filter(c => c.id !== 1) // 排除头条
    : contents.filter(c => {
        if (activeCategory === 'theory') return c.category.includes('理论') || c.category === '金句';
        if (activeCategory === 'politics') return c.category.includes('时政') || c.category === '政策解读';
        if (activeCategory === 'party') return c.category.includes('党史') || c.category === '党章';
        if (activeCategory === 'practice') return c.category === '实务' || c.category === '党纪';
        return true;
      });
  
  const handleReadContent = (item: ContentItem) => {
    setSelectedContent(item);
    setIsReadingModalOpen(true);
  };
  
  const handleLike = (id: number) => {
    setContents(prev => prev.map(item => 
      item.id === id ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1 } : item
    ));
  };
  
  const handleBookmark = (id: number) => {
    setContents(prev => prev.map(item => 
      item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* 顶部横幅区域 */}
      <div className="relative overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50" />
        
        {/* 内容层 */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center">
          {/* 欢迎角色 */}
          <img 
            src="/welcome-character.png" 
            alt="欢迎" 
            className="h-32 w-auto object-contain mb-4"
          />
          
          {/* 欢迎文字 */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎来到全省统一战线网络学院</h1>
          <p className="text-gray-600 text-lg mb-6">开启您的党建学习之旅</p>
          
          {/* 搜索框 - 参考样式 */}
          <div className="relative w-full max-w-xl flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-orange-500" />
            </div>
            <input 
              type="text"
              placeholder="需要我帮您查点什么..."
              className="w-full pl-12 pr-24 py-4 rounded-full border-2 border-orange-400 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-lg transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all">
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* 左侧栏：课程树 */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-hidden">
          <CourseTreeSidebar />
        </aside>
	
        {/* 中间栏：内容流 */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* 分类筛选 */}
          <div className="flex items-center gap-2 mb-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.id 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* 精选头条 */}
          {featuredContent && activeCategory === 'all' && (
            <div className="mb-6">
              <FeaturedCard item={featuredContent} onClick={() => handleReadContent(featuredContent)} />
            </div>
          )}

          {/* 内容列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContents.map((item) => (
              <div key={item.id} className="relative">
                <ContentCard item={item} onClick={() => handleReadContent(item)} />
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
                  >
                    <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-orange-500 text-orange-500' : ''}`} />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); handleBookmark(item.id); }}
                  >
                    <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 加载更多 */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              加载更多
            </Button>
          </div>
        </main>

        {/* 右侧栏：数据仪表盘 */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-hidden">
          <DashboardSidebar />
        </aside>
      </div>

      {/* 阅读弹窗 */}
      <ReadingModal 
        item={selectedContent} 
        isOpen={isReadingModalOpen} 
        onClose={() => setIsReadingModalOpen(false)} 
      />
    </div>
  );
}
