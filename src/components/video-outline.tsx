'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ChevronRight, FileText } from 'lucide-react';

interface OutlineEntry {
  paragraph_index: number;
  start_time_second: number;
  end_time_second: number;
  content: string;
  title?: string;
}

interface VideoOutlineProps {
  courseId: string;
  onSeekTo?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoOutline({ courseId, onSeekTo }: VideoOutlineProps) {
  const [outline, setOutline] = useState<OutlineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadOutline() {
      setLoading(true);
      try {
        const res = await fetch(`/course-outline/${courseId}`);
        const data = await res.json();
        setOutline(data || []);
      } catch (err) {
        console.error('加载大纲失败:', err);
        setOutline([]);
      } finally {
        setLoading(false);
      }
    }
    loadOutline();
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (outline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无大纲数据</p>
        <p className="text-xs mt-1">视频转写结果尚未生成</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {outline.map((entry) => {
        const isActive = activeIndex === entry.paragraph_index;
        return (
          <div
            key={entry.paragraph_index}
            onClick={() => {
              setActiveIndex(entry.paragraph_index);
              onSeekTo?.(entry.start_time_second);
            }}
            className={`
              group flex items-start gap-2 py-2 px-3 rounded-md cursor-pointer transition-all
              ${isActive
                ? 'bg-red-600 text-white shadow-sm'
                : 'hover:bg-gray-100 text-gray-700'
              }
            `}
          >
            <div className={`flex-shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-90' : ''}`}>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium leading-snug line-clamp-2 ${isActive ? 'text-white' : ''}`}>
                {entry.title || `第${entry.paragraph_index}部分`}
              </div>
              <div className={`flex items-center gap-1 text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {formatTime(entry.start_time_second)} - {formatTime(entry.end_time_second)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}