export type MetricStatus = 'normal' | 'warning' | 'critical';
export type MetricTrend = 'up' | 'down' | 'stable';

export interface DisasterMetric {
  id: string;
  label: string;
  unit: string;
  icon: string;
  currentValue: number;
  minValue: number;
  maxValue: number;
  safeRange: [number, number];
  warningRange: [number, number];
  criticalRange: [number, number];
  status: MetricStatus;
  trend: MetricTrend;
  description: string;
}

export interface MetricsSnapshot {
  metrics: DisasterMetric[];
  timestamp: Date;
}

export interface DecisionImpact {
  metricId: string;
  correctImpact: number;
  wrongImpact: number;
  logMessage: {
    correct: string;
    wrong: string;
  };
}

export interface ActionImpactMap {
  actionKeywords: string[];
  impacts: DecisionImpact[];
}

const floodMetricsConfig: {
  id: string;
  label: string;
  unit: string;
  icon: string;
  initialValue: number;
  minValue: number;
  maxValue: number;
  safeRange: [number, number];
  warningRange: [number, number];
  criticalRange: [number, number];
  description: string;
}[] = [
  {
    id: 'floodDepth',
    label: '积水深度',
    unit: 'cm',
    icon: '🌊',
    initialValue: 45,
    minValue: 0,
    maxValue: 120,
    safeRange: [0, 30],
    warningRange: [30, 60],
    criticalRange: [60, 120],
    description: '当前城区主干道平均积水深度',
  },
  {
    id: 'rainfall',
    label: '降雨量',
    unit: 'mm/h',
    icon: '🌧️',
    initialValue: 48,
    minValue: 0,
    maxValue: 100,
    safeRange: [0, 30],
    warningRange: [30, 50],
    criticalRange: [50, 100],
    description: '当前小时降雨量',
  },
  {
    id: 'affectedAreas',
    label: '受影响区域',
    unit: '处',
    icon: '🏘️',
    initialValue: 5,
    minValue: 0,
    maxValue: 20,
    safeRange: [0, 3],
    warningRange: [3, 8],
    criticalRange: [8, 20],
    description: '当前受影响的内涝点数量',
  },
  {
    id: 'pumpRate',
    label: '泵站运行率',
    unit: '%',
    icon: '⚡',
    initialValue: 65,
    minValue: 0,
    maxValue: 100,
    safeRange: [80, 100],
    warningRange: [50, 80],
    criticalRange: [0, 50],
    description: '排水泵站正常运行比例',
  },
  {
    id: 'rescueRate',
    label: '救援到位率',
    unit: '%',
    icon: '🚒',
    initialValue: 55,
    minValue: 0,
    maxValue: 100,
    safeRange: [80, 100],
    warningRange: [50, 80],
    criticalRange: [0, 50],
    description: '应急抢险队伍到位比例',
  },
  {
    id: 'trafficDisruption',
    label: '交通中断点',
    unit: '处',
    icon: '🚧',
    initialValue: 4,
    minValue: 0,
    maxValue: 15,
    safeRange: [0, 2],
    warningRange: [2, 6],
    criticalRange: [6, 15],
    description: '因积水导致交通中断的路段数',
  },
];

export const floodActionImpactMap: ActionImpactMap[] = [
  {
    actionKeywords: ['指令水文监测', '指令城管监测', '指令交通巡查', '到岗指挥', '局长带班', '局长进驻', '进驻指挥'],
    impacts: [
      { metricId: 'floodDepth', correctImpact: -3, wrongImpact: 5, logMessage: { correct: '✓ 监测指令及时下达，积水情况得到及时掌握', wrong: '⚠ 未及时下达监测指令，积水情况掌握滞后' } },
      { metricId: 'rainfall', correctImpact: -2, wrongImpact: 3, logMessage: { correct: '✓ 气象水文数据实时监控，降雨趋势研判准确', wrong: '⚠ 气象水文监测缺失，降雨趋势判断不准' } },
    ],
  },
  {
    actionKeywords: ['值班值守', '动态跟踪'],
    impacts: [
      { metricId: 'affectedAreas', correctImpact: -1, wrongImpact: 2, logMessage: { correct: '✓ 值班值守到位，灾情动态跟踪及时', wrong: '⚠ 值班值守不到位，灾情信息滞后' } },
      { metricId: 'rescueRate', correctImpact: 5, wrongImpact: -8, logMessage: { correct: '✓ 动态跟踪有效，救援资源调配精准', wrong: '⚠ 动态跟踪缺失，救援资源调配混乱' } },
    ],
  },
  {
    actionKeywords: ['物资调拨', '物资增配', '物资检查', '物资储备', '物资调集', '协议储备'],
    impacts: [
      { metricId: 'pumpRate', correctImpact: 10, wrongImpact: -12, logMessage: { correct: '✓ 物资调拨到位，排涝设备充足', wrong: '⚠ 物资调拨不及时，排涝设备短缺' } },
      { metricId: 'rescueRate', correctImpact: 8, wrongImpact: -10, logMessage: { correct: '✓ 应急物资储备充足，救援能力提升', wrong: '⚠ 应急物资储备不足，影响救援效率' } },
    ],
  },
  {
    actionKeywords: ['拉网排查', '清淤作业', '智慧排水', '管网疏通', '大型抽排', '优先排水'],
    impacts: [
      { metricId: 'floodDepth', correctImpact: -8, wrongImpact: 10, logMessage: { correct: '✓ 排水作业有效，积水深度下降', wrong: '⚠ 排水作业不力，积水深度持续上升' } },
      { metricId: 'pumpRate', correctImpact: 8, wrongImpact: -10, logMessage: { correct: '✓ 排水管网畅通，泵站运行效率提升', wrong: '⚠ 排水管网堵塞，泵站运行效率降低' } },
    ],
  },
  {
    actionKeywords: ['移动泵车', '老旧泵站值守', '防倒灌'],
    impacts: [
      { metricId: 'floodDepth', correctImpact: -5, wrongImpact: 7, logMessage: { correct: '✓ 移动泵车部署到位，重点区域积水缓解', wrong: '⚠ 移动泵车部署不及时，重点区域积水加剧' } },
      { metricId: 'pumpRate', correctImpact: 6, wrongImpact: -8, logMessage: { correct: '✓ 泵站值守到位，设备运行正常', wrong: '⚠ 泵站值守缺失，设备故障风险增加' } },
    ],
  },
  {
    actionKeywords: ['交通管制', '路况监控', '隐患巡查', '公交调整', '硬隔离', '信息发布'],
    impacts: [
      { metricId: 'trafficDisruption', correctImpact: -2, wrongImpact: 3, logMessage: { correct: '✓ 交通管制措施得力，中断点减少', wrong: '⚠ 交通管制措施不力，中断点增加' } },
      { metricId: 'rescueRate', correctImpact: 5, wrongImpact: -5, logMessage: { correct: '✓ 交通疏导有效，救援通道畅通', wrong: '⚠ 交通疏导不力，救援通道受阻' } },
    ],
  },
  {
    actionKeywords: ['队伍待命', '联合抢险', '联动抢险', '全警上路', '道路抢修'],
    impacts: [
      { metricId: 'rescueRate', correctImpact: 10, wrongImpact: -12, logMessage: { correct: '✓ 抢险队伍快速响应，救援到位率提升', wrong: '⚠ 抢险队伍响应迟缓，救援到位率下降' } },
      { metricId: 'affectedAreas', correctImpact: -1, wrongImpact: 2, logMessage: { correct: '✓ 抢险及时，受影响区域得到控制', wrong: '⚠ 抢险不及时，受影响区域扩大' } },
    ],
  },
  {
    actionKeywords: ['及时直报', '信息汇总', '重点巡查', '居民提示', '网格清理', '敲门行动', '设施检查'],
    impacts: [
      { metricId: 'affectedAreas', correctImpact: -2, wrongImpact: 3, logMessage: { correct: '✓ 基层排查到位，受影响区域减少', wrong: '⚠ 基层排查不到位，受影响区域扩大' } },
      { metricId: 'floodDepth', correctImpact: -2, wrongImpact: 3, logMessage: { correct: '✓ 网格清理有效，排水口畅通', wrong: '⚠ 网格清理不及时，排水口堵塞加重' } },
    ],
  },
  {
    actionKeywords: ['临时医疗', '临时医疗协调', '保障供电医疗', '绿色通道'],
    impacts: [
      { metricId: 'rescueRate', correctImpact: 5, wrongImpact: -5, logMessage: { correct: '✓ 医疗绿色通道畅通，伤员救治及时', wrong: '⚠ 医疗通道受阻，伤员救治延迟' } },
      { metricId: 'affectedAreas', correctImpact: -1, wrongImpact: 1, logMessage: { correct: '✓ 医疗资源到位，受影响区域得到保障', wrong: '⚠ 医疗资源不足，受影响区域风险增加' } },
    ],
  },
  {
    actionKeywords: ['GIS监控', '平台监控', '实时更新', '数据整合', '数据接入', '信息整合', '技术支援'],
    impacts: [
      { metricId: 'floodDepth', correctImpact: -2, wrongImpact: 2, logMessage: { correct: '✓ 技术监控到位，汛情研判准确', wrong: '⚠ 技术监控缺失，汛情研判偏差' } },
      { metricId: 'pumpRate', correctImpact: 4, wrongImpact: -4, logMessage: { correct: '✓ 智慧平台数据准确，决策支持有效', wrong: '⚠ 平台数据缺失，决策依据不足' } },
    ],
  },
];

export function createInitialMetrics(): DisasterMetric[] {
  return floodMetricsConfig.map(config => ({
    ...config,
    currentValue: config.initialValue,
    status: computeStatus(config.initialValue, config.safeRange, config.warningRange, config.criticalRange),
    trend: 'stable',
  }));
}

export function computeStatus(
  value: number,
  safeRange: [number, number],
  warningRange: [number, number],
  criticalRange: [number, number]
): MetricStatus {
  if (value >= criticalRange[0] && value <= criticalRange[1]) return 'critical';
  const inWarning = (value >= warningRange[0] && value <= warningRange[1]) ||
    (value > safeRange[1] && value < criticalRange[0]);
  if (inWarning) return 'warning';
  return 'normal';
}

export function computeTrend(newValue: number, oldValue: number): MetricTrend {
  if (newValue > oldValue) return 'up';
  if (newValue < oldValue) return 'down';
  return 'stable';
}

export function applyDecisionImpact(
  metrics: DisasterMetric[],
  actionName: string,
  isCorrect: boolean
): { updatedMetrics: DisasterMetric[]; logMessages: string[] } {
  const updatedMetrics = metrics.map(m => ({ ...m }));
  const logMessages: string[] = [];

  const matchedMaps = floodActionImpactMap.filter(map =>
    map.actionKeywords.some(keyword => actionName.includes(keyword))
  );

  if (matchedMaps.length === 0) {
    const defaultImpact = isCorrect ? 2 : -2;
    updatedMetrics.forEach(m => {
      const impact = isCorrect ? defaultImpact : defaultImpact;
      m.currentValue = clampValue(m.currentValue + impact, m.minValue, m.maxValue);
      m.status = computeStatus(m.currentValue, m.safeRange, m.warningRange, m.criticalRange);
      m.trend = computeTrend(m.currentValue, m.currentValue - impact);
    });
    logMessages.push(isCorrect ? '✓ 决策正确，整体应急能力提升' : '⚠ 决策有误，整体应急能力下降');
    return { updatedMetrics, logMessages };
  }

  for (const actionMap of matchedMaps) {
    for (const impact of actionMap.impacts) {
      const metric = updatedMetrics.find(m => m.id === impact.metricId);
      if (!metric) continue;

      const delta = isCorrect ? impact.correctImpact : impact.wrongImpact;
      const oldValue = metric.currentValue;
      metric.currentValue = clampValue(metric.currentValue + delta, metric.minValue, metric.maxValue);
      metric.status = computeStatus(metric.currentValue, metric.safeRange, metric.warningRange, metric.criticalRange);
      metric.trend = computeTrend(metric.currentValue, oldValue);

      logMessages.push(isCorrect ? impact.logMessage.correct : impact.logMessage.wrong);
    }
  }

  return { updatedMetrics, logMessages };
}

function clampValue(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function getDisasterScore(metrics: DisasterMetric[]): { score: number; maxScore: number } {
  let score = 0;
  let maxScore = 0;

  for (const metric of metrics) {
    maxScore += 100;
    if (metric.status === 'normal') {
      score += 100;
    } else if (metric.status === 'warning') {
      const range = metric.warningRange[1] - metric.warningRange[0];
      const progress = metric.currentValue - metric.warningRange[0];
      score += Math.round(50 + (progress / range) * 50);
    } else {
      const range = metric.criticalRange[1] - metric.criticalRange[0];
      const progress = metric.currentValue - metric.criticalRange[0];
      score += Math.round(Math.max(0, (progress / range) * 50));
    }
  }

  return { score: Math.round(score / maxScore * 100), maxScore: 100 };
}

export function generateMetricEvaluation(metrics: DisasterMetric[]): string {
  const normalCount = metrics.filter(m => m.status === 'normal').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;

  if (criticalCount === 0 && warningCount === 0) {
    return '灾情已完全控制！所有指标处于安全范围，各部门应急响应措施得力，人民群众生命财产安全得到有效保障。';
  }
  if (criticalCount === 0 && warningCount <= 2) {
    return '灾情基本可控，大部分指标处于安全范围。少数指标处于警戒状态，需要持续关注并加强对应部门的应急响应力度。';
  }
  if (criticalCount <= 1) {
    return '灾情部分得到控制，但仍有指标处于危险状态。建议重点加强薄弱环节的应急响应，特别是排水能力和救援力量部署。';
  }
  if (criticalCount <= 3) {
    return '灾情形势严峻，多项关键指标处于危险状态。建议立即升级响应等级，增派救援力量，优先保障人民群众生命安全。';
  }
  return '重大灾害！几乎所有指标处于危险状态，应急响应严重不足。建议立即启动最高级别响应，请求上级支援，全力保障人民生命安全。';
}