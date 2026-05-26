export interface CourseScript {
  courseName: string;
  chapters: ChapterScript[];
}

export interface ChapterScript {
  id: string;
  title: string;
  content?: string;
  sections?: SectionScript[];
}

export interface SectionScript {
  title: string;
  content: string;
  timeOffset?: number;
  timeEndOffset?: number;
}

export interface SectionMarker {
  title: string;
  content: string;
  timeOffset: number;
}

function estimateDuration(text: string): number {
  const chars = text.replace(/\s+/g, '').length;
  const charsPerSec = 5 * 0.85;
  return chars / charsPerSec;
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([。！？；\n])/g, '$1|')
    .split('|')
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());
}

export function getChapterSpeechContent(chapter: ChapterScript): string {
  if (chapter.content) return chapter.content;
  if (chapter.sections) {
    return chapter.sections
      .map(section => `${section.title}。${section.content}`)
      .join('\n\n');
  }
  return '';
}

export function getChapterSections(chapter: ChapterScript): SectionMarker[] {
  if (chapter.content || !chapter.sections) return [];

  let cumulative = 0;

  return chapter.sections.map(section => {
    const timeOffset = cumulative;
    const sectionContent = `${section.title}。${section.content}`;
    const sectionSentences = splitIntoSentences(sectionContent);
    cumulative += sectionSentences.reduce((sum, s) => sum + estimateDuration(s), 0);
    return { title: section.title, content: section.content, timeOffset };
  });
}

function parseTimeToSeconds(time?: string): number | undefined {
  if (!time) return undefined;
  const parts = time.split(':').map(Number);
  if (parts.length === 3 && parts.every(n => !isNaN(n))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2 && parts.every(n => !isNaN(n))) {
    return parts[0] * 60 + parts[1];
  }
  return undefined;
}

export async function loadCourseScript(courseName?: string, courseId?: string): Promise<CourseScript | null> {
  try {
    let scriptFile: string | null = null;
    
    if (courseName?.includes('乡村振兴')) {
      scriptFile = '/course-scripts/rural-revitalization-script.json';
    } else if (courseName?.includes('内涝') || courseName?.includes('洪涝') || courseName?.includes('防汛') || courseName?.includes('应急处置')) {
      scriptFile = '/course-scripts/flood-script.json';
    } else if (courseName?.includes('台风应急标准化处置') || courseName?.includes('岗位指挥课程')) {
      scriptFile = '/course-scripts/typhoon-command-script.json';
    } else if (courseName?.includes('台风') || courseName?.includes('防灾减灾知识科普')) {
      scriptFile = '/course-scripts/typhoon-script.json';
    } else if (courseName?.includes('具身智能')) {
      scriptFile = '/course-scripts/script.json';
    }

    if (scriptFile) {
      const response = await fetch(scriptFile);
      if (response.ok) {
        return await response.json();
      }
    }

    if (courseId) {
      const kbRes = await fetch(`/api/knowledge-base/${encodeURIComponent(courseId)}`);
      if (kbRes.ok) {
        const kbData = await kbRes.json();
        if (kbData.segments && kbData.segments.length > 0) {
          return {
            courseName: kbData.courseName || courseName || '',
            chapters: [{
              id: 'ch1',
              title: kbData.courseName || courseName || '课程大纲',
              sections: kbData.segments.map((seg: any, idx: number) => ({
                title: seg.title || `第${idx + 1}段`,
                content: seg.content || '',
                timeOffset: parseTimeToSeconds(seg.time),
                timeEndOffset: parseTimeToSeconds(seg.timeEnd),
              })),
            }],
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[课程文稿] 加载异常:', error);
    return null;
  }
}
