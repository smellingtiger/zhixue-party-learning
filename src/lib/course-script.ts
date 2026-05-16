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
}

export interface SectionMarker {
  title: string;
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
    return { title: section.title, timeOffset };
  });
}

export async function loadCourseScript(courseName?: string): Promise<CourseScript | null> {
  try {
    const scriptFile = courseName && courseName.includes('乡村振兴')
      ? '/course-scripts/rural-revitalization-script.json'
      : '/course-scripts/script.json';
    const response = await fetch(scriptFile);
    if (!response.ok) {
      console.error('[课程文稿] 加载失败');
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('[课程文稿] 加载异常:', error);
    return null;
  }
}
