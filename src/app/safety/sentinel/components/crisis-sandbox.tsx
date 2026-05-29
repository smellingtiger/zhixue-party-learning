/**
 * 模块一：AI危机推演沙盘（哨兵模式升级版）
 * 开放式、多路径、有代价的决策困境推演
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, Shield, TrendingUp, Users,
  MessageSquare, Zap, Siren, Radio, ChevronRight,
  Pause, Play, RotateCcw, Eye, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RealDisasterCase, DecisionPoint, TimelineEvent } from '@/lib/real-disaster-cases';

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
      if (t.startsWith('+')) return parseInt(t.replace('+', '').replace('分钟', '').replace('小时', 'h')) * (t.includes('小时') ? 60 : 1);
      return 0;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });
}

export default function CrisisSandbox({ disasterCase, onComplete }: CrisisSandboxProps) {
  const [crisisState, setCrisisState] = useState<CrisisState>({
    phase: 'preparation',
    elapsedMinutes: 0,
    decisions: [],
    resources: {
      fire: 100,
      medical: 100,
      police: 100,
      engineering: 100,
      total: 400,
    },
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const simulatedEvents = useRef(generateSimulatedEvents(disasterCase));

  // 游戏时钟
  useEffect(() => {
    if (isPaused || crisisState.phase === 'resolution') return;

    timerRef.current = setInterval(() => {
      setCrisisState(prev => {
        const newElapsed = prev.elapsedMinutes + 1;

        // 检查是否有新事件触发
        const newEvents = simulatedEvents.current.filter(e => {
          const eventTime = parseInt(e.time.replace('+', '').replace('分钟', '').replace('小时', '')) * (e.time.includes('小时') ? 60 : 1);
          return eventTime <= newElapsed && !prev.events.find(pe => pe.id === e.id);
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

        // 自动推进决策点
        const shouldTriggerDecision = disasterCase.decisionPoints.some((dp, idx) => {
          const dpTime = parseInt(dp.time.replace(':', ''));
          const currentTime = newElapsed;
          return idx === currentDecisionIndex && currentTime >= (dpTime % 100) + Math.floor(dpTime / 100) * 60;
        });

        return {
          ...prev,
          elapsedMinutes: newElapsed,
          events: [...prev.events, ...newEvents],
        };
      });
    }, 1000); // 1秒 = 1分钟模拟时间

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, crisisState.phase, currentDecisionIndex, disasterCase]);

  const handleDecision = useCallback((optionIndex: number) => {
    if (!activeDecision) return;

    const chosenOption = activeDecision.options[optionIndex];
    const consequence = activeDecision.consequences[optionIndex];

    const decision: DecisionRecord = {
      id: `decision-${Date.now()}`,
      time: `${Math.floor(crisisState.elapsedMinutes / 60).toString().padStart(2, '0')}:${(crisisState.elapsedMinutes % 60).toString().padStart(2, '0')}`,
      description: activeDecision.description,
      chosenOption,
      consequences: [consequence],
      cost: {
        time: optionIndex === 0 ? 5 : optionIndex === 1 ? 15 : 30,
        resources: optionIndex === 0 ? 30 : optionIndex === 1 ? 15 : 5,
        reputation: optionIndex === 0 ? -10 : optionIndex === 1 ? 5 : -5,
      },
    };

    setCrisisState(prev => ({
      ...prev,
      decisions: [...prev.decisions, decision],
      resources: {
        ...prev.resources,
        total: prev.resources.total - decision.cost.resources,
      },
      publicOpinion: Math.max(0, Math.min(100, prev.publicOpinion + decision.cost.reputation)),
    }));

    setEventLog(prev => [...prev, {
      id: `log-${Date.now()}`,
      time: decision.time,
      type: 'incident',
      title: '决策已执行',
      description: `${decision.description} → ${chosenOption}`,
      urgency: 'medium',
      requiresDecision: false,
    }]);

    setActiveDecision(null);
    setShowDecisionPanel(false);
    setIsPaused(false);
    setCurrentDecisionIndex(prev => prev + 1);

    // 检查是否完成所有决策
    if (currentDecisionIndex >= disasterCase.decisionPoints.length - 1) {
      setTimeout(() => completeSimulation(), 3000);
    }
  }, [activeDecision, crisisState.elapsedMinutes, currentDecisionIndex, disasterCase]);

  const completeSimulation = useCallback(() => {
    const finalState = { ...crisisState, phase: 'resolution' as const };

    const report: CrisisReport = {
      disasterCase,
      decisions: crisisState.decisions,
      finalState,
      score: calculateScore(crisisState),
      analysis: {
        decisionSpeed: Math.min(100, 100 - crisisState.decisions.reduce((s, d) => s + d.cost.time, 0) / crisisState.decisions.length * 2),
        resourceEfficiency: (crisisState.resources.total / 400) * 100,
        casualtyControl: Math.max(0, 100 - crisisState.casualties * 2),
        publicOpinion: crisisState.publicOpinion,
        riskManagement: crisisState.decisions.filter(d => d.cost.reputation > 0).length / Math.max(1, crisisState.decisions.length) * 100,
      },
    };

    onComplete(report);
  }, [crisisState, disasterCase, onComplete]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

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
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-amber-400 text-lg">{formatTime(crisisState.elapsedMinutes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
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
              {showDecisionPanel && activeDecision ? (
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
                              <div>
                                <p className="text-sm font-medium text-slate-200 group-hover:text-white">{option}</p>
                                <p className="text-xs text-slate-500 mt-1">{activeDecision.consequences[idx]}</p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
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
                  <p className="text-xs text-slate-600 mt-1">等待下一个决策节点</p>
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
              </p>
            </div>
          </div>
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
