'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PlayStatus = 'idle' | 'playing' | 'paused';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

const CHAPTER_IDS = ['preface', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5', 'chapter6', 'chapter7', 'chapter8'];

interface SectionMarker {
  title: string;
  timeOffset: number;
}

interface ChapterContent {
  title: string;
  content: string;
  sections?: SectionMarker[];
}

interface DigitalAvatarProps {
  chapterContents: ChapterContent[];
  currentChapterIndex: number;
  audioPrefix?: string;
  onSpeechEnd?: () => void;
  onSectionChange?: (sectionIndex: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function DigitalAvatar({ chapterContents, currentChapterIndex, audioPrefix = '/audio/', onSpeechEnd, onSectionChange }: DigitalAvatarProps) {
  const [status, setStatus] = useState<PlayStatus>('idle');
  const [speed, setSpeed] = useState(1.0);
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});
  const [audioAvailable, setAudioAvailable] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const currentContent = chapterContents[currentChapterIndex];
  const chapterId = CHAPTER_IDS[currentChapterIndex] || `chapter${currentChapterIndex}`;
  const audioUrl = `${audioPrefix}${chapterId}.mp3`;
  const hasAudio = audioAvailable[chapterId] === true;

  useEffect(() => {
    fetch('/audio/durations.json')
      .then(res => res.json())
      .then((data: Record<string, number>) => setAudioDurations(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const check = async () => {
      for (let i = 0; i < chapterContents.length && i < CHAPTER_IDS.length; i++) {
        const id = CHAPTER_IDS[i];
        try {
          const res = await fetch(`${audioPrefix}${id}.mp3`, { method: 'HEAD' });
          setAudioAvailable(prev => ({ ...prev, [id]: res.ok }));
        } catch {
          setAudioAvailable(prev => ({ ...prev, [id]: false }));
        }
      }
    };
    check();
  }, [chapterContents.length, audioPrefix]);

  const splitIntoSentences = (text: string): string[] => {
    return text
      .replace(/([。！？；\n])/g, '$1|')
      .split('|')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim());
  };

  const estimatedTotalDuration = useMemo(() => {
    if (!currentContent) return 0;
    const sentences = splitIntoSentences(currentContent.content);
    const charsPerSec = 4.25;
    return sentences.reduce((sum, s) => sum + s.replace(/\s+/g, '').length / charsPerSec, 0);
  }, [currentContent]);

  const effectiveTotalDuration = hasAudio
    ? (audioDurations[chapterId] || audioDuration || estimatedTotalDuration)
    : estimatedTotalDuration;

  const progressPercent = effectiveTotalDuration > 0 ? (currentTime / effectiveTotalDuration) * 100 : 0;
  const sectionMarkers: SectionMarker[] = currentContent?.sections || [];

  const updateTimeDisplay = useCallback(() => {
    if (audioRef.current && !isDraggingRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    if (audioRef.current && !audioRef.current.paused) {
      rafRef.current = requestAnimationFrame(updateTimeDisplay);
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!currentContent) return;

    if (hasAudio) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener('loadedmetadata', () => {
          setAudioDuration(audioRef.current!.duration);
        });
        audioRef.current.addEventListener('ended', () => {
          setStatus('idle');
          setCurrentTime(0);
          if (onSpeechEnd) onSpeechEnd();
        });
        audioRef.current.addEventListener('error', () => {
          setStatus('idle');
        });
      }
      audioRef.current.playbackRate = speed;
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setStatus('playing');
        rafRef.current = requestAnimationFrame(updateTimeDisplay);
      }).catch(() => {
        setStatus('idle');
      });
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const sentences = splitIntoSentences(currentContent.content);
      const text = sentences.join('');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = speed;
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.startsWith('zh'));
      if (zhVoice) utterance.voice = zhVoice;
      utterance.onend = () => {
        setStatus('idle');
        setCurrentTime(0);
        if (onSpeechEnd) onSpeechEnd();
      };
      utterance.onerror = () => {
        setStatus('idle');
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setStatus('playing');
      setAudioDuration(estimatedTotalDuration);

      const startTime = performance.now();
      const timer = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          const elapsed = (performance.now() - startTime) / 1000 * speed;
          setCurrentTime(Math.min(elapsed, estimatedTotalDuration));
        } else if (!window.speechSynthesis.speaking) {
          clearInterval(timer);
        }
      }, 100);
    }
  }, [currentContent, hasAudio, audioUrl, speed, estimatedTotalDuration, onSpeechEnd, updateTimeDisplay]);

  const handlePause = useCallback(() => {
    if (hasAudio && audioRef.current) {
      audioRef.current.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      window.speechSynthesis.pause();
    }
    setStatus('paused');
  }, [hasAudio]);

  const handleResume = useCallback(() => {
    if (hasAudio && audioRef.current) {
      audioRef.current.play().then(() => {
        setStatus('playing');
        rafRef.current = requestAnimationFrame(updateTimeDisplay);
      });
    } else {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  }, [hasAudio, updateTimeDisplay]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      cancelAnimationFrame(rafRef.current);
    }
    window.speechSynthesis.cancel();
    setStatus('idle');
    setCurrentTime(0);
    setAudioDuration(0);
  }, []);

  const handleToggle = useCallback(() => {
    if (status === 'playing') handlePause();
    else if (status === 'paused') handleResume();
    else handlePlay();
  }, [status, handlePlay, handlePause, handleResume]);

  const handleSpeedSelect = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    if (hasAudio && audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [hasAudio]);

  const handleSeek = useCallback((seekTime: number) => {
    const clampedTime = Math.max(0, Math.min(seekTime, effectiveTotalDuration));
    if (hasAudio && audioRef.current) {
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    } else {
      setCurrentTime(clampedTime);
    }
    // 计算当前时间对应的 section 索引并通知父组件
    if (sectionMarkers.length > 0 && onSectionChange) {
      let sectionIdx = 0;
      for (let i = 0; i < sectionMarkers.length; i++) {
        if (clampedTime >= sectionMarkers[i].timeOffset) {
          sectionIdx = i;
        } else {
          break;
        }
      }
      onSectionChange(sectionIdx);
    }
  }, [hasAudio, effectiveTotalDuration, sectionMarkers, onSectionChange]);

  const handleSkipForward = useCallback(() => {
    handleSeek(currentTime + 15);
  }, [currentTime, handleSeek]);

  const handleSkipBack = useCallback(() => {
    handleSeek(currentTime - 15);
  }, [currentTime, handleSeek]);

  useEffect(() => {
    return () => {
      handleStop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [handleStop]);

  useEffect(() => {
    handleStop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setCurrentTime(0);
    setAudioDuration(0);
  }, [currentChapterIndex, handleStop]);

  const applySnap = useCallback((rawTime: number): number => {
    if (sectionMarkers.length === 0) return rawTime;
    const snapThreshold = 0.06;
    const rawPct = effectiveTotalDuration > 0 ? rawTime / effectiveTotalDuration : 0;
    let bestTime = rawTime;
    let bestDist = snapThreshold;
    for (const marker of sectionMarkers) {
      const pct = effectiveTotalDuration > 0 ? marker.timeOffset / effectiveTotalDuration : 0;
      const dist = Math.abs(rawPct - pct);
      if (dist < bestDist) {
        bestDist = dist;
        bestTime = marker.timeOffset;
      }
    }
    return bestTime;
  }, [sectionMarkers, effectiveTotalDuration]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current || effectiveTotalDuration === 0) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    handleSeek(applySnap(ratio * effectiveTotalDuration));
  }, [handleSeek, applySnap, effectiveTotalDuration]);

  const handleProgressDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!progressTrackRef.current || effectiveTotalDuration === 0) return;
    const wasPlaying = status === 'playing';
    isDraggingRef.current = true;

    if (hasAudio && audioRef.current) {
      audioRef.current.pause();
    } else {
      window.speechSynthesis.cancel();
    }
    cancelAnimationFrame(rafRef.current);
    setStatus('paused');

    const handleMove = (moveEvent: MouseEvent) => {
      if (!progressTrackRef.current) return;
      const rect = progressTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const rawTime = ratio * effectiveTotalDuration;
      const snapped = applySnap(rawTime);
      setCurrentTime(snapped);
    };

    const handleUp = (moveEvent: MouseEvent) => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);

      if (!progressTrackRef.current) return;
      const rect = progressTrackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const rawTime = ratio * effectiveTotalDuration;
      const seekTime = applySnap(rawTime);
      setCurrentTime(seekTime);

      if (hasAudio && audioRef.current) {
        audioRef.current.currentTime = seekTime;
        if (wasPlaying) {
          audioRef.current.play().then(() => {
            setStatus('playing');
            rafRef.current = requestAnimationFrame(updateTimeDisplay);
          });
        }
      } else if (wasPlaying) {
        setStatus('playing');
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [status, hasAudio, effectiveTotalDuration, applySnap, updateTimeDisplay]);

  return (
    <Card className="relative overflow-hidden border-2 border-red-200 bg-gradient-to-br from-white via-red-50/30 to-orange-50/30 shadow-lg">
      <div ref={containerRef} className="relative p-6">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              status === 'playing'
                ? 'w-28 h-28 -m-2 bg-gradient-to-r from-red-400 to-orange-400 animate-pulse'
                : 'w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100'
            }`} />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl overflow-hidden">
              <div className="relative z-10">
                <svg viewBox="0 0 100 100" className="w-20 h-20" fill="white">
                  <circle cx="50" cy="35" r="18" />
                  <path d="M 20 85 Q 20 60 50 55 Q 80 60 80 85 Z" />
                </svg>
              </div>
              {status === 'playing' && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-pulse" />
                </>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-md ${
              status === 'playing' ? 'bg-green-500' :
              status === 'paused' ? 'bg-amber-500' :
              'bg-gray-400'
            }`}>
              {status === 'playing' && <Volume2 className="w-4 h-4 text-white" />}
              {status !== 'playing' && <Play className="w-4 h-4 text-white" />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
              {currentContent?.title || '暂无内容'}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block w-2 h-2 rounded-full ${
                status === 'playing' ? 'bg-green-500 animate-pulse' :
                status === 'paused' ? 'bg-amber-500' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600">
                {status === 'playing' ? '正在讲解...' :
                 status === 'paused' ? '已暂停' :
                 'AI数字人讲解'}
              </span>
              {hasAudio && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold border border-green-200">
                  真实语音
                </span>
              )}
            </div>

            {/* 进度条区域 */}
            <div className="mb-1 mt-1">
              {/* 小节标题 - 绝对定位对齐节点 */}
              {sectionMarkers.length > 0 && (
                <div className="relative h-5 mb-1">
                  {sectionMarkers.map((marker, idx) => {
                    const pct = effectiveTotalDuration > 0
                      ? (marker.timeOffset / effectiveTotalDuration) * 100
                      : 0;
                    return (
                      <div
                        key={idx}
                        className="absolute bottom-0"
                        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                      >
                        <span className="text-[10px] text-red-600 font-medium text-center whitespace-nowrap block">
                          {marker.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 进度条 */}
              <div
                ref={progressTrackRef}
                className="relative h-3 bg-gray-200 rounded-full cursor-pointer group select-none"
                onClick={handleProgressClick}
                onMouseDown={handleProgressDragStart}
              >
                {/* 已播放进度 */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-none"
                  style={{ width: `${progressPercent}%` }}
                />

                {/* 节点竖线 */}
                {sectionMarkers.map((marker, idx) => {
                  const pct = effectiveTotalDuration > 0
                    ? (marker.timeOffset / effectiveTotalDuration) * 100
                    : 0;
                  const isStartNode = idx === 0;
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 h-full flex items-center"
                      style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                    >
                      {isStartNode && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-0.5" />
                      )}
                      <div className="w-0.5 h-full bg-red-500/60" />
                    </div>
                  );
                })}

                {/* 拖动滑块 */}
                {effectiveTotalDuration > 0 && (
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing z-10"
                    style={{
                      left: `${progressPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </div>
              </div>

            {/* 时间戳 */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)} / {formatTime(effectiveTotalDuration)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-red-200 bg-white/50 -mx-6 -mb-6 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipBack}
              disabled={!currentContent || effectiveTotalDuration === 0}
              className="border-red-300 hover:bg-red-50"
              title="快退15秒"
            >
              <Rewind className="w-4 h-4" />
              <span className="ml-1 text-xs">15s</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleToggle}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-8"
            >
              {status === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="ml-1">
                {status === 'playing' ? '暂停' :
                 status === 'paused' ? '继续' :
                 '播放'}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipForward}
              disabled={!currentContent || effectiveTotalDuration === 0}
              className="border-red-300 hover:bg-red-50"
              title="快进15秒"
            >
              <span className="text-xs mr-1">15s</span>
              <FastForward className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSpeedSelect(option)}
                  disabled={effectiveTotalDuration === 0}
                  className={`px-2 py-1 text-xs font-bold rounded transition-all border ${
                    speed === option
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-400 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full shadow-md">
        <span>AI数字人讲解</span>
      </div>
    </Card>
  );
}
