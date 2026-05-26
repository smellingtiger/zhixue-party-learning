'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Map,
  BookOpen,
  Users,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  X,
} from 'lucide-react';

const disasterTypes = [
  { id: 'waterlogging', name: '内涝', image: '/knowledge-images/内涝.png', description: '城市内涝防灾减灾' },
  { id: 'typhoon', name: '台风', image: '/knowledge-images/台风.png', description: '台风防御与应对' },
  { id: 'earthquake', name: '地震', image: '/knowledge-images/地震.png', description: '地震应急避险知识' },
  { id: 'forest-fire', name: '森林火灾', image: '/knowledge-images/火灾.png', description: '森林火灾预防与扑救' },
  { id: 'cold-wave', name: '寒潮', image: '/knowledge-images/寒潮.png', description: '寒潮防护与应对' },
];

const courseCards = (selectedDisasterId: string) => [
  {
    id: 'knowledge-graph',
    title: '知识图谱',
    description: '系统化的安全知识体系图谱，全面了解各类灾害的成因、影响与应对措施',
    icon: Map,
    color: 'from-blue-600 via-blue-500 to-cyan-500',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    hoverBorder: 'hover:border-blue-300/80',
    iconBg: 'bg-blue-500/40',
    iconColor: 'text-blue-200',
    href: '/safety/disaster-graph',
  },
  {
    id: 'knowledge-intro',
    title: '知识科普介绍课程',
    description: '防灾减灾科普知识，帮助您掌握基本的防灾理论与实操技能',
    icon: BookOpen,
    color: 'from-emerald-600 via-emerald-500 to-green-500',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    hoverBorder: 'hover:border-emerald-300/80',
    iconBg: 'bg-emerald-500/40',
    iconColor: 'text-emerald-200',
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
    color: 'from-purple-600 via-purple-500 to-pink-500',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    hoverBorder: 'hover:border-purple-300/80',
    iconBg: 'bg-purple-500/40',
    iconColor: 'text-purple-200',
    href: (() => {
      const paths: Record<string, string> = {
        flood: '/safety/command-course?disaster=flood',
        typhoon: '/safety/command-course?disaster=typhoon',
        earthquake: '/safety/command-course?disaster=earthquake',
        'forest-fire': '/safety/command-course?disaster=forest-fire',
        'cold-wave': '/safety/command-course?disaster=cold-wave',
      };
      return paths[selectedDisasterId] || '/safety/command-course?disaster=flood';
    })(),
  },
  {
    id: 'quiz-interactive',
    title: '岗位答题互动',
    description: '通过互动答题检验学习成果，巩固应急知识，提升实战应对水平',
    icon: MessageSquare,
    color: 'from-orange-600 via-orange-500 to-yellow-500',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]',
    hoverBorder: 'hover:border-orange-300/80',
    iconBg: 'bg-orange-500/40',
    iconColor: 'text-orange-200',
    href: '/safety/quiz-interactive',
  },
];

export default function SafetyPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [showDisasterPrompt, setShowDisasterPrompt] = useState(false);

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

  const handleCardClick = (href: string) => {
    if (!selectedDisaster) {
      setShowDisasterPrompt(true);
      return;
    }
    handleNavigateWithDisaster(href);
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
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
                  const isSelected = selectedDisaster === disaster.id;
                  return (
                    <motion.div
                      key={disaster.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05, type: 'spring', stiffness: 200 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => setSelectedDisaster(disaster.id)}
                      className={`group cursor-pointer relative overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-500 ${
                        isSelected
                          ? 'bg-white/50 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.4)] saturate-100'
                          : 'bg-white/20 border-white/50 hover:border-white/70 hover:bg-white/30 hover:saturate-150 saturate-[0.6]'
                      }`}
                    >
                      <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <img
                          src={disaster.image}
                          alt={disaster.name}
                          className={`w-full h-full object-cover transition-all duration-500 ${
                            isSelected ? 'saturate-125 scale-105' : 'saturate-100 group-hover:saturate-125 group-hover:scale-105'
                          }`}
                        />
                        <div className={`absolute inset-0 transition-all duration-500 ${
                          isSelected ? 'bg-black/10' : 'bg-black/30 group-hover:bg-black/10'
                        }`} />
                      </div>
                      <div className="relative z-10 px-2 py-3">
                        <h4 className={`text-sm font-bold transition-all duration-300 ${
                          isSelected ? 'text-white scale-105' : 'text-white/90 group-hover:text-white'
                        }`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{disaster.name}</h4>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 当前选中的灾害提示 */}
              <motion.div
                key={selectedDisaster || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/35 border border-white/50"
              >
                {selectedDisaster ? (
                  <>
                    <Shield className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-white/90">
                      当前选择：<span className="font-bold text-white">{selectedDisasterData?.name}</span> - {selectedDisasterData?.description}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span className="text-sm text-yellow-200 font-medium">请在上方选择一个灾害类型开始学习</span>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* 课程卡片区域 */}
          <div className="grid md:grid-cols-2 gap-5">
            {courseCards(selectedDisaster).map((course, index) => {
              const Icon = course.icon;
              const isDisabled = !selectedDisaster;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 200 }}
                  {...(isDisabled ? {} : { whileHover: { y: -6, scale: 1.02 } })}
                  onClick={() => handleCardClick(course.href || '/')}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${course.color} backdrop-blur-sm border border-white/40 p-6 text-left transition-all duration-500 ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-40 grayscale hover:border-white/30'
                      : `cursor-pointer ${course.hoverBorder} ${course.hoverShadow}`
                  }`}
                >
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 ${course.iconBg} ${isDisabled ? '' : 'group-hover:scale-110'}`}>
                        <Icon className={`w-7 h-7 transition-colors duration-300 ${course.iconColor} ${isDisabled ? '' : 'group-hover:text-white'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{course.title}</h4>
                        <p className="text-base text-white/90 leading-relaxed" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>{course.description}</p>
                      </div>
                    </div>
                    {isDisabled ? (
                      <div className="w-full mt-4 bg-white/10 text-white/50 border border-white/20 rounded-lg py-2.5 px-4 text-center text-sm font-medium cursor-not-allowed">
                        <span className="flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          请先选择灾难主题
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(course.href || '/');
                        }}
                        className="w-full mt-4 bg-white/25 hover:bg-white/35 text-white border border-white/40 gap-2"
                      >
                        进入学习
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* 未选择灾难主题提示弹窗 */}
      <AnimatePresence>
        {showDisasterPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDisasterPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-100 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDisasterPrompt(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">请先选择灾难主题</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                请在上方选择一个自然灾害类型后，再进入对应的课程模块学习
              </p>
              <Button
                onClick={() => setShowDisasterPrompt(false)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-2.5 shadow-lg shadow-red-200"
              >
                我知道了
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
