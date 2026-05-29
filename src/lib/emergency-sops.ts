export interface SOPNode {
  id: string;
  type: 'start' | 'condition' | 'action' | 'decision' | 'end';
  title: string;
  description: string;
  priority: 1 | 2 | 3;
  conditions?: string[];
  actions?: string[];
  nextNodes?: string[];
  decisionOptions?: DecisionOption[];
  resources?: Resource[];
  duration?: string;
  responsible?: string;
}

export interface DecisionOption {
  label: string;
  nextNode: string;
  condition?: string;
}

export interface Resource {
  type: 'personnel' | 'equipment' | 'material' | 'transport';
  name: string;
  quantity: number;
  unit: string;
  priority: number;
}

export interface SOPPlan {
  id: string;
  name: string;
  disasterType: string;
  version: string;
  nodes: SOPNode[];
  startNode: string;
  tags: string[];
}

export interface Scenario {
  id: string;
  disasterType: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameters: Record<string, any>;
}

export const FLOOD_SOPS: SOPPlan[] = [
  {
    id: 'flood-urban-evacuation',
    name: '城市内涝人员疏散SOP',
    disasterType: 'flood',
    version: '2.1',
    tags: ['疏散', '人员安置', '内涝'],
    startNode: 'start',
    nodes: [
      {
        id: 'start',
        type: 'start',
        title: '内涝应急响应启动',
        description: '监测到城市内涝风险，立即启动应急预案',
        priority: 1,
        nextNodes: ['assess'],
        resources: [
          { type: 'personnel', name: '应急指挥人员', quantity: 3, unit: '人', priority: 1 }
        ]
      },
      {
        id: 'assess',
        type: 'condition',
        title: '态势评估',
        description: '综合评估内涝态势',
        priority: 1,
        conditions: [
          '积水深度 > 30cm',
          '水位上涨速度',
          '受影响区域人口',
          '关键设施状态'
        ],
        nextNodes: ['determine-zone'],
        duration: '15分钟'
      },
      {
        id: 'determine-zone',
        type: 'decision',
        title: '划定危险区域',
        description: '根据积水深度和范围划定疏散区域',
        priority: 1,
        decisionOptions: [
          { label: '积水≤30-50cm', nextNode: 'partial-evacuation' },
          { label: '50-100cm', nextNode: 'full-evacuation' },
          { label: '>100cm', nextNode: 'emergency-evacuation' }
        ]
      },
      {
        id: 'partial-evacuation',
        type: 'action',
        title: '局部区域疏散',
        description: '对危险区域人员疏散，非危险区域就地避险',
        priority: 2,
        actions: [
          '发布预警通知（短信、广播、APP推送',
          '开放社区避难所',
          '安排交通接驳车辆',
          '维持秩序',
          '医疗保障'
        ],
        resources: [
          { type: 'personnel', name: '社区工作人员', quantity: 20, unit: '人', priority: 1 },
          { type: 'transport', name: '大巴车', quantity: 5, unit: '辆', priority: 2 },
          { type: 'material', name: '救生衣', quantity: 500, unit: '件', priority: 1 }
        ],
        nextNodes: ['monitor'],
        responsible: '社区应急办',
        duration: '30分钟'
      },
      {
        id: 'full-evacuation',
        type: 'action',
        title: '全面疏散',
        description: '受影响区域全员疏散',
        priority: 1,
        actions: [
          '启动全员疏散指令',
          '划定多条疏散路线',
          '启动临时安置点',
          '医疗急救点',
          '物资保障'
        ],
        resources: [
          { type: 'personnel', name: '应急救援队', quantity: 50, unit: '人', priority: 1 },
          { type: 'transport', name: '大巴车', quantity: 15, unit: '辆', priority: 1 },
          { type: 'material', name: '饮用水', quantity: 2000, unit: '箱', priority: 1 },
          { type: 'equipment', name: '救生艇', quantity: 5, unit: '艘', priority: 1 }
        ],
        nextNodes: ['monitor'],
        responsible: '市应急管理局',
        duration: '2小时'
      },
      {
        id: 'emergency-evacuation',
        type: 'action',
        title: '紧急疏散',
        description: '危急情况紧急疏散',
        priority: 1,
        actions: [
          '启动紧急响应',
          '请求支援',
          '启动直升机救援',
          '紧急医疗支援'
        ],
        resources: [
          { type: 'personnel', name: '专业救援队伍', quantity: 100, unit: '人', priority: 1 },
          { type: 'transport', name: '冲锋舟', quantity: 20, unit: '艘', priority: 1 },
          { type: 'equipment', name: '无人机', quantity: 10, unit: '架', priority: 1 }
        ],
        nextNodes: ['monitor'],
        responsible: '省应急指挥中心',
        duration: '立即'
      },
      {
        id: 'monitor',
        type: 'condition',
        title: '持续监测',
        description: '持续监测积水、疏散情况',
        priority: 2,
        conditions: [
          '水位变化',
          '天气',
          '安置点人数',
          '疏散进度'
        ],
        nextNodes: ['adjust'],
        duration: '每30分钟'
      },
      {
        id: 'adjust',
        type: 'decision',
        title: '方案调整',
        description: '根据监测结果调整方案',
        priority: 2,
        decisionOptions: [
          { label: '水位下降', nextNode: 'downgrade' },
          { label: '水位稳定', nextNode: 'maintain' },
          { label: '水位上升', nextNode: 'escalate' }
        ]
      },
      {
        id: 'downgrade',
        type: 'action',
        title: '降级响应',
        description: '逐步恢复正常',
        priority: 3,
        actions: ['逐步恢复'],
        nextNodes: ['end'],
        duration: '4-8小时'
      },
      {
        id: 'maintain',
        type: 'action',
        title: '维持当前措施',
        description: '继续当前措施',
        priority: 2,
        nextNodes: ['monitor'],
        duration: '持续'
      },
      {
        id: 'escalate',
        type: 'action',
        title: '升级响应',
        description: '升级应急响应级别',
        priority: 1,
        nextNodes: ['emergency-evacuation'],
        duration: '立即'
      },
      {
        id: 'end',
        type: 'end',
        title: '响应结束',
        description: '内涝响应结束',
        priority: 3,
        actions: ['总结评估', '恢复重建', '预案修订']
      }
    ]
  }
];

export const TYPHOON_SOPS: SOPPlan[] = [
  {
    id: 'typhoon-prepare-evacuate',
    name: '台风来临前准备与疏散SOP',
    disasterType: 'typhoon',
    version: '1.8',
    tags: ['台风', '预防', '转移'],
    startNode: 'start',
    nodes: [
      {
        id: 'start',
        type: 'start',
        title: '台风预警发布',
        description: '收到气象部门台风预警',
        priority: 1,
        nextNodes: ['alert-level'],
        resources: [
          { type: 'personnel', name: '气象联络员', quantity: 2, unit: '人', priority: 1 }
        ]
      },
      {
        id: 'alert-level',
        type: 'decision',
        title: '预警等级判定',
        description: '根据预警等级',
        priority: 1,
        decisionOptions: [
          { label: '蓝色/黄色预警', nextNode: 'pre-warning' },
          { label: '橙色预警', nextNode: 'prepare-evacuate' },
          { label: '红色预警', nextNode: 'force-evacuate' }
        ]
      },
      {
        id: 'pre-warning',
        type: 'action',
        title: '预警准备',
        description: '预警期准备工作',
        priority: 2,
        actions: [
          '宣传教育',
          '物资检查',
          '隐患排查'
        ],
        nextNodes: ['monitor'],
        duration: '72小时'
      },
      {
        id: 'prepare-evacuate',
        type: 'action',
        title: '准备转移',
        description: '危险区域准备转移',
        priority: 1,
        actions: [
          '转移通知',
          '开放避难所',
          '加固建筑'
        ],
        resources: [
          { type: 'personnel', name: '转移安置人员', quantity: 30, unit: '人', priority: 1 },
          { type: 'material', name: '帐篷', quantity: 200, unit: '顶', priority: 1 }
        ],
        nextNodes: ['monitor'],
        duration: '24-48小时'
      },
      {
        id: 'force-evacuate',
        type: 'action',
        title: '强制转移',
        description: '危险区域人员强制转移',
        priority: 1,
        actions: [
          '逐户通知',
          '护送转移',
          '安全保障'
        ],
        resources: [
          { type: 'personnel', name: '公安/武警', quantity: 100, unit: '人', priority: 1 },
          { type: 'transport', name: '车辆', quantity: 30, unit: '辆', priority: 1 }
        ],
        nextNodes: ['monitor'],
        duration: '12-24小时'
      },
      {
        id: 'monitor',
        type: 'condition',
        title: '持续监测',
        description: '持续监测台风动态',
        priority: 1,
        conditions: ['台风路径', '风力', '降水', '潮位'],
        nextNodes: ['end'],
        duration: '每小时'
      },
      {
        id: 'end',
        type: 'end',
        title: '台风过境后',
        description: '台风过境后评估恢复',
        priority: 2,
        actions: ['灾情评估', '恢复重建', '总结']
      }
    ]
  }
];

export const EARTHQUAKE_SOPS: SOPPlan[] = [
  {
    id: 'earthquake-immediate-response',
    name: '地震震后立即响应SOP',
    disasterType: 'earthquake',
    version: '3.0',
    tags: ['地震', '救援', '医疗'],
    startNode: 'start',
    nodes: [
      {
        id: 'start',
        type: 'start',
        title: '地震发生',
        description: '地震发生，启动响应',
        priority: 1,
        nextNodes: ['quick-assess'],
        resources: [
          { type: 'personnel', name: '指挥人员', quantity: 5, unit: '人', priority: 1 }
        ],
        duration: '黄金3分钟'
      },
      {
        id: 'quick-assess',
        type: 'condition',
        title: '快速评估',
        description: '快速评估灾情',
        priority: 1,
        conditions: ['震级', '震感', '建筑', '伤亡'],
        nextNodes: ['determine-level'],
        duration: '15-30分钟'
      },
      {
        id: 'determine-level',
        type: 'decision',
        title: '响应级别确定',
        description: '确定响应级别',
        priority: 1,
        decisionOptions: [
          { label: '一般', nextNode: 'local-response' },
          { label: '较大', nextNode: 'city-response' },
          { label: '重大', nextNode: 'provincial-response' },
          { label: '特别重大', nextNode: 'national-response' }
        ]
      },
      {
        id: 'local-response',
        type: 'action',
        title: '当地响应',
        description: '当地启动响应',
        priority: 2,
        actions: ['搜救', '医疗', '安置'],
        nextNodes: ['search-rescue'],
        duration: '1小时'
      },
      {
        id: 'city-response',
        type: 'action',
        title: '市级响应',
        description: '市级启动响应',
        priority: 1,
        actions: ['专业救援', '医疗', '物资', '通讯'],
        resources: [
          { type: 'personnel', name: '救援队', quantity: 200, unit: '人', priority: 1 },
          { type: 'equipment', name: '生命探测仪', quantity: 20, unit: '台', priority: 1 }
        ],
        nextNodes: ['search-rescue'],
        duration: '2小时'
      },
      {
        id: 'provincial-response',
        type: 'action',
        title: '省级响应',
        description: '省级启动响应',
        priority: 1,
        actions: ['省级救援', '医疗队伍', '物资调配', '支援'],
        resources: [
          { type: 'personnel', name: '救援队', quantity: 1000, unit: '人', priority: 1 },
          { type: 'equipment', name: '挖掘机', quantity: 50, unit: '台', priority: 1 }
        ],
        nextNodes: ['search-rescue'],
        duration: '4小时'
      },
      {
        id: 'national-response',
        type: 'action',
        title: '国家响应',
        description: '国家启动响应',
        priority: 1,
        actions: ['国家救援队', '解放军', '国际支援'],
        nextNodes: ['search-rescue'],
        duration: '立即'
      },
      {
        id: 'search-rescue',
        type: 'action',
        title: '搜救',
        description: '生命搜救',
        priority: 1,
        actions: ['分区搜救', '生命探测', '营救', '医疗急救'],
        nextNodes: ['medical'],
        duration: '黄金72小时'
      },
      {
        id: 'medical',
        type: 'action',
        title: '医疗救治',
        description: '医疗救治',
        priority: 1,
        actions: ['急救点', '重伤员', '后送'],
        nextNodes: ['shelter'],
        duration: '持续'
      },
      {
        id: 'shelter',
        type: 'action',
        title: '临时安置',
        description: '受灾群众安置',
        priority: 2,
        nextNodes: ['end'],
        duration: '持续'
      },
      {
        id: 'end',
        type: 'end',
        title: '响应结束',
        description: '响应结束',
        priority: 3
      }
    ]
  }
];

export const getSOPByType = (disasterType: string): SOPPlan[] => {
  const map: Record<string, SOPPlan[]> = {
    'flood': FLOOD_SOPS,
    'typhoon': TYPHOON_SOPS,
    'earthquake': EARTHQUAKE_SOPS,
    'forest-fire': [],
    'cold-wave': []
  };
  return map[disasterType] || FLOOD_SOPS;
};

export const getSOPById = (id: string): SOPPlan | undefined => {
  return [...FLOOD_SOPS, ...TYPHOON_SOPS, ...EARTHQUAKE_SOPS].find(s => s.id === id);
};
