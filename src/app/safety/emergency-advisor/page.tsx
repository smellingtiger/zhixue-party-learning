'use client';

import { useState, useRef, useEffect } from 'react';
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
  Copy,
  Check,
  Search,
  FileText,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  Filter,
  X,
  Clock,
  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EmergencyDocument, DocumentCategory, DisasterType } from '../emergency-library/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  feedback?: 'positive' | 'negative' | null;
  sources?: { title: string; id: string; snippet: string }[];
}

interface QuickScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

type ActiveTab = 'browse' | 'qa' | 'search';

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

const CATEGORIES: { value: DocumentCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: '全部', icon: <FolderOpen className="w-3.5 h-3.5" /> },
  { value: '预案', label: '预案', icon: <Shield className="w-3.5 h-3.5" /> },
  { value: '制度', label: '制度', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: '标准', label: '标准', icon: <Target className="w-3.5 h-3.5" /> },
  { value: '演练', label: '演练', icon: <Zap className="w-3.5 h-3.5" /> },
  { value: '指挥手册', label: '指挥手册', icon: <FileText className="w-3.5 h-3.5" /> },
  { value: '知识科普', label: '知识科普', icon: <Lightbulb className="w-3.5 h-3.5" /> },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '预案': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  '制度': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '标准': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  '演练': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '指挥手册': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '知识科普': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const DISASTER_LABELS: Record<string, string> = {
  flood: '洪涝',
  typhoon: '台风',
  earthquake: '地震',
  'forest-fire': '森林火灾',
  'cold-wave': '寒潮',
};

const SOURCE_LABELS: Record<string, string> = {
  'knowledge-base': '知识库',
  'local-md': '本地文档',
  'official-website': '官方网站',
};

export default function EmergencyAdvisorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('browse');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [disasterType, setDisasterType] = useState('flood');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ---- 资料浏览状态 ----
  const [documents, setDocuments] = useState<EmergencyDocument[]>([]);
  const [docTotal, setDocTotal] = useState(0);
  const [docCategories, setDocCategories] = useState<{ category: string; count: number }[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = useState<EmergencyDocument | null>(null);

  // ---- 搜索状态 ----
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EmergencyDocument[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const disasterFromUrl = searchParams.get('disaster') || localStorage.getItem('selectedDisaster');
    if (disasterFromUrl) {
      setDisasterType(disasterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchDocuments();
    }
  }, [activeTab, activeCategory]);

  const fetchDocuments = async () => {
    setDocLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);

      const res = await fetch(`/api/emergency-documents?${params.toString()}`);
      if (!res.ok) throw new Error('请求失败');
      const data = await res.json();

      setDocuments(data.documents || []);
      setDocTotal(data.total || 0);
      setDocCategories(data.categories || []);
    } catch {
      setDocuments([]);
      setDocTotal(0);
    } finally {
      setDocLoading(false);
    }
  };

  const fetchDocumentDetail = async (doc: EmergencyDocument) => {
    if (selectedDoc?.id === doc.id) {
      setSelectedDoc(null);
      return;
    }

    try {
      const res = await fetch(`/api/emergency-documents?action=detail&id=${encodeURIComponent(doc.id)}`);
      if (!res.ok) throw new Error('请求失败');
      const data = await res.json();
      setSelectedDoc(data.document || { ...doc, content: doc.content || '（文档内容加载中...）' });
    } catch {
      setSelectedDoc({ ...doc, content: doc.content || '（文档内容加载失败，请稍后重试）' });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/emergency-documents?action=search&search=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error('搜索失败');
      const data = await res.json();
      setSearchResults(data.documents || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
      const response = await fetch('/api/emergency-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          disasterType,
          includeRag: true
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const sourcesHeader = response.headers.get('X-RAG-Sources');
      const sources: { title: string; id: string; snippet: string }[] = sourcesHeader
        ? JSON.parse(decodeURIComponent(sourcesHeader))
        : [];

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
                    sources
                  }];
                });
              } catch {}
            }
          }
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId
          ? { ...m, content: assistantContent || '方案生成完成，请查看详细内容。', sources }
          : m
      ));

    } catch {
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
    setActiveTab('qa');
    handleSendMessage(scenario.description);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const tabs = [
    { id: 'browse' as ActiveTab, label: '资料浏览', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'qa' as ActiveTab, label: '智能问答', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'search' as ActiveTab, label: '全文搜索', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
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
            <span className="text-sm text-gray-700 font-medium">应急资料库</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
              在线
            </Badge>
          </motion.div>

          {activeTab === 'qa' ? (
            <Button
              variant="outline"
              onClick={() => setMessages([])}
              className="gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />新对话
            </Button>
          ) : (
            <div className="w-[80px]" />
          )}
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-red-800 mb-2 flex items-center justify-center gap-3">
            <Bot className="w-8 h-8" />
            应急资料库
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            {activeTab === 'browse' && '浏览预案、制度、标准、演练文件，获取权威应急知识'}
            {activeTab === 'qa' && '基于丰富应急文档，为您提供精准的应急管理方案问答'}
            {activeTab === 'search' && '跨数据源全文搜索，快速定位关键应急知识'}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BrowseTab
                documents={documents}
                docTotal={docTotal}
                docCategories={docCategories}
                docLoading={docLoading}
                activeCategory={activeCategory}
                selectedDoc={selectedDoc}
                copiedId={copiedId}
                onCategoryChange={setActiveCategory}
                onDocSelect={fetchDocumentDetail}
                onClearSelection={() => setSelectedDoc(null)}
                onCopy={handleCopyContent}
              />
            </motion.div>
          )}

          {activeTab === 'qa' && (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <QATab
                messages={messages}
                isLoading={isLoading}
                inputValue={inputValue}
                copiedId={copiedId}
                disasterType={disasterType}
                messagesEndRef={messagesEndRef}
                inputRef={inputRef}
                onInputChange={setInputValue}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                onFeedback={handleFeedback}
                onCopy={handleCopyContent}
                onScenarioSelect={handleScenarioSelect}
              />
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SearchTab
                searchQuery={searchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                selectedDoc={selectedDoc}
                copiedId={copiedId}
                onQueryChange={setSearchQuery}
                onSearch={handleSearch}
                onKeyPress={handleSearchKeyPress}
                onDocSelect={fetchDocumentDetail}
                onClearSelection={() => setSelectedDoc(null)}
                onCopy={handleCopyContent}
              />
            </motion.div>
          )}
        </AnimatePresence>
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

interface BrowseTabProps {
  documents: EmergencyDocument[];
  docTotal: number;
  docCategories: { category: string; count: number }[];
  docLoading: boolean;
  activeCategory: DocumentCategory | 'all';
  selectedDoc: EmergencyDocument | null;
  copiedId: string | null;
  onCategoryChange: (cat: DocumentCategory | 'all') => void;
  onDocSelect: (doc: EmergencyDocument) => void;
  onClearSelection: () => void;
  onCopy: (content: string, id: string) => void;
}

function BrowseTab({
  documents, docTotal, docCategories, docLoading, activeCategory,
  selectedDoc, copiedId, onCategoryChange,
  onDocSelect, onClearSelection, onCopy
}: BrowseTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-red-600" />
              分类筛选
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={activeCategory === cat.value ? 'text-white' : 'text-gray-500'}>{cat.icon}</span>
                  {cat.label}
                </span>
                {cat.value !== 'all' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.value ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {docCategories.find(c => c.category === cat.value)?.count || 0}
                  </span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{docTotal}</div>
              <div className="text-xs text-gray-600 mt-1">本资料库文档总数</div>
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  数据实时更新
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      <div className="lg:col-span-3 space-y-4">
        {!selectedDoc ? (
          <>
            {/* Stats Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                共 {docTotal} 篇文档
                {activeCategory !== 'all' && ` · ${activeCategory}`}
              </span>
            </div>

            {docLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">暂无匹配的文档</p>
                  <p className="text-gray-400 text-xs mt-1">请尝试更换筛选条件</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc) => {
                  const colors = CATEGORY_COLORS[doc.category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
                  return (
                    <motion.div
                      key={doc.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => onDocSelect(doc)}
                      className="cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-red-300 rounded-xl p-5 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${colors.bg} ${colors.text} ${colors.border} border`}>
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {SOURCE_LABELS[doc.source] || doc.source}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {DISASTER_LABELS[doc.disasterType] || doc.disasterType}
                        </span>
                        {doc.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>
                          {doc.paragraphs ? `${doc.paragraphs} 段落` : ''}
                          {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Document Detail View */
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
            <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    className="border-2 border-black font-bold"
                    style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    返回列表
                  </Button>
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      (CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).bg
                    } ${(CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).text} border ${
                      (CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).border
                    }`}>
                      {selectedDoc.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDoc.sourceUrl && (
                    <a
                      href={selectedDoc.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      查看原文
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(selectedDoc.content, selectedDoc.id)}
                    className="text-xs text-gray-500"
                  >
                    {copiedId === selectedDoc.id ? (
                      <><Check className="w-3 h-3 text-green-600 mr-1" />已复制</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" />复制</>
                    )}
                  </Button>
                </div>
              </div>
              <h2 className="text-xl font-black text-gray-900 mt-3">{selectedDoc.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {DISASTER_LABELS[selectedDoc.disasterType]} · {SOURCE_LABELS[selectedDoc.source]} · {selectedDoc.paragraphs} 段落
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="prose prose-sm max-w-none">
                {selectedDoc.content ? (
                  formatContent(selectedDoc.content)
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">暂无内容详情</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace('## ', '')}</h3>;
    }
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-base font-semibold text-gray-700 mt-3 mb-1">{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 text-gray-600 text-sm">{line.replace('- ', '')}</li>;
    }
    if (line.match(/^\d+\.\s/)) {
      return <li key={i} className="ml-4 text-gray-600 text-sm list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="text-gray-600 text-sm">{line}</p>;
  });
}

interface QATabProps {
  messages: Message[];
  isLoading: boolean;
  inputValue: string;
  copiedId: string | null;
  disasterType: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: (content?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onCopy: (content: string, id: string) => void;
  onScenarioSelect: (scenario: QuickScenario) => void;
}

function QATab({
  messages, isLoading, inputValue, copiedId, disasterType,
  messagesEndRef, inputRef, onInputChange, onSend,
  onKeyPress, onFeedback, onCopy, onScenarioSelect
}: QATabProps) {
  const [processingStage, setProcessingStage] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProcessingStage(0);
      return;
    }
    const t1 = setTimeout(() => setProcessingStage(1), 1200);
    const t2 = setTimeout(() => setProcessingStage(2), 2800);
    const t3 = setTimeout(() => setProcessingStage(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isLoading]);

  const stageLabels = ['检索知识库...', '分析文档内容...', '深度思考中...', '生成回答...'];
  const stageIcons = [Search, BookOpen, Lightbulb, Sparkles];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-600" />
                智能问答
              </span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                RAG增强 · 实时检索
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    RAG 增强智能问答
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                    基于 {DISASTER_LABELS[disasterType] || disasterType} 应急资料库，为您提供精准、有据可依的答案
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto text-left">
                    {[
                      { icon: <Search className="w-3.5 h-3.5" />, text: '检索应急文档', desc: '从预案/制度/标准中检索' },
                      { icon: <BookOpen className="w-3.5 h-3.5" />, text: '引用来源', desc: '答案可追溯、可验证' },
                      { icon: <Target className="w-3.5 h-3.5" />, text: '精准问答', desc: '针对具体问题精准回复' },
                      { icon: <Lightbulb className="w-3.5 h-3.5" />, text: '专业分析', desc: '风险等级标注+方案建议' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-blue-500 mt-0.5 shrink-0">{item.icon}</span>
                        <div>
                          <div className="text-xs font-medium text-gray-800">{item.text}</div>
                          <div className="text-[10px] text-gray-400">{item.desc}</div>
                        </div>
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

                    <div className={cn(
                      'max-w-[80%] rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 border border-gray-200'
                    )}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {formatContent(message.content)}
                      </div>

                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <BookOpen className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-500">引用来源（{message.sources.length}篇）</span>
                          </div>
                          <div className="space-y-1.5">
                            {message.sources.map((source, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 p-2 rounded-lg bg-white border border-gray-100 text-left"
                              >
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="text-[10px] font-medium text-gray-700 truncate">{source.title}</div>
                                  <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{source.snippet}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFeedback(message.id, 'positive')}
                            className={`gap-1 text-xs ${message.feedback === 'positive' ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            有帮助
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFeedback(message.id, 'negative')}
                            className={`gap-1 text-xs ${message.feedback === 'negative' ? 'text-red-600' : 'text-gray-500'}`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            需改进
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopy(message.content, message.id)}
                            className="gap-1 text-xs text-gray-500 ml-auto"
                          >
                            {copiedId === message.id ? (
                              <><Check className="w-3 h-3 text-green-600" />已复制</>
                            ) : (
                              <><Copy className="w-3 h-3" />复制</>
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {stageLabels[processingStage] || '处理中...'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {stageLabels.map((_, i) => {
                        const StageIcon = stageIcons[i];
                        const isActive = i <= processingStage;
                        const isCurrent = i === processingStage;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500',
                              isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                            )}>
                              <StageIcon className={cn('w-3 h-3', isCurrent && 'animate-pulse')} />
                            </div>
                            <div className={cn(
                              'text-[8px] transition-colors duration-500',
                              isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                            )}>
                              {i === 0 ? '检索' : i === 1 ? '分析' : i === 2 ? '思考' : '生成'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={onKeyPress}
                  placeholder="描述您的应急场景或问题，AI将检索相关资料为您解答..."
                  className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => onSend()}
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

      {/* QA Sidebar */}
      <div className="space-y-4">
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
                onClick={() => onScenarioSelect(scenario)}
                className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 group-hover:text-blue-600 mt-0.5">{scenario.icon}</span>
                  <div>
                    <div className="text-xs font-medium text-gray-800 group-hover:text-blue-700">{scenario.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{scenario.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-500" />
              核心能力
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: <Search className="w-3.5 h-3.5" />, title: 'RAG检索', desc: '实时检索应急资料库' },
              { icon: <Target className="w-3.5 h-3.5" />, title: '精准诊断', desc: '识别关键风险点' },
              { icon: <AlertTriangle className="w-3.5 h-3.5" />, title: '盲区提醒', desc: '指出易忽视环节' },
              { icon: <BookOpen className="w-3.5 h-3.5" />, title: '来源追溯', desc: '答案可追溯原文' }
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

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{messages.length}</div>
              <div className="text-xs text-gray-600 mt-1">本轮对话轮次</div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  RAG智能体在线
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SearchTabProps {
  searchQuery: string;
  searchResults: EmergencyDocument[];
  searchLoading: boolean;
  selectedDoc: EmergencyDocument | null;
  copiedId: string | null;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onDocSelect: (doc: EmergencyDocument) => void;
  onClearSelection: () => void;
  onCopy: (content: string, id: string) => void;
}

function SearchTab({
  searchQuery, searchResults, searchLoading, selectedDoc,
  copiedId, onQueryChange, onSearch, onKeyPress, onDocSelect, onClearSelection, onCopy
}: SearchTabProps) {
  return (
    <div>
      {!selectedDoc ? (
        <>
          {/* Search Bar */}
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={onKeyPress}
                    placeholder="搜索应急预案、制度规范、操作标准..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onQueryChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={onSearch}
                  disabled={!searchQuery.trim() || searchLoading}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-2">
                找到 {searchResults.length} 条结果
              </div>
              {searchResults.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onDocSelect(doc)}
                  className="cursor-pointer bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-red-300 rounded-xl p-5 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          (CATEGORY_COLORS[doc.category] || CATEGORY_COLORS['知识科普']).bg
                        } ${(CATEGORY_COLORS[doc.category] || CATEGORY_COLORS['知识科普']).text} border ${
                          (CATEGORY_COLORS[doc.category] || CATEGORY_COLORS['知识科普']).border
                        }`}>
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-gray-400">{DISASTER_LABELS[doc.disasterType]}</span>
                        <span className="text-[10px] text-gray-400">{SOURCE_LABELS[doc.source]}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                  {doc.content && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2">
                      {doc.content.replace(/#/g, '').substring(0, 200)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : searchQuery && !searchLoading ? (
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">未找到相关结果</p>
                <p className="text-gray-400 text-xs mt-1">请尝试其他关键词</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-2">输入关键词开始搜索</p>
                <p className="text-gray-400 text-xs">
                  支持搜索预案、制度、标准、演练文件、指挥手册等
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Search Document Detail */
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
          <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                  className="border-2 border-black font-bold"
                  style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  返回搜索结果
                </Button>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  (CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).bg
                } ${(CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).text} border ${
                  (CATEGORY_COLORS[selectedDoc.category] || CATEGORY_COLORS['知识科普']).border
                }`}>
                  {selectedDoc.category}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(selectedDoc.content, selectedDoc.id)}
                className="text-xs text-gray-500"
              >
                {copiedId === selectedDoc.id ? (
                  <><Check className="w-3 h-3 text-green-600 mr-1" />已复制</>
                ) : (
                  <><Copy className="w-3 h-3 mr-1" />复制</>
                )}
              </Button>
            </div>
            <h2 className="text-xl font-black text-gray-900 mt-3">{selectedDoc.title}</h2>
          </CardHeader>
          <CardContent className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            {selectedDoc.content ? (
              formatContent(selectedDoc.content)
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">暂无内容详情</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}