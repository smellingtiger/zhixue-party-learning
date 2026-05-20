'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  BrainCircuit,
  Target,
  Clock,
  AlertCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { ChapterQuiz, QuizQuestion, QuizResult, QuizOption } from '@/lib/quiz-types';
import { generateAISuggestion } from '@/data/quiz-database';

interface ChapterQuizProps {
  quiz: ChapterQuiz;
  onComplete: (result: QuizResult) => void;
  onRetry?: () => void;
}

export function ChapterQuizComponent({ quiz, onComplete, onRetry }: ChapterQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 300);
  const [isActive, setIsActive] = useState(true);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;

    if (currentQuestion.type === 'multiple') {
      setAnswers(prev => {
        const currentAnswers = (prev[questionId] as string[]) || [];
        if (currentAnswers.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, optionId]
          };
        }
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: optionId
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsActive(false);

    let correctCount = 0;
    const answerDetails = quiz.questions.map(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (Array.isArray(question.correctAnswer)) {
        const userArr = Array.isArray(userAnswer) ? userAnswer : [];
        isCorrect = question.correctAnswer.every(ans => userArr.includes(ans)) &&
                   userArr.length === question.correctAnswer.length;
      } else {
        isCorrect = userAnswer === question.correctAnswer;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        userAnswer: userAnswer || (question.type === 'multiple' ? [] : ''),
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    });

    const wrongQuestions = quiz.questions.filter((_, idx) => !answerDetails[idx].isCorrect);

    const quizResult: QuizResult = {
      score: correctCount,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: quiz.questions.length - correctCount,
      answers: answerDetails,
      aiSuggestion: generateAISuggestion({
        score: correctCount,
        totalQuestions: quiz.questions.length,
        wrongAnswers: wrongQuestions
      }),
      completedAt: new Date()
    };

    setResult(quizResult);
    onComplete(quizResult);
  };

  const getOptionStyle = (option: QuizOption): string => {
    const isSelected = currentQuestion.type === 'multiple'
      ? Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(option.id)
      : answers[currentQuestion.id] === option.id;

    const baseStyle = `w-full p-4 text-left border-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${
      isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
    }`;

    if (!isSubmitted) return baseStyle;

    const isCorrectOption = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.includes(option.id)
      : currentQuestion.correctAnswer === option.id;

    if (isCorrectOption) {
      return 'w-full p-4 text-left border-2 rounded-lg border-green-500 bg-green-50 flex items-center gap-3';
    }

    if (isSelected && !isCorrectOption) {
      return 'w-full p-4 text-left border-2 rounded-lg border-red-500 bg-red-50 flex items-center gap-3';
    }

    return 'w-full p-4 text-left border-2 rounded-lg border-gray-200 bg-gray-50 opacity-50 flex items-center gap-3';
  };

  const getOptionIcon = (option: QuizOption) => {
    if (!isSubmitted) {
      const isSelected = currentQuestion.type === 'multiple'
        ? Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(option.id)
        : answers[currentQuestion.id] === option.id;

      return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {isSelected ? '✓' : option.label}
        </div>
      );
    }

    const isCorrectOption = Array.isArray(currentQuestion.correctAnswer)
      ? currentQuestion.correctAnswer.includes(option.id)
      : currentQuestion.correctAnswer === option.id;

    if (isCorrectOption) {
      return <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />;
    }

    const isSelected = currentQuestion.type === 'multiple'
      ? Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).includes(option.id)
      : answers[currentQuestion.id] === option.id;

    if (isSelected) {
      return <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />;
    }

    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
        {option.label}
      </div>
    );
  };

  if (isSubmitted && result) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-gradient-to-r from-red-500 to-orange-500 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Trophy className="w-8 h-8" />
                  测试完成！
                </h3>
                <p className="text-white/90 mt-2">{quiz.chapterTitle} - 章节测验</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black">
                  {Math.round((result.score / result.totalQuestions) * 100)}分
                </div>
                <div className="text-sm text-white/80">
                  答对 {result.correctAnswers}/{result.totalQuestions} 题
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
                <div className="text-sm text-green-700">答对</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{result.wrongAnswers}</div>
                <div className="text-sm text-red-700">答错</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round((result.score / result.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-blue-700">正确率</div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-purple-900 mb-2">AI 学习建议</div>
                  <div className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">
                    {result.aiSuggestion}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-red-600" />
                答题详情
              </h4>
              
              {result.answers.map((answer, idx) => (
                <div key={answer.questionId} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowExplanation(prev => ({
                      ...prev,
                      [answer.questionId]: !prev[answer.questionId]
                    }))}
                    className={`w-full p-4 text-left flex items-center justify-between ${
                      answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">第 {idx + 1} 题</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${showExplanation[answer.questionId] ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showExplanation[answer.questionId] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-white border-t">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">您的答案：</span>
                              <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {Array.isArray(answer.userAnswer) ? answer.userAnswer.join(', ') : answer.userAnswer || '未作答'}
                              </span>
                            </div>
                            {!answer.isCorrect && (
                              <div>
                                <span className="font-semibold text-gray-700">正确答案：</span>
                                <span className="text-green-600 font-medium">
                                  {Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer}
                                </span>
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 leading-relaxed">{answer.explanation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {onRetry && (
                <Button variant="outline" onClick={onRetry} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  重新测试
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-red-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6" />
                章节测试
              </h3>
              <p className="text-white/90 text-sm mt-1">{quiz.chapterTitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30">
                第 {currentQuestionIndex + 1}/{quiz.totalQuestions} 题
              </Badge>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-600 animate-pulse' : 'bg-white/20'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
              initial={false}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    variant="outline" 
                    className={
                      currentQuestion.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                      currentQuestion.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-red-300 text-red-700'
                    }
                  >
                    {currentQuestion.difficulty === 'easy' ? '简单' : 
                     currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {currentQuestion.knowledgePoint}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestion.type === 'single' ? '单选' :
                     currentQuestion.type === 'multiple' ? '多选' : '判断'}
                  </Badge>
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={getOptionStyle(option)}
                  >
                    {getOptionIcon(option)}
                    <span className="text-base font-medium text-gray-800">{option.text}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2"
                >
                  上一题
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  {currentQuestion.type === 'multiple' ? '可多选' : '请选择一个答案'}
                </div>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 gap-2"
                  >
                    下一题
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 gap-2"
                    disabled={Object.keys(answers).length < quiz.questions.length}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    提交答卷
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChapterQuizComponent;
