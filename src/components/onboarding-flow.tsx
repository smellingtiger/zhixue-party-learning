'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MindMap from '@/components/mind-map';
import { DiagnosticSurvey } from '@/components/diagnostic-survey';
import { AIIntentChat } from '@/components/ai-intent-chat';
import { partyKnowledgeGraph, generateLearningPath } from '@/lib/knowledge-graph';
import { LearningPath, KnowledgeNode, LearningProgress } from '@/lib/types';
import { 
  BrainCircuit, 
  MessageSquare, 
  GraduationCap, 
  ArrowLeft,
  Home,
  LogOut,
  User,
  Loader2,
  CheckCircle2,
  FileText,
  Sparkles,
  Network,
  Eye,
  PenTool,
  Users,
  Zap,
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
  onComplete: () => void;
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
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'diagnostic' | 'mindmap' | 'ai'>('home');
  const [generatedPath, setGeneratedPath] = useState<LearningPath | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  

  
  // 从 localStorage 获取当前用户
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
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
    // 如果没有用户或用户ID，直接返回（使用 localStorage 备份方案）
    if (!currentUser || !currentUser.id) {
      console.log('用户ID不存在，诊断结果已保存到 localStorage');
      return;
    }

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
    // 根据诊断结果生成学习路径
    const path = generateLearningPath({
      roles,
      topics,
      level: difficulty,
    });
    
    setGeneratedPath(path);
    // 设置高亮节点
    const nodes = getAllNodeIds(path.rootNode);
    setHighlightedNodes(nodes);
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
    // 移除自动跳转，让用户停留在知识图谱页面
  };

  // 处理重新诊断
  const handleResetDiagnostic = () => {
    setHasCompletedDiagnostic(false);
    setGeneratedPath(null);
    setHighlightedNodes([]);
    setCurrentView('diagnostic');
  };

  // 处理AI意图检测
  const handleIntentDetected = (keywords: string[], pathId: string) => {
    // 根据关键词高亮对应节点
    if (pathId) {
      setHighlightedNodes(prev => [...new Set([...prev, pathId])]);
    }
    setCurrentView('mindmap');
  };

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

  // 统计学习进度
  const completedCount = progress.filter(p => p.status === 'completed').length;
  const totalNodes = getAllNodeIds(partyKnowledgeGraph).length;
  const progressPercent = Math.round((completedCount / totalNodes) * 100);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_completed');
    router.push('/login');
  };

  // 处理完成并进入主站
  const handleFinish = () => {
    if (currentUser) {
      // 保存用户完成状态
      localStorage.setItem('user_diagnostic_completed', hasCompletedDiagnostic ? 'true' : 'false');
    }
    onComplete();
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      {/* 导航栏 */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/icon.png" 
                alt="全省统一战线网络学院" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-lg hidden md:block text-white">
                全省统一战线网络学院
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="relative group">
                  <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/50">
                    <AvatarFallback className="bg-white text-red-600 font-medium">{currentUser.display_name?.charAt(0) || currentUser.username?.charAt(0) || '党'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      {currentUser.display_name || currentUser.username || '用户'}
                    </div>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <LogOut className="inline-block h-4 w-4 mr-2" />
                      退出登录
                    </button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-white text-red-600 hover:bg-white/90"
                  onClick={() => router.push('/login')}
                >
                  登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

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
                    党政教育学习智能体
                  </motion.h2>

                  {/* 引导流程提示 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { step: 1, icon: FileText, title: '学习诊断', desc: '回答身份与学习偏好' },
                        { step: 2, icon: Sparkles, title: '智能推荐', desc: '生成专属学习课程' },
                        { step: 3, icon: Network, title: '知识图谱', desc: '了解党建知识体系' },
                        { step: 4, icon: GraduationCap, title: '开始学习', desc: '进入系统学习之旅' },
                      ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-bold text-white/60">STEP {item.step}</span>
                          <span className="text-sm font-bold text-white">{item.title}</span>
                          <span className="text-xs text-white/70">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/30 via-red-400/20 to-orange-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-red-300/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-500"
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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-cyan-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-blue-300/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500"
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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 via-emerald-400/20 to-green-400/20 backdrop-blur-sm border border-white/20 p-6 text-left hover:border-emerald-300/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500"
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
                </div>
              </div>

              {/* 功能模块展示 */}
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="border-0 shadow-xl overflow-hidden h-full bg-gradient-to-br from-red-50 to-rose-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="40" cy="40" r="20" fill="none" stroke="#fecdd3" strokeWidth="1" />
                          <circle cx="120" cy="80" r="30" fill="none" stroke="#fecdd3" strokeWidth="1" />
                          <circle cx="160" cy="140" r="25" fill="none" stroke="#fecdd3" strokeWidth="1" />
                          <circle cx="60" cy="160" r="15" fill="none" stroke="#fecdd3" strokeWidth="1" />
                          <circle cx="100" cy="20" r="10" fill="none" stroke="#fecdd3" strokeWidth="1" />
                        </svg>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-red-600 to-red-500" />
                      <CardContent className="p-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                          <img src="/zcfg-ico.png" alt="智能诊断" className="w-14 h-14" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">智能诊断</h3>
                        <p className="text-slate-700 text-sm mb-6">基于AI技术的学习能力诊断，精准评估您的学习基础和需求</p>
                        <Button 
                          onClick={() => setCurrentView('diagnostic')}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          开始诊断
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="border-0 shadow-xl overflow-hidden h-full bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="30" cy="60" r="22" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="100" cy="40" r="28" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="160" cy="80" r="20" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="50" cy="140" r="25" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="130" cy="160" r="15" fill="none" stroke="#fde68a" strokeWidth="1" />
                        </svg>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-yellow-500" />
                      <CardContent className="p-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
                          <img src="/zsjy-ico.png" alt="知识图谱" className="w-14 h-14" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">知识图谱</h3>
                        <p className="text-slate-700 text-sm mb-6">可视化党建知识体系，清晰展示学习内容的内在联系</p>
                        <Button 
                          onClick={() => setCurrentView('mindmap')}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          探索图谱
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="border-0 shadow-xl overflow-hidden h-full bg-gradient-to-br from-yellow-50 to-amber-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="60" cy="30" r="18" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="150" cy="40" r="22" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="40" cy="100" r="25" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="120" cy="120" r="30" fill="none" stroke="#fde68a" strokeWidth="1" />
                          <circle cx="80" cy="160" r="15" fill="none" stroke="#fde68a" strokeWidth="1" />
                        </svg>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-red-500 to-red-400" />
                      <CardContent className="p-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                          <img src="/kxfz-ico.png" alt="AI助手" className="w-14 h-14" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">AI助手</h3>
                        <p className="text-slate-700 text-sm mb-6">智能学习助手，随时解答您的疑问，提供个性化学习建议</p>
                        <Button 
                          onClick={() => setCurrentView('ai')}
                          className="w-full bg-red-500 hover:bg-red-600"
                        >
                          咨询助手
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                    返回首页
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {generatedPath?.title || '党建知识图谱'}
                    </h2>
                    {generatedPath && (
                      <p className="text-slate-500 text-sm">
                        共 {generatedPath.totalDuration} 分钟 · {generatedPath.difficulty === 'beginner' ? '入门级' : generatedPath.difficulty === 'intermediate' ? '进阶级' : '深入级'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 进入主站按钮 */}
                {generatedPath && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button 
                      size="lg"
                      onClick={handleFinish}
                      className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-lg"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      开始学习之旅
                    </Button>
                  </motion.div>
                )}
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
                            <p>🎯 <span className="font-medium">学习难度：</span>{generatedPath.difficulty === 'beginner' ? '入门级' : generatedPath.difficulty === 'intermediate' ? '进阶级' : '深入级'}</p>
                            <p>🌟 <span className="font-medium">核心知识点：</span>{generatedPath.rootNode.children?.length || 0} 个主题模块</p>
                          </div>
                        </div>
                      </div>
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
