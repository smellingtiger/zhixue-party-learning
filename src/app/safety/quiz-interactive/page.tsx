'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, AlertTriangle, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';

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

function EmergencyTrainingContent() {
  const router = useRouter();
  const searchParams = require('next/navigation').useSearchParams();
  const selectedDisasterType = searchParams.get('disaster') || null;
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

  const contentRef = useRef<HTMLDivElement>(null);
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        disasterType: selectedDisasterType 
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
  }, [selectedDisasterType]);

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
        @keyframes crack-spread {
          0% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); filter: none; }
          10% { clip-path: polygon(0 0, 48% 2%, 52% 5%, 49% 8%, 51% 12%, 47% 15%, 53% 18%, 50% 22%, 100% 20%, 100% 35%, 45% 38%, 55% 42%, 48% 46%, 52% 50%, 46% 54%, 54% 58%, 49% 62%, 51% 66%, 100% 65%, 100% 80%, 44% 82%, 56% 86%, 49% 90%, 51% 95%, 100% 93%, 100% 100%, 0 100%); }
          30% { clip-path: polygon(0 0, 42% 1%, 58% 3%, 39% 6%, 61% 9%, 43% 13%, 57% 17%, 41% 21%, 59% 25%, 36% 28%, 64% 32%, 38% 36%, 62% 40%, 35% 44%, 65% 48%, 37% 52%, 63% 56%, 34% 60%, 66% 64%, 33% 68%, 67% 72%, 32% 76%, 68% 80%, 31% 84%, 69% 88%, 30% 92%, 70% 96%, 100% 94%, 100% 100%, 0 100%); filter: brightness(1.05) contrast(1.1); }
          50% { clip-path: polygon(0 0, 30% 2%, 70% 4%, 25% 7%, 75% 11%, 20% 14%, 80% 18%, 28% 22%, 72% 26%, 15% 30%, 85% 34%, 22% 38%, 78% 42%, 18% 46%, 82% 50%, 16% 54%, 84% 58%, 20% 62%, 80% 66%, 24% 70%, 76% 74%, 26% 78%, 74% 82%, 28% 86%, 72% 90%, 30% 94%, 70% 98%, 100% 96%, 100% 100%, 0 100%); filter: brightness(1.08) contrast(1.15) saturate(0.9); }
          80% { clip-path: polygon(0 0, 15% 1%, 85% 3%, 10% 6%, 90% 10%, 5% 14%, 95% 19%, 12% 23%, 88% 27%, 3% 31%, 97% 36%, 8% 40%, 92% 44%, 4% 48%, 96% 52%, 2% 56%, 98% 60%, 6% 64%, 94% 68%, 9% 72%, 91% 76%, 11% 80%, 89% 84%, 13% 88%, 87% 92%, 15% 96%, 85% 99%, 100% 97%, 100% 100%, 0 100%); filter: brightness(1.1) contrast(1.2) saturate(0.8); }
          100% { clip-path: polygon(0 0, 0 5%, 5% 3%, 95% 1%, 100% 4%, 100% 10%, 4% 12%, 96% 8%, 2% 16%, 98% 14%, 0 20%, 100% 18%, 3% 25%, 97% 23%, 1% 30%, 99% 28%, 0 35%, 100% 33%, 2% 40%, 98% 38%, 0 45%, 100% 43%, 1% 50%, 99% 48%, 0 55%, 100% 53%, 2% 60%, 98% 58%, 0 65%, 100% 63%, 3% 70%, 97% 68%, 0 75%, 100% 73%, 0 80%, 100% 78%, 0 85%, 100% 83%, 0 90%, 100% 88%, 0 95%, 100% 93%, 0 100%, 100% 97%, 100% 100%, 0 100%); filter: brightness(1.12) contrast(1.25) saturate(0.7); }
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

      <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} text-white relative overflow-hidden`}>
        {/* 返回导航按钮 */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            onClick={() => router.push('/safety')}
            variant="outline"
            className="bg-slate-800/80 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回安全培训
          </Button>
        </div>

        {/* ========== 粒子特效层 ========== */}
        {showParticles && (
          <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
            {theme.particleType === 'rain' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`rain-${i}`}
                className="absolute text-blue-300/40 text-xs"
                style={{
                  left: `${(i * 37 + 13) % 100}%`,
                  top: '-20px',
                  animation: `rain-fall ${1.5 + (i % 3) * 0.6}s linear infinite`,
                  animationDelay: `${(i * 0.15) % 3}s`
                }}
              >💧</span>
            ))}
            {theme.particleType === 'heavy-rain' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`hrain-${i}`}
                className="absolute text-cyan-200/50 text-sm"
                style={{
                  left: `${(i * 47 + 7) % 100}%`,
                  top: '-30px',
                  animation: `rain-fall ${0.8 + (i % 4) * 0.3}s linear infinite`,
                  animationDelay: `${(i * 0.08) % 2}s`
                }}
              >💧</span>
            ))}
            {theme.particleType === 'fire' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`fire-${i}`}
                className="absolute text-orange-400/60 text-lg"
                style={{
                  left: `${(i * 53 + 17) % 100}%`,
                  bottom: `-20px`,
                  animation: `fire-rise ${1.2 + (i % 3) * 0.5}s ease-out infinite`,
                  animationDelay: `${(i * 0.18) % 2}s`
                }}
              >🔥</span>
            ))}
            {theme.particleType === 'wind' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`wind-${i}`}
                className="absolute text-emerald-300/30 text-base"
                style={{
                  left: `-30px`,
                  top: `${(i * 43 + 11) % 100}%`,
                  animation: `wind-blow ${2 + (i % 3) * 0.8}s linear infinite`,
                  animationDelay: `${(i * 0.22) % 3}s`
                }}
              >🍃</span>
            ))}
            {theme.particleType === 'rock' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`rock-${i}`}
                className="absolute text-amber-400/50 text-sm"
                style={{
                  right: `${(i * 41 + 9) % 80}%`,
                  top: `-25px`,
                  animation: `rock-fall ${1.8 + (i % 4) * 0.6}s ease-in infinite`,
                  animationDelay: `${(i * 0.3) % 3}s`
                }}
              >🪨</span>
            ))}
            {theme.particleType === 'cold' && Array.from({ length: Math.ceil(theme.particleCount * alarmConfig.particleMultiplier) }).map((_, i) => (
              <span
                key={`snow-${i}`}
                className="absolute text-white/60 text-lg"
                style={{
                  left: `${(i * 53 + 17) % 100}%`,
                  top: '-20px',
                  animation: `snow-fall ${3 + (i % 5) * 1.2}s linear infinite`,
                  animationDelay: `${(i * 0.25) % 4}s`
                }}
              >❄</span>
            ))}
          </div>
        )}

        {/* ========== 森林火灾专属视觉：燃烧的树林 ========== */}
        {showParticles && theme.particleType === 'fire' && (
          <div className="fixed bottom-0 left-0 right-0 h-[35vh] pointer-events-none z-[9] overflow-hidden">
            <svg viewBox="0 0 1440 350" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="fireSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a0800" stopOpacity="0" />
                  <stop offset="60%" stopColor="#2d1000" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#4a1800" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="treeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a4a1a" />
                  <stop offset="100%" stopColor="#0d280d" />
                </linearGradient>
                <linearGradient id="fireGlow" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#ff4400" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#ff8800" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1440" height="350" fill="url(#fireSkyGrad)" />
              {/* 火光映照 */}
              <rect x="0" y="200" width="1440" height="150" fill="url(#fireGlow)" style={{ animation: 'fire-glow-pulse 1.5s ease-in-out infinite' }} />
              {/* 三角形抽象树木 - 多排 */}
              {[...Array(8)].map((_, row) => (
                <g key={`tree-row-${row}`} transform={`translate(0, ${row * 25})`}>
                  {[...Array(20)].map((_, col) => {
                    const x = col * 75 + (row % 2) * 37;
                    const height = 60 + Math.sin(col * 0.8 + row) * 20;
                    const baseY = 320 - row * 15;
                    const isBurning = (col + row * 3) % 5 === 0;
                    return (
                      <g key={`tree-${row}-${col}`}>
                        {/* 树干 */}
                        <rect
                          x={x + 12}
                          y={baseY - 10}
                          width="6"
                          height="15"
                          fill="#3d2817"
                        />
                        {/* 树冠（三角形堆叠） */}
                        <polygon
                          points={`${x},${baseY} ${x + 30},${baseY - height * 0.5} ${x + 60},${baseY}`}
                          fill="url(#treeGrad)"
                          opacity={0.85 + row * 0.02}
                        />
                        <polygon
                          points={`${x + 5},${baseY - height * 0.2} ${x + 30},${baseY - height * 0.75} ${x + 55},${baseY - height * 0.2}`}
                          fill="url(#treeGrad)"
                          opacity={0.9}
                        />
                        <polygon
                          points={`${x + 10},${baseY - height * 0.4} ${x + 30},${baseY - height} ${x + 50},${baseY - height * 0.4}`}
                          fill="#228b22"
                          opacity={0.92}
                        />
                        {/* 燃烧的树 */}
                        {isBurning && (
                          <>
                            <circle
                              cx={x + 30}
                              cy={baseY - height * 0.5}
                              r={8 + Math.random() * 6}
                              fill="#ff4400"
                              opacity={0.7}
                              style={{ animation: `fire-flicker ${0.8 + Math.random() * 0.6}s ease-in-out infinite` }}
                            />
                            <circle
                              cx={x + 28}
                              cy={baseY - height * 0.55}
                              r={5 + Math.random() * 4}
                              fill="#ff8800"
                              opacity={0.8}
                              style={{ animation: `fire-flicker ${0.6 + Math.random() * 0.4}s ease-in-out infinite reverse` }}
                            />
                            <circle
                              cx={x + 33}
                              cy={baseY - height * 0.45}
                              r={4 + Math.random() * 3}
                              fill="#ffcc00"
                              opacity={0.9}
                              style={{ animation: `fire-flicker ${0.5 + Math.random() * 0.3}s ease-in-out infinite` }}
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
              {/* 地面火焰线 */}
              <rect x="0" y="340" width="1440" height="10" fill="#ff4400" opacity="0.6" style={{ animation: 'fire-ground-flicker 0.3s ease-in-out infinite' }} />
            </svg>
          </div>
        )}

        {/* ========== 寒潮专属视觉：冰封大地 ========== */}
        {showParticles && (theme.particleType === 'cold') && (
          <div className="fixed inset-0 pointer-events-none z-[9] overflow-hidden">
            {/* 冰霜覆盖效果 */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(180,220,255,0.06) 60%, rgba(160,200,240,0.12) 100%)',
            }} />
            
            {/* 霜花纹理叠加 */}
            <div className="absolute inset-0 opacity-[0.15]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z' fill='none' stroke='%23a0d8f0' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23c0e8ff' stroke-width='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px',
            }} />

            {/* 大冰块装饰 - 更逼真的冰块形状 */}
            <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="iceMain" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="20%" stopColor="#d4eeff" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#a8d8f0" stopOpacity="0.7" />
                  <stop offset="80%" stopColor="#7cc4e8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#50a8e0" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="iceFace1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b8e0f8" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="iceFace2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e0f0ff" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#90c8e8" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="iceFace3" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#c8e8ff" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#68b0d8" stopOpacity="0.35" />
                </linearGradient>
                <filter id="iceGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="iceEdge">
                  <feMorphology operator="dilate" radius="1" result="dilated" />
                  <feFlood floodColor="#e0f4ff" floodOpacity="0.6" result="glow" />
                  <feComposite in="glow" in2="dilated" operator="in" />
                </filter>
              </defs>

              {/* 左下角大冰块 - 立方体造型 */}
              <g transform="translate(40, 620)" filter="url(#iceGlow)" style={{ animation: 'ice-shimmer 4s ease-in-out infinite' }}>
                {/* 冰块主体 - 类似立方体透视 */}
                <polygon points="45,10 120,35 120,110 45,140" fill="url(#iceMain)" stroke="#c0e8ff" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="120,35 165,55 165,130 120,110" fill="url(#iceFace1)" stroke="#a0d8f0" strokeWidth="1" strokeLinejoin="round" />
                <polygon points="45,140 120,110 165,130 90,155" fill="url(#iceFace2)" stroke="#88c8e8" strokeWidth="1" strokeLinejoin="round" />
                {/* 顶面 */}
                <polygon points="45,10 120,35 165,55 90,30" fill="url(#iceFace3)" stroke="#b0d8f0" strokeWidth="1.2" strokeLinejoin="round" />
                {/* 高光 */}
                <line x1="55" y1="25" x2="70" y2="18" stroke="#ffffff" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
                <line x1="52" y1="32" x2="62" y2="28" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                {/* 冰裂纹 */}
                <path d="M60,70 L85,85 M75,95 L100,105 M55,115 L80,125" stroke="#e0f4ff" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
                {/* 底部阴影 */}
                <ellipse cx="105" cy="158" rx="70" ry="12" fill="#000000" opacity="0.25" />
              </g>

              {/* 右下角大冰块 - 不规则多面体 */}
              <g transform="translate(1120, 580) scale(1.2)" filter="url(#iceGlow)" style={{ animation: 'ice-shimmer 3s ease-in-out infinite 0.5s' }}>
                <polygon points="30,20 100,5 130,40 115,120 40,135 10,90" fill="url(#iceMain)" stroke="#c0e8ff" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points="100,5 145,25 130,40" fill="url(#iceFace1)" stroke="#a0d8f0" strokeWidth="1" />
                <polygon points="130,40 145,25 150,100 115,120" fill="url(#iceFace2)" stroke="#88c8e8" strokeWidth="1" />
                <polygon points="40,135 115,120 90,155 20,148" fill="url(#iceFace3)" stroke="#98d0ec" strokeWidth="1" />
                {/* 内部反光面 */}
                <polygon points="45,50 85,35 100,60 70,75" fill="url(#iceFace1)" opacity="0.3" />
                <line x1="48" y1="38" x2="58" y2="33" stroke="#ffffff" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
                {/* 裂纹 */}
                <path d="M55,80 Q75,90 65,110" stroke="#e0f4ff" strokeWidth="0.8" opacity="0.35" fill="none" />
                <ellipse cx="82" cy="148" rx="55" ry="10" fill="#000000" opacity="0.22" />
              </g>

              {/* 中间偏右中等冰块 */}
              <g transform="translate(880, 700) scale(0.75)" filter="url(#iceGlow)" style={{ animation: 'ice-shimmer 3.5s ease-in-out infinite 1s' }}>
                <polygon points="35,15 90,0 120,30 105,100 35,110 5,70" fill="url(#iceMain)" stroke="#c0e8ff" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="90,0 130,18 120,30" fill="url(#iceFace1)" stroke="#a0d8f0" strokeWidth="0.8" />
                <polygon points="120,30 130,18 128,85 105,100" fill="url(#iceFace2)" stroke="#88c8e8" strokeWidth="0.8" />
                <line x1="42" y1="28" x2="52" y2="22" stroke="#ffffff" strokeWidth="1.5" opacity="0.65" strokeLinecap="round" />
                <ellipse cx="68" cy="118" rx="48" ry="8" fill="#000000" opacity="0.2" />
              </g>

              {/* 左侧小冰块 */}
              <g transform="translate(180, 740) scale(0.55)" filter="url(#iceGlow)" style={{ animation: 'ice-shimmer 2.8s ease-in-out infinite 0.3s' }}>
                <polygon points="30,12 75,0 100,25 88,80 28,92 5,58" fill="url(#iceMain)" stroke="#c0e8ff" strokeWidth="1" strokeLinejoin="round" />
                <polygon points="75,0 108,14 100,25" fill="url(#iceFace1)" stroke="#a0d8f0" strokeWidth="0.7" />
                <line x1="36" y1="22" x2="44" y2="17" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
                <ellipse cx="56" cy="99" rx="38" ry="6" fill="#000000" opacity="0.18" />
              </g>

              {/* 右侧小碎冰块 */}
              <g transform="translate(1020, 780) scale(0.4)" filter="url(#iceGlow)" style={{ animation: 'ice-shimmer 2.2s ease-in-out infinite 1.5s' }}>
                <polygon points="25,10 60,0 80,22 70,65 25,72 8,45" fill="url(#iceMain)" stroke="#c0e8f0" strokeWidth="0.8" />
                <ellipse cx="44" cy="78" rx="28" ry="5" fill="#000000" opacity="0.15" />
              </g>

              {/* 地面结冰层 */}
              <rect x="0" y="885" width="1440" height="15" fill="rgba(160,200,230,0.25)" />
              <rect x="0" y="888" width="1440" height="8" fill="rgba(180,220,245,0.35)" />
              <line x1="0" y1="892" x2="1440" y2="892" stroke="rgba(220,240,255,0.5)" strokeWidth="1.5" />
              
              {/* 冰凌（底部边缘） */}
              {Array.from({ length: 25 }).map((_, i) => {
                const x = i * 58 + (i % 2) * 20;
                const height = 15 + Math.sin(i * 1.2) * 12;
                const width = 6 + (i % 3) * 3;
                return (
                  <polygon key={`icicle-${i}`}
                    points={`${x},892 ${x + width/2},${892 + height} ${x + width},892`}
                    fill={`rgba(${180 + i % 40},${220 + i % 30},255,${0.4 + Math.random() * 0.3})`}
                    stroke="rgba(200,235,255,0.4)"
                    strokeWidth="0.5"
                    style={{ animation: `ice-drip ${3 + (i % 4)}s ease-in-out infinite ${i * 0.15}s` }}
                  />
                );
              })}

              {/* 冰晶雪花点缀 */}
              {[
                { x: 250, y: 180, size: 18 }, { x: 650, y: 120, size: 24 },
                { x: 1050, y: 200, size: 16 }, { x: 450, y: 350, size: 20 },
                { x: 850, y: 450, size: 15 }, { x: 150, y: 500, size: 17 },
                { x: 1250, y: 380, size: 26 }, { x: 550, y: 280, size: 14 }
              ].map((flake, i) => (
                <g key={`flake-${i}`} transform={`translate(${flake.x}, ${flake.y})`} style={{ animation: `ice-crystal-spin ${10 + i}s linear infinite` }}>
                  {/* 六角雪花 */}
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <g key={angle} transform={`rotate(${angle})`}>
                      <line x1="0" y1="0" x2="0" y2={-flake.size} stroke="rgba(200,235,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="0" y1={-flake.size * 0.4} x2={-flake.size * 0.15} y2={-flake.size * 0.55} stroke="rgba(200,235,255,0.35)" strokeWidth="0.8" />
                      <line x1="0" y1={-flake.size * 0.4} x2={flake.size * 0.15} y2={-flake.size * 0.55} stroke="rgba(200,235,255,0.35)" strokeWidth="0.8" />
                      <circle cx="0" cy={-flake.size * 0.7} r="2" fill="rgba(220,240,255,0.4)" />
                    </g>
                  ))}
                  <circle cx="0" cy="0" r="3" fill="rgba(230,245,255,0.5)" />
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* ========== 地震专属视觉特效 ========== */}
        {showParticles && theme.particleType === 'shake' && (
          <div className="fixed inset-0 pointer-events-none z-[8] overflow-hidden">
            {/* 屏幕碎裂闪白 */}
            <div
              className="absolute inset-0"
              style={{ animation: 'flash-white 3s ease-in-out infinite' }}
            />

            {/* 城市剪影背景（震动中） */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[45vh]"
              style={{ animation: 'city-shake 2.5s ease-in-out infinite' }}
            >
              <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="w-full h-full" style={{ filter: 'drop-shadow(0 -4px 6px rgba(0,0,0,0.5))' }}>
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a0a05" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2d1810" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="1440" height="400" fill="url(#skyGrad)" />
                {/* 远景建筑群 */}
                <path d="M50,380 L50,280 L70,270 L90,275 L110,260 L130,265 L150,250 L170,255 L190,240 L210,245 L230,235 L250,240 L270,225 L290,230 L310,215 L330,220 L350,205 L370,210 L390,195 L410,200 L430,185 L450,190 L470,175 L490,180 L510,165 L530,170 L550,155 L570,160 L590,145 L610,150 L630,135 L650,140 L670,125 L690,130 L710,115 L730,120 L750,105 L770,110 L790,100 L810,105 L830,95 L850,100 L870,90 L890,95 L910,85 L930,90 L950,80 L970,85 L990,75 L1010,80 L1030,70 L1050,75 L1070,65 L1090,70 L1110,60 L1130,65 L1150,55 L1170,60 L1190,55 L1210,58 L1230,53 L1250,56 L1270,51 L1290,54 L1310,49 L1330,52 L1350,47 L1370,50 L1390,48 L1410,46 L1430,44 L1430,380 Z" fill="#0a0503" opacity="0.9"/>
                {/* 中景建筑 */}
                <rect x="80" y="300" width="40" height="80" rx="2" fill="#150a04" />
                <rect x="82" y="305" width="10" height="12" fill="#ff440022" />
                <rect x="98" y="310" width="8" height="10" fill="#ff440018" />
                <rect x="140" y="280" width="55" height="100" rx="2" fill="#120803" />
                <polygon points="140,280 167,250 194,280" fill="#1a0c05" />
                <rect x="152" y="295" width="14" height="20" fill="#ff440025" />
                <rect x="172" y="302" width="12" height="16" fill="#ff440020" />
                <rect x="220" y="320" width="35" height="60" rx="2" fill="#100802" />
                <rect x="228" y="332" width="10" height="15" fill="#ff440015" />
                <rect x="280" y="290" width="65" height="90" rx="2" fill="#151008" />
                <rect x="288" y="305" width="16" height="24" fill="#ff440028" />
                <rect x="315" y="312" width="14" height="20" fill="#ff440022" />
                <rect x="360" y="310" width="50" height="70" rx="2" fill="#130b03" />
                <polygon points="360,310 385,280 410,310" fill="#1e1206" />
                <rect x="370" y="325" width="12" height="18" fill="#ff440020" />
                <rect x="392" y="332" width="10" height="14" fill="#ff440016" />
                <rect x="440" y="330" width="42" height="50" rx="2" fill="#110a02" />
                <rect x="500" y="295" width="72" height="85" rx="2" fill="#16100a" />
                <rect x="512" y="310" width="18" height="28" fill="#ff440030" />
                <rect x="542" y="318" width="16" height="24" fill="#ff440024" />
                <rect x="592" y="340" width="38" height="40" rx="2" fill="#0f0901" />
                <rect x="600" y="350" width="11" height="16" fill="#ff440012" />
                <rect x="655" y="305" width="62" height="75" rx="2" fill="#141006" />
                <rect x="668" y="318" width="15" height="24" fill="#ff440026" />
                <rect x="696" y="326" width="13" height="20" fill="#ff440020" />
                <rect x="738" y="325" width="55" height="55" rx="2" fill="#120c04" />
                <rect x="750" y="340" width="14" height="22" fill="#ff440022" />
                <rect x="778" y="346" width="12" height="17" fill="#ff440016" />
                <rect x="815" y="335" width="48" height="45" rx="2" fill="#100a02" />
                <rect x="882" y="308" width="68" height="72" rx="2" fill="#171108" />
                <rect x="894" y="322" width="16" height="26" fill="#ff440028" />
                <rect x="922" y="332" width="14" height="20" fill="#ff440022" />
                <rect x="968" y="345" width="36" height="35" rx="2" fill="#0e0901" />
                <rect x="1022" y="315" width="58" height="65" rx="2" fill="#151009" />
                <rect x="1034" y="328" width="15" height="23" fill="#ff440025" />
                <rect x="1062" y="336" width="13" height="18" fill="#ff440018" />
                <rect x="1105" y="338" width="44" height="42" rx="2" fill="#120c05" />
                <rect x="1165" y="302" width="64" height="78" rx="2" fill="#160f08" />
                <rect x="1178" y="318" width="16" height="26" fill="#ff440028" />
                <rect x="1206" y="328" width="14" height="21" fill="#ff440022" />
                <rect x="1248" y="335" width="48" height="45" rx="2" fill="#130b04" />
                <rect x="1320" y="318" width="56" height="62" rx="2" fill="#141008" />
                <rect x="1332" y="332" width="15" height="23" fill="#ff440026" />
                <rect x="1362" y="342" width="13" height="17" fill="#ff440018" />
                <rect x="1395" y="348" width="32" height="32" rx="1" fill="#0f0902" />
                {/* 地面 */}
                <rect x="0" y="380" width="1440" height="20" fill="#080402" />
                <line x1="0" y1="385" x2="1440" y2="385" stroke="#1a0c06" strokeWidth="2" />
              </svg>
            </div>

            {/* 裂纹 SVG 叠加 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" style={{ mixBlendMode: 'screen', opacity: 0.6 }}>
              {/* 主裂纹 */}
              <path
                d="M200,0 Q220,200 180,400 T250,700 T180,900 M500,0 Q480,150 520,350 T470,600 T530,900 M800,0 Q830,250 770,500 T820,800 T790,900 M1100,0 Q1070,180 1130,420 T1080,680 T1140,900 M1350,0 Q1380,220 1320,480 T1390,720 T1330,900"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="400"
                fill="none"
                style={{ animation: 'crack-line-1 2s ease-out forwards' }}
              />
              {/* 次裂纹 */}
              <path
                d="M350,0 Q330,180 370,360 T340,620 T380,900 M700,0 Q730,200 670,450 T720,700 T680,900 M950,0 Q920,170 980,390 T930,650 T990,900 M1250,0 Q1280,210 1220,460 T1270,710 T1230,900"
                stroke="#ffcccc"
                strokeWidth="1.5"
                strokeDasharray="300"
                fill="none"
                style={{ animation: 'crack-line-2 2.5s ease-out forwards' }}
              />
              {/* 细裂纹 */}
              <path
                d="M100,0 Q120,100 90,250 T130,500 T80,750 T110,900 M600,0 Q580,120 620,280 T570,520 T630,780 T590,900 M1000,0 Q1030,160 970,380 T1020,620 T980,850"
                stroke="#ffeeee"
                strokeWidth="1"
                strokeDasharray="250"
                fill="none"
                style={{ animation: 'crack-line-3 3s ease-out forwards' }}
              />
            </svg>

            {/* 飞溅碎片 */}
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={`debris-${i}`}
                className="absolute text-base"
                style={{
                  left: `${10 + (i * 113) % 85}%`,
                  top: '-5vh',
                  fontSize: `${12 + (i * 7) % 16}px`,
                  animation: `debris-fall ${1.5 + (i * 0.4) % 2}s ease-in ${(i * 0.3) % 2}s infinite`
                }}
              >
                {['🧱','🪨','💥','🧱','⚠️','🪨','💫','🔴'][i]}
              </span>
            ))}
          </div>
        )}

        {/* ========== 分级警报全屏覆盖（使用主题色+等级配置）========== */}
        {isAlarming && (
          <div
            className="fixed inset-0 z-[45] pointer-events-none"
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
            {/* 顶部滚动横幅（III级及以上） */}
            {alarmConfig.hasTopBanner && (
              <div className={`absolute top-0 left-0 right-0 flex items-center overflow-hidden border-b-2`}
                   style={{
                     height: alarmConfig.bannerHeight,
                     backgroundColor: `${theme.alarmColor}CC`,
                     borderColor: theme.alarmColor
                   }}>
                <div className="flex gap-8 animate-[alarm-scroll-left_6s_linear_infinite] whitespace-nowrap">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="font-black tracking-widest"
                          style={{ color: '#fff', textShadow: `0 0 10px ${theme.alarmGlow}`, fontSize: Math.max(16, alarmConfig.bannerHeight * 0.4) }}>
                      ⚠️ {theme.name}紧急情况 ⚠️
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 底部滚动横幅（III级及以上） */}
            {alarmConfig.hasBottomBanner && (
              <div className={`absolute bottom-0 left-0 right-0 flex items-center overflow-hidden border-t-2`}
                   style={{
                     height: alarmConfig.bannerHeight,
                     backgroundColor: `${theme.alarmColor}CC`,
                     borderColor: theme.alarmColor
                   }}>
                <div className="flex gap-8 animate-[alarm-scroll-right_5s_linear_infinite] whitespace-nowrap">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className="font-black tracking-widest"
                          style={{ color: '#fff', textShadow: `0 0 10px ${theme.alarmGlow}`, fontSize: Math.max(16, alarmConfig.bannerHeight * 0.4) }}>
                      ⚠️ EMERGENCY ALERT ⚠️
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 中央警报灯（所有等级） */}
            {alarmConfig.hasSirenIcon && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div
                    className="rounded-full"
                    style={{
                      width: alarmConfig.sirenSize, height: alarmConfig.sirenSize,
                      backgroundColor: theme.alarmColor,
                      animation: 'alarm-light-flash 0.5s ease-in-out infinite',
                      opacity: alarmConfig.level === 'IV' ? 0.5 : alarmConfig.level === 'III' ? 0.7 : 1
                    }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ animation: alarmConfig.sirenSpinSpeed }}
                  >
                    <span style={{ fontSize: alarmConfig.sirenSize * 0.45 }}>{theme.icon}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 等级文字（所有等级，大小随等级变化） */}
            {alarmConfig.hasLevelText && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
                <h1
                  className={`font-black tracking-widest ${alarmConfig.levelTextSize}`}
                  style={{
                    color: `${theme.alarmColor}DD`,
                    textShadow: theme.alarmTextShadow,
                    opacity: alarmConfig.level === 'IV' ? 0.7 : 1
                  }}
                >
                  {scenario?.levelName || '紧急响应'}
                </h1>
              </div>
            )}
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4 md:p-6 relative z-10 pt-16" ref={contentRef}>
          {/* ========== 标题 ========== */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">应急指挥演练培训系统</h1>
            <p className="text-slate-500 text-sm">沉浸式训练 · 角色扮演 · 实战决策</p>
          </div>

          {/* ========== 进度条 ========== */}
          {(phase === 'question' || phase === 'feedback' || phase === 'alert_update' || (phase === 'role_intro' && dialogueIdx >= dialogueLines.length - 1)) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">进度：第 {currentQuestion}/{TOTAL_QUESTIONS} 题</span>
                <span className="text-xs text-yellow-500">得分：{score}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all duration-700`}
                  style={{ width: `${((currentQuestion - 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ========== 开始界面 ========== */}
          {phase === 'idle' && (
            <Card className={`bg-slate-900/60 ${theme.cardBorder} backdrop-blur`}>
              <CardContent className="p-8 md:p-12 text-center">
                <div className="mb-6">
                  <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-3">应急指挥沉浸式模拟训练</h2>
                <p className="text-slate-400 mb-2 text-sm md:text-base">
                  系统将模拟真实应急场景，AI考官化身通讯员，<br className="hidden md:block" />
                  以第一人称剧情引导您完成应急决策训练
                </p>

                {isPreloading ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      <span className="text-blue-400 text-sm">正在预加载演练场景...</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-[3000ms] ease-linear"
                        style={{ width: isPreloading ? '100%' : '0%' }}
                      />
                    </div>
                    <p className="text-slate-600 text-xs">场景数据加载完成后即可立即开始</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 text-xs mb-6">
                      共 {TOTAL_QUESTIONS} 道选择题 · 实时互动反馈 · 沉浸式剧情体验
                    </p>
                    <Button
                  onClick={handleStart}
                  disabled={loading}
                  className={`${theme.buttonColor} text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg ${theme.buttonHover} transition-all`}
                >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                      🚨 启动模拟训练
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ========== 错误界面 ========== */}
          {phase === 'error' && (
            <Card className="bg-red-950/40 border-red-800">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-semibold mb-2 text-red-300">系统提示</h2>
                <p className="text-slate-300 mb-2">{errorMessage || '操作失败'}</p>
                <div className="flex gap-3 justify-center mt-4">
                  <Button onClick={handleStart} disabled={loading} className="bg-blue-600 hover:bg-blue-700">重试</Button>
                  <Button onClick={handleRestart} variant="outline" className="border-slate-600 text-slate-400">返回</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========== 加载中 ========== */}
          {phase === 'loading' && (
            <Card className={`bg-slate-900/60 ${theme.cardBorder}`}>
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
                <p className="text-slate-300 text-lg">AI通讯员正在整理情报...</p>
                <p className="text-slate-600 text-sm mt-1">正在生成贴合场景的决策选择题</p>
              </CardContent>
            </Card>
          )}

          {/* ========== NPC对话阶段 ========== */}
          {(isNPCPhase) && (
            <div className="flex flex-col items-center relative z-[60]">
              {/* NPC角色卡片 */}
              <div
                className="relative mb-6"
                style={{
                  animation: phase === 'npc_talk' && dialogueIdx === 0 ? 'npc-slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' :
                             'npc-bounce 2s ease-in-out infinite'
                }}
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-xl">
                  <span className="text-5xl md:text-6xl">{NPC_EMOTIONS[npcEmotion]}</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-full px-3 py-0.5">
                  <span className="text-xs text-slate-300 whitespace-nowrap">{NPC_NAME}</span>
                </div>
                {(npcEmotion === 'panic' || npcEmotion === 'serious') && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-lg animate-bounce">💦</span>
                  </div>
                )}
              </div>

              {/* 漫画气泡对话 */}
              <div
                className="relative w-full max-w-lg bg-slate-800/95 border-2 border-slate-600 rounded-2xl p-5 mb-4"
                style={{
                  animation: 'bubble-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}
              >
                {/* 气泡三角 */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-800 border-l-2 border-t-2 border-slate-600 rotate-45" />

                <p className="text-white text-sm md:text-base leading-relaxed text-center">
                  {dialogueLines[dialogueIdx] || ''}
                </p>

                {showDialogueNext && (
                  <button
                    onClick={advanceDialogue}
                    className="mt-4 mx-auto block text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="text-xs">
                      {dialogueIdx < dialogueLines.length - 1 ? '点击继续...' : '▼'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========== NPC对话后的角色选择 ========== */}
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
                      <button
                        key={role.id}
                        onClick={() => handleSelectRole(role.id)}
                        disabled={loading}
                        className="w-full p-4 rounded-xl bg-slate-800/80 border-2 border-slate-700 hover:border-blue-500/60 hover:bg-slate-800 transition-all text-left disabled:opacity-50 group"
                        style={{
                          animation: `role-card-enter 0.4s ease-out ${idx * 0.1}s both`,
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-sm">{role.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{role.name}</p>
                            <p className="text-slate-400 text-xs">{role.department}</p>
                          </div>
                          <div className="ml-auto">
                            {getRoleLevelBadge(role.level)}
                          </div>
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
                      <div
                        className="w-full max-w-sm rounded-2xl border-2 p-6 mb-6"
                        style={{ animation: 'float-up 0.4s ease-out', borderColor: theme.alarmColor, backgroundColor: `${theme.alarmColor}15` }}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0" style={{ animation: 'siren-spin 2s linear infinite' }}>
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
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: theme.alarmColor, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== 警报更新中的剧情 ========== */}
          {phase === 'alert_update' && dialogueIdx >= dialogueLines.length - 1 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-red-900/40 border border-red-700/50"
                   style={{ animation: 'alert-button-pulse 1.5s ease-in-out infinite' }}>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: theme.alarmColor }} />
                <span className="text-sm font-medium" style={{ color: theme.alarmColor }}>新警报</span>
              </div>
              <Button
                onClick={advanceDialogue}
                className={`${theme.buttonColor} text-white flex items-center gap-2`}
              >
                查看下一题
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ========== 角色介绍完成→进入答题 ========== */}
          {phase === 'role_intro' && dialogueIdx >= dialogueLines.length - 1 && (
            <div className="mt-4 text-center">
              <Button
                onClick={advanceDialogue}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                开始答题
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ========== 答题界面（含NPC表情） ========== */}
          {phase === 'question' && selectedRole && (
            <div>
              {/* 顶部小NPC状态 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="text-xl">{NPC_EMOTIONS[npcEmotion]}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{NPC_NAME}</p>
                  <p className="text-white text-sm font-medium">{selectedRole.department}</p>
                </div>
              </div>

              <Card className="bg-slate-900/70 border-slate-800 mb-4">
                <CardContent className="p-5 md:p-6">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/40 text-blue-300 text-xs font-medium mb-2">
                      第 {currentQuestion} / {TOTAL_QUESTIONS} 题
                    </span>
                    <p className="text-white text-sm md:text-base leading-relaxed">{questionText}</p>
                  </div>

                  <div className="space-y-2.5">
                    {options.map((opt, idx) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={isSubmitting}
                        className={`w-full p-3.5 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                          isSubmitting
                            ? 'border-slate-700 bg-slate-800/50 opacity-40'
                            : 'border-slate-700 bg-slate-800/70 hover:border-blue-500/50 hover:bg-slate-800'
                        }`}
                        style={{ animation: `float-up 0.3s ease-out ${idx * 0.08}s both` }}
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {OPTION_LABELS[idx]}
                        </span>
                        <span className="text-slate-200 text-sm leading-relaxed pt-0.5">{opt.text}</span>
                      </button>
                    ))}
                  </div>

                  {isSubmitting && (
                    <div className="mt-4 text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-slate-500 text-xs">通讯员正在研判...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========== NPC反馈界面 ========== */}
          {phase === 'feedback' && (
            <div className="flex flex-col items-center">
              {/* NPC情绪反应 */}
              <div
                className="relative mb-4"
                style={{ animation: 'npc-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-xl ${
                  feedbackIsCorrect ? 'bg-gradient-to-br from-green-900 to-green-950 border-green-600' :
                                      'bg-gradient-to-br from-red-900 to-red-950 border-red-600'
                }`}>
                  <span className="text-4xl">{feedbackIsCorrect ? '😊' : '😟'}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-full px-2.5 py-0.5">
                  <span className="text-xs text-slate-300 whitespace-nowrap">{NPC_NAME}</span>
                </div>
              </div>

              {/* 反馈气泡 */}
              <Card className={`w-full max-w-lg border-2 mb-4 ${
                feedbackIsCorrect ? theme.correctColor : theme.wrongColor
              }`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {feedbackIsCorrect ? (
                      <><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-green-400 font-bold">回答正确！</span></>
                    ) : (
                      <><XCircle className="w-5 h-5 text-red-400" /><span className="text-red-400 font-bold">回答有误</span></>
                    )}
                  </div>

                  <div className="bg-slate-900/80 rounded-lg p-3 mb-3">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {feedbackExplanation}
                    </p>
                  </div>

                  {situationUpdate && (
                    <div className="bg-amber-950/30 border border-amber-700/30 rounded-lg p-3 mb-3">
                      <p className="text-amber-400 text-xs font-medium mb-1">📛 最新情况</p>
                      <p className="text-amber-300 text-xs">{situationUpdate}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleFeedbackNext}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {situationUpdate ? '查看新情况' : '继续'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========== 完成界面 ========== */}
          {phase === 'complete' && (
            <div className="flex flex-col items-center">
              {/* NPC告别 */}
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

              <Card className="w-full max-w-lg bg-slate-900/70 border-slate-800 mb-4">
                <CardContent className="p-8 text-center">
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

                  <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重新训练
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ========== 场景信息条（非NPC阶段显示） ========== */}
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

export default function EmergencyTrainingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400">加载中...</p>
        </div>
      </div>
    }>
      <EmergencyTrainingContent />
    </Suspense>
  );
}
