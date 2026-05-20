'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { QuizSet, Question, OpenEndedAnswer } from '@/lib/types';
import {
  FileText,
  Clock,
  Lightbulb,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Award,
  BookOpen,
  Target,
  Timer,
  PenTool,
  Eye
} from 'lucide-react';

interface QuizComponentProps {
  quizSet: QuizSet;
  onComplete?: (answers: OpenEndedAnswer[]) => void;
  onExit?: () => void;
}

export function QuizComponent({ quizSet, onComplete, onExit }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [showScoringCriteria, setShowScoringCriteria] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<OpenEndedAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quizSet.timeLimit ? quizSet.timeLimit * 60 : null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentQuestion = quizSet.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizSet.questions.length) * 100;

  // 倒计时
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmitAll();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理答案输入
  const handleAnswerChange = (questionId: string, content: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: content
    }));
  };

  // 切换提示显示
  const toggleHint = (questionId: string) => {
    setShowHints(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // 上一题
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowScoringCriteria(false);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentQuestionIndex < quizSet.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowScoringCriteria(false);
    }
  };

  // 提交所有答案
  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    
    // 模拟AI评分延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const finalAnswers: OpenEndedAnswer[] = quizSet.questions.map(question => ({
      questionId: question.id,
      content: answers[question.id] || '',
      submittedAt: new Date(),
      wordCount: (answers[question.id] || '').length,
      score: Math.floor(Math.random() * 30) + 70, // 模拟分数 70-100
      feedback: generateFeedback(question, answers[question.id] || '')
    }));
    
    setSubmittedAnswers(finalAnswers);
    setIsSubmitting(false);
    onComplete?.(finalAnswers);
  };

  // 生成反馈（模拟）
  const generateFeedback = (question: Question, answer: string): string => {
    const wordCount = answer.length;
    
    if (wordCount < 50) {
      return '回答较为简短,建议进一步展开论述,增加具体案例和深入分析。';
    } else if (wordCount < 200) {
      return '回答基本完整,能够结合理论进行分析。建议增加实践应用方面的思考。';
    } else {
      return '回答详实充分,展现了较好的理论素养和实践思考能力。论述逻辑清晰,观点明确。';
    }
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 获取题型图标
  const getQuestionTypeIcon = (type: Question['type']) => {
    switch (type) {
      case 'essay': return <PenTool className="w-4 h-4" />;
      case 'case_analysis': return <BookOpen className="w-4 h-4" />;
      case 'reflection': return <Eye className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // 已提交结果视图
  if (submittedAnswers.length > 0) {
    const totalScore = submittedAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = Math.round(totalScore / submittedAnswers.length);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">考核完成！</h2>
          <p className="text-slate-600">您已成功完成本次AI智能组课考核</p>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">{averageScore}</div>
              <div className="text-sm text-slate-500">平均得分</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{submittedAnswers.length}</div>
              <div className="text-sm text-slate-500">完成题数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {Math.round(submittedAnswers.reduce((sum, a) => sum + a.wordCount, 0) / submittedAnswers.length)}
              </div>
              <div className="text-sm text-slate-500">平均字数</div>
            </div>
          </div>
        </motion.div>

        <Card className="border-0 shadow-lg mt-8">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              答题详情与反馈
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {quizSet.questions.map((question, index) => {
              const answer = submittedAnswers.find(a => a.questionId === question.id);
              
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        第{index + 1}题
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {getQuestionTypeIcon(question.type)}
                        <span className="text-sm font-medium text-slate-600">
                          {question.type === 'open_ended' ? '开放问答' :
                           question.type === 'essay' ? '论述写作' :
                           question.type === 'case_analysis' ? '案例分析' : '学习反思'}
                        </span>
                      </div>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty === 'easy' ? '基础' :
                         question.difficulty === 'medium' ? '进阶' : '挑战'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">{answer?.score || 0}</span>
                      <span className="text-sm text-slate-500">/ {question.maxScore}分</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-800">{question.title}</div>

                  {answer && answer.content && (
                    <div className="bg-slate-50 rounded p-3">
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        您的回答 ({answer.wordCount}字)
                      </div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">
                        {answer.content}
                      </div>
                    </div>
                  )}

                  {answer?.feedback && (
                    <div className="bg-blue-50 rounded p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 mb-1 flex items-center gap-2">
                        <Lightbulb className="w-3 h-3" />
                        AI智能评语
                      </div>
                      <div className="text-sm text-blue-800">{answer.feedback}</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onExit} className="gap-2">
            返回学习
          </Button>
          <Button 
            onClick={() => window.print()} 
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 gap-2"
          >
            <FileText className="w-4 h-4" />
            打印成绩单
          </Button>
        </div>
      </div>
    );
  }

  // 答题界面
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 头部信息 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Target className="w-7 h-7" />
              {quizSet.title}
            </h1>
            <p className="text-white/90 text-sm">{quizSet.description}</p>
          </div>
          
          {onExit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmation(true)}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              退出考核
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              <span>总题数</span>
            </div>
            <div className="text-2xl font-bold mt-1">{quizSet.questions.length}</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4" />
              <span>总分</span>
            </div>
            <div className="text-2xl font-bold mt-1">{quizSet.totalScore}</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>用时</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {timeRemaining !== null ? formatTime(timeRemaining) : '不限时'}
            </div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>进度</span>
            </div>
            <div className="text-2xl font-bold mt-1">{currentQuestionIndex + 1}/{quizSet.questions.length}</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <Progress value={progress} className="h-2 bg-white/30" />
        </div>
      </motion.div>

      {/* 题目卡片 */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          {/* 题目头部 */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white px-3 py-1 text-base font-bold">
                {currentQuestion.title}
              </Badge>
              <div className="flex items-center gap-2">
                {getQuestionTypeIcon(currentQuestion.type)}
                <Badge variant="outline" className="text-slate-600">
                  {currentQuestion.type === 'open_ended' ? '开放问答' :
                   currentQuestion.type === 'essay' ? '论述写作' :
                   currentQuestion.type === 'case_analysis' ? '案例分析' : '学习反思'}
                </Badge>
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty === 'easy' ? '基础' :
                   currentQuestion.difficulty === 'medium' ? '进阶' : '挑战'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentQuestion.timeLimit && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Timer className="w-4 h-4" />
                  建议用时：{currentQuestion.timeLimit}分钟
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScoringCriteria(!showScoringCriteria)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Target className="w-4 h-4 mr-1" />
                评分标准
              </Button>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* 题目背景 */}
            {currentQuestion.context && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-blue-800 mb-1">背景知识</div>
                    <div className="text-sm text-blue-700 leading-relaxed">
                      {currentQuestion.context}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 题目内容 */}
            <div className="space-y-3">
              <div className="text-lg font-semibold text-slate-900 leading-relaxed">
                {currentQuestion.content}
              </div>
            </div>

            {/* 评分标准展示 */}
            <AnimatePresence>
              {showScoringCriteria && currentQuestion.scoringCriteria && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-900">评分标准</span>
                      <Badge variant="outline" className="ml-auto text-amber-700">
                        总分: {currentQuestion.maxScore}分
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3">
                      {currentQuestion.scoringCriteria.dimensions.map((dimension, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-white/60 rounded p-3">
                          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800 text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-amber-900">{dimension.name}</span>
                              <Badge variant="outline" className="text-xs text-amber-700">
                                权重:{Math.round(dimension.weight * 100)}%
                              </Badge>
                              <span className="text-sm font-bold text-amber-700 ml-auto">
                                {dimension.maxPoints}分
                              </span>
                            </div>
                            <div className="text-xs text-amber-700">{dimension.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 提示按钮和内容 */}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleHint(currentQuestion.id)}
                  className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHints[currentQuestion.id] ? '收起提示' : `查看提示 (${currentQuestion.hints.length}条)`}
                </Button>
                
                <AnimatePresence>
                  {showHints[currentQuestion.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {currentQuestion.hints.map((hint, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                              <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              {hint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 答案输入区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  您的回答
                </label>
                <span className="text-sm text-slate-500">
                  {(answers[currentQuestion.id] || '').length} 字
                  {(answers[currentQuestion.id] || '').length < 50 && (
                    <span className="text-amber-600 ml-2">(建议至少50字)</span>
                  )}
                </span>
              </div>
              
              <Textarea
                ref={textareaRef}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="请在此输入您的回答...&#10;&#10;提示：&#10;• 结合理论知识进行阐述&#10;• 联系实际工作谈体会&#10;• 注重逻辑性和完整性"
                className="min-h-[250px] resize-y border-2 focus:border-red-400 focus:ring-red-400 text-base leading-relaxed"
              />

              {/* 快捷操作 */}
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <button
                  onClick={() => {
                    navigator.clipboard.readText().then(text => {
                      handleAnswerChange(currentQuestion.id, (answers[currentQuestion.id] || '') + text);
                    });
                  }}
                  className="hover:text-slate-700 flex items-center gap-1"
                >
                  粘贴文本
                </button>
                <span>·</span>
                <span>支持快捷键 Ctrl+V 粘贴</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          上一题
        </Button>

        <div className="flex items-center gap-2">
          {quizSet.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-red-600 text-white scale-110'
                  : answers[quizSet.questions[idx].id]
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex < quizSet.questions.length - 1 ? (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 gap-2"
          >
            下一题
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={!answers[currentQuestion.id]?.trim()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
          >
            <Send className="w-4 h-4" />
            提交全部答案
          </Button>
        )}
      </div>

      {/* 确认对话框 */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900">
                  {currentQuestionIndex === quizSet.questions.length - 1 ? '确认提交？' : '确认退出？'}
                </h3>
                
                <p className="text-slate-600 text-sm">
                  {currentQuestionIndex === quizSet.questions.length - 1 
                    ? `您已完成 ${Object.keys(answers).length}/${quizSet.questions.length} 道题目，提交后将无法修改。`
                    : '您有未完成的题目，退出后进度将不会保存。'
                  }
                </p>

                {currentQuestionIndex === quizSet.questions.length - 1 && (
                  <div className="bg-slate-50 rounded-lg p-3 text-left text-sm space-y-2">
                    <div className="font-medium text-slate-700">答题统计：</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>✅ 已作答：{Object.keys(answers).length} 题</div>
                      <div>⏳ 未作答：{quizSet.questions.length - Object.keys(answers).length} 题</div>
                      <div>📝 总字数：{Object.values(answers).reduce((sum, a) => sum + a.length, 0)} 字</div>
                      <div>⏱️ 用时：{timeRemaining !== null ? formatTime((quizSet.timeLimit! * 60) - timeRemaining!) : '--'}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1"
                  >
                    继续答题
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirmation(false);
                      if (currentQuestionIndex === quizSet.questions.length - 1) {
                        handleSubmitAll();
                      } else {
                        onExit?.();
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {currentQuestionIndex === quizSet.questions.length - 1 ? '确认提交' : '确认退出'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 加载状态 */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="border-0 shadow-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">正在批改...</h3>
                <p className="text-slate-600 text-sm">
                  AI正在分析您的答案并生成个性化反馈，请稍候
                </p>
                <Progress value={66} className="h-2" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuizComponent;
