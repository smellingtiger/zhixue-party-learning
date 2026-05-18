import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CourseInfo } from '@/lib/types';
import { courseVideoMapping } from '@/lib/video-mapping';

const KNOWLEDGE_BASE_DIR = process.env.KNOWLEDGE_BASE_DIR || 'E:\\社院课程stt\\knowledge_base_txt';

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

// 建立 DSPTXYZY 系统ID → 8082数字ID 反向映射
function buildSystemIdToNumericIdMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [numericId, videoPath] of Object.entries(courseVideoMapping)) {
    const fileName = path.basename(videoPath, '.mp4');
    // 跳过纯数字文件名（如 DSP210705），只保留 DSPTXYZY 系列
    if (fileName.startsWith('DSPTXYZY')) {
      if (!map[fileName]) {
        map[fileName] = numericId;
      }
    }
  }
  return map;
}

const systemIdToVideoPath = buildSystemIdToVideoPathMap();
const systemIdToNumericId = buildSystemIdToNumericIdMap();

const nodeCategoryMap: Record<string, string[]> = {
  'party-constitution': ['政治理论'],
  'party-history': ['政治理论'],
  'party-theory': ['政治理论'],
  '20th-report': ['政治理论'],
  'chinese-modernization': ['政治理论'],
  'comprehensive-strict-governance': ['政治理论'],
  'membership-development': ['政治理论'],
  'party-life': ['政治理论'],
  'mass-work': ['国家治理'],
  'rural-policy': ['国家治理'],
  'rural-governance': ['国家治理'],
  'integrity-education': ['国家治理'],
  'supervision-system': ['国家治理'],
};

const nodeKeywordMap: Record<string, string[]> = {
  'party-constitution': ['党章', '章程'],
  'party-history': ['党史', '简史', '不忘初心', '初心'],
  'party-theory': ['思想', '理论', '马克思主义', '中国特色'],
  '20th-report': ['二十大', '新时代'],
  'chinese-modernization': ['现代化', '小康'],
  'comprehensive-strict-governance': ['从严', '党建'],
  'membership-development': ['发展党员', '党员'],
  'party-life': ['组织生活', '政党', '组织'],
  'mass-work': ['群众', '协商'],
  'rural-policy': ['乡村', '振兴', '农村'],
  'rural-governance': ['乡村治理', '基层治理', '治理'],
  'integrity-education': ['廉政', '反腐', '作风'],
  'supervision-system': ['监督', '审计', '问责'],
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