import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PUBLIC_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

function getChapterDuration(text: string): number {
  const clean = text.replace(/\s+/g, '');
  const charsPerSec = 4.25;
  return clean.length / charsPerSec;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, chapters } = body as {
      sessionId: string;
      chapters: { id: string; text: string }[];
    };

    if (!sessionId || !chapters || !Array.isArray(chapters)) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数 sessionId 或 chapters' },
        { status: 400 }
      );
    }

    const results: Record<string, { url: string; duration: number }> = {};
    const durationsRecord: Record<string, number> = {};

    for (const chapter of chapters) {
      if (!chapter.text || chapter.text.trim().length === 0) {
        results[chapter.id] = { url: '', duration: 0 };
        continue;
      }

      const audioFilename = `${sessionId}_${chapter.id}.mp3`;
      const audioPath = path.join(PUBLIC_AUDIO_DIR, audioFilename);
      const existingFiles = fs.readdirSync(PUBLIC_AUDIO_DIR)
        .filter(f => f.startsWith(sessionId) && f.endsWith('.mp3'));
      
      if (existingFiles.some(f => f === audioFilename)) {
        const estDuration = getChapterDuration(chapter.text);
        results[chapter.id] = { url: `/audio/${audioFilename}`, duration: estDuration };
        durationsRecord[chapter.id] = estDuration;
        continue;
      }

      try {
        const pythonScript = path.join(process.cwd(), 'scripts', 'tts_generate.py');
        const escapedText = chapter.text
          .replace(/["]/g, '\\"')
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .trim();

        const command = `python "${pythonScript}" --text "${escapedText}" --output "${audioPath}"`;
        const output = execSync(command, { timeout: 30000, encoding: 'utf-8' });
        const result = JSON.parse(output.trim());

        if (result.success) {
          const duration = result.duration > 0 ? result.duration : getChapterDuration(chapter.text);
          results[chapter.id] = { url: `/audio/${audioFilename}`, duration };
          durationsRecord[chapter.id] = duration;
        } else {
          const estDuration = getChapterDuration(chapter.text);
          results[chapter.id] = { url: `/audio/${audioFilename}`, duration: estDuration };
          durationsRecord[chapter.id] = estDuration;
        }
      } catch {
        const estDuration = getChapterDuration(chapter.text);
        results[chapter.id] = { url: `/audio/${audioFilename}`, duration: estDuration };
        durationsRecord[chapter.id] = estDuration;
      }
    }

    const durationsPath = path.join(PUBLIC_AUDIO_DIR, `${sessionId}_durations.json`);
    try {
      const existingDurations: Record<string, number> = {};
      if (fs.existsSync(durationsPath)) {
        const raw = fs.readFileSync(durationsPath, 'utf-8');
        Object.assign(existingDurations, JSON.parse(raw));
      }
      const merged = { ...durationsRecord };
      fs.writeFileSync(durationsPath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch {}

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'TTS 生成失败' },
      { status: 500 }
    );
  }
}