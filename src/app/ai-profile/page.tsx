'use client';

import { useState, useEffect, useRef } from 'react';
import { PenTool, Brain, TrendingUp, Target, Award, BookOpen, Clock, Activity, Sparkles, Flame, Zap, Trophy, AlertTriangle, CheckCircle, Star, ChevronRight, User, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
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
  { name: '政治理论', level: 90, status: 'excellent', description: '政治理论基础扎实，对党的理论有深刻理解', suggestion: '建议深入学习习近平新时代中国特色社会主义思想' },
  { name: '党务知识', level: 85, status: 'excellent', description: '党务工作知识全面，熟悉各项流程', suggestion: '可以尝试担任党务培训讲师' },
  { name: '政策解读', level: 78, status: 'good', description: '能够准确理解和传达政策精神', suggestion: '建议加强政策研究能力' },
  { name: '党史学习', level: 88, status: 'excellent', description: '党史知识丰富，历史观正确', suggestion: '推荐参与党史宣讲活动' },
  { name: '公文写作', level: 72, status: 'good', description: '公文写作能力良好', suggestion: '建议多练习各类公文写作' },
  { name: '演讲表达', level: 65, status: 'medium', description: '演讲表达能力一般', suggestion: '建议参加演讲培训课程' },
  { name: '组织协调', level: 55, status: 'poor', description: '组织协调能力较弱，团队协作经验不足', suggestion: '需要加强团队管理和协调能力的培养，推荐学习团队管理课程' },
  { name: '创新思维', level: 48, status: 'poor', description: '创新意识不足，思维较为传统', suggestion: '建议多接触新思想、新技术，培养创新思维能力' },
];

const learningHistory = [
  { date: '2024-03-20', duration: '2小时30分', courses: 3, rating: 'excellent' },
  { date: '2024-03-19', duration: '1小时45分', courses: 2, rating: 'good' },
  { date: '2024-03-18', duration: '3小时15分', courses: 4, rating: 'excellent' },
  { date: '2024-03-17', duration: '1小时00分', courses: 1, rating: 'medium' },
  { date: '2024-03-16', duration: '2小时00分', courses: 2, rating: 'good' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'from-green-500 to-emerald-400';
    case 'good': return 'from-blue-500 to-cyan-400';
    case 'medium': return 'from-yellow-500 to-amber-400';
    case 'poor': return 'from-red-600 to-rose-500';
    default: return 'from-gray-500 to-gray-400';
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'medium': return 'text-yellow-600';
    case 'poor': return 'text-red-600 font-bold text-lg';
    default: return 'text-gray-600';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'excellent': return 'bg-green-50';
    case 'good': return 'bg-blue-50';
    case 'medium': return 'bg-yellow-50';
    case 'poor': return 'bg-red-50';
    default: return 'bg-gray-50';
  }
};

const getStatusBorder = (status: string) => {
  switch (status) {
    case 'excellent': return 'border-green-200';
    case 'good': return 'border-blue-200';
    case 'medium': return 'border-yellow-200';
    case 'poor': return 'border-red-300';
    default: return 'border-gray-200';
  }
};

const getLevelLabel = (status: string) => {
  switch (status) {
    case 'excellent': return '优秀';
    case 'good': return '良好';
    case 'medium': return '中等';
    case 'poor': return '薄弱';
    default: return '未知';
  }
};

function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(initialParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y - p.speed,
        x: p.x + (Math.random() - 0.5) * 0.1,
        opacity: p.y < 0 ? Math.random() * 0.5 + 0.2 : p.opacity,
        y: p.y < 0 ? 100 : p.y,
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-red-400/60 to-orange-400/60"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px rgba(220, 38, 38, 0.3)`,
          }}
        />
      ))}
    </div>
  );
}

function TypewriterText({ text, delay = 50, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    indexRef.current = 0;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay, onComplete]);

  return (
    <span className="inline">
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
}

function RadarChart({ data }: { data: typeof skillTags }) {
  const centerX = 150;
  const centerY = 150;
  const radius = 120;
  const levels = [20, 40, 60, 80, 100];
  const numSides = data.length;
  const angleStep = (Math.PI * 2) / numSides;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const polygonPoints = data.map((d, i) => getPoint(i, d.level)).map(p => `${p.x},${p.y}`).join(' ');

  const gridLines = levels.map(level => {
    const points = data.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (level / 100) * radius;
      return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
    }).join(' ');
    return points;
  });

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke={i === gridLines.length - 1 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
            strokeWidth="1"
          />
        ))}
        {data.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const endX = centerX + radius * Math.cos(angle);
          const endY = centerY + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="1"
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill="url(#gradient)"
          stroke="#dc2626"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(220, 38, 38, 0.4)" />
            <stop offset="100%" stopColor="rgba(234, 88, 12, 0.4)" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const point = getPoint(i, d.level);
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={d.status === 'excellent' ? '#16a34a' : d.status === 'poor' ? '#dc2626' : '#3b82f6'}
              className="animate-pulse"
            />
          );
        })}
        {data.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-600 font-medium"
            >
              {d.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Skill3DCard({ skill, index, total, isActive, onHover }: { skill: typeof skillTags[0]; index: number; total: number; isActive: boolean; onHover: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  
  const rotateY = isActive ? 0 : ((index - total / 2) * 30);
  const scale = isActive ? 1 : 0.85;

  return (
    <div
      className="relative flex-shrink-0 w-64 cursor-pointer"
      style={{
        perspective: '1000px',
        transform: `scale(${scale})`,
        transition: 'transform 0.5s ease-out',
      }}
      onMouseEnter={() => { setIsHovered(true); onHover(); }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-80 transition-all duration-700 ease-out ${isHovered ? 'shadow-2xl' : 'shadow-lg'}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${isHovered ? 0 : rotateY}deg) rotateX(${isHovered ? -10 : 0}deg)`,
        }}
      >
        <div
          className={`absolute inset-0 rounded-2xl border-2 ${getStatusBorder(skill.status)} ${getStatusBg(skill.status)} p-5 transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getStatusColor(skill.status)} shadow-lg`}>
              {skill.status === 'excellent' && <Star className="h-6 w-6 text-white fill-white" />}
              {skill.status === 'poor' && <AlertTriangle className="h-6 w-6 text-white" />}
              {skill.status === 'good' && <Zap className="h-6 w-6 text-white" />}
              {skill.status === 'medium' && <Target className="h-6 w-6 text-white" />}
            </div>
            <Badge variant="secondary" className={`${getStatusBg(skill.status)} ${getStatusTextColor(skill.status)} border-0`}>
              {getLevelLabel(skill.status)}
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{skill.name}</h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">能力值</span>
              <span className={`font-bold ${getStatusTextColor(skill.status)}`}>{skill.level}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStatusColor(skill.status)} rounded-full transition-all duration-1000`}
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
        </div>

        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 p-5 flex flex-col justify-center items-center text-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <MessageSquare className="h-8 w-8 mb-3" />
          <h4 className="font-bold mb-2">AI分析建议</h4>
          <p className="text-sm text-white/90 text-center">{skill.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

function PoorSkillCardWithTypewriter({ skill, isVisible }: { skill: typeof skillTags[0]; isVisible: boolean }) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowAnalysis(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      className={`p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-300 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
          <AlertTriangle className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-red-700">{skill.name}</h3>
            <span className="text-red-600 font-bold text-2xl">{skill.level}%</span>
          </div>
          
          {showAnalysis && (
            <div className="mt-3 p-3 bg-white/80 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-600">AI深度分析</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <TypewriterText text={skill.suggestion} delay={30} />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillCarousel({ skills }: { skills: typeof skillTags }) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(skills.length / 2));
  const containerRef = useRef<HTMLDivElement>(null);

  const goToPrev = () => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setActiveIndex(prev => Math.min(skills.length - 1, prev + 1));
  };

  useEffect(() => {
    if (containerRef.current) {
      const cardWidth = 256;
      const containerWidth = containerRef.current.offsetWidth;
      const scrollPosition = activeIndex * cardWidth - containerWidth / 2 + cardWidth / 2;
      containerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  return (
    <div className="relative">
      <Button
        onClick={goToPrev}
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {skills.map((skill, index) => (
          <div key={skill.name} style={{ scrollSnapAlign: 'center' }}>
            <Skill3DCard
              skill={skill}
              index={index}
              total={skills.length}
              isActive={index === activeIndex}
              onHover={() => setActiveIndex(index)}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={goToNext}
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 backdrop-blur-sm shadow-lg"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>

      <div className="flex justify-center gap-2 mt-4">
        {skills.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-6 bg-red-500' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, progress, level }: { icon: typeof BookOpen; label: string; value: string; progress: number; level: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 transition-all duration-700 transform ${getStatusBg(level)} ${getStatusBorder(level)} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
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
        <Progress value={isVisible ? progress : 0} className="h-2 transition-all duration-1000" />
      </div>
      {level === 'excellent' && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 animate-pulse" />
        </div>
      )}
      {level === 'poor' && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
        </div>
      )}
    </div>
  );
}

function HistoryItem({ date, duration, courses, rating }: { date: string; duration: string; courses: number; rating: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${getStatusBg(rating)} ${getStatusBorder(rating)} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-gradient-to-br ${getStatusColor(rating)}`}>
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{date}</p>
          <p className="text-sm text-gray-500">学习了 {courses} 门课程</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${getStatusTextColor(rating)}`}>{duration}</p>
        <div className="flex items-center gap-1 justify-end">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < (rating === 'excellent' ? 5 : rating === 'good' ? 4 : rating === 'medium' ? 3 : 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIProfilePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('[data-observe]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 2000);
  };

  const excellentSkills = skillTags.filter(s => s.status === 'excellent');
  const poorSkills = skillTags.filter(s => s.status === 'poor');

  return (
    <div className="flex-1 overflow-hidden relative">
      <ParticleBackground />
      
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 px-6 py-8 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px] animate-pulse" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  AI学习画像
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-bounce" />
                </h1>
                <p className="text-white/80">基于AI深度分析的个人学习能力画像</p>
              </div>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-red-600 hover:bg-white/90 font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                  更新中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  更新画像
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-96 bg-white/80 backdrop-blur-sm border-r border-red-100 p-6 overflow-y-auto">
            <div className="text-center mb-6 relative">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse" />
                <Avatar className="relative h-28 w-28 mx-auto mb-3 border-4 border-red-200 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-3xl font-bold">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg">
                  Lv.8 资深学员
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-6">党员同志</h2>
              <p className="text-gray-500">学习达人</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">累计获得 <span className="font-bold text-yellow-600">42</span> 枚徽章</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-red-500" />
                学习概览
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {learningStats.map((stat, index) => (
                  <div key={stat.label} style={{ animationDelay: `${index * 100}ms` }}>
                    <StatCard {...stat} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                成就徽章
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
                  >
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={mainContentRef} className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-red-50/30">
            <div className="grid grid-cols-2 gap-6">
              <Card className="col-span-1 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-red-500" />
                    能力雷达图
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    详细分析 <ChevronRight className="h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <RadarChart data={skillTags} />
                </CardContent>
              </Card>

              <Card className="col-span-1 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    优势能力
                  </CardTitle>
                  <CardDescription className="text-green-600">以下能力表现优秀，继续保持！</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {excellentSkills.map((skill, index) => (
                      <div
                        key={skill.name}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200 transition-all duration-300 hover:bg-green-100 hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-800">{skill.name}</p>
                          <p className="text-sm text-green-600">能力值: {skill.level}%</p>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{skill.level}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-rose-500" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  需要提升的能力
                </CardTitle>
                <CardDescription className="text-red-600 font-bold">以下能力需要重点关注和提升！</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {poorSkills.map((skill, index) => (
                    <div key={skill.name} data-observe id={`poor-skill-${skill.name}`}>
                      <PoorSkillCardWithTypewriter
                        skill={skill}
                        isVisible={visibleSections[`poor-skill-${skill.name}`] || false}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  3D能力轮播
                </CardTitle>
                <p className="text-sm text-gray-500">鼠标悬停查看详情</p>
              </CardHeader>
              <CardContent>
                <SkillCarousel skills={skillTags} />
              </CardContent>
            </Card>

            <Card className="mt-6 border-2 border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  近期学习记录
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  查看全部 <ChevronRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningHistory.map((record, index) => (
                    <HistoryItem key={record.date} {...record} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-l-4 border-red-500 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI学习建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">重点提升建议</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        根据您的学习数据分析，建议您重点提升「组织协调」和「创新思维」能力，
                        目前水平分别为 <span className="text-red-600 font-bold">55%</span> 和 <span className="text-red-600 font-bold">48%</span>。
                        推荐学习《团队协作与沟通》和《创新方法论》课程。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">保持优秀表现</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        您的「政治理论」和「党史学习」能力表现优秀，分别达到 <span className="text-green-600 font-bold">90%</span> 和 <span className="text-green-600 font-bold">88%</span>，
                        建议继续保持学习节奏，挑战更高级别的课程内容。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800">学习节奏建议</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        您的学习活跃度很高，建议保持当前学习节奏，预计还需 <span className="text-yellow-600 font-bold">2周</span> 即可完成本月学习目标。
                        检测到您对「党史学习」有浓厚兴趣，推荐您关注最新上线的党史专题课程。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}