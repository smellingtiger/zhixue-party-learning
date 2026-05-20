import { ChapterQuiz, QuizQuestion } from './quiz-types';

const embodiedAIQuestions: QuizQuestion[] = [
  {
    id: 'emb-1',
    type: 'single',
    question: '具身智能的核心定义是什么？',
    options: [
      { id: 'A', label: 'A', text: '纯软件形式的人工智能系统' },
      { id: 'B', label: 'B', text: '"有物理载体的智能体"，强调通过身体与环境交互实现自主学习' },
      { id: 'C', label: 'C', text: '传统工业机器人的自动化升级' },
      { id: 'D', label: 'D', text: '仅限于人形机器人的智能技术' }
    ],
    correctAnswer: 'B',
    explanation: '具身智能（Embodied Intelligence）是人工智能与机器人学交叉的前沿领域，强调智能体通过身体与环境的动态交互实现自主学习和进化，其核心在于将感知、行动与认知深度融合。',
    knowledgePoint: '基本概念',
    difficulty: 'easy'
  },
  {
    id: 'emb-2',
    type: 'single',
    question: '具身智能的"五步闭环"包括哪些环节？',
    options: [
      { id: 'A', label: 'A', text: '输入→处理→输出→存储→反馈' },
      { id: 'B', label: 'B', text: '感知→认知→决策→执行→反馈' },
      { id: 'C', label: 'C', text: '采集→分析→规划→实施→评估' },
      { id: 'D', label: 'D', text: '检测→识别→推理→控制→优化' }
    ],
    correctAnswer: 'B',
    explanation: '具身智能的核心运行机制是"五步闭环"：感知（多模态传感器）→认知（世界模型/大模型理解）→决策（任务规划与推理）→执行（本体运动与操作控制）→反馈（环境响应/结果评估）。',
    knowledgePoint: '核心机制',
    difficulty: 'medium'
  },
  {
    id: 'emb-3',
    type: 'true_false',
    question: '"自动"和"自主"在具身智能中是相同的概念。',
    options: [
      { id: 'A', label: '正确', text: '对，两者含义一致' },
      { id: 'B', label: '错误', text: '错，两者有本质区别' }
    ],
    correctAnswer: 'B',
    explanation: '自动≠自主。"自动"是按预设路线运行，遇障即停；"自主"能感知障碍后绕行，具备"识变-应变-求变"的能力。自主=五步闭环的完整运行。',
    knowledgePoint: '概念辨析',
    difficulty: 'easy'
  },
  {
    id: 'emb-4',
    type: 'single',
    question: '世界模型在具身智能中的关键作用是什么？',
    options: [
      { id: 'A', label: 'A', text: '提高机器人的运行速度' },
      { id: 'B', label: 'B', text: '降低硬件成本' },
      { id: 'C', label: 'C', text: '作为"常识模拟器"，预测物理后果，形成经验闭环' },
      { id: 'D', label: 'D', text: '替代人工编程' }
    ],
    correctAnswer: 'C',
    explanation: '世界模型是机器人脑中的"常识模拟器"，能在行动前预演物理后果。通过"预测—执行—修正"形成经验闭环，决定具身智能能否进入真实复杂场景，是走向自主的关键一跃。',
    knowledgePoint: '关键技术',
    difficulty: 'medium'
  },
  {
    id: 'emb-5',
    type: 'multiple',
    question: '具身智能在公共治理领域的四大应用场景包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '城市运行与设施养护' },
      { id: 'B', label: 'B', text: '应急管理与安全生产' },
      { id: 'C', label: 'C', text: '民生服务与无障碍辅助' },
      { id: 'D', label: 'D', text: '生态环境与自然资源' },
      { id: 'E', label: 'E', text: '金融投资与证券交易' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '具身智能在政务领域聚焦四大板块：城市运行与设施养护、应急管理与安全生产、民生服务与无障碍辅助、生态环境与自然资源。每项场景配有代表性任务、本体形态和落地案例。',
    knowledgePoint: '应用场景',
    difficulty: 'medium'
  },
  {
    id: 'emb-6',
    type: 'single',
    question: '评估具身智能项目的"六问"论证清单不包括以下哪项？',
    options: [
      { id: 'A', label: 'A', text: '真实场景可得与权限合规' },
      { id: 'B', label: 'B', text: '闭环是否完整' },
      { id: 'C', label: 'C', text: '项目负责人的学历背景' },
      { id: 'D', label: 'D', text: '安全与伦理如何落实' }
    ],
    correctAnswer: 'C',
    explanation: '六问论证清单包括：①真实场景可得与权限合规？②闭环是否完整？③数据与仿真资源是否可持续？④评估方案是否明确？⑤安全与伦理如何落实？⑥经济与社会效益如何度量？不包括学历背景。',
    knowledgePoint: '项目评估',
    difficulty: 'hard'
  },
  {
    id: 'emb-7',
    type: 'multiple',
    question: '具身智能治理的"三要素"是什么？（多选）',
    options: [
      { id: 'A', label: 'A', text: '可解释：决策留痕可追溯' },
      { id: 'B', label: 'B', text: '可评估：指标先行数据说话' },
      { id: 'C', label: 'C', text: '可监管：权限分级日志不可篡改' },
      { id: 'D', label: 'D', text: '可复制：模式统一快速推广' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '具身智能治理的三要素：可解释（决策留痕可追溯）、可评估（指标先行数据说话）、可监管（权限分级日志不可篡改）。先治理后扩展，先试点再推广。',
    knowledgePoint: '治理要求',
    difficulty: 'medium'
  },
  {
    id: 'emb-8',
    type: 'true_false',
    question: '具身智能采购时应盲目追求"人形"机器人形态。',
    options: [
      { id: 'A', label: '正确', text: '对，人形是最优形态' },
      { id: 'B', label: '错误', text: '错，应根据实际场景选择合适形态' }
    ],
    correctAnswer: 'B',
    explanation: '政务场景采购不应盲目追求"人形"。不同应用场景需要不同的本体形态：四足机器狗适合巡检、轮臂式适合维修、无人机适合监测等。关键是功能适配而非外形模仿。',
    knowledgePoint: '实践误区',
    difficulty: 'easy'
  },
  {
    id: 'emb-9',
    type: 'single',
    question: '2025年《政府工作报告》首次将什么写入未来产业培育清单？',
    options: [
      { id: 'A', label: 'A', text: '量子计算' },
      { id: 'B', label: 'B', text: '6G通信技术' },
      { id: 'C', label: 'C', text: '具身智能' },
      { id: 'D', label: 'D', text: '区块链' }
    ],
    correctAnswer: 'C',
    explanation: '2025年"具身智能"首次写入《政府工作报告》，列入生物制造、量子科技、6G等未来产业培育清单。2026年进一步提出"打造智能经济新形态"。这意味着具身智能已从实验室概念完成向国家战略高地的跃迁。',
    knowledgePoint: '政策背景',
    difficulty: 'easy'
  },
  {
    id: 'emb-10',
    type: 'single',
    question: '传统大模型在物理世界频频出错的根本原因不包括？',
    options: [
      { id: 'A', label: 'A', text: '物理噪声：光照变化、遮挡、摩擦力差异' },
      { id: 'B', label: 'B', text: '长尾情境：现实corner case远超训练数据覆盖' },
      { id: 'C', label: 'C', text: '域差（Sim2Real Gap）：仿真与真实世界差距' },
      { id: 'D', label: 'D', text: '算法复杂度过高导致计算资源不足' }
    ],
    correctAnswer: 'D',
    explanation: '传统大模型在数字空间表现惊艳但落地失手的三大根本原因：①物理噪声（光照、遮挡、摩擦力差异）；②长尾情境（现实corner case远超训练数据）；③域差Sim2Real Gap（仿真环境与真实世界的差距）。算法复杂度不是主要问题。',
    knowledgePoint: '技术挑战',
    difficulty: 'hard'
  }
];

const ruralRevitalizationQuestions: QuizQuestion[] = [
  {
    id: 'rural-1',
    type: 'single',
    question: '乡村振兴的"二十字方针"是什么？',
    options: [
      { id: 'A', label: 'A', text: '产业兴旺、生态宜居、乡风文明、治理有效、生活富裕' },
      { id: 'B', label: 'B', text: '生产发展、生活宽裕、乡风文明、村容整洁、管理民主' },
      { id: 'C', label: 'C', text: '经济发展、社会进步、文化繁荣、生态优美、政治清明' },
      { id: 'D', label: 'D', text: '农业强、农村美、农民富、生态好、文化兴' }
    ],
    correctAnswer: 'A',
    explanation: '党的十九大提出乡村振兴战略，其核心目标概括为"二十字方针"：产业兴旺、生态宜居、乡风文明、治理有效、生活富裕。这是一个全方位、多领域的系统工程。',
    knowledgePoint: '核心理念',
    difficulty: 'easy'
  },
  {
    id: 'rural-2',
    type: 'true_false',
    question: '"扶贫"解决的是"有没有"的问题，"振兴"解决的是"好不好"的问题。',
    options: [
      { id: 'A', label: '正确', text: '对，这是两者的本质区别' },
      { id: 'B', label: '错误', text: '错，两者没有区别' }
    ],
    correctAnswer: 'A',
    explanation: '脱贫攻坚解决的是"有没有"的问题——让贫困人口摆脱绝对贫困；乡村振兴解决的是"好不好"的问题——让乡村成为安居乐业的美好家园。这是从"脱贫"到"振兴"的战略转段。',
    knowledgePoint: '概念辨析',
    difficulty: 'easy'
  },
  {
    id: 'rural-3',
    type: 'multiple',
    question: '乡村振兴的"五大振兴"包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '产业振兴（根基）' },
      { id: 'B', label: 'B', text: '人才振兴（支撑）' },
      { id: 'C', label: 'C', text: '文化振兴（灵魂）' },
      { id: 'D', label: 'D', text: '生态振兴（底线）' },
      { id: 'E', label: 'E', text: '组织振兴（保障）' },
      { id: 'F', label: 'F', text: '教育振兴（基础）' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D', 'E'],
    explanation: '乡村振兴的核心推进机制是"五大振兴"协同驱动：产业振兴（根基）→人才振兴（支撑）→文化振兴（灵魂）→生态振兴（底线）→组织振兴（保障）。通过系统思维破解单点困境。',
    knowledgePoint: '核心框架',
    difficulty: 'medium'
  },
  {
    id: 'rural-4',
    type: 'single',
    question: '乡村振兴不是以下哪种情况？',
    options: [
      { id: 'A', label: 'A', text: '仅靠财政补贴和转移支付' },
      { id: 'B', label: 'B', text: '城镇化的翻版，把乡村变成城市' },
      { id: 'C', label: 'C', text: '仅仅搞传统农业种植' },
      { id: 'D', label: 'D', text: '增强内生发展动力，多元化产业发展' }
    ],
    correctAnswer: 'D',
    explanation: '乡村振兴有三个关键区分：①不是仅靠财政补贴，而是增强内生动力；②不是城镇化翻版，而是各美其美；③不仅仅搞农业，还包括加工、旅游、电商等多元路径。D选项是正确的做法。',
    knowledgePoint: '实践误区',
    difficulty: 'medium'
  },
  {
    id: 'rural-5',
    type: 'single',
    question: '合作社模式的核心公式是什么？',
    options: [
      { id: 'A', label: 'A', text: '资金 + 技术 + 市场' },
      { id: 'B', label: 'B', text: '党建引领 × 群众参与 × 市场对接' },
      { id: 'C', label: 'C', text: '政府 + 企业 + 农户' },
      { id: 'D', label: 'D', text: '规模 + 品牌 + 渠道' }
    ],
    correctAnswer: 'B',
    explanation: '合作社 = 党建引领 × 群众参与 × 市场对接。从单打独斗到抱团发展，从看天吃饭到品牌溢价。因地制宜、因村施策，是乡村振兴的关键制度创新。',
    knowledgePoint: '关键制度',
    difficulty: 'medium'
  },
  {
    id: 'rural-6',
    type: 'multiple',
    question: '乡村振兴项目论证的"六问"包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '产业基础是否真实？' },
      { id: 'B', label: 'B', text: '群众意愿是否充分？' },
      { id: 'C', label: 'C', text: '组织保障是否到位？' },
      { id: 'D', label: 'D', text: '资金方案是否可持续？' },
      { id: 'E', label: 'E', text: '生态红线是否严守？' },
      { id: 'F', label: 'F', text: '评估方案是否明确？' },
      { id: 'G', label: 'G', text: '项目负责人资历如何？' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D', 'E', 'F'],
    explanation: '乡村振兴项目论证六问：①产业基础是否真实？②群众意愿是否充分？③组织保障是否到位？④资金方案是否可持续？⑤生态红线是否严守？⑥评估方案是否明确？帮助机关干部识别"伪振兴"项目。',
    knowledgePoint: '项目评估',
    difficulty: 'hard'
  },
  {
    id: 'rural-7',
    type: 'true_false',
    question: '乡村振兴应该只听汇报材料做决策。',
    options: [
      { id: 'A', label: '正确', text: '对，汇报材料最权威' },
      { id: 'B', label: '错误', text: '错，必须深入田间地头多源交叉验证' }
    ],
    correctAnswer: 'B',
    explanation: '习近平总书记强调："乡村振兴不是坐享其成，等不来、也送不来，要靠广大农民奋斗。"不能仅凭单一汇报材料做判断，必须深入田间地头多源交叉验证：村民访谈、实地察看、财务核查、横向对比。',
    knowledgePoint: '工作方法',
    difficulty: 'easy'
  },
  {
    id: 'rural-8',
    type: 'single',
    question: '乡村振兴治理的"三要素"是什么？',
    options: [
      { id: 'A', label: 'A', text: '可落地、可评估、可推广' },
      { id: 'B', label: 'B', text: '可解释、可评估、可监管' },
      { id: 'C', label: 'C', text: '可复制、可量化、可持续' },
      { id: 'D', label: 'D', text: '可操作、可监控、可优化' }
    ],
    correctAnswer: 'A',
    explanation: '乡村振兴治理三要素：可落地（从纸面到地面）、可评估（指标量化数据说话）、可推广（做成一个带动一片）。先试点后推广，先组织后放活。',
    knowledgePoint: '治理要求',
    difficulty: 'medium'
  },
  {
    id: 'rural-9',
    type: 'single',
    question: '"春雨润苗"专项行动的服务对象主要是？',
    options: [
      { id: 'A', label: 'A', text: '大型国有企业' },
      { id: 'B', label: 'B', text: '小微经营主体' },
      { id: 'C', label: 'C', text: '外商投资企业' },
      { id: 'D', label: 'D', text: '政府机构' }
    ],
    correctAnswer: 'B',
    explanation: '"春雨润苗"专项行动聚焦护航小微、合规发展主题，至今已连续开展五年，累计服务小微经营主体1.8亿户次。2026年再升级至九部门联合，推出4个方面15项50条服务举措。',
    knowledgePoint: '政策实践',
    difficulty: 'medium'
  },
  {
    id: 'rural-10',
    type: 'multiple',
    question: '调研时应该采用哪些验证方式？（多选）',
    options: [
      { id: 'A', label: 'A', text: '村民访谈（入户走访、院坝会座谈）' },
      { id: 'B', label: 'B', text: '实地察看（不看样板间，看随机抽取自然村）' },
      { id: 'C', label: 'C', text: '财务核查（村级财务账目、合作社分红记录）' },
      { id: 'D', label: 'D', text: '横向对比（同类地区、同类项目成效比较）' },
      { id: 'E', label: 'E', text: '材料汇报（仅依据项目实施方案）' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '群众路线思维要求多源交叉验证：村民访谈★★★★★、实地察看★★★★★、财务核查★★★★、横向对比★★★、材料汇报★（需交叉验证）。不能仅凭单一汇报材料做判断。',
    knowledgePoint: '调研方法',
    difficulty: 'hard'
  }
];

export const quizDatabase: Record<string, QuizQuestion[]> = {
  embodied_ai: embodiedAIQuestions,
  rural_revitalization: ruralRevitalizationQuestions
};

export function getChapterQuiz(courseName: string, chapterId: number | string, chapterTitle: string): ChapterQuiz | null {
  let questions: QuizQuestion[] = [];
  
  if (courseName.includes('具身智能')) {
    questions = quizDatabase.embodied_ai;
  } else if (courseName.includes('乡村振兴')) {
    questions = quizDatabase.rural_revitalization;
  } else {
    return null;
  }

  const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffledQuestions.slice(0, Math.min(5, shuffledQuestions.length));

  return {
    chapterId,
    chapterTitle,
    questions: selectedQuestions,
    totalQuestions: selectedQuestions.length,
    timeLimit: 300
  };
}

export function generateAISuggestion(result: {
  score: number;
  totalQuestions: number;
  wrongAnswers: QuizQuestion[];
}): string {
  const percentage = (result.score / result.totalQuestions) * 100;
  
  if (percentage >= 90) {
    return `🎉 太棒了！您对本章内容的掌握非常扎实（得分：${result.score}/${result.totalQuestions}）。建议您可以开始下一章的学习，或者深入研究本章的高级应用场景。继续保持这种学习状态！`;
  } else if (percentage >= 70) {
    const weakPoints = result.wrongAnswers.slice(0, 2).map(q => q.knowledgePoint).join('、');
    return `👍 不错！您已经掌握了本章的大部分核心内容（得分：${result.score}/${result.totalQuestions}）。建议重点复习以下知识点：${weakPoints}。可以重新查看相关章节内容后再试一次。`;
  } else if (percentage >= 50) {
    const weakPoints = result.wrongAnswers.map(q => q.knowledgePoint).join('、');
    return `💪 继续加油！您对章节有了初步了解（得分：${result.score}/${result.totalQuestions}），但还需要加强理解。建议您：\n1. 重新学习本章的重点内容\n2. 特别关注：${weakPoints}\n3. 结合实际案例加深理解\n4. 完成复习后再次测试`;
  } else {
    const weakPoints = result.wrongAnswers.map(q => q.knowledgePoint).join('、');
    return `📚 需要加强学习（得分：${result.score}/${result.totalQuestions}）。别灰心！建议您：\n1. 从头开始认真学习本章内容\n2. 重点理解基础概念：${weakPoints}\n3. 做好学习笔记，标记不理解的地方\n4. 观看相关视频讲解\n5. 完成系统复习后再次挑战`;
  }
}
