import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CourseInfo } from '@/lib/types';
import { courseVideoMapping } from '@/lib/video-mapping';

const KNOWLEDGE_BASE_DIR = 'E:\\社院课程stt\\knowledge_base_txt';

function buildSystemIdToVideoPathMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [, videoPath] of Object.entries(courseVideoMapping)) {
    const fileName = path.basename(videoPath, '.mp4');
    if (!map[fileName]) {
      map[fileName] = videoPath;
    }
  }
  return map;
}

// 建立所有系统ID → 8082数字ID 反向映射
// 来源1: video-mapping.ts (DSPTXYZY系列)
// 来源2: 精英课程资源库Excel + 8082 CourseList API 双向匹配 (GC/NGC/HGC系列)
function buildSystemIdToNumericIdMap(): Record<string, string> {
  const map: Record<string, string> = {};

  // 来源1: 从video-mapping.ts提取DSPTXYZY映射
  for (const [numericId, videoPath] of Object.entries(courseVideoMapping)) {
    const fileName = path.basename(videoPath, '.mp4');
    if (fileName.startsWith('DSPTXYZY')) {
      if (!map[fileName]) map[fileName] = numericId;
    }
  }

  // 来源2: GC/NGC/HGC通过中文名匹配8082 (精英课程资源库Excel + 8082 API)
  const extraMappings: Record<string, string> = {
    'GC39I0415115_1511': '797',
    'GC39I0315115_1511': '796',
    'GC39I1215115_1511': '805',
    'GC39I1015115_1511': '803',
    'DSPTXYZY20120106': '1307',
    'DSPTXYZY20120107': '1306',
    'GC04I1116105_1611': '692',
    'GC71A4519095_1909': '974',
    'NGC03I0819085_1909': '1009',
    'GC03I0518125_1901': '983',
    'GC39I0215115_1511': '795',
    'NGC20110301': '1305',
    'NGC20110302': '1305',
    'NGC03I2019035_1904': '845',
    'GC16I3316085_1609': '780',
    'GC06I0715055_1506': '793',
    'GC41I3316035_1604': '784',
    'HGC07I0920035_2004': '1415',
    'DSPTXYZY21031101': '1345',
    'DSPTXYZY20041779': '1125',
    'HGC07I1020035_2004': '1415',
    'GC09N0519095_1910': '991',
    'GC09N0619095_1910': '991',
    'DSPTXYZY21031109': '1337',
    'GC13A3416065_1610': '734',
    'GC13A3516065_1610': '734',
    'DSPTXYZY21031115': '1331',
    'HGC72I3520115_2012': '1347',
    'GC13I0819055_1906': '951',
    'GC13I0919055_1906': '951',
    'GC03I0918115_1811': '946',
    'GC32I1014105_1411': '764',
    'HGC07I1220095_2010': '1413',
    'HGC07I1320095_2010': '1413',
    'GC07C1214090_1411': '755',
    'GC04I0916105_1611': '728',
    'GC04I1115015_1504': '745',
    'DSPTXYZY21031104': '1342',
    'GC34I2415015_1502': '753',
    'DSPTXYZY21031124': '1322',
  };
  Object.assign(map, extraMappings);

  return map;
}

const systemIdToVideoPath = buildSystemIdToVideoPathMap();
const systemIdToNumericId = buildSystemIdToNumericIdMap();

const nodeCategoryMap: Record<string, string[]> = {
  // 公务员政治素养 子节点
  'constitution-rules': ['政治理论'],
  'party-history': ['政治理论'],
  'party-theory': ['政治理论'],
  'current-politics': ['政治理论'],
  'chinese-modernization': ['政治理论'],
  'comprehensive-strict-governance': ['政治理论'],
  'party-building-practice': ['党建实务'],
  // 公务员行政实务 子节点
  'social-governance': ['社会治理'],
  'mass-work': ['社会治理'],
  'law-basics': ['法律法规'],
  'supervision-system': ['法律法规'],
  'integrity-education': ['廉政建设'],
  // 公务员经济素养 子节点
  'macro-economy': ['经济管理'],
  'rural-development': ['经济管理'],
  'digital-economy': ['经济管理'],
  // 公务员综合能力 子节点
  'official-writing': ['业务能力'],
  'admin-capability': ['业务能力'],
  'cultural-confidence': ['文化建设'],
  'ideology-work': ['文化建设'],
  'international-relations': ['国际视野'],
  'global-governance': ['国际视野'],
  'united-front': ['统一战线'],
  'deliberative-democracy': ['统一战线'],
  'ethnic-religion': ['统一战线'],
  'general-knowledge': ['未分类'],
};

const nodeKeywordMap: Record<string, string[]> = {
  // 公务员政治素养 子节点
  'constitution-rules': ['党章', '章程', '纪律', '党员', '入党'],
  'party-history': ['党史', '简史', '不忘初心', '初心', '革命', '建国', '历史'],
  'party-theory': ['思想', '理论', '马克思主义', '中国特色', '习近平'],
  'current-politics': ['二十大', '新时代', '全会', '精神', '报告'],
  'chinese-modernization': ['现代化', '小康', '高质量', '共同富裕', '改革'],
  'comprehensive-strict-governance': ['从严', '党建', '自我革命', '政治建设'],
  'party-building-practice': ['发展党员', '党员', '支部', '组织生活', '党课'],
  // 公务员行政实务 子节点
  'social-governance': ['治理', '社会', '社区', '基层', '信访', '安全', '应急'],
  'mass-work': ['群众', '民心', '服务', '民主'],
  'law-basics': ['法律', '法规', '法治', '依法', '宪法'],
  'supervision-system': ['监督', '审计', '问责', '法治', '巡视'],
  'integrity-education': ['廉政', '反腐', '作风', '八项规定', '廉洁', '腐败'],
  // 公务员经济素养 子节点
  'macro-economy': ['经济', '宏观', '财政', '货币', '金融', '产业'],
  'rural-development': ['乡村', '振兴', '农村', '三农', '脱贫', '农业'],
  'digital-economy': ['数字', '科技', '创新', '大数据', '互联网', '智能'],
  // 公务员综合能力 子节点
  'official-writing': ['公文', '写作', '表达', '汇报', '文书'],
  'admin-capability': ['管理', '行政', '领导', '组织', '协调', '沟通'],
  'cultural-confidence': ['文化', '文明', '传统', '精神', '价值'],
  'ideology-work': ['意识形态', '宣传', '舆论', '媒体', '思想'],
  'international-relations': ['国际', '外交', '全球', '世界', '一带一路', '人类命运共同体'],
  'global-governance': ['全球治理', '联合国', '合作', '发展', '气候'],
  'united-front': ['统战', '大统战', '党派', '多党合作'],
  'deliberative-democracy': ['协商', '民主', '参政议政', '凝聚共识'],
  'ethnic-religion': ['民族', '宗教', '意识形态', '统一'],
  'general-knowledge': [],
};

interface RawKnowledgeCourse {
  id: string;
  title: string;
  category: string;
  paragraphCount: number;
}

function readKnowledgeBaseCourses(): RawKnowledgeCourse[] {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    return [];
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  return files.map((fileName) => {
    const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const title = fileName.replace(/\.txt$/, '');
    const category = (lines[1] || '').replace('【课程分类】', '').trim();
    const paragraphCountStr = (lines[2] || '').replace('【段落数量】', '').trim();
    const paragraphCount = parseInt(paragraphCountStr) || 0;
    const systemId = (lines[0] || '').replace('【课程名称】', '').trim() || title;

    return { id: systemId, title, category, paragraphCount };
  });
}

function calculateDuration(paragraphCount: number): number {
  if (paragraphCount <= 0) return 30;
  return Math.max(15, Math.min(60, paragraphCount * 2));
}

function scoreMatch(course: RawKnowledgeCourse, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (course.title.includes(kw)) score += 10;
    if (course.category.includes(kw)) score += 5;
  }
  return score;
}

function selectCoursesForNode(
  nodeId: string,
  allCourses: RawKnowledgeCourse[],
  maxCount: number = 5
): CourseInfo[] {
  const categories = nodeCategoryMap[nodeId] || [];
  const keywords = nodeKeywordMap[nodeId] || [];

  const categoryFiltered = allCourses.filter(c =>
    categories.some(cat => c.category === cat)
  );

  const scored = categoryFiltered.map(c => ({
    course: c,
    score: scoreMatch(c, keywords),
  }));

  scored.sort((a, b) => b.score - a.score);

  const highScore = scored.filter(s => s.score >= 10);
  const lowScore = scored.filter(s => s.score < 10);

  const selected: CourseInfo[] = [];
  const usedTitles = new Set<string>();

  const addCourse = (raw: RawKnowledgeCourse) => {
    if (usedTitles.has(raw.title)) return;
    usedTitles.add(raw.title);
    const course: CourseInfo = {
      id: raw.id,
      title: raw.title,
      duration: calculateDuration(raw.paragraphCount),
    };
    const matchedVideoPath = systemIdToVideoPath[raw.id];
    if (matchedVideoPath) {
      course.videoPath = matchedVideoPath;
    }
    const matchedNumericId = systemIdToNumericId[raw.id];
    if (matchedNumericId) {
      course.videoId = matchedNumericId;
    }
    selected.push(course);
  };

  for (const s of highScore) {
    if (selected.length >= maxCount) break;
    addCourse(s.course);
  }

  for (const s of lowScore) {
    if (selected.length >= maxCount) break;
    addCourse(s.course);
  }

  if (selected.length < 3) {
    const shuffled = categoryFiltered
      .filter(c => !usedTitles.has(c.title))
      .sort(() => Math.random() - 0.5);
    for (const course of shuffled) {
      if (selected.length >= 3) break;
      addCourse(course);
    }
  }

  return selected;
}

export async function GET() {
  try {
    const allCourses = readKnowledgeBaseCourses();

    const allNodeIds = Object.keys(nodeCategoryMap);
    const result: Record<string, CourseInfo[]> = {};

    for (const nodeId of allNodeIds) {
      result[nodeId] = selectCoursesForNode(nodeId, allCourses, 5);
    }

    return NextResponse.json({
      courses: result,
      totalKnowledgeBaseCourses: allCourses.length,
    });
  } catch (error) {
    console.error('获取知识图谱课程数据失败:', error);
    return NextResponse.json(
      { error: '获取知识图谱课程数据失败' },
      { status: 500 }
    );
  }
}