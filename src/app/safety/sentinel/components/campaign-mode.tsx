'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealDisasterCase } from '@/lib/real-disaster-cases';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SkipForward, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Radio, 
  Shield,
  Zap,
  Play,
  RotateCcw,
  CheckCircle,
  X
} from 'lucide-react';
import type { FlowLine, MovingResource } from '@/components/map-view';
import type { CampaignPlan, ExecutionDeviation } from '@/lib/campaign-plans';
import { getPlansForDecision } from '@/lib/campaign-plans';
import dynamic from 'next/dynamic';

// 动态导入方案选择器
const PlanSelector = dynamic(() => import('./plan-selector'), { ssr: false });

// 角色行动脚本
interface RoleAction {
  role: string;
  action: string;
  delay: number;
}

// 战役阶段
type CampaignPhase = 'narrative' | 'plan_selection' | 'plan_simulation' | 'plan_execution' | 'outcome';

export interface CampaignState {
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  narration: string;
  speaker: string;
  showDecision: boolean;
  currentDecisionIndex: number;
  activeEntityId: string | null;
  highlightEntityIds: string[];
  sceneProgress: number;
  totalScenes: number;
  flowLines: FlowLine[];
  movingResources: MovingResource[];
  // 剧情推演状态
  playerRoleId?: string | null;
  playerRoleLevel?: string | null;
  playerDepartment?: string;
  currentSituation?: string;
}

interface CampaignModeProps {
  disasterCase: RealDisasterCase;
  onComplete: (report: any) => void;
  onStateChange?: (state: CampaignState) => void;
}

// 角色行动气泡组件
function RoleActionBubble({ actions }: { actions: RoleAction[] }) {
  const [visibleActions, setVisibleActions] = useState<RoleAction[]>([]);

  useEffect(() => {
    setVisibleActions([]);
    actions.forEach((action, index) => {
      setTimeout(() => {
        setVisibleActions(prev => [...prev, action]);
      }, action.delay * 1000);
    });
  }, [actions]);

  return (
    <AnimatePresence>
      {visibleActions.map((action, idx) => (
        <motion.div
          key={`${action.role}-${idx}`}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: 'spring', damping: 20 }}
          className="flex items-start gap-2 mb-2"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 max-w-xs">
            <p className="text-xs font-bold text-blue-400">{action.role}</p>
            <p className="text-xs text-slate-300">{action.action}</p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// 方案执行结果组件
function PlanExecutionResult({ 
  plan, 
  deviations,
  onContinue,
  onRetry
}: { 
  plan: CampaignPlan; 
  deviations: ExecutionDeviation[];
  onContinue: () => void;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 200 }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 pointer-events-auto max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white">方案执行结果</h3>
          <p className="text-sm text-slate-400 mt-1">{plan.name}</p>
        </div>

        {/* 执行偏差 */}
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            实际执行偏差
          </h4>
          {deviations.map((deviation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.3 }}
              className={`border rounded-lg p-3 ${
                deviation.couldBePrevented 
                  ? 'bg-amber-500/10 border-amber-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-200">
                  {deviation.type === 'timing' ? '时机偏差' :
                   deviation.type === 'resource' ? '资源偏差' :
                   deviation.type === 'communication' ? '通信偏差' :
                   deviation.type === 'weather' ? '天气偏差' : '意外事件'}
                </span>
                {deviation.couldBePrevented && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                    可预防
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300 mb-1">{deviation.description}</p>
              <p className="text-xs text-red-400">影响: {deviation.impact}</p>
            </motion.div>
          ))}
        </div>

        {/* AI参谋分析 */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">AI参谋分析</span>
          </div>
          <p className="text-sm text-slate-300">
            {deviations.some(d => d.couldBePrevented) 
              ? '方案存在可改进空间。部分偏差可以通过更完善的预案避免，建议重新评估方案细节。'
              : '方案执行基本顺利，偏差主要来自不可控因素。整体决策方向正确。'}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
            onClick={onRetry}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重新选择方案
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={onContinue}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            继续推演
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CampaignMode({ disasterCase, onComplete, onStateChange }: CampaignModeProps) {
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [phase, setPhase] = useState<CampaignPhase>('narrative');
  const [narration, setNarration] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [roleActions, setRoleActions] = useState<RoleAction[]>([]);
  const [flowLines, setFlowLines] = useState<FlowLine[]>([]);
  const [movingResources, setMovingResources] = useState<MovingResource[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CampaignPlan | null>(null);
  const [executionDeviations, setExecutionDeviations] = useState<ExecutionDeviation[]>([]);
  const [decisions, setDecisions] = useState<Array<{ decisionIndex: number; planId: string }>>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 获取当前决策点的方案
  const currentPlanGroup = useMemo(() => {
    return getPlansForDecision(currentDecisionIndex);
  }, [currentDecisionIndex]);

  // 生成战役报告
  const generateReport = useCallback(() => {
    const decisionCount = decisions.length;
    const totalCasualties = decisions.reduce((sum, d) => {
      const plan = getPlansForDecision(d.decisionIndex)?.plans.find(p => p.id === d.planId);
      return sum + (plan?.simulationResult.estimatedCasualties || 0);
    }, 0);

    const speedScore = Math.min(100, 90 - decisionCount * 2);
    const resourceScore = Math.min(100, 85 + Math.random() * 15);
    const casualtyScore = Math.max(0, 100 - totalCasualties * 2);
    const opinionScore = Math.min(100, 75 + Math.random() * 20);
    const totalScore = Math.round((speedScore + resourceScore + casualtyScore + opinionScore) / 4);

    return {
      score: totalScore,
      speedScore,
      resourceScore,
      casualtyScore,
      opinionScore,
      decisionCount,
      totalCasualties,
      decisionStyle: decisionCount <= 2 ? '快速决断型' : decisionCount <= 4 ? '谨慎分析型' : '深思熟虑型',
      aiComment: `您在本次战役中选择了${decisionCount}个行动方案，预估总伤亡${totalCasualties}人。整体决策风格${decisionCount <= 2 ? '果断' : '谨慎'}，资源调配较为${resourceScore > 85 ? '高效' : '合理'}。`,
    };
  }, [decisions]);

  const finishCampaign = useCallback(() => {
    const report = generateReport();
    onComplete(report);
  }, [generateReport, onComplete]);

  // 推进到下一个决策点或结束
  const advanceToNextDecision = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setCurrentDecisionIndex(prev => {
      const next = prev + 1;
      if (next >= disasterCase.decisionPoints.length) {
        finishCampaign();
        return prev;
      }
      // 延迟后显示下一个决策点的叙事
      setTimeout(() => {
        setPhase('narrative');
        setIsTransitioning(false);
      }, 1000);
      return next;
    });
  }, [isTransitioning, disasterCase.decisionPoints.length, finishCampaign]);

  // 显示决策点前的叙事
  useEffect(() => {
    if (phase !== 'narrative') return;

    const decision = disasterCase.decisionPoints[currentDecisionIndex];
    if (!decision) {
      finishCampaign();
      return;
    }

    // 设置叙事内容
    setNarration(`当前情况：${decision.description}`);
    setSpeaker('应急指挥');

    // 设置角色行动
    setRoleActions([
      { role: '消防指挥', action: '火势/灾情评估报告', delay: 0.5 },
      { role: '医疗组', action: '伤员情况和医疗资源报告', delay: 1 },
      { role: '气象组', action: '气象条件对救援的影响分析', delay: 1.5 },
      { role: '交通组', action: '道路通行和交通管制情况', delay: 2 },
    ]);

    // 3秒后显示方案选择
    const timer = setTimeout(() => {
      setPhase('plan_selection');
      setRoleActions([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [phase, currentDecisionIndex, disasterCase, finishCampaign]);

  // 处理方案模拟
  const handleSimulatePlan = (plan: CampaignPlan) => {
    setSelectedPlan(plan);
    setPhase('plan_simulation');
  };

  // 处理方案执行
  const handleExecutePlan = (plan: CampaignPlan) => {
    setSelectedPlan(plan);
    
    // 随机选择一个偏差场景
    const randomScenario = plan.deviationScenarios[Math.floor(Math.random() * plan.deviationScenarios.length)];
    setExecutionDeviations(randomScenario);
    
    // 记录决策
    setDecisions(prev => [...prev, { decisionIndex: currentDecisionIndex, planId: plan.id }]);
    
    setPhase('plan_execution');
  };

  // 处理执行结果继续
  const handleExecutionContinue = () => {
    setPhase('outcome');
    setSelectedPlan(null);
    setExecutionDeviations([]);
    
    // 显示结果叙事
    setNarration('方案执行完毕，正在评估效果...');
    setSpeaker('系统');
    
    // 2秒后推进到下一个决策点
    setTimeout(() => {
      advanceToNextDecision();
    }, 2000);
  };

  // 处理重新选择方案
  const handleRetryPlan = () => {
    setPhase('plan_selection');
    setSelectedPlan(null);
    setExecutionDeviations([]);
  };

  // 通知父组件状态变化
  useEffect(() => {
    const newState = {
      mapCenter: { lat: disasterCase.location.lat, lng: disasterCase.location.lng },
      mapZoom: 13,
      narration,
      speaker,
      showDecision: phase === 'plan_selection',
      currentDecisionIndex,
      activeEntityId: null,
      highlightEntityIds: [],
      sceneProgress: currentDecisionIndex,
      totalScenes: disasterCase.decisionPoints.length,
      flowLines,
      movingResources,
    };

    onStateChange?.(newState);
  }, [narration, speaker, phase, currentDecisionIndex, disasterCase, onStateChange, flowLines, movingResources]);

  // 自动开始
  useEffect(() => {
    setPhase('narrative');
  }, []);

  if (!currentPlanGroup) return null;

  return (
    <>
      {/* 左上角：剧情介绍面板 */}
      <AnimatePresence>
        {narration && phase === 'narrative' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-16 left-4 max-w-md pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                  <Radio className="w-3 h-3 mr-1" />
                  {speaker}
                </Badge>
                <span className="text-xs text-slate-500">决策点 {currentDecisionIndex + 1}/{disasterCase.decisionPoints.length}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {narration}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右侧：角色行动面板 */}
      <AnimatePresence>
        {roleActions.length > 0 && phase === 'narrative' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 w-64 pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">各单位动态</span>
              </div>
              <RoleActionBubble actions={roleActions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 方案选择界面 */}
      <AnimatePresence>
        {phase === 'plan_selection' && currentPlanGroup && (
          <PlanSelector
            planGroup={currentPlanGroup}
            onSimulatePlan={handleSimulatePlan}
            onExecutePlan={handleExecutePlan}
            onClose={() => {}}
          />
        )}
      </AnimatePresence>

      {/* 方案执行结果 */}
      <AnimatePresence>
        {phase === 'plan_execution' && selectedPlan && (
          <PlanExecutionResult
            plan={selectedPlan}
            deviations={executionDeviations}
            onContinue={handleExecutionContinue}
            onRetry={handleRetryPlan}
          />
        )}
      </AnimatePresence>

      {/* 结果叙事 */}
      <AnimatePresence>
        {phase === 'outcome' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-400">方案执行完毕，正在进入下一阶段...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 右上角：控制按钮 */}
      <div className="absolute top-16 right-4" style={{ zIndex: 100 }}>
        <Button
          variant="ghost"
          size="sm"
          className="bg-slate-900/50 text-slate-400 hover:text-white"
          onClick={() => advanceToNextDecision()}
        >
          <SkipForward className="w-4 h-4 mr-1" />
          跳过
        </Button>
      </div>

      {/* 决策进度指示器 */}
      <div className="absolute top-16 right-4 mt-10" style={{ zIndex: 100 }}>
        <div className="flex flex-col items-center gap-1 bg-slate-900/50 backdrop-blur-sm rounded-full px-2 py-3">
          <MapPin className="w-3 h-3 text-amber-400 mb-1" />
          {disasterCase.decisionPoints.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 rounded-full transition-all ${
                idx === currentDecisionIndex
                  ? 'bg-amber-400 h-6'
                  : idx < currentDecisionIndex
                  ? 'bg-emerald-400 h-1.5'
                  : 'bg-slate-600 h-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
