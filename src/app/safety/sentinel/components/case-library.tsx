/**
 * 模块三：领导力案例智库
 * 将国内外重大突发事件转化为可交互的推演脚本
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Filter, Play, Clock, MapPin,
  AlertTriangle, TrendingUp, ChevronRight, FileText,
  Plus, ExternalLink, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { realDisasterCases, type RealDisasterCase } from '@/lib/real-disaster-cases';

interface CaseLibraryProps {
  onSelectCase: (caseData: RealDisasterCase) => void;
}

type CaseFilter = 'all' | 'explosion' | 'flood' | 'earthquake' | 'forest_fire' | 'chemical';
type DifficultyFilter = 'all' | 'basic' | 'intermediate' | 'advanced';

const typeLabels: Record<string, string> = {
  explosion: '爆炸事故',
  flood: '洪涝灾害',
  earthquake: '地震灾害',
  forest_fire: '森林火灾',
  chemical: '危化品事故',
  fire: '火灾事故',
};

const typeColors: Record<string, string> = {
  explosion: 'bg-red-500',
  flood: 'bg-blue-500',
  earthquake: 'bg-amber-500',
  forest_fire: 'bg-orange-500',
  chemical: 'bg-purple-500',
  fire: 'bg-red-400',
};

export default function CaseLibrary({ onSelectCase }: CaseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CaseFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [selectedCase, setSelectedCase] = useState<RealDisasterCase | null>(null);

  const filteredCases = useMemo(() => {
    return realDisasterCases.filter(c => {
      const matchesSearch = !searchQuery ||
        c.name.includes(searchQuery) ||
        c.location.name.includes(searchQuery) ||
        c.description.includes(searchQuery);
      const matchesType = typeFilter === 'all' || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  const getDifficulty = (caseData: RealDisasterCase): { level: string; label: string; color: string } => {
    const dpCount = caseData.decisionPoints.length;
    if (dpCount >= 4) return { level: 'advanced', label: '高级', color: 'text-red-400 border-red-400' };
    if (dpCount >= 2) return { level: 'intermediate', label: '中级', color: 'text-amber-400 border-amber-400' };
    return { level: 'basic', label: '初级', color: 'text-emerald-400 border-emerald-400' };
  };

  return (
    <div className="h-full bg-slate-50 text-slate-800 flex flex-col">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">领导力案例智库</h1>
              <p className="text-xs text-slate-500">基于真实事件的决策训练素材库</p>
            </div>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {realDisasterCases.length} 个案例
          </Badge>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索案例名称、地点..."
              className="pl-9 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'explosion', 'flood', 'earthquake', 'forest_fire', 'chemical'] as CaseFilter[]).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  typeFilter === type
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {type === 'all' ? '全部' : typeLabels[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 案例列表 */}
        <div className={`${selectedCase ? 'w-1/2' : 'w-full'} overflow-y-auto p-4 space-y-3 transition-all`}>
          {filteredCases.map((caseData, idx) => {
            const difficulty = getDifficulty(caseData);
            return (
              <motion.div
                key={caseData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all ${
                    selectedCase?.id === caseData.id ? 'border-indigo-400 ring-1 ring-indigo-200' : ''
                  }`}
                  onClick={() => setSelectedCase(caseData)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${typeColors[caseData.type] || 'bg-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-800 truncate">{caseData.name}</h3>
                          <Badge variant="outline" className={`text-xs ${difficulty.color}`}>
                            {difficulty.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{caseData.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {caseData.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {caseData.location.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {caseData.casualties.deaths}人遇难
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {caseData.decisionPoints.length}个决策点
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectCase(caseData);
                        }}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        推演
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 案例详情 */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2 border-l border-slate-800 overflow-y-auto p-4"
            >
              <CaseDetail caseData={selectedCase} onStart={() => onSelectCase(selectedCase)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const difficultyColorLight: Record<string, string> = {
  advanced: 'text-red-600 border-red-400',
  intermediate: 'text-amber-600 border-amber-400',
  basic: 'text-emerald-600 border-emerald-400',
};

function CaseDetail({ caseData, onStart }: { caseData: RealDisasterCase; onStart: () => void }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'timeline' | 'decisions' | 'lessons'>('overview');

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`${typeColors[caseData.type] || 'bg-slate-400'} text-white`}>
            {typeLabels[caseData.type]}
          </Badge>
          <Badge variant="outline" className="border-red-400 text-red-600">
            {caseData.severity === 'critical' ? '特别重大' : caseData.severity === 'high' ? '重大' : '较大'}
          </Badge>
        </div>
        <h2 className="text-lg font-bold text-slate-800">{caseData.name}</h2>
        <p className="text-xs text-slate-500 mt-1">{caseData.date} · {caseData.location.name}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
          <p className="text-xl font-bold text-red-500">{caseData.casualties.deaths}</p>
          <p className="text-xs text-slate-400">遇难</p>
        </div>
        <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
          <p className="text-xl font-bold text-amber-500">{caseData.casualties.injuries}</p>
          <p className="text-xs text-slate-400">受伤</p>
        </div>
        <div className="p-3 rounded-lg bg-white border border-slate-200 text-center">
          <p className="text-xl font-bold text-emerald-500">{caseData.decisionPoints.length}</p>
          <p className="text-xs text-slate-400">决策点</p>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="flex gap-1">
        {(['overview', 'timeline', 'decisions', 'lessons'] as const).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              activeSection === section
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {section === 'overview' && '概览'}
            {section === 'timeline' && '时间线'}
            {section === 'decisions' && '决策点'}
            {section === 'lessons' && '教训'}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div className="space-y-3">
        {activeSection === 'overview' && (
          <>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">事故描述</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{caseData.description}</p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">周边设施</h4>
              <div className="space-y-1.5">
                {caseData.facilities.slice(0, 5).map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-700">{f.name}</span>
                    <span className="text-slate-400">({f.type === 'hospital' ? '医院' : f.type === 'fire_station' ? '消防站' : f.type === 'shelter' ? '避难所' : '其他'})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">救援力量</h4>
              <div className="space-y-1.5">
                {caseData.rescueForces.slice(0, 5).map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-700">{f.name}</span>
                    {f.arrivalTime && <span className="text-slate-400">到达: {f.arrivalTime}</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === 'timeline' && (
          <div className="space-y-2">
            {caseData.timeline.map((tl, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  {idx < caseData.timeline.length - 1 && <div className="w-px h-full bg-slate-300 mt-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-600">{tl.time}</span>
                    {tl.source && <span className="text-xs text-slate-400">({tl.source})</span>}
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{tl.event}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'decisions' && (
          <div className="space-y-3">
            {caseData.decisionPoints.map((dp, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">决策点 {idx + 1}</Badge>
                  <span className="text-xs text-slate-400">{dp.time}</span>
                </div>
                <p className="text-xs text-slate-700 mb-2">{dp.description}</p>
                <div className="space-y-1">
                  {dp.options.map((opt, oi) => (
                    <div key={oi} className="flex items-start gap-2 text-xs">
                      <ChevronRight className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-700">{opt}</span>
                        <span className="text-slate-400 ml-2">→ {dp.consequences[oi]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'lessons' && (
          <div className="space-y-2">
            {caseData.lessons.map((lesson, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-xs font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                <p className="text-xs text-slate-700">{lesson}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 开始推演按钮 */}
      <Button
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        onClick={onStart}
      >
        <Play className="w-4 h-4 mr-2" />
        开始推演此案例
      </Button>
    </div>
  );
}

// 导入Shield图标
import { Shield } from 'lucide-react';
