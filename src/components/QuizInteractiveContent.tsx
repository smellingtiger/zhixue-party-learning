'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, AlertTriangle, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  department: string;
  level: 'decision' | 'core' | 'collab';
  description: string;
}

interface Scenario {
  id: string;
  name: string;
  type: string;
  description: string;
  level: string;
  levelName: string;
  requiredRoles: string[];
  situation: string;
}

interface Option {
  id: string;
  text: string;
}

interface NextQuestion {
  questionText: string;
  options: Option[];
  correctAnswer: string;
}

const NPC_NAME = '通讯员小张';
const NPC_EMOTIONS = {
  panic: '😰',
  relief: '😌',
  happy: '😊',
  serious: '😤',
  worry: '😟',
  proud: '🥰',
} as const;
type NPCEmotion = keyof typeof NPC_EMOTIONS;

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const TOTAL_QUESTIONS = 6;

interface DisasterTheme {
  name: string;
  bgGradient: string;
  bgAccent: string;
  alarmColor: string;
  alarmGlow: string;
  alarmGradient: string;
  alarmTextShadow: string;
  icon: string;
  particleType: 'rain' | 'heavy-rain' | 'shake' | 'fire' | 'wind' | 'rock' | 'cold' | 'none';
  particleCount: number;
  cardBorder: string;
  progressGradient: string;
  buttonColor: string;
  buttonHover: string;
  correctColor: string;
  wrongColor: string;
}

function getDisasterTheme(type: string): DisasterTheme {
  const themes: Record<string, DisasterTheme> = {
    内涝: {
      name: '内涝', bgGradient: 'from-slate-950 via-blue-950 to-slate-900', bgAccent: 'rgba(30,64,175,0.15)',
      alarmColor: '#3b82f6', alarmGlow: 'rgba(59,130,246,0.7)', alarmGradient: 'radial-gradient(ellipse at center, rgba(59,130,246,0.6) 0%, rgba(37,99,235,0.85) 40%, rgba(29,78,216,0.95) 70%, rgba(0,0,0,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(59,130,246,0.8), 0 0 80px rgba(37,99,235,0.6)',
      icon: '🌧️', particleType: 'rain', particleCount: 25,
      cardBorder: 'border-blue-900/40', progressGradient: 'from-blue-500 to-cyan-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700', buttonHover: 'shadow-blue-900/40 hover:shadow-blue-800/60',
      correctColor: 'bg-green-950/40 border-green-700/50', wrongColor: 'bg-red-950/40 border-red-700/50'
    },
    洪水: {
      name: '洪水', bgGradient: 'from-slate-950 via-cyan-950 to-blue-950', bgAccent: 'rgba(8,145,178,0.12)',
      alarmColor: '#06b6d4', alarmGlow: 'rgba(6,182,212,0.7)', alarmGradient: 'radial-gradient(ellipse at center, rgba(6,182,212,0.65) 0%, rgba(8,145,178,0.88) 40%, rgba(14,116,144,0.95) 70%, rgba(0,0,0,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(6,182,212,0.8), 0 0 80px rgba(8,145,178,0.6)',
      icon: '🌊', particleType: 'heavy-rain', particleCount: 45,
      cardBorder: 'border-cyan-900/40', progressGradient: 'from-cyan-500 to-teal-500',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700', buttonHover: 'shadow-cyan-900/40 hover:shadow-cyan-800/60',
      correctColor: 'bg-emerald-950/40 border-emerald-700/50', wrongColor: 'bg-red-950/40 border-red-700/50'
    },
    暴雨: {
      name: '暴雨', bgGradient: 'from-gray-950 via-indigo-950 to-slate-900', bgAccent: 'rgba(79,70,229,0.12)',
      alarmColor: '#6366f1', alarmGlow: 'rgba(99,102,241,0.7)', alarmGradient: 'radial-gradient(ellipse at center, rgba(99,102,241,0.6) 0%, rgba(79,70,229,0.86) 40%, rgba(67,56,202,0.94) 70%, rgba(0,0,0,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(79,70,229,0.6)',
      icon: '⛈️', particleType: 'heavy-rain', particleCount: 60,
      cardBorder: 'border-indigo-900/40', progressGradient: 'from-indigo-500 to-violet-500',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700', buttonHover: 'shadow-indigo-900/40 hover:shadow-indigo-800/60',
      correctColor: 'bg-violet-950/40 border-violet-700/50', wrongColor: 'bg-red-950/40 border-red-700/50'
    },
    地震: {
      name: '地震', bgGradient: 'from-stone-950 via-red-950 to-stone-900', bgAccent: 'rgba(127,29,29,0.12)',
      alarmColor: '#ef4444', alarmGlow: 'rgba(239,68,68,0.75)', alarmGradient: 'radial-gradient(ellipse at center, rgba(220,38,38,0.65) 0%, rgba(185,28,28,0.87) 40%, rgba(153,27,27,0.96) 70%, rgba(0,0,0,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(239,68,68,0.85), 0 0 80px rgba(220,38,38,0.65), 0 0 120px rgba(185,28,28,0.4)',
      icon: '💥', particleType: 'shake', particleCount: 1,
      cardBorder: 'border-red-900/40', progressGradient: 'from-red-600 via-orange-500 to-yellow-500',
      buttonColor: 'bg-red-600 hover:bg-red-700', buttonHover: 'shadow-red-900/50 hover:shadow-red-800/70',
      correctColor: 'bg-green-950/40 border-green-600/50', wrongColor: 'bg-red-950/50 border-red-800/50'
    },
    台风: {
      name: '台风', bgGradient: 'from-emerald-950 via-slate-900 to-cyan-950', bgAccent: 'rgba(16,185,129,0.10)',
      alarmColor: '#10b981', alarmGlow: 'rgba(16,185,129,0.7)', alarmGradient: 'radial-gradient(ellipse at center, rgba(16,185,129,0.55) 0%, rgba(5,150,105,0.82) 40%, rgba(4,120,87,0.93) 70%, rgba(0,0,0,0.97) 100%)',
      alarmTextShadow: '0 0 40px rgba(16,185,129,0.8), 0 0 80px rgba(5,150,105,0.55)',
      icon: '🌀', particleType: 'wind', particleCount: 20,
      cardBorder: 'border-emerald-900/40', progressGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700', buttonHover: 'shadow-emerald-900/40 hover:shadow-emerald-800/60',
      correctColor: 'bg-teal-950/40 border-teal-700/50', wrongColor: 'bg-orange-950/40 border-orange-700/50'
    },
    火灾: {
      name: '火灾', bgGradient: 'from-red-950 via-orange-950 to-yellow-950', bgAccent: 'rgba(234,88,12,0.13)',
      alarmColor: '#f97316', alarmGlow: 'rgba(249,115,22,0.8)', alarmGradient: 'radial-gradient(ellipse at center, rgba(249,115,22,0.6) 0%, rgba(234,88,12,0.84) 40%, rgba(194,65,12,0.95) 70%, rgba(69,10,10,0.97) 100%)',
      alarmTextShadow: '0 0 40px rgba(249,115,22,0.9), 0 0 80px rgba(234,88,12,0.7), 0 0 120px rgba(194,65,12,0.4)',
      icon: '🔥', particleType: 'fire', particleCount: 18,
      cardBorder: 'border-orange-900/40', progressGradient: 'from-orange-500 via-red-500 to-yellow-500',
      buttonColor: 'bg-orange-600 hover:bg-orange-700', buttonHover: 'shadow-orange-900/50 hover:shadow-orange-800/70',
      correctColor: 'bg-lime-950/40 border-lime-700/50', wrongColor: 'bg-red-950/50 border-red-800/50'
    },
    滑坡: {
      name: '滑坡', bgGradient: 'from-stone-950 via-amber-950 to-zinc-900', bgAccent: 'rgba(146,64,14,0.11)',
      alarmColor: '#d97706', alarmGlow: 'rgba(217,119,6,0.72)', alarmGradient: 'radial-gradient(ellipse at center, rgba(217,119,6,0.55) 0%, rgba(180,83,9,0.82) 40%, rgba(146,64,14,0.94) 70%, rgba(0,0,0,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(217,119,6,0.8), 0 0 80px rgba(180,83,9,0.58)',
      icon: '🪨', particleType: 'rock', particleCount: 12,
      cardBorder: 'border-amber-900/40', progressGradient: 'from-amber-600 via-yellow-600 to-orange-500',
      buttonColor: 'bg-amber-600 hover:bg-amber-700', buttonHover: 'shadow-amber-900/40 hover:shadow-amber-800/60',
      correctColor: 'bg-yellow-950/40 border-yellow-700/50', wrongColor: 'bg-red-950/40 border-red-700/50'
    },
    寒潮: {
      name: '寒潮', bgGradient: 'from-slate-900 via-cyan-950 to-blue-950', bgAccent: 'rgba(100,180,220,0.12)',
      alarmColor: '#60a5fa', alarmGlow: 'rgba(96,165,250,0.7)', alarmGradient: 'radial-gradient(ellipse at center, rgba(96,165,250,0.5) 0%, rgba(59,130,246,0.75) 40%, rgba(37,99,235,0.92) 70%, rgba(15,23,42,0.98) 100%)',
      alarmTextShadow: '0 0 40px rgba(96,165,250,0.8), 0 0 80px rgba(59,130,246,0.6)',
      icon: '❄️', particleType: 'cold', particleCount: 20,
      cardBorder: 'border-cyan-800/40', progressGradient: 'from-cyan-400 to-blue-500',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700', buttonHover: 'shadow-cyan-900/40 hover:shadow-cyan-800/60',
      correctColor: 'bg-blue-950/40 border-cyan-600/50', wrongColor: 'bg-red-950/40 border-red-700/50'
    },
    森林火灾: {
      name: '森林火灾', bgGradient: 'from-red-950 via-orange-950 to-yellow-950', bgAccent: 'rgba(234,88,12,0.13)',
      alarmColor: '#f97316', alarmGlow: 'rgba(249,115,22,0.8)', alarmGradient: 'radial-gradient(ellipse at center, rgba(249,115,22,0.6) 0%, rgba(234,88,12,0.84) 40%, rgba(194,65,12,0.95) 70%, rgba(69,10,10,0.97) 100%)',
      alarmTextShadow: '0 0 40px rgba(249,115,22,0.9), 0 0 80px rgba(234,88,12,0.7), 0 0 120px rgba(194,65,12,0.4)',
      icon: '🔥', particleType: 'fire', particleCount: 18,
      cardBorder: 'border-orange-900/40', progressGradient: 'from-orange-500 via-red-500 to-yellow-500',
      buttonColor: 'bg-orange-600 hover:bg-orange-700', buttonHover: 'shadow-orange-900/50 hover:shadow-orange-800/70',
      correctColor: 'bg-lime-950/40 border-lime-700/50', wrongColor: 'bg-red-950/50 border-red-800/50'
    }
  };
  return themes[type] || themes['地震'];
}

interface AlarmLevelConfig {
  level: string;
  label: string;
  hasOverlay: boolean;
  overlayOpacity: number;
  hasShake: boolean;
  shakeIntensity: string | ((theme?: DisasterTheme) => string);
  hasFlash: boolean;
  flashSpeed: string;
  hasTopBanner: boolean;
  hasBottomBanner: boolean;
  bannerHeight: number;
  hasSirenIcon: boolean;
  sirenSize: number;
  sirenSpinSpeed: string;
  hasLevelText: boolean;
  levelTextSize: string;
  particleMultiplier: number;
}

function getAlarmLevelConfig(level: string): AlarmLevelConfig {
  const configs: Record<string, AlarmLevelConfig> = {
    IV: {
      level: 'IV', label: '蓝色预警',
      hasOverlay: true, overlayOpacity: 0.4,
      hasShake: false, shakeIntensity: '',
      hasFlash: false, flashSpeed: '',
      hasTopBanner: false, hasBottomBanner: false, bannerHeight: 0,
      hasSirenIcon: true, sirenSize: 80, sirenSpinSpeed: 'siren-spin 3s linear infinite',
      hasLevelText: true, levelTextSize: 'text-2xl md:text-3xl',
      particleMultiplier: 0.3
    },
    III: {
      level: 'III', label: '黄色预警',
      hasOverlay: true, overlayOpacity: 0.55,
      hasShake: false, shakeIntensity: '',
      hasFlash: false, flashSpeed: '',
      hasTopBanner: false, hasBottomBanner: true, bannerHeight: 48,
      hasSirenIcon: true, sirenSize: 100, sirenSpinSpeed: 'siren-spin 2s linear infinite',
      hasLevelText: true, levelTextSize: 'text-3xl md:text-4xl',
      particleMultiplier: 0.6
    },
    II: {
      level: 'II', label: '橙色预警',
      hasOverlay: true, overlayOpacity: 0.75,
      hasShake: true, shakeIntensity: 'alarm-shake 0.25s ease-in-out infinite',
      hasFlash: true, flashSpeed: 'alarm-pulse 1.5s ease-in-out infinite',
      hasTopBanner: true, hasBottomBanner: true, bannerHeight: 64,
      hasSirenIcon: true, sirenSize: 120, sirenSpinSpeed: 'siren-spin 1s linear infinite',
      hasLevelText: true, levelTextSize: 'text-4xl md:text-5xl',
      particleMultiplier: 0.85
    },
    I: {
      level: 'I', label: '红色预警',
      hasOverlay: true, overlayOpacity: 0.95,
      hasShake: true,
      shakeIntensity: (theme?: DisasterTheme) =>
        theme?.particleType === 'shake' ? 'city-shake 0.15s ease-in-out infinite' : 'alarm-shake 0.12s ease-in-out infinite',
      hasFlash: true, flashSpeed: 'alarm-pulse 0.25s ease-in-out infinite',
      hasTopBanner: true, hasBottomBanner: true, bannerHeight: 72,
      hasSirenIcon: true, sirenSize: 128, sirenSpinSpeed: 'siren-spin 0.6s linear infinite',
      hasLevelText: true, levelTextSize: 'text-5xl md:text-6xl',
      particleMultiplier: 1
    }
  };
  return configs[level] || configs['I'];
}

export default function QuizInteractiveContent({ disasterName }: { disasterName: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<'idle' | 'alarm' | 'npc_talk' | 'role_select' | 'role_intro' | 'question' | 'feedback' | 'alert_update' | 'complete' | 'error' | 'loading'>('idle');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [requiredRoles, setRequiredRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreloading, setIsPreloading] = useState(true);
  const [clickedRoleId, setClickedRoleId] = useState<string | null>(null);
  const preloadRef = useRef<{ scenario: Scenario | null; roles: Role[] }>({ scenario: null, roles: [] });

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);

  const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);
  const [feedbackExplanation, setFeedbackExplanation] = useState('');
  const [situationUpdate, setSituationUpdate] = useState('');
  const [nextQuestion, setNextQuestion] = useState<NextQuestion | null>(null);

  const [finalSummary, setFinalSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [npcEmotion, setNpcEmotion] = useState<NPCEmotion>('panic');
  const [dialogueLines, setDialogueLines] = useState<string[]>([]);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [showDialogueNext, setShowDialogueNext] = useState(false);
  const [alarmIntensity, setAlarmIntensity] = useState<'none'| 'full' | 'flash' | 'idle'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const gameStateRef = useRef({
    scenario: null as Scenario | null,
    roles: [] as Role[],
    role: null as Role | null,
    questionText: '',
    options: [] as Option[],
    correctAnswer: '',
    currentQuestion: 1,
    score: 0,
    situationUpdate: '',
    nextQuestion: null as NextQuestion | null,
    finalSummary: ''
  });

  useEffect(() => {
    return () => {
      if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [phase, dialogueIdx]);

  useEffect(() => {
    fetch('/api/training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'start', 
        disasterType: disasterName 
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.scenario) {
          preloadRef.current = { scenario: data.scenario, roles: data.requiredRoles || [] };
        }
        setIsPreloading(false);
      })
      .catch(() => setIsPreloading(false));
  }, [disasterName]);

  const advanceDialogue = () => {
    if (dialogueIdx < dialogueLines.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    } else {
      if (phase === 'npc_talk') {
        setPhase('role_select');
      } else if (phase === 'role_intro') {
        setPhase('question');
      } else if (phase === 'alert_update') {
        handleNextQuestion();
      }
    }
  };

  const handleStart = () => {
    const pre = preloadRef.current;
    if (!pre.scenario) {
      setErrorMessage('场景数据尚未加载完成，请稍候');
      setPhase('error');
      return;
    }
    gameStateRef.current.scenario = pre.scenario;
    gameStateRef.current.roles = pre.roles;
    setScenario(pre.scenario);
    setRequiredRoles(pre.roles);
    setErrorMessage('');
    setPhase('alarm');
    triggerAlarmSequence();
  };

  const triggerAlarmSequence = () => {
    const s = gameStateRef.current.scenario;
    if (!s) return;
    
    setAlarmIntensity('full');
    setNpcEmotion('panic');
    
    const lines = [
      `⚠️ 紧急情况！${s.type}！`,
      `${s.situation.substring(0, 60)}...`,
      `指挥中心已启动${s.levelName}响应，请立即选择您的岗位身份！`
    ];
    setDialogueLines(lines);
    setDialogueIdx(0);
    setShowDialogueNext(false);
    setPhase('alarm');
    
    let currentLine = 0;
    const autoPlayDialogue = () => {
      if (currentLine < lines.length) {
        setDialogueIdx(currentLine);
        currentLine++;
        alarmTimerRef.current = setTimeout(autoPlayDialogue, 1800);
      } else {
        setAlarmIntensity('idle');
        setPhase('role_select');
      }
    };
    
    alarmTimerRef.current = setTimeout(() => {
      setAlarmIntensity('flash');
      autoPlayDialogue();
    }, 1200);
  };

  const handleSelectRole = async (roleId: string) => {
    const s = gameStateRef.current.scenario;
    if (!s) return;
    setClickedRoleId(roleId);
    setLoading(true);
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select_role', scenarioId: s.id, selectedRoleId: roleId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '角色选择失败');

      const role = gameStateRef.current.roles.find(r => r.id === roleId);
      gameStateRef.current.role = role || null;
      gameStateRef.current.questionText = data.questionText;
      gameStateRef.current.options = data.options;
      gameStateRef.current.correctAnswer = data.correctAnswer;
      gameStateRef.current.currentQuestion = data.currentQuestion;
      gameStateRef.current.score = data.score;

      setSelectedRole(role || null);
      setQuestionText(data.questionText);
      setOptions(data.options);
      setCorrectAnswer(data.correctAnswer);
      setCurrentQuestion(data.currentQuestion);
      setScore(data.score);

      setNpcEmotion('serious');
      setPhase('question');
    } catch (error) {
      console.error('Failed to select role:', error);
      setClickedRoleId(null);
      setErrorMessage((error as Error).message || '角色选择失败');
      setPhase('error');
    }
    setLoading(false);
  };

  const startRoleIntro = (role: Role) => {
    setNpcEmotion('relief');
    const dept = role.department;
    const name = role.name;
    setDialogueLines([
      `${name}${dept}！太好了，终于等到您了！`,
      `现在情况非常紧急，您来坐镇指挥我们就放心了。`,
      `这是我们收到的第一份应急处置指令，您看看怎么决策？`
    ]);
    setDialogueIdx(0);
    setShowDialogueNext(true);
    setPhase('role_intro');
  };

  const handleSelectOption = async (optionId: string) => {
    const gs = gameStateRef.current;
    if (!gs.scenario || !gs.role || isSubmitting) return;
    setSelectedOption(optionId);
    setIsSubmitting(true);
    setLoading(true);

    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer', scenarioId: gs.scenario.id, selectedRoleId: gs.role.id,
          selectedOption: optionId, correctAnswer: gs.correctAnswer,
          questionIndex: gs.currentQuestion, score: gs.score
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');

      const role = gs.role;
      if (data.type === 'complete') {
        setFeedbackIsCorrect(data.isCorrect);
        setFeedbackExplanation(data.explanation);
        setFinalSummary(data.summary);
        gameStateRef.current.score = data.score;
        setScore(data.score);
        setNpcEmotion(data.score >= 4 ? 'proud' : data.score >= 3 ? 'serious' : 'worry');
        setDialogueLines([
          data.score >= 4 ? `${role.name}同志，您的表现太出色了！` :
          data.score >= 3 ? `${role.name}同志，表现还可以，但还有提升空间。` :
          `${role.name}同志，这次演练暴露了不少问题啊...`
        ]);
        setDialogueIdx(0);
        setShowDialogueNext(false);
        setPhase('complete');
      } else {
        setFeedbackIsCorrect(data.isCorrect);
        setFeedbackExplanation(data.explanation);
        const su = data.situationUpdate || '';
        setSituationUpdate(su);
        gameStateRef.current.situationUpdate = su;
        gameStateRef.current.nextQuestion = data.nextQuestion;
        setNextQuestion(data.nextQuestion);
        gameStateRef.current.score = data.score;
        setScore(data.score);
        setCurrentQuestion(data.currentQuestion);
        gameStateRef.current.currentQuestion = data.currentQuestion;
        setNpcEmotion(data.isCorrect ? 'happy' : 'worry');
        setPhase('feedback');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      setErrorMessage((error as Error).message || '提交失败');
      setPhase('error');
    }
    setIsSubmitting(false);
    setLoading(false);
  };

  const handleFeedbackNext = () => {
    if (gameStateRef.current.nextQuestion && gameStateRef.current.situationUpdate) {
      triggerAlertUpdate();
    } else if (gameStateRef.current.nextQuestion) {
      handleNextQuestion();
    }
  };

  const triggerAlertUpdate = () => {
    setAlarmIntensity('flash');
    setNpcEmotion('serious');
    const su = gameStateRef.current.situationUpdate;
    setDialogueLines([
      `📢 情况更新：${su ? su.substring(0, 40) + '...' : '情况发生变化'}`
    ]);
    setDialogueIdx(0);
    setShowDialogueNext(false);
    setPhase('alert_update');
    
    alarmTimerRef.current = setTimeout(() => {
      setAlarmIntensity('idle');
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    const nq = gameStateRef.current.nextQuestion;
    if (nq) {
      gameStateRef.current.questionText = nq.questionText;
      gameStateRef.current.options = nq.options;
      gameStateRef.current.correctAnswer = nq.correctAnswer;
      setQuestionText(nq.questionText);
      setOptions(nq.options);
      setCorrectAnswer(nq.correctAnswer);
      setSelectedOption(null);
      setFeedbackExplanation('');
      setSituationUpdate('');
      setNextQuestion(null);
      setNpcEmotion('serious');
      setPhase('question');
    }
  };

  const handleRestart = () => {
    setPhase('idle');
    setScenario(null); setRequiredRoles([]); setSelectedRole(null);
    setQuestionText(''); setOptions([]); setCorrectAnswer('');
    setSelectedOption(null); setCurrentQuestion(1); setScore(0);
    setFeedbackExplanation(''); setSituationUpdate(''); setNextQuestion(null);
    setFinalSummary(''); setErrorMessage('');
    setNpcEmotion('panic'); setDialogueLines([]); setDialogueIdx(0);
    setAlarmIntensity('idle');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'IV': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'III': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'II': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'I': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return '';
    }
  };

  const getRoleLevelBadge = (level: string) => {
    switch (level) {
      case 'decision': return <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/50">决策层</Badge>;
      case 'core': return <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50">核心执行层</Badge>;
      case 'collab': return <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/50">协作执行层</Badge>;
      default: return null;
    }
  };

  const isAlarming = alarmIntensity !== 'idle';
  const isNPCPhase = ['alarm', 'npc_talk', 'role_intro', 'alert_update'].includes(phase);
  const theme = scenario ? getDisasterTheme(scenario.type) : getDisasterTheme('地震');
  const alarmConfig = scenario ? getAlarmLevelConfig(scenario.level) : getAlarmLevelConfig('I');
  const showParticles = (phase !== 'idle' && phase !== 'error') || isAlarming;

  return (
    <>
      <style>{`
        @keyframes alarm-pulse {
          0%, 100% { opacity: 0.3; }
          10%, 90% { opacity: 1; }
          20%, 80% { opacity: 0.2; }
          30%, 70% { opacity: 0.9; }
          40%, 60% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes alarm-shake {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-6px); }
          20% { transform: translateX(6px); }
          30% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          50% { transform: translateX(-2px); }
          60% { transform: translateX(2px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        @keyframes alarm-scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes alarm-scroll-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes siren-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes npc-slide-in {
          0% { transform: translateX(120%); opacity: 0; }
          60% { transform: translateX(-5%); opacity: 1; }
          80% { transform: translateX(2%); }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes npc-bounce {
          0%, 100% { transform: translateY(0); }
          15% { transform: translateY(-8px); }
          30% { transform: translateY(0); }
          45% { transform: translateY(-4px); }
          60% { transform: translateY(0); }
        }
        @keyframes bubble-pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes alarm-light-flash {
          0%, 100% { box-shadow: 0 0 20px #ef4444, 0 0 60px #ef4444; }
          50% { box-shadow: 0 0 40px #ef4444, 0 0 100px #dc2626, 0 0 150px #b91c1c; }
        }
        @keyframes role-card-enter {
          0% { transform: translateY(30px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes alert-button-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(25deg); opacity: 0; }
        }
        @keyframes fire-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-80vh) scale(1.2); opacity: 0; }
        }
        @keyframes wind-blow {
          0% { transform: translateX(-30px) rotate(-20deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateX(100vw) rotate(30deg); opacity: 0; }
        }
        @keyframes rock-fall {
          0% { transform: translateY(-25px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.9; }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(30px) rotate(180deg); opacity: 0.6; }
          90% { opacity: 0.4; }
          100% { transform: translateY(105vh) translateX(-20px) rotate(360deg); opacity: 0; }
        }
        @keyframes city-shake {
          0%, 100% { transform: translateY(0) translateX(0); }
          5% { transform: translateY(-3px) translateX(2px); }
          10% { transform: translateY(4px) translateX(-3px); }
          15% { transform: translateY(-5px) translateX(4px); }
          20% { transform: translateY(6px) translateX(-5px); }
          25% { transform: translateY(-4px) translateX(3px); }
          30% { transform: translateY(5px) translateX(-4px); }
          35% { transform: translateY(-3px) translateX(2px); }
          40% { transform: translateY(4px) translateX(-3px); }
          45% { transform: translateY(-2px) translateX(1px); }
          50% { transform: translateY(3px) translateX(-2px); }
          55% { transform: translateY(-2px) translateX(1px); }
          60% { transform: translateY(2px) translateX(-1px); }
          65% { transform: translateY(-1px) translateX(1px); }
          70% { transform: translateY(1px) translateX(0); }
          75% { transform: translateY(-1px) translateX(0); }
          80% { transform: translateY(1px) translateX(0); }
          85%, 100% { transform: translateY(0) translateX(0); }
        }
        @keyframes crack-line-1 {
          0% { stroke-dashoffset: 400; opacity: 0; }
          5% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.9; }
        }
        @keyframes crack-line-2 {
          0% { stroke-dashoffset: 300; opacity: 0; }
          8% { opacity: 0.8; }
          100% { stroke-dashoffset: 0; opacity: 0.7; }
        }
        @keyframes crack-line-3 {
          0% { stroke-dashoffset: 250; opacity: 0; }
          12% { opacity: 0.6; }
          100% { stroke-dashoffset: 0; opacity: 0.5; }
        }
        @keyframes debris-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes flash-white {
          0%, 100% { background: transparent; }
          5%, 15%, 25% { background: rgba(255,255,255,0.08); }
          10%, 20%, 30% { background: rgba(255,255,255,0.02); }
        }
        @keyframes fire-flicker {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          25% { transform: scale(1.2); opacity: 0.9; }
          50% { transform: scale(0.9); opacity: 0.6; }
          75% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes fire-glow-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes fire-ground-flicker {
          0%, 100% { opacity: 0.4; height: 10px; }
          50% { opacity: 0.8; height: 14px; }
        }
        @keyframes ice-shimmer {
          0%, 100% { opacity: 0.75; filter: brightness(1); }
          33% { opacity: 0.9; filter: brightness(1.15); }
          66% { opacity: 0.8; filter: brightness(1.05); }
        }
        @keyframes ice-crystal-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ice-drip {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50% { opacity: 0.9; transform: scaleY(1.05); }
        }
      `}</style>

      <div ref={fullscreenRef} className={`w-full min-h-[600px] overflow-auto bg-gradient-to-br ${theme.bgGradient} text-white relative`}>
        {/* 全屏按钮 */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all"
          title={isFullscreen ? '退出全屏' : '进入全屏'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* 粒子特效层 */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-t-lg">
            {theme.particleType === 'rain' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`rain-${i}`} className="absolute text-blue-300/40 text-xs"
                style={{ left: `${(i * 37 + 13) % 100}%`, top: '-20px', animation: `rain-fall ${1.5 + (i % 3) * 0.6}s linear infinite`, animationDelay: `${(i * 0.15) % 3}s` }}
              >💧</span>
            ))}
            {theme.particleType === 'heavy-rain' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`hrain-${i}`} className="absolute text-cyan-200/50 text-sm"
                style={{ left: `${(i * 47 + 7) % 100}%`, top: '-30px', animation: `rain-fall ${0.8 + (i % 4) * 0.3}s linear infinite`, animationDelay: `${(i * 0.08) % 2}s` }}
              >💧</span>
            ))}
            {theme.particleType === 'fire' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`fire-${i}`} className="absolute text-orange-400/60 text-lg"
                style={{ left: `${(i * 53 + 17) % 100}%`, bottom: '-20px', animation: `fire-rise ${1.2 + (i % 3) * 0.5}s ease-out infinite`, animationDelay: `${(i * 0.18) % 2}s` }}
              >🔥</span>
            ))}
            {theme.particleType === 'wind' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`wind-${i}`} className="absolute text-emerald-300/30 text-base"
                style={{ left: `-30px`, top: `${(i * 43 + 11) % 100}%`, animation: `wind-blow ${2 + (i % 3) * 0.8}s linear infinite`, animationDelay: `${(i * 0.22) % 3}s` }}
              >🍃</span>
            ))}
            {theme.particleType === 'rock' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`rock-${i}`} className="absolute text-amber-400/50 text-sm"
                style={{ right: `${(i * 41 + 9) % 80}%`, top: `-25px`, animation: `rock-fall ${1.8 + (i % 4) * 0.6}s ease-in infinite`, animationDelay: `${(i * 0.3) % 3}s` }}
              >🪨</span>
            ))}
            {theme.particleType === 'cold' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span key={`snow-${i}`} className="absolute text-white/60 text-lg"
                style={{ left: `${(i * 53 + 17) % 100}%`, top: '-20px', animation: `snow-fall ${3 + (i % 5) * 1.2}s linear infinite`, animationDelay: `${(i * 0.25) % 4}s` }}
              >❄</span>
            ))}
          </div>
        )}

        {/* 分级警报覆盖 */}
        {isAlarming && (
          <div className="absolute inset-0 z-[45] pointer-events-none rounded-t-lg"
            style={{
              animation: (() => {
                if (alarmIntensity === 'none') return 'none';
                const parts: string[] = [];
                if (alarmConfig.hasFlash && alarmIntensity === 'full') parts.push(alarmConfig.flashSpeed);
                else if (alarmConfig.hasFlash && alarmIntensity === 'flash') parts.push('alarm-pulse 1s ease-in-out 2');
                if (alarmConfig.hasShake) {
                  const shake = typeof alarmConfig.shakeIntensity === 'function'
                    ? alarmConfig.shakeIntensity(theme)
                    : alarmConfig.shakeIntensity;
                  if (shake) parts.push(shake);
                }
                return parts.length > 0 ? parts.join(', ') : 'none';
              })(),
              background: alarmConfig.hasOverlay
                ? theme.alarmGradient.replace(/[\d.]+\)$/, `${alarmConfig.overlayOpacity})`)
                : 'transparent',
              opacity: alarmConfig.hasOverlay ? 1 : 0,
            }}
          >
            {/* 警报灯 */}
            {alarmConfig.hasSirenIcon && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="rounded-full"
                    style={{
                      width: alarmConfig.sirenSize, height: alarmConfig.sirenSize,
                      backgroundColor: theme.alarmColor,
                      animation: 'alarm-light-flash 0.5s ease-in-out infinite',
                      opacity: alarmConfig.level === 'IV' ? 0.5 : alarmConfig.level === 'III' ? 0.7 : 1
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ animation: alarmConfig.sirenSpinSpeed }}>
                    <span style={{ fontSize: alarmConfig.sirenSize * 0.45 }}>{theme.icon}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 等级文字 */}
            {alarmConfig.hasLevelText && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
                <h1 className={`font-black tracking-widest ${alarmConfig.levelTextSize}`}
                  style={{ color: `${theme.alarmColor}DD`, textShadow: theme.alarmTextShadow, opacity: alarmConfig.level === 'IV' ? 0.7 : 1 }}
                >
                  {scenario?.levelName || '紧急响应'}
                </h1>
              </div>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4 md:p-6 relative z-10 pt-8" ref={contentRef}>
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">互动答题</h1>
            <p className="text-slate-500 text-sm">沉浸式训练 · 角色扮演 · 实战决策</p>
          </div>

          {/* 进度条 */}
          {(phase === 'question' || phase === 'feedback' || phase === 'alert_update' || (phase === 'role_intro' && dialogueIdx >= dialogueLines.length - 1)) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">进度：第 {currentQuestion}/{TOTAL_QUESTIONS} 题</span>
                <span className="text-xs text-yellow-500">得分：{score}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all duration-700`}
                  style={{ width: `${((currentQuestion - 1) / TOTAL_QUESTIONS) * 100}%` }} />
              </div>
            </div>
          )}

          {/* 开始界面 */}
          {phase === 'idle' && (
            <div className="bg-slate-900/70 border-2 border-slate-700/50 backdrop-blur-xl"
                 style={{
                   borderRadius: '0',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                 }}>
              <div className="p-8 md:p-12 text-center">
                <div className="mb-6">
                  <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-black mb-3 tracking-wider">应急指挥沉浸式模拟训练</h2>
                <p className="text-slate-400 mb-2 text-sm md:text-base font-medium">
                  系统将模拟真实应急场景，AI考官化身通讯员，<br className="hidden md:block" />
                  以第一人称剧情引导您完成应急决策训练
                </p>

                {isPreloading ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span className="text-blue-400 text-sm font-bold">正在预加载演练场景...</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-[3000ms] ease-linear"
                        style={{ width: isPreloading ? '100%' : '0%' }} />
                    </div>
                    <p className="text-slate-600 text-xs">场景数据加载完成后即可立即开始</p>
                  </div>
                ) : (
                  <Button onClick={handleStart}
                    className="mt-6 px-8 py-6 text-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 gap-2 font-black tracking-wider"
                    style={{ borderRadius: '0', boxShadow: '4px 4px 0 0 #000', animation: 'alert-button-pulse 2s ease-in-out infinite' }}
                  >
                    开始应急演练
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 错误界面 */}
          {phase === 'error' && (
            <div className="bg-slate-900/70 border-2 border-red-700/50 backdrop-blur-xl"
                 style={{
                   borderRadius: '0',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                 }}>
              <div className="p-8 md:p-12 text-center">
                <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl md:text-2xl font-black mb-3 tracking-wider">演练异常</h2>
                <p className="text-slate-400 mb-6 font-medium">{errorMessage}</p>
                <Button onClick={handleRestart}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 font-black tracking-wider"
                  style={{ borderRadius: '0' }}
                >
                  重新开始
                </Button>
              </div>
            </div>
          )}

          {/* NPC对话界面 */}
          {(phase === 'alarm' || phase === 'npc_talk' || phase === 'role_intro' || (phase === 'alert_update' && dialogueIdx >= dialogueLines.length - 1)) && (
            <div className="mt-2">
              {/* NPC头像和对话气泡 */}
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl shadow-lg"
                  style={{ animation: isNPCPhase ? 'npc-bounce 2s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined }}
                >
                  {NPC_EMOTIONS[npcEmotion]}
                </div>
                <div className="flex-1 max-w-[85%]" style={{ animation: 'bubble-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  <div className="bg-slate-800/90 backdrop-blur-sm border-2 border-slate-700 rounded-t-2xl rounded-br-2xl rounded-bl-md p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                      <span className="font-bold text-sm text-blue-400">{NPC_NAME}</span>
                      <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        应急通讯员
                      </Badge>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-sm md:text-base whitespace-pre-wrap min-h-[48px]">
                      {dialogueLines[dialogueIdx]}
                    </p>
                  </div>
                  {showDialogueNext && (
                    <button onClick={advanceDialogue}
                      className="mt-2 ml-auto block text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="text-xs">
                        {dialogueIdx < dialogueLines.length - 1 ? '点击继续...' : '▼'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 角色选择界面 */}
          {phase === 'role_select' && (
            <div className="mt-2">
              {!loading ? (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-slate-300 mb-1">请选择您的身份</h3>
                    <p className="text-slate-500 text-xs">点击角色卡牌确认您的身份</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requiredRoles.map((role, idx) => (
                      <button key={role.id} onClick={() => handleSelectRole(role.id)} disabled={loading}
                        className="w-full p-4 rounded-xl bg-slate-800/80 border-2 border-slate-700 hover:border-blue-500/60 hover:bg-slate-800 transition-all text-left disabled:opacity-50 group"
                        style={{ animation: `role-card-enter 0.4s ease-out ${idx * 0.1}s both` }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-sm">{role.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{role.name}</p>
                            <p className="text-slate-400 text-xs">{role.department}</p>
                          </div>
                          <div className="ml-auto">{getRoleLevelBadge(role.level)}</div>
                        </div>
                        <p className="text-slate-500 text-xs">{role.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  {(() => {
                    const role = requiredRoles.find(r => r.id === clickedRoleId);
                    return role ? (
                      <div className="w-full max-w-sm rounded-2xl border-2 p-6 mb-6"
                        style={{ animation: 'float-up 0.4s ease-out', borderColor: theme.alarmColor, backgroundColor: `${theme.alarmColor}15` }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0"
                            style={{ animation: 'siren-spin 2s linear infinite' }}
                          >
                            <span className="text-white font-bold text-lg">{role.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">{role.name}</p>
                            <p className="text-sm" style={{ color: theme.alarmColor }}>{role.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getRoleLevelBadge(role.level)}
                          <span className="text-slate-400 text-xs">身份已确认</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: theme.alarmColor }} />
                    <p className="text-slate-300 text-base font-medium">AI 考官正在出题中...</p>
                    <p className="text-slate-600 text-xs max-w-xs mx-auto">
                      正在根据{requiredRoles.find(r => r.id === clickedRoleId)?.department || '该角色'}的应急手册职责生成决策选择题
                    </p>
                    <div className="flex gap-1.5 justify-center pt-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: theme.alarmColor, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 答题界面 */}
          {phase === 'question' && selectedRole && (
            <div className="space-y-4 mt-2">
              {/* 题头标签条 */}
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-5 py-2.5 flex items-center justify-between"
                   style={{
                     borderRadius: '0',
                     boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)'
                   }}>
                <span className="text-yellow-400 font-black text-xs tracking-wider">
                  第 {currentQuestion}/{TOTAL_QUESTIONS} 题
                </span>
                <span className="text-gray-300 text-xs font-bold tracking-wide">{selectedRole.name} · {selectedRole.department}</span>
              </div>

              {/* 题目主体 — 深色毛玻璃卡片 */}
              <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 p-5 mt-px"
                   style={{
                     borderRadius: '0',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)'
                   }}>
                {/* 进度条 */}
                <div className="w-full bg-slate-800/60 h-2 mb-4 overflow-hidden" style={{ borderRadius: '0' }}>
                  <div
                    className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all duration-500 shadow-lg`}
                    style={{ width: `${(currentQuestion / TOTAL_QUESTIONS) * 100}%`, borderRadius: '0' }}
                  />
                </div>
                {/* 题目序号 + 文字 */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-none flex items-center justify-center font-black text-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white border-2 border-white/20"
                       style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    {currentQuestion}
                  </div>
                  <p className="text-white font-black text-base leading-relaxed tracking-wide pt-1">{questionText}</p>
                </div>
              </div>

              {/* 选项容器 — 深色半透明毛玻璃 */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/40 p-4 space-y-2.5 mt-px"
                   style={{
                     borderRadius: '0',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                   }}>
                {options.map((option, idx) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <button key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={isSubmitting || !!selectedOption}
                      className={`w-full p-4 text-left border-2 transition-all duration-200 flex items-center gap-4 group disabled:cursor-not-allowed ${
                        isSelected
                          ? `${theme.buttonColor} text-white border-transparent scale-[1.01] shadow-lg`
                          : 'border-slate-600/50 bg-slate-800/60 hover:border-slate-400 hover:bg-slate-800 hover:scale-[1.005]'
                      }`}
                      style={{ borderRadius: '0', boxShadow: isSelected ? `0 8px 24px ${theme.buttonHover}` : 'none' }}
                    >
                      <div className={`w-10 h-10 rounded-none flex items-center justify-center font-black text-sm shrink-0 border-2 transition-all ${
                        isSelected 
                          ? 'bg-white/20 border-white/40 scale-110' 
                          : 'border-slate-500/50 bg-slate-700/60 text-slate-400 group-hover:border-slate-300'
                      }`} style={{ borderRadius: '0' }}>
                        {isSelected ? '✓' : OPTION_LABELS[idx]}
                      </div>
                      <span className="text-sm md:text-base font-semibold leading-relaxed">{option.text}</span>
                    </button>
                  );
                })}

                {isSubmitting && (
                  <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-slate-800/60 border border-slate-700/50" style={{ borderRadius: '0' }}>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-slate-300 font-bold">AI正在评估答案...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 反馈界面 */}
          {phase === 'feedback' && (
            <div className="mt-2">
              {/* 反馈卡片 — 深色毛玻璃风格 */}
              <div className={`w-full max-w-lg border-2 mb-4 ${
                feedbackIsCorrect 
                  ? 'border-green-600/60 bg-green-950/60 backdrop-blur-xl' 
                  : 'border-red-600/60 bg-red-950/60 backdrop-blur-xl'
              }`}
                   style={{
                     borderRadius: '0',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                   }}>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {feedbackIsCorrect ? (
                      <><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-green-400 font-black text-lg">回答正确！</span></>
                    ) : (
                      <><XCircle className="w-5 h-5 text-red-400" /><span className="text-red-400 font-black text-lg">回答有误</span></>
                    )}
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700/40 rounded-none p-3 mb-3"
                       style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">{feedbackExplanation}</p>
                  </div>
                  {situationUpdate && (
                    <div className="bg-amber-950/40 border border-amber-600/40 rounded-none p-3 mb-3"
                         style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)' }}>
                      <p className="text-amber-400 text-xs font-black mb-1 tracking-wider"> 最新情况</p>
                      <p className="text-amber-300 text-xs font-medium">{situationUpdate}</p>
                    </div>
                  )}
                  <Button onClick={handleFeedbackNext}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 font-black tracking-wider"
                    style={{ borderRadius: '0', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
                  >
                    {situationUpdate ? '查看新情况' : '继续下一题'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 完成界面 */}
          {phase === 'complete' && (
            <div className="flex flex-col items-center">
              <div className="relative mb-4" style={{ animation: 'npc-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-xl ${
                  score >= 4 ? 'bg-gradient-to-br from-green-900 to-green-950 border-green-600' :
                  score >= 3 ? 'bg-gradient-to-br from-yellow-900 to-yellow-950 border-yellow-600' :
                              'bg-gradient-to-br from-red-900 to-red-950 border-red-600'
                }`}>
                  <span className="text-4xl">{NPC_EMOTIONS[npcEmotion]}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-full px-2.5 py-0.5">
                  <span className="text-xs text-slate-300 whitespace-nowrap">{NPC_NAME}</span>
                </div>
              </div>
              <div className="w-full max-w-lg bg-slate-900/70 border-2 border-slate-700/50 backdrop-blur-xl mb-4"
                   style={{
                     borderRadius: '0',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                   }}>
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    score >= 4 ? 'bg-green-500/20' : score >= 3 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                  }`}>
                    <Trophy className={`w-8 h-8 ${
                      score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'
                    }`} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">演练结束</h2>
                  <div className="text-3xl font-bold mb-3">
                    <span className={score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}>
                      {score}
                    </span>
                    <span className="text-slate-600 text-xl">/{TOTAL_QUESTIONS}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    {score >= 6 ? '🎉 满分！应急预案掌握出色！' :
                     score >= 4 ? '👍 表现优秀，继续加油！' :
                     score >= 3 ? '📖 基本合格，还需磨练。' :
                     '📚 需要加强学习应急手册。'}
                  </p>
                  {finalSummary && (
                    <div className="bg-slate-800/80 rounded-lg p-3 mb-4 text-left text-xs text-slate-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {finalSummary}
                    </div>
                  )}
                  <Button onClick={handleRestart}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />重新训练
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 场景信息条 */}
          {scenario && ['question', 'feedback'].includes(phase) && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-xs text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  scenario.level === 'I' ? 'bg-red-500' : scenario.level === 'II' ? 'bg-orange-500' :
                  scenario.level === 'III' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                {scenario.type} · {scenario.levelName}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
