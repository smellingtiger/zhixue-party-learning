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
  VolumeX
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// 内容类型
type ContentType = 'video' | 'image' | 'article';

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
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isCompleted: boolean;
  progress?: number;
  knowledgePoints?: string[];
  relatedCourseId?: number;
  createdAt: string;
}

// 课程章节
interface CourseItem {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  progress?: number;
}

// 各频道内容数据
const channelContents: Record<string, ContentItem[]> = {
  recommend: [
    {
      id: 1,
      type: 'video',
      title: '3分钟读懂新质生产力',
      subtitle: '2024年最重要的经济概念',
      source: '学习强国',
      author: '权威解读',
      duration: '3:24',
      category: '时政',
      channel: 'recommend',
      tags: ['新质生产力', '经济', '高质量发展'],
      description: '新质生产力是由技术革命性突破、生产要素创新性配置、产业深度转型升级而催生的先进生产力。',
      likeCount: 12580,
      commentCount: 856,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      knowledgePoints: [
        '新质生产力：由技术革命性突破催生的先进生产力',
        '核心要素：高科技、高效能、高质量',
      ],
      relatedCourseId: 101,
      createdAt: '2小时前',
    },
    {
      id: 2,
      type: 'image',
      title: '二十大报告金句',
      subtitle: '收藏！二十大报告中的经典论述',
      source: '人民日报',
      author: '人民日报',
      duration: '3秒',
      category: '时政',
      channel: 'recommend',
      tags: ['二十大', '金句', '重要论述'],
      description: '二十大报告中这些金句，字字珠玑，值得收藏转发！',
      likeCount: 45600,
      commentCount: 2340,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '"江山就是人民，人民就是江山"',
        '"以中国式现代化全面推进中华民族伟大复兴"'
      ],
      createdAt: '4小时前',
    },
    {
      id: 3,
      type: 'article',
      title: '深刻理解"两个确立"的决定性意义',
      subtitle: '学习贯彻党的二十大精神专题',
      source: '求是网',
      author: '求是杂志',
      duration: '8分钟阅读',
      category: '理论',
      channel: 'recommend',
      tags: ['两个确立', '二十大', '理论学习'],
      description: '党的二十大报告指出，"两个确立"是党在新时代取得的重大政治成果，是推动党和国家事业取得历史性成就、发生历史性变革的决定性因素。',
      content: `党的二十大报告指出，"两个确立"是党在新时代取得的重大政治成果，是推动党和国家事业取得历史性成就、发生历史性变革的决定性因素。

**一、"两个确立"的丰富内涵**

"两个确立"，即确立习近平同志党中央的核心、全党的核心地位，确立习近平新时代中国特色社会主义思想的指导地位。

**二、"两个确立"的决定性意义**

1. **政治意义**：这是新时代最重大的政治成果
2. **历史意义**：这是推动历史性变革的决定性因素
3. **实践意义**：这是推进中国式现代化的根本保证

**三、坚决做到"两个维护"**

要把增强"四个意识"、坚定"四个自信"、做到"两个维护"作为最高政治原则和根本政治规矩。`,
      likeCount: 28900,
      commentCount: 1567,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '两个确立：核心地位 + 指导地位',
        '四个意识：政治、大局、核心、看齐',
        '四个自信：道路、理论、制度、文化'
      ],
      createdAt: '6小时前',
    },
    {
      id: 4,
      type: 'video',
      title: '中国共产党纪律处分条例解读',
      subtitle: '第1集：总则与六大纪律',
      source: '中央纪委',
      author: '中央纪委',
      duration: '12:35',
      category: '党纪',
      channel: 'recommend',
      tags: ['党纪', '条例', '纪律建设'],
      description: '新修订的《中国共产党纪律处分条例》深入解读...',
      likeCount: 8900,
      commentCount: 567,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      progress: 65,
      knowledgePoints: [
        '六大纪律：政治、组织、廉洁、群众、工作、生活纪律',
      ],
      relatedCourseId: 102,
      createdAt: '1天前',
    },
    {
      id: 5,
      type: 'article',
      title: '如何开好主题党日活动',
      subtitle: '基层党务工作实务指南',
      source: '党建工作实务',
      author: '党务专家',
      duration: '5分钟阅读',
      category: '实务',
      channel: 'recommend',
      tags: ['主题党日', '基层党建', '实务'],
      description: '主题党日是党的组织生活的重要形式，如何把主题党日活动开展得既有意义又生动活泼？',
      content: `主题党日是党的组织生活的重要形式，是加强党员教育管理、增强党组织凝聚力的有效载体。

**一、主题党日的基本要求**

1. 时间固定：每月至少一次
2. 人员参与：全体党员参加
3. 内容充实：紧扣中心工作

**二、活动形式创新**

- 集中学习与交流研讨相结合
- 室内学习与实地参观相结合
- 传统方式与新媒体手段相结合

**三、注意事项**

- 防止形式主义
- 注重实际效果
- 做好记录归档`,
      likeCount: 6780,
      commentCount: 456,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      knowledgePoints: [
        '主题党日：每月至少一次',
        '参会人员：全体党员',
        '活动形式：集中学习、实地参观、志愿服务等'
      ],
      createdAt: '2天前',
    },
  ],
  politics: [
    {
      id: 101,
      type: 'article',
      title: '政府工作报告要点速览',
      subtitle: '2024年经济社会发展主要目标任务',
      source: '新华社',
      author: '新华社',
      duration: '6分钟阅读',
      category: '时政',
      channel: 'politics',
      tags: ['两会', '政府工作报告', '经济发展'],
      description: '2024年政府工作报告中，这些要点值得关注...',
      content: `2024年政府工作报告提出了经济社会发展的主要预期目标：

**经济发展目标**
- 国内生产总值增长5%左右
- 城镇新增就业1200万人以上
- 居民消费价格涨幅3%左右

**重点工作部署**
1. 大力推进现代化产业体系建设
2. 加快发展新质生产力
3. 扩大高水平对外开放
4. 切实保障和改善民生`,
      likeCount: 34500,
      commentCount: 2340,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      knowledgePoints: [
        'GDP增长目标：5%左右',
        '新质生产力：创新驱动发展',
        '扩大开放：高质量引进来走出去'
      ],
      createdAt: '1小时前',
    },
    {
      id: 102,
      type: 'video',
      title: '新质生产力一分钟解读',
      subtitle: '什么是新质生产力？',
      source: '人民日报',
      author: '人民日报',
      duration: '1:30',
      category: '时政',
      channel: 'politics',
      tags: ['新质生产力', '经济', '创新'],
      description: '一分钟带你了解什么是新质生产力',
      likeCount: 89000,
      commentCount: 5600,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '新质生产力：高科技、高效能、高质量',
        '区别于传统生产力：创新驱动'
      ],
      createdAt: '3小时前',
    },
    {
      id: 103,
      type: 'image',
      title: '2024年重点工作一览',
      subtitle: '十大重点任务',
      source: '中国政府网',
      author: '中国政府网',
      duration: '停留阅读',
      category: '时政',
      channel: 'politics',
      tags: ['重点工作', '任务', '图解'],
      description: '一张图读懂2024年十大重点任务',
      likeCount: 23400,
      commentCount: 890,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '科技创新引领现代化产业体系建设',
        '深化重点领域改革',
        '扩大高水平对外开放'
      ],
      createdAt: '5小时前',
    },
  ],
  party: [
    {
      id: 201,
      type: 'video',
      title: '中国共产党百年奋斗史',
      subtitle: '完整版讲座节选',
      source: '中央党校',
      author: '中央党校教授',
      duration: '15:00',
      category: '党史',
      channel: 'party',
      tags: ['党史', '党课', '百年奋斗'],
      description: '系统讲述中国共产党百年奋斗的光辉历程...',
      likeCount: 45600,
      commentCount: 2340,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '四个历史时期：站起来、富起来、强起来',
        '伟大建党精神：坚持真理、坚守理想',
      ],
      relatedCourseId: 201,
      createdAt: '1天前',
    },
    {
      id: 202,
      type: 'article',
      title: '延安精神永放光芒',
      subtitle: '传承红色基因 赓续红色血脉',
      source: '求是网',
      author: '理论学习',
      duration: '10分钟阅读',
      category: '党史',
      channel: 'party',
      tags: ['延安精神', '红色基因', '革命精神'],
      description: '延安精神是中国共产党人取之不尽、用之不竭的宝贵精神财富...',
      content: `延安精神的主要内容是：坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。

**一、坚定正确的政治方向**

坚持正确的政治方向，是延安精神的灵魂。

**二、解放思想、实事求是的思想路线**

坚持一切从实际出发，理论联系实际。

**三、全心全意为人民服务的根本宗旨**

始终把人民利益放在第一位。

**四、自力更生、艰苦奋斗的创业精神**

艰苦创业是延安精神的显著特征。`,
      likeCount: 18900,
      commentCount: 1230,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      knowledgePoints: [
        '延安精神四要点：政治方向、思想路线、服务宗旨、创业精神',
        '自力更生、艰苦奋斗'
      ],
      createdAt: '2天前',
    },
    {
      id: 203,
      type: 'image',
      title: '党史上的今天',
      subtitle: '重要历史事件回顾',
      source: '党史学习教育',
      author: '党史办',
      duration: '停留阅读',
      category: '党史',
      channel: 'party',
      tags: ['党史', '历史', '今天'],
      description: '回顾党史上的今天，铭记光辉历程',
      likeCount: 12300,
      commentCount: 678,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '学习党史是为了更好地走向未来',
        '以史为鉴、开创未来'
      ],
      createdAt: '3天前',
    },
  ],
  practice: [
    {
      id: 301,
      type: 'article',
      title: '基层党建工作实务20讲',
      subtitle: '第1讲：三会一课规范流程',
      source: '党建工作实务',
      author: '党务专家',
      duration: '8分钟阅读',
      category: '实务',
      channel: 'practice',
      tags: ['三会一课', '基层党建', '实务'],
      description: '详细讲解三会一课的规范流程和注意事项...',
      content: `三会一课是党的组织生活的基本制度，是加强党员教育管理的重要途径。

**一、支部委员会（支委会）**

- 时间：每月至少召开一次
- 主持：党支部书记
- 内容：研究党建工作、重点工作、队伍建设等

**二、党员大会**

- 时间：每季度至少召开一次
- 主持：党支部书记
- 内容：讨论决定重要事项、选举等

**三、党小组会**

- 时间：每月至少召开一次
- 内容：组织学习、讨论等

**四、党课**

- 时间：每季度至少一次
- 参加人员：全体党员`,
      likeCount: 23400,
      commentCount: 1560,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '三会：支委会、党员大会、党小组会',
        '一课：党课',
        '支委会：每月至少一次'
      ],
      relatedCourseId: 301,
      createdAt: '1天前',
    },
    {
      id: 302,
      type: 'video',
      title: '如何写好党建工作总结',
      subtitle: '实用写作技巧分享',
      source: '公文写作',
      author: '写作专家',
      duration: '10:25',
      category: '实务',
      channel: 'practice',
      tags: ['党建', '总结', '写作'],
      description: '党建工作总结的写作要点和技巧...',
      likeCount: 15600,
      commentCount: 890,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      knowledgePoints: [
        '总结结构：工作回顾、存在问题、下一步计划',
        '写作要点：数据说话、亮点突出'
      ],
      createdAt: '2天前',
    },
    {
      id: 303,
      type: 'article',
      title: '发展党员工作流程详解',
      subtitle: '从申请到转正全流程',
      source: '组织工作',
      author: '组织部',
      duration: '12分钟阅读',
      category: '实务',
      channel: 'practice',
      tags: ['党员发展', '组织工作', '流程'],
      description: '发展党员工作的25个步骤详解...',
      content: `发展党员工作是党组织的一项经常性重要工作。

**一、申请入党**

1. 年满18岁的先进分子
2. 书面申请
3. 党组织派人谈话

**二、入党积极分子确定**

4. 推荐入党积极分子
5. 支委会研究确定
6. 上级党委备案

**三、发展对象确定**

7. 培养联系人提出意见
8. 支委会讨论同意
9. 上级党委备案
10. 确定入党介绍人

**四、预备党员接收**

11-20. 各环节工作
21. 支部大会讨论
22. 上级党委审批

**五、预备党员转正**

23-24. 教育和考察
25. 转正手续`,
      likeCount: 34500,
      commentCount: 2340,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '五个阶段：申请→积极分子→发展对象→预备党员→转正',
        '25个步骤'
      ],
      createdAt: '3天前',
    },
  ],
  mycourse: [
    {
      id: 401,
      type: 'video',
      title: '继续学习：党纪处分条例',
      subtitle: '上次学到：第三讲 组织纪律',
      source: '中央纪委',
      author: '中央纪委',
      duration: '18:00',
      category: '学习中',
      channel: 'mycourse',
      tags: ['党纪', '继续学习', '进度65%'],
      description: '您上次学到第三讲组织纪律，继续完成学习吧',
      likeCount: 8900,
      commentCount: 567,
      isLiked: false,
      isBookmarked: true,
      isCompleted: false,
      progress: 65,
      knowledgePoints: [
        '组织纪律：四个服从、请示报告等'
      ],
      relatedCourseId: 401,
      createdAt: '学习中',
    },
    {
      id: 402,
      type: 'article',
      title: '我的笔记：两个确立',
      subtitle: '学习心得摘录',
      source: '我的收藏',
      author: '我',
      duration: '笔记',
      category: '我的笔记',
      channel: 'mycourse',
      tags: ['笔记', '两个确立', '心得'],
      description: '"两个确立"是新时代最重要的政治成果...',
      content: `学习心得：

"两个确立"是党在新时代取得的重大政治成果，反映了全党全军全国各族人民的共同心愿。

作为党员，要：
1. 深刻领悟"两个确立"的决定性意义
2. 坚决做到"两个维护"
3. 不断增强"四个意识"
4. 始终坚定"四个自信"

要把学习成果转化为推动工作的实际成效。`,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isBookmarked: false,
      isCompleted: false,
      createdAt: '3天前',
    },
    {
      id: 403,
      type: 'image',
      title: '收藏：金句摘录',
      subtitle: '二十大报告经典论述',
      source: '人民日报',
      author: '人民日报',
      duration: '收藏',
      category: '我的收藏',
      channel: 'mycourse',
      tags: ['收藏', '金句', '二十大'],
      description: '二十大报告中的经典论述，值得反复学习',
      likeCount: 45600,
      commentCount: 2340,
      isLiked: true,
      isBookmarked: true,
      isCompleted: false,
      knowledgePoints: [
        '"江山就是人民，人民就是江山"',
        '"踔厉奋发、勇毅前行"'
      ],
      createdAt: '1周前',
    },
  ],
};

// 全屏内容卡片组件
function ContentCard({ 
  item, 
  onLike, 
  onBookmark, 
  onShare,
  isActive 
}: { 
  item: ContentItem; 
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isActive: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);

  // 自动播放
  useEffect(() => {
    if (isActive && item.type === 'video') {
      const timer = setTimeout(() => setIsPlaying(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [isActive, item.type]);

  // 知识胶囊
  useEffect(() => {
    if (isActive && item.knowledgePoints && item.knowledgePoints.length > 0) {
      const timer = setTimeout(() => setShowKnowledgeCard(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, item.id]);

  return (
    <div className={`relative w-full h-full bg-black ${isActive ? 'block' : 'hidden'}`}>
      {/* 视频内容 */}
      {item.type === 'video' && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-orange-900 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white">
              <Video className="h-3 w-3 mr-1" />
              微课 · {item.duration}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
            {item.subtitle && <p className="text-white/80 text-lg mb-4">{item.subtitle}</p>}
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors mx-auto"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </button>
            
            {item.progress !== undefined && item.progress > 0 && (
              <div className="mt-6 max-w-md mx-auto">
                <Progress value={item.progress} className="h-1 bg-white/20 [&>div]:bg-white" />
                <p className="text-sm text-white/60 mt-1">已观看 {item.progress}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图文内容 - 金句 */}
      {item.type === 'image' && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 flex items-center justify-center p-8">
          <div className="text-center text-white max-w-2xl">
            <Badge className="mb-4 bg-white/30 text-white">
              <ImageIcon className="h-3 w-3 mr-1" />
              金句 · {item.duration || '停留即可'}
            </Badge>
            <h1 className="text-4xl font-bold mb-6 leading-tight">{item.title}</h1>
            {item.subtitle && <p className="text-xl text-white/90 mb-8">{item.subtitle}</p>}
            
            <div className="flex justify-center gap-4 mb-8">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/20 text-white border-white/40">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-lg leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 文章内容 */}
      {item.type === 'article' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 pt-20 pb-32">
            <Badge className="mb-4 bg-red-600 text-white">
              <FileText className="h-3 w-3 mr-1" />
              文章 · {item.duration}
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">{item.title}</h1>
            {item.subtitle && <p className="text-white/70 text-lg mb-6">{item.subtitle}</p>}
            
            {/* 文章信息 */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-red-600 text-white">{item.author.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{item.author}</p>
                <p className="text-white/50 text-sm">{item.source} · {item.createdAt}</p>
              </div>
            </div>
            
            {/* 文章正文 */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </div>
            </div>
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mt-8">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 右侧交互栏 */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-4">
        <button onClick={onLike} className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${item.isLiked ? 'text-red-500' : 'text-white'}`}>
            <Heart className={`h-6 w-6 ${item.isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-white text-xs mt-1">{item.likeCount >= 1000 ? `${(item.likeCount/1000).toFixed(1)}w` : item.likeCount}</span>
        </button>

        <button onClick={onBookmark} className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${item.isBookmarked ? 'text-amber-400' : 'text-white'}`}>
            <Bookmark className={`h-6 w-6 ${item.isBookmarked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-white text-xs mt-1">收藏</span>
        </button>

        <button onClick={onShare} className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Share2 className="h-6 w-6" />
          </div>
          <span className="text-white text-xs mt-1">分享</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-white text-xs mt-1">{item.commentCount >= 1000 ? `${(item.commentCount/1000).toFixed(1)}w` : item.commentCount}</span>
        </button>
      </div>

      {/* 底部信息 - 非文章类型 */}
      {item.type !== 'article' && (
        <div className="absolute bottom-20 left-4 right-20">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarFallback className="bg-red-600 text-white">{item.author.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold">{item.author}</p>
              <p className="text-white/60 text-sm">{item.source} · {item.createdAt}</p>
            </div>
          </div>
          <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 知识胶囊 */}
      {showKnowledgeCard && item.knowledgePoints && (
        <div className="absolute left-4 top-1/4 bg-white/95 backdrop-blur rounded-xl p-4 max-w-xs shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-sm">知识点</span>
          </div>
          <ul className="space-y-2">
            {item.knowledgePoints.slice(0, 3).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
          {item.knowledgePoints.length > 3 && (
            <Button variant="link" size="sm" className="text-red-600 mt-2 p-0 h-auto">
              查看全部 {item.knowledgePoints.length} 个知识点
            </Button>
          )}
        </div>
      )}

      {/* 上滑提示 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60">
        <ChevronDown className="h-6 w-6 animate-bounce" />
        <span className="text-xs">上滑切换下一个</span>
      </div>
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
  chapters: CourseItem[];
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
            <BookOpen className="h-4 w-4 mr-2" />
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
        {contents.length > 0 ? (
          contents.map((item, idx) => (
            <ContentCard
              key={item.id}
              item={item}
              isActive={idx === currentIndex}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          ))
        ) : (
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
                <Badge variant="outline" className="text-xs">关联课程</Badge>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <h3 className="font-semibold mb-1">{currentContent.title}</h3>
              <p className="text-sm text-muted-foreground">点击解锁完整学习</p>
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
                  <Play className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">继续学习</p>
                  <p className="text-xs text-muted-foreground">{currentContent?.title}</p>
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
    </div>
  );
}
