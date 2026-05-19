import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========== 1. 知识图谱结构定义 ==========

const KNOWLEDGE_TREE = {
  id: 'root',
  name: '精英在线智能学习体系',
  children: [
    {
      id: 'party-building-basics',
      name: '党建基础理论',
      children: [
        { id: 'party-constitution', name: '党章学习' },
        { id: 'party-history', name: '党史学习' },
        { id: 'party-theory', name: '党的创新理论' },
      ],
    },
    {
      id: 'party-20th-congress',
      name: '二十大精神学习',
      children: [
        { id: '20th-report', name: '二十大报告解读' },
        { id: 'chinese-modernization', name: '中国式现代化' },
        { id: 'comprehensive-strict-governance', name: '全面从严治党' },
      ],
    },
    {
      id: 'grassroots-party-work',
      name: '基层党务工作',
      children: [
        { id: 'membership-development', name: '发展党员工作' },
        { id: 'party-life', name: '党的组织生活' },
        { id: 'mass-work', name: '群众工作方法' },
      ],
    },
    {
      id: 'rural-revitalization',
      name: '乡村振兴战略',
      children: [
        { id: 'rural-policy', name: '乡村振兴政策' },
        { id: 'rural-governance', name: '乡村治理现代化' },
      ],
    },
    {
      id: 'disciplinary-style',
      name: '党风廉政建设',
      children: [
        { id: 'integrity-education', name: '廉政教育' },
        { id: 'supervision-system', name: '监督执纪体系' },
      ],
    },
  ],
};

// 节点ID到名称映射
const NODE_NAME_MAP = {};
function buildNodeNameMap(node) {
  NODE_NAME_MAP[node.id] = node.name;
  if (node.children) node.children.forEach(buildNodeNameMap);
}
buildNodeNameMap(KNOWLEDGE_TREE);

// ========== 2. 文件名关键词到知识图谱节点的映射 (来自 knowledge-graph.ts) ==========

const filenameNodeMapping = {
  // ===== 党章学习 =====
  '党章': ['party-constitution'], '章程': ['party-constitution'],
  '修养': ['party-constitution'], '党性': ['party-constitution'],
  '党员权利': ['party-constitution'], '党员义务': ['party-constitution'],
  '入党誓词': ['party-constitution'], '组织制度': ['party-constitution'],
  '修身': ['party-constitution'], '官德': ['party-constitution'],
  '共产党员': ['party-constitution'], '党的性质': ['party-constitution'],
  '党的宗旨': ['party-constitution'], '党员条件': ['party-constitution'],

  // ===== 党史学习 =====
  '党史': ['party-history'], '百年': ['party-history'],
  '革命': ['party-history'], '建国': ['party-history'],
  '红军': ['party-history'], '抗战': ['party-history'],
  '长征': ['party-history'], '抗美援朝': ['party-history'],
  '改革开放': ['party-history'], '新中国': ['party-history'],
  '党的历史': ['party-history'], '党的建设': ['party-history'],
  '十一届三中全会': ['party-history'], '六中全会': ['party-history'],
  '建党': ['party-history'], '百年奋斗': ['party-history'],
  '解放战争': ['party-history'], '延安': ['party-history'],
  '井冈山': ['party-history'], '遵义': ['party-history'],
  '西柏坡': ['party-history'], '红色': ['party-history'],

  // ===== 党的创新理论 =====
  '习近平': ['party-theory'], '新时代': ['party-theory'],
  '马克思主义': ['party-theory'], '思想': ['party-theory'],
  '中国特色': ['party-theory'], '治国理政': ['party-theory'],
  '党的十九大': ['party-theory'], '十九大精神': ['party-theory'],
  '理论': ['party-theory'], '政治理论': ['party-theory'],
  '生态文明': ['party-theory'], '生态': ['party-theory'],
  '两山': ['party-theory'], '治理体系': ['party-theory'],
  '领导干部': ['party-theory'], '中青班': ['party-theory'],
  '绿色发展': ['party-theory'], '绿色': ['party-theory'],
  '核心价值观': ['party-theory'], '价值观': ['party-theory'],
  '社会主义核心': ['party-theory'], '文化自信': ['party-theory'],
  '文化强国': ['party-theory'], '传统文化': ['party-theory', 'mass-work'],
  '理想信念': ['party-theory'], '初心': ['party-theory', 'party-constitution'],
  '使命': ['party-theory'], '国家治理': ['party-theory', 'chinese-modernization'],
  '治理能力': ['party-theory', 'chinese-modernization'],
  '总体国家安全观': ['party-theory'], '国家安全': ['party-theory', 'party-life'],

  // ===== 二十大报告解读 =====
  '二十大': ['20th-report'], '二十大精神': ['20th-report'],
  '报告解读': ['20th-report'], '大会精神': ['20th-report'],
  '全会精神': ['20th-report'], '五中全会': ['20th-report'],
  '党的十九届六中全会': ['20th-report'], '全会公报': ['20th-report'],
  '三中全会': ['20th-report'], '四中全会': ['20th-report'],

  // ===== 中国式现代化 =====
  '现代化': ['chinese-modernization'], '现代化强国': ['chinese-modernization'],
  '新征程': ['chinese-modernization'], '共同富裕': ['chinese-modernization'],
  '高质量发展': ['chinese-modernization'], '治理效能': ['chinese-modernization'],
  '制度优势': ['chinese-modernization'],
  '十四五': ['chinese-modernization'], '2035': ['chinese-modernization'],
  '新常态': ['chinese-modernization'], '供给侧': ['chinese-modernization'],
  '新发展理念': ['chinese-modernization'], '新发展格局': ['chinese-modernization'],
  '双循环': ['chinese-modernization'], '扩大内需': ['chinese-modernization'],
  '区域协调': ['chinese-modernization'], '城镇化': ['chinese-modernization'],
  '数字经济': ['chinese-modernization'], '人工智能': ['chinese-modernization'],
  '科技创新': ['chinese-modernization', 'party-theory'],
  '一带一路': ['chinese-modernization'], '人类命运共同体': ['chinese-modernization'],
  '自贸': ['chinese-modernization'], '自贸区': ['chinese-modernization'],
  'RCEP': ['chinese-modernization'], 'WTO': ['chinese-modernization'],
  '中欧': ['chinese-modernization'], '中美': ['chinese-modernization'],
  '中俄': ['chinese-modernization'], '中日': ['chinese-modernization'],
  '全球': ['chinese-modernization'], '能源': ['chinese-modernization'],
  '金融': ['chinese-modernization'], '碳达峰': ['chinese-modernization', 'party-theory'],
  '碳中和': ['chinese-modernization', 'party-theory'],
  '国企': ['chinese-modernization'], '国资': ['chinese-modernization'],
  '民营': ['chinese-modernization'], '营商环境': ['chinese-modernization'],
  '产业链': ['chinese-modernization'], '供应链': ['chinese-modernization'],

  // ===== 全面从严治党 =====
  '从严治党': ['comprehensive-strict-governance'], '自我革命': ['comprehensive-strict-governance'],
  '政治建设': ['comprehensive-strict-governance'], '四个全面': ['comprehensive-strict-governance'],
  '伟大工程': ['comprehensive-strict-governance'],
  '治党': ['comprehensive-strict-governance'], '问责': ['comprehensive-strict-governance'],
  '政治过硬': ['comprehensive-strict-governance'], '本领高强': ['comprehensive-strict-governance'],
  '组织路线': ['comprehensive-strict-governance'], '政治生态': ['comprehensive-strict-governance'],
  '选人用人': ['comprehensive-strict-governance'], '干部选拔': ['comprehensive-strict-governance'],

  // ===== 发展党员工作 =====
  '发展党员': ['membership-development'], '入党': ['membership-development'],
  '积极分子': ['membership-development'], '预备党员': ['membership-development'],
  '党员发展': ['membership-development'],

  // ===== 党的组织生活 =====
  '组织生活': ['party-life'], '三会一课': ['party-life'],
  '支部': ['party-life'], '主题党日': ['party-life'],
  '党课': ['party-life'], '基层组织': ['party-life'],
  '基层党建': ['party-life'], '党支部': ['party-life'],
  '党员教育': ['party-life'], '组织建设': ['party-life', 'comprehensive-strict-governance'],
  '党务': ['party-life'], '党组织': ['party-life'],

  // ===== 群众工作方法 =====
  '群众': ['mass-work'], '信访': ['mass-work'],
  '矛盾': ['mass-work'], '调解': ['mass-work'],
  '统战': ['mass-work', 'membership-development'], '统战理论': ['mass-work', 'membership-development'],
  '民族': ['mass-work'], '宗教': ['mass-work'],
  '意识形态': ['mass-work', 'party-theory'], '民心': ['mass-work'],
  '协商': ['mass-work'], '民主': ['mass-work'],
  '社会组织': ['mass-work'], '志愿服务': ['mass-work'],
  '社区服务': ['mass-work'], '民生': ['mass-work', 'rural-policy'],

  // ===== 乡村振兴政策 =====
  '乡村': ['rural-policy', 'rural-governance'], '振兴': ['rural-policy', 'rural-governance'],
  '三农': ['rural-policy'], '农村': ['rural-policy'],
  '农业': ['rural-policy'], '农民': ['rural-policy'],
  '脱贫': ['rural-policy'], '扶贫': ['rural-policy'],
  '小康': ['rural-policy'], '精准脱贫': ['rural-policy'],
  '农产品': ['rural-policy'], '粮食安全': ['rural-policy'],
  '土地': ['rural-policy'], '耕地': ['rural-policy'],
  '宅基地': ['rural-policy'], '合作社': ['rural-policy'],

  // ===== 乡村治理现代化 =====
  '乡村治理': ['rural-governance'], '基层治理': ['rural-governance', 'party-life'],
  '社区': ['rural-governance'], '社会治理': ['rural-governance'],
  '法治乡村': ['rural-governance'], '德治': ['rural-governance'],
  '自治': ['rural-governance'], '网格化': ['rural-governance'],

  // ===== 廉政教育 =====
  '廉政': ['integrity-education'], '廉洁': ['integrity-education'],
  '反腐': ['integrity-education', 'supervision-system'],
  '八项规定': ['integrity-education'], '作风': ['integrity-education'],
  '纪律处分': ['integrity-education'], '四风': ['integrity-education'],
  '警示教育': ['integrity-education'], '以案': ['integrity-education'],
  '廉洁自律': ['integrity-education'], '贪污': ['integrity-education'],

  // ===== 监督执纪体系 =====
  '监督': ['supervision-system'], '监察': ['supervision-system'],
  '审计': ['supervision-system'], '巡视': ['supervision-system'],
  '纪律': ['supervision-system', 'integrity-education'],
  '纪检': ['supervision-system'], '监察法': ['supervision-system'],
  '政务处分': ['supervision-system'],

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
  '环境': ['party-theory'], '环保': ['party-theory'],
  '文化': ['party-theory', 'mass-work'], '公共文化': ['party-theory'],
  '网络': ['chinese-modernization'], '互联网': ['chinese-modernization'],
  '互联网+': ['chinese-modernization'], '5G': ['chinese-modernization'],
  '知识产权': ['chinese-modernization'],
  '健康': ['mass-work'], '医疗': ['mass-work'],
  '社保': ['mass-work'], '养老': ['mass-work'],
  '就业': ['chinese-modernization'], '人口': ['chinese-modernization'],
  '国防': ['chinese-modernization'], '军队': ['chinese-modernization'],
};

const categoryToNodeMap = {
  '政治理论': ['party-theory', 'party-constitution', '20th-report', 'party-history', 'chinese-modernization', 'comprehensive-strict-governance'],
  '国家治理': ['grassroots-party-work', 'rural-policy', 'rural-governance', 'party-life', 'supervision-system', 'integrity-education', 'chinese-modernization'],
  '统战理论': ['mass-work', 'membership-development', 'party-life', 'party-constitution'],
};

// ========== 3. 匹配函数 ==========

function matchTextToNodes(text) {
  const matched = new Set();
  const clean = (text || '').replace(/\.txt$/i, '').replace(/[（(][一二三四五六七八九十上中下\d]+[）)]/g, '');

  for (const [keyword, nodeIds] of Object.entries(filenameNodeMapping)) {
    if (clean.includes(keyword)) {
      nodeIds.forEach(n => matched.add(n));
    }
  }

  if (matched.size === 0) matched.add('party-constitution');
  return Array.from(matched);
}

function matchCategoryToNodes(category) {
  return categoryToNodeMap[category] || ['party-constitution'];
}

function getFlatNodeName(nodeId) {
  return NODE_NAME_MAP[nodeId] || nodeId;
}

// 获取节点完整路径 (一级 > 二级)
function getNodePath(nodeId, tree = KNOWLEDGE_TREE) {
  for (const child of tree.children || []) {
    if (child.id === nodeId) return `${tree.name} > ${child.name}`;
    for (const sub of child.children || []) {
      if (sub.id === nodeId) return `${tree.name} > ${child.name} > ${sub.name}`;
    }
  }
  return `${tree.name} > ${getFlatNodeName(nodeId)}`;
}

// ========== 4. 主流程 ==========

async function main() {
  console.log('=== 精英课程资源库分类工具 ===\n');

  // 步骤1: 读取Excel文件
  console.log('[1/4] 读取Excel文件...');
  const excelPath = path.join(__dirname, '..', '精英课程资源库课程清单（2015年-2026年1月）.xlsx');
  const wb = XLSX.readFile(excelPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const headers = rawData[0];
  console.log(`  列头: ${headers.join(', ')}`);
  console.log(`  总行数: ${rawData.length}`);

  // 解析数据行 (跳过表头和分类标题行)
  const courses = [];
  let currentCategory = '';

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const code = row[0];  // 编号
    const name = row[1];  // 课件名称

    if (!code) {
      // 这是一个分类标题行
      if (name && name.length > 0 && !name.startsWith('GC') && !name.startsWith('DS')) {
        currentCategory = name;
      }
      continue;
    }

    // 跳过注释/说明行
    if (typeof code === 'string' && (code.includes('注') || code.includes('说明'))) continue;

    courses.push({
      code: String(code).trim(),
      name: name ? String(name).trim() : '',
      teacher: row[2] ? String(row[2]).trim() : '',
      position: row[3] ? String(row[3]).trim() : '',
      duration: row[4],
      format: row[5] ? String(row[5]).trim() : '',
      description: row[6] ? String(row[6]).trim() : '',
      createdAt: row[7],
      excelCategory: currentCategory,
    });
  }

  console.log(`  有效课程数: ${courses.length}`);

  // 步骤2: 获取知识库API数据
  console.log('\n[2/4] 获取知识库API数据...');
  let apiDocs = [];
  let apiCategories = [];
  let apiCategoryCounts = {};

  try {
    const allDocs = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const url = `http://localhost:3000/api/knowledge-base?pageSize=200&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      allDocs.push(...(data.docs || []));
      totalPages = data.totalPages || 1;
      apiCategories = data.categories || [];
      apiCategoryCounts = data.categoryCounts || {};

      console.log(`  第${page}页: 获取 ${data.docs?.length || 0} 条, 总计 ${data.total || 0} 条`);
      page++;
    }

    apiDocs = allDocs;
    console.log(`  知识库API共获取 ${apiDocs.length} 份文档`);
  } catch (err) {
    console.warn(`  知识库API获取失败: ${err.message}`);
    console.log('  将仅基于关键词匹配进行分类...');
  }

  // 步骤3: 匹配与分类
  console.log('\n[3/4] 课程匹配与分类...');

  // 建立API文档的索引 (按文件名关键词)
  const apiDocMap = new Map();
  for (const doc of apiDocs) {
    const fn = (doc.fileName || '').replace(/\.txt$/i, '');
    apiDocMap.set(fn, doc);
    // 也按 courseName 索引
    if (doc.courseName) apiDocMap.set(doc.courseName, doc);
  }

  // 分类结果
  const treeResult = {};
  function initTree(node) {
    if (node.children) {
      node.children.forEach(c => {
        treeResult[c.id] = { nodeId: c.id, nodeName: c.name, parentName: node.name, courses: [], matchedApiDocs: [] };
        initTree(c);
      });
    }
  }
  initTree(KNOWLEDGE_TREE);
  treeResult['unmatched'] = { nodeId: 'unmatched', nodeName: '未匹配', parentName: '', courses: [], matchedApiDocs: [] };

  let matchCount = 0;
  let noMatchCount = 0;

  for (const course of courses) {
    const nodeIds = matchTextToNodes(course.name);
    let apiMatch = null;

    // 尝试匹配API文档
    for (const nodeId of nodeIds) {
      if (apiMatch) break;
      for (const doc of apiDocs) {
        const docFileName = (doc.fileName || '').replace(/\.txt$/i, '');
        // 精确匹配
        if (docFileName === course.name) {
          apiMatch = doc;
          break;
        }
        // 包含匹配
        if (course.name && docFileName && (docFileName.includes(course.name) || course.name.includes(docFileName))) {
          apiMatch = doc;
          break;
        }
        // courseName匹配
        if (doc.courseName && course.code && doc.courseName === course.code) {
          apiMatch = doc;
          break;
        }
      }
    }

    const courseEntry = {
      code: course.code,
      name: course.name,
      teacher: course.teacher,
      duration: course.duration,
      format: course.format,
      description: course.description ? course.description.substring(0, 100) : '',
      createdAt: course.createdAt,
      apiDocId: apiMatch ? apiMatch.id : '',
      apiDocFileName: apiMatch ? (apiMatch.fileName || '').replace(/\.txt$/i, '') : '',
      apiCategory: apiMatch ? apiMatch.category : '',
      matchedNodes: nodeIds,
    };

    if (apiMatch) matchCount++;
    else noMatchCount++;

    // 分配到各个匹配的节点
    for (const nodeId of nodeIds) {
      if (treeResult[nodeId]) {
        treeResult[nodeId].courses.push(courseEntry);
        if (apiMatch) {
          const alreadyAdded = treeResult[nodeId].matchedApiDocs.some(d => d.id === apiMatch.id);
          if (!alreadyAdded) {
            treeResult[nodeId].matchedApiDocs.push(apiMatch);
          }
        }
      }
    }
  }

  console.log(`  API匹配成功: ${matchCount}, 未匹配: ${noMatchCount}`);

  // 步骤4: 输出结果
  console.log('\n[4/4] 输出CSV文件...');

  // 4a. 原始CSV (Excel转CSV)
  const csvPath1 = path.join(__dirname, '..', '精英课程资源库课程清单.csv');
  const csvRows1 = [headers.join(',')];
  for (const course of courses) {
    csvRows1.push([
      `"${course.code}"`,
      `"${course.name}"`,
      `"${course.teacher}"`,
      `"${course.position}"`,
      course.duration,
      `"${course.format}"`,
      `"${(course.description || '').replace(/"/g, '""')}"`,
      course.createdAt,
    ].join(','));
  }
  fs.writeFileSync(csvPath1, '\ufeff' + csvRows1.join('\n'), 'utf-8');
  console.log(`  原始CSV: ${csvPath1}`);

  // 4b. 树形分类CSV
  const csvPath2 = path.join(__dirname, '..', '精英课程资源库课程清单_树形分类.csv');
  const treeHeaders = ['一级分类', '二级分类', '节点ID', '课程编号', '课件名称', '授课人', '职务', '课时(分)', '格式', '课程简介', '制作时间', 'API文档ID', 'API文件名', 'API分类'];
  const treeRows = [treeHeaders.join(',')];

  // 按树形结构遍历
  function traverseTree(node, parentName) {
    if (!node.children) return;
    for (const child of node.children) {
      const result = treeResult[child.id];
      if (result && result.courses.length > 0) {
        for (const c of result.courses) {
          treeRows.push([
            `"${parentName || ''}"`,
            `"${child.name}"`,
            `"${child.id}"`,
            `"${c.code}"`,
            `"${c.name}"`,
            `"${c.teacher}"`,
            `"${c.position || ''}"`,
            c.duration || '',
            `"${c.format}"`,
            `"${(c.description || '').replace(/"/g, '""')}"`,
            c.createdAt || '',
            `"${c.apiDocId}"`,
            `"${c.apiDocFileName}"`,
            `"${c.apiCategory}"`,
          ].join(','));
        }
      }
      traverseTree(child, child.name);
    }
  }
  traverseTree(KNOWLEDGE_TREE, '');

  // 未匹配的
  const unmatched = treeResult['unmatched'];
  if (unmatched && unmatched.courses.length > 0) {
    for (const c of unmatched.courses) {
      treeRows.push([
        '"未分类"',
        '"未匹配"',
        '"unmatched"',
        `"${c.code}"`,
        `"${c.name}"`,
        `"${c.teacher}"`,
        `"${c.position || ''}"`,
        c.duration || '',
        `"${c.format}"`,
        `"${(c.description || '').replace(/"/g, '""')}"`,
        c.createdAt || '',
        `"${c.apiDocId}"`,
        `"${c.apiDocFileName}"`,
        `"${c.apiCategory}"`,
      ].join(','));
    }
  }

  fs.writeFileSync(csvPath2, '\ufeff' + treeRows.join('\n'), 'utf-8');
  console.log(`  树形分类CSV: ${csvPath2}`);

  // 4c. 统计摘要
  console.log('\n=== 分类统计 ===');
  console.log(`总课程数: ${courses.length}`);
  console.log(`API匹配数: ${matchCount}`);
  console.log(`未匹配数: ${noMatchCount}`);
  console.log('');

  for (const child of KNOWLEDGE_TREE.children) {
    let total = 0;
    const subStats = [];
    for (const sub of child.children || []) {
      const count = (treeResult[sub.id]?.courses?.length || 0);
      total += count;
      subStats.push(`    ${sub.name}: ${count}门`);
    }
    console.log(`  ${child.name}: ${total}门`);
    subStats.forEach(s => console.log(s));
  }
  console.log(`  未分类: ${unmatched?.courses?.length || 0}门`);

  // 输出匹配详情JSON
  const jsonPath = path.join(__dirname, '..', '精英课程资源库_分类详情.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    totalCourses: courses.length,
    apiDocCount: apiDocs.length,
    matchedCount: matchCount,
    unmatchedCount: noMatchCount,
    treeStructure: KNOWLEDGE_TREE,
    treeResult: Object.fromEntries(
      Object.entries(treeResult).map(([key, val]) => [
        key,
        { ...val, courses: val.courses.length, sampleCourses: val.courses.slice(0, 3) }
      ])
    ),
  }, null, 2), 'utf-8');
  console.log(`\n分类详情JSON: ${jsonPath}`);

  console.log('\n=== 完成! ===');
}

main().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
