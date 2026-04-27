'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lightbulb, 
  MessageSquare, 
  Bookmark, 
  CheckCircle2, 
  Clock,
  Bot,
  Play,
  Pause,
  Volume2,
  Highlighter,
  Zap,
  Target,
  BrainCircuit,
  Video,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 辅助函数：获取课程视频 URL
function getCourseVideoUrl(courseId: string): string | null {
  // 从 localStorage 读取课程映射信息
  try {
    const courseMapping = localStorage.getItem('course_video_mapping');
    if (courseMapping) {
      const mapping = JSON.parse(courseMapping);
      if (mapping[courseId]) {
        return `/api/video/${mapping[courseId]}`;
      }
    }
  } catch (e) {
    console.error('[课程学习] 读取视频映射失败:', e);
  }
  
  // 默认返回 null，表示没有视频
  return null;
}

// 辅助函数：获取课程配图
// 图片命名规则: X-X-X.jpg (课程代号-章节代号-页码)
function getCourseImageUrl(courseCode: string, chapterIndex: number, pageIndex: number): string | null {
  const imageName = `${courseCode}-${chapterIndex}-${pageIndex}`;
  const knownImages = [
    '1-1-1', '1-1-2', '1-3-1', '1-3-2', '1-4-2', '1-5-1', '1-5-2', '1-5-3',
    '1-6-1', '1-6-2', '1-6-3', '1-7-1', '1-7-2', '1-8-1', '1-8-2',
    '2-1-1', '2-2-1', '2-3-1', '2-3-2', '2-4-1', '2-4-2', '2-5-1',
    '2-6-1', '2-7-1', '2-8-1', '2-9-1', '2-10-1',
    '3-1-1', '3-2-1', '3-3-1', '3-4-1', '3-5-1', '3-6-1', '3-6-2',
    '3-7-1', '3-8-1',
  ];
  if (knownImages.includes(imageName)) {
    return `/${imageName}.jpg`;
  }
  if (courseCode === '2' || courseCode === '3') {
    return `/${imageName}.jpg`;
  }
  return null;
}

// AI能力标签类型
type AITagType = '知识点' | '重点' | '延伸思考' | 'AI提醒';

interface AITag {
  text: string;
  type: AITagType;
  explanation: string;
}

interface ContentBlock {
  type: 'text' | 'image' | 'mixed' | 'video';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  aiTags?: AITag[];
}

interface ChapterData {
  id: number;
  title: string;
  totalSlides: number;
  slides: ContentBlock[];
  aiSummary: string;
  keyPoints: string[];
  videoUrl?: string; // 章节视频 URL
}

// 模拟课程数据（备用，当localStorage没有数据时使用）
const mockCourseData = {
  id: 1,
  name: '乡村振兴战略核心知识点',
  description: '深入学习乡村振兴战略的政策要点、实践路径与创新思维',
  totalHours: 0.8,
  chapters: [
    {
      id: 1,
      title: '第一讲：乡村振兴战略概述',
      totalSlides: 6,
      aiSummary: '本讲从宏观角度梳理乡村振兴战略的历史背景、核心要义与时代价值。AI根据200+政策文件提炼出5大核心维度，帮助您快速建立知识框架。',
      keyPoints: ['战略背景', '核心要义', '五大振兴', '实施路径', '时代价值'],
      slides: [
        [
          {
            type: 'text',
            content: '乡村振兴战略是党的十九大提出的重大决策部署，是新时代"三农"工作的总抓手。',
            aiTags: [
              { text: '党的十九大', type: '知识点', explanation: '2017年10月召开，首次提出乡村振兴战略' },
              { text: '总抓手', type: '重点', explanation: '意味着这是三农工作的核心和统领' },
            ],
          },
        ],
        [
          {
            type: 'mixed',
            content: '乡村振兴的五大核心目标：产业振兴、人才振兴、文化振兴、生态振兴、组织振兴。这五大振兴相互关联、互为支撑，构成了乡村振兴的完整体系。',
            imageUrl: '/placeholder-strategy.png',
            imageCaption: '乡村振兴战略体系架构图',
            aiTags: [
              { text: '五大振兴', type: '知识点', explanation: '产业、人才、文化、生态、组织五个维度的全面振兴' },
              { text: '相互关联', type: 'AI提醒', explanation: 'AI分析发现这五个维度在实际案例中常常协同推进' },
            ],
          },
        ],
        [
          {
            type: 'text',
            content: '产业振兴是乡村振兴的物质基础。要推动乡村产业高质量发展，培育新产业新业态新模式，促进农村一二三产业融合发展。',
            aiTags: [
              { text: '产业融合', type: '延伸思考', explanation: '思考：您所在地区的一二三产业融合现状如何？' },
            ],
          },
        ],
        [
          {
            type: 'image',
            content: '',
            imageUrl: '/placeholder-industry.png',
            imageCaption: '乡村产业融合发展示意图——从单一农业到多元业态的转型升级',
          },
        ],
        [
          {
            type: 'text',
            content: '人才振兴是乡村振兴的关键因素。要培养造就一支懂农业、爱农村、爱农民的"三农"工作队伍，吸引各类人才在乡村振兴中建功立业。',
            aiTags: [
              { text: '懂农业、爱农村、爱农民', type: '重点', explanation: '这是人才队伍建设的核心标准' },
            ],
          },
        ],
        [
          {
            type: 'mixed',
            content: '文化振兴是乡村振兴的灵魂。要深入挖掘优秀传统农耕文化蕴含的思想观念、人文精神、道德规范，培育文明乡风、良好家风、淳朴民风。',
            imageUrl: '/placeholder-culture.png',
            imageCaption: '传统农耕文化与现代文明交融',
            aiTags: [
              { text: '文化振兴', type: '知识点', explanation: '包括乡风文明、家风建设、民风培育三个层面' },
            ],
          },
        ],
      ],
    },
    {
      id: 2,
      title: '第二讲：产业振兴与融合发展',
      totalSlides: 6,
      aiSummary: '本讲聚焦产业振兴，AI整合了全国100+成功案例，提炼出"龙头企业+合作社+农户"等核心模式。',
      keyPoints: ['产业定位', '融合发展', '龙头企业', '品牌建设', '数字农业'],
      slides: [
        [
          {
            type: 'text',
            content: '产业振兴的关键在于找准定位、发挥特色。各地应结合自身资源禀赋，发展特色农业、乡村旅游、农村电商等新业态。',
            aiTags: [
              { text: '资源禀赋', type: '知识点', explanation: '指当地独特的自然资源和人文资源' },
            ],
          },
        ],
        [
          {
            type: 'mixed',
            content: '"龙头企业+合作社+农户"是当前最成功的产业组织模式。龙头企业负责市场开拓和技术引领，合作社负责组织生产，农户参与具体生产环节。',
            imageUrl: '/placeholder-model.png',
            imageCaption: '产业组织模式架构图',
          },
        ],
      ],
    },
    {
      id: 3,
      title: '第三讲：人才振兴与队伍建设',
      totalSlides: 6,
      aiSummary: 'AI通过分析3000+乡村人才案例，总结出引才、育才、留才三大策略体系。',
      keyPoints: ['引才政策', '本土培育', '人才留用', '激励机制'],
      slides: [
        [
          {
            type: 'text',
            content: '人才是第一资源。乡村振兴需要吸引城市人才下乡、鼓励本土人才创业、培养新型职业农民，形成多元化的人才支撑体系。',
          },
        ],
      ],
    },
    {
      id: 4,
      title: '第四讲：文化振兴与乡风文明',
      totalSlides: 6,
      aiSummary: 'AI梳理了500+优秀村规民约案例，提炼出文化振兴的核心要素。',
      keyPoints: ['村规民约', '文化传承', '文明实践', '精神家园'],
      slides: [
        [
          {
            type: 'text',
            content: '文化振兴是乡村振兴的灵魂工程。要通过传承优秀农耕文化、培育文明乡风、建设文化阵地，筑牢乡村振兴的精神根基。',
          },
        ],
      ],
    },
    {
      id: 5,
      title: '第五讲：生态振兴与绿色发展',
      totalSlides: 6,
      aiSummary: 'AI整合了"绿水青山就是金山银山"理念的100+实践案例。',
      keyPoints: ['绿色发展', '人居环境', '生态保护', '低碳乡村'],
      slides: [
        [
          {
            type: 'text',
            content: '生态振兴是乡村振兴的内在要求。要坚持绿色发展理念，推进农村人居环境整治，建设生态宜居的美丽乡村。',
          },
        ],
      ],
    },
    {
      id: 6,
      title: '第六讲：组织振兴与基层治理',
      totalSlides: 6,
      aiSummary: 'AI分析了200+优秀基层党组织案例，总结出组织振兴的关键路径。',
      keyPoints: ['基层党建', '自治法治德治', '集体经济', '治理创新'],
      slides: [
        [
          {
            type: 'text',
            content: '组织振兴是乡村振兴的根本保证。要加强农村基层党组织建设，完善自治、法治、德治相结合的乡村治理体系。',
          },
        ],
      ],
    },
  ],
};

// 从localStorage读取AI生成的课程数据
function getCourseData(courseId?: string): any {
  try {
    const saved = localStorage.getItem('current_ai_course');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // 根据课程名称确定课程代号
      let courseCode = '1';
      const courseName = parsed.courseName || '';
      if (courseName.includes('统一战线') || courseName.includes('统战')) courseCode = '2';
      else if (courseName.includes('廉政') || courseName.includes('党风')) courseCode = '3';
      else if (courseName.includes('党章')) courseCode = '4';
      else if (courseName.includes('基层') || courseName.includes('党务')) courseCode = '5';
      
      return {
        id: parsed.chapters?.[0]?.id || 1,
        name: parsed.courseName || 'AI生成课程',
        description: parsed.description || '',
        totalHours: parsed.totalHours || 8,
        chapters: (parsed.chapters || []).map((ch: any, chIdx: number) => {
          const videoUrl = getCourseVideoUrl(ch.id?.toString() || courseId || '');
          const chapterContent = ch.content || '';
          const slides = [];
          
          if (videoUrl) {
            slides.push({ type: 'video', content: '', videoUrl });
          }
          
          if (chapterContent) {
            const paragraphs = chapterContent.split('\n\n').filter((p: string) => p.trim());
            const paragraphsPerPage = 3;
            let imgPageIndex = 0;
            const forceImageSlide = courseCode === '2' || courseCode === '3';
            for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
              const pageParagraphs = paragraphs.slice(i, i + paragraphsPerPage);
              const pageContent = pageParagraphs.join('\n\n');
              imgPageIndex++;
              
              const hasImage = pageContent.includes('案例') || pageContent.includes('【') || pageContent.includes('目标');
              const imageUrl = getCourseImageUrl(courseCode, chIdx + 1, imgPageIndex);
              
              if (forceImageSlide || hasImage || imageUrl) {
                slides.push({
                  type: 'mixed',
                  content: pageContent,
                  imageUrl: imageUrl || undefined,
                  imageCaption: imageUrl ? `${ch.title} 知识图谱` : undefined,
                  aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, '').replace(/课程概述/, '概述').substring(0, 15), type: '知识点', explanation: '本讲核心知识点' }],
                });
              } else {
                slides.push({
                  type: 'text',
                  content: pageContent,
                  aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, '').replace(/课程概述/, '概述').substring(0, 15), type: '知识点', explanation: '本讲核心知识点' }],
                });
              }
            }
          } else {
            slides.push({ type: 'text', content: ch.title + '。本讲内容涵盖相关核心知识点，帮助您全面理解和掌握。', aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, ''), type: '知识点', explanation: '本讲核心知识点' }] });
            slides.push({ type: 'mixed', content: `${ch.title}的详细解读。AI根据知识图谱为您整理关键要点和深入分析，帮助您快速理解和应用。`, imageCaption: `${ch.title}知识图谱`, aiTags: [{ text: '核心要点', type: '重点', explanation: '本讲最重要的知识点' }] });
          }
          
          slides.push({ type: 'text', content: `【本讲总结】\n${ch.title}学习完成。请回顾本讲核心内容，思考如何在实际工作中运用所学知识。\n\n【延伸思考】\n结合本讲内容，思考以下问题：\n1. 本讲的核心要义是什么？\n2. 如何在实际工作中应用？\n3. 还有哪些需要深入学习的方面？`, aiTags: [{ text: '总结思考', type: '延伸思考', explanation: '对本讲内容进行回顾与反思' }] });
          
          return { id: ch.id, title: ch.title, totalSlides: slides.length, aiSummary: `第${chIdx + 1}讲：${ch.title.replace(/第.*讲[：:]/, '')}。本讲深入讲解核心要义，帮助您全面掌握相关知识点和实践方法。`, keyPoints: [ch.title.replace(/第.*讲[：:]/, '').substring(0, 10)], videoUrl, slides };
        }),
      };
    }
  } catch (e) {
    console.error('[课程学习] 读取课程数据失败:', e);
  }
  
  // 如果没有AI生成课程数据，尝试使用courseId加载对应课程
  if (courseId) {
    const videoUrl = getCourseVideoUrl(courseId);
    return {
      id: courseId,
      name: `课程 ${courseId}`,
      description: 'AI推荐课程',
      totalHours: 0.2,
      chapters: [
        {
          id: courseId,
          title: `课程 ${courseId}`,
          totalSlides: videoUrl ? 3 : 2,
          aiSummary: 'AI根据知识图谱为您推荐此课程。',
          keyPoints: ['核心知识点'],
          videoUrl: videoUrl,
          slides: [
            ...(videoUrl ? [{
              type: 'video',
              content: '',
              videoUrl: videoUrl,
            }] : []),
            {
              type: 'text',
              content: '欢迎学习本课程。AI知识图谱为您精选此课程，帮助您快速掌握相关知识点。',
              aiTags: [
                { text: 'AI推荐', type: '知识点', explanation: '此课程由AI知识图谱智能推荐' },
              ],
            },
          ],
        },
      ],
    };
  }
  
  return mockCourseData;
}

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAITag, setShowAITag] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([
    { role: 'ai', content: '您好！我是AI学习助手。您可以问我关于当前课程内容的任何问题，我会基于知识图谱为您提供精准解答。' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`completed_slides_${courseId}`);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return new Set();
  });
  const [showAISummary, setShowAISummary] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false); // 是否正在拖动进度条

  const course = getCourseData(courseId);
  const chapter = course.chapters[currentChapter];
  const slides = chapter?.slides || [];
  const currentSlideData = slides[currentSlide] ? [slides[currentSlide]] : [];
  const totalSlides = slides.length;
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;
  
  // 获取当前章节或幻灯片的视频 URL
  const currentVideoUrl = chapter.videoUrl || currentSlideData.find((s: ContentBlock) => s.type === 'video')?.videoUrl || null;

  // 视频控制条自动隐藏
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowVideoControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isPlaying) {
          setShowVideoControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [isPlaying]);

  // 保存完成进度到localStorage
  useEffect(() => {
    localStorage.setItem(`completed_slides_${courseId}`, JSON.stringify([...completedSlides]));
  }, [completedSlides, courseId]);

  // 返回时同步课程数据到 ai_generated_course
  useEffect(() => {
    const syncCourseData = () => {
      const currentCourse = localStorage.getItem('current_ai_course');
      if (currentCourse) {
        try {
          const parsed = JSON.parse(currentCourse);
          // 同步到 ai_generated_course 供 /library 页面恢复状态
          localStorage.setItem('ai_generated_course', currentCourse);
        } catch {
          // ignore
        }
      }
    };

    // 页面卸载或隐藏时同步
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncCourseData();
      }
    };

    // 窗口失去焦点时同步
    const handleBlur = () => {
      syncCourseData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      // 组件卸载时也要同步
      syncCourseData();
    };
  }, []);

  // 获取所有已完成的学习进度
  const getTotalProgress = () => {
    let total = 0;
    let completed = 0;
    course.chapters.forEach((ch: ChapterData, chIdx: number) => {
      ch.slides.forEach((_: ContentBlock, slIdx: number) => {
        total++;
        if (completedSlides.has(`${chIdx}-${slIdx}`)) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // AI标签颜色映射
  const getTagColor = (type: AITagType) => {
    switch (type) {
      case '知识点': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '重点': return 'bg-red-100 text-red-700 border-red-300';
      case '延伸思考': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'AI提醒': return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const getTagIcon = (type: AITagType) => {
    switch (type) {
      case '知识点': return <Lightbulb className="h-3 w-3" />;
      case '重点': return <Target className="h-3 w-3" />;
      case '延伸思考': return <BrainCircuit className="h-3 w-3" />;
      case 'AI提醒': return <Zap className="h-3 w-3" />;
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setShowAITag(null);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      const prevChapter = course.chapters[currentChapter - 1];
      setCurrentSlide(prevChapter.slides.length - 1);
      setShowAITag(null);
    }
  };

  const handleNextSlide = () => {
    // 标记当前页为已完成
    setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setShowAITag(null);
    } else if (currentChapter < course.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentSlide(0);
      setShowAISummary(true);
    } else {
      // 最后一章的最后一页，标记完成后返回课程列表
      setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
      router.push('/library');
    }
  };

  const isLastSlide = currentChapter === course.chapters.length - 1 && currentSlide === slides.length - 1;

  const handleChapterSelect = (index: number) => {
    setCurrentChapter(index);
    setCurrentSlide(0);
    setShowAISummary(true);
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    const userQuestion = chatInput;
    setChatInput('');

    // 模拟AI回复
    setTimeout(() => {
      const aiResponses = [
        `关于"${userQuestion}"，根据课程内容和党建知识图谱，我为您总结如下：\n\n这是本课程的核心知识点之一。建议您结合当前页面内容，重点理解其政策背景和实践意义。`,
        `这是一个很好的问题！根据AI知识图谱分析，该知识点与当前章节的关联度为85%。\n\n核心要点：\n1. 政策依据明确\n2. 实践路径清晰\n3. 地方创新活跃`,
        `基于知识图谱的深度分析，这个问题的答案涉及多个维度：\n\n📌 理论层面：相关政策文件有明确规定\n📌 实践层面：各地已有丰富经验可供参考\n📌 创新层面：建议结合本地实际进行探索`,
      ];
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponses[Math.floor(Math.random() * aiResponses.length)] }]);
    }, 800);
  };

  const toggleChapterExpand = (index: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const isSlideCompleted = (chIdx: number, slIdx: number) => {
    return completedSlides.has(`${chIdx}-${slIdx}`);
  };

  // 视频控制函数
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 视频播放进度达到80%时自动标记当前页为已完成
  const handleVideoTimeUpdateWithCompletion = () => {
    if (videoRef.current && !isSeeking) {
      setVideoProgress(videoRef.current.currentTime);
      if (videoDuration > 0) {
        const progress = videoRef.current.currentTime / videoDuration;
        if (progress >= 0.8) {
          setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
        }
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoSeekStart = () => {
    setIsSeeking(true);
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoProgress(time); // 先更新UI进度
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoSeekEnd = () => {
    setIsSeeking(false);
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white relative" style={{
      backgroundImage: 'url(/tx_homeBanner.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 顶部导航栏 */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-50" style={{ boxShadow: '0 2px 0 0 #000' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：返回 + 课程信息 */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="border-2 border-black" style={{ borderRadius: '0' }} onClick={() => router.replace('/library')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-black text-black">{course.name}</h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.totalHours}学时
                  </span>
                  <span>共{course.chapters.length}章</span>
                  <span className="text-orange-600 font-bold">
                    总进度 {getTotalProgress()}%
                  </span>
                </div>
              </div>
            </div>

            {/* 右侧：AI功能按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black font-bold text-xs"
                style={{ borderRadius: '0' }}
                onClick={() => setShowAISummary(!showAISummary)}
              >
                <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
                AI摘要
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-2 font-bold text-xs ${showChatPanel ? 'bg-purple-100 border-purple-600' : 'border-black'}`}
                style={{ borderRadius: '0' }}
                onClick={() => setShowChatPanel(!showChatPanel)}
              >
                <Bot className="h-3 w-3 mr-1" />
                AI问答
              </Button>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 font-bold">
                第{currentChapter + 1}章 / 共{course.chapters.length}章 · {chapter.title}
              </span>
              <span className="text-purple-600 font-bold">
                {currentSlide + 1} / {totalSlides}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* 左侧章节导航 */}
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white border-2 border-black sticky top-32" style={{ boxShadow: '3px 3px 0 0 #000' }}>
            <div className="p-4 bg-black text-white">
              <h3 className="font-black text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                课程章节
              </h3>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {course.chapters.map((ch: ChapterData, idx: number) => (
                <div key={ch.id}>
                  <button
                    onClick={() => handleChapterSelect(idx)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      idx === currentChapter ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded border-2 font-black text-sm ${
                      idx === currentChapter 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${idx === currentChapter ? 'text-purple-700' : 'text-gray-700'}`}>
                        {ch.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {ch.slides.length}页 · {ch.keyPoints.length}个知识点
                      </div>
                    </div>
                    {ch.slides.every((_slide: ContentBlock, slIdx: number) => isSlideCompleted(idx, slIdx)) && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 中间主要内容区 */}
        <main className="flex-1 min-w-0">
          {/* AI摘要提示 */}
          {showAISummary && (
            <div className="mb-4 border-2 border-purple-600 bg-purple-50 p-4 relative" style={{ boxShadow: '3px 3px 0 0 #000' }}>
              <div className="absolute -top-2.5 left-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">
                AI章节摘要
              </div>
              <div className="flex items-start gap-3 mt-1">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-purple-800 leading-relaxed">{chapter.aiSummary}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {chapter.keyPoints.map((point: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 内容展示区 - 图文混合 */}
          <Card className="border-2 border-black mb-4 min-h-[500px]" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <CardContent className="p-8">
              {/* 页码指示 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white">
                    第{currentSlide + 1}页
                  </Badge>
                  <span className="text-sm text-gray-500">共{totalSlides}页</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* AI能力标识 */}
                  <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI图文混合
                  </Badge>
                </div>
              </div>

              {/* 内容块渲染 */}
              <div className="space-y-6">
                {currentSlideData.map((block: ContentBlock, blockIdx: number) => (
                  <div key={blockIdx}>
                    {/* 纯文本 */}
                    {block.type === 'text' && (
                      <div className="relative">
                        <p className="text-base text-gray-800 leading-relaxed">
                          {renderTextWithAITags(block.content, block.aiTags, showAITag, setShowAITag)}
                        </p>
                      </div>
                    )}

                    {/* 纯图片 */}
                    {block.type === 'image' && (
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                              <span className="text-3xl">📊</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{block.imageCaption}</p>
                          </div>
                        </div>
                        {block.imageCaption && (
                          <div className="p-3 bg-gray-50 text-xs text-gray-500 text-center">
                            ▲ {block.imageCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 图文混合 */}
                    {block.type === 'mixed' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="relative">
                          <p className="text-base text-gray-800 leading-relaxed">
                            {renderTextWithAITags(block.content, block.aiTags, showAITag, setShowAITag)}
                          </p>
                        </div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          {block.imageUrl ? (
                            <>
                            <img
                              src={block.imageUrl}
                              alt={block.imageCaption || '课程配图'}
                              className="w-full h-auto object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling;
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-center p-4">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                                  <span className="text-2xl">📊</span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">{block.imageCaption || '课程配图'}</p>
                                <p className="text-xs text-gray-400 mt-1">图片加载中，请稍后</p>
                              </div>
                            </div>
                            </>
                          ) : (
                            <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center">
                              <div className="text-center p-4">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                                  <span className="text-2xl">📈</span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">{block.imageCaption}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 视频播放 */}
                    {block.type === 'video' && block.videoUrl && (
                      <div className="border-2 border-black relative bg-black" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                        <video
                          ref={videoRef}
                          src={block.videoUrl}
                          className="w-full aspect-video"
                          onTimeUpdate={handleVideoTimeUpdateWithCompletion}
                          onLoadedMetadata={handleVideoLoadedMetadata}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                        
                        {/* 视频控制栏 */}
                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                          showVideoControls ? 'opacity-100' : 'opacity-0'
                        }`}>
                          {/* 进度条 */}
                          <div className="mb-3 relative group">
                            <input
                              type="range"
                              min="0"
                              max={videoDuration || 100}
                              value={videoProgress}
                              onChange={handleVideoSeek}
                              onMouseDown={handleVideoSeekStart}
                              onMouseUp={handleVideoSeekEnd}
                              onTouchStart={handleVideoSeekStart}
                              onTouchEnd={handleVideoSeekEnd}
                              className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer group-hover:h-2 transition-all"
                              style={{
                                background: `linear-gradient(to right, #8b5cf6 ${videoDuration ? (videoProgress / videoDuration) * 100 : 0}%, #4b5563 ${videoDuration ? (videoProgress / videoDuration) * 100 : 0}%)`,
                              }}
                            />
                            {/* 进度条滑块 */}
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              style={{
                                left: `${videoDuration ? (videoProgress / videoDuration) * 100 : 0}%`,
                                marginLeft: '-6px',
                              }}
                            />
                          </div>
                          
                          {/* 控制按钮 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={toggleVideoPlay}
                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5 text-black" />
                                ) : (
                                  <Play className="h-5 w-5 text-black ml-1" />
                                )}
                              </button>
                              <span className="text-white text-sm font-mono">
                                {formatTime(videoProgress)} / {formatTime(videoDuration)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleFullscreen}
                                className="w-8 h-8 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors"
                              >
                                {isFullscreen ? (
                                  <Minimize2 className="h-4 w-4 text-white" />
                                ) : (
                                  <Maximize2 className="h-4 w-4 text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* AI视频标签 */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <Badge className="bg-purple-600 text-white border border-purple-400 shadow-lg">
                            <Video className="h-3 w-3 mr-1" />
                            AI视频课程
                          </Badge>
                          <Badge className="bg-black/70 text-white border border-white/30 text-xs">
                            {chapter.title}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI标签浮窗 */}
              {showAITag && (() => {
                const allTags = currentSlideData.flatMap((b: ContentBlock) => b.aiTags || []);
                const tag = allTags.find((t: AITag) => t.text === showAITag);
                if (!tag) return null;
                return (
                  <div className="mt-4 p-4 border-2 border-amber-400 bg-amber-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                    <button
                      onClick={() => setShowAITag(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 border ${getTagColor(tag.type)}`}>
                            {getTagIcon(tag.type)}
                            {tag.type}
                          </span>
                          <span className="text-sm font-bold text-gray-800">{tag.text}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{tag.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* 翻页控制 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="border-2 border-black font-bold"
              style={{ borderRadius: '0' }}
              onClick={handlePrevSlide}
              disabled={currentChapter === 0 && currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black"
                style={{ borderRadius: '0' }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-bold text-gray-700">
                {currentSlide + 1} / {totalSlides}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-black"
                style={{ borderRadius: '0' }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            {isLastSlide ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-black"
                style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                onClick={handleNextSlide}
              >
                返回课程列表
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold border-2 border-black"
                style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                onClick={handleNextSlide}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </main>

        {/* 右侧AI问答面板 */}
        {showChatPanel && (
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white border-2 border-black sticky top-32" style={{ boxShadow: '3px 3px 0 0 #000' }}>
              <div className="p-4 bg-purple-600 text-white">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI学习助手
                </h3>
                <p className="text-xs text-white/70 mt-1">基于知识图谱 · 精准答疑</p>
              </div>
              
              {/* 消息列表 */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 text-sm rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span className="text-[10px] font-bold text-purple-600">AI助手</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 输入框 */}
              <form onSubmit={handleChatSubmit} className="p-3 border-t-2 border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="输入您的问题..."
                    className="flex-1 px-3 py-2 text-sm border-2 border-black"
                    style={{ borderRadius: '0' }}
                  />
                  <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-black" style={{ borderRadius: '0' }}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// 渲染文本并添加AI标签交互
function renderTextWithAITags(
  content: string, 
  aiTags: AITag[] = [], 
  showAITag: string | null, 
  setShowAITag: (tag: string | null) => void
) {
  if (!aiTags || aiTags.length === 0) {
    return content;
  }

  let result: React.ReactNode[] = [content];
  
  aiTags.forEach(tag => {
    const newResult: React.ReactNode[] = [];
    result.forEach(part => {
      if (typeof part !== 'string') {
        newResult.push(part);
        return;
      }
      
      const idx = part.indexOf(tag.text);
      if (idx === -1) {
        newResult.push(part);
        return;
      }
      
      const before = part.substring(0, idx);
      const match = part.substring(idx, idx + tag.text.length);
      const after = part.substring(idx + tag.text.length);
      
      newResult.push(
        before,
        <span
          key={`${tag.text}-${idx}`}
          onClick={() => setShowAITag(showAITag === tag.text ? null : tag.text)}
          className={`inline cursor-pointer border-b-2 border-dashed transition-colors ${
            showAITag === tag.text 
              ? 'bg-amber-200 border-amber-500' 
              : 'border-amber-400 hover:bg-amber-100'
          }`}
        >
          {match}
        </span>,
        after
      );
    });
    result = newResult;
  });

  return result;
}
