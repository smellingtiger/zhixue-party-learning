/**
 * 模块一：AI危机推演沙盘
 * 开放式、多路径、有代价的决策困境推演
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, Shield, TrendingUp, Users,
  MessageSquare, Zap, Siren, Radio, ChevronRight,
  Pause, Play, RotateCcw, Eye, Volume2, VolumeX,
  SkipForward, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RealDisasterCase, DecisionPoint, TimelineEvent, ScriptScene, ScriptLine } from '@/lib/real-disaster-cases';

interface CrisisState {
  phase: 'preparation' | 'response' | 'escalation' | 'resolution';
  elapsedMinutes: number;
  decisions: DecisionRecord[];
  resources: ResourceState;
  publicOpinion: number;
  casualties: number;
  economicLoss: number;
  events: SimulatedEvent[];
}

interface DecisionRecord {
  id: string;
  time: string;
  description: string;
  chosenOption: string;
  consequences: string[];
  cost: {
    time: number;
    resources: number;
    reputation: number;
  };
}

interface ResourceState {
  fire: number;
  medical: number;
  police: number;
  engineering: number;
  total: number;
}

interface SimulatedEvent {
  id: string;
  time: string;
  type: 'incident' | 'secondary' | 'media' | 'order' | 'resource';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiresDecision: boolean;
}

interface CrisisSandboxProps {
  disasterCase: RealDisasterCase;
  onComplete: (report: CrisisReport) => void;
  // 与态势地图联动的资源状态
  externalResources?: ResourceState;
  onResourceChange?: (resources: ResourceState) => void;
  // 是否嵌入在地图模式中
  embedded?: boolean;
}

export interface CrisisReport {
  disasterCase: RealDisasterCase;
  decisions: DecisionRecord[];
  finalState: CrisisState;
  score: number;
  analysis: {
    decisionSpeed: number;
    resourceEfficiency: number;
    casualtyControl: number;
    publicOpinion: number;
    riskManagement: number;
  };
}

// 将真实时间转换为模拟分钟数（相对偏移）
function parseDecisionTime(timeStr: string, caseDate: string): number {
  // 如果是 "07-20 08:00" 格式
  if (timeStr.includes('-') && timeStr.includes(':')) {
    const parts = timeStr.split(' ');
    const timePart = parts[parts.length - 1];
    const [h, m] = timePart.split(':').map(Number);
    return h * 60 + m;
  }
  // 如果是 "23:10" 格式
  if (timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  // 默认
  return 0;
}

// 计算决策点之间的间隔（分钟）
function calculateDecisionIntervals(decisionPoints: DecisionPoint[], caseDate: string): number[] {
  const times = decisionPoints.map(dp => parseDecisionTime(dp.time, caseDate));
  const intervals: number[] = [];
  for (let i = 0; i < times.length; i++) {
    if (i === 0) {
      intervals.push(Math.max(3, Math.min(8, times[i] / 60))); // 第一个决策点 3-8分钟模拟时间
    } else {
      const diff = times[i] - times[i - 1];
      intervals.push(Math.max(2, Math.min(10, diff / 10))); // 后续间隔 2-10分钟模拟时间
    }
  }
  return intervals;
}

function generateSimulatedEvents(caseData: RealDisasterCase): SimulatedEvent[] {
  const events: SimulatedEvent[] = [];

  caseData.timeline.forEach((tl, idx) => {
    events.push({
      id: `timeline-${idx}`,
      time: tl.time,
      type: 'incident',
      title: tl.event,
      description: `来源：${tl.source || '现场报告'}`,
      urgency: idx < 3 ? 'critical' : idx < 6 ? 'high' : 'medium',
      requiresDecision: false,
    });
  });

  // 添加次生事件
  events.push({
    id: 'secondary-1',
    time: '+30分钟',
    type: 'secondary',
    title: '次生灾害预警',
    description: '现场监测发现可能发生二次事故/灾害，需要立即决策',
    urgency: 'critical',
    requiresDecision: true,
  });

  // 添加舆情事件
  events.push({
    id: 'media-1',
    time: '+2小时',
    type: 'media',
    title: '舆情发酵',
    description: '社交媒体上出现大量现场视频，媒体开始追问事故原因和责任',
    urgency: 'high',
    requiresDecision: true,
  });

  // 添加上级指令
  events.push({
    id: 'order-1',
    time: '+4小时',
    type: 'order',
    title: '上级指示',
    description: '上级要求尽快控制事态，同时要求定期汇报进展',
    urgency: 'high',
    requiresDecision: false,
  });

  return events.sort((a, b) => {
    const getMinutes = (t: string) => {
      if (t.startsWith('+')) return parseInt(t.replace('+', '').replace('分钟', '').replace('小时', '')) * (t.includes('小时') ? 60 : 1);
      return 0;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });
}

export default function CrisisSandbox({ disasterCase, onComplete, externalResources, onResourceChange, embedded }: CrisisSandboxProps) {
  const initialResources = externalResources || {
    fire: 100,
    medical: 100,
    police: 100,
    engineering: 100,
    total: 400,
  };

  const [crisisState, setCrisisState] = useState<CrisisState>({
    phase: 'preparation',
    elapsedMinutes: 0,
    decisions: [],
    resources: { ...initialResources },
    publicOpinion: 50,
    casualties: 0,
    economicLoss: 0,
    events: [],
  });

  const [activeEvent, setActiveEvent] = useState<SimulatedEvent | null>(null);
  const [activeDecision, setActiveDecision] = useState<DecisionPoint | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [eventLog, setEventLog] = useState<SimulatedEvent[]>([]);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [nextDecisionIn, setNextDecisionIn] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1=正常, 2=2倍速
  const [isStarted, setIsStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 剧本播放器状态
  const [activeScript, setActiveScript] = useState<ScriptScene | null>(null);
  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([]);
  const [scriptProgress, setScriptProgress] = useState(0);
  const scriptTimerRef = useRef<NodeJS.Timeout | null>(null);

  const simulatedEvents = useRef(generateSimulatedEvents(disasterCase));

  // 预计算决策间隔
  const decisionIntervals = useMemo(() =>
    calculateDecisionIntervals(disasterCase.decisionPoints, disasterCase.date),
    [disasterCase]
  );

  // 游戏时钟
  useEffect(() => {
    if (!isStarted || isPaused || crisisState.phase === 'resolution') return;

    timerRef.current = setInterval(() => {
      setCrisisState(prev => {
        const newElapsed = prev.elapsedMinutes + 1;

        // 检查是否有新事件触发（基于模拟事件的相对时间）
        const newEvents = simulatedEvents.current.filter(e => {
          if (e.time.startsWith('+')) {
            const eventTime = parseInt(e.time.replace('+', '').replace('分钟', '').replace('小时', '')) * (e.time.includes('小时') ? 60 : 1);
            return eventTime <= newElapsed && !prev.events.find(pe => pe.id === e.id);
          }
          return false;
        });

        if (newEvents.length > 0) {
          const latestEvent = newEvents[newEvents.length - 1];
          setActiveEvent(latestEvent);
          if (latestEvent.requiresDecision) {
            const dp = disasterCase.decisionPoints[currentDecisionIndex];
            if (dp) {
              setActiveDecision(dp);
              setShowDecisionPanel(true);
              setIsPaused(true);
            }
          }
        }

        return {
          ...prev,
          elapsedMinutes: newElapsed,
          events: [...prev.events, ...newEvents],
        };
      });

      // 更新倒计时
      setNextDecisionIn(prev => Math.max(0, prev - 1));
    }, 1000 / simulationSpeed); // 根据速度调整间隔

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isPaused, crisisState.phase, currentDecisionIndex, disasterCase, simulationSpeed]);

  // 决策点触发逻辑 - 基于真实秒数倒计时
  useEffect(() => {
    if (!isStarted || isPaused || crisisState.phase === 'resolution') return;
    if (showDecisionPanel) return; // 如果正在显示决策面板，不触发新的
    if (activeScript) return; // 如果正在播放剧本，不触发决策

    const interval = decisionIntervals[currentDecisionIndex];
    if (interval === undefined) return;

    // 使用 nextDecisionIn 倒计时来控制决策触发
    // nextDecisionIn 在 handleDecision 中设置，或在 startSimulation 中设置
    if (nextDecisionIn <= 0 && !activeDecision) {
      const dp = disasterCase.decisionPoints[currentDecisionIndex];
      if (dp) {
        setActiveDecision(dp);
        setShowDecisionPanel(true);
        setIsPaused(true);
      }
    }
  }, [nextDecisionIn, isStarted, isPaused, crisisState.phase, currentDecisionIndex, showDecisionPanel, activeDecision, activeScript, disasterCase, decisionIntervals]);

  // 播放剧本
  const playScript = useCallback((scene: ScriptScene) => {
    setActiveScript(scene);
    setScriptLines([]);
    setScriptProgress(0);

    // 逐行显示剧本
    scene.lines.forEach((line) => {
      setTimeout(() => {
        setScriptLines(prev => [...prev, line]);
      }, line.delay * 1000);
    });

    // 剧本结束后自动关闭
    if (scriptTimerRef.current) clearTimeout(scriptTimerRef.current);
    scriptTimerRef.current = setTimeout(() => {
      setActiveScript(null);
      setScriptLines([]);
    }, (scene.duration + 2) * 1000);
  }, []);

  const startSimulation = () => {
    setIsStarted(true);
    setIsPaused(false);

    // 立即添加一个开场事件
    setEventLog(prev => [...prev, {
      id: `start-${Date.now()}`,
      time: '00:00',
      type: 'incident',
      title: '推演开始',
      description: `您现在担任${disasterCase.name}的应急指挥负责人。时间紧迫，请做出关键决策。`,
      urgency: 'critical',
      requiresDecision: false,
    }]);

    // 播放开场剧本，剧本播放完后再开始倒计时
    const openingScene = disasterCase.scriptScenes?.find(s => s.triggerAfterDecision === -1);
    if (openingScene) {
      setTimeout(() => playScript(openingScene), 500);
      // 剧本播放完后再给5秒缓冲时间出现第一个决策点
      setNextDecisionIn(openingScene.duration + 5);
    } else {
      // 没有开场剧本时，5秒后出现第一个决策点
      setNextDecisionIn(5);
    }
  };

  const handleDecision = useCallback((optionIndex: number) => {
    if (!activeDecision) return;

    const chosenOption = activeDecision.options[optionIndex];
    const consequence = activeDecision.consequences[optionIndex];

    // 根据选项计算代价（更合理的逻辑）
    const costMap = [
      { time: 3, resources: 25, reputation: -5 },   // 选项0：快速但代价高
      { time: 8, resources: 15, reputation: 0 },    // 选项1：平衡
      { time: 15, resources: 5, reputation: 5 },    // 选项2：慢但代价低
    ];
    const cost = costMap[optionIndex] || costMap[1];

    const decision: DecisionRecord = {
      id: `decision-${Date.now()}`,
      time: `${Math.floor(crisisState.elapsedMinutes / 60).toString().padStart(2, '0')}:${(crisisState.elapsedMinutes % 60).toString().padStart(2, '0')}`,
      description: activeDecision.description,
      chosenOption,
      consequences: [consequence],
      cost,
    };

    const newResources = {
      fire: Math.max(0, crisisState.resources.fire - (optionIndex === 0 ? 10 : optionIndex === 1 ? 5 : 2)),
      medical: Math.max(0, crisisState.resources.medical - (optionIndex === 0 ? 8 : optionIndex === 1 ? 4 : 1)),
      police: Math.max(0, crisisState.resources.police - (optionIndex === 0 ? 5 : optionIndex === 1 ? 3 : 1)),
      engineering: Math.max(0, crisisState.resources.engineering - (optionIndex === 0 ? 2 : optionIndex === 1 ? 3 : 1)),
      total: Math.max(0, crisisState.resources.total - cost.resources),
    };

    setCrisisState(prev => ({
      ...prev,
      decisions: [...prev.decisions, decision],
      resources: newResources,
      publicOpinion: Math.max(0, Math.min(100, prev.publicOpinion + cost.reputation)),
      casualties: prev.casualties + (optionIndex === 0 && Math.random() > 0.7 ? 5 : optionIndex === 2 ? 3 : 0),
    }));

    // 同步资源变化到外部（态势地图）
    onResourceChange?.(newResources);

    setEventLog(prev => [...prev, {
      id: `log-${Date.now()}`,
      time: decision.time,
      type: 'incident',
      title: '决策已执行',
      description: `${decision.description} → ${chosenOption}。结果：${consequence}`,
      urgency: 'medium',
      requiresDecision: false,
    }]);

    setActiveDecision(null);
    setShowDecisionPanel(false);
    setIsPaused(false);
    setCurrentDecisionIndex(prev => prev + 1);

    // 设置下一个决策点的倒计时
    const nextInterval = decisionIntervals[currentDecisionIndex + 1];
    if (nextInterval !== undefined) {
      setNextDecisionIn(Math.round(nextInterval));
    }

    // 检查是否有剧本需要播放（在决策后触发）
    const nextScene = disasterCase.scriptScenes?.find(s => s.triggerAfterDecision === currentDecisionIndex);
    if (nextScene) {
      setTimeout(() => playScript(nextScene), 1000);
    }

    // 检查是否完成所有决策
    if (currentDecisionIndex >= disasterCase.decisionPoints.length - 1) {
      setTimeout(() => completeSimulation(), 2000);
    }
  }, [activeDecision, crisisState.elapsedMinutes, currentDecisionIndex, disasterCase, decisionIntervals, playScript]);

  const completeSimulation = useCallback(() => {
    setCrisisState(prev => ({ ...prev, phase: 'resolution' }));
    setIsPaused(true);

    const finalState = { ...crisisState, phase: 'resolution' as const };

    const report: CrisisReport = {
      disasterCase,
      decisions: crisisState.decisions,
      finalState,
      score: calculateScore(crisisState),
      analysis: {
        decisionSpeed: Math.min(100, 100 - crisisState.decisions.reduce((s, d) => s + d.cost.time, 0) / Math.max(1, crisisState.decisions.length) * 3),
        resourceEfficiency: (crisisState.resources.total / 400) * 100,
        casualtyControl: Math.max(0, 100 - crisisState.casualties * 5),
        publicOpinion: crisisState.publicOpinion,
        riskManagement: crisisState.decisions.filter(d => d.cost.reputation >= 0).length / Math.max(1, crisisState.decisions.length) * 100,
      },
    };

    // 延迟一点再调用onComplete，让用户看到结束状态
    setTimeout(() => onComplete(report), 1500);
  }, [crisisState, disasterCase, onComplete]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // 如果推演还没开始，显示开始界面
  if (!isStarted) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-xl px-6"
        >
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Siren className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{disasterCase.name}</h2>
          <p className="text-sm text-slate-400 mb-6">危机推演沙盘</p>

          <Card className="bg-slate-900 border-slate-700 mb-6 text-left">
            <CardContent className="p-5">
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{disasterCase.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-slate-800">
                  <p className="text-lg font-bold text-red-400">{disasterCase.casualties.deaths}</p>
                  <p className="text-xs text-slate-500">遇难</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <p className="text-lg font-bold text-amber-400">{disasterCase.decisionPoints.length}</p>
                  <p className="text-xs text-slate-500">决策点</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800">
                  <p className="text-lg font-bold text-emerald-400">{disasterCase.rescueForces.length}</p>
                  <p className="text-xs text-slate-500">救援力量</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-4">
              您将面对 {disasterCase.decisionPoints.length} 个关键决策点。<br />
              每个决策都有时间成本和资源代价，没有标准答案，只有决策后果。
            </p>
            <Button
              size="lg"
              onClick={startSimulation}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8"
            >
              <Play className="w-4 h-4 mr-2" />
              开始推演
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Siren className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{disasterCase.name}</h2>
            <p className="text-xs text-slate-400">危机推演沙盘</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 下一个决策倒计时 */}
          {!showDecisionPanel && crisisState.phase !== 'resolution' && (
            <div className="flex items-center gap-2 text-xs">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">下个决策:</span>
              <span className="font-mono text-amber-400">{nextDecisionIn > 0 ? `${nextDecisionIn}秒` : '即将到达'}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-amber-400 text-lg">{formatTime(crisisState.elapsedMinutes)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSimulationSpeed(s => s === 1 ? 2 : 1)} title={simulationSpeed === 1 ? '加速' : '正常速度'}>
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 主要区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：态势面板 */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">实时态势</h3>
            <div className="space-y-2">
              <StatusBar label="舆情指数" value={crisisState.publicOpinion} color="bg-blue-500" />
              <StatusBar label="资源余量" value={(crisisState.resources.total / 400) * 100} color="bg-emerald-500" />
              <StatusBar label="伤亡控制" value={Math.max(0, 100 - crisisState.casualties * 5)} color="bg-red-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">事件日志</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {[...crisisState.events, ...eventLog].map((event, idx) => (
                  <motion.div
                    key={`${event.id}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded-lg text-xs border ${
                      event.urgency === 'critical' ? 'bg-red-950/50 border-red-800 text-red-200' :
                      event.urgency === 'high' ? 'bg-orange-950/50 border-orange-800 text-orange-200' :
                      'bg-slate-800/50 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {event.type === 'incident' && <AlertTriangle className="w-3 h-3" />}
                      {event.type === 'media' && <Radio className="w-3 h-3" />}
                      {event.type === 'secondary' && <Zap className="w-3 h-3" />}
                      {event.type === 'order' && <Shield className="w-3 h-3" />}
                      <span className="font-medium">{event.title}</span>
                      <span className="ml-auto text-slate-500">{event.time}</span>
                    </div>
                    <p className="text-slate-400">{event.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 中间：决策区域 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeScript ? (
                <ScriptPlayer
                  key={`script-${activeScript.id}`}
                  scene={activeScript}
                  lines={scriptLines}
                  onSkip={() => {
                    setActiveScript(null);
                    setScriptLines([]);
                  }}
                />
              ) : showDecisionPanel && activeDecision ? (
                <motion.div
                  key="decision"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-2xl"
                >
                  <Card className="bg-slate-900 border-amber-500/30 shadow-2xl shadow-amber-500/10">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-black">决策点 {currentDecisionIndex + 1}/{disasterCase.decisionPoints.length}</Badge>
                        <Badge variant="outline" className="border-red-500 text-red-400">时间 {activeDecision.time}</Badge>
                        {isPaused && <Badge variant="outline" className="border-amber-500 text-amber-400">已暂停</Badge>}
                      </div>
                      <CardTitle className="text-lg text-white mt-2">
                        {activeDecision.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activeDecision.options.map((option, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDecision(idx)}
                            className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-amber-500/20 flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-200 group-hover:text-white">{option}</p>
                                <p className="text-xs text-slate-500 mt-1">{activeDecision.consequences[idx]}</p>
                                <div className="flex gap-3 mt-2 text-[10px] text-slate-600">
                                  <span>⏱️ {idx === 0 ? '3分钟' : idx === 1 ? '8分钟' : '15分钟'}</span>
                                  <span>📦 {idx === 0 ? '25%' : idx === 1 ? '15%' : '5%'}资源</span>
                                  <span>📢 {idx === 0 ? '-5' : idx === 1 ? '0' : '+5'}舆情</span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : crisisState.phase === 'resolution' ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-bold text-lg">推演完成</p>
                  <p className="text-xs text-slate-500 mt-1">正在生成决策复盘报告...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">态势推演进行中...</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {nextDecisionIn > 0 ? `预计 ${nextDecisionIn} 秒后出现下一个决策点` : '等待下一个决策节点'}
                  </p>
                  <div className="mt-4 w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: nextDecisionIn || 5, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部：压力源提示 */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5" />
                <span>利益相关方动态</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                  上级关注
                </Badge>
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  媒体追问
                </Badge>
                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                  群众诉求
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：资源与情报 */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">可用资源</h3>
          <div className="space-y-2">
            <ResourceCard type="fire" name="消防救援" value={crisisState.resources.fire} icon="🔥" />
            <ResourceCard type="medical" name="医疗救护" value={crisisState.resources.medical} icon="🏥" />
            <ResourceCard type="police" name="警力部署" value={crisisState.resources.police} icon="👮" />
            <ResourceCard type="engineering" name="工程抢险" value={crisisState.resources.engineering} icon="🚧" />
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI参谋建议</h3>
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-300">态势分析</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                当前处于{crisisState.phase === 'preparation' ? '初期响应' : '应急处置'}阶段。
                {crisisState.publicOpinion < 40 ? '舆情压力较大，建议加强信息发布。' : ''}
                {crisisState.resources.total < 200 ? '资源消耗过半，需合理调配。' : ''}
                {crisisState.casualties > 10 ? '伤亡人数上升，需优先保障人员安全。' : ''}
              </p>
            </div>
          </div>

          {/* 已做决策列表 */}
          {crisisState.decisions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">已做决策</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {crisisState.decisions.map((d, idx) => (
                  <div key={d.id} className="p-2 rounded bg-slate-800/50 text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-amber-400 font-bold">{idx + 1}</span>
                      <span className="text-slate-500">{d.time}</span>
                    </div>
                    <p className="text-slate-300 truncate">{d.chosenOption}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function ResourceCard({ type, name, value, icon }: { type: string; name: string; value: number; icon: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-slate-300">{name}</span>
        </div>
        <span className="text-xs font-mono text-slate-400">{value}%</span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            value > 60 ? 'bg-emerald-500' : value > 30 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function calculateScore(state: CrisisState): number {
  const resourceScore = (state.resources.total / 400) * 30;
  const opinionScore = (state.publicOpinion / 100) * 25;
  const casualtyScore = Math.max(0, 100 - state.casualties * 10) * 0.25;
  const decisionScore = state.decisions.length > 0
    ? state.decisions.filter(d => d.cost.reputation >= 0).length / state.decisions.length * 20
    : 0;

  return Math.round(resourceScore + opinionScore + casualtyScore + decisionScore);
}

// 剧本播放器组件
function ScriptPlayer({ scene, lines, onSkip }: { scene: ScriptScene; lines: ScriptLine[]; onSkip: () => void }) {
  return (
    <motion.div
      key={scene.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl"
    >
      <Card className="bg-slate-900 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="px-5 py-3 bg-indigo-950/50 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-300">{scene.title}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-500 hover:text-slate-300" onClick={onSkip}>
            跳过 ▶▶
          </Button>
        </div>

        <CardContent className="p-5">
          {/* 剧本内容区域 */}
          <div className="space-y-3 min-h-[200px] max-h-[320px] overflow-y-auto pr-2">
            <AnimatePresence>
              {lines.map((line, idx) => (
                <motion.div
                  key={`${scene.id}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${line.highlight ? 'pl-3 border-l-2 border-indigo-500' : ''}`}
                >
                  <span className={`text-xs font-medium shrink-0 w-16 text-right ${
                    line.speaker === '系统' ? 'text-amber-400' :
                    line.speaker === '现场' ? 'text-red-400' :
                    'text-indigo-400'
                  }`}>
                    {line.speaker}
                  </span>
                  <p className={`text-sm leading-relaxed ${
                    line.highlight ? 'text-slate-200 font-medium' : 'text-slate-400'
                  }`}>
                    {line.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 打字指示器 */}
            {lines.length < scene.lines.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <span className="text-xs text-slate-600 shrink-0 w-16 text-right">...</span>
                <div className="flex gap-1 items-center h-5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* 进度条 */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>剧情播放中</span>
              <span>{Math.round((lines.length / scene.lines.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${(lines.length / scene.lines.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
