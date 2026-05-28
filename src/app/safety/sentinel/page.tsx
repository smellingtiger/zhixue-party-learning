'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Droplets,
  Zap,
  Shield,
  Users,
  Truck,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  X,
  MessageSquare,
  Eye,
  Layers,
  FileText,
  BarChart3,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

const Sandbox3D = dynamic(() => import('@/components/sandbox-3d').then(mod => ({ default: mod.Sandbox3D })), {
  ssr: false
});

type Stage = 'idle' | 'alert' | 'plans' | 'executing' | 'monitoring';
type Mode = 'real' | 'training';
type AssistantMode = 'copilot' | 'training' | 'qa';

interface AlertData {
  id: string;
  time: string;
  location: string;
  waterLevel: number;
  trend: 'rising' | 'stable';
  analysis: string;
}

interface PlanOption {
  id: 'A' | 'B';
  title: string;
  type: 'conservative' | 'aggressive';
  recommended?: boolean;
  actions: string[];
  resources: { name: string; unit: string }[];
  estimatedTime: string;
  risk: string;
}

interface TaskItem {
  id: string;
  to: string;
  content: string;
  status: 'pending' | 'sending' | 'sent' | 'acknowledged';
}

interface Resource {
  id: string;
  name: string;
  type: 'team' | 'vehicle' | 'equipment';
  count: number;
  maxCount: number;
  icon: any;
  color: string;
}

interface MapEntity {
  id: string;
  x: number;
  y: number;
  type: 'sensor' | 'team' | 'vehicle' | 'hazard' | 'shelter';
  status?: 'normal' | 'warning' | 'danger';
  data?: any;
}

interface StreamMessage {
  id: string;
  type: 'text' | 'card' | 'event' | 'timeline';
  role: 'user' | 'assistant' | 'system';
  content: any;
  timestamp: string;
}

const DEMO_ALERT: AlertData = {
  id: 'alert-001',
  time: '14:35',
  location: '中山路与建设大道交叉口',
  waterLevel: 45,
  trend: 'rising',
  analysis: '预计30分钟后交通完全中断，可能危及地下车库车辆'
};

const PLANS: PlanOption[] = [
  {
    id: 'A',
    title: '方案 A（保守型 - 推荐）',
    type: 'conservative',
    recommended: true,
    actions: ['封闭积水路段', '调用附近2台抽水泵'],
    resources: [{ name: '交警中队A', unit: '队' }, { name: '排水班组B', unit: '组' }],
    estimatedTime: '2小时',
    risk: '晚高峰可能导致周边道路拥堵'
  },
  {
    id: 'B',
    title: '方案 B（激进型）',
    type: 'aggressive',
    actions: ['强制疏散地下车库车辆', '全线交通管制'],
    resources: [{ name: '交警全员', unit: '队' }, { name: '消防协助', unit: '队' }],
    estimatedTime: '4小时',
    risk: '社会影响较大，但彻底消除安全隐患'
  }
];

const INITIAL_TASKS: TaskItem[] = [
  { id: 'task-1', to: '交警A队', content: '前往中山路实施交通管制', status: 'pending' },
  { id: 'task-2', to: '排水B组', content: '携带2台大功率水泵前往现场', status: 'pending' }
];

const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', name: '救援队A', type: 'team', count: 2, maxCount: 2, icon: Users, color: 'text-blue-400' },
  { id: 'r2', name: '救援队B', type: 'team', count: 1, maxCount: 1, icon: Users, color: 'text-blue-400' },
  { id: 'r3', name: '消防车', type: 'vehicle', count: 3, maxCount: 5, icon: Truck, color: 'text-red-400' },
  { id: 'r4', name: '救护车', type: 'vehicle', count: 2, maxCount: 4, icon: Truck, color: 'text-emerald-400' },
  { id: 'r5', name: '抽水泵', type: 'equipment', count: 4, maxCount: 6, icon: Droplets, color: 'text-cyan-400' }
];

const INITIAL_ENTITIES: MapEntity[] = [
  { id: 'e1', x: 30, y: 40, type: 'sensor', status: 'normal', data: { value: 25, unit: 'cm' } },
  { id: 'e2', x: 70, y: 30, type: 'sensor', status: 'normal', data: { value: 20, unit: 'cm' } },
  { id: 'e3', x: 50, y: 70, type: 'shelter' },
  { id: 'e4', x: 20, y: 20, type: 'team' },
  { id: 'e5', x: 80, y: 60, type: 'vehicle' }
];

export default function EmergencySentinel() {
  const [stage, setStage] = useState<Stage>('idle');
  const [mode, setMode] = useState<Mode>('real');
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('copilot');
  const [selectedPlan, setSelectedPlan] = useState<'A' | 'B' | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [showMapAlert, setShowMapAlert] = useState(false);
  const [vehiclesMoving, setVehiclesMoving] = useState(false);
  const [waterLevel, setWaterLevel] = useState(45);

  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [mapEntities, setMapEntities] = useState<MapEntity[]>(INITIAL_ENTITIES);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(false);

  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [trainingScore, setTrainingScore] = useState(100);

  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [clockTime, setClockTime] = useState('');

  useEffect(() => {
    setClockTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setClockTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stage, streamMessages]);

  const resetAll = () => {
    setStage('idle');
    setSelectedPlan(null);
    setTasks(INITIAL_TASKS.map(t => ({ ...t, status: 'pending' })));
    setExecutionProgress(0);
    setShowMapAlert(false);
    setVehiclesMoving(false);
    setWaterLevel(45);
    setResources(INITIAL_RESOURCES);
    setMapEntities(INITIAL_ENTITIES);
    setSelectedEntity(null);
    setShowDangerZone(false);
    setShowEvacuationRoute(false);
    setIsTrainingPaused(false);
    setTrainingScore(100);
    setStreamMessages([]);
  };

  const triggerAlert = () => {
    setStage('alert');
    setShowMapAlert(true);
    addTimelineMessage({
      id: `tl-${Date.now()}`,
      type: 'timeline',
      role: 'system',
      content: { stage: 'alert', alert: DEMO_ALERT },
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const generatePlans = () => {
    setStage('plans');
    addTimelineMessage({
      id: `tl-${Date.now()}`,
      type: 'timeline',
      role: 'system',
      content: { stage: 'plans' },
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const selectPlan = (planId: 'A' | 'B') => {
    setSelectedPlan(planId);
  };

  const confirmExecution = () => {
    if (!selectedPlan) return;
    setStage('executing');
    setVehiclesMoving(true);

    addTimelineMessage({
      id: `tl-${Date.now()}`,
      type: 'timeline',
      role: 'system',
      content: { stage: 'executing', planId: selectedPlan },
      timestamp: new Date().toLocaleTimeString()
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setExecutionProgress(progress);

      if (progress >= 25) setTasks(prev => prev.map((t, i) => i === 0 ? { ...t, status: 'sending' } : t));
      if (progress >= 35) setTasks(prev => prev.map((t, i) => i === 0 ? { ...t, status: 'sent' } : t));
      if (progress >= 50) setTasks(prev => prev.map((t, i) => i === 1 ? { ...t, status: 'sending' } : t));
      if (progress >= 60) setTasks(prev => prev.map((t, i) => i === 1 ? { ...t, status: 'sent' } : t));
      if (progress >= 80) setTasks(prev => prev.map((t, i) => i === 0 ? { ...t, status: 'acknowledged' } : t));
      if (progress >= 90) setTasks(prev => prev.map((t, i) => i === 1 ? { ...t, status: 'acknowledged' } : t));

      if (progress >= 100) {
        clearInterval(interval);
        setStage('monitoring');
        setWaterLevel(30);
        addTimelineMessage({
          id: `tl-${Date.now()}`,
          type: 'timeline',
          role: 'system',
          content: { stage: 'monitoring', waterLevel: 30 },
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }, 200);
  };

  const addTimelineMessage = (msg: StreamMessage) => {
    setStreamMessages(prev => [...prev, msg]);
  };

  const handleCopilotInput = (query: string) => {
    if (!query.trim()) return;

    addTimelineMessage({
      id: Date.now().toString(),
      type: 'text',
      role: 'user',
      content: query,
      timestamp: '现在'
    });

    setTimeout(() => {
      if (query.includes('预案') || query.includes('方案')) {
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'card',
          role: 'assistant',
          content: {
            type: 'plan',
            title: query || '城市内涝疏散预案',
            steps: [
              { id: 's1', text: '封闭积水路段', done: false },
              { id: 's2', text: '调度抽水泵', done: false },
              { id: 's3', text: '开放避难所', done: false },
              { id: 's4', text: '通知受影响居民', done: false }
            ]
          },
          timestamp: '现在'
        });
        setShowDangerZone(true);
        setShowEvacuationRoute(true);
      } else if (query.includes('什么') || query.includes('怎么') || query.includes('如何')) {
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'card',
          role: 'assistant',
          content: {
            type: 'qa',
            title: 'MSDS 化学品安全技术说明',
            substance: '浓硫酸',
            answer: '浓硫酸具有强腐蚀性，遇水剧烈放热。\n\n灭火方式：干粉、二氧化碳，严禁用水。',
            hasAction: true
          },
          timestamp: '现在'
        });
      } else {
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'text',
          role: 'assistant',
          content: `收到"${query}"。\n\n左侧沙盘已更新态势数据。您可以点击地图元素查看详情，或部署资源进行响应。`,
          timestamp: '现在'
        });
      }
    }, 600);

    setInputText('');
  };

  const injectTrainingEvent = () => {
    setIsTrainingPaused(true);
    setTrainingScore(prev => Math.max(0, prev - 20));

    addTimelineMessage({
      id: Date.now().toString(),
      type: 'event',
      role: 'system',
      content: {
        type: 'sudden',
        title: '【突发】现场风向突变',
        description: '风向变为东南风，风力6级。毒气扩散范围改变！',
        effect: '原方案已失效，请调整部署。'
      },
      timestamp: '现在'
    });

    setMapEntities(prev => prev.map(e => {
      if (e.id === 'e1') return { ...e, status: 'danger', data: { value: 80, unit: 'cm' } };
      if (e.id === 'e2') return { ...e, status: 'warning', data: { value: 55, unit: 'cm' } };
      return e;
    }));
  };

  const continueTraining = () => {
    setIsTrainingPaused(false);
    addTimelineMessage({
      id: Date.now().toString(),
      type: 'text',
      role: 'assistant',
      content: `调整及时！但下风向居民区仍未覆盖，扣10分。\n当前得分：${trainingScore}`,
      timestamp: '现在'
    });
  };

  const handleResourceDeploy = (resourceId: string) => {
    const res = resources.find(r => r.id === resourceId);
    if (!res || res.count <= 0) return;

    if (mode === 'training') {
      setResources(prev => prev.map(r =>
        r.id === resourceId ? { ...r, count: r.count - 1 } : r
      ));
    }

    addTimelineMessage({
      id: Date.now().toString(),
      type: 'text',
      role: 'user',
      content: `部署 ${res.name} 到现场`,
      timestamp: '现在'
    });
  };

  const getStageLabel = (s: Stage) => ({
    idle: '待命', alert: '预警', plans: '推演', executing: '执行中', monitoring: '监控中'
  }[s]);

  return (
    <div className="h-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-900 border-r border-slate-800">
          <div className="border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold flex items-center gap-1.5">
                  应急哨兵
                  <Badge className={mode === 'training' ? 'bg-blue-600 animate-pulse text-xs' : 'bg-emerald-600 text-xs'}>
                    {mode === 'training' ? 'SIMULATION' : 'PROTOTYPE'}
                  </Badge>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs text-slate-400">动态态势沙盘</span>
                  <Badge variant="outline" className={mode === 'training' ? 'border-blue-500/50 text-blue-400 text-[10px]' : 'border-red-500/50 text-red-400 text-[10px]'}>
                    {mode === 'training' ? 'SIM' : 'LIVE'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-0.5 bg-slate-800 rounded-lg">
              <button
                onClick={() => setMode('real')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'real' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 inline mr-1" />实战指挥
              </button>
              <button
                onClick={() => setMode('training')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'training' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 inline mr-1" />模拟演练
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400">
                阶段：<span className={`font-bold ${stage !== 'idle' ? 'text-orange-400' : ''}`}>{getStageLabel(stage)}</span>
              </span>

              {mode === 'training' && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-950/50 rounded-md border border-blue-800">
                  <span className="text-xs">得分：</span>
                  <span className={`text-xs font-bold ${trainingScore >= 80 ? 'text-emerald-400' : trainingScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {trainingScore}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setIsTrainingPaused(!isTrainingPaused)} className="h-6 px-1.5 text-slate-400">
                    {isTrainingPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  </Button>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)} className="text-slate-400 h-7 text-xs">
                图层
              </Button>
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-slate-400 h-7 text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />重置
              </Button>
              <span className="text-xs text-slate-500 tabular-nums w-14 text-right">{clockTime || '--:--:--'}</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <Sandbox3D
              entities={mapEntities.map(e => ({
                id: e.id,
                x: (e.x - 50) * 0.6,
                z: (e.y - 50) * 0.6,
                type: e.type,
                status: e.status
              }))}
              showDangerZone={showDangerZone}
              onEntityClick={(id) => setSelectedEntity(id === selectedEntity ? null : id)}
            />

            <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700 text-xs space-y-1 z-10">
              <div className="font-bold text-slate-200">图例</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" />危险区</div>
                <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-emerald-400" />疏散路线</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" />队伍</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" />车辆</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400" />传感器</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" />避难所</div>
              </div>
            </div>

            {selectedEntity && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 left-4 w-64 bg-slate-900/95 backdrop-blur rounded-xl border border-slate-700 p-4 z-10 shadow-xl">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-100">实体详情</span>
                  <button onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-sm space-y-1 text-slate-300">
                  <p>ID: {selectedEntity}</p>
                  {mapEntities.find(e => e.id === selectedEntity)?.data && (
                    <p>数值: {mapEntities.find(e => e.id === selectedEntity)?.data.value}{mapEntities.find(e => e.id === selectedEntity)?.data.unit}</p>
                  )}
                  {mapEntities.find(e => e.id === selectedEntity) && (
                    <p>类型: {
                      mapEntities.find(e => e.id === selectedEntity)?.type === 'sensor' ? '水位传感器' :
                      mapEntities.find(e => e.id === selectedEntity)?.type === 'team' ? '救援队伍' :
                      mapEntities.find(e => e.id === selectedEntity)?.type === 'vehicle' ? '救援车辆' : '避难所'
                    }</p>
                  )}
                </div>
              </motion.div>
            )}

            {stage === 'idle' && (
              <div className="absolute top-6 left-6 z-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/95 backdrop-blur text-slate-900 p-5 rounded-xl shadow-2xl max-w-sm">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600" />快速开始
                  </div>
                  <p className="text-sm text-slate-600 mb-3">点击下方按钮触发预警，体验完整决策流程</p>
                  <Button onClick={triggerAlert} className="w-full bg-red-600 hover:bg-red-500 text-white shadow-lg">
                    触发水位报警
                  </Button>
                </motion.div>
              </div>
            )}

            {mode === 'training' && !isTrainingPaused && stage !== 'idle' && (
              <Button
                onClick={injectTrainingEvent}
                className="absolute bottom-5 right-5 z-10 bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/30"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />注入突发事
              </Button>
            )}

            <AnimatePresence>
              {showLayers && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-16 right-4 w-56 bg-slate-900/95 backdrop-blur rounded-xl border border-slate-700 p-4 z-10">
                  <div className="text-sm font-bold mb-3 flex justify-between text-slate-100">
                    图层控制
                    <button onClick={() => setShowLayers(false)} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={showDangerZone} onChange={e => setShowDangerZone(e.target.checked)} className="rounded accent-red-500" />
                      <span className="text-sm text-red-400">危险区域</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={showEvacuationRoute} onChange={e => setShowEvacuationRoute(e.target.checked)} className="rounded accent-green-500" />
                      <span className="text-sm text-green-400">疏散路线</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-slate-900 border-t border-slate-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold">资源池</span>
              {mode === 'training' && <span className="text-xs text-blue-400">（兵力值）</span>}
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {resources.map(res => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.id}
                    onClick={() => handleResourceDeploy(res.id)}
                    className={`flex-shrink-0 p-2.5 rounded-lg border-2 cursor-pointer transition-all min-w-[120px] ${
                      mode === 'training' && res.count <= 0
                        ? 'border-slate-700 bg-slate-800/50 opacity-40 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-800 hover:border-indigo-500 hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${res.color}`} />
                      <div>
                        <div className="text-sm font-medium leading-tight">{res.name}</div>
                        <div className="text-xs text-slate-500">
                          <span className={res.count <= 1 ? 'text-orange-400 font-bold' : ''}>{res.count}</span>
                          <span className="text-slate-600">/{res.maxCount}</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={(res.count / res.maxCount) * 100} className="h-1 mt-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-[480px] bg-slate-900 border-l border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <Tabs value={assistantMode} onValueChange={(v: any) => setAssistantMode(v)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold">智能参谋</span>
                </div>
              </div>
              <TabsList className="w-full bg-slate-800 h-9">
                <TabsTrigger value="copilot" className="flex-1 text-xs"><Zap className="w-3 h-3 mr-1" />方案</TabsTrigger>
                <TabsTrigger value="training" className="flex-1 text-xs"><Play className="w-3 h-3 mr-1" />培训</TabsTrigger>
                <TabsTrigger value="qa" className="flex-1 text-xs"><MessageSquare className="w-3 h-3 mr-1" />问答</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 relative">
              <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-slate-700" />

              {(stage === 'idle' || streamMessages.length === 0) && assistantMode === 'copilot' && (
                <div className="relative pl-9">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 text-sm text-slate-400">
                      系统就绪 · 等待事件触发或输入需求
                    </CardContent>
                  </Card>
                </div>
              )}

              <AnimatePresence>
                {(stage === 'alert' || stage === 'plans' || stage === 'executing' || stage === 'monitoring') && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative pl-9">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-red-600 border-2 border-red-400 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                    <Card className="border-red-500/50 bg-gradient-to-br from-red-950/50 to-slate-900">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-red-600 mb-1.5 text-xs">异常事件捕获</Badge>
                            <CardTitle className="text-base">水位监测告警</CardTitle>
                          </div>
                          <span className="text-xs text-slate-400">{DEMO_ALERT.time}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-slate-200"><span className="text-slate-400">地点：</span>{DEMO_ALERT.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="px-3 py-1 bg-red-500/20 rounded border border-red-500/30 text-red-300 font-mono">
                            {DEMO_ALERT.waterLevel}cm
                          </div>
                          <span className="text-slate-400 text-xs">超过警戒线</span>
                          <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs">↑上升</Badge>
                        </div>
                        <div className="bg-slate-800/80 p-2.5 rounded-lg text-sm border-l-2 border-yellow-500">
                          <span className="font-medium text-yellow-400">AI研判：</span>
                          <span className="text-slate-300">{DEMO_ALERT.analysis}</span>
                        </div>
                        {stage === 'alert' && (
                          <Button onClick={generatePlans} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-sm">
                            生成处置建议 <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        {stage !== 'alert' && stage !== 'idle' && (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4" />已生成处置方案
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(stage === 'plans' || stage === 'executing' || stage === 'monitoring') && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="relative pl-9">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <Card className="border-blue-500/30 bg-slate-800/50">
                      <CardHeader className="pb-2">
                        <Badge className="bg-blue-600 mb-1.5 text-xs">平行推演</Badge>
                        <CardTitle className="text-base">选择处置方案</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        {PLANS.map(plan => (
                          <div
                            key={plan.id}
                            onClick={() => stage === 'plans' && selectPlan(plan.id)}
                            className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPlan === plan.id
                                ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-900/20'
                                : stage === 'plans'
                                  ? 'border-slate-600 hover:border-slate-500 bg-slate-800'
                                  : selectedPlan !== plan.id
                                    ? 'border-slate-700 opacity-50 bg-slate-800/50'
                                    : 'border-blue-500 bg-blue-950/30'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-sm">{plan.title}</span>
                              {plan.recommended && <Badge className="bg-emerald-600 text-xs">推荐</Badge>}
                            </div>
                            <div className="text-xs text-slate-300 mb-2">
                              动作：{plan.actions.join('、')}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                              <div>
                                <span className="text-slate-500">资源：</span>
                                <div className="mt-0.5 space-y-0.5">
                                  {plan.resources.map((r, i) => (
                                    <div key={i} className="text-slate-300"><Users className="w-3 h-3 inline mr-1" />{r.name}</div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">恢复时间：</span>
                                <div className="font-mono text-emerald-400 mt-0.5">{plan.estimatedTime}</div>
                              </div>
                            </div>
                            <div className="text-xs p-2 rounded bg-slate-900/60">
                              <span className="text-orange-400">风险：</span>{plan.risk}
                            </div>
                          </div>
                        ))}

                        {stage === 'plans' && selectedPlan && (
                          <Button onClick={confirmExecution} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm">
                            确认执行方案 {selectedPlan} <CheckCircle className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                        {(stage === 'executing' || stage === 'monitoring') && (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4" />已执行方案 {selectedPlan}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {(stage === 'executing' || stage === 'monitoring') && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="relative pl-9">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <Card className="border-emerald-500/30 bg-slate-800/50">
                      <CardHeader className="pb-2">
                        <Badge className="bg-emerald-600 mb-1.5 text-xs">指令下发</Badge>
                        <CardTitle className="text-base">待办任务清单</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        {stage === 'executing' && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">进度</span>
                              <span className="font-mono">{executionProgress}%</span>
                            </div>
                            <Progress value={executionProgress} className="h-1.5" />
                          </div>
                        )}
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div key={task.id} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-700 flex justify-between items-center">
                              <div>
                                <div className="text-sm font-medium text-slate-200">{task.to}</div>
                                <div className="text-xs text-slate-400">{task.content}</div>
                              </div>
                              <Badge variant="outline" className={
                                task.status === 'pending' ? 'border-slate-600 text-slate-400' :
                                task.status === 'sending' ? 'border-yellow-500 text-yellow-400 animate-pulse' :
                                task.status === 'sent' ? 'border-blue-500 text-blue-400' : 'border-emerald-500 text-emerald-400'
                              }>
                                {task.status === 'pending' && '待发送'}
                                {task.status === 'sending' && '发送中'}
                                {task.status === 'sent' && '已发送'}
                                {task.status === 'acknowledged' && '已确认'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {stage === 'monitoring' && (
                          <div className="bg-slate-800 p-3 rounded-lg border border-emerald-500/30 flex items-start gap-2.5">
                            <Eye className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-emerald-400 text-sm">监控模式</div>
                              <div className="text-xs text-slate-400">持续监测水位变化，异常将再次预警</div>
                              <div className="text-xs text-slate-500 mt-1">当前水位：{waterLevel}cm ↓</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {streamMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative`}>
                  <div className={`max-w-[90%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.type === 'text' && (
                      <div className={`p-3.5 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                      </div>
                    )}

                    {msg.type === 'card' && msg.content?.type === 'plan' && (
                      <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-slate-900">
                        <CardHeader className="pb-2 pt-3 px-4">
                          <Badge className="bg-indigo-600 text-xs w-fit">可执行方案</Badge>
                          <CardTitle className="text-base mt-1">{msg.content.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2">
                          {msg.content.steps.map((step: any) => (
                            <div key={step.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-750 transition-colors">
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-600 border-emerald-400' : 'border-slate-500'}`}>
                                {step.done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className={`text-sm ${step.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{step.text}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {msg.type === 'card' && msg.content?.type === 'qa' && (
                      <Card className="border-blue-500/30 bg-slate-800">
                        <CardHeader className="pb-2 pt-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 text-xs">文档引用</Badge>
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <CardTitle className="text-sm text-blue-300 mt-1">{msg.content.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.content.answer}</div>
                          {msg.content.hasAction && (
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm">
                              一键生成处置方案 <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {msg.type === 'event' && (
                      <Card className="border-orange-500/50 bg-gradient-to-br from-orange-950/50 to-slate-900 animate-pulse">
                        <CardHeader className="pb-2 pt-3 px-4">
                          <Badge className="bg-orange-600 text-xs">突发事</Badge>
                          <CardTitle className="text-base text-orange-300 mt-1">{msg.content.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2.5">
                          <p className="text-sm text-slate-300">{msg.content.description}</p>
                          <div className="bg-slate-900 p-2.5 rounded border-l-2 border-orange-500">
                            <p className="text-sm text-orange-300 font-medium">{msg.content.effect}</p>
                          </div>
                          {isTrainingPaused && (
                            <Button onClick={continueTraining} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
                              确认调整，继续推演 <CheckCircle className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="text-[10px] text-slate-500 mt-1 px-0.5">{msg.timestamp}</div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2.5">
            <div className="flex gap-1.5">
              {assistantMode === 'copilot' && (
                <>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => handleCopilotInput('制定内涝疏散预案')}>
                    <FileText className="w-3 h-3 mr-1" />生成预案
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => { setShowDangerZone(true); setShowEvacuationRoute(true); }}>
                    <Layers className="w-3 h-3 mr-1" />显示图层
                  </Button>
                </>
              )}
              {assistantMode === 'qa' && (
                <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => handleCopilotInput('这里存了什么？怎么灭火？')}>
                  <MessageSquare className="w-3 h-3 mr-1" />查看MSDS
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCopilotInput(inputText)}
                placeholder={
                  assistantMode === 'copilot' ? '输入需求，如"制定内涝疏散预案"...' :
                  assistantMode === 'training' ? '培训模式：在地图部署资源...' :
                  '选中实体后提问...'
                }
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                onClick={() => handleCopilotInput(inputText)}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`overflow-y-auto ${className}`} style={{ scrollbarWidth: 'thin' }}>{children}</div>;
}
