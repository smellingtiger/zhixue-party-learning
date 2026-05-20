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
import { QuizComponent } from '@/components/quiz-component';
import { partyKnowledgeGraph, generateLearningPath, roleNodeMap, topicNodeMap, getNodeById, getDynamicKnowledgeGraph, getDifficultyLockedNodeIds, injectCoursesRecursive, fetchKnowledgeBaseCourses, initTopicNodeMap, analyzeRequirements, getTopicNodeMap, filterNodes, getNodeDisplayName, getDynamicParentMap } from '@/lib/knowledge-graph';
import { generateQuizSet, generateConfigFromLearningPath } from '@/lib/question-generator';
import { LearningPath, KnowledgeNode, LearningProgress, QuizSet } from '@/lib/types';
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
  Target,
} from 'lucide-react';

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
  const [currentView, setCurrentView] = useState<'home' | 'diagnostic' | 'mindmap' | 'ai' | 'quiz'>('home');
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
  const [diagnosticLevel, setDiagnosticLevel] = useState<string>('');
  const [diagnosticRequirements, setDiagnosticRequirements] = useState<string>('');
  const [diagnosticKeywords, setDiagnosticKeywords] = useState<string[]>([]);
  const [diagnosticMatchedTopics, setDiagnosticMatchedTopics] = useState<string[]>([]);
  const [diagnosticMatchedNodes, setDiagnosticMatchedNodes] = useState<string[]>([]);
  const [difficultyLockedNodes, setDifficultyLockedNodes] = useState<Set<string>>(new Set());
  const [showFullMap, setShowFullMap] = useState(false);
  const [knowledgeBaseGraph, setKnowledgeBaseGraph] = useState<KnowledgeNode | null>(null);
  const [graphLoaded, setGraphLoaded] = useState(false);
  const [savedDiagnostic, setSavedDiagnostic] = useState<any>(null);
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);



  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
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

  useEffect(() => {
    const saved = localStorage.getItem('learning_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {
      }
    }
  }, []);

  const getAllNodeIds = (node: KnowledgeNode): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids = [...ids, ...getAllNodeIds(child)];
      });
    }
    return ids;
  };

  useEffect(() => {
    const saved = localStorage.getItem('user_diagnostic');
    if (saved) {
      try {
        const diagnostic = JSON.parse(saved);
        setSavedDiagnostic(diagnostic);
      } catch {
        localStorage.removeItem('user_diagnostic');
      }
    }
  }, []);

  // 从知识库API加载课程数据，替换离线课程映射
  useEffect(() => {
    fetchKnowledgeBaseCourses()
      .then(({ graph }) => {
        if (graph) {
          setKnowledgeBaseGraph(injectCoursesRecursive(graph));
        } else {
          // 即使API失败，也构建一个空的动态图谱，避免用旧静态图谱
          setKnowledgeBaseGraph(getDynamicKnowledgeGraph() || injectCoursesRecursive(partyKnowledgeGraph));
        }
        initTopicNodeMap();
        console.log(`[知识库] 已从API加载课程数据到公务员方向知识图谱`);
        setGraphLoaded(true);
      })
      .catch(err => {
        console.warn('[知识库] API加载失败，使用动态图谱:', err);
        // 优先用动态图谱
        setKnowledgeBaseGraph(getDynamicKnowledgeGraph() || injectCoursesRecursive(partyKnowledgeGraph));
        setGraphLoaded(true);
      });
  }, []);

  // 当图谱加载完成并且有 savedDiagnostic 时，恢复诊断状态
  useEffect(() => {
    if (graphLoaded && savedDiagnostic) {
      try {
        const diagnostic = savedDiagnostic;
        const path = generateLearningPath({
          roles: diagnostic.roles || [],
          topics: diagnostic.topics || [],
          customRequirements: diagnostic.customRequirements || undefined,
        });
        // 检查生成的路径是否有知识模块
        const hasModules = path.rootNode.children && path.rootNode.children.length > 0;
        if (hasModules) {
          setGeneratedPath(path);
          setDiagnosticRoles(diagnostic.roles || []);
          setDiagnosticTopics(diagnostic.topics || []);
          setDiagnosticLevel(diagnostic.difficulty || 'beginner');
          setDiagnosticRequirements(diagnostic.customRequirements || '');
          
          // 分析自定义需求中的关键词
          let analysisMatchedNodes: string[] = [];
          if (diagnostic.customRequirements && diagnostic.customRequirements.trim()) {
            const analysis = analyzeRequirements(diagnostic.customRequirements);
            setDiagnosticKeywords(analysis.keywords);
            setDiagnosticMatchedTopics(analysis.matchedTopics);
            setDiagnosticMatchedNodes(analysis.matchedNodes);
            analysisMatchedNodes = analysis.matchedNodes;
          } else {
            setDiagnosticKeywords([]);
            setDiagnosticMatchedTopics([]);
            setDiagnosticMatchedNodes([]);
            analysisMatchedNodes = [];
          }
          
          // 收集所有需要高亮的节点
          const allNodeIds = new Set<string>();
          
          // 1. 添加身份相关的节点
          (diagnostic.roles || []).forEach((role: string) => {
            const nodeIds = roleNodeMap[role] || [];
            nodeIds.forEach(id => allNodeIds.add(id));
          });
          
          // 2. 添加学习主题相关的节点
          const effectiveTopicMap = Object.keys(topicNodeMap).length > 0 ? topicNodeMap : getTopicNodeMap();
          (diagnostic.topics || []).forEach((topic: string) => {
            const nodeId = effectiveTopicMap[topic];
            if (nodeId) allNodeIds.add(nodeId);
          });
          
          // 3. 添加学习需求匹配到的节点
          analysisMatchedNodes.forEach(id => allNodeIds.add(id));
          
          setHighlightedNodes(Array.from(allNodeIds));
          
          const locked = getDifficultyLockedNodeIds(path.rootNode, diagnostic.difficulty || 'beginner');
          setDifficultyLockedNodes(locked);
          setHasCompletedDiagnostic(true);
          setCurrentView('mindmap');
        } else {
          // 如果没有模块，清除旧数据，让用户重新诊断
          console.log('[诊断] 旧数据没有知识模块，将清除并重新开始');
          localStorage.removeItem('user_diagnostic');
          setSavedDiagnostic(null);
        }
      } catch {
        localStorage.removeItem('user_diagnostic');
        setSavedDiagnostic(null);
      }
    }
  }, [graphLoaded, savedDiagnostic]);

  useEffect(() => {
    const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setWelcomeMessage(randomMsg);
    setShowWelcome(false);
    setTypewriterText('');

    const timer = setTimeout(() => {
      setShowWelcome(true);
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

  const saveDiagnostic = async (path: LearningPath, roles: string[], topics: string[], difficulty: string, customRequirements: string) => {
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
          custom_requirements: customRequirements || '',
          completed: true,
        }),
      });

      if (!response.ok) {
        console.warn('诊断结果数据库保存失败，已使用 localStorage 备份');
      } else {
        console.log('诊断结果已保存到数据库');
      }
    } catch (err) {
      console.warn('诊断结果保存网络异常，已使用 localStorage 备份');
    }
  };

  const handlePathGenerated = async (roles: string[], topics: string[], difficulty: string, customRequirements: string) => {
    setDiagnosticRoles(roles);
    setDiagnosticTopics(topics);
    setDiagnosticLevel(difficulty);
    setDiagnosticRequirements(customRequirements || '');

    let analysisMatchedNodes: string[] = [];
    // 分析自定义需求中的关键词
    if (customRequirements && customRequirements.trim()) {
      const analysis = analyzeRequirements(customRequirements);
      setDiagnosticKeywords(analysis.keywords);
      setDiagnosticMatchedTopics(analysis.matchedTopics);
      setDiagnosticMatchedNodes(analysis.matchedNodes);
      analysisMatchedNodes = analysis.matchedNodes;
    } else {
      setDiagnosticKeywords([]);
      setDiagnosticMatchedTopics([]);
      setDiagnosticMatchedNodes([]);
      analysisMatchedNodes = [];
    }

    console.log('🚀 [诊断] 开始生成学习路径...');
    console.log('🚀 [诊断] 调用fetchKnowledgeBaseCourses之前, knowledgeBaseGraph:', knowledgeBaseGraph ? '已加载' : '❌ 为空');
    
    await fetchKnowledgeBaseCourses();
    initTopicNodeMap();
    
    console.log('🚀 [诊断] 调用fetchKnowledgeBaseCourses之后, knowledgeBaseGraph:', knowledgeBaseGraph ? '✅ 已加载' : '❌ 仍为空');
    console.log('🚀 [诊断] getDynamicKnowledgeGraph():', getDynamicKnowledgeGraph() ? '✅ 有数据' : '❌ 为空');
    console.log('🚀 [诊断] partyKnowledgeGraph:', partyKnowledgeGraph ? '✅ 有数据' : '❌ 为空');

    const path = generateLearningPath({
      roles,
      topics,
      level: difficulty,
      customRequirements: customRequirements || undefined,
    });

    setGeneratedPath(path);

    // 收集所有需要高亮的节点：
    // 1. 身份相关的节点
    // 2. 学习主题相关的节点
    // 3. 学习需求匹配到的节点
    const allNodeIds = new Set<string>();
    
    // 1. 添加身份相关的节点
    roles.forEach(role => {
      const nodeIds = roleNodeMap[role] || [];
      nodeIds.forEach(id => allNodeIds.add(id));
    });
    
    // 2. 添加学习主题相关的节点
    const effectiveTopicMap = Object.keys(topicNodeMap).length > 0 ? topicNodeMap : getTopicNodeMap();
    topics.forEach(topic => {
      const nodeId = effectiveTopicMap[topic];
      if (nodeId) allNodeIds.add(nodeId);
    });
    
    // 3. 添加学习需求匹配到的节点
    analysisMatchedNodes.forEach(id => allNodeIds.add(id));
    
    // ===== 测试代码：验证一级域节点是否显示所有子节点 =====
    // 当学习需求包含"政治素养全面"时，添加一级域节点'political-literacy'
    if (customRequirements && customRequirements.includes('政治素养全面')) {
      console.log('🧪 [测试模式] 检测到"政治素养全面"，添加一级域节点: political-literacy');
      allNodeIds.add('political-literacy');  // 一级域节点ID
      console.log('🧪 [测试] 当前highlightedNodes:', Array.from(allNodeIds));
    }
    // =========================================================
    
    setHighlightedNodes(Array.from(allNodeIds));

    const locked = getDifficultyLockedNodeIds(path.rootNode, difficulty);
    setDifficultyLockedNodes(locked);

    setHasCompletedDiagnostic(true);

    localStorage.setItem('user_diagnostic', JSON.stringify({
      roles,
      topics,
      difficulty,
      pathId: path.id,
      customRequirements,
    }));

    saveDiagnostic(path, roles, topics, difficulty, customRequirements);

    setCurrentView('mindmap');
  };

  const handleResetDiagnostic = () => {
    setHasCompletedDiagnostic(false);
    setGeneratedPath(null);
    setHighlightedNodes([]);
    setDiagnosticRoles([]);
    setDiagnosticTopics([]);
    setDiagnosticLevel('');
    setDiagnosticRequirements('');
    setDiagnosticKeywords([]);
    setDiagnosticMatchedTopics([]);
    setDiagnosticMatchedNodes([]);
    setDifficultyLockedNodes(new Set());
    setSavedDiagnostic(null);
    setCurrentView('home');
    localStorage.removeItem('user_diagnostic');
  };

  const handleIntentDetected = (keywords: string[], pathId: string) => {
    if (pathId) {
      setHighlightedNodes(prev => [...new Set([...prev, pathId])]);
    }
    setCurrentView('mindmap');
  };

  const handleStartQuiz = () => {
    if (!generatedPath || highlightedNodes.length === 0) return;

    const config = generateConfigFromLearningPath(
      generatedPath.id,
      highlightedNodes.slice(0, 8), // 取前8个高亮节点
      diagnosticLevel as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
      Math.min(5, highlightedNodes.length) // 生成5道题或更少
    );

    const effectiveGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
    const quizSet = generateQuizSet(config, effectiveGraph);

    setCurrentQuizSet(quizSet);
    setCurrentView('quiz');

    console.log('[题目考核] 已生成考核题目:', {
      题目数量: quizSet.questions.length,
      总分: quizSet.totalScore,
      基于节点: config.nodeIds.length,
      难度: config.difficulty
    });
  };

  const handleQuizComplete = (answers: any[]) => {
    console.log('[题目考核] 用户完成答题:', answers.length, '道题');
    
    localStorage.setItem('quiz_results', JSON.stringify({
      answers,
      completedAt: new Date().toISOString(),
      quizId: currentQuizSet?.id
    }));
  };

  const handleExitQuiz = () => {
    setCurrentView('mindmap');
    setCurrentQuizSet(null);
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const totalNodes = getAllNodeIds(partyKnowledgeGraph).length;
  const progressPercent = Math.round((completedCount / totalNodes) * 100);

  return (

    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <main className="w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="relative overflow-hidden rounded-3xl" style={{ backgroundImage: 'url(/welcome-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="relative z-10 max-w-5xl mx-auto text-center py-12 px-6">
                  <motion.h2
                    className="text-3xl md:text-4xl font-bold text-white mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    精英在线学习智能体
                  </motion.h2>

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
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 1 ? null : 1)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/80 via-red-500/70 to-orange-500/70 backdrop-blur-sm border border-white/30 p-6 text-left hover:border-red-300/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Eye className="w-6 h-6 text-red-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-red-300/80 tracking-wider">智能体 01</span>
                            <h4 className="text-2xl font-bold text-white">AI个性化推荐</h4>
                          </div>
                        </div>
                        <p className="text-base text-white/75 leading-relaxed">
                          实时追踪学习进度，深度捕捉交互反馈与行为习惯。AI 精准解读每位学员的偏好与短板，毫秒级推送专属学习内容——<span className="text-red-300 font-medium">比您更懂您的学习需求</span>
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 2 ? null : 2)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-cyan-500/70 backdrop-blur-sm border border-white/30 p-6 text-left hover:border-blue-300/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <PenTool className="w-6 h-6 text-blue-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-blue-300/80 tracking-wider">智能体 02</span>
                            <h4 className="text-2xl font-bold text-white">AI生成课程</h4>
                          </div>
                        </div>
                        <p className="text-base text-white/75 leading-relaxed">
                          汇聚全网权威内容与历史学习数据，AI 深度解析课程内核，智能重组知识体系。<span className="text-blue-300 font-medium">唤醒沉睡的资料，让每一份旧识重新迸发生命力</span>
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      onClick={() => setActiveAgent(activeAgent === 3 ? null : 3)}
                      className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/80 via-emerald-500/70 to-green-500/70 backdrop-blur-sm border border-white/30 p-6 text-left hover:border-emerald-300/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-6 h-6 text-emerald-300 group-hover:text-white transition-colors duration-300" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-emerald-300/80 tracking-wider">智能体 03</span>
                            <h4 className="text-2xl font-bold text-white">AI智能组班</h4>
                          </div>
                        </div>
                        <p className="text-base text-white/75 leading-relaxed">
                          统计学情数据，智能匹配教学资源，精准推荐适配课堂。<span className="text-emerald-300 font-medium">不落下每一位学员的进度，不辜负每一位老师的付出——让优质教育资源的分配，从此清晰可见</span>
                        </p>
                      </div>
                    </motion.div>
                  </div>

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
                                  {activeAgent === 1 ? 'AI个性化推荐' :
                                   activeAgent === 2 ? 'AI生成课程' :
                                   'AI智能组班'}
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
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/25 border border-white/30 hover:bg-white/35 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[20px] font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>STEP {item.step}</span>
                                <span className="text-base font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.title}</span>
                                <span className="text-sm text-white/90 text-center" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.desc}</span>
                              </div>
                            ))}

                            {activeAgent === 2 && [
                              { step: 1, icon: FileText, title: '输入课程主题', desc: 'AI自动设计课程结构，生成章节内容，匹配学习目标' },
                              { step: 2, icon: Sparkles, title: '个性化生成逻辑', desc: '身份匹配 · 主题关联 · 难度适配 · 综合推荐' },
                              { step: 3, icon: Network, title: '知识库整合', desc: '知识检索、内容筛选、审核复查，确保内容质量' },
                              { step: 4, icon: Sparkles, title: '视频图片生成', desc: '自动AI生成配图和教学视频' },
                            ].map((item) => (
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/25 border border-white/30 hover:bg-white/35 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[20px] font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>STEP {item.step}</span>
                                <span className="text-base font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.title}</span>
                                <span className="text-sm text-white/90 text-center" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.desc}</span>
                              </div>
                            ))}

                            {activeAgent === 3 && [
                              { step: 1, icon: FileText, title: '输入开班需求', desc: 'AI自动解析培训目标与参训范围' },
                              { step: 2, icon: Search, title: '全景扫描学员库', desc: '核查培训记录，识别应培未培与避让人员' },
                              { step: 3, icon: Sparkles, title: '智能匹配推荐', desc: '多维数据模型生成最优推荐名单与课程方案' },
                              { step: 4, icon: CheckCircle2, title: '一键生成班级', desc: '确认方案，自动发送通知，全程数字化管理' },
                            ].map((item) => (
                              <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/25 border border-white/30 hover:bg-white/35 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[20px] font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>STEP {item.step}</span>
                                <span className="text-base font-bold text-white" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.title}</span>
                                <span className="text-sm text-white/90 text-center" style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>{item.desc}</span>
                              </div>
                            ))}
                          </div>

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

          {currentView === 'mindmap' && (
            <motion.div
              key="mindmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="flex items-center justify-between mb-4">
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
                      诊断报告
                    </h2>
                    {generatedPath && (
                      <p className="text-slate-500 text-sm">
                        共 {generatedPath.totalDuration} 分钟 · {generatedPath.rootNode.children?.length || 0} 个知识模块
                      </p>
                    )}
                  </div>
                </div>
                
                {highlightedNodes.length > 0 && (
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 shadow-lg"
                  >
                    <Target className="w-4 h-4" />
                    开始AI智能考核
                    <Badge className="ml-1 bg-white/20 text-white border-0">
                      {Math.min(5, highlightedNodes.length)}题
                    </Badge>
                  </Button>
                )}
              </div>

              <div className="flex gap-4" style={{ height: 'calc(100vh - 220px)' }}>
                <div className="w-[400px] shrink-0 flex flex-col gap-4 overflow-y-auto">
                  {generatedPath && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="border-0 shadow-xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(234, 88, 12, 0.9) 100%)' }}>
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
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-1">诊断完成！</h3>
                              <p className="text-white/90 text-sm mb-3">
                                亲爱的{currentUser?.display_name || '同学'}，基于您的选择，我们为您定制了专属学习路径。
                              </p>
                              <div className="space-y-1 text-sm text-white/80">
                                <p><span className="font-medium">推荐学习时长：</span>{generatedPath.totalDuration} 分钟</p>
                                <p><span className="font-medium">核心知识点：</span>{generatedPath.rootNode.children?.length || 0} 个主题模块</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <Card className="border-0 shadow-lg flex-1">
                    <CardContent className="p-5">
                      <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-600" />
                        选择记录
                      </h4>

                      {/* 学习深度 */}
                      {diagnosticLevel && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-red-500" />
                            学习深度
                          </h5>
                          <Badge className={
                            diagnosticLevel === 'beginner' ? 'bg-green-500' :
                            diagnosticLevel === 'intermediate' ? 'bg-amber-500' : 'bg-red-500'
                          }>
                            {diagnosticLevel === 'beginner' ? '入门级（基础内容）' :
                             diagnosticLevel === 'intermediate' ? '进阶级（进阶内容）' :
                             '深入级（全部内容）'}
                          </Badge>
                        </div>
                      )}

                      {/* 已选身份 */}
                      {diagnosticRoles.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2">已选身份</h5>
                          <div className="flex flex-wrap gap-2">
                            {diagnosticRoles.map(role => {
                              const nodeIds = roleNodeMap[role] || [];
                              const effectiveGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
                              return (
                                <div key={role} className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-red-50/60 rounded-lg border border-red-100 w-full">
                                  <Badge className="bg-red-500 hover:bg-red-600 text-white shrink-0">{role}</Badge>
                                  {nodeIds.length > 0 ? nodeIds.map(nodeId => {
                                    const node = getNodeById(nodeId, effectiveGraph);
                                    if (!node) return null;
                                    return (
                                      <Badge key={nodeId} variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">
                                        {node.name}
                                      </Badge>
                                    );
                                  }) : (
                                    <span className="text-xs text-slate-400">匹配全貌图谱中...</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 已选学习主题 */}
                      {diagnosticTopics.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2">已选学习主题</h5>
                          <div className="flex flex-wrap gap-2">
                            {diagnosticTopics.map(topic => {
                              const effectiveTopicMap = Object.keys(topicNodeMap).length > 0 ? topicNodeMap : getTopicNodeMap();
                              const nodeId = effectiveTopicMap[topic];
                              const effectiveGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
                              const node = nodeId ? getNodeById(nodeId, effectiveGraph) : null;
                              return (
                                <div key={topic} className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-blue-50/60 rounded-lg border border-blue-100 w-full">
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-white shrink-0">{topic}</Badge>
                                  {node ? (
                                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                                      {node.name}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-slate-400">全貌图谱匹配中...</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 您的具体学习需求 */}
                      {diagnosticRequirements && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-500" />
                            您的具体学习需求？
                          </h5>
                          <div className="text-sm text-slate-700 bg-amber-50/60 rounded-lg border border-amber-100 px-3 py-2">
                            {diagnosticRequirements}
                          </div>
                        </div>
                      )}

                      {/* 系统识别关键词和关联主题 */}
                      {diagnosticKeywords.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            系统识别到以下关键词和关联主题
                          </h5>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs text-slate-500 self-center">关键词：</span>
                              {diagnosticKeywords.map(kw => (
                                <Badge key={kw} variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                            {diagnosticMatchedTopics.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-xs text-slate-500 self-center">关联主题：</span>
                                {diagnosticMatchedTopics.map(t => (
                                  <Badge key={t} variant="outline" className="text-xs border-indigo-200 text-indigo-700 bg-indigo-50">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {diagnosticMatchedNodes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-xs text-slate-500 self-center">关联节点：</span>
                                {diagnosticMatchedNodes.slice(0, 8).map(nid => {
                                  const effectiveGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
                                  const displayName = getNodeDisplayName(nid, effectiveGraph);
                                  return (
                                    <Badge key={nid} variant="outline" className="text-xs border-teal-200 text-teal-700 bg-teal-50">
                                      {displayName}
                                    </Badge>
                                  );
                                })}
                                {diagnosticMatchedNodes.length > 8 && (
                                  <span className="text-xs text-slate-400 self-center">+{diagnosticMatchedNodes.length - 8} 更多</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* 调试信息卡片 - 只显示最终去重后的节点 */}
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        最终显示节点（与右侧图谱对齐）
                      </h4>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-700 mb-2">高亮节点总数: {highlightedNodes.length} 个</p>
                        <div className="flex flex-wrap gap-1">
                          {highlightedNodes.map((nid, index) => {
                            const effectiveGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
                            const displayName = getNodeDisplayName(nid, effectiveGraph);
                            return (
                              <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                                {displayName}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">✅ 以上节点将在右侧图谱中高亮显示</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-xl overflow-hidden flex-1">
                  <MindMap
                    data={(() => {
                      const fullGraph = knowledgeBaseGraph || getDynamicKnowledgeGraph() || partyKnowledgeGraph;
                      
                      // 详细调试信息
                      console.log('=== 诊断报告图谱调试 ===');
                      console.log('[1] 高亮节点列表:', highlightedNodes);
                      
                      if (fullGraph) {
                        console.log('[2] 完整图谱一级节点:', fullGraph.children?.map(c => ({
                          id: c.id,
                          name: c.name,
                          childCount: c.children?.length || 0,
                          childrenIds: c.children?.map(cc => cc.id)
                        })));
                        
                        // 检查每个高亮节点是否在图谱中存在
                        const parentMap = getDynamicParentMap();
                        highlightedNodes.forEach(nodeId => {
                          const node = getNodeById(nodeId, fullGraph);
                          console.log(`[3] 节点 ${nodeId} 存在:`, !!node, node ? {
                            name: node.name,
                            level: node.level,
                            parentId: parentMap[nodeId] || '未知'
                          } : '❌ 不存在');
                        });
                      }
                      
                      const filtered = filterNodes(fullGraph, new Set(highlightedNodes));
                      
                      console.log('[4] 过滤后图谱:', filtered?.children?.map(c => ({
                        id: c.id,
                        name: c.name,
                        childCount: c.children?.length || 0,
                        children: c.children?.map(cc => ({ id: cc.id, name: cc.name }))
                      })));
                      
                      return filtered || fullGraph;
                    })()}
                    progress={progress}
                    highlightedNodes={highlightedNodes}
                    interactive={!hasCompletedDiagnostic}
                    lockedByDifficultyNodes={(() => {
                      // 获取所有高亮节点及其祖先节点的ID
                      const parentMap = getDynamicParentMap();
                      const excludedIds = new Set(highlightedNodes);
                      
                      // 添加所有高亮节点的父节点（递归到根）
                      highlightedNodes.forEach(nodeId => {
                        let currentId = parentMap[nodeId];
                        while (currentId && currentId !== 'root') {
                          excludedIds.add(currentId);
                          currentId = parentMap[currentId];
                        }
                      });
                      
                      // 从锁定列表中排除这些节点
                      return new Set(
                        Array.from(difficultyLockedNodes).filter(id => !excludedIds.has(id))
                      );
                    })()}
                  />
                </Card>
              </div>

              <Dialog open={showFullMap} onOpenChange={setShowFullMap}>
                <DialogTrigger asChild>
                  <button className="fixed bottom-6 right-6 z-20 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-lg transition-all duration-200">
                    <Eye className="w-4 h-4" />
                    查看全貌
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[96vw] max-w-[96vw] min-w-[1200px] max-h-[96vh] h-[96vh] p-0 gap-0 border-0 flex flex-col" showCloseButton={false}>
                  <DialogHeader className="px-4 pt-3 pb-2 border-b shrink-0">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <Network className="w-4 h-4 text-red-600" />
                        完整知识体系
                      </DialogTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowFullMap(false)} className="h-7 w-7">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="flex-1 w-full min-h-0">
                    <MindMap
                      data={knowledgeBaseGraph || partyKnowledgeGraph}
                      progress={progress}
                      highlightedNodes={[]}
                      interactive={false}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

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

          {currentView === 'quiz' && currentQuizSet && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <QuizComponent
                quizSet={currentQuizSet}
                onComplete={handleQuizComplete}
                onExit={handleExitQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>

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


    </div>
  );
}
