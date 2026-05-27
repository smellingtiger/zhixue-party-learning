'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  Sparkles,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Target,
  MessageSquare,
  Zap,
  Shield,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  feedback?: 'positive' | 'negative' | null;
}

interface QuickScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SCENARIOS: QuickScenario[] = [
  {
    id: 'urban-flood',
    title: '城市内涝应对',
    description: '暴雨导致城市道路积水，需要制定应急疏散方案',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'typhoon-prepare',
    title: '台风来临准备',
    description: '台风预警发布，需要做好人员转移和物资储备',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'earthquake-response',
    title: '地震紧急响应',
    description: '地震发生后，需要组织救援和伤员安置',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    id: 'fire-prevention',
    title: '火灾预防处置',
    description: '森林/建筑火灾风险，需要制定预防和扑救方案',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'cold-wave-guard',
    title: '寒潮防护措施',
    description: '极端低温天气，需要保障民生和基础设施运行',
    icon: <SnowflakeIcon className="w-5 h-5" />
  },
  {
    id: 'custom',
    title: '自定义场景',
    description: '描述您的具体应急场景，获取定制化方案',
    icon: <MessageSquare className="w-5 h-5" />
  }
];

function SnowflakeIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  );
}

export default function EmergencyAdvisorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [disasterType, setDisasterType] = useState('flood');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const disasterFromUrl = searchParams.get('disaster') || localStorage.getItem('selectedDisaster');
    if (disasterFromUrl) {
      setDisasterType(disasterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateId = () => Math.random().toString(36).substring(7);

  const handleSendMessage = async (content?: string) => {
    const messageText = content || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/emergency-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          disasterType
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantContent = '';
      const assistantMessageId = generateId();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                assistantContent += data.content || '';
                
                setMessages(prev => {
                  const existing = prev.find(m => m.id === assistantMessageId);
                  if (existing) {
                    return prev.map(m => 
                      m.id === assistantMessageId 
                        ? { ...m, content: assistantContent }
                        : m
                    );
                  }
                  return [...prev, {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: assistantContent,
                    timestamp: new Date(),
                    intent: response.headers.get('X-User-Intent') || undefined
                  }];
                });
              } catch {}
            }
          }
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: assistantContent || '方案生成完成，请查看详细内容。' }
          : m
      ));

    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，生成方案时出现错误。请稍后重试或检查网络连接。',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, feedback } : m
    ));
    
    if (feedback === 'negative') {
      await handleSendMessage('我对上一个方案不满意，请重新生成或提供替代方案。');
    }
  };

  const handleCopyContent = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleScenarioSelect = (scenario: QuickScenario) => {
    if (scenario.id === 'custom') {
      inputRef.current?.focus();
      return;
    }
    handleSendMessage(scenario.description);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-base font-semibold text-gray-700 mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-gray-600">{line.replace('- ', '')}</li>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} className="ml-4 text-gray-600 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-gray-600">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button 
            variant="outline" 
            onClick={() => router.push('/safety')} 
            className="gap-2 border-red-400 bg-white hover:bg-red-50 text-red-700 font-medium shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />返回安全培训
          </Button>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/40 border border-white/50"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700 font-medium">应急方案智能体</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
              在线
            </Badge>
          </motion.div>

          <Button
            variant="outline"
            onClick={() => setMessages([])}
            className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4" />新对话
          </Button>
        </motion.div>

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-red-800 mb-2 flex items-center justify-center gap-3">
            <Bot className="w-8 h-8" />
            应急指挥方案顾问
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            基于真实案例与专业知识，为您提供精准的应急管理方案指导。
            描述您的场景，识别潜在风险，获取可操作的解决方案。
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                    方案对话
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {disasterType} · 持续优化中
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        您好！我是应急方案顾问
                      </h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                        我可以帮您：
                      </p>
                      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                        {[
                          { icon: <Target className="w-4 h-4" />, text: '制定应急预案' },
                          { icon: <AlertTriangle className="w-4 h-4" />, text: '识别风险盲区' },
                          { icon: <BookOpen className="w-4 h-4" />, text: '参考典型案例' },
                          { icon: <Lightbulb className="w-4 h-4" />, text: '优化应对策略' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-700">
                            <span className="text-blue-600">{item.icon}</span>
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {formatContent(message.content)}
                          </div>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`gap-1 text-xs ${message.feedback === 'positive' ? 'text-green-600' : 'text-gray-500'}`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                有帮助
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`gap-1 text-xs ${message.feedback === 'negative' ? 'text-red-600' : 'text-gray-500'}`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                需改进
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContent(message.content, message.id)}
                                className="gap-1 text-xs text-gray-500 ml-auto"
                              >
                                {copiedId === message.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    已复制
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    复制
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shrink-0 mt-1">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.15
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">正在分析并生成方案...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex gap-3">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="描述您的应急场景或问题..."
                      className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading}
                      className="self-end bg-blue-600 hover:bg-blue-700 text-white px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Scenarios & Features */}
          <div className="space-y-4">
            {/* Quick Scenarios */}
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  快速场景
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SCENARIOS.slice(0, 5).map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioSelect(scenario)}
                    className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 group-hover:text-blue-600 mt-0.5">
                        {scenario.icon}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-gray-800 group-hover:text-blue-700">
                          {scenario.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {scenario.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  核心能力
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Target className="w-4 h-4" />, title: '精准诊断', desc: '识别关键风险点' },
                  { icon: <AlertTriangle className="w-4 h-4" />, title: '盲区提醒', desc: '指出易忽视环节' },
                  { icon: <BookOpen className="w-4 h-4" />, title: '案例支撑', desc: '参考真实案例' },
                  { icon: <Shield className="w-4 h-4" />, title: '持续优化', desc: '越用越专业' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">{feature.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-gray-800">{feature.title}</div>
                      <div className="text-xs text-gray-500">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{messages.length}</div>
                  <div className="text-xs text-gray-600 mt-1">本轮对话轮次</div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      智能体在线 · 实时响应
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 2px; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
