'use client';

import { useState, Suspense } from 'react';
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
  XCircle,
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

function CommandCourseContent() {
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

        {/* 响应级别标签 */}
        <div className="flex justify-center gap-3 mb-8">
          {levels.map((level, index) => (
            <button
              key={level.level}
              onClick={() => { setActiveLevelIndex(index); setSelectedDept(null); }}
              className={`px-5 py-2.5 text-sm font-bold border-2 transition-all ${
                index === activeLevelIndex
                  ? `${colors.tabActive} scale-105`
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
              style={{ borderRadius: '0', boxShadow: index === activeLevelIndex ? '3px 3px 0 0 #000' : 'none' }}
            >
              {levelLabels[level.level]} · {level.label}
            </button>
          ))}
        </div>

        {activeTab === 'simulation' && disaster === 'flood' && <SimulationDrill disaster={disaster} disasterName={disasterName} />}
        {activeTab === 'simulation' && disaster !== 'flood' && (
          <div className="border-2 border-black bg-white p-12 text-center" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-black text-gray-900 mb-2">功能开发中</h3>
            <p className="text-gray-500">{disasterName}模拟演练功能正在开发中，敬请期待！</p>
          </div>
        )}
        {activeTab === 'test' && <TestTab disaster={disaster} disasterName={disasterName} />}
        {activeTab === 'interaction' && (
          <div className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900">
            <QuizInteractiveContent disasterName={disasterName} />
          </div>
        )}
      </div>
    </div>
  );
}

// AI测试 Tab
interface TestQuestion {
  id: string;
  type: 'single' | 'true_false';
  question: string;
  options: { id: string; label: string; text: string }[];
  correctAnswer: string;
  score: number;
  explanation: string;
}

interface TestResult {
  score: number;
  totalScore: number;
  answers: { 
    questionId: string; 
    question: string;
    userAnswer: string; 
    userAnswerText: string;
    correctAnswer: string; 
    correctAnswerText: string;
    isCorrect: boolean; 
    score: number;
    explanation: string;
  }[];
  completedAt: Date;
}

function TestTab({ disaster, disasterName }: { disaster: string; disasterName: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testGenerated, setTestGenerated] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const generateTest = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const questionsForDisaster = disasterTestQuestions[disasterName];
    if (!questionsForDisaster || questionsForDisaster.length === 0) {
      // Fallback to generic questions if no specific questions available
      setIsGenerating(false);
      return;
    }

    const generatedQuestions: TestQuestion[] = questionsForDisaster.map(q => ({
      ...q,
      type: q.type as 'single' | 'true_false',
    }));

    setTestQuestions(generatedQuestions);
    setTestGenerated(true);
    setIsGenerating(false);
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let totalScore = 0;
    const answerDetails = testQuestions.map(q => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = userAnswer === q.correctAnswer;
      const score = isCorrect ? q.score : 0;
      totalScore += score;
      const userOption = q.options.find(o => o.id === userAnswer);
      const correctOption = q.options.find(o => o.id === q.correctAnswer);
      return { 
        questionId: q.id, 
        question: q.question,
        userAnswer, 
        userAnswerText: userOption?.text || '未作答',
        correctAnswer: q.correctAnswer, 
        correctAnswerText: correctOption?.text || '',
        isCorrect, 
        score,
        explanation: q.explanation,
      };
    });
    setResult({ score: totalScore, totalScore: 100, answers: answerDetails, completedAt: new Date() });
  };

  const handleRetry = () => {
    setTestGenerated(false);
    setTestQuestions([]);
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);
  };

  if (isGenerating) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
        <div className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-pulse" />
          <h3 className="text-xl font-black text-gray-900 mb-2">AI正在生成试卷...</h3>
          <p className="text-gray-500">正在根据{disasterName}岗位指挥知识点生成测试题目</p>
        </div>
      </div>
    );
  }

  if (!testGenerated) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 border-b-2 border-black p-6 text-white">
          <h3 className="text-xl font-black flex items-center gap-2">
            <FileText className="w-6 h-6" />
            AI智能测试
          </h3>
          <p className="text-white/90 text-sm mt-1">根据{disasterName}岗位指挥知识点自动生成测试试卷</p>
        </div>
        <div className="p-12 text-center">
          <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-black text-gray-900 mb-2">准备好开始测试了吗？</h4>
          <p className="text-gray-500 mb-6">AI将生成{disasterName}岗位指挥相关的测试试卷，满分100分</p>
          <Button
            onClick={generateTest}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 gap-2 px-8 py-6 text-lg"
            style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
          >
            <Sparkles className="w-5 h-5" />
            生成试卷
          </Button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 border-b-2 border-black p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold ${colors.text} mb-1`}>{activeLevel.label} · {activeLevel.conditionLogic}</h3>
              <p className="text-gray-700 text-sm">{activeLevel.conditions.join('；')}</p>
            </div>
          </div>
        </div>

        {/* 岗位列表或岗位详情 */}
        {selectedDept ? (
          <div className="bg-white border-2 border-black p-6" style={{ borderRadius: '0', boxShadow: '4px 4px 0 0 #000' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${colors.bg} flex items-center justify-center`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedDept.fullName || selectedDept.name}</h2>
                  <p className="text-sm text-gray-500">{selectedDept.description || ''}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleBackToDept}
                className="gap-2 border-2 border-black font-bold bg-white hover:bg-gray-100"
                style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
              >
                <ArrowLeft className="w-4 h-4" />
                返回岗位列表
              </Button>
            </div>

            <div className="space-y-6">
              {/* SOP表格 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  标准作业程序 (SOP)
                </h3>
                <div className="space-y-3">
                  {selectedDept.sopTable.map((sop, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 ${colors.bg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">{sop.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{sop.content}</p>
                          <p className="text-xs text-gray-500 mt-1">触发条件: {sop.threshold}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 来源说明 */}
              {selectedDept.sourceNote && (
                <div className="bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">{selectedDept.sourceNote}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLevel.departments.map((dept) => (
              <button
                key={dept.name}
                onClick={() => handleSelectDept(dept)}
                className="bg-white border-2 border-black p-5 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${colors.bg} flex items-center justify-center`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{dept.fullName || dept.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{dept.description || ''}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dept.sopTable.length} 项SOP</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommandCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <CommandCourseContent />
    </Suspense>
  );
}
