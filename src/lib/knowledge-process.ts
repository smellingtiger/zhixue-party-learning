import fs from 'fs';
import path from 'path';
import { courseVideoMapping } from '@/lib/video-mapping';

const STT_BASE_DIR = 'E:\\社院课程stt';

export interface ProcessStep {
  step: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  message: string;
  progress?: number;
}

export interface ProcessResult {
  courseId: string;
  courseName: string;
  category: string;
  transcriptPath: string;
  segments: ProcessedSegment[];
  outline: OutlineItem[];
}

export interface ProcessedSegment {
  index: number;
  startTime: number;
  endTime: number;
  content: string;
  summary: string;
}

export interface OutlineItem {
  title: string;
  startTime: number;
  endTime: number;
  keyPoints: string[];
}

const COLLOQUIAL_MARKERS = /[啊呢哦吧嘛呀哎唉嗯]{2,}/;
const CONVERSATIONAL_STARTERS = /^(那|嗯|啊|哦|呢|吧|嘛|哎|唉|然后|所以|就是|其实|好像|大概|可能|应该|或者|不过|然而|总之|因此|接下来|下面|首先|其次|再次|最后|另外|此外|同时|也就是说|换句话说)\s*/;

function isQualitySentence(sentence: string): boolean {
  if (!sentence || sentence.length < 6) return false;
  if (COLLOQUIAL_MARKERS.test(sentence)) return false;
  if (CONVERSATIONAL_STARTERS.test(sentence)) return false;
  if (/^[那嗯啊哦呢吧嘛哎唉]{1,2}[\u4e00-\u9fff]/.test(sentence)) return false;
  return true;
}

function cleanSentence(sentence: string): string {
  return sentence.trim()
    .replace(CONVERSATIONAL_STARTERS, '')
    .replace(/[，、；：！？""''（）()【】《》\[\]]+/g, '')
    .trim();
}

function extractKeyPoints(content: string): string[] {
  const points: string[] = [];
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 5);

  for (const sentence of sentences) {
    const cleaned = cleanSentence(sentence);
    if (isQualitySentence(cleaned) && cleaned.length > 8) {
      const hasKeyIndicator = /^(核心|关键|重点|重要|本质|根本|主要|基本|突出|显著)/.test(cleaned);
      if (hasKeyIndicator || cleaned.length > 15) {
        points.push(cleaned);
      }
    }
    if (points.length >= 3) break;
  }

  return points.length > 0 ? points : ['内容要点待提取'];
}

function generateSegmentSummary(content: string): string {
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 8);
  for (const sentence of sentences) {
    const cleaned = cleanSentence(sentence);
    if (isQualitySentence(cleaned) && cleaned.length > 10) {
      return cleaned.length > 60 ? cleaned.slice(0, 60) + '...' : cleaned;
    }
  }
  return content.slice(0, 50) + '...';
}

export function getTranscriptPath(courseId: string): { transcriptPath: string; outlinePath: string } | null {
  const videoRelPath = courseVideoMapping[courseId];
  if (!videoRelPath) return null;

  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  if (parts.length < 2) return null;

  const category = parts[0];
  const filename = path.parse(parts[1]).name;

  return {
    transcriptPath: path.join(STT_BASE_DIR, category, 'output_funasr', `${filename}.json`),
    outlinePath: path.join(STT_BASE_DIR, category, 'output_outline', `${filename}.json`),
  };
}

export function getCourseName(courseId: string): string {
  const videoRelPath = courseVideoMapping[courseId];
  if (!videoRelPath) return courseId;
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  return parts.length >= 2 ? parts[1].replace(/\.mp4$/, '') : courseId;
}

export function getCourseCategory(courseId: string): string {
  const videoRelPath = courseVideoMapping[courseId];
  if (!videoRelPath) return '未知';
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  return parts[0] || '未知';
}

export function processTranscript(courseId: string): ProcessResult | null {
  const paths = getTranscriptPath(courseId);
  if (!paths) return null;

  let rawData: any[] = [];

  if (fs.existsSync(paths.outlinePath)) {
    const content = fs.readFileSync(paths.outlinePath, 'utf-8');
    rawData = JSON.parse(content);
  } else if (fs.existsSync(paths.transcriptPath)) {
    const content = fs.readFileSync(paths.transcriptPath, 'utf-8');
    rawData = JSON.parse(content);
  } else {
    return null;
  }

  const segments: ProcessedSegment[] = rawData.map((entry: any) => ({
    index: entry.paragraph_index,
    startTime: entry.start_time_second,
    endTime: entry.end_time_second,
    content: entry.content,
    summary: generateSegmentSummary(entry.content),
  }));

  const outline: OutlineItem[] = rawData.map((entry: any) => ({
    title: generateSegmentSummary(entry.content),
    startTime: entry.start_time_second,
    endTime: entry.end_time_second,
    keyPoints: extractKeyPoints(entry.content),
  }));

  return {
    courseId,
    courseName: getCourseName(courseId),
    category: getCourseCategory(courseId),
    transcriptPath: paths.transcriptPath,
    segments,
    outline,
  };
}

export function getAllAvailableCourses(): { courseId: string; name: string; category: string }[] {
  const results: { courseId: string; name: string; category: string }[] = [];

  for (const [courseId, videoRelPath] of Object.entries(courseVideoMapping)) {
    const paths = getTranscriptPath(courseId);
    if (paths && (fs.existsSync(paths.transcriptPath) || fs.existsSync(paths.outlinePath))) {
      const parts = videoRelPath.replace(/\\/g, '/').split('/');
      const category = parts[0] || '未知';
      const name = parts.length >= 2 ? parts[1].replace(/\.mp4$/, '') : courseId;
      results.push({ courseId, name, category });
    }
  }

  return results;
}