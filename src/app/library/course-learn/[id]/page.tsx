'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DigitalAvatar from '@/components/digital-avatar';
import { loadCourseScript, getChapterSpeechContent, getChapterSections, type ChapterScript } from '@/lib/course-script';
import ChapterQuizComponent from '@/components/chapter-quiz';
import { getChapterQuiz } from '@/data/quiz-database';
import { ChapterQuiz } from '@/lib/quiz-types';

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
  const imageKey = `${courseCode}-${chapterIndex}-${pageIndex}`;
  const knownImageMap: Record<string, string> = {
    '4-1-1': '/4-1-1.jpg',
    '4-1-2': '/4-1-2.png',
    '4-1-3': '/4-1-3.jpg',
    '4-1-4': '/4-1-4.png',
    '4-2-1': '/4-2-1.png',
    '4-2-2': '/4-2-2.jpg',
    '4-2-3': '/4-2-3.jpg',
    '4-2-4': '/4-2-4.jpg',
    '4-2-5': '/4-2-5.jpg',
    '4-2-6': '/4-2-6.jpg',
    '4-4-1': '/4-4-1.jpg',
    '4-4-2': '/4-4-2.png',
    '4-4-3': '/4-4-3.png',
    '4-4-4': '/4-4-4.jpg',
    '4-4-5': '/4-4-5.png',
    '4-6-1': '/4-6-1.jpg',
    '4-6-2': '/4-6-2.png',
    '4-6-3': '/4-6-3.png',
    '4-6-4': '/4-6-4.png',
    '4-8-1': '/4-8-1.png',
    '4-8-2': '/4-8-2.png',
    '4-8-3': '/4-8-3.png',
    '4-8-4': '/4-8-4.png',
    '7-1-1': '/7-1-1.png',
    '7-1-2': '/7-1-2.png',
    '7-1-3': '/7-1-3.png',
    '7-1-4': '/7-1-4.png',
    '7-2-1': '/7-2-1.png',
    '7-2-2': '/7-2-2.png',
    '7-2-3': '/7-2-3.png',
    '7-2-4': '/7-2-4.png',
    '7-2-5': '/7-2-5.png',
    '7-4-1': '/7-4-1.png',
    '7-4-2': '/7-4-2.png',
    '7-4-3': '/7-4-3.png',
    '7-4-4': '/7-4-4.png',
    '7-4-5': '/7-4-5.png',
    '7-6-1': '/7-6-1.png',
    '7-6-2': '/7-6-2.png',
    '7-6-3': '/7-6-3.png',
    '7-6-4': '/7-6-4.png',
    '7-8-1': '/7-8-1.png',
    '7-8-2': '/7-8-2.png',
    '7-8-3': '/7-8-3.png',
    '7-8-4': '/7-8-4.png',
    '7-8-5': '/7-8-5.png',
    '7-0-1': '/前言配图（乡村振兴）.png',
    '8-1-1': '/6-1-1.png',
    '8-1-2': '/6-1-2.png',
    '8-2-1': '/6-2-1.png',
    '8-2-2': '/6-2-2.png',
    '8-3-1': '/6-3-1.png',
    '8-3-2': '/6-3-2.png',
    '8-4-1': '/6-4-1.png',
    '8-4-2': '/6-4-2.png',
    '8-5-1': '/6-5-1.png',
    '8-5-2': '/6-5-2.png',
    '8-6-1': '/6-6-1.png',
    '8-6-2': '/6-6-2.png',
    // 台风岗位指挥课程 (courseId=11) 配图
    '11-0-1': '/knowledge-images/11-0-0.png',
    '11-1-1': '/knowledge-images/11-1-1.png',
    '11-1-3': '/knowledge-images/11-1-2.png',
    '11-2-1': '/knowledge-images/11-2-1.png',
    '11-3-1': '/knowledge-images/11-3-1.png',
    '11-3-3': '/knowledge-images/11-3-2.png',
    '11-4-1': '/knowledge-images/11-4-1.png',
    '11-4-3': '/knowledge-images/11-4-2.png',
  };
  if (knownImageMap[imageKey]) {
    return knownImageMap[imageKey];
  }
  if (courseCode === '2' || courseCode === '3') {
    return `/${imageKey}.jpg`;
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

interface ReferenceItem {
  title: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
}

interface RejectedContent {
  content: string;
  reason: string;
  type: 'too_radical' | 'no_meaning' | 'inaccurate' | 'redundant' | 'other';
}

interface ThinkingStep {
  step: number;
  title: string;
  description: string;
  references?: ReferenceItem[];
  rejectedContents?: RejectedContent[];
  output: string;
}

interface ContentBlock {
  type: 'text' | 'image' | 'mixed' | 'video' | 'learning_objective' | 'quiz';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  aiTags?: AITag[];
  chapterTitle?: string;
  thinkingSteps?: ThinkingStep[];
  quizData?: ChapterQuiz;
}

interface ChapterSection {
  title: string;
  content: string;
}

interface ChapterData {
  id: number;
  title: string;
  totalSlides: number;
  slides: ContentBlock[];
  aiSummary: string;
  keyPoints: string[];
  videoUrl?: string; // 章节视频 URL
  sections?: ChapterSection[]; // 章节小节列表
}

// 多样化的参考来源库 - 乡村振兴主题
const REFERENCE_SOURCES: ReferenceItem[] = [
  { title: '中央一号文件：关于实施乡村振兴战略的意见', source: '新华网', relevance: 'high' },
  { title: '全面推进乡村振兴 加快建设农业强国', source: '人民日报', relevance: 'high' },
  { title: '学习运用"千万工程"经验 推进乡村振兴', source: '求是', relevance: 'high' },
  { title: '乡村振兴促进法解读', source: '中国政府网', relevance: 'high' },
  { title: '山东省党员培训分级开发与分类授课经验', source: '共产党员网', relevance: 'high' },
  { title: '"红石榴+"行动：民族工作与乡村振兴融合', source: '人民网', relevance: 'medium' },
  { title: '党支部领办合作社的潍坊实践', source: '大众日报', relevance: 'high' },
  { title: '九部门"春雨润苗"专项行动', source: '国家税务总局', relevance: 'medium' },
  { title: '乡村振兴项目论证与评估指南', source: '农业农村部', relevance: 'high' },
  { title: '农村集体经济发展典型案例', source: '农民日报', relevance: 'medium' },
  { title: '绿水青山就是金山银山的实践路径', source: '中国环境报', relevance: 'medium' },
  { title: '乡村人才振兴与能人返乡创业', source: '人民日报', relevance: 'high' },
  { title: '2025年中央农村工作会议精神解读', source: '新华网', relevance: 'high' },
  { title: '乡村振兴"五大振兴"协同推进机制', source: '求是', relevance: 'high' },
  { title: '从脱贫攻坚到乡村振兴的战略转段', source: '共产党员网', relevance: 'high' },
  { title: '乡村振兴政策汇编与实践案例', source: '农业农村部', relevance: 'medium' },
  { title: '乡村治理有效与基层组织建设', source: '中国社会报', relevance: 'medium' },
  { title: '农村一二三产业融合发展路径', source: '农民日报', relevance: 'medium' },
  { title: '相关政策解读', source: '人民日报', relevance: 'high' },
  { title: '专题学习资料', source: '共产党员网', relevance: 'high' },
  { title: '权威解读', source: '人民网', relevance: 'medium' },
];

// 种子化的伪随机数生成器
function seededRandom(seed: number): () => number {
  return function() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

// 随机选择N个不重复的参考来源 - 使用种子确保同一页结果固定
function getRandomReferences(count: number, title: string, seed: number): ReferenceItem[] {
  const random = seededRandom(seed);
  
  // 使用种子打乱数组
  const shuffled = [...REFERENCE_SOURCES].sort(() => random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // 根据主题调整标题，如果需要的话
  return selected.map(ref => {
    // 如果标题太普通，结合主题
    if ((ref.title === '相关政策解读' || ref.title === '权威解读') && title) {
      return {
        ...ref,
        title: ref.title + '：' + title
      };
    }
    return ref;
  });
}

// 智能生成审核未通过内容 - 使用种子确保同一页结果固定
function getRejectedContents(content: string, title: string, seed: number): RejectedContent[] {
  const random = seededRandom(seed);
  
  // 根据内容类型生成相关的审核未通过示例
  let rejected: RejectedContent[] = [
    { content: '乡村振兴就是给农民发补贴', reason: '理解片面，乡村振兴强调内生发展动力', type: 'inaccurate' },
    { content: '乡村振兴等于把农村变成城市', reason: '观点错误，乡村振兴强调各美其美', type: 'inaccurate' },
    { content: '乡村振兴就是搞农业', reason: '认知不全，产业兴旺包含多元化路径', type: 'inaccurate' },
    { content: '只要投入足够资金就能振兴', reason: '观点错误，忽视产业可持续和群众参与', type: 'inaccurate' },
    { content: '照搬其他地区的模式就行', reason: '不够具体，没有考虑本地实际', type: 'no_meaning' },
    { content: '乡村振兴是农业农村部门的事', reason: '理解片面，需要多部门协同推进', type: 'inaccurate' },
    { content: '这个项目肯定能成功', reason: '表述过于绝对化', type: 'too_radical' },
    { content: '大家都懂的', reason: '内容空洞无实际信息', type: 'no_meaning' },
  ];
  
  // 如果是关于方法或路径的内容，添加相关示例
  if (content.includes('方法') || content.includes('路径') || content.includes('措施')) {
    rejected.unshift({ content: '照搬其他地区的方法就行', reason: '不够具体，没有考虑本地实际', type: 'no_meaning' });
    rejected.unshift({ content: '这个方法肯定成功', reason: '表述过于绝对化', type: 'too_radical' });
  }
  
  // 如果是关于重要性或地位的内容
  if (content.includes('重要') || content.includes('地位')) {
    rejected.unshift({ content: '这个比什么都重要', reason: '表述过于绝对化', type: 'too_radical' });
  }
  
  // 如果是关于合作社或产业的内容
  if (content.includes('合作社') || content.includes('产业')) {
    rejected.unshift({ content: '合作社就是形式主义', reason: '理解片面，合作社是关键制度创新', type: 'inaccurate' });
  }
  
  // 如果是关于群众或参与的内容
  if (content.includes('群众') || content.includes('参与')) {
    rejected.unshift({ content: '群众参与不重要，政府主导就行', reason: '观点错误，群众主体是核心', type: 'inaccurate' });
  }
  
  // 使用种子打乱并返回2个
  return rejected.sort(() => random() - 0.5).slice(0, 2);
}

// 模拟课程数据（备用，当localStorage没有数据时使用）
const mockCourseData = {};

// 无localStorage依赖的静态课程数据（用于SSR同步）
function getStaticFallbackCourseData(courseId?: string): any {
  if (courseId) {
    return {
      id: courseId,
      name: `课程 ${courseId}`,
      description: 'AI推荐课程',
      totalHours: 0.2,
      courseCode: courseId,
      chapters: [
        {
          id: courseId,
          title: `课程 ${courseId}`,
          totalSlides: 2,
          aiSummary: 'AI根据知识图谱为您推荐此课程。',
          keyPoints: ['核心知识点'],
          videoUrl: null,
          slides: [
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
  return {};
}

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
      else if (courseName.includes('具身智能')) courseCode = '4';
      else if (courseName.includes('党章')) courseCode = '5';
      else if (courseName.includes('基层') || courseName.includes('党务')) courseCode = '6';
      else if (courseName.includes('乡村振兴')) courseCode = '7';
      else if (courseName.includes('内涝') || courseName.includes('洪涝') || courseName.includes('防汛') || courseName.includes('应急处置')) courseCode = '8';
      else if (courseName.includes('台风应急标准化处置') || courseName.includes('岗位指挥课程')) courseCode = '11';
      
      return {
        id: parsed.chapters?.[0]?.id || 1,
        name: parsed.courseName || 'AI生成课程',
        description: parsed.description || '',
        totalHours: parsed.totalHours || 8,
        chapters: (parsed.chapters || []).map((ch: any, chIdx: number) => {
          const videoUrl = getCourseVideoUrl(ch.id?.toString() || courseId || '');
          const chapterContent = ch.content || '';
          const slides = [];
          const isChapter3 = (ch.title.includes('第3章') && ch.title.includes('自动') && ch.title.includes('自主')) || (ch.title.includes('第3章') && ch.title.includes('扶贫') && ch.title.includes('振兴'));
          const isChapter5 = (ch.title.includes('第5章') && ch.title.includes('世界模型')) || (ch.title.includes('第5章') && ch.title.includes('合作社'));
          const isChapter7 = (ch.title.includes('第7章') && ch.title.includes('可解释') && ch.title.includes('可评估') && ch.title.includes('可监管')) || (ch.title.includes('第7章') && ch.title.includes('可落地') && ch.title.includes('可评估') && ch.title.includes('可推广'));
          
          if (videoUrl) {
            slides.push({ type: 'video', content: '', videoUrl });
          }
          
          if (chapterContent) {
            const processedContent = chapterContent.replace(/\[IMG:([^:]+):([^\]]*)\]/g, '![$2]($1)');
            
            if (processedContent.includes('---PAGE---')) {
              const pageSections = processedContent.split('---PAGE---').filter((p: string) => p.trim());
              let pIndex = 0;
              const chapterNumMatch = ch.title.match(/第(\d+)章/);
              const chapterImageNum = chapterNumMatch ? parseInt(chapterNumMatch[1]) : 0;
              for (const section of pageSections) {
                const trimmed = section.trim();
                const isLearningObjective = trimmed.startsWith('【学习目标】') || /^##\s*第\s*\d+\s*章·学习目标/.test(trimmed) || /^##\s*学习目标/.test(trimmed);
                const isPSection = /【P\d+/.test(trimmed) || /^##\s*第\s*\d+\s*章｜P\d+/.test(trimmed);
                
                // 生成思考步骤的辅助函数
              const generateThinkingSteps = (content: string, sectionType: string, title: string, seed: number) => {
                const steps: ThinkingStep[] = [
                  {
                    step: 1,
                    title: '🤖 需求分析',
                    description: `分析用户需要了解的内容，确定核心框架`,
                    output: '明确核心要点和表达重点',
                  },
                  {
                    step: 2,
                    title: '📚 知识检索',
                    description: '从知识库中检索相关权威资料',
                    references: getRandomReferences(3, title, seed),
                    output: '找到相关参考资料，提取核心信息',
                  },
                ];

                if (sectionType === 'learning_objective') {
                  steps.push({
                    step: 3,
                    title: '✏️ 内容撰写',
                    description: '整理学习目标，确保清晰明确可衡量',
                    rejectedContents: [
                      {
                        content: '学完这章就懂乡村振兴了',
                        reason: '目标太模糊，不可衡量',
                        type: 'no_meaning',
                      },
                    ],
                    output: content,
                  });
                } else if (content.includes('重要') || content.includes('地位')) {
                  steps.push({
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '从多份资料中提取最核心的表述',
                    rejectedContents: getRejectedContents(content, title, seed),
                    output: '提取核心定位表述',
                  });
                  steps.push({
                    step: 4,
                    title: '✏️ 内容撰写',
                    description: '组织语言，确保表述准确客观',
                    output: content,
                  });
                } else if (content.includes('方法') || content.includes('路径')) {
                  steps.push({
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '筛选可操作的具体路径和方法',
                    output: '确定核心举措和实施路径',
                  });
                  steps.push({
                    step: 4,
                    title: '✏️ 内容撰写',
                    description: '撰写清晰的实施路径说明',
                    output: content,
                  });
                } else {
                  steps.push({
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '筛选最有价值的核心信息',
                    output: '确定关键表述',
                  });
                  steps.push({
                    step: 4,
                    title: '✏️ 内容撰写',
                    description: '整合信息，撰写完整表述',
                    output: content,
                  });
                }

                steps.push({
                  step: steps.length + 1,
                  title: '✅ 质量审核',
                  description: '最后审核内容的准确性和合规性',
                  output: '内容审核通过，表述准确客观',
                });

                return steps;
              };

              const pageSeed = chIdx * 100 + pIndex;
              
              if (isLearningObjective) {
                const objectiveContent = trimmed.startsWith('【学习目标】') 
                  ? trimmed.replace('【学习目标】', '').trim()
                  : trimmed.replace(/^##\s*第\s*\d+\s*章·学习目标\s*\n*/, '').replace(/^##\s*学习目标\s*\n*/, '').trim();
                slides.push({
                  type: 'learning_objective',
                  content: objectiveContent,
                  chapterTitle: ch.title,
                  thinkingSteps: generateThinkingSteps(objectiveContent, 'learning_objective', ch.title, pageSeed),
                });
              } else if (isPSection) {
                pIndex++;
                const imageUrl = chapterImageNum > 0 ? getCourseImageUrl(courseCode, chapterImageNum, pIndex) : null;
                slides.push({
                  type: 'mixed',
                  content: trimmed,
                  imageUrl: imageUrl || undefined,
                  imageCaption: imageUrl ? `${ch.title} - P${pIndex}` : `${ch.title} - P${pIndex} 配图`,
                  aiTags: [{ text: `P${pIndex}`, type: '知识点', explanation: '核心知识点' }],
                  thinkingSteps: generateThinkingSteps(trimmed, 'mixed', ch.title, pageSeed),
                });
                
                if (isChapter3 && pIndex === 1) {
                  slides.push({
                    type: 'video',
                    content: '',
                    videoUrl: '/video/1分钟看懂_自动_与_自主_的差别.mp4',
                  });
                }
                
                if (courseCode === '8' && ch.id === 4 && pIndex === 3) {
                  slides.push({
                    type: 'video',
                    content: '',
                    videoUrl: '/video/防内涝应急III级响应启动机制详解.mp4',
                  });
                }
              } else {
                slides.push({
                  type: 'text',
                  content: trimmed,
                  thinkingSteps: generateThinkingSteps(trimmed, 'text', ch.title, pageSeed),
                });
              }
              }
            } else {
              // 通用思考步骤生成函数
              const generateGenericThinkingSteps = (content: string, title: string, seed: number) => {
                const steps: ThinkingStep[] = [
                  {
                    step: 1,
                    title: '🤖 需求分析',
                    description: `分析${title}的内容定位和表达重点`,
                    output: '明确核心要点和表达框架',
                  },
                  {
                    step: 2,
                    title: '📚 知识检索',
                    description: '从知识库中检索相关政策和理论资料',
                    references: getRandomReferences(3, title, seed),
                    output: '找到相关参考资料，完成初步信息收集',
                  },
                  {
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '从大量信息中筛选核心表述',
                    rejectedContents: getRejectedContents(content, title, seed),
                    output: '提取核心表述，确定内容框架',
                  },
                  {
                    step: 4,
                    title: '✏️ 内容撰写',
                    description: '整合信息，撰写完整表述',
                    output: content,
                  },
                  {
                    step: 5,
                    title: '✅ 质量审核',
                    description: '最后审核内容的准确性和合规性',
                    output: '内容审核通过，表述准确客观',
                  },
                ];
                return steps;
              };

              if (ch.title.startsWith('前言')) {
                const prefaceImageUrl = getCourseImageUrl(courseCode, 0, 1);
                slides.push({
                  type: 'mixed',
                  content: processedContent,
                  chapterTitle: ch.title,
                  imageUrl: prefaceImageUrl || undefined,
                  imageCaption: prefaceImageUrl ? '前言：乡村振兴战略概述' : undefined,
                  thinkingSteps: generateGenericThinkingSteps(processedContent, ch.title, chIdx * 100),
                });
              } else {
              const paragraphs = processedContent.split('\n\n').filter((p: string) => p.trim());
              const paragraphsPerPage = 3;
              let imgPageIndex = 0;
              const forceImageSlide = courseCode === '2' || courseCode === '3';
              for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
                const pageParagraphs = paragraphs.slice(i, i + paragraphsPerPage);
                const pageContent = pageParagraphs.join('\n\n');
                imgPageIndex++;
                
                const hasImage = pageContent.includes('案例') || pageContent.includes('【') || pageContent.includes('目标');
                const imageUrl = getCourseImageUrl(courseCode, chIdx + 1, imgPageIndex);
                const pageSeed = chIdx * 100 + imgPageIndex;
                const thinkingSteps = generateGenericThinkingSteps(pageContent, ch.title, pageSeed);
                
                if (forceImageSlide || hasImage || imageUrl) {
                  slides.push({
                    type: 'mixed',
                    content: pageContent,
                    imageUrl: imageUrl || undefined,
                    imageCaption: imageUrl ? `${ch.title} 知识图谱` : undefined,
                    aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, '').replace(/课程概述/, '概述').substring(0, 15), type: '知识点', explanation: '本讲核心知识点' }],
                    thinkingSteps: thinkingSteps,
                  });
                } else {
                  slides.push({
                    type: 'text',
                    content: pageContent,
                    aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, '').replace(/课程概述/, '概述').substring(0, 15), type: '知识点', explanation: '本讲核心知识点' }],
                    thinkingSteps: thinkingSteps,
                  });
                }
                
                if (isChapter3 && imgPageIndex === 1) {
                  slides.push({
                    type: 'video',
                    content: '',
                    videoUrl: '/video/1分钟看懂_自动_与_自主_的差别.mp4',
                  });
                }
              }
              }
            }
          } else {
            slides.push({ 
              type: 'text', 
              content: ch.title + '。本讲内容涵盖相关核心知识点，帮助您全面理解和掌握。', 
              aiTags: [{ text: ch.title.replace(/第.*讲[：:]/, ''), type: '知识点', explanation: '本讲核心知识点' }],
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '设计本章的开篇内容，建立整体框架',
                  output: '明确本章主题和内容概览',
                },
                {
                  step: 2,
                  title: '✏️ 内容撰写',
                  description: '撰写开篇表述',
                  output: ch.title + '。本讲内容涵盖相关核心知识点，帮助您全面理解和掌握。',
                },
              ],
            });
            slides.push({ 
              type: 'mixed', 
              content: `${ch.title}的详细解读。AI根据知识图谱为您整理关键要点和深入分析，帮助您快速理解和应用。`, 
              imageCaption: `${ch.title}知识图谱`, 
              aiTags: [{ text: '核心要点', type: '重点', explanation: '本讲最重要的知识点' }],
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '通过知识图谱方式展示核心要点',
                  output: '确定核心要点和展示方式',
                },
                {
                  step: 2,
                  title: '🖼️ 配图选择',
                  description: '选择合适的知识图谱配图',
                  references: [
                    { title: `${ch.title}知识图谱`, source: '内部设计资源', relevance: 'high' },
                  ],
                  output: '选择直观的知识图谱配图',
                },
                {
                  step: 3,
                  title: '✏️ 内容撰写',
                  description: '撰写详细解读内容',
                  output: `${ch.title}的详细解读。AI根据知识图谱为您整理关键要点和深入分析，帮助您快速理解和应用。`,
                },
              ],
            });
          }
          
          if (isChapter3 && slides.length > 0) {
            const isRuralCh3 = ch.title.includes('扶贫') && ch.title.includes('振兴');
            slides.splice(1, 0, {
              type: 'video',
              content: '',
              videoUrl: isRuralCh3 ? '/video/1分钟看懂_扶贫_与_振兴_的差别.mp4' : '/video/1分钟看懂_自动_与_自主_的差别.mp4',
            });
          }
          
          if (isChapter5 && slides.length > 0) {
            const isRuralCh5 = ch.title.includes('合作社');
            slides.splice(1, 0, {
              type: 'video',
              content: '',
              videoUrl: isRuralCh5 ? '/video/合作社——一次关键跃迁.mp4' : '/video/世界模型：让机器人_理解_世界的关键一跃.mp4',
            });
          }
          
          if (isChapter7 && slides.length > 0) {
            const isRuralCh7 = ch.title.includes('可落地') && ch.title.includes('可推广');
            slides.splice(1, 0, {
              type: 'video',
              content: '',
              videoUrl: isRuralCh7 ? '/video/乡村振兴治理三要素：可落地、可评估、可推广.mp4' : '/video/具身智能治理三要素：可解释、可评估、可监管.mp4',
            });
          }
          
          const embodiedSummaries: Record<string, string> = {
            '前言：为什么机关干部要了解具身智能？': '具身智能已从实验室概念跃迁为国家战略高地。2025年首次写入《政府工作报告》，2030年市场规模预计达4000亿元。作为机关干部，需要建立可操作的理解框架——不是为了追逐概念，而是为了判断项目、评估风险、制定规则、组织试点。',
            '第1章：什么是具身智能——从概念到国家战略': '具身智能是"有物理载体的智能体"，核心三要素为具身本体、智能内核、环境交互。区别于纯大模型（离身智能）和传统机器人（具身不智能），政务场景采购不应盲目追求"人形"。',
            '第2章：核心机制与关键技术': '具身智能的核心是"五步闭环"（感知→认知→决策→执行→反馈）。关键技术包括多模态感知、模仿学习+强化学习、世界模型、运动与操作控制、安全围栏。世界模型是弥补端到端VLA泛化性短板的核心方向。',
            '第3章：1分钟看懂"自动"与"自主"的差别': '通过楼道消防巡检的分屏对比，直观展示"自动"（按预设路线，遇障即停）与"自主"（感知障碍后绕行，识变-应变-求变）的本质差异。自主 = 五步闭环的完整运行。',
            '第4章：面向公共治理的四大应用场景': '具身智能在政务领域聚焦四大板块：城市运行与设施养护、应急管理与安全生产、民生服务与无障碍辅助、生态环境与自然资源。每项场景配有代表性任务、本体形态和落地案例。',
            '第5章：世界模型——一次关键跃迁': '世界模型是机器人脑中的"常识模拟器"，能在行动前预演物理后果。通过"预测—执行—修正"形成经验闭环，决定具身智能能否进入真实复杂场景，是走向自主的关键一跃。',
            '第6章：项目论证与评估方法': '提供"六问"论证清单（场景可得性、闭环完整性、数据可持续性、评估方案、安全伦理、效益度量）和六维加权评分表，帮助机关干部快速识别"伪闭环"项目。',
            '第7章："可解释、可评估、可监管"三要素': '具身智能治理的三要素：可解释（决策留痕可追溯）、可评估（指标先行数据说话）、可监管（权限分级日志不可篡改）。先治理后扩展，先试点再推广。',
            '第8章：组织一次本地化具身智能应用小调研': '从调研目标、受访对象、10题短问卷到5页内评审材料模板，提供完整的本地化调研工具箱。帮助学员将调研结果落地为可操作的试点建议。',
          };
          const ruralSummaries: Record<string, string> = {
            '前言：为什么机关干部要深刻理解乡村振兴？': '乡村振兴已从顶层设计进入系统推进、精准落地的关键阶段。党的十九大首次提出实施乡村振兴战略，2025年中央农村工作会议强调学习运用"千万工程"经验。作为机关干部，需要建立可操作的理解框架——识别痛点、设计方案、统筹资源、评估成效。',
            '第1章：什么是乡村振兴——从概念到国家战略': '乡村振兴的核心是"二十字方针"：产业兴旺、生态宜居、乡风文明、治理有效、生活富裕。区别于"仅靠财政补贴""城镇化翻版""仅仅搞农业"，强调内生发展动力、各美其美、多元化路径。',
            '第2章：核心机制与关键路径': '乡村振兴的核心推进机制是"五大振兴"协同驱动：产业振兴（根基）→人才振兴（支撑）→文化振兴（灵魂）→生态振兴（底线）→组织振兴（保障）。从"输血"到"造血"的发展范式转变是关键。',
            '第3章：1分钟看懂"扶贫"与"振兴"的差别': '通过分屏对比展示：扶贫是"送"，解决"有没有"的问题；振兴是"造"，解决"好不好"的问题。振兴等于产业、人才、文化、生态、组织协同推进。',
            '第4章：面向公共治理的四大实践领域': '乡村振兴在政务领域聚焦四大板块：产业发展与集体经济、民生改善与公共服务、生态保护与绿色发展、文化传承与民族团结。每项场景配有实践载体和落地案例。',
            '第5章：合作社——一次关键跃迁': '合作社等于党建引领乘以群众参与乘以市场对接。从单打独斗到抱团发展，从看天吃饭到品牌溢价。因地制宜、因村施策，是乡村振兴的关键制度创新。',
            '第6章：项目论证与评估方法': '提供"六问"论证清单（产业基础、群众意愿、组织保障、资金可持续、生态红线、评估方案）和六维加权评分表，帮助机关干部快速识别"伪振兴"项目。',
            '第7章："可落地、可评估、可推广"三要素': '乡村振兴治理三要素：可落地（从纸面到地面）、可评估（指标量化数据说话）、可推广（做成一个带动一片）。先试点后推广，先组织后放活。',
            '第8章：组织一次本地化乡村振兴项目小调研': '从调研目标、受访对象、10题短问卷到5页内评审材料模板，提供完整的本地化调研工具箱。帮助学员将调研结果落地为可操作的试点建议。',
          };
          const floodSummaries: Record<string, string> = {
            '前言：课程定位与学习目标': '本课程面向洪涝应急处置岗位人员，覆盖市、区、街道三级。场景限定为城市内涝引发的排涝压力上升、积水加深、道路交通断交。学员需明确岗位定位、处置动作、阈值时限和上报路径，建立分角色SOP卡体系。',
            '第1章：开局判断——你面对的是哪一级城市内涝': '城市内涝四色分级：蓝黄橙红对应IV到I级。IV级响应的核心原则是先控险、先排涝、先封控断交风险。从预警到响应的决策链是气象局预警、应急局研判、副市长决策、启动响应。',
            '第2章：IV级响应——5个岗位各就各位': 'IV级响应涉及5个岗位：分管副市长、市应急局、市城管局、市交通局、属地街道。每个岗位有明确的标准作业程序卡，包含动作、内容、阈值和时限四要素。',
            '第3章：III级响应升级——从5个岗位到7个岗位的协同': '升级采用5选3机制。新增公安、卫健、气象3个岗位形成7节点联动。副市长每30分钟向市长汇报灾情，建议是否启动II级。',
            '第4章：II级响应升级——从7个岗位到14个岗位的全域联动': '升级采用更严格的6选3机制。新增市长、武警、供电、通信等7个岗位形成14岗位全域联动。从部门协同升级为全域战争状态。',
            '第5章：I级响应——全域控制与国家级支援协同': '最高级别应急状态。国家防总、解放军、国家级排涝基地、跨省救援队介入，形成国家-省-市三级指挥链。市长授权非常措施。',
            '第6章：演练与复盘——让岗位"会做、做对、能复核"': '掌握三种演练方式：桌面推演、专项演练、综合演练。学会5页复盘模板。每个学员交付岗位SOP卡，随身携带、定期更新。',
            '第7章：分角色SOP卡速查——你的岗位在各级响应中做什么': '应急局、城管局、交通局岗位的四级速查卡。通用原则：升级即新增、时限压缩、上报升级、联动扩展。速记口诀：蓝黄橙红四级跳。',
            '第8章：课程测试与工具包': '10道测试题覆盖四级响应核心知识点。应急工具包包含关键联系表、汛前检查清单、岗位SOP卡空白模板。每年汛前桌面推演、每季度更新。',
          };
          const typhoonSummaries: Record<string, string> = {
            '前言：课程定位与台风分级总览': '本课程面向防台应急处置岗位人员，覆盖市、区、街道三级。场景限定为台风从生成到登陆全过程，IV→III→II→I四级响应。学员需明确岗位定位、处置动作、阈值时限和上报路径。',
            '第1章：台风灾害导致城市运行中断——市情与Ⅳ级响应': '了解该市地理概况及台风灾害成因，掌握Ⅳ级响应启动条件。7个核心岗位（副市长、应急局、气象局、水利局、交通局、城管局、属地街道）各有明确SOP卡。',
            '第2章：响应升级——Ⅳ级升级到Ⅲ级响应': '升级触发条件：台风增强为强热带风暴，风力10-13级。新增公安、海事局、农业农村局、卫健委4个岗位，形成9岗位协同网络。副市长每3小时听取气象预报。',
            '第3章：响应升级——Ⅲ级升级到Ⅱ级响应': '台风或强台风24小时内正面影响。从9岗位扩展到18岗位全域联动，市长任指挥长。新增自然资源局、通信办、供电公司、网信办、教育局、文旅局、武警部队等。',
            '第4章：响应升级——Ⅱ级升级到Ⅰ级响应': '强台风或超强台风即将登陆，风力14级以上。市长接管全部指挥权，实行扁平化直接指挥。申请国家级力量支援（解放军、龙吸水、跨省救援队）。',
          };
          const summaries = courseCode === '7' ? ruralSummaries : courseCode === '8' ? floodSummaries : courseCode === '11' ? typhoonSummaries : embodiedSummaries;
          
          // 为每章末尾添加试题页面（内涝和台风课程使用独立测试系统）
          const chapterQuiz = (courseCode === '8' || courseCode === '11') ? null : getChapterQuiz(parsed.courseName || '', ch.id, ch.title);
          if (chapterQuiz) {
            slides.push({
              type: 'quiz',
              content: `章节测试 - ${ch.title}`,
              chapterTitle: ch.title,
              quizData: chapterQuiz,
            });
          }
          
          return { id: ch.id, title: ch.title, totalSlides: slides.length, aiSummary: summaries[ch.title] || `${ch.title}。深入讲解核心要义，帮助您全面掌握相关知识点和实践方法。`, keyPoints: [ch.title.replace(/第.*章[：:]/, '').substring(0, 10)], videoUrl, slides, sections: ch.sections || [] };
        }),
        testQuestions: parsed.testQuestions || [],
        courseCode: courseCode,
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
      courseCode: courseId,
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
  const searchParams = useSearchParams();
  const courseId = params?.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());

  // 返回上一页：如果有诊断数据则返回学习路径展示页，否则返回资源库
  const handleBack = () => {
    const hasDiagnostic = localStorage.getItem('user_diagnostic');
    if (hasDiagnostic) {
      // 有诊断数据，返回首页（OnboardingFlow会自动恢复到诊断报告视图）
      router.replace('/home');
    } else {
      // 无诊断数据，返回资源库
      router.replace('/library');
    }
  };

  // 获取目标章节索引：优先使用URL参数
  const getInitialChapter = () => {
    try {
      const chapterParam = searchParams.get('chapter');
      if (chapterParam !== null) {
        return parseInt(chapterParam, 10);
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const [currentChapter, setCurrentChapter] = useState(getInitialChapter);
  const [currentSlide, setCurrentSlide] = useState(() => {
    try {
      const chapterParam = searchParams.get('chapter');
      if (chapterParam !== null) {
        return 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAITag, setShowAITag] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string}>>([
    { role: 'ai', content: '您好！我是AI学习助手。您可以问我关于当前课程内容的任何问题，我会基于知识图谱为您提供精准解答。' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`completed_slides_${courseId}`);
      if (saved) {
        setCompletedSlides(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, [courseId]);
  const [showAISummary, setShowAISummary] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_summary_preference');
      if (saved !== null) {
        setShowAISummary(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showThinkingLogic, setShowThinkingLogic] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [slideNotes, setSlideNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`slide_notes_${courseId}`);
      if (saved) {
        setSlideNotes(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [courseId]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [learningSeconds, setLearningSeconds] = useState(0);
  const [speechContents, setSpeechContents] = useState<ChapterScript[]>([]);
  const [course, setCourse] = useState<any>(() => getStaticFallbackCourseData(courseId));
  const courseTestQuestions = course?.testQuestions || [];
  const isCourseTestChapter = courseTestQuestions.length > 0 && currentChapter === course.chapters.length - 1 && course?.courseCode !== '8' && course?.courseCode !== '11';
  const [testState, setTestState] = useState({
    answers: {} as Record<number, string>,
    results: null as Record<number, { score: number; comment: string }> | null,
    isGrading: false,
    overallFeedback: '',
    gradingError: '',
  });

  useEffect(() => {
    const data = getCourseData(courseId);
    setCourse(data);
  }, [courseId]);

  useEffect(() => {
    loadCourseScript(course?.name).then(script => {
      if (script) {
        setSpeechContents(script.chapters);
      }
    });
  }, [course?.name]);

  const handleTestAnswerChange = (questionId: number, answer: string) => {
    setTestState(prev => ({ ...prev, answers: { ...prev.answers, [questionId]: answer } }));
  };

  const handleSubmitTest = async () => {
    const unanswered = courseTestQuestions.filter((q: any) => !testState.answers[q.id]?.trim());
    if (unanswered.length > 0) {
      setTestState(prev => ({ ...prev, gradingError: `还有 ${unanswered.length} 道题未作答，请完成所有题目后再提交` }));
      return;
    }
    setTestState(prev => ({ ...prev, gradingError: '', isGrading: true }));

    try {
      const localResults: Record<number, { score: number; comment: string }> = {};

      courseTestQuestions.forEach((q: any) => {
        if (q.questionType === 'single_choice' || q.questionType === 'true_false') {
          const isCorrect = testState.answers[q.id] === q.correctAnswer;
          localResults[q.id] = {
            score: isCorrect ? 10 : 0,
            comment: isCorrect ? '回答正确' : `回答错误，正确答案是「${q.correctAnswer}」`,
          };
        }
      });

      const subjectiveQ = courseTestQuestions.find((q: any) => q.isSubjective);
      if (subjectiveQ) {
        const prompt = `你是一个专业的防汛应急课程阅卷AI。请对以下学员的主观题答案进行评分和点评。

课程名称：城市内涝洪涝应急处置岗位实训课程

阅卷规则：
1. 本题为综合案例分析题（主观题），满分30分
2. 评分标准：分析逻辑是否清晰、是否覆盖了所有5个子问题、是否有独立判断和具体细节
3. 给出具体评分（整数分数）和简短评语

题目和学员答案如下：

【第10题】${subjectiveQ.question}
学员答案：${testState.answers[subjectiveQ.id] || '未作答'}
参考章节：${subjectiveQ.chapterRef}
【主观题】本题满分30分

请按以下JSON格式输出（不要包含其他内容）：
{
  "score": 分数,
  "comment": "评语"
}`;

        const response = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            type: 'assistant'
          }),
        });

        if (!response.ok) throw new Error('AI阅卷服务请求失败');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                }
              } catch {}
            }
          }
        }

        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          localResults[subjectiveQ.id] = { score: result.score, comment: result.comment };
        } else {
          localResults[subjectiveQ.id] = { score: 15, comment: 'AI阅卷异常，已给予基础分，建议重新提交' };
        }
      }

      const totalScore = Object.values(localResults).reduce((sum: number, r: any) => sum + (r.score || 0), 0);
      const correctCount = courseTestQuestions.filter((q: any) => {
        const r = localResults[q.id];
        return r && r.score >= (q.isSubjective ? 21 : 10);
      }).length;

      setTestState(prev => ({
        ...prev,
        results: localResults,
        overallFeedback: `本次测试共${courseTestQuestions.length}题（满分120分），您获得${totalScore}分。\n\n客观题部分：共9题90分，答对${courseTestQuestions.filter((q: any) => !q.isSubjective && localResults[q.id]?.score >= 10).length}题。\n主观题部分：案例分析获得${localResults[subjectiveQ?.id]?.score || 0}/30分。\n\n${totalScore >= 100 ? '整体表现优秀，您对防汛应急知识掌握扎实！' : totalScore >= 80 ? '整体表现良好，建议针对答错的客观题回顾对应章节内容。' : totalScore >= 60 ? '整体表现尚可，建议重点复习答错题目的对应章节，加强理解和记忆。' : '整体表现有待提高，建议重新学习相关章节后再进行测试。'}`,
        isGrading: false,
      }));
    } catch (error) {
      console.error('[AI阅卷] 错误:', error);
      setTestState(prev => ({
        ...prev,
        gradingError: error instanceof Error ? error.message : 'AI阅卷失败，请稍后重试',
        isGrading: false,
      }));
    }
  };

  const handleRetryTest = () => {
    setTestState({
      answers: {},
      results: null,
      isGrading: false,
      overallFeedback: '',
      gradingError: '',
    });
  };

  const chapter = course.chapters[currentChapter];
  const isRuralCourse = (course.name || '').includes('乡村振兴');
  const slides = chapter?.slides || [];
  const currentSlideData = slides[currentSlide] ? [slides[currentSlide]] : [];
  const totalSlides = slides.length;
  const progress = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;
  
  // 获取当前章节或幻灯片的视频 URL
  const currentVideoUrl = chapter?.videoUrl || currentSlideData.find((s: ContentBlock) => s.type === 'video')?.videoUrl || null;

  // 获取当前章节的语音播报内容
  const currentSpeechContent = speechContents[currentChapter];
  const speechChapterContents = speechContents.map(ch => ({
    title: ch.title,
    content: getChapterSpeechContent(ch),
    sections: getChapterSections(ch),
  }));

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

  // 学习时长统计
  useEffect(() => {
    const timer = setInterval(() => {
      setLearningSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // AI摘要偏好保存
  useEffect(() => {
    localStorage.setItem('ai_summary_preference', String(showAISummary));
  }, [showAISummary]);

  // 笔记保存到localStorage
  useEffect(() => {
    localStorage.setItem(`slide_notes_${courseId}`, JSON.stringify(slideNotes));
  }, [slideNotes, courseId]);

  // 聊天消息自动滚动到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 保存完成进度到localStorage
  useEffect(() => {
    localStorage.setItem(`completed_slides_${courseId}`, JSON.stringify([...completedSlides]));
  }, [completedSlides, courseId]);

  // 保存当前章节位置到localStorage
  useEffect(() => {
    localStorage.setItem(`current_chapter_${courseId}`, String(currentChapter));
  }, [currentChapter, courseId]);

  // 保存当前幻灯片位置到localStorage
  useEffect(() => {
    localStorage.setItem(`current_slide_${courseId}`, String(currentSlide));
  }, [currentSlide, courseId]);

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
      case '延伸思考': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'AI提醒': return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const getTagIcon = (type: AITagType) => {
    switch (type) {
      case '知识点': return <Lightbulb className="h-3 w-3" />;
      case '重点': return <Target className="h-3 w-3" />;
      case '延伸思考': return <Zap className="h-3 w-3" />;
      case 'AI提醒': return <BrainCircuit className="h-3 w-3" />;
    }
  };

  const handlePrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setShowAITag(null);
      setShowThinkingLogic(false);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      const prevChapter = course.chapters[currentChapter - 1];
      setCurrentSlide(prevChapter.slides.length - 1);
      setShowAITag(null);
      setShowThinkingLogic(false);
    }
  }, [currentSlide, currentChapter, course.chapters]);

  const handleNextSlide = useCallback(() => {
    setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setShowAITag(null);
      setShowThinkingLogic(false);
    } else if (currentChapter < course.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentSlide(0);
      setShowAISummary(true);
      setShowThinkingLogic(false);
    } else {
      setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
      // 课程学完后：内涝和台风课程返回安全应急页面，其他课程根据诊断数据判断
      if (course?.courseCode === '8' || course?.courseCode === '11') {
        router.push('/safety');
      } else {
        const hasDiagnostic = localStorage.getItem('user_diagnostic');
        if (hasDiagnostic) {
          router.push('/home');
        } else {
          router.push('/library');
        }
      }
    }
  }, [currentSlide, currentChapter, slides.length, course.chapters.length, router]);

  // 键盘快捷键翻页
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        setFocusMode(prev => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNoteEditor(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevSlide, handleNextSlide]);

  const isLastSlide = currentChapter === course.chapters.length - 1 && currentSlide === slides.length - 1;

  const handleChapterSelect = (index: number) => {
    setCurrentChapter(index);
    setCurrentSlide(0);
    setShowAISummary(true);
    setShowThinkingLogic(false);
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
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => {
          if (e?.name === 'AbortError') return;
        });
      } else {
        videoRef.current.pause();
      }
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

  // 格式化学习时长
  const formatLearningTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${mins}分钟`;
    return `${mins}分钟`;
  };

  // 获取当前页的笔记
  const currentSlideKey = `${currentChapter}-${currentSlide}`;
  const currentSlideNote = slideNotes[currentSlideKey] || '';

  // 保存笔记
  const handleSaveNote = () => {
    setSlideNotes(prev => ({
      ...prev,
      [currentSlideKey]: noteInput.trim(),
    }));
    setShowNoteEditor(false);
    setNoteInput(currentSlideNote);
  };

  // 打开笔记编辑器
  const handleOpenNoteEditor = () => {
    setNoteInput(currentSlideNote);
    setShowNoteEditor(true);
  };

  // 检查章节是否全部完成
  const isChapterCompleted = (chIdx: number) => {
    const ch = course.chapters[chIdx];
    if (!ch) return false;
    return ch.slides.every((_: ContentBlock, slIdx: number) => completedSlides.has(`${chIdx}-${slIdx}`));
  };

  // 检查章节是否有部分完成
  const isChapterPartiallyCompleted = (chIdx: number) => {
    const ch = course.chapters[chIdx];
    if (!ch) return false;
    const completedCount = ch.slides.filter((_: ContentBlock, slIdx: number) => completedSlides.has(`${chIdx}-${slIdx}`)).length;
    return completedCount > 0 && completedCount < ch.slides.length;
  };

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-400 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">课程数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 背景层 - 党政红橙渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-white" style={{ opacity: 0.8 }} />
      {/* 内容层 */}
      <div className="relative z-10">
      {/* 顶部导航栏 */}
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white">
        {/* 左侧章节侧边栏 - 固定宽度 */}
        {!focusMode && (
        <aside className="w-72 flex-shrink-0 bg-white border-r border-red-200 overflow-y-auto sticky top-0 h-screen">
          <div className="p-4 bg-gradient-to-r from-red-600 to-orange-500 text-white">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-200" />
              课程章节
            </h3>
          </div>
          <div>
            {course.chapters.map((ch: ChapterData, idx: number) => {
              const completed = isChapterCompleted(idx);
              const partiallyCompleted = isChapterPartiallyCompleted(idx);
              const isCurrent = idx === currentChapter;
              const isExpanded = expandedChapters.has(idx);
              const hasSections = ch.sections && ch.sections.length > 0;
              
              const toggleChapter = (e: React.MouseEvent) => {
                e.stopPropagation();
                setExpandedChapters(prev => {
                  const next = new Set(prev);
                  if (next.has(idx)) {
                    next.delete(idx);
                  } else {
                    next.add(idx);
                  }
                  return next;
                });
              };
              
              return (
              <div key={ch.id}>
                <div
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                    isCurrent ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <button
                    onClick={() => handleChapterSelect(idx)}
                    className="flex-1 min-w-0 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm flex-shrink-0 ${
                      completed ? 'bg-green-100 text-green-600 border border-green-300' :
                      isCurrent ? 'bg-red-600 text-white' :
                      partiallyCompleted ? 'bg-orange-100 text-orange-600 border border-orange-300' :
                      'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                      {completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-sm font-semibold truncate ${
                        completed ? 'text-gray-500' :
                        isCurrent ? 'text-red-700' :
                        partiallyCompleted ? 'text-orange-700' :
                        'text-gray-600'
                      }`}>
                        {ch.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {ch.slides.length}页
                      </div>
                    </div>
                    {completed && (
                      <span className="text-xs text-green-600 font-medium flex-shrink-0">已学</span>
                    )}
                  </button>
                  {hasSections && (
                    <button
                      onClick={toggleChapter}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
                
                {isExpanded && hasSections && (
                  <div className="bg-gray-50 border-l-2 border-l-orange-300 ml-8">
                    {ch.sections!.map((section: ChapterSection, sIdx: number) => {
                      // 找到该小节对应的幻灯片索引
                      const sectionSlideIndex = ch.slides.findIndex((slide: ContentBlock) => 
                        slide.content.includes(section.title) || 
                        (slide.chapterTitle && slide.chapterTitle.includes(section.title))
                      );
                      
                      return (
                        <button
                          key={sIdx}
                          onClick={() => {
                            if (sectionSlideIndex >= 0) {
                              handleChapterSelect(idx);
                              setTimeout(() => {
                                setCurrentSlide(sectionSlideIndex);
                              }, 100);
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                          <span className="truncate">{section.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </aside>
        )}

        {/* 右侧主内容区 */}
        <div className="flex-1 min-w-0">
      <header className="bg-white/95 backdrop-blur-sm border-b border-red-200 sticky top-0 z-50 shadow-sm">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：返回 + 课程信息 */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="border border-red-300 text-red-700 hover:bg-red-50" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-black text-gray-900">{course.name}</h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.totalHours}学时
                  </span>
                  <span>共{course.chapters.length}章</span>
                  <span className="text-red-600 font-bold">
                    总进度 {getTotalProgress()}%
                  </span>
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Clock className="h-3 w-3" />
                    {formatLearningTime(learningSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* 右侧：AI功能按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border font-bold text-xs transition-colors ${showAISummary ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 hover:bg-red-50'}`}
                onClick={() => setShowAISummary(!showAISummary)}
              >
                <Sparkles className="h-3 w-3 mr-1 text-red-600" />
                AI摘要
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border font-bold text-xs transition-colors ${showChatPanel ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 hover:bg-red-50'}`}
                onClick={() => setShowChatPanel(!showChatPanel)}
              >
                <Bot className="h-3 w-3 mr-1" />
                AI问答
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border font-bold text-xs transition-colors ${focusMode ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-300 hover:bg-red-50'}`}
                onClick={() => setFocusMode(!focusMode)}
                title="专注模式（按F键切换）"
              >
                {focusMode ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {focusMode ? '退出专注' : '专注'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border font-bold text-xs transition-colors ${showNoteEditor ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 hover:bg-red-50'}`}
                onClick={handleOpenNoteEditor}
                title="添加笔记（按N键切换）"
              >
                <FileText className="h-3 w-3 mr-1" />
                笔记
              </Button>
            </div>
          </div>

          {/* 进度条区域 - 双层进度展示 */}
          <div className="mt-3 space-y-2">
            {/* 总进度条 - 全课程 */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-gray-500 font-medium">
                  课程总进度
                </span>
                <span className="text-red-600 font-bold">
                  {getTotalProgress()}% · 已完成 {course.chapters.reduce((acc: number, ch: ChapterData, chIdx: number) => acc + ch.slides.filter((_: ContentBlock, slIdx: number) => completedSlides.has(`${chIdx}-${slIdx}`)).length, 0)}/{course.chapters.reduce((acc: number, ch: ChapterData) => acc + ch.slides.length, 0)} 页
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
            </div>
            
            {/* 当前章节进度条 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 font-semibold">
                  第{currentChapter + 1}章 / 共{course.chapters.length}章 · {chapter.title}
                </span>
                <span className="text-red-600 font-bold">
                  {currentSlide + 1} / {totalSlides}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-red-100" />
            </div>
          </div>
        </div>
      </header>

        {/* 中间主要内容区 */}
         <main className={`min-w-0 py-6 ${focusMode ? 'px-4' : 'px-8'}`}>
          <div className={focusMode ? 'mx-auto max-w-[8xl]' : ''}>
          {/* AI摘要提示 */}
          {showAISummary && (
            <div className="mb-4 border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 relative rounded-lg shadow-sm">
              <div className="absolute -top-2.5 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                AI章节摘要
              </div>
              <div className="flex items-start gap-3 mt-1">
                <Sparkles className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-800 leading-relaxed">{chapter.aiSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* 笔记编辑器 */}
          {showNoteEditor && (
            <div className="mb-4 border border-orange-200 bg-orange-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-bold text-gray-800">
                    当前页笔记 - 第{currentChapter + 1}章 第{currentSlide + 1}页
                  </span>
                </div>
                <button
                  onClick={() => setShowNoteEditor(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ×
                </button>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="输入您的学习笔记..."
                className="w-full h-24 p-3 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-white"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-xs"
                  onClick={() => setShowNoteEditor(false)}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs"
                  onClick={handleSaveNote}
                >
                  保存笔记
                </Button>
              </div>
              {currentSlideNote && (
                <div className="mt-3 p-3 bg-white border border-orange-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">当前笔记：</p>
                  <p className="text-sm text-gray-700">{currentSlideNote}</p>
                </div>
              )}
            </div>
          )}

          {/* 内容展示区 - 图文混合 */}
          <Card className="border border-red-200 mb-4 min-h-[500px] shadow-sm rounded-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-10">
              {/* 页码指示 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-200">
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    第{currentSlide + 1}页
                  </span>
                  <span className="text-sm text-gray-500">共{totalSlides}页</span>
                  {currentSlideNote && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      有笔记
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* AI能力标识 */}
                  <span className="border border-orange-300 text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {[3, 5, 7].includes(currentChapter) ? 'AI视频' : 'AI图文混合'}
                  </span>
                </div>
              </div>

              {/* 内容块渲染 */}
              <div className="space-y-8">
                {currentSlideData.map((block: ContentBlock, blockIdx: number) => (
                  <div key={blockIdx}>
                    {/* 学习目标页面 - 居中卡片式 */}
                    {block.type === 'learning_objective' && (
                      <div className="flex flex-col items-center text-center px-8 py-10 bg-gradient-to-br from-red-50 via-orange-50 to-white rounded-xl border border-red-100">
                        <div className="max-w-2xl mx-auto">
                          {block.chapterTitle && (
                            <div className="mb-6">
                              <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mx-auto mb-4" />
                              <h2 className="text-2xl font-black text-gray-900">{block.chapterTitle}</h2>
                              <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto mt-4" />
                            </div>
                          )}
                          <div className="mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                              <Target className="h-4 w-4" />
                              学习目标
                            </span>
                          </div>
                          <div className="prose prose-gray max-w-none [&_li]:text-lg [&_li]:font-medium [&_li]:text-gray-800 [&_li]:leading-loose [&_ul]:space-y-3 [&_ul]:list-none [&_ul]:pl-0 [&_li]:before:content-['✓'] [&_li]:before:text-red-500 [&_li]:before:font-bold [&_li]:before:mr-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {block.content.replace('【学习目标】', '').trim()}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 纯文本 - 优化版 */}
                    {block.type === 'text' && (
                      <div className="max-w-none">
                        {block.chapterTitle && (
                          <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                              <h2 className="text-2xl font-black text-gray-900">{block.chapterTitle}</h2>
                            </div>
                            <div className="h-px bg-gradient-to-r from-red-200 via-orange-200 to-transparent ml-4" />
                          </div>
                        )}
                        <div className="prose prose-gray max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <div className="mb-6">
                                  <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <span className="w-1.5 h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full inline-block flex-shrink-0" />
                                    {children}
                                  </h1>
                                  <div className="w-full h-px bg-gradient-to-r from-red-200 via-orange-200 to-transparent mt-3" />
                                </div>
                              ),
                              h2: ({ children }) => (
                                <div className="mb-4 mt-7">
                                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pl-4 relative">
                                    <span className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-400 to-red-400 rounded-full" />
                                    {children}
                                  </h2>
                                </div>
                              ),
                              h3: ({ children }) => (
                                <div className="mb-3 mt-5">
                                  <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-400 rounded-full inline-block flex-shrink-0" />
                                    {children}
                                  </h3>
                                </div>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-red-800 bg-gradient-to-r from-red-50 to-orange-50 px-2 py-0.5 rounded border-l-2 border-red-400">
                                  {children}
                                </strong>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline decoration-2 underline-offset-2 hover:text-red-600 hover:decoration-red-600 hover:bg-red-50 px-1 transition-colors rounded"
                                >
                                  {children}
                                </a>
                              ),
                              p: ({ children }) => {
                                const content = String(children);
                                if (content.startsWith('权威阅读链接：') || content.startsWith('权威阅读链接:')) {
                                  return (
                                    <div className="my-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl py-4 px-5 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                          <span className="text-white text-xs">📚</span>
                                        </div>
                                        <span className="font-bold text-blue-700 text-sm">权威阅读链接</span>
                                      </div>
                                      {typeof children === 'string' ? (
                                        <div className="text-sm text-blue-600 leading-relaxed space-y-2">
                                          {content
                                            .replace(/^权威阅读链接[：:]/, '')
                                            .split('\n')
                                            .filter(line => line.trim())
                                            .map((line, i) => (
                                              <div key={i} className="flex items-start gap-3 group">
                                                <span className="text-blue-400 mt-1 group-hover:text-blue-600 transition-colors">›</span>
                                                <span className="group-hover:text-blue-800 transition-colors">{line.trim()}</span>
                                              </div>
                                            ))}
                                        </div>
                                      ) : (
                                        children
                                      )}
                                    </div>
                                  );
                                }
                                if (content.startsWith('核心要点：') || content.startsWith('核心要点:')) {
                                  return (
                                    <div className="my-6 p-5 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 border-l-4 border-l-red-500 rounded-r-xl shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                          <Target className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="font-bold text-red-700 text-sm">核心要点</span>
                                      </div>
                                      <p className="text-base text-gray-800 leading-loose">
                                        {content.replace(/^核心要点[：:]/, '')}
                                      </p>
                                    </div>
                                  );
                                }
                                if (content.startsWith('拓展思考：') || content.startsWith('拓展思考:')) {
                                  return (
                                    <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 border-l-4 border-l-purple-500 rounded-r-xl shadow-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                          <Zap className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="font-bold text-purple-700 text-sm">拓展思考</span>
                                      </div>
                                      <p className="text-base text-gray-700 leading-loose italic">
                                        {content.replace(/^拓展思考[：:]/, '')}
                                      </p>
                                    </div>
                                  );
                                }
                                return (
                                  <p className="text-base text-gray-800 leading-loose mb-6">
                                    {children}
                                  </p>
                                );
                              },
                              li: ({ children }) => (
                                <li className="text-base my-3 leading-loose pl-1">
                                  {children}
                                </li>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-3 mb-6 list-none pl-0 [&_li]:before:content-['•'] [&_li]:before:text-red-400 [&_li]:before:font-bold [&_li]:before:mr-3 [&_li]:before:inline-block [&_li]:before:text-lg">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="space-y-3 mb-6 list-decimal pl-8 marker:text-red-500 marker:font-bold marker:text-base">
                                  {children}
                                </ol>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="my-6 border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-orange-50 py-4 px-6 rounded-r-xl relative shadow-sm">
                                  <div className="absolute top-2 right-4 text-red-200 text-5xl font-serif leading-none select-none">"</div>
                                  <div className="relative z-10 text-base text-gray-700 leading-loose">
                                    {children}
                                  </div>
                                </blockquote>
                              ),
                              hr: () => (
                                <div className="my-8">
                                  <div className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
                                </div>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-red-700 border border-gray-200">
                                  {children}
                                </code>
                              ),
                              table: ({ children }) => (
                                <div className="my-6 overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
                                  <table className="w-full text-base border-collapse">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => (
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                                  {children}
                                </thead>
                              ),
                              th: ({ children }) => (
                                <th className="px-4 py-3 text-left font-bold text-gray-900 border border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-4 py-3 leading-relaxed text-gray-800 border border-gray-300 hover:bg-red-50 transition-colors">
                                  {children}
                                </td>
                              ),
                              em: ({ children }) => (
                                <em className="not-italic font-medium text-gray-700 bg-yellow-50 px-2 py-0.5 rounded border-l-2 border-yellow-400">
                                  {children}
                                </em>
                              ),
                            }}
                          >
                            {block.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* 纯图片 */}
                    {block.type === 'image' && (
                      <div className="border border-red-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                              <span className="text-3xl">📊</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{block.imageCaption}</p>
                          </div>
                        </div>
                        {block.imageCaption && (
                          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 text-xs text-gray-500 text-center border-t border-red-100">
                            ▲ {block.imageCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 图文混合 - 杂志风排版 */}
                    {block.type === 'mixed' && (
                      <div className="space-y-8">
                        {/* 内容区域：左文右图 */}
                        <div className={block.imageUrl ? 'grid grid-cols-1 lg:grid-cols-5 gap-10 items-start' : ''}>
                          {/* Markdown文本 */}
                          <div className={`prose prose-gray max-w-none ${block.imageUrl ? 'lg:col-span-3' : ''}`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <div className="mb-6">
                                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                  <span className="w-1.5 h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full inline-block flex-shrink-0" />
                                  {children}
                                </h1>
                                <div className="w-full h-px bg-gradient-to-r from-red-200 via-orange-200 to-transparent mt-3" />
                              </div>
                            ),
                            h2: ({ children }) => (
                              <div className="mb-4 mt-7">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pl-4 relative">
                                  <span className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-400 to-red-400 rounded-full" />
                                  {children}
                                </h2>
                              </div>
                            ),
                            h3: ({ children }) => (
                              <div className="mb-3 mt-5">
                                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-red-400 rounded-full inline-block flex-shrink-0" />
                                  {children}
                                </h3>
                              </div>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-red-800 bg-gradient-to-r from-red-50 to-orange-50 px-2 py-0.5 rounded border-l-2 border-red-400">
                                {children}
                              </strong>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline decoration-2 underline-offset-2 hover:text-red-600 hover:decoration-red-600 hover:bg-red-50 px-1 transition-colors rounded"
                              >
                                {children}
                              </a>
                            ),
                            p: ({ children }) => {
                              const content = String(children);
                              // 检测特殊标签
                              if (content.startsWith('权威阅读链接：') || content.startsWith('权威阅读链接:')) {
                                return (
                                  <div className="my-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-r-xl py-4 px-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-white text-xs">📚</span>
                                      </div>
                                      <span className="font-bold text-blue-700 text-sm">权威阅读链接</span>
                                    </div>
                                    {typeof children === 'string' ? (
                                      <div className="text-sm text-blue-600 leading-relaxed space-y-2">
                                        {content
                                          .replace(/^权威阅读链接[：:]/, '')
                                          .split('\n')
                                          .filter(line => line.trim())
                                          .map((line, i) => (
                                            <div key={i} className="flex items-start gap-3 group">
                                              <span className="text-blue-400 mt-1 group-hover:text-blue-600 transition-colors">›</span>
                                              <span className="group-hover:text-blue-800 transition-colors">{line.trim()}</span>
                                            </div>
                                          ))}
                                      </div>
                                    ) : (
                                      children
                                    )}
                                  </div>
                                );
                              }
                              if (content.startsWith('核心要点：') || content.startsWith('核心要点:')) {
                                return (
                                  <div className="my-6 p-5 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 border-l-4 border-l-red-500 rounded-r-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                        <Target className="h-3 w-3 text-white" />
                                      </div>
                                      <span className="font-bold text-red-700 text-sm">核心要点</span>
                                    </div>
                                    <p className="text-base text-gray-800 leading-loose">
                                      {content.replace(/^核心要点[：:]/, '')}
                                    </p>
                                  </div>
                                );
                              }
                              if (content.startsWith('拓展思考：') || content.startsWith('拓展思考:')) {
                                return (
                                  <div className="my-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 border-l-4 border-l-purple-500 rounded-r-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                        <Zap className="h-3 w-3 text-white" />
                                      </div>
                                      <span className="font-bold text-purple-700 text-sm">拓展思考</span>
                                    </div>
                                    <p className="text-base text-gray-700 leading-loose italic">
                                      {content.replace(/^拓展思考[：:]/, '')}
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <p className="text-base text-gray-800 leading-loose mb-6">
                                  {children}
                                </p>
                              );
                            },
                            li: ({ children }) => (
                              <li className="text-base my-3 leading-loose pl-1">
                                {children}
                              </li>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-3 mb-6 list-none pl-0 [&_li]:before:content-['•'] [&_li]:before:text-red-400 [&_li]:before:font-bold [&_li]:before:mr-3 [&_li]:before:inline-block [&_li]:before:text-lg">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="space-y-3 mb-6 list-decimal pl-8 marker:text-red-500 marker:font-bold marker:text-base">
                                {children}
                              </ol>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="my-6 border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-orange-50 py-4 px-6 rounded-r-xl relative shadow-sm">
                                <div className="absolute top-2 right-4 text-red-200 text-5xl font-serif leading-none select-none">"</div>
                                <div className="relative z-10 text-base text-gray-700 leading-loose">
                                  {children}
                                </div>
                              </blockquote>
                            ),
                            hr: () => (
                              <div className="my-8">
                                <div className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />
                              </div>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-red-700 border border-gray-200">
                                {children}
                              </code>
                            ),
                            table: ({ children }) => (
                              <div className="my-6 overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
                                <table className="w-full text-base border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th className="px-4 py-3 text-left font-bold text-gray-900 border border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-4 py-3 leading-relaxed text-gray-800 border border-gray-300 hover:bg-red-50 transition-colors">
                                {children}
                              </td>
                            ),
                            em: ({ children }) => (
                              <em className="not-italic font-medium text-gray-700 bg-yellow-50 px-2 py-0.5 rounded border-l-2 border-yellow-400">
                                {children}
                              </em>
                            ),
                          }}
                        >
                          {block.content}
                        </ReactMarkdown>
                      </div>

                          {/* 图片侧边栏 - 杂志风卡片 */}
                          {block.imageUrl && (
                            <div className="lg:col-span-2">
                              <figure className="sticky top-4 group">
                                {/* 图片容器：玻璃拟态边框 */}
                                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl shadow-blue-900/10 backdrop-blur-sm transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-2xl">
                                  {/* 顶部装饰光晕 */}
                                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                                  
                                  {/* 图片本身 */}
                                  <div className="relative overflow-hidden">
                                    <img
                                      src={block.imageUrl}
                                      alt={block.imageCaption || '课程配图'}
                                      className="w-full h-auto object-cover aspect-[16/9] transition-all duration-700 group-hover:scale-[1.03] group-hover:saturate-[1.1]"
                                      onError={(e) => {
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const placeholder = target.parentElement;
                                        if (placeholder) {
                                          placeholder.innerHTML = `<div class="aspect-[16/9] bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center"><div class="text-center p-6"><div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30"><span class="text-2xl filter grayscale">🖼</span></div><p class="text-sm text-blue-200/80 font-medium">${block.imageCaption || '课程配图'}</p><p class="text-xs text-blue-300/50 mt-2">图片加载中</p></div></div>`;
                                        }
                                      }}
                                    />
                                    {/* 底部渐变遮罩 */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  </div>
                                  
                                  {/* 图片角标装饰 */}
                                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg pointer-events-none" />
                                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg pointer-events-none" />
                                </div>
                                
                                {/* 图注 - 精致同色系 */}
                                {block.imageCaption && (
                                  <figcaption className="mt-4 flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
                                        <span className="text-[10px] text-blue-400">📷</span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-blue-300 leading-relaxed">
                                        {block.imageCaption}
                                      </p>
                                      <p className="text-[11px] text-blue-400/50 mt-1">
                                        图示说明 · 实际图片替代
                                      </p>
                                    </div>
                                  </figcaption>
                                )}
                              </figure>
                            </div>
                          )}
                          </div>
                      </div>
                    )}

                    {/* 章节试题 */}
                    {block.type === 'quiz' && block.quizData && (
                      <ChapterQuizComponent
                        quiz={block.quizData}
                        onComplete={(result) => {
                          console.log('[章节测试] 完成:', result);
                          setCompletedSlides(prev => new Set(prev).add(`${currentChapter}-${currentSlide}`));
                        }}
                        onRetry={() => {
                          console.log('[章节测试] 重新测试');
                        }}
                      />
                    )}

                    {/* 视频播放 */}
                    {block.type === 'video' && block.videoUrl && (
                      <div className="border border-red-300 relative bg-black rounded-lg overflow-hidden shadow-md">
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
                                background: `linear-gradient(to right, #dc2626 ${videoDuration ? (videoProgress / videoDuration) * 100 : 0}%, #4b5563 ${videoDuration ? (videoProgress / videoDuration) * 100 : 0}%)`,
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
                                  <Pause className="h-5 w-5 text-red-600" />
                                ) : (
                                  <Play className="h-5 w-5 text-red-600 ml-1" />
                                )}
                              </button>
                              <span className="text-white text-sm font-mono">
                                {formatTime(videoProgress)} / {formatTime(videoDuration)}
                              </span>
                            </div>
                            
                            </div>
                        </div>

                        <div className="absolute top-3 left-[23px] w-fit h-[180px] bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-red-600 text-white border border-red-400 shadow-lg px-2 py-0.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap">
                              <Video className="h-3 w-3 mr-1" />
                              AI视频课程
                            </span>
                            <span className="bg-black/70 text-white border border-white/30 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                              {chapter.title}
                            </span>
                          </div>
                          <div className="text-xs text-white/60 mb-2 flex items-center gap-1">
                            <Target className="h-3 w-3 text-red-400" />
                            核心要点
                          </div>
                          <ul className="space-y-1.5">
                            {chapter.title.includes('第3章') && chapter.title.includes('自动') && chapter.title.includes('自主') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  自动 ≠ 自主
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  自动按预设，自主能应变
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  自主 = 感知—认知—决策—执行—反馈
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  面向治理，必须可解释、可评估、可监管
                                </li>
                              </>
                            )}
                            {chapter.title.includes('第3章') && chapter.title.includes('扶贫') && chapter.title.includes('振兴') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  扶贫 ≠ 振兴
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  扶贫是"送"，振兴是"造"
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  振兴 = 产业、人才、文化、生态、组织协同推进
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  面向基层，必须可落地、可评估、可推广
                                </li>
                              </>
                            )}
                            {chapter.title.includes('第5章') && chapter.title.includes('世界模型') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  世界模型 = 机器人的"常识模拟器"
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  预测—执行—修正，形成经验闭环
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  决定具身智能能否进入真实复杂场景
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  走向自主的关键一跃
                                </li>
                              </>
                            )}
                            {chapter.title.includes('第5章') && chapter.title.includes('合作社') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  合作社 = 党建引领 × 群众参与 × 市场对接
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  从单打独斗到抱团发展
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  因地制宜、因村施策，没有标准答案但有通用逻辑
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  合作社模式：乡村振兴的关键制度创新
                                </li>
                              </>
                            )}
                            {chapter.title.includes('第7章') && chapter.title.includes('可解释') && chapter.title.includes('可评估') && chapter.title.includes('可监管') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  可解释：决策留痕可追溯
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  可评估：指标先行数据说话
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  可监管：权限分级日志不可篡改
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  先治理后扩展，先试点再推广
                                </li>
                              </>
                            )}
                            {chapter.title.includes('第7章') && chapter.title.includes('可落地') && chapter.title.includes('可评估') && chapter.title.includes('可推广') && (
                              <>
                                <li className="text-xs text-white font-semibold flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  可落地：从纸面到地面，从蓝图到实景
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  可评估：指标量化、数据说话
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  可推广：做成一个、带动一片
                                </li>
                                <li className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                  先试点后推广，先组织后放活
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 思考步骤展示 */}
              {(() => {
                const currentBlock = currentSlideData[0];
                if (!currentBlock?.thinkingSteps) return null;

                return (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowThinkingLogic(!showThinkingLogic)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg hover:bg-gradient-to-r from-red-100 to-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                          <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-800">🤖 AI 思考过程</div>
                          <div className="text-xs text-gray-500">点击查看智能体如何生成内容</div>
                        </div>
                      </div>
                      {showThinkingLogic ? (
                        <ChevronUp className="h-5 w-5 text-red-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-red-600" />
                      )}
                    </button>
                    
                    {showThinkingLogic && (
                      <div className="mt-3 space-y-4">
                        {currentBlock.thinkingSteps.map((step: ThinkingStep, stepIdx: number) => (
                          <div key={stepIdx} className="p-5 bg-white border border-red-200 rounded-lg relative shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <div className="mb-3">
                                  <span className="text-lg font-bold text-gray-900">
                                    {step.title}
                                  </span>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  {step.description}
                                </p>

                                {/* 参考资料 */}
                                {step.references && step.references.length > 0 && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Sparkles className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-bold text-blue-700">📚 参考资料</span>
                                    </div>
                                    <div className="space-y-2">
                                      {step.references.map((ref: ReferenceItem, refIdx: number) => (
                                        <div key={refIdx} className="flex items-center gap-2 text-sm">
                                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                            ref.relevance === 'high' ? 'bg-green-100 text-green-700' :
                                            ref.relevance === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {ref.relevance === 'high' ? '高' : ref.relevance === 'medium' ? '中' : '低'}
                                          </span>
                                          <span className="text-gray-700">
                                            <strong>{ref.title}</strong>
                                            {ref.source && <span className="text-gray-500"> - {ref.source}</span>}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 未通过审核的内容 */}
                                {step.rejectedContents && step.rejectedContents.length > 0 && (
                                  <div className="mb-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Sparkles className="h-4 w-4 text-red-600" />
                                      <span className="text-sm font-bold text-red-700">❌ 审核未通过</span>
                                    </div>
                                    <div className="space-y-3">
                                      {step.rejectedContents.map((rej: RejectedContent, rejIdx: number) => (
                                        <div key={rejIdx} className="border border-red-200 rounded p-3">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                              rej.type === 'too_radical' ? 'bg-orange-100 text-orange-700' :
                                              rej.type === 'no_meaning' ? 'bg-purple-100 text-purple-700' :
                                              rej.type === 'inaccurate' ? 'bg-red-100 text-red-700' :
                                              rej.type === 'redundant' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                              {rej.type === 'too_radical' ? '表述过激' :
                                               rej.type === 'no_meaning' ? '内容空洞' :
                                               rej.type === 'inaccurate' ? '内容不实' :
                                               rej.type === 'redundant' ? '内容冗余' : '其他原因'}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-2">
                                            <span className="line-through opacity-60">{rej.content}</span>
                                          </p>
                                          <p className="text-xs text-gray-500 italic">
                                            原因：{rej.reason}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 输出结果 */}
                                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-bold text-green-700">✅ 本步输出</span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {step.output}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 text-center">
                          <p className="text-sm text-gray-600 italic">
                            💡 提示：这个思考过程展示了AI如何一步步生成最终内容。您可以参考这个思路来组织自己的学习笔记。
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* AI标签浮窗 */}
              {showAITag && (() => {
                const allTags = currentSlideData.flatMap((b: ContentBlock) => b.aiTags || []);
                const tag = allTags.find((t: AITag) => t.text === showAITag);
                if (!tag) return null;
                return (
                  <div className="mt-4 p-4 border border-orange-300 bg-orange-50 relative rounded-lg shadow-sm">
                    <button
                      onClick={() => setShowAITag(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${getTagColor(tag.type)}`}>
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

          {/* 课程综合测试 - 交互式答题区 */}
          {isCourseTestChapter && currentSlide === 1 && (
            <div className="border-2 border-purple-600 bg-white p-6 relative mb-4" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                AI智能阅卷 - 课程综合测试
              </div>

              {!testState.results ? (
                <>
                  <h3 className="font-black text-xl text-black mt-2 mb-2">课程综合测试（共{courseTestQuestions.length}题，满分120分）</h3>
                  <p className="text-sm text-gray-600 mb-4">请在下方逐题作答，完成后点击"提交AI阅卷"获取评分和评语</p>

                  <div className="space-y-4">
                    {courseTestQuestions.map((q: any, qi: number) => {
                      const isSubjective = q.isSubjective;
                      const isChoice = q.questionType === 'single_choice' || q.questionType === 'true_false';
                      return (
                        <div key={q.id} className={`p-4 border-2 ${isSubjective ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="flex items-start gap-3 mb-2">
                            <div className={`w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-black text-sm ${isSubjective ? 'bg-purple-600' : 'bg-purple-600'}`}>
                              {qi + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 text-sm leading-relaxed">{q.question}</p>
                                {isSubjective && (
                                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 border border-black flex-shrink-0">
                                    主观题30分
                                  </span>
                                )}
                                {isChoice && (
                                  <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 border border-black flex-shrink-0">
                                    {q.questionType === 'true_false' ? '判断题10分' : '单选题10分'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">参考章节：{q.chapterRef}</p>
                              {q.hint && <p className="text-xs text-amber-600 mt-0.5">💡 {q.hint}</p>}
                            </div>
                          </div>
                          {isChoice ? (
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt: any) => (
                                <label
                                  key={opt.label}
                                  className="flex items-center gap-2 p-2 border-2 border-gray-300 bg-white cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value={opt.label}
                                    checked={testState.answers[q.id] === opt.label}
                                    onChange={(e) => handleTestAnswerChange(q.id, e.target.value)}
                                    className="w-4 h-4 accent-purple-600"
                                  />
                                  <span className="font-bold text-sm text-gray-700">{opt.label}.</span>
                                  <span className="text-sm text-gray-800">{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <textarea
                              className="w-full border-2 p-3 text-sm mt-2 bg-white border-purple-300"
                              style={{ borderRadius: '0', minHeight: '160px' }}
                              placeholder="请根据案例框架逐步分析回答..."
                              value={testState.answers[q.id] || ''}
                              onChange={(e) => handleTestAnswerChange(q.id, e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {testState.gradingError && (
                    <div className="mt-4 p-3 border-2 border-red-500 bg-red-50 text-red-700 text-sm font-bold">
                      {testState.gradingError}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      size="lg"
                      className="bg-purple-600 text-white font-bold border-2 border-black hover:bg-purple-700"
                      style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                      onClick={handleSubmitTest}
                      disabled={testState.isGrading}
                    >
                      {testState.isGrading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          AI正在阅卷中...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          提交AI阅卷
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-black text-xl text-black mt-2 mb-4">📊 阅卷结果</h3>

                  <div className="space-y-4">
                    {courseTestQuestions.map((q: any, qi: number) => {
                      const result = testState.results![q.id];
                      const isSubjective = q.isSubjective;
                      const isChoice = q.questionType === 'single_choice' || q.questionType === 'true_false';
                      const maxScore = isSubjective ? 30 : 10;
                      const goodThreshold = isSubjective ? 21 : 10;
                      const midThreshold = isSubjective ? 15 : 0;
                      const userAnswer = testState.answers[q.id];
                      const chosenOption = isChoice ? q.options?.find((o: any) => o.label === userAnswer) : null;
                      return (
                        <div key={q.id} className={`p-4 border-2 ${result && result.score >= goodThreshold ? 'border-green-500 bg-green-50' : result && result.score >= midThreshold ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50'}`}>
                          <div className="flex items-start gap-2 mb-1">
                            <span className="font-bold text-sm text-gray-900">第{qi + 1}题</span>
                            <span className="text-xs text-gray-500">({q.chapterRef})</span>
                            {isSubjective && <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5">主观题</span>}
                            {isChoice && (
                              <span className={`text-white text-[10px] font-bold px-2 py-0.5 ${result && result.score >= 10 ? 'bg-green-600' : 'bg-red-500'}`}>
                                {result && result.score >= 10 ? '✓ 正确' : '✗ 错误'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                          <div className="bg-white p-2 border border-gray-300 mb-2">
                            <span className="text-xs text-gray-500 font-bold">您的答案：</span>
                            <p className="text-sm text-gray-800 mt-0.5">
                              {isChoice && chosenOption ? `${chosenOption.label}. ${chosenOption.text}` : userAnswer}
                            </p>
                          </div>
                          {result && (
                            <div className="flex items-start gap-4 mt-2">
                              <div className={`px-3 py-1 text-white font-bold text-sm border-2 border-black ${result.score >= goodThreshold ? 'bg-green-600' : result.score >= midThreshold ? 'bg-amber-500' : 'bg-red-500'}`}>
                                {result.score}/{maxScore}分
                              </div>
                              <p className="text-sm text-gray-700 flex-1">{result.comment}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-5 border-2 border-purple-600 bg-purple-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-600 flex items-center justify-center border-2 border-black">
                        <span className="text-white font-black text-lg">AI</span>
                      </div>
                      <h4 className="font-black text-purple-900">AI阅卷综合评价</h4>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{testState.overallFeedback}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      size="lg"
                      className="bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500"
                      style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                      onClick={handleRetryTest}
                    >
                      重新答题
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI数字人讲解区域 */}
          {speechContents.length > 0 && (
            <div className="mb-6">
              <DigitalAvatar 
                chapterContents={speechChapterContents}
                currentChapterIndex={currentChapter}
                courseId={courseId}
                courseName={course?.name}
                currentPageIndex={currentSlide}
                onSpeechEnd={() => {
                  console.log('[数字人] 语音播放完成');
                }}
                onSectionChange={(sectionIdx) => {
                  if (sectionIdx >= 0 && sectionIdx < slides.length && sectionIdx !== currentSlide) {
                    setCurrentSlide(sectionIdx);
                  }
                }}
              />
            </div>
          )}

          {/* 翻页控制 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="border border-gray-300 font-bold hover:bg-red-50"
              onClick={handlePrevSlide}
              disabled={currentChapter === 0 && currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">
                {currentSlide + 1} / {totalSlides}
              </span>
            </div>

            {isLastSlide ? (
              <Button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold border border-green-400 shadow-sm"
                onClick={handleNextSlide}
              >
                返回课程列表
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold border border-red-400 shadow-sm"
                onClick={handleNextSlide}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* 快捷键提示 */}
          {!focusMode && (
            <div className="mt-4 text-center text-xs text-gray-400">
              <span className="inline-flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">→</kbd>
                <span>翻页</span>
                <span className="mx-1">·</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">F</kbd>
                <span>专注模式</span>
                <span className="mx-1">·</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">N</kbd>
                <span>笔记</span>
              </span>
            </div>
          )}
          </div>
        </main>

        {/* 右侧AI问答面板 - 专注模式下隐藏 */}
        {showChatPanel && !focusMode && (
          <aside className="w-80 flex-shrink-0">
            <div className="bg-white border border-red-200 rounded-lg sticky top-24 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-red-600 to-orange-500 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI学习助手
                </h3>
                <p className="text-xs text-white/80 mt-1">基于知识图谱 · 精准答疑</p>
              </div>
              
              {/* 消息列表 */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 text-sm rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-red-600" />
                          <span className="text-[10px] font-bold text-red-600">AI助手</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* 输入框 */}
              <form onSubmit={handleChatSubmit} className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="输入您的问题..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <Button type="submit" size="sm" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border border-red-400 rounded-lg">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>
      </div>
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
