/**
 * 武汉内涝战役数据
 * 基于应急手册知识库，严格按照内涝响应流程设计
 */

import type { RealDisasterCase } from './real-disaster-cases';

export const wuhanWaterloggingCase: RealDisasterCase = {
  id: 'wuhan-waterlogging-2024',
  name: '武汉特大暴雨内涝灾害',
  date: '2024年7月',
  location: {
    name: '武汉市政府',
    lat: 30.599554,
    lng: 114.305393,
    address: '湖北省武汉市江岸区沿江大道188号',
  },
  description: '2024年7月，武汉市遭遇历史罕见特大暴雨，12小时降雨量突破300毫米，城市排水系统全面超负荷，多条主干道积水深度超过1米，地铁站点进水，数十万人受灾。本次战役模拟从IV级响应逐步升级到I级响应的全过程。',
  type: '内涝',
  level: 'I级',
  casualties: {
    deaths: 12,
    injuries: 156,
    missing: 3,
  },
  timeline: [
    {
      time: '14:00',
      event: '市气象局发布暴雨蓝色预警，预计未来24小时降雨量将达50毫米',
      source: '市气象局',
    },
    {
      time: '16:30',
      event: '降雨量持续增大，1小时降雨量达35毫米，部分路段出现积水',
      source: '市城管局',
    },
    {
      time: '18:00',
      event: '市气象局升级发布暴雨黄色预警，启动III级响应',
      source: '市应急局',
    },
    {
      time: '20:00',
      event: '暴雨强度达到峰值，2小时降雨量超100毫米，多条主干道断交',
      source: '市交警',
    },
    {
      time: '22:00',
      event: '市气象局发布暴雨红色预警，启动I级响应，请求国家级支援',
      source: '市应急指挥中心',
    },
  ],
  decisionPoints: [
    {
      time: '16:00',
      description: '暴雨蓝色预警发布后，部分路段出现积水，需要决定响应级别和处置措施',
      options: [
        '启动IV级响应，组织巡查排涝',
        '观望等待，暂不启动响应',
        '直接启动III级响应，全面戒备',
      ],
      consequences: [
        '及时响应，有效控制初期积水',
        '延误时机，积水扩大',
        '过度响应，资源浪费',
      ],
    },
    {
      time: '19:00',
      description: '暴雨升级为黄色预警，多个主干道积水深度超30cm，需要决定交通管制和人员疏散范围',
      options: [
        '对积水路段实施交通管制，组织低洼区域人员转移',
        '仅发布出行提示，不强制管制',
        '全面封锁受影响区域，大规模疏散',
      ],
      consequences: [
        '有效控制交通风险，保障人员安全',
        '交通混乱，部分车辆涉水熄火',
        '社会影响大，但安全性最高',
      ],
    },
    {
      time: '21:30',
      description: '暴雨达到红色预警，城市大面积积水，需要决定是否请求国家级支援和全面停运',
      options: [
        '启动I级响应，请求国家级支援，全面停运公共交通',
        '维持II级响应，依靠市级力量处置',
        '局部停运，重点保障核心区域',
      ],
      consequences: [
        '获得国家级支援，但社会影响巨大',
        '处置力量不足，灾情持续恶化',
        '平衡处置，但部分区域风险较高',
      ],
    },
  ],
  rescueForces: [
    {
      id: 'fire-brigade-wh',
      name: '武汉市消防救援支队',
      type: '消防',
      lat: 30.5798,
      lng: 114.2599,
      description: '承担人员搜救、排涝抢险任务',
      strength: '500人',
      equipment: ['冲锋舟20艘', '排涝泵车10台', '救生衣500件'],
    },
    {
      id: 'armed-police-wh',
      name: '武警武汉支队',
      type: '武警',
      lat: 30.6067,
      lng: 114.4243,
      description: '承担人员转移、堤坝加固任务',
      strength: '800人',
      equipment: ['冲锋舟15艘', '沙袋10000个', '工程机械5台'],
    },
    {
      id: 'emergency-rescue-wh',
      name: '武汉市应急抢险队',
      type: '应急',
      lat: 30.5928,
      lng: 114.3055,
      description: '承担专业排涝、设备抢修任务',
      strength: '200人',
      equipment: ['龙吸水泵车2台', '移动排涝车5台', '发电机10台'],
    },
    {
      id: 'medical-rescue-wh',
      name: '武汉市医疗救援队',
      type: '医疗',
      lat: 30.5812,
      lng: 114.2950,
      description: '承担伤员救治、卫生防疫任务',
      strength: '100人',
      equipment: ['救护车20辆', '急救药品1000份', '防疫物资500套'],
    },
  ],
  facilities: [
    {
      id: 'tongji-hospital',
      name: '同济医院（主院区）',
      type: 'hospital',
      lat: 30.5796,
      lng: 114.2599,
      description: '三甲医院，承担重伤员救治',
    },
    {
      id: 'union-hospital',
      name: '协和医院（主院区）',
      type: 'hospital',
      lat: 30.5841,
      lng: 114.2747,
      description: '三甲医院，承担批量伤员接收',
    },
    {
      id: 'hongshan-stadium',
      name: '洪山体育馆（洪山体育中心）',
      type: 'shelter',
      lat: 30.5194,
      lng: 114.3378,
      description: '临时安置点，可容纳5000人',
    },
    {
      id: 'wuchang-station',
      name: '武昌火车站',
      type: 'transport',
      lat: 30.5286,
      lng: 114.3179,
      description: '交通枢纽，已进水停运',
    },
    {
      id: 'wuhan-station',
      name: '武汉火车站（高铁站）',
      type: 'transport',
      lat: 30.6067,
      lng: 114.4243,
      description: '武汉高铁站，部分列车停运',
    },
    {
      id: 'hankou-station',
      name: '汉口火车站',
      type: 'transport',
      lat: 30.5945,
      lng: 114.2575,
      description: '汉口铁路枢纽，进出站受阻',
    },
    {
      id: 'wuhan-center-hospital',
      name: '武汉市中心医院',
      type: 'hospital',
      lat: 30.5812,
      lng: 114.2950,
      description: '三级甲等综合医院，接收伤员',
    },
    {
      id: 'wuhan-no3-hospital',
      name: '武汉市第三医院',
      type: 'hospital',
      lat: 30.5406,
      lng: 114.3027,
      description: '三级甲等综合医院，烧伤专科',
    },
    {
      id: 'wuhan-tianhe-airport',
      name: '武汉天河国际机场',
      type: 'transport',
      lat: 30.7737,
      lng: 114.2211,
      description: '4F级国际机场，航班大面积延误',
    },
    {
      id: 'wuhan-emergency-command',
      name: '武汉市应急指挥中心',
      type: 'command_center',
      lat: 30.5872,
      lng: 114.2985,
      description: '市级应急指挥调度中枢（江岸区沿江大道）',
    },
  ],
  weather: {
    temperature: 25,
    windSpeed: 15,
    windDirection: '东南',
    humidity: 95,
    visibility: 2,
  },
  environmentalRisks: [
    {
      type: '次生灾害',
      description: '持续暴雨可能引发山体滑坡',
      probability: '中',
      impact: '阻断救援通道',
    },
    {
      type: '环境污染',
      description: '积水混入污水和化学品',
      probability: '高',
      impact: '引发疫情',
    },
  ],
  mediaReports: [
    {
      time: '14:30',
      source: '武汉发布',
      content: '市气象局发布暴雨蓝色预警，提醒市民注意出行安全',
    },
    {
      time: '18:30',
      source: '楚天都市报',
      content: '武汉遭遇强降雨，部分路段积水严重，交警提醒绕行',
    },
    {
      time: '21:00',
      source: '央视新闻',
      content: '武汉启动I级响应，国家防总派出工作组指导抢险',
    },
  ],
  severity: 'critical',
  lessons: [
    '预警响应要及时，不能观望等待',
    '各部门协调联动至关重要',
    '人员转移要果断，生命安全第一',
    '排水设施需要提前检查和维护',
    '应急物资储备要充足',
  ],
};

// 武汉内涝战役的决策点与应急手册角色映射
export interface DecisionRoleMapping {
  decisionIndex: number;
  requiredRoles: string[]; // 角色ID列表
  situation: string;
  aiGuidance: string;
}

export const wuhanDecisionRoleMappings: DecisionRoleMapping[] = [
  {
    decisionIndex: 0,
    requiredRoles: ['vice-mayor', 'emergency-bureau', 'urban-management', 'traffic-bureau', 'street-office'],
    situation: '城区出现持续强降雨，1小时降雨量≥30mm，主干道积水深度≥30cm且持续20分钟，气象局发布蓝色预警',
    aiGuidance: '根据《市防汛抗旱应急预案》，此时需启动Ⅳ级响应。建议优先组织巡查排涝，同时通知各成员单位按预案要求到岗值班。',
  },
  {
    decisionIndex: 1,
    requiredRoles: ['vice-mayor', 'emergency-bureau', 'police-bureau', 'traffic-bureau', 'urban-management', 'health-bureau', 'weather-bureau'],
    situation: '降雨量持续上升，本市单小时降雨量≥50mm且持续，气象局发布黄色预警，交警监测到多个主干道积水深度超30mm且持续30分钟以上',
    aiGuidance: '根据《市防汛抗旱应急预案》，此时需启动Ⅲ级响应。建议实施交通管制，组织低洼区域人员转移，同时增派医疗力量待命。',
  },
  {
    decisionIndex: 2,
    requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'water-bureau', 'police-bureau', 'traffic-bureau', 'urban-management', 'housing-bureau', 'health-bureau', 'weather-bureau', 'natural-resources', 'telecom', 'power-company', 'armed-police'],
    situation: '本市连续12小时降雨量≥300mm，气象局发布红色预警，主干道积水深度≥100cm且持续扩大，超过10条主干道同时断交超过12小时',
    aiGuidance: '根据《市防汛抗旱应急预案》，此时需启动Ⅰ级响应。建议立即请求国家级支援，全面停运公共交通，组织大规模人员转移。',
  },
];

// 角色在地图上的位置（模拟）
export interface RoleMapPosition {
  roleId: string;
  lat: number;
  lng: number;
  icon: string;
}

export const wuhanRolePositions: RoleMapPosition[] = [
  // 市政府/应急指挥中心 - 江岸区沿江大道，长江北岸（确保不在江中）
  // 武汉市政府实际位置：江岸区沿江大道188号，lat: 30.5872, lng: 114.2985
  { roleId: 'mayor', lat: 30.5872, lng: 114.2985, icon: 'crown' },
  { roleId: 'vice-mayor', lat: 30.5875, lng: 114.2990, icon: 'shield' },
  // 市应急管理局 - 江岸区后湖大道（远离长江）
  { roleId: 'emergency-bureau', lat: 30.6245, lng: 114.3145, icon: 'alert' },
  // 市城管委 - 江岸区解放大道（内陆）
  { roleId: 'urban-management', lat: 30.5955, lng: 114.3125, icon: 'truck' },
  // 市交通运输局 - 江岸区黄孝河路（内陆）
  { roleId: 'traffic-bureau', lat: 30.6055, lng: 114.2755, icon: 'traffic' },
  // 市公安局 - 江汉区发展大道（内陆）
  { roleId: 'police-bureau', lat: 30.6125, lng: 114.2625, icon: 'shield' },
  // 市卫健委 - 江岸区江汉北路（内陆）
  { roleId: 'health-bureau', lat: 30.5905, lng: 114.2785, icon: 'medical' },
  // 市气象局 - 江岸区香港路（内陆）
  { roleId: 'weather-bureau', lat: 30.5995, lng: 114.2925, icon: 'cloud' },
  // 街道办 - 武昌区中南路（内陆）
  { roleId: 'street-office', lat: 30.5325, lng: 114.3225, icon: 'home' },
  // 市住建局 - 江岸区建设大道（内陆）
  { roleId: 'housing-bureau', lat: 30.6025, lng: 114.3055, icon: 'building' },
  // 市自然资源局 - 江岸区三阳路（内陆）
  { roleId: 'natural-resources', lat: 30.5975, lng: 114.2925, icon: 'mountain' },
  // 市通信管理局 - 江汉区建设大道（内陆）
  { roleId: 'telecom', lat: 30.6025, lng: 114.2685, icon: 'wifi' },
  // 市供电公司 - 江岸区解放大道（内陆）
  { roleId: 'power-company', lat: 30.5965, lng: 114.2985, icon: 'zap' },
  // 武警武汉支队 - 武昌区武珞路（内陆）
  { roleId: 'armed-police', lat: 30.5355, lng: 114.3125, icon: 'shield' },
  // 市水务局（水利局）- 江岸区沿江大道，长江北岸（确保不在江中）
  { roleId: 'water-bureau', lat: 30.5885, lng: 114.2965, icon: 'droplets' },
  // 网信办 - 江岸区解放大道（内陆）
  { roleId: 'cyberspace', lat: 30.5945, lng: 114.3105, icon: 'wifi' },
  // 市民政局 - 江岸区台北路（内陆）
  { roleId: 'civil-affairs', lat: 30.6005, lng: 114.2885, icon: 'home' },
];
