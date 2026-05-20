export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false';
  question: string;
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation: string;
  knowledgePoint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChapterQuiz {
  chapterId: number | string;
  chapterTitle: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  timeLimit?: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
    correctAnswer: string | string[];
    explanation: string;
  }[];
  aiSuggestion: string;
  completedAt: Date;
}
