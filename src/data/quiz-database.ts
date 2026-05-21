import { ChapterQuiz, QuizQuestion } from '@/lib/quiz-types';

const embodiedAIQuestions: QuizQuestion[] = [
  // ========== 前言：课程定位 ==========
  {
    id: 'emb-ch1-1',
    type: 'single',
    question: '具身智能首次写入《政府工作报告》是在哪一年？',
    options: [
      { id: 'A', label: 'A', text: '2024年' },
      { id: 'B', label: 'B', text: '2025年' },
      { id: 'C', label: 'C', text: '2026年' },
      { id: 'D', label: 'D', text: '2027年' }
    ],
    correctAnswer: 'B',
    explanation: '2025年"具身智能"首次写入《政府工作报告》，列入生物制造、量子科技、6G等未来产业培育清单。2026年进一步提出"打造智能经济新形态"。',
    knowledgePoint: '政策背景',
    difficulty: 'easy'
  },
  {
    id: 'emb-ch1-2',
    type: 'single',
    question: '据国务院发展研究中心报告，我国具身智能产业市场规模2030年有望达到多少？',
    options: [
      { id: 'A', label: 'A', text: '1000亿元' },
      { id: 'B', label: 'B', text: '2000亿元' },
      { id: 'C', label: 'C', text: '4000亿元' },
      { id: 'D', label: 'D', text: '10000亿元' }
    ],
    correctAnswer: 'C',
    explanation: '国务院发展研究中心发布的《中国发展报告2025》预计，我国具身智能产业市场规模有望在2030年达到4000亿元，2035年突破万亿元。',
    knowledgePoint: '市场规模',
    difficulty: 'easy'
  },

  // ========== 第1章：定义与核心三要素 ==========
  {
    id: 'emb-ch2-1',
    type: 'single',
    question: 'ITU-T F.748.66标准对具身智能的定义是什么？',
    options: [
      { id: 'A', label: 'A', text: '纯软件形式的人工智能系统' },
      { id: 'B', label: 'B', text: '与物理实体融合的AI，能够自主与物理世界交互并适应环境' },
      { id: 'C', label: 'C', text: '传统工业机器人的自动化升级系统' },
      { id: 'D', label: 'D', text: '仅限人形机器人的智能技术标准' }
    ],
    correctAnswer: 'B',
    explanation: '国际电信联盟ITU-T F.748.66标准定义：具身智能指与物理实体融合的人工智能，能够自主与物理世界交互并适应环境，在传统AI基础上增加了认知、协作和学习三个主要功能。',
    knowledgePoint: '基本概念',
    difficulty: 'easy'
  },
  {
    id: 'emb-ch2-2',
    type: 'true_false',
    question: '具身智能等于"AI加上传统机器人"的简单组合。',
    options: [
      { id: 'A', label: '正确', text: '对，两者相加即可' },
      { id: 'B', label: '错误', text: '错，核心在于感知行动认知深度融合的闭环' }
    ],
    correctAnswer: 'B',
    explanation: '具身智能≠"AI+机器人"。核心三要素：具身本体（物理载体）、智能内核（大模型/多模态）和环境交互（第一人称视角动态交互与自适应学习），三者构成闭环智能系统。',
    knowledgePoint: '核心三要素',
    difficulty: 'medium'
  },
  {
    id: 'emb-ch2-3',
    type: 'single',
    question: '以下哪项是对"自动"与"自主"的正确理解？',
    options: [
      { id: 'A', label: 'A', text: '自动和自主在具身智能中是相同的概念' },
      { id: 'B', label: 'B', text: '自动按预设运行遇障即停，自主能识变应变求变' },
      { id: 'C', label: 'C', text: '自动比自主更高级' },
      { id: 'D', label: 'D', text: '自主指完全不需要人类干预' }
    ],
    correctAnswer: 'B',
    explanation: '自动≠自主。自动是按预设路线运行，遇障即停；自主能感知障碍后绕行，具备"识变-应变-求变"能力。自主=五步闭环的完整运行。',
    knowledgePoint: '概念辨析',
    difficulty: 'medium'
  },

  // ========== 第2章：核心机制与关键技术 ==========
  {
    id: 'emb-ch3-1',
    type: 'single',
    question: '具身智能的"五步闭环"是什么？',
    options: [
      { id: 'A', label: 'A', text: '输入→处理→输出→存储→反馈' },
      { id: 'B', label: 'B', text: '感知→认知→决策→执行→反馈' },
      { id: 'C', label: 'C', text: '采集→分析→规划→实施→评估' },
      { id: 'D', label: 'D', text: '检测→识别→推理→控制→优化' }
    ],
    correctAnswer: 'B',
    explanation: '五步闭环：感知（多模态传感器）→认知（世界模型/大模型理解）→决策（任务规划与推理）→执行（本体运动与操作控制）→反馈（环境响应/结果评估）。',
    knowledgePoint: '核心机制',
    difficulty: 'medium'
  },
  {
    id: 'emb-ch3-2',
    type: 'single',
    question: '世界模型在具身智能中的关键作用是什么？',
    options: [
      { id: 'A', label: 'A', text: '提高机器人运行速度' },
      { id: 'B', label: 'B', text: '作为常识模拟器，预测物理后果形成经验闭环' },
      { id: 'C', label: 'C', text: '降低硬件采购成本' },
      { id: 'D', label: 'D', text: '替代所有人工编程工作' }
    ],
    correctAnswer: 'B',
    explanation: '世界模型是机器人脑中的"常识模拟器"，通过"预测—执行—修正"形成经验闭环。杨立昆认为机器人通用用途取决于世界模型的进展，是走向自主的关键一跃。',
    knowledgePoint: '世界模型',
    difficulty: 'hard'
  },
  {
    id: 'emb-ch3-3',
    type: 'multiple',
    question: '具身智能的五大关键技术包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '多模态感知' },
      { id: 'B', label: 'B', text: '模仿学习+强化学习' },
      { id: 'C', label: 'C', text: '世界模型' },
      { id: 'D', label: 'D', text: '运动与操作控制' },
      { id: 'E', label: 'E', text: '安全围栏+人机协作' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D', 'E'],
    explanation: '五大关键技术：多模态感知、模仿学习+强化学习、世界模型、运动与操作控制、安全围栏+人机协作。其中世界模型是弥补VLA泛化性短板的核心方向。',
    knowledgePoint: '关键技术',
    difficulty: 'medium'
  },

  // ========== 第3章：自动与自主的差别（视频章） ==========
  {
    id: 'emb-ch4-1',
    type: 'true_false',
    question: '具身智能的"自动"模式能在遇到障碍时自主绕行。',
    options: [
      { id: 'A', label: '正确', text: '对，自动可以自主决策' },
      { id: 'B', label: '错误', text: '错，自动按预设路线运行遇障即停' }
    ],
    correctAnswer: 'B',
    explanation: '自动模式按预设路线运行，遇障即停；自主模式才能感知障碍后绕行。自主=五步闭环的完整运行，本质区别在于能否"识变-应变-求变"。',
    knowledgePoint: '自动vs自主',
    difficulty: 'easy'
  },

  // ========== 第4章：四大应用场景 ==========
  {
    id: 'emb-ch5-1',
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
    explanation: '四大政务板块：城市运行与设施养护、应急管理与安全生产、民生服务与无障碍辅助、生态环境与自然资源。每个板块都有代表性任务和落地案例。',
    knowledgePoint: '应用场景',
    difficulty: 'medium'
  },
  {
    id: 'emb-ch5-2',
    type: 'single',
    question: '六项核心评估指标中，MTTR代表什么？',
    options: [
      { id: 'A', label: 'A', text: '最大运行时间' },
      { id: 'B', label: 'B', text: '平均恢复时间' },
      { id: 'C', label: 'C', text: '最小响应阈值' },
      { id: 'D', label: 'D', text: '模型训练轮次' }
    ],
    correctAnswer: 'B',
    explanation: 'MTTR（平均恢复时间）：故障发生后恢复至正常状态的平均时间。数据来源是运维记录。是六项核心评估指标之一。',
    knowledgePoint: '评估指标',
    difficulty: 'medium'
  },

  // ========== 第5章：世界模型（视频章） ==========
  {
    id: 'emb-ch6-1',
    type: 'single',
    question: '世界模型通过什么机制形成经验闭环？',
    options: [
      { id: 'A', label: 'A', text: '重复执行相同任务' },
      { id: 'B', label: 'B', text: '预测—执行—修正' },
      { id: 'C', label: 'C', text: '增加训练数据量' },
      { id: 'D', label: 'D', text: '提升算力水平' }
    ],
    correctAnswer: 'B',
    explanation: '世界模型通过"预测—执行—修正"形成经验闭环。在行动前预演物理后果，执行后根据实际结果修正预测，不断提升泛化能力。',
    knowledgePoint: '世界模型机制',
    difficulty: 'medium'
  },

  // ========== 第6章：项目论证与评估 ==========
  {
    id: 'emb-ch7-1',
    type: 'single',
    question: '评估具身智能项目的"六问"论证清单不包括以下哪项？',
    options: [
      { id: 'A', label: 'A', text: '真实场景可得与权限合规' },
      { id: 'B', label: 'B', text: '闭环是否完整' },
      { id: 'C', label: 'C', text: '项目负责人的学历背景' },
      { id: 'D', label: 'D', text: '安全与伦理如何落实' }
    ],
    correctAnswer: 'C',
    explanation: '六问论证清单：①真实场景可得与权限合规？②闭环是否完整？③数据与仿真资源是否可持续？④评估方案是否明确？⑤安全与伦理如何落实？⑥经济与社会效益如何度量？',
    knowledgePoint: '项目论证',
    difficulty: 'hard'
  },
  {
    id: 'emb-ch7-2',
    type: 'single',
    question: '六维评分模型中权重最高的评估维度是？',
    options: [
      { id: 'A', label: 'A', text: '场景价值（20%）' },
      { id: 'B', label: 'B', text: '安全与伦理（20%）' },
      { id: 'C', label: 'C', text: '机制完整性（25%）' },
      { id: 'D', label: 'D', text: '可评估性（15%）' }
    ],
    correctAnswer: 'C',
    explanation: '六维评分模型中，机制完整性权重最高（25%），场景价值和安全与伦理分别占20%，可评估性15%，数据仿真资源和组织就绪度各10%。',
    knowledgePoint: '评分模型',
    difficulty: 'hard'
  },

  // ========== 第7章：三要素（视频章） ==========
  {
    id: 'emb-ch8-1',
    type: 'multiple',
    question: '具身智能治理的"三要素"是什么？（多选）',
    options: [
      { id: 'A', label: 'A', text: '可解释：决策留痕可追溯' },
      { id: 'B', label: 'B', text: '可评估：指标先行数据说话' },
      { id: 'C', label: 'C', text: '可监管：权限分级日志不可篡改' },
      { id: 'D', label: 'D', text: '可复制：统一模式快速推广' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '治理三要素：可解释（决策过程留痕可追溯）、可评估（指标先行数据说话）、可监管（权限分级日志不可篡改）。先治理后扩展，先试点再推广。',
    knowledgePoint: '治理三要素',
    difficulty: 'medium'
  },

  // ========== 第8章：调研方法 ==========
  {
    id: 'emb-ch9-1',
    type: 'multiple',
    question: '本地化调研的预期产出包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '场景清单' },
      { id: 'B', label: 'B', text: '指标基线' },
      { id: 'C', label: 'C', text: '风险清单' },
      { id: 'D', label: 'D', text: '试点建议' },
      { id: 'E', label: 'E', text: '采购合同' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '调研预期产出四件套：场景清单（一页表）、指标基线（数据表）、风险清单（风险矩阵）、试点建议（2页以内简报）。',
    knowledgePoint: '调研产出',
    difficulty: 'easy'
  },
  {
    id: 'emb-ch9-2',
    type: 'single',
    question: '调研受访对象中不包括以下哪个角色？',
    options: [
      { id: 'A', label: 'A', text: '一线业务人员' },
      { id: 'B', label: 'B', text: '信息/设备运维人员' },
      { id: 'C', label: 'C', text: '安全/法务人员' },
      { id: 'D', label: 'D', text: '外部投资机构代表' }
    ],
    correctAnswer: 'D',
    explanation: '调研受访对象从四个角色维度选取：一线业务人员（3-5人）、信息/设备运维人员（2-3人）、安全/法务人员（1-2人）、部门分管领导（1-2人）。',
    knowledgePoint: '调研方法',
    difficulty: 'easy'
  },
  {
    id: 'emb-ch9-3',
    type: 'true_false',
    question: '评审材料写作应该用"显著提升"代替具体数据。',
    options: [
      { id: 'A', label: '正确', text: '对，形容词更有说服力' },
      { id: 'B', label: '错误', text: '错，应该用数据代替形容词' }
    ],
    correctAnswer: 'B',
    explanation: '评审材料写作原则：用数据代替形容词，如"巡检覆盖率从60%提升至95%"；对标国家标准引用条款号；坦诚列出失败情境。',
    knowledgePoint: '评审材料',
    difficulty: 'easy'
  }
];

const ruralRevitalizationQuestions: QuizQuestion[] = [
  // ========== 前言：为什么机关干部要深刻理解乡村振兴？ ==========
  {
    id: 'rr-ch1-1',
    type: 'single',
    question: '乡村振兴战略首次被提升为国家战略是在哪次会议上？',
    options: [
      { id: 'A', label: 'A', text: '党的十八大' },
      { id: 'B', label: 'B', text: '党的十九大' },
      { id: 'C', label: 'C', text: '党的二十大' },
      { id: 'D', label: 'D', text: '二十届三中全会' }
    ],
    correctAnswer: 'B',
    explanation: '党的十九大首次提出实施乡村振兴战略，党的二十大进一步强调全面推进乡村振兴，提出加快建设农业强国。',
    knowledgePoint: '政策背景',
    difficulty: 'easy'
  },
  {
    id: 'rr-ch1-2',
    type: 'single',
    question: '2025年中央农村工作会议强调要学习运用什么经验？',
    options: [
      { id: 'A', label: 'A', text: '"大包干"经验' },
      { id: 'B', label: 'B', text: '"千万工程"经验' },
      { id: 'C', label: 'C', text: '"小岗村"经验' },
      { id: 'D', label: 'D', text: '"华西村"经验' }
    ],
    correctAnswer: 'B',
    explanation: '2025年中央农村工作会议明确提出"学习运用千万工程经验，集中力量抓好办成一批群众可感可及的实事"，标志着乡村振兴进入系统推进、精准落地的关键阶段。',
    knowledgePoint: '政策导向',
    difficulty: 'easy'
  },

  // ========== 第1章：什么是乡村振兴——从概念到国家战略 ==========
  {
    id: 'rr-ch2-1',
    type: 'single',
    question: '乡村振兴"二十字方针"中，"乡风文明"属于哪个维度的建设目标？',
    options: [
      { id: 'A', label: 'A', text: '经济建设' },
      { id: 'B', label: 'B', text: '文化建设' },
      { id: 'C', label: 'C', text: '生态建设' },
      { id: 'D', label: 'D', text: '政治建设' }
    ],
    correctAnswer: 'B',
    explanation: '"二十字方针"涵盖经济（产业兴旺）、生态（生态宜居）、文化（乡风文明）、治理（治理有效）、民生（生活富裕）五个维度。乡风文明属于文化维度，是乡村的灵魂。',
    knowledgePoint: '二十字方针',
    difficulty: 'easy'
  },
  {
    id: 'rr-ch2-2',
    type: 'single',
    question: '"扶贫"与"振兴"的本质区别是什么？',
    options: [
      { id: 'A', label: 'A', text: '扶贫是造血，振兴是输血' },
      { id: 'B', label: 'B', text: '扶贫解决"有没有"，振兴解决"好不好"' },
      { id: 'C', label: 'C', text: '两者只是表述不同，内涵一致' },
      { id: 'D', label: 'D', text: '扶贫针对个人，振兴针对地区' }
    ],
    correctAnswer: 'B',
    explanation: '脱贫攻坚解决的是"有没有"的问题——让贫困人口摆脱绝对贫困；乡村振兴解决的是"好不好"的问题——让乡村成为安居乐业的美好家园。这是从"脱贫"到"振兴"的战略转段。',
    knowledgePoint: '概念辨析',
    difficulty: 'easy'
  },
  {
    id: 'rr-ch2-3',
    type: 'multiple',
    question: '乡村振兴不是以下哪些情况？（多选）',
    options: [
      { id: 'A', label: 'A', text: '仅靠财政补贴和转移支付' },
      { id: 'B', label: 'B', text: '城镇化的翻版，把乡村变成城市' },
      { id: 'C', label: 'C', text: '仅仅搞传统农业种植' },
      { id: 'D', label: 'D', text: '增强内生发展动力，多元化产业发展' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '乡村振兴三个关键区分：①不是仅靠财政补贴，而是增强内生动力；②不是城镇化翻版，而是各美其美；③不仅仅搞农业，还包括加工、旅游、电商等多元路径。D选项是正确做法。',
    knowledgePoint: '概念辨析',
    difficulty: 'medium'
  },

  // ========== 第2章：核心机制与关键路径 ==========
  {
    id: 'rr-ch3-1',
    type: 'multiple',
    question: '乡村振兴"五大振兴"包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '产业振兴（根基）' },
      { id: 'B', label: 'B', text: '人才振兴（支撑）' },
      { id: 'C', label: 'C', text: '文化振兴（灵魂）' },
      { id: 'D', label: 'D', text: '生态振兴（底线）' },
      { id: 'E', label: 'E', text: '组织振兴（保障）' },
      { id: 'F', label: 'F', text: '教育振兴（基础）' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D', 'E'],
    explanation: '五大振兴协同驱动：产业振兴（根基）→人才振兴（支撑）→文化振兴（灵魂）→生态振兴（底线）→组织振兴（保障），通过系统思维破解单点困境。',
    knowledgePoint: '五大振兴',
    difficulty: 'medium'
  },
  {
    id: 'rr-ch3-2',
    type: 'single',
    question: '从"输血"到"造血"的范式转变中，传统发展模式的根本问题是什么？',
    options: [
      { id: 'A', label: 'A', text: '上级拨款力度不够' },
      { id: 'B', label: 'B', text: '外部资源一撤出，发展立即停滞' },
      { id: 'C', label: 'C', text: '干部工作积极性不高' },
      { id: 'D', label: 'D', text: '自然条件恶劣' }
    ],
    correctAnswer: 'B',
    explanation: '传统"资源依赖型"模式依赖上级拨款和外部帮扶，外部资源一旦撤出，发展立即停滞；缺乏内生增长动力；群众参与度低，出现"干部干、群众看"现象。',
    knowledgePoint: '范式转变',
    difficulty: 'medium'
  },
  {
    id: 'rr-ch3-3',
    type: 'single',
    question: '乡村振兴五大关键要素中，组织部门的核心抓手是什么？',
    options: [
      { id: 'A', label: 'A', text: '科技支撑' },
      { id: 'B', label: 'B', text: '人才培育' },
      { id: 'C', label: 'C', text: '党建引领' },
      { id: 'D', label: 'D', text: '政策协同' }
    ],
    correctAnswer: 'C',
    explanation: '党建引领是组织部门的核心抓手——通过党组织领办合作社，统筹资源、发动群众。山东省构建的三级课程开发体系本质上是对人才培育与组织建设两大要素的制度化回应。',
    knowledgePoint: '关键要素',
    difficulty: 'medium'
  },

  // ========== 第3章：1分钟看懂"扶贫"与"振兴"的差别（视频章） ==========
  {
    id: 'rr-ch4-1',
    type: 'true_false',
    question: '扶贫模式重在"造血"，振兴模式重在"输血"。',
    options: [
      { id: 'A', label: '正确', text: '对' },
      { id: 'B', label: '错误', text: '错' }
    ],
    correctAnswer: 'B',
    explanation: '扶贫是"输血"——干部送米送油、村民被动接受，解决"有没有"的问题。振兴是"造血"——村民在合作社中自主劳作、分红增收，解决"好不好"的问题。两者本质区别在于从输血到造红的范式转变。',
    knowledgePoint: '扶贫vs振兴',
    difficulty: 'easy'
  },

  // ========== 第4章：面向公共治理的四大实践领域 ==========
  {
    id: 'rr-ch5-1',
    type: 'multiple',
    question: '乡村振兴在公共治理领域的四大实践板块包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '产业发展与集体经济' },
      { id: 'B', label: 'B', text: '民生改善与公共服务' },
      { id: 'C', label: 'C', text: '生态保护与绿色发展' },
      { id: 'D', label: 'D', text: '文化传承与民族团结' },
      { id: 'E', label: 'E', text: '金融投资与证券交易' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '四大板块：产业发展与集体经济（如党支部领办合作社）、民生改善与公共服务（如乡镇卫生院）、生态保护与绿色发展（如河湖长制）、文化传承与民族团结（如"红石榴+"行动）。',
    knowledgePoint: '实践领域',
    difficulty: 'medium'
  },
  {
    id: 'rr-ch5-2',
    type: 'single',
    question: '"春雨润苗"专项行动2026年扩展至几个部门联合？',
    options: [
      { id: 'A', label: 'A', text: '3个' },
      { id: 'B', label: 'B', text: '5个' },
      { id: 'C', label: 'C', text: '7个' },
      { id: 'D', label: 'D', text: '9个' }
    ],
    correctAnswer: 'D',
    explanation: '2026年"春雨润苗"专项行动再升级，从最初两部门扩展至九部门联合，新增科技部、金融监管总局，推出4个方面15项50条服务举措，累计服务小微经营主体1.8亿户次。',
    knowledgePoint: '政策实践',
    difficulty: 'medium'
  },

  // ========== 第5章：合作社——一次关键跃迁（视频章） ==========
  {
    id: 'rr-ch6-1',
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
    knowledgePoint: '合作社模式',
    difficulty: 'medium'
  },

  // ========== 第6章：项目论证与评估方法 ==========
  {
    id: 'rr-ch7-1',
    type: 'multiple',
    question: '乡村振兴项目论证"六问"包括哪些？（多选）',
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
    explanation: '六问：①产业基础是否真实？②群众意愿是否充分？③组织保障是否到位？④资金方案是否可持续？⑤生态红线是否严守？⑥评估方案是否明确？帮助机关干部识别"伪振兴"项目。',
    knowledgePoint: '项目论证',
    difficulty: 'hard'
  },
  {
    id: 'rr-ch7-2',
    type: 'single',
    question: '六维评分模型中权重最高的评估维度是？',
    options: [
      { id: 'A', label: 'A', text: '群众参与度（20%）' },
      { id: 'B', label: 'B', text: '组织保障度（20%）' },
      { id: 'C', label: 'C', text: '产业基础扎实度（25%）' },
      { id: 'D', label: 'D', text: '资金可持续性（15%）' }
    ],
    correctAnswer: 'C',
    explanation: '六维评分模型中，产业基础扎实度权重最高（25%），群众参与度和组织保障度各占20%，资金可持续性15%，生态合规性和可评估性各占10%。',
    knowledgePoint: '评分模型',
    difficulty: 'hard'
  },

  // ========== 第7章："可落地、可评估、可推广"三要素（视频章） ==========
  {
    id: 'rr-ch8-1',
    type: 'multiple',
    question: '乡村振兴治理的"三要素"是什么？（多选）',
    options: [
      { id: 'A', label: 'A', text: '可落地：从纸面到地面，从蓝图到实景' },
      { id: 'B', label: 'B', text: '可评估：指标量化、数据说话' },
      { id: 'C', label: 'C', text: '可推广：做成一个、带动一片' },
      { id: 'D', label: 'D', text: '可复制：统一模式快速推广' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '乡村振兴治理三要素：可落地（从纸面到地面）、可评估（指标量化数据说话）、可推广（做成一个带动一片）。先试点后推广，先组织后放活。',
    knowledgePoint: '治理三要素',
    difficulty: 'medium'
  },

  // ========== 第8章：组织一次本地化乡村振兴项目小调研 ==========
  {
    id: 'rr-ch9-1',
    type: 'multiple',
    question: '本地化调研的预期产出包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '项目清单（一页表）' },
      { id: 'B', label: 'B', text: '指标基线（数据表）' },
      { id: 'C', label: 'C', text: '风险清单（风险矩阵）' },
      { id: 'D', label: 'D', text: '试点建议（2页以内简报）' },
      { id: 'E', label: 'E', text: '采购合同' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '调研预期产出四件套：项目清单（一页表）、指标基线（数据表）、风险清单（风险矩阵）、试点建议（2页以内简报）。',
    knowledgePoint: '调研产出',
    difficulty: 'easy'
  },
  {
    id: 'rr-ch9-2',
    type: 'single',
    question: '调研受访对象中不包括以下哪个角色？',
    options: [
      { id: 'A', label: 'A', text: '普通村民（5-8人）' },
      { id: 'B', label: 'B', text: '村干部/合作社负责人（2-3人）' },
      { id: 'C', label: 'C', text: '乡镇分管领导（1-2人）' },
      { id: 'D', label: 'D', text: '外部投资机构代表' }
    ],
    correctAnswer: 'D',
    explanation: '调研受访对象从四个角色维度选取：普通村民5-8人、村干部/合作社负责人2-3人、乡镇分管领导1-2人、农业经营主体2-3人。',
    knowledgePoint: '调研方法',
    difficulty: 'easy'
  },
  {
    id: 'rr-ch9-3',
    type: 'true_false',
    question: '评审材料写作应该用"显著增收"代替具体数据。',
    options: [
      { id: 'A', label: '正确', text: '对，形容词更有说服力' },
      { id: 'B', label: '错误', text: '错，应该用数据代替形容词' }
    ],
    correctAnswer: 'B',
    explanation: '评审材料写作原则：用数据代替形容词，如"人均年收入从1.2万元提升至1.8万元"；对标国家政策引用条款号；风险透明化，坦诚列出可能失败的情境。',
    knowledgePoint: '评审材料',
    difficulty: 'easy'
  }
];

const floodQuestions: QuizQuestion[] = [
  // ========== 前言：课程定位与学习目标 ==========
  {
    id: 'flood-ch1-1',
    type: 'multiple',
    question: '本课程面向哪些岗位人员？（多选）',
    options: [
      { id: 'A', label: 'A', text: '应急、城管、交通等洪涝应急处置岗位人员' },
      { id: 'B', label: 'B', text: '仅限防汛抗旱指挥部办公室人员' },
      { id: 'C', label: 'C', text: '公安、卫健、气象等联动部门人员' },
      { id: 'D', label: 'D', text: '涵盖市、区、街道三级全部角色' }
    ],
    correctAnswer: ['A', 'C', 'D'],
    explanation: '本课程面向洪涝应急处置岗位人员——覆盖市、区、街道三级，涵盖应急、城管、交通、公安、卫健、气象、住建、自然资源、网信、通信、供电、水利、武警等全部角色。',
    knowledgePoint: '课程定位',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch1-2',
    type: 'single',
    question: '课程的场景限定是什么？',
    options: [
      { id: 'A', label: 'A', text: '城市内涝形成并引发排涝压力上升、积水加深、道路交通断交' },
      { id: 'B', label: 'B', text: '台风登陆引发沿海风暴潮' },
      { id: 'C', label: 'C', text: '江河洪水导致堤防决口' },
      { id: 'D', label: 'D', text: '山洪暴发引发泥石流灾害' }
    ],
    correctAnswer: 'A',
    explanation: '场景限定为：城市内涝形成并引发排涝压力上升、积水加深、道路交通断交（含下穿隧道/涵洞、地下空间、医院学校等关键点位）。',
    knowledgePoint: '场景限定',
    difficulty: 'easy'
  },

  // ========== 第1章：开局判断——分级触发阈值 ==========
  {
    id: 'flood-ch2-1',
    type: 'single',
    question: '蓝色预警（IV级）的降雨量触发条件是什么？',
    options: [
      { id: 'A', label: 'A', text: '12小时内降雨量将达50毫米以上' },
      { id: 'B', label: 'B', text: '6小时内降雨量将达50毫米以上' },
      { id: 'C', label: 'C', text: '3小时内降雨量将达50毫米以上' },
      { id: 'D', label: 'D', text: '3小时内降雨量将达100毫米以上' }
    ],
    correctAnswer: 'A',
    explanation: '蓝色预警（IV级触发条件）：12小时内降雨量将达50毫米以上，或已达50毫米以上且降雨可能持续；小时雨强≥40毫米。',
    knowledgePoint: '分级触发阈值',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch2-2',
    type: 'single',
    question: 'IV级响应的核心原则是什么？',
    options: [
      { id: 'A', label: 'A', text: '全面动员所有力量进行抢险' },
      { id: 'B', label: 'B', text: '先控险、先排涝、先封控断交风险' },
      { id: 'C', label: 'C', text: '等待灾情全面明朗后再行动' },
      { id: 'D', label: 'D', text: '仅做信息收集和上报工作' }
    ],
    correctAnswer: 'B',
    explanation: 'IV级不追求全面动员，而是"先控险、先排涝、先封控断交风险"。这意味着：不等待、有重点、留痕迹。',
    knowledgePoint: 'IV级响应核心原则',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch2-3',
    type: 'single',
    question: '城市内涝IV级响应的启动前提之一是什么？',
    options: [
      { id: 'A', label: 'A', text: '1小时降雨量≥30mm，主干道积水深度≥30cm持续≥20分钟' },
      { id: 'B', label: 'B', text: '1小时降雨量≥50mm，主干道积水深度≥50cm持续30分钟' },
      { id: 'C', label: 'C', text: '3小时降雨量≥100mm，主干道积水深度≥80cm' },
      { id: 'D', label: 'D', text: '12小时降雨量≥200mm，城区全面淹没问题' }
    ],
    correctAnswer: 'A',
    explanation: 'IV级响应启动前提：城区持续强降雨，1小时降雨量≥30mm，主干道积水深度≥30cm且持续≥20分钟，气象局发布蓝色预警。',
    knowledgePoint: 'IV级启动前提',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch2-4',
    type: 'true_false',
    question: '预警等于响应，气象局发布预警即意味着政府自动启动响应。',
    options: [
      { id: 'A', label: '正确', text: '对，两者是一回事' },
      { id: 'B', label: '错误', text: '错，预警≠响应' }
    ],
    correctAnswer: 'B',
    explanation: '预警是气象部门的"天气判断"，响应是政府的"行动决策"，两者不可等同。响应级别还可以跳级启动，遇极端情况可直接启动更高级别。',
    knowledgePoint: '预警与响应区别',
    difficulty: 'easy'
  },

  // ========== 第2章：IV级响应——5个岗位 ==========
  {
    id: 'flood-ch3-1',
    type: 'multiple',
    question: 'IV级响应下，分管副市长的指令动作包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '指令水文监测河道水位、流量' },
      { id: 'B', label: 'B', text: '指令城管利用地下管网监控平台监测易涝点' },
      { id: 'C', label: 'C', text: '指令交通通过视频监控识别高风险区域' },
      { id: 'D', label: 'D', text: '直接指挥I级响应的全面救援行动' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: 'IV级响应下分管副市长指令：①水文监测河道水位流量；②城管利用管网监控平台实时监测易涝点；③交通通过视频监控和巡查识别高风险区域。均为即时执行。',
    knowledgePoint: '副市长IV级职责',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch3-2',
    type: 'single',
    question: 'IV级响应下，市应急局抢险队伍抵达现场的时限要求是？',
    options: [
      { id: 'A', label: 'A', text: '30分钟内抵达现场' },
      { id: 'B', label: 'B', text: '1小时内抵达现场' },
      { id: 'C', label: 'C', text: '2小时内抵达现场' },
      { id: 'D', label: 'D', text: '无需立即响应，等通知再行动' }
    ],
    correctAnswer: 'A',
    explanation: '市应急局在IV级响应中：指令消防、市政抢险队伍待命，接到指令后30分钟内抵达现场。',
    knowledgePoint: '应急局IV级职责',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch3-3',
    type: 'single',
    question: 'IV级响应中，市城管局对重大风险直接上报时限要求是？',
    options: [
      { id: 'A', label: 'A', text: '即时上报，无时限要求' },
      { id: 'B', label: 'B', text: '15分钟内电话直报分管副市长' },
      { id: 'C', label: 'C', text: '30分钟内书面报告市政府' },
      { id: 'D', label: 'D', text: '1小时内通过系统上报省厅' }
    ],
    correctAnswer: 'B',
    explanation: '市城管局在IV级响应中：联动泵站根据水位监测自动开启强排；重大风险15分钟内电话直报分管副市长。',
    knowledgePoint: '城管局IV级职责',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch3-4',
    type: 'single',
    question: 'IV级响应中，市交通局对积水路段实施交通管制的阈值是？',
    options: [
      { id: 'A', label: 'A', text: '积水深度≥20cm' },
      { id: 'B', label: 'B', text: '积水深度≥30cm' },
      { id: 'C', label: 'C', text: '积水深度≥50cm' },
      { id: 'D', label: 'D', text: '积水深度≥80cm' }
    ],
    correctAnswer: 'B',
    explanation: '市交通局IV级：积水深度≥30cm的低洼路段、下穿隧道实施交通管制，设警示牌、反光锥等物理隔离。',
    knowledgePoint: '交通局IV级职责',
    difficulty: 'medium'
  },

  // ========== 第3章：III级响应升级——5→7岗位 ==========
  {
    id: 'flood-ch4-1',
    type: 'multiple',
    question: 'III级响应比IV级新增加了哪三个岗位？（多选）',
    options: [
      { id: 'A', label: 'A', text: '市公安局（治安+交通管控）' },
      { id: 'B', label: 'B', text: '市卫健委（医疗+防疫）' },
      { id: 'C', label: 'C', text: '市气象局（短临预报+预警发布）' },
      { id: 'D', label: 'D', text: '市住建局（工程抢险）' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: 'III级响应新增3个岗位：市公安局（治安+交通管控）、市卫健委（医疗+防疫）、市气象局（短临预报+预警发布），与原有5个岗位形成7岗位联动。',
    knowledgePoint: 'III级新增岗位',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch4-2',
    type: 'true_false',
    question: 'III级响应的升级条件是5选3，满足任意3项即触发。',
    options: [
      { id: 'A', label: '正确', text: '对' },
      { id: 'B', label: '错误', text: '错' }
    ],
    correctAnswer: 'A',
    explanation: 'III级升级条件（5选3）：单小时降雨≥50mm、黄色预警、多路段积水超30cm持续30分钟、超5处内涝点、排水系统超负荷——满足任意3项触发。',
    knowledgePoint: 'III级升级条件',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch4-3',
    type: 'single',
    question: 'III级响应中，分管副市长上报升级的时限要求是？',
    options: [
      { id: 'A', label: 'A', text: '每1小时向市长建议是否启动II级' },
      { id: 'B', label: 'B', text: '每30分钟向市长建议是否启动II级' },
      { id: 'C', label: 'C', text: '每15分钟向市长建议是否启动II级' },
      { id: 'D', label: 'D', text: '无需向市长报告，自主决策' }
    ],
    correctAnswer: 'B',
    explanation: 'III级响应协同关键：信息实时共享、GIS叠加、联合指挥部集中办公。副市长每30分钟向市长建议是否启动II级。',
    knowledgePoint: 'III级上报机制',
    difficulty: 'hard'
  },

  // ========== 第4章：II级响应升级——7→14岗位 ==========
  {
    id: 'flood-ch5-1',
    type: 'single',
    question: 'II级响应的升级条件是几选几？',
    options: [
      { id: 'A', label: 'A', text: '5选3' },
      { id: 'B', label: 'B', text: '6选3' },
      { id: 'C', label: 'C', text: '5选4' },
      { id: 'D', label: 'D', text: '6选4' }
    ],
    correctAnswer: 'B',
    explanation: 'II级升级条件（6选3）：12小时降雨≥100mm、橙色预警、主干道积水≥80cm持续2小时、超5条主干道断交、供电设施周边道路中断、III级投入全部力量但积水消退率＜30%。',
    knowledgePoint: 'II级升级条件',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch5-2',
    type: 'multiple',
    question: 'II级响应新增的岗位中包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '市长（总指挥）和副市长（现场执行）' },
      { id: 'B', label: 'B', text: '住建局（工程+避难）和自然资源局（地质监测）' },
      { id: 'C', label: 'C', text: '网信办（舆情+辟谣）和通信办（信号恢复）' },
      { id: 'D', label: 'D', text: '武警部队（抢险+治安）' },
      { id: 'E', label: 'E', text: '国家防总和解放军' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: 'II级响应新增8个角色：市长、副市长、住建局、自然资源局、网信办、通信办、供电公司、武警部队。国家级力量（国家防总、解放军）是I级才介入的。',
    knowledgePoint: 'II级新增岗位',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch5-3',
    type: 'single',
    question: 'II级响应的核心变化是什么？',
    options: [
      { id: 'A', label: 'A', text: '从"小时级响应"升级为"分钟级响应"' },
      { id: 'B', label: 'B', text: '从"部门协同"升级为"全域战争状态"' },
      { id: 'C', label: 'C', text: '从"市级响应"升级为"国家级响应"' },
      { id: 'D', label: 'D', text: '从"单点处置"升级为"多点同时处置"' }
    ],
    correctAnswer: 'B',
    explanation: 'II级响应的关键变化：14个岗位全部进入"小时级响应"，联合指挥部24小时集中办公。从"部门协同"升级为"全域战争状态"。',
    knowledgePoint: 'II级核心变化',
    difficulty: 'hard'
  },

  // ========== 第5章：I级响应——全域控制与国家级支援 ==========
  {
    id: 'flood-ch6-1',
    type: 'single',
    question: 'I级响应中，以下哪个力量会介入支援？',
    options: [
      { id: 'A', label: 'A', text: '仅市区两级力量' },
      { id: 'B', label: 'B', text: '国家防总、解放军、国家级排涝基地、跨省救援队' },
      { id: 'C', label: 'C', text: '仅武警部队支援' },
      { id: 'D', label: 'D', text: '仅跨省调拨物资' }
    ],
    correctAnswer: 'B',
    explanation: 'I级响应中国家级力量介入：国家防总、解放军、国家级排涝基地、跨省救援队以金色边框进入网络，与市级14个岗位形成"国家-省-市"三级指挥链。',
    knowledgePoint: 'I级国家级支援',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch6-2',
    type: 'single',
    question: 'I级响应中，市长被授予的权限是什么？',
    options: [
      { id: 'A', label: 'A', text: '现场抢险指挥权' },
      { id: 'B', label: 'B', text: '市级防指总指挥，授权非常措施（交通管制、物资征用、强制转移）' },
      { id: 'C', label: 'C', text: '仅物资调配权' },
      { id: 'D', label: 'D', text: '仅信息发布权' }
    ],
    correctAnswer: 'B',
    explanation: 'I级响应中市长接管全部指挥权，实行扁平化指挥。授权非常措施：交通管制、物资征用、强制转移。',
    knowledgePoint: 'I级市长职责',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch6-3',
    type: 'single',
    question: 'I级响应的终极目标中，通信恢复目标是多少？',
    options: [
      { id: 'A', label: 'A', text: '50%' },
      { id: 'B', label: 'B', text: '70%' },
      { id: 'C', label: 'C', text: '90%' },
      { id: 'D', label: 'D', text: '100%' }
    ],
    correctAnswer: 'C',
    explanation: 'I级响应终极目标：人员清零、通信恢复90%、主干道12小时内恢复通行。',
    knowledgePoint: 'I级终极目标',
    difficulty: 'easy'
  },

  // ========== 第6章：演练与复盘 ==========
  {
    id: 'flood-ch7-1',
    type: 'single',
    question: '以下哪种演练方式用于验证单岗位SOP记忆与联动逻辑？',
    options: [
      { id: 'A', label: 'A', text: '桌面推演' },
      { id: 'B', label: 'B', text: '专项演练' },
      { id: 'C', label: 'C', text: '综合演练' },
      { id: 'D', label: 'D', text: '实战检验' }
    ],
    correctAnswer: 'A',
    explanation: '桌面推演用IV→III→II→I全链条检验"我岗位输入是什么、我新增动作是什么、上报路径是否闭环"，验证单岗位SOP记忆与联动逻辑。',
    knowledgePoint: '演练方式',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch7-2',
    type: 'true_false',
    question: '复盘材料的P3内容是"时间轴"，要求每节点配证据。',
    options: [
      { id: 'A', label: '正确', text: '对' },
      { id: 'B', label: '错误', text: '错' }
    ],
    correctAnswer: 'B',
    explanation: '复盘材料：P1概况→P2时间轴（每节点配证据）→P3分岗位对照（逐岗位核对）→P4风险控制效果→P5改进清单。P3是分岗位对照，P2才是时间轴。',
    knowledgePoint: '复盘模板',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch7-3',
    type: 'multiple',
    question: '学员交付物"岗位SOP卡"包含哪些字段？（多选）',
    options: [
      { id: 'A', label: 'A', text: '角色（部门+层级）和我的链条节点' },
      { id: 'B', label: 'B', text: 'IV→III→II→I各级别动作' },
      { id: 'C', label: 'C', text: '上报对象/直报触发阈值与时限' },
      { id: 'D', label: 'D', text: '我的联动部门和常见偏差' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '岗位SOP卡包含：角色、我的链条节点、IV→III→II→I各级别动作（逐级勾选确认）、上报对象/直报触发、我的联动部门、常见偏差、改进记录。',
    knowledgePoint: 'SOP卡构成',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch7-4',
    type: 'single',
    question: '岗位SOP卡的使用建议不包括以下哪项？',
    options: [
      { id: 'A', label: 'A', text: '随身携带，手机存一份随时查阅' },
      { id: 'B', label: 'B', text: '定期更新，每次演练或实战后根据复盘结果更新' },
      { id: 'C', label: 'C', text: '岗位轮换时作为交接文件的核心附件' },
      { id: 'D', label: 'D', text: '入职时填写一次即可永久使用' }
    ],
    correctAnswer: 'D',
    explanation: 'SOP卡使用建议：随身携带、定期更新（每次演练或实战后）、交接必备（岗位轮换时）。不是填写一次永久使用。',
    knowledgePoint: 'SOP卡使用',
    difficulty: 'easy'
  },

  // ========== 第7章：分角色SOP卡速查 ==========
  {
    id: 'flood-ch8-1',
    type: 'single',
    question: '应急局在IV级响应的核心动作中，上报对象是？',
    options: [
      { id: 'A', label: 'A', text: '国家防总' },
      { id: 'B', label: 'B', text: '省级应急管理部门' },
      { id: 'C', label: 'C', text: '分管副市长' },
      { id: 'D', label: 'D', text: '国务院' }
    ],
    correctAnswer: 'C',
    explanation: '应急局IV级：值班值守、动态跟踪、物资调拨、队伍待命，上报分管副市长。响应逐级升级上报对象从副市长→市政府+省级→国务院→国家防总。',
    knowledgePoint: '应急局速查',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch8-2',
    type: 'single',
    question: '城管局在II级响应中，"龙吸水"大型抽排设备的配置要求是？',
    options: [
      { id: 'A', label: 'A', text: '≥3台' },
      { id: 'B', label: 'B', text: '≥5台' },
      { id: 'C', label: 'C', text: '≥10台' },
      { id: 'D', label: 'D', text: '不需要配置' }
    ],
    correctAnswer: 'B',
    explanation: '城管局II级响应：指挥进驻、"龙吸水"≥5台、联合封控、高危巡查。每30分钟更新，10分钟直报副市长。',
    knowledgePoint: '城管局速查',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch8-3',
    type: 'true_false',
    question: '每升一级响应，是替换原有动作，全部执行新动作。',
    options: [
      { id: 'A', label: '正确', text: '对' },
      { id: 'B', label: '错误', text: '错' }
    ],
    correctAnswer: 'B',
    explanation: '升级即新增：每升一级不是替换原有动作，而是在原有基础上增加新动作。四级累加而非替换。',
    knowledgePoint: '通用原则',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch8-4',
    type: 'single',
    question: '快速记忆口诀中"蓝黄橙红四级跳，五七十四再加国"的"五七十四"分别对应什么？',
    options: [
      { id: 'A', label: 'A', text: 'IV级5岗位、III级7岗位、II级14岗位' },
      { id: 'B', label: 'B', text: '蓝色5岗位、黄色7岗位、橙色14个动作' },
      { id: 'C', label: 'C', text: '5个部门、7个部门、14个部门' },
      { id: 'D', label: 'D', text: '每次增加5个、7个、14个岗位' }
    ],
    correctAnswer: 'A',
    explanation: '记忆口诀含义：IV级5岗位→III级7岗位→II级14岗位→I级14岗位+国家级支援。五七十四分别对应各级响应的岗位数量。',
    knowledgePoint: '速查要点',
    difficulty: 'medium'
  },

  // ========== 第8章：课程测试与工具包 ==========
  {
    id: 'flood-ch9-1',
    type: 'multiple',
    question: '应急工具包包含哪些内容？（多选）',
    options: [
      { id: 'A', label: 'A', text: '关键联系表（各部门联系人及电话）' },
      { id: 'B', label: 'B', text: '汛前检查清单（检查项清单）' },
      { id: 'C', label: 'C', text: '岗位SOP卡模板（空白版）' },
      { id: 'D', label: 'D', text: '应急预案全文' }
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanation: '应急工具包包含：关键联系表、汛前检查清单、岗位SOP卡模板（空白版）。不包含应急预案全文，应急预案需另行查阅官方文件。',
    knowledgePoint: '应急工具包',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch9-2',
    type: 'single',
    question: '汛前检查清单中，对应急通信设备的要求是？',
    options: [
      { id: 'A', label: 'A', text: '卫星电话和对讲机测试正常' },
      { id: 'B', label: 'B', text: '仅确保手机信号覆盖' },
      { id: 'C', label: 'C', text: '无需准备通信设备' },
      { id: 'D', label: 'D', text: '仅需准备对讲机' }
    ],
    correctAnswer: 'A',
    explanation: '汛前检查清单包含：应急通信设备（卫星电话、对讲机）测试正常。这是确保极端情况下指挥通信不中断的关键措施。',
    knowledgePoint: '汛前检查',
    difficulty: 'easy'
  },
  {
    id: 'flood-ch9-3',
    type: 'single',
    question: '复盘材料P4"风险控制效果"的归因应聚焦哪些维度？',
    options: [
      { id: 'A', label: 'A', text: '仅归因到物资不足' },
      { id: 'B', label: 'B', text: '仅归因到人员能力不足' },
      { id: 'C', label: 'C', text: '归因到机制/物资/能力/协同四个维度' },
      { id: 'D', label: 'D', text: '归因到天气条件恶劣' }
    ],
    correctAnswer: 'C',
    explanation: '复盘P4检查：哪些控住、哪些失效，归因到机制/物资/能力/协同四个维度，每项风险对应改进方向。',
    knowledgePoint: '复盘归因',
    difficulty: 'medium'
  },
  {
    id: 'flood-ch9-4',
    type: 'multiple',
    question: '城市内涝IV级响应启动的基本条件包括哪些？（多选）',
    options: [
      { id: 'A', label: 'A', text: '城区持续强降雨' },
      { id: 'B', label: 'B', text: '1小时降雨量≥30mm' },
      { id: 'C', label: 'C', text: '主干道积水深度≥30cm且持续≥20分钟' },
      { id: 'D', label: 'D', text: '气象局发布蓝色预警' }
    ],
    correctAnswer: ['A', 'B', 'C', 'D'],
    explanation: '四个条件同时出现方启动IV级响应：城区持续强降雨、1小时降雨量≥30mm、主干道积水深度≥30cm且持续≥20分钟、气象局发布蓝色预警。',
    knowledgePoint: 'IV级启动条件',
    difficulty: 'medium'
  }
];

export const quizDatabase: Record<string, QuizQuestion[]> = {
  embodied_ai: embodiedAIQuestions,
  rural_revitalization: ruralRevitalizationQuestions,
  flood: floodQuestions
};

export function getChapterQuiz(courseName: string, chapterId: number | string, chapterTitle: string): ChapterQuiz | null {
  let questions: QuizQuestion[] = [];
  
  if (courseName.includes('具身智能')) {
    questions = quizDatabase.embodied_ai.filter(q => q.id.startsWith(`emb-ch${chapterId}-`));
  } else if (courseName.includes('乡村振兴')) {
    questions = quizDatabase.rural_revitalization.filter(q => q.id.startsWith(`rr-ch${chapterId}-`));
  } else if (courseName.includes('内涝') || courseName.includes('洪涝') || courseName.includes('排涝')) {
    questions = quizDatabase.flood.filter(q => q.id.startsWith(`flood-ch${chapterId}-`));
  } else {
    return null;
  }

  if (questions.length === 0) return null;

  // 基于 chapterId 做确定性排序，避免每次渲染时题目随机变动
  const seed = String(chapterId);
  const sortedQuestions = [...questions].sort((a, b) => {
    const keyA = seed + a.id;
    const keyB = seed + b.id;
    return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
  });
  const selectedQuestions = sortedQuestions.slice(0, Math.min(5, sortedQuestions.length));

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
