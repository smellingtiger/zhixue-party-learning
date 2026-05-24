export interface Character {
  id: string;
  name: string;
  title: string;
  level: 'decision' | 'core' | 'collab';
  levelName: string;
  avatar: string;
  personality: string;
  speakingStyle: string;
  color: string;
  description: string;
}

export const characters: Character[] = [
  {
    id: 'mayor',
    name: '张明',
    title: '市长（指挥长）',
    level: 'decision',
    levelName: '决策层',
    avatar: '👔',
    personality: '沉稳、果断、大局观强',
    speakingStyle: '指令明确，简明扼要，强调统筹协调',
    color: 'from-red-500 to-red-600',
    description: '市防汛指挥部指挥长，负责统筹调度全市应急响应工作'
  },
  {
    id: 'vice-mayor',
    name: '李强',
    title: '副市长（副指挥长）',
    level: 'decision',
    levelName: '决策层',
    avatar: '🎖️',
    personality: '专业、细致、执行力强',
    speakingStyle: '指令具体，注重细节，强调监测预警',
    color: 'from-orange-500 to-orange-600',
    description: '市防汛指挥部副指挥长，协助市长协调调度防汛行动'
  },
  {
    id: 'emergency-bureau',
    name: '王刚',
    title: '市应急局局长',
    level: 'core',
    levelName: '核心执行层',
    avatar: '🚨',
    personality: '经验丰富、反应迅速、协调能力强',
    speakingStyle: '强调信息畅通、物资保障、队伍协调',
    color: 'from-yellow-500 to-yellow-600',
    description: '负责应急救援力量建设、物资调拨、灾情评估'
  },
  {
    id: 'urban-management',
    name: '赵军',
    title: '市城管局局长',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '🏗️',
    personality: '实干型、一线经验丰富',
    speakingStyle: '强调排水管网、道路巡查、清淤疏通',
    color: 'from-blue-500 to-blue-600',
    description: '负责市区排涝设施管理、管网疏通、积水抽排'
  },
  {
    id: 'traffic-bureau',
    name: '刘伟',
    title: '市交通局局长',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '🚗',
    personality: '果断、安全意识强',
    speakingStyle: '强调交通管制、公交绕行、运输保障',
    color: 'from-green-500 to-green-600',
    description: '负责交通管制、公交线路调整、抢险运输保障'
  },
  {
    id: 'public-security',
    name: '陈勇',
    title: '市公安局局长',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '👮',
    personality: '威严、反应迅速、维护秩序',
    speakingStyle: '强调治安维护、交通疏导、人员转移',
    color: 'from-indigo-500 to-indigo-600',
    description: '负责交通疏导、现场警戒、治安维护、人员转移'
  },
  {
    id: 'health-commission',
    name: '周敏',
    title: '市卫健委主任',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '🏥',
    personality: '专业、关怀、严谨',
    speakingStyle: '强调医疗救治、疾病预防、卫生保障',
    color: 'from-pink-500 to-pink-600',
    description: '负责医疗救治队伍组建、灾区疾病预防'
  },
  {
    id: 'meteorology-bureau',
    name: '孙磊',
    title: '市气象局局长',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '🌧️',
    personality: '科学、精准、预警及时',
    speakingStyle: '强调雨情监测、预警发布、数据支撑',
    color: 'from-cyan-500 to-cyan-600',
    description: '负责降雨预报、气象预警、雨情监测'
  },
  {
    id: 'subdistrict',
    name: '吴涛',
    title: '属地街道办主任',
    level: 'collab',
    levelName: '协作执行层',
    avatar: '🏘️',
    personality: '熟悉基层、执行力强、群众工作经验丰富',
    speakingStyle: '强调社区通知、隐患排查、群众转移',
    color: 'from-purple-500 to-purple-600',
    description: '负责信息上报、社区通知、隐患排查、脆弱群体转移'
  }
];

export interface Scenario {
  id: string;
  level: string;
  levelName: string;
  color: string;
  icon: string;
  title: string;
  description: string;
  trigger: string;
  background: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'iv-level',
    level: 'IV',
    levelName: 'IV级响应',
    color: 'bg-blue-500',
    icon: '🔵',
    title: '蓝色预警',
    description: '城区内出现持续强降雨',
    trigger: '1小时降雨量≥30mm，主干道积水深度≥30cm且持续20分钟',
    background: '气象局发布蓝色预警，需启动IV级响应'
  },
  {
    id: 'iii-level',
    level: 'III',
    levelName: 'III级响应',
    color: 'bg-yellow-500',
    icon: '🟡',
    title: '黄色预警',
    description: '出现较大汛情',
    trigger: '多处道路积水深度≥40cm，影响交通通行',
    background: '响应升级，防汛形势加剧'
  },
  {
    id: 'ii-level',
    level: 'II',
    levelName: 'II级响应',
    color: 'bg-orange-500',
    icon: '🟠',
    title: '橙色预警',
    description: '出现重大汛情',
    trigger: '大面积积水，交通瘫痪风险',
    background: '响应升级至重大级别'
  },
  {
    id: 'i-level',
    level: 'I',
    levelName: 'I级响应',
    color: 'bg-red-500',
    icon: '🔴',
    title: '红色预警',
    description: '出现特大汛情',
    trigger: '极端降雨，城市内涝严重',
    background: '最高级别响应'
  }
];

export function getCharacter(id: string): Character | undefined {
  return characters.find(c => c.id === id);
}

export function getCharactersByLevel(): Record<string, Character[]> {
  return {
    '决策层': characters.filter(c => c.level === 'decision'),
    '核心执行层': characters.filter(c => c.level === 'core'),
    '协作执行层': characters.filter(c => c.level === 'collab')
  };
}
