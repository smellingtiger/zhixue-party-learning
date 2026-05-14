'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MindMap from '@/components/mind-map';
import { DiagnosticSurvey } from '@/components/diagnostic-survey';
import { AIIntentChat } from '@/components/ai-intent-chat';
import { partyKnowledgeGraph, generateLearningPath, roleNodeMap, topicNodeMap, getNodeById, getDifficultyLockedNodeIds } from '@/lib/knowledge-graph';
import { LearningPath, KnowledgeNode, LearningProgress } from '@/lib/types';
import { 
  BrainCircuit,
  GraduationCap, 
  ArrowLeft,
  Loader2,
  FileText,
  Sparkles,
  CheckCircle2,
  Network,
  Eye,
  PenTool,
  Users,
  Zap,
  X,
  Search,
} from 'lucide-react';

// 随机欢迎语
const welcomeMessages = [
  "开启您的党建学习之旅！",
  "知识的力量从这里开始！",
  "让我们一起学习进步吧！",
  "准备好探索知识的海洋了吗？",
  "每一天都是学习的好日子！",
  "学习使人进步，坚持使人成功！",
  "欢迎加入学习大家庭！",
  "精彩内容等你来发现！"
];

interface CurrentUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface OnboardingFlowProps {
  onComplete?: () => void;
}

// 打字机特效组件
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setShowCursor(false);
        onComplete?.();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [text, onComplete]);
  
  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentView, setCurrentView] = useState<'home' | 'diagnostic' | 'mindmap' | 'ai'>('home');
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [generatedPath, setGeneratedPath] = useState<LearningPath | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [diagnosticRoles, setDiagnosticRoles] = useState<string[]>([]);
  const [diagnosticTopics, setDiagnosticTopics] = useState<string[]>([]);
  const [difficultyLockedNodes, setDifficultyLockedNodes] = useState<Set<string>>(new Set());
  const [showFullMap, setShowFullMap] = useState(false);
  

  
  // 从 localStorage 获取当前用户
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return {
      id: 'guest_default',
      username: '游客用户',
      display_name: '游客',
      avatar_url: null,
    };
  });

  const [progress, setProgress] = useState<LearningProgress[]>([]);

  // 从localStorage读取学习进度
  useEffect(() => {
    const saved = localStorage.getItem('learning_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // 递归获取所有节点ID
  const getAllNodeIds = (node: KnowledgeNode): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids = [...ids, ...getAllNodeIds(child)];
      });
    }
    return ids;
  };

  // 从localStorage恢复诊断状态，直接显示诊断报告
  useEffect(() => {
    const saved = localStorage.getItem('user_diagnostic');
    if (saved) {
      try {
        const diagnostic = JSON.parse(saved);
        const path = generateLearningPath({
          roles: diagnostic.roles || [],
          topics: diagnostic.topics || [],
        });
        setGeneratedPath(path);
        setDiagnosticRoles(diagnostic.roles || []);
        setDiagnosticTopics(diagnostic.topics || []);
        const nodes = getAllNodeIds(path.rootNode);
        setHighlightedNodes(nodes);
        const locked = getDifficultyLockedNodeIds(path.rootNode, diagnostic.difficulty || 'beginner');
        setDifficultyLockedNodes(locked);
        setHasCompletedDiagnostic(true);
        setCurrentView('mindmap');
      } catch {
        // ignore
      }
    }
  }, []);

  // 随机选择欢迎语 + 打字机效果
  useEffect(() => {
    const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setWelcomeMessage(randomMsg);
    setShowWelcome(false);
    setTypewriterText('');
    
    // 短暂延迟后开始打字
    const timer = setTimeout(() => {
      setShowWelcome(true);
      // 打字机效果
      let index = 0;
      const typeInterval = setInterval(() => {
        index++;
        setTypewriterText(randomMsg.substring(0, index));
        if (index >= randomMsg.length) {
          clearInterval(typeInterval);
        }
      }, 50);
      return () => clearInterval(typeInterval);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 保存诊断结果到数据库（静默处理，不影响主流程）
  const saveDiagnostic = async (path: LearningPath, roles: string[], topics: string[], difficulty: string) => {
    try {
      const response = await fetch('/api/user/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          roles,
          topics,
          difficulty,
          learning_path_id: path.id,
          completed: true,
        }),
      });

      if (!response.ok) {
        // 数据库保存失败不影响主流程，localStorage 已备份
        console.warn('诊断结果数据库保存失败，已使用 localStorage 备份');
      } else {
        console.log('诊断结果已保存到数据库');
      }
    } catch (err) {
      // 网络错误等不影响主流程
      console.warn('诊断结果保存网络异常，已使用 localStorage 备份');
    }
  };

  // 处理诊断完成后的路径生成
  const handlePathGenerated = (roles: string[], topics: string[], difficulty: string) => {
    // 保存原始选择以供展示
    setDiagnosticRoles(roles);
    setDiagnosticTopics(topics);
    
    // 根据诊断结果生成学习路径（不按难度过滤节点）
    const path = generateLearningPath({
      roles,
      topics,
      level: difficulty,
    });
    
    setGeneratedPath(path);
    
    // 设置高亮节点
    const nodes = getAllNodeIds(path.rootNode);
    setHighlightedNodes(nodes);
    
    // 计算难度锁定节点（仅用于灰色显示，不实际过滤）
    const locked = getDifficultyLockedNodeIds(path.rootNode, difficulty);
    setDifficultyLockedNodes(locked);
    
    setHasCompletedDiagnostic(true);
    
    // 同时保存到 localStorage 供主页读取
    localStorage.setItem('user_diagnostic', JSON.stringify({
      roles,
      topics,
      difficulty,
      pathId: path.id,
    }));
    
    // 保存到数据库
    saveDiagnostic(path, roles, topics, difficulty);
    
    setCurrentView('mindmap');
  };

  // 处理重新诊断
  const handleResetDiagnostic = () => {
    setHasCompletedDiagnostic(false);
    setGeneratedPath(null);
    setHighlightedNodes([]);
    setDiagnosticRoles([]);
    setDiagnosticTopics([]);
    setDifficultyLockedNodes(new Set());
    setCurrentView('diagnostic');
    localStorage.removeItem('user_diagnostic');
  };

  // 处理AI意图检测
  const handleIntentDetected = (keywords: string[], pathId: string) => {
    // 根据关键词高亮对应节点
    if (pathId) {
      setHighlightedNodes(prev => [...new Set([...prev, pathId])]);
    }
    setCurrentView('mindmap');
  };

  // 统计学习进度
  const completedCount = progress.filter(p => p.status === 'completed').length;
  const totalNodes = getAllNodeIds(partyKnowledgeGraph).length;
  const progressPercent = Math.round((completedCount / totalNodes) * 100);

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* 首页视图 */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero区域 - 新用户欢迎页 */}
              <div className="relative overflow-hidden rounded-3xl" style={{ backgroundImage: 'url(/welcome-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="relative z-10 max-w-5xl mx-auto text-center py-12 px-6">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-white mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    红韵学习智能体
                  </motion.h2>

                  {/* 软件特色 — 三大智能体 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div className="inline-flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-yellow-300" />
                      <h3 className="text-xl font-bold text-white">AI 核心能力 · 三大智能体</h3>
                      <Zap className="w-5 h-5 text-yellow-300" />
                    </div>
                    <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
                      基于深度诊断结果，三大 AI 智能体协同驱动，为您构建全方位、个性化的智慧学习生态
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-3 gap-5 mb-6">
                    {/* 智能体一：智能分析解读 */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 1 ? null : 1)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/30 via-red-400/20 to-orange-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-red-300/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Eye className="w-6 h-6 text-red-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-red-300/80 tracking-wider">智能体 01</span>
                            <h4 className="text-lg font-bold text-white">智能分析解读</h4>
                          </div>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed">
                          实时追踪学习进度，深度捕捉交互反馈与行为习惯。AI 精准解读每位学员的偏好与短板，毫秒级推送专属学习内容——<span className="text-red-300 font-medium">比您更懂您的学习需求</span>
                        </p>
                      </div>
                    </motion.div>

                    {/* 智能体二：智能生成学习资料 */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 2 ? null : 2)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-cyan-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-blue-300/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <PenTool className="w-6 h-6 text-blue-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-blue-300/80 tracking-wider">智能体 02</span>
                            <h4 className="text-lg font-bold text-white">智能生成内容</h4>
                          </div>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed">
                          汇聚全网权威内容与历史学习数据，AI 深度解析课程内核，智能重组知识体系。<span className="text-blue-300 font-medium">唤醒沉睡的资料，让每一份旧识重新迸发生命力</span>
                        </p>
                      </div>
                    </motion.div>

                    {/* 智能体三：学员智能组班 */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 3 ? null : 3)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 via-emerald-400/20 to-green-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-emerald-300/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-6 h-6 text-emerald-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-300/80 tracking-wider">智能体 03</span>
                            <h4 className="text-lg font-bold text-white">学员智能组班</h4>
                          </div>
                        </div>
                        <p className="text-sm text-white/75 leading-relaxed">
                          统计学情数据，智能匹配教学资源，精准推荐适配课堂。<span className="text-emerald-300 font-medium">不落下每一位学员的进度，不辜负每一位老师的付出——让优质教育资源的分配，从此清晰可见</span>
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* 智能体详情展开区 */}
                  <AnimatePresence mode="wait">
                    {activeAgent !== null && (
                      <motion.div
                        key={activeAgent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className={`rounded-2xl backdrop-blur-sm border p-6 mb-6 ${
                          activeAgent === 1 ? 'bg-red-500/10 border-red-300/30' :
                          activeAgent === 2 ? 'bg-blue-500/10 border-blue-300/30' :
                          'bg-emerald-500/10 border-emerald-300/30'
                        }`}>
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                activeAgent === 1 ? 'bg-red-500/30' :
                                activeAgent === 2 ? 'bg-blue-500/30' :
                                'bg-emerald-500/30'
                              }`}>
                                {activeAgent === 1 ? <Eye className="w-4 h-4 text-white" /> :
                                 activeAgent === 2 ? <PenTool className="w-4 h-4 text-white" /> :
                                 <Users className="w-4 h-4 text-white" />}
                              </div>
                              <div>
                                <span className={`text-xs font-bold tracking-wider ${
                                  activeAgent === 1 ? 'text-red-300' :
                                  activeAgent === 2 ? 'text-blue-300' :
                                  'text-emerald-300'
                                }`}>智能体 0{activeAgent} · 工作流程</span>
                                <h4 className="text-base font-bold text-white">
                                  {activeAgent === 1 ? '智能分析解读' :
                                   activeAgent === 2 ? '智能生成学习资料' :
                                   '学员智能组班'}
                                </h4>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveAgent(null)}
                              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                            >
                              <X className="w-4 h-4 text-white/70" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {activeAgent === 1 && [
                              { step: 1, icon: FileText, title: '学习诊断', desc: '回答身份与学习偏好' },
                              { step: 2, icon: Sparkles, title: '智能推荐', desc: '生成专属学习课程' },
                              { step: 3, icon: Network, title: '知识图谱', desc: '了解党建知识体系' },
                              { step: 4, icon: GraduationCap, title: '开始学习', desc: '进入系统学习之旅' },
                            ].map((item) => (
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white/40">STEP {item.step}</span>
                                <span className="text-sm font-bold text-white">{item.title}</span>
                                <span className="text-xs text-white/60 text-center">{item.desc}</span>
                              </div>
                            ))}

                            {activeAgent === 2 && [
                              { step: 1, icon: FileText, title: '输入课程主题', desc: 'AI自动设计课程结构，生成章节内容，匹配学习目标' },
                              { step: 2, icon: Sparkles, title: '个性化生成逻辑', desc: '身份匹配 · 主题关联 · 难度适配 · 综合推荐' },
                              { step: 3, icon: Network, title: '知识库整合', desc: '知识检索、内容筛选、审核复查，确保内容质量' },
                              { step: 4, icon: Sparkles, title: '视频图片生成', desc: '自动AI生成配图和教学视频' },
                            ].map((item) => (
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white/40">STEP {item.step}</span>
                                <span className="text-sm font-bold text-white">{item.title}</span>
                                <span className="text-xs text-white/60 text-center">{item.desc}</span>
                              </div>
                            ))}

                            {activeAgent === 3 && [
                              { step: 1, icon: FileText, title: '输入开班需求', desc: 'AI自动解析培训目标与参训范围' },
                              { step: 2, icon: Search, title: '全景扫描学员库', desc: '核查培训记录，识别应培未培与避让人员' },
                              { step: 3, icon: Sparkles, title: '智能匹配推荐', desc: '多维数据模型生成最优推荐名单与课程方案' },
                              { step: 4, icon: CheckCircle2, title: '一键生成班级', desc: '确认方案，自动发送通知，全程数字化管理' },
                            ].map((item) => (
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-white/40">STEP {item.step}</span>
                                <span className="text-sm font-bold text-white">{item.title}</span>
                                <span className="text-xs text-white/60 text-center">{item.desc}</span>
                              </div>
                            ))}
                          </div>

                          {/* 快捷跳转 */}
                          <div className="mt-5 pt-4 border-t border-white/10">
                            {activeAgent === 1 && (
                              <Button
                                onClick={() => { setCurrentView('diagnostic'); setActiveAgent(null); }}
                                className="w-full bg-red-500/80 hover:bg-red-500 text-white border-0"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                开始学习诊断
                              </Button>
                            )}
                            {activeAgent === 2 && (
                              <Link href="/ai-course" className="block w-full">
                                <Button
                                  onClick={() => setActiveAgent(null)}
                                  className="w-full bg-blue-500/80 hover:bg-blue-500 text-white border-0"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  咨询AI助手生成资料
                                </Button>
                              </Link>
                            )}
                            {activeAgent === 3 && (
                              <Link href="/training-candidates" className="block w-full">
                                <Button
                                  onClick={() => setActiveAgent(null)}
                                  className="w-full bg-emerald-500/80 hover:bg-emerald-500 text-white border-0"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  进入智能组班系统
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          )}

          {/* 诊断问卷视图 */}
          {currentView === 'diagnostic' && (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">学习能力诊断</h2>
                <p className="text-slate-500">回答以下问题，我们将为您智能生成学习路径</p>
              </div>
              <DiagnosticSurvey onPathGenerated={handlePathGenerated} />
            </motion.div>
          )}

          {/* 思维导图视图 */}
          {currentView === 'mindmap' && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('home')}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    重新诊断
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      诊断完成报告
                    </h2>
                    {generatedPath && (
                      <p className="text-slate-500 text-sm">
                        共 {generatedPath.totalDuration} 分钟 · {generatedPath.rootNode.children?.length || 0} 个知识模块
                      </p>
                    )}
                  </div>
                </div>
                
              </div>
              
              {/* 诊断完成报告 */}
              {generatedPath && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Card className="border-0 shadow-xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(234, 88, 12, 0.9) 100%)' }}>
                    {/* 波浪装饰 */}
                    <div className="absolute bottom-0 right-0 w-full h-30 overflow-hidden">
                      <svg className="absolute bottom-0 right-0 w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
                        <path 
                          d="M0,20 C150,80 350,20 500,60 C650,100 800,10 1000,50 C1100,70 1150,30 1200,50 L1200,100 L0,100 Z" 
                          style={{ fill: 'rgba(255,255,255,0.25)' }}
                        />
                        <path 
                          d="M0,40 C100,60 250,0 400,40 C550,80 700,20 850,60 C950,80 1050,40 1200,70 L1200,100 L0,100 Z" 
                          style={{ fill: 'rgba(255,255,255,0.15)' }}
                        />
                      </svg>
                    </div>
                    {/* 查看全貌弹框入口 */}
                    <Dialog open={showFullMap} onOpenChange={setShowFullMap}>
                      <DialogTrigger asChild>
                        <button className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/35 text-white/90 hover:text-white text-xs font-medium transition-all duration-200 backdrop-blur-sm border border-white/20">
                          <Eye className="w-3.5 h-3.5" />
                          查看全貌
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] max-h-[85vh] w-[1200px] p-0 gap-0" showCloseButton={false}>
                        <DialogHeader className="px-6 pt-5 pb-3 border-b">
                          <div className="flex items-center justify-between">
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                              <Network className="w-5 h-5 text-red-600" />
                              党建知识全貌
                            </DialogTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowFullMap(false)} className="h-8 w-8">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </DialogHeader>
                        <div className="h-[75vh] w-full">
                          <MindMap 
                            data={partyKnowledgeGraph}
                            progress={progress}
                            highlightedNodes={[]}
                            interactive={false}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">诊断完成！</h3>
                          <p className="text-white/90 mb-4">
                            亲爱的{currentUser?.display_name || '同学'}，基于您的选择，我们为您定制了专属学习路径。
                          </p>
                          <div className="space-y-2 text-sm text-white/80">
                            <p>📚 <span className="font-medium">推荐学习时长：</span>{generatedPath.totalDuration} 分钟</p>
                            <p>� <span className="font-medium">核心知识点：</span>{generatedPath.rootNode.children?.length || 0} 个主题模块</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 诊断选择记录 */}
                  <Card className="border-0 shadow-lg mt-4">
                    <CardContent className="p-5">
                      <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-600" />
                        诊断选择记录
                      </h4>
                      
                      {/* 身份选择 */}
                      {diagnosticRoles.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2">已选身份</h5>
                          <div className="flex flex-wrap gap-2">
                            {diagnosticRoles.map(role => {
                              const nodeIds = roleNodeMap[role] || [];
                              return (
                                <div key={role} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50/60 rounded-lg border border-red-100">
                                  <Badge className="bg-red-500 hover:bg-red-600 text-white shrink-0">{role}</Badge>
                                  {nodeIds.map(nodeId => {
                                    const node = getNodeById(nodeId, partyKnowledgeGraph);
                                    return (
                                      <Badge key={nodeId} variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">
                                        {node?.name || nodeId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 主题选择 */}
                      {diagnosticTopics.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-600 mb-2">已选学习主题</h5>
                          <div className="flex flex-wrap gap-2">
                            {diagnosticTopics.map(topic => {
                              const nodeId = topicNodeMap[topic];
                              const node = nodeId ? getNodeById(nodeId, partyKnowledgeGraph) : null;
                              return (
                                <div key={topic} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 rounded-lg border border-blue-100">
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white shrink-0">{topic}</Badge>
                                  {node ? (
                                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                      {node.name}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              <Card className="border-0 shadow-xl overflow-hiddent">
                <div className="h-[calc(100vh-400px)] min-h-[500px]">
                  <MindMap 
                    data={generatedPath?.rootNode || partyKnowledgeGraph}
                    progress={progress}
                    highlightedNodes={highlightedNodes}
                    interactive={!hasCompletedDiagnostic}
                    lockedByDifficultyNodes={difficultyLockedNodes}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* AI助手视图 */}
          {currentView === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">AI学习助手</h2>
                  <p className="text-slate-500">用自然语言描述您的学习需求</p>
                </div>
                <AIIntentChat onIntentDetected={handleIntentDetected} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 保存中提示 */}
        <AnimatePresence>
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <Card className="border-0 shadow-2xl p-8">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
                  <span className="text-lg font-medium">正在保存诊断结果...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 border-t border-slate-200 ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <BrainCircuit className="w-5 h-5" />
              <span>智慧党建学习平台 · AI驱动学习新体验</span>
            </div>
            <div className="text-slate-400 text-xs">
              © 2024 智慧党建 · 让学习更智能
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
