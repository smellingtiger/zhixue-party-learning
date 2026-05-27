'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CommandManualData, DepartmentSOP } from './types';
import { floodCommandManualData } from './flood-command-manual-data';
import { typhoonCommandManualData } from './typhoon-command-manual-data';
import { earthquakeCommandManualData } from './earthquake-command-manual-data';
import { forestFireCommandManualData } from './forest-fire-command-manual-data';
import { coldWaveCommandManualData } from './cold-wave-command-manual-data';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Users,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const levelColors: Record<string, { bg: string; text: string; border: string; light: string; headerBg: string; tabBg: string; tabActive: string }> = {
  IV: {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-600',
    light: 'bg-blue-50',
    headerBg: 'bg-gradient-to-r from-blue-600 to-blue-500',
    tabBg: 'bg-blue-500 border-blue-600 text-white',
    tabActive: 'bg-blue-600 border-blue-700 text-white',
  },
  III: {
    bg: 'bg-yellow-600',
    text: 'text-yellow-600',
    border: 'border-yellow-600',
    light: 'bg-yellow-50',
    headerBg: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
    tabBg: 'bg-yellow-500 border-yellow-600 text-white',
    tabActive: 'bg-yellow-600 border-yellow-700 text-white',
  },
  II: {
    bg: 'bg-orange-600',
    text: 'text-orange-600',
    border: 'border-orange-600',
    light: 'bg-orange-50',
    headerBg: 'bg-gradient-to-r from-orange-600 to-orange-500',
    tabBg: 'bg-orange-500 border-orange-600 text-white',
    tabActive: 'bg-orange-600 border-orange-700 text-white',
  },
  I: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    light: 'bg-red-50',
    headerBg: 'bg-gradient-to-r from-red-600 to-red-500',
    tabBg: 'bg-red-500 border-red-600 text-white',
    tabActive: 'bg-red-600 border-red-700 text-white',
  },
};

const levelLabels: Record<string, string> = {
  IV: 'Ⅳ级',
  III: 'Ⅲ级',
  II: 'Ⅱ级',
  I: 'Ⅰ级',
};

const disasterDataMap: Record<string, CommandManualData> = {
  flood: floodCommandManualData,
  typhoon: typhoonCommandManualData,
  earthquake: earthquakeCommandManualData,
  'forest-fire': forestFireCommandManualData,
  'cold-wave': coldWaveCommandManualData,
};

export default function CommandCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disaster = searchParams.get('disaster') || 'flood';

  const data = disasterDataMap[disaster] || floodCommandManualData;
  const levels = data.responseLevels;

  const [activeLevelIndex, setActiveLevelIndex] = useState(0);
  const [selectedDept, setSelectedDept] = useState<DepartmentSOP | null>(null);

  const activeLevel = levels[activeLevelIndex];
  const colors = levelColors[activeLevel.level];

  const handleSelectDept = (dept: DepartmentSOP) => {
    setSelectedDept(dept);
  };

  const handleBackToDept = () => {
    setSelectedDept(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/safety')}
            className="gap-2 border-2 border-black font-bold bg-white hover:bg-gray-100"
            style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回安全应急培训
          </Button>
        </div>

        {/* 顶部标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <Shield className={`w-8 h-8 ${colors.text}`} />
            <h1 className="text-3xl font-black text-gray-900">岗位指挥操作手册</h1>
            <Shield className={`w-8 h-8 ${colors.text}`} />
          </div>
          <p className="text-gray-600 text-base">
            {data.disasterName}灾害应急 · 分岗位SOP速查手册
          </p>
        </div>

        {/* 第一步：响应等级标签页 */}
        <div className="border-2 border-black bg-white mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="bg-gray-900 border-b-2 border-black px-6 py-3">
            <h2 className="text-white font-black text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              步骤一：选择应急响应等级
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {levels.map((level, idx) => {
                const lc = levelColors[level.level];
                const isActive = idx === activeLevelIndex;
                return (
                  <button
                    key={level.level}
                    onClick={() => { setActiveLevelIndex(idx); setSelectedDept(null); }}
                    className={`border-2 border-black p-4 text-center font-black text-lg transition-all duration-300 ${
                      isActive
                        ? `${lc.tabActive} scale-105`
                        : `${lc.tabBg} opacity-70 hover:opacity-100 hover:scale-102`
                    }`}
                    style={{ borderRadius: '0', boxShadow: isActive ? '4px 4px 0 0 #000' : '2px 2px 0 0 #000' }}
                  >
                    <div className="text-2xl mb-1">{levelLabels[level.level]}</div>
                    <div className="text-sm font-bold">{level.label.replace('级响应', '')}</div>
                    <div className="text-xs mt-1 opacity-80">{level.departments.length}个岗位</div>
                  </button>
                );
              })}
            </div>

            {/* 触发条件 */}
            <div className={`mt-4 border-2 border-black`} style={{ borderRadius: '0' }}>
              <div className={`${colors.headerBg} border-b-2 border-black px-4 py-2 flex items-center gap-2`}>
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="font-black text-white text-sm">触发条件</span>
                <span className="ml-auto bg-white text-black text-xs font-black px-2 py-0.5 border border-black">
                  {activeLevel.conditionLogic}
                </span>
              </div>
              <div className={`p-4 ${colors.light}`}>
                <ul className="space-y-2">
                  {activeLevel.conditions.map((cond, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                      <span className={`${colors.bg} text-white w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 font-black border border-black/30`}>
                        {i + 1}
                      </span>
                      {cond}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 第二步：岗位选择 / 第三步：操作手册 */}
        {!selectedDept ? (
          /* 步骤二：岗位列表 */
          <div className="border-2 border-black bg-white mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className={`${colors.headerBg} border-b-2 border-black px-6 py-3`}>
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                步骤二：选择您的岗位（共{activeLevel.departments.length}个）
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeLevel.departments.map((dept, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectDept(dept)}
                    className={`border-2 border-black p-4 text-left group transition-all duration-300 hover:-translate-y-1 bg-white`}
                    style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-8 h-8 ${colors.bg} text-white font-black flex items-center justify-center text-sm border border-black`}>
                        {idx + 1}
                      </span>
                      {dept.isNew && (
                        <span className="relative group">
                          <span className="text-[11px] font-black bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 border border-black inline-flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEW
                          </span>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 border border-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            本响应等级新增岗位
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="font-black text-sm text-gray-900 group-hover:underline">{dept.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{dept.sopTable.length}项操作指令</div>
                    <div className="flex items-center gap-1 mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className={colors.text + ' font-bold'}>查看手册</span>
                      <ChevronRight className={`w-3 h-3 ${colors.text}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 步骤三：操作手册详情 */
          <div className="border-2 border-black bg-white mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className={`${colors.headerBg} border-b-2 border-black px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Button
                      variant="outline"
                      onClick={handleBackToDept}
                      className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-sm"
                      style={{ borderRadius: '0' }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      返回岗位列表
                    </Button>
                    <span className="text-white/60 text-sm">
                      {levelLabels[activeLevel.level]}响应
                    </span>
                  </div>
                  <h2 className="text-white font-black text-2xl">{selectedDept.name}</h2>
                  <p className="text-white/70 text-sm mt-1">{activeLevel.label} · {selectedDept.sopTable.length}项操作指令</p>
                </div>
              </div>
            </div>

            {/* SOP操作手册表格 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-12">#</th>
                    <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-40">动作</th>
                    <th className="border-2 border-black px-4 py-3 text-left font-black text-sm">执行内容</th>
                    <th className="border-2 border-black px-4 py-3 text-left font-black text-sm w-36">阈值/时限</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDept.sopTable.map((row, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : colors.light} hover:bg-gray-100 transition-colors`}>
                      <td className="border-2 border-black px-4 py-3 text-center font-black text-gray-500">{idx + 1}</td>
                      <td className="border-2 border-black px-4 py-3">
                        <span className={`inline-block ${colors.bg} text-white text-xs font-black px-2 py-1 border border-black`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="border-2 border-black px-4 py-3 text-sm text-gray-800 leading-relaxed">{row.content}</td>
                      <td className="border-2 border-black px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${colors.text}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {row.threshold}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 来源依据 */}
            {selectedDept.sourceNote && (
              <div className="border-t-2 border-gray-200 p-4">
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{selectedDept.sourceNote}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部：权威文献参考 */}
        <div className="border-2 border-black bg-gray-900 text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="bg-gray-800 border-b-2 border-black px-6 py-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-yellow-400" />
            <h3 className="font-black text-sm text-yellow-400">权威文献参考依据</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="w-5 h-5 bg-gray-700 text-gray-400 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 border border-gray-600 group-hover:bg-yellow-600 group-hover:text-white group-hover:border-yellow-500 transition-colors">
                    {i + 1}
                  </span>
                  <span className="group-hover:underline">{ref.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
