// 课程信息
export interface CourseInfo {
  id: string;
  title: string;
  duration: number;
  videoId?: string;
  videoPath?: string; // 本地视频文件路径（相对于 VIDEO_BASE_PATH）
}

// 知识图谱节点
export interface KnowledgeNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  difficulty?: number; // 1: 基础, 2: 中等, 3: 复杂
  children?: KnowledgeNode[];
  content?: CourseContent;
  keyPoints?: string[];
  relatedDocuments?: RelatedDoc[];
  prerequisites?: string[];
  courses?: CourseInfo[];
  videoId?: string;
  isCourseNode?: boolean;
  courseData?: CourseInfo;
}

// 课程内容
export interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration?: number;
  url?: string;
  summary?: string;
}

// 关联文档
export interface RelatedDoc {
  id: string;
  title: string;
  type: string;
  url?: string;
}

// 学习路径
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  rootNode: KnowledgeNode;
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 用户画像
export interface UserProfile {
  role: string;
  interests: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  completedNodes: string[];
}

// 学习诊断选项
export interface DiagnosticOption {
  id: string;
  label: string;
  category: string;
  tags: string[];
}

// AI意图解析结果
export interface IntentResult {
  keywords: string[];
  matchedNodes: string[];
  suggestedPath: string;
  confidence: number;
}

// 学习进度
export interface LearningProgress {
  nodeId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: Date;
  // 记录该节点下已完成的课程ID列表
  completedCourses?: string[];
}
