/**
 * 回合制推演引擎
 * 将上帝AI推演集成到左侧Agent对话流程中
 * 设计逻辑：
 * 1. 左侧Agent对话 = 一个回合（discussing phase）
 * 2. 玩家输入方案后，AI参谋生成完整方案建议
 * 3. 回合结束，上帝AI汇总推演
 * 4. 生成事件和结局，进入下一回合
 */

import type { AIAgent, AgentMessage } from './ai-agents';
import type { DecisionRoleMapping } from './wuhan-waterlogging-case';
import { getDutiesByScenario, type RoleDutyDetail } from './emergency-training-new';
import type { SimulationEvent, SimulationOutcome } from './god-ai-engine';

// 回合阶段
type RoundPhase = 'discussing' | 'planning' | 'executing' | 'evaluating';

// 回合状态
export interface RoundState {
  roundNumber: number;
  phase: RoundPhase;
  messages: AgentMessage[];
  playerPlan: string | null;
  aiPlans: Map<string, string>;
  actions: RoleAction[];
  events: SimulationEvent[];
  isComplete: boolean;
}

// 角色行动
export interface RoleAction {
  roleId: string;
  roleName: string;
  action: string;
  targetRoles: string[];
  resources: string[];
  timeline: string;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

// 回合结果
export interface RoundResult {
  roundNumber: number;
  summary: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  events: SimulationEvent[];
  gaps: ActionGap[];
  nextSituation: string;
  outcome: SimulationOutcome;
}

// 行动缺口
export interface ActionGap {
  roleId: string;
  roleName: string;
  requiredAction: string;
  consequence: string;
  severity: 'critical' | 'warning' | 'info';
}

// 方案模板
export interface PlanTemplate {
  title: string;
  sections: {
    name: string;
    items: string[];
  }[];
}

// 生成唯一ID
function generateId(): string {
  return `rnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 回合制推演引擎
export class RoundBasedEngine {
  private rounds: RoundState[] = [];
  private currentRound: RoundState;
  private decisionMapping: DecisionRoleMapping;
  private scenarioId: string;
  private playerRoleId: string | null = null;
  private playerRoleLevel: string | null = null;
  private dutyMap: ReturnType<typeof getDutiesByScenario>;

  constructor(
    decisionMapping: DecisionRoleMapping,
    scenarioId: string,
    playerRoleId: string | null = null,
    playerRoleLevel: string | null = null
  ) {
    this.decisionMapping = decisionMapping;
    this.scenarioId = scenarioId;
    this.playerRoleId = playerRoleId;
    this.playerRoleLevel = playerRoleLevel;
    this.dutyMap = getDutiesByScenario(scenarioId);
    this.currentRound = this.createNewRound(1);
  }

  // 创建新回合
  private createNewRound(roundNumber: number): RoundState {
    return {
      roundNumber,
      phase: 'discussing',
      messages: [],
      playerPlan: null,
      aiPlans: new Map(),
      actions: [],
      events: [],
      isComplete: false,
    };
  }

  // 获取当前回合
  getCurrentRound(): RoundState {
    return { ...this.currentRound };
  }

  // 获取所有回合
  getAllRounds(): RoundState[] {
    return [...this.rounds];
  }

  // 获取当前回合数
  getCurrentRoundNumber(): number {
    return this.currentRound.roundNumber;
  }

  // 添加消息到当前回合
  addMessage(message: AgentMessage) {
    this.currentRound.messages.push(message);

    // 如果消息包含行动，记录到当前回合
    if (message.action && message.agentId !== 'ai-advisor') {
      this.currentRound.actions.push({
        roleId: message.agentId,
        roleName: message.agentName,
        action: message.action,
        targetRoles: [],
        resources: [],
        timeline: '立即执行',
        timestamp: message.timestamp,
        priority: message.emotion === 'urgent' ? 'high' : 'medium',
      });
    }
  }

  // 设置玩家方案
  setPlayerPlan(plan: string) {
    this.currentRound.playerPlan = plan;
    this.currentRound.phase = 'planning';

    // 解析玩家方案为具体行动
    const parsedActions = this.parsePlanToActions(plan, this.playerRoleId || 'user');
    this.currentRound.actions.push(...parsedActions);
  }

  // 设置AI方案
  setAIPlan(agentId: string, plan: string) {
    this.currentRound.aiPlans.set(agentId, plan);

    // 解析AI方案为具体行动
    const parsedActions = this.parsePlanToActions(plan, agentId);
    this.currentRound.actions.push(...parsedActions);
  }

  // 解析方案为具体行动
  private parsePlanToActions(plan: string, roleId: string): RoleAction[] {
    const actions: RoleAction[] = [];
    const planLower = plan.toLowerCase();

    // 提取具体行动 - 基于知识库职责匹配
    const actionPatterns = [
      { pattern: /组织.{0,10}转移|疏散.{0,10}群众|撤离.{0,10}人员|转移.{0,10}安置/, action: '组织人员转移疏散', target: ['street-office', 'police-bureau', 'armed-police'], resources: ['大巴车', '安置点', '救生衣'] },
      { pattern: /增派.{0,10}排涝|启动.{0,10}泵站|疏通.{0,10}排水|强排.{0,10}作业/, action: '组织排涝作业', target: ['urban-management'], resources: ['移动泵站', '排水车', '龙吸水泵车'] },
      { pattern: /实施.{0,10}管制|封闭.{0,10}道路|引导.{0,10}绕行|交通.{0,10}管控/, action: '实施交通管制', target: ['traffic-bureau', 'police-bureau'], resources: ['路障', '指示牌', '警力'] },
      { pattern: /预置.{0,10}医疗|派遣.{0,10}救护|救治.{0,10}伤员|医疗.{0,10}保障/, action: '部署医疗救治', target: ['health-bureau'], resources: ['救护车', '医疗物资', '急救药品'] },
      { pattern: /监测.{0,10}水位|巡查.{0,10}堤防|泄洪.{0,10}调度|水库.{0,10}调度/, action: '水利监测调度', target: ['water-bureau'], resources: ['监测设备', '水文数据'] },
      { pattern: /加密.{0,10}预报|发布.{0,10}预警|监测.{0,10}雨情|气象.{0,10}服务/, action: '气象监测预警', target: ['weather-bureau'], resources: ['气象设备', '雷达数据'] },
      { pattern: /调拨.{0,10}物资|储备.{0,10}应急|保障.{0,10}供应|物资.{0,10}调配/, action: '应急物资调配', target: ['emergency-bureau'], resources: ['救灾物资', '沙袋', '抽水泵'] },
      { pattern: /救援.{0,10}受困|搜救.{0,10}群众|抢险.{0,10}救灾|人员.{0,10}搜救/, action: '抢险救援', target: ['armed-police', 'police-bureau', 'fire-brigade'], resources: ['救援装备', '冲锋舟', '生命探测仪'] },
      { pattern: /值班.{0,10}值守|信息.{0,10}汇总|指挥.{0,10}调度|应急.{0,10}协调/, action: '应急指挥调度', target: ['emergency-bureau'], resources: ['指挥系统', '通信设备'] },
      { pattern: /社区.{0,10}通知|网格.{0,10}排查|脆弱.{0,10}群体|信息.{0,10}上报/, action: '社区排查通知', target: ['street-office'], resources: ['广播设备', '网格员'] },
      { pattern: /建筑.{0,10}评估|危房.{0,10}排查|工程.{0,10}安全|停工.{0,10}撤离/, action: '建筑安全评估', target: ['housing-bureau'], resources: ['检测设备', '专家组'] },
      { pattern: /地质.{0,10}监测|滑坡.{0,10}预警|次生.{0,10}灾害|风险.{0,10}评估/, action: '地质灾害监测', target: ['natural-resources'], resources: ['监测仪器', '无人机'] },
      { pattern: /舆情.{0,10}监控|网络.{0,10}安全|谣言.{0,10}处置|信息.{0,10}发布/, action: '舆情监控处置', target: ['cyberspace'], resources: ['监测平台', '官方账号'] },
      { pattern: /通信.{0,10}保障|基站.{0,10}抢修|应急.{0,10}通信|网络.{0,10}恢复/, action: '通信保障恢复', target: ['telecom'], resources: ['应急通信车', '卫星电话'] },
      { pattern: /电力.{0,10}抢修|供电.{0,10}保障|断电.{0,10}避险|电网.{0,10}调度/, action: '电力抢修保障', target: ['power-company'], resources: ['抢修车', '发电机', '融冰设备'] },
    ];

    actionPatterns.forEach(({ pattern, action, target, resources }) => {
      if (pattern.test(planLower)) {
        actions.push({
          roleId,
          roleName: this.getRoleName(roleId),
          action,
          targetRoles: target,
          resources,
          timeline: '立即执行',
          timestamp: Date.now(),
          priority: 'high',
        });
      }
    });

    // 如果没有匹配到具体行动，添加一个通用行动
    if (actions.length === 0) {
      actions.push({
        roleId,
        roleName: this.getRoleName(roleId),
        action: plan.slice(0, 50),
        targetRoles: [],
        resources: [],
        timeline: '立即执行',
        timestamp: Date.now(),
        priority: 'medium',
      });
    }

    return actions;
  }

  // 验证玩家方案是否完整
  validatePlayerPlan(plan: string): { isValid: boolean; missingElements: string[]; suggestions: string[] } {
    const missingElements: string[] = [];
    const suggestions: string[] = [];
    const planLower = plan.toLowerCase();

    // 检查方案长度 - 过于简短的方案直接拦截
    if (plan.length < 20) {
      missingElements.push('方案内容');
      suggestions.push('方案过于简单，请详细描述您的处置措施，至少包含具体行动和责任部门');
      return {
        isValid: false,
        missingElements,
        suggestions,
      };
    }

    // 检查是否包含具体措施
    const hasSpecificMeasures = plan.length >= 50 && (
      planLower.includes('组织') || planLower.includes('部署') ||
      planLower.includes('调派') || planLower.includes('实施') ||
      planLower.includes('启动') || planLower.includes('安排') ||
      planLower.includes('开展') || planLower.includes('进行') ||
      planLower.includes('落实') || planLower.includes('执行')
    );
    if (!hasSpecificMeasures) {
      missingElements.push('具体措施');
      suggestions.push('请明确您要采取的具体措施，如"组织人员转移"、"实施交通管制"、"部署医疗救治"等');
    }

    // 检查是否包含责任部门
    const hasDepartments = planLower.includes('局') || planLower.includes('部门') ||
                          planLower.includes('单位') || planLower.includes('街道') ||
                          planLower.includes('办') || planLower.includes('队');
    if (!hasDepartments) {
      missingElements.push('责任部门');
      suggestions.push('请明确涉及哪些部门或单位，如"城管局"、"街道办"、"公安局"等');
    }

    // 检查是否包含时间节点
    const hasTimeline = /\d+分钟|\d+小时|立即|马上|第一时间|限时|尽快/.test(plan);
    if (!hasTimeline) {
      missingElements.push('时间节点');
      suggestions.push('请明确执行的时间要求，如"30分钟内到位"、"立即启动"、"1小时内完成"等');
    }

    // 检查是否包含资源需求
    const hasResources = planLower.includes('物资') || planLower.includes('设备') ||
                        planLower.includes('人员') || planLower.includes('车辆') ||
                        planLower.includes('队伍') || planLower.includes('装备');
    if (!hasResources) {
      missingElements.push('资源需求');
      suggestions.push('请说明需要的资源，如"调派移动泵站20台"、"组织救援队伍100人"、"预备救护车5辆"等');
    }

    // 根据角色层级检查特定要素
    if (this.playerRoleLevel === 'decision') {
      if (!planLower.includes('统筹') && !planLower.includes('协调') && !planLower.includes('指挥')) {
        suggestions.push('作为决策层，建议体现统筹协调的职能，如"统筹各部门开展..."、"协调各方力量..."');
      }
    } else if (this.playerRoleLevel === 'core') {
      if (!planLower.includes('调度') && !planLower.includes('调配') && !planLower.includes('协调')) {
        suggestions.push('作为核心执行层，建议体现调度职能，如"调度各方资源..."、"协调各点位..."');
      }
    } else {
      if (!planLower.includes('配合') && !planLower.includes('落实') && !planLower.includes('执行')) {
        suggestions.push('作为协同配合层，建议体现配合执行的内容，如"配合应急局落实..."、"按指令执行..."');
      }
    }

    // 严格验证：必须包含具体措施、责任部门、时间节点三个核心要素
    // 资源需求可以缺少（部分简单方案可能不需要详细资源说明）
    const coreElements = ['具体措施', '责任部门', '时间节点'];
    const missingCoreElements = missingElements.filter(e => coreElements.includes(e));

    return {
      isValid: missingCoreElements.length === 0 && plan.length >= 50,
      missingElements,
      suggestions,
    };
  }

  // 结束当前回合并推演
  endRound(): RoundResult {
    this.currentRound.phase = 'executing';

    // 分析行动缺口
    const gaps = this.analyzeActionGaps();

    // 生成事件
    const events = this.generateRoundEvents(gaps);
    this.currentRound.events = events;

    // 计算评级
    const grade = this.calculateRoundGrade(gaps);

    // 生成总结
    const summary = this.generateRoundSummary(gaps, events);

    // 生成下一回合的情况
    const nextSituation = this.generateNextSituation(events, gaps);

    // 生成完整结局
    const outcome = this.generateOutcome(gaps, events, grade);

    this.currentRound.isComplete = true;

    const result: RoundResult = {
      roundNumber: this.currentRound.roundNumber,
      summary,
      grade,
      events,
      gaps,
      nextSituation,
      outcome,
    };

    // 保存当前回合并创建新回合
    this.rounds.push({ ...this.currentRound });
    this.currentRound = this.createNewRound(this.currentRound.roundNumber + 1);

    return result;
  }

  // 分析行动缺口
  private analyzeActionGaps(): ActionGap[] {
    const gaps: ActionGap[] = [];
    if (!this.dutyMap) return gaps;

    // 检查每个角色的核心职责是否被覆盖
    this.dutyMap.duties.forEach(duty => {
      const roleActions = this.currentRound.actions.filter(a => a.roleId === duty.roleId);
      const hasCoreAction = duty.specificActions.some(coreAction =>
        roleActions.some(ra =>
          coreAction.includes(ra.action) || ra.action.includes(coreAction.slice(0, 6))
        )
      );

      if (!hasCoreAction && roleActions.length === 0) {
        gaps.push({
          roleId: duty.roleId,
          roleName: this.getRoleName(duty.roleId),
          requiredAction: duty.coreResponsibility,
          consequence: this.generateGapConsequence(duty.roleId),
          severity: ['water-bureau', 'health-bureau', 'emergency-bureau', 'police-bureau'].includes(duty.roleId) ? 'critical' : 'warning',
        });
      }
    });

    return gaps;
  }

  // 生成缺口后果
  private generateGapConsequence(roleId: string): string {
    const consequences: Record<string, string[]> = {
      'water-bureau': ['水库泄洪调度延误，下游洪峰无法有效控制', '无法提供准确水位数据，影响指挥决策'],
      'weather-bureau': ['降雨趋势判断不准确，预警信息发布滞后', '短临预报缺失，无法支撑精准调度'],
      'health-bureau': ['医疗救援力量部署延迟，伤员救治不及时', '防疫措施落实不到位，灾后疫情风险增加'],
      'traffic-bureau': ['交通管制措施不到位，抢险通道受阻', '公交调整不及时，群众出行困难'],
      'police-bureau': ['治安秩序维护不力，灾区出现混乱', '群众疏散组织混乱，转移效率低下'],
      'urban-management': ['排涝作业启动延迟，积水消退缓慢', '排水设施维护不到位，内涝加剧'],
      'street-office': ['社区通知覆盖不全，部分群众未收到预警', '脆弱群体摸排不到位，独居老人等未转移'],
      'emergency-bureau': ['应急指挥调度混乱，各部门各自为战', '物资调配不及时，救援力量无法到位'],
      'armed-police': ['受困群众救援延迟，生命安全受威胁', '抢险装备调配不及时，救援效率低下'],
      'housing-bureau': ['危房排查不到位，建筑倒塌风险增加', '在建工地人员未撤离，安全隐患大'],
      'natural-resources': ['地质灾害监测缺失，次生灾害风险增加', '滑坡预警不及时，威胁下游群众'],
      'cyberspace': ['舆情监控不到位，谣言传播影响社会稳定', '网络攻击风险增加，指挥系统受威胁'],
      'telecom': ['通信中断区域恢复缓慢，救援协调困难', '应急指挥通信不畅，信息传递受阻'],
      'power-company': ['涉水区域未断电，触电风险增加', '关键设施供电中断，影响救援开展'],
    };

    const roleConsequences = consequences[roleId] || ['该岗位职责落实不到位，影响整体应急响应效果'];
    return roleConsequences[Math.floor(Math.random() * roleConsequences.length)];
  }

  // 生成回合事件
  private generateRoundEvents(gaps: ActionGap[]): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    // 1. 正面事件：已执行的行动
    this.currentRound.actions.forEach(action => {
      events.push({
        id: generateId(),
        timestamp: Date.now(),
        type: 'success',
        title: `${action.roleName}行动落实`,
        description: `${action.roleName}执行：${action.action}，协调${action.targetRoles.map(r => this.getRoleName(r)).join('、')}配合。`,
        relatedRoles: [action.roleId, ...action.targetRoles],
      });
    });

    // 2. 负面事件：行动缺口
    gaps.forEach(gap => {
      events.push({
        id: generateId(),
        timestamp: Date.now(),
        type: gap.severity === 'critical' ? 'critical' : 'warning',
        title: `${gap.roleName}响应缺口`,
        description: `${gap.roleName}未落实${gap.requiredAction}，导致${gap.consequence}。`,
        relatedRoles: [gap.roleId],
        cause: `缺少${gap.requiredAction}`,
        effect: [gap.consequence],
      });
    });

    // 3. 连锁反应事件
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      events.push({
        id: generateId(),
        timestamp: Date.now(),
        type: 'critical',
        title: '连锁反应：灾情扩大',
        description: `由于${criticalGaps.map(g => g.roleName).join('、')}等关键部门响应不到位，灾情出现扩大趋势，需要立即采取补救措施。`,
        relatedRoles: criticalGaps.map(g => g.roleId),
        effect: ['灾情扩大', '处置难度增加', '救援成本上升'],
      });
    }

    // 4. 如果无缺口，生成正面总结事件
    if (gaps.length === 0 && this.currentRound.actions.length > 0) {
      events.push({
        id: generateId(),
        timestamp: Date.now(),
        type: 'success',
        title: '各部门协同良好',
        description: '各单位响应迅速，配合默契，灾情得到有效控制。',
        relatedRoles: this.currentRound.actions.map(a => a.roleId),
      });
    }

    return events;
  }

  // 计算回合评级
  private calculateRoundGrade(gaps: ActionGap[]): RoundResult['grade'] {
    const totalRoles = this.decisionMapping.requiredRoles.length;
    const actingRoles = new Set(this.currentRound.actions.map(a => a.roleId)).size;
    const responseRate = actingRoles / totalRoles;
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;

    if (responseRate > 0.8 && criticalGaps === 0) return 'S';
    if (responseRate > 0.6 && criticalGaps <= 1) return 'A';
    if (responseRate > 0.4 && criticalGaps <= 2) return 'B';
    if (responseRate > 0.3 || criticalGaps <= 3) return 'C';
    if (responseRate > 0.2) return 'D';
    return 'F';
  }

  // 生成回合总结
  private generateRoundSummary(gaps: ActionGap[], events: SimulationEvent[]): string {
    const actingRoles = new Set(this.currentRound.actions.map(a => a.roleId)).size;
    const totalRoles = this.decisionMapping.requiredRoles.length;

    if (gaps.length === 0) {
      return `第${this.currentRound.roundNumber}回合：各部门响应迅速，${actingRoles}个单位已落实行动，无重大缺口，协同效果良好。`;
    } else {
      return `第${this.currentRound.roundNumber}回合：${actingRoles}/${totalRoles}个单位已响应，发现${gaps.length}个行动缺口，其中${gaps.filter(g => g.severity === 'critical').length}个为关键缺口，需加强协调。`;
    }
  }

  // 生成下一回合的情况
  private generateNextSituation(events: SimulationEvent[], gaps: ActionGap[]): string {
    const criticalEvents = events.filter(e => e.type === 'critical');

    if (criticalEvents.length > 0) {
      return `灾情扩大！${criticalEvents[0].description}需要立即调整方案，加强${gaps.filter(g => g.severity === 'critical').map(g => g.roleName).join('、')}的响应力度。`;
    } else if (gaps.length > 0) {
      return `当前灾情有所控制，但${gaps.map(g => g.roleName).join('、')}等部门响应仍需加强。请各单位继续落实措施，查漏补缺。`;
    } else {
      return `当前灾情得到有效控制，各部门配合良好。请继续保持，做好后续防范工作，关注次生灾害风险。`;
    }
  }

  // 生成完整结局
  private generateOutcome(gaps: ActionGap[], events: SimulationEvent[], grade: RoundResult['grade']): SimulationOutcome {
    const actingRoles = new Set(this.currentRound.actions.map(a => a.roleId)).size;
    const totalRoles = this.decisionMapping.requiredRoles.length;
    const responseRate = actingRoles / totalRoles;
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;

    // 基于评级生成伤亡数据
    const gradeMultiplier: Record<string, number> = {
      'S': 0.3, 'A': 0.5, 'B': 0.7, 'C': 1.0, 'D': 1.5, 'F': 2.0,
    };
    const multiplier = gradeMultiplier[grade] || 1.0;

    const baseDeaths = Math.floor(Math.random() * 3 * multiplier);
    const baseInjuries = Math.floor(Math.random() * 20 * multiplier);
    const baseMissing = Math.floor(Math.random() * 5 * multiplier);
    const baseEvacuated = Math.floor(1000 + Math.random() * 4000 * (1 / multiplier));

    // 生成关键事件
    const keyEvents: string[] = [];
    events.filter(e => e.type === 'success').forEach(e => {
      keyEvents.push(e.title);
    });
    gaps.forEach(g => {
      keyEvents.push(`${g.roleName}响应缺口：${g.consequence}`);
    });

    // 生成经验教训
    const lessons: string[] = [];
    if (criticalGaps > 0) {
      lessons.push(`关键部门响应不及时，${gaps.filter(g => g.severity === 'critical').map(g => g.roleName).join('、')}需加强应急联动`);
    }
    if (responseRate < 0.6) {
      lessons.push('参与响应单位不足，需完善应急动员机制');
    }
    if (gaps.length === 0) {
      lessons.push('各部门协同配合良好，值得总结经验推广');
    }

    // 生成角色表现
    const rolePerformance = this.decisionMapping.requiredRoles.map(roleId => {
      const hasAction = this.currentRound.actions.some(a => a.roleId === roleId);
      const gap = gaps.find(g => g.roleId === roleId);
      let score = hasAction ? 70 + Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 20);
      if (gap) {
        score -= gap.severity === 'critical' ? 30 : 15;
      }
      score = Math.max(0, Math.min(100, score));

      let comment = '';
      if (score >= 90) comment = '响应迅速，执行到位';
      else if (score >= 70) comment = '基本完成任务，配合良好';
      else if (score >= 50) comment = '响应较慢，存在不足';
      else comment = '响应严重滞后，需深刻反思';

      return {
        roleId,
        roleName: this.getRoleName(roleId),
        score,
        comment,
      };
    });

    return {
      success: grade !== 'F' && grade !== 'D',
      grade,
      summary: this.generateRoundSummary(gaps, events),
      casualties: {
        deaths: baseDeaths,
        injuries: baseInjuries,
        missing: baseMissing,
        evacuated: baseEvacuated,
      },
      statistics: {
        responseTime: Math.floor(15 + Math.random() * 45 * multiplier),
        resourceUtilization: Math.floor(50 + Math.random() * 50 * (1 / multiplier)),
        coordinationScore: Math.floor(responseRate * 100),
        publicSatisfaction: Math.floor(40 + Math.random() * 60 * (1 / multiplier)),
      },
      keyEvents: keyEvents.slice(0, 5),
      lessons,
      rolePerformance,
    };
  }

  // 获取角色名称
  private getRoleName(roleId: string): string {
    const names: Record<string, string> = {
      'mayor': '市长', 'vice-mayor': '副市长',
      'emergency-bureau': '应急管理局', 'urban-management': '城管局',
      'traffic-bureau': '交通局', 'police-bureau': '公安局',
      'health-bureau': '卫健委', 'weather-bureau': '气象局',
      'street-office': '街道办', 'housing-bureau': '住建局',
      'natural-resources': '自然资源局', 'telecom': '通信办',
      'power-company': '供电公司', 'armed-police': '武警部队',
      'water-bureau': '水利局', 'cyberspace': '网信办',
      'civil-affairs': '民政局', 'fire-brigade': '消防支队',
      'fire-rescue': '消防救援', 'seismology-bureau': '地震局',
      'agriculture-bureau': '农业农村局',
    };
    return names[roleId] || roleId;
  }

  // 生成AI参谋的完整方案建议
  generateAdvisorPlan(playerRoleLevel: string | null, situation: string): string {
    if (!this.dutyMap) return '';

    let plan = '';

    if (playerRoleLevel === 'decision') {
      // 决策层方案：统筹全局
      plan = this.generateDecisionLayerPlan(situation);
    } else if (playerRoleLevel === 'core') {
      // 核心层方案：调度执行
      plan = this.generateCoreLayerPlan(situation);
    } else {
      // 协同层方案：配合执行
      plan = this.generateCollabLayerPlan(situation);
    }

    return plan;
  }

  // 生成决策层完整方案
  private generateDecisionLayerPlan(situation: string): string {
    const duties = this.dutyMap?.duties || [];
    const collabDuties = duties.filter(d => {
      const role = this.getRoleById(d.roleId);
      return role?.level === 'collab';
    });

    let plan = `【应急处置方案】

一、总体要求
针对当前${situation}，立即启动应急响应，坚持"人民至上、生命至上"原则，确保人民群众生命安全，最大限度减少财产损失。

二、指挥体系
- 指挥长（市长）：总体决策，协调各方，坐镇指挥中心
- 副指挥长（副市长）：分片督导，现场指挥
- 应急管理局：信息汇总，物资调配，上传下达

三、具体措施`;

    collabDuties.forEach((duty, idx) => {
      plan += `\n${idx + 1}. ${this.getRoleName(duty.roleId)}：${duty.coreResponsibility}`;
      plan += `\n   - ${duty.specificActions.join('\n   - ')}`;
      plan += `\n   - 时限：${duty.timeLimit}`;
    });

    plan += `\n
四、时间节点
- 立即：启动响应，人员到位，建立指挥体系
- 15分钟内：完成值班部署，启动信息汇总
- 30分钟内：巡查队伍到位，物资开始调拨
- 1小时内：完成首轮灾情评估，调整处置方案
- 持续：动态监测，滚动研判，及时调整

五、监督落实
- 建立台账，记录各项措施执行情况
- 每30分钟汇总一次灾情数据
- 对执行不力的部门进行督促提醒
- 遇重大问题立即上报，不得延误`;

    return plan;
  }

  // 生成核心层完整方案
  private generateCoreLayerPlan(situation: string): string {
    const duties = this.dutyMap?.duties || [];

    let plan = `【应急调度方案】

一、调度目标
根据指挥长指令，统筹各方资源，确保应急响应高效运转，实现信息畅通、物资充足、人员到位、处置及时。

二、调度措施`;

    duties.forEach((duty, idx) => {
      if (duty.roleId !== 'mayor' && duty.roleId !== 'vice-mayor') {
        plan += `\n${idx + 1}. ${this.getRoleName(duty.roleId)}：${duty.coreResponsibility}`;
        plan += `\n   - 具体行动：${duty.specificActions[0]}`;
        plan += `\n   - 配合部门：${duty.specificActions.slice(1).join('、')}`;
      }
    });

    plan += `\n
三、信息汇总
- 每15分钟收集一次各部门实时情况
- 汇总灾情数据：积水深度、交通中断、人员受困等
- 向指挥长报告灾情进展和处置效果

四、物资调配
- 从应急仓库调拨必要物资
- 根据灾情动态调整物资分配
- 确保各点位物资充足

五、执行要求
- 各部门收到指令后30分钟内反馈执行情况
- 遇重大问题立即上报，不得延误
- 每日18:00前汇总当日处置情况

六、监督落实
- 建立台账，记录各项措施执行情况
- 对执行不力的部门进行督促提醒`;

    return plan;
  }

  // 生成协同层完整方案
  private generateCollabLayerPlan(situation: string): string {
    const playerDuty = this.dutyMap?.duties.find(d => d.roleId === this.playerRoleId);

    let plan = `【协同配合方案】

一、配合目标
根据指挥长和应急局调度指令，落实本部门职责，确保应急响应到位，配合各方高效处置${situation}。

二、本部门职责
${playerDuty ? `-${playerDuty.coreResponsibility}` : '- 按预案要求落实各项措施'}

三、具体措施`;

    if (playerDuty) {
      playerDuty.specificActions.forEach((action, idx) => {
        plan += `\n${idx + 1}. ${action}`;
      });
    }

    plan += `\n
四、配合机制
- 立即响应：收到指令后15分钟内启动本部门应急预案
- 人员到位：组织本部门应急队伍集结，携带必要装备
- 信息上报：每30分钟向应急局报告本部门执行情况
- 协同配合：根据调度指令，配合其他部门开展工作
- 问题反馈：如遇困难或问题，及时上报请求支援

五、注意事项
- 严格按预案执行，不得擅自变更
- 遇紧急情况可先处置后报告
- 确保本部门人员安全
- 做好记录，便于后续总结`;

    return plan;
  }

  // 获取角色信息
  private getRoleById(roleId: string) {
    const roles = [
      { id: 'mayor', level: 'decision' }, { id: 'vice-mayor', level: 'decision' },
      { id: 'emergency-bureau', level: 'core' },
      { id: 'urban-management', level: 'collab' },
      { id: 'traffic-bureau', level: 'collab' },
      { id: 'police-bureau', level: 'collab' },
      { id: 'health-bureau', level: 'collab' },
      { id: 'weather-bureau', level: 'collab' },
      { id: 'street-office', level: 'collab' },
      { id: 'housing-bureau', level: 'collab' },
      { id: 'natural-resources', level: 'collab' },
      { id: 'cyberspace', level: 'collab' },
      { id: 'telecom', level: 'collab' },
      { id: 'power-company', level: 'collab' },
      { id: 'armed-police', level: 'collab' },
      { id: 'water-bureau', level: 'collab' },
      { id: 'civil-affairs', level: 'collab' },
      { id: 'fire-brigade', level: 'collab' },
    ];
    return roles.find(r => r.id === roleId);
  }

  // 获取方案模板（用于提示玩家）
  getPlanTemplate(): PlanTemplate {
    if (this.playerRoleLevel === 'decision') {
      return {
        title: '应急处置方案模板',
        sections: [
          { name: '一、总体要求', items: ['明确响应级别和启动条件', '确定指挥体系和分工', '提出总体目标和原则'] },
          { name: '二、具体措施', items: ['组织人员转移疏散（涉及部门：街道办、公安局、武警）', '实施交通管制（涉及部门：交通局、公安局）', '部署医疗救治（涉及部门：卫健委）', '组织排涝作业（涉及部门：城管局）', '加密监测预警（涉及部门：气象局、水利局）'] },
          { name: '三、责任分工', items: ['明确各部门职责', '确定配合机制', '建立联络方式'] },
          { name: '四、时间节点', items: ['立即启动响应', '15分钟内部署到位', '30分钟内行动展开', '持续监测调整'] },
        ],
      };
    } else if (this.playerRoleLevel === 'core') {
      return {
        title: '应急调度方案模板',
        sections: [
          { name: '一、调度目标', items: ['明确调度任务', '确定资源需求', '提出协调要求'] },
          { name: '二、调度措施', items: ['信息汇总与上报（时限：每15分钟）', '物资调配与分发（涉及：应急仓库、各点位）', '人员调度与协调（涉及：各部门应急队伍）', '通信保障与联络（涉及：通信办）'] },
          { name: '三、执行要求', items: ['各部门30分钟内反馈', '重大问题立即上报', '建立台账记录'] },
        ],
      };
    } else {
      return {
        title: '协同配合方案模板',
        sections: [
          { name: '一、配合目标', items: ['明确本部门任务', '确定配合方式', '提出执行标准'] },
          { name: '二、具体措施', items: ['立即响应启动预案（时限：15分钟内）', '组织人员装备到位', '按指令落实行动', '及时上报执行情况'] },
          { name: '三、注意事项', items: ['严格按预案执行', '遇紧急情况先处置后报告', '确保人员安全'] },
        ],
      };
    }
  }

  // 重置引擎
  reset() {
    this.rounds = [];
    this.currentRound = this.createNewRound(1);
  }
}

// 便捷函数：创建回合制引擎
export function createRoundBasedEngine(
  decisionMapping: DecisionRoleMapping,
  scenarioId: string,
  playerRoleId?: string | null,
  playerRoleLevel?: string | null
): RoundBasedEngine {
  return new RoundBasedEngine(decisionMapping, scenarioId, playerRoleId || null, playerRoleLevel || null);
}
