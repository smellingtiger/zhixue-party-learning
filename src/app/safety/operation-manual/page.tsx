'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { manualDataMap, disasterNames, type DisasterType } from '../command-manual-data';
import type { ResponseLevel } from '../command-course/types';

const levelColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  'IV级响应': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-500' },
  'III级响应': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-500' },
  'II级响应': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-500' },
  'I级响应': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-500' },
};

function buildTextContent(disasterName: string, data: ResponseLevel): string {
  const sep = '='.repeat(67);
  const subSep = '-'.repeat(67);
  const lines: string[] = [];

  lines.push(sep);
  lines.push(`  ${disasterName} - ${data.label} 岗位操作手册`);
  lines.push(`        应急响应标准操作程序`);
  lines.push(sep);
  lines.push('');
  lines.push(`灾害类型：${disasterName}`);
  lines.push(`响应等级：${data.label}`);
  lines.push(`启动条件：${data.conditionLogic}`);
  lines.push('');
  lines.push(subSep);
  lines.push('响应启动条件');
  lines.push(subSep);
  data.conditions.forEach((c, i) => {
    lines.push(`${i + 1}. ${c}`);
  });
  lines.push('');

  data.departments.forEach((dept, deptIdx) => {
    lines.push(subSep);
    lines.push(`${deptIdx + 1}. ${dept.name}`);
    lines.push(subSep);
    if (dept.sourceNote) {
      lines.push(`来源说明：${dept.sourceNote}`);
    }
    lines.push('');
    lines.push('序号  动作    操作内容                                                  阈值/时限');
    dept.sopTable.forEach((action, idx) => {
      const num = String(idx + 1).padEnd(4);
      const act = action.action.padEnd(6);
      lines.push(`${num} ${act}  ${action.content}                                    ${action.threshold}`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

function buildMarkdownContent(disasterName: string, data: ResponseLevel): string {
  const lines: string[] = [];

  lines.push(`# ${disasterName} - ${data.label} 岗位操作手册`);
  lines.push('');
  lines.push('## 基本信息');
  lines.push('');
  lines.push(`| 项目 | 内容 |`);
  lines.push(`|------|------|`);
  lines.push(`| 灾害类型 | ${disasterName} |`);
  lines.push(`| 响应等级 | ${data.label} |`);
  lines.push(`| 启动条件 | ${data.conditionLogic} |`);
  lines.push('');
  lines.push('## 响应启动条件');
  lines.push('');
  data.conditions.forEach((c, i) => {
    lines.push(`${i + 1}. ${c}`);
  });
  lines.push('');

  data.departments.forEach((dept, deptIdx) => {
    lines.push('');
    lines.push(`## ${deptIdx + 1}. ${dept.name}`);
    lines.push('');
    if (dept.sourceNote) {
      lines.push(`> ${dept.sourceNote}`);
      lines.push('');
    }
    lines.push(`| 序号 | 动作 | 操作内容 | 阈值/时限 |`);
    lines.push(`|------|------|----------|-----------|`);
    dept.sopTable.forEach((action, idx) => {
      lines.push(`| ${idx + 1} | ${action.action} | ${action.content} | ${action.threshold} |`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

export default function OperationManualPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disaster = (searchParams.get('disaster') as DisasterType) || 'flood';
  const disasterName = disasterNames[disaster] || '防汛';
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const manualData = manualDataMap[disaster];
  const levels = manualData?.responseLevels || [];

  useEffect(() => {
    if (levels.length > 0 && !selectedLevel) {
      setSelectedLevel(levels[0].label);
    }
  }, [levels, selectedLevel]);

  const currentLevelData = levels.find(l => l.label === selectedLevel);
  const levelColor = levelColors[selectedLevel] || levelColors['IV级响应'];

  const handleDownload = () => {
    if (!currentLevelData) return;
    const baseName = `${disasterName}_${currentLevelData.label}_操作手册`;

    const downloadFile = (content: string, fileName: string, mime: string) => {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    downloadFile(
      buildTextContent(disasterName, currentLevelData),
      `${baseName}.txt`,
      'text/plain;charset=utf-8'
    );

    downloadFile(
      buildMarkdownContent(disasterName, currentLevelData),
      `${baseName}.md`,
      'text/markdown;charset=utf-8'
    );
  };

  if (!currentLevelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sky-800 text-xl font-medium">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/safety/command-course?disaster=' + disaster)}
              className="flex items-center gap-1.5 px-4 py-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>

            <div className="flex items-center gap-3">
              <select
                value={disaster}
                onChange={(e) => router.push(`/safety/operation-manual?disaster=${e.target.value}`)}
                className="px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-sm text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
              >
                {Object.entries(disasterNames).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>

              {levels.length > 0 && (
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-sm text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
                >
                  {levels.map(level => (
                    <option key={level.label} value={level.label}>{level.label}</option>
                  ))}
                </select>
              )}

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm font-medium shadow-sm hover:shadow"
              >
                <Download className="w-4 h-4" />
                下载手册
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8 mb-8">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-medium shadow-sm">
              <FileText className="w-4 h-4" />
              {disasterName}岗位操作手册
            </div>
            <div className={`text-3xl font-bold ${levelColor.text}`}>
              {currentLevelData.label}
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-sky-200" />
              <span className="text-sky-400 text-sm">应急响应标准操作程序</span>
              <div className="h-px w-16 bg-gradient-to-r from-sky-200 to-transparent" />
            </div>
            <div className="text-xs text-sky-300">
              Standard Operating Procedure for Emergency Response
            </div>
            <div className="pt-5 border-t border-sky-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-sky-50 rounded-xl px-4 py-3">
                  <div className="text-xs text-sky-400 mb-1">灾害类型</div>
                  <div className="text-sm font-semibold text-sky-800">{disasterName}</div>
                </div>
                <div className="bg-sky-50 rounded-xl px-4 py-3">
                  <div className="text-xs text-sky-400 mb-1">响应等级</div>
                  <div className={`text-sm font-semibold ${levelColor.text}`}>{currentLevelData.label}</div>
                </div>
                <div className="bg-sky-50 rounded-xl px-4 py-3">
                  <div className="text-xs text-sky-400 mb-1">启动条件</div>
                  <div className="text-sm font-semibold text-sky-800">{currentLevelData.conditionLogic}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-sky-100">
            <div className="w-1 h-5 bg-sky-400 rounded-full" />
            <h2 className="text-lg font-semibold text-sky-800">响应启动条件</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentLevelData.conditions.map((condition, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
                <div className={`w-6 h-6 rounded-full ${levelColor.badge} text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5`}>
                  {idx + 1}
                </div>
                <span className="text-sm text-sky-700 leading-relaxed">{condition}</span>
              </div>
            ))}
          </div>
        </div>

        {currentLevelData.departments.map((dept, deptIdx) => (
          <div key={deptIdx} className="bg-white rounded-2xl shadow-sm border border-sky-100 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-sm font-bold">
                  {deptIdx + 1}
                </div>
                <h3 className="text-white font-semibold text-base">{dept.name}</h3>
              </div>
              {dept.sourceNote && (
                <p className="text-white/80 text-xs mt-2 ml-11">{dept.sourceNote}</p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-sky-50">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-sky-500 w-16">序号</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-sky-500 w-28">动作</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-sky-500">操作内容</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-sky-500 w-28">阈值/时限</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.sopTable.map((action, actionIdx) => (
                    <tr key={actionIdx} className="border-t border-sky-50 hover:bg-sky-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-sky-400 text-center">{actionIdx + 1}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-xs font-medium">
                          {action.action}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 leading-relaxed">{action.content}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                          {action.threshold}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}