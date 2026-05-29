'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, Check, CheckCircle, Clock,
  MapPin, Shield, Truck, RotateCcw, X, FileText,
  BarChart3, Bot, Siren, Brain, BookOpen, Eye,
  ChevronRight, Pause, Play, Users, Zap, Radio,
  TrendingUp, Target, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';

// 导入真实灾害案例数据
import {
  realDisasterCases,
  caseToMapEntities,
  getCaseById,
  getDangerZones,
  type RealDisasterCase,
} from '@/lib/real-disaster-cases';
import type { DangerZone } from '@/components/map-view';

// 动态导入三大模块
const CrisisSandbox = dynamic(() => import('./components/crisis-sandbox'), { ssr: false });
const DecisionReview = dynamic(() => import('./components/decision-review'), { ssr: false });
const CaseLibrary = dynamic(() => import('./components/case-library'), { ssr: false });

const MapView = dynamic(() => import('@/components/map-view').then(mod => ({ default: mod.MapView })), {
  ssr: false
});

// 模块类型
type ModuleType = 'map' | 'sandbox' | 'review' | 'library';

interface MapEntity {
  id: string;
  x: number;
  y: number;
  type: 'sensor' | 'team' | 'vehicle' | 'hazard' | 'shelter' | 'hospital' | 'fire_station' | 'police_station' | 'ambulance' | 'fire_truck' | 'police_car' | 'traffic_light';
  status?: 'normal' | 'warning' | 'danger';
  label?: string;
  data?: any;
}

interface StreamMessage {
  id: string;
  type: 'text' | 'card' | 'event' | 'timeline';
  role: 'user' | 'assistant' | 'system';
  content: any;
  timestamp: string;
}

interface ActiveFlowLine {
  id: string;
  fromLat: number; fromLng: number;
  toLat: number; toLng: number;
  size: number;
  color: string;
  label: string;
  createdAt: number;
  duration: number;
}

interface EmergencyEvent {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'typhoon' | 'chemical' | 'explosion' | 'forest_fire';
  typeName: string;
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityName: string;
  description: string;
  reportedAt: string;
}

interface RescueResourceData {
  id: string;
  type: 'fire_truck' | 'ambulance' | 'rescue_team' | 'police_car' | 'engineering_vehicle';
  typeName: string;
  name: string;
  currentLocation: { lat: number; lng: number };
  status: 'standby' | 'dispatched' | 'on_mission';
  statusName: string;
  iconColor: string;
  total: number;
  available: number;
  isRecommended: boolean;
  isSelected: boolean;
}

interface DispatchedResource {
  resourceId: string;
  resourceName: string;
  reason: string;
  estimatedArrival: string;
}

interface RescuePlan {
  plan: string;
  analysis: string;
  dispatchedResources: DispatchedResource[];
  steps: string[];
  estimatedDuration: string;
  riskWarning: string;
}

// 从真实案例生成应急事件
function caseToEvent(caseData: RealDisasterCase): EmergencyEvent {
  const typeNameMap: Record<string, string> = {
    explosion: '爆炸事故',
    flood: '洪涝灾害',
    earthquake: '地震灾害',
    forest_fire: '森林火灾',
    chemical: '危化品事故',
    fire: '火灾事故',
    typhoon: '台风灾害',
  };

  return {
    id: `${caseData.id}-event`,
    type: caseData.type as any,
    typeName: typeNameMap[caseData.type] || caseData.type,
    location: caseData.location,
    severity: caseData.severity,
    severityName: caseData.severity === 'critical' ? '特别重大' : caseData.severity === 'high' ? '重大' : '较大',
    description: caseData.description,
    reportedAt: caseData.date,
  };
}

// 从真实案例生成救援资源
function caseToResources(caseData: RealDisasterCase): RescueResourceData[] {
  const colorMap: Record<string, string> = {
    fire_brigade: '#ef4444',
    armed_police: '#3b82f6',
    army: '#6366f1',
    militia: '#8b5cf6',
    medical_team: '#34d399',
    engineering: '#f59e0b',
    volunteer: '#10b981',
  };

  const typeNameMap: Record<string, string> = {
    fire_brigade: '消防队',
    armed_police: '武警',
    army: '解放军',
    militia: '民兵',
    medical_team: '医疗队',
    engineering: '工程队',
    volunteer: '志愿者',
  };

  return caseData.rescueForces.map((force, idx) => ({
    id: force.id,
    type: force.type === 'fire_brigade' ? 'fire_truck' :
          force.type === 'medical_team' ? 'ambulance' :
          force.type === 'armed_police' ? 'police_car' :
          force.type === 'engineering' ? 'engineering_vehicle' : 'rescue_team',
    typeName: typeNameMap[force.type] || '救援队',
    name: force.name,
    currentLocation: { lat: force.lat, lng: force.lng },
    status: 'standby',
    statusName: '待命',
    iconColor: colorMap[force.type] || '#60a5fa',
    total: 1,
    available: 1,
    isRecommended: false,
    isSelected: false,
  }));
}

export default function EmergencySentinel() {
  const searchParams = useSearchParams();
  const disasterType = searchParams.get('disaster') || localStorage.getItem('selectedDisaster') || 'flood';

  // 当前激活的模块
  const [activeModule, setActiveModule] = useState<ModuleType>('map');
  // 当前选中的真实案例
  const [selectedRealCase, setSelectedRealCase] = useState<RealDisasterCase | null>(null);
  // 推演报告
  const [crisisReport, setCrisisReport] = useState<any>(null);

  const [clockTime, setClockTime] = useState('');
  const [flowLines, setFlowLines] = useState<ActiveFlowLine[]>([]);
  const [mapEntities, setMapEntities] = useState<MapEntity[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const [rescueResources, setRescueResources] = useState<RescueResourceData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EmergencyEvent | null>(null);
  const [rescuePlan, setRescuePlan] = useState<RescuePlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [movingResources, setMovingResources] = useState<any[]>([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [disasterPhase, setDisasterPhase] = useState<'active' | 'responding' | 'resolved'>('active');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);

  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [scenarioActive, setScenarioActive] = useState(false);

  // 时钟
  useEffect(() => {
    setClockTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setClockTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 初始化真实案例场景
  useEffect(() => {
    const caseId = searchParams.get('case');
    if (caseId) {
      const caseData = getCaseById(caseId);
      if (caseData) {
        loadRealCase(caseData);
      }
    } else {
      // 默认加载郑州720案例
      const defaultCase = realDisasterCases.find(c => c.id === 'zhengzhou-720');
      if (defaultCase) {
        loadRealCase(defaultCase);
      }
    }
  }, []);

  const loadRealCase = useCallback((caseData: RealDisasterCase) => {
    setSelectedRealCase(caseData);
    const entities = caseToMapEntities(caseData);
    setMapEntities(entities.map(e => ({
      id: e.id,
      x: e.lat,
      y: e.lng,
      type: e.type as MapEntity['type'],
      status: e.status as MapEntity['status'],
      label: e.label,
      data: e.data,
    })));
    // 加载真实危险区域
    const zones = getDangerZones(caseData);
    setDangerZones(zones);
    setShowDangerZone(zones.length > 0);
    setSelectedEvent(caseToEvent(caseData));
    setRescueResources(caseToResources(caseData));
    setScenarioActive(true);

    addTimelineMessage({
      id: `system-start-${Date.now()}`,
      type: 'text',
      role: 'system',
      content: `已加载真实案例【${caseData.name}】。该案例基于${caseData.date}发生的真实事件，包含${caseData.facilities.length}个真实设施位置和${caseData.rescueForces.length}支救援力量。点击左侧沙盘中的标记可查看详情。`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, []);

  const handleSelectCase = useCallback((caseData: RealDisasterCase) => {
    loadRealCase(caseData);
    setActiveModule('map');
  }, [loadRealCase]);

  const handleSandboxComplete = useCallback((report: any) => {
    setCrisisReport(report);
    setActiveModule('review');
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamMessages]);

  const sandboxEntities = useMemo(() =>
    mapEntities.map(e => ({
      id: e.id,
      lat: e.x,
      lng: e.y,
      type: e.type,
      status: e.status,
      label: e.label
    })),
    [mapEntities]
  );

  const handleEntityClick = useCallback((id: string) => {
    setSelectedEntity(prev => prev === id ? null : id);
  }, []);

  const addTimelineMessage = (msg: StreamMessage) => {
    setStreamMessages(prev => [...prev, msg]);
  };

  const generateRescuePlan = async (event: EmergencyEvent) => {
    setIsGeneratingPlan(true);
    setPlanError(null);
    setRescuePlan(null);

    try {
      const standbyResources = rescueResources.filter(r => r.available > 0);

      const response = await fetch('/api/rescue-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, resources: standbyResources }),
      });

      if (!response.ok) {
        throw new Error('救援方案生成失败');
      }

      const plan: RescuePlan = await response.json();
      setRescuePlan(plan);

      const recommendedIds = new Set(plan.dispatchedResources.map(r => r.resourceId));
      setRescueResources(prev =>
        prev.map(r => ({
          ...r,
          isRecommended: recommendedIds.has(r.id),
        }))
      );

      addTimelineMessage({
        id: `rescue-${Date.now()}`,
        type: 'card',
        role: 'assistant',
        content: {
          type: 'rescue-plan',
          plan,
          event,
        },
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setPlanError(err.message || '生成救援方案时发生错误');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const toggleResourceSelection = (resourceId: string) => {
    const res = rescueResources.find(r => r.id === resourceId);
    if (!res || res.available <= 0) return;

    setRescueResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, isSelected: !r.isSelected } : r)
    );
  };

  const cancelSelection = () => {
    setRescueResources(prev =>
      prev.map(r => ({ ...r, isSelected: false, isRecommended: false }))
    );
    setRescuePlan(null);
  };

  // 计算两点间距离（公里）
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 根据距离和交通状况计算预计到达时间
  const calculateETA = (distanceKm: number, forceType: string): string => {
    // 不同部队类型的平均速度（km/h）
    const speedMap: Record<string, number> = {
      'fire_truck': 60,
      'ambulance': 80,
      'police_car': 70,
      'rescue_team': 50,
      'engineering_vehicle': 40,
    };
    const speed = speedMap[forceType] || 50;
    const hours = distanceKm / speed;
    const minutes = Math.round(hours * 60);
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  };

  const confirmDispatch = () => {
    const selectedResources = rescueResources.filter(r => r.isSelected);
    if (selectedResources.length === 0 || !selectedEvent || isDispatching) return;

    setIsDispatching(true);

    setTimeout(() => {
      const getResourcePos = (resourceId: string) => {
        const res = rescueResources.find(r => r.id === resourceId);
        if (res?.currentLocation) return res.currentLocation;
        if (selectedEvent?.location) {
          const offset = 0.015;
          return { lat: selectedEvent.location.lat - offset, lng: selectedEvent.location.lng - offset };
        }
        return { lat: 30.58, lng: 104.07 };
      };

      const colorMap: Record<string, string> = {
        'fire_truck': '#ef4444',
        'ambulance': '#34d399',
        'police_car': '#3b82f6',
        'rescue_team': '#6366f1',
        'engineering_vehicle': '#f59e0b',
      };

      const newFlowLines: ActiveFlowLine[] = selectedResources.map(res => {
        const pos = getResourcePos(res.id);
        return {
          id: `flow-${res.id}-${Date.now()}`,
          fromLat: pos.lat,
          fromLng: pos.lng,
          toLat: selectedEvent.location.lat,
          toLng: selectedEvent.location.lng,
          size: 2,
          color: colorMap[res.type] || '#22d3ee',
          label: res.name,
          createdAt: Date.now(),
          duration: 8000,
        };
      });

      const newMovingResources = selectedResources.map(res => {
        const pos = getResourcePos(res.id);
        const distance = calculateDistance(pos.lat, pos.lng, selectedEvent.location.lat, selectedEvent.location.lng);
        const eta = calculateETA(distance, res.type);
        // 动画持续时间基于距离（每10公里约1秒动画）
        const animDuration = Math.max(3000, Math.min(15000, distance * 100));
        return {
          id: `moving-${res.id}-${Date.now()}`,
          name: `${res.name} (预计${eta})`,
          color: colorMap[res.type] || '#22d3ee',
          startLat: pos.lat,
          startLng: pos.lng,
          endLat: selectedEvent.location.lat,
          endLng: selectedEvent.location.lng,
          progress: 0,
          status: 'moving' as const,
          startTime: Date.now(),
          duration: animDuration,
          distance: distance.toFixed(1),
          eta,
        };
      });

      setFlowLines(prev => [...prev, ...newFlowLines]);
      setMovingResources(prev => [...prev, ...newMovingResources]);
      setShowDangerZone(true);

      setRescueResources(prev =>
        prev.map(r =>
          r.isSelected
            ? {
                ...r,
                status: 'dispatched' as const,
                statusName: '出动中',
                available: r.available - 1,
                isSelected: false,
                isRecommended: false,
              }
            : r
        )
      );

      // 生成详细的派遣报告
      const dispatchDetails = selectedResources.map(r => {
        const pos = getResourcePos(r.id);
        const distance = calculateDistance(pos.lat, pos.lng, selectedEvent.location.lat, selectedEvent.location.lng);
        const eta = calculateETA(distance, r.type);
        return `· ${r.typeName}「${r.name}」距离${distance.toFixed(1)}km，预计${eta}到达`;
      }).join('\n');

      const summary = selectedResources.map(r => `${r.typeName} ${r.name}`).join('、');
      addTimelineMessage({
        id: `dispatch-confirm-${Date.now()}`,
        type: 'text',
        role: 'user',
        content: `✅ 已确认派遣：${summary}\n\n📍 派遣详情：\n${dispatchDetails}\n\n共 ${newFlowLines.length} 支力量已开赴【${selectedEvent.typeName}】事发地点`,
        timestamp: new Date().toLocaleTimeString(),
      });

      setIsDispatching(false);
    }, 600);
  };

  const handleCopilotInput = async (query: string) => {
    if (!query.trim() || isStreaming) return;

    addTimelineMessage({
      id: Date.now().toString(),
      type: 'text',
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
    });

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('资源') && (lowerQuery.includes('可用') || lowerQuery.includes('有哪些') || lowerQuery.includes('列表'))) {
      const standby = rescueResources.filter(r => r.available > 0);
      const dispatched = rescueResources.filter(r => r.status === 'dispatched');
      const msg = `**当前资源状态**\n\n✅ 待命资源（${standby.length}个）：\n${standby.map(r => `· ${r.name}（${r.typeName}）`).join('\n')}\n\n🚀 已出动（${dispatched.length}个）：\n${dispatched.map(r => `· ${r.name}（${r.typeName}）`).join('\n') || '无'}`;
      addTimelineMessage({
        id: (Date.now() + 1).toString(),
        type: 'text',
        role: 'assistant',
        content: msg,
        timestamp: new Date().toLocaleTimeString(),
      });
      setInputText('');
      return;
    }

    if (
      lowerQuery.includes('生成方案') || lowerQuery.includes('救援方案') ||
      lowerQuery.includes('应急预案') || lowerQuery.includes('推演') ||
      lowerQuery.includes('怎么处理') || lowerQuery.includes('怎么办')
    ) {
      const currentEvent = selectedEvent;
      if (currentEvent) {
        generateRescuePlan(currentEvent);
      } else {
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'text',
          role: 'assistant',
          content: '请先在左侧沙盘中选择一个突发事件，或确认当前场景已加载，我将为您生成救援方案。',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
      setInputText('');
      return;
    }

    // 启动危机推演沙盘
    if (lowerQuery.includes('推演') || lowerQuery.includes('沙盘') || lowerQuery.includes('决策')) {
      if (selectedRealCase) {
        setActiveModule('sandbox');
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'text',
          role: 'assistant',
          content: `已启动【${selectedRealCase.name}】危机推演沙盘。您将面临多个决策困境，每个决策都有时间成本和资源代价。请根据实际情况做出选择。`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        addTimelineMessage({
          id: (Date.now() + 1).toString(),
          type: 'text',
          role: 'assistant',
          content: '请先选择一个真实案例，然后启动危机推演沙盘。',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
      setInputText('');
      return;
    }

    setIsStreaming(true);
    setStreamingContent('');
    const streamMsgId = `stream-${Date.now()}`;

    setStreamMessages(prev => [
      ...prev,
      {
        id: streamMsgId,
        type: 'text',
        role: 'assistant',
        content: '...',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    try {
      const response = await fetch('/api/sentinel-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          context: {
            event: selectedEvent,
            resources: rescueResources,
            disasterPhase,
            realCase: selectedRealCase,
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('AI服务连接失败');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'));

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, '').trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.content || parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              fullContent += text;
              setStreamingContent(fullContent);
            }
          } catch {
            setStreamingContent(fullContent + data);
          }
        }
      }

      let finalContent = fullContent.trim();

      setStreamMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId
            ? { ...m, content: finalContent, timestamp: new Date().toLocaleTimeString() }
            : m
        )
      );

      setInputText('');
    } catch (err: any) {
      const fallbackMsg = selectedRealCase
        ? `我理解您的需求："${query}"\n\n基于当前【${selectedRealCase.name}】真实案例场景，建议您：\n\n· 输入「生成救援方案」让我为您制定详细的处置计划\n· 输入「推演」启动危机决策沙盘进行多路径推演\n· 在地图上点击事件标记查看真实设施位置后进行调度`
        : `我理解您的需求："${query}"\n\n建议您：\n\n· 从案例库选择一个真实案例\n· 输入「生成救援方案」让我为您制定处置计划\n· 输入「推演」启动危机决策沙盘`;

      setStreamMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId
            ? { ...m, content: fallbackMsg, timestamp: new Date().toLocaleTimeString() }
            : m
        )
      );
      setInputText('');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const resolveDisaster = () => {
    if (disasterPhase === 'resolved' || !selectedEvent) return;

    setDisasterPhase('responding');
    setShowDangerZone(false);
    setFlowLines([]);

    setTimeout(() => {
      setDisasterPhase('resolved');

      const newAchievements: string[] = [];
      const dispatchedCount = rescueResources.filter(r => r.status === 'dispatched').length;

      if (dispatchedCount >= 2) newAchievements.push('⚡ 快速响应');
      if (rescuePlan) newAchievements.push('🧠 AI协同决策');
      if (rescueResources.some(r => r.status === 'dispatched' && r.type === 'ambulance')) newAchievements.push('🏥 生命守护');
      if (rescueResources.some(r => r.status === 'dispatched' && r.type === 'fire_truck')) newAchievements.push('🔥 火线压制');
      if (rescueResources.some(r => r.status === 'dispatched' && r.type === 'police_car')) newAchievements.push('👮 秩序维护');

      const scoreBase = 60;
      const planBonus = rescuePlan ? 20 : 0;
      const resourceBonus = Math.min(dispatchedCount * 5, 15);
      const speedBonus = 10;
      const totalScore = Math.min(scoreBase + planBonus + resourceBonus + speedBonus, 100);

      setAchievements(newAchievements);
      setEvaluationScore(totalScore);

      setMapEntities(prev =>
        prev.map(e =>
          e.id.startsWith('event-') || e.id.includes('-center')
            ? { ...e, status: 'normal' as const, label: `✅ ${selectedEvent?.typeName || '事故'}已处置` }
            : e
        )
      );

      addTimelineMessage({
        id: `resolved-${Date.now()}`,
        type: 'card',
        role: 'system',
        content: {
          type: 'resolution-report',
          event: selectedEvent,
          achievements: newAchievements,
          score: totalScore,
          dispatchedCount,
          hasPlan: !!rescuePlan,
        },
        timestamp: new Date().toLocaleTimeString(),
      });

      setShowReport(true);
    }, 2000);
  };

  const resetAll = () => {
    setMapEntities([]);
    setSelectedEntity(null);
    setDangerZones([]);
    setShowDangerZone(false);
    setStreamMessages([]);
    setFlowLines([]);
    setMovingResources([]);
    setSelectedEvent(null);
    setRescuePlan(null);
    setPlanError(null);
    setRescueResources([]);
    setScenarioActive(false);
    setIsStreaming(false);
    setStreamingContent('');
    setDisasterPhase('active');
    setAchievements([]);
    setShowReport(false);
    setEvaluationScore(null);
    setSelectedRealCase(null);
  };

  // 渲染模块内容
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'sandbox':
        return selectedRealCase ? (
          <CrisisSandbox
            disasterCase={selectedRealCase}
            onComplete={handleSandboxComplete}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <Siren className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">请先选择一个真实案例</p>
              <Button
                className="mt-4 bg-indigo-600"
                onClick={() => setActiveModule('library')}
              >
                前往案例库
              </Button>
            </div>
          </div>
        );

      case 'review':
        return crisisReport ? (
          <DecisionReview
            report={crisisReport}
            onRestart={() => {
              setCrisisReport(null);
              setActiveModule('sandbox');
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">请先完成一次危机推演</p>
              <Button
                className="mt-4 bg-indigo-600"
                onClick={() => setActiveModule('sandbox')}
              >
                开始推演
              </Button>
            </div>
          </div>
        );

      case 'library':
        return <CaseLibrary onSelectCase={handleSelectCase} />;

      case 'map':
      default:
        return renderMapModule();
    }
  };

  const renderMapModule = () => (
    <div className="h-full bg-white text-slate-900 font-sans flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧地图区域 */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200">
          <div className="border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold flex items-center gap-1.5">
                  应急哨兵
                  <Badge className="bg-red-600 text-xs">AI推演</Badge>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {selectedRealCase ? `真实案例：${selectedRealCase.name}` : `当前场景：${selectedEvent?.typeName || '未加载'}`}
                  </span>
                  <Badge variant="outline" className="border-red-300 text-red-400 text-[10px]">
                    LIVE
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-slate-500 h-7 text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />重置
              </Button>
              <span className="text-xs text-slate-400 tabular-nums w-14 text-right">{clockTime || '--:--:--'}</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <MapView
              entities={sandboxEntities}
              dangerZones={dangerZones}
              flowLines={flowLines}
              movingResources={movingResources}
              showDangerZone={showDangerZone}
              onEntityClick={handleEntityClick}
            />

            {/* 图例 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-xs space-y-1 z-[1000]">
              <div className="font-bold text-slate-800">图例</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500" />消防站</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-600" />公安局</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-white border border-slate-400" />医院</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" />危险区</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-400" />队伍</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-cyan-400" />传感器</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" />避难所</div>
              </div>
            </div>

            {/* 选中实体详情 */}
            {selectedEntity && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur rounded-xl border border-slate-200 p-4 z-[1000] shadow-xl">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-900">实体详情</span>
                  <button onClick={() => setSelectedEntity(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-sm space-y-1.5 text-slate-700">
                  {(() => {
                    const ent = mapEntities.find(e => e.id === selectedEntity);
                    if (!ent) return null;
                    const typeMap: Record<string, string> = {
                      sensor: '监测点', team: '救援队伍', vehicle: '应急车辆', shelter: '避难所',
                      hospital: '医院', fire_station: '消防站', police_station: '公安局',
                      ambulance: '救护车', fire_truck: '消防车', police_car: '警车', traffic_light: '交通灯'
                    };
                    const statusMap: Record<string, string> = { normal: '正常', warning: '预警', danger: '危险' };

                    // 查找关联的真实案例设施信息
                    const facilityInfo = selectedRealCase?.facilities.find(f => f.id === ent.id);
                    const forceInfo = selectedRealCase?.rescueForces.find(f => f.id === ent.id);

                    return <>
                      {ent.label && <p className="text-slate-900 font-medium"><MapPin className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />{ent.label}</p>}
                      <p><span className="text-slate-400">ID：</span>{ent.id}</p>
                      <p><span className="text-slate-400">类型：</span>{typeMap[ent.type] || ent.type}</p>
                      {ent.status && <p><span className="text-slate-400">状态：</span><span className={ent.status === 'danger' ? 'text-red-400' : ent.status === 'warning' ? 'text-yellow-400' : 'text-emerald-400'}>{statusMap[ent.status]}</span></p>}

                      {facilityInfo && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          {facilityInfo.capacity && <p className="text-xs text-slate-500">容量: {facilityInfo.capacity}</p>}
                          {facilityInfo.description && <p className="text-xs text-slate-500">{facilityInfo.description}</p>}
                        </div>
                      )}

                      {forceInfo && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          {forceInfo.arrivalTime && <p className="text-xs text-slate-500">到达时间: {forceInfo.arrivalTime}</p>}
                          {forceInfo.description && <p className="text-xs text-slate-500">{forceInfo.description}</p>}
                        </div>
                      )}

                      {ent.type === 'hospital' && !facilityInfo && <p className="text-green-400 text-xs mt-1">✓ 救护资源就位 | 床位 45/80</p>}
                      {ent.type === 'fire_station' && !facilityInfo && <p className="text-orange-400 text-xs mt-1">✓ 消防车 4/6 待命</p>}
                      {ent.type === 'police_station' && !facilityInfo && <p className="text-blue-400 text-xs mt-1">✓ 警力 3/4 部署中</p>}
                    </>;
                  })()}
                </div>
              </motion.div>
            )}

            {/* 事件详情 */}
            <AnimatePresence>
              {selectedEvent && !selectedEntity && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur rounded-xl border border-red-300 p-4 z-[1000] shadow-xl shadow-red-500/20"
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-slate-900">突发事件</span>
                    </div>
                    <button onClick={() => { setSelectedEvent(null); setSelectedEntity(null); }} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        selectedEvent.severity === 'critical' ? 'bg-red-700' :
                        selectedEvent.severity === 'high' ? 'bg-red-600' :
                        selectedEvent.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }>
                        {selectedEvent.severityName}
                      </Badge>
                      <Badge variant="outline" className="border-red-300 text-red-500">{selectedEvent.typeName}</Badge>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedEvent.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>({selectedEvent.location.lat.toFixed(4)}, {selectedEvent.location.lng.toFixed(4)})</span>
                      <Clock className="w-3.5 h-3.5 ml-2" />
                      <span>{selectedEvent.reportedAt}</span>
                    </div>
                    <div className="pt-2 space-y-2">
                      <Button
                        onClick={() => generateRescuePlan(selectedEvent)}
                        disabled={isGeneratingPlan}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm"
                      >
                        {isGeneratingPlan ? (
                          <><span className="animate-pulse">AI分析中...</span></>
                        ) : (
                          <><Bot className="w-4 h-4 mr-1" />生成救援方案</>
                        )}
                      </Button>
                      {planError && (
                        <p className="text-xs text-red-500 text-center">{planError}</p>
                      )}

                      <Button
                        onClick={() => setActiveModule('sandbox')}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm"
                      >
                        <Siren className="w-4 h-4 mr-1" />启动危机推演
                      </Button>

                      {disasterPhase !== 'resolved' && rescueResources.some(r => r.status === 'dispatched') && (
                        <Button
                          onClick={resolveDisaster}
                          disabled={disasterPhase === 'responding'}
                          className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm"
                        >
                          {disasterPhase === 'responding' ? (
                            <><span className="animate-pulse">处置中...</span></>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-1" />确认处置完成</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部资源池 */}
          <div className="bg-white border-t border-slate-200 p-3 relative">
            <style>{`
              @keyframes recommend-glow {
                0%, 100% {
                  box-shadow: 0 0 5px rgba(245,158,11,0.25), 0 0 12px rgba(245,158,11,0.1);
                  border-color: #fbbf24;
                }
                50% {
                  box-shadow: 0 0 16px rgba(245,158,11,0.55), 0 0 36px rgba(245,158,11,0.22), inset 0 0 10px rgba(245,158,11,0.08);
                  border-color: #f59e0b;
                }
              }
              @keyframes recommend-badge-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.65; transform: scale(1.05); }
              }
              @keyframes selected-pop {
                0% { transform: scale(1); }
                40% { transform: scale(1.03); }
                100% { transform: scale(1); }
              }
              .ai-recommend-card {
                animation: recommend-glow 2s ease-in-out infinite, selected-pop 0.35s ease-out;
              }
              .ai-recommend-badge {
                animation: recommend-badge-pulse 1.8s ease-in-out infinite;
              }
              .card-selected {
                animation: selected-pop 0.28s ease-out;
              }
            `}</style>

            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold">救援资源池</span>
              <Badge variant="outline" className="text-[10px] border-slate-300">
                {rescueResources.filter(r => r.available > 0).length} 可用 / {rescueResources.length} 总计
              </Badge>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {rescueResources.map((res) => {
                const isOutOfStock = res.available <= 0;
                const isSelected = res.isSelected;
                const isRecommended = res.isRecommended;
                return (
                  <div
                    key={res.id}
                    onClick={() => !isOutOfStock && toggleResourceSelection(res.id)}
                    className={`flex-shrink-0 p-2.5 rounded-lg border-2 transition-all min-w-[130px] relative ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-50/80 cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 cursor-pointer card-selected'
                          : isRecommended
                            ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer hover:border-indigo-400 ai-recommend-card'
                            : 'border-slate-200 bg-slate-100 cursor-pointer hover:border-indigo-300'
                    }`}
                    title={isOutOfStock ? '已全部出动' : isSelected ? '点击取消选择' : isRecommended ? 'AI推荐资源，点击选中' : '点击选中此资源'}
                  >
                    {isRecommended && !isSelected && (
                      <div className="absolute -top-2 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md ai-recommend-badge">
                        AI推荐
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute -top-2 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                        ✓ 已选
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: res.iconColor + '20' }}>
                        <Truck className="w-5 h-5" style={{ color: res.iconColor }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight truncate">{res.name}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{res.typeName}</span>
                          <Badge className={
                            res.status === 'dispatched' ? 'bg-orange-500 text-[10px]' :
                            res.available <= 0 ? 'bg-slate-400 text-[10px]' :
                            'bg-emerald-600 text-[10px]'
                          }>
                            {res.status === 'dispatched' ? res.statusName : `${res.available}/${res.total}可用`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {rescueResources.some(r => r.isSelected) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-14 left-0 right-0 mx-3 bg-white border-2 border-indigo-300 rounded-xl px-4 py-3 shadow-xl shadow-indigo-500/20 z-[1000]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 animate-pulse">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-800 truncate">
                        已选资源：
                        {(() => {
                          const grouped = rescueResources
                            .filter(r => r.isSelected)
                            .reduce<Record<string, number>>((acc, r) => {
                              acc[r.typeName] = (acc[r.typeName] || 0) + 1;
                              return acc;
                            }, {});
                          return Object.entries(grouped)
                            .map(([k, v]) => `${k} x${v}`)
                            .join(', ');
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={cancelSelection} disabled={isDispatching} className="text-slate-500 h-7 text-xs">
                        取消
                      </Button>
                      <Button size="sm" onClick={confirmDispatch} disabled={isDispatching} className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white h-7 text-xs px-4 ${isDispatching ? 'opacity-70' : ''}`}>
                        {isDispatching ? (
                          <><span className="animate-pulse">派遣中...</span></>
                        ) : (
                          <>确认派遣</>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 右侧AI参谋 */}
        <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold">智能参谋</span>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    方案推演 | AI 辅助生成处置方案
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-6">
            <div className="space-y-4" style={{ minHeight: '100%' }}>
              {streamMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-slate-800 mb-1">AI 智能参谋就绪</p>
                  <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
                    {selectedRealCase ? (
                      <>当前案例：<span className="font-bold text-indigo-600">{selectedRealCase.name}</span><br />
                      基于真实事件，包含{selectedRealCase.facilities.length}个真实设施位置</>
                    ) : (
                      <>当前场景：<span className="font-bold text-indigo-600">{selectedEvent?.typeName || '未加载'}</span></>
                    )}
                    <br />点击左侧沙盘中的事件标记查看详情，或直接在输入框中发送指令。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {['生成救援方案', '查看资源', '推演'].map(hint => (
                      <button key={hint} onClick={() => handleCopilotInput(hint)} className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors font-mono">{hint}</button>
                    ))}
                  </div>
                </div>
              )}

              {streamMessages.map(msg => {
                if (msg.role === 'system') {
                  if (msg.content?.type === 'resolution-report') {
                    const report = msg.content;
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <Card className="w-full max-w-md bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-emerald-300 shadow-lg shadow-emerald-500/10">
                          <CardContent className="p-5 text-center space-y-3">
                            <div className="text-3xl">🎉</div>
                            <div className="text-lg font-bold text-emerald-700">{report.event.typeName} 处置完成</div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="text-xs text-slate-400">综合评分</div>
                                <div className={`text-xl font-bold ${report.score >= 85 ? 'text-emerald-600' : report.score >= 70 ? 'text-yellow-600' : 'text-orange-600'}`}>{report.score}<span className="text-xs text-slate-400">/100</span></div>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="text-xs text-slate-400">派遣力量</div>
                                <div className="text-lg font-bold text-indigo-600">{report.dispatchedCount}支</div>
                              </div>
                            </div>

                            {report.achievements.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="text-xs text-slate-500 font-medium">解锁成就</div>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                  {report.achievements.map((ach: string, i: number) => (
                                    <span key={i} className="inline-block px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-[11px] font-medium text-amber-800">
                                      {ach}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {report.hasPlan && (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mx-auto w-fit">AI协同决策</Badge>
                            )}

                            <Button onClick={() => setShowReport(false)} variant="outline" size="sm" className="w-full mt-2 text-xs">关闭报告</Button>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full whitespace-pre-wrap text-center max-w-[85%] leading-relaxed">{msg.content}</span>
                    </div>
                  );
                }

                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[82%] ${isUser ? 'order-2' : ''}`}>
                      {msg.type === 'text' && (
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        }`}>
                          {msg.content}
                        </div>
                      )}

                      {msg.type === 'card' && msg.content?.type === 'rescue-plan' && (
                        <Card className="border-red-300 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl rounded-bl-md overflow-hidden shadow-sm">
                          <CardHeader className="pb-2 pt-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-600 text-xs">AI救援方案</Badge>
                              <Badge variant="outline" className="border-red-300 text-red-500 text-xs">
                                {msg.content.event?.typeName}
                              </Badge>
                            </div>
                            <CardTitle className="text-base text-slate-900 mt-1">
                              {msg.content.plan?.plan || '救援方案'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-red-200">
                              <p className="text-xs font-bold text-red-600 mb-1">AI研判分析</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{msg.content.plan?.analysis}</p>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-700 mb-2">派遣资源清单</p>
                              <div className="space-y-2">
                                {(msg.content.plan?.dispatchedResources || []).map((dr: DispatchedResource) => {
                                  const res = rescueResources.find(r => r.id === dr.resourceId);
                                  const isRec = res?.isRecommended || false;
                                  const isSel = res?.isSelected || false;
                                  return (
                                    <div key={dr.resourceId} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-200">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: res?.iconColor + '20' }}>
                                        <Truck className="w-4 h-4" style={{ color: res?.iconColor }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-slate-800">{dr.resourceName}</span>
                                          {isSel && (<Badge className="bg-indigo-500 text-xs">已选中</Badge>)}
                                          {isRec && !isSel && (<Badge className="bg-amber-500 text-xs">AI推荐</Badge>)}
                                          {!isRec && !isSel && (<Badge className="bg-emerald-500 text-xs">待命</Badge>)}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{dr.reason}</p>
                                      </div>
                                      <span className="text-xs text-slate-400 whitespace-nowrap">{dr.estimatedArrival}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-700 mb-1.5">执行步骤</p>
                              <div className="space-y-1.5">
                                {(msg.content.plan?.steps || []).map((step: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span className="text-slate-700">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>预计耗时：{msg.content.plan?.estimatedDuration}</span>
                              </div>
                            </div>

                            {msg.content.plan?.riskWarning && (
                              <div className="flex items-start gap-2 bg-yellow-50 p-2.5 rounded-lg border border-yellow-200">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700">{msg.content.plan.riskWarning}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      <div className={`text-[10px] text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>{msg.timestamp}</div>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 order-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} className="h-2" />

              {isStreaming && (
                <div className="flex items-start gap-2 justify-start mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[20px]">
                      {streamingContent || (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white space-y-2.5">
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => handleCopilotInput('生成救援方案')}>
                <FileText className="w-3 h-3 mr-1" />生成方案
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => handleCopilotInput('查看资源')}>
                <BarChart3 className="w-3 h-3 mr-1" />查看资源
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => setActiveModule('sandbox')}>
                <Siren className="w-3 h-3 mr-1" />危机推演
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-slate-500" onClick={() => setActiveModule('library')}>
                <BookOpen className="w-3 h-3 mr-1" />案例库
              </Button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCopilotInput(inputText)}
                placeholder={`输入指令，如「生成救援方案」、「调度消防车」...`}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                onClick={() => handleCopilotInput(inputText)}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-500 hover:to-purple-500 text-white px-4"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight px-0.5">
              提示：输入「生成救援方案」让AI分析事件 / 「查看资源」查看实时状态 / 「推演」启动危机决策沙盘 / 点击下方资源卡片手动调度
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-1">
        <div className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">应急哨兵</span>
        </div>

        <nav className="flex gap-1">
          {([
            { id: 'map' as ModuleType, label: '态势地图', icon: MapPin },
            { id: 'sandbox' as ModuleType, label: '危机推演', icon: Siren },
            { id: 'review' as ModuleType, label: '决策复盘', icon: Brain },
            { id: 'library' as ModuleType, label: '案例智库', icon: BookOpen },
          ]).map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeModule === module.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <module.icon className="w-3.5 h-3.5" />
              {module.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {selectedRealCase && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {selectedRealCase.name}
            </Badge>
          )}
          <span className="text-xs text-slate-500 font-mono">{clockTime}</span>
        </div>
      </div>

      {/* 模块内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderModuleContent()}
      </div>
    </div>
  );
}
