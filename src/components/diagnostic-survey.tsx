'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { diagnosticOptions } from '@/lib/knowledge-graph';
import { CheckCircle2, Sparkles, BookOpen, Users, Target } from 'lucide-react';

interface DiagnosticSurveyProps {
  onPathGenerated: (roles: string[], topics: string[], difficulty: string) => void;
}

export function DiagnosticSurvey({ onPathGenerated }: DiagnosticSurveyProps) {
  const [step, setStep] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [level, setLevel] = useState<string>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);

  const roles = diagnosticOptions.filter(o => o.category === 'role');
  const topics = diagnosticOptions.filter(o => o.category === 'topic');

  const toggleSelection = (type: 'role' | 'topic', label: string) => {
    if (type === 'role') {
      setSelectedRoles(prev => 
        prev.includes(label) ? prev.filter(r => r !== label) : [...prev, label]
      );
    } else {
      setSelectedTopics(prev => 
        prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
      );
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onPathGenerated(selectedRoles, selectedTopics, level);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: step >= i ? 1 : 0.9 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= i 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </motion.div>
            {i < 2 && (
              <div className={`w-20 h-1 mx-2 rounded ${
                step > i ? 'bg-red-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* 步骤1：选择身份 */}
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="border-0 shadow-xlt">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-red-600" />
                您的身份是？
              </CardTitle>
              <CardDescription>
                选择您的角色身份，我们将为您推荐最合适的学习内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection('role', role.label)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRoles.includes(role.label)
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedRoles.includes(role.label) && (
                        <CheckCircle2 className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">{role.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => setStep(1)}
                  disabled={selectedRoles.length === 0}
                  className="bg-red-600 hover:bg-red-700 px-8"
                >
                  下一步
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 步骤2：选择学习主题 */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="border-0 shadow-xlt">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <BookOpen className="w-8 h-8 text-red-600" />
                想学习哪些内容？
              </CardTitle>
              <CardDescription>
                选择您感兴趣的学习主题（可多选）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <motion.button
                    key={topic.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection('topic', topic.label)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTopics.includes(topic.label)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedTopics.includes(topic.label) && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="font-medium">{topic.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* 难度选择 */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  <Target className="w-4 h-4 inline mr-1" />
                  选择学习难度
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label: '入门', desc: '基础内容，适合初学者' },
                    { value: 'intermediate', label: '进阶', desc: '中等难度，适合有一定基础' },
                    { value: 'advanced', label: '深入', desc: '全面内容，包括复杂主题' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLevel(opt.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        level === opt.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(0)}
                >
                  上一步
                </Button>
                <Button 
                  onClick={() => setStep(2)}
                  disabled={selectedTopics.length === 0}
                  className="bg-red-600 hover:bg-red-700 px-8"
                >
                  下一步
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 步骤3：确认选择并生成 */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="border-0 shadow-xlt">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-red-600" />
                确认您的学习偏好
              </CardTitle>
              <CardDescription>
                我们将根据您的选择，为您智能生成个性化学习路径
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 身份确认 */}
              <div>
                <span className="text-sm text-slate-500">您的身份：</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRoles.map(role => (
                    <Badge key={role} variant="secondary" className="bg-red-100 text-red-700">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* 主题确认 */}
              <div>
                <span className="text-sm text-slate-500">学习主题：</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="bg-blue-100 text-blue-700">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  上一步
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-red-600 to-blue-600 hover:opacity-90 px-8"
                >
                  {isGenerating ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      智能生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      生成学习路径
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
