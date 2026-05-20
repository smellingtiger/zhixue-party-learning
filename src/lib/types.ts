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
  matchedNodeCount?: number;
  matchedCourseCount?: number;
  matchedTopics?: string[];
  matchedNodes?: string[];
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

// 文本需求分析结果
export interface RequirementAnalysis {
  keywords: string[];
  matchedTopics: string[];
  matchedNodes: string[];
  suggestedLevel: 'beginner' | 'intermediate' | 'advanced';
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

// 题目类型定义
export interface Question {
  id: string;
  type: 'open_ended' | 'essay' | 'case_analysis' | 'reflection';
  title: string;
  content: string;
  context?: string; // 背景知识或参考材料
  hints?: string[]; // 提示信息
  scoringCriteria?: ScoringCriteria; // 评分标准
  difficulty: 'easy' | 'medium' | 'hard';
  knowledgeNodeId?: string; // 关联的知识图谱节点
  relatedTopics?: string[]; // 相关主题
  maxScore: number; // 满分
  timeLimit?: number; // 时间限制(分钟)
}

// 开放题答案
export interface OpenEndedAnswer {
  questionId: string;
  content: string;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  wordCount: number;
}

// 评分标准
export interface ScoringCriteria {
  dimensions: ScoringDimension[];
}

export interface ScoringDimension {
  name: string; // 维度名称,如"理论深度"、"实践应用"等
  description: string; // 维度说明
  weight: number; // 权重(0-1)
  maxPoints: number; // 该维度满分
}

// 题目集合/试卷
export interface QuizSet {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  totalScore: number;
  timeLimit?: number; // 总时间限制(分钟)
  knowledgePathId?: string; // 关联的学习路径
  generatedForNodes: string[]; // 基于哪些知识节点生成
  createdAt: Date;
}

// AI生成的题目配置
export interface QuestionGenerationConfig {
  nodeIds: string[]; // 知识节点ID列表
  questionCount: number; // 生成题目数量
  difficulty: 'easy' | 'medium' | 'hard'; // 难度级别
  focusAreas?: string[]; // 重点考察领域
  includeVideoContext?: boolean; // 是否包含视频内容上下文
  questionTypes?: ('open_ended' | 'essay' | 'case_analysis' | 'reflection')[]; // 题目类型偏好
}
