/**
 * 上帝AI推演引擎
 * 根据所有角色的行动自动生成事件、结局并在地图上进行演示
 */

import type { AIAgent, AgentMessage } from './ai-agents';
import type { DecisionRoleMapping } from './wuhan-waterlogging-case';
import { getDutiesByScenario, type RoleDutyDetail } from './emergency-training-new';

// 推演事件
export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'critical' | 'success' | 'failure';
  title: string;
  description: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  relatedRoles: string[];
  cause?: string;
  effect?: string[];
  mapAction?: MapEventAction;
}

// 地图事件动作
export interface MapEventAction {
  type: 'move' | 'deploy' | 'rescue' | 'evacuate' | 'alert' | 'damage' | 'gather';
  from?: { lat: number; lng: number; name?: string };
  to?: { lat: number; lng: number; name?: string };
  targetName?: string;
  resourceName?: string;
  count?: number;
  status?: 'start' | 'ongoing' | 'complete';
}

// 推演结局
export interface SimulationOutcome {
  success: boolean;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  casualties: {
    deaths: number;
    injuries: number;
    missing: number;
    evacuated: number;
  };
  statistics: {
    responseTime: number;
    resourceUtilization: number;
    coordinationScore: number;
    publicSatisfaction: number;
  };
  keyEvents: string[];
  lessons: string[];
  rolePerformance: Array<{
    roleId: string;
    roleName: string;
    score: number;
    comment: string;
  }>;
}

// 角色行动记录
export interface RoleAction {
  roleId: string;
  roleName: string;
  action: string;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

// 推演状态
export interface SimulationState {
  phase: 'briefing' | 'executing' | 'evaluating' | 'completed';
  currentTime: string;
  weatherCondition: string;
  waterLevel: number;
  affectedAreas: string[];
  deployedResources: string[];
  ongoingEvents: SimulationEvent[];
}

// 生成唯一ID
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 上帝AI推演引擎主类
export class GodAIEngine {
  private actions: RoleAction[] = [];
  private events: SimulationEvent[] = [];
  private state: SimulationState;
  private decisionMapping: DecisionRoleMapping;
  private userRole: string | null = null;
  private scenarioId: string;

  constructor(
    decisionMapping: DecisionRoleMapping,
    scenarioId: string = 'urban-waterlogging-1',
    userRole: string | null = null
  ) {
    this.decisionMapping = decisionMapping;
    this.userRole = userRole;
    this.scenarioId = scenarioId;
    this.state = {
      phase: 'briefing',
      currentTime: '14:00',
      weatherCondition: '暴雨蓝色预警',
      waterLevel: 15,
      affectedAreas: [],
      deployedResources: [],
      ongoingEvents: [],
    };
  }

  // 记录角色行动
  recordAction(action: RoleAction) {
    this.actions.push(action);
  }

  // 获取已记录的行动
  getActions(): RoleAction[] {
    return [...this.actions];
  }

  // 获取当前状态
  getState(): SimulationState {
    return { ...this.state };
  }

  // 分析行动依赖关系，检测缺失的关键行动
  private analyzeActionGaps(): Array<{ required: string; missingBy: string[]; consequence: string }> {
    const gaps: Array<{ required: string; missingBy: string[]; consequence: string }> = [];
    
    const dutyMap = getDutiesByScenario(this.scenarioId);
    if (!dutyMap) return gaps;

    // 检查每个角色的核心职责是否被覆盖
    dutyMap.duties.forEach(duty => {
      const roleActions = this.actions.filter(a => a.roleId === duty.roleId);
      const hasCoreAction = duty.specificActions.some(coreAction => 
        roleActions.some(ra => 
          coreAction.includes(ra.action) || ra.action.includes(coreAction.slice(0, 6))
        )
      );

      if (!hasCoreAction && roleActions.length === 0) {
        gaps.push({
          required: duty.coreResponsibility,
          missingBy: [duty.roleId],
          consequence: this.generateConsequence(duty.roleId, duty.coreResponsibility),
        });
      }
    });

    // 检查关键协同关系
    const hasWaterMonitoring = this.actions.some(a => 
      a.roleId === 'water-bureau' && (a.action.includes('监测') || a.action.includes('水位'))
    );
    const hasEvacuation = this.actions.some(a => 
      a.action.includes('转移') || a.action.includes('疏散')
    );

    if (!hasWaterMonitoring && this.scenarioId.includes('waterlogging')) {
      gaps.push({
        required: '水利局监测水位和河道情况',
        missingBy: ['water-bureau'],
        consequence: '无法准确掌握水位变化趋势，排水调度缺乏数据支撑，可能导致排涝时机延误',
      });
    }

    if (this.state.waterLevel > 50 && !hasEvacuation) {
      gaps.push({
        required: '组织人员转移疏散',
        missingBy: ['street-office', 'police-bureau', 'armed-police'],
        consequence: '积水持续加深，低洼区域群众受困风险急剧上升，可能出现人员伤亡',
      });
    }

    return gaps;
  }

  // 生成缺失行动的后果
  private generateConsequence(roleId: string, responsibility: string): string {
    const consequences: Record<string, string[]> = {
      'water-bureau': [
        '水库泄洪调度延误，下游洪峰压力增大',
        '无法提供准确水位数据，指挥部决策缺乏依据',
        '堤防巡查不到位，可能出现管涌等险情',
      ],
      'weather-bureau': [
        '降雨趋势判断不准确，预警信息发布滞后',
        '短临预报缺失，各部门应对措施准备不足',
        '极端天气研判失误，灾情评估偏差',
      ],
      'health-bureau': [
        '医疗救援力量部署延迟，伤员救治不及时',
        '防疫措施落实不到位，灾后疫情风险升高',
        '临时医疗站设置滞后，安置点医疗保障不足',
      ],
      'traffic-bureau': [
        '交通管制措施不到位，抢险通道受阻',
        '公交调整公告发布滞后，群众出行混乱',
        '受损道路抢修不及时，救援车辆无法通行',
      ],
      'police-bureau': [
        '治安秩序维护不力，灾区可能出现哄抢',
        '交通管制执行不严，救援车辆通行受阻',
        '群众疏散组织混乱，易发生踩踏事故',
      ],
      'urban-management': [
        '排涝作业启动延迟，积水消退缓慢',
        '排水设施维护不到位，泵站故障频发',
        '市政设施损坏扩大，次生灾害风险增加',
      ],
      'street-office': [
        '社区通知覆盖不全，部分群众未及时避险',
        '脆弱群体摸排不到位，孤寡老人可能受困',
        '信息上传下达不畅，基层情况掌握不全',
      ],
      'emergency-bureau': [
        '应急指挥调度混乱，各部门各自为战',
        '物资调配不及时，一线救援缺乏保障',
        '信息汇总滞后，指挥部决策依据不足',
      ],
    };

    const roleConsequences = consequences[roleId] || [
      '该岗位职责落实不到位，影响整体应急响应效率',
      '部门间协调出现断层，信息传递受阻',
      '应急处置出现盲区，风险隐患未能及时发现',
    ];

    return roleConsequences[Math.floor(Math.random() * roleConsequences.length)];
  }

  // 生成推演事件链
  generateEventChain(): SimulationEvent[] {
    const gaps = this.analyzeActionGaps();
    const events: SimulationEvent[] = [];
    const baseTime = Date.now();

    // 1. 初始状态事件
    events.push({
      id: generateId(),
      timestamp: baseTime,
      type: 'info',
      title: '推演开始',
      description: `${this.decisionMapping.situation}，各成员单位开始响应。`,
      relatedRoles: this.decisionMapping.requiredRoles,
    });

    // 2. 根据已执行的行动生成正面事件
    this.actions.forEach((action, idx) => {
      const event = this.actionToEvent(action, baseTime + (idx + 1) * 60000);
      if (event) events.push(event);
    });

    // 3. 根据缺失的行动生成负面事件
    gaps.forEach((gap, idx) => {
      events.push({
        id: generateId(),
        timestamp: baseTime + (this.actions.length + idx + 1) * 60000,
        type: 'warning',
        title: '响应缺口 detected',
        description: `【${gap.missingBy.map(id => this.getRoleName(id)).join('、')}】未落实${gap.required}，${gap.consequence}`,
        relatedRoles: gap.missingBy,
        cause: `缺少${gap.required}`,
        effect: [gap.consequence],
        mapAction: {
          type: 'alert',
          targetName: '风险区域',
          status: 'ongoing',
        },
      });
    });

    // 4. 生成连锁反应事件
    const chainEvents = this.generateChainEvents(events, baseTime + (events.length + 1) * 60000);
    events.push(...chainEvents);

    // 5. 更新状态
    this.events = events;
    this.state.ongoingEvents = events.filter(e => !e.mapAction?.status || e.mapAction.status === 'ongoing');

    return events;
  }

  // 将单个行动转换为事件
  private actionToEvent(action: RoleAction, timestamp: number): SimulationEvent | null {
    const roleName = this.getRoleName(action.roleId);
    
    // 根据行动类型确定事件类型和地图动作
    let type: SimulationEvent['type'] = 'info';
    let mapAction: MapEventAction | undefined;

    if (action.action.includes('救援') || action.action.includes('搜救')) {
      type = 'success';
      mapAction = {
        type: 'rescue',
        resourceName: roleName,
        status: 'start',
      };
    } else if (action.action.includes('转移') || action.action.includes('疏散')) {
      type = 'success';
      mapAction = {
        type: 'evacuate',
        resourceName: roleName,
        count: Math.floor(Math.random() * 500) + 100,
        status: 'start',
      };
    } else if (action.action.includes('管制') || action.action.includes('封控')) {
      type = 'info';
      mapAction = {
        type: 'alert',
        targetName: '管制路段',
        status: 'start',
      };
    } else if (action.action.includes('监测') || action.action.includes('巡查')) {
      type = 'info';
      mapAction = {
        type: 'deploy',
        resourceName: '监测队伍',
        status: 'start',
      };
    } else if (action.action.includes('排涝') || action.action.includes('排水')) {
      type = 'success';
      mapAction = {
        type: 'deploy',
        resourceName: '排涝设备',
        status: 'start',
      };
    }

    return {
      id: generateId(),
      timestamp,
      type,
      title: `${roleName}行动`,
      description: `${roleName}执行：${action.action}`,
      relatedRoles: [action.roleId],
      mapAction,
    };
  }

  // 生成连锁反应事件
  private generateChainEvents(existingEvents: SimulationEvent[], baseTimestamp: number): SimulationEvent[] {
    const chainEvents: SimulationEvent[] = [];
    let timestamp = baseTimestamp;

    // 检查是否有水位监测
    const hasWaterMonitoring = this.actions.some(a => a.roleId === 'water-bureau');
    const hasMedical = this.actions.some(a => a.roleId === 'health-bureau');
    const hasTraffic = this.actions.some(a => a.roleId === 'traffic-bureau');
    const hasPolice = this.actions.some(a => a.roleId === 'police-bureau');

    // 如果没有水位监测，生成相关连锁事件
    if (!hasWaterMonitoring && this.scenarioId.includes('waterlogging')) {
      chainEvents.push({
        id: generateId(),
        timestamp: timestamp += 30000,
        type: 'critical',
        title: '水位数据缺失导致调度延误',
        description: '由于没有水利部门的水位监测数据，排水调度缺乏科学依据。泵站未能根据实时水位调整运行功率，导致排涝效率低下，积水持续扩大。',
        relatedRoles: ['water-bureau', 'urban-management'],
        cause: '水利局未开展水位监测',
        effect: ['排涝效率降低40%', '积水面积扩大', '部分区域积水深度超预期'],
        mapAction: {
          type: 'damage',
          targetName: '积水区域',
          status: 'ongoing',
        },
      });
    }

    // 如果没有医疗准备，生成伤员救治延误事件
    if (!hasMedical) {
      const injuryCount = Math.floor(Math.random() * 30) + 10;
      chainEvents.push({
        id: generateId(),
        timestamp: timestamp += 30000,
        type: 'critical',
        title: '医疗救援力量不足',
        description: `卫健部门未预置医疗资源，灾情扩大后出现${injuryCount}名伤员，但现场缺乏急救人员和设备，伤员转运延迟，轻伤员可能转为重伤。`,
        relatedRoles: ['health-bureau'],
        cause: '卫健部门未预置医疗资源',
        effect: [`${injuryCount}名伤员救治延迟`, '医疗资源紧张', '群众恐慌情绪上升'],
        mapAction: {
          type: 'alert',
          targetName: '医院',
          status: 'ongoing',
        },
      });
    }

    // 如果没有交通管制，生成交通混乱事件
    if (!hasTraffic && !hasPolice) {
      chainEvents.push({
        id: generateId(),
        timestamp: timestamp += 30000,
        type: 'warning',
        title: '交通秩序混乱',
        description: '交警和公安部门未及时实施交通管制，积水路段仍有车辆强行通过，导致多辆汽车涉水熄火，救援通道被堵，抢险车辆无法及时到达受灾区域。',
        relatedRoles: ['traffic-bureau', 'police-bureau'],
        cause: '交通管制措施缺失',
        effect: ['救援通道受阻', '车辆涉水事故增加', '抢险力量到达延迟'],
        mapAction: {
          type: 'alert',
          targetName: '主干道',
          status: 'ongoing',
        },
      });
    }

    // 如果有转移行动但没有安置点准备
    const hasEvacuation = this.actions.some(a => a.action.includes('转移') || a.action.includes('疏散'));
    const hasShelter = this.actions.some(a => a.action.includes('安置'));
    if (hasEvacuation && !hasShelter) {
      chainEvents.push({
        id: generateId(),
        timestamp: timestamp += 30000,
        type: 'warning',
        title: '安置点准备不足',
        description: '虽然组织了人员转移，但安置点物资和医疗保障未到位，转移群众在安置点面临饮食、饮水和医疗困难，部分群众自行返回危险区域。',
        relatedRoles: ['street-office', 'health-bureau', 'civil-affairs'],
        cause: '安置点保障措施缺失',
        effect: ['转移群众生活困难', '部分群众回流', '安置点秩序混乱'],
        mapAction: {
          type: 'alert',
          targetName: '安置点',
          status: 'ongoing',
        },
      });
    }

    // 根据响应速度生成额外事件
    const responseSpeed = this.calculateResponseSpeed();
    if (responseSpeed < 0.5) {
      chainEvents.push({
        id: generateId(),
        timestamp: timestamp += 30000,
        type: 'critical',
        title: '响应迟缓导致灾情扩大',
        description: '由于多个部门响应不及时，错失最佳处置窗口期。积水从局部扩散到全域，从可控制演变为难以控制，最终不得不启动更高级别响应。',
        relatedRoles: this.decisionMapping.requiredRoles,
        cause: '响应速度不足',
        effect: ['灾情扩大', '处置成本倍增', '社会影响恶化'],
        mapAction: {
          type: 'damage',
          targetName: '受灾区域',
          status: 'ongoing',
        },
      });
    }

    return chainEvents;
  }

  // 计算响应速度评分
  private calculateResponseSpeed(): number {
    if (this.actions.length === 0) return 0;
    
    const requiredRoleCount = this.decisionMapping.requiredRoles.length;
    const actingRoleCount = new Set(this.actions.map(a => a.roleId)).size;
    
    return Math.min(actingRoleCount / requiredRoleCount, 1);
  }

  // 生成推演结局
  generateOutcome(): SimulationOutcome {
    const gaps = this.analyzeActionGaps();
    const responseSpeed = this.calculateResponseSpeed();
    const hasCriticalGap = gaps.some(g => 
      g.missingBy.includes('water-bureau') || 
      g.missingBy.includes('health-bureau') ||
      g.missingBy.includes('emergency-bureau')
    );

    // 计算各项指标
    const coordinationScore = Math.floor(responseSpeed * 100);
    const resourceUtilization = Math.floor((this.actions.length / Math.max(this.decisionMapping.requiredRoles.length * 2, 1)) * 100);
    
    // 根据缺口和响应速度确定伤亡
    let deaths = Math.floor(Math.random() * 5);
    let injuries = Math.floor(Math.random() * 50) + 10;
    let missing = Math.floor(Math.random() * 5);
    let evacuated = Math.floor(Math.random() * 5000) + 1000;

    if (hasCriticalGap) {
      deaths += Math.floor(Math.random() * 15) + 5;
      injuries += Math.floor(Math.random() * 100) + 50;
      missing += Math.floor(Math.random() * 10) + 3;
    }

    if (responseSpeed < 0.5) {
      deaths += Math.floor(Math.random() * 10) + 3;
      injuries += Math.floor(Math.random() * 80) + 30;
    }

    // 确定评级
    let grade: SimulationOutcome['grade'];
    let success: boolean;
    let summary: string;

    if (responseSpeed > 0.8 && !hasCriticalGap) {
      grade = 'S';
      success = true;
      summary = '各成员单位响应迅速、协同高效，灾情得到有效控制，人员伤亡降至最低。';
    } else if (responseSpeed > 0.6 && gaps.length <= 2) {
      grade = 'A';
      success = true;
      summary = '整体响应较为及时，大部分措施落实到位，灾情基本可控，但个别环节存在改进空间。';
    } else if (responseSpeed > 0.4 && gaps.length <= 4) {
      grade = 'B';
      success = true;
      summary = '响应存在一定延迟，部分措施执行不到位，灾情有所扩大，但最终得到控制。';
    } else if (responseSpeed > 0.3 || gaps.length <= 6) {
      grade = 'C';
      success = false;
      summary = '响应迟缓，多个关键环节缺失，灾情扩大明显，处置效果不理想。';
    } else if (responseSpeed > 0.2) {
      grade = 'D';
      success = false;
      summary = '响应严重滞后，大量关键措施未落实，灾情失控，造成重大损失。';
    } else {
      grade = 'F';
      success = false;
      summary = '响应几乎瘫痪，指挥体系失灵，灾情全面恶化，后果极其严重。';
    }

    // 生成关键事件摘要
    const keyEvents = this.events
      .filter(e => e.type === 'critical' || e.type === 'warning')
      .map(e => e.title)
      .slice(0, 5);

    // 生成教训
    const lessons = this.generateLessons(gaps);

    // 生成角色表现评价
    const rolePerformance = this.decisionMapping.requiredRoles.map(roleId => {
      const roleActions = this.actions.filter(a => a.roleId === roleId);
      const hasAction = roleActions.length > 0;
      const score = hasAction ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 20;
      
      let comment = '';
      if (score >= 90) {
        comment = '响应迅速，措施得力，表现优秀。';
      } else if (score >= 70) {
        comment = '基本履行职责，响应较为及时。';
      } else if (score >= 50) {
        comment = '响应存在延迟，部分措施落实不到位。';
      } else {
        comment = '响应严重滞后，关键职责未履行。';
      }

      return {
        roleId,
        roleName: this.getRoleName(roleId),
        score,
        comment,
      };
    });

    return {
      success,
      grade,
      summary,
      casualties: {
        deaths,
        injuries,
        missing,
        evacuated,
      },
      statistics: {
        responseTime: Math.floor((1 - responseSpeed) * 60) + 10,
        resourceUtilization: Math.min(resourceUtilization, 100),
        coordinationScore,
        publicSatisfaction: Math.floor(coordinationScore * 0.8),
      },
      keyEvents: keyEvents.length > 0 ? keyEvents : ['推演过程中未发生重大突发事件'],
      lessons,
      rolePerformance,
    };
  }

  // 生成教训
  private generateLessons(gaps: Array<{ required: string; missingBy: string[]; consequence: string }>): string[] {
    const lessons: string[] = [];

    if (gaps.some(g => g.missingBy.includes('water-bureau'))) {
      lessons.push('水利监测是排涝调度的基础，必须确保水位监测数据实时准确。');
    }
    if (gaps.some(g => g.missingBy.includes('weather-bureau'))) {
      lessons.push('气象预警是应急响应的先行指标，预警信息发布必须及时覆盖。');
    }
    if (gaps.some(g => g.missingBy.includes('health-bureau'))) {
      lessons.push('医疗资源预置是保障生命安全的关键，必须提前部署到位。');
    }
    if (gaps.some(g => g.missingBy.includes('traffic-bureau') || g.missingBy.includes('police-bureau'))) {
      lessons.push('交通管制和秩序维护是保障救援通道畅通的前提。');
    }
    if (gaps.some(g => g.missingBy.includes('street-office'))) {
      lessons.push('基层社区是应急响应的第一道防线，群众转移和信息传递必须依靠街道落实。');
    }
    if (gaps.some(g => g.missingBy.includes('emergency-bureau'))) {
      lessons.push('应急指挥调度是协调各方力量的核心，指挥体系必须高效运转。');
    }

    if (lessons.length === 0) {
      lessons.push('各部门协同配合良好，继续保持。');
      lessons.push('应急响应机制运行顺畅，预案执行到位。');
    }

    return lessons;
  }

  // 获取角色名称
  private getRoleName(roleId: string): string {
    const names: Record<string, string> = {
      'mayor': '市长',
      'vice-mayor': '副市长',
      'emergency-bureau': '应急管理局',
      'urban-management': '城管局',
      'traffic-bureau': '交通局',
      'police-bureau': '公安局',
      'health-bureau': '卫健委',
      'weather-bureau': '气象局',
      'street-office': '街道办',
      'housing-bureau': '住建局',
      'natural-resources': '自然资源局',
      'telecom': '通信办',
      'power-company': '供电公司',
      'armed-police': '武警部队',
      'water-bureau': '水利局',
      'cyberspace': '网信办',
      'civil-affairs': '民政局',
    };
    return names[roleId] || roleId;
  }

  // 获取所有事件
  getEvents(): SimulationEvent[] {
    return [...this.events];
  }

  // 重置引擎
  reset() {
    this.actions = [];
    this.events = [];
    this.state = {
      phase: 'briefing',
      currentTime: '14:00',
      weatherCondition: '暴雨蓝色预警',
      waterLevel: 15,
      affectedAreas: [],
      deployedResources: [],
      ongoingEvents: [],
    };
  }
}

// 便捷函数：创建上帝AI引擎
export function createGodAIEngine(
  decisionMapping: DecisionRoleMapping,
  scenarioId?: string,
  userRole?: string | null
): GodAIEngine {
  return new GodAIEngine(decisionMapping, scenarioId, userRole);
}

// 便捷函数：根据智能体消息生成行动
export function agentMessagesToActions(messages: AgentMessage[]): RoleAction[] {
  return messages
    .filter(msg => msg.action && msg.agentId !== 'ai-advisor' && msg.agentId !== 'user')
    .map(msg => ({
      roleId: msg.agentId,
      roleName: msg.agentName,
      action: msg.action!,
      timestamp: msg.timestamp,
      priority: msg.emotion === 'urgent' ? 'high' : msg.emotion === 'worried' ? 'high' : 'medium',
    }));
}

// 便捷函数：将用户方案转换为行动
export function userPlanToActions(userPlan: string, userRoleId: string = 'mayor'): RoleAction[] {
  const actions: RoleAction[] = [];
  
  // 解析用户方案中的关键行动
  const planLower = userPlan.toLowerCase();
  
  if (planLower.includes('转移') || planLower.includes('疏散')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '组织人员转移疏散',
      timestamp: Date.now(),
      priority: 'high',
    });
  }
  if (planLower.includes('救援') || planLower.includes('抢险')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '调派救援抢险力量',
      timestamp: Date.now(),
      priority: 'high',
    });
  }
  if (planLower.includes('医疗') || planLower.includes('救治')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '部署医疗救治力量',
      timestamp: Date.now(),
      priority: 'high',
    });
  }
  if (planLower.includes('交通') || planLower.includes('管制')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '实施交通管制措施',
      timestamp: Date.now(),
      priority: 'medium',
    });
  }
  if (planLower.includes('监测') || planLower.includes('巡查')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '加强监测巡查',
      timestamp: Date.now(),
      priority: 'medium',
    });
  }
  if (planLower.includes('排涝') || planLower.includes('排水')) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: '组织排涝作业',
      timestamp: Date.now(),
      priority: 'high',
    });
  }

  // 如果没有匹配到任何行动，添加一个通用行动
  if (actions.length === 0) {
    actions.push({
      roleId: userRoleId,
      roleName: '指挥员',
      action: userPlan,
      timestamp: Date.now(),
      priority: 'medium',
    });
  }

  return actions;
}
