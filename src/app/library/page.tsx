'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MainNav } from '@/components/main-nav';
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
  Edit3,
  Save,
  Plus,
  Trash2,
  Users
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
  { id: 'ai-course', name: 'AI生成课程', count: '智能生成', color: 'bg-purple-600' },
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
  const [courseTopic, setCourseTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedChapters, setEditedChapters] = useState<any[]>([]);

  const presetCourseTopics = [
    {
      key: 'xjp_thought',
      name: '习近平新时代中国特色社会主义思想专题',
      data: {
        courseName: '习近平新时代中国特色社会主义思想概论',
        courseType: '理论课程',
        totalHours: 8,
        difficulty: '高级',
        targetAudience: '全省统战系统干部',
        chapters: [
          { id: 1, title: '第一讲：习近平新时代中国特色社会主义思想的形成背景与历史地位', duration: '45分钟', type: 'video' },
          { id: 2, title: '第二讲：十个明确的核心要义', duration: '50分钟', type: 'video' },
          { id: 3, title: '第三讲：十四个坚持的基本方略', duration: '55分钟', type: 'video' },
          { id: 4, title: '第四讲：两个确立的决定性意义', duration: '40分钟', type: 'video' },
          { id: 5, title: '第五讲：新时代统一战线工作的根本遵循', duration: '60分钟', type: 'video' },
          { id: 6, title: '专题研讨：如何用习近平新时代中国特色社会主义思想指导统战实践', duration: '90分钟', type: 'discussion' },
        ],
        description: '本课程系统讲授习近平新时代中国特色社会主义思想的科学体系、核心要义和实践要求，特别聚焦统一战线工作的重要论述，引导学员深刻领悟党的创新理论的真理力量和实践伟力。',
        learningObjectives: [
          '深刻理解习近平新时代中国特色社会主义思想的丰富内涵',
          '准确把握十个明确、十四个坚持的核心要义',
          '深刻领悟两个确立的决定性意义',
          '熟练掌握新时代统一战线工作的理论方针政策',
        ],
      }
    },
    {
      key: 'united_front',
      name: '新时代统一战线工作实务',
      data: {
        courseName: '新时代统一战线工作实务操作指南',
        courseType: '实务课程',
        totalHours: 12,
        difficulty: '中级',
        targetAudience: '基层统战干部',
        chapters: [
          { id: 1, title: '第一讲：新时代统一战线的历史方位与重要作用', duration: '40分钟', type: 'video' },
          { id: 2, title: '第二讲：多党合作制度与参政议政', duration: '55分钟', type: 'video' },
          { id: 3, title: '第三讲：民族团结进步创建工作实务', duration: '50分钟', type: 'video' },
          { id: 4, title: '第四讲：我国宗教中国化方向与工作方法', duration: '60分钟', type: 'video' },
          { id: 5, title: '第五讲：民营经济统战工作创新', duration: '45分钟', type: 'video' },
          { id: 6, title: '第六讲：新的社会阶层人士统战工作', duration: '45分钟', type: 'video' },
          { id: 7, title: '第七讲：港澳台海外统战工作', duration: '50分钟', type: 'video' },
          { id: 8, title: '案例研讨：基层统战工作创新实践', duration: '90分钟', type: 'discussion' },
        ],
        description: '本课程围绕新时代统一战线各领域工作，从理论基础、制度设计、政策要求到实践操作进行全链条讲解，特别注重案例教学和经验分享，提升基层统战干部的实际工作能力。',
        learningObjectives: [
          '掌握新时代统一战线各领域工作的基本理论',
          '熟悉多党合作、民族宗教、民营经济等领域政策',
          '了解基层统战工作创新发展的方向路径',
          '提升解决实际问题的能力水平',
        ],
      }
    },
    {
      key: 'party_style',
      name: '党风廉政建设专题',
      data: {
        courseName: '党风廉政建设与反腐败工作专题',
        courseType: '廉政课程',
        totalHours: 6,
        difficulty: '中级',
        targetAudience: '党员干部',
        chapters: [
          { id: 1, title: '第一讲：全面从严治党的重要论述', duration: '45分钟', type: 'video' },
          { id: 2, title: '第二讲：《中国共产党纪律处分条例》解读', duration: '60分钟', type: 'video' },
          { id: 3, title: '第三讲：中央八项规定精神与作风建设', duration: '50分钟', type: 'video' },
          { id: 4, title: '第四讲：警示教育典型案例分析', duration: '55分钟', type: 'video' },
          { id: 5, title: '专题讨论：如何做到廉洁自律', duration: '60分钟', type: 'discussion' },
        ],
        description: '本课程聚焦党风廉政建设，通过系统讲授全面从严治党要求、党纪党规、警示案例，引导党员干部知敬畏、存戒惧、守底线，增强廉洁自律意识。',
        learningObjectives: [
          '深刻领会全面从严治党的重大意义',
          '熟练掌握党纪党规的具体要求',
          '通过案例警示增强廉洁自律意识',
          '树立正确的权力观、地位观、利益观',
        ],
      }
    },
  ];

  const thinkingSteps = [
    '正在分析课程需求与目标受众...',
    '正在检索相关知识点与资料...',
    '正在设计课程结构与章节安排...',
    '正在生成课程内容与学习目标...',
    '正在优化课程大纲与教学设计...',
    '课程生成完成！',
  ];

  const handlePresetClick = (plan: any) => {
    setCourseTopic(plan.name);
    handleGenerate(plan.data);
  };

  const handleGenerate = (presetData?: any) => {
    if (!courseTopic.trim() && !presetData) return;

    setIsGenerating(true);
    setCurrentStep(0);
    setShowResult(false);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    setTimeout(() => {
      const courseData = presetData || {
        courseName: `${courseTopic}专题课程`,
        courseType: '专题课程',
        totalHours: Math.floor(Math.random() * 8) + 4,
        difficulty: '中级',
        targetAudience: '统战系统干部',
        chapters: generateChapters(courseTopic),
        description: `本课程围绕"${courseTopic}"主题，系统讲解相关理论知识和实践方法，帮助学员全面掌握核心要义，提升业务能力。`,
        learningObjectives: [
          `深刻理解${courseTopic}的核心内涵`,
          `掌握相关的政策要求和工作方法`,
          `提升解决实际问题的能力`,
          `推动工作创新发展`,
        ],
      };
      setGeneratedCourse(courseData);
      setEditedChapters([...courseData.chapters]);
      setIsGenerating(false);
      setShowResult(true);
    }, 2500);
  };

  const generateChapters = (topic: string) => {
    const chapterCount = Math.floor(Math.random() * 4) + 4;
    return Array.from({ length: chapterCount }, (_, i) => ({
      id: i + 1,
      title: `第${i + 1}讲：${topic}核心知识点${i + 1}`,
      duration: `${Math.floor(Math.random() * 30) + 20}分钟`,
      type: Math.random() > 0.7 ? 'discussion' : 'video',
    }));
  };

  const handleChapterEdit = (index: number, field: string, value: any) => {
    const newChapters = [...editedChapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setEditedChapters(newChapters);
  };

  const handleAddChapter = () => {
    setEditedChapters([
      ...editedChapters,
      {
        id: editedChapters.length + 1,
        title: '新增章节',
        duration: '30分钟',
        type: 'video',
      },
    ]);
  };

  const handleDeleteChapter = (index: number) => {
    const newChapters = editedChapters.filter((_, i) => i !== index);
    setEditedChapters(newChapters);
  };

  const handleSave = () => {
    setGeneratedCourse({ ...generatedCourse, chapters: editedChapters });
    setEditMode(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        {/* 搜索栏 */}
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
            <TabsTrigger value="ai-course">AI生成课程</TabsTrigger>
          </TabsList>

          {/* 系统课程 */}
          <TabsContent value="courses">
            {/* 分类浏览 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">分类浏览</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.filter(cat => cat.id !== 'ai-course').map((cat) => (
                  <Link key={cat.id} href={`/?channel=${cat.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-red-100 hover:border-red-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {typeof cat.count === 'number' ? `${cat.count.toLocaleString()} 课程` : cat.count}
                            </div>
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

          {/* AI生成课程 */}
          <TabsContent value="ai-course">
            <Card className="mb-8 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      AI智能生成课程
                    </h2>
                    <div className="flex gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="输入课程主题，如：习近平关于宗教工作的重要论述..."
                          className="pl-10 border-purple-200 h-12 text-base"
                          value={courseTopic}
                          onChange={(e) => setCourseTopic(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                      </div>
                      <Button
                        className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => handleGenerate()}
                        disabled={isGenerating || !courseTopic.trim()}
                      >
                        {isGenerating ? '生成中...' : '🚀 AI生成'}
                      </Button>
                    </div>

                    {/* AI思考过程 */}
                    {isGenerating && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                          <span className="animate-pulse">🤖</span> AI正在生成课程
                        </h3>
                        <div className="space-y-2">
                          {thinkingSteps.slice(0, currentStep + 1).map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-purple-800 pl-4 relative">
                              {idx < currentStep ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 absolute left-0" />
                              ) : (
                                <span className="absolute left-0 animate-pulse">●</span>
                              )}
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 预设主题 */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                        热门预设主题：
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {presetCourseTopics.map(plan => (
                          <Button
                            key={plan.key}
                            variant="secondary"
                            size="sm"
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs"
                            onClick={() => handlePresetClick(plan)}
                            disabled={isGenerating}
                          >
                            {plan.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 生成结果 */}
            {showResult && generatedCourse && (
              <>
                {/* 课程基本信息 */}
                <Card className="mb-8 border-purple-200 border-l-4 border-l-purple-600">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-purple-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {editMode ? '编辑课程大纲' : generatedCourse.courseName}
                      </CardTitle>
                      <div className="flex gap-2">
                        {editMode ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                              取消编辑
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                              <Save className="h-4 w-4 mr-1" />
                              保存修改
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                            <Edit3 className="h-4 w-4 mr-1" />
                            编辑大纲
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">课程类型</div>
                          <div className="font-semibold">{generatedCourse.courseType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">总学时</div>
                          <div className="font-semibold">{generatedCourse.totalHours}学时</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          <Lightbulb className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">难度等级</div>
                          <div className="font-semibold">{generatedCourse.difficulty}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">目标受众</div>
                          <div className="font-semibold text-sm">{generatedCourse.targetAudience}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">课程简介</h3>
                      <p className="text-gray-600">{generatedCourse.description}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        学习目标
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {generatedCourse.learningObjectives.map((obj: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-purple-700">
                            <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* 课程章节 */}
                <Card className="mb-8 border-red-100">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-red-600" />
                        课程章节（共{editMode ? editedChapters.length : generatedCourse.chapters.length}章）
                      </span>
                      {editMode && (
                        <Button size="sm" variant="outline" onClick={handleAddChapter}>
                          <Plus className="h-4 w-4 mr-1" />
                          添加章节
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(editMode ? editedChapters : generatedCourse.chapters).map((chapter: any, idx: number) => (
                        <div key={chapter.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:border-purple-200 transition-all bg-white">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editMode ? (
                              <div className="space-y-2">
                                <Input
                                  value={chapter.title}
                                  onChange={(e) => handleChapterEdit(idx, 'title', e.target.value)}
                                  className="font-semibold"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={chapter.duration}
                                    onChange={(e) => handleChapterEdit(idx, 'duration', e.target.value)}
                                    className="w-32 text-sm"
                                    placeholder="学时"
                                  />
                                  <select
                                    value={chapter.type}
                                    onChange={(e) => handleChapterEdit(idx, 'type', e.target.value)}
                                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                                  >
                                    <option value="video">视频课</option>
                                    <option value="discussion">研讨课</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="font-semibold">{chapter.title}</div>
                                <div className="flex items-center gap-4 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {chapter.duration}
                                  </Badge>
                                  <Badge className={`text-xs ${chapter.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {chapter.type === 'video' ? '视频课' : '研讨课'}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                          {!editMode && (
                            <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-500">
                              <Play className="h-4 w-4 mr-1" />
                              开始学习
                            </Button>
                          )}
                          {editMode && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteChapter(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 底部操作栏 */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 flex items-center justify-between">
                  <div className="text-gray-700">
                    课程已生成：<strong className="text-purple-700">{generatedCourse.courseName}</strong> ·
                    共<strong className="text-purple-700">{editMode ? editedChapters.length : generatedCourse.chapters.length}</strong>章节 ·
                    <strong className="text-purple-700">{generatedCourse.totalHours}</strong>学时
                  </div>
                  <div className="flex gap-3">
                    <Button size="lg" variant="outline">
                      收藏课程
                    </Button>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      确认创建
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
