'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  type: 'text' | 'image' | 'mixed' | 'video' | 'learning_objective';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  aiTags?: AITag[];
  chapterTitle?: string;
  thinkingSteps?: ThinkingStep[];
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

// 多样化的参考来源库
const REFERENCE_SOURCES = [
  { title: '首个人形机器人与具身智能标准体系发布', source: '新华网', relevance: 'high' },
  { title: '中国深化"人工智能+"打造增长新引擎', source: '新华网', relevance: 'high' },
  { title: '"具身智能"如何走向未来？', source: '人民网科普', relevance: 'high' },
  { title: '首入《政府工作报告》，具身智能何以竞速未来', source: '人民日报', relevance: 'high' },
  { title: '具身智能迈向标准引领新阶段', source: '人民网经济·科技', relevance: 'high' },
  { title: '具身智能新浪潮与落地要点', source: '人民网经济·科技', relevance: 'medium' },
  { title: '具身世界模型报道', source: '人民网经济·科技', relevance: 'medium' },
  { title: '产业侧共识：跑得快更要跑得稳', source: '人民网经济·科技', relevance: 'medium' },
  { title: '具身智能走向更多生活场景', source: '人民网经济·科技', relevance: 'medium' },
  { title: '规范与能力建设', source: '人民网教育', relevance: 'medium' },
  { title: '以未来产业塑造产业未来', source: '人民网时评', relevance: 'medium' },
  { title: '具身智能大有可为', source: '共产党员网', relevance: 'high' },
  { title: '具身智能发展报告（2025年）', source: '中国信通院', relevance: 'high' },
  { title: '2026中国具身智能大会官网', source: 'CEAI/CAAI', relevance: 'high' },
  { title: '大会资料/白皮书 PDF', source: 'CEAI', relevance: 'high' },
  { title: '术语与前沿论坛', source: '智源社区', relevance: 'medium' },
  { title: '具身专题', source: 'GAITC 2025', relevance: 'medium' },
  { title: '标准体系助推产业规范化', source: 'CCTV', relevance: 'high' },
  { title: '标准体系（2026', source: '百度百科', relevance: 'medium' },
  { title: '中国具身智能大会词条', source: '百度百科', relevance: 'medium' },
  { title: '具身智能赋能应急管理产业', source: '赛迪顾问', relevance: 'high' },
  { title: '相关政策解读', source: '人民日报', relevance: 'high' },
  { title: '专题学习资料', source: '共产党员网', relevance: 'high' },
  { title: '权威解读', source: '人民网', relevance: 'medium' },
];

// 随机选择N个不重复的参考来源
function getRandomReferences(count: number, title: string): ReferenceItem[] {
  // 打乱并选择指定数量的不重复来源
  const shuffled = [...REFERENCE_SOURCES].sort(() => Math.random() - 0.5);
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

// 智能生成审核未通过内容
function getRejectedContents(content: string, title: string): RejectedContent[] {
  // 根据内容类型生成相关的审核未通过示例
  let rejected: RejectedContent[] = [
    { content: '具身智能是最重要的技术，没有之一', reason: '表述过于绝对化', type: 'too_radical' },
    { content: '具身智能发展前途渺茫，没有实际价值', reason: '观点错误，不符合政策方向', type: 'inaccurate' },
    { content: '具身智能一定要追求"人形"机器人', reason: '不够客观，人形只是载体之一', type: 'inaccurate' },
    { content: '具身智能就是"人形机器人"', reason: '观点错误，理解片面', type: 'inaccurate' },
    { content: '具身智能就是大模型的升级', reason: '观点错误，认知不全', type: 'inaccurate' },
    { content: '传统机器人已经够了，不需要发展具身智能', reason: '观点错误，没有认识到具身智能的价值', type: 'inaccurate' },
    { content: '具身智能就是AI加个外壳', reason: '理解片面，没有认识到闭环的重要性', type: 'inaccurate' },
    { content: '这个方法肯定能解决所有问题', reason: '表述过于绝对化', type: 'too_radical' },
    { content: '照搬其他地区的方法就行', reason: '不够具体，没有考虑本地实际', type: 'no_meaning' },
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
  
  // 如果是关于机器人或载体的内容
  if (content.includes('机器人') || content.includes('人形')) {
    rejected.unshift({ content: '不是人形机器人就不算具身智能', reason: '理解片面，人形只是载体之一', type: 'inaccurate' });
  }
  
  // 如果是关于大模型的内容
  if (content.includes('模型') || content.includes('大模型')) {
    rejected.unshift({ content: '具身智能就是大模型的升级', reason: '观点错误，认知不全', type: 'inaccurate' });
  }
  
  // 打乱并返回2个
  return rejected.sort(() => Math.random() - 0.5).slice(0, 2);
}

// 模拟课程数据（备用，当localStorage没有数据时使用）
const mockCourseData = {};

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
            if (chapterContent.includes('---PAGE---')) {
              const pageSections = chapterContent.split('---PAGE---').filter((p: string) => p.trim());
              let pIndex = 0;
              const chapterNumMatch = ch.title.match(/第(\d+)章/);
              const chapterImageNum = chapterNumMatch ? parseInt(chapterNumMatch[1]) : 0;
              for (const section of pageSections) {
                const trimmed = section.trim();
                const isLearningObjective = trimmed.startsWith('【学习目标】') || /^##\s*第\s*\d+\s*章·学习目标/.test(trimmed) || /^##\s*学习目标/.test(trimmed);
                const isPSection = /【P\d+/.test(trimmed) || /^##\s*第\s*\d+\s*章｜P\d+/.test(trimmed);
                
                // 生成思考步骤的辅助函数
              const generateThinkingSteps = (content: string, sectionType: string, title: string) => {
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
                    references: getRandomReferences(3, title),
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
                        content: '学完这章就懂具身智能了',
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
                    rejectedContents: getRejectedContents(content, title),
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

              if (isLearningObjective) {
                const objectiveContent = trimmed.startsWith('【学习目标】') 
                  ? trimmed.replace('【学习目标】', '').trim()
                  : trimmed.replace(/^##\s*第\s*\d+\s*章·学习目标\s*\n*/, '').replace(/^##\s*学习目标\s*\n*/, '').trim();
                slides.push({
                  type: 'learning_objective',
                  content: objectiveContent,
                  chapterTitle: ch.title,
                  thinkingSteps: generateThinkingSteps(objectiveContent, 'learning_objective', ch.title),
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
                  thinkingSteps: generateThinkingSteps(trimmed, 'mixed', ch.title),
                });
              } else {
                slides.push({
                  type: 'text',
                  content: trimmed,
                  thinkingSteps: generateThinkingSteps(trimmed, 'text', ch.title),
                });
              }
              }
            } else {
              // 通用思考步骤生成函数
              const generateGenericThinkingSteps = (content: string, title: string) => {
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
                    references: getRandomReferences(3, title),
                    output: '找到相关参考资料，完成初步信息收集',
                  },
                  {
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '从大量信息中筛选核心表述',
                    rejectedContents: getRejectedContents(content, title),
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
                slides.push({
                  type: 'text',
                  content: chapterContent,
                  chapterTitle: ch.title,
                  thinkingSteps: generateGenericThinkingSteps(chapterContent, ch.title),
                });
              } else {
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
                const thinkingSteps = generateGenericThinkingSteps(pageContent, ch.title);
                
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
          
          const summaries: Record<string, string> = {
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
          return { id: ch.id, title: ch.title, totalSlides: slides.length, aiSummary: summaries[ch.title] || `${ch.title}。深入讲解核心要义，帮助您全面掌握相关知识点和实践方法。`, keyPoints: [ch.title.replace(/第.*章[：:]/, '').substring(0, 10)], videoUrl, slides };
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
  const [showThinkingLogic, setShowThinkingLogic] = useState(false);

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
      setShowThinkingLogic(false);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      const prevChapter = course.chapters[currentChapter - 1];
      setCurrentSlide(prevChapter.slides.length - 1);
      setShowAITag(null);
      setShowThinkingLogic(false);
    }
  };

  const handleNextSlide = () => {
    // 标记当前页为已完成
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
                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                    第{currentSlide + 1}页
                  </span>
                  <span className="text-sm text-gray-500">共{totalSlides}页</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* AI能力标识 */}
                  <span className="border border-amber-400 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI图文混合
                  </span>
                </div>
              </div>

              {/* 内容块渲染 */}
              <div className="space-y-6">
                {currentSlideData.map((block: ContentBlock, blockIdx: number) => (
                  <div key={blockIdx}>
                    {/* 学习目标页面 - 紧凑居中 */}
                    {block.type === 'learning_objective' && (
                      <div className="flex flex-col items-center text-center px-6 py-6">
                        <div className="max-w-xl mx-auto">
                          {block.chapterTitle && (
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b-2 border-red-400">{block.chapterTitle}</h2>
                          )}
                          <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full tracking-wider">
                              学习目标
                            </span>
                          </div>
                          <div className="prose prose-gray max-w-none [&_li]:text-base [&_li]:font-medium [&_li]:text-gray-800 [&_li]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:list-none [&_ul]:pl-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {block.content.replace('【学习目标】', '').trim()}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 纯文本 */}
                    {block.type === 'text' && (
                      <div>
                        {block.chapterTitle && (
                          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-400">{block.chapterTitle}</h2>
                        )}
                        <div className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-red-400 prose-h2:text-gray-900 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2 prose-p:text-base prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:underline [&_a]:text-blue-600 [&_a]:underline prose-table:text-sm prose-table:border-collapse prose-table:border prose-table:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:border [&_th]:border-gray-300 [&_td]:p-2 [&_td]:border [&_td]:border-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {block.content}
                          </ReactMarkdown>
                        </div>
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

                    {/* 图文混合 - 全文宽Markdown + 图片下方排列 */}
                    {block.type === 'mixed' && (
                      <div>
                        <div className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-red-400 prose-h2:text-gray-900 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-3 prose-p:text-base prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:underline [&_a]:text-blue-600 [&_a]:underline prose-table:text-sm prose-table:border-collapse prose-table:border prose-table:border-gray-300 [&_th]:bg-gray-100 [&_th]:p-2 [&_th]:border [&_th]:border-gray-300 [&_td]:p-2 [&_td]:border [&_td]:border-gray-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {block.content}
                          </ReactMarkdown>
                        </div>
                        {block.imageUrl && (
                          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden max-w-lg mx-auto">
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
                            <div className="aspect-video bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center" style={{ display: 'none' }}>
                              <div className="text-center p-4">
                                <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center">
                                  <span className="text-xl">📊</span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">{block.imageCaption || '课程配图'}</p>
                              </div>
                            </div>
                            {block.imageCaption && (
                              <div className="p-2 bg-gray-50 text-xs text-gray-500 text-center border-t">
                                ▲ {block.imageCaption}
                              </div>
                            )}
                          </div>
                        )}
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
                          <span className="bg-purple-600 text-white border border-purple-400 shadow-lg px-2 py-0.5 rounded text-xs font-medium flex items-center">
                            <Video className="h-3 w-3 mr-1" />
                            AI视频课程
                          </span>
                          <span className="bg-black/70 text-white border border-white/30 text-xs px-2 py-0.5 rounded">
                            {chapter.title}
                          </span>
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
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg hover:bg-gradient-to-r from-purple-100 to-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                          <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-800">🤖 AI 思考过程</div>
                          <div className="text-xs text-gray-500">点击查看智能体如何生成内容</div>
                        </div>
                      </div>
                      {showThinkingLogic ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </button>
                    
                    {showThinkingLogic && (
                      <div className="mt-3 space-y-4">
                        {currentBlock.thinkingSteps.map((step: ThinkingStep, stepIdx: number) => (
                          <div key={stepIdx} className="p-5 bg-white border-2 border-purple-200 rounded-lg relative">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
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
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 text-center">
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
