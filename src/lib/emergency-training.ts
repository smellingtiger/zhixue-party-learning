export interface EmergencyRole {
  id: string;
  name: string;
  department: string;
  description: string;
  requiredScenarios?: string[];
}

export interface DisasterScenario {
  id: string;
  name: string;
  type: string;
  level: string;
  levelName: string;
  description: string;
  situation: string;
}

export const roles: EmergencyRole[] = [
  { id: 'mayor', name: '市长', department: '市防汛指挥部', description: '统筹调度全市应急响应', requiredScenarios: ['flood', 'earthquake', 'typhoon'] },
  { id: 'emergency', name: '应急局长', department: '应急管理局', description: '应急救援力量建设、物资调拨', requiredScenarios: ['flood', 'earthquake', 'typhoon', 'fire'] },
  { id: 'police', name: '公安局长', department: '公安局', description: '交通疏导、现场警戒、治安维护', requiredScenarios: ['flood', 'earthquake', 'typhoon', 'fire'] },
  { id: 'health', name: '卫健委主任', department: '卫健委', description: '医疗救治、灾区疾病预防', requiredScenarios: ['flood', 'earthquake', 'typhoon', 'fire'] },
  { id: 'meteorology', name: '气象局长', department: '气象局', description: '降雨预报、气象预警', requiredScenarios: ['flood', 'typhoon'] },
  { id: 'transport', name: '交通局长', department: '交通局', description: '交通管制、公交线路调整', requiredScenarios: ['flood', 'earthquake', 'typhoon'] },
  { id: 'urban', name: '城管局长', department: '城管局', description: '排涝设施管理、管网疏通', requiredScenarios: ['flood', 'typhoon'] },
  { id: 'fire', name: '消防队长', department: '消防队', description: '现场救援、人员疏散', requiredScenarios: ['fire', 'earthquake'] },
];

export const disasterScenarios: DisasterScenario[] = [
  { id: 'flood', name: '城市内涝', type: '洪水', level: 'III', levelName: 'III级响应', description: '城区出现持续强降雨，多处道路积水', situation: '主干道积水深度达50cm，部分区域电力中断' },
  { id: 'earthquake', name: '地震应急', type: '地震', level: 'II', levelName: 'II级响应', description: '发生6.0级地震，部分建筑受损', situation: '多处房屋出现裂缝，通信部分中断，需要紧急排查' },
  { id: 'typhoon', name: '台风防御', type: '台风', level: 'II', levelName: 'II级响应', description: '强台风登陆，风力达12级', situation: '多地出现树木倒伏，部分区域停电，沿海地区潮位上涨' },
  { id: 'fire', name: '森林火灾', type: '森林火灾', level: 'III', levelName: 'III级响应', description: '山区发生森林火灾，火势蔓延', situation: '过火面积约200亩，风向变化导致火势向居民区蔓延' },
];

export function getRoleById(id: string): EmergencyRole | undefined {
  return roles.find(r => r.id === id);
}

export function getRequiredRoles(scenarioId: string): EmergencyRole[] {
  const scenario = disasterScenarios.find(s => s.id === scenarioId);
  if (!scenario) return roles.slice(0, 4);
  return roles.filter(r => r.requiredScenarios?.includes(scenarioId)).slice(0, 4);
}
