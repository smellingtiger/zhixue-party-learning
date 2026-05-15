import fs from 'fs';
import path from 'path';

const KNOWLEDGE_BASE_DIR = 'E:\\社院课程stt\\knowledge_base_txt';

export interface KnowledgeDoc {
  id: string;
  courseName: string;
  category: string;
  paragraphCount: number;
  fileName: string;
}

export interface KnowledgeSegment {
  title: string;
  time: string;
  content: string;
}

export interface KnowledgeDocDetail extends KnowledgeDoc {
  segments: KnowledgeSegment[];
}

export function getAllKnowledgeDocs(): KnowledgeDoc[] {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    return [];
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR)
    .filter(f => f.endsWith('.txt'))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  return files.map((fileName) => {
    const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
    const id = fileName.replace(/\.txt$/, '');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const courseName = fileName.replace(/\.txt$/, '');
    const category = extractField(lines[1] || '');
    const paragraphCount = parseInt(extractField(lines[2] || '')) || 0;

    return { id, courseName, category, paragraphCount, fileName };
  });
}

export function getKnowledgeDocDetail(id: string): KnowledgeDocDetail | null {
  const fileName = `${id}.txt`;
  const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const courseName = fileName.replace(/\.txt$/, '');
  const category = extractField(lines[1] || '');
  const paragraphCount = parseInt(extractField(lines[2] || '')) || 0;

  const segments = parseSegments(lines.slice(4).join('\n'));

  return { id, courseName, category, paragraphCount, fileName, segments };
}

export function searchKnowledgeDocs(query: string): KnowledgeDoc[] {
  const docs = getAllKnowledgeDocs();
  if (!query.trim()) return docs;

  const q = query.toLowerCase();
  return docs.filter(doc =>
    doc.courseName.toLowerCase().includes(q) ||
    doc.category.toLowerCase().includes(q) ||
    doc.id.toLowerCase().includes(q)
  );
}

function extractField(line: string): string {
  const match = line.match(/】(.+)/);
  return match ? match[1].trim() : line.trim();
}

function parseSegments(text: string): KnowledgeSegment[] {
  const segments: KnowledgeSegment[] = [];
  const segmentRegex = /【(.+?)】\s*\[时间\]\s*([\d:]+)\s*([\s\S]*?)(?=(【|$))/g;
  let match;

  while ((match = segmentRegex.exec(text)) !== null) {
    const title = match[1].trim();
    const time = match[2].trim();
    const content = match[3].trim();
    segments.push({ title, time, content });
  }

  if (segments.length === 0) {
    const lines = text.split('\n').filter(l => l.trim());
    let currentTitle = '';
    let currentTime = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const titleMatch = line.match(/【(.+?)】/);
      const timeMatch = line.match(/\[时间\]\s*([\d:]+)/);

      if (titleMatch) {
        if (currentTitle && currentContent.length > 0) {
          segments.push({ title: currentTitle, time: currentTime, content: currentContent.join('\n') });
        }
        currentTitle = titleMatch[1].trim();
        currentContent = [];
        if (!timeMatch) {
          currentTime = '';
        } else {
          currentTime = timeMatch[1].trim();
        }
      } else if (timeMatch) {
        currentTime = timeMatch[1].trim();
      } else if (currentTitle) {
        currentContent.push(line.trim());
      }
    }
    if (currentTitle && currentContent.length > 0) {
      segments.push({ title: currentTitle, time: currentTime, content: currentContent.join('\n') });
    }
  }

  return segments;
}