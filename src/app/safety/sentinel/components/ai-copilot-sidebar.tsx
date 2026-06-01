'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, User, MapPin, BookOpen, Brain,
  ChevronRight, Sparkles, History, X, MessageSquare,
  Lightbulb, Maximize2, FileText, Loader2, Copy, Check,
  Edit3, RotateCcw, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RealDisasterCase } from '@/lib/real-disaster-cases';
import { realDisasterCases } from '@/lib/real-disaster-cases';
import type { AgentMessage } from '@/lib/ai-agents';
import { generateAIPlanStream, generateFallbackPlan, planToAgentMessage, type PlanGenerationRequest } from '@/lib/ai-plan-generator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'case_list' | 'case_card' | 'report_summary' | 'advisor_plan';
  data?: any;
}

interface AICopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (caseData: RealDisasterCase) => void;
  onStartCampaign: () => void;
  selectedCase: RealDisasterCase | null;
  campaignHistory: any[];
  onViewReport: (report: any) => void;
  isInCampaign?: boolean;
  onAdvisorMessage?: (message: AgentMessage) => void;
  onGeneratePlan?: () => string;
  playerRoleLevel?: string | null;
  // 剧本推演相关
  currentPhaseIndex?: number;
  playerRoleId?: string | null;
  playerDepartment?: string;
  currentSituation?: string;
  userPlan?: string;
  onPlanGenerated?: (plan: string) => void;
  onPlanSend?: (plan: string) => void;
}

// 方案全屏查看弹窗
function PlanDetailModal({ plan, title, onClose }: { plan: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-bold text-white">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <PlanPreview content={plan} />
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />关闭
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 方案预览组件（格式化渲染）
function PlanPreview({ content }: { content: string }) {
  if (!content) return null;

  // 预处理：将 Windows 换行符统一为 Unix，处理可能的 \r\n 或 \r
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = normalizedContent.split('\n');
  let tableRows: string[][] = [];

  const renderLine = (line: string, idx: number): React.ReactNode => {
    const trimmed = line.trim();

    if (!trimmed) return <div key={idx} className="h-2" />;

    // 表格处理
    if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return null;
      tableRows.push(cells);
      return null;
    } else if (tableRows.length > 0) {
      const table = (
        <table key={`table-${idx}`} className="w-full my-3 text-xs border-collapse">
          <thead>
            <tr className="bg-slate-700/50">
              {tableRows[0]?.map((cell, i) => (
                <th key={i} className="px-2 py-1.5 text-left text-slate-300 font-semibold border border-slate-600">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-800/50' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 text-slate-400 border border-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      tableRows = [];
      return table;
    }

    // 标题（支持紧凑格式如 "###标题" 和标准格式 "### 标题"）
    const titleMatch = trimmed.match(/^(#{1,4})\s*(.+)$/);
    if (titleMatch) {
      const level = titleMatch[1].length;
      const text = titleMatch[2];
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizeClass = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : level === 3 ? 'text-base' : 'text-sm';
      return <Tag key={idx} className={`${sizeClass} font-bold text-amber-400 mt-3 mb-1`}>{renderInlineFormatting(text)}</Tag>;
    }

    // 有序列表（支持 "1.标题"、"1、标题"、"1)标题" 等格式）
    const orderedMatch = trimmed.match(/^(\d+)[\.、\)]\s*(.+)$/);
    if (orderedMatch) {
      return (
        <div key={idx} className="flex gap-2 text-xs text-slate-300 ml-2 my-0.5">
          <span className="text-purple-400 flex-shrink-0">{orderedMatch[1]}.</span>
          <span className="flex-1">{renderInlineFormatting(orderedMatch[2])}</span>
        </div>
      );
    }

    // 无序列表（支持 "- "、"* "、"• " 开头）
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      return (
        <div key={idx} className="flex gap-2 text-xs text-slate-300 ml-2 my-0.5">
          <span className="text-purple-400 flex-shrink-0">•</span>
          <span className="flex-1">{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
    }

    // 普通段落
    return <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">{renderInlineFormatting(trimmed)}</p>;
  };

  const renderInlineFormatting = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-700 px-1 rounded text-purple-300">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1">
      {lines.map((line, idx) => renderLine(line, idx))}
      {tableRows.length > 0 && (
        <table className="w-full my-3 text-xs border-collapse">
          <thead>
            <tr className="bg-slate-700/50">
              {tableRows[0]?.map((cell, i) => (
                <th key={i} className="px-2 py-1.5 text-left text-slate-300 font-semibold border border-slate-600">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-800/50' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 text-slate-400 border border-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 方案编辑器组件
function PlanEditor({
  initialPlan,
  onChange,
  onSend,
  onRegenerate,
  isGenerating,
}: {
  initialPlan: string;
  onChange: (plan: string) => void;
  onSend: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}) {
  const [editMode, setEditMode] = useState<'edit' | 'preview'>('preview');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
          <Edit3 className="w-3 h-3" />
          方案编辑器
        </div>
        <div className="flex gap-1">
          {/* 编辑/预览切换 */}
          {initialPlan && !isGenerating && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-slate-400 hover:text-white"
              onClick={() => setEditMode(prev => prev === 'edit' ? 'preview' : 'edit')}
            >
              {editMode === 'edit' ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  预览
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3 mr-1" />
                  编辑
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-slate-400 hover:text-white"
            onClick={onRegenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="ml-1">AI生成中</span>
              </div>
            ) : (
              <>
                <RotateCcw className="w-3 h-3 mr-1" />
                重新生成
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-64 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden">
          {isGenerating ? (
            <div className="h-full p-3 overflow-y-auto">
              {initialPlan ? (
                <PlanPreview content={initialPlan} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  AI正在生成方案...
                </div>
              )}
            </div>
          ) : editMode === 'edit' ? (
            <textarea
              className="w-full h-full bg-slate-800 text-xs text-slate-200 p-3 resize-none focus:outline-none font-mono leading-relaxed whitespace-pre-wrap"
              value={initialPlan}
              onChange={e => onChange(e.target.value)}
              placeholder="方案将在这里显示，您可以直接编辑..."
            />
          ) : initialPlan ? (
            <div className="h-full p-3 overflow-y-auto">
              <PlanPreview content={initialPlan} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              点击「重新生成」获取方案
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] text-purple-400">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>流式生成中...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          onClick={onSend}
          disabled={!initialPlan || isGenerating}
        >
          <Send className="w-3 h-3 mr-1" />
          发送到会议
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 text-xs"
          onClick={() => {
            if (initialPlan) {
              navigator.clipboard.writeText(initialPlan);
            }
          }}
          disabled={!initialPlan}
        >
          <Copy className="w-3 h-3 mr-1" />
          复制
        </Button>
      </div>
    </div>
  );
}

export default function AICopilotSidebar({
  isOpen,
  onClose,
  onSelectCase,
  onStartCampaign,
  selectedCase,
  campaignHistory,
  onViewReport,
  isInCampaign = false,
  onAdvisorMessage,
  onGeneratePlan,
  playerRoleLevel,
  currentPhaseIndex = 0,
  playerRoleId,
  playerDepartment = '应急指挥',
  currentSituation = '',
  userPlan = '',
  onPlanGenerated,
  onPlanSend,
}: AICopilotSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [step, setStep] = useState<'greeting' | 'role_select' | 'case_select' | 'ready' | 'chat' | 'campaign_advisor'>('greeting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 方案全屏查看弹窗状态
  const [planModal, setPlanModal] = useState<{ isOpen: boolean; plan: string; title: string }>({
    isOpen: false,
    plan: '',
    title: '',
  });

  // 战役参谋状态
  const [advisorPlan, setAdvisorPlan] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [copied, setCopied] = useState(false);

  // 初始问候
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (isInCampaign) {
        setTimeout(() => {
          addMessage('assistant', '指挥官，我是您的AI作战参谋。在战役推演过程中，我可以帮您：\n\n1. 根据当前灾情生成应急处置方案\n2. 提供快捷建议\n3. 将方案发送到会议面板\n\n请点击下方按钮生成参谋方案。', 'text');
          setStep('campaign_advisor');
        }, 300);
      } else {
        setTimeout(() => {
          addMessage('assistant', '您好，指挥官。我是您的AI作战参谋。请先选择战役场景，随后您可以选择扮演的角色开始推演。');
          setStep('case_select');
        }, 300);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isInCampaign]);

  // 当进入战役模式时
  useEffect(() => {
    if (isInCampaign && isOpen) {
      setStep('campaign_advisor');
      if (messages.length > 0 && messages[messages.length - 1].type !== 'advisor_plan') {
        addMessage('assistant', '指挥官，我已进入战役参谋模式。我可以根据当前灾情和您的角色，生成专业的应急处置方案。', 'text');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInCampaign]);

  // 阶段变化时自动重置参谋状态
  useEffect(() => {
    if (isInCampaign) {
      setAdvisorPlan('');
      setIsGeneratingPlan(false);
      addMessage('assistant', `📍 剧情推进至第 ${currentPhaseIndex + 1} 阶段。灾情已更新，请根据最新情况生成新的处置方案。`, 'text');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhaseIndex]);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string, type?: Message['type'], data?: any) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      type,
      data,
    }]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    addMessage('user', text);
    setInputText('');

    // 战役模式下的处理
    if (isInCampaign) {
      handleCampaignAdvisorChat(text);
      return;
    }

    // 根据当前步骤处理
    if (step === 'role_select') {
      setUserRole(text);
      setTimeout(() => {
        addMessage('assistant', `收到，${text}。现在开始选择战役场景。`);
        setTimeout(() => {
          addMessage('assistant', '以下是目前可进行的战役推演：', 'case_list');
          setStep('case_select');
        }, 600);
      }, 500);
      return;
    }

    if (step === 'case_select') {
      const matched = realDisasterCases.find(c =>
        text.includes(c.name) ||
        c.name.includes(text) ||
        c.location.name.includes(text)
      );

      if (matched) {
        onSelectCase(matched);
        setTimeout(() => {
          addMessage('assistant', `已选择【${matched.name}】。`, 'case_card', matched);
          setTimeout(() => {
            addMessage('assistant', '准备就绪。点击下方按钮开始战役推演，或输入「换一场」选择其他案例。');
            setStep('ready');
          }, 500);
        }, 300);
      } else {
        setTimeout(() => {
          addMessage('assistant', '未找到匹配的案例，请从上方列表中选择，或输入案例名称。');
        }, 300);
      }
      return;
    }

    if (step === 'ready') {
      if (text.includes('开始') || text.includes('推演') || text.includes('战役')) {
        onStartCampaign();
        return;
      }
      if (text.includes('换')) {
        setStep('case_select');
        addMessage('assistant', '好的，请重新选择战役：', 'case_list');
        return;
      }
    }

    handleCopilotChat(text);
  };

  const handleCampaignAdvisorChat = (text: string) => {
    if (text.includes('方案') || text.includes('生成')) {
      handleGeneratePlan();
      return;
    }
    if (text.includes('发送') || text.includes('会议')) {
      handleSendToMeeting();
      return;
    }
    if (text.includes('建议') || text.includes('提示')) {
      handleQuickSuggestion();
      return;
    }

    setTimeout(() => {
      addMessage('assistant', '在战役推演中，我可以帮您：\n\n1. 点击「生成参谋方案」- 根据当前灾情生成完整方案\n2. 点击「发送到会议」- 将方案发送到会议面板\n3. 输入「建议」- 获取快捷建议\n\n您也可以直接点击下方按钮操作。');
    }, 500);
  };

  // ==================== 核心：调用大模型生成方案 ====================

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setAdvisorPlan('');

    // 构建请求参数
    const request: PlanGenerationRequest = {
      currentPhaseIndex,
      playerRoleId: playerRoleId || '',
      playerRoleLevel: (playerRoleLevel as 'decision' | 'core' | 'collab') || 'collab',
      playerDepartment,
      currentSituation,
      previousDecisions: [],
      userEditedPlan: userPlan || undefined,
    };

    // 使用流式输出
    const result = await generateAIPlanStream(request, (chunk) => {
      setAdvisorPlan(prev => prev + chunk);
    });

    setIsGeneratingPlan(false);

    if (result.success && result.plan) {
      if (onPlanGenerated) {
        onPlanGenerated(result.plan);
      }

      addMessage('assistant', result.plan, 'advisor_plan');
    } else {
      // API调用失败，使用降级方案
      const fallbackPlan = generateFallbackPlan(request);
      setAdvisorPlan(fallbackPlan);

      if (onPlanGenerated) {
        onPlanGenerated(fallbackPlan);
      }

      addMessage('assistant', fallbackPlan, 'advisor_plan');
      addMessage('assistant', `（注：大模型API暂时不可用，已使用内置方案模板。请编辑完善后使用。）`, 'text');
    }
  };

  // 发送到会议
  const handleSendToMeeting = () => {
    if (!advisorPlan) {
      addMessage('assistant', '请先生成方案，再发送到会议。');
      return;
    }

    const advisorMessage: AgentMessage = {
      agentId: 'ai-advisor',
      agentName: 'AI作战参谋',
      agentDepartment: '智能决策支持',
      message: advisorPlan,
      emotion: 'confident',
      timestamp: Date.now(),
    };

    if (onAdvisorMessage) {
      onAdvisorMessage(advisorMessage);
      addMessage('assistant', '✅ 方案已发送到会议面板。', 'text');

      if (onPlanSend) {
        onPlanSend(advisorPlan);
      }
    } else {
      addMessage('assistant', '❌ 无法发送到会议，请检查连接。', 'text');
    }
  };

  const handleQuickSuggestion = () => {
    const suggestions = [
      '💡 建议全力配合应急局调度，落实本部门职责，及时上报执行情况，确保响应到位。',
      '💡 建议加强巡查监测，重点关注低洼区域和易涝点位。',
      '💡 建议做好物资设备检查，确保应急物资充足可用。',
      '💡 建议建立应急联络机制，确保信息畅通。',
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    addMessage('assistant', randomSuggestion, 'text');
  };

  const handleCopilotChat = (text: string) => {
    setTimeout(() => {
      addMessage('assistant', '我理解您的问题了。在战役推演中，我主要为您提供以下帮助：\n\n1. 生成应急处置方案\n2. 提供快捷建议\n3. 解答推演规则问题\n\n请尝试点击「生成参谋方案」按钮开始。');
    }, 500);
  };

  // 复制方案
  const handleCopyPlan = () => {
    navigator.clipboard.writeText(advisorPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 消息气泡渲染
  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-amber-500/20' : 'bg-purple-500/20'
        }`}>
          {isUser ? (
            <User className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          )}
        </div>
        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
          isUser
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100'
            : msg.type === 'advisor_plan'
            ? 'bg-purple-500/10 border border-purple-500/20 text-purple-100'
            : 'bg-slate-800/80 border border-slate-700 text-slate-200'
        }`}>
          {msg.type === 'case_list' && (
            <div className="space-y-1">
              {realDisasterCases.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c);
                    addMessage('assistant', `已选择【${c.name}】。`, 'case_card', c);
                  }}
                  className="w-full text-left p-2 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.description.slice(0, 50)}...</div>
                </button>
              ))}
            </div>
          )}

          {msg.type === 'case_card' && msg.data && (
            <div className="space-y-1">
              <div className="font-bold text-white">{msg.data.name}</div>
              <div className="text-[10px] text-slate-400">{msg.data.description.slice(0, 80)}</div>
              <div className="flex gap-1 mt-1">
                <Badge className="text-[8px] bg-red-500/20 text-red-400">{msg.data.type}</Badge>
                <Badge className="text-[8px] bg-amber-500/20 text-amber-400">{msg.data.level}响应</Badge>
              </div>
            </div>
          )}

          {msg.type === 'advisor_plan' && (
            <div>
              <div className="flex items-center gap-1 mb-2 text-purple-400 font-bold">
                <Sparkles className="w-3 h-3" />
                参谋方案
              </div>
              
              {msg.content.length > 300 ? (
                <div>
                  <div className="text-[10px] leading-relaxed text-slate-400 max-h-24 overflow-hidden relative">
                    <PlanPreview content={msg.content.slice(0, 300)} />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-800/90 to-transparent" />
                  </div>
                  <button
                    onClick={() => setPlanModal({ isOpen: true, plan: msg.content, title: '参谋方案' })}
                    className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-medium"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                    查看完整方案 ({msg.content.length} 字)
                  </button>
                </div>
              ) : (
                <div className="text-[10px] leading-relaxed text-slate-300">
                  <PlanPreview content={msg.content} />
                </div>
              )}
            </div>
          )}

          {msg.type !== 'case_list' && msg.type !== 'case_card' && msg.type !== 'advisor_plan' && (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-700 flex flex-col"
            style={{ zIndex: 200 }}
          >
            {/* 头部 */}
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">AI作战参谋</span>
                  {isInCampaign && (
                    <div className="text-[10px] text-purple-400">战役参谋模式</div>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-3">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>

            {/* 战役模式：方案编辑器 */}
            {isInCampaign && step === 'campaign_advisor' && (
              <div className="p-3 border-t border-slate-700">
                <PlanEditor
                  initialPlan={advisorPlan}
                  onChange={setAdvisorPlan}
                  onSend={handleSendToMeeting}
                  onRegenerate={handleGeneratePlan}
                  isGenerating={isGeneratingPlan}
                />
              </div>
            )}

            {/* 输入框 */}
            <div className="p-3 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="输入消息..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleSend}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* 战役模式快捷按钮 */}
              {isInCampaign && !advisorPlan && (
                <div className="mt-2 space-y-2">
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        生成参谋方案
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 方案全屏查看弹窗 */}
      <AnimatePresence>
        {planModal.isOpen && (
          <PlanDetailModal
            plan={planModal.plan}
            title={planModal.title}
            onClose={() => setPlanModal({ isOpen: false, plan: '', title: '' })}
          />
        )}
      </AnimatePresence>
    </>
  );
}
