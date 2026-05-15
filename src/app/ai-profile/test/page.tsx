'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, TrendingUp, Target, Award, BookOpen, Clock, Activity, Sparkles, Flame, Zap, Trophy, AlertTriangle, Star, ChevronRight, User, ArrowLeft, ArrowRight, MessageSquare, Bot, Rocket, Shield, Swords, Medal, Crown, ScanLine } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
      if (i >= text.length) { clearInterval(timer); setDone(true); }
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
    <div className={`relative overflow-hidden rounded-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(239,68,68,0.3)_0%,transparent_50%)]" />
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-red-400">{skill.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-red-500">{skill.level}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 bg-red-950/80 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-1000"
              style={{ width: phase >= 1 ? `${skill.level}%` : '0%' }} />
          </div>
        </div>
        {phase >= 2 && (
          <div className="mt-3 p-3 bg-black/30 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-3 w-3 text-red-400" />
              <span className="text-xs font-bold text-red-400">AI · 诊断报告</span>
            </div>
            <p className="text-sm text-red-200/80 leading-relaxed">
              <TypewriterText text={skill.suggestion} delay={25} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RadarChatPanel({ skills, resetKey }: { skills: typeof skillTags; resetKey: number }) {
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());
  const [animatedValues, setAnimatedValues] = useState<number[]>(skills.map(() => 0));
  const [activeSkillIdx, setActiveSkillIdx] = useState<number | null>(null);
  const [crisisShown, setCrisisShown] = useState<Set<string>>(new Set());
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setVisibleSet(new Set());
    setAnimatedValues(skills.map(() => 0));
    setActiveSkillIdx(null);
    setCrisisShown(new Set());
    setRotation(0);
  }, [resetKey]);

  useEffect(() => {
    const timer = setInterval(() => setRotation(prev => (prev + 0.25) % 360), 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = Number(e.target.dataset.chatIdx);
          setVisibleSet(prev => new Set([...prev, idx]));
          setActiveSkillIdx(idx);
          const targetVal = skills[radarChats[idx].skillIdx].level;
          let start = performance.now();
          const duration = 1200;
          const from = animatedValues[radarChats[idx].skillIdx];
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setAnimatedValues(prev => {
              const next = [...prev];
              next[radarChats[idx].skillIdx] = Math.round(from + (targetVal - from) * ease);
              return next;
            });
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);

          const targetSkill = skills[radarChats[idx].skillIdx];
          if (targetSkill.status === 'poor') {
            setTimeout(() => { setCrisisShown(prev => new Set([...prev, targetSkill.name])); }, 600);
          }
        }
      }),
      { threshold: 0.3 }
    );
    document.querySelectorAll('[data-chat-idx]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const cx = 170, cy = 165, r = 100;
  const step = (Math.PI * 2) / skills.length;

  const getP = useCallback((i: number, v: number) => {
    const a = step * i - Math.PI / 2;
    return { x: cx + (v / 100) * r * Math.cos(a), y: cy + (v / 100) * r * Math.sin(a) };
  }, [step]);

  const poly = skills.map((_, i) => getP(i, animatedValues[i])).map(p => `${p.x},${p.y}`).join(' ');
  const poorSkills = skills.filter(s => s.status === 'poor');

  return (
    <div className="grid grid-cols-[320px_1fr] gap-6 max-w-[1200px] mx-auto">
      {/* 左侧：雷达图 + 紧急提升 */}
      <Card className="border-2 border-red-200 shadow-xl relative overflow-hidden bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-red-950/80 h-fit sticky top-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        <CardHeader className="pb-1 pt-4 px-5">
          <CardTitle className="text-sm flex items-center gap-2 text-white/90">
            <ScanLine className="h-4 w-4 text-red-400 animate-pulse" /> 实时能力扫描
          </CardTitle>
          <p className="text-[11px] text-white/30">跟随对话动态更新</p>
        </CardHeader>
        <CardContent className="pt-0 px-5 pb-4 space-y-4">
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

          <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

          <div className="space-y-3 min-h-[80px]">
            {crisisShown.size === 0 && (
              <p className="text-[11px] text-white/20 text-center py-4">👉 滚动右侧对话，能力预警将在此处弹出</p>
            )}
            {poorSkills.filter(s => crisisShown.has(s.name)).map(s => (
              <CrisisBanner key={s.name} skill={s} isVisible />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 右侧：滚动对话流 */}
      <div className="space-y-4 py-2 pb-20">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-4 w-4 text-red-500" />
          <span className="text-sm font-bold text-gray-700">AI 能力深度分析</span>
          <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-200 text-[10px]">↓ 向下滚动触发联动</Badge>
        </div>

        {radarChats.map((chat, ci) => {
          const visible = visibleSet.has(ci);
          const targetSkill = skills[chat.skillIdx];
          return (
            <div key={ci} data-chat-idx={ci}
              className={`flex gap-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-1 transition-transform duration-500 ${visible ? 'scale(100%) rotate(0)' : 'scale(50%) rotate(-12deg)'}`}
                style={{ background: `linear-gradient(135deg,${chat.accent.replace(',', ',')})`, boxShadow: `0 0 16px ${chat.accent.split(',')[0]}30` }}>
                <chat.icon className="h-4 w-4 text-white" />
              </div>
              <div className={`flex-1 p-4 rounded-2xl border transition-all duration-500 ${
                chat.side === 'left'
                  ? 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                  : 'bg-gradient-to-br from-red-50 to-orange-50/70 border-red-200/60 shadow-sm hover:shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    {chat.title}
                    <Badge variant="secondary" className={`${getStatusBg(targetSkill.status)} ${getStatusTextColor(targetSkill.status)} border-0 text-[10px] px-1.5 py-0`}>
                      {targetSkill.name}
                    </Badge>
                  </span>
                  {visible && (
                    <span className="text-sm font-black tabular-nums"
                      style={{ color: targetSkill.status==='excellent'?'#22c55e':targetSkill.status==='poor'?'#ef4444':'#3b82f6' }}>
                      {animatedValues[chat.skillIdx]}%
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {chat.lines.map((line, li) => (
                    <p key={li} className={`text-sm leading-relaxed ${targetSkill.status === 'poor' ? 'text-red-700 font-medium' : 'text-gray-600'}`}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(8px)',
                        transition: `opacity 0.5s ${li*150}ms, transform 0.5s ${li*150}ms`,
                      }}>
                      {visible && li === 0 ? <TypewriterText text={line} delay={20} /> : line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div className={`mt-4 p-5 rounded-2xl bg-gradient-to-r from-red-600/95 to-orange-600/95 text-white border border-white/10 shadow-xl transition-all duration-1000 ${visibleSet.size >= radarChats.length ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
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

export default function AIProfileTestPage() {
  const [rescanCounter, setRescanCounter] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const handleRescan = () => {
    setIsScanning(true);
    setRescanCounter(prev => prev + 1);
    setTimeout(() => { setIsScanning(false); }, 2500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20">
      <div className="max-w-[1400px] mx-auto p-8 space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            🧪 AI画像 · 联动效果测试页
          </h1>
          <p className="text-gray-500 text-sm">
            测试滚动触发 → 雷达图数值增长 → 危机卡片弹出 的完整联动链路
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Badge variant="outline" className="text-green-600 border-green-300">✅ 雷达图联动</Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-300">✅ 打字机效果</Badge>
            <Badge variant="outline" className="text-red-600 border-red-300">✅ 危机弹窗</Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-300">✅ 滚动触发</Badge>
            {isScanning && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse">🔄 重播中...</Badge>}
          </div>
        </div>

        {/* 操作提示 */}
        <Card className={`border-2 border-dashed transition-all duration-500 ${isScanning ? 'border-yellow-300 bg-yellow-50/80' : 'border-blue-200 bg-blue-50/50'}`}>
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isScanning ? 'bg-yellow-200' : 'bg-blue-100'}`}>
                {isScanning ? (
                  <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className={`font-semibold ${isScanning ? 'text-yellow-800' : 'text-blue-800'}`}>
                  {isScanning ? '正在重新扫描所有动画...' : '操作指南'}
                </p>
                <p className={`text-sm ${isScanning ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {isScanning
                    ? '所有动画已重置，向下滚动重新观察联动效果'
                    : '向下滚动右侧对话区域，观察左侧雷达图的实时变化和底部危机卡片的动态弹出'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRescan}
                disabled={isScanning}
                variant="outline"
                className={`${isScanning ? 'border-yellow-400 text-yellow-600 cursor-not-allowed' : 'border-red-400 text-red-600 hover:bg-red-50'} transition-all`}
              >
                {isScanning ? (
                  <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-1" />重播中</>
                ) : (
                  <>🔄 重新播放全部动画</>
                )}
              </Button>
              <Button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-100"
              >
                ⬇️ 滚动到底部
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 核心组件 */}
        <RadarChatPanel skills={skillTags} resetKey={rescanCounter} />

        {/* 底部占位 — 确保有足够滚动空间 */}
        <div className="h-64 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="font-medium">已到达页面底部</p>
            <p className="text-sm mt-1">向上滚动重新观察联动效果 ↑</p>
          </div>
        </div>
      </div>
    </div>
  );
}