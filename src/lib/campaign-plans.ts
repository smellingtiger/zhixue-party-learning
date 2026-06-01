/**
 * 战役方案系统
 * 用于危机模拟推演中的方案选择、推演和执行
 */

import type { Role } from './emergency-training-new';

// 方案中的岗位配置
export interface PlanRoleAssignment {
  roleId: string;
  roleName: string;
  actions: string[]; // 该岗位需要执行的具体行动
  isCritical: boolean; // 是否为关键岗位（缺失会导致方案失败）
}

// 方案资源分配
export interface PlanResource {
  type: 'personnel' | 'equipment' | 'vehicle' | 'material';
  name: string;
  quantity: number;
  unit: string;
}

// 方案风险评估
export interface PlanRisk {
  type: 'casualty' | 'delay' | 'secondary_disaster' | 'resource_shortage' | 'communication';
  description: string;
  probability: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string; // 缓解措施
}

// 方案推演结果（快速预览）
export interface PlanSimulationResult {
  estimatedCasualties: number;
  estimatedDuration: number; // 分钟
  successRate: number; // 0-100
  keyRisks: string[];
  resourceRequirements: string[];
  aiComment: string;
}

// 方案执行结果（真实偏差）
export interface PlanExecutionResult {
  actualCasualties: number;
  actualDuration: number;
  deviations: ExecutionDeviation[];
  finalAssessment: string;
  lessonsLearned: string[];
}

// 执行偏差
export interface ExecutionDeviation {
  type: 'timing' | 'resource' | 'communication' | 'weather' | 'unexpected';
  description: string;
  impact: string;
  couldBePrevented: boolean; // 是否可以通过完善方案避免
}

// 战役方案
export interface CampaignPlan {
  id: string;
  name: string;
  description: string;
  category: 'rescue' | 'evacuation' | 'containment' | 'medical' | 'investigation';
  priority: number; // 优先级，数字越小越优先
  
  // 岗位配置
  requiredRoles: PlanRoleAssignment[];
  
  // 资源需求
  resources: PlanResource[];
  
  // 风险评估
  risks: PlanRisk[];
  
  // 推演结果（预设）
  simulationResult: PlanSimulationResult;
  
  // 执行偏差场景（多个可能的偏差）
  deviationScenarios: ExecutionDeviation[][];
  
  // 前置条件（需要哪些信息/条件才能执行）
  prerequisites: string[];
  
  // 后续影响（执行后会解锁哪些新方案）
  unlocksPlans: string[];
}

// 决策点对应的方案组
export interface DecisionPlanGroup {
  decisionIndex: number;
  decisionDescription: string;
  plans: CampaignPlan[];
  aiRecommendation: string; // AI参谋的推荐说明
}

// 天津港爆炸案例的方案
export const tianjinExplosionPlans: DecisionPlanGroup[] = [
  {
    decisionIndex: 0,
    decisionDescription: '消防员到场后发现火势异常，仓库内可能存放危险品',
    aiRecommendation: '根据危化品火灾处置原则，建议优先确保人员安全，同时尽快获取仓库货物清单。',
    plans: [
      {
        id: 'tj-plan-1-1',
        name: '强攻灭火方案',
        description: '组织消防力量继续内攻，力争在火势扩大前扑灭',
        category: 'rescue',
        priority: 1,
        requiredRoles: [
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['组织内攻灭火', '铺设水带干线', '建立供水阵地'], isCritical: true },
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['协调增援力量', '调集泡沫灭火剂'], isCritical: false },
        ],
        resources: [
          { type: 'personnel', name: '消防员', quantity: 200, unit: '人' },
          { type: 'equipment', name: '泡沫灭火剂', quantity: 50, unit: '吨' },
          { type: 'vehicle', name: '消防车', quantity: 30, unit: '辆' },
        ],
        risks: [
          { type: 'casualty', description: '未知危化品可能导致爆炸', probability: 0.7, severity: 'critical', mitigation: '需要危化品专家评估' },
          { type: 'secondary_disaster', description: '火势可能引发连锁爆炸', probability: 0.5, severity: 'high' },
        ],
        simulationResult: {
          estimatedCasualties: 80,
          estimatedDuration: 120,
          successRate: 30,
          keyRisks: ['未知危化品爆炸风险极高', '消防员生命安全无法保障'],
          resourceRequirements: ['需要大量泡沫灭火剂', '需要专业危化品处置装备'],
          aiComment: '此方案风险极高！在未知危化品情况下强攻，历史上类似案例（如天津港8·12事故）造成了重大人员伤亡。建议优先获取货物信息。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '仓库内硝酸铵突然爆炸', impact: '现场消防员重大伤亡，火势瞬间扩大', couldBePrevented: true },
            { type: 'resource', description: '泡沫灭火剂不足，火势无法控制', impact: '延误灭火时机，火势蔓延至相邻仓库', couldBePrevented: true },
          ],
          [
            { type: 'communication', description: '与企业沟通不畅，无法获取货物清单', impact: '消防员在不知情的情况下接近危险区域', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要企业配合提供货物清单', '需要危化品专家到场评估'],
        unlocksPlans: ['tj-plan-2-1', 'tj-plan-2-2'],
      },
      {
        id: 'tj-plan-1-2',
        name: '安全撤离方案',
        description: '立即撤出所有人员，扩大警戒范围，等待危化品专家评估',
        category: 'evacuation',
        priority: 2,
        requiredRoles: [
          { roleId: 'police-bureau', roleName: '市公安局', actions: ['扩大警戒范围', '疏散周边人员', '交通管制'], isCritical: true },
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['外围布控', '准备灭火阵地', '等待指令'], isCritical: false },
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['联系危化品专家', '调集专业设备'], isCritical: true },
        ],
        resources: [
          { type: 'personnel', name: '警力', quantity: 100, unit: '人' },
          { type: 'vehicle', name: '警车', quantity: 20, unit: '辆' },
          { type: 'material', name: '警戒带', quantity: 1000, unit: '米' },
        ],
        risks: [
          { type: 'delay', description: '延误灭火时机，火势可能扩大', probability: 0.4, severity: 'medium', mitigation: '外围布控防止蔓延' },
          { type: 'resource_shortage', description: '疏散范围大，警力可能不足', probability: 0.3, severity: 'low' },
        ],
        simulationResult: {
          estimatedCasualties: 5,
          estimatedDuration: 180,
          successRate: 85,
          keyRisks: ['火势可能扩大', '疏散社会影响较大'],
          resourceRequirements: ['需要足够警力维持秩序', '需要专家快速到场'],
          aiComment: '此方案符合安全优先原则。虽然可能延误灭火，但能有效保护救援人员生命安全。建议同时启动危化品专家调集程序。',
        },
        deviationScenarios: [
          [
            { type: 'timing', description: '危化品专家到场延迟2小时', impact: '火势扩大，需要更大范围疏散', couldBePrevented: false },
            { type: 'unexpected', description: '企业在疏散过程中不配合', impact: '部分人员滞留危险区域', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要企业配合疏散', '需要危化品专家支持'],
        unlocksPlans: ['tj-plan-2-3', 'tj-plan-2-4'],
      },
      {
        id: 'tj-plan-1-3',
        name: '专家评估方案',
        description: '请求危化品专家到场评估，同时做好灭火准备',
        category: 'investigation',
        priority: 3,
        requiredRoles: [
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['联系危化品专家', '调集专业检测设备'], isCritical: true },
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['外围布控', '准备灭火预案'], isCritical: false },
          { roleId: 'natural-resources', roleName: '市自然资源局', actions: ['提供危化品存储信息', '协助评估'], isCritical: false },
        ],
        resources: [
          { type: 'personnel', name: '危化品专家', quantity: 5, unit: '人' },
          { type: 'equipment', name: '气体检测仪', quantity: 10, unit: '台' },
          { type: 'vehicle', name: '检测车', quantity: 2, unit: '辆' },
        ],
        risks: [
          { type: 'delay', description: '专家到场需要时间，火势可能扩大', probability: 0.5, severity: 'medium', mitigation: '同时准备灭火力量' },
          { type: 'communication', description: '企业可能隐瞒真实货物信息', probability: 0.6, severity: 'high', mitigation: '多渠道核实' },
        ],
        simulationResult: {
          estimatedCasualties: 15,
          estimatedDuration: 240,
          successRate: 70,
          keyRisks: ['专家到场需要时间', '企业可能不配合'],
          resourceRequirements: ['需要快速调集专家', '需要企业配合'],
          aiComment: '此方案较为稳妥，但关键在于专家到场速度和企业配合程度。建议同时启动外围控制，防止火势蔓延。',
        },
        deviationScenarios: [
          [
            { type: 'communication', description: '企业隐瞒硝酸铵存储信息', impact: '专家基于错误信息评估，低估风险', couldBePrevented: true },
            { type: 'timing', description: '专家因交通拥堵延迟到场', impact: '火势扩大，错过最佳处置时机', couldBePrevented: false },
          ],
        ],
        prerequisites: ['需要企业配合提供真实信息', '需要快速调集专家资源'],
        unlocksPlans: ['tj-plan-2-2', 'tj-plan-2-3'],
      },
    ],
  },
  {
    decisionIndex: 1,
    decisionDescription: '发生两次大爆炸后，现场情况不明，可能存在二次爆炸风险',
    aiRecommendation: '爆炸后现场极其危险，建议先评估风险，同时组织外围搜救。',
    plans: [
      {
        id: 'tj-plan-2-1',
        name: '全面搜救方案',
        description: '组织所有力量立即进入现场搜救被困人员',
        category: 'rescue',
        priority: 1,
        requiredRoles: [
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['进入核心区搜救', '生命探测', '破拆救援'], isCritical: true },
          { roleId: 'armed-police', roleName: '武警部队', actions: ['协助搜救', '维持秩序', '搬运伤员'], isCritical: true },
          { roleId: 'health-bureau', roleName: '市卫健委', actions: ['现场医疗救治', '伤员转运', '医院协调'], isCritical: true },
        ],
        resources: [
          { type: 'personnel', name: '搜救人员', quantity: 500, unit: '人' },
          { type: 'equipment', name: '生命探测仪', quantity: 20, unit: '台' },
          { type: 'vehicle', name: '救护车', quantity: 50, unit: '辆' },
        ],
        risks: [
          { type: 'casualty', description: '二次爆炸风险极高', probability: 0.8, severity: 'critical' },
          { type: 'secondary_disaster', description: '建筑倒塌可能掩埋救援人员', probability: 0.6, severity: 'high' },
        ],
        simulationResult: {
          estimatedCasualties: 120,
          estimatedDuration: 300,
          successRate: 20,
          keyRisks: ['二次爆炸风险极高', '建筑结构不稳定'],
          resourceRequirements: ['需要大量搜救人员', '需要专业救援设备'],
          aiComment: '此方案极其危险！在两次大爆炸后立即进入核心区，历史上天津港事故中正是在此阶段遭受了最重大的人员伤亡。强烈建议先评估风险。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '现场发生第三次爆炸', impact: '进入核心区的救援人员全部牺牲', couldBePrevented: true },
            { type: 'resource', description: '生命探测仪数量不足', impact: '无法快速定位被困人员', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要确认无二次爆炸风险', '需要结构专家评估建筑安全'],
        unlocksPlans: [],
      },
      {
        id: 'tj-plan-2-2',
        name: '风险评估后搜救',
        description: '先由专家和无人机评估风险，再组织搜救',
        category: 'investigation',
        priority: 2,
        requiredRoles: [
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['组织专家评估', '调集无人机', '制定搜救方案'], isCritical: true },
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['外围搜救', '准备进入核心区'], isCritical: false },
          { roleId: 'armed-police', roleName: '武警部队', actions: ['外围警戒', '协助疏散'], isCritical: false },
        ],
        resources: [
          { type: 'equipment', name: '无人机', quantity: 10, unit: '架' },
          { type: 'personnel', name: '评估专家', quantity: 10, unit: '人' },
          { type: 'equipment', name: '气体检测仪', quantity: 20, unit: '台' },
        ],
        risks: [
          { type: 'delay', description: '评估需要时间，可能延误救援', probability: 0.5, severity: 'medium', mitigation: '外围同时搜救' },
          { type: 'resource_shortage', description: '无人机可能受信号干扰', probability: 0.3, severity: 'low' },
        ],
        simulationResult: {
          estimatedCasualties: 30,
          estimatedDuration: 360,
          successRate: 75,
          keyRisks: ['评估需要时间', '可能延误黄金救援时间'],
          resourceRequirements: ['需要无人机和专业设备', '需要专家快速评估'],
          aiComment: '此方案较为稳妥。虽然可能延误部分救援时间，但能有效保护救援人员安全。建议同时在外围开展搜救。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '无人机信号受爆炸干扰', impact: '无法获取核心区高清图像', couldBePrevented: false },
            { type: 'timing', description: '专家评估需要4小时', impact: '错过黄金救援时间', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要无人机和专业设备', '需要专家支持'],
        unlocksPlans: ['tj-plan-3-1', 'tj-plan-3-2'],
      },
      {
        id: 'tj-plan-2-3',
        name: '外围搜救方案',
        description: '仅在安全区域开展搜救，核心区等待稳定后再进入',
        category: 'rescue',
        priority: 3,
        requiredRoles: [
          { roleId: 'fire-brigade', roleName: '市消防支队', actions: ['外围区域搜救', '伤员转运'], isCritical: true },
          { roleId: 'health-bureau', roleName: '市卫健委', actions: ['现场医疗救治', '伤员分类'], isCritical: true },
          { roleId: 'police-bureau', roleName: '市公安局', actions: ['维持秩序', '引导救援车辆'], isCritical: false },
        ],
        resources: [
          { type: 'personnel', name: '搜救人员', quantity: 200, unit: '人' },
          { type: 'vehicle', name: '救护车', quantity: 30, unit: '辆' },
          { type: 'material', name: '医疗物资', quantity: 1000, unit: '份' },
        ],
        risks: [
          { type: 'delay', description: '核心区被困人员无法及时获救', probability: 0.7, severity: 'high', mitigation: '持续监测核心区情况' },
          { type: 'casualty', description: '外围区域可能有遗漏的被困人员', probability: 0.3, severity: 'medium' },
        ],
        simulationResult: {
          estimatedCasualties: 50,
          estimatedDuration: 480,
          successRate: 60,
          keyRisks: ['核心区被困人员可能无法获救', '外围搜救可能遗漏'],
          resourceRequirements: ['需要足够搜救人员', '需要医疗物资保障'],
          aiComment: '此方案相对安全，但可能无法救出核心区被困人员。建议持续监测核心区情况，一旦条件允许立即进入。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '核心区火势复燃', impact: '外围搜救被迫中断', couldBePrevented: false },
            { type: 'resource', description: '医疗物资不足', impact: '伤员无法得到及时救治', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要确认外围区域安全', '需要足够医疗物资'],
        unlocksPlans: ['tj-plan-3-2', 'tj-plan-3-3'],
      },
    ],
  },
  {
    decisionIndex: 2,
    decisionDescription: '有毒气体扩散，下风向居民区受到威胁',
    aiRecommendation: '根据风向和毒气扩散速度，建议立即疏散下风向居民，同时启动环境监测。',
    plans: [
      {
        id: 'tj-plan-3-1',
        name: '大规模疏散方案',
        description: '疏散下风向5公里范围内所有居民',
        category: 'evacuation',
        priority: 1,
        requiredRoles: [
          { roleId: 'police-bureau', roleName: '市公安局', actions: ['组织疏散', '交通管制', '维持秩序'], isCritical: true },
          { roleId: 'street-office', roleName: '属地街道办', actions: ['逐户通知', '协助老弱病残转移', '登记人员'], isCritical: true },
          { roleId: 'traffic-bureau', roleName: '市交通局', actions: ['调度公交车辆', '保障疏散通道', '发布交通信息'], isCritical: true },
          { roleId: 'civil-affairs', roleName: '市民政局', actions: ['设置安置点', '发放物资', '保障生活'], isCritical: true },
        ],
        resources: [
          { type: 'personnel', name: '工作人员', quantity: 1000, unit: '人' },
          { type: 'vehicle', name: '公交车', quantity: 100, unit: '辆' },
          { type: 'material', name: '应急物资', quantity: 10000, unit: '份' },
        ],
        risks: [
          { type: 'resource_shortage', description: '疏散人数多，车辆可能不足', probability: 0.4, severity: 'medium', mitigation: '协调社会车辆' },
          { type: 'delay', description: '疏散需要时间，可能有人滞留', probability: 0.5, severity: 'high', mitigation: '优先疏散老弱病残' },
        ],
        simulationResult: {
          estimatedCasualties: 2,
          estimatedDuration: 240,
          successRate: 90,
          keyRisks: ['疏散范围广，资源需求大', '社会影响较大'],
          resourceRequirements: ['需要大量公交车辆', '需要足够工作人员'],
          aiComment: '此方案最为稳妥。虽然疏散范围广、社会影响大，但能最大限度保护居民生命安全。建议优先疏散老弱病残等脆弱群体。',
        },
        deviationScenarios: [
          [
            { type: 'resource', description: '公交车辆不足，需要协调社会车辆', impact: '疏散速度减慢，部分居民滞留', couldBePrevented: true },
            { type: 'unexpected', description: '部分居民不愿意撤离', impact: '需要强制疏散，引发冲突', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要足够交通工具', '需要居民配合'],
        unlocksPlans: [],
      },
      {
        id: 'tj-plan-3-2',
        name: '精准疏散方案',
        description: '根据毒气浓度监测，疏散下风向3公里范围内居民',
        category: 'evacuation',
        priority: 2,
        requiredRoles: [
          { roleId: 'police-bureau', roleName: '市公安局', actions: ['组织疏散', '交通管制'], isCritical: true },
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['监测毒气浓度', '确定疏散范围', '发布预警'], isCritical: true },
          { roleId: 'street-office', roleName: '属地街道办', actions: ['逐户通知', '协助转移'], isCritical: true },
        ],
        resources: [
          { type: 'personnel', name: '工作人员', quantity: 500, unit: '人' },
          { type: 'vehicle', name: '公交车', quantity: 50, unit: '辆' },
          { type: 'equipment', name: '气体检测仪', quantity: 30, unit: '台' },
        ],
        risks: [
          { type: 'casualty', description: '3-5公里范围内居民可能受到毒气影响', probability: 0.4, severity: 'medium', mitigation: '建议居民关窗避难' },
          { type: 'communication', description: '毒气扩散速度可能快于预期', probability: 0.3, severity: 'medium' },
        ],
        simulationResult: {
          estimatedCasualties: 15,
          estimatedDuration: 180,
          successRate: 75,
          keyRisks: ['3-5公里居民可能受影响', '毒气扩散速度不确定'],
          resourceRequirements: ['需要准确监测数据', '需要快速响应'],
          aiComment: '此方案较为平衡。虽然疏散范围较小，但需要精确的监测数据支持。建议同时发布避难指南，指导3-5公里居民自我防护。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '风向突然改变', impact: '毒气扩散方向改变，原安全区域变为危险区域', couldBePrevented: false },
            { type: 'communication', description: '监测数据传输延迟', impact: '疏散范围确定滞后', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要准确的风向和毒气监测数据', '需要快速响应能力'],
        unlocksPlans: [],
      },
      {
        id: 'tj-plan-3-3',
        name: '就地防护方案',
        description: '建议居民关窗避难，不组织大规模疏散',
        category: 'containment',
        priority: 3,
        requiredRoles: [
          { roleId: 'emergency-bureau', roleName: '市应急局', actions: ['发布预警信息', '指导居民防护', '监测毒气浓度'], isCritical: true },
          { roleId: 'cyberspace', roleName: '市委网信办', actions: ['发布官方信息', '辟谣', '引导舆论'], isCritical: false },
          { roleId: 'street-office', roleName: '属地街道办', actions: ['通知居民', '协助困难群体'], isCritical: false },
        ],
        resources: [
          { type: 'equipment', name: '广播设备', quantity: 50, unit: '台' },
          { type: 'material', name: '防护口罩', quantity: 50000, unit: '个' },
        ],
        risks: [
          { type: 'casualty', description: '居民可能因防护不当中毒', probability: 0.7, severity: 'critical' },
          { type: 'communication', description: '信息传达可能不到位', probability: 0.5, severity: 'high' },
        ],
        simulationResult: {
          estimatedCasualties: 80,
          estimatedDuration: 120,
          successRate: 40,
          keyRisks: ['居民防护意识不足', '毒气浓度可能超预期'],
          resourceRequirements: ['需要大量防护物资', '需要有效信息传达'],
          aiComment: '此方案风险较高！在有毒气体扩散情况下，仅建议就地避难可能无法有效保护居民。历史上类似案例中，不疏散往往导致更多伤亡。',
        },
        deviationScenarios: [
          [
            { type: 'unexpected', description: '毒气浓度突然升高', impact: '大量居民中毒', couldBePrevented: true },
            { type: 'communication', description: '部分居民未收到预警信息', impact: '未防护居民中毒', couldBePrevented: true },
          ],
        ],
        prerequisites: ['需要居民高度配合', '需要充足防护物资'],
        unlocksPlans: [],
      },
    ],
  },
];

// 获取决策点对应的方案组
export function getPlansForDecision(decisionIndex: number): DecisionPlanGroup | undefined {
  return tianjinExplosionPlans.find(g => g.decisionIndex === decisionIndex);
}

// 获取所有方案
export function getAllPlans(): CampaignPlan[] {
  return tianjinExplosionPlans.flatMap(g => g.plans);
}

// 获取方案详情
export function getPlanById(planId: string): CampaignPlan | undefined {
  return getAllPlans().find(p => p.id === planId);
}
