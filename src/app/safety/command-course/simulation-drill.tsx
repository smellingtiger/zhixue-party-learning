'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Zap, Shield, User, Play, Loader2, Trophy, RotateCcw, ArrowRight, Video, SkipForward } from 'lucide-react';
import type { CommandManualData, DepartmentSOP, SOPAction, ResponseLevel } from './types';
import { floodCommandManualData } from './flood-command-manual-data';
import { earthquakeCommandManualData } from './earthquake-command-manual-data';
import { typhoonCommandManualData } from './typhoon-command-manual-data';
import { forestFireCommandManualData } from './forest-fire-command-manual-data';
import { coldWaveCommandManualData } from './cold-wave-command-manual-data';
import MonitorDashboard from './monitor-dashboard';
import {
  type DisasterMetric,
  createInitialMetrics,
  applyDecisionImpact,
  getDisasterScore,
  generateMetricEvaluation,
} from './disaster-metrics';

const manualDataMap: Record<string, CommandManualData> = {
  flood: floodCommandManualData,
  earthquake: earthquakeCommandManualData,
  typhoon: typhoonCommandManualData,
  'forest-fire': forestFireCommandManualData,
  'cold-wave': coldWaveCommandManualData,
};

type DrillPhase = 'idle' | 'role-selection' | 'commander-briefing' | 'answering' | 'simulating' | 'result' | 'video-intro';

interface DrillQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  departmentName: string;
  action: string;
}

interface DepartmentAnswer {
  departmentName: string;
  questions: { questionId: string; question: string; selectedOptionId: string; isCorrect: boolean; userOptionText: string; correctOptionText: string; action: string }[];
  score: number;
  totalScore: number;
  isPlayer: boolean;
}

interface MetricLogEntry {
  time: string;
  questionIndex: number;
  action: string;
  isCorrect: boolean;
  messages: string[];
}

interface DrillResult {
  departmentAnswers: DepartmentAnswer[];
  totalScore: number;
  maxScore: number;
  evaluation: string;
  metricsEvaluation: string;
  metricsScore: number;
  metricLogs: MetricLogEntry[];
}

const levelColors: Record<string, string> = {
  IV: 'from-blue-700 to-blue-500',
  III: 'from-yellow-600 to-yellow-400',
  II: 'from-orange-700 to-orange-500',
  I: 'from-red-700 to-red-500',
};

const levelBorderColors: Record<string, string> = {
  IV: 'border-blue-500',
  III: 'border-yellow-500',
  II: 'border-orange-500',
  I: 'border-red-500',
};

const levelTextColors: Record<string, string> = {
  IV: 'text-blue-400',
  III: 'text-yellow-400',
  II: 'text-orange-400',
  I: 'text-red-400',
};

function generateQuestionsForDepartment(
  department: DepartmentSOP,
  level: ResponseLevel,
  disasterName: string,
  allDeptSops: DepartmentSOP[]
): DrillQuestion[] {
  const questions: DrillQuestion[] = [];
  const actions = [...department.sopTable];

  const selectedActions = actions.length <= 4 ? actions : actions.sort(() => Math.random() - 0.5).slice(0, 4);

  // 收集所有部门的完整 SOP 内容（用于生成错误选项）
  const allSopContents: string[] = [];
  allDeptSops.forEach(d => {
    d.sopTable.forEach(a => allSopContents.push(a.content));
  });

  selectedActions.forEach((action, idx) => {
    const wrongOptions = generateWrongOptions(action.content, allSopContents);
    const options = [
      { id: 'correct', text: action.content },
      ...wrongOptions.map((o, i) => ({ id: `wrong_${i}`, text: o })),
    ].sort(() => Math.random() - 0.5);

    const questionText = `在${level.label}（${disasterName}灾害）下，${department.fullName}需要执行"${action.action}"， 正确的做法是什么？`;

    questions.push({
      id: `${department.name}_${idx}`,
      question: questionText,
      options,
      correctOptionId: 'correct',
      departmentName: department.fullName,
      action: action.action,
    });
  });

  return questions;
}

function generateWrongOptions(
  correctContent: string,
  allSopContents: string[]
): string[] {
  const correctLen = correctContent.length;
  const maxWrongLen = Math.floor(correctLen * 0.7);

  // 找完整的、比正确答案短的 SOP 内容作为错误选项
  const shorterComplete = allSopContents
    .filter(c => c !== correctContent && c.length >= 10 && c.length <= maxWrongLen)
    .sort(() => Math.random() - 0.5);

  if (shorterComplete.length >= 2) {
    return shorterComplete.slice(0, 2);
  }

  // 不够则用简化版：去掉原内容的细节描述，保留主干
  const fallbackOptions: string[] = [];
  const otherContents = allSopContents.filter(c => c !== correctContent);

  for (let i = 0; i < otherContents.length && fallbackOptions.length < 2; i++) {
    const content = otherContents[i];
    if (content.length <= maxWrongLen && !fallbackOptions.includes(content)) {
      fallbackOptions.push(content);
    }
  }

  // 如果还不够，用短的句子
  if (fallbackOptions.length < 2) {
    const templates = [
      '按常规流程处理',
      '立即上报并等待指示',
      '启动应急预案并通知相关部门',
      '安排专人负责现场处置',
    ];
    for (const t of templates) {
      if (fallbackOptions.length >= 2) break;
      if (t !== correctContent) fallbackOptions.push(t);
    }
  }

  return fallbackOptions.slice(0, 2);
}

function generateAllQuestions(
  departments: DepartmentSOP[],
  level: ResponseLevel,
  disasterName: string
): Map<string, DrillQuestion[]> {
  const map = new Map<string, DrillQuestion[]>();
  departments.forEach(dept => {
    map.set(dept.fullName, generateQuestionsForDepartment(dept, level, disasterName, departments));
  });
  return map;
}

function simulateDepartmentAnswers(
  department: DepartmentSOP,
  _questions: DrillQuestion[],
  allQuestions: Map<string, DrillQuestion[]>
): DepartmentAnswer {
  const deptQuestions = allQuestions.get(department.fullName) || [];

  const answers = deptQuestions.map(q => {
    // 按字数排序：最长的最有可能是正确答案
    const sortedByLength = [...q.options].sort((a, b) => b.text.length - a.text.length);
    const longestOption = sortedByLength[0];

    // 70% 概率选字数最长的（模拟答对），30% 随机选短的（模拟答错）
    const isCorrect = Math.random() > 0.3;
    let selectedOption: typeof q.options[0];

    if (isCorrect) {
      // 答对：选字数最长的
      selectedOption = longestOption;
    } else {
      // 答错：随机选一个短的
      const shortOptions = sortedByLength.slice(1);
      selectedOption = shortOptions[Math.floor(Math.random() * shortOptions.length)];
    }

    const selectedId = selectedOption.id;
    const isActuallyCorrect = selectedId === q.correctOptionId;
    const correctOption = q.options.find(o => o.id === q.correctOptionId) || q.options[0];
    return {
      questionId: q.id,
      question: q.question,
      selectedOptionId: selectedId,
      isCorrect: isActuallyCorrect,
      userOptionText: selectedOption.text,
      correctOptionText: correctOption.text,
      action: q.action,
    };
  });

  const score = answers.filter(a => a.isCorrect).length;
  const totalScore = answers.length;

  return {
    departmentName: department.fullName,
    questions: answers,
    score,
    totalScore,
    isPlayer: false,
  };
}

function generateEvaluation(totalScore: number, maxScore: number): string {
  const ratio = totalScore / maxScore;
  if (ratio >= 0.9) return '优秀！各岗位协同配合出色，应急响应流程执行规范，展现了高水平的指挥调度能力。';
  if (ratio >= 0.75) return '良好！整体应急响应较为有序，大部分岗位能够按预案执行，部分环节还有提升空间。';
  if (ratio >= 0.6) return '合格！基本完成了应急响应任务，但存在明显薄弱环节，需要加强培训和演练。';
  return '需要改进！多个岗位存在响应不及时或措施不当的情况，建议重新学习应急预案并加强协同训练。';
}

interface SimulationDrillProps {
  disaster: string;
  disasterName: string;
}

const ACTION_IMAGE_MAP: Record<string, string> = {
  '值班值守': '内涝-值班值守.png',
  '动态跟踪': '内涝-动态跟踪.png',
  '物资调拨': '内涝-物资调拨.png',
  '协议储备': '内涝-协议储备.png',
  '队伍待命': '内涝-队伍待命.png',
  '技术支援': '内涝-技术支援.png',
};

function getActionImage(action: string): string {
  for (const [key, filename] of Object.entries(ACTION_IMAGE_MAP)) {
    if (action.includes(key)) {
      return `/knowledge-images/${filename}`;
    }
  }
  return '/knowledge-images/内涝-值班值守.png';
}

export default function SimulationDrill({ disaster, disasterName }: SimulationDrillProps) {
  const [phase, setPhase] = useState<DrillPhase>('idle');
  const [selectedLevel, setSelectedLevel] = useState<ResponseLevel | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DrillResult | null>(null);
  const [simulatingDept, setSimulatingDept] = useState('');
  const [metrics, setMetrics] = useState<DisasterMetric[]>(() => createInitialMetrics());
  const metricLogsRef = useRef<MetricLogEntry[]>([]);
  const simulatedAnswersRef = useRef<DepartmentAnswer[]>([]);
  const hasStartedSimulation = useRef(false);
  const [logTick, setLogTick] = useState(0);

  // 背景图状态 - 根据答题表现切换
  // 0=默认图A, 1=图B(答得好), 2=图C(答得不好)
  const [bgImageIndex, setBgImageIndex] = useState(0);
  const bgImages = ['/knowledge-images/9-0-0.png', '/knowledge-images/9-0-0-B.png', '/knowledge-images/9-0-0-C.png'];

  const manualData = manualDataMap[disaster];
  const levels = manualData?.responseLevels || [];

  const allQuestionsMap = useMemo(() => {
    if (!selectedLevel) return new Map<string, DrillQuestion[]>();
    return generateAllQuestions(selectedLevel.departments, selectedLevel, disasterName);
  }, [selectedLevel, disasterName]);

  const playerQuestions = useMemo(() => {
    if (!selectedRole || !allQuestionsMap) return [];
    return allQuestionsMap.get(selectedRole) || [];
  }, [selectedRole, allQuestionsMap]);

  const currentQuestion = playerQuestions[currentQuestionIdx] || null;

  // 判断是否处于答题阶段（需要虚化背景）
  const isAnsweringPhase = phase === 'answering' && currentQuestion;

  const handleStart = () => {
    setMetrics(createInitialMetrics());
    metricLogsRef.current = [];
    setPhase('role-selection');
  };

  const handleSelectLevel = (level: ResponseLevel) => {
    setSelectedLevel(level);
  };

  const handleSelectRole = (departmentFullName: string) => {
    setSelectedRole(departmentFullName);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setMetrics(createInitialMetrics());
    metricLogsRef.current = [];
    simulatedAnswersRef.current = [];
    hasStartedSimulation.current = false;

    // IV级响应 + 市应急局：先弹出视频引导
    const shouldShowVideo = selectedLevel?.label === 'IV级响应' && departmentFullName.includes('应急局');
    if (shouldShowVideo) {
      setPhase('video-intro');
      return;
    }

    startCommanderBriefing(departmentFullName);
  };

  const startCommanderBriefing = (departmentFullName: string) => {
    if (!selectedLevel) return;
    setPhase('commander-briefing');

    const commander = selectedLevel.departments.find(d => d.fullName.includes('总指挥') || d.fullName.includes('指挥长') || d.fullName.includes('分管') || d.fullName.startsWith('市长'));
    const otherDepts = selectedLevel.departments.filter(d => d !== commander && d.fullName !== departmentFullName);

    const runCommanderBriefing = async () => {
      hasStartedSimulation.current = true;

      // Commander commands first - also simulate commander answers
      if (commander) {
        setSimulatingDept(commander.fullName);

        metricLogsRef.current.push({
          time: new Date().toLocaleTimeString('zh-CN'),
          questionIndex: -1,
          action: `${commander.fullName} 发布应急指令`,
          isCorrect: true,
          messages: [`【应急指挥部】${commander.fullName}启动${selectedLevel.label}应急响应！`],
        });
        setLogTick(t => t + 1);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show each commander command from SOP
        const commanderQuestions = allQuestionsMap.get(commander.fullName) || [];
        for (const q of commanderQuestions) {
          const sopContent = q.options.find(o => o.id === 'correct')?.text || q.action;
          metricLogsRef.current.push({
            time: new Date().toLocaleTimeString('zh-CN'),
            questionIndex: -1,
            action: `${commander.fullName}: ${q.action}`,
            isCorrect: true,
            messages: [sopContent],
          });
          setLogTick(t => t + 1);
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
        }

        // Simulate commander answers and add to results
        const commanderAnswer = simulateDepartmentAnswers(commander, [], allQuestionsMap);
        simulatedAnswersRef.current.push(commanderAnswer);

        metricLogsRef.current.push({
          time: new Date().toLocaleTimeString('zh-CN'),
          questionIndex: -1,
          action: `${commander.fullName}: 总动员令`,
          isCorrect: true,
          messages: [`总动员令：各岗位立即按预案执行！`],
        });
        setLogTick(t => t + 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSimulatingDept('');

      // Step 2: Enter answering phase, start other depts simulation alongside
      setPhase('answering');

      const runOtherDepts = async () => {
        for (let i = 0; i < otherDepts.length; i++) {
          const dept = otherDepts[i];
          setSimulatingDept(dept.fullName);

          metricLogsRef.current.push({
            time: new Date().toLocaleTimeString('zh-CN'),
            questionIndex: -1,
            action: `${dept.fullName} 接收指令`,
            isCorrect: true,
            messages: [`【${dept.fullName}】收到指挥部指令，开始执行...`],
          });
          setLogTick(t => t + 1);
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

          const simAnswer = simulateDepartmentAnswers(dept, [], allQuestionsMap);
          simulatedAnswersRef.current.push(simAnswer);

          const deptQuestions = allQuestionsMap.get(dept.fullName) || [];
          for (let j = 0; j < deptQuestions.length; j++) {
            const q = deptQuestions[j];
            const isCorrect = Math.random() > 0.3;
            const { logMessages } = applyDecisionImpact(metrics, q.action, isCorrect);
            metricLogsRef.current.push({
              time: new Date().toLocaleTimeString('zh-CN'),
              questionIndex: -1,
              action: `${dept.fullName}: ${q.action}`,
              isCorrect,
              messages: logMessages,
            });
            setLogTick(t => t + 1);
            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
          }

          setSimulatingDept('');
        }
      };

      runOtherDepts();
    };

    runCommanderBriefing();
  };

  const handleSkipVideo = () => {
    startCommanderBriefing(selectedRole!);
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionId }));

    const currentQ = playerQuestions.find(q => q.id === questionId);
    if (currentQ) {
      const isCorrect = optionId === currentQ.correctOptionId;
      setMetrics(prev => {
        const { updatedMetrics, logMessages } = applyDecisionImpact(prev, currentQ.action, isCorrect);
        metricLogsRef.current.push({
          time: new Date().toLocaleTimeString('zh-CN'),
          questionIndex: currentQuestionIdx + 1,
          action: currentQ.action,
          isCorrect,
          messages: logMessages,
        });
        return updatedMetrics;
      });
    }

    setLogTick(t => t + 1);

    setTimeout(() => {
      if (currentQuestionIdx < playerQuestions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      }
    }, 700);
  };

  const handleSubmitAnswers = async () => {
    if (!selectedLevel || !selectedRole) return;

    setPhase('simulating');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const playerQs = allQuestionsMap.get(selectedRole) || [];

    const playerQuestionDetails = playerQs.map(q => {
      const selectedId = userAnswers[q.id] || '';
      const isCorrect = selectedId === q.correctOptionId;
      const selectedOption = q.options.find(o => o.id === selectedId) || { id: '', text: '未作答' };
      const correctOption = q.options.find(o => o.id === q.correctOptionId) || { id: '', text: '' };
      return {
        questionId: q.id,
        question: q.question,
        selectedOptionId: selectedId,
        isCorrect,
        userOptionText: selectedOption.text,
        correctOptionText: correctOption.text,
        action: q.action,
      };
    });

    const playerScore = playerQuestionDetails.filter(a => a.isCorrect).length;
    const playerTotal = playerQuestionDetails.length;

    const playerAnswer: DepartmentAnswer = {
      departmentName: selectedRole,
      questions: playerQuestionDetails,
      score: playerScore,
      totalScore: playerTotal,
      isPlayer: true,
    };

    const simulatedAnswers = [...simulatedAnswersRef.current, playerAnswer];

    const totalScore = simulatedAnswers.reduce((sum, a) => sum + a.score, 0);
    const maxScore = simulatedAnswers.reduce((sum, a) => sum + a.totalScore, 0);

    const metricsScoreObj = getDisasterScore(metrics);
    const metricsEvaluation = generateMetricEvaluation(metrics);

    const drillResult: DrillResult = {
      departmentAnswers: simulatedAnswers,
      totalScore,
      maxScore,
      evaluation: generateEvaluation(totalScore, maxScore),
      metricsEvaluation,
      metricsScore: metricsScoreObj.score,
      metricLogs: [...metricLogsRef.current],
    };

    // 根据答题表现切换背景图
    const correctRate = totalScore / maxScore;
    if (correctRate >= 0.75) {
      setBgImageIndex(1); // 答得好显示图B
    } else {
      setBgImageIndex(2); // 答得不好显示图C
    }

    setResult(drillResult);
    setSimulatingDept('');
    setPhase('result');
  };

  const handleReset = () => {
    setPhase('idle');
    setSelectedLevel(null);
    setSelectedRole(null);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setResult(null);
    setSimulatingDept('');
    setMetrics(createInitialMetrics());
    metricLogsRef.current = [];
    setBgImageIndex(0); // 重置背景图
  };

  const handleBackToRoleSelection = () => {
    setPhase('role-selection');
    setSelectedRole(null);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setMetrics(createInitialMetrics());
    metricLogsRef.current = [];
    simulatedAnswersRef.current = [];
    hasStartedSimulation.current = false;
  };

  if (!manualData || levels.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-12 text-center" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-bold">暂无该灾害的指挥手册数据</p>
      </div>
    );
  }

  return (
    <div className="relative border-2 border-black bg-gray-950 overflow-hidden" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
      {/* 全局背景图 — 答题阶段适度虚化 */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isAnsweringPhase ? 'opacity-30 saturate-50 brightness-75' : 'opacity-100 saturate-100 brightness-100'
      }`}>
        <img
          src={bgImages[bgImageIndex]}
          alt="背景"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* 多层毛玻璃效果 — 答题阶段轻度虚化 */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          isAnsweringPhase ? 'bg-black/30 backdrop-blur-md' : 'bg-transparent'
        }`} />
      </div>

      <div className="relative h-[850px] flex flex-col">
        <DisasterHeader
          manualData={manualData}
          selectedLevel={selectedLevel}
          onSelectLevel={handleSelectLevel}
          phase={phase}
          metrics={metrics}
          levels={levels}
        />

        <div className="flex-1 flex min-h-0">
          {phase === 'result' && result ? (
            <div className="flex-[2] min-h-0 overflow-auto p-4">
              <ResultPhase result={result} metrics={metrics} onReset={handleReset} />
            </div>
          ) : (
            <div className="flex-[2] min-h-0 flex flex-col p-4">
              {phase === 'idle' && (
                <div className="flex-1 flex items-center justify-center">
                  <IdlePhase
                    onStart={handleStart}
                    selectedLevel={selectedLevel}
                  />
                </div>
              )}
              {phase === 'commander-briefing' && (
                <div className="flex-1 flex items-center justify-center">
                  <CommanderBriefingPhase />
                </div>
              )}
              {phase === 'answering' && currentQuestion && (
                <div className="flex-1 min-h-0 flex gap-3">
                  {/* 左侧：场景配图 — 完整展示不遮挡 */}
                  <div className="w-1/2 min-h-0 overflow-hidden" style={{ borderRadius: '0' }}>
                    <img
                      key={getActionImage(currentQuestion.action)}
                      src={getActionImage(currentQuestion.action)}
                      alt={currentQuestion.action}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '0' }}
                    />
                  </div>

                  {/* 右侧：答题面板 — 白色半透明卡片 */}
                  <div className="w-1/2 min-h-0 overflow-auto">
                    <QuestionPanel
                      question={currentQuestion}
                      questionIndex={currentQuestionIdx}
                      totalQuestions={playerQuestions.length}
                      selectedOptionId={userAnswers[currentQuestion.id] || null}
                      onSelectOption={(optionId) => handleAnswer(currentQuestion.id, optionId)}
                      onSubmit={handleSubmitAnswers}
                      allAnswered={playerQuestions.every(q => userAnswers[q.id])}
                    />
                  </div>
                </div>
              )}
              {(phase === 'role-selection' || phase === 'video-intro') && (
                <div className="flex-1 flex items-center justify-center">
                  {phase === 'role-selection' && (
                    <RoleSelectionPlaceholder />
                  )}
                  {phase === 'video-intro' && selectedRole && selectedLevel && (
                    <VideoIntroPhase
                      departmentName={selectedRole}
                      levelLabel={selectedLevel.label}
                      onSkip={handleSkipVideo}
                      onWatchEnd={handleSkipVideo}
                    />
                  )}
                </div>
              )}
              {phase === 'simulating' && (
                <div className="flex-1 flex items-center justify-center">
                  <SimulatingPhase simulatingDept={simulatingDept} />
                </div>
              )}
            </div>
          )}

          <div className="w-[320px] flex-shrink-0 border-l-2 border-gray-800 p-4 overflow-hidden flex flex-col min-h-0">
            <CommandLogPanel
              phase={phase}
              selectedLevel={selectedLevel}
              selectedRole={selectedRole}
              currentQuestion={currentQuestion}
              userAnswers={userAnswers}
              playerQuestions={playerQuestions}
              simulatingDept={simulatingDept}
              result={result}
              metricLogs={metricLogsRef.current}
              logTick={logTick}
            />
          </div>
        </div>

        <DepartmentBar
          selectedLevel={selectedLevel}
          selectedRole={selectedRole}
          phase={phase}
          onSelectRole={handleSelectRole}
          onBackToRoleSelection={handleBackToRoleSelection}
        />
      </div>
    </div>
  );
}

function DisasterHeader({
  manualData,
  selectedLevel,
  onSelectLevel,
  phase,
  metrics,
  levels,
}: {
  manualData: CommandManualData;
  selectedLevel: ResponseLevel | null;
  onSelectLevel: (level: ResponseLevel) => void;
  phase: DrillPhase;
  metrics: DisasterMetric[];
  levels: ResponseLevel[];
}) {
  const bgGradient = selectedLevel ? levelColors[selectedLevel.level] : 'from-red-700 to-red-500';
  const borderColor = selectedLevel ? levelBorderColors[selectedLevel.level] : 'border-red-500';
  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;

  return (
    <div className={`bg-gradient-to-r ${bgGradient} border-b-2 ${borderColor} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-white text-lg font-black tracking-wider">
              {manualData.disasterName}灾害应急指挥部
            </h2>
            {selectedLevel && (
              <div>
                <p className={`text-sm font-bold mt-0.5 ${levelTextColors[selectedLevel.level]}`}>
                  {selectedLevel.label} · 响应状态：已启动
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {selectedLevel.conditions.map((cond, idx) => (
                    <span key={idx} className="text-white/75 text-[10px] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-white/60" />
                      {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {levels.map(lv => (
            <button
              key={lv.level}
              onClick={() => phase === 'idle' && onSelectLevel(lv)}
              className={`px-4 py-2 border-2 text-white font-black text-sm transition-all duration-200 ${
                selectedLevel?.level === lv.level
                  ? 'bg-white/30 scale-110 border-white'
                  : phase === 'idle'
                    ? 'border-white/40 bg-white/5 hover:bg-white/20'
                    : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
              }`}
              style={{ borderRadius: '0' }}
            >
              {lv.label}
            </button>
          ))}
        </div>

        {phase !== 'idle' && selectedLevel && (
          <div className="flex items-center gap-3">
            {phase === 'answering' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/70">灾情:</span>
                {criticalCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-600/40 text-white text-[10px] font-bold border border-red-400/50" style={{ borderRadius: '0' }}>
                    {criticalCount} 危险
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-600/40 text-white text-[10px] font-bold border border-yellow-400/50" style={{ borderRadius: '0' }}>
                    {warningCount} 警戒
                  </span>
                )}
                {criticalCount === 0 && warningCount === 0 && (
                  <span className="px-2 py-0.5 bg-green-600/40 text-white text-[10px] font-bold border border-green-400/50" style={{ borderRadius: '0' }}>
                    安全
                  </span>
                )}
              </div>
            )}
            <span className={`px-3 py-1 border-2 text-white font-black text-sm ${levelBorderColors[selectedLevel.level]} bg-black/30`}
              style={{ borderRadius: '0' }}>
              {selectedLevel.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function IdlePhase({
  onStart,
  selectedLevel,
}: {
  onStart: () => void;
  selectedLevel: ResponseLevel | null;
}) {
  return (
    <div className="text-center">
      {!selectedLevel ? (
        <div className="space-y-4">
          <Shield className="w-20 h-20 mx-auto text-gray-400" />
          <p className="text-gray-200 font-bold text-lg">请先在顶部选择响应等级</p>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="group relative"
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center border-4 border-red-400 transition-all duration-300 group-hover:scale-110 group-hover:from-red-500 group-hover:to-orange-400"
            style={{ boxShadow: '0 0 40px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(0,0,0,0.3)' }}>
            <div className="text-center">
              <Play className="w-10 h-10 text-white mx-auto mb-1 ml-1" />
              <span className="text-white font-black text-2xl tracking-widest">开 始</span>
            </div>
          </div>
          <div className="absolute inset-0 w-40 h-40 rounded-full border-4 border-red-500/50 animate-ping" />
        </button>
      )}
    </div>
  );
}

function RoleSelectionPlaceholder() {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-yellow-600/30 flex items-center justify-center">
        <User className="w-8 h-8 text-yellow-400" />
      </div>
      <p className="text-yellow-400 font-black text-lg">请选择您的岗位角色</p>
      <p className="text-gray-200 text-sm">在下方部门栏中选择一个部门进行角色扮演</p>
    </div>
  );
}

function QuestionPanel({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onSubmit,
  allAnswered,
}: {
  question: DrillQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  allAnswered: boolean;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-center p-2">
      {/* 题头标签条 */}
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-5 py-2.5 flex items-center justify-between"
           style={{
             borderRadius: '0',
             boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)'
           }}>
        <span className="text-yellow-400 font-black text-xs tracking-wider">
          第 {questionIndex + 1}/{totalQuestions} 题
        </span>
        <span className="text-gray-300 text-xs font-bold tracking-wide">{question.departmentName}</span>
      </div>

      {/* 题目主体 — 高透明白底 + 强模糊 */}
      <div className="bg-white/90 backdrop-blur-2xl border border-white/40 p-5 mt-px"
           style={{
             borderRadius: '0',
             boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)'
           }}>
        {/* 进度条 */}
        <div className="w-full bg-gray-900/20 h-2 mb-4 overflow-hidden" style={{ borderRadius: '0' }}>
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 transition-all duration-500 shadow-lg shadow-yellow-500/30"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%`, borderRadius: '0' }}
          />
        </div>
        {/* 题目文字 */}
        <p className="text-gray-900 font-black text-base leading-relaxed tracking-wide">{question.question}</p>
      </div>

      {/* 选项容器 — 半透明毛玻璃 */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/30 p-4 space-y-2.5 mt-px"
           style={{
             borderRadius: '0',
             boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
           }}>
        {question.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          const isChecked = selectedOptionId !== null;

          return (
            <button
              key={option.id}
              onClick={() => !isChecked && onSelectOption(option.id)}
              disabled={isChecked}
              className={`w-full p-3.5 text-left border-2 transition-all duration-200 group ${
                isSelected
                  ? 'border-yellow-500 bg-yellow-100/95 shadow-lg shadow-yellow-500/25 scale-[1.01]'
                  : isChecked
                    ? 'border-gray-400/60 bg-gray-100/80'
                    : 'border-white/50 bg-white/75 hover:border-yellow-400 hover:bg-yellow-50/90 hover:scale-[1.005]'
              }`}
              style={{ borderRadius: '0' }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 flex-shrink-0 border-2 flex items-center justify-center font-black text-sm mt-0.5 transition-all ${
                  isSelected
                    ? 'border-yellow-600 bg-yellow-500 text-black scale-110'
                    : isChecked
                      ? 'border-gray-400 bg-gray-300/80 text-gray-600'
                      : 'border-gray-400/60 bg-white/90 text-gray-500 group-hover:border-yellow-400'
                }`} style={{ borderRadius: '0' }}>
                  {isSelected ? '✓' : (isChecked ? '·' : '?')}
                </div>
                <span className={`text-sm leading-relaxed flex-1 ${
                  isSelected 
                    ? 'text-gray-900 font-black' 
                    : 'text-gray-800 font-semibold'
                }`}>{option.text}</span>
              </div>
            </button>
          );
        })}

        {/* 提交按钮 */}
        {allAnswered && (
          <button
            onClick={onSubmit}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-400 backdrop-blur-sm text-black font-black text-base border-2 border-yellow-600 hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 mt-3 shadow-xl shadow-yellow-500/40 hover:shadow-yellow-500/60 hover:scale-[1.02]"
            style={{ borderRadius: '0' }}
          >
            <span className="flex items-center justify-center gap-2 tracking-wider">
              提交全部答案 <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function VideoIntroPhase({
  departmentName,
  levelLabel,
  onSkip,
  onWatchEnd,
}: {
  departmentName: string;
  levelLabel: string;
  onSkip: () => void;
  onWatchEnd: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const videoSrc = '/video/应急局长必学：暴雨蓝色预警Ⅳ级响应全流程.mp4';

  if (!showVideo) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black p-8" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-8 h-8 text-yellow-500" />
            <h3 className="text-black font-black text-lg">操作指导视频</h3>
          </div>
          <p className="text-gray-700 text-sm font-bold mb-2">
            {levelLabel} · {departmentName} 应急响应操作流程
          </p>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            系统为您准备了该岗位的操作指导视频，是否需要先观看？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowVideo(true)}
              className="flex-1 py-3 bg-black text-white font-black text-sm border-2 border-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              style={{ borderRadius: '0' }}
            >
              <Play className="w-4 h-4" />
              先观看视频
            </button>
            <button
              onClick={onSkip}
              className="flex-1 py-3 bg-white text-gray-800 font-black text-sm border-2 border-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              style={{ borderRadius: '0' }}
            >
              <SkipForward className="w-4 h-4" />
              直接进入演练
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white border-2 border-black p-6" style={{ boxShadow: '4px 4px 0 0 #000', borderRadius: '0' }}>
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-6 h-6 text-yellow-500" />
          <h3 className="text-black font-black text-lg">操作指导视频</h3>
        </div>
        <p className="text-gray-700 text-sm font-bold mb-4">
          {levelLabel} · {departmentName} 应急响应操作流程
        </p>
        <div className="border-2 border-gray-800 bg-black mb-4" style={{ borderRadius: '0' }}>
          <video
            src={videoSrc}
            controls
            autoPlay
            className="w-full"
            style={{ maxHeight: '350px' }}
            onEnded={onWatchEnd}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 bg-gray-200 text-gray-800 font-black text-sm border-2 border-gray-600 hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
            style={{ borderRadius: '0' }}
          >
            <SkipForward className="w-4 h-4" />
            进入演练
          </button>
        </div>
      </div>
    </div>
  );
}

function CommanderBriefingPhase() {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-spin" style={{ borderTopColor: '#3b82f6' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
      </div>
      <div>
        <p className="text-blue-400 font-black text-lg">指挥部正在发布指令...</p>
        <p className="text-gray-200 text-sm mt-2">请等待总指挥完成部署</p>
      </div>
    </div>
  );
}

function SimulatingPhase({ simulatingDept }: { simulatingDept: string }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full animate-spin" style={{ borderTopColor: '#eab308' }} />
        <div className="absolute inset-2 border-4 border-yellow-500/20 rounded-full animate-spin" style={{ animationDuration: '1.5s', borderTopColor: '#f59e0b' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>
      </div>
      <div>
        <p className="text-yellow-400 font-black text-lg">AI正在模拟其他部门答题...</p>
        {simulatingDept && (
          <p className="text-gray-200 text-sm mt-2">
            当前模拟：<span className="text-yellow-200 font-bold">{simulatingDept}</span>
          </p>
        )}
      </div>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ResultPhase({
  result,
  metrics,
  onReset,
}: {
  result: DrillResult;
  metrics: DisasterMetric[];
  onReset: () => void;
}) {
  const ratio = result.totalScore / result.maxScore;
  const gradeColor = ratio >= 0.75 ? 'text-green-500' : ratio >= 0.6 ? 'text-yellow-500' : 'text-red-500';
  const gradeBorder = ratio >= 0.75 ? 'border-green-500' : ratio >= 0.6 ? 'border-yellow-500' : 'border-red-500';
  const metricsGradeColor = result.metricsScore >= 75 ? 'text-green-500' : result.metricsScore >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      {/* 顶部：总评 + 双分数 + 评价 */}
      <div className="flex-shrink-0 border-2 border-black p-3 mb-2" style={{ boxShadow: '3px 3px 0 0 #000', borderRadius: '0', background: 'rgba(255,255,255,0.25)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-gray-900 font-black">模拟演练完成</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="border-2 border-black p-2 text-center" style={{ borderRadius: '0', background: 'rgba(255,255,255,0.35)' }}>
            <div className="text-gray-800 text-[11px] font-bold">答题得分</div>
            <div className={`text-2xl font-black ${gradeColor}`}>{result.totalScore}</div>
            <div className="text-gray-700 text-[11px] font-bold">/ {result.maxScore} 分</div>
          </div>
          <div className="border-2 border-black p-2 text-center" style={{ borderRadius: '0', background: 'rgba(255,255,255,0.35)' }}>
            <div className="text-gray-800 text-[11px] font-bold">灾情控制</div>
            <div className={`text-2xl font-black ${metricsGradeColor}`}>{result.metricsScore}</div>
            <div className="text-gray-700 text-[11px] font-bold">/ 100 分</div>
          </div>
        </div>

        <div className={`p-2 border-2 ${gradeBorder} mb-1.5`} style={{ borderRadius: '0', background: 'rgba(255,255,255,0.35)' }}>
          <p className="text-gray-900 text-xs leading-relaxed font-black">{result.evaluation}</p>
        </div>

        <div className="p-2 border-2 border-blue-500" style={{ borderRadius: '0', background: 'rgba(147,197,253,0.3)' }}>
          <p className="text-blue-800 text-xs leading-relaxed font-black mb-0.5"> 灾情控制评价</p>
          <p className="text-blue-700 text-xs leading-relaxed font-bold">{result.metricsEvaluation}</p>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-3 py-2.5 text-white font-black text-sm border-2 border-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          style={{ borderRadius: '0', background: 'rgba(0,0,0,0.6)' }}
        >
          <RotateCcw className="w-4 h-4" />
          重新演练
        </button>
      </div>

      {/* 下方：各部门得分——完全展开 */}
      <div className="flex-shrink-0 border-2 border-black p-3" style={{ boxShadow: '3px 3px 0 0 #000', borderRadius: '0', background: 'rgba(255,255,255,0.25)' }}>
        <h4 className="text-gray-900 font-black text-sm flex items-center gap-1 mb-2">
          <Shield className="w-4 h-4 text-yellow-600" />
          各部门得分
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {result.departmentAnswers.map(dept => (
            <div
              key={dept.departmentName}
              className={`border-2 ${
                dept.isPlayer
                  ? 'border-yellow-500'
                  : 'border-gray-500'
              }`}
              style={{ borderRadius: '0', background: dept.isPlayer ? 'rgba(254,243,199,0.35)' : 'rgba(255,255,255,0.35)' }}
            >
              <div className="p-2 flex items-center justify-between border-b border-gray-400">
                <div className="flex items-center gap-1 min-w-0">
                  {dept.isPlayer && <User className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />}
                  <span className={`text-xs font-black truncate ${dept.isPlayer ? 'text-yellow-800' : 'text-gray-900'}`}>
                    {dept.departmentName.replace(/（.*?级）/g, '')}
                    {dept.isPlayer && ' (你)'}
                  </span>
                </div>
                <span className={`text-sm font-black flex-shrink-0 ${dept.score === dept.totalScore ? 'text-green-700' : dept.score >= dept.totalScore / 2 ? 'text-yellow-700' : 'text-red-700'}`}>
                  {dept.score}/{dept.totalScore}
                </span>
              </div>

              <div className="p-1.5 space-y-1">
                {dept.questions.map((q, qi) => (
                  <div key={qi} className={`text-[11px] p-1.5 border ${
                    q.isCorrect
                      ? 'border-green-600'
                      : 'border-red-600'
                  }`} style={{ borderRadius: '0', background: q.isCorrect ? 'rgba(134,239,172,0.4)' : 'rgba(252,165,165,0.4)' }}>
                    <div className="flex items-start gap-1.5">
                      <span className={`font-black ${q.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {q.isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-gray-900 font-bold text-[11px]">{q.action}</p>
                        {!q.isCorrect && (
                          <p className="text-red-700 text-[10px] mt-0.5 font-bold">回答：{q.userOptionText}</p>
                        )}
                        <p className="text-green-700 text-[10px] mt-0.5 font-bold">✓ {q.correctOptionText}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommandLogPanel({
  phase,
  selectedLevel,
  selectedRole,
  currentQuestion,
  userAnswers,
  playerQuestions,
  simulatingDept,
  result,
  metricLogs,
  logTick,
}: {
  phase: DrillPhase;
  selectedLevel: ResponseLevel | null;
  selectedRole: string | null;
  currentQuestion: DrillQuestion | null;
  userAnswers: Record<string, string>;
  playerQuestions: DrillQuestion[];
  simulatingDept: string;
  result: DrillResult | null;
  metricLogs: MetricLogEntry[];
  logTick: number;
}) {
  const [renderTime, setRenderTime] = useState('');

  useEffect(() => {
    setRenderTime(new Date().toLocaleTimeString('zh-CN'));
  }, [logTick]);

  const getLogs = (): { time: string; department: string; message: string; color: string }[] => {
    const logs: { time: string; department: string; message: string; color: string }[] = [];
    const timeStr = renderTime || '--:--:--';

    if (phase === 'idle') {
      logs.push({
        time: timeStr,
        department: '系统',
        message: '指挥系统已就绪，等待启动演练...',
        color: 'text-gray-100',
      });
      if (selectedLevel) {
        logs.push({
          time: timeStr,
          department: '系统',
          message: `${selectedLevel.label}已选定，监测指标已加载，请点击开始按钮`,
          color: 'text-blue-100',
        });
      }
    }

    if (phase === 'role-selection' && selectedLevel) {
      logs.push({
        time: timeStr,
        department: '应急指挥部',
        message: `${selectedLevel.label}应急响应已启动，各岗位进入待命状态`,
        color: 'text-yellow-200',
      });
      logs.push({
        time: timeStr,
        department: '系统',
        message: '请在下方选择您的岗位角色',
        color: 'text-white',
      });
    }

    if (phase === 'commander-briefing') {
      logs.push({
        time: timeStr,
        department: '应急指挥部',
        message: `总指挥正在发布${selectedLevel?.label}指令...`,
        color: 'text-blue-200',
      });

      metricLogs
        .filter(ml => ml.questionIndex === -1)
        .forEach(ml => {
          ml.messages.forEach(msg => {
            const isMetricMsg = msg.startsWith('✓') || msg.startsWith('⚠');
            const deptName = ml.action.includes(':') ? ml.action.split(':')[0] : ml.action;
            logs.push({
              time: ml.time,
              department: deptName,
              message: msg,
              color: deptName.includes('总动员令') ? 'text-red-200' : (isMetricMsg ? (msg.startsWith('✓') ? 'text-green-200' : 'text-yellow-200') : 'text-blue-200'),
            });
          });
        });
    }

    if (phase === 'answering' && selectedRole) {
      logs.push({
        time: timeStr,
        department: '应急指挥部',
        message: `${selectedRole}已就位，各岗位按指令执行`,
        color: 'text-green-200',
      });
      if (currentQuestion) {
        const answerStatus = userAnswers[currentQuestion.id]
          ? '已作答 ✓'
          : '等待作答...';
        logs.push({
          time: timeStr,
          department: selectedRole,
          message: `Q${playerQuestions.indexOf(currentQuestion) + 1}: ${currentQuestion.action} — ${answerStatus}`,
          color: userAnswers[currentQuestion.id] ? 'text-green-200' : 'text-yellow-200',
        });
      }

      metricLogs
        .filter(ml => ml.questionIndex === -1)
        .forEach(ml => {
          ml.messages.forEach(msg => {
            const isMetricMsg = msg.startsWith('✓') || msg.startsWith('⚠');
            const deptName = ml.action.includes(':') ? ml.action.split(':')[0] : ml.action;
            logs.push({
              time: ml.time,
              department: deptName,
              message: msg,
              color: isMetricMsg ? (msg.startsWith('✓') ? 'text-green-200' : 'text-yellow-200') : 'text-blue-200',
            });
          });
        });
    }

    if (phase === 'simulating') {
      logs.push({
        time: timeStr,
        department: selectedRole || '系统',
        message: '所有问题已作答完毕，提交至指挥部',
        color: 'text-green-200',
      });
      if (simulatingDept) {
        logs.push({
          time: timeStr,
          department: simulatingDept,
          message: 'AI正在模拟该部门应急响应答题...',
          color: 'text-blue-200',
        });
      }
    }

    if (phase === 'result' && result) {
      console.log('=== 结果页日志渲染 ===');
      console.log('metricLogs 总数:', result.metricLogs.length);
      console.log('departmentAnswers:', result.departmentAnswers);
      console.log('完整 metricLogs:', JSON.stringify(result.metricLogs, null, 2));

      logs.push({
        time: timeStr,
        department: '应急指挥部',
        message: `演练结束 — 答题: ${result.totalScore}/${result.maxScore} | 灾情控制: ${result.metricsScore}/100`,
        color: 'text-yellow-200',
      });

      result.metricLogs.forEach((ml, idx) => {
        ml.messages.forEach((msg, msgIdx) => {
          const deptName = ml.action.includes(':') ? ml.action.split(':')[0] : ml.action;
          logs.push({
            time: ml.time,
            department: deptName,
            message: msg,
            color: msg.startsWith('✓') ? 'text-green-200' : msg.startsWith('⚠') ? 'text-yellow-200' : 'text-blue-200',
          });
          if (idx < 5 || msgIdx < 2) {
            console.log(`日志[${idx}/${msgIdx}] ${deptName}: ${msg}`);
          }
        });
      });

      result.departmentAnswers.forEach(dept => {
        logs.push({
          time: timeStr,
          department: dept.departmentName,
          message: `得分：${dept.score}/${dept.totalScore}${dept.isPlayer ? ' (你)' : ''}`,
          color: dept.score === dept.totalScore ? 'text-green-200' : dept.score >= dept.totalScore / 2 ? 'text-yellow-200' : 'text-red-200',
        });
      });

      console.log('=== 日志渲染完成，最终日志条数:', logs.length, '===');
    }

    return logs;
  };

  const logs = getLogs();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-green-600">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        <span className="text-green-300 font-black text-base tracking-wider">指挥通信日志</span>
      </div>
      <div className="flex-1 space-y-2.5 overflow-auto min-h-0">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className="border border-green-800/60 bg-gray-900/80 p-3"
            style={{ borderRadius: '0', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-green-200 text-sm font-bold">{log.time}</span>
              <span className="text-yellow-300 text-sm font-bold">{log.department}</span>
            </div>
            <p className={`text-base font-semibold leading-relaxed ${log.color}`}>{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentBar({
  selectedLevel,
  selectedRole,
  phase,
  onSelectRole,
  onBackToRoleSelection,
}: {
  selectedLevel: ResponseLevel | null;
  selectedRole: string | null;
  phase: DrillPhase;
  onSelectRole: (fullName: string) => void;
  onBackToRoleSelection: () => void;
}) {
  if (!selectedLevel) {
    return (
      <div className="border-t-2 border-gray-800 bg-gray-950 p-3">
        <p className="text-gray-400 text-xs text-center font-bold">请先选择响应等级以查看相关部门</p>
      </div>
    );
  }

  const departments = selectedLevel.departments;

  return (
    <div className="border-t-2 border-gray-800 bg-gray-950 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-bold">应急响应岗位部门</span>
        {(phase === 'answering' || phase === 'role-selection') && selectedRole && (
          <button
            onClick={onBackToRoleSelection}
            className="text-xs text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1"
          >
            ← 重新选择角色
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {departments.map((dept, idx) => {
          const isSelected = selectedRole === dept.fullName;
          const isDisabled = phase !== 'role-selection' && !isSelected;
          const isHighest = idx === 0;

          return (
            <button
              key={dept.fullName}
              onClick={() => {
                if (phase === 'role-selection') {
                  onSelectRole(dept.fullName);
                }
              }}
              disabled={isDisabled}
              className={`flex-shrink-0 px-4 py-3 border-2 transition-all duration-200 min-w-[100px] ${
                isSelected
                  ? 'border-yellow-500 bg-yellow-600/20 scale-105'
                  : isDisabled
                    ? 'border-gray-700/30 bg-gray-900/20 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-900 hover:border-yellow-600 hover:bg-gray-800 cursor-pointer'
              }`}
              style={{ borderRadius: '0' }}
            >
              <div className="text-center">
                {isHighest && (
                  <div className="text-[10px] text-yellow-400 font-bold mb-1">★ 总指挥</div>
                )}
                <div className={`text-xs font-black ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                  {dept.name}
                </div>
                {dept.isNew && (
                  <div className="text-[10px] text-blue-300 mt-1 font-bold">新增</div>
                )}
                <div className={`text-[10px] mt-1 ${isSelected ? 'text-yellow-500' : 'text-gray-200'}`}>
                  {dept.sopTable.length}项职责
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}