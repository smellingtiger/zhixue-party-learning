'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Zap,
  ChevronRight,
  Brain,
  TrendingUp,
  Clock,
  Skull,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CampaignPlan, DecisionPlanGroup, PlanSimulationResult } from '@/lib/campaign-plans';

interface PlanSelectorProps {
  planGroup: DecisionPlanGroup;
  onSimulatePlan: (plan: CampaignPlan) => void;
  onExecutePlan: (plan: CampaignPlan) => void;
  onClose: () => void;
}

// 方案卡片组件
function PlanCard({ 
  plan, 
  index, 
  isRecommended,
  onSimulate, 
  onExecute 
}: { 
  plan: CampaignPlan; 
  index: number;
  isRecommended: boolean;
  onSimulate: () => void;
  onExecute: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      rescue: 'bg-red-500/20 text-red-400 border-red-500/30',
      evacuation: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      containment: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      medical: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      investigation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rescue': return <Shield className="w-4 h-4" />;
      case 'evacuation': return <Truck className="w-4 h-4" />;
      case 'containment': return <CheckCircle className="w-4 h-4" />;
      case 'medical': return <Users className="w-4 h-4" />;
      case 'investigation': return <Brain className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-400';
    if (rate >= 60) return 'text-amber-400';
    if (rate >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`bg-slate-900/95 backdrop-blur-md border rounded-xl overflow-hidden transition-all ${
        isRecommended ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-700'
      }`}
    >
      {/* 方案头部 */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getCategoryColor(plan.category)} text-xs`}>
                {getCategoryIcon(plan.category)}
                <span className="ml-1">{plan.category === 'rescue' ? '救援' : plan.category === 'evacuation' ? '疏散' : plan.category === 'containment' ? '管控' : plan.category === 'medical' ? '医疗' : '调查'}</span>
              </Badge>
              {isRecommended && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  AI推荐
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
            <p className="text-sm text-slate-400">{plan.description}</p>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        {/* 快速指标 */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${getSuccessRateColor(plan.simulationResult.successRate)}`} />
            <span className={`text-sm font-bold ${getSuccessRateColor(plan.simulationResult.successRate)}`}>
              {plan.simulationResult.successRate}%
            </span>
            <span className="text-xs text-slate-500">成功率</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">{plan.simulationResult.estimatedDuration}</span>
            <span className="text-xs text-slate-500">分钟</span>
          </div>
          <div className="flex items-center gap-1">
            <Skull className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">{plan.simulationResult.estimatedCasualties}</span>
            <span className="text-xs text-slate-500">预估伤亡</span>
          </div>
        </div>
      </div>

      {/* 展开详情 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-700"
          >
            <div className="p-4 space-y-4">
              {/* AI参谋点评 */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">AI参谋分析</span>
                </div>
                <p className="text-sm text-slate-300">{plan.simulationResult.aiComment}</p>
              </div>

              {/* 岗位配置 */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  参与岗位
                </h4>
                <div className="space-y-2">
                  {plan.requiredRoles.map((role, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${role.isCritical ? 'bg-red-400' : 'bg-blue-400'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-200">{role.roleName}</p>
                        <p className="text-xs text-slate-400">{role.actions.join('、')}</p>
                        {role.isCritical && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] mt-1">
                            关键岗位
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 资源需求 */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  资源需求
                </h4>
                <div className="flex flex-wrap gap-2">
                  {plan.resources.map((resource, idx) => (
                    <Badge key={idx} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {resource.name}: {resource.quantity}{resource.unit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 风险评估 */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  主要风险
                </h4>
                <div className="space-y-2">
                  {plan.risks.map((risk, idx) => (
                    <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-red-300">{risk.description}</span>
                        <Badge className={`text-[10px] ${
                          risk.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          risk.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          risk.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {risk.severity === 'critical' ? '极高' : risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
                        </Badge>
                      </div>
                      {risk.mitigation && (
                        <p className="text-xs text-slate-400">缓解措施: {risk.mitigation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 前置条件 */}
              {plan.prerequisites.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">前置条件</h4>
                  <div className="space-y-1">
                    {plan.prerequisites.map((pre, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle className="w-3 h-3 text-slate-500" />
                        {pre}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulate();
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  模拟推演
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecute();
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  执行方案
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 方案模拟结果预览组件
export function PlanSimulationPreview({ 
  result, 
  planName,
  onClose 
}: { 
  result: PlanSimulationResult; 
  planName: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 200 }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            方案推演结果
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-300 font-bold">{planName}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              result.successRate >= 80 ? 'text-emerald-400' :
              result.successRate >= 60 ? 'text-amber-400' :
              result.successRate >= 40 ? 'text-orange-400' :
              'text-red-400'
            }`}>
              {result.successRate}%
            </div>
            <div className="text-xs text-slate-500">成功率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{result.estimatedCasualties}</div>
            <div className="text-xs text-slate-500">预估伤亡</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{result.estimatedDuration}</div>
            <div className="text-xs text-slate-500">预计时长(分)</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">关键风险</h4>
            <div className="space-y-1">
              {result.keyRisks.map((risk, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  {risk}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-2">资源需求</h4>
            <div className="space-y-1">
              {result.resourceRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {req}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">AI参谋建议</span>
            </div>
            <p className="text-sm text-slate-300">{result.aiComment}</p>
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white"
          onClick={onClose}
        >
          关闭预览
        </Button>
      </div>
    </motion.div>
  );
}

export default function PlanSelector({ planGroup, onSimulatePlan, onExecutePlan, onClose }: PlanSelectorProps) {
  const [simulatingPlan, setSimulatingPlan] = useState<CampaignPlan | null>(null);

  const handleSimulate = (plan: CampaignPlan) => {
    setSimulatingPlan(plan);
  };

  const handleExecute = (plan: CampaignPlan) => {
    onExecutePlan(plan);
  };

  // 找出AI推荐的方案（成功率最高且伤亡最少的）
  const recommendedPlan = planGroup.plans.reduce((best, current) => {
    const bestScore = best.simulationResult.successRate - best.simulationResult.estimatedCasualties * 0.5;
    const currentScore = current.simulationResult.successRate - current.simulationResult.estimatedCasualties * 0.5;
    return currentScore > bestScore ? current : best;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 90 }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 100 }}
      >
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 pointer-events-auto max-h-[80vh] overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">选择行动方案</h2>
              <p className="text-sm text-slate-400 mt-1">{planGroup.decisionDescription}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* AI推荐 */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">AI参谋推荐</span>
            </div>
            <p className="text-sm text-slate-300">{planGroup.aiRecommendation}</p>
          </div>

          {/* 方案列表 */}
          <div className="space-y-3">
            {planGroup.plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                isRecommended={plan.id === recommendedPlan.id}
                onSimulate={() => handleSimulate(plan)}
                onExecute={() => handleExecute(plan)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* 模拟结果预览 */}
      <AnimatePresence>
        {simulatingPlan && (
          <PlanSimulationPreview
            result={simulatingPlan.simulationResult}
            planName={simulatingPlan.name}
            onClose={() => setSimulatingPlan(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
