import { Question, QuizSet, QuestionGenerationConfig, KnowledgeNode, ScoringCriteria, ScoringDimension } from './types';
import { getNodeById } from './knowledge-graph';

// 题目模板库 - 基于不同知识领域和难度
const QUESTION_TEMPLATES = {
  political_theory: {
    open_ended: [
      {
        template: "请结合{topic}的相关内容,阐述您对'{keyPoint}'的理解,并结合实际工作谈谈如何贯彻落实?",
        contextTemplate: "{topic}是党建工作的重要理论基础,对于指导实践具有重要意义。",
        scoringDimensions: [
          { name: '理论理解', description: '对核心概念和理论内涵的把握程度', weight: 0.3, maxPoints: 30 },
          { name: '实践应用', description: '理论联系实际的能力', weight: 0.4, maxPoints: 40 },
          { name: '逻辑表达', description: '论述的条理性和说服力', weight: 0.3, maxPoints: 30 }
        ]
      },
      {
        template: "在{topic}的学习中,'{keyPoint}'是一个重要观点。请分析这一观点的时代意义和实践要求。",
        contextTemplate: "当前形势下,{topic}面临着新的挑战和机遇,需要深入理解其核心要义。",
        scoringDimensions: [
          { name: '时代背景分析', description: '对当前形势的准确把握', weight: 0.25, maxPoints: 25 },
          { name: '理论阐释', description: '对观点的深入解读', weight: 0.35, maxPoints: 35 },
          { name: '实践路径', description: '具体落实措施的可操作性', weight: 0.4, maxPoints: 40 }
        ]
      }
    ],
    essay: [
      {
        template: "以'{keyPoint}'为主题,撰写一篇不少于800字的理论学习心得体会。",
        contextTemplate: "深入学习{topic},不断提升政治素养和理论水平。",
        hints: [
          "可从理论学习的重要性入手",
          "结合个人工作实际",
          "提出具体的改进措施"
        ],
        scoringDimensions: [
          { name: '主题明确', description: '紧扣主题,中心突出', weight: 0.2, maxPoints: 20 },
          { name: '内容充实', description: '论据充分,论证有力', weight: 0.35, maxPoints: 35 },
          { name: '联系实际', description: '结合工作实践', weight: 0.25, maxPoints: 25 },
          { name: '语言表达', description: '文字流畅,结构清晰', weight: 0.2, maxPoints: 20 }
        ]
      }
    ],
    case_analysis: [
      {
        template: "案例分析：某单位在推进{topic}工作中遇到了以下问题:{caseScenario}。请您运用所学知识分析问题成因,并提出解决方案。",
        contextTemplate: "案例来源于基层党建工作的实际情况,具有典型性和代表性。",
        scoringDimensions: [
          { name: '问题诊断', description: '准确识别问题本质', weight: 0.3, maxPoints: 30 },
          { name: '原因分析', description: '多角度剖析问题根源', weight: 0.3, maxPoints: 30 },
          { name: '方案可行性', description: '解决方案切实可行', weight: 0.4, maxPoints: 40 }
        ]
      }
    ],
    reflection: [
      {
        template: "通过学习{topic}相关内容,特别是关于'{keyPoint}'的部分,您最大的收获是什么?这对您今后的工作有何启发?",
        contextTemplate: "反思性学习有助于深化理解和促进知识内化。",
        scoringDimensions: [
          { name: '学习收获', description: '对学习内容的真实感悟', weight: 0.4, maxPoints: 40 },
          { name: '深度思考', description: '思考的深度和广度', weight: 0.3, maxPoints: 30 },
          { name: '行动导向', description: '对今后工作的指导意义', weight: 0.3, maxPoints: 30 }
        ]
      }
    ]
  },
  party_building: {
    open_ended: [
      {
        template: "在{topic}工作中,'{keyPoint}'是关键环节。请结合您所在单位的实际情况,说明如何做好这项工作?",
        contextTemplate: "{topic}是基层党组织建设的重要内容,需要规范化和制度化。",
        scoringDimensions: [
          { name: '政策掌握', description: '对相关规定的熟悉程度', weight: 0.3, maxPoints: 30 },
          { name: '实操能力', description: '具体操作流程的规范性', weight: 0.4, maxPoints: 40 },
          { name: '创新意识', description: '工作方法的创新性', weight: 0.3, maxPoints: 30 }
        ]
      }
    ],
    case_analysis: [
      {
        template: "情景模拟：作为党支部组织委员,您需要组织一次关于{topic}的主题党日活动。请设计活动方案并说明设计思路。",
        contextTemplate: "主题党日活动是党员教育的重要形式,需要精心策划和组织。",
        hints: [
          "明确活动目标和主题",
          "设计活动内容和形式",
          "考虑时间安排和人员分工",
          "制定预期效果评估标准"
        ],
        scoringDimensions: [
          { name: '方案完整性', description: '活动要素齐全', weight: 0.25, maxPoints: 25 },
          { name: '目标明确性', description: '活动目的清晰', weight: 0.2, maxPoints: 20 },
          { name: '内容针对性', description: '紧扣{topic}主题', weight: 0.3, maxPoints: 30 },
          { name: '可操作性', description: '方案切实可行', weight: 0.25, maxPoints: 25 }
        ]
      }
    ]
  },
  social_governance: {
    open_ended: [
      {
        template: "{topic}是当前社会治理的重点领域。请结合'{keyPoint}'的要求,分析基层治理中面临的挑战及应对策略。",
        contextTemplate: "加强和创新社会治理,是推进国家治理体系和治理能力现代化的重要内容。",
        scoringDimensions: [
          { name: '形势判断', description: '对现状的准确把握', weight: 0.25, maxPoints: 25 },
          { name: '问题分析', description: '对深层次问题的洞察', weight: 0.35, maxPoints: 35 },
          { name: '对策建议', description: '措施的针对性和有效性', weight: 0.4, maxPoints: 40 }
        ]
      }
    ],
    essay: [
      {
        template: "论述题：请以'提升{topic}能力'为题,结合公务员岗位职责,撰写一篇1500字左右的论文。",
        contextTemplate: "公务员是社会治理的中坚力量,需要具备专业化的能力素质。",
        hints: [
          "阐述{topic}能力的内涵和要求",
          "分析当前存在的问题",
          "提出提升路径和具体措施"
        ],
        scoringDimensions: [
          { name: '论点明确', description: '中心论点清晰', weight: 0.15, maxPoints: 15 },
          { name: '论证严密', description: '逻辑性强,层次分明', weight: 0.3, maxPoints: 30 },
          { name: '材料丰富', description: '论据充实可靠', weight: 0.25, maxPoints: 25 },
          { name: '对策可行', description: '措施具体可行', weight: 0.3, maxPoints: 30 }
        ]
      }
    ]
  },
  general: {
    open_ended: [
      {
        template: "请阐述您对'{keyPoint}'的理解,并结合{topic}的学习内容,说明其在实际工作中的指导作用。",
        contextTemplate: "理论学习最终要落实到实践中去,做到学以致用、知行合一。",
        scoringDimensions: [
          { name: '理解深度', description: '对概念的准确把握', weight: 0.35, maxPoints: 35 },
          { name: '应用能力', description: '理论联系实际', weight: 0.4, maxPoints: 40 },
          { name: '表达能力', description: '表述清晰有条理', weight: 0.25, maxPoints: 25 }
        ]
      },
      {
        template: "在学习{topic}的过程中,'{keyPoint}'给您留下了深刻印象。请分享您的学习体会,并说明如何在工作中践行这一理念。",
        contextTemplate: "学习贵在坚持,重在践行,要在转化上下功夫。",
        scoringDimensions: [
          { name: '学习感悟', description: '真实的个人体验', weight: 0.35, maxPoints: 35 },
          { name: '思考深度', description: '有独到见解', weight: 0.3, maxPoints: 30 },
          { name: '行动计划', description: '可行的落实举措', weight: 0.35, maxPoints: 35 }
        ]
      }
    ],
    reflection: [
      {
        template: "反思与总结：通过系统学习{topic}相关知识,请从以下三个维度进行总结：(1)知识层面的收获;(2)能力层面的提升;(3)未来努力方向。",
        contextTemplate: "定期总结反思是提升学习能力的重要方法。",
        scoringDimensions: [
          { name: '全面性', description: '三个维度都有涉及', weight: 0.3, maxPoints: 30 },
          { name: '真实性', description: '基于真实学习体验', weight: 0.3, maxPoints: 30 },
          { name: '建设性', description: '未来规划切实可行', weight: 0.4, maxPoints: 40 }
        ]
      }
    ]
  }
};

// 案例场景库
const CASE_SCENARIOS = {
  party_building: [
    "部分党员参加组织生活积极性不高,存在'重业务、轻党建'现象",
    "流动党员管理困难,组织关系转接不及时",
    "党组织活动形式单一,缺乏吸引力和感染力",
    "年轻党员培养力度不够,后备力量不足",
    "党建与业务工作'两张皮',融合不够紧密"
  ],
  social_governance: [
    "社区矛盾纠纷化解机制不完善,群众诉求渠道不畅通",
    "基层服务能力不足,难以满足居民多样化需求",
    "网格化管理效能有待提升,信息共享不畅",
    "社会组织参与度不高,多元共治格局尚未形成",
    "应急处突能力薄弱,风险防控体系不健全"
  ],
  general: [
    "工作中遇到的新情况新问题,现有制度办法难以完全适应",
    "部门间协调配合不够,存在推诿扯皮现象",
    "创新意识不强,习惯于按部就班开展工作",
    "服务意识和能力有待提升,群众满意度不够高"
  ]
};

// 根据节点确定题目类型分类
function getCategoryFromNode(node: KnowledgeNode): string {
  const nodeId = node.id.toLowerCase();
  const nodeName = node.name.toLowerCase();
  
  if (nodeId.includes('party') || nodeId.includes('constitution') || nodeId.includes('history') || 
      nodeId.includes('theory') || nodeName.includes('党') || nodeName.includes('理论') || 
      nodeName.includes('党史')) {
    return 'political_theory';
  }
  
  if (nodeId.includes('building') || nodeId.includes('organization') || nodeId.includes('member') ||
      nodeName.includes('建设') || nodeName.includes('组织') || nodeName.includes('发展党员')) {
    return 'party_building';
  }
  
  if (nodeId.includes('governance') || nodeId.includes('social') || nodeId.includes('community') ||
      nodeName.includes('治理') || nodeName.includes('社会') || nodeName.includes('基层')) {
    return 'social_governance';
  }
  
  return 'general';
}

// 获取节点的关键知识点
function getKeyPointsFromNode(node: KnowledgeNode): string[] {
  const keyPoints: string[] = [];
  
  if (node.keyPoints && node.keyPoints.length > 0) {
    keyPoints.push(...node.keyPoints);
  }
  
  if (node.description) {
    // 从描述中提取关键词
    const sentences = node.description.split(/[。！？;；]/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      keyPoints.push(...sentences.slice(0, 3));
    }
  }
  
  if (node.name) {
    keyPoints.push(node.name);
  }
  
  return [...new Set(keyPoints)].slice(0, 5); // 去重并限制数量
}

// 生成单个题目
function generateSingleQuestion(
  config: QuestionGenerationConfig,
  node: KnowledgeNode,
  questionIndex: number,
  availableTypes: ('open_ended' | 'essay' | 'case_analysis' | 'reflection')[]
): Question {
  const category = getCategoryFromNode(node);
  const templates = QUESTION_TEMPLATES[category] || QUESTION_TEMPLATES.general;
  
  // 选择题目类型
  let questionType: Question['type'];
  if (config.questionTypes && config.questionTypes.length > 0) {
    questionType = config.questionTypes[questionIndex % config.questionTypes.length];
  } else {
    questionType = availableTypes[questionIndex % availableTypes.length];
  }
  
  // 获取该类型的模板
  const typeTemplates = templates[questionType] || templates.open_ended;
  const templateData = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  
  // 获取关键知识点
  const keyPoints = getKeyPointsFromNode(node);
  const selectedKeyPoint = keyPoints[questionIndex % keyPoints.length] || node.name;
  
  // 替换模板中的占位符
  let content = templateData.template
    .replace(/{topic}/g, node.name)
    .replace(/{keyPoint}/g, selectedKeyPoint);
  
  // 如果是案例分析题,添加案例场景
  if (questionType === 'case_analysis' && content.includes('{caseScenario}')) {
    const scenarios = CASE_SCENARIOS[category] || CASE_SCENARIOS.general;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    content = content.replace(/{caseScenario}/g, scenario);
  }
  
  // 构建上下文
  let context = templateData.contextTemplate
    ?.replace(/{topic}/g, node.name)
    .replace(/{keyPoint}/g, selectedKeyPoint);
  
  // 如果配置包含视频上下文,添加提示
  if (config.includeVideoContext && node.courses && node.courses.length > 0) {
    const videoInfo = node.courses[0];
    context = `${context}\n\n参考学习资料：《${videoInfo.title}》(时长:${videoInfo.duration}分钟)`;
  }
  
  // 构建评分标准
  const scoringCriteria: ScoringCriteria = {
    dimensions: templateData.scoringDimensions?.map(dim => ({
      ...dim,
      description: dim.description.replace(/{topic}/g, node.name)
    })) || []
  };
  
  // 确定难度
  let difficulty: Question['difficulty'] = config.difficulty;
  if (questionType === 'essay') {
    difficulty = difficulty === 'easy' ? 'medium' : difficulty;
  }
  
  // 生成题目ID
  const questionId = `q_${node.id}_${questionIndex}_${Date.now()}`;
  
  // 计算满分
  const totalMaxScore = scoringCriteria.dimensions.reduce((sum, dim) => sum + dim.maxPoints, 0) || 100;
  
  return {
    id: questionId,
    type: questionType,
    title: `第${questionIndex + 1}题（${getQuestionTypeName(questionType)}，${totalMaxScore}分）`,
    content,
    context,
    hints: templateData.hints,
    scoringCriteria,
    difficulty,
    knowledgeNodeId: node.id,
    relatedTopics: [node.name],
    maxScore: totalMaxScore,
    timeLimit: questionType === 'essay' ? 60 : 30
  };
}

// 获取题目类型名称
function getQuestionTypeName(type: Question['type']): string {
  const names = {
    open_ended: '开放问答',
    essay: '论述写作',
    case_analysis: '案例分析',
    reflection: '学习反思'
  };
  return names[type] || '开放题';
}

// 主函数：生成题目集合
export function generateQuizSet(
  config: QuestionGenerationConfig,
  knowledgeGraph?: KnowledgeNode
): QuizSet {
  const questions: Question[] = [];
  const processedNodes: Set<string> = new Set();
  
  // 可用的题目类型（以开放题为主）
  const availableTypes: ('open_ended' | 'essay' | 'case_analysis' | 'reflection')[] = [
    'open_ended', 'open_ended', 'reflection', 'case_analysis', 'essay'
  ];
  
  // 为每个指定节点生成题目
  for (let i = 0; i < config.nodeIds.length && questions.length < config.questionCount; i++) {
    const nodeId = config.nodeIds[i];
    
    if (processedNodes.has(nodeId)) continue;
    
    const node = knowledgeGraph ? getNodeById(nodeId, knowledgeGraph) : null;
    if (!node) continue;
    
    processedNodes.add(nodeId);
    
    // 每个节点生成1-2道题
    const questionsPerNode = Math.min(
      2,
      Math.ceil(config.questionCount / config.nodeIds.length)
    );
    
    for (let j = 0; j < questionsPerNode && questions.length < config.questionCount; j++) {
      const question = generateSingleQuestion(
        config,
        node,
        questions.length,
        availableTypes
      );
      questions.push(question);
    }
  }
  
  // 如果题目还不够,补充通用题目
  while (questions.length < config.questionCount) {
    const genericQuestion: Question = {
      id: `q_generic_${questions.length}_${Date.now()}`,
      type: 'open_ended',
      title: `第${questions.length + 1}题（综合开放题，100分）`,
      content: `请结合本次学习的所有内容,选择一个您最感兴趣的知识点进行深入阐述,包括:(1)该知识点的主要内容;(2)您的理解和认识;(3)在实际工作中的应用设想。`,
      context: '本题旨在考察学员的综合学习效果和知识整合能力。',
      hints: [
        '可选择任意一个学习模块中的核心内容',
        '注重理论与实践的结合',
        '体现个人的思考和见解'
      ],
      scoringCriteria: {
        dimensions: [
          { name: '选题恰当', description: '选择的切入点合适', weight: 0.2, maxPoints: 20 },
          { name: '内容完整', description: '三个方面都涵盖', weight: 0.3, maxPoints: 30 },
          { name: '理解深刻', description: '有独到见解', weight: 0.3, maxPoints: 30 },
          { name: '表达清晰', description: '逻辑清晰,文字流畅', weight: 0.2, maxPoints: 20 }
        ]
      },
      difficulty: config.difficulty,
      relatedTopics: config.focusAreas || ['综合考核'],
      maxScore: 100,
      timeLimit: 45
    };
    questions.push(genericQuestion);
  }
  
  // 计算总分
  const totalScore = questions.reduce((sum, q) => sum + q.maxScore, 0);
  
  // 生成试卷标题
  const difficultyNames = {
    easy: '基础',
    medium: '进阶',
    hard: '挑战'
  };
  
  return {
    id: `quiz_${Date.now()}`,
    title: `AI智能组课 - ${difficultyNames[config.difficulty]}级考核`,
    description: `基于知识图谱智能生成的个性化考核题目,共${questions.length}道开放性试题,总分${totalScore}分。注重考查理论理解、实践应用和深度思考能力。`,
    questions,
    totalScore,
    timeLimit: questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0),
    generatedForNodes: config.nodeIds,
    createdAt: new Date()
  };
}

// 根据学习路径自动生成推荐题目配置
export function generateConfigFromLearningPath(
  pathId: string,
  nodeIds: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  questionCount: number = 5
): QuestionGenerationConfig {
  const difficultyMap = {
    beginner: 'easy' as const,
    intermediate: 'medium' as const,
    advanced: 'hard' as const
  };
  
  return {
    nodeIds,
    questionCount,
    difficulty: difficultyMap[difficulty],
    includeVideoContext: true,
    questionTypes: ['open_ended', 'reflection', 'case_analysis']
  };
}

// 导出辅助函数供组件使用
export { getQuestionTypeName, getCategoryFromNode };
