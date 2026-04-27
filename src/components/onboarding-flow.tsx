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
  Map, 
  MessageSquare, 
  GraduationCap, 
  ArrowLeft,
  Sparkles,
  Home,
  LogOut,
  User,
  Loader2,
  CheckCircle2,
  BookOpen,
  Target,
  Lightbulb,
  PartyPopper
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
                {/* 引导流程提示 */}
                <div className="absolute top-6 left-6 z-20">
                  <div className="relative group">
                    <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200">
                      <Lightbulb className="w-6 h-6 text-red-500" />
                    </button>
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <h4 className="font-bold text-slate-900 mb-3">引导流程说明</h4>
                      <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 mt-0.5">1</span>
                          <p>完成学习诊断，回答身份、学习主题和难度相关问题</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 mt-0.5">2</span>
                          <p>智能生成专属课程，系统根据诊断结果推荐学习内容</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 mt-0.5">3</span>
                          <p>查看知识图谱，了解党建知识体系结构</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0 mt-0.5">4</span>
                          <p>进入主站学习，开始系统学习之旅</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10 max-w-2xl mx-auto text-center py-12 px-6">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    欢迎来到全省统一战线网络学院
                  </motion.h2>
                  
                  {/* AI形象 + 随机欢迎语 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 flex items-center justify-center gap-3"
                  >
                    <img src="/welcome-character.png" alt="AI助手" className="h-16 w-auto" />
                    <p className="text-xl text-slate-700 font-medium">
                      {showWelcome ? typewriterText : ''}
                      <span className="animate-pulse">|</span>
                    </p>
                  </motion.div>
                  
                  <motion.p 
                    className="text-slate-800 text-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    开启您的党建学习之旅，通过AI智能分析为您量身定制学习路径
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    <Button 
                      size="lg"
                      onClick={() => setCurrentView('diagnostic')}
                      className="bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white shadow-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始学习诊断
                    </Button>
                    <Button 
                      size="lg"
                      onClick={() => setCurrentView('mindmap')}
                      variant="outline"
                      className="border-2 border-red-300 text-slate-700 hover:bg-red-50"
                    >
                      <Map className="w-5 h-5 mr-2" />
                      先看看知识图谱
                    </Button>
                  </motion.div>
                  

                </div>
              </div>

              {/* 平台特色介绍 - 新设计方案 */}
              <div className="space-y-10">
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

                {/* 学习路径展示 */}
                <Card className="border-0 shadow-xl relativet bg-cover bg-center" style={{ backgroundImage: 'url(/classGardenbg.png), url(/aijieguo.png)' }}>
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-10">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">个性化学习路径</h3>
                      <p className="text-slate-600 max-w-2xl mx-auto">基于您的诊断结果，系统将为您生成专属学习路径，让学习更有针对性</p>
                    </div>
                    <div className="relative">
                      {/* 路径时间线 */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-red-300 to-orange-300 rounded-full"></div>
                      
                      <div className="space-y-16">
                        <motion.div 
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-8"
                        >
                          <div className="flex-1 text-right pr-8">
                            <h4 className="font-bold text-lg text-slate-900 mb-2">基础学习</h4>
                            <p className="text-sm text-slate-600">掌握核心概念和基本理论，建立知识基础</p>
                          </div>
                          <div className="z-10 w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl">1</div>
                          <div className="flex-1 pl-8"></div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex items-center gap-8"
                        >
                          <div className="flex-1 pr-8"></div>
                          <div className="z-10 w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">2</div>
                          <div className="flex-1 pl-8">
                            <h4 className="font-bold text-lg text-slate-900 mb-2">进阶提升</h4>
                            <p className="text-sm text-slate-600">深入理解和应用实践，提升专业能力</p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center gap-8"
                        >
                          <div className="flex-1 text-right pr-8">
                            <h4 className="font-bold text-lg text-slate-900 mb-2">综合应用</h4>
                            <p className="text-sm text-slate-600">理论联系实际，解决实际问题</p>
                          </div>
                          <div className="z-10 w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl">3</div>
                          <div className="flex-1 pl-8"></div>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
