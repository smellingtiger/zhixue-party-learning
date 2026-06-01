'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Bot, Shield, MapPin, X, History, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// 导入真实灾害案例数据
import {
  realDisasterCases,
  caseToMapEntities,
  getCaseById,
  getDangerZones,
  type RealDisasterCase,
} from '@/lib/real-disaster-cases';
import { wuhanWaterloggingCase } from '@/lib/wuhan-waterlogging-case';
import type { DangerZone, MapEntity2D, FlowLine, MovingResource } from '@/components/map-view';
import type { CampaignState } from './components/campaign-mode';
import type { AgentMessage } from '@/lib/ai-agents';

// 动态导入模块
const CampaignMode = dynamic(() => import('./components/campaign-mode'), { ssr: false });
const CampaignModeV2 = dynamic(() => import('./components/campaign-mode-v2'), { ssr: false });
const AICopilotSidebar = dynamic(() => import('./components/ai-copilot-sidebar'), { ssr: false });
const MapOverlayUI = dynamic(() => import('./components/map-overlay-ui'), { ssr: false });

const MapView = dynamic(() => import('@/components/map-view').then(mod => ({ default: mod.MapView })), {
  ssr: false
});

function CrisisSimulationContent() {
  const searchParams = useSearchParams();

  // 核心状态
  const [selectedCase, setSelectedCase] = useState<RealDisasterCase | null>(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [campaignHistory, setCampaignHistory] = useState<any[]>([]);
  const [currentReport, setCurrentReport] = useState<any>(null);

  // 地图悬浮UI状态 - 进入页面直接显示战役选择
  const [showCaseList, setShowCaseList] = useState(true);
  const [showStartButton, setShowStartButton] = useState(false);

  // 地图状态
  const [mapEntities, setMapEntities] = useState<MapEntity2D[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [showDangerZone, setShowDangerZone] = useState(false);

  // 战役模式地图控制状态
  const [campaignMapCenter, setCampaignMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [campaignMapZoom, setCampaignMapZoom] = useState<number | null>(null);
  const [highlightEntityIds, setHighlightEntityIds] = useState<string[]>([]);
  const [campaignFlowLines, setCampaignFlowLines] = useState<FlowLine[]>([]);
  const [campaignMovingResources, setCampaignMovingResources] = useState<MovingResource[]>([]);
  // 战役剧情推演状态（用于 AI 参谋）
  const [campaignPlayerRoleId, setCampaignPlayerRoleId] = useState<string | null>(null);
  const [campaignPlayerRoleLevel, setCampaignPlayerRoleLevel] = useState<string | null>(null);
  const [campaignPlayerDepartment, setCampaignPlayerDepartment] = useState<string>('应急指挥');
  const [campaignCurrentSituation, setCampaignCurrentSituation] = useState<string>('');
  const [campaignPhaseIndex, setCampaignPhaseIndex] = useState<number>(0);
  const [locationMarkers, setLocationMarkers] = useState<Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    offsetLat?: number;
    offsetLng?: number;
    zIndex?: number;
    highlightRadius?: number;
    highlightColor?: string;
  }>>([]);

  // AI参谋方案发送到会议的桥接状态
  const [advisorMessages, setAdvisorMessages] = useState<AgentMessage[]>([]);

  // 初始化
  useEffect(() => {
    const caseId = searchParams.get('case');
    if (caseId) {
      const caseData = getCaseById(caseId);
      if (caseData) loadCase(caseData);
    }
  }, []);

  const loadCase = useCallback((caseData: RealDisasterCase) => {
    setSelectedCase(caseData);
    const entities = caseToMapEntities(caseData);
    setMapEntities(entities);
    const zones = getDangerZones(caseData);
    setDangerZones(zones);
    setShowDangerZone(zones.length > 0);
    // 选择案例后显示开始按钮，隐藏案例列表
    setShowCaseList(false);
    setShowStartButton(true);
  }, []);

  // 开始战役
  const startCampaign = useCallback(() => {
    if (selectedCase) {
      setShowCopilot(false);
      setShowCampaign(true);
      setShowStartButton(false);
      // 重置战役地图状态
      setCampaignMapCenter({ lat: selectedCase.location.lat, lng: selectedCase.location.lng });
      setCampaignMapZoom(14);
      setHighlightEntityIds([]);
      setCampaignFlowLines([]);
      setCampaignMovingResources([]);
      // 重置参谋消息
      setAdvisorMessages([]);
    }
  }, [selectedCase]);

  // 处理AI参谋发送到会议
  const handleAdvisorMessage = useCallback((message: AgentMessage) => {
    setAdvisorMessages(prev => [...prev, message]);
  }, []);

  // 战役完成
  const handleCampaignComplete = useCallback((report: any) => {
    const fullReport = {
      ...report,
      caseName: selectedCase?.name,
      timestamp: Date.now(),
      score: report.score || Math.floor(Math.random() * 20) + 80,
    };
    setCurrentReport(fullReport);
    setCampaignHistory(prev => [...prev, fullReport]);
    setShowCampaign(false);
    setShowSettlement(true);
    // 清除战役地图状态
    setCampaignMapCenter(null);
    setCampaignMapZoom(null);
    setHighlightEntityIds([]);
    setCampaignFlowLines([]);
    setCampaignMovingResources([]);
  }, [selectedCase]);



  // 查看历史报告
  const viewHistoryReport = useCallback((report: any) => {
    setCurrentReport(report);
    setShowSettlement(true);
  }, []);

  // 关闭结算界面
  const closeSettlement = useCallback(() => {
    setShowSettlement(false);
    setShowCopilot(true);
    setShowStartButton(true);
  }, []);

  // 处理战役状态变化
  const handleCampaignStateChange = useCallback((state: CampaignState) => {
    setCampaignMapCenter(state.mapCenter);
    setCampaignMapZoom(state.mapZoom);
    setHighlightEntityIds(state.highlightEntityIds);
    setCampaignFlowLines(state.flowLines);
    setCampaignMovingResources(state.movingResources);
    // 剧情推演状态
    setCampaignPlayerRoleId(state.playerRoleId ?? null);
    setCampaignPlayerRoleLevel(state.playerRoleLevel ?? null);
    if (state.playerDepartment) setCampaignPlayerDepartment(state.playerDepartment);
    if (state.currentSituation) setCampaignCurrentSituation(state.currentSituation);
    setCampaignPhaseIndex(state.currentDecisionIndex);
  }, []);

  // 处理定位点变化
  const handleLocationMarkersChange = useCallback((markers: Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    offsetLat?: number;
    offsetLng?: number;
    zIndex?: number;
    highlightRadius?: number;
    highlightColor?: string;
  }>) => {
    setLocationMarkers(markers);
  }, []);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* 极简顶部栏 */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm">危机模拟推演</span>
          {selectedCase && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs ml-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {selectedCase.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 历史报告入口 */}
          {campaignHistory.length > 0 && (
            <button
              onClick={() => viewHistoryReport(campaignHistory[campaignHistory.length - 1])}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              历史战绩 ({campaignHistory.length})
            </button>
          )}

          {/* AI参谋开关 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowCopilot(!showCopilot);
              if (!showCopilot) {
                setShowCaseList(false);
              }
            }}
            className={`text-xs ${showCopilot ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
          >
            <Bot className="w-3.5 h-3.5 mr-1" />
            {showCopilot ? '参谋' : '召唤参谋'}
          </Button>

          {/* 选择战役按钮 */}
          {!showCampaign && !showSettlement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCaseList(true);
                setShowStartButton(false);
                setShowCopilot(false);
              }}
              className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <MapPin className="w-3.5 h-3.5 mr-1" />
              选择战役
            </Button>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 地图 */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <MapView
            entities={mapEntities}
            dangerZones={dangerZones}
            showDangerZone={showDangerZone}
            campaignCenter={campaignMapCenter}
            campaignZoom={campaignMapZoom}
            highlightEntityIds={highlightEntityIds}
            flowLines={campaignFlowLines}
            movingResources={campaignMovingResources}
            locationMarkers={locationMarkers}
          />
        </div>

        {/* 战役模式 - 根据案例类型选择不同版本 */}
        {showCampaign && selectedCase && (
          selectedCase.id === 'wuhan-waterlogging-2024' ? (
            <CampaignModeV2
              disasterCase={selectedCase}
              onComplete={handleCampaignComplete}
              onStateChange={handleCampaignStateChange}
              onOpenAdvisor={() => setShowCopilot(true)}
              externalMessages={advisorMessages}
              onLocationMarkersChange={handleLocationMarkersChange}
            />
          ) : (
            <CampaignMode
              disasterCase={selectedCase}
              onComplete={handleCampaignComplete}
              onStateChange={handleCampaignStateChange}
            />
          )
        )}

        {/* 地图悬浮UI */}
        <MapOverlayUI
          selectedCase={selectedCase}
          onSelectCase={loadCase}
          onStartCampaign={startCampaign}
          showCaseList={showCaseList}
          showStartButton={showStartButton}
        />

        {/* AI参谋侧边栏 */}
        <AICopilotSidebar
          isOpen={showCopilot}
          onClose={() => setShowCopilot(false)}
          onSelectCase={loadCase}
          onStartCampaign={startCampaign}
          selectedCase={selectedCase}
          campaignHistory={campaignHistory}
          onViewReport={viewHistoryReport}
          isInCampaign={showCampaign}
          onAdvisorMessage={handleAdvisorMessage}
          currentPhaseIndex={campaignPhaseIndex}
          playerRoleId={campaignPlayerRoleId}
          playerRoleLevel={campaignPlayerRoleLevel}
          playerDepartment={campaignPlayerDepartment}
          currentSituation={campaignCurrentSituation}
        />

        {/* 战役结算界面 */}
        <AnimatePresence>
          {showSettlement && currentReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
              >
                {/* 结算头部 */}
                <div className="p-6 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">战役结算</h2>
                      <p className="text-slate-400 text-sm mt-1">{currentReport.caseName}</p>
                    </div>
                    <button
                      onClick={closeSettlement}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* 评分 */}
                <div className="p-6">
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                      {currentReport.score}
                    </div>
                    <p className="text-slate-400 mt-2">综合评分</p>
                    <div className="flex justify-center gap-4 mt-4">
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                        {currentReport.decisionStyle || '快速决断型'}
                      </Badge>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {currentReport.riskPreference || '风险偏进取型'}
                      </Badge>
                    </div>
                  </div>

                  {/* 维度评分 */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: '决策速度', score: currentReport.speedScore || 85, color: 'bg-blue-500' },
                      { label: '资源效率', score: currentReport.resourceScore || 90, color: 'bg-emerald-500' },
                      { label: '伤亡控制', score: currentReport.casualtyScore || 75, color: 'bg-red-500' },
                      { label: '舆情管控', score: currentReport.opinionScore || 80, color: 'bg-amber-500' },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-800 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="text-white font-bold">{item.score}分</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI参谋点评 */}
                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-indigo-400" />
                      <span className="text-indigo-400 font-medium">AI参谋点评</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {currentReport.aiComment ||
                        '您在本次战役中表现出果断的决策风格，能够迅速响应突发状况。资源调配较为高效，但在舆情管控方面还有提升空间。建议加强跨部门协调训练，提高综合应急指挥能力。'}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3">
                    <Button
                      onClick={closeSettlement}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      返回指挥室
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        closeSettlement();
                        setShowCopilot(true);
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      选择新战役
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 选中案例提示 */}
        {selectedCase && !showCampaign && !showSettlement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl border border-slate-200 p-4 shadow-lg max-w-sm"
            style={{ zIndex: 100 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="font-bold text-slate-800">{selectedCase.name}</span>
            </div>
            <p className="text-xs text-slate-500">{selectedCase.description.slice(0, 80)}...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CrisisSimulationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">加载危机模拟推演系统...</p>
        </div>
      </div>
    }>
      <CrisisSimulationContent />
    </Suspense>
  );
}
