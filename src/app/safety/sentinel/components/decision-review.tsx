/**
 * 模块二：AI决策复盘教练
 * 让领导干部"看见自己的决策模式"
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Clock, AlertTriangle, Users,
  BarChart3, Target, Zap, Shield, ChevronRight,
  Download, Share2, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CrisisReport } from './crisis-sandbox';

interface DecisionReviewProps {
  report: CrisisReport;
  onRestart: () => void;
}

interface RadarData {
  label: string;
  value: number;
  fullMark: number;
}

export default function DecisionReview({ report, onRestart }: DecisionReviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'decisions' | 'comparison' | 'insights'>('overview');

  const analysis = useMemo(() => {
    const decisions = report.decisions;
    const totalDecisions = decisions.length;

    // 决策节奏分析
    const avgDecisionTime = totalDecisions > 0
      ? decisions.reduce((s, d) => s + d.cost.time, 0) / totalDecisions
      : 0;
    const decisionSpeedType = avgDecisionTime < 10 ? '快速决断型' : avgDecisionTime < 20 ? '审慎平衡型' : '深思熟虑型';

    // 风险偏好分析
    const aggressiveDecisions = decisions.filter(d => d.cost.time < 10).length;
    const conservativeDecisions = decisions.filter(d => d.cost.time > 20).length;
    const riskType = aggressiveDecisions > conservativeDecisions ? '风险偏进取型' : conservativeDecisions > aggressiveDecisions ? '风险偏保守型' : '风险平衡型';

    // 注意力分配
    const resourceFocus = decisions.filter(d => d.description.includes('资源') || d.description.includes('人员')).length;
    const safetyFocus = decisions.filter(d => d.description.includes('安全') || d.description.includes('疏散')).length;
    const mediaFocus = decisions.filter(d => d.description.includes('媒体') || d.description.includes('舆情')).length;
    const mainFocus = resourceFocus > safetyFocus && resourceFocus > mediaFocus ? '资源调度' : safetyFocus > mediaFocus ? '安全保障' : '舆情管控';

    // 协调效能
    const crossDeptDecisions = decisions.filter(d =>
      d.chosenOption.includes('协调') || d.chosenOption.includes('联合') || d.chosenOption.includes('统一')
    ).length;
    const coordinationScore = totalDecisions > 0 ? (crossDeptDecisions / totalDecisions) * 100 : 0;

    return {
      decisionSpeedType,
      avgDecisionTime,
      riskType,
      aggressiveDecisions,
      conservativeDecisions,
      mainFocus,
      resourceFocus,
      safetyFocus,
      mediaFocus,
      coordinationScore,
      radarData: [
        { label: '决策速度', value: report.analysis.decisionSpeed, fullMark: 100 },
        { label: '资源效率', value: report.analysis.resourceEfficiency, fullMark: 100 },
        { label: '伤亡控制', value: report.analysis.casualtyControl, fullMark: 100 },
        { label: '舆情管控', value: report.analysis.publicOpinion, fullMark: 100 },
        { label: '风险管理', value: report.analysis.riskManagement, fullMark: 100 },
      ] as RadarData[],
    };
  }, [report]);

  const peerComparison = useMemo(() => ({
    decisionSpeed: { user: report.analysis.decisionSpeed, peer: 65, top: 85 },
    resourceEfficiency: { user: report.analysis.resourceEfficiency, peer: 60, top: 80 },
    casualtyControl: { user: report.analysis.casualtyControl, peer: 70, top: 90 },
    publicOpinion: { user: report.analysis.publicOpinion, peer: 55, top: 80 },
    riskManagement: { user: report.analysis.riskManagement, peer: 60, top: 85 },
  }), [report]);

  const insights = useMemo(() => {
    const insightsList: { type: 'strength' | 'weakness' | 'suggestion'; title: string; description: string }[] = [];

    if (report.analysis.decisionSpeed > 80) {
      insightsList.push({
        type: 'strength',
        title: '决策果断',
        description: '您在紧急情况下能够快速做出决策，这有助于抓住黄金救援时间。',
      });
    } else if (report.analysis.decisionSpeed < 40) {
      insightsList.push({
        type: 'weakness',
        title: '决策偏慢',
        description: '您的决策时间较长，在紧急情况下可能延误最佳处置时机。建议在信息不全时敢于决断。',
      });
    }

    if (report.analysis.resourceEfficiency > 70) {
      insightsList.push({
        type: 'strength',
        title: '资源调配高效',
        description: '您能够合理利用有限资源，避免浪费。',
      });
    } else {
      insightsList.push({
        type: 'suggestion',
        title: '资源管理待提升',
        description: '建议加强资源统筹规划能力，建立分级分类的资源调度机制。',
      });
    }

    if (report.analysis.publicOpinion < 40) {
      insightsList.push({
        type: 'weakness',
        title: '舆情应对不足',
        description: '舆情指数偏低，建议加强信息发布和舆论引导能力，及时回应社会关切。',
      });
    }

    if (report.analysis.riskManagement > 75) {
      insightsList.push({
        type: 'strength',
        title: '风险意识强',
        description: '您具有较好的风险预判能力，能够提前防范次生灾害。',
      });
    }

    return insightsList;
  }, [report]);

  return (
    <div className="h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* 头部 */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">个人决策风格与能力图谱分析报告</h1>
                <p className="text-xs text-slate-400">基于 {report.disasterCase.name} 推演数据生成</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                <Download className="w-3.5 h-3.5 mr-1" />导出报告
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                <Share2 className="w-3.5 h-3.5 mr-1" />分享
              </Button>
              <Button size="sm" onClick={onRestart} className="bg-indigo-600 hover:bg-indigo-700">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />重新推演
              </Button>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex gap-1 mt-4">
            {(['overview', 'decisions', 'comparison', 'insights'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab === 'overview' && '总览'}
                {tab === 'decisions' && '决策回溯'}
                {tab === 'comparison' && '同行对比'}
                {tab === 'insights' && 'AI洞察'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 综合评分 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {report.score}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">综合评分</p>
                  <Badge className={`mt-2 ${
                    report.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    report.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.score >= 80 ? '优秀' : report.score >= 60 ? '良好' : '待提升'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-slate-300">决策节奏</span>
                  </div>
                  <p className="text-lg font-bold text-white">{analysis.decisionSpeedType}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    平均决策时间: {analysis.avgDecisionTime.toFixed(1)} 分钟
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      果断: {analysis.aggressiveDecisions}次
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      审慎: {analysis.conservativeDecisions}次
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-slate-300">风险偏好</span>
                  </div>
                  <p className="text-lg font-bold text-white">{analysis.riskType}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    主要关注点: {analysis.mainFocus}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      资源: {analysis.resourceFocus}次
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      安全: {analysis.safetyFocus}次
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 五维能力雷达图 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  五维能力评估
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {analysis.radarData.map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="relative w-24 h-24 mx-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            stroke={item.value >= 80 ? '#10b981' : item.value >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            strokeDasharray={`${(item.value / 100) * 264} 264`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{Math.round(item.value)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 协调效能 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  跨部门协调效能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={analysis.coordinationScore} className="h-2" />
                  </div>
                  <span className="text-sm font-bold text-white w-12 text-right">
                    {Math.round(analysis.coordinationScore)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  您在 {report.decisions.length} 次决策中，有 {report.decisions.filter(d =>
                    d.chosenOption.includes('协调') || d.chosenOption.includes('联合')
                  ).length} 次体现了跨部门协调意识。
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'decisions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white mb-4">决策时间轴</h2>
            {report.decisions.map((decision, idx) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-indigo-400">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                            {decision.time}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            耗时 {decision.cost.time} 分钟
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{decision.description}</p>
                        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <p className="text-sm text-indigo-300">
                            <ChevronRight className="w-3.5 h-3.5 inline mr-1" />
                            {decision.chosenOption}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {decision.consequences.map((c, ci) => (
                            <span key={ci} className="text-xs text-slate-500">
                              结果: {c}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-slate-500">资源消耗: {decision.cost.resources}%</span>
                          <span className="text-slate-500">舆情影响: {decision.cost.reputation > 0 ? '+' : ''}{decision.cost.reputation}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  与同级别干部对比
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(peerComparison).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">
                        {key === 'decisionSpeed' ? '决策速度' :
                         key === 'resourceEfficiency' ? '资源效率' :
                         key === 'casualtyControl' ? '伤亡控制' :
                         key === 'publicOpinion' ? '舆情管控' : '风险管理'}
                      </span>
                      <div className="flex gap-3">
                        <span className="text-indigo-400">您: {Math.round(data.user)}</span>
                        <span className="text-slate-500">同级: {data.peer}</span>
                        <span className="text-amber-400">优秀: {data.top}</span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-slate-600 rounded-full" style={{ width: `${data.peer}%` }} />
                      <div className="absolute h-full bg-amber-500/30 rounded-full" style={{ width: `${data.top}%` }} />
                      <motion.div
                        className="absolute h-full bg-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.user}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 mb-2">您的排名</p>
                  <p className="text-3xl font-bold text-white">前 32%</p>
                  <p className="text-xs text-slate-500 mt-1">在同级别应急指挥干部中</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 mb-2">相对优势</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {report.analysis.decisionSpeed > peerComparison.decisionSpeed.peer ? '决策速度' :
                     report.analysis.resourceEfficiency > peerComparison.resourceEfficiency.peer ? '资源效率' :
                     report.analysis.casualtyControl > peerComparison.casualtyControl.peer ? '伤亡控制' : '舆情管控'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">高于同级平均水平</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white mb-4">AI洞察与建议</h2>
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  insight.type === 'strength' ? 'border-l-emerald-500 bg-emerald-950/10' :
                  insight.type === 'weakness' ? 'border-l-red-500 bg-red-950/10' :
                  'border-l-amber-500 bg-amber-950/10'
                } bg-slate-900 border-slate-800`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        insight.type === 'strength' ? 'bg-emerald-500/20' :
                        insight.type === 'weakness' ? 'bg-red-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        {insight.type === 'strength' && <Zap className="w-4 h-4 text-emerald-400" />}
                        {insight.type === 'weakness' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        {insight.type === 'suggestion' && <Shield className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{insight.title}</h3>
                          <Badge className={`text-xs ${
                            insight.type === 'strength' ? 'bg-emerald-500/20 text-emerald-400' :
                            insight.type === 'weakness' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {insight.type === 'strength' ? '优势' : insight.type === 'weakness' ? '短板' : '建议'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="bg-slate-900 border-slate-800 mt-6">
              <CardHeader>
                <CardTitle className="text-sm text-white">改进建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-indigo-400">1</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      建议参加应急决策模拟训练，提升在信息不全情况下的快速决断能力。
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-indigo-400">2</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      加强跨部门协调演练，建立与消防、医疗、公安等部门的联动机制。
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-indigo-400">3</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      学习舆情管理课程，提升突发事件中的信息发布和舆论引导能力。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
