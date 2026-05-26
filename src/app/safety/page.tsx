'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
  { id: 'waterlogging', name: '内涝', icon: Waves, color: 'blue', description: '城市内涝防灾减灾' },
  { id: 'typhoon', name: '台风', icon: Wind, color: 'cyan', description: '台风防御与应对' },
  { id: 'earthquake', name: '地震', icon: Mountain, color: 'orange', description: '地震应急避险知识' },
  { id: 'forest-fire', name: '森林火灾', icon: Flame, color: 'red', description: '森林火灾预防与扑救' },
  { id: 'cold-wave', name: '寒潮', icon: Snowflake, color: 'sky', description: '寒潮防护与应对' },
];

const courseCards = [
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
    description: '深入浅出的内涝科普知识，帮助您掌握基本的防灾减灾理论与实操技能',
    icon: BookOpen,
    color: 'from-emerald-600/80 via-emerald-500/70 to-green-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    hoverBorder: 'hover:border-emerald-300/60',
    iconBg: 'bg-emerald-500/30',
    iconColor: 'text-emerald-300',
    href: '/safety/knowledge-intro',
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
    const disasterName = disasterTypes.find(d => d.id === selectedDisaster)?.name || '地震';
    
    if (href === '/safety/disaster-graph') {
      localStorage.setItem('selectedDisaster', disasterName);
      router.push(`${href}?disaster=${encodeURIComponent(disasterName)}`);
    } else if (href === '/safety/quiz-interactive') {
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

              {/* 灾害类型选择 - 扩展为11种 */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
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
            {courseCards.map((course, index) => {
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
