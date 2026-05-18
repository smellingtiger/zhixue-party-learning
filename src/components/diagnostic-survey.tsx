'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { diagnosticOptions, analyzeRequirements } from '@/lib/knowledge-graph';
import { CheckCircle2, Sparkles, BookOpen, Users, Target, FileText, Lightbulb } from 'lucide-react';

interface DiagnosticSurveyProps {
  onPathGenerated: (roles: string[], topics: string[], difficulty: string, customRequirements: string) => void;
}

export function DiagnosticSurvey({ onPathGenerated }: DiagnosticSurveyProps) {
  const [step, setStep] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [level, setLevel] = useState<string>('beginner');
  const [customRequirements, setCustomRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const roles = diagnosticOptions.filter(o => o.category === 'role');
  const topics = diagnosticOptions.filter(o => o.category === 'topic');

  const requirementAnalysis = customRequirements.trim() ? analyzeRequirements(customRequirements) : null;

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
      onPathGenerated(selectedRoles, selectedTopics, level, customRequirements);
      setIsGenerating(false);
    }, 1500);
  };

  const totalSteps = 4;

  return (
    <div className="max-w-3xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
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
            {i < totalSteps - 1 && (
              <div className={`w-14 h-1 mx-1 rounded ${
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
                您的职务级别是？
              </CardTitle>
              <CardDescription>
                选择您的职务级别，系统将匹配适合您层级的学习内容
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
                想提升哪些能力？
              </CardTitle>
              <CardDescription>
                选择您希望提升的培训方向（可多选）
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
                  选择学习深度
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

      {/* 步骤3：文本录入学习需求 */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="border-0 shadow-xlt">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                您的具体学习需求？
              </CardTitle>
              <CardDescription>
                请描述您当前工作中需要提升的具体领域或遇到的困难，系统将据此智能匹配知识图谱和推荐课程（可选填写）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="例如：我需要提升公文写作能力，同时了解最新的乡村振兴政策，还希望学习基层治理的应急管理方法..."
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                className="min-h-[140px] border-2 border-slate-200 focus:border-green-500 focus:ring-green-500 rounded-xl p-4 text-sm resize-none"
              />

              {/* 实时关键词分析预览 */}
              {requirementAnalysis && requirementAnalysis.keywords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border-2 border-green-200 bg-green-50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">系统识别到以下关键词和关联主题：</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">识别关键词：</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {requirementAnalysis.keywords.map(kw => (
                          <Badge key={kw} variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {requirementAnalysis.matchedTopics.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-500">匹配培训方向：</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {requirementAnalysis.matchedTopics.map(t => (
                            <Badge key={t} variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-xs text-slate-500">建议学习深度：</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs ml-1">
                        {requirementAnalysis.suggestedLevel === 'beginner' ? '入门级' : requirementAnalysis.suggestedLevel === 'intermediate' ? '进阶级' : '深入级'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {customRequirements.trim() && (!requirementAnalysis || requirementAnalysis.keywords.length === 0) && (
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
                  <p className="text-xs text-amber-700 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    未识别到特定关键词，系统将根据您的身份和主题选择进行推荐。建议补充更具体的描述（如：政策、管理、基层、廉政等）。
                  </p>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  上一步
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="bg-red-600 hover:bg-red-700 px-8"
                >
                  下一步{customRequirements.trim() ? '' : '（跳过）'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 步骤4：确认选择并生成 */}
      {step === 3 && (
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
                系统将综合您的职务级别、培训方向和学习需求，智能生成个性化学习路径
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 身份确认 */}
              <div>
                <span className="text-sm text-slate-500">您的职务级别：</span>
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
                <span className="text-sm text-slate-500">培训方向：</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTopics.map(topic => (
                    <Badge key={topic} variant="secondary" className="bg-blue-100 text-blue-700">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 文本需求确认 */}
              {customRequirements.trim() && (
                <div>
                  <span className="text-sm text-slate-500">学习需求描述：</span>
                  <div className="mt-2 p-3 rounded-xl border border-green-200 bg-green-50 text-sm text-slate-700">
                    {customRequirements}
                  </div>
                </div>
              )}

              {/* 学习深度 */}
              <div>
                <span className="text-sm text-slate-500">学习深度：</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-2">
                  {level === 'beginner' ? '入门级' : level === 'intermediate' ? '进阶级' : '深入级'}
                </Badge>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(2)}
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