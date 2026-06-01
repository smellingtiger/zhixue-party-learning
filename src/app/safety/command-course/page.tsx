'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Activity, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { disasterTestQuestions, type TestQuestionData } from './test-questions';
import QuizInteractiveContent from '@/components/QuizInteractiveContent';
import SimulationDrill from './simulation-drill';

const disasterNames: Record<string, string> = {
  flood: '防汛',
  typhoon: '防台风',
  earthquake: '防震',
  'forest-fire': '森林防火',
  'cold-wave': '防寒潮',
};

export default function CommandCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const disaster = searchParams.get('disaster') || 'flood';
  const disasterName = disasterNames[disaster] || '防汛';
  const [activeTab, setActiveTab] = useState<'simulation' | 'interaction' | 'test'>('simulation');

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="container mx-auto px-4 py-8">
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-black text-gray-900">{disasterName}岗位指挥</h1>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-base">模拟演练 · 互动答题 · AI测试</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 p-4 border-2 border-black transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-105'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ borderRadius: '0', boxShadow: activeTab === 'simulation' ? '4px 4px 0 0 #000' : '2px 2px 0 0 #000' }}
          >
            <Activity className="w-6 h-6" />
            <span className="font-black text-lg">模拟演练</span>
          </button>
          <button
            onClick={() => setActiveTab('interaction')}
            className={`flex-1 p-4 border-2 border-black transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === 'interaction'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white scale-105'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ borderRadius: '0', boxShadow: activeTab === 'interaction' ? '4px 4px 0 0 #000' : '2px 2px 0 0 #000' }}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="font-black text-lg">互动答题</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 p-4 border-2 border-black transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white scale-105'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ borderRadius: '0', boxShadow: activeTab === 'test' ? '4px 4px 0 0 #000' : '2px 2px 0 0 #000' }}
          >
            <FileText className="w-6 h-6" />
            <span className="font-black text-lg">AI测试</span>
          </button>
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
          <div className="border-2 border-black bg-black overflow-hidden" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
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
              <h3 className="text-2xl font-black">测试完成！</h3>
              <p className="text-white/90 mt-2">{disasterName}岗位指挥 - AI测试</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black">{result.score}分</div>
              <div className="text-sm text-white/80">满分 {result.totalScore} 分</div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border-2 border-green-200">
              <div className="text-3xl font-black text-green-600">{result.answers.filter(a => a.isCorrect).length}</div>
              <div className="text-sm text-green-700 font-bold">答对</div>
            </div>
            <div className="text-center p-4 bg-red-50 border-2 border-red-200">
              <div className="text-3xl font-black text-red-600">{result.answers.filter(a => !a.isCorrect).length}</div>
              <div className="text-sm text-red-700 font-bold">答错</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border-2 border-blue-200">
              <div className="text-3xl font-black text-blue-600">{result.score}分</div>
              <div className="text-sm text-blue-700 font-bold">总分</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-gray-900 text-lg flex items-center gap-2">
              <span>答题详情</span>
            </h4>
            {result.answers.map((detail, idx) => (
              <div key={detail.questionId} className={`border-2 border-black ${detail.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                {/* 题号和对错标记 */}
                <div className={`border-b-2 border-black px-4 py-2 flex items-center justify-between ${detail.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                  <span className="text-white font-black text-sm">第 {idx + 1} 题</span>
                  <span className="text-white font-bold text-sm">
                    {detail.isCorrect ? '✓ 正确' : '✗ 错误'} +{detail.score}分
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  {/* 题目 */}
                  <div className="font-bold text-gray-900 text-sm">{detail.question}</div>
                  
                  {/* 答案对比 */}
                  <div className={`p-3 border-2 border-black ${detail.isCorrect ? 'border-green-600 bg-green-100' : 'border-red-600 bg-red-100'}`}>
                    {!detail.isCorrect ? (
                      <div className="space-y-1 text-sm">
                        <div className="text-red-700">
                          <span className="font-bold">您的答案：</span>
                          <span className="font-bold text-red-600">{detail.userAnswerText}</span>
                        </div>
                        <div className="text-green-700">
                          <span className="font-bold">正确答案：</span>
                          <span className="font-bold text-green-600">{detail.correctAnswerText}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-green-700 text-sm">
                        <span className="font-bold">您的答案：</span>
                        <span className="font-bold text-green-600">{detail.userAnswerText}</span>
                        <span className="ml-2 text-green-500">（正确）</span>
                      </div>
                    )}
                  </div>
                  
                  {/* 答案解析 */}
                  <div className="border-2 border-black bg-blue-50 p-3">
                    <div className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-1">
                      <span>📖 答案解析</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{detail.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t-2 border-gray-200">
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 gap-2"
              style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
            >
              重新测试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 border-b-2 border-black p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <FileText className="w-6 h-6" />
              AI智能测试
            </h3>
            <p className="text-white/90 text-sm mt-1">{disasterName}岗位指挥知识测试</p>
          </div>
          <span className="text-white font-bold">满分100分</span>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {testQuestions.map((question, qIndex) => (
          <div key={question.id} className="border-2 border-black">
            <div className="bg-gray-900 border-b-2 border-black px-4 py-3">
              <span className="text-white font-black">第 {qIndex + 1} 题 · {question.score}分</span>
            </div>
            <div className="p-4">
              <h4 className="text-lg font-bold text-gray-900 mb-4">{question.question}</h4>
              <div className="space-y-3">
                {question.options.map(option => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(question.id, option.id)}
                      className={`w-full p-4 text-left border-2 transition-all flex items-center gap-3 ${
                        isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                      style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        isSelected ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isSelected ? '✓' : option.label}
                      </div>
                      <span className="text-base font-medium text-gray-800">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-center pt-4 border-t-2 border-gray-200">
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 gap-2 px-8 py-6 text-lg"
            style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
            disabled={Object.keys(answers).length < testQuestions.length}
          >
            提交答卷
          </Button>
        </div>
      </div>
    </div>
  );
}
