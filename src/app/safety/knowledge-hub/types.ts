export interface DisasterKnowledge {
  disasterId: string;
  disasterName: string;
  disasterIcon: string;

 成因: string[];
  风险区域: { category: string; items: string[] }[];
  避险方法: { phase: string; items: string[] }[];
  典型错误: { error: string; consequence: string; correct: string }[];
  案例复盘: { title: string; background: string; process: string; lessons: string[] }[];
}

export interface KnowledgeHubData {
  disasterId: string;
  disasterName: string;
  disasterIcon: string;
  knowledge: DisasterKnowledge;
}
