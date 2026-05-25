'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Waves,
  Mountain,
  Wind,
  Flame,
  Map,
  BookOpen,
  Users,
  MessageSquare,
  ArrowRight,
  Snowflake,
} from 'lucide-react';

const disasterTypes = [
  { id: 'flood', name: '内涝', icon: Waves, color: 'blue', description: '按降雨量与积水深度分级', knowledgePath: '/safety/knowledge-intro' },
  { id: 'typhoon', name: '台风', icon: Wind, color: 'cyan', description: '热带低压到超强台风分级', knowledgePath: '/safety/typhoon-knowledge' },
  { id: 'earthquake', name: '地震', icon: Mountain, color: 'orange', description: '按震级和烈度分级', knowledgePath: '/safety/earthquake-knowledge' },
  { id: 'forest-fire', name: '森林/草原火灾', icon: Flame, color: 'red', description: '按受害面积分级', knowledgePath: '/safety/forest-fire-knowledge' },
  { id: 'cold-wave', name: '寒潮', icon: Snowflake, color: 'sky', description: '按降温幅度和最低气温分级', knowledgePath: '/safety/cold-wave-knowledge' },
];

const courseCards = (selectedDisasterId: string) => [
  {
    id: 'knowledge-graph',
    title: '知识图谱',
    description: '系统化的安全知识体系图谱，全面了解各类灾害的成因、影响与应对措施',
    icon: Map,
    color: 'from-blue-600/80 via-blue-500/70 to-cyan-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    hoverBorder: 'hover:border-blue-300/60',
    iconBg: 'bg-blue-500/30',
    iconColor: 'text-blue-300',
    href: '/safety/disaster-graph',
  },
  {
    id: 'knowledge-intro',
    title: '知识科普介绍课程',
    description: (() => {
      const descriptions: Record<string, string> = {
        flood: '深入浅出的内涝科普知识，帮助您掌握基本的防灾减灾理论与实操技能',
        typhoon: '系统讲解台风从热带低压到超强台风的全过程，掌握蓝黄橙红预警与五类避险技能',
        earthquake: '地震成因、震级烈度分级、震前准备与震后自救互救全指南',
        'forest-fire': '森林/草原火灾成因与分级标准，掌握避险逃生与火场自救技能',
        'cold-wave': '寒潮分级标准、预警信号识别与防寒保暖应对指南',
      };
      return descriptions[selectedDisasterId] || '防灾减灾科普知识，帮助您掌握基本的防灾理论与实操技能';
    })(),
    icon: BookOpen,
    color: (() => {
      const colors: Record<string, string> = {
        flood: 'from-emerald-600/80 via-emerald-500/70 to-green-500/70',
        typhoon: 'from-cyan-600/80 via-cyan-500/70 to-blue-500/70',
        earthquake: 'from-orange-600/80 via-orange-500/70 to-red-500/70',
        'forest-fire': 'from-red-600/80 via-red-500/70 to-yellow-500/70',
        'cold-wave': 'from-sky-600/80 via-sky-500/70 to-indigo-500/70',
      };
      return colors[selectedDisasterId] || 'from-emerald-600/80 via-emerald-500/70 to-green-500/70';
    })(),
    hoverShadow: (() => {
      const shadows: Record<string, string> = {
        flood: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
        typhoon: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
        earthquake: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
        'forest-fire': 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        'cold-wave': 'hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]',
      };
      return shadows[selectedDisasterId] || 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]';
    })(),
    hoverBorder: (() => {
      const borders: Record<string, string> = {
        flood: 'hover:border-emerald-300/60',
        typhoon: 'hover:border-cyan-300/60',
        earthquake: 'hover:border-orange-300/60',
        'forest-fire': 'hover:border-red-300/60',
        'cold-wave': 'hover:border-sky-300/60',
      };
      return borders[selectedDisasterId] || 'hover:border-emerald-300/60';
    })(),
    iconBg: (() => {
      const bgs: Record<string, string> = {
        flood: 'bg-emerald-500/30',
        typhoon: 'bg-cyan-500/30',
        earthquake: 'bg-orange-500/30',
        'forest-fire': 'bg-red-500/30',
        'cold-wave': 'bg-sky-500/30',
      };
      return bgs[selectedDisasterId] || 'bg-emerald-500/30';
    })(),
    iconColor: (() => {
      const colors: Record<string, string> = {
        flood: 'text-emerald-300',
        typhoon: 'text-cyan-300',
        earthquake: 'text-orange-300',
        'forest-fire': 'text-red-300',
        'cold-wave': 'text-sky-300',
      };
      return colors[selectedDisasterId] || 'text-emerald-300';
    })(),
    href: (() => {
      const paths: Record<string, string> = {
        flood: '/safety/knowledge-intro',
        typhoon: '/safety/typhoon-knowledge',
        earthquake: '/safety/earthquake-knowledge',
        'forest-fire': '/safety/forest-fire-knowledge',
        'cold-wave': '/safety/cold-wave-knowledge',
      };
      return paths[selectedDisasterId] || '/safety/knowledge-intro';
    })(),
  },
  {
    id: 'command-course',
    title: '岗位指挥课程',
    description: '针对各岗位的应急指挥培训，提升灾情应对的组织协调与决策能力',
    icon: Users,
    color: 'from-purple-600/80 via-purple-500/70 to-pink-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    hoverBorder: 'hover:border-purple-300/60',
    iconBg: 'bg-purple-500/30',
    iconColor: 'text-purple-300',
    href: '/safety/command-course',
  },
  {
    id: 'quiz-interactive',
    title: '岗位答题互动',
    description: '通过互动答题检验学习成果，巩固应急知识，提升实战应对水平',
    icon: MessageSquare,
    color: 'from-orange-600/80 via-orange-500/70 to-yellow-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    hoverBorder: 'hover:border-orange-300/60',
    iconBg: 'bg-orange-500/30',
    iconColor: 'text-orange-300',
    href: '/safety/quiz-interactive',
  },
];

export default function SafetyPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState('flood');

  const selectedDisasterData = disasterTypes.find(d => d.id === selectedDisaster);

  const handleNavigateWithDisaster = (href: string) => {
    if (href === '/safety/disaster-graph') {
      const disasterName = disasterTypes.find(d => d.id === selectedDisaster)?.name || '地震';
      localStorage.setItem('selectedDisaster', disasterName);
      router.push(`${href}?disaster=${encodeURIComponent(disasterName)}`);
    } else {
      router.push(href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
      <main className="w-full px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* 顶部标题区 */}
          <div 
            className="relative overflow-hidden rounded-3xl"
            style={{
              backgroundImage: 'url(/welcome-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 max-w-5xl mx-auto text-center py-12 px-6">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                安全应急培训
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-yellow-300" />
                  <h3 className="text-xl font-bold text-white">自然灾害防护 · 四大课程模块</h3>
                  <Shield className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
                  针对不同类型的自然灾害，提供系统化的培训课程，帮助您掌握防灾减灾知识与应急技能
                </p>
              </motion.div>

              {/* 灾害类型选择 - 5种 */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {disasterTypes.map((disaster, index) => {
                  const Icon = disaster.icon;
                  const isSelected = selectedDisaster === disaster.id;
                  return (
                    <motion.div
                      key={disaster.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => setSelectedDisaster(disaster.id)}
                      className={`group cursor-pointer relative overflow-hidden rounded-xl backdrop-blur-sm border p-4 text-center transition-all duration-500 ${
                        isSelected
                          ? 'bg-white/30 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                          : 'bg-white/10 border-white/30 hover:border-white/50 hover:bg-white/20'
                      }`}
                    >
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative z-10">
                        <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-2 transition-transform duration-300 ${
                          isSelected ? 'bg-white/40 scale-110' : 'bg-white/20 group-hover:scale-110'
                        }`}>
                          <Icon className={`w-6 h-6 transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'
                          }`} />
                        </div>
                        <h4 className="text-sm font-bold text-white">{disaster.name}</h4>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 当前选中的灾害提示 */}
              <motion.div
                key={selectedDisaster}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30"
              >
                <Shield className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-white/90">
                  当前选择：<span className="font-bold text-white">{selectedDisasterData?.name}</span> - {selectedDisasterData?.description}
                </span>
              </motion.div>
            </div>
          </div>

          {/* 课程卡片区域 */}
          <div className="grid md:grid-cols-2 gap-5">
            {courseCards(selectedDisaster).map((course, index) => {
              const Icon = course.icon;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 200 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-br ${course.color} backdrop-blur-sm border border-white/30 p-6 text-left ${course.hoverBorder} ${course.hoverShadow} transition-all duration-500`}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${course.iconBg}`}>
                        <Icon className={`w-7 h-7 group-hover:text-white transition-colors duration-300 ${course.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-2">{course.title}</h4>
                        <p className="text-base text-white/75 leading-relaxed">{course.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigateWithDisaster(course.href || '/')}
                      className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2"
                    >
                      进入学习
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
