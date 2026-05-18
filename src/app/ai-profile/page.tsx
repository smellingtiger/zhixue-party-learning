'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, TrendingUp, Target, Award, BookOpen, Clock, Activity, Sparkles, Flame, Zap, Trophy, AlertTriangle, CheckCircle, Star, ChevronRight, User, ArrowLeft, ArrowRight, MessageSquare, Bot, Rocket, Shield, Swords, Medal, Crown, ScanLine, CircleDot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const learningStats = [
  { icon: BookOpen, label: '学习时长', value: '128小时', progress: 75, level: 'good' },
  { icon: Award, label: '获得证书', value: '8个', progress: 60, level: 'medium' },
  { icon: TrendingUp, label: '学习进度', value: '78%', progress: 78, level: 'good' },
  { icon: Target, label: '目标完成', value: '15个', progress: 85, level: 'excellent' },
];

const skillTags = [
  { name: '政治理论', level: 90, status: 'excellent', description: '政治理论基础扎实，对党的理论有深刻理解', suggestion: '建议深入学习习近平新时代中国特色社会主义思想，力争成为理论宣讲骨干。' },
  { name: '党务知识', level: 85, status: 'excellent', description: '党务工作知识全面，熟悉各项流程', suggestion: '可以尝试担任党务培训讲师，分享工作经验。' },
  { name: '政策解读', level: 78, status: 'good', description: '能够准确理解和传达政策精神', suggestion: '建议加强政策研究能力，关注最新政策动态。' },
  { name: '党史学习', level: 88, status: 'excellent', description: '党史知识丰富，历史观正确', suggestion: '推荐参与党史宣讲活动，将知识与实践结合。' },
  { name: '公文写作', level: 72, status: 'good', description: '公文写作能力良好', suggestion: '建议多练习各类公文写作，提升规范性。' },
  { name: '演讲表达', level: 65, status: 'medium', description: '演讲表达能力一般', suggestion: '建议参加演讲培训课程，提升表达能力。' },
  { name: '组织协调', level: 55, status: 'poor', description: '组织协调能力较弱，团队协作经验不足', suggestion: '需要加强团队管理和协调能力的培养，推荐学习《团队管理与领导力》系列课程。参与实际项目协作，在实践中提升。' },
  { name: '创新思维', level: 48, status: 'poor', description: '创新意识不足，思维较为传统', suggestion: '建议多接触新思想、新技术，培养创新思维能力。推荐学习《数字化转型与创新管理》专题课程。' },
];

const learningHistory = [
  { date: '2024-03-20', duration: '2小时30分', courses: 3, rating: 'excellent', title: '习近平新时代中国特色社会主义思想' },
  { date: '2024-03-19', duration: '1小时45分', courses: 2, rating: 'good', title: '党史学习专题' },
  { date: '2024-03-18', duration: '3小时15分', courses: 4, rating: 'excellent', title: '统战工作实务' },
  { date: '2024-03-17', duration: '1小时00分', courses: 1, rating: 'medium', title: '公文写作基础' },
  { date: '2024-03-16', duration: '2小时00分', courses: 2, rating: 'good', title: '科技创新专题' },
];

const weeklyData = [
  { day: '周一', hours: 2.5, color: '#dc2626', courses: ['习近平新时代中国特色社会主义思想', '党史专题'] },
  { day: '周二', hours: 1.8, color: '#ea580c', courses: ['政策解读'] },
  { day: '周三', hours: 3.2, color: '#dc2626', courses: ['统战工作实务', '公文写作', '创新思维'] },
  { day: '周四', hours: 1.2, color: '#ea580c', courses: ['团队协作'] },
  { day: '周五', hours: 2.8, color: '#dc2626', courses: ['党务知识', '演讲表达'] },
  { day: '周六', hours: 4.0, color: '#dc2626', courses: ['政治理论进阶', '数字化转型', '团队管理', '创新方法论'] },
  { day: '周日', hours: 2.0, color: '#ea580c', courses: ['党史学习巩固'] },
];

const terminalData = [
  '> 启动周学时数据扫描...',
  '> 正在连接学习记录数据库...',
  `> 检索数据范围: ${weeklyData[0].day} ~ ${weeklyData[weeklyData.length - 1].day}`,
  '',
  ...weeklyData.flatMap(d => [
    `  ${d.day} │ ${'█'.repeat(Math.round(d.hours))}${'░'.repeat(5 - Math.round(d.hours))} │ ${d.hours.toFixed(1)}h │ ${d.courses.length} 门课程`,
    ...d.courses.map(c => `    └─ ${c}`),
    '',
  ]),
  '',
  '> 周学时数据扫描完成',
  '> 正在渲染统计图表...',
];

function HoloScanActivity() {
  const [phase, setPhase] = useState(0);
  const [scanY, setScanY] = useState(-10);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [barVisible, setBarVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && phase === 0) startSequence();
    }, { threshold: 0.15 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const startSequence = () => {
    setPhase(1);
    setTerminalLines([]);
    setLineIdx(0);
    setBarVisible(false);
    setSummaryVisible(false);

    let y = -10;
    const scanInterval = setInterval(() => {
      y += 3;
      if (y > 420) {
        clearInterval(scanInterval);
        setTimeout(() => setPhase(3), 200);
        return;
      }
      setScanY(y);
    }, 16);

    let li = 0;
    const typeInterval = setInterval(() => {
      if (li >= terminalData.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhase(4);
          setBarVisible(true);
          setTimeout(() => setSummaryVisible(true), 800);
        }, 300);
        return;
      }
      setTerminalLines(prev => [...prev.slice(-12), terminalData[li]]);
      setLineIdx(li + 1);
      li++;
      if (terminalData[li] === '') {
        clearInterval(typeInterval);
        setTimeout(() => {
          const resumeType = setInterval(() => {
            if (li >= terminalData.length) { clearInterval(resumeType); return; }
            setTerminalLines(prev => [...prev.slice(-12), terminalData[li]]);
            setLineIdx(li + 1);
            li++;
          }, 60);
        }, 300);
      }
    }, terminalData[li]?.startsWith('>') || terminalData[li] === '' ? 120 : 40);
  };

  const totalHours = weeklyData.reduce((s, d) => s + d.hours, 0);
  const maxDay = weeklyData.reduce((m, d) => d.hours > m.hours ? d : m, weeklyData[0]);
  const avgHours = (totalHours / weeklyData.length).toFixed(1);

  return (
    <Card className="border-2 border-red-200 shadow-2xl relative overflow-hidden bg-[#0a0a18]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

      {/* 扫描线 */}
      {phase >= 1 && phase <= 3 && (
        <div
          className="absolute left-0 right-0 h-px z-20 pointer-events-none"
          style={{
            top: `${scanY}px`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.9) 20%, #fff 50%, rgba(220,38,38,0.9) 80%, transparent 100%)',
            boxShadow: '0 0 20px rgba(220,38,38,0.8), 0 0 60px rgba(220,38,38,0.3)',
          }}
        />
      )}

      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.08)_0%,transparent_60%)]" />

      {/* 角落装饰 */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-red-500/40" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-red-500/40" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-red-500/40" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-red-500/40" />

      <CardHeader className="pb-2 pt-5 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-400 animate-pulse" />
            <span className="text-white/90">WEEKLY ACTIVITY</span>
            {phase >= 4 && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">DATA_LOADED</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {phase >= 1 && phase <= 3 && (
              <span className="text-[10px] font-mono text-red-400 animate-pulse tracking-widest">SCANNING...</span>
            )}
            {phase >= 4 && (
              <span className="text-[10px] font-mono text-green-400 tracking-widest">SCAN_COMPLETE ✓</span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-white/25 font-mono mt-1">HOLOGRAPHIC ACTIVITY ANALYZER v2.4.1</p>
      </CardHeader>

      <CardContent className="pt-0 pb-5 relative min-h-[380px]">
        <div ref={containerRef} className="relative">

          {/* Phase 1-3: 终端滚动 + 扫描线 */}
          {(phase >= 1 && phase <= 3) && (
            <div className="relative rounded-lg bg-black/70 border border-red-900/30 p-4 font-mono text-sm overflow-hidden" style={{ height: '280px' }}>
              <div className="flex items-center gap-2 mb-2 border-b border-red-900/20 pb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400/70 text-xs">root@learning-system:~$</span>
                <span className="ml-auto text-red-400/40 text-[10px]">{terminalData.length} lines</span>
              </div>
              <div className="space-y-0.5 overflow-hidden" style={{ height: '240px' }}>
                {terminalLines.map((line, i) => (
                  <div key={`${i}-${line}`}
                    className={`transition-all duration-150 ${i === terminalLines.length - 1 ? 'opacity-100 translate-x-0' : 'opacity-60'}`}
                    style={{
                      color: line.startsWith('>') ? '#22c55e'
                        : line.startsWith('  ') ? '#94a3b8'
                        : line.startsWith('    └─') ? '#64748b'
                        : '#ef4444',
                      textShadow: i === terminalLines.length - 1 ? '0 0 8px currentColor' : undefined,
                    }}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>

              {/* 光标闪烁 */}
              <span className="inline-block w-2 h-4 bg-red-400 ml-0.5 animate-pulse align-middle" style={{ animationDuration: '0.8s' }} />
            </div>
          )}

          {/* Phase 4+: 柱状图展示 */}
          {phase >= 4 && (
            <div className="transition-all duration-700 opacity-0 translate-y-4"
              style={{ opacity: barVisible ? 1 : 0, transform: barVisible ? 'translateY(0)' : 'translateY(16px)' }}
            >
              <div className="h-56 flex items-end justify-around gap-3 px-3 pb-2 mb-4">
                {weeklyData.map((d, i) => {
                  const maxH = Math.max(...weeklyData.map(w => w.hours));
                  const barH = (d.hours / maxH) * 180;

                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="relative w-full" style={{ height: '180px' }}>
                        <div
                          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                          style={{
                            bottom: barVisible ? `${barH + 8}px` : '0px',
                            opacity: barVisible ? 1 : 0,
                            transition: `bottom 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms`,
                          }}
                        >
                          {[...Array(3)].map((_, j) => (
                            <div key={j}
                              className="rounded-full"
                              style={{
                                width: j === 1 ? '5px' : '3px',
                                height: j === 1 ? '5px' : '3px',
                                background: d.color,
                                boxShadow: `0 0 5px ${d.color}`,
                                animation: `particleFloat ${1.5 + j * 0.4}s ease-in-out infinite`,
                              }}
                            />
                          ))}
                        </div>
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-lg overflow-hidden"
                          style={{
                            height: barVisible ? `${barH}px` : '2px',
                            background: `linear-gradient(180deg, ${d.color}ee 0%, ${d.color}88 40%, ${d.color}33 100%)`,
                            boxShadow: `0 -4px 16px ${d.color}20, 0 0 24px ${d.color}10 inset`,
                            transition: `height 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms`,
                          }}
                        >
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                            style={{ width: '7px', height: '7px', boxShadow: `0 0 8px ${d.color}`, opacity: barVisible ? 1 : 0 }}
                          />
                          <div className="absolute top-0 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)' }} />
                        </div>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: d.color, opacity: 0.25, filter: 'blur(2px)' }} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">{d.day}</span>
                      <span className="text-xs font-black tabular-nums" style={{ color: d.color }}>{d.hours}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 最终总结面板 */}
          {phase >= 4 && (
            <div className="mt-2 grid grid-cols-4 gap-3 transition-all duration-1000 delay-500"
              style={{ opacity: summaryVisible ? 1 : 0, transform: summaryVisible ? 'scale(100%) translateY(0)' : 'scale(95%) translateY(8px)' }}
            >
              {[
                { label: '总学时', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: '#dc2626' },
                { label: '日均', value: `${avgHours}h`, icon: TrendingUp, color: '#ea580c' },
                { label: '峰值日', value: `${maxDay.day}`, sub: `${maxDay.hours}h`, icon: Flame, color: '#dc2626' },
                { label: '课程数', value: `${weeklyData.reduce((s,d)=>s+d.courses.length,0)}门`, icon: BookOpen, color: '#3b82f6' },
              ].map((item) => (
                <div key={item.label} className="bg-black/40 rounded-lg border border-white/5 p-3 text-center hover:border-red-500/30 transition-colors">
                  <item.icon className="h-4 w-4 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="text-[10px] text-gray-500">{item.label}</p>
                  <p className="text-sm font-bold text-white tabular-nums">{item.value}</p>
                  {item.sub && <p className="text-[10px]" style={{ color }}>{item.sub}</p>}
                </div>
              ))}
            </div>
          )}

          {/* 重播按钮 */}
          {phase >= 4 && (
            <div className="absolute bottom-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setPhase(0); startSequence(); }}
                className="text-red-400/60 hover:text-red-300 hover:bg-red-500/10 text-xs h-7 px-3"
              >
                ↻ 重播扫描
              </Button>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}

const getStatusColor = (s: string) => {
  switch (s) {
    case 'excellent': return 'from-green-500 to-emerald-400';
    case 'good': return 'from-blue-500 to-cyan-400';
    case 'medium': return 'from-yellow-500 to-amber-400';
    case 'poor': return 'from-red-600 to-rose-500';
    default: return 'from-gray-500 to-gray-400';
  }
};
const getStatusTextColor = (s: string) => {
  switch (s) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'medium': return 'text-yellow-600';
    case 'poor': return 'text-red-600';
    default: return 'text-gray-600';
  }
};
const getStatusBg = (s: string) => {
  switch (s) {
    case 'excellent': return 'bg-green-50';
    case 'good': return 'bg-blue-50';
    case 'medium': return 'bg-yellow-50';
    case 'poor': return 'bg-red-50';
    default: return 'bg-gray-50';
  }
};
const getStatusBorder = (s: string) => {
  switch (s) {
    case 'excellent': return 'border-green-200';
    case 'good': return 'border-blue-200';
    case 'medium': return 'border-yellow-200';
    case 'poor': return 'border-red-300';
    default: return 'border-gray-200';
  }
};
const getLevelLabel = (s: string) => {
  switch (s) {
    case 'excellent': return '优秀';
    case 'good': return '良好';
    case 'medium': return '中等';
    case 'poor': return '薄弱';
    default: return '未知';
  }
};

function ParticleBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.03 + 0.005,
      opacity: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.15,
    }))
  );
  const [positions, setPositions] = useState(() => particles.map(p => ({ x: p.x, y: p.y })));

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map((pos, i) => {
        const p = particles[i];
        return {
          x: ((pos.x + p.drift * 0.025) % 100 + 100) % 100,
          y: ((pos.y - p.speed * 0.025) % 100 + 100) % 100,
        };
      }));
    }, 40);
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => {
        const pos = positions[i] || { x: p.x, y: p.y };
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              background: p.size > 3
                ? 'linear-gradient(135deg, rgba(220,38,38,0.6), rgba(234,88,12,0.3))'
                : 'linear-gradient(135deg, rgba(251,191,36,0.6), rgba(245,158,11,0.3))',
              boxShadow: `0 0 ${p.size * 3}px rgba(220,38,38,0.2)`,
            }}
          />
        );
      })}
    </div>
  );
}

function TypewriterText({ text, delay = 40 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      {!done && <span className="inline-block w-0.5 h-4 bg-red-500 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

function HologramHeader({ onRescan, isScanning }: { onRescan: () => void; isScanning: boolean }) {
  const [scanPhase, setScanPhase] = useState(0);
  const [scanY, setScanY] = useState(-10);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [barVisible, setBarVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(startScanSequence, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isScanning) return;
    startScanSequence();
  }, [isScanning]);

  const handleRescan = () => {
    onRescan();
    const phases = [1, 2, 3, 4];
    phases.forEach((p, i) => setTimeout(() => setScanPhase(p), 200 + i * 300));
    setTimeout(() => setScanPhase(0), 200 + phases.length * 300);
  };

  const startScanSequence = () => {
    setScanPhase(1);
    setTerminalLines([]);
    setBarVisible(false);
    setSummaryVisible(false);

    let y = -10;
    const scanInterval = setInterval(() => {
      y += 4;
      if (y > 320) { clearInterval(scanInterval); return; }
      setScanY(y);
    }, 16);

    let li = 0;
    const typeInterval = setInterval(() => {
      if (li >= terminalData.length) { clearInterval(typeInterval); return; }
      setTerminalLines(prev => [...prev.slice(-10), terminalData[li]]);
      li++;
      if (terminalData[li] === '') {
        clearInterval(typeInterval);
        setTimeout(() => {
          const resumeType = setInterval(() => {
            if (li >= terminalData.length) { clearInterval(resumeType); return; }
            setTerminalLines(prev => [...prev.slice(-10), terminalData[li]]);
            li++;
          }, 50);
        }, 200);
      }
    }, terminalData[li]?.startsWith('>') || terminalData[li] === '' ? 100 : 30);

    setTimeout(() => { clearInterval(typeInterval); clearInterval(scanInterval); setScanPhase(4); setBarVisible(true); }, 2500);
    setTimeout(() => setSummaryVisible(true), 3100);
  };

  const totalHours = weeklyData.reduce((s, d) => s + d.hours, 0);
  const maxDay = weeklyData.reduce((m, d) => d.hours > m.hours ? d : m, weeklyData[0]);
  const avgHours = (totalHours / weeklyData.length).toFixed(1);

  return (
    <div className="relative overflow-hidden bg-[#0a0a1a] px-8 pb-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(220,38,38,0.15)_0%,transparent_60%),radial-gradient(ellipse_at_70%_20%,rgba(234,88,12,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`absolute h-px w-full transition-opacity duration-300 ${isScanning ? 'opacity-40' : 'opacity-20'}`}
            style={{ top: `${15 + i * 14}%`, background: `linear-gradient(90deg, transparent 0%, rgba(220,38,38,${0.8 - i * 0.1}) 20%, rgba(234,88,12,${0.8 - i * 0.1}) 80%, transparent 100%)`, animation: `scanline ${2 + i * 0.5}s linear infinite` }}
          />
        ))}
        {isScanning && <div className="absolute inset-0 bg-red-500/5 animate-pulse" style={{ animationDuration: '1s' }} />}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-red-500/20 to-transparent" style={{ opacity: isScanning ? 1 : 0.4, transition: 'opacity 0.5s' }} />

      {/* 扫描线 */}
      {isScanning && scanY < 320 && (
        <div className="absolute left-6 right-6 h-px z-20 pointer-events-none"
          style={{ top: `${scanY}px`, background: 'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.9) 15%, #fff 50%, rgba(220,38,38,0.9) 85%, transparent 100%)', boxShadow: '0 0 16px rgba(220,38,38,0.7), 0 0 40px rgba(220,38,38,0.25)' }}
        />
      )}

      {/* 顶部标题行 */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${isScanning ? 'bg-red-400/40 scale-150' : 'bg-red-500/20 scale-100'}`} />
              <div className="relative w-14 h-14 rounded-full border-2 border-red-500/50 flex items-center justify-center bg-black/40 backdrop-blur transition-all duration-500"
                style={{ boxShadow: isScanning ? '0 0 44px rgba(220,38,38,0.55), inset 0 0 26px rgba(220,38,38,0.28)' : '0 0 26px rgba(220,38,38,0.27), inset 0 0 18px rgba(220,38,38,0.09)', transform: isScanning ? 'scale(1.04)' : 'scale(1)' }}>
                <ScanLine className="h-7 w-7 text-red-400" style={isScanning ? { animation: 'spinSlow 3s linear infinite' } : undefined} />
              </div>
              <div className={`absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 ${isScanning ? 'bg-yellow-400 animate-ping' : 'bg-green-500 animate-pulse'}`}
                style={{ boxShadow: isScanning ? '0 0 14px rgba(250,204,21,0.75)' : '0 0 10px rgba(34,197,94,0.56)' }}>
                {isScanning && <span className="text-[7px] font-bold text-black">!</span>}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-3"
                style={{ textShadow: isScanning ? '0 0 46px rgba(220,38,38,0.76), 0 0 92px rgba(220,38,38,0.28)' : '0 0 28px rgba(220,38,38,0.47), 0 0 56px rgba(220,38,38,0.19)' }}>
                AI 学习画像
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs border rounded-full transition-all duration-300 ${isScanning ? 'bg-yellow-500/28 border-yellow-400/58 text-yellow-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
                  <CircleDot className="h-3 w-3 animate-pulse" />
                  {isScanning ? '扫描中' : '就绪'}
                </span>
              </h1>
              <p className="text-red-300/68 text-sm mt-0.5 tracking-widest font-mono">
                {scanPhase === 1 && '正在连接学习数据库...'}
                {scanPhase === 2 && '正在采集本周学时数据...'}
                {scanPhase === 3 && '正在生成周学时统计...'}
                {scanPhase === 4 && '周学时画像已就绪'}
                {!scanPhase && !isScanning && '周学时全域扫描系统'}
                {!scanPhase && isScanning && '正在重新扫描...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-white/37 text-xs tracking-widest">系统状态</p>
              <p className={`text-sm font-mono font-semibold transition-colors duration-300 ${isScanning ? 'text-yellow-400' : 'text-green-400'}`}>{isScanning ? '扫描数据中' : '数据已就绪'}</p>
            </div>
            <Button onClick={handleRescan} disabled={isScanning}
              className={`bg-transparent border-2 font-semibold px-5 py-5 text-sm transition-all duration-300 active:scale-95 ${isScanning ? 'border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/10 cursor-not-allowed' : 'border-red-500/60 text-red-300 hover:bg-red-500/10 hover:border-red-400'}`}
              style={{ boxShadow: isScanning ? '0 0 22px rgba(250,204,21,0.28)' : '0 0 18px rgba(220,38,38,0.17)' }}>
              {isScanning ? (<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 inline-block" />扫描中...</>) : (<><Sparkles className="h-4 w-4 mr-2 inline-block align-sub" />重新扫描</>)}
            </Button>
          </div>
        </div>
      </div>

      {/* 中间扫描区域 — 终端 / 柱状图 / 统计 */}
      <div className="relative z-10 mt-2">
        {/* Phase 1-3: 终端滚动 */}
        {(isScanning && scanPhase <= 3 || scanPhase === 1) && (
          <div className="rounded-lg bg-black/65 border border-red-900/25 p-3 font-mono text-xs overflow-hidden relative" style={{ height: '140px', backdropFilter: 'blur(4px)' }}>
            <div className="flex items-center gap-2 mb-1.5 border-b border-red-900/15 pb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400/60 text-[10px]">root@learning-system:~$</span>
              <span className="ml-auto text-red-400/35 text-[9px]">{terminalData.length} lines</span>
            </div>
            <div className="space-y-0 leading-relaxed overflow-hidden" style={{ height: '108px' }}>
              {terminalLines.map((line, i) => (
                <div key={`${i}-${line}`} className={`transition-all duration-120 ${i === terminalLines.length - 1 ? 'opacity-100 translate-x-0' : 'opacity-45'}`}
                  style={{
                    color: line.startsWith('>') ? '#22c55e' : line.startsWith('  ') ? '#94a3b8' : line.startsWith('    └─') ? '#64748b' : '#ef4444',
                    textShadow: i === terminalLines.length - 1 ? '0 0 6px currentColor' : undefined,
                    fontSize: '11px',
                  }}
                >
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
            <span className="inline-block w-1.5 h-3.5 bg-red-400 ml-0.5 animate-pulse align-middle" style={{ animationDuration: '0.75s' }} />
          </div>
        )}

        {/* Phase 4+: 柱状图 + 统计摘要 */}
        {(!isScanning || scanPhase >= 4) && (
          <div className="grid grid-cols-[1fr_240px] gap-4 items-end">
            {/* 柱状图 */}
            <div className="flex items-end justify-around gap-2 px-2 pt-2 relative" style={{ height: '150px' }}>
              {weeklyData.map((d, i) => {
                const maxH = Math.max(...weeklyData.map(w => w.hours));
                const barH = (d.hours / maxH) * 90;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 relative"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="relative w-full" style={{ height: '106px' }}>
                      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
                        style={{ bottom: barVisible ? `${barH + 4}px` : '0px', opacity: barVisible ? 1 : 0, transition: `bottom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms` }}>
                        {[...Array(2)].map((_, j) => (
                          <div key={j} className="rounded-full" style={{ width: j === 0 ? '4px' : '3px', height: j === 0 ? '4px' : '3px', background: d.color, boxShadow: `0 0 4px ${d.color}`, animation: `particleFloat ${1.3 + j * 0.3}s ease-in-out infinite` }} />
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 rounded-t-md overflow-hidden"
                        style={{ height: barVisible ? `${barH}px` : '2px', background: `linear-gradient(180deg, ${d.color}dd 0%, ${d.color}77 40%, ${d.color}33 100%)`, boxShadow: `0 -3px 12px ${d.color}18, 0 0 18px ${d.color}08 inset`, transition: `height 1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms` }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ width: '6px', height: '6px', boxShadow: `0 0 6px ${d.color}`, opacity: barVisible ? 1 : 0 }} />
                        <div className="absolute top-0 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)' }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500">{d.day}</span>
                    <span className="text-[11px] font-black tabular-nums" style={{ color: d.color }}>{d.hours}h</span>
                    <span className="text-[9px] text-white/30 leading-tight">{d.courses.length}门课程</span>
                    {/* 悬浮课程提示 */}
                    {hoveredBar === i && barVisible && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                        style={{ animation: 'slideUp 0.2s ease-out' }}
                      >
                        <div className="bg-black/90 backdrop-blur-sm border border-red-500/40 rounded-lg px-3 py-2 shadow-xl min-w-[120px]">
                          <div className="text-[10px] text-red-400/60 font-mono mb-1">{d.day} 学习课程</div>
                          {d.courses.map((c, ci) => (
                            <div key={ci} className="text-[11px] text-white/80 leading-relaxed whitespace-nowrap">
                              ▸ {c}
                            </div>
                          ))}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black/90" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 统计指标 */}
            <div className="grid grid-cols-2 gap-2 pr-1 pb-1" style={{ opacity: summaryVisible ? 1 : 0, transform: summaryVisible ? 'scale(100%) translateY(0)' : 'scale(94%) translateY(6px)', transition: 'all 0.8s ease-out' }}>
              {[
                { label: '总学时', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: '#dc2626' },
                { label: '日均', value: `${avgHours}h`, icon: TrendingUp, color: '#ea580c' },
                { label: '峰值日', value: maxDay.day, sub: `${maxDay.hours}h`, icon: Flame, color: '#dc2626' },
                { label: '课程数', value: `${weeklyData.reduce((s,d)=>s+d.courses.length,0)}门`, icon: BookOpen, color: '#3b82f6' },
              ].map(item => (
                <div key={item.label} className="bg-black/35 rounded-md border border-white/[0.06] p-2 text-center hover:border-red-500/25 transition-colors">
                  <item.icon className="h-3.5 w-3.5 mx-auto mb-0.5" style={{ color: item.color }} />
                  <p className="text-[9px] text-gray-500">{item.label}</p>
                  <p className="text-xs font-bold text-white tabular-nums leading-none">{item.value}</p>
                  {item.sub && <p className="text-[9px]" style={{ color: item.color }}>{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部装饰线 */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
    </div>
  );
}

const radarChats = [
  { skillIdx: 0, side: 'right' as const, title: '政治理论分析', icon: Star as typeof Bot, accent: '#22c55e,#16a34a',
    lines: ['您的「政治理论」能力达到 **90%**', '在所有学员中排名前 **5%**', '对习近平新时代中国特色社会主义思想有深刻理解'] },
  { skillIdx: 7, side: 'left' as const, title: '创新思维预警', icon: AlertTriangle as typeof Bot, accent: '#ef4444,#dc2626',
    lines: ['⚠️ 检测到「创新思维」仅 **48%**', '低于合格线 **22个百分点**', '建议立即学习《数字化转型与创新管理》课程'] },
  { skillIdx: 3, side: 'right' as const, title: '党史学习评价', icon: Trophy as typeof Bot, accent: '#22c55e,#16a34a',
    lines: ['「党史学习」**88%** 表现优异', '党史知识体系完整，历史观正确', '推荐担任党史学习小组组长'] },
  { skillIdx: 6, side: 'left' as const, title: '组织协调诊断', icon: AlertTriangle as typeof Bot, accent: '#ef4444,#dc2626',
    lines: ['⚠️ 「组织协调」能力 **55%**', '团队协作经验不足是主要原因', '推荐参与实际项目协作，在实践中提升'] },
  { skillIdx: 1, side: 'right' as const, title: '党务知识评估', icon: Shield as typeof Bot, accent: '#3b82f6,#2563eb',
    lines: ['「党务知识」**85%** 掌握全面', '熟悉各项党务工作流程', '可以尝试担任党务培训讲师'] },
];

function RadarChatPanel({ skills, resetKey }: { skills: typeof skillTags; resetKey: number }) {
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [animatedValues, setAnimatedValues] = useState<number[]>(skills.map(() => 0));
  const [activeSkillIdx, setActiveSkillIdx] = useState<number | null>(null);
  const [crisisShown, setCrisisShown] = useState<Set<string>>(new Set());
  const [rotation, setRotation] = useState(0);

  // 卷帘门自动播放状态
  const [currentChatIdx, setCurrentChatIdx] = useState(-1);
  const [currentLineIdx, setCurrentLineIdx] = useState<Record<number, number>>({});
  const [allDone, setAllDone] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const lineTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleSet(new Set());
    setAnimatedValues(skills.map(() => 0));
    setActiveSkillIdx(null);
    setCrisisShown(new Set());
    setRotation(0);
    setCurrentChatIdx(-1);
    setCurrentLineIdx({});
    setAllDone(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    // 延迟启动自动播放
    autoPlayRef.current = setTimeout(() => startAutoPlay(), 800);
  }, [resetKey]);

  // 自动播放核心逻辑
  const startAutoPlay = useCallback(() => {
    if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    setCurrentChatIdx(-1);
    setCurrentLineIdx({});
    setAllDone(false);

    let ci = -1;
    const nextCard = () => {
      ci++;
      if (ci >= radarChats.length) {
        setAllDone(true);
        return;
      }
      setCurrentChatIdx(ci);
      setCurrentLineIdx(prev => ({ ...prev, [ci]: 0 }));
      setActiveSkillIdx(ci);

      // 雷达图数值增长
      const targetVal = skills[radarChats[ci].skillIdx].level;
      let start = performance.now();
      const duration = 1000;
      const from = animatedValues[radarChats[ci].skillIdx];
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setAnimatedValues(prev => { const next = [...prev]; next[radarChats[ci].skillIdx] = Math.round(from + (targetVal - from) * ease); return next; });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      // 危机卡片弹出
      const targetSkill = skills[radarChats[ci].skillIdx];
      if (targetSkill.status === 'poor') {
        setTimeout(() => setCrisisShown(prev => new Set([...prev, targetSkill.name])), 500);
      }

      setVisibleSet(prev => new Set([...prev, ci]));

      // 打字机逐行显示
      let li = 0;
      const lines = radarChats[ci].lines;
      const typeNext = () => {
        if (li >= lines.length) {
          // 当前卡片完成，延迟后切换下一张
          autoPlayRef.current = setTimeout(nextCard, 1200);
          return;
        }
        setCurrentLineIdx(prev => ({ ...prev, [ci]: li }));
        li++;
        lineTimerRef.current = setTimeout(typeNext, lines[li]?.length > 20 ? 400 : 280);
      };
      lineTimerRef.current = setTimeout(typeNext, 300); // 第一行稍快
    };

    nextCard();
  }, []);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setRotation(prev => (prev + 0.25) % 360), 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentChatIdx < 0 || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const el = container.querySelector(`[data-chat-idx="${currentChatIdx}"]`) as HTMLElement | null;
    if (el) {
      const target = el.offsetTop + el.offsetHeight - container.clientHeight;
      requestAnimationFrame(() => {
        container.scrollTo({ top: Math.max(0, target), behavior: 'auto' });
      });
    }
  }, [currentChatIdx]);

  useEffect(() => {
    if (allDone && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = container.scrollHeight - container.clientHeight;
      requestAnimationFrame(() => {
        container.scrollTo({ top: Math.max(0, target), behavior: 'auto' });
      });
    }
  }, [allDone]);

  const cx = 170, cy = 165, r = 100;
  const step = (Math.PI * 2) / skills.length;

  const getP = useCallback((i: number, v: number) => {
    const a = step * i - Math.PI / 2;
    return { x: cx + (v / 100) * r * Math.cos(a), y: cy + (v / 100) * r * Math.sin(a) };
  }, [step]);

  const poly = skills.map((_, i) => getP(i, animatedValues[i])).map(p => `${p.x},${p.y}`).join(' ');

  const poorSkills = skills.filter(s => s.status === 'poor');

  return (
    <div className="grid grid-cols-[3fr_2fr] gap-6">
      {/* 左侧：雷达图 + 紧急提升 */}
      <Card className="border-2 border-red-200 shadow-xl relative overflow-hidden bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-red-950/80">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-sm flex items-center gap-2 text-white/90">
            <ScanLine className="h-4 w-4 text-red-400 animate-pulse" /> 实时能力扫描
          </CardTitle>
          <p className="text-[11px] text-white/30">跟随对话动态更新</p>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="grid grid-cols-[3fr_2fr] gap-4">
            {/* 左侧：雷达图 */}
            <div className="relative w-full" style={{ aspectRatio: '1/0.95' }}>
              <svg viewBox="0 0 340 330" className="w-full h-full drop-shadow-lg">
                <defs>
                  <radialGradient id="rcGlow"><stop offset="0%" stopColor="rgba(220,38,38,0.35)" /><stop offset="100%" stopColor="rgba(220,38,38,0)" /></radialGradient>
                  <filter id="rcGlowFilter"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <linearGradient id="rcPolyGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#dc2626" stopOpacity="0.9" /><stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" /></linearGradient>
                </defs>

                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(220,38,38,0.18)" strokeWidth="1.2"
                  strokeDasharray="10 5" transform={`rotate(${rotation} ${cx} ${cy})`} />
                <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(234,88,12,0.12)" strokeWidth="1"
                  strokeDasharray="5 8" transform={`rotate(${-rotation * 0.8} ${cx} ${cy})`} />

                {[20,40,60,80,100].map(lv => {
                  const pts = skills.map((_, i) => { const a = step * i - Math.PI / 2; return `${cx+(lv/100)*r*Math.cos(a)},${cy+(lv/100)*r*Math.sin(a)}`; }).join(' ');
                  return <polygon key={lv} points={pts} fill="none" stroke={lv===100?'rgba(220,38,38,0.35)':'rgba(255,255,255,0.07)'} strokeWidth={lv===100?1.2:0.8} />;
                })}
                {skills.map((_, i) => { const a = step * i - Math.PI / 2; return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />; })}

                <polygon points={poly} fill="url(#rcGlow)" stroke="url(#rcPolyGrad)" strokeWidth="2.5" filter="url(#rcGlowFilter)" style={{ transition: 'all 0.15s linear' }} />

                {/* 节点 */}
                {skills.map((d, i) => {
                  const p = getP(i, animatedValues[i]);
                  const isActive = activeSkillIdx !== null && radarChats[activeSkillIdx].skillIdx === i;
                  const color = d.status==='excellent'?'#22c55e':d.status==='poor'?'#ef4444':'#3b82f6';
                  return (
                    <g key={i}>
                      {isActive && <>
                        <circle cx={p.x} cy={p.y} r="18" fill={color} opacity="0.08" className="animate-ping" />
                        <circle cx={p.x} cy={p.y} r="12" fill={color} opacity="0.15" style={{ animation: 'particleFloat 1s ease-in-out infinite' }} />
                      </>}
                      <circle cx={p.x} cy={p.y} r={isActive ? 6 : 4}
                        fill={isActive ? '#fff' : color} stroke={color} strokeWidth={isActive ? 2 : 0}
                        filter={isActive ? 'url(#rcGlowFilter)' : undefined} style={{ transition: 'all 0.3s ease' }} />
                      {animatedValues[i] > 0 && (
                        <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[9px] font-bold fill-white" style={{ textShadow: `0 0 6px ${color}` }}>{animatedValues[i]}%</text>
                      )}
                    </g>
                  );
                })}

                {/* 标签 — 调整位置避免截断 */}
                {skills.map((d, i) => {
                  const a = step * i - Math.PI / 2;
                  const lx = cx + (r+30)*Math.cos(a), ly = cy + (r+30)*Math.sin(a);
                  const isActive = activeSkillIdx !== null && radarChats[activeSkillIdx].skillIdx === i;
                  return (
                    <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      className={`text-[9px] font-semibold ${isActive ? 'fill-white' : 'fill-gray-500'}`}
                      style={{ textShadow: isActive ? `0 0 10px ${d.status==='excellent'?'#22c55e':d.status==='poor'?'#ef4444':'#3b82f6'}` : undefined, transition: 'all 0.3s ease' }}>
                      {d.name}
                    </text>
                  );
                })}
              </svg>

              {/* 紧凑当前激活指示器 */}
              {activeSkillIdx !== null && (() => {
                const s = skills[radarChats[activeSkillIdx].skillIdx];
                return (
                  <div className="absolute bottom-0 left-0 right-0 p-2 rounded-lg bg-black/60 backdrop-blur-sm border-t border-white/10 mx-3 mb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-white truncate">{s.name}</span>
                      <span className="text-xs font-black tabular-nums shrink-0" style={{ color: s.status==='excellent'?'#22c55e':s.status==='poor'?'#ef4444':'#3b82f6' }}>{animatedValues[radarChats[activeSkillIdx].skillIdx]}%</span>
                    </div>
                    <div className="h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${animatedValues[radarChats[activeSkillIdx].skillIdx]}%`, background: `linear-gradient(90deg,${getStatusColor(s.status).split(' ')[1].replace('to-', ',')})` }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 右侧：能力短板预警 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">能力短板预警</span>
                {crisisShown.size > 0 && (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-[9px] h-4 px-1.5">{crisisShown.size}</Badge>
                )}
              </div>
              <div className="space-y-2 min-h-[80px]">
                {crisisShown.size === 0 && (
                  <p className="text-[11px] text-white/20 text-center py-4">分析展开中，短板将在此处弹出</p>
                )}
                {poorSkills.filter(s => crisisShown.has(s.name)).map(s => (
                  <CrisisBanner key={s.name} skill={s} isVisible />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 右侧：卷帘门打字机分析 */}
      <div className="space-y-4 py-2">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold text-gray-700">AI 能力深度分析</span>
          <Badge variant="secondary" className={`${currentChatIdx >= 0 && currentChatIdx < radarChats.length ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500'} text-[10px]`}>
            {currentChatIdx >= 0 && currentChatIdx < radarChats.length ? `分析中 ${currentChatIdx + 1}/${radarChats.length}` : '等待启动'}
          </Badge>
        </div>

        {/* 卷帘门容器 */}
        <div className="relative bg-gradient-to-b from-gray-900/5 via-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
          style={{ minHeight: '420px', perspective: '1200px' }}
        >
          {/* 装饰顶栏 */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-300">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-300 font-mono tracking-wider">AI_DEEP_ANALYSIS_v3.0</span>
            <div className="ml-auto flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-7 h-1.5 rounded-full transition-all duration-300 ${i === currentChatIdx % 3 ? 'bg-green-400' : 'bg-gray-600'}`} />
              ))}
            </div>
          </div>

          {/* 翻牌槽位 */}
          <div ref={scrollContainerRef} className="relative p-4 space-y-3" style={{ height: '360px', overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {radarChats.map((chat, ci) => {
              const targetSkill = skills[chat.skillIdx];
              const isActive = ci === currentChatIdx;
              const isPast = ci < currentChatIdx;
              const color = targetSkill.status==='excellent'?'#22c55e':targetSkill.status==='poor'?'#ef4444':'#3b82f6';

              return (
                <div key={ci}
                  data-chat-idx={ci}
                  className="relative transition-all duration-500"
                  style={{
                    opacity: isPast || isActive ? 1 : 0.15,
                    transform: isPast || isActive ? 'translateY(0) scale(100%)' : 'translateY(-12px) scale(96%)',
                    zIndex: isActive ? 10 : isPast ? 5 : 1,
                  }}
                >
                  {/* 卡片主体 — 卷帘门翻转 */}
                  <div
                    className="flex gap-3 p-4 rounded-xl border transition-all duration-700 relative overflow-hidden"
                    style={{
                      background: chat.side === 'left'
                        ? (isActive ? 'linear-gradient(135deg,#fff 0%,#f8fafc 100%)' : '#f8fafc')
                        : (isActive ? 'linear-gradient(135deg,#fef2f2 0%,#fff7ed 100%)' : '#fefce8'),
                      borderColor: isActive ? color : (isPast ? `${color}40` : '#e5e7eb'),
                      boxShadow: isActive ? `0 8px 32px ${color}20, 0 0 0 1px ${color}30` : (isPast ? `0 2px 8px ${color}08` : 'none'),
                      transformStyle: 'preserve-3d',
                      transform: isActive ? 'rotateX(0deg)' : (isPast ? 'rotateX(0deg)' : 'rotateX(-90deg)'),
                      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s, border-color 0.4s',
                    }}
                  >
                    {/* 活跃状态光效 */}
                    {isActive && (
                      <>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
                          <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full blur-lg"
                            style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }}
                          />
                        </div>
                      </>
                    )}

                    {/* 图标 */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg,${chat.accent.replace(',', ',')})`,
                        boxShadow: isActive ? `0 0 20px ${chat.accent.split(',')[0]}50` : `0 0 8px ${chat.accent.split(',')[0]}20`,
                        transform: isActive ? 'scale(110%) rotate(0deg)' : (isPast ? 'scale(100%)' : 'scale(80%) rotate(-12deg)'),
                      }}
                    >
                      <chat.icon className="h-5 w-5 text-white" />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          {chat.title}
                          <Badge variant="secondary" className={`${getStatusBg(targetSkill.status)} ${getStatusTextColor(targetSkill.status)} border-0 text-[10px] px-1.5 py-0`}>
                            {targetSkill.name}
                          </Badge>
                        </span>
                        {(isPast || isActive) && (
                          <span className="text-sm font-black tabular-nums flex items-center gap-1"
                            style={{ color }}
                          >
                            {animatedValues[chat.skillIdx]}%
                            {isActive && <span className="w-1.5 h-1.5 rounded-full ml-1 animate-pulse" style={{ background: color }} />}
                          </span>
                        )}
                      </div>

                      {/* 打字机文本区域 */}
                      <div className="space-y-1.5 min-h-[60px]">
                        {chat.lines.map((line, li) => (
                          <p key={li}
                            className={`text-sm leading-relaxed ${targetSkill.status === 'poor' ? 'text-red-700 font-medium' : 'text-gray-600'}`}
                            style={{
                              opacity: (isPast || isActive) && li <= currentLineIdx[ci] ? 1 : 0,
                              transform: (isPast || isActive) && li <= currentLineIdx[ci] ? 'translateY(0)' : 'translateY(6px)',
                              transition: `opacity 0.35s ease-out, transform 0.35s ease-out`,
                              transitionDelay: `${Math.max(0, li - currentLineIdx[ci]) * 50}ms`,
                            }}
                          >
                            {(isPast || isActive)
                              ? (li === 0 && ci === currentChatIdx
                                ? <TypewriterText text={line} delay={18} />
                                : line)
                              : '\u00A0'}
                          </p>
                        ))}
                      </div>

                      {/* 进度指示条 */}
                      <div className="mt-2 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${isPast ? 100 : (isActive ? Math.min(100, ((currentLineIdx[ci] + 1) / chat.lines.length) * 100) : 0)}%`,
                            background: `linear-gradient(90deg, ${color}, ${chat.accent.split(',')[0]})`,
                          }}
                        />
                      </div>
                    </div>

                    {/* 右侧状态角标 */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {isPast && (
                        <CheckCircle className="h-4 w-4" style={{ color }} />
                      )}
                      {isActive && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: color }} />
                          <span className="text-[9px] font-mono" style={{ color }}>LIVE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 全部完成 — 叠加在最后一张卡片下部 */}
            {allDone && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-50/95 to-emerald-50/95 border border-green-200 relative z-10 -mt-2 shadow-md"
                style={{ animation: 'slideUp 0.5s ease-out' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-700">全部能力分析完成</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={startAutoPlay} className="text-green-600 hover:text-green-700 text-xs h-7 px-3">
                    ↻ 重播分析
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 总结卡片 */}
        <div className={`mt-2 p-5 rounded-2xl bg-gradient-to-r from-red-600/95 to-orange-600/95 text-white border border-white/10 shadow-xl transition-all duration-1000 ${allDone ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold mb-1">✅ 综合行动方案</h4>
              <p className="text-sm text-white/85 leading-relaxed">
                基于以上 <strong>{radarChats.length}</strong> 项能力的深度分析，
                建议您在保持<strong>政治理论、党史学习</strong>优势的同时，
                重点投入 <strong>组织协调（+22%）</strong> 和 <strong>创新思维（+27%）</strong> 的提升训练。
                预计 <strong>2周</strong> 内可完成本轮优化目标。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrisisBanner({ skill, isVisible }: { skill: typeof skillTags[0]; isVisible: boolean }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const t1 = setTimeout(() => setPhase(1), 300);
      const t2 = setTimeout(() => setPhase(2), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isVisible]);

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(239,68,68,0.3)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(251,113,133,0.15)_0%,transparent_50%)]" />

      <div className="relative z-10 p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-400 tracking-wider"
                style={{ textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
                {skill.name}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-red-500 tabular-nums"
              style={{ textShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
              {skill.level}%
            </div>
            <p className="text-red-400/60 text-xs font-mono">CRITICAL LEVEL</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 bg-red-950/80 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-1000"
              style={{ width: phase >= 1 ? `${skill.level}%` : '0%' }} />
          </div>
          <span className="text-red-600 font-black text-xs">薄弱</span>
        </div>

        {phase >= 2 && (
          <div className="mt-4 p-4 bg-black/30 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 tracking-wider">AI · 诊断报告生成中</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
            <p className="text-sm text-red-200/80 leading-relaxed">
              <TypewriterText text={skill.suggestion} delay={25} />
            </p>
          </div>
        )}
      </div>

      <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
    </div>
  );
}

function BarChart3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="h-56 flex items-end justify-around gap-4 px-4 pb-2">
      {weeklyData.map((d, i) => {
        const barH = (d.hours / maxHours) * 180;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
          <div className="relative w-full" style={{ height: '200px' }}>
            {/* 上升粒子 - 用 keyframes 内联动画 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
              style={{
                bottom: mounted ? `${barH + 12}px` : '-10px',
                opacity: mounted ? 1 : 0,
                transition: `bottom 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms, opacity 0.5s ${i * 80 + 200}ms`,
              }}
            >
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="rounded-full"
                  style={{
                    width: j === 1 ? '6px' : '4px',
                    height: j === 1 ? '6px' : '4px',
                    background: d.color,
                    boxShadow: `0 0 6px ${d.color}`,
                    animation: `particleFloat ${1.5 + j * 0.4}s ease-in-out infinite`,
                    animationDelay: `${j * 0.35 + i * 0.15}s`,
                  }}
                />
              ))}
            </div>

            {/* 柱体 */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-lg overflow-hidden"
              style={{
                height: mounted ? `${barH}px` : '2px',
                minHeight: mounted ? undefined : '2px',
                background: `linear-gradient(180deg, ${d.color}ee 0%, ${d.color}88 40%, ${d.color}33 100%)`,
                boxShadow: `0 -4px 20px ${d.color}25, 0 0 30px ${d.color}15 inset`,
                transition: `height 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms`,
              }}
            >
              {/* 柱体顶部发光点 */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{
                  width: '8px', height: '8px',
                  boxShadow: `0 0 10px ${d.color}, 0 0 20px ${d.color}50`,
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.6s ${i * 100 + 800}ms`,
                }}
              />
              {/* 柱体内部光带 */}
              <div
                className="absolute top-0 left-0 right-0 h-1/2"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)`,
                }}
              />
            </div>

            {/* 底部基座反光 */}
            <div
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
              style={{
                background: d.color,
                opacity: 0.3,
                filter: 'blur(2px)',
              }}
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-1">{d.day}</span>
          <span className="text-xs font-black tabular-nums" style={{ color: d.color }}>{d.hours}h</span>
        </div>
      )})}
    </div>
  );
}

function TimelineItem({ date, duration, courses, rating, title, isLast }: { date: string; duration: string; courses: number; rating: string; title: string; isLast: boolean }) {
  const colors: Record<string, string> = {
    excellent: '#22c55e',
    good: '#3b82f6',
    medium: '#eab308',
    poor: '#ef4444',
  };
  const color = colors[rating] || '#6b7280';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white mt-1.5"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-transparent mt-1" />}
      </div>
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          <span className="text-xs font-bold" style={{ color }}>{duration}</span>
        </div>
        <p className="text-xs text-gray-400">{date} · {courses} 门课程</p>
        <div className="flex gap-1 mt-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < (rating === 'excellent' ? 5 : rating === 'good' ? 4 : rating === 'medium' ? 3 : 2) ? color : '#e5e7eb',
                boxShadow: i < (rating === 'excellent' ? 5 : rating === 'good' ? 4 : rating === 'medium' ? 3 : 1) ? `0 0 4px ${color}40` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, progress, level }: { icon: typeof BookOpen; label: string; value: string; progress: number; level: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-700 ${getStatusBg(level)} ${getStatusBorder(level)} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStatusColor(level)}`} />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${getStatusColor(level)} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-lg font-bold ${getStatusTextColor(level)}`}>{value}</p>
        </div>
      </div>
      <div className="mt-3">
        <Progress value={visible ? progress : 0} className="h-2" />
      </div>
    </div>
  );
}

export default function AIProfilePage() {
  const [rescanCounter, setRescanCounter] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = () => {
    setIsScanning(true);
    setRescanCounter(prev => prev + 1);

    const SCAN_DURATION = 2500;
    setTimeout(() => { setIsScanning(false); }, SCAN_DURATION);
  };

  return (
    <div className="flex-1 overflow-hidden relative bg-[#050510]">
      <ParticleBackground />
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <HologramHeader onRescan={handleRescan} isScanning={isScanning} />

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧面板 */}
          <div className="w-96 bg-white/95 backdrop-blur border-r border-gray-100 p-6 overflow-y-auto flex-shrink-0">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse" />
                <Avatar className="relative h-28 w-28 mx-auto border-4 border-red-200 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-3xl font-bold">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-black shadow-lg tracking-wider">
                  LV.8 · 资深学员
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-7">优秀干部</h2>
              <p className="text-gray-400 text-sm">学习达人</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-500">累计获得 <span className="font-bold text-yellow-600">42</span> 枚徽章</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 tracking-wider">
                <Rocket className="h-4 w-4 text-red-500" /> 学习概览
              </h3>
              <div className="space-y-3">
                {learningStats.map((s) => <StatCard key={s.label} {...s} />)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 tracking-wider">
                <Sparkles className="h-4 w-4 text-blue-500" /> 能力扑克牌
              </h3>
              <div className="relative">
                {(() => {
                  const [currentIndex, setCurrentIndex] = useState(0);
                  const [isFlipped, setIsFlipped] = useState(false);
                  const [isTransitioning, setIsTransitioning] = useState(false);
                  const [typewriterIndex, setTypewriterIndex] = useState(-1);
                  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

                  useEffect(() => {
                    return () => {
                      if (typewriterRef.current) {
                        clearTimeout(typewriterRef.current);
                      }
                    };
                  }, []);

                  const startTypewriter = (text: string) => {
                    setTypewriterIndex(0);
                    if (typewriterRef.current) clearTimeout(typewriterRef.current);

                    const typeNext = (idx: number) => {
                      if (idx <= text.length) {
                        setTypewriterIndex(idx);
                        typewriterRef.current = setTimeout(() => typeNext(idx + 1), 40 + Math.random() * 30);
                      }
                    };

                    setTimeout(() => typeNext(0), 700);
                  };

                  const stopTypewriter = () => {
                    if (typewriterRef.current) {
                      clearTimeout(typewriterRef.current);
                      typewriterRef.current = null;
                    }
                    setTypewriterIndex(-1);
                  };

                  const goToPrev = () => {
                    if (isTransitioning) return;
                    stopTypewriter();
                    setIsTransitioning(true);
                    setIsFlipped(false);
                    setTimeout(() => {
                      setCurrentIndex((prev) => (prev - 1 + skillTags.length) % skillTags.length);
                      setIsTransitioning(false);
                    }, 300);
                  };

                  const goToNext = () => {
                    if (isTransitioning) return;
                    stopTypewriter();
                    setIsTransitioning(true);
                    setIsFlipped(false);
                    setTimeout(() => {
                      setCurrentIndex((prev) => (prev + 1) % skillTags.length);
                      setIsTransitioning(false);
                    }, 300);
                  };

                  const getCardStyle = (index: number) => {
                    const offset = index - currentIndex;
                    const absOffset = Math.abs(offset);

                    if (offset === 0) {
                      return {
                        zIndex: 50,
                        transform: 'translateX(0) scale(1) rotateY(0deg)',
                        opacity: 1,
                        filter: 'blur(0px)'
                      };
                    }

                    const direction = offset > 0 ? 1 : -1;
                    const distance = Math.min(absOffset, 3);
                    const scale = 1 - (distance * 0.12);
                    const opacity = 1 - (distance * 0.28);
                    const rotateY = direction * (15 + (distance * 8));
                    const translateX = direction * (70 + (distance * 30));
                    const blur = distance * 1.5;

                    return {
                        zIndex: 50 - distance,
                        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                        opacity: Math.max(opacity, 0.15),
                        filter: `blur(${blur}px)`
                      };
                  };

                  const renderCard = (skill: typeof skillTags[0], index: number, isCenter: boolean) => {
                    const style = getCardStyle(index);
                    const colors = {
                      excellent: { border: '#22c55e', bg: 'from-green-50 to-emerald-50', gradient: 'from-green-500 to-emerald-600' },
                      good: { border: '#3b82f6', bg: 'from-blue-50 to-indigo-50', gradient: 'from-blue-500 to-indigo-600' },
                      medium: { border: '#eab308', bg: 'from-yellow-50 to-amber-50', gradient: 'from-yellow-500 to-amber-600' },
                      poor: { border: '#ef4444', bg: 'from-red-50 to-rose-50', gradient: 'from-red-500 to-rose-600' }
                    }[skill.status];

                    return (
                      <div
                        key={skill.name}
                        className={`absolute left-1/2 top-0 w-48 h-64 cursor-pointer transition-all duration-500 ease-out ${isCenter ? 'hover:shadow-2xl' : ''}`}
                        style={{
                          ...style,
                          marginLeft: '-96px',
                          perspective: '1200px'
                        }}
                        onClick={() => {
                          if (!isCenter) {
                            if (index > currentIndex) goToNext();
                            else goToPrev();
                          }
                        }}
                        onMouseEnter={() => {
                          if (isCenter) {
                            setIsFlipped(true);
                            startTypewriter(skill.suggestion);
                          }
                        }}
                        onMouseLeave={() => {
                          if (isCenter) {
                            setIsFlipped(false);
                            stopTypewriter();
                          }
                        }}
                      >
                        <div
                          className="relative w-full h-full rounded-2xl border-2 overflow-hidden shadow-xl"
                          style={{
                            borderColor: colors.border,
                            background: `linear-gradient(135deg, ${colors.border}10, ${colors.border}05)`
                          }}
                        >
                          {/* 正面 */}
                          <div className="absolute inset-0 rounded-2xl transition-opacity duration-500" style={{
                            opacity: (isCenter && isFlipped) ? 0 : 1,
                            zIndex: (isCenter && isFlipped) ? 0 : 10
                          }}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl`} />
                            <div className="relative z-10 p-4 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.gradient} shadow-md`}>
                                  {skill.status === 'excellent' && <Star className="h-4 w-4 text-white fill-white" />}
                                  {skill.status === 'poor' && <AlertTriangle className="h-4 w-4 text-white" />}
                                  {skill.status === 'good' && <Zap className="h-4 w-4 text-white" />}
                                  {skill.status === 'medium' && <Target className="h-4 w-4 text-white" />}
                                </div>
                                <Badge variant="secondary" className={`${colors.bg.replace('from-', 'bg-').split(' ')[0]} border-0 text-xs font-semibold`} style={{ color: colors.border }}>
                                  {getLevelLabel(skill.status)}
                                </Badge>
                              </div>
                              <h3 className="text-base font-bold text-gray-800 mb-2">{skill.name}</h3>
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">能力值</span>
                                  <span className="font-bold" style={{ color: colors.border }}>{skill.level}%</span>
                                </div>
                                <div className="h-2 bg-gray-200/70 rounded-full overflow-hidden">
                                  <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000`} style={{ width: `${skill.level}%` }} />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-3 flex-1 leading-relaxed">{skill.description}</p>
                              <div className="mt-auto pt-2 border-t border-gray-200/60">
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {isCenter ? '悬停翻牌查看AI建议' : '点击切换'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 背面 */}
                          <div className="absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-700" style={{
                            opacity: (isCenter && isFlipped) ? 1 : 0,
                            zIndex: (isCenter && isFlipped) ? 10 : 0
                          }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-orange-600 rounded-2xl" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
                            <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center"><Brain className="h-3 w-3 text-white" /></div>
                                <h4 className="text-sm font-bold text-white">AI分析建议</h4>
                              </div>
                              <p className="text-xs text-white/90 leading-relaxed min-h-[60px]">
                                {typewriterIndex >= 0 ? skill.suggestion.slice(0, typewriterIndex) : skill.suggestion}
                                {typewriterIndex >= 0 && typewriterIndex < skill.suggestion.length && (
                                  <span className="inline-block w-1.5 h-3.5 bg-white ml-0.5 animate-pulse align-middle" style={{ animationDuration: '0.6s' }} />
                                )}
                              </p>
                              <div className="mt-3 flex items-center gap-2 text-white/60">
                                <Sparkles className="h-3 w-3" />
                                <span className="text-[10px]">
                                  {typewriterIndex >= skill.suggestion.length && typewriterIndex >= 0 ? '✓ 分析完成' : typewriterIndex >= 0 ? '正在生成...' : '基于学习数据生成'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  const visibleRange = 3;
                  const startIndex = Math.max(0, currentIndex - visibleRange);
                  const endIndex = Math.min(skillTags.length - 1, currentIndex + visibleRange);

                  return (
                    <div className="relative" style={{ height: '280px' }}>
                      {/* 轮播容器 */}
                      <div className="relative w-full h-64 mx-auto">
                        {skillTags.map((skill, i) => {
                          if (i >= startIndex && i <= endIndex) {
                            return renderCard(skill, i, i === currentIndex);
                          }
                          return null;
                        })}
                      </div>

                      {/* 导航按钮 */}
                      <button
                        onClick={goToPrev}
                        disabled={isTransitioning}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                        style={{ zIndex: 100 }}
                      >
                        <ArrowLeft className="h-4 w-4 text-gray-700" />
                      </button>

                      <button
                        onClick={goToNext}
                        disabled={isTransitioning}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                        style={{ zIndex: 100 }}
                      >
                        <ArrowRight className="h-4 w-4 text-gray-700" />
                      </button>

                      {/* 指示器 */}
                      <div className="flex justify-center gap-2 mt-4">
                        {skillTags.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (!isTransitioning && i !== currentIndex) {
                                stopTypewriter();
                                setIsTransitioning(true);
                                setIsFlipped(false);
                                setTimeout(() => {
                                  setCurrentIndex(i);
                                  setIsTransitioning(false);
                                }, 300);
                              }
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              i === currentIndex ? 'w-6 bg-gradient-to-r from-blue-500 to-cyan-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>

                      {/* 计数器 */}
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-400 font-medium">
                          {currentIndex + 1} / {skillTags.length}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 tracking-wider">
                <Clock className="h-4 w-4 text-teal-500" /> 学习时间线
              </h3>
              <div className="space-y-3">
                {learningHistory.map((record, i) => (
                  <TimelineItem key={record.date} {...record} isLast={i === learningHistory.length - 1} />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 via-white to-red-50/20" style={{ overscrollBehavior: 'contain' }}>

            {/* 联动雷达图 + AI对话分析 */}
            <RadarChatPanel skills={skillTags} resetKey={rescanCounter} />

          </div>
        </div>
      </div>
    </div>
  );
}