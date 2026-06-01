'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  User,
  Building2,
  Target,
  MessageSquare,
  Loader2,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const speechTypes = [
  { value: 'meeting', label: '会议发言', desc: '工作推进会、专题部署会、总结表彰会' },
  { value: 'report', label: '汇报发言', desc: '述职汇报、工作汇报、调研汇报' },
  { value: 'seminar', label: '研讨发言', desc: '民主生活会、组织生活会、理论研讨' },
  { value: 'statement', label: '表态发言', desc: '任职表态、竞聘发言、承诺发言' },
  { value: 'exchange', label: '交流发言', desc: '经验交流、学习交流、培训交流' },
  { value: 'mobilization', label: '动员讲话', desc: '工作动员、活动启动、项目开工' },
];

const toneOptions = [
  { value: 'formal', label: '庄重严谨' },
  { value: 'sincere', label: '真诚务实' },
  { value: 'passionate', label: '慷慨激昂' },
  { value: 'steady', label: '沉稳有力' },
  { value: 'friendly', label: '亲切自然' },
];

const lengthOptions = [
  { value: 'short', label: '简短（800字左右）' },
  { value: 'medium', label: '适中（1500字左右）' },
  { value: 'long', label: '详细（2500字左右）' },
];

const presetScenarios = [
  {
    name: '年度工作总结大会发言',
    type: 'meeting',
    role: '部门负责人',
    topic: '年度工作总结与下一年度工作计划',
    tone: 'formal',
    length: 'medium',
  },
  {
    name: '民主生活会个人对照检查发言',
    type: 'seminar',
    role: '班子成员',
    topic: '对照党章党规查找不足，开展批评与自我批评',
    tone: 'sincere',
    length: 'medium',
  },
  {
    name: '新任职表态发言',
    type: 'statement',
    role: '新任局长',
    topic: '感谢组织信任，表态履职尽责、廉洁从政',
    tone: 'steady',
    length: 'short',
  },
  {
    name: '乡村振兴经验交流发言',
    type: 'exchange',
    role: '乡镇党委书记',
    topic: '党建引领乡村振兴的实践探索与经验启示',
    tone: 'sincere',
    length: 'medium',
  },
];

export default function SpeechWriterPage() {
  const [speechType, setSpeechType] = useState('');
  const [role, setRole] = useState('');
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState('formal');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!speechType || !role.trim() || !topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent('');
    setShowResult(true);

    const typeLabel = speechTypes.find(t => t.value === speechType)?.label || speechType;
    const toneLabel = toneOptions.find(t => t.value === tone)?.label || tone;
    const lengthLabel = lengthOptions.find(l => l.value === length)?.label || length;

    const userMessage = `请为我撰写一篇公务员发言稿，具体要求如下：

【发言类型】${typeLabel}
【我的身份】${role}
【发言主题】${topic}
${keyPoints.trim() ? `【重点要点】${keyPoints}` : ''}
【语言风格】${toneLabel}
【篇幅要求】${lengthLabel}

请严格按照以上要求撰写发言稿，确保政治立场正确、内容充实、结构清晰、语言规范。`;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/speech-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
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
        console.error('发言稿生成错误:', error);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [speechType, role, topic, keyPoints, tone, length]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleReset = () => {
    setSpeechType('');
    setRole('');
    setTopic('');
    setKeyPoints('');
    setTone('formal');
    setLength('medium');
    setGeneratedContent('');
    setShowResult(false);
    setIsGenerating(false);
  };

  const handlePreset = (scenario: typeof presetScenarios[0]) => {
    setSpeechType(scenario.type);
    setRole(scenario.role);
    setTopic(scenario.topic);
    setTone(scenario.tone);
    setLength(scenario.length);
    setKeyPoints('');
  };

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
        const runs = parseBoldText(text);
        children.push(
          new Paragraph({
            children: runs,
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
          })
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s+/, '');
        const runs = parseBoldText(text);
        children.push(
          new Paragraph({
            children: runs,
            spacing: { before: 40, after: 40 },
          })
        );
      } else {
        const runs = parseBoldText(trimmed);
        children.push(
          new Paragraph({
            children: runs,
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
                  text: topic || '发言稿',
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
                  text: `${role} · ${speechTypes.find(t => t.value === speechType)?.label || ''}`,
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
    const fileName = `${topic || '发言稿'}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`;
    saveAs(blob, fileName);
  };

  const parseBoldText = (text: string): TextRun[] => {
    const runs: TextRun[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        runs.push(
          new TextRun({
            text: text.slice(lastIndex, match.index),
            size: 24,
            font: '仿宋',
          })
        );
      }
      runs.push(
        new TextRun({
          text: match[1],
          bold: true,
          size: 24,
          font: '仿宋',
        })
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex),
          size: 24,
          font: '仿宋',
        })
      );
    }

    if (runs.length === 0) {
      runs.push(
        new TextRun({
          text: text,
          size: 24,
          font: '仿宋',
        })
      );
    }

    return runs;
  };

  const handleAudit = async () => {
    if (!generatedContent) return;
    
    setIsAuditing(true);
    setShowAuditPanel(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/content-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedContent }),
      });

      if (!response.ok) throw new Error('审核请求失败');

      const data = await response.json();
      setAuditResult(data);
    } catch (error) {
      console.error('内容审核错误:', error);
      setAuditResult({
        overall_score: 0,
        status: 'error',
        summary: '审核服务暂时不可用，请稍后重试',
        suggestions: ['请检查网络连接或稍后重试']
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'reject': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <ShieldCheck className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass': return '审核通过';
      case 'warning': return '需注意';
      case 'reject': return '不通过';
      case 'error': return '审核失败';
      default: return '审核中...';
    }
  };

  const dimensionNames: Record<string, string> = {
    political: '政治规范性',
    language: '语言规范性',
    compliance: '内容合规性',
    structure: '结构完整性',
    format: '格式规范性',
  };

  return (
    <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="border-2 border-black bg-white p-6 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              发言稿编写
            </div>

            <div className="flex items-center gap-3 mb-5 mt-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-black leading-tight">公务员发言稿</h1>
                <p className="text-xs text-gray-500">AI智能编写 · 一键导出Word</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <Target className="h-4 w-4 text-red-600" />
                  发言类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {speechTypes.map(type => (
                    <button
                      key={type.value}
                      className={`p-2.5 border-2 text-left transition-all ${
                        speechType === type.value
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      style={{ borderRadius: '0' }}
                      onClick={() => setSpeechType(type.value)}
                    >
                      <div className="text-sm font-bold text-black">{type.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <User className="h-4 w-4 text-red-600" />
                  发言人身份 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="如：市发改委主任、乡镇党委书记"
                  className="h-10 border-2 border-black font-medium"
                  style={{ borderRadius: '0' }}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <MessageSquare className="h-4 w-4 text-red-600" />
                  发言主题 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="如：关于推进数字政府建设的工作部署"
                  className="h-10 border-2 border-black font-medium"
                  style={{ borderRadius: '0' }}
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                  <BookOpen className="h-4 w-4 text-red-600" />
                  重点要点
                </label>
                <textarea
                  placeholder="请输入需要重点阐述的要点、数据、案例等（选填）"
                  className="w-full border-2 border-black p-3 text-sm font-medium resize-none"
                  style={{ borderRadius: '0', minHeight: '80px' }}
                  value={keyPoints}
                  onChange={e => setKeyPoints(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    语言风格
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 border-2 border-black px-3 text-sm font-medium appearance-none bg-white"
                      style={{ borderRadius: '0' }}
                      value={tone}
                      onChange={e => setTone(e.target.value)}
                    >
                      {toneOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-black mb-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    篇幅要求
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 border-2 border-black px-3 text-sm font-medium appearance-none bg-white"
                      style={{ borderRadius: '0' }}
                      value={length}
                      onChange={e => setLength(e.target.value)}
                    >
                      {lengthOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
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
                    disabled={!speechType || !role.trim() || !topic.trim()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    开始编写
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
                <Building2 className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="font-black text-sm text-black">常用场景模板</span>
            </div>
            <div className="space-y-2">
              {presetScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  className="w-full p-3 border-2 border-black bg-white hover:bg-red-50 text-left transition-colors group"
                  style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                  onClick={() => handlePreset(scenario)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-black group-hover:text-red-700">{scenario.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 ml-8">
                    {scenario.role} · {speechTypes.find(t => t.value === scenario.type)?.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {!showResult ? (
            <div className="border-2 border-black bg-white h-full min-h-[600px] flex flex-col items-center justify-center p-8" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center border-2 border-black mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <Mic className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-black mb-3">公务员发言稿智能编写</h2>
              <p className="text-gray-500 text-center max-w-md leading-relaxed text-sm">
                选择发言类型，填写身份与主题，AI将为您生成符合党政机关规范的高质量发言稿，支持一键导出Word文档。
              </p>
              <div className="flex items-center gap-4 mt-6 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />政治规范</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />结构严谨</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />一键导出</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-black bg-white relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 border-2 border-black z-10" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                生成结果
              </div>

              <div className="flex items-center justify-between p-4 border-b-2 border-black bg-gray-50">
                <div className="flex items-center gap-2">
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  <span className="text-sm font-bold text-black">
                    {isGenerating ? 'AI正在编写发言稿...' : '发言稿编写完成'}
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
                        className="bg-emerald-600 text-white font-bold border-2 border-black hover:bg-emerald-700"
                        style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                        onClick={handleAudit}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        内容审核
                      </Button>
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

              <div className="p-6 max-h-[calc(100vh-220px)] overflow-y-auto">
                {isGenerating && !generatedContent ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-500 font-medium">AI正在构思发言稿框架...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:text-black prose-h2:text-xl prose-h2:text-center prose-h2:border-b-2 prose-h2:border-red-200 prose-h2:pb-3 prose-h3:text-base prose-h3:text-red-800 prose-p:text-gray-800 prose-p:leading-relaxed prose-li:text-gray-800 prose-strong:text-red-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {generatedContent}
                    </ReactMarkdown>
                    {isGenerating && (
                      <span className="inline-block w-2 h-4 bg-red-600 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                )}
              </div>

              {showAuditPanel && (
                <div className="border-t-2 border-black bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <span className="font-black text-sm text-black">内容审核报告</span>
                    </div>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setShowAuditPanel(false)}
                    >
                      收起
                    </button>
                  </div>

                  {isAuditing || !auditResult ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">正在进行AI内容审核...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* 总览 */}
                      <div className="border-2 border-black bg-white p-3" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(auditResult.status)}
                            <span className="font-bold text-black">{getStatusText(auditResult.status)}</span>
                          </div>
                          <div className={`text-2xl font-black ${getScoreColor(auditResult.overall_score)}`}>
                            {auditResult.overall_score}<span className="text-sm font-medium text-gray-400">/100</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{auditResult.summary}</p>
                      </div>

                      {/* 维度详情 */}
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(auditResult.dimensions || {}).map(([key, dim]: [string, any]) => (
                          <div key={key} className="border-2 border-black bg-white p-2.5" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-black">{dimensionNames[key] || key}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-gray-200">
                                  <div
                                    className={`h-full ${getScoreBg(dim.score)}`}
                                    style={{ width: `${dim.score}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-black ${getScoreColor(dim.score)}`}>{dim.score}</span>
                              </div>
                            </div>
                            {dim.issues && dim.issues.length > 0 && (
                              <div className="space-y-1">
                                {dim.issues.map((issue: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-red-600">
                                    <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{issue}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 修改建议 */}
                      {auditResult.suggestions && auditResult.suggestions.length > 0 && (
                        <div className="border-2 border-black bg-amber-50 p-3" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-black">修改建议</span>
                          </div>
                          <div className="space-y-1">
                            {auditResult.suggestions.map((suggestion: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="w-4 h-4 bg-amber-400 text-black text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isGenerating && generatedContent && (
                <div className="p-4 border-t-2 border-black bg-gray-50">
                  <Button
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold border-2 border-black text-base"
                    style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                    onClick={exportToWord}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    导出为Word文档
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
