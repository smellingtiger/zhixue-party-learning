'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding-flow';
import { useAuth } from '@/lib/auth';
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
  CheckCircle,
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
  Layers3,
  Map
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MindMap from '@/components/mind-map';
import { partyKnowledgeGraph, generateLearningPath, getNodeById } from '@/lib/knowledge-graph';
import type { KnowledgeNode, LearningProgress } from '@/lib/types';

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
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">{item.author.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{item.source}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{item.createdAt}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {item.viewCount >= 1000 ? `${(item.viewCount/1000).toFixed(0)}w` : item.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(0)}w` : item.likeCount}
            </span>
          </div>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
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
            <Badge key={tag} variant="secondary" className="text-xs bg-orange-50 text-orange-700">
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

        {/* 跳转到视频按钮 */}
        <div className="mt-3">
          <a 
            href={`/course/${item.id}`} 
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4" />
            跳转到对应视频
          </a>
        </div>

        {/* 关联课程 */}
        {item.relatedCourse && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers3 className="h-3 w-3" />
              <span>所属课程：{item.relatedCourse}</span>
            </div>
          </div>
        )}

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

        {/* AI生成标识 */}
        <div className="mt-3 text-right">
          <span className="text-xs text-gray-400">该文案由AI生成</span>
        </div>
      </CardContent>
    </Card>
  );
}

// 知识图谱树节点组件
function TreeNode({ node, depth, expandedNodes, onToggle, onSelectNode, selectedNodeId, progress = [] }: { 
  node: KnowledgeNode; 
  depth: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelectNode?: (nodeId: string, nodeName: string) => void;
  selectedNodeId?: string;
  progress?: LearningProgress[];
}) {
  const hasChildren = node.children && node.children.length > 0;
  const hasCourses = node.courses && node.courses.length > 0;
  const hasContent = node.content !== undefined;
  const isExpanded = expandedNodes.has(node.id);

  // 判断课程是否已完成
  const isCourseCompleted = (nodeId: string, courseId: string) => {
    const prog = progress.find(p => p.nodeId === nodeId);
    return prog?.completedCourses?.includes(courseId) || false;
  };

  // 根节点：可点击，显示所有内容
  if (node.level === 0) {
    return (
      <div className="py-1">
        <button
          onClick={() => {
            onSelectNode?.(node.id, node.name);
          }}
          className={`w-full flex items-center gap-2.5 px-4 py-3 text-[18px] font-semibold transition-colors mb-3 ${selectedNodeId === node.id ? 'bg-orange-100 text-orange-700 rounded-lg' : 'text-gray-700 hover:bg-gray-50 rounded-lg'}`}
        >
          <Layers3 className="h-5 w-5 text-orange-500 shrink-0" />
          <span>{node.name}</span>
          <span className="text-[14px] text-gray-400 ml-auto">{node.children?.length || 0}个模块</span>
        </button>
        {node.children?.map(child => (
          <TreeNode key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} onToggle={onToggle} onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} progress={progress} />
        ))}
      </div>
    );
  }

  // Level 1：知识模块
  if (node.level === 1) {
    return (
      <div key={node.id} className="mb-1.5">
        <div className={`w-full flex items-center gap-2.5 px-4 py-3 text-[18px] font-semibold transition-colors ${
          selectedNodeId === node.id
            ? 'bg-orange-100 text-orange-700 rounded-lg'
            : 'text-gray-700 hover:bg-gray-50 rounded-lg'
        }`}>
          <button
            onClick={() => {
              // 点击图标时，展开/折叠当前节点
              onToggle(node.id);
            }}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className={`h-5 w-5 transition-transform shrink-0 text-gray-400 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => {
              onSelectNode?.(node.id, node.name);
            }}
            className="flex-1 text-left"
          >
            <span>{node.name}</span>
          </button>
          <span className="text-[14px] text-gray-400 ml-auto">{hasChildren ? node.children!.length + '个分类' : ''}</span>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children?.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} onToggle={onToggle} onSelectNode={onSelectNode} selectedNodeId={selectedNodeId} progress={progress} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 2：中间节点（课程分类）- 可展开，展示 courses[] 中的课程
  if (node.level === 2) {
    if (hasCourses) {
      return (
        <div key={node.id} className="mb-1">
          <div className="w-full flex items-center gap-2 px-4 py-2.5 text-[16px] font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <button
              onClick={() => {
                onToggle(node.id);
              }}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className={`h-4 w-4 transition-transform shrink-0 text-gray-400 ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            <button
              onClick={() => {
                onSelectNode?.(node.id, node.name);
              }}
              className="flex-1 text-left"
            >
              <span>{node.name}</span>
            </button>
            <span className="text-[13px] text-gray-400 ml-auto">{node.courses!.length}门课</span>
          </div>
          {isExpanded && (
            <div className="space-y-1 mt-1">
              {node.courses!.map((course) => {
                const completed = isCourseCompleted(node.id, course.id);
                return (
                  <a
                    key={course.id}
                    href={`/course/${course.id}`}
                    className={`flex items-center gap-3 px-4 py-3 mx-3 rounded-xl cursor-pointer transition-all group ${
                      completed
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'bg-gray-50 hover:bg-orange-50'
                    }`}
                    title={course.title}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
                      completed
                        ? 'bg-green-500'
                        : 'bg-gradient-to-br from-orange-400 to-amber-400'
                    }`}>
                      {completed ? (
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-white ml-0.5" />
                      )}
                    </div>
                    <span className={`flex-1 break-words text-[16px] font-medium min-w-0 leading-snug ${
                      completed ? 'text-green-700' : 'text-gray-700'
                    }`}>{course.title}</span>
                    <span className="text-[14px] text-gray-500 shrink-0">{course.duration}分钟</span>
                    {completed && (
                      <span className="text-[12px] text-green-600 shrink-0 font-medium">已完成</span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // 没有 courses 但有 content 的节点，直接显示为课程
    if (hasContent) {
      return (
        <a
          href={`/course/${node.id}`}
          className="flex items-center gap-3 px-4 py-3 mx-3 my-1 rounded-xl cursor-pointer transition-all bg-gray-50 hover:bg-orange-50 group"
          title={node.content!.title}
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Play className="h-4 w-4 text-white ml-0.5" />
          </div>
          <span className="flex-1 break-words text-[16px] text-gray-700 font-medium min-w-0 leading-snug">{node.content!.title}</span>
          <span className="text-[14px] text-gray-400 shrink-0">{node.content!.duration}分钟</span>
        </a>
      );
    }

    return null;
  }

  // 其他节点
  return null;
}

// 左侧栏：知识图谱
function KnowledgeGraphSidebar({ expanded, onClose, onSelectNode, userLearningPath, diagnosticData }: { expanded: boolean; onClose: () => void; onSelectNode?: (nodeId: string, nodeName: string) => void; userLearningPath: any; diagnosticData: { roles: string[]; topics: string[]; difficulty: string } | null }) {
  const [showDiagnostic, setShowDiagnostic] = useState(true);
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);

  // 从localStorage读取学习进度
  useEffect(() => {
    const saved = localStorage.getItem('learning_progress');
    if (saved) {
      try {
        setLearningProgress(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // 监听storage变化，实时更新进度
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('learning_progress');
      if (saved) {
        try {
          setLearningProgress(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // 也监听自定义事件（同页面内更新）
    window.addEventListener('learningProgressUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('learningProgressUpdated', handleStorageChange);
    };
  }, []);

  // 展开/折叠节点，默认全部展开
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    
    // 递归收集所有节点ID
    const collectNodeIds = (node: KnowledgeNode) => {
      initial.add(node.id);
      if (node.children) {
        node.children.forEach(child => collectNodeIds(child));
      }
    };
    
    // 收集所有节点ID，默认全部展开
    collectNodeIds(userLearningPath.rootNode);
    return initial;
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    // 初始化默认选中根节点
    return userLearningPath?.rootNode?.id || '';
  });

  // 刚完成诊断跳转过来时，默认选中根节点
  useEffect(() => {
    const justCompleted = localStorage.getItem('just_completed_onboarding');
    if (justCompleted === 'true' && userLearningPath?.rootNode) {
      // 选中根节点
      setSelectedNodeId(userLearningPath.rootNode.id);
      onSelectNode?.(userLearningPath.rootNode.id, userLearningPath.rootNode.name);
      // 清除标记
      localStorage.removeItem('just_completed_onboarding');
    }
  }, [userLearningPath, onSelectNode]);

  // 处理节点选择
  const handleNodeSelect = (nodeId: string, nodeName: string) => {
    setSelectedNodeId(nodeId);
    onSelectNode?.(nodeId, nodeName);
  };

  const handleToggle = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const diffLabel = userLearningPath.difficulty === 'beginner' ? '入门' : userLearningPath.difficulty === 'intermediate' ? '进阶' : '深入';
  const hasDiagnostic = true;

  return (
    <div className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0 ${expanded ? 'w-72' : 'w-0 overflow-hidden'}`}>
      {/* 顶部 Logo 区域 */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-gray-800" style={{ fontFamily: 'Noto Serif SC, serif' }}>精英在线智能学习平台</h2>
            <p className="text-[15px] text-gray-500">知识图谱 · {diffLabel}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="mx-5 border-t border-gray-100 shrink-0" />

      {/* 个性化诊断结果面板 */}
      <div className="px-5 py-3 shrink-0">
        <button
          onClick={() => setShowDiagnostic(!showDiagnostic)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:from-orange-100 hover:to-amber-100 transition-colors text-left"
        >
          <Sparkles className="h-5 w-5 text-orange-500 shrink-0" />
          <span className="flex-1 text-[18px] font-semibold text-gray-700">个性化诊断结果</span>
          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${showDiagnostic ? 'rotate-90' : ''}`} />
        </button>
        {showDiagnostic && (
          <div className="mt-3 space-y-2.5 pl-1">
            {/* 诊断选择记录 */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-[16px] font-medium text-gray-700 mb-2">您的诊断选择</p>
              <div className="space-y-2">
                {diagnosticData?.roles && diagnosticData.roles.length > 0 && (
                  <div>
                    <p className="text-[14px] text-gray-500 mb-1">身份选择</p>
                    <div className="flex flex-wrap gap-1.5">
                      {diagnosticData.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-[14px] bg-red-100 text-red-700 border-0 px-3 py-1">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {diagnosticData?.topics && diagnosticData.topics.length > 0 && (
                  <div>
                    <p className="text-[14px] text-gray-500 mb-1">学习主题</p>
                    <div className="flex flex-wrap gap-1.5">
                      {diagnosticData.topics.map(topic => (
                        <Badge key={topic} variant="secondary" className="text-[14px] bg-blue-100 text-blue-700 border-0 px-3 py-1">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {diagnosticData?.difficulty && (
                  <div>
                    <p className="text-[14px] text-gray-500 mb-1">难度选择</p>
                    <Badge variant="secondary" className="text-[14px] bg-green-100 text-green-700 border-0 px-3 py-1">
                      {diagnosticData.difficulty === 'beginner' ? '入门级' : diagnosticData.difficulty === 'intermediate' ? '进阶级' : '精通级'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
              <p className="text-[16px] font-medium text-purple-700 mb-1.5">推荐原因</p>
              <p className="text-[16px] text-purple-600 leading-relaxed">
                根据您选择的身份和感兴趣的主题，系统为您匹配了以下{userLearningPath.rootNode.children?.length || 0}个知识模块，共{userLearningPath.totalDuration}分钟的学习内容。
              </p>
              <Button 
                className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90" 
                onClick={() => {
                  const saved = localStorage.getItem('learning_progress');
                  if (saved) {
                    try { setLearningProgress(JSON.parse(saved)); } catch { /* ignore */ }
                  }
                  setShowMindMapModal(true);
                }}
              >
                <Map className="h-4 w-4 mr-2" />
                查看诊断结果图谱
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <div className="mx-5 border-t border-gray-100 shrink-0" />

      {/* 树形内容区域 */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="py-2">
          <TreeNode node={userLearningPath.rootNode} depth={0} expandedNodes={expandedNodes} onToggle={handleToggle} onSelectNode={handleNodeSelect} selectedNodeId={selectedNodeId} progress={learningProgress} />
        </div>
      </ScrollArea>
      {/* 诊断结果图谱弹框 */}
      <Dialog open={showMindMapModal} onOpenChange={setShowMindMapModal}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full p-0" style={{ minWidth: '800px', minHeight: '600px' }} aria-describedby="mindmap-description">
          <DialogHeader className="px-6 pt-6 pb-3 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              <Map className="h-6 w-6 text-blue-500" />
              个人诊断结果图谱
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100">
            <MindMap 
              data={userLearningPath.rootNode}
              progress={learningProgress}
              interactive={false}
            />
            <div id="mindmap-description" className="sr-only">
              个人诊断结果图谱展示了基于您的身份和学习主题生成的个性化学习路径，包含知识模块和学习时长信息。
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
            
            {/* 跳转到视频按钮 */}
            <div className="mt-6">
              <a 
                href={`/course/${item.id}`} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Play className="h-4 w-4" />
                跳转到对应视频
              </a>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-red-50 text-red-700 text-xs md:text-sm">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* AI生成标识 */}
            <div className="mt-4 text-right">
              <span className="text-xs text-gray-400">该文案由AI生成</span>
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
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // 首次访问检测 - 必须在顶部调用
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  // 主站状态 - 必须在顶部调用（Hooks不能在条件返回之后调用）
  const [contents, setContents] = useState<ContentItem[]>(allContents);
  const [featuredContent, setFeaturedContent] = useState<ContentItem | null>(allContents[0]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [selectedNodeName, setSelectedNodeName] = useState<string>('');
  
  // 从localStorage读取诊断数据
  const [diagnosticData, setDiagnosticData] = useState<{ roles: string[]; topics: string[]; difficulty: string } | null>(null);
  
  // 检查登录状态
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // 检查是否已完成引导
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    setHasCompletedOnboarding(completed === 'true');
  }, []);
  
  // 页面加载时滚动到顶部
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  // 从localStorage读取诊断数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_diagnostic');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDiagnosticData({
          roles: parsed.roles || [],
          topics: parsed.topics || [],
          difficulty: parsed.difficulty || 'intermediate',
        });
      }
    } catch {
      // ignore
    }
  }, []);
  
  // 生成学习路径
  const userLearningPath = useMemo(() => {
    return generateLearningPath({
      roles: diagnosticData?.roles || ['普通党员'],
      topics: diagnosticData?.topics || ['二十大精神', '党章党规'],
      level: diagnosticData?.difficulty || 'intermediate',
    });
  }, [diagnosticData]);

  // 页面加载完成后，默认选中根节点
  useEffect(() => {
    if (userLearningPath?.rootNode) {
      const rootNodeId = userLearningPath.rootNode.id;
      setSelectedNodeId(rootNodeId);
      setSelectedNodeName(userLearningPath.rootNode.name);
      setActiveCategory('all');
    }
  }, [userLearningPath]);
  
  // 动态生成分类按钮，规则：点击节点的下一级节点作为分类，末级节点不进行分类
  const generateCategories = () => {
    const baseCategories = [{ id: 'all', name: '完整', icon: Layers3 }];
    
    // 从用户学习路径中查找当前节点
    const findNodeInLearningPath = (currentNode: KnowledgeNode): KnowledgeNode | null => {
      if (currentNode.id === selectedNodeId) return currentNode;
      if (currentNode.children) {
        for (const child of currentNode.children) {
          const found = findNodeInLearningPath(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    // 从用户学习路径中查找当前节点
    const currentNode = findNodeInLearningPath(userLearningPath.rootNode);
    
    // 如果当前节点有子节点，将子节点作为分类
    if (currentNode && currentNode.children && currentNode.children.length > 0) {
      // 遍历用户学习路径中的子节点
      currentNode.children.forEach(child => {
        // 对于 Level 1 节点（知识模块），总是作为分类显示（与左侧树结构一致）
        // 对于 Level 2+ 节点，只添加有子节点或课程的节点作为分类
        const isLevel1 = child.level === 1;
        const hasChildren = child.children && child.children.length > 0;
        const hasCourses = child.courses && child.courses.length > 0;
        const hasContent = child.content !== undefined;
        
        if (isLevel1 || hasChildren || hasCourses || hasContent) {
          baseCategories.push({
            id: child.id,
            name: child.name,
            icon: child.id.includes('basics') || child.id.includes('theory') || child.name.includes('理论') || child.name.includes('党章') ? BookOpen : Target
          });
        }
      });
    }
    
    return baseCategories;
  };
  
  const categories = useMemo(() => {
    return generateCategories();
  }, [userLearningPath, selectedNodeId]);
  
  // 从知识图谱中提取内容
  const extractContentsFromGraph = (node: KnowledgeNode): ContentItem[] => {
    const contents: ContentItem[] = [];
    
    // 如果节点有 courses，转换为 ContentItem
    if (node.courses) {
      node.courses.forEach((course, index) => {
        contents.push({
          id: parseInt(course.id),
          type: 'card',
          title: course.title,
          subtitle: '详细讲解',
          source: '精英在线智能学习平台',
          author: '精英在线智能学习平台',
          duration: course.duration + '分钟',
          category: node.name,
          tags: node.keyPoints || [],
          description: `关于${course.title}的详细讲解`,
          content: `关于${course.title}的详细讲解内容`,
          knowledgePoints: node.keyPoints?.map(point => ({ text: point, highlight: true })) || [],
          likeCount: Math.floor(Math.random() * 10000),
          commentCount: Math.floor(Math.random() * 1000),
          viewCount: Math.floor(Math.random() * 100000),
          learnerCount: Math.floor(Math.random() * 50000),
          isLiked: false,
          isBookmarked: false,
          isCompleted: false,
          createdAt: '3天前'
        });
      });
    }
    
    // 递归处理子节点，提取所有子节点的内容
    if (node.children) {
      node.children.forEach(child => {
        const childContents = extractContentsFromGraph(child);
        contents.push(...childContents);
      });
    }
    
    return contents;
  };
  
  const filteredContentsByCategory = useMemo(() => {
    // 查找当前选中的节点
    const findNode = (currentNode: KnowledgeNode, targetId: string): KnowledgeNode | null => {
      if (currentNode.id === targetId) return currentNode;
      if (currentNode.children) {
        for (const child of currentNode.children) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    if (activeCategory === 'all') {
      // 完整分类：显示当前选中节点及其子节点的所有内容
      if (selectedNodeId) {
        const currentNode = findNode(userLearningPath.rootNode, selectedNodeId);
        if (currentNode) {
          return extractContentsFromGraph(currentNode);
        }
      }
      // 如果没有选中节点，显示所有内容
      return extractContentsFromGraph(userLearningPath.rootNode);
    } else {
      // 其他分类：查找对应的节点并提取内容
      const targetNode = findNode(userLearningPath.rootNode, activeCategory);
      if (targetNode) {
        return extractContentsFromGraph(targetNode);
      } else {
        return [];
      }
    }
  }, [userLearningPath, activeCategory, selectedNodeId]);
  
  // 调试：查看 userLearningPath 结构
  console.log('userLearningPath:', userLearningPath);

  // 处理节点选择
  const handleNodeSelect = (nodeId: string, nodeName: string) => {
    setSelectedNodeId(nodeId);
    setSelectedNodeName(nodeName);
    
    // 查找当前节点
    const findNode = (currentNode: KnowledgeNode): KnowledgeNode | null => {
      if (currentNode.id === nodeId) return currentNode;
      if (currentNode.children) {
        for (const child of currentNode.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    const currentNode = findNode(userLearningPath.rootNode);
    
    // 更新右侧分类选中状态
    // 如果当前节点是根节点，选中完整分类
    // 如果当前节点有子节点，默认选中第一个有课程或内容的子节点
    // 如果当前节点没有子节点，选中完整分类
    if (nodeId === userLearningPath.rootNode.id) {
      setActiveCategory('all');
    } else if (currentNode && currentNode.children && currentNode.children.length > 0) {
      const firstValidChild = currentNode.children.find(child => {
        const hasChildren = child.children && child.children.length > 0;
        const hasCourses = child.courses && child.courses.length > 0;
        const hasContent = child.content !== undefined;
        return hasChildren || hasCourses || hasContent;
      });
      if (firstValidChild) {
        setActiveCategory(firstValidChild.id);
      } else {
        setActiveCategory('all');
      }
    } else {
      setActiveCategory('all');
    }
    
    if (currentNode) {
      // 提取当前节点及其子节点的内容
      const contents: ContentItem[] = [];
      
      // 递归遍历节点，提取所有内容
      const traverse = (node: KnowledgeNode) => {
        // 提取当前节点的内容
        const nodeContents = extractContentsFromGraph(node);
        contents.push(...nodeContents);
        
        // 递归处理子节点
        if (node.children) {
          node.children.forEach(child => traverse(child));
        }
      };
      
      traverse(currentNode);
      
      // 查找与节点相关的内容作为精选头条
      if (contents.length > 0) {
        setFeaturedContent(contents[0]);
      }
    } else if (nodeId === 'root') {
      // 根节点：使用第一个内容项作为精选头条
      const contents: ContentItem[] = [];
      
      // 递归遍历所有节点，提取所有内容
      const traverse = (node: KnowledgeNode) => {
        // 提取当前节点的内容
        const nodeContents = extractContentsFromGraph(node);
        contents.push(...nodeContents);
        
        // 递归处理子节点
        if (node.children) {
          node.children.forEach(child => traverse(child));
        }
      };
      
      traverse(userLearningPath.rootNode);
      
      if (contents.length > 0) {
        setFeaturedContent(contents[0]);
      }
    }
  };

  // 初始化默认选中
  useEffect(() => {
    if (userLearningPath.rootNode.children && userLearningPath.rootNode.children.length > 0) {
      const firstNode = userLearningPath.rootNode.children[0];
      setSelectedNodeId(firstNode.id);
      setSelectedNodeName(firstNode.name);
      
      // 初始化activeCategory
      if (firstNode.children && firstNode.children.length > 0) {
        const firstValidChild = firstNode.children.find(child => (child.courses && child.courses.length > 0) || child.content);
        if (firstValidChild) {
          setActiveCategory(firstValidChild.id);
        } else {
          setActiveCategory('all');
        }
      } else {
        setActiveCategory('all');
      }
      
      // 初始化时也更新精选内容
      const relatedContent = allContents.find(item => {
        if (item.category.includes(firstNode.name) || firstNode.name.includes(item.category)) {
          return true;
        }
        if (item.tags.some(tag => firstNode.name.includes(tag) || tag.includes(firstNode.name))) {
          return true;
        }
        if (item.title.includes(firstNode.name) || (item.subtitle && item.subtitle.includes(firstNode.name))) {
          return true;
        }
        return false;
      });
      
      if (relatedContent) {
        setFeaturedContent(relatedContent);
      }
    }
  }, []);
  
  // 完成引导的回调
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('just_completed_onboarding', 'true');
    setHasCompletedOnboarding(true);
    
    // 触发引导完成事件，通知导航栏更新状态
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('onboardingCompleted'));
    }
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
    <div className="flex flex-1 overflow-hidden relative">
      {/* 左侧：知识图谱 */}
      <KnowledgeGraphSidebar 
        expanded={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}  
        onSelectNode={handleNodeSelect}
        userLearningPath={userLearningPath}
        diagnosticData={diagnosticData}
      />
      
      {/* 展开/收起按钮 */}
      {!isKnowledgeGraphOpen && (
        <div className="absolute left-0 top-20 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-r-lg rounded-l-none shadow-md bg-white border border-l-0 border-gray-200 hover:bg-orange-50 h-12 group relative"
            onClick={() => setIsKnowledgeGraphOpen(true)}
          >
            <Layers3 className="h-4 w-4 text-orange-500" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              知识图谱
            </span>
          </Button>
        </div>
      )}

      {/* 内容流 */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-orange-50/50 to-white">
          {/* 选中模块标题 */}
          {selectedNodeName && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-orange-500" />
                {selectedNodeName}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2" />
            </div>
          )}
          
          {/* 分类筛选 */}
          <div className="flex items-center gap-2 mb-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  
                  // 直接使用分类的id作为目标节点ID
                  const targetNodeId = cat.id === 'all' ? selectedNodeId || 'root' : cat.id;
                  
                  // 查找目标节点
                  const findNode = (currentNode: KnowledgeNode): KnowledgeNode | null => {
                    if (currentNode.id === targetNodeId) return currentNode;
                    if (currentNode.children) {
                      for (const child of currentNode.children) {
                        const found = findNode(child);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  
                  // 从用户学习路径中查找目标节点
                  const targetNode = findNode(userLearningPath.rootNode);
                  if (targetNode) {
                    // 更新左侧选中节点
                    setSelectedNodeId(targetNode.id);
                    setSelectedNodeName(targetNode.name);
                  }
                }}
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

        {/* 内容列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContentsByCategory.map((item) => (
            <div key={item.id} className="relative group">
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
      
      {/* 阅读弹窗 */}
      <ReadingModal 
        item={selectedContent} 
        isOpen={isReadingModalOpen} 
        onClose={() => setIsReadingModalOpen(false)} 
      />
    </div>
  );
}
