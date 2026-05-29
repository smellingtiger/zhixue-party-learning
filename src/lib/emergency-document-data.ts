import fs from 'fs';
import path from 'path';
import type { EmergencyDocument, DocumentCategory, DisasterType } from '@/app/safety/emergency-library/types';
import { getMockDocuments } from './emergency-mock-data';

const KB_API_BASE = 'http://192.168.1.212:8080/api';

function mapDisasterType(kbCategory: string): DisasterType {
  const lower = kbCategory.toLowerCase();
  if (lower.includes('洪涝') || lower.includes('洪水') || lower.includes('内涝') || lower.includes('flood')) return 'flood';
  if (lower.includes('台风') || lower.includes('typhoon')) return 'typhoon';
  if (lower.includes('地震') || lower.includes('earthquake')) return 'earthquake';
  if (lower.includes('森林') || lower.includes('火灾') || lower.includes('fire')) return 'forest-fire';
  if (lower.includes('寒潮') || lower.includes('低温') || lower.includes('寒冷') || lower.includes('cold')) return 'cold-wave';
  return 'flood';
}

function mapDocumentCategory(kbCategory: string): DocumentCategory {
  const lower = kbCategory.toLowerCase();
  if (lower.includes('预案') || lower.includes('应急方案')) return '预案';
  if (lower.includes('制度') || lower.includes('规定')) return '制度';
  if (lower.includes('标准') || lower.includes('规范')) return '标准';
  if (lower.includes('演练') || lower.includes('实训')) return '演练';
  if (lower.includes('指挥') || lower.includes('岗位') || lower.includes('sop')) return '指挥手册';
  return '知识科普';
}

function extractTags(title: string, content: string, category: string): string[] {
  const tags: string[] = [];
  const combined = (title + ' ' + content).toLowerCase();

  const keywordMap: [string, string][] = [
    ['应急', '应急管理'], ['预案', '应急预案'], ['处置', '应急处置'],
    ['响应', '应急响应'], ['救援', '救援'], ['疏散', '人员疏散'],
    ['防汛', '防汛'], ['抗洪', '抗洪'], ['排涝', '排涝'],
    ['台风', '台风防御'], ['地震', '地震应对'], ['森林', '森林防火'],
    ['寒潮', '寒潮防护'], ['物资', '物资保障'], ['医疗', '医疗保障'],
    ['交通', '交通管制'], ['通信', '通信保障'], ['电力', '电力保障'],
    ['预警', '预警'], ['指挥', '指挥体系'], ['sop', 'SOP'],
  ];

  for (const [kw, tag] of keywordMap) {
    if (combined.includes(kw) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  tags.push(category);
  return tags.slice(0, 8);
}

function parseLocalMdFile(filePath: string, disasterType: DisasterType): EmergencyDocument | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return null;

    const lines = raw.split('\n');
    let title = path.basename(filePath, '.md').replace(/^《|》$/g, '');
    const firstLine = lines[0]?.replace(/^#\s*/, '').trim();
    if (firstLine) title = firstLine;

    let category: DocumentCategory = '指挥手册';
    if (title.includes('实训') || title.includes('演练')) category = '演练';
    else if (title.includes('知识') || title.includes('科普')) category = '知识科普';
    else if (title.includes('预案')) category = '预案';

    const content = raw;
    const fileStat = fs.statSync(filePath);
    // 使用文件名的 base64 编码作为 ID，确保唯一性
    const fileName = path.basename(filePath);
    const id = 'local-md-' + Buffer.from(fileName).toString('base64');

    return {
      id,
      title,
      category,
      disasterType,
      source: 'local-md',
      content,
      createdAt: fileStat.birthtime.toISOString(),
      updatedAt: fileStat.mtime.toISOString(),
      tags: extractTags(title, content, category),
      paragraphs: content.split('\n').filter(l => l.trim()).length,
      fileSize: fileStat.size,
    };
  } catch {
    return null;
  }
}

function getAllLocalMdDocuments(): EmergencyDocument[] {
  const projectRoot = process.cwd();
  const mdPatterns = [
    { pattern: /《.*应急.*》\.md$/, disasterType: 'flood' as DisasterType },
  ];

  const disasterTypeMap: Record<string, DisasterType> = {
    '地震': 'earthquake',
    '台风': 'typhoon',
    '洪涝': 'flood',
    '内涝': 'flood',
    '森林': 'forest-fire',
    '火灾': 'forest-fire',
    '寒潮': 'cold-wave',
  };

  const documents: EmergencyDocument[] = [];

  try {
    const files = fs.readdirSync(projectRoot);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      if (!file.startsWith('《')) continue;

      let disasterType: DisasterType = 'flood';
      for (const [keyword, dt] of Object.entries(disasterTypeMap)) {
        if (file.includes(keyword)) {
          disasterType = dt;
          break;
        }
      }

      const fullPath = path.join(projectRoot, file);
      const doc = parseLocalMdFile(fullPath, disasterType);
      if (doc) documents.push(doc);
    }
  } catch {
    console.warn('读取本地 MD 文件目录失败');
  }

  return documents;
}

interface KnowledgeBaseApiResponse {
  files?: Array<{
    id: string;
    title: string;
    category: string;
    size: number;
    modified_time: string;
    paragraph_count: number;
  }>;
  total?: number;
  categories?: string[];
  category_counts?: Record<string, number>;
}

async function fetchKnowledgeBaseDocuments(
  category?: string,
  search?: string
): Promise<EmergencyDocument[]> {
  try {
    let url = `${KB_API_BASE}/files`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('q', search);
    if (params.toString()) url += '?' + params.toString();

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];

    const data: KnowledgeBaseApiResponse = await res.json();
    if (!data.files) return [];

    return data.files.map((file) => {
      const disasterType = mapDisasterType(file.category);
      const docCategory = mapDocumentCategory(file.category);

      return {
        id: `kb-${file.id}`,
        title: file.title,
        category: docCategory,
        disasterType,
        source: 'knowledge-base' as const,
        content: '',
        createdAt: file.modified_time,
        updatedAt: file.modified_time,
        tags: extractTags(file.title, '', String(docCategory)),
        paragraphs: file.paragraph_count,
        fileSize: file.size,
      };
    });
  } catch {
    console.warn('获取知识库文档列表失败');
    return [];
  }
}

async function fetchKnowledgeBaseDocumentDetail(docId: string): Promise<EmergencyDocument | null> {
  try {
    const res = await fetch(`${KB_API_BASE}/files/${docId}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const content = data.content || data.text || '';

    const disasterType = mapDisasterType(data.category || '');
    const docCategory = mapDocumentCategory(data.category || '');

    return {
      id: `kb-${data.id || docId}`,
      title: data.title || '未命名文档',
      category: docCategory,
      disasterType,
      source: 'knowledge-base',
      content,
      createdAt: data.modified_time || data.created_time || '',
      updatedAt: data.modified_time || data.created_time || '',
      tags: extractTags(data.title || '', content, String(docCategory)),
      paragraphs: data.paragraph_count || 0,
      fileSize: data.size || 0,
    };
  } catch {
    return null;
  }
}

async function searchKnowledgeBase(query: string): Promise<EmergencyDocument[]> {
  try {
    const url = `${KB_API_BASE}/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((result: { doc_id: string; title: string; category: string; snippets: string[] }) => {
      const disasterType = mapDisasterType(result.category);
      const docCategory = mapDocumentCategory(result.category);
      return {
        id: `kb-${result.doc_id}`,
        title: result.title,
        category: docCategory,
        disasterType,
        source: 'knowledge-base' as const,
        content: result.snippets?.join('\n') || '',
        createdAt: '',
        updatedAt: '',
        tags: extractTags(result.title, result.snippets?.join(' ') || '', String(docCategory)),
      };
    });
  } catch {
    return [];
  }
}

async function getAllDocuments(options?: {
  category?: DocumentCategory;
  disasterType?: DisasterType;
  search?: string;
}): Promise<EmergencyDocument[]> {
  let documents: EmergencyDocument[] = [];

  const mockDocs = getMockDocuments();
  documents.push(...mockDocs);

  const localDocs = getAllLocalMdDocuments();
  for (const ld of localDocs) {
    if (!documents.some(d => d.title === ld.title)) {
      documents.push(ld);
    }
  }

  if (options?.category) {
    documents = documents.filter(d => d.category === options.category);
  }
  if (options?.disasterType) {
    documents = documents.filter(d => d.disasterType === options.disasterType);
  }
  if (options?.search) {
    const query = options.search.toLowerCase();
    documents = documents.filter(d =>
      d.title.toLowerCase().includes(query) ||
      d.tags.some(t => t.toLowerCase().includes(query))
    );

    try {
      const kbSearchResults = await searchKnowledgeBase(options.search);
      for (const result of kbSearchResults) {
        if (!documents.some(d => d.id === result.id)) {
          documents.push(result);
        }
      }
    } catch {}
  }

  return documents;
}

export {
  getAllDocuments,
  getAllLocalMdDocuments,
  fetchKnowledgeBaseDocuments,
  fetchKnowledgeBaseDocumentDetail,
  searchKnowledgeBase,
};

export function getKnowledgeBaseApiBase() {
  return KB_API_BASE;
}