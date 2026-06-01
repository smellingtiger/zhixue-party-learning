'use client';

import { useState, useRef, useCallback } from 'react';
import {
  BookOpen,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  Target,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Presentation,
  MessageCircle,
  PenLine,
  Clock,
  GraduationCap,
  Users,
  Bot,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const taskTypes = [
  { value: 'outline', label: '教学大纲', icon: ListChecks, desc: '生成完整的课程教学大纲' },
  { value: 'plan', label: '教案编写', icon: PenLine, desc: '生成详细的课时教案' },
  { value: 'courseware', label: '课件设计', icon: Presentation, desc: '设计PPT课件内容框架' },
  { value: 'discussion', label: '讨论题', icon: MessageCircle, desc: '设计课堂讨论方案' },
  { value: 'exam', label: '考试题', icon: FileText, desc: '生成考试题目和答案' },
];

const courseTypes = [
  { value: 'theory', label: '理论课' },
  { value: 'practice', label: '实践课' },
  { value: 'seminar', label: '研讨课' },
  { value: 'special', label: '专题党课' },
];

const audienceOptions = [
  { value: 'cadre', label: '领导干部' },
  { value: 'youth', label: '青年干部' },
  { value: 'grassroots', label: '基层党员' },
  { value: 'new', label: '新入党党员' },
  { value: 'general', label: '普通党员' },
];

const durationOptions = [
  { value: '1', label: '1课时（45分钟）' },
  { value: '2', label: '2课时（90分钟）' },
  { value: '3', label: '3课时（135分钟）' },
  { value: '4', label: '4课时（180分钟）' },
  { value: '8', label: '8课时（一天）' },
];

const quickPrompts = [
  '请推荐一些相关的教学案例素材',
  '请帮我优化教学目标表述',
  '请补充一些课堂互动环节设计',
  '请推荐相关的参考文献和资料',
  '请帮我设计一个课堂导入的小故事',
];

export default function LessonPrepPage() {
  const [taskType, setTaskType] = useState('outline');
  const [courseTopic, setCourseTopic] = useState('');
  const [courseType, setCourseType] = useState('theory');
  const [duration, setDuration] = useState('2');
  const [audience, setAudience] = useState('cadre');
  const [teachingObjectives, setTeachingObjectives] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!courseTopic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent('');
    setShowResult(true);
    setChatHistory([]);

    const taskLabel = taskTypes.find(t => t.value === taskType)?.label || taskType;
    const courseTypeLabel = courseTypes.find(c => c.value === courseType)?.label || courseType;
    const audienceLabel = audienceOptions.find(a => a.value === audience)?.label || audience;
    const durationLabel = durationOptions.find(d => d.value === duration)?.label || duration;

    const userMessage = `请为我准备党校课程备课材料，具体要求如下：

【备课任务】${taskLabel}
【课程主题】${courseTopic}
【课程类型】${courseTypeLabel}
【课时安排】${durationLabel}
【授课对象】${audienceLabel}
${teachingObjectives.trim() ? `【教学目标】${teachingObjectives}` : ''}
${additionalRequirements.trim() ? `【补充要求】${additionalRequirements}` : ''}

请严格按照以上要求进行备课，确保内容政治正确、结构清晰、实用性强。`;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/lesson-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          taskType,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

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
                setGeneratedContent(fullContent);
              }
              if (data.done) break;
            } catch {}
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('备课生成错误:', error);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [taskType, courseTopic, courseType, duration, audience, teachingObjectives, additionalRequirements]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleReset = () => {
    setCourseTopic('');
    setCourseType('theory');
    setDuration('2');
    setAudience('cadre');
    setTeachingObjectives('');
    setAdditionalRequirements('');
    setGeneratedContent('');
    setShowResult(false);
    setIsGenerating(false);
    setChatHistory([]);
    setChatInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !generatedContent) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    setIsGenerating(true);

    const messages = [
      { role: 'system', content: `你之前已经为党校教师生成了备课材料，内容如下：\n\n${generatedContent.substring(0, 3000)}\n\n请根据用户的新问题，在上述备课材料的基础上进行补充、修改或优化。保持Markdown格式输出。` },
      { role: 'user', content: userMsg },
    ];

    try {
      const response = await fetch('/api/lesson-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          taskType: 'default',
        }),
      });

      if (!response.ok) throw new Error('请求失败');

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
                setChatHistory(prev => {
                  const updated = [...prev];
                  if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                    updated[updated.length - 1] = { role: 'assistant', content: fullContent };
                  } else {
                    updated.push({ role: 'assistant', content: fullContent });
                  }
                  return updated;
                });
              }
              if (data.done) break;
            } catch {}
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('对话错误:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [chatInput, generatedContent]);

  const exportToWord = async () => {
    if (!generatedContent) return;

    const lines = generatedContent.split('\n');
    const children: Paragraph[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        children.push(new Paragraph({ text: '' }));
        continue;
      }

      if (trimmed.startsWith('## ')) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: trimmed.replace('## ', ''),
                bold: true,
                size: 32,
                font: '黑体',
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (trimmed.startsWith('### ')) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [
              new TextRun({
                text: trimmed.replace('### ', ''),
                bold: true,
                size: 28,
                font: '黑体',
              }),
            ],
            spacing: { before: 200, after: 80 },
          })
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.replace(/^[-*]\s+/, '');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text,
                size: 24,
                font: '仿宋',
              }),
            ],
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
          })
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s+/, '');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text,
                size: 24,
                font: '仿宋',
              }),
            ],
            spacing: { before: 40, after: 40 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                size: 24,
                font: '仿宋',
              }),
            ],
            spacing: { before: 40, after: 40 },
            indent: { firstLine: 480 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: courseTopic || '备课材料',
                  bold: true,
                  size: 44,
                  font: '方正小标宋简体',
                }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${taskTypes.find(t => t.value === taskType)?.label || ''} · ${courseTypes.find(c => c.value === courseType)?.label || ''}`,
                  size: 24,
                  color: '666666',
                  font: '楷体',
                }),
              ],
              spacing: { after: 360 },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
              },
            }),
            ...children,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${courseTopic || '备课材料'}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`;
    saveAs(blob, fileName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto">
      {!showResult && (
        <div className="mb-6">
          <div className="border-2 border-black bg-white relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className="absolute -top-3 left-6 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-black px-4 py-1.5 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              智能备课 · 三步即成
            </div>

            <div className="grid grid-cols-3 gap-0 p-6 pt-8">
              <div className="relative pr-6 border-r-2 border-dashed border-gray-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center border-2 border-black" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                      <span className="text-white font-black text-lg">01</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black mb-2">智能解析 · 精准定位</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      基于 <span className="text-red-600 font-bold">DeepSeek-V4-Flash</span> 大语言模型，深度理解课程主题、教学大纲与授课对象，自动匹配党校教学体系与学术术语
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-xs font-bold text-red-700" style={{ borderRadius: '0' }}>
                        <BookOpen className="h-3 w-3" /> 大纲解析
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-xs font-bold text-red-700" style={{ borderRadius: '0' }}>
                        <Users className="h-3 w-3" /> 学情分析
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 text-xs font-bold text-red-700" style={{ borderRadius: '0' }}>
                        <Target className="h-3 w-3" /> 目标定位
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative px-6 border-r-2 border-dashed border-gray-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-black" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                      <span className="text-white font-black text-lg">02</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black mb-2">深度生成 · 多维构建</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      AI 秒级生成教学大纲、详细教案、课件框架、讨论题与考试题，支持 <span className="text-orange-600 font-bold">流式实时输出</span> 与多轮对话持续优化
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700" style={{ borderRadius: '0' }}>
                        <ListChecks className="h-3 w-3" /> 教案生成
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700" style={{ borderRadius: '0' }}>
                        <Presentation className="h-3 w-3" /> 课件设计
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700" style={{ borderRadius: '0' }}>
                        <MessageCircle className="h-3 w-3" /> 互动优化
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center border-2 border-black" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                      <span className="text-white font-black text-lg">03</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black mb-2">一键交付 · 无缝对接</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      自动生成符合 <span className="text-purple-600 font-bold">党政机关公文规范</span> 的标准化备课材料，一键导出 Word 文档，可直接打印使用或导入教务系统
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700" style={{ borderRadius: '0' }}>
                        <FileText className="h-3 w-3" /> 标准排版
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700" style={{ borderRadius: '0' }}>
                        <Download className="h-3 w-3" /> 一键导出
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700" style={{ borderRadius: '0' }}>
                        <CheckCircle2 className="h-3 w-3" /> 即打即用
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="border-2 border-black bg-white p-6 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              备课智能体
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-black leading-tight">党校教师备课助手</h1>
                <p className="text-xs text-gray-500">AI智能备课 · 一键导出Word</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <Target className="h-4 w-4 text-red-600" />
                  备课任务 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {taskTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        className={`p-2.5 border-2 text-left transition-all ${
                          taskType === type.value
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        style={{ borderRadius: '0' }}
                        onClick={() => setTaskType(type.value)}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-sm font-bold text-black">{type.label}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <BookOpen className="h-4 w-4 text-red-600" />
                  课程主题 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="如：习近平新时代中国特色社会主义思想的科学体系"
                  className="h-10 border-2 border-black font-medium"
                  style={{ borderRadius: '0' }}
                  value={courseTopic}
                  onChange={e => setCourseTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                    <GraduationCap className="h-4 w-4 text-amber-500" />
                    课程类型
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 border-2 border-black px-3 text-sm font-medium appearance-none bg-white"
                      style={{ borderRadius: '0' }}
                      value={courseType}
                      onChange={e => setCourseType(e.target.value)}
                    >
                      {courseTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    课时安排
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 border-2 border-black px-3 text-sm font-medium appearance-none bg-white"
                      style={{ borderRadius: '0' }}
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                    >
                      {durationOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <Users className="h-4 w-4 text-red-600" />
                  授课对象
                </label>
                <div className="relative">
                  <select
                    className="w-full h-10 border-2 border-black px-3 text-sm font-medium appearance-none bg-white"
                    style={{ borderRadius: '0' }}
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                  >
                    {audienceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <Target className="h-4 w-4 text-red-600" />
                  教学目标
                </label>
                <textarea
                  placeholder="请输入教学目标，如：使学员深刻理解...、掌握...、提升..."
                  className="w-full border-2 border-black p-3 text-sm font-medium resize-none"
                  style={{ borderRadius: '0', minHeight: '70px' }}
                  value={teachingObjectives}
                  onChange={e => setTeachingObjectives(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                  补充要求
                </label>
                <textarea
                  placeholder="如：需要加入案例教学、需要引用最新政策文件、需要设计互动环节等（选填）"
                  className="w-full border-2 border-black p-3 text-sm font-medium resize-none"
                  style={{ borderRadius: '0', minHeight: '70px' }}
                  value={additionalRequirements}
                  onChange={e => setAdditionalRequirements(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                {isGenerating ? (
                  <Button
                    className="flex-1 h-11 bg-gray-800 hover:bg-gray-900 text-white font-bold border-2 border-black text-base"
                    style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                    onClick={handleStop}
                  >
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    停止生成
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-11 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold border-2 border-black text-base"
                    style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                    onClick={handleGenerate}
                    disabled={!courseTopic.trim()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始生成
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-11 px-4 border-2 border-black font-bold"
                  style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-5 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-amber-400 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <Lightbulb className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="font-black text-sm text-black">使用提示</span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <p>1. 选择备课任务类型，填写课程基本信息</p>
              <p>2. 点击"开始生成"，AI将为您生成备课材料</p>
              <p>3. 生成完成后，可在右侧对话区继续追问优化</p>
              <p>4. 支持一键导出Word文档，方便打印使用</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!showResult ? (
            <div className="border-2 border-black bg-white h-full min-h-[600px] flex flex-col items-center justify-center p-8" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border-2 border-black mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-black mb-3">党校教师备课智能体</h2>
              <p className="text-gray-500 text-center max-w-md leading-relaxed text-sm">
                选择备课任务类型，填写课程主题和基本信息，AI将为您生成高质量的教学大纲、教案、课件内容、讨论题和考试题。
              </p>
              <div className="flex items-center gap-4 mt-6 text-xs text-gray-400 flex-wrap justify-center">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />教学大纲</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />教案编写</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />课件设计</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />题目生成</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />一键导出</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black bg-white relative flex flex-col" style={{ boxShadow: '4px 4px 0 0 #000', minHeight: '600px' }}>
              <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 border-2 border-black z-10" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                生成结果
              </div>

              <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gray-50">
                <div className="flex items-center gap-2">
                  {isGenerating && chatHistory.length === 0 ? (
                    <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-bold text-black">
                    {isGenerating && chatHistory.length === 0 ? 'AI正在生成备课材料...' : '备课材料'}
                  </span>
                  {generatedContent && (
                    <span className="text-xs text-gray-400">
                      · 约{Math.round(generatedContent.length / 1.5)}字
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isGenerating && generatedContent && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white font-bold border-2 border-black hover:bg-blue-700"
                        style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                        onClick={exportToWord}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        导出Word
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-2 border-black font-bold"
                        style={{ borderRadius: '0' }}
                        onClick={handleGenerate}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        重新生成
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-340px)]">
                {isGenerating && !generatedContent && chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500 font-medium">AI正在构思备课内容...</p>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:text-black prose-h2:text-xl prose-h2:border-b-2 prose-h2:border-red-200 prose-h2:pb-3 prose-h3:text-base prose-h3:text-red-800 prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-red-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedContent}
                      </ReactMarkdown>
                      {isGenerating && chatHistory.length === 0 && (
                        <span className="inline-block w-2 h-4 bg-red-600 animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>

                    {chatHistory.length > 0 && (
                      <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <div className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          对话记录
                        </div>
                        {chatHistory.map((msg, idx) => (
                          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                            <div
                              className={`max-w-[85%] p-3 ${
                                msg.role === 'user'
                                  ? 'bg-red-50 border-2 border-red-200'
                                  : 'bg-gray-50 border-2 border-gray-200'
                              }`}
                              style={{ borderRadius: '0' }}
                            >
                              <div className="text-xs font-bold text-gray-500 mb-1">
                                {msg.role === 'user' ? '您' : 'AI助手'}
                              </div>
                              {msg.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none prose-p:text-sm prose-li:text-sm">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-800">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {isGenerating && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.role === 'assistant' && (
                          <span className="inline-block w-2 h-4 bg-red-600 animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {generatedContent && (
                <div className="border-t-2 border-black bg-gray-50 p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        className="text-xs px-2.5 py-1.5 border-2 border-gray-300 bg-white hover:border-red-400 hover:bg-red-50 transition-colors font-medium text-gray-600 hover:text-red-700"
                        style={{ borderRadius: '0' }}
                        onClick={() => handleQuickPrompt(prompt)}
                        disabled={isGenerating}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="对生成结果进行追问，如：请补充一些案例分析..."
                      className="flex-1 h-10 border-2 border-black font-medium"
                      style={{ borderRadius: '0' }}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isGenerating}
                    />
                    <Button
                      className="h-10 px-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold border-2 border-black"
                      style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                      onClick={handleSendMessage}
                      disabled={isGenerating || !chatInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}