import { KnowledgeNode, LearningPath, DiagnosticOption, CourseInfo, RequirementAnalysis } from './types';
import { getVideoPath } from './video-mapping';

// 辅助函数：创建带视频路径的课程对象
function createCourse(id: string, title: string, duration: number): CourseInfo {
  return {
    id,
    title,
    duration,
    videoPath: getVideoPath(id),
  };
}

// 模拟课程数据 - 与知识图谱节点对应的真实课程
// 课程来源：社院课程资源库（政治理论、统战理论）
const courseDatabase: Record<string, CourseInfo[]> = {
  // ========== 党建基础理论 ==========
  'party-constitution': [
    createCourse('1283', '中国共产党章程总纲精讲', 45),
    createCourse('1284', '中国共产党章程条文解读（党员权利义务）', 38),
    createCourse('1285', '中国共产党章程组织制度与纪律', 52),
    createCourse('1286', '党章修正案解读（上）', 40),
    createCourse('1287', '习近平总书记在浙江的探索与实践', 42),
  ],
  'party-history': [
    createCourse('1288', '中国共产党简史（上）—— 新民主主义革命时期', 55),
    createCourse('1289', '中国共产党简史（中）—— 社会主义革命和建设时期', 50),
    createCourse('1290', '中国共产党简史（下）—— 改革开放和社会主义现代化建设新时期', 48),
    createCourse('1291', '百年党史重大事件回顾', 42),
    createCourse('1292', '中国道路与中国梦', 46),
    createCourse('1293', '不忘初心继续前进', 44),
  ],
  'party-theory': [
    createCourse('1294', '马克思主义中国化时代化的理论逻辑', 48),
    createCourse('1295', '毛泽东思想概论', 52),
    createCourse('1296', '邓小平理论专题', 44),
    createCourse('1297', '习近平新时代中国特色社会主义思想概论', 55),
    createCourse('1298', '两步走战略准确把握开启全面建设社会主义现代化国家新征程', 48),
    createCourse('1299', '新发展理念创新发展专题', 42),
    createCourse('1300', '新发展理念绿色发展建设美丽中国', 45),
  ],
  // ========== 二十大精神学习 ==========
  '20th-report': [
    createCourse('1050', '党的二十大精神导读（上）', 55),
    createCourse('1092', '党的二十大精神导读（中）', 50),
    createCourse('1091', '党的二十大精神导读（下）', 48),
    createCourse('1090', '新时代新征程中国共产党的使命任务', 42),
    createCourse('1089', '党和国家历史上具有深远意义的伟大转折', 40),
  ],
  // ========== 中国式现代化 ==========
  'chinese-modernization': [
    createCourse('1301', '党的十九届五中全会关于2035年远景目标的战略构想（上）', 45),
    createCourse('1302', '深入学习贯彻党的十九届五中全会精神，开启全面建设社会主义现代化国家新征程（下）', 38),
    createCourse('1303', '深入学习贯彻党的十九届五中全会精神，开启全面建设社会主义现代化国家新征程（上）', 42),
    createCourse('1304', '夺取全面建设社会主义现代化强国新胜利——深入学习党的十九届五中全会精神（下）', 50),
    createCourse('1305', '夺取全面建设社会主义现代化强国新胜利——深入学习党的十九届五中全会精神（上）', 48),
    createCourse('1306', '中国式现代化的中国特色和本质要求', 45),
    createCourse('1307', '大统战系列之六：统一战线的一致性与多样性', 42),
    createCourse('1308', '大统战系列之七：坚持大统战工作格局的着力重点', 40),
    createCourse('1309', '大统战系列之八：用协商凝聚共识凝聚智慧凝聚力量', 48),
  ],
  // ========== 全面从严治党 ==========
  'comprehensive-strict-governance': [
    createCourse('1310', '大统战系列之九：凝聚共识需要把握好哪些关系', 48),
    createCourse('1311', '大统战系列之十：中国新型政党制度', 44),
    createCourse('1312', '大统战系列之十一：中国新型政党制度的理论渊源', 40),
    createCourse('1313', '大统战系列之十二：中国新型政党制度的主要特征', 52),
    createCourse('1314', '大统战系列之十三：中国新型政党制度的文化根基', 48),
    createCourse('1315', '大统战系列之十四：中国新型政党制度的世界意义', 46),
    createCourse('1316', '大统战系列之十五：党外知识分子的身份类型与特征', 42),
    createCourse('1317', '大统战系列之十六：如何做好党外知识分子工作', 40),
  ],
  // ========== 基层党务工作 ==========
  'membership-development': [
    createCourse('1318', '大统战系列之十七：为何要重视高校党外知识分子工作', 45),
    createCourse('1319', '大统战系列之十八：党外知识分子联谊会', 42),
    createCourse('1320', '大统战系列之十九：新媒体环境下统战工作面临的机遇和挑战', 40),
    createCourse('1321', '大统战系列之二十：如何做好新媒体环境下的统战工作', 38),
  ],
  'party-life': [
    createCourse('1145', '从疫情蔓延看人类命运共同体的构建（上）', 45),
    createCourse('1144', '从疫情蔓延看人类命运共同体的构建（中）', 42),
    createCourse('1143', '从疫情蔓延看人类命运共同体的构建（下）', 40),
  ],
  'mass-work': [
    createCourse('1322', '意识形态工作如何凝民心聚共识——习近平总书记关于意识形态工作重要讲话精神解读（上）', 45),
    createCourse('1323', '坚持和发展中国特色社会主义宗教理论', 48),
    createCourse('1324', '新时代群众工作方法与实践', 40),
    createCourse('1139', '推动协商民主多层发展', 42),
    createCourse('1132', '推动协商民主广泛发展', 44),
    createCourse('1131', '协商民主的制度化发展与党的领导', 40),
  ],
  // ========== 乡村振兴战略 ==========
  'rural-policy': [
    createCourse('1328', '乡村振兴战略总体要求解读', 45),
    createCourse('1329', '产业兴旺乡村振兴的核心动力', 42),
    createCourse('1330', '生态宜居与乡风文明建设', 38),
    createCourse('1331', '打好精准脱贫攻坚战', 40),
    createCourse('1332', '精准扶贫与我国扶贫治理体系的完善', 44),
    createCourse('1333', '精准扶贫的理论在中国的实践', 42),
  ],
  'rural-governance': [
    createCourse('1334', '党建引领乡村治理新模式', 44),
    createCourse('1335', '村民自治制度完善与实践', 40),
    createCourse('1336', '法治乡村与德治乡村建设', 42),
  ],
  // ========== 党风廉政建设 ==========
  'integrity-education': [
    createCourse('1337', '全面从严治党的基本功——思想建党制度治党', 46),
    createCourse('1338', '把权力关进制度的笼子里——反腐败体制机制建设', 48),
    createCourse('1339', '十八大以来党风廉政建设和反腐败工作创新', 44),
    createCourse('1340', '中国共产党纪律处分条例解读', 50),
    createCourse('1341', '新时代廉洁自律准则学习', 35),
  ],
  'supervision-system': [
    createCourse('1342', '党内监督体系与实施', 48),
    createCourse('1343', '国家监察体制改革解读', 44),
    createCourse('1344', '坚持和完善党和国家监督体系', 46),
    createCourse('1345', '民主监督与审计监督实践', 42),
  ],
};

// 核心知识图谱 - 党建知识体系
export const partyKnowledgeGraph: KnowledgeNode = {
  id: 'root',
  name: '党建理论学习体系',
  level: 0,
  children: [
    {
      id: 'party-building-basics',
      name: '党建基础理论',
      level: 1,
      description: '党的基本理论和基础知识',
      prerequisites: [],
      children: [
        {
          id: 'party-constitution',
          name: '党章学习',
          level: 2,
          difficulty: 1,
          description: '中国共产党的根本大法',
          keyPoints: [
            '党的性质和宗旨',
            '党员的权利和义务',
            '党的组织和纪律',
            '入党誓词解读'
          ],
          content: {
            id: 'c1',
            title: '党章精讲',
            type: 'video',
            duration: 45,
            summary: '系统讲解党章的总纲和条文，重点解读党员条件、义务与权利。'
          },
          courses: [
            { id: '1283', title: '中国共产党章程（总纲）', duration: 45 },
            { id: '1284', title: '中国共产党章程（第一章 党员）', duration: 38 },
            { id: '1285', title: '中国共产党章程（第二章至第十一章）', duration: 52 },
            { id: '1286', title: '党章修正案解读（上）', duration: 40 },
            { id: '1287', title: '习近平总书记在浙江的探索与实践', duration: 42 },
          ],
          relatedDocuments: [
            { id: 'd1', title: '中国共产党章程', type: '法规' },
            { id: 'd2', title: '党章修正案说明', type: '解读' }
          ]
        },
        {
          id: 'party-history',
          name: '党史学习',
          level: 2,
          difficulty: 1,
          description: '中国共产党百年奋斗历程',
          keyPoints: [
            '建党初期革命历程',
            '新中国成立与社会主义建设',
            '改革开放的伟大成就',
            '新时代的历史性变革'
          ],
          content: {
            id: 'c2',
            title: '百年党史概览',
            type: 'video',
            duration: 60,
            summary: '回顾中国共产党从成立到新时代的伟大历程。'
          },
          courses: [
            { id: '1288', title: '中国共产党简史（上）—— 新民主主义革命时期', duration: 55 },
            { id: '1289', title: '中国共产党简史（中）—— 社会主义革命和建设时期', duration: 50 },
            { id: '1290', title: '中国共产党简史（下）—— 改革开放和社会主义现代化建设新时期', duration: 48 },
            { id: '1291', title: '百年党史重大事件回顾', duration: 42 },
          ],
          relatedDocuments: [
            { id: 'd3', title: '中国共产党简史', type: '教材' }
          ]
        },
        {
          id: 'party-theory',
          name: '党的创新理论',
          level: 2,
          difficulty: 2,
          description: '马克思主义中国化的理论成果',
          keyPoints: [
            '毛泽东思想',
            '邓小平理论',
            '三个代表重要思想',
            '科学发展观',
            '习近平新时代中国特色社会主义思想'
          ],
          content: {
            id: 'c3',
            title: '理论发展脉络',
            type: 'video',
            duration: 50,
            summary: '梳理马克思主义中国化的理论演进历程。'
          },
          courses: [
            { id: '1292', title: '马克思主义中国化时代化的理论逻辑', duration: 48 },
            { id: '1293', title: '毛泽东思想概论（上）', duration: 52 },
            { id: '1294', title: '毛泽东思想概论（下）', duration: 46 },
            { id: '1295', title: '邓小平理论专题', duration: 44 },
            { id: '1296', title: '习近平新时代中国特色社会主义思想概论', duration: 55 },
          ],
        }
      ]
    },
    {
      id: 'party-20th-congress',
      name: '二十大精神学习',
      level: 1,
      description: '深入学习党的二十大精神',
      prerequisites: ['party-building-basics'],
      children: [
        {
          id: '20th-report',
          name: '二十大报告解读',
          level: 2,
          difficulty: 2,
          description: '党的二十大报告核心要义',
          keyPoints: [
            '大会主题与历史意义',
            '过去五年的工作和新时代十年的伟大变革',
            '新时代新征程中国共产党的使命任务',
            '中国式现代化',
            '全面从严治党'
          ],
          content: {
            id: 'c4',
            title: '二十大报告全文解读',
            type: 'video',
            duration: 90,
            summary: '深入解读党的二十大报告的核心内容和重大部署。'
          },
          courses: [
            { id: '1050', title: '党的二十大精神导读（上）', duration: 55 },
            { id: '1092', title: '党的二十大精神导读（中）', duration: 50 },
            { id: '1091', title: '党的二十大精神导读（下）', duration: 48 },
            { id: '1090', title: '新时代新征程中国共产党的使命任务', duration: 42 },
            { id: '1089', title: '党和国家历史上具有深远意义的伟大转折', duration: 40 },
          ],
          relatedDocuments: [
            { id: 'd4', title: '党的二十大报告', type: '文件' },
            { id: 'd5', title: '二十大党章修正案', type: '文件' }
          ]
        },
        {
          id: 'chinese-modernization',
          name: '中国式现代化',
          level: 2,
          difficulty: 2,
          description: '中国式现代化的中国特色和本质要求',
          keyPoints: [
            '中国式现代化的中国特色',
            '中国式现代化的本质要求',
            '中国式现代化的重大原则',
            '两步走战略安排'
          ],
          content: {
            id: 'c5',
            title: '中国式现代化专题',
            type: 'video',
            duration: 40,
            summary: '系统阐述中国式现代化的理论内涵和实践要求。'
          },
          courses: [
            { id: '1301', title: '党的十九届五中全会关于2035年远景目标的战略构想（上）', duration: 45 },
            { id: '1302', title: '深入学习贯彻党的十九届五中全会精神，开启全面建设社会主义现代化国家新征程（下）', duration: 38 },
            { id: '1303', title: '深入学习贯彻党的十九届五中全会精神，开启全面建设社会主义现代化国家新征程（上）', duration: 42 },
            { id: '1306', title: '中国式现代化的中国特色和本质要求', duration: 45 },
            { id: '1307', title: '大统战系列之六：统一战线的一致性与多样性', duration: 42 },
            { id: '1308', title: '大统战系列之七：坚持大统战工作格局的着力重点', duration: 40 },
            { id: '1309', title: '大统战系列之八：用协商凝聚共识凝聚智慧凝聚力量', duration: 48 },
          ],
        },
        {
          id: 'comprehensive-strict-governance',
          name: '全面从严治党',
          level: 2,
          difficulty: 2,
          description: '新时代党的建设新的伟大工程',
          keyPoints: [
            '两个确立的决定性意义',
            '四个全面的战略布局',
            '党的自我革命',
            '政治建设摆在首位'
          ],
          content: {
            id: 'c6',
            title: '全面从严治党专题',
            type: 'video',
            duration: 35,
            summary: '解读新时代党的建设总要求。'
          },
          courses: [
            { id: '1310', title: '大统战系列之九：凝聚共识需要把握好哪些关系', duration: 48 },
            { id: '1311', title: '大统战系列之十：中国新型政党制度', duration: 44 },
            { id: '1312', title: '大统战系列之十一：中国新型政党制度的理论渊源', duration: 40 },
            { id: '1313', title: '大统战系列之十二：中国新型政党制度的主要特征', duration: 52 },
          ],
        }
      ]
    },
    {
      id: 'grassroots-party-work',
      name: '基层党务工作',
      level: 1,
      description: '基层党组织实务操作',
      prerequisites: ['party-building-basics'],
      children: [
        {
          id: 'membership-development',
          name: '发展党员工作',
          level: 2,
          difficulty: 2,
          description: '党员发展规范化流程',
          keyPoints: [
            '入党申请与教育',
            '入党积极分子确定',
            '发展对象确定与培养',
            '预备党员接收',
            '预备党员教育考察转正'
          ],
          content: {
            id: 'c7',
            title: '发展党员工作实务',
            type: 'video',
            duration: 55,
            summary: '详解发展党员的五个阶段、二十五个关键环节。'
          },
          courses: [
            { id: '1314', title: '大统战系列之十三：中国新型政党制度的文化根基', duration: 48 },
            { id: '1315', title: '大统战系列之十四：中国新型政党制度的世界意义', duration: 46 },
            { id: '1316', title: '大统战系列之十五：党外知识分子的身份类型与特征', duration: 40 },
            { id: '1317', title: '大统战系列之十六：如何做好党外知识分子工作', duration: 38 },
          ],
          relatedDocuments: [
            { id: 'd6', title: '发展党员工作细则', type: '规定' }
          ]
        },
        {
          id: 'party-life',
          name: '党的组织生活',
          level: 2,
          difficulty: 1,
          description: '三会一课与主题党日',
          keyPoints: [
            '支部党员大会',
            '支部委员会',
            '党小组会',
            '党课',
            '主题党日活动'
          ],
          content: {
            id: 'c8',
            title: '组织生活质量提升',
            type: 'video',
            duration: 40,
            summary: '如何提高党的组织生活质量，增强党员参与感。'
          },
          courses: [
            { id: '1318', title: '大统战系列之十七：为何要重视高校党外知识分子工作', duration: 45 },
            { id: '1319', title: '大统战系列之十八：党外知识分子联谊会', duration: 42 },
            { id: '1320', title: '大统战系列之十九：新媒体环境下统战工作面临的机遇和挑战', duration: 40 },
            { id: '1321', title: '大统战系列之二十：如何做好新媒体环境下的统战工作', duration: 38 },
          ],
        },
        {
          id: 'mass-work',
          name: '群众工作方法',
          level: 2,
          difficulty: 1,
          description: '做好新时代的群众工作',
          keyPoints: [
            '践行党的群众路线',
            '密切联系群众',
            '化解矛盾纠纷',
            '服务群众最后一公里'
          ],
          content: {
            id: 'c9',
            title: '群众工作艺术',
            type: 'video',
            duration: 35,
            summary: '掌握新形势下群众工作的方式方法。'
          },
          courses: [
            { id: '1145', title: '从疫情蔓延看人类命运共同体的构建（上）', duration: 45 },
            { id: '1144', title: '从疫情蔓延看人类命运共同体的构建（中）', duration: 42 },
            { id: '1143', title: '从疫情蔓延看人类命运共同体的构建（下）', duration: 40 },
            { id: '1139', title: '推动协商民主多层发展', duration: 42 },
            { id: '1132', title: '推动协商民主广泛发展', duration: 44 },
            { id: '1131', title: '协商民主的制度化发展与党的领导', duration: 40 },
          ],
        }
      ]
    },
    {
      id: 'rural-revitalization',
      name: '乡村振兴战略',
      level: 1,
      description: '乡村振兴战略部署与实践',
      prerequisites: [],
      children: [
        {
          id: 'rural-policy',
          name: '乡村振兴政策',
          level: 2,
          difficulty: 1,
          description: '乡村振兴总体要求和重点任务',
          keyPoints: [
            '产业兴旺',
            '生态宜居',
            '乡风文明',
            '治理有效',
            '生活富裕'
          ],
          content: {
            id: 'c10',
            title: '乡村振兴政策解读',
            type: 'video',
            duration: 45,
            summary: '全面解读乡村振兴战略的总体框架和五大目标。'
          },
          courses: [
            { id: '1328', title: '乡村振兴战略总体要求解读', duration: 45 },
            { id: '1329', title: '产业兴旺乡村振兴的核心动力', duration: 42 },
            { id: '1330', title: '生态宜居与乡风文明建设', duration: 38 },
            { id: '1331', title: '打好精准脱贫攻坚战', duration: 40 },
            { id: '1332', title: '论精准扶贫与国家扶贫治理体系完善和优化', duration: 44 },
            { id: '1333', title: '农村精准扶贫：理论基础与实践情势探析', duration: 42 },
          ],
        },
        {
          id: 'rural-governance',
          name: '乡村治理现代化',
          level: 2,
          difficulty: 2,
          description: '完善乡村治理体系',
          keyPoints: [
            '党建引领乡村振兴',
            '村民自治制度完善',
            '法治乡村建设',
            '德治乡村建设'
          ],
          content: {
            id: 'c11',
            title: '乡村治理创新',
            type: 'video',
            duration: 40,
            summary: '探索党建引领下的乡村治理新模式。'
          },
          courses: [
            { id: '1334', title: '党建引领乡村治理新模式', duration: 44 },
            { id: '1335', title: '村民自治制度完善与实践', duration: 40 },
            { id: '1336', title: '法治乡村与德治乡村建设', duration: 42 },
          ],
        }
      ]
    },
    {
      id: 'disciplinary-style',
      name: '党风廉政建设',
      level: 1,
      description: '全面从严治党永远在路上',
      prerequisites: [],
      children: [
        {
          id: 'integrity-education',
          name: '廉政教育',
          level: 2,
          difficulty: 2,
          description: '廉洁自律警示教育',
          keyPoints: [
            '中央八项规定精神',
            '反对四风',
            '廉洁自律准则',
            '警示案例剖析'
          ],
          content: {
            id: 'c12',
            title: '廉政教育专题',
            type: 'video',
            duration: 50,
            summary: '以案为鉴，筑牢拒腐防变的思想防线。'
          },
          courses: [
            { id: '1337', title: '全面从严治党的基本功：思想建党、制度治党、法治权钱', duration: 46 },
            { id: '1338', title: '把权力关进制度笼子里', duration: 48 },
            { id: '1339', title: '论十八大以来党风廉政建设和反腐败工作的创新', duration: 44 },
            { id: '1340', title: '中国共产党纪律处分条例解读', duration: 50 },
            { id: '1341', title: '新时代廉洁自律准则学习', duration: 35 },
          ],
        },
        {
          id: 'supervision-system',
          name: '监督执纪体系',
          level: 2,
          difficulty: 3,
          description: '健全党和国家监督体系',
          keyPoints: [
            '党内监督',
            '国家监察',
            '民主监督',
            '审计监督',
            '社会监督'
          ],
          content: {
            id: 'c13',
            title: '监督体系建设',
            type: 'video',
            duration: 45,
            summary: '构建全方位、多层次的监督网络。'
          },
          courses: [
            { id: '1342', title: '党内监督体系与实施', duration: 48 },
            { id: '1343', title: '国家监察体制改革解读', duration: 44 },
            { id: '1344', title: '坚持和完善党和国家监督体系', duration: 46 },
            { id: '1345', title: '民主监督与审计监督实践', duration: 42 },
          ],
        }
      ]
    }
  ]
};

// 诊断问卷选项
export const diagnosticOptions: DiagnosticOption[] = [
  // 身份角色（公务员身份）
  { id: 'r1', label: '厅局级干部', category: 'role', tags: ['领导力提升'] },
  { id: 'r2', label: '县处级干部', category: 'role', tags: ['行政管理'] },
  { id: 'r3', label: '乡科级干部', category: 'role', tags: ['基层治理'] },
  { id: 'r4', label: '科员', category: 'role', tags: ['基础学习'] },
  { id: 'r5', label: '基层工作人员', category: 'role', tags: ['实务操作'] },
  { id: 'r6', label: '事业单位人员', category: 'role', tags: ['综合学习'] },
  // 学习主题（公务员培训方向）
  { id: 't1', label: '政策理论学习', category: 'topic', tags: ['理论学习'] },
  { id: 't2', label: '行政管理能力', category: 'topic', tags: ['行政管理'] },
  { id: 't3', label: '基层治理实务', category: 'topic', tags: ['基层实务'] },
  { id: 't4', label: '乡村振兴与区域发展', category: 'topic', tags: ['政策解读'] },
  { id: 't5', label: '廉政教育与纪律建设', category: 'topic', tags: ['警示教育'] },
  { id: 't6', label: '数字经济与科技创新', category: 'topic', tags: ['前沿专题'] },
  { id: 't7', label: '公文写作与表达能力', category: 'topic', tags: ['职业技能'] },
  { id: 't8', label: '法律法规与依法行政', category: 'topic', tags: ['法治专题'] },
];

// 主题映射到对应节点（一级节点）
export const topicNodeMap: Record<string, string> = {
  '政策理论学习': 'party-20th-congress',
  '行政管理能力': 'party-building-basics',
  '基层治理实务': 'grassroots-party-work',
  '乡村振兴与区域发展': 'rural-revitalization',
  '廉政教育与纪律建设': 'disciplinary-style',
  '数字经济与科技创新': 'party-20th-congress',
  '公文写作与表达能力': 'party-building-basics',
  '法律法规与依法行政': 'disciplinary-style',
};

// 递归查找节点
export function getNodeById(id: string, node: KnowledgeNode): KnowledgeNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = getNodeById(id, child);
      if (found) return found;
    }
  }
  return null;
}



/**
 * 根据难度等级获取被锁定的节点ID集合
 * beginner: 锁定 difficulty >= 2 的节点
 * intermediate: 锁定 difficulty >= 3 的节点
 * advanced: 不锁定任何节点
 */
export function getDifficultyLockedNodeIds(root: KnowledgeNode, level: string): Set<string> {
  const maxDifficulty = level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3;
  const locked = new Set<string>();

  function scan(node: KnowledgeNode) {
    if (node.difficulty && node.difficulty > maxDifficulty) {
      locked.add(node.id);
    }
    if (node.children) {
      node.children.forEach(scan);
    }
  }

  scan(root);
  return locked;
}

/**
 * 提取课程标题前缀（去掉括号及其内容）
 */
function extractCoursePrefix(title: string): string {
  const idx = title.indexOf('（');
  return idx >= 0 ? title.substring(0, idx).trim() : title.trim();
}

/**
 * 为知识节点注入课程数据
 * - 每个底层节点插入 3-5 门课程
 * - 如果课程名包含上/中/下，则将该系列全部纳入（可以短暂超出上限）
 */
function injectCoursesToNode(node: KnowledgeNode): KnowledgeNode {
  const dbCourses = courseDatabase[node.id];
  if (!dbCourses || dbCourses.length === 0) {
    return node;
  }

  // 按前缀分组
  const prefixMap = new Map<string, CourseInfo[]>();
  dbCourses.forEach(course => {
    const prefix = extractCoursePrefix(course.title);
    if (!prefixMap.has(prefix)) {
      prefixMap.set(prefix, []);
    }
    prefixMap.get(prefix)!.push(course);
  });

  // 判断哪些组包含 上/中/下 系列
  const hasSeriesParts = (courses: CourseInfo[]) => {
    return courses.some(c => c.title.includes('（上）') || c.title.includes('（中）') || c.title.includes('（下）'));
  };

  // 选择课程：优先选择完整系列，再填充普通课程到 3-5 门
  const selected: CourseInfo[] = [];
  const usedPrefixes = new Set<string>();

  // 第一遍：收集所有含 上/中/下 的系列（全部纳入）
  for (const [prefix, courses] of prefixMap) {
    if (hasSeriesParts(courses)) {
      selected.push(...courses);
      usedPrefixes.add(prefix);
    }
  }

  // 第二遍：从剩余课程中挑选，凑够 3-5 门
  const remaining = dbCourses.filter(c => !usedPrefixes.has(extractCoursePrefix(c.title)));
  let idx = 0;
  while (selected.length < 5 && idx < remaining.length) {
    selected.push(remaining[idx]);
    idx++;
  }

  // 如果选了超过 5 门但有连续系列，保留；如果没连续系列且超过 5 门，截断到 5 门
  const hasContinuousSeries = [...prefixMap.values()].some(courses => 
    hasSeriesParts(courses) && courses.length >= 2
  );
  const finalCourses = (hasContinuousSeries || selected.length <= 5) ? selected : selected.slice(0, 5);

  return {
    ...node,
    courses: finalCourses.length > 0 ? finalCourses : node.courses,
  };
}

/**
 * 深度遍历，为所有叶子节点注入课程
 */
function injectCoursesRecursive(node: KnowledgeNode): KnowledgeNode {
  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => injectCoursesRecursive(child)),
    };
  }
  // 叶子节点：注入课程
  return injectCoursesToNode(node);
}

// 筛选节点（不包含难度筛选）
function filterNodes(
  node: KnowledgeNode,
  selectedIds: Set<string>
): KnowledgeNode | null {
  // 递归过滤子节点
  let filteredChildren = node.children
    ?.map(child => filterNodes(child, selectedIds))
    .filter((child): child is KnowledgeNode => child !== null);

  const isSelected = selectedIds.has(node.id);

  // Level 0 根节点：始终保留
  if (node.level === 0) {
    return { ...node, children: filteredChildren };
  }

  // Level 1 一级分类节点：只要有子节点就保留
  if (node.level === 1) {
    if ((filteredChildren && filteredChildren.length > 0) || isSelected) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  // Level 2+ 节点：根据选中状态筛选，不再按难度过滤
  if (isSelected) {
    return { ...node, children: undefined };
  }

  if (!filteredChildren?.length && !isSelected) {
    return null;
  }

  return { ...node, children: filteredChildren };
}

// 角色到节点的映射（导出供诊断结果展示使用）
export const roleNodeMap: Record<string, string[]> = {
  '厅局级干部': ['grassroots-party-work', 'party-life'],
  '县处级干部': ['grassroots-party-work', 'membership-development'],
  '乡科级干部': ['party-constitution', 'party-history'],
  '科员': ['party-constitution', 'membership-development'],
  '基层工作人员': ['party-theory', 'integrity-education'],
  '事业单位人员': ['party-constitution', 'party-history'],
};

// 文本需求关键词匹配词典（公务员培训方向）
const requirementKeywords: Record<string, { topics: string[]; nodes: string[] }> = {
  '政策': { topics: ['政策理论学习'], nodes: ['20th-report', 'chinese-modernization'] },
  '理论': { topics: ['政策理论学习'], nodes: ['party-theory', 'party-constitution'] },
  '二十大': { topics: ['政策理论学习'], nodes: ['20th-report'] },
  '现代化': { topics: ['政策理论学习', '数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '管理': { topics: ['行政管理能力'], nodes: ['party-life', 'grassroots-party-work'] },
  '行政': { topics: ['行政管理能力', '法律法规与依法行政'], nodes: ['party-life'] },
  '领导': { topics: ['行政管理能力'], nodes: ['party-life'] },
  '基层': { topics: ['基层治理实务'], nodes: ['grassroots-party-work', 'mass-work', 'rural-governance'] },
  '治理': { topics: ['基层治理实务', '法律法规与依法行政'], nodes: ['grassroots-party-work', 'rural-governance'] },
  '乡村': { topics: ['乡村振兴与区域发展'], nodes: ['rural-policy', 'rural-governance'] },
  '振兴': { topics: ['乡村振兴与区域发展'], nodes: ['rural-revitalization', 'rural-policy'] },
  '三农': { topics: ['乡村振兴与区域发展'], nodes: ['rural-policy', 'rural-governance'] },
  '区域': { topics: ['乡村振兴与区域发展'], nodes: ['rural-policy'] },
  '廉政': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education', 'supervision-system'] },
  '纪律': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education'] },
  '反腐': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education', 'supervision-system'] },
  '作风': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education'] },
  '数字': { topics: ['数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '经济': { topics: ['数字经济与科技创新', '乡村振兴与区域发展'], nodes: ['chinese-modernization', 'rural-policy'] },
  '科技': { topics: ['数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '创新': { topics: ['数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '智能': { topics: ['数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '公文': { topics: ['公文写作与表达能力'], nodes: ['party-life'] },
  '写作': { topics: ['公文写作与表达能力'], nodes: ['party-life'] },
  '表达': { topics: ['公文写作与表达能力'], nodes: ['party-life'] },
  '法律': { topics: ['法律法规与依法行政'], nodes: ['supervision-system'] },
  '法规': { topics: ['法律法规与依法行政'], nodes: ['supervision-system'] },
  '依法': { topics: ['法律法规与依法行政'], nodes: ['supervision-system'] },
  '法治': { topics: ['法律法规与依法行政'], nodes: ['supervision-system'] },
  '党建': { topics: ['政策理论学习', '行政管理能力'], nodes: ['party-constitution', 'party-history', 'party-building-basics'] },
  '组织': { topics: ['行政管理能力'], nodes: ['party-life', 'membership-development'] },
  '人事': { topics: ['行政管理能力'], nodes: ['party-life'] },
  '考核': { topics: ['行政管理能力'], nodes: ['party-life'] },
  '应急': { topics: ['行政管理能力', '基层治理实务'], nodes: ['grassroots-party-work'] },
  '信访': { topics: ['基层治理实务', '法律法规与依法行政'], nodes: ['mass-work'] },
  '民生': { topics: ['基层治理实务', '乡村振兴与区域发展'], nodes: ['mass-work', 'rural-policy'] },
  '服务': { topics: ['基层治理实务', '行政管理能力'], nodes: ['mass-work', 'party-life'] },
};

// 分析用户文本需求，匹配知识图谱节点和主题
export function analyzeRequirements(text: string): RequirementAnalysis {
  const keywords: string[] = [];
  const matchedTopics = new Set<string>();
  const matchedNodes = new Set<string>();

  for (const [keyword, mapping] of Object.entries(requirementKeywords)) {
    if (text.includes(keyword)) {
      keywords.push(keyword);
      mapping.topics.forEach(t => matchedTopics.add(t));
      mapping.nodes.forEach(n => matchedNodes.add(n));
    }
  }

  // 根据关键词数量推测学习深度
  const suggestedLevel: 'beginner' | 'intermediate' | 'advanced' =
    keywords.length <= 1 ? 'beginner' : keywords.length <= 3 ? 'intermediate' : 'advanced';

  return {
    keywords,
    matchedTopics: Array.from(matchedTopics),
    matchedNodes: Array.from(matchedNodes),
    suggestedLevel,
  };
}

// 生成学习路径（level 仅用于元数据显示，不做节点过滤）
export function generateLearningPath(profile: {
  roles: string[];
  topics: string[];
  level?: string;
  customRequirements?: string;
}): LearningPath {
  // 收集选中的节点ID
  const selectedIds = new Set<string>();
  const allTopics = [...profile.topics];

  // 如果提供了文本需求，分析并合并主题
  if (profile.customRequirements && profile.customRequirements.trim()) {
    const analysis = analyzeRequirements(profile.customRequirements);
    analysis.matchedTopics.forEach(t => {
      if (!allTopics.includes(t)) {
        allTopics.push(t);
      }
    });
    analysis.matchedNodes.forEach(n => selectedIds.add(n));
    if (!profile.level) {
      profile.level = analysis.suggestedLevel;
    }
  }

  profile.roles.forEach(role => {
    const nodes = roleNodeMap[role];
    if (nodes) nodes.forEach(id => selectedIds.add(id));
  });

  allTopics.forEach(topic => {
    const nodeId = topicNodeMap[topic];
    if (nodeId) selectedIds.add(nodeId);
  });

  // 添加父节点
  const parentMap: Record<string, string> = {
    'party-constitution': 'party-building-basics',
    'party-history': 'party-building-basics',
    'party-theory': 'party-building-basics',
    '20th-report': 'party-20th-congress',
    'chinese-modernization': 'party-20th-congress',
    'comprehensive-strict-governance': 'party-20th-congress',
    'membership-development': 'grassroots-party-work',
    'party-life': 'grassroots-party-work',
    'mass-work': 'grassroots-party-work',
    'rural-policy': 'rural-revitalization',
    'rural-governance': 'rural-revitalization',
    'integrity-education': 'disciplinary-style',
    'supervision-system': 'disciplinary-style',
  };
  
  selectedIds.forEach(id => {
    const parentId = parentMap[id];
    if (parentId) {
      selectedIds.add(parentId);
    }
  });
  
  // 添加子节点（当选中父节点时，自动包含其子节点）
  const childrenMap: Record<string, string[]> = {
    'rural-revitalization': ['rural-policy', 'rural-governance'],
    'party-20th-congress': ['20th-report', 'chinese-modernization', 'comprehensive-strict-governance'],
    'grassroots-party-work': ['membership-development', 'party-life', 'mass-work'],
    'party-building-basics': ['party-constitution', 'party-history', 'party-theory'],
    'disciplinary-style': ['integrity-education', 'supervision-system'],
  };
  
  const idsToAdd: string[] = [];
  selectedIds.forEach(id => {
    const children = childrenMap[id];
    if (children) {
      children.forEach(childId => {
        if (!selectedIds.has(childId)) {
          idsToAdd.push(childId);
        }
      });
    }
  });
  idsToAdd.forEach(id => selectedIds.add(id));
  
  // 筛选并构建学习路径（不进行难度筛选）
  const filteredRoot = filterNodes(partyKnowledgeGraph, selectedIds);
  
  // 计算总时长
  let totalDuration = 0;
  function calcDuration(node: KnowledgeNode) {
    if (node.content?.duration) {
      totalDuration += node.content.duration;
    }
    if (node.children) {
      node.children.forEach(calcDuration);
    }
  }
  if (filteredRoot) {
    calcDuration(filteredRoot);
  }
  
  // 生成标题
  const selectedRole = profile.roles[0] || '干部';
  const selectedTopic = allTopics[0] || '综合学习';
  const hasCustomReq = profile.customRequirements && profile.customRequirements.trim();
  
  return {
    id: `path-${Date.now()}`,
    title: `${selectedRole} · ${selectedTopic}${hasCustomReq ? '（个性化定制）' : ''}`,
    description: hasCustomReq
      ? `根据您的身份、主题偏好及学习需求「${profile.customRequirements!.slice(0, 30)}${profile.customRequirements!.length > 30 ? '...' : ''}」，为您智能规划个性化学习方案`
      : `基于您的选择，为您规划个性化学习方案`,
    rootNode: injectCoursesRecursive(filteredRoot || partyKnowledgeGraph),
    totalDuration: totalDuration || 120,
    difficulty: (profile.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner'
  };
}

// 模拟AI意图识别
export function analyzeIntent(userInput: string): { keywords: string[]; matchedPath: string } {
  const input = userInput.toLowerCase();
  const keywords: string[] = [];
  let matchedPath = '';
  
  // 关键词匹配
  const keywordMap: Record<string, string> = {
    '入党': 'membership-development',
    '党员': 'party-constitution',
    '发展': 'membership-development',
    '二十大': '20th-report',
    '现代化': 'chinese-modernization',
    '乡村': 'rural-revitalization',
    '振兴': 'rural-policy',
    '廉政': 'integrity-education',
    '监督': 'supervision-system',
    '党史': 'party-history',
    '党章': 'party-constitution',
    '群众': 'mass-work',
    '组织': 'party-life',
    '支部': 'party-life',
  };
  
  for (const [keyword, path] of Object.entries(keywordMap)) {
    if (input.includes(keyword)) {
      keywords.push(keyword);
      if (!matchedPath) matchedPath = path;
    }
  }
  
  return { keywords, matchedPath };
}

// 获取节点详情
export function getNodeDetails(nodeId: string): KnowledgeNode | null {
  return getNodeById(nodeId, partyKnowledgeGraph);
}
