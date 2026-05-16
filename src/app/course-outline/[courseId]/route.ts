import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { courseVideoMapping } from '@/lib/video-mapping';

const STT_BASE_DIR = 'E:\\社院课程stt';

function getTranscriptPath(videoRelPath: string): { transcriptPath: string; outlinePath: string } | null {
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  if (parts.length < 2) return null;

  const category = parts[0];
  const filename = path.parse(parts[1]).name;

  const transcriptPath = path.join(STT_BASE_DIR, category, 'output_funasr', `${filename}.json`);
  const outlinePath = path.join(STT_BASE_DIR, category, 'output_outline', `${filename}.json`);

  return { transcriptPath, outlinePath };
}

interface OutlineEntry {
  paragraph_index: number;
  start_time_second: number;
  end_time_second: number;
  content: string;
  title?: string;
}

const COLLOQUIAL_MARKERS = /[啊呢哦吧嘛呀哎唉嗯]{2,}/;
const CONVERSATIONAL_STARTERS = /^(那|嗯|啊|哦|呢|吧|嘛|哎|唉|然后|所以|就是|其实|好像|大概|可能|应该|或者|不过|然而|总之|因此|接下来|下面|首先|其次|再次|最后|另外|此外|同时|也就是说|换句话说)\s*/;
const INTRO_STARTERS = /^(大家好|同志们|朋友们|各位|今天我们|这节课|本次课程|我们今天|今天我)\s*/;

function isQualitySentence(sentence: string): boolean {
  if (!sentence || sentence.length < 6) return false;
  if (COLLOQUIAL_MARKERS.test(sentence)) return false;
  if (CONVERSATIONAL_STARTERS.test(sentence)) return false;
  if (/^[那嗯啊哦呢吧嘛哎唉]{1,2}[\u4e00-\u9fff]/.test(sentence)) return false;
  if (/^(我|你|他|她|它)\s+[\u4e00-\u9fff]{1,4}$/.test(sentence)) return false;
  return true;
}

function cleanSentence(sentence: string): string {
  let result = sentence.trim()
    .replace(INTRO_STARTERS, '')
    .replace(CONVERSATIONAL_STARTERS, '')
    .replace(/[，、；：！？""''（）()【】《》\[\]]+/g, '');
  
  return result.trim();
}

function extractCompleteSentence(content: string): string {
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 8);
  
  for (const sentence of sentences) {
    const cleaned = cleanSentence(sentence);
    if (isQualitySentence(cleaned)) {
      return cleaned;
    }
  }
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 6) {
      return trimmed;
    }
  }
  
  return '';
}

function extractSummaryTitle(content: string, index: number, total: number): string {
  if (index === 1) {
    const match = content.match(/(?:主题[是为]|主要讲|今天讲|核心内容|围绕)(.*?)(?:[。！？]|$)/);
    if (match) {
      const cleaned = cleanSentence(match[1]);
      if (isQualitySentence(cleaned)) return cleaned;
    }
    return '课程引言';
  }

  if (index === total) {
    return '课程总结';
  }

  const sentence = extractCompleteSentence(content);
  if (sentence) {
    return sentence;
  }

  const SECTION_LABELS = [
    '核心要点', '主要内容', '基本观点', '关键论述', '重点解析',
    '深入探讨', '理论阐述', '实践分析', '案例解读', '总结归纳',
  ];
  
  return SECTION_LABELS[(index - 2) % SECTION_LABELS.length];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const videoRelPath = courseVideoMapping[courseId];

    if (!videoRelPath) {
      return NextResponse.json([]);
    }

    const paths = getTranscriptPath(videoRelPath);
    if (!paths) {
      return NextResponse.json([]);
    }

    let data: OutlineEntry[] = [];
    if (fs.existsSync(paths.outlinePath)) {
      const content = fs.readFileSync(paths.outlinePath, 'utf-8');
      const raw: OutlineEntry[] = JSON.parse(content);
      data = raw.map(entry => ({
        ...entry,
        title: extractSummaryTitle(entry.content, entry.paragraph_index, raw.length),
      }));
    } else if (fs.existsSync(paths.transcriptPath)) {
      const content = fs.readFileSync(paths.transcriptPath, 'utf-8');
      const transcript: OutlineEntry[] = JSON.parse(content);
      data = transcript.map((entry) => ({
        ...entry,
        title: extractSummaryTitle(entry.content, entry.paragraph_index, transcript.length),
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load outline:', error);
    return NextResponse.json([]);
  }
}
