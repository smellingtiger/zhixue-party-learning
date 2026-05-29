// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EmergencyDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  disasterType: DisasterType;
  source: DataSource;
  sourceUrl?: string;
  content: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  paragraphs?: number;
  fileSize?: number;
}

type DocumentCategory = '预案' | '制度' | '标准' | '演练' | '指挥手册' | '知识科普';

type DisasterType = 'flood' | 'typhoon' | 'earthquake' | 'forest-fire' | 'cold-wave';

type DataSource = 'knowledge-base' | 'local-md' | 'official-website';

interface KnowledgeBaseFile {
  id: string;
  title: string;
  category: string;
  size: number;
  modified_time: string;
  paragraph_count: number;
}

interface KnowledgeBaseSearchResult {
  doc_id: string;
  title: string;
  category: string;
  snippets: string[];
}

interface DocumentQueryParams {
  category?: DocumentCategory;
  disasterType?: DisasterType;
  source?: DataSource;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface DocumentQueryResult {
  documents: EmergencyDocument[];
  total: number;
  categories: { category: DocumentCategory; count: number }[];
  page: number;
  pageSize: number;
}

interface DocumentTab {
  id: 'browse' | 'qa' | 'search';
  label: string;
  icon: string;
}

interface QAHistory {
  id: string;
  question: string;
  answer: string;
  sources: { title: string; id: string; snippet: string }[];
  timestamp: Date;
}

export type {
  EmergencyDocument,
  DocumentCategory,
  DisasterType,
  DataSource,
  KnowledgeBaseFile,
  KnowledgeBaseSearchResult,
  DocumentQueryParams,
  DocumentQueryResult,
  DocumentTab,
  QAHistory,
};