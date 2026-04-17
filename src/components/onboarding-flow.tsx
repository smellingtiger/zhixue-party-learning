'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MindMap } from '@/components/mind-map';
import { DiagnosticSurvey } from '@/components/diagnostic-survey';
import { AIIntentChat } from '@/components/ai-intent-chat';
import { partyKnowledgeGraph } from '@/lib/knowledge-graph';
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
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [progress] = useState<LearningProgress[]>([
    { nodeId: 'party-constitution', status: 'completed', score: 95 },
    { nodeId: 'party-history', status: 'completed', score: 88 }
  ]);

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

  // 保存诊断结果到数据库
  const saveDiagnostic = async (path: LearningPath, roles: string[], topics: string[], difficulty: string) => {
    if (!currentUser) return;

    setIsSaving(true);
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
        console.error('保存诊断失败');
      }
    } catch (err) {
      console.error('保存诊断错误:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理诊断完成后的路径生成
  const handlePathGenerated = (path: LearningPath, roles?: string[], topics?: string[], difficulty?: string) => {
    setGeneratedPath(path);
    // 设置高亮节点
    const nodes = getAllNodeIds(path.rootNode);
    setHighlightedNodes(nodes);
    setHasCompletedDiagnostic(true);
    
    // 保存诊断结果
    if (roles && topics && difficulty) {
      saveDiagnostic(path, roles, topics, difficulty);
    }
    
    setCurrentView('mindmap');
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
    localStorage.removeItem('admin_user');
    localStorage.removeItem('onboarding_completed');
    router.push('/admin');
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
                
                <div className="relative z-10 max-w-2xl mx-auto text-center py-12 px-6">
                  <motion.h2 
                    className="text-3xl md:text-4xl font-bold text-red-800 mb-4"
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
                    <p className="text-xl text-red-600 font-medium">
                      {showWelcome ? typewriterText : ''}
                      <span className="animate-pulse">|</span>
                    </p>
                  </motion.div>
                  
                  <motion.p 
                    className="text-red-700 text-lg mb-8"
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
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Map className="w-5 h-5 mr-2" />
                      先看看知识图谱
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* 平台特色介绍 - 适合新用户 */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-red-500 to-red-500" />
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">个性化诊断</h3>
                    <p className="text-red-600 text-sm mb-4">通过智能诊断了解您的学习基础，为您精准匹配学习内容</p>
                    <Button 
                      onClick={() => setCurrentView('diagnostic')}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      立即诊断
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-red-500 to-yellow-500" />
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Map className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">知识图谱</h3>
                    <p className="text-red-600 text-sm mb-4">可视化展示党建知识体系，清晰了解学习内容结构</p>
                    <Button 
                      onClick={() => setCurrentView('mindmap')}
                      className="w-full bg-red-500 hover:bg-red-600"
                    >
                      探索图谱
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-red-400 to-red-400" />
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Lightbulb className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">AI学习助手</h3>
                    <p className="text-red-600 text-sm mb-4">随时提问，即时解答，让学习更加轻松高效</p>
                    <Button 
                      onClick={() => setCurrentView('ai')}
                      className="w-full bg-gradient-to-r from-red-400 to-red-400 hover:from-red-500 hover:to-red-500"
                    >
                      向AI提问
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* 快速开始提示 */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-800 mb-1">建议您这样开始</h3>
                      <p className="text-red-700 text-sm">先完成学习诊断，了解自己的学习基础，然后根据AI为您定制的学习路径开始系统学习</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 完成按钮 */}
              <div className="text-center space-y-4">
                {hasCompletedDiagnostic && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>您已完成学习诊断</span>
                  </motion.div>
                )}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleFinish}
                    className="px-8 border-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    进入主站
                  </Button>
                  {!hasCompletedDiagnostic && (
                    <Button
                      onClick={() => setCurrentView('diagnostic')}
                      className="bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 px-8"
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      完成诊断
                    </Button>
                  )}
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
              <div className="flex items-center gap-4 mb-6">
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
              
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-[calc(100vh-280px)] min-h-[600px]">
                  <MindMap 
                    data={generatedPath?.rootNode || partyKnowledgeGraph}
                    progress={progress}
                    highlightedNodes={highlightedNodes}
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
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  <span className="text-lg font-medium">正在保存诊断结果...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 border-t border-slate-200 bg-white/50">
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
