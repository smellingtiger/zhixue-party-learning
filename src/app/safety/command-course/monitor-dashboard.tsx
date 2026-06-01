'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { DisasterMetric, MetricStatus, MetricTrend } from './disaster-metrics';

interface MonitorDashboardProps {
  metrics: DisasterMetric[];
}

const statusColors: Record<MetricStatus, { bar: string; text: string; glow: string }> = {
  normal: { bar: 'bg-green-500', text: 'text-green-400', glow: 'rgba(34,197,94,0.3)' },
  warning: { bar: 'bg-yellow-500', text: 'text-yellow-400', glow: 'rgba(234,179,8,0.3)' },
  critical: { bar: 'bg-red-500', text: 'text-red-400', glow: 'rgba(239,68,68,0.3)' },
};

const statusLabels: Record<MetricStatus, string> = {
  normal: '正常',
  warning: '警戒',
  critical: '危险',
};

function TrendIcon({ trend }: { trend: MetricTrend }) {
  if (trend === 'up') return <ArrowUp className="w-3 h-3 text-red-400" />;
  if (trend === 'down') return <ArrowDown className="w-3 h-3 text-green-400" />;
  return <Minus className="w-3 h-3 text-gray-400" />;
}

function MetricBar({ metric }: { metric: DisasterMetric }) {
  const colors = statusColors[metric.status];
  const percentage = ((metric.currentValue - metric.minValue) / (metric.maxValue - metric.minValue)) * 100;

  const safeStart = ((metric.safeRange[0] - metric.minValue) / (metric.maxValue - metric.minValue)) * 100;
  const safeEnd = ((metric.safeRange[1] - metric.minValue) / (metric.maxValue - metric.minValue)) * 100;
  const warnStart = ((metric.warningRange[0] - metric.minValue) / (metric.maxValue - metric.minValue)) * 100;
  const warnEnd = ((metric.warningRange[1] - metric.minValue) / (metric.maxValue - metric.minValue)) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{metric.icon}</span>
          <span className="text-gray-100 text-[11px] font-bold">{metric.label}</span>
          <TrendIcon trend={metric.trend} />
        </div>
        <span className={`text-xs font-black ${colors.text}`}>
          {metric.currentValue}{metric.unit}
        </span>
      </div>

      <div className="relative h-3 bg-gray-800 border border-gray-700 overflow-hidden" style={{ borderRadius: '0' }}>
        <div className="absolute inset-y-0 left-0 bg-green-900/30" style={{ left: `${safeStart}%`, width: `${safeEnd - safeStart}%` }} />
        <div className="absolute inset-y-0 left-0 bg-yellow-900/20" style={{ left: `${warnStart}%`, width: `${warnEnd - warnStart}%` }} />
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${colors.bar}`}
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 w-[2px] bg-white/80"
          style={{ left: `${percentage}%`, transition: 'left 0.7s ease-out' }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[9px] text-gray-400">{metric.minValue}</span>
        <span className={`text-[9px] font-bold ${colors.text}`}>{statusLabels[metric.status]}</span>
        <span className="text-[9px] text-gray-400">{metric.maxValue}</span>
      </div>
    </div>
  );
}

export default function MonitorDashboard({ metrics }: MonitorDashboardProps) {
  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('zh-CN'));
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative border-2 border-gray-700 bg-gray-950 overflow-hidden flex-shrink-0" style={{ borderRadius: '0' }}>
        <div className="h-20 flex items-center justify-center">
          <div className="w-full px-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${criticalCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-[10px] text-gray-200 font-bold">
                  CAM-01 {criticalCount > 0 ? 'ALERT' : 'LIVE'}
                </span>
              </div>
              <span className="text-[10px] text-gray-300">
                {time}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-600/50" style={{ borderRadius: '0' }} />
                <span className="text-[8px] text-gray-300">{criticalCount}危</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-600/50" style={{ borderRadius: '0' }} />
                <span className="text-[8px] text-gray-300">{metrics.filter(m => m.status === 'warning').length}警</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600/50" style={{ borderRadius: '0' }} />
                <span className="text-[8px] text-gray-300">{metrics.filter(m => m.status === 'normal').length}安</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-auto border-t-2 border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-200 text-[10px] font-bold tracking-wider">实时监测指标</span>
          <span className="text-gray-400 text-[9px]">
            {metrics.length}项
          </span>
        </div>

        {metrics.map(metric => (
          <MetricBar key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}