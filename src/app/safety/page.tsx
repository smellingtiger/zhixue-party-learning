'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Shield,
  BookOpen,
  Users,
  Route,
  CheckCircle,
  Truck,
  ArrowRight,
  AlertTriangle,
  X,
  Cloud,
  Flame,
  Activity,
  Lock,
} from 'lucide-react';

const disasterCategories = [
  {
    id: 'natural',
    name: '自然灾害',
    icon: Cloud,
    color: 'from-blue-600 to-cyan-500',
    border: 'border-blue-400/60',
    bg: 'bg-blue-500/20',
    disasters: [
      { id: 'typhoon', name: '台风', image: '/knowledge-images/台风.png', description: '台风防御与应对' },
      { id: 'flood', name: '洪涝', image: '/knowledge-images/内涝.png', description: '洪涝灾害防御' },
      { id: 'earthquake', name: '地震', image: '/knowledge-images/地震.png', description: '地震应急避险知识' },
      { id: 'landslide', name: '滑坡泥石流', image: '/knowledge-images/滑坡泥石流.jpg', description: '地质灾害防范' },
      { id: 'cold-wave', name: '寒潮', image: '/knowledge-images/寒潮.png', description: '寒潮防护与应对' },
      { id: 'drought', name: '干旱', image: '/knowledge-images/干旱.jpg', description: '干旱灾害应对' },
      { id: 'forest-fire', name: '森林火灾', image: '/knowledge-images/火灾.png', description: '森林火灾预防与扑救' },
    ],
  },
  {
    id: 'accident',
    name: '事故灾难',
    icon: Flame,
    color: 'from-orange-600 to-red-500',
    border: 'border-orange-400/60',
    bg: 'bg-orange-500/20',
    disasters: [
      { id: 'fire', name: '火灾', image: '/knowledge-images/火灾事故.jpg', description: '火灾预防与逃生' },
      { id: 'chemical', name: '危化品事故', image: '/knowledge-images/危险品事故.jpg', description: '危险化学品安全' },
      { id: 'traffic', name: '交通事故', image: '/knowledge-images/交通事故.png', description: '交通安全应急' },
      { id: 'mine', name: '矿山事故', image: '/knowledge-images/矿山事故.png', description: '矿山安全应急' },
      { id: 'construction', name: '建筑坍塌', image: '/knowledge-images/建筑坍塌.png', description: '建筑施工安全' },
      { id: 'power', name: '大面积停电', image: '/knowledge-images/大面积停电.png', description: '电力应急响应' },
      { id: 'pollution', name: '环境污染', image: '/knowledge-images/环境污染.png', description: '环境污染应急' },
    ],
  },
  {
    id: 'public-health',
    name: '公共卫生事件',
    icon: Activity,
    color: 'from-red-600 to-pink-500',
    border: 'border-red-400/60',
    bg: 'bg-red-500/20',
    disasters: [
      { id: 'epidemic', name: '传染病疫情', image: '/knowledge-images/传染病疫情.png', description: '传染病防控' },
      { id: 'food-safety', name: '食品安全', image: '/knowledge-images/食品安全.png', description: '食品安全应急' },
      { id: 'animal-epidemic', name: '动物疫情', image: '/knowledge-images/动物疫情.png', description: '动物疫情防控' },
      { id: 'occupational', name: '职业中毒', image: '/knowledge-images/职业中毒.png', description: '职业卫生安全' },
      { id: 'drug-safety', name: '药品安全', image: '/knowledge-images/药品安全.png', description: '药品安全应急' },
    ],
  },
  {
    id: 'social-security',
    name: '社会安全事件',
    icon: Lock,
    color: 'from-purple-600 to-indigo-500',
    border: 'border-purple-400/60',
    bg: 'bg-purple-500/20',
    disasters: [
      { id: 'terrorist', name: '恐怖袭击', image: '/knowledge-images/恐怖袭击.png', description: '反恐应急处置' },
      { id: 'cyber-attack', name: '网络安全', image: '/knowledge-images/网络安全.png', description: '网络安全事件' },
      { id: 'stampede', name: '踩踏事故', image: '/knowledge-images/踩踏事件.png', description: '公共场所安全' },
      { id: 'economic', name: '经济安全', image: '/knowledge-images/经济安全.png', description: '经济风险防范' },
    ],
  },
];

const allDisasters = disasterCategories.flatMap(cat => cat.disasters.map(d => ({ ...d, category: cat.id, categoryName: cat.name })));

const courseCards = (selectedDisasterId: string) => [
  {
    id: 'knowledge-intro',
    title: '通识教育',
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
    title: '岗位指挥',
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
    id: 'dispatch-plan',
    title: '调度方案',
    description: '科学制定应急调度方案，合理调配资源，确保救援工作高效有序进行',
    icon: Route,
    color: 'from-blue-600 via-blue-500 to-cyan-500',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    hoverBorder: 'hover:border-blue-300/80',
    iconBg: 'bg-blue-500/40',
    iconColor: 'text-blue-200',
    href: (() => {
      const paths: Record<string, string> = {
        flood: '/safety/dispatch-plan?disaster=flood',
        typhoon: '/safety/dispatch-plan?disaster=typhoon',
        earthquake: '/safety/dispatch-plan?disaster=earthquake',
        'forest-fire': '/safety/dispatch-plan?disaster=forest-fire',
        'cold-wave': '/safety/dispatch-plan?disaster=cold-wave',
      };
      return paths[selectedDisasterId] || '/safety/dispatch-plan?disaster=flood';
    })(),
  },
  {
    id: 'decision-response',
    title: '决策响应',
    description: '基于灾情分析和态势感知，快速响应并做出科学决策，有效控制灾情发展',
    icon: CheckCircle,
    color: 'from-orange-600/80 via-orange-500/70 to-yellow-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    hoverBorder: 'hover:border-orange-300/60',
    iconBg: 'bg-orange-500/30',
    iconColor: 'text-orange-300',
    href: (() => {
      const paths: Record<string, string> = {
        flood: '/safety/decision-response?disaster=flood',
        typhoon: '/safety/decision-response?disaster=typhoon',
        earthquake: '/safety/decision-response?disaster=earthquake',
        'forest-fire': '/safety/decision-response?disaster=forest-fire',
        'cold-wave': '/safety/decision-response?disaster=cold-wave',
      };
      return paths[selectedDisasterId] || '/safety/decision-response?disaster=flood';
    })(),
  },
  {
    id: 'logistics-support',
    title: '后勤保障',
    description: '全面统筹物资储备、运输保障与后勤服务，为应急救援提供坚实后盾',
    icon: Truck,
    color: 'from-red-600/90 via-orange-500/80 to-yellow-500/70',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(248,113,113,0.4)]',
    hoverBorder: 'hover:border-red-300/60',
    iconBg: 'bg-red-500/30',
    iconColor: 'text-red-200',
    href: (() => {
      const paths: Record<string, string> = {
        flood: '/safety/logistics-support?disaster=flood',
        typhoon: '/safety/logistics-support?disaster=typhoon',
        earthquake: '/safety/logistics-support?disaster=earthquake',
        'forest-fire': '/safety/logistics-support?disaster=forest-fire',
        'cold-wave': '/safety/logistics-support?disaster=cold-wave',
      };
      return paths[selectedDisasterId] || '/safety/logistics-support?disaster=flood';
    })(),
  },
];

export default function SafetyPage() {
  const router = useRouter();
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [showDisasterPrompt, setShowDisasterPrompt] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const selectedDisasterData = allDisasters.find(d => d.id === selectedDisaster);

  const handleNavigateWithDisaster = (href: string) => {
    router.push(href);
  };

  const handleCardClick = (href: string) => {
    if (!selectedDisaster) {
      setShowDisasterPrompt(true);
      return;
    }
    handleNavigateWithDisaster(href);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100">
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
                  <h3 className="text-xl font-bold text-white">突发事件应急培训 · 四大类课程模块</h3>
                  <Shield className="w-5 h-5 text-yellow-300" />
                </div>
                <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
                  按照我国突发事件应急管理体系，涵盖自然灾害、事故灾难、公共卫生事件、社会安全事件四大类，提供系统化的培训课程
                </p>
              </motion.div>

              {/* 可折叠的灾害分类 */}
              {disasterCategories.map((category, catIdx) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;
                const hasSelected = category.disasters.some(d => d.id === selectedDisaster);
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + catIdx * 0.05 }}
                    className="mb-3"
                  >
                    {/* 分类标题按钮 */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        isExpanded
                          ? 'bg-white/30 border-white/70 shadow-lg'
                          : 'bg-white/20 border-white/40 hover:bg-white/25'
                      } ${hasSelected && !isExpanded ? 'border-yellow-300/60 bg-yellow-300/10' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-br ${category.color} ${isExpanded ? 'scale-110' : ''}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`text-base font-bold transition-colors ${
                          isExpanded ? 'text-white' : hasSelected ? 'text-yellow-300' : 'text-white/80'
                        }`}>{category.name}</h4>
                        <p className="text-xs text-white/60">{category.disasters.length} 种灾害类型</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 text-white/70"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </motion.div>
                    </button>

                    {/* 展开的灾害卡片 */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 pb-1">
                            <div className="grid grid-cols-7 gap-3">
                              {category.disasters.map((disaster, index) => {
                                const isSelected = selectedDisaster === disaster.id;
                                return (
                                  <motion.div
                                    key={disaster.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
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
                                      <h5 className={`text-sm font-bold transition-all duration-300 ${
                                        isSelected ? 'text-white scale-105' : 'text-white/90 group-hover:text-white'
                                      }`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{disaster.name}</h5>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

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
                      当前选择：<span className="font-bold text-white">{selectedDisasterData?.name}</span>（{selectedDisasterData?.categoryName}）- {selectedDisasterData?.description}
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
                请在上方选择一个灾害类型后，再进入对应的课程模块学习
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
