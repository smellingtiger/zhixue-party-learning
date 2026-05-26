import { NextRequest, NextResponse } from 'next/server';
import { disasterScenarios, getRoleById, getRequiredRoles, getScenariosByType, getAvailableDisasterTypes } from '@/lib/emergency-training-new';
import { ollamaChat } from '@/lib/emergency-ollama';

interface TrainingRequest {
  action: 'start' | 'select_role' | 'answer';
  scenarioId?: string;
  selectedRoleId?: string;
  selectedOption?: string;
  correctAnswer?: string;
  questionIndex?: number;
  score?: number;
  disasterType?: string;
}

const TOTAL_QUESTIONS = 5;

const EXAMINER_PERSONA = `你是应急指挥中心的AI考官，负责组织应急演练培训。你的任务是根据应急手册内容生成选择题、评价用户选择、推进场景。

## 核心规则
1. 所有问题必须是**四选一选择题**，格式为A/B/C/D
2. 只有一个正确答案，其他三个是看似合理但有明显缺陷的干扰选项
3. 正确答案必须严格基于应急手册的指令要求
4. 干扰选项要反映常见的决策误区或错误做法
5. 每次评价后要推进场景（灾情变化），让下一题的情境不同

## 你的说话风格
- 专业但亲切，像一位有经验的培训教官
- 使用"同志"称呼用户
- 场景描述要具体、有画面感、有紧迫感
- 反馈要明确指出为什么对/错，引用手册依据
- 鼓励正确选择，纠正错误选择时要耐心解释`;

const MCQ_SYSTEM_PROMPT = `${EXAMINER_PERSONA}

## 输出格式要求

### 生成问题时，严格按以下格式输出：
<question>
题目文字（一句话，要有场景感）
</question>
<options>
A. 选项A内容（具体可操作的行动）
B. 选项B内容
C. 选项C内容
D. 选项D内容
</options>
<correct>
正确答案字母（A/B/C/D）
</correct>

### 评价回答时，严格按以下格式输出：
<feedback>
对/错
</feedback>
<explanation>
详细解释为什么对/错，引用应急手册依据。如果错了要指出正确的做法。
</explanation>
<situation>
更新后的场景情况（2-3句话，体现灾情变化或新情况）
</situation>
<question>
下一题的文字
</question>
<options>
A. 选项A
B. 选项B
C. 选项C
D. 选项D
</options>
<correct>
正确答案字母
</correct>

### 最后一题（第5题）评价后，用以下格式：
<feedback>
对/错
</feedback>
<explanation>
详细解释
</explanation>
<summary>
对整个演练的总结评价（包括得分情况、表现亮点、需要改进的地方）
</summary>`;

function getStaticScenarioIntro(scenario: typeof disasterScenarios[0], requiredRoles: ReturnType<typeof getRequiredRoles>): string {
  return `【应急演练启动】${scenario.name}

📋 灾害类型：${scenario.type}
🚨 响应等级：${scenario.levelName}
📍 当前情况：${scenario.situation}

本次演练需要以下角色参与：
${requiredRoles.map(r => `  · ${r.department} - ${r.name}：${r.description}`).join('\n')}

请在右侧选择您要扮演的角色，开始实战演练！`;
}

function parseTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function parseQuestion(content: string) {
  const question = parseTag(content, 'question');
  const optionsText = parseTag(content, 'options');
  const correct = parseTag(content, 'correct').replace(/[^ABCD]/g, '').charAt(0) || 'A';

  const options: Array<{ id: string; text: string }> = [];
  const optionRegex = /([A-D])[.、]\s*([\s\S]+?)(?=\n[A-D][.、]|\n*$)/g;
  let match;
  while ((match = optionRegex.exec(optionsText)) !== null) {
    options.push({ id: match[1], text: match[2].trim() });
  }

  if (options.length === 0 && optionsText) {
    const lines = optionsText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const m = line.match(/^([A-D])[.、]\s*(.+)/);
      if (m) {
        options.push({ id: m[1], text: m[2].trim() });
      }
    }
  }

  return { question, options, correctAnswer: correct };
}

function buildQuestionPrompt(
  scenario: typeof disasterScenarios[0],
  role: NonNullable<ReturnType<typeof getRoleById>>,
  questionIndex: number,
  situationContext?: string
): string {
  const currentSituation = situationContext || scenario.situation;

  return `请为应急演练生成第${questionIndex}道选择题。

场景信息：
- 灾害类型：${scenario.type}
- 响应等级：${scenario.levelName}（${scenario.level}级）
- 当前情况：${currentSituation}

用户扮演的角色：【${role.department} ${role.name}】
角色描述：${role.description}

该角色在${scenario.level}级响应中的职责：
${role.description}

请根据以上信息，生成一道贴合场景的选择题：
- 题目要体现当前情境下的决策压力
- 正确选项应符合该角色的职责要求
- 3个错误选项要有迷惑性（如：跳过步骤、越权决策、时机不对等）
- 每个选项都要是具体的可操作行动

按格式输出。`;
}

function buildEvaluationPrompt(
  scenario: typeof disasterScenarios[0],
  role: NonNullable<ReturnType<typeof getRoleById>>,
  questionIndex: number,
  questionText: string,
  options: Array<{ id: string; text: string }>,
  correctAnswer: string,
  selectedOption: string,
  score: number,
  currentSituation: string
): string {
  const isLastQuestion = questionIndex >= TOTAL_QUESTIONS;

  const optionsText = options.map(o => `${o.id}. ${o.text}`).join('\n');

  const nextPrompt = isLastQuestion
    ? '这是最后一道题，评价后请给出演练总结（使用summary标签）'
    : `评价后请生成第${questionIndex + 1}道选择题，场景需要更新到下一个阶段`;

  return `用户正在参加应急演练，当前是第${questionIndex}/${TOTAL_QUESTIONS}题。

场景信息：
- 灾害类型：${scenario.type}
- 响应等级：${scenario.levelName}
- 当前情况：${currentSituation}

用户扮演：【${role.department} ${role.name}】

当前题目：${questionText}

选项：
${optionsText}

正确答案是：${correctAnswer}
用户选择了：${selectedOption}

用户当前得分：${score}/${questionIndex - 1}

该角色的职责：
${role.description}

请评价用户的选择是否正确，给出详细解释，然后${nextPrompt}。`;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrainingRequest = await request.json();
    const { action, scenarioId, selectedRoleId, selectedOption, correctAnswer, questionIndex, score, disasterType } = body;

    if (action === 'start') {
      return await handleStart(disasterType);
    }

    if (action === 'select_role' && scenarioId && selectedRoleId) {
      return await handleSelectRole(scenarioId, selectedRoleId);
    }

    if (action === 'answer' && scenarioId && selectedRoleId && selectedOption && correctAnswer) {
      return await handleAnswer(scenarioId, selectedRoleId, selectedOption, correctAnswer, questionIndex || 1, score || 0);
    }

    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('Training API error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

async function handleStart(disasterType?: string) {
  let scenario;
  
  if (disasterType) {
    const scenarios = getScenariosByType(disasterType);
    scenario = scenarios.length > 0 ? scenarios[Math.floor(Math.random() * scenarios.length)] : disasterScenarios[0];
  } else {
    scenario = disasterScenarios[Math.floor(Math.random() * disasterScenarios.length)];
  }
  
  const requiredRoles = getRequiredRoles(scenario.id);

  let message: string;
  try {
    const prompt = `有一个新的应急演练场景，请你作为考官介绍这个场景：

场景信息：
- 灾害类型：${scenario.type}
- 响应等级：${scenario.levelName}
- 场景描述：${scenario.description}
- 当前情况：${scenario.situation}

需要参与的角色：
${requiredRoles.map(r => `- ${r.department} ${r.name}：${r.description}`).join('\n')}

请用100-150字介绍这个场景，说明当前情况和需要的角色，引导用户选择扮演其中一个角色。`;

    message = await ollamaChat([{ role: 'system', content: EXAMINER_PERSONA }, { role: 'user', content: prompt }]);
  } catch (llmError) {
    console.warn('LLM unavailable, using static scenario intro:', (llmError as Error).message);
    message = getStaticScenarioIntro(scenario, requiredRoles);
  }

  return NextResponse.json({
    type: 'scenario',
    scenario,
    requiredRoles,
    message,
    totalQuestions: TOTAL_QUESTIONS
  });
}

async function handleSelectRole(scenarioId: string, roleId: string) {
  const scenario = disasterScenarios.find(s => s.id === scenarioId);
  const role = getRoleById(roleId);

  if (!scenario || !role) {
    return NextResponse.json({ error: '场景或角色不存在' }, { status: 400 });
  }

  try {
    const prompt = buildQuestionPrompt(scenario, role, 1);

    const rawOutput = await ollamaChat([
      { role: 'system', content: MCQ_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const questionData = parseQuestion(rawOutput);

    if (!questionData.question || questionData.options.length < 2) {
      throw new Error('Failed to parse question from LLM output');
    }

    return NextResponse.json({
      type: 'question',
      role,
      questionText: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestion: 1,
      score: 0
    });
  } catch (llmError) {
    console.warn('LLM question generation failed:', (llmError as Error).message);

    const fallbackQuestion = generateFallbackQuestion(scenario, role, 1);
    return NextResponse.json({
      type: 'question',
      role,
      ...fallbackQuestion,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestion: 1,
      score: 0
    });
  }
}

async function handleAnswer(
  scenarioId: string,
  roleId: string,
  selectedOption: string,
  correctAnswer: string,
  questionIndex: number,
  score: number
) {
  const scenario = disasterScenarios.find(s => s.id === scenarioId);
  const role = getRoleById(roleId);

  if (!scenario || !role) {
    return NextResponse.json({ error: '场景或角色不存在' }, { status: 400 });
  }

  try {
    const isCorrect = selectedOption.toUpperCase() === correctAnswer.toUpperCase();
    const newScore = isCorrect ? score + 1 : score;

    const prompt = buildEvaluationPrompt(
      scenario, role,
      questionIndex, '', [],
      correctAnswer, selectedOption, newScore,
      scenario.situation
    );

    const rawOutput = await ollamaChat([
      { role: 'system', content: MCQ_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const feedbackResult = parseTag(rawOutput, 'feedback');
    const explanation = parseTag(rawOutput, 'explanation');
    const situation = parseTag(rawOutput, 'situation');
    const summary = parseTag(rawOutput, 'summary');

    const isLastQuestion = questionIndex >= TOTAL_QUESTIONS;

    if (isLastQuestion) {
      return NextResponse.json({
        type: 'complete',
        isCorrect,
        explanation: explanation || (isCorrect ? '回答正确！' : '回答有误，请参考手册。'),
        summary: summary || `演练结束。最终得分：${newScore}/${TOTAL_QUESTIONS}`,
        totalQuestions: TOTAL_QUESTIONS,
        currentQuestion: questionIndex,
        score: newScore
      });
    }

    const nextQuestionData = parseQuestion(rawOutput);

    return NextResponse.json({
      type: 'feedback',
      isCorrect,
      explanation: explanation || (isCorrect ? '回答正确！' : '回答有误，请参考手册。'),
      situationUpdate: situation || scenario.situation,
      nextQuestion: nextQuestionData.question ? {
        questionText: nextQuestionData.question,
        options: nextQuestionData.options,
        correctAnswer: nextQuestionData.correctAnswer
      } : null,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestion: questionIndex + 1,
      score: newScore
    });
  } catch (llmError) {
    console.warn('LLM evaluation failed:', (llmError as Error).message);

    const isCorrect = selectedOption.toUpperCase() === correctAnswer.toUpperCase();
    const newScore = isCorrect ? score + 1 : score;

    if (questionIndex >= TOTAL_QUESTIONS) {
      return NextResponse.json({
        type: 'complete',
        isCorrect,
        explanation: isCorrect ? '回答正确！' : '回答有误。',
        summary: `演练结束。最终得分：${newScore}/${TOTAL_QUESTIONS}。${
          newScore >= 4 ? '表现优秀，对应急手册掌握扎实！' :
          newScore >= 3 ? '基本合格，建议加强对应急手册的学习。' :
          '需要加强学习，建议重新学习应急标准化处置流程手册。'
        }`,
        totalQuestions: TOTAL_QUESTIONS,
        currentQuestion: questionIndex,
        score: newScore
      });
    }

    const fallbackQuestion = generateFallbackQuestion(scenario, role, questionIndex + 1);
    return NextResponse.json({
      type: 'feedback',
      isCorrect,
      explanation: isCorrect ? '回答正确！' : '回答有误。请参考应急手册中的标准处置流程。',
      situationUpdate: scenario.situation,
      nextQuestion: fallbackQuestion,
      totalQuestions: TOTAL_QUESTIONS,
      currentQuestion: questionIndex + 1,
      score: newScore
    });
  }
}

function generateFallbackQuestion(
  scenario: typeof disasterScenarios[0],
  role: NonNullable<ReturnType<typeof getRoleById>>,
  questionIndex: number
) {
  const actions = [
    `按照${scenario.level}级响应预案启动相关工作`,
    '立即向上级领导汇报当前情况',
    '组织本部门人员到位待命',
    '与相关部门建立实时沟通渠道',
    '启动应急物资储备检查',
    '发布针对性预警通知',
    '协调专业救援力量',
    '评估当前风险等级'
  ];

  const correctIdx = Math.min(questionIndex - 1, actions.length - 1);
  const shuffled = [...actions].sort(() => Math.random() - 0.5);
  const correctPos = shuffled.indexOf(actions[correctIdx]);
  
  const options = shuffled.slice(0, 4).map((action, idx) => ({
    id: OPTION_LABELS[idx],
    text: action
  }));

  return {
    questionText: `【第${questionIndex}题】作为${role.department}${role.name}，在当前${scenario.type}${scenario.levelName}情况下，您首先应该采取什么行动？`,
    options,
    correctAnswer: OPTION_LABELS[correctPos >= 0 && correctPos < 4 ? correctPos : 0]
  };
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];