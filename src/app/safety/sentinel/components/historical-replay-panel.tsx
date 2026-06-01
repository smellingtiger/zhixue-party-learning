'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack,
  MapPin, Clock, Users, AlertTriangle,
  ChevronRight, ChevronLeft, ZoomIn,
  MessageSquare, BookOpen, UserCheck, ClipboardList,
  CheckCircle, TrendingUp, AlertOctagon, Video,
  Volume2, VolumeX, RotateCcw, FastForward
} from 'lucide-react';
import type {
  HistoricalEvent,
  HistoricalScript,
  ScriptPhase,
  ReplayState,
  HistoricalEventType
} from '@/lib/historical-replay';
import {
  getEventColor,
  getEventIcon,
  eventHasLocation,
  getEventRecommendedZoom
} from '@/lib/historical-replay';

interface HistoricalReplayPanelProps {
  script: HistoricalScript;
  onEventSelect?: (event: HistoricalEvent) => void;
  onMapFocus?: (location: { lat: number; lng: number }, zoom?: number) => void;
  onCameraMove?: (cameraConfig: { center: { lat: number; lng: number }; zoom: number; duration?: number; action?: string }) => void;
  onComplete?: () => void;
  onPhaseChange?: (phase: ScriptPhase) => void;
}

// ==================== 音效控制器 ====================
function SoundEffect({ soundType, isPlaying }: { soundType?: string; isPlaying: boolean }) {
  const [muted, setMuted] = useState(false);
  
  useEffect(() => {
    if (!soundType || !isPlaying || muted) return;
    
    // 这里可以集成实际的音频播放
    // 目前使用视觉反馈代替
    console.log(`🔊 播放音效: ${soundType}`);
  }, [soundType, isPlaying, muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
      title={muted ? '开启音效' : '静音'}
    >
      {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
    </button>
  );
}

// ==================== 历史事件消息气泡 ====================
function HistoricalEventBubble({
  event,
  isSelected,
  onClick,
  isCurrent
}: {
  event: HistoricalEvent;
  isSelected: boolean;
  onClick: () => void;
  isCurrent: boolean;
}) {
  const color = getEventColor(event.type);
  const iconMap: Record<string, React.ReactNode> = {
    'book-open': <BookOpen className="w-4 h-4" />,
    'alert-triangle': <AlertTriangle className="w-4 h-4" />,
    'upload': <MessageSquare className="w-4 h-4" />,
    'users': <Users className="w-4 h-4" />,
    'user-check': <UserCheck className="w-4 h-4" />,
    'message-square': <MessageSquare className="w-4 h-4" />,
    'clipboard-list': <ClipboardList className="w-4 h-4" />,
    'check-circle': <CheckCircle className="w-4 h-4" />,
    'trending-up': <TrendingUp className="w-4 h-4" />,
    'alert-octagon': <AlertOctagon className="w-4 h-4" />,
    'video': <Video className="w-4 h-4" />,
  };

  const IconComponent = iconMap[getEventIcon(event.type)] || <BookOpen className="w-4 h-4" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative cursor-pointer transition-all ${
        isSelected ? 'scale-[1.02]' : ''
      } ${isCurrent ? '' : 'opacity-80'}`}
      onClick={onClick}
    >
      <div className={`rounded-xl border p-4 ${
        isSelected
          ? `border-2 shadow-lg`
          : event.isUrgent
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-slate-700 bg-slate-800/50'
      }`}
         style={{
           borderColor: isSelected ? color : undefined,
           boxShadow: isSelected ? `0 0 20px ${color}40` : undefined
         }}>
        {/* 头部信息 */}
        <div className="flex items-start gap-3 mb-2">
          {/* 时间标签 */}
          <div className={`shrink-0 px-2 py-1 rounded text-xs font-bold flex items-center gap-1`}
               style={{
                 backgroundColor: `${color}20`,
                 color: color
               }}>
            <Clock className="w-3 h-3" />
            {event.time}
          </div>

          {/* 图标和发言人 */}
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center`}
                 style={{ backgroundColor: `${color}20` }}>
              <span style={{ color }}>{IconComponent}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{event.speaker}</span>
                {event.speakerDepartment && (
                  <span className="text-xs text-slate-400 truncate">{event.speakerDepartment}</span>
                )}
              </div>
              {event.title && (
                <div className="text-xs font-medium mt-0.5"
                     style={{ color }}>
                  {event.title}
                </div>
              )}
            </div>
          </div>

          {/* 地图定位按钮 */}
          {eventHasLocation(event) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className={`shrink-0 p-1.5 rounded-lg transition-colors hover:bg-slate-700`}
              title="点击定位到地图"
            >
              <MapPin className="w-4 h-4" style={{ color }} />
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap pl-14">
          {event.content}
        </div>

        {/* 当前播放指示器 */}
        {isCurrent && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -left-1 top-1/2 w-1 h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        )}

        {/* 紧急标识 */}
        {event.isUrgent && (
          <div className="absolute top-2 right-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==================== 时间线阶段指示器 ====================
function PhaseIndicator({
  phases,
  currentPhaseIndex,
  onPhaseClick
}: {
  phases: ScriptPhase[];
  currentPhaseIndex: number;
  onPhaseClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {phases.map((phase, index) => {
        const isActive = index === currentPhaseIndex;
        const isPast = index < currentPhaseIndex;

        return (
          <button
            key={phase.id}
            onClick={() => onPhaseClick(index)}
            className={`shrink-0 px-4 py-2 rounded-lg border transition-all text-left ${
              isActive
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105'
                : isPast
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold">{phase.name}</div>
            <div className="text-[10px] opacity-70">{phase.startTime} - {phase.endTime}</div>
          </button>
        );
      })}
    </div>
  );
}

// ==================== AI参谋长提示弹窗 ====================
function AIAdvisorPopup({
  event,
  onClose
}: {
  event: HistoricalEvent;
  onClose: () => void;
}) {
  if (!event || event.type !== 'meeting_start') return null;

  // 从事件内容中提取AI参谋提示
  const aiMatch = event.content.match(/⚠️\s*\*\*AI参谋提示\*\*：\s*([\s\S]*?)(?=\n\n|$)/);
  if (!aiMatch) return null;

  const aiAdvice = aiMatch[1].trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-4 right-4 z-50 max-w-md"
    >
      <div className="bg-gradient-to-br from-blue-900/95 to-indigo-900/95 border border-blue-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-blue-300">AI参谋长</div>
            <div className="text-xs text-blue-400">决策建议</div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded hover:bg-slate-700 text-slate-400"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {aiAdvice}
        </div>
      </div>
    </motion.div>
  );
}

// ==================== 主组件 ====================
export default function HistoricalReplayPanel({
  script,
  onEventSelect,
  onMapFocus,
  onCameraMove,
  onComplete,
  onPhaseChange
}: HistoricalReplayPanelProps) {
  // 播放状态
  const [replayState, setReplayState] = useState<ReplayState>({
    currentPhaseIndex: 0,
    currentEventIndex: 0,
    isPlaying: false,
    playbackSpeed: 1.0,
    autoAdvance: true,
    selectedEventId: null,
  });

  // 已显示的事件列表（用于滚动显示）
  const [displayedEvents, setDisplayedEvents] = useState<HistoricalEvent[]>([]);
  
  // AI提示弹窗状态
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = script.phases[replayState.currentPhaseIndex];
  const currentEvent = currentPhase?.events[replayState.currentEventIndex];
  const totalEvents = script.phases.reduce((sum, phase) => sum + phase.events.length, 0);
  const currentGlobalEventIndex = script.phases
    .slice(0, replayState.currentPhaseIndex)
    .reduce((sum, phase) => sum + phase.events.length, 0)
    + replayState.currentEventIndex;

  // 获取当前事件并添加到显示列表
  useEffect(() => {
    if (currentEvent && !displayedEvents.find(e => e.id === currentEvent.id)) {
      setDisplayedEvents(prev => [...prev, currentEvent]);
      
      // 自动滚动到底部
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      // 处理镜头移动事件
      if (currentEvent.type === 'camera_move' && currentEvent.cameraConfig) {
        onCameraMove?.(currentEvent.cameraConfig);
      }

      // 处理地图定位
      if (eventHasLocation(currentEvent) && currentEvent.location) {
        const zoom = getEventRecommendedZoom(currentEvent);
        onMapFocus?.(currentEvent.location, zoom);
      }

      // 显示AI参谋提示（如果是会议开始事件）
      if (currentEvent.type === 'meeting_start') {
        setShowAIAdvisor(true);
      } else {
        setShowAIAdvisor(false);
      }

      // 通知阶段变化
      if (replayState.currentEventIndex === 0) {
        onPhaseChange?.(currentPhase);
      }
    }
  }, [currentEvent?.id]);

  // 自动播放逻辑
  useEffect(() => {
    if (replayState.isPlaying && replayState.autoAdvance) {
      // 根据事件类型决定停留时间
      const getEventDuration = (event: HistoricalEvent): number => {
        const baseDuration = 4000; // 基础4秒
        
        switch (event.type) {
          case 'narration':
            return baseDuration * 1.2; // 旁白稍长
          case 'alert':
          case 'critical_event':
            return baseDuration * 1.5; // 紧急事件更长
          case 'briefing':
            return baseDuration * 1.8; // 汇报内容较长
          case 'camera_move':
            return baseDuration * 0.8; // 镜头移动稍短
          default:
            return baseDuration;
        }
      };

      if (currentEvent) {
        const duration = getEventDuration(currentEvent) / replayState.playbackSpeed;

        playbackTimerRef.current = setTimeout(() => {
          advanceToNextEvent();
        }, duration);
      }

      return () => {
        if (playbackTimerRef.current) {
          clearTimeout(playbackTimerRef.current);
        }
      };
    }
  }, [replayState.isPlaying, replayState.currentEventIndex, replayState.currentPhaseIndex, replayState.playbackSpeed]);

  // 推进到下一个事件
  const advanceToNextEvent = useCallback(() => {
    const phase = script.phases[replayState.currentPhaseIndex];
    
    if (replayState.currentEventIndex < phase.events.length - 1) {
      // 同一阶段的下一个事件
      setReplayState(prev => ({
        ...prev,
        currentEventIndex: prev.currentEventIndex + 1,
      }));
    } else if (replayState.currentPhaseIndex < script.phases.length - 1) {
      // 进入下一阶段
      setReplayState(prev => ({
        ...prev,
        currentPhaseIndex: prev.currentPhaseIndex + 1,
        currentEventIndex: 0,
      }));
    } else {
      // 播放完成
      setReplayState(prev => ({
        ...prev,
        isPlaying: false,
      }));
      onComplete?.();
    }
  }, [replayState.currentPhaseIndex, replayState.currentEventIndex, script.phases, onComplete]);

  // 返回上一个事件
  const goToPreviousEvent = useCallback(() => {
    if (replayState.currentEventIndex > 0) {
      setReplayState(prev => ({
        ...prev,
        currentEventIndex: prev.currentEventIndex - 1,
      }));
    } else if (replayState.currentPhaseIndex > 0) {
      const prevPhase = script.phases[replayState.currentPhaseIndex - 1];
      setReplayState(prev => ({
        ...prev,
        currentPhaseIndex: prev.currentPhaseIndex - 1,
        currentEventIndex: prevPhase.events.length - 1,
      }));
    }
  }, [replayState.currentPhaseIndex, replayState.currentEventIndex, script.phases]);

  // 跳转到指定事件
  const jumpToEvent = useCallback((phaseIndex: number, eventIndex: number) => {
    const phase = script.phases[phaseIndex];
    const event = phase.events[eventIndex];

    setReplayState(prev => ({
      ...prev,
      currentPhaseIndex: phaseIndex,
      currentEventIndex: eventIndex,
      selectedEventId: event.id,
    }));

    // 触发回调
    onEventSelect?.(event);

    // 如果有镜头配置，执行镜头移动
    if (event.cameraConfig) {
      onCameraMove?.(event.cameraConfig);
    }

    // 如果有位置信息，聚焦地图
    if (eventHasLocation(event) && event.location) {
      const zoom = getEventRecommendedZoom(event);
      onMapFocus?.(event.location, zoom);
    }
  }, [script.phases, onEventSelect, onMapFocus, onCameraMove]);

  // 切换播放状态
  const togglePlayback = () => {
    setReplayState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  // 处理事件点击
  const handleEventClick = (event: HistoricalEvent) => {
    setReplayState(prev => ({
      ...prev,
      selectedEventId: event.id,
    }));

    onEventSelect?.(event);

    // 执行镜头移动
    if (event.cameraConfig) {
      onCameraMove?.(event.cameraConfig);
    }

    // 定位到地图
    if (eventHasLocation(event) && event.location) {
      const zoom = getEventRecommendedZoom(event);
      onMapFocus?.(event.location, zoom);
    }
  };

  // 重置播放
  const resetReplay = () => {
    setReplayState({
      currentPhaseIndex: 0,
      currentEventIndex: 0,
      isPlaying: false,
      playbackSpeed: 1.0,
      autoAdvance: true,
      selectedEventId: null,
    });
    setDisplayedEvents([]);
    setShowAIAdvisor(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden relative">
      {/* AI参谋长提示弹窗 */}
      <AnimatePresence>
        {showAIAdvisor && currentEvent && (
          <AIAdvisorPopup
            event={currentEvent}
            onClose={() => setShowAIAdvisor(false)}
          />
        )}
      </AnimatePresence>

      {/* 顶部控制栏 */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-white">历史还原</span>
            <span className="text-xs text-slate-400">{script.name}</span>
          </div>
          
          {/* 播放进度 */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{currentGlobalEventIndex + 1}/{totalEvents}</span>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{ width: `${((currentGlobalEventIndex + 1) / totalEvents) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* 阶段指示器 */}
        <PhaseIndicator
          phases={script.phases}
          currentPhaseIndex={replayState.currentPhaseIndex}
          onPhaseClick={(index) => {
            jumpToEvent(index, 0);
          }}
        />

        {/* 播放控制按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 重置 */}
            <button
              onClick={resetReplay}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="重新开始"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* 上一个 */}
            <button
              onClick={goToPreviousEvent}
              disabled={replayState.currentPhaseIndex === 0 && replayState.currentEventIndex === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="上一个事件"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 播放/暂停 */}
            <button
              onClick={togglePlayback}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              {replayState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {displayedEvents.length === 0 ? '开始还原' : '继续'}
                </>
              )}
            </button>

            {/* 下一个 */}
            <button
              onClick={advanceToNextEvent}
              disabled={
                replayState.currentPhaseIndex === script.phases.length - 1 &&
                replayState.currentEventIndex === currentPhase.events.length - 1
              }
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="下一个事件"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 跳过到结束 */}
            <button
              onClick={() => {
                const lastPhase = script.phases[script.phases.length - 1];
                jumpToEvent(script.phases.length - 1, lastPhase.events.length - 1);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="跳到最后"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* 音效控制 */}
            <SoundEffect
              soundType={currentEvent?.soundEffect}
              isPlaying={replayState.isPlaying}
            />
          </div>

          {/* 播放速度控制 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">速度:</span>
            {[0.5, 1.0, 1.5, 2.0].map(speed => (
              <button
                key={speed}
                onClick={() => setReplayState(prev => ({ ...prev, playbackSpeed: speed }))}
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  replayState.playbackSpeed === speed
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 事件列表区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ overscrollBehavior: 'contain' }}
      >
        <AnimatePresence mode="popLayout">
          {displayedEvents.map((event) => (
            <HistoricalEventBubble
              key={event.id}
              event={event}
              isSelected={replayState.selectedEventId === event.id}
              isCurrent={currentEvent?.id === event.id}
              onClick={() => handleEventClick(event)}
            />
          ))}
        </AnimatePresence>

        {/* 正在加载提示 */}
        {replayState.isPlaying && (
          <div className="flex items-center justify-center py-4 text-slate-500 text-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mr-2"
            />
            还原进行中...
          </div>
        )}

        {/* 空状态 */}
        {displayedEvents.length === 0 && !replayState.isPlaying && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <BookOpen className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">点击"开始还原"按钮</p>
            <p className="text-xs mt-1">查看完整的历史响应过程</p>
          </div>
        )}
      </div>

      {/* 底部当前事件信息栏 */}
      {currentEvent && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3 border-t border-slate-700 bg-slate-800/50"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{currentPhase.name}</span>
              <span style={{ color: getEventColor(currentEvent.type) }}>
                {currentEvent.type === 'narration' ? '旁白' :
                 currentEvent.type === 'alert' ? '警报' :
                 currentEvent.type === 'report' ? '上报' :
                 currentEvent.type === 'meeting_start' ? '会议' :
                 currentEvent.type === 'attendance' ? '报到' :
                 currentEvent.type === 'briefing' ? '汇报' :
                 currentEvent.type === 'order' ? '指令' :
                 currentEvent.type === 'response' ? '响应' :
                 currentEvent.type === 'escalation' ? '升级' :
                 currentEvent.type === 'camera_move' ? '镜头' : '关键事件'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {eventHasLocation(currentEvent) && (
                <button
                  onClick={() => handleEventClick(currentEvent)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ZoomIn className="w-3 h-3" />
                  定位地图
                </button>
              )}
              {currentEvent.cameraConfig && (
                <button
                  onClick={() => currentEvent.cameraConfig && onCameraMove?.(currentEvent.cameraConfig)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Video className="w-3 h-3" />
                  运镜
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
