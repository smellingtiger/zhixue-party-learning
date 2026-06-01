/**
 * AI智能体系统
 * 模拟多个应急角色进行思考和决策
 */

import { availableRoles, getRoleById, getScenarioById, getRequiredRoles, type Role, type RoleDutyDetail } from './emergency-training-new';
import type { DecisionRoleMapping } from './wuhan-waterlogging-case';

// AI智能体角色
export interface AIAgent {
  role: Role;
  personality: string;
  speakingStyle: string;
  concerns: string[];
  priorities: string[];
}

// 智能体发言
export interface AgentMessage {
  agentId: string;
  agentName: string;
  agentDepartment: string;
  message: string;
  emotion: 'calm' | 'urgent' | 'worried' | 'confident' | 'concerned';
  timestamp: number;
  action?: string; // 该角色建议的行动
  location?: { lat: number; lng: number; label?: string; zoom?: number }; // 关联的地图坐标
}

// 智能体对方案的评估
export interface AgentPlanEvaluation {
  agentId: string;
  agentName: string;
  evaluation: string;
  supportLevel: 'strong_support' | 'support' | 'neutral' | 'oppose' | 'strong_oppose';
  concerns: string[];
  suggestions: string[];
}

// 创建智能体
export function createAgent(roleId: string): AIAgent | null {
  const role = getRoleById(roleId);
  if (!role) return null;

  const personalities: Record<string, string> = {
    'mayor': '沉稳果断，注重全局和民生',
    'vice-mayor': '务实高效，善于协调各部门',
    'emergency-bureau': '专业严谨，重视预案执行',
    'urban-management': '吃苦耐劳，熟悉城市设施',
    'traffic-bureau': '细致周到，关注交通畅通',
    'police-bureau': '雷厉风行，重视秩序维护',
    'health-bureau': '仁心仁术，生命至上',
    'weather-bureau': '科学客观，数据说话',
    'street-office': '贴近群众，了解基层',
    'housing-bureau': '注重安全，防范风险',
    'natural-resources': '敬畏自然，重视预警',
    'telecom': '技术导向，保障通信',
    'power-company': '责任重大，保障供电',
    'armed-police': '英勇果敢，执行力强',
    'water-bureau': '专业精深，熟悉水利',
  };

  const speakingStyles: Record<string, string> = {
    'mayor': '以"我要求""必须确保"等指令性语言为主',
    'vice-mayor': '以"建议""协调""督促"等协商性语言为主',
    'emergency-bureau': '以"根据预案""数据显示"等专业性语言为主',
    'urban-management': '以"现场情况""设备状态"等实操性语言为主',
    'traffic-bureau': '以"路况信息""通行能力"等分析性语言为主',
    'police-bureau': '以"秩序维护""治安保障"等权威性语言为主',
    'health-bureau': '以"伤员情况""医疗资源"等关切性语言为主',
    'weather-bureau': '以"监测数据""预报趋势"等科学性语言为主',
    'street-office': '以"群众反映""社区情况"等基层性语言为主',
    'housing-bureau': '以"建筑安全""工程状态"等评估性语言为主',
    'natural-resources': '以"地质风险""次生灾害"等预警性语言为主',
    'telecom': '以"网络状态""通信保障"等技术性语言为主',
    'power-company': '以"供电能力""设备运行"等保障性语言为主',
    'armed-police': '以"兵力部署""执行任务"等军事性语言为主',
    'water-bureau': '以"水位监测""泄洪调度"等专业性语言为主',
  };

  return {
    role,
    personality: personalities[roleId] || '专业负责',
    speakingStyle: speakingStyles[roleId] || '客观理性',
    concerns: getAgentConcerns(roleId),
    priorities: getAgentPriorities(roleId),
  };
}

// 获取角色的关切点
function getAgentConcerns(roleId: string): string[] {
  const concerns: Record<string, string[]> = {
    'mayor': ['人民群众生命安全', '城市正常运转', '社会稳定', '政府形象'],
    'vice-mayor': ['各部门协调效率', '资源调配合理性', '上级指示落实', '灾情发展趋势'],
    'emergency-bureau': ['预案执行到位率', '信息传递及时性', '物资储备充足性', '值班人员在岗率'],
    'urban-management': ['排水设施运行状态', '积水点处置效率', '设备人员安全', '市政设施损坏'],
    'traffic-bureau': ['道路通行能力', '公交运营安全', '抢险通道畅通', '群众出行需求'],
    'police-bureau': ['交通秩序维护', '社会治安稳定', '群众疏散组织', '重点区域管控'],
    'health-bureau': ['伤员救治及时性', '医疗资源充足性', '防疫措施落实', '医护人员安全'],
    'weather-bureau': ['预报准确性', '监测数据连续性', '预警信息发布', '极端天气研判'],
    'street-office': ['群众转移安置', '脆弱群体关怀', '社区秩序维护', '信息上传下达'],
    'housing-bureau': ['建筑结构安全', '在建工程风险', '危房人员撤离', '工程抢险安全'],
    'natural-resources': ['地质灾害隐患', '次生灾害风险', '监测预警发布', '安置点选址安全'],
    'telecom': ['通信网络畅通', '应急通信保障', '基站设备安全', '指挥系统运行'],
    'power-company': ['电网安全稳定', '关键设施供电', '涉水区域断电', '抢修人员安全'],
    'armed-police': ['受困群众救援', '兵力部署合理', '抢险任务执行', '官兵自身安全'],
    'water-bureau': ['水库河道安全', '泄洪调度执行', '堤防巡查维护', '洪水预警发布'],
  };
  return concerns[roleId] || ['任务完成质量', '人员安全保障'];
}

// 获取角色的优先事项
function getAgentPriorities(roleId: string): string[] {
  const priorities: Record<string, string[]> = {
    'mayor': ['人民生命安全第一', '快速控制灾情', '维护社会稳定', '保障基本民生'],
    'vice-mayor': ['高效协调各部门', '精准调配资源', '及时上报灾情', '督促措施落实'],
    'emergency-bureau': ['严格执行预案', '确保信息畅通', '统筹物资调配', '强化值班值守'],
    'urban-management': ['快速排除积水', '保障排水畅通', '维护市政设施', '确保作业安全'],
    'traffic-bureau': ['保障抢险通道', '维护交通秩序', '确保公交安全', '发布出行信息'],
    'police-bureau': ['维护治安秩序', '保障交通畅通', '协助群众转移', '管控重点区域'],
    'health-bureau': ['救治伤员生命', '保障医疗资源', '落实防疫措施', '保护医护人员'],
    'weather-bureau': ['精准监测预报', '及时发布预警', '提供决策支撑', '保障数据连续'],
    'street-office': ['转移安置群众', '关怀脆弱群体', '维护社区秩序', '及时上报信息'],
    'housing-bureau': ['评估建筑安全', '撤离危房人员', '保障工程安全', '组织抢险修复'],
    'natural-resources': ['监测地质灾害', '评估次生风险', '发布预警信息', '保障选址安全'],
    'telecom': ['保障通信畅通', '抢修受损设施', '支撑指挥系统', '确保网络安全'],
    'power-company': ['保障电网安全', '恢复受损供电', '确保关键供电', '执行安全断电'],
    'armed-police': ['救援受困群众', '执行抢险任务', '维护社会秩序', '保障官兵安全'],
    'water-bureau': ['监测水库河道', '执行泄洪调度', '巡查堤防安全', '发布洪水预警'],
  };
  return priorities[roleId] || ['完成任务', '保障安全'];
}

// 生成智能体对当前情况的分析发言
export function generateAgentAnalysis(
  agent: AIAgent,
  situation: string,
  decisionIndex: number
): AgentMessage {
  const role = agent.role;
  
  // 根据角色和情况生成发言
  let message = '';
  let emotion: AgentMessage['emotion'] = 'calm';
  let action = '';

  switch (role.id) {
    case 'mayor':
      message = `当前${situation}，形势严峻。我要求各部门立即进入应急状态，把人民群众生命安全放在第一位。${agent.priorities[0]}，不能有丝毫懈怠。`;
      emotion = 'urgent';
      action = '启动最高级别响应，全面动员';
      break;
    case 'vice-mayor':
      message = `根据现场反馈，${situation}。建议立即协调相关部门，按照预案要求落实各项措施。我会督促各单位到位履职。`;
      emotion = 'concerned';
      action = '协调各部门按预案执行';
      break;
    case 'emergency-bureau':
      message = `应急指挥中心报告：${situation}。已通知各成员单位到岗值班，物资储备充足，随时可以调拨。建议立即启动响应程序。`;
      emotion = 'confident';
      action = '启动应急响应，调度物资';
      break;
    case 'urban-management':
      message = `城管部门报告：${situation}。排水设施正在全力运转，但雨量过大，部分泵站已接近满负荷。建议增派移动排涝设备。`;
      emotion = 'worried';
      action = '增派排涝设备，疏通排水通道';
      break;
    case 'traffic-bureau':
      message = `交通部门监测：${situation}。多条主干道通行受阻，建议立即发布交通管制公告，引导车辆绕行，确保抢险通道畅通。`;
      emotion = 'concerned';
      action = '实施交通管制，发布绕行提示';
      break;
    case 'police-bureau':
      message = `公安部门报告：${situation}。已增派警力维持秩序，建议对积水严重路段实施封控，防止车辆涉水熄火造成更大拥堵。`;
      emotion = 'urgent';
      action = '实施路段封控，维持治安秩序';
      break;
    case 'health-bureau':
      message = `卫健部门报告：${situation}。医疗救援队伍已待命，建议预置医疗资源，做好批量伤员救治准备，同时防范灾后疫情。`;
      emotion = 'concerned';
      action = '预置医疗资源，准备伤员救治';
      break;
    case 'weather-bureau':
      message = `气象部门监测：${situation}。根据雷达回波分析，降雨还将持续，建议加密监测频次，及时发布预警信息。`;
      emotion = 'calm';
      action = '加密监测，发布精准预报';
      break;
    case 'street-office':
      message = `街道办报告：${situation}。社区已组织网格员排查，低洼区域有群众需要转移，建议尽快安排安置点。`;
      emotion = 'worried';
      action = '组织群众转移，安排安置点';
      break;
    case 'housing-bureau':
      message = `住建部门报告：${situation}。已组织专家对建筑安全进行评估，建议对危房区域人员实施强制撤离。`;
      emotion = 'concerned';
      action = '评估建筑安全，撤离危房人员';
      break;
    case 'natural-resources':
      message = `自然资源部门报告：${situation}。地质灾害风险较高，建议加密监测，对隐患点发布预警，防范次生灾害。`;
      emotion = 'worried';
      action = '加密地质灾害监测，发布预警';
      break;
    case 'telecom':
      message = `通信部门报告：${situation}。通信网络目前正常，已调派应急通信车待命，建议保障指挥通信畅通。`;
      emotion = 'calm';
      action = '保障通信畅通，调派应急通信车';
      break;
    case 'power-company':
      message = `供电部门报告：${situation}。已对涉水区域实施断电避险，建议保障医院、指挥中心等关键设施供电。`;
      emotion = 'concerned';
      action = '保障关键设施供电，执行安全断电';
      break;
    case 'armed-police':
      message = `武警部队报告：${situation}。官兵已集结完毕，携带救援装备待命，随时可以投入抢险救援。`;
      emotion = 'confident';
      action = '投入抢险救援，转移受困群众';
      break;
    case 'water-bureau':
      message = `水利部门报告：${situation}。水库水位正在上涨，建议执行泄洪调度，同时加强堤防巡查。`;
      emotion = 'worried';
      action = '执行泄洪调度，加强堤防巡查';
      break;
    default:
      message = `${role.name}报告：${situation}。已按预案要求落实各项措施。`;
      emotion = 'calm';
      action = '按预案执行';
  }

  return {
    agentId: role.id,
    agentName: role.name,
    agentDepartment: role.department,
    message,
    emotion,
    timestamp: Date.now(),
    action,
  };
}

// 生成智能体对方案的评估
export function generateAgentPlanEvaluation(
  agent: AIAgent,
  planDescription: string,
  planActions: string[]
): AgentPlanEvaluation {
  const role = agent.role;
  const concerns = agent.concerns;
  
  let evaluation = '';
  let supportLevel: AgentPlanEvaluation['supportLevel'] = 'neutral';
  const agentConcerns: string[] = [];
  const suggestions: string[] = [];

  // 根据角色特点评估方案
  if (role.id === 'mayor' || role.id === 'vice-mayor') {
    evaluation = `从全局角度看，该方案${planDescription}。需要重点关注各部门协调效率和资源调配合理性。`;
    supportLevel = 'support';
    agentConcerns.push('各部门协调是否顺畅', '资源调配是否充足');
    suggestions.push('建立统一指挥体系', '明确各部门职责分工');
  } else if (role.id === 'emergency-bureau') {
    evaluation = `从应急专业角度，该方案${planDescription}。需要评估预案执行的可行性和信息传递的及时性。`;
    supportLevel = 'support';
    agentConcerns.push('预案执行是否到位', '信息传递是否及时');
    suggestions.push('严格执行预案流程', '建立信息快报机制');
  } else if (role.id === 'health-bureau') {
    evaluation = `从医疗卫生角度，该方案${planDescription}。需要重点关注伤员救治和防疫措施。`;
    supportLevel = planActions.some(a => a.includes('医疗') || a.includes('救治')) ? 'support' : 'oppose';
    agentConcerns.push('医疗资源是否充足', '防疫措施是否落实');
    suggestions.push('预置医疗救援力量', '做好防疫消杀准备');
  } else if (role.id === 'police-bureau') {
    evaluation = `从治安维护角度，该方案${planDescription}。需要确保社会秩序稳定和交通管控有效。`;
    supportLevel = planActions.some(a => a.includes('管制') || a.includes('秩序')) ? 'support' : 'neutral';
    agentConcerns.push('治安秩序是否稳定', '交通管控是否有效');
    suggestions.push('增派警力维持秩序', '实施有效交通管制');
  } else {
    evaluation = `${role.name}认为该方案${planDescription}。需要结合实际情况评估可行性。`;
    supportLevel = 'neutral';
    agentConcerns.push(...concerns.slice(0, 2));
    suggestions.push('根据实际情况调整方案', '加强部门协调配合');
  }

  return {
    agentId: role.id,
    agentName: role.name,
    evaluation,
    supportLevel,
    concerns: agentConcerns,
    suggestions,
  };
}

// 获取决策点相关的智能体
export function getDecisionAgents(decisionMapping: DecisionRoleMapping): AIAgent[] {
  return decisionMapping.requiredRoles
    .map(roleId => createAgent(roleId))
    .filter((agent): agent is AIAgent => agent !== null);
}

// 生成智能体会议讨论
export function generateAgentMeeting(
  decisionMapping: DecisionRoleMapping,
  userPlan?: string
): AgentMessage[] {
  const agents = getDecisionAgents(decisionMapping);
  const messages: AgentMessage[] = [];

  // 主持人开场
  const hostAgent = agents.find(a => a.role.id === 'mayor') || agents.find(a => a.role.id === 'vice-mayor') || agents[0];
  if (hostAgent) {
    messages.push({
      agentId: hostAgent.role.id,
      agentName: hostAgent.role.name,
      agentDepartment: hostAgent.role.department,
      message: `各位同志，当前情况：${decisionMapping.situation}。请大家根据职责分工，汇报各自掌握的情况和建议。`,
      emotion: 'urgent',
      timestamp: Date.now(),
      action: '召集会议，听取汇报',
    });
  }

  // 各智能体汇报
  agents.forEach((agent, index) => {
    const analysis = generateAgentAnalysis(agent, decisionMapping.situation, decisionMapping.decisionIndex);
    // 添加延迟效果
    setTimeout(() => {
      messages.push(analysis);
    }, index * 1000);
  });

  // 如果有用户方案，AI参谋进行点评
  if (userPlan) {
    messages.push({
      agentId: 'ai-advisor',
      agentName: 'AI作战参谋',
      agentDepartment: '智能决策支持',
      message: `收到指挥员方案："${userPlan}"。正在分析方案可行性...根据当前情况和各成员单位反馈，该方案${evaluateUserPlan(userPlan, agents)}`,
      emotion: 'calm',
      timestamp: Date.now() + agents.length * 1000,
      action: '分析用户方案，提供决策建议',
    });
  }

  return messages;
}

// 评估用户自定义方案
function evaluateUserPlan(userPlan: string, agents: AIAgent[]): string {
  // 简单的关键词匹配评估
  const planLower = userPlan.toLowerCase();
  
  let evaluation = '';
  
  // 检查是否包含关键要素
  const hasEvacuation = planLower.includes('转移') || planLower.includes('疏散') || planLower.includes('撤离');
  const hasRescue = planLower.includes('救援') || planLower.includes('搜救') || planLower.includes('抢险');
  const hasMedical = planLower.includes('医疗') || planLower.includes('救治') || planLower.includes('伤员');
  const hasTraffic = planLower.includes('交通') || planLower.includes('管制') || planLower.includes('封控');
  const hasCommunication = planLower.includes('通信') || planLower.includes('信息') || planLower.includes('上报');

  const score = [hasEvacuation, hasRescue, hasMedical, hasTraffic, hasCommunication].filter(Boolean).length;

  if (score >= 4) {
    evaluation = '考虑较为全面，涵盖了人员转移、救援、医疗、交通等关键要素。建议立即执行，同时注意各部门协调配合。';
  } else if (score >= 2) {
    evaluation = '有一定可行性，但建议补充以下方面：' + 
      (!hasEvacuation ? '人员转移安置、' : '') +
      (!hasRescue ? '抢险救援力量、' : '') +
      (!hasMedical ? '医疗救治准备、' : '') +
      (!hasTraffic ? '交通管制措施、' : '') +
      (!hasCommunication ? '信息通信保障、' : '');
    evaluation = evaluation.slice(0, -1) + '。';
  } else {
    evaluation = '考虑不够全面，建议参考各成员单位的汇报情况，补充完善人员转移、抢险救援、医疗救治、交通管制等关键措施。';
  }

  return evaluation;
}

// 导出所有可用角色
export { availableRoles, getRoleById, getScenarioById, getRequiredRoles };
export type { Role, RoleDutyDetail };
