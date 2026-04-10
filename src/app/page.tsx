'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Bookmark,
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
  ChevronDown,
  Clock,
  Eye,
  Menu,
  Volume2,
  VolumeX,
  Quote,
  BarChart3,
  Headphones,
  Save,
  Instagram,
  RefreshCw,
  ArrowUp,
  BookmarkCheck,
  Highlighter,
  PenTool,
  Share,
  Volume1,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  Mic,
  AlignLeft,
  LayoutList,
  ImagePlus,
  Check,
  Copy,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// 内容类型
type ContentType = 'quote' | 'card' | 'infographic' | 'audio' | 'article';

// 知识点
interface KnowledgePoint {
  text: string;
  highlight?: boolean;
}

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
  channel: string;
  tags: string[];
  description: string;
  content?: string;
  knowledgePoints: KnowledgePoint[];
  keyPoint?: string; // 金句
  stats?: { label: string; value: string }[]; // 数据统计
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isCompleted: boolean;
  progress?: number;
  relatedCourseId?: number;
  createdAt: string;
}

// 各频道内容数据 - 纯文字流
const channelContents: Record<string, ContentItem[]> = {
  recommend: [
    // 金句海报
    {
      id: 1,
      type: 'quote',
      title: '江山就是人民，人民就是江山',
      subtitle: '习近平谈治国理政',
      source: '人民日报',
      author: '人民日报',
      duration: '3秒海报',
      category: '金句',
      channel: 'recommend',
      tags: ['人民至上', '治国理政', '核心理念'],
      description: '党的二十大报告指出，人民是全面建设社会主义现代化国家的力量源泉。',
      keyPoint: '江山就是人民，人民就是江山。这是一切工作的出发点和落脚点。',
      knowledgePoints: [
        { text: '人民至上 — 把人民利益放在最高位置', highlight: true },
        { text: '江山 — 比喻国家政权和领土完整', highlight: false },
        { text: '党的一切工作都是为了人民的根本利益', highlight: true },
      ],
      likeCount: 125800,
      commentCount: 8560,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '2小时前',
    },
    // 卡片式摘要
    {
      id: 2,
      type: 'card',
      title: '2024年政府工作报告：十大关键数字',
      subtitle: '一图读懂全年发展目标',
      source: '新华社',
      author: '新华社',
      duration: '3分钟阅读',
      category: '政策解读',
      channel: 'recommend',
      tags: ['两会', '政府工作报告', '经济目标'],
      description: 'GDP增长5%左右、城镇新增就业1200万人以上、居民消费价格涨幅3%左右...',
      knowledgePoints: [
        { text: 'GDP目标：5%左右 — 体现稳中求进', highlight: true },
        { text: '就业目标：1200万+ — 民生之本', highlight: true },
        { text: 'CPI目标：3%左右 — 物价稳定', highlight: false },
      ],
      likeCount: 45600,
      commentCount: 2340,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '4小时前',
    },
    // 信息图表
    {
      id: 3,
      type: 'infographic',
      title: '2023年经济社会发展成就',
      subtitle: '用数据说话',
      source: '国家统计局',
      author: '国家统计局',
      duration: '2分钟浏览',
      category: '数据图表',
      channel: 'recommend',
      tags: ['经济成就', '数据可视化', '年度回顾'],
      description: 'GDP突破126万亿元、粮食产量创新高、研发投入增长...',
      stats: [
        { label: 'GDP总量', value: '126万亿元' },
        { label: '粮食产量', value: '13908亿斤' },
        { label: '研发投入', value: '3.21万亿元' },
        { label: '居民收入', value: '+6.1%' },
      ],
      knowledgePoints: [
        { text: 'GDP总量突破126万亿 — 经济实力再上新台阶', highlight: true },
        { text: '粮食产量创历史新高 — 端牢中国饭碗', highlight: true },
        { text: '研发投入增长 — 创新驱动发展战略深入实施', highlight: false },
      ],
      likeCount: 67800,
      commentCount: 3450,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '6小时前',
    },
    // 听书流
    {
      id: 4,
      type: 'audio',
      title: '党章诵读：第一章 党员',
      subtitle: '逐字稿 + 音频伴读',
      source: '有声党课',
      author: '党员教育',
      duration: '5分钟',
      category: '党章学习',
      channel: 'recommend',
      tags: ['党章', '党员标准', '有声学习'],
      description: '年满十八岁的中国工人、农民、军人、知识分子和其他社会阶层的先进分子...',
      content: `年满十八岁的中国工人、农民、军人、知识分子和其他社会阶层的先进分子，承认党的纲领和章程，愿意参加党的一个组织并在其中积极工作、执行党的决议和按期交纳党费的，可以申请加入中国共产党。

中国共产党党员永远是劳动人民的普通一员。除了法律和政策规定范围内的个人利益和工作职权以外，所有共产党员都不得谋求任何私利和特权。`,
      knowledgePoints: [
        { text: '入党条件：年满18岁、承认党章、愿意参加组织', highlight: true },
        { text: '党员标准：永远是劳动人民的普通一员', highlight: true },
        { text: '党员义务：不得谋求私利和特权', highlight: true },
      ],
      likeCount: 28900,
      commentCount: 1567,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '1天前',
    },
    // 长文卡片
    {
      id: 5,
      type: 'card',
      title: '深刻理解"两个确立"的决定性意义',
      subtitle: '学习贯彻党的二十大精神专题',
      source: '求是网',
      author: '求是杂志',
      duration: '8分钟阅读',
      category: '理论学习',
      channel: 'recommend',
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
      likeCount: 56700,
      commentCount: 3450,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '2天前',
    },
  ],
  politics: [
    // 金句
    {
      id: 101,
      type: 'quote',
      title: '新发展理念',
      subtitle: '创新、协调、绿色、开放、共享',
      source: '党的十九届五中全会',
      author: '中央党校',
      duration: '海报',
      category: '时政',
      channel: 'politics',
      tags: ['新发展理念', '五大理念', '发展指南'],
      description: '坚持创新、协调、绿色、开放、共享的新发展理念，是我国经济发展的根本遵循。',
      keyPoint: '创新是第一动力，协调是内生特点，绿色是普遍形态，开放是必由之路，共享是根本目的。',
      knowledgePoints: [
        { text: '创新 — 发展第一动力', highlight: true },
        { text: '协调 — 解决发展不平衡', highlight: false },
        { text: '绿色 — 人与自然和谐共生', highlight: false },
      ],
      likeCount: 89000,
      commentCount: 5600,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '1小时前',
    },
    // 卡片
    {
      id: 102,
      type: 'card',
      title: '政府工作报告要点速览',
      subtitle: '2024年经济社会发展主要目标',
      source: '新华社',
      author: '新华社',
      duration: '5分钟阅读',
      category: '时政',
      channel: 'politics',
      tags: ['两会', '政府工作报告', '经济'],
      description: '2024年政府工作报告中，这些要点值得关注...',
      knowledgePoints: [
        { text: 'GDP增长5%左右 — 稳中求进', highlight: true },
        { text: '新质生产力 — 创新驱动发展', highlight: true },
        { text: '高质量发展 — 主旋律', highlight: false },
      ],
      likeCount: 34500,
      commentCount: 2340,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '3小时前',
    },
    // 信息图表
    {
      id: 103,
      type: 'infographic',
      title: '新质生产力：一图读懂',
      subtitle: '什么是新质生产力？如何发展？',
      source: '人民日报',
      author: '人民日报',
      duration: '图表',
      category: '时政',
      channel: 'politics',
      tags: ['新质生产力', '经济', '创新'],
      description: '新质生产力是由技术革命性突破、生产要素创新性配置、产业深度转型升级而催生的先进生产力。',
      stats: [
        { label: '高科技', value: '核心标志' },
        { label: '高效能', value: '内在要求' },
        { label: '高质量', value: '最终目标' },
      ],
      knowledgePoints: [
        { text: '新质生产力：高科技 + 高效能 + 高质量', highlight: true },
        { text: '区别于传统生产力：创新驱动而非要素驱动', highlight: true },
        { text: '发展路径：科技创新 + 产业升级', highlight: false },
      ],
      likeCount: 45600,
      commentCount: 2890,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '5小时前',
    },
  ],
  party: [
    {
      id: 201,
      type: 'card',
      title: '延安精神永放光芒',
      subtitle: '传承红色基因 赓续红色血脉',
      source: '求是网',
      author: '理论学习',
      duration: '6分钟阅读',
      category: '党史',
      channel: 'party',
      tags: ['延安精神', '红色基因', '革命精神'],
      description: '延安精神是中国共产党人取之不尽、用之不竭的宝贵精神财富...',
      knowledgePoints: [
        { text: '坚定正确的政治方向 — 灵魂', highlight: true },
        { text: '解放思想、实事求是 — 精髓', highlight: true },
        { text: '全心全意为人民服务 — 宗旨', highlight: true },
        { text: '自力更生、艰苦奋斗 — 本质特征', highlight: true },
      ],
      likeCount: 18900,
      commentCount: 1230,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '1天前',
    },
    {
      id: 202,
      type: 'quote',
      title: '伟大建党精神',
      subtitle: '中国共产党的精神之源',
      source: '党史学习教育',
      author: '党史办',
      duration: '海报',
      category: '党史',
      channel: 'party',
      tags: ['伟大建党精神', '精神谱系', '建党精神'],
      description: '一百年前，中国共产党的先驱们创建了中国共产党，形成了坚持真理、坚守理想，践行初心、担当使命，不怕牺牲、英勇斗争，对党忠诚、不负人民的伟大建党精神。',
      keyPoint: '坚持真理、坚守理想，践行初心、担当使命，不怕牺牲、英勇斗争，对党忠诚、不负人民。',
      knowledgePoints: [
        { text: '坚持真理、坚守理想 — 思想基础', highlight: true },
        { text: '践行初心、担当使命 — 政治品格', highlight: true },
        { text: "不怕牺牲、英勇斗争 — 革命意志", highlight: true },
        { text: '对党忠诚、不负人民 — 政治本色', highlight: true },
      ],
      likeCount: 45600,
      commentCount: 2890,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '2天前',
    },
    {
      id: 203,
      type: 'audio',
      title: '井冈山精神诵读',
      subtitle: '音频伴读 + 逐字稿',
      source: '有声党课',
      author: '党员教育',
      duration: '4分钟',
      category: '党史',
      channel: 'party',
      tags: ['井冈山精神', '革命精神', '有声学习'],
      description: '井冈山精神是中国革命精神的重要源头...',
      content: `井冈山精神的核心是：坚定信念、艰苦奋斗，实事求是、敢闯新路，依靠群众、勇于胜利。

井冈山是中国革命的摇篮。1927年，毛泽东等老一辈革命家在这里创建了中国第一个农村革命根据地，开辟了农村包围城市、武装夺取政权的正确革命道路。`,
      knowledgePoints: [
        { text: '坚定信念、艰苦奋斗 — 精神内核', highlight: true },
        { text: '实事求是、敢闯新路 — 方法论', highlight: true },
        { text: '农村包围城市 — 革命道路创新', highlight: false },
      ],
      likeCount: 23400,
      commentCount: 1560,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '3天前',
    },
  ],
  practice: [
    {
      id: 301,
      type: 'card',
      title: '基层党建工作实务20讲',
      subtitle: '第1讲：三会一课规范流程',
      source: '党建工作实务',
      author: '党务专家',
      duration: '8分钟阅读',
      category: '实务',
      channel: 'practice',
      tags: ['三会一课', '基层党建', '实务'],
      description: '三会一课是党的组织生活的基本制度，是加强党员教育管理的重要途径。',
      knowledgePoints: [
        { text: '三会：支委会(每月)+党员大会(每季)+党小组会(每月)', highlight: true },
        { text: '一课：党课(每季度至少一次)', highlight: true },
        { text: '记录归档：三会一课要有完整记录', highlight: false },
      ],
      likeCount: 23400,
      commentCount: 1560,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      relatedCourseId: 301,
      createdAt: '1天前',
    },
    {
      id: 302,
      type: 'card',
      title: '发展党员工作流程详解',
      subtitle: '从申请到转正全流程25个步骤',
      source: '组织工作',
      author: '组织部',
      duration: '10分钟阅读',
      category: '实务',
      channel: 'practice',
      tags: ['党员发展', '组织工作', '流程'],
      description: '发展党员工作的25个步骤详解...',
      knowledgePoints: [
        { text: '五个阶段：申请→积极分子→发展对象→预备党员→转正', highlight: true },
        { text: '25个步骤：严格程序、保证质量', highlight: true },
        { text: '两个"主要"：控制总量、优化结构', highlight: false },
      ],
      likeCount: 34500,
      commentCount: 2340,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '2天前',
    },
    {
      id: 303,
      type: 'infographic',
      title: '主题党日活动 checklist',
      subtitle: '办好主题党日的10个要点',
      source: '党建工作实务',
      author: '党务专家',
      duration: '图表',
      category: '实务',
      channel: 'practice',
      tags: ['主题党日', '组织生活', '实务'],
      description: '主题党日是党的组织生活的重要形式...',
      stats: [
        { label: '时间', value: '每月固定' },
        { label: '参与', value: '全体党员' },
        { label: '内容', value: '政治性+时效性' },
        { label: '形式', value: '创新+多样' },
      ],
      knowledgePoints: [
        { text: '时间固定：每月至少一次', highlight: true },
        { text: '全员参与：覆盖全体党员', highlight: true },
        { text: '内容充实：紧扣中心工作', highlight: false },
        { text: '形式创新：室内+室外结合', highlight: false },
      ],
      likeCount: 15600,
      commentCount: 890,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '3天前',
    },
  ],
  mycourse: [
    {
      id: 401,
      type: 'card',
      title: '继续学习：党纪处分条例解读',
      subtitle: '上次学到：第三讲 组织纪律',
      source: '中央纪委',
      author: '中央纪委',
      duration: '学习中',
      category: '系统课程',
      channel: 'mycourse',
      tags: ['党纪', '继续学习', '进度65%'],
      description: '您上次学到第三讲组织纪律，继续完成学习吧',
      progress: 65,
      knowledgePoints: [
        { text: '六大纪律：政治、组织、廉洁、群众、工作、生活', highlight: true },
        { text: '组织纪律：四个服从、请示报告等', highlight: true },
      ],
      relatedCourseId: 401,
      createdAt: '学习中',
    },
    {
      id: 402,
      type: 'audio',
      title: '我的笔记朗读：两个确立',
      subtitle: '学习心得音频版',
      source: '我的收藏',
      author: '我',
      duration: '3分钟',
      category: '我的笔记',
      channel: 'mycourse',
      tags: ['笔记', '两个确立', '音频'],
      description: '"两个确立"是新时代最重要的政治成果...',
      content: `学习心得：

"两个确立"是党在新时代取得的重大政治成果，反映了全党全军全国各族人民的共同心愿。

作为党员，要：
1. 深刻领悟"两个确立"的决定性意义
2. 坚决做到"两个维护"
3. 不断增强"四个意识"
4. 始终坚定"四个自信"

要把学习成果转化为推动工作的实际成效。`,
      knowledgePoints: [
        { text: '两个确立：政治成果', highlight: true },
        { text: '两个维护：最高政治原则', highlight: true },
      ],
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '3天前',
    },
    {
      id: 403,
      type: 'quote',
      title: '我的收藏金句',
      subtitle: '二十大报告经典论述',
      source: '人民日报',
      author: '人民日报',
      duration: '收藏',
      category: '我的收藏',
      channel: 'mycourse',
      tags: ['收藏', '金句', '二十大'],
      description: '二十大报告中的经典论述，值得反复学习',
      keyPoint: '踔厉奋发、勇毅前行，全面建设社会主义现代化国家。',
      knowledgePoints: [
        { text: '踔厉奋发 — 精神状态', highlight: true },
        { text: '勇毅前行 — 行动姿态', highlight: true },
      ],
      likeCount: 45600,
      commentCount: 2340,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      createdAt: '1周前',
    },
  ],
};

// 金句海报组件
function QuoteCard({ item, onLike, onBookmark, onShare }: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-red-700 via-red-600 to-orange-500 flex items-center justify-center overflow-hidden">
      {/* 背景纹理 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* 主内容 */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
        <Quote className="h-16 w-16 text-white/30 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          {item.keyPoint || item.title}
        </h1>
        <div className="w-24 h-1 bg-white/50 mx-auto mb-6" />
        <p className="text-white/80 text-lg mb-8">{item.source}</p>
        
        {/* 标签 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="bg-white/20 text-white border-white/30 backdrop-blur">
              #{tag}
            </Badge>
          ))}
        </div>
        
        {/* 底部说明 */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4">
          <p className="text-white/90 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
      
      {/* 知识胶囊 */}
      <div className="absolute left-4 top-1/4 bg-white/95 backdrop-blur rounded-xl p-4 max-w-xs shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-sm">知识点</span>
        </div>
        <ul className="space-y-2">
          {item.knowledgePoints.filter(k => k.highlight).slice(0, 2).map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 卡片式摘要组件
function CardContentItem({ item, onLike, onBookmark, onShare, isActive }: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isActive: boolean;
}) {
  const [isReading, setIsReading] = useState(false);
  
  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 ${isActive ? 'block' : 'hidden'}`}>
      {!isReading ? (
        // 卡片预览
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="w-full max-w-lg bg-white/95 backdrop-blur shadow-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    <AlignLeft className="h-3 w-3 mr-1" />
                    {item.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-red-50 text-red-600">
                    {item.duration}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                {item.subtitle && (
                  <p className="text-muted-foreground text-sm mt-1">{item.subtitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.description}</p>
                
                {/* 知识点标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.knowledgePoints.filter(k => k.highlight).slice(0, 3).map((point, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
                      <Highlighter className="h-3 w-3 mr-1 text-red-500" />
                      {point.text.split('：')[0]}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500"
                  onClick={() => setIsReading(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  沉浸式阅读
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* 底部信息 */}
          <div className="p-4 bg-black/30">
            <div className="flex items-center justify-between text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-red-600 text-white text-xs">{item.author.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{item.source}</span>
              </div>
              <span>{item.createdAt}</span>
            </div>
          </div>
        </div>
      ) : (
        // 沉浸式阅读
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur p-4 flex items-center justify-between z-10">
            <Button variant="ghost" size="sm" onClick={() => setIsReading(false)} className="text-white">
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white" onClick={onBookmark}>
                <Bookmark className={`h-5 w-5 ${item.isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={onShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto p-8 pt-4">
            <Badge className="mb-4 bg-red-600 text-white">
              <FileText className="h-3 w-3 mr-1" />
              {item.duration}阅读
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">{item.title}</h1>
            {item.subtitle && <p className="text-white/60 text-lg mb-6">{item.subtitle}</p>}
            
            {/* 知识胶囊悬浮卡 */}
            <Card className="mb-6 bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-sm text-amber-800">核心知识点</span>
                </div>
                <ul className="space-y-2">
                  {item.knowledgePoints.filter(k => k.highlight).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{point.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* 文章正文 */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.content || item.description}
              </div>
            </div>
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            {/* 笔记入口 */}
            <Card className="mt-6 bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PenTool className="h-5 w-5 text-white/60" />
                  <span className="text-white/80 text-sm">记录学习心得</span>
                </div>
                <Button size="sm" variant="secondary">
                  <Highlighter className="h-3 w-3 mr-1" />
                  做笔记
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// 信息图表组件
function InfographicCard({ item, onLike, onBookmark, onShare }: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* 顶部 */}
        <div className="p-6 pt-20 text-center">
          <Badge className="mb-4 bg-red-600 text-white">
            <BarChart3 className="h-3 w-3 mr-1" />
            数据图表
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{item.title}</h1>
          {item.subtitle && <p className="text-white/60">{item.subtitle}</p>}
        </div>
        
        {/* 数据展示 */}
        {item.stats && (
          <div className="flex-1 px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {item.stats.map((stat, idx) => (
                <Card key={idx} className="bg-white/10 backdrop-blur border-white/20 overflow-hidden">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* 底部知识卡片 */}
        <div className="p-6">
          <Card className="bg-amber-50/95 backdrop-blur border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-800">知识点</span>
              </div>
              <ul className="space-y-2">
                {item.knowledgePoints.filter(k => k.highlight).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="secondary" className="bg-white/10 text-white border-white/20">
              <Bookmark className="h-4 w-4 mr-1" />
              收藏
            </Button>
            <Button variant="secondary" className="bg-white/10 text-white border-white/20">
              <Download className="h-4 w-4 mr-1" />
              下载图表
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 听书流组件
function AudioCard({ item, onLike, onBookmark, onShare, isActive }: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isActive: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  useEffect(() => {
    if (isActive && isPlaying) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(timer);
    }
  }, [isActive, isPlaying]);
  
  const lines = item.content?.split('\n\n').filter(l => l.trim()) || [];
  const currentLineIndex = Math.floor((currentTime / 100) * lines.length);
  
  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 ${isActive ? 'block' : 'hidden'}`}>
      <div className="h-full flex flex-col">
        {/* 顶部信息 */}
        <div className="p-4 pt-20 text-center">
          <Badge className="mb-4 bg-red-600 text-white">
            <Headphones className="h-3 w-3 mr-1" />
            音频伴读
          </Badge>
          <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
          {item.subtitle && <p className="text-white/60">{item.subtitle}</p>}
        </div>
        
        {/* 音频播放器 */}
        <div className="px-6 mb-4">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              {/* 进度条 */}
              <div className="mb-4">
                <Progress value={currentTime} className="h-1 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500" />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{Math.floor(currentTime * 0.3)}:{String(Math.floor((currentTime * 1.8) % 60)).padStart(2, '0')}</span>
                  <span>{item.duration}</span>
                </div>
              </div>
              
              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-6">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <PauseCircle className="h-8 w-8" />
                  ) : (
                    <PlayCircle className="h-8 w-8" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setCurrentTime(Math.min(100, currentTime + 15))}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 逐字稿 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">逐字稿</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Mic className="h-3 w-3 mr-1" />
                  朗读中
                </Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {lines.map((line, idx) => (
                    <p 
                      key={idx} 
                      className={`text-sm leading-relaxed transition-all ${
                        idx === currentLineIndex 
                          ? 'text-red-600 font-medium bg-red-50 p-2 rounded' 
                          : idx < currentLineIndex 
                            ? 'text-muted-foreground' 
                            : 'text-foreground'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* 知识点 */}
          <Card className="mt-4 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-800">知识点</span>
              </div>
              <ul className="space-y-2">
                {item.knowledgePoints.filter(k => k.highlight).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 右侧交互栏
function InteractionBar({ item, onLike, onBookmark, onShare }: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  return (
    <div className="absolute right-4 bottom-32 flex flex-col items-center gap-4">
      <button onClick={onLike} className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors ${item.isLiked ? 'text-red-500' : 'text-white hover:text-red-400'}`}>
          <Heart className={`h-6 w-6 ${item.isLiked ? 'fill-current' : ''}`} />
        </div>
        <span className="text-white text-xs mt-1">{item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(1)}w` : item.likeCount}</span>
      </button>

      <button onClick={onBookmark} className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors ${item.isBookmarked ? 'text-amber-400' : 'text-white hover:text-amber-400'}`}>
          {item.isBookmarked ? (
            <BookmarkCheck className="h-6 w-6" />
          ) : (
            <Bookmark className="h-6 w-6" />
          )}
        </div>
        <span className="text-white text-xs mt-1">收藏</span>
      </button>

      <button onClick={onShare} className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-green-400 transition-colors">
          <Share className="h-6 w-6" />
        </div>
        <span className="text-white text-xs mt-1">分享</span>
      </button>

      <button className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-blue-400 transition-colors">
          <Highlighter className="h-6 w-6" />
        </div>
        <span className="text-white text-xs mt-1">笔记</span>
      </button>

      <button className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-purple-400 transition-colors">
          <MessageCircle className="h-6 w-6" />
        </div>
        <span className="text-white text-xs mt-1">{item.commentCount >= 1000 ? `${(item.commentCount/1000).toFixed(1)}w` : item.commentCount}</span>
      </button>
    </div>
  );
}

// 课程抽屉组件
function CourseDrawer({ 
  isOpen, 
  onClose, 
  courseTitle,
  chapters 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  courseTitle: string;
  chapters: { id: number; title: string; duration: string; isCompleted: boolean; isLocked: boolean; progress?: number }[];
}) {
  const completedCount = chapters.filter(c => c.isCompleted).length;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">{courseTitle}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Progress value={(completedCount / chapters.length) * 100} className="flex-1 h-2" />
            <span>{completedCount}/{chapters.length}</span>
          </div>
        </SheetHeader>
        
        <div className="p-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {chapters.map((chapter, idx) => (
            <div 
              key={chapter.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                chapter.isLocked 
                  ? 'opacity-50' 
                  : chapter.isCompleted 
                    ? 'bg-green-50' 
                    : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                chapter.isCompleted 
                  ? 'bg-green-500 text-white' 
                  : chapter.isLocked 
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-red-100 text-red-600'
              }`}>
                {chapter.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : chapter.isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${chapter.isLocked ? 'text-gray-400' : ''}`}>
                  {chapter.title}
                </p>
                {chapter.progress !== undefined && chapter.progress > 0 && !chapter.isCompleted && (
                  <div className="mt-1">
                    <Progress value={chapter.progress} className="h-1" />
                  </div>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {chapter.duration}
              </span>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <Button className="w-full bg-gradient-to-r from-red-600 to-orange-500">
            <Play className="h-4 w-4 mr-2" />
            进入系统学习模式
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeChannel, setActiveChannel] = useState('recommend');
  const [contents, setContents] = useState(channelContents.recommend);
  const [isCourseDrawerOpen, setIsCourseDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 切换频道
  const handleChannelChange = (channel: string) => {
    setActiveChannel(channel);
    setContents(channelContents[channel] || []);
    setCurrentIndex(0);
  };

  // 滚轮切换
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (e.deltaY > 30 && currentIndex < contents.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsScrolled(true);
    } else if (e.deltaY < -30 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsScrolled(true);
    }
    
    setTimeout(() => setIsScrolled(false), 100);
  }, [currentIndex, contents.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // 触摸滑动
  const touchStartY = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (diff > 50 && currentIndex < contents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // 交互处理
  const handleLike = () => {
    setContents(prev => prev.map((item, idx) => 
      idx === currentIndex ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1 } : item
    ));
  };

  const handleBookmark = () => {
    setContents(prev => prev.map((item, idx) => 
      idx === currentIndex ? { ...item, isBookmarked: !item.isBookmarked } : item
    ));
  };

  const handleShare = () => {
    // 分享逻辑
  };

  const currentContent = contents[currentIndex];

  // 频道定义
  const channels = [
    { id: 'recommend', name: '推荐', icon: Sparkles },
    { id: 'politics', name: '时政', icon: TrendingUp },
    { id: 'party', name: '党史', icon: BookOpen },
    { id: 'practice', name: '实务', icon: Star },
    { id: 'mycourse', name: '我的课表', icon: User },
  ];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full overflow-hidden bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶部导航 */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? 'bg-black/80 backdrop-blur' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">红韵智学</span>
          </div>

          {/* 频道Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[60%]">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeChannel === channel.id 
                      ? 'bg-red-600 text-white' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {channel.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 relative">
        {contents.length > 0 && currentContent && (
          <>
            {/* 金句海报 */}
            {currentContent.type === 'quote' && (
              <QuoteCard 
                item={currentContent}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            )}

            {/* 卡片式摘要 */}
            {(currentContent.type === 'card' || currentContent.type === 'article') && (
              <CardContentItem
                item={currentContent}
                isActive={true}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            )}

            {/* 信息图表 */}
            {currentContent.type === 'infographic' && (
              <InfographicCard
                item={currentContent}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            )}

            {/* 听书流 */}
            {currentContent.type === 'audio' && (
              <AudioCard
                item={currentContent}
                isActive={true}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            )}

            {/* 右侧交互栏 */}
            <InteractionBar
              item={currentContent}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          </>
        )}

        {contents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">暂无内容</p>
              <p className="text-sm text-white/60">切换其他频道试试</p>
            </div>
          </div>
        )}

        {/* 关联课程卡片 */}
        {currentContent?.relatedCourseId && (
          <Card className="absolute bottom-28 left-4 right-4 bg-white/95 backdrop-blur shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  系统课程
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <h3 className="font-semibold mb-1">{currentContent.title}</h3>
              <p className="text-sm text-muted-foreground">点击进入完整课程学习</p>
              <Button 
                size="sm" 
                className="mt-2 w-full bg-gradient-to-r from-red-600 to-orange-500"
                onClick={() => setIsCourseDrawerOpen(true)}
              >
                <Play className="h-3 w-3 mr-1" />
                查看课程目录
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 课程目录按钮 */}
        {currentContent?.relatedCourseId && (
          <Button
            onClick={() => setIsCourseDrawerOpen(true)}
            className="absolute bottom-4 right-4 bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30"
            size="sm"
          >
            <List className="h-4 w-4 mr-1" />
            课程目录
          </Button>
        )}
      </main>

      {/* 底部导航 */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-all ${isScrolled ? 'bg-black/80 backdrop-blur' : 'bg-gradient-to-t from-black/80 to-transparent'}`}>
        <div className="flex items-center justify-around py-3">
          {[
            { id: 'home', name: '首页', icon: Home, active: true },
            { id: 'discover', name: '发现', icon: Search, active: false },
            { id: 'bookshelf', name: '书架', icon: BookOpen, active: false },
            { id: 'notes', name: '笔记', icon: Notebook, active: false },
            { id: 'profile', name: '我的', icon: User, active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center gap-1 px-4 py-1 ${
                  item.active ? 'text-white' : 'text-white/60'
                }`}
              >
                <Icon className={`h-5 w-5 ${item.active ? 'text-red-500' : ''}`} />
                <span className="text-xs">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 继续学习悬浮条 */}
      {currentIndex > 0 && activeChannel !== 'mycourse' && (
        <div className="fixed top-20 left-4 right-4 z-40 hidden md:block">
          <Card className="bg-white/95 backdrop-blur shadow-lg">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">继续学习</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{currentContent?.title}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-200 text-red-600"
                onClick={() => setCurrentIndex(0)}
              >
                <SkipBack className="h-3 w-3 mr-1" />
                返回开头
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 课程抽屉 */}
      <CourseDrawer 
        isOpen={isCourseDrawerOpen}
        onClose={() => setIsCourseDrawerOpen(false)}
        courseTitle={currentContent?.title || '课程目录'}
        chapters={[
          { id: 1, title: '第一讲：总则概述', duration: '15:00', isCompleted: true, isLocked: false, progress: 100 },
          { id: 2, title: '第二讲：政治纪律', duration: '20:00', isCompleted: true, isLocked: false, progress: 100 },
          { id: 3, title: '第三讲：组织纪律', duration: '18:00', isCompleted: false, isLocked: false, progress: 65 },
          { id: 4, title: '第四讲：廉洁纪律', duration: '22:00', isCompleted: false, isLocked: false, progress: 0 },
          { id: 5, title: '第五讲：群众纪律', duration: '16:00', isCompleted: false, isLocked: true, progress: 0 },
        ]}
      />

      {/* 进度指示器 */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1">
        {contents.map((_, idx) => (
          <div 
            key={idx}
            className={`w-1 rounded-full transition-all ${
              idx === currentIndex 
                ? 'h-4 bg-white' 
                : idx < currentIndex 
                  ? 'h-2 bg-white/50' 
                  : 'h-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* 上滑提示 */}
      {currentIndex === 0 && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60 animate-bounce">
          <ArrowUp className="h-5 w-5" />
          <span className="text-xs">上滑切换</span>
        </div>
      )}
    </div>
  );
}
