'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealDisasterCase } from '@/lib/real-disaster-cases';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SkipForward, MapPin, Users, Shield, Send, RotateCcw, BookOpen,
  CheckCircle, Zap, AlertTriangle, Eye,
  Brain, ChevronRight,
  Crown, Building, UsersRound, Radio, Siren,
  FileText, Clock, Target, AlertCircle,
  Maximize2, X, MessageSquare, Sparkles, Lightbulb
} from 'lucide-react';
import type { FlowLine, MovingResource, StoryBubbleData, MarkerEffectType } from '@/components/map-view';
import {
  createAgent,
  getDecisionAgents,
  type AgentMessage
} from '@/lib/ai-agents';
import { wuhanDecisionRoleMappings, wuhanRolePositions } from '@/lib/wuhan-waterlogging-case';
import type { CampaignState } from './campaign-mode';
import {
  createRoundBasedEngine,
  type RoundResult,
  type PlanTemplate,
} from '@/lib/round-based-engine';
import { getDutiesByScenario } from '@/lib/emergency-training-new';
import { wuhanScenario, type ScenarioPhase, type ScenarioEvent, type DecisionPoint, getAdvisorPromptForPhase } from '@/lib/scenario-data';
import { generateAIPlan, generateFallbackPlan, type PlanGenerationRequest } from '@/lib/ai-plan-generator';
import { logger } from '@/lib/logger';
import { LocationMarkerManager, locationToTargetData } from '@/lib/map-controller';

// 玩家角色模式
type PlayerRoleLevel = 'decision' | 'core' | 'collab';

// 战役阶段
type CampaignPhase = 'intro' | 'role_selection' | 'script_playing' | 'plan_selection' | 'plan_execution' | 'round_simulation' | 'round_outcome' | 'game_over';

interface CampaignModeV2Props {
  disasterCase: RealDisasterCase;
  onComplete: (report: any) => void;
  onStateChange?: (state: CampaignState) => void;
  onAdvisorMessage?: (message: AgentMessage) => void;
  onOpenAdvisor?: () => void;
  externalMessages?: AgentMessage[];
  onLocationMarkersChange?: (markers: Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    zoom: number;
    offsetLat?: number;
    offsetLng?: number;
    zIndex?: number;
    highlightRadius?: number;
    highlightColor?: string;
    highlightMessage?: string;
    effectType?: MarkerEffectType;
    emotion?: string;
  }>) => void;
  onStoryBubblesChange?: (bubbles: StoryBubbleData[]) => void;
}

interface DraggablePanelProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number | string };
  resizable?: boolean;
  zIndex?: number;
}

function DraggablePanel({ title, icon, children, headerRight, defaultPosition = { x: 0, y: 0 }, defaultSize = { width: 384, height: '100%' }, resizable = true, zIndex = 100 }: DraggablePanelProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      dragOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [position]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = { 
      x: e.clientX, 
      y: e.clientY, 
      width: size.width, 
      height: typeof size.height === 'number' ? size.height : 560 
    };
  }, [size]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragOffsetRef.current.x),
          y: Math.max(0, e.clientY - dragOffsetRef.current.y),
        });
      }
      if (isResizing) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        setSize({
          width: Math.max(320, resizeStartRef.current.width + dx),
          height: Math.max(200, resizeStartRef.current.height + dy),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      className="absolute pointer-events-auto select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col h-full">
        <div
          data-drag-handle
          className="flex items-center justify-between p-4 border-b border-slate-700 cursor-move"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-bold text-white">{title}</span>
          </div>
          {headerRight}
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
        {resizable && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center"
            onMouseDown={handleResizeMouseDown}
          >
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-slate-500">
              <path d="M14 14L8 8M14 14L10 10M14 14L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== RTS 开场动画 ====================
function RTSIntroOverlay({ disasterCase, onComplete }: { disasterCase: RealDisasterCase; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { duration: 2000, text: '正在接入应急指挥系统...' },
    { duration: 1500, text: `定位灾害中心：${disasterCase.location.name}` },
    { duration: 2000, text: `${disasterCase.date} · ${disasterCase.type}灾害预警触发` },
    { duration: 1500, text: `灾害等级：${disasterCase.level}级响应` },
    { duration: 2000, text: '正在调取各部门实时状态...' },
  ];

  useEffect(() => {
    logger.info('RTS-Intro', `步骤 ${step}/${steps.length - 1}`, steps[step]?.text);
    if (step < steps.length) {
      const timer = setTimeout(() => setStep(s => s + 1), steps[step].duration);
      return () => clearTimeout(timer);
    } else {
      logger.info('RTS-Intro', '开场动画完成，即将进入角色选择');
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 bg-slate-950 z-[300] flex items-center justify-center"
    >
      <div className="max-w-lg w-full mx-4">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 mb-6 flex items-center gap-3"
        >
          <Siren className="w-6 h-6 text-red-400 animate-pulse" />
          <div>
            <div className="text-red-400 font-bold text-sm">应急预警系统激活</div>
            <div className="text-red-300/60 text-xs">EMERGENCY RESPONSE SYSTEM ONLINE</div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: idx <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: idx === step ? 0 : idx * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                idx === step ? 'bg-amber-500/10 border-amber-500/30' :
                idx < step ? 'bg-emerald-500/5 border-emerald-500/20' :
                'bg-slate-800/30 border-slate-700/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx === step ? 'bg-amber-500 text-slate-900 animate-pulse' :
                idx < step ? 'bg-emerald-500 text-slate-900' :
                'bg-slate-700 text-slate-500'
              }`}>
                {idx < step ? '✓' : idx + 1}
              </div>
              <span className={`text-sm ${
                idx === step ? 'text-amber-300' : idx < step ? 'text-emerald-300' : 'text-slate-500'
              }`}>{s.text}</span>
              {idx === step && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="ml-auto w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
          className="mt-6 bg-slate-900/80 border border-slate-700 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <span className="text-white font-bold">{disasterCase.name}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">{disasterCase.description.slice(0, 100)}...</p>
          <div className="flex gap-2">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{disasterCase.type}</Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{disasterCase.level}响应</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">{wuhanScenario.length}个阶段</Badge>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ==================== 极简历史日志条目 ====================
function HistoryLogEntry({ message, isUser, onClick }: {
  message: AgentMessage;
  isUser?: boolean;
  onClick?: () => void;
}) {
  const location = (message as any).location;
  const emotionColors: Record<string, string> = {
    urgent: 'text-red-400', worried: 'text-orange-400',
    concerned: 'text-yellow-400', confident: 'text-green-400',
    calm: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-700/50 ${
        isUser ? 'bg-amber-500/5' : ''
      }`}
      onClick={onClick}
    >
      <span className="text-sm text-slate-500 shrink-0 w-14 text-right font-mono">
        {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className={`text-sm font-bold shrink-0 min-w-[64px] ${
        isUser ? 'text-amber-400' :
        message.agentId === 'ai-advisor' ? 'text-violet-400' :
        'text-sky-400'
      }`}>
        {isUser ? '我' : message.agentName}
      </span>
      {message.emotion && (
        <span className={`text-base ${emotionColors[message.emotion] || 'text-slate-400'}`}>
          {message.emotion === 'urgent' ? '🔴' :
           message.emotion === 'worried' ? '🟠' :
           message.emotion === 'concerned' ? '🟡' : ''}
        </span>
      )}
      <span className="text-sm text-slate-300 truncate flex-1">
        {message.message.length > 40 ? message.message.slice(0, 40) + '...' : message.message}
      </span>
      {location && (
        <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
      )}
    </motion.div>
  );
}

// ==================== 方案全屏查看弹窗 ====================
function PlanDetailModal({ plan, title, onClose }: { plan: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-bold text-white">{title}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{plan}</pre>
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />关闭
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== 回合推演结果面板 ====================
function RoundOutcomePanel({ result, onContinue, onRetry }: {
  result: RoundResult;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const gradeColors: Record<string, string> = {
    S: 'text-emerald-400', A: 'text-blue-400', B: 'text-amber-400',
    C: 'text-orange-400', D: 'text-red-400', F: 'text-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 200 }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 pointer-events-auto max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className={`text-6xl font-black ${gradeColors[result.grade]} mb-2`}>{result.grade}</div>
          <h3 className="text-xl font-bold text-white">
            推演结果 - {result.grade === 'S' || result.grade === 'A' ? '优秀' : result.grade === 'B' || result.grade === 'C' ? '完成' : '失败'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">{result.summary}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{result.outcome.casualties.deaths}</div>
            <div className="text-xs text-slate-500">死亡</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{result.outcome.casualties.injuries}</div>
            <div className="text-xs text-slate-500">受伤</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{result.outcome.casualties.missing}</div>
            <div className="text-xs text-slate-500">失踪</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{result.outcome.casualties.evacuated}</div>
            <div className="text-xs text-slate-500">转移</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />重新推演
          </Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={onContinue}>
            <CheckCircle className="w-4 h-4 mr-2" />下一阶段
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== 角色选择面板 ====================
function RoleSelectionPanel({
  onSelectRole,
  currentPhase
}: {
  onSelectRole: (roleId: string, level: PlayerRoleLevel) => void;
  currentPhase: ScenarioPhase;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const phaseRoles = currentPhase.playerRoles;
  logger.info('RoleSelection', `渲染角色选择面板`, {
    phaseName: currentPhase.name,
    responseLevel: currentPhase.responseLevel,
    roleCount: phaseRoles.length,
    roles: phaseRoles.map(r => ({ id: r.id, name: r.name, level: r.level })),
  });
  const decisionRoles = phaseRoles.filter(r => r.level === 'decision');
  const coreRoles = phaseRoles.filter(r => r.level === 'core');
  const collabRoles = phaseRoles.filter(r => r.level === 'collab');

  const levelConfig = {
    decision: { title: '决策指挥层', desc: '市长/副市长（指挥长/副指挥长）', icon: Crown, color: 'text-amber-400', borderColor: 'border-amber-500', bgColor: 'bg-amber-500/10' },
    core: { title: '核心执行层', desc: '应急管理局局长（应急枢纽）', icon: Building, color: 'text-red-400', borderColor: 'border-red-500', bgColor: 'bg-red-500/10' },
    collab: { title: '协同配合层', desc: '各局局长、街道办主任（协同执行）', icon: UsersRound, color: 'text-blue-400', borderColor: 'border-blue-500', bgColor: 'bg-blue-500/10' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 200 }}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 pointer-events-auto max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">选择您的角色</h2>
          <p className="text-sm text-slate-400 mt-2">{currentPhase.name} - 本次响应需要以下角色参与</p>
          <p className="text-xs text-slate-500 mt-1">响应等级：{currentPhase.responseLevel}</p>
        </div>

        {/* 决策层 */}
        {decisionRoles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-amber-400">决策指挥层</h4>
              <span className="text-xs text-slate-500">统筹全局指挥</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {decisionRoles.map(role => (
                <button key={role.id} onClick={() => setSelectedRoleId(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${selectedRoleId === role.id ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{role.name}</span>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">决策层</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{role.department}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{role.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 核心层 */}
        {coreRoles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-5 h-5 text-red-400" />
              <h4 className="text-sm font-bold text-red-400">核心执行层</h4>
              <span className="text-xs text-slate-500">应急枢纽调度</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {coreRoles.map(role => (
                <button key={role.id} onClick={() => setSelectedRoleId(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${selectedRoleId === role.id ? 'border-red-500 bg-red-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{role.name}</span>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">核心层</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{role.department}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{role.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 协同层 */}
        {collabRoles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <UsersRound className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-bold text-blue-400">协同配合层</h4>
              <span className="text-xs text-slate-500">部门协同执行</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {collabRoles.map(role => (
                <button key={role.id} onClick={() => setSelectedRoleId(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${selectedRoleId === role.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <UsersRound className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{role.name}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">协同层</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{role.department}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{role.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedRoleId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
              const role = phaseRoles.find(r => r.id === selectedRoleId);
              logger.info('RoleSelection', '用户确认角色', { roleId: selectedRoleId, role: role });
              if (role) {
                onSelectRole(selectedRoleId, role.level as PlayerRoleLevel || 'collab');
              }
            }}>
              确认角色，开始推演
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ==================== 主组件 ====================
export default function CampaignModeV2({ disasterCase, onComplete, onStateChange, onAdvisorMessage, onOpenAdvisor, externalMessages, onLocationMarkersChange, onStoryBubblesChange }: CampaignModeV2Props) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phase, setPhase] = useState<CampaignPhase>('intro');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [userPlan, setUserPlan] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [playerRoleId, setPlayerRoleId] = useState<string | null>(null);
  const [playerRoleLevel, setPlayerRoleLevel] = useState<PlayerRoleLevel | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const roundEngineRef = useRef<ReturnType<typeof createRoundBasedEngine> | null>(null);

  // 定位点管理器（遵循绝对视觉协议）
  const markerManagerRef = useRef<LocationMarkerManager>(new LocationMarkerManager());
  const [locationMarkers, setLocationMarkers] = useState<Array<{
    id: string;
    lat: number;
    lng: number;
    label: string;
    zoom: number;
    offsetLat?: number;
    offsetLng?: number;
    zIndex?: number;
    highlightRadius?: number;
    highlightColor?: string;
    highlightMessage?: string;
    effectType?: MarkerEffectType;
    emotion?: string;
  }>>([]);

  // 地图对话气泡
  const [storyBubbles, setStoryBubbles] = useState<StoryBubbleData[]>([]);

  // 通知父组件定位点变化
  useEffect(() => {
    onLocationMarkersChange?.(locationMarkers);
  }, [locationMarkers, onLocationMarkersChange]);

  // 通知父组件对话气泡变化
  useEffect(() => {
    onStoryBubblesChange?.(storyBubbles);
  }, [storyBubbles, onStoryBubblesChange]);

  /**
   * 绝对视觉协议：原子化 focusOnTarget 函数
   * 唯一入口，严禁在业务代码中直接调用 setMapCenter/setMapZoom
   */
  const focusOnTarget = useCallback((lat: number, lng: number, label: string, zoom?: number, effectType?: MarkerEffectType, emotion?: string, highlightMessage?: string) => {
    const target = locationToTargetData(lat, lng, label, zoom);
    if (effectType) (target as any).effectType = effectType;
    if (emotion) (target as any).emotion = emotion;
    if (highlightMessage) (target as any).highlightMessage = highlightMessage;
    const result = markerManagerRef.current.focusOnTarget(target);

    setLocationMarkers(result.markers);
    setMapCenter(result.center);
    setMapZoom(result.zoom);

    logger.info('MapController', 'focusOnTarget', {
      label: target.labelName,
      coordinates: target.coordinates,
      zoom: target.zoomLevel,
    });
  }, []);

  // 将消息转换为地图对话气泡
  const messageToBubble = useCallback((msg: AgentMessage, isActive: boolean): StoryBubbleData | null => {
    const loc = (msg as any).location;
    if (!loc) return null;

    return {
      id: `bubble-${msg.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
      lat: loc.lat,
      lng: loc.lng,
      agentName: msg.agentName,
      agentDepartment: msg.agentDepartment,
      agentEmotion: msg.emotion || 'calm',
      message: msg.message,
      action: msg.action,
      timestamp: msg.timestamp,
      isActive,
    };
  }, []);

  // 根据消息情绪确定标记特效类型
  const getEffectType = (emotion?: string): MarkerEffectType => {
    switch (emotion) {
      case 'urgent': return 'danger_pulse';
      case 'worried':
      case 'concerned': return 'breathing_glow';
      default: return 'breathing_glow';
    }
  };

  // 聚焦到消息所在位置并创建气泡
  const focusOnMessage = useCallback((msg: AgentMessage) => {
    const loc = (msg as any).location;
    if (!loc) return;

    const effectType = getEffectType(msg.emotion);
    const summary = msg.message.slice(0, 100);

    focusOnTarget(
      loc.lat,
      loc.lng,
      loc.label || msg.agentDepartment,
      loc.zoom || 16,
      effectType,
      msg.emotion,
      summary,
    );

    const newBubble = messageToBubble(msg, true);

    setStoryBubbles(prev => {
      const updated = prev.map(b => ({ ...b, isActive: false }));
      const maxBubbles = 5;
      const trimmed = updated.length >= maxBubbles ? updated.slice(updated.length - maxBubbles + 1) : updated;
      if (newBubble) {
        return [...trimmed, newBubble];
      }
      return trimmed;
    });
  }, [focusOnTarget, messageToBubble]);


  // 剧本演绎状态
  const [isScriptPlaying, setIsScriptPlaying] = useState(false);
  const [currentScriptEventIndex, setCurrentScriptEventIndex] = useState(-1);

  // 方案全屏查看弹窗
  const [planModal, setPlanModal] = useState<{ isOpen: boolean; plan: string; title: string }>({
    isOpen: false, plan: '', title: '',
  });

  // 当前剧本阶段
  const currentScriptPhase = wuhanScenario[currentPhaseIndex];

  logger.info('CampaignMode', '组件初始化', {
    disasterCase: disasterCase.name,
    phaseCount: wuhanScenario.length,
    currentPhaseIndex,
    phase,
  });

  // 获取场景ID
  const getScenarioId = useCallback(() => {
    return 'urban-waterlogging-1';
  }, []);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 监听外部注入的消息（如AI参谋方案）
  const prevExternalCountRef = useRef(0);
  useEffect(() => {
    const msgs = externalMessages || [];
    if (msgs.length > prevExternalCountRef.current) {
      const newMessages = msgs.slice(prevExternalCountRef.current);
      newMessages.forEach(msg => {
        setMessages(prev => [...prev, msg]);
        roundEngineRef.current?.addMessage(msg);

        // 如果有位置信息，创建地图气泡
        const loc = (msg as any).location;
        if (loc) {
          const bubble = messageToBubble(msg, true);
          if (bubble) {
            setStoryBubbles(prev => {
              const updated = prev.map(b => ({ ...b, isActive: false }));
              const maxBubbles = 5;
              const trimmed = updated.length >= maxBubbles ? updated.slice(updated.length - maxBubbles + 1) : updated;
              return [...trimmed, bubble];
            });
          }
        }

        // 如果是AI参谋的方案，同时设置为用户方案以激活提交按钮
        if (msg.agentId === 'ai-advisor' && phase === 'plan_selection') {
          setUserPlan(msg.message);
        }
      });
      prevExternalCountRef.current = msgs.length;
    }
  }, [externalMessages, phase]);

  // 战役阶段切换时重置外部消息计数
  useEffect(() => {
    prevExternalCountRef.current = 0;
  }, [currentPhaseIndex]);

  // 通知父组件地图状态变化（含剧情推演状态）
  useEffect(() => {
    if (onStateChange && mapCenter && mapZoom) {
      const playerAgent = createAgent(playerRoleId || '');
      const currentScriptPhase = wuhanScenario[currentPhaseIndex];
      onStateChange({
        mapCenter,
        mapZoom,
        narration: '',
        speaker: '',
        showDecision: phase === 'plan_selection',
        currentDecisionIndex: currentPhaseIndex,
        activeEntityId: null,
        highlightEntityIds: [],
        sceneProgress: currentPhaseIndex,
        totalScenes: wuhanScenario.length,
        flowLines: [],
        movingResources: [],
        // 剧情推演状态
        playerRoleId,
        playerRoleLevel,
        playerDepartment: playerAgent?.role.department || '应急指挥',
        currentSituation: currentScriptPhase?.situation || '',
      });
    }
  }, [mapCenter, mapZoom, onStateChange, phase, currentPhaseIndex, playerRoleId, playerRoleLevel]);

  // RTS开场完成
  const handleIntroComplete = () => {
    logger.info('CampaignMode', 'RTS动画完成，切换到角色选择阶段');
    setPhase('role_selection');
    setUserPlan('');
    setMessages([]);
    setStoryBubbles([]);
    setCurrentScriptEventIndex(-1);
  };

  // 将剧本事件转换为消息
  const convertScriptEventToMessage = (event: ScenarioEvent): AgentMessage | null => {
    if (event.type === 'camera_move') return null;

    const emotionMap: Record<string, AgentMessage['emotion']> = {
      calm: 'calm', urgent: 'urgent', worried: 'concerned',
      confident: 'confident', concerned: 'concerned',
    };

    return {
      agentId: event.speakerRole || event.type,
      agentName: event.speaker,
      agentDepartment: event.speakerDepartment || '',
      message: event.title ? `${event.title}\n${event.content}` : event.content,
      emotion: emotionMap[event.emotion || ''] || 'calm',
      timestamp: Date.now(),
      action: event.type === 'order' ? event.title : undefined,
      location: event.location ? {
        lat: event.location.lat,
        lng: event.location.lng,
        label: event.location.label,
        zoom: event.location.zoom || 16,
      } : undefined,
    };
  };

  // 执行单个剧本事件（镜头+标记+气泡，统一操作）
  const playScriptEvent = useCallback((event: ScenarioEvent) => {
    const effectType = getEffectType(event.emotion);

    // 镜头移动 + 标记（原子化操作）
    if (event.cameraConfig) {
      focusOnTarget(
        event.cameraConfig.center.lat,
        event.cameraConfig.center.lng,
        event.location?.label || '目标位置',
        event.cameraConfig.zoom,
        effectType,
        event.emotion,
        event.content?.slice(0, 100),
      );
    } else if (event.location) {
      focusOnTarget(
        event.location.lat,
        event.location.lng,
        event.location.label || '目标位置',
        event.location.zoom,
        effectType,
        event.emotion,
        event.content?.slice(0, 100),
      );
    }

    // 显示消息
    const msg = convertScriptEventToMessage(event);
    if (msg) {
      setMessages(prev => [...prev, msg]);
      roundEngineRef.current?.addMessage(msg);

      // 创建地图对话气泡
      const bubble = messageToBubble(msg, true);
      if (bubble) {
        setStoryBubbles(prev => {
          const updated = prev.map(b => ({ ...b, isActive: false }));
          const maxBubbles = 5;
          const trimmed = updated.length >= maxBubbles ? updated.slice(updated.length - maxBubbles + 1) : updated;
          return [...trimmed, bubble];
        });
      }
    }

    setCurrentScriptEventIndex(prev => prev + 1);
  }, [focusOnTarget, getEffectType, messageToBubble]);

  // 播放整个剧本阶段
  const playScriptPhase = useCallback((phaseIndex: number, onComplete?: () => void) => {
    const scriptPhase = wuhanScenario[phaseIndex];
    if (!scriptPhase) {
      logger.warn('ScriptPlayer', `剧本阶段 ${phaseIndex} 不存在，跳过`);
      onComplete?.();
      return;
    }

    logger.info('ScriptPlayer', `开始播放剧本阶段`, {
      phaseIndex,
      phaseId: scriptPhase.id,
      phaseName: scriptPhase.name,
      eventCount: scriptPhase.events.length,
      decisionPointCount: scriptPhase.decisionPoints.length,
      responseLevel: scriptPhase.responseLevel,
    });

    setIsScriptPlaying(true);
    setMessages([]);
    setStoryBubbles([]);
    setCurrentScriptEventIndex(-1);
    setCurrentPhaseIndex(phaseIndex);

    let eventIndex = 0;

    const playNext = () => {
      if (eventIndex >= scriptPhase.events.length) {
        logger.info('ScriptPlayer', `剧本阶段 ${scriptPhase.name} 播放完成`);
        setIsScriptPlaying(false);
        onComplete?.();
        return;
      }

      const event = scriptPhase.events[eventIndex];
      playScriptEvent(event);

      // 根据事件类型决定停留时间
      const duration = event.type === 'camera_move' ? 2500 :
        event.type === 'alert' || event.type === 'critical_event' ? 5000 :
        event.type === 'meeting' ? 6000 :
        event.type === 'report' ? 5500 :
        event.type === 'order' || event.type === 'decision_prompt' ? 5000 :
        event.type === 'narration' ? 4500 :
        4000;

      eventIndex++;
      setTimeout(playNext, duration);
    };

    // 延迟开始
    setTimeout(playNext, 1000);
  }, [playScriptEvent]);

  // 处理角色选择
  const handleRoleSelect = (roleId: string, level: PlayerRoleLevel) => {
    logger.info('CampaignMode', '用户选择角色', { roleId, level });
    setPlayerRoleId(roleId);
    setPlayerRoleLevel(level);
    setPhase('script_playing');

    // 地图移动到初始位置（使用 focusOnTarget）
    focusOnTarget(
      disasterCase.location.lat,
      disasterCase.location.lng,
      disasterCase.location.name,
      14 // 片区态势级，便于查看整体布局
    );

    // 初始化回合引擎
    roundEngineRef.current = createRoundBasedEngine(
      wuhanDecisionRoleMappings[currentPhaseIndex] || wuhanDecisionRoleMappings[0],
      getScenarioId(),
      playerRoleId,
      playerRoleLevel
    );
    logger.info('CampaignMode', '回合引擎初始化完成');

    // 开始播放第一个剧本阶段
    setTimeout(() => {
      logger.info('CampaignMode', '开始播放序章剧本');
      playScriptPhase(0, () => {
        logger.info('CampaignMode', '序章剧本播放完成，进入方案选择阶段');
        setPhase('plan_selection');
        const playerAgent = createAgent(roleId);
        logger.info('CampaignMode', '创建AI作战参谋提示', { playerRoleId: roleId });
        const advisorPrompt: AgentMessage = {
          agentId: 'ai-advisor',
          agentName: 'AI作战参谋',
          agentDepartment: '智能决策支持',
          message: `${playerAgent?.role.department}，${currentScriptPhase?.name}情境演绎完毕。\n\n请通过右侧AI参谋面板生成处置方案，您可以编辑修改后发送到会议。`,
          emotion: 'calm',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, advisorPrompt]);
        roundEngineRef.current?.addMessage(advisorPrompt);
        onOpenAdvisor?.();
      });
    }, 1500);
  };

  // 调用 API 获取单个角色的评估发言
  const fetchAgentEvaluation = useCallback(async (
    agentRoleId: string,
    agentRoleName: string,
    agentRoleDepartment: string,
    playerDepartment: string,
    playerPlan: string,
    phaseName: string,
    responseLevel: string,
    currentSituation: string,
  ): Promise<string> => {
    try {
      const response = await fetch('/api/ai/agent-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentRoleId,
          agentRoleName,
          agentRoleDepartment,
          playerDepartment,
          playerPlan,
          phaseName,
          responseLevel,
          currentSituation,
        }),
      });

      if (!response.ok) throw new Error(`API请求失败: ${response.status}`);
      if (!response.body) throw new Error('响应体为空');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') break;

          try {
            const json = JSON.parse(jsonStr);
            const chunk = json.content || '';
            if (chunk) {
              fullText += chunk;
            }
          } catch {}
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error(`[AgentEvaluate] ${agentRoleName} 评估失败:`, error);
      return `${agentRoleName}已收到方案，将配合执行。`;
    }
  }, []);

  // 处理用户方案提交
  const handleUserPlanSubmit = async () => {
    if (!userPlan.trim() || !playerRoleId || !playerRoleLevel) return;

    const playerAgent = createAgent(playerRoleId);
    const userMessage: AgentMessage = {
      agentId: 'user',
      agentName: playerAgent?.role.name || '指挥员',
      agentDepartment: playerAgent?.role.department || '应急指挥',
      message: userPlan,
      emotion: 'confident',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserPlan('');
    setIsTyping(true);

    roundEngineRef.current?.setPlayerPlan(userPlan);

    // 依次获取各角色评估（轮流调用大模型）
    const agents = getDecisionAgents(wuhanDecisionRoleMappings[currentPhaseIndex] || wuhanDecisionRoleMappings[0]);
    const otherAgents = agents.filter(a => a.role.id !== playerRoleId);
    const phaseName = currentScriptPhase?.name || '';
    const responseLevel = currentScriptPhase?.responseLevel || '';
    const currentSituation = currentScriptPhase?.situation || '';
    const playerDepartment = playerAgent?.role.department || '应急指挥';

    for (const agent of otherAgents) {
      // 每个角色之间间隔，模拟轮流发言
      await new Promise(resolve => setTimeout(resolve, 1500));

      const evaluationText = await fetchAgentEvaluation(
        agent.role.id,
        agent.role.name,
        agent.role.department,
        playerDepartment,
        userPlan,
        phaseName,
        responseLevel,
        currentSituation,
      );

      const evalMessage: AgentMessage = {
        agentId: agent.role.id,
        agentName: agent.role.name,
        agentDepartment: agent.role.department,
        message: evaluationText,
        emotion: 'calm',
        timestamp: Date.now(),
        action: '配合执行方案',
      };
      setMessages(prev => [...prev, evalMessage]);
      roundEngineRef.current?.addMessage(evalMessage);
    }

    // 所有角色评估完毕后进入推演
    await new Promise(resolve => setTimeout(resolve, 1000));
    endCurrentRound();
  };

  // 结束当前回合并触发推演
  const endCurrentRound = () => {
    setIsTyping(false);
    setIsSimulating(true);
    setPhase('round_simulation');

    setTimeout(() => {
      const result = roundEngineRef.current?.endRound();
      if (result) {
        setRoundResult(result);
        setRoundNumber(result.roundNumber + 1);
        setPhase('round_outcome');
        setIsSimulating(false);
      }
    }, 1500);
  };

  // 进入下一阶段
  const advanceToNextPhase = () => {
    const nextPhaseIndex = currentPhaseIndex + 1;

    // 检查是否所有阶段都完成了
    if (nextPhaseIndex >= wuhanScenario.length) {
      setPhase('game_over');
      const finalReport = {
        score: roundResult ? (roundResult.grade === 'S' ? 95 : roundResult.grade === 'A' ? 85 : roundResult.grade === 'B' ? 75 : roundResult.grade === 'C' ? 65 : roundResult.grade === 'D' ? 50 : 30) : Math.floor(Math.random() * 30) + 70,
        decisionCount: currentPhaseIndex + 1,
        roundCount: roundNumber,
        aiComment: roundResult ? roundResult.summary : '战役结束，感谢您的指挥。',
        grade: roundResult?.grade,
        casualties: roundResult?.outcome?.casualties,
      };
      onComplete(finalReport);
      return;
    }

    // 进入下一阶段
    setPhase('script_playing');
    setMessages([]);
    setStoryBubbles([]);
    setRoundResult(null);
    setUserPlan('');
    setRoundNumber(1);
    roundEngineRef.current?.reset();

    setTimeout(() => {
      playScriptPhase(nextPhaseIndex, () => {
        setPhase('plan_selection');
        const playerAgent = createAgent(playerRoleId || '');
        const advisorPrompt: AgentMessage = {
          agentId: 'ai-advisor',
          agentName: 'AI作战参谋',
          agentDepartment: '智能决策支持',
          message: `${playerAgent?.role.department}，第${nextPhaseIndex + 1}阶段情境演绎完毕。\n\n请根据最新灾情，通过右侧AI参谋面板生成处置方案。`,
          emotion: 'calm',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, advisorPrompt]);
        roundEngineRef.current?.addMessage(advisorPrompt);
        onOpenAdvisor?.();
      });
    }, 1000);
  };

  // 重新推演当前阶段
  const retryPhase = () => {
    setPhase('plan_selection');
    setRoundResult(null);
    setUserPlan('');
  };

  // 获取方案模板
  const getPlanTemplate = (): PlanTemplate | null => {
    return roundEngineRef.current?.getPlanTemplate() || null;
  };

  // 获取当前灾情描述（用于AI参谋）
  const getCurrentSituation = () => {
    return currentScriptPhase?.situation || '';
  };

  // 获取AI参谋提示词
  const getAdvisorPrompt = () => {
    return getAdvisorPromptForPhase(currentPhaseIndex, playerRoleId || undefined, getCurrentSituation());
  };

  return (
    <>
      {/* RTS 开场动画 */}
      <AnimatePresence>
        {phase === 'intro' && (
          <RTSIntroOverlay disasterCase={disasterCase} onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* 角色选择面板 */}
      {phase === 'role_selection' && currentScriptPhase && (
        <RoleSelectionPanel
          onSelectRole={handleRoleSelect}
          currentPhase={currentScriptPhase}
        />
      )}

      {/* 极简通讯日志面板 */}
      {phase !== 'intro' && phase !== 'role_selection' && (
        <DraggablePanel
          title="📋 通讯日志"
          icon={<MessageSquare className="w-4 h-4 text-blue-400" />}
          defaultPosition={{ x: 0, y: 0 }}
          defaultSize={{ width: 320, height: '100%' }}
          headerRight={
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
              {currentPhaseIndex + 1}/{wuhanScenario.length}
            </Badge>
          }
        >
          <div className="flex flex-col h-full">
            {playerRoleLevel && (
              <div className="px-3 py-1.5 border-b border-slate-700/50 flex items-center gap-1.5">
                <Badge className={`text-xs ${
                  playerRoleLevel === 'decision' ? 'bg-amber-500/20 text-amber-400' :
                  playerRoleLevel === 'core' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {playerRoleLevel === 'decision' ? '指挥层' :
                   playerRoleLevel === 'core' ? '执行层' : '协同层'}
                </Badge>
                <span className="text-xs text-slate-500 truncate">{createAgent(playerRoleId || '')?.role.department}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  {storyBubbles.filter(b => b.isActive).length > 0 ? '🔵 活跃中' : ''}
                </span>
              </div>
            )}

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-2"
              onWheel={e => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
              {messages.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">等待通讯...</div>
              )}
              {messages.map((msg, idx) => (
                <HistoryLogEntry
                  key={idx}
                  message={msg}
                  isUser={msg.agentId === 'user'}
                  onClick={() => focusOnMessage(msg)}
                />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                  <span className="animate-pulse">●</span>
                  AI思考中...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 方案提交提示（当有方案时显示） */}
            {phase === 'plan_selection' && userPlan && (
              <div className="p-3 border-t border-slate-700">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-300">方案已准备好</span>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleUserPlanSubmit}
                  >
                    <Send className="w-3 h-3 mr-1" />提交
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DraggablePanel>
      )}

      {/* 右侧：角色状态面板 */}
      {phase !== 'intro' && phase !== 'role_selection' && currentScriptPhase && (
        <div className="absolute top-16 right-4 w-64 pointer-events-none" style={{ zIndex: 100 }}>
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">当前阶段</span>
            </div>
            <div className="text-sm text-white font-bold mb-1">{currentScriptPhase.name}</div>
            <div className="text-xs text-slate-400 mb-3">{currentScriptPhase.description}</div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">{currentScriptPhase.startTime} - {currentScriptPhase.endTime}</span>
            </div>
            {currentScriptPhase.responseLevel && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{currentScriptPhase.responseLevel}</Badge>
            )}
          </div>
        </div>
      )}

      {/* 剧本演绎状态指示器 */}
      {isScriptPlaying && currentScriptPhase && (
        <div className="absolute top-16 left-4 mt-0 pointer-events-auto" style={{ zIndex: 101 }}>
          <div className="bg-purple-600/80 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
            <BookOpen className="w-3 h-3 animate-pulse" />
            <span>情境演绎中... {currentScriptEventIndex + 1}/{currentScriptPhase.events.length}</span>
          </div>
        </div>
      )}

      {/* 回合推演结果 */}
      <AnimatePresence>
        {phase === 'round_outcome' && roundResult && (
          <RoundOutcomePanel result={roundResult} onContinue={advanceToNextPhase} onRetry={retryPhase} />
        )}
      </AnimatePresence>

      {/* 方案全屏查看弹窗 */}
      <AnimatePresence>
        {planModal.isOpen && (
          <PlanDetailModal
            plan={planModal.plan}
            title={planModal.title}
            onClose={() => setPlanModal({ isOpen: false, plan: '', title: '' })}
          />
        )}
      </AnimatePresence>

      {/* 控制按钮 */}
      {phase !== 'intro' && phase !== 'role_selection' && (
        <>
          <div className="absolute top-16 right-4 mt-0" style={{ zIndex: 100 }}>
            <Button variant="ghost" size="sm" className="bg-slate-900/50 text-slate-400 hover:text-white" onClick={advanceToNextPhase}>
              <SkipForward className="w-4 h-4 mr-1" />跳过
            </Button>
          </div>
          <div className="absolute top-16 right-4 mt-10" style={{ zIndex: 100 }}>
            <div className="flex flex-col items-center gap-1 bg-slate-900/50 backdrop-blur-sm rounded-full px-2 py-3">
              <MapPin className="w-3 h-3 text-amber-400 mb-1" />
              {wuhanScenario.map((_, idx) => (
                <div key={idx} className={`w-1.5 rounded-full transition-all ${
                  idx === currentPhaseIndex ? 'bg-amber-400 h-6' :
                  idx < currentPhaseIndex ? 'bg-emerald-400 h-1.5' : 'bg-slate-600 h-1.5'
                }`} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
