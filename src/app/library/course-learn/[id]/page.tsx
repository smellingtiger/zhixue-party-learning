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
  url?: string;
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
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '用户需要了解乡村振兴战略的基本定位，我需要先确定核心内容框架',
                  output: '需要包含：提出时间、重要地位、核心定位',
                },
                {
                  step: 2,
                  title: '📚 知识检索',
                  description: '从政策文件库中检索相关权威资料',
                  references: [
                    { title: '党的十九大报告', url: 'https://www.12371.cn/', source: '共产党员网', relevance: 'high' },
                    { title: '乡村振兴战略规划(2018-2022年)', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'high' },
                    { title: '2018年中央一号文件', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'medium' },
                  ],
                  output: '找到3个核心参考资料，其中2个高度相关',
                },
                {
                  step: 3,
                  title: '✂️ 内容筛选',
                  description: '从检索结果中提取关键信息',
                  rejectedContents: [
                    {
                      content: '乡村振兴就是让农民都进城',
                      reason: '内容完全错误，与政策精神相悖',
                      type: 'inaccurate',
                    },
                    {
                      content: '乡村振兴战略是个很一般的政策，不重要',
                      reason: '表述过于消极，不符合政策定位',
                      type: 'too_radical',
                    },
                  ],
                  output: '筛选出核心表述：十九大提出、总抓手、三农工作',
                },
                {
                  step: 4,
                  title: '✏️ 内容撰写',
                  description: '整合信息，撰写准确表述',
                  output: '乡村振兴战略是党的十九大提出的重大决策部署，是新时代"三农"工作的总抓手。',
                },
                {
                  step: 5,
                  title: '✅ 质量审核',
                  description: '审核内容的准确性和合规性',
                  rejectedContents: [
                    {
                      content: '乡村振兴战略是十九大最重要的决策，没有之一',
                      reason: '表述过于绝对化，不符合客观表述要求',
                      type: 'too_radical',
                    },
                    {
                      content: '乡村振兴战略，大家都知道',
                      reason: '内容空洞，没有实际信息价值',
                      type: 'no_meaning',
                    },
                  ],
                  output: '最终版本通过审核，表述准确、客观、完整',
                },
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
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '需要展示乡村振兴战略的完整框架，让用户理解五大振兴的关系',
                  output: '核心任务：列出五个振兴、说明相互关系',
                },
                {
                  step: 2,
                  title: '📚 知识检索',
                  description: '检索五大振兴的官方表述和理论框架',
                  references: [
                    { title: '乡村振兴战略规划(2018-2022年)', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'high' },
                    { title: '习近平关于"三农"工作的重要论述', url: 'https://www.12371.cn/', source: '共产党员网', relevance: 'high' },
                    { title: '乡村振兴促进法', url: 'https://www.npc.gov.cn/', source: '中国人大网', relevance: 'medium' },
                  ],
                  output: '确认五大振兴的官方排序和表述',
                },
                {
                  step: 3,
                  title: '✂️ 内容筛选',
                  description: '从多份文件中筛选最核心的表述',
                  rejectedContents: [
                    {
                      content: '乡村振兴只要产业振兴就行，其他不重要',
                      reason: '理解片面，忽视了五个振兴的系统性',
                      type: 'inaccurate',
                    },
                    {
                      content: '产业、人才、文化、生态、组织，随便排个序',
                      reason: '表述过于随意，不严肃',
                      type: 'no_meaning',
                    },
                  ],
                  output: '确定官方排序：产业、人才、文化、生态、组织',
                },
                {
                  step: 4,
                  title: '🖼️ 配图选择',
                  description: '选择合适的配图增强理解',
                  references: [
                    { title: '乡村振兴战略体系架构图', source: '内部设计资源', relevance: 'high' },
                  ],
                  output: '选择架构图，直观展示五个振兴关系',
                },
                {
                  step: 5,
                  title: '✏️ 内容撰写',
                  description: '撰写完整表述，强调相互关系',
                  rejectedContents: [
                    {
                      content: '五个振兴，一个比一个重要，产业最重要',
                      reason: '表述过于强调单个方面，不符合五大振兴协同推进的精神',
                      type: 'too_radical',
                    },
                  ],
                  output: '乡村振兴的五大核心目标：产业振兴、人才振兴、文化振兴、生态振兴、组织振兴。这五大振兴相互关联、互为支撑，构成了乡村振兴的完整体系。',
                },
                {
                  step: 6,
                  title: '✅ 质量审核',
                  description: '最后审核内容的完整性和准确性',
                  output: '内容完整、表述准确、配图恰当，通过审核',
                },
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
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '阐述产业振兴的重要地位和实现路径',
                  output: '需要：重要性定位 + 具体路径',
                },
                {
                  step: 2,
                  title: '📚 知识检索',
                  description: '检索产业振兴相关政策和成功案例',
                  references: [
                    { title: '全国乡村产业发展规划(2020-2025年)', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'high' },
                    { title: '农业现代化示范区建设案例', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'high' },
                    { title: '江苏华西村产业发展经验', source: '公开报道', relevance: 'medium' },
                  ],
                  output: '找到物质基础定位，确定高质量发展和产业融合为核心路径',
                },
                {
                  step: 3,
                  title: '✂️ 内容筛选',
                  description: '从大量资料中提取最核心的表述',
                  rejectedContents: [
                    {
                      content: '产业振兴就是让农村都搞工业',
                      reason: '理解片面，不符合农村实际，过于激进',
                      type: 'too_radical',
                    },
                    {
                      content: '产业振兴嘛，就是发展农业',
                      reason: '表述过于狭隘，没有体现融合发展',
                      type: 'inaccurate',
                    },
                  ],
                  output: '提取核心：物质基础、高质量发展、新产业新业态、三产融合',
                },
                {
                  step: 4,
                  title: '✏️ 内容撰写',
                  description: '组织语言，撰写完整表述',
                  rejectedContents: [
                    {
                      content: '产业振兴最重要，是基础中的基础，没有它一切都免谈',
                      reason: '表述过于绝对化',
                      type: 'too_radical',
                    },
                    {
                      content: '产业振兴，嗯，很重要，大家都要重视',
                      reason: '内容空洞，没有实质信息',
                      type: 'no_meaning',
                    },
                  ],
                  output: '产业振兴是乡村振兴的物质基础。要推动乡村产业高质量发展，培育新产业新业态新模式，促进农村一二三产业融合发展。',
                },
              ],
            },
          ],
          [
            {
              type: 'image',
              content: '',
              imageUrl: '/placeholder-industry.png',
              imageCaption: '乡村产业融合发展示意图——从单一农业到多元业态的转型升级',
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '通过可视化方式展示产业融合的路径',
                  output: '需要直观展示一、二、三产业融合的流程',
                },
                {
                  step: 2,
                  title: '🖼️ 配图选择',
                  description: '选择最合适的示意图',
                  references: [
                    { title: '乡村产业融合发展示意图', source: '内部设计资源', relevance: 'high' },
                    { title: '农村一二三产业融合案例图集', source: '农业农村部', relevance: 'medium' },
                  ],
                  output: '选择最直观的融合发展示意图',
                },
                {
                  step: 3,
                  title: '✏️ 图注撰写',
                  description: '编写准确的图注说明',
                  rejectedContents: [
                    {
                      content: '看图就懂，不用解释',
                      reason: '内容空洞，没有实际说明价值',
                      type: 'no_meaning',
                    },
                  ],
                  output: '乡村产业融合发展示意图——从单一农业到多元业态的转型升级',
                },
              ],
            },
          ],
          [
            {
              type: 'text',
              content: '人才振兴是乡村振兴的关键因素。要培养造就一支懂农业、爱农村、爱农民的"三农"工作队伍，吸引各类人才在乡村振兴中建功立业。',
              aiTags: [
                { text: '懂农业、爱农村、爱农民', type: '重点', explanation: '这是人才队伍建设的核心标准' },
              ],
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '阐述人才振兴的重要性和具体要求',
                  output: '需要：重要性定位 + 三支队伍 + 三爱标准',
                },
                {
                  step: 2,
                  title: '📚 知识检索',
                  description: '检索人才振兴的官方表述',
                  references: [
                    { title: '关于加快推进乡村人才振兴的意见', url: 'https://www.moa.gov.cn/', source: '农业农村部', relevance: 'high' },
                    { title: '乡村振兴促进法', url: 'https://www.npc.gov.cn/', source: '中国人大网', relevance: 'high' },
                  ],
                  output: '确认关键因素定位和三爱标准',
                },
                {
                  step: 3,
                  title: '✂️ 内容筛选',
                  description: '提取核心表述',
                  rejectedContents: [
                    {
                      content: '农村人太笨，需要城里人来教',
                      reason: '表述带有偏见，不符合人才振兴的包容精神',
                      type: 'too_radical',
                    },
                  ],
                  output: '关键因素、懂农业爱农村爱农民、吸引各类人才',
                },
                {
                  step: 4,
                  title: '✏️ 内容撰写',
                  description: '撰写完整表述',
                  output: '人才振兴是乡村振兴的关键因素。要培养造就一支懂农业、爱农村、爱农民的"三农"工作队伍，吸引各类人才在乡村振兴中建功立业。',
                },
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
              thinkingSteps: [
                {
                  step: 1,
                  title: '🤖 需求分析',
                  description: '阐述文化振兴的重要性和主要内容',
                  output: '需要：灵魂定位 + 挖掘传统文化 + 培育三风',
                },
                {
                  step: 2,
                  title: '📚 知识检索',
                  description: '检索文化振兴的相关表述',
                  references: [
                    { title: '关于加强和改进乡村治理的指导意见', source: '中央农办', relevance: 'high' },
                    { title: '关于进一步推进移风易俗建设文明乡风的指导意见', source: '农业农村部', relevance: 'high' },
                  ],
                  output: '灵魂定位、思想观念人文精神道德规范、三风培育',
                },
                {
                  step: 3,
                  title: '✂️ 内容筛选',
                  description: '筛选核心表述',
                  rejectedContents: [
                    {
                      content: '农村文化都是落后的，都要改掉',
                      reason: '对传统文化全盘否定，不符合文化传承精神',
                      type: 'too_radical',
                    },
                    {
                      content: '文化就是唱戏跳舞',
                      reason: '理解过于狭隘，没有认识到文化的深层内涵',
                      type: 'inaccurate',
                    },
                  ],
                  output: '灵魂地位、挖掘优秀传统、培育三风',
                },
                {
                  step: 4,
                  title: '🖼️ 配图选择',
                  description: '选择体现传统文化与现代交融的图片',
                  references: [
                    { title: '传统农耕文化与现代文明交融', source: '内部设计资源', relevance: 'high' },
                  ],
                  output: '选择体现传承与创新的配图',
                },
                {
                  step: 5,
                  title: '✏️ 内容撰写',
                  description: '整合所有元素',
                  output: '文化振兴是乡村振兴的灵魂。要深入挖掘优秀传统农耕文化蕴含的思想观念、人文精神、道德规范，培育文明乡风、良好家风、淳朴民风。',
                },
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
                    references: [
                      { title: '相关政策文件', source: '中央政府网站', relevance: 'high' },
                      { title: '权威解读文章', source: '共产党员网', relevance: 'high' },
                    ],
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
                        content: '学完这章就懂了',
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
                    rejectedContents: [
                      {
                        content: '这个是全世界最重要的',
                        reason: '表述过于绝对化',
                        type: 'too_radical',
                      },
                    ],
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
                    references: [
                      { title: '相关政策文件', source: '中央政府网站', relevance: 'high' },
                      { title: '权威解读', source: '共产党员网', relevance: 'medium' },
                    ],
                    output: '找到相关参考资料，完成初步信息收集',
                  },
                  {
                    step: 3,
                    title: '✂️ 内容筛选',
                    description: '从大量信息中筛选核心表述',
                    rejectedContents: [
                      {
                        content: '这个太重要了，不说不行',
                        reason: '表述过于绝对化',
                        type: 'too_radical',
                      },
                      {
                        content: '大家都懂的',
                        reason: '内容空洞无实际信息',
                        type: 'no_meaning',
                      },
                    ],
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
  const searchParams = useSearchParams();
  const courseId = params?.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());

  // 获取目标章节索引：优先使用URL参数，其次使用localStorage
  const getInitialChapter = () => {
    try {
      const chapterParam = searchParams.get('chapter');
      if (chapterParam !== null) {
        return parseInt(chapterParam, 10);
      }
      const saved = localStorage.getItem(`current_chapter_${courseId}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [currentChapter, setCurrentChapter] = useState(getInitialChapter);
  const [currentSlide, setCurrentSlide] = useState(() => {
    try {
      const saved = localStorage.getItem(`current_slide_${courseId}`);
      return saved ? parseInt(saved, 10) : 0;
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
  const [showAISummary, setShowAISummary] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_summary_preference');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showThinkingLogic, setShowThinkingLogic] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [slideNotes, setSlideNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`slide_notes_${courseId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [learningSeconds, setLearningSeconds] = useState(0);

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
      router.push('/library');
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
              
              return (
              <div key={ch.id}>
                <button
                  onClick={() => handleChapterSelect(idx)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-100 hover:bg-gray-50 transition-all ${
                    isCurrent ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm flex-shrink-0 ${
                    completed ? 'bg-green-100 text-green-600 border border-green-300' :
                    isCurrent ? 'bg-red-600 text-white' :
                    partiallyCompleted ? 'bg-orange-100 text-orange-600 border border-orange-300' :
                    'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {completed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${
                      completed ? 'text-gray-500 line-through' :
                      isCurrent ? 'text-red-700' :
                      partiallyCompleted ? 'text-orange-700' :
                      'text-gray-600'
                    }`}>
                      {ch.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ch.slides.length}页 · {ch.keyPoints.length}个知识点
                    </div>
                  </div>
                  {completed && (
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">已学</span>
                  )}
                </button>
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
              <Button variant="ghost" size="sm" className="border border-red-300 text-red-700 hover:bg-red-50" onClick={() => router.replace('/library')}>
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
                    AI图文混合
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
                                  <p className="relative z-10 text-base text-gray-700 leading-loose">
                                    {children}
                                  </p>
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
                      <div className="space-y-10">
                        {/* 内容区域：左文右图或上图下文 */}
                        <div className={block.imageUrl ? 'grid grid-cols-1 lg:grid-cols-5 gap-8 items-start' : ''}>
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
                                <p className="relative z-10 text-base text-gray-700 leading-loose">
                                  {children}
                                </p>
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

                          {/* 图片侧边栏 */}
                          {block.imageUrl && (
                            <div className="lg:col-span-2">
                              <figure className="sticky top-4">
                                <div className="relative group overflow-hidden rounded-lg border border-red-200 shadow-sm">
                                  <img
                                    src={block.imageUrl}
                                    alt={block.imageCaption || '课程配图'}
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      target.style.display = 'none';
                                      const placeholder = target.parentElement;
                                      if (placeholder) {
                                        placeholder.innerHTML = `<div class="aspect-square bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center"><div class="text-center p-4"><div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center"><span class="text-2xl">📊</span></div><p class="text-sm text-gray-600 font-medium">${block.imageCaption || '课程配图'}</p><p class="text-xs text-gray-400 mt-1">图片加载中</p></div></div>`;
                                      }
                                    }}
                                  />
                                  {/* 图片角标装饰 */}
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400" />
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400" />
                                </div>
                                {block.imageCaption && (
                                  <figcaption className="mt-3 text-xs text-gray-500 leading-relaxed pl-2 border-l-2 border-red-300">
                                    {block.imageCaption}
                                  </figcaption>
                                )}
                              </figure>
                            </div>
                          )}
                        </div>
                      </div>
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
                          <span className="bg-red-600 text-white border border-red-400 shadow-lg px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                            <Video className="h-3 w-3 mr-1" />
                            AI视频课程
                          </span>
                          <span className="bg-black/70 text-white border border-white/30 text-xs px-2 py-0.5 rounded-full">
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
              <Button
                variant="outline"
                size="sm"
                className="border border-gray-300 hover:bg-red-50"
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
                className="border border-gray-300 hover:bg-red-50"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
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
