import { KnowledgeNode, LearningPath, DiagnosticOption, CourseInfo, RequirementAnalysis } from './types';

function createCourse(id: string, title: string, duration: number): CourseInfo {
  return { id, title, duration };
}

// ============================================================
//  公务员方向知识总结规则系统
//  将知识库分类和文章按公务员考试/培训方向重新组织
// ============================================================

interface CivilServantDomain {
  id: string;
  name: string;
  examTags: string[];
  description: string;
  prerequisites: string[];
  difficulty: number;
}

interface SubNodeRule {
  id: string;
  nameTemplate: string;
  keywords: string[];
  examFocus: string;
  difficulty: number;
}

const CIVIL_SERVANT_DOMAINS: Record<string, CivilServantDomain> = {
  '政治理论': {
    id: 'political-literacy',
    name: '公务员政治素养',
    examTags: ['行测常识判断', '公共基础知识', '申论理论支撑'],
    description: '公务员考试与工作中必备的政治理论基础，涵盖党章党规、党史国史、创新理论及时政热点',
    prerequisites: [],
    difficulty: 1,
  },
  '党建实务': {
    id: 'political-literacy',
    name: '公务员政治素养',
    examTags: ['行测常识判断', '公共基础知识', '申论理论支撑'],
    description: '党务工作实际操作知识，包括发展党员、组织生活、支部建设等实务内容',
    prerequisites: [],
    difficulty: 1,
  },
  '社会治理': {
    id: 'administrative-practice',
    name: '公务员行政实务',
    examTags: ['申论素材积累', '面试热点分析', '岗位实务能力'],
    description: '聚焦公务员社会治理能力，涵盖基层治理、群众工作、公共服务等内容',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '经济管理': {
    id: 'economic-literacy',
    name: '公务员经济素养',
    examTags: ['行测经济常识', '申论经济分析', '宏观经济政策'],
    description: '提升公务员经济管理知识储备，掌握宏观经济政策、产业发展与市场规律',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '法律法规': {
    id: 'administrative-practice',
    name: '公务员行政实务',
    examTags: ['申论素材积累', '面试热点分析', '岗位实务能力'],
    description: '公务员依法行政必备知识，涵盖法律法规体系、法治思维与执法规范',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '廉政建设': {
    id: 'administrative-practice',
    name: '公务员行政实务',
    examTags: ['申论素材积累', '面试热点分析', '岗位实务能力'],
    description: '加强党风廉政教育，掌握反腐倡廉政策法规与纪律要求',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '业务能力': {
    id: 'comprehensive-ability',
    name: '公务员综合能力',
    examTags: ['申论政策分析', '面试综合素质', '时政热点理解'],
    description: '全面提升公务员岗位实务能力，包括公文写作、沟通协调、应急处理等',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '文化建设': {
    id: 'comprehensive-ability',
    name: '公务员综合能力',
    examTags: ['申论政策分析', '面试综合素质', '时政热点理解'],
    description: '增强文化自信与文化建设能力，掌握意识形态工作与文化传播方法',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '国际视野': {
    id: 'comprehensive-ability',
    name: '公务员综合能力',
    examTags: ['申论政策分析', '面试综合素质', '时政热点理解'],
    description: '开拓国际视野，了解国际形势、外交政策与全球治理格局',
    prerequisites: ['political-literacy'],
    difficulty: 3,
  },
  '统一战线': {
    id: 'comprehensive-ability',
    name: '公务员综合能力',
    examTags: ['申论政策分析', '面试综合素质', '时政热点理解'],
    description: '掌握统一战线理论方针，增强凝聚共识与团结协作能力',
    prerequisites: ['political-literacy'],
    difficulty: 2,
  },
  '未分类': {
    id: 'comprehensive-ability',
    name: '公务员综合能力',
    examTags: ['综合知识储备', '申论素材积累'],
    description: '通用知识储备，拓展公务员知识面的综合学习材料',
    prerequisites: [],
    difficulty: 1,
  },
};

const CIVIL_SERVANT_SUB_NODE_RULES: Record<string, SubNodeRule[]> = {
  '政治理论': [
    {
      id: 'constitution-rules',
      nameTemplate: '党章党规精讲',
      keywords: ['党章', '章程', '纪律', '党员', '入党', '组织制度', '党建'],
      examFocus: '公基必考·行测常识',
      difficulty: 1,
    },
    {
      id: 'party-history',
      nameTemplate: '党史国史通览',
      keywords: ['党史', '百年', '革命', '建国', '长征', '红军', '抗战', '抗美援朝', '改革开放', '新中国', '简史', '历史'],
      examFocus: '行测常识·申论史论',
      difficulty: 1,
    },
    {
      id: 'party-theory',
      nameTemplate: '党的创新理论',
      keywords: ['习近平', '新时代', '马克思主义', '中国特色', '思想', '治国理政', '理论', '两山', '生态文明'],
      examFocus: '公基核心·申论理论',
      difficulty: 2,
    },
    {
      id: 'current-politics',
      nameTemplate: '时政热点解读',
      keywords: ['二十大', '全会', '报告', '精神', '大统战', '新型政党', '协商民主'],
      examFocus: '行测时政·申论热点',
      difficulty: 2,
    },
    {
      id: 'chinese-modernization',
      nameTemplate: '中国式现代化',
      keywords: ['现代化', '高质量', '共同富裕', '十四五', '2035', '制度优势', '小康', '新征程', '改革'],
      examFocus: '申论核心素材',
      difficulty: 2,
    },
    {
      id: 'comprehensive-strict-governance',
      nameTemplate: '全面从严治党',
      keywords: ['从严', '自我革命', '四个全面', '政治建设', '问责', '伟大工程', '干部'],
      examFocus: '公基党建·面试热点',
      difficulty: 3,
    },
  ],
  '党建实务': [
    {
      id: 'party-building-practice',
      nameTemplate: '党务工作实务',
      keywords: ['发展党员', '入党', '党员', '支部', '组织生活', '党课', '主题党日', '三会一课', '基层'],
      examFocus: '公基党建·岗位实务',
      difficulty: 1,
    },
  ],
  '社会治理': [
    {
      id: 'social-governance',
      nameTemplate: '社会治理创新',
      keywords: ['治理', '社会', '社区', '基层', '信访', '矛盾', '调解', '安全', '应急', '灾害'],
      examFocus: '申论治理·面试热点',
      difficulty: 2,
    },
    {
      id: 'mass-work',
      nameTemplate: '群众工作方法',
      keywords: ['群众', '民心', '服务', '民主', '协商'],
      examFocus: '面试实务·基层能力',
      difficulty: 1,
    },
  ],
  '经济管理': [
    {
      id: 'macro-economy',
      nameTemplate: '宏观经济政策',
      keywords: ['经济', '宏观', 'GDP', '财政', '货币', '金融', '产业', '市场'],
      examFocus: '行测经济·申论分析',
      difficulty: 2,
    },
    {
      id: 'rural-development',
      nameTemplate: '乡村振兴与三农',
      keywords: ['乡村', '振兴', '三农', '农村', '农业', '农民', '脱贫', '扶贫', '精准'],
      examFocus: '申论必考·面试高频',
      difficulty: 1,
    },
    {
      id: 'digital-economy',
      nameTemplate: '数字经济与创新',
      keywords: ['数字', '科技', '创新', '智能', '大数据', '互联网', '信息化', '人工智能'],
      examFocus: '申论前沿·时政热点',
      difficulty: 2,
    },
  ],
  '法律法规': [
    {
      id: 'law-basics',
      nameTemplate: '法律法规基础',
      keywords: ['法律', '法规', '法治', '依法', '宪法', '行政法', '民法典'],
      examFocus: '公基法律·行测常识',
      difficulty: 2,
    },
    {
      id: 'supervision-system',
      nameTemplate: '监督执纪体系',
      keywords: ['监督', '监察', '审计', '巡视', '制度', '纪律'],
      examFocus: '公基法律·申论治理',
      difficulty: 3,
    },
  ],
  '廉政建设': [
    {
      id: 'integrity-education',
      nameTemplate: '廉政教育警示',
      keywords: ['廉政', '反腐', '八项规定', '作风', '四风', '廉洁', '纪律处分', '警示', '腐败'],
      examFocus: '公基廉政·面试素养',
      difficulty: 2,
    },
  ],
  '业务能力': [
    {
      id: 'official-writing',
      nameTemplate: '公文写作与表达',
      keywords: ['公文', '写作', '表达', '汇报', '演讲', '报告', '文书'],
      examFocus: '申论写作·岗位技能',
      difficulty: 1,
    },
    {
      id: 'admin-capability',
      nameTemplate: '行政管理能力',
      keywords: ['管理', '行政', '领导', '组织', '协调', '沟通', '团队', '考核'],
      examFocus: '面试能力·岗位实务',
      difficulty: 2,
    },
  ],
  '文化建设': [
    {
      id: 'cultural-confidence',
      nameTemplate: '文化自信建设',
      keywords: ['文化', '文明', '传统', '传承', '精神', '价值', '社会主义核心价值观'],
      examFocus: '申论文化·面试素养',
      difficulty: 2,
    },
    {
      id: 'ideology-work',
      nameTemplate: '意识形态工作',
      keywords: ['意识形态', '宣传', '舆论', '媒体', '网络', '思想'],
      examFocus: '公基·申论政策',
      difficulty: 2,
    },
  ],
  '国际视野': [
    {
      id: 'international-relations',
      nameTemplate: '国际关系与外交',
      keywords: ['国际', '外交', '全球', '世界', '一带一路', '人类命运共同体', '中美', '大国'],
      examFocus: '申论国际·时政热点',
      difficulty: 3,
    },
    {
      id: 'global-governance',
      nameTemplate: '全球治理格局',
      keywords: ['全球治理', '联合国', 'WTO', 'G20', '合作', '发展', '气候'],
      examFocus: '申论视野·面试素养',
      difficulty: 3,
    },
  ],
  '统一战线': [
    {
      id: 'united-front',
      nameTemplate: '统一战线工作',
      keywords: ['统战', '大统战', '党派', '多党合作', '党外', '知识分子', '联谊'],
      examFocus: '公基统战·政策理解',
      difficulty: 2,
    },
    {
      id: 'deliberative-democracy',
      nameTemplate: '民主协商机制',
      keywords: ['协商', '民主', '参政议政', '凝聚共识', '新型政党'],
      examFocus: '申论政策·面试素养',
      difficulty: 2,
    },
    {
      id: 'ethnic-religion',
      nameTemplate: '民族宗教政策',
      keywords: ['民族', '宗教', '意识形态', '统一'],
      examFocus: '公基常识·政策理解',
      difficulty: 2,
    },
  ],
  '未分类': [
    {
      id: 'general-knowledge',
      nameTemplate: '综合知识储备',
      keywords: [],
      examFocus: '综合素养·知识拓展',
      difficulty: 1,
    },
  ],
};

function generateCivilServantNodeName(domain: CivilServantDomain, rule: SubNodeRule): string {
  const prefixMap: Record<string, string> = {
    'political-literacy': '📖',
    'administrative-practice': '🏛️',
    'comprehensive-ability': '🎯',
    'economic-literacy': '💰',
  };
  const prefix = prefixMap[domain.id] || '📚';
  return `${prefix} ${rule.nameTemplate}`;
}

function generateCivilServantDescription(
  domain: CivilServantDomain,
  rule: SubNodeRule,
  articles: KnowledgeBaseApiDoc[]
): string {
  const examFocus = rule.examFocus;
  const count = articles.length;
  const sampleTopics = articles.slice(0, 3).map(a => a.title.replace(/\.txt$/, '').slice(0, 20)).join('、');

  if (count === 0) {
    return `【${examFocus}】本专题暂无匹配文章，请等待知识库更新`;
  }
  return `【${examFocus}】本专题涵盖${count}篇核心文章，聚焦公务员考试与工作中的高频考点。包含：${sampleTopics}等`;
}

function generateCivilServantKeyPoints(articles: KnowledgeBaseApiDoc[]): string[] {
  if (articles.length === 0) return ['暂无知识点，等待知识库更新'];

  const points: string[] = [];
  const titles = articles.map(a => a.title.replace(/\.txt$/, '').replace(/[（(][一二三四五六七八九十上中下\d]+[）)]/g, ''));

  // 取前5篇文章标题作为关键知识点，转换为公务员备考要点
  for (let i = 0; i < Math.min(titles.length, 5); i++) {
    const title = titles[i];
    // 将文章标题转化为备考要点表述
    let point = title;
    if (point.includes('党章')) point = `党章核心要点：${point}`;
    else if (point.includes('党史') || point.includes('简史') || point.includes('历史')) point = `党史必知：${point}`;
    else if (point.includes('习近平') || point.includes('新时代')) point = `重要思想：${point}`;
    else if (point.includes('二十大') || point.includes('全会')) point = `时政热点：${point}`;
    else if (point.includes('现代化') || point.includes('高质量') || point.includes('改革')) point = `发展战略：${point}`;
    else if (point.includes('乡村') || point.includes('振兴') || point.includes('三农')) point = `乡村振兴：${point}`;
    else if (point.includes('基层') || point.includes('治理') || point.includes('社区')) point = `基层治理：${point}`;
    else if (point.includes('廉政') || point.includes('反腐') || point.includes('腐败')) point = `廉政建设：${point}`;
    else if (point.includes('监督') || point.includes('监察') || point.includes('审计')) point = `监督体系：${point}`;
    else if (point.includes('群众') || point.includes('信访') || point.includes('服务')) point = `群众工作：${point}`;
    else if (point.includes('统战') || point.includes('协商') || point.includes('党派')) point = `统战理论：${point}`;
    else if (point.includes('民族') || point.includes('宗教')) point = `民族宗教：${point}`;
    else if (point.includes('经济') || point.includes('金融') || point.includes('产业')) point = `经济管理：${point}`;
    else if (point.includes('法律') || point.includes('法规') || point.includes('法治')) point = `法律法规：${point}`;
    else if (point.includes('数字') || point.includes('科技') || point.includes('创新')) point = `数字经济：${point}`;
    else if (point.includes('公文') || point.includes('写作') || point.includes('表达')) point = `公文写作：${point}`;
    else if (point.includes('文化') || point.includes('文明') || point.includes('精神')) point = `文化建设：${point}`;
    else if (point.includes('国际') || point.includes('外交') || point.includes('全球')) point = `国际视野：${point}`;
    else if (point.includes('意识形态') || point.includes('宣传') || point.includes('舆论')) point = `意识形态：${point}`;
    else point = `备考要点：${point}`;

    if (point.length > 40) point = point.slice(0, 37) + '...';
    points.push(point);
  }

  return points;
}

function groupArticlesByCivilServantTopics(
  docs: KnowledgeBaseApiDoc[]
): Map<string, Map<string, KnowledgeBaseApiDoc[]>> {
  // 外层: category -> 内层: subNodeId -> articles
  const result = new Map<string, Map<string, KnowledgeBaseApiDoc[]>>();

  for (const [category, rules] of Object.entries(CIVIL_SERVANT_SUB_NODE_RULES)) {
    const subMap = new Map<string, KnowledgeBaseApiDoc[]>();
    for (const rule of rules) {
      subMap.set(rule.id, []);
    }
    result.set(category, subMap);
  }

  for (const doc of docs) {
    const category = doc.category;
    const rules = CIVIL_SERVANT_SUB_NODE_RULES[category];
    if (!rules) continue;

    const cleanTitle = doc.title.replace(/\.txt$/, '').replace(/[《》（）【】\s]/g, '');

    let matched = false;
    for (const rule of rules) {
      if (rule.keywords.length === 0) continue;
      if (rule.keywords.some(kw => cleanTitle.includes(kw))) {
        const subMap = result.get(category);
        if (subMap) {
          subMap.get(rule.id)?.push(doc);
        }
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const rule of rules) {
      if (rule.keywords.length === 0) {
        const subMap = result.get(category);
        if (subMap) {
          subMap.get(rule.id)?.push(doc);
        }
        break;
      }
    }
  }

  return result;
}

function calculateEstimatedDuration(paragraphCount: number): number {
  if (paragraphCount <= 0) return 30;
  return Math.max(15, Math.min(60, paragraphCount * 2));
}

function buildDynamicKnowledgeGraph(
  docs: KnowledgeBaseApiDoc[],
  categoryCounts: Record<string, number>
): KnowledgeNode {
  const groupedArticles = groupArticlesByCivilServantTopics(docs);

  // 获取知识库中有实际文章的分类
  const availableCategories = Object.keys(categoryCounts).filter(
    cat => CIVIL_SERVANT_DOMAINS[cat] && categoryCounts[cat] > 0
  );

  if (availableCategories.length === 0) {
    // 如果没有数据，回退到所有已配置分类
    availableCategories.push(...Object.keys(CIVIL_SERVANT_DOMAINS));
  }

  const level1Children: KnowledgeNode[] = [];

  for (const category of availableCategories) {
    const domain = CIVIL_SERVANT_DOMAINS[category];
    if (!domain) continue;

    const subRules = CIVIL_SERVANT_SUB_NODE_RULES[category] || [];
    const subMap = groupedArticles.get(category);
    const level2Children: KnowledgeNode[] = [];

    for (const rule of subRules) {
      const articles = subMap?.get(rule.id) || [];

      if (articles.length === 0) continue; // 没有文章的子节点不展示

      const courses: CourseInfo[] = articles.map(a => createCourse(
        a.id,
        a.title.replace(/\.txt$/, ''),
        calculateEstimatedDuration(a.paragraphCount)
      ));

      level2Children.push({
        id: rule.id,
        name: generateCivilServantNodeName(domain, rule),
        level: 2,
        difficulty: rule.difficulty,
        description: generateCivilServantDescription(domain, rule, articles),
        keyPoints: generateCivilServantKeyPoints(articles),
        courses,
      });
    }

    if (level2Children.length > 0) {
      level1Children.push({
        id: domain.id,
        name: domain.name,
        level: 1,
        description: `${domain.description}\n\n📝 考试方向：${domain.examTags.join('、')}`,
        children: level2Children,
        prerequisites: domain.prerequisites,
        difficulty: domain.difficulty,
      });
    }
  }

  return {
    id: 'root',
    name: '公务员备考学习体系',
    level: 0,
    description: '基于知识库真实数据，按公务员考试与培训方向智能组织的学习图谱',
    children: level1Children,
  };
}

let dynamicGraphCache: KnowledgeNode | null = null;

export function getDynamicKnowledgeGraph(): KnowledgeNode | null {
  return dynamicGraphCache;
}

export function setDynamicKnowledgeGraph(graph: KnowledgeNode) {
  dynamicGraphCache = graph;
  rebuildParentAndChildrenMaps(graph);
  rebuildDynamicKeywordIndex();
}

function rebuildDynamicKeywordIndex() {
  if (!dynamicGraphCache) return;
  const index = new Map<string, string[]>();

  function collect(node: KnowledgeNode) {
    if (node.id !== 'root') {
      // 从节点名称和关键要点中提取关键词
      const text = `${node.name} ${node.description || ''} ${(node.keyPoints || []).join(' ')}`;
      const words = text.split(/[，。、：；！？\s,.!:;?]+/);
      for (const word of words) {
        if (word.length >= 2 && word.length <= 12) {
          const existing = index.get(word);
          if (existing) {
            if (!existing.includes(node.id)) existing.push(node.id);
          } else {
            index.set(word, [node.id]);
          }
        }
      }
    }
    if (node.children) {
      node.children.forEach(collect);
    }
  }

  collect(dynamicGraphCache);

  // 合并课程关键词索引和动态图谱索引
  for (const [word, nodeIds] of knowledgeBaseKeywordIndex) {
    const existing = index.get(word);
    if (existing) {
      for (const nid of nodeIds) {
        if (!existing.includes(nid)) existing.push(nid);
      }
    } else {
      index.set(word, nodeIds);
    }
  }
  knowledgeBaseKeywordIndex = index;
}

// 父节点映射（动态计算）
let dynamicParentMap: Record<string, string> = {};
let dynamicChildrenMap: Record<string, string[]> = {};

function rebuildParentAndChildrenMaps(root: KnowledgeNode) {
  const parentMap: Record<string, string> = {};
  const childrenMap: Record<string, string[]> = {};

  function traverse(node: KnowledgeNode, parentId?: string) {
    if (parentId) {
      parentMap[node.id] = parentId;
    }
    if (node.children && node.children.length > 0) {
      childrenMap[node.id] = node.children.map(c => c.id);
      for (const child of node.children) {
        traverse(child, node.id);
      }
    }
  }

  traverse(root);
  dynamicParentMap = parentMap;
  dynamicChildrenMap = childrenMap;
}

export function getDynamicParentMap(): Record<string, string> {
  return dynamicParentMap;
}

export function getDynamicChildrenMap(): Record<string, string[]> {
  return dynamicChildrenMap;
}

const filenameNodeMapping: Record<string, string[]> = {
  // ===== 党章学习 =====
  '党章': ['party-constitution'], '章程': ['party-constitution'],
  '修养': ['party-constitution'], '党性': ['party-constitution'],
  '党员权利': ['party-constitution'], '党员义务': ['party-constitution'],
  '入党誓词': ['party-constitution'], '组织制度': ['party-constitution'],
  '修身': ['party-constitution'], '官德': ['party-constitution'],

  // ===== 党史学习 =====
  '党史': ['party-history'], '百年': ['party-history'],
  '革命': ['party-history'], '建国': ['party-history'],
  '红军': ['party-history'], '抗战': ['party-history'],
  '长征': ['party-history'], '抗美援朝': ['party-history'],
  '改革开放': ['party-history'], '新中国': ['party-history'],
  '党的历史': ['party-history'], '党的建设': ['party-history'],
  '十一届三中全会': ['party-history'], '六中全会': ['party-history'],
  '建党': ['party-history'], '百年奋斗': ['party-history'],

  // ===== 党的创新理论 =====
  '习近平': ['party-theory'], '新时代': ['party-theory'],
  '马克思主义': ['party-theory'], '思想': ['party-theory'],
  '中国特色': ['party-theory'], '治国理政': ['party-theory'],
  '党的十九大': ['party-theory'], '十九大精神': ['party-theory'],
  '理论': ['party-theory'], '政治理论': ['party-theory'],
  '生态文明': ['party-theory'], '生态': ['party-theory'],
  '两山': ['party-theory'], '治理体系': ['party-theory'],
  '领导干部': ['party-theory'], '中青班': ['party-theory'],

  // ===== 二十大报告解读 =====
  '二十大': ['20th-report'], '二十大精神': ['20th-report'],
  '报告解读': ['20th-report'], '大会精神': ['20th-report'],
  '全会精神': ['20th-report'], '五中全会': ['20th-report'],
  '党的十九届六中全会': ['20th-report'], '全会公报': ['20th-report'],

  // ===== 中国式现代化 =====
  '现代化': ['chinese-modernization'], '现代化强国': ['chinese-modernization'],
  '新征程': ['chinese-modernization'], '共同富裕': ['chinese-modernization'],
  '高质量发展': ['chinese-modernization'], '治理效能': ['chinese-modernization'],
  '制度优势': ['chinese-modernization'],
  '十四五': ['chinese-modernization'], '2035': ['chinese-modernization'],

  // ===== 全面从严治党 =====
  '从严治党': ['comprehensive-strict-governance'], '自我革命': ['comprehensive-strict-governance'],
  '政治建设': ['comprehensive-strict-governance'], '四个全面': ['comprehensive-strict-governance'],
  '伟大工程': ['comprehensive-strict-governance'],
  '治党': ['comprehensive-strict-governance'], '问责': ['comprehensive-strict-governance'],
  '政治过硬': ['comprehensive-strict-governance'], '本领高强': ['comprehensive-strict-governance'],

  // ===== 发展党员工作 =====
  '发展党员': ['membership-development'], '入党': ['membership-development'],
  '积极分子': ['membership-development'], '预备党员': ['membership-development'],
  '党员发展': ['membership-development'],

  // ===== 党的组织生活 =====
  '组织生活': ['party-life'], '三会一课': ['party-life'],
  '支部': ['party-life'], '主题党日': ['party-life'],
  '党课': ['party-life'], '基层组织': ['party-life'],
  '基层党建': ['party-life'], '党支部': ['party-life'],

  // ===== 群众工作方法 =====
  '群众': ['mass-work'], '信访': ['mass-work'],
  '矛盾': ['mass-work'], '调解': ['mass-work'],
  '统战': ['mass-work', 'membership-development'], '统战理论': ['mass-work', 'membership-development'],
  '民族': ['mass-work'], '宗教': ['mass-work'],
  '意识形态': ['mass-work', 'party-theory'], '民心': ['mass-work'],
  '协商': ['mass-work'], '民主': ['mass-work'],

  // ===== 乡村振兴政策 =====
  '乡村': ['rural-policy', 'rural-governance'], '振兴': ['rural-policy', 'rural-governance'],
  '三农': ['rural-policy'], '农村': ['rural-policy'],
  '农业': ['rural-policy'], '农民': ['rural-policy'],
  '脱贫': ['rural-policy'], '扶贫': ['rural-policy'],
  '小康': ['rural-policy'], '精准脱贫': ['rural-policy'],

  // ===== 乡村治理现代化 =====
  '乡村治理': ['rural-governance'], '基层治理': ['rural-governance', 'party-life'],
  '社区': ['rural-governance'], '社会治理': ['rural-governance'],
  '法治乡村': ['rural-governance'], '德治': ['rural-governance'],
  '自治': ['rural-governance'],

  // ===== 廉政教育 =====
  '廉政': ['integrity-education'], '廉洁': ['integrity-education'],
  '反腐': ['integrity-education', 'supervision-system'],
  '八项规定': ['integrity-education'], '作风': ['integrity-education'],
  '纪律处分': ['integrity-education'], '四风': ['integrity-education'],
  '警示教育': ['integrity-education'],

  // ===== 监督执纪体系 =====
  '监督': ['supervision-system'], '监察': ['supervision-system'],
  '审计': ['supervision-system'], '巡视': ['supervision-system'],
  '纪律': ['supervision-system', 'integrity-education'],

  // ===== 综合/交叉 =====
  '经济': ['chinese-modernization', 'rural-policy'],
  '抗疫': ['chinese-modernization', 'party-life'],
  '疫情': ['chinese-modernization', 'party-life'],
  '科技': ['chinese-modernization'], '创新': ['chinese-modernization'],
  '法治': ['supervision-system'], '法律': ['supervision-system'],
  '教育': ['party-life'], '干部': ['party-theory', 'party-life'],
  '制度': ['comprehensive-strict-governance', 'supervision-system'],
  '数字化': ['chinese-modernization'], '大数据': ['chinese-modernization'],
  '安全': ['party-life', 'supervision-system'],
  '应急': ['party-life'], '灾害': ['party-life'],
  '国际': ['chinese-modernization'], '外交': ['chinese-modernization'],
};

function matchFilenameToNodes(filename: string): string[] {
  const matched = new Set<string>();
  const clean = filename.replace(/\.txt$/, '').replace(/[（(][一二三四五六七八九十上中下\d]+[）)]/g, '');
  for (const [keyword, nodeIds] of Object.entries(filenameNodeMapping)) {
    if (clean.includes(keyword)) {
      nodeIds.forEach(n => matched.add(n));
    }
  }
  if (matched.size === 0) matched.add('party-constitution');
  return Array.from(matched);
}

function matchCategoryToDynamicNodes(category: string): string[] {
  const rules = CIVIL_SERVANT_SUB_NODE_RULES[category];
  if (!rules) return [];
  return rules.map(r => r.id);
}

function matchCategoryToNodes(category: string): string[] {
  return matchCategoryToDynamicNodes(category);
}

export interface KnowledgeBaseApiDoc {
  id: string;
  title: string;
  category: string;
  paragraphCount: number;
  fileName: string;
  courseName?: string;
}

let courseDatabase: Record<string, CourseInfo[]> = {};

export async function fetchKnowledgeBaseCourses(
  apiBase?: string
): Promise<{ courses: Record<string, CourseInfo[]>; docs: KnowledgeBaseApiDoc[]; categoryCounts: Record<string, number>; graph: KnowledgeNode | null }> {
  try {
    const baseUrl = apiBase || '/api/knowledge-base';
    const url = `${baseUrl}?pageSize=600`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    const docs: KnowledgeBaseApiDoc[] = (data.docs || []).filter(
      (d: KnowledgeBaseApiDoc) => d.id && d.title
    );

    const categoryCounts: Record<string, number> = data.categoryCounts || data.globalCategoryCounts || {};

    console.log(`[知识库API] 获取到 ${docs.length} 份文档, 分类: ${JSON.stringify(categoryCounts)}`);

    const courses: Record<string, CourseInfo[]> = {};

    for (const doc of docs) {
      const categoryNodes = matchCategoryToNodes(doc.category);
      const filenameNodes = matchFilenameToNodes(doc.fileName);
      const allNodeIds = Array.from(new Set([...categoryNodes, ...filenameNodes]));
      const estimatedDuration = doc.paragraphCount ? Math.max(15, doc.paragraphCount * 3) : 30;

      for (const nodeId of allNodeIds) {
        if (!courses[nodeId]) courses[nodeId] = [];
        if (!courses[nodeId].some(c => c.id === doc.id)) {
          courses[nodeId].push(createCourse(doc.id, doc.fileName.replace(/\.txt$/, ''), estimatedDuration));
        }
      }
    }

    setKnowledgeBaseCourses(courses);

    // 构建公务员方向的动态知识图谱
    const dynamicGraph = buildDynamicKnowledgeGraph(docs, categoryCounts);
    setDynamicKnowledgeGraph(dynamicGraph);

    console.log(`[动态图谱] 已构建公务员方向知识图谱，一级节点: ${dynamicGraph.children?.length || 0} 个`);

    return { courses, docs, categoryCounts, graph: dynamicGraph };
  } catch (error) {
    console.warn('知识库API获取失败:', error);
    return { courses: courseDatabase, docs: [], categoryCounts: {}, graph: null };
  }
}

export function setKnowledgeBaseCourses(courses: Record<string, CourseInfo[]>) {
  courseDatabase = {};
  for (const [nodeId, courseList] of Object.entries(courses)) {
    courseDatabase[nodeId] = [...courseList];
  }
  rebuildKeywordIndex();
}

export function resetKnowledgeBaseCourses() {
  courseDatabase = {};
  rebuildKeywordIndex();
}

let knowledgeBaseKeywordIndex = new Map<string, string[]>();

function rebuildKeywordIndex() {
  const index = new Map<string, string[]>();
  for (const [nodeId, courses] of Object.entries(courseDatabase)) {
    for (const course of courses) {
      const clean = course.title.replace(/[《》（）【】\s]/g, '');
      const words = clean.split(/[，。、：；！？,.!:;?]+/);
      for (const word of words) {
        if (word.length >= 2 && word.length <= 12) {
          const existing = index.get(word);
          if (existing) {
            if (!existing.includes(nodeId)) existing.push(nodeId);
          } else {
            index.set(word, [nodeId]);
          }
        }
      }
    }
  }
  knowledgeBaseKeywordIndex = index;
}

export function getPartyKnowledgeGraph(): KnowledgeNode {
  // 优先使用动态构建的公务员方向图谱
  if (dynamicGraphCache && dynamicGraphCache.children && dynamicGraphCache.children.length > 0) {
    return injectCoursesRecursive(dynamicGraphCache);
  }
  // 回退到静态图谱（兼容初始化阶段和离线状态）
  return injectCoursesRecursive(partyKnowledgeGraph);
}

// 核心知识图谱 - 党建知识体系
export const partyKnowledgeGraph: KnowledgeNode = {
  id: 'root',
  name: '精英在线智能学习体系',
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
export function getDiagnosticOptions(): DiagnosticOption[] {
  const roleOptions: DiagnosticOption[] = [
    { id: 'r1', label: '厅局级干部', category: 'role', tags: ['领导力提升'] },
    { id: 'r2', label: '县处级干部', category: 'role', tags: ['行政管理'] },
    { id: 'r3', label: '乡科级干部', category: 'role', tags: ['基层治理'] },
    { id: 'r4', label: '科员', category: 'role', tags: ['基础学习'] },
    { id: 'r5', label: '基层工作人员', category: 'role', tags: ['实务操作'] },
    { id: 'r6', label: '事业单位人员', category: 'role', tags: ['综合学习'] },
  ];

  // 从动态图谱的领域标签生成主题选项
  if (dynamicGraphCache && dynamicGraphCache.children && dynamicGraphCache.children.length > 0) {
    const allLabels: string[] = [];
    for (const child of dynamicGraphCache.children) {
      allLabels.push(...getTopicLabelsForDomain(child.id));
    }
    const uniqueLabels = [...new Set(allLabels)];
    const topicOptions: DiagnosticOption[] = uniqueLabels.map((label, i) => ({
      id: `t${i + 1}`,
      label,
      category: 'topic' as const,
      tags: [label],
    }));
    return [...roleOptions, ...topicOptions];
  }

  // 回退：静态主题选项
  const topicOptions: DiagnosticOption[] = [
    { id: 't1', label: '政策理论学习', category: 'topic', tags: ['理论学习'] },
    { id: 't2', label: '行政管理能力', category: 'topic', tags: ['行政管理'] },
    { id: 't3', label: '基层治理实务', category: 'topic', tags: ['基层实务'] },
    { id: 't4', label: '乡村振兴与区域发展', category: 'topic', tags: ['政策解读'] },
    { id: 't5', label: '廉政教育与纪律建设', category: 'topic', tags: ['警示教育'] },
    { id: 't6', label: '数字经济与科技创新', category: 'topic', tags: ['前沿专题'] },
    { id: 't7', label: '公文写作与表达能力', category: 'topic', tags: ['职业技能'] },
    { id: 't8', label: '法律法规与依法行政', category: 'topic', tags: ['法治专题'] },
  ];
  return [...roleOptions, ...topicOptions];
}

// 向后兼容: 静态导出（用于 SSR / 初始渲染）
export const diagnosticOptions: DiagnosticOption[] = getDiagnosticOptions();

// 主题映射到对应节点（一级节点）—— 公务员方向
export function getTopicNodeMap(): Record<string, string> {
  if (dynamicGraphCache && dynamicGraphCache.children && dynamicGraphCache.children.length > 0) {
    const map: Record<string, string> = {};
    for (const child of dynamicGraphCache.children) {
      const topicLabels = getTopicLabelsForDomain(child.id);
      for (const label of topicLabels) {
        map[label] = child.id;
      }
    }
    return map;
  }
  // 回退
  return {
    '政策理论学习': 'political-literacy',
    '行政管理能力': 'administrative-practice',
    '基层治理实务': 'administrative-practice',
    '乡村振兴与区域发展': 'administrative-practice',
    '廉政教育与纪律建设': 'administrative-practice',
    '数字经济与科技创新': 'comprehensive-ability',
    '公文写作与表达能力': 'comprehensive-ability',
    '法律法规与依法行政': 'administrative-practice',
  };
}

function getTopicLabelsForDomain(domainId: string): string[] {
  switch (domainId) {
    case 'political-literacy':
      return ['政策理论学习', '党史党建学习', '时政热点研究', '政治理论基础'];
    case 'administrative-practice':
      return ['行政管理能力', '基层治理实务', '廉政教育与纪律建设', '法律法规与依法行政', '社会治理创新'];
    case 'economic-literacy':
      return ['经济管理能力', '数字经济与科技创新', '乡村振兴与区域发展', '宏观经济政策'];
    case 'comprehensive-ability':
      return ['综合能力提升', '公文写作与表达能力', '统战理论学习', '国际视野拓展', '文化建设素养'];
    default:
      return [];
  }
}

export const topicNodeMap: Record<string, string> = {};

export function initTopicNodeMap() {
  const map = getTopicNodeMap();
  for (const [k, v] of Object.entries(map)) {
    (topicNodeMap as Record<string, string>)[k] = v;
  }
}

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

// 通过课程ID查找包含该课程的节点（用于知识库系统ID匹配）
export function findNodeByCourseId(courseId: string, node: KnowledgeNode): KnowledgeNode | null {
  if (node.courses && node.courses.some(c => c.id === courseId)) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByCourseId(courseId, child);
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
export function injectCoursesRecursive(node: KnowledgeNode): KnowledgeNode {
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
  const filteredChildren = node.children
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
  '厅局级干部': ['admin-capability', 'social-governance', 'international-relations'],
  '县处级干部': ['admin-capability', 'social-governance', 'macro-economy'],
  '乡科级干部': ['social-governance', 'mass-work', 'rural-development'],
  '科员': ['official-writing', 'constitution-rules', 'party-theory'],
  '基层工作人员': ['mass-work', 'social-governance', 'party-theory'],
  '事业单位人员': ['admin-capability', 'official-writing', 'law-basics'],
};

// 文本需求关键词匹配词典（公务员培训方向）
const requirementKeywords: Record<string, { topics: string[]; nodes: string[] }> = {
  '政策': { topics: ['政策理论学习'], nodes: ['current-politics', 'chinese-modernization'] },
  '理论': { topics: ['政策理论学习'], nodes: ['party-theory', 'constitution-rules'] },
  '二十大': { topics: ['政策理论学习'], nodes: ['current-politics'] },
  '现代化': { topics: ['政策理论学习', '数字经济与科技创新'], nodes: ['chinese-modernization'] },
  '管理': { topics: ['行政管理能力'], nodes: ['admin-capability', 'social-governance'] },
  '行政': { topics: ['行政管理能力', '法律法规与依法行政'], nodes: ['admin-capability'] },
  '领导': { topics: ['行政管理能力'], nodes: ['admin-capability'] },
  '基层': { topics: ['基层治理实务'], nodes: ['social-governance', 'mass-work'] },
  '治理': { topics: ['基层治理实务', '法律法规与依法行政'], nodes: ['social-governance'] },
  '乡村': { topics: ['乡村振兴与区域发展'], nodes: ['rural-development'] },
  '振兴': { topics: ['乡村振兴与区域发展'], nodes: ['rural-development'] },
  '三农': { topics: ['乡村振兴与区域发展'], nodes: ['rural-development'] },
  '区域': { topics: ['乡村振兴与区域发展'], nodes: ['rural-development'] },
  '廉政': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education', 'supervision-system'] },
  '纪律': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education'] },
  '反腐': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education', 'supervision-system'] },
  '作风': { topics: ['廉政教育与纪律建设'], nodes: ['integrity-education'] },
  '数字': { topics: ['数字经济与科技创新'], nodes: ['digital-economy'] },
  '经济': { topics: ['数字经济与科技创新', '乡村振兴与区域发展'], nodes: ['macro-economy', 'rural-development'] },
  '科技': { topics: ['数字经济与科技创新'], nodes: ['digital-economy'] },
  '创新': { topics: ['数字经济与科技创新'], nodes: ['digital-economy'] },
  '智能': { topics: ['数字经济与科技创新'], nodes: ['digital-economy'] },
  '公文': { topics: ['公文写作与表达能力'], nodes: ['official-writing'] },
  '写作': { topics: ['公文写作与表达能力'], nodes: ['official-writing'] },
  '表达': { topics: ['公文写作与表达能力'], nodes: ['official-writing'] },
  '法律': { topics: ['法律法规与依法行政'], nodes: ['law-basics'] },
  '法规': { topics: ['法律法规与依法行政'], nodes: ['law-basics'] },
  '依法': { topics: ['法律法规与依法行政'], nodes: ['law-basics'] },
  '法治': { topics: ['法律法规与依法行政'], nodes: ['law-basics'] },
  '党建': { topics: ['政策理论学习', '行政管理能力'], nodes: ['constitution-rules', 'party-history', 'party-building-practice'] },
  '组织': { topics: ['行政管理能力'], nodes: ['admin-capability', 'party-building-practice'] },
  '人事': { topics: ['行政管理能力'], nodes: ['admin-capability'] },
  '考核': { topics: ['行政管理能力'], nodes: ['admin-capability'] },
  '应急': { topics: ['行政管理能力', '基层治理实务'], nodes: ['social-governance'] },
  '信访': { topics: ['基层治理实务', '法律法规与依法行政'], nodes: ['mass-work'] },
  '民生': { topics: ['基层治理实务', '乡村振兴与区域发展'], nodes: ['mass-work', 'rural-development'] },
  '服务': { topics: ['基层治理实务', '行政管理能力'], nodes: ['mass-work', 'admin-capability'] },
  '统战': { topics: ['政策理论学习', '统战理论学习'], nodes: ['united-front', 'deliberative-democracy'] },
  '协商民主': { topics: ['政策理论学习', '统战理论学习'], nodes: ['deliberative-democracy'] },
  '新型政党': { topics: ['政策理论学习'], nodes: ['party-theory', 'united-front'] },
  '意识形态': { topics: ['政策理论学习', '公文写作与表达能力'], nodes: ['ideology-work', 'party-theory'] },
  '国家安全': { topics: ['政策理论学习', '法律法规与依法行政'], nodes: ['supervision-system'] },
  '培训班': { topics: ['行政管理能力', '基层治理实务'], nodes: ['admin-capability', 'social-governance'] },
  '参政议政': { topics: ['政策理论学习'], nodes: ['deliberative-democracy'] },
  '生态文明': { topics: ['政策理论学习', '乡村振兴与区域发展'], nodes: ['party-theory', 'rural-development'] },
  '共同富裕': { topics: ['乡村振兴与区域发展', '政策理论学习'], nodes: ['rural-development', 'chinese-modernization'] },
  '脱贫攻坚': { topics: ['乡村振兴与区域发展'], nodes: ['rural-development'] },
  '扫黑除恶': { topics: ['基层治理实务', '法律法规与依法行政'], nodes: ['social-governance', 'law-basics'] },
  '疫情防控': { topics: ['行政管理能力', '基层治理实务'], nodes: ['admin-capability'] },
  '干部教育': { topics: ['行政管理能力', '政策理论学习'], nodes: ['admin-capability', 'party-theory'] },
  '党员领导': { topics: ['行政管理能力'], nodes: ['admin-capability'] },
  '国际': { topics: ['国际视野拓展'], nodes: ['international-relations', 'global-governance'] },
  '外交': { topics: ['国际视野拓展'], nodes: ['international-relations'] },
  '文化': { topics: ['文化建设素养'], nodes: ['cultural-confidence', 'ideology-work'] },
  '统战理论': { topics: ['统战理论学习'], nodes: ['united-front'] },
  '民主协商': { topics: ['统战理论学习'], nodes: ['deliberative-democracy'] },
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

  // 同时搜索知识库课程标题关键词
  for (const [word, nodeIds] of knowledgeBaseKeywordIndex) {
    if (word.length >= 3 && text.includes(word)) {
      keywords.push(word);
      nodeIds.forEach(n => matchedNodes.add(n));
    }
  }

  const suggestedLevel: 'beginner' | 'intermediate' | 'advanced' =
    keywords.length <= 1 ? 'beginner' : keywords.length <= 3 ? 'intermediate' : 'advanced';

  return {
    keywords,
    matchedTopics: Array.from(matchedTopics),
    matchedNodes: Array.from(matchedNodes),
    suggestedLevel,
  };
}

export interface KnowledgeBaseNodeSummary {
  nodeId: string;
  nodeName: string;
  courseCount: number;
  totalDuration: number;
}

export function getKnowledgeBaseCoverage(): KnowledgeBaseNodeSummary[] {
  const effectiveGraph = dynamicGraphCache || partyKnowledgeGraph;
  const nodeNameMap: Record<string, string> = {};
  function collectNames(node: KnowledgeNode) {
    nodeNameMap[node.id] = node.name;
    if (node.children) node.children.forEach(collectNames);
  }
  collectNames(effectiveGraph);

  const summaries: KnowledgeBaseNodeSummary[] = [];

  for (const [nodeId, courses] of Object.entries(courseDatabase)) {
    const totalDuration = courses.reduce((sum, c) => sum + c.duration, 0);
    summaries.push({
      nodeId,
      nodeName: nodeNameMap[nodeId] || nodeId,
      courseCount: courses.length,
      totalDuration,
    });
  }

  return summaries.sort((a, b) => b.courseCount - a.courseCount);
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
    const effectiveTopicMap = Object.keys(topicNodeMap).length > 0 ? topicNodeMap : getTopicNodeMap();
    const nodeId = effectiveTopicMap[topic];
    if (nodeId) selectedIds.add(nodeId);
  });

  // 添加父节点
  const effectiveParentMap = Object.keys(dynamicParentMap).length > 0
    ? dynamicParentMap
    : {
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
    const parentId = effectiveParentMap[id];
    if (parentId) {
      selectedIds.add(parentId);
    }
  });
  
  // 添加子节点（当选中父节点时，自动包含其子节点）
  const effectiveChildrenMap = Object.keys(dynamicChildrenMap).length > 0
    ? dynamicChildrenMap
    : {
        'rural-revitalization': ['rural-policy', 'rural-governance'],
        'party-20th-congress': ['20th-report', 'chinese-modernization', 'comprehensive-strict-governance'],
        'grassroots-party-work': ['membership-development', 'party-life', 'mass-work'],
        'party-building-basics': ['party-constitution', 'party-history', 'party-theory'],
        'disciplinary-style': ['integrity-education', 'supervision-system'],
      };
  
  const idsToAdd: string[] = [];
  selectedIds.forEach(id => {
    const children = effectiveChildrenMap[id];
    if (children) {
      children.forEach(childId => {
        if (!selectedIds.has(childId)) {
          idsToAdd.push(childId);
        }
      });
    }
  });
  idsToAdd.forEach(id => selectedIds.add(id));
  
  // 筛选并构建学习路径（根据难度进行筛选）
  const effectiveGraph = dynamicGraphCache || partyKnowledgeGraph;
  let filteredRoot = filterNodes(effectiveGraph, selectedIds);

  // 根据难度筛选节点：入门级保留难度1，进阶级保留≤2，深入级保留全部
  if (filteredRoot && profile.level) {
    const difficultyFilter = (node: KnowledgeNode): KnowledgeNode | null => {
      const maxDifficulty = profile.level === 'beginner' ? 1 : profile.level === 'intermediate' ? 2 : 99;
      if (node.difficulty && node.difficulty > maxDifficulty) return null;
      if (!node.children) return node;
      const filteredChildren = node.children
        .map(difficultyFilter)
        .filter((c): c is KnowledgeNode => c !== null);
      if (filteredChildren.length === 0 && node.level > 0) return null;
      return { ...node, children: filteredChildren };
    };
    filteredRoot = difficultyFilter(filteredRoot);
  }
  
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
  
  // 生成标题和描述（含诊断详情）
  const selectedRole = profile.roles[0] || '干部';
  const selectedTopic = allTopics[0] || '综合学习';
  const hasCustomReq = profile.customRequirements && profile.customRequirements.trim();
  const levelLabel = profile.level === 'beginner' ? '入门级' : profile.level === 'intermediate' ? '进阶级' : '深入级';

  // 统计匹配节点数和课程数
  let matchedNodeCount = 0;
  let matchedCourseCount = 0;
  const matchedNodeNames: string[] = [];
  function countNodes(node: KnowledgeNode) {
    matchedNodeCount++;
    if (node.name) matchedNodeNames.push(node.name);
    if (node.courses && node.courses.length > 0) {
      matchedCourseCount += node.courses.length;
    }
    if (node.children) node.children.forEach(countNodes);
  }
  if (filteredRoot) countNodes(filteredRoot);

  // 生成包含诊断信息的描述
  let description = `学习深度: ${levelLabel}`;
  if (hasCustomReq) {
    description += ` | 需求分析: 「${profile.customRequirements!.slice(0, 40)}${profile.customRequirements!.length > 40 ? '...' : ''}」`;
    const analysis = analyzeRequirements(profile.customRequirements!);
    if (analysis.keywords.length > 0) {
      description += `\n识别关键词: ${analysis.keywords.join('、')}`;
      description += `\n匹配方向: ${analysis.matchedTopics.join('、')}`;
    }
  }
  description += `\n匹配知识节点: ${matchedNodeCount}个 | 关联课程: ${matchedCourseCount}门`;

  return {
    id: `path-${Date.now()}`,
    title: `${selectedRole} · ${selectedTopic}${hasCustomReq ? '（个性化定制）' : ''}`,
    description,
    rootNode: injectCoursesRecursive(filteredRoot || effectiveGraph),
    totalDuration: totalDuration || 120,
    difficulty: (profile.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    matchedNodeCount,
    matchedCourseCount,
    matchedTopics: allTopics,
    matchedNodes: Array.from(selectedIds).slice(0, 20),
  };
}

// 模拟AI意图识别
export function analyzeIntent(userInput: string): { keywords: string[]; matchedPath: string } {
  const input = userInput.toLowerCase();
  const keywords: string[] = [];
  let matchedPath = '';
  
  // 关键词匹配
  const keywordMap: Record<string, string> = {
    '入党': 'party-building-practice',
    '党员': 'party-building-practice',
    '发展': 'party-building-practice',
    '二十大': 'current-politics',
    '现代化': 'chinese-modernization',
    '乡村': 'rural-development',
    '振兴': 'rural-development',
    '廉政': 'integrity-education',
    '监督': 'supervision-system',
    '党史': 'party-history',
    '党章': 'constitution-rules',
    '群众': 'mass-work',
    '组织': 'admin-capability',
    '支部': 'party-building-practice',
    '经济': 'macro-economy',
    '法律': 'law-basics',
    '国际': 'international-relations',
    '文化': 'cultural-confidence',
    '公文': 'official-writing',
    '数字': 'digital-economy',
    '基层': 'social-governance',
    '统战': 'united-front',
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
  const effectiveGraph = dynamicGraphCache || partyKnowledgeGraph;
  return getNodeById(nodeId, effectiveGraph);
}
