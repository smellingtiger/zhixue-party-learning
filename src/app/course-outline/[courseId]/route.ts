import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { courseVideoMapping } from '@/lib/video-mapping';

const STT_BASE_DIR = 'E:\\社院课程stt';

interface SemanticOutlineEntry {
  index: number;
  start_time_second: number;
  end_time_second: number;
  summary: string;
}

function getOutlinePath(videoRelPath: string): string | null {
  const parts = videoRelPath.replace(/\\/g, '/').split('/');
  if (parts.length < 2) return null;

  const category = parts[0];
  const filename = path.parse(parts[1]).name;

  return path.join(STT_BASE_DIR, category, 'output_outline', `${filename}.json`);
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

    const outlinePath = getOutlinePath(videoRelPath);
    if (!outlinePath) {
      return NextResponse.json([]);
    }

    if (!fs.existsSync(outlinePath)) {
      return NextResponse.json([]);
    }

    const content = fs.readFileSync(outlinePath, 'utf-8');
    const data: SemanticOutlineEntry[] = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load outline:', error);
    return NextResponse.json([]);
  }
}
