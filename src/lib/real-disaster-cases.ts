/**
 * 真实历史灾害案例数据库
 * 基于公开报道和官方通报整理
 * 用于应急哨兵系统的真实场景推演
 */

export interface RealFacility {
  id: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police_station' | 'shelter' | 'command_center' | 'school' | 'army_base' | 'airport';
  lat: number;
  lng: number;
  capacity?: string;
  description?: string;
}

export interface RescueForce {
  id: string;
  name: string;
  type: 'fire_brigade' | 'armed_police' | 'army' | 'militia' | 'medical_team' | 'engineering' | 'volunteer';
  lat: number;
  lng: number;
  arrivalTime?: string;
  description: string;
  strength?: string;
}

export interface DecisionPoint {
  time: string;
  description: string;
  options: string[];
  consequences: string[];
}

export interface TimelineEvent {
  time: string;
  event: string;
  source?: string;
}

export interface RealDisasterCase {
  id: string;
  name: string;
  type: 'fire' | 'flood' | 'earthquake' | 'typhoon' | 'chemical' | 'explosion' | 'forest_fire';
  date: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  casualties: {
    deaths: number;
    injuries: number;
    missing?: number;
  };
  economicLoss?: string;
  description: string;
  facilities: RealFacility[];
  rescueForces: RescueForce[];
  timeline: TimelineEvent[];
  decisionPoints: DecisionPoint[];
  lessons: string[];
  // 危险区域配置
  dangerZones?: {
    center: { lat: number; lng: number };
    radius: number;
    level: 'high' | 'medium' | 'low';
  }[];
}

// 天津港"8·12"特别重大火灾爆炸事故
export const tianjinExplosion: RealDisasterCase = {
  id: 'tianjin-812',
  name: '天津港"8·12"特别重大火灾爆炸事故',
  type: 'explosion',
  date: '2015-08-12',
  location: {
    name: '天津市滨海新区天津港瑞海公司危险品仓库',
    lat: 39.0308,
    lng: 117.7506,
  },
  severity: 'critical',
  casualties: {
    deaths: 165,
    injuries: 798,
    missing: 8,
  },
  economicLoss: '68.66亿元人民币',
  description: '2015年8月12日23时34分左右，天津滨海新区天津港瑞海国际物流有限公司危险品仓库发生火灾爆炸事故。首次爆炸发生在23时34分6秒，近震震级ML约2.3级；30秒后发生第二次更剧烈爆炸，近震震级ML约2.9级。事故造成165人遇难，8人失踪，798人受伤。',
  dangerZones: [
    { center: { lat: 39.0308, lng: 117.7506 }, radius: 500, level: 'high' },
    { center: { lat: 39.0308, lng: 117.7506 }, radius: 1000, level: 'medium' },
    { center: { lat: 39.0308, lng: 117.7506 }, radius: 2000, level: 'low' },
  ],
  facilities: [
    { id: 'tj-hospital-1', name: '泰达医院', type: 'hospital', lat: 39.0321, lng: 117.7215, capacity: '床位800张', description: '距离爆炸点约2.5公里，接收大量伤员' },
    { id: 'tj-hospital-2', name: '天津港口医院', type: 'hospital', lat: 39.0056, lng: 117.7158, capacity: '床位300张', description: '港口职工医院，第一时间参与救援' },
    { id: 'tj-hospital-3', name: '天津市第五中心医院', type: 'hospital', lat: 39.0245, lng: 117.6889, capacity: '床位1000张', description: '滨海新区主要三甲医院' },
    { id: 'tj-hospital-4', name: '天津医科大学总医院滨海医院', type: 'hospital', lat: 39.0412, lng: 117.7389, capacity: '床位500张', description: '接收爆炸伤员' },
    { id: 'tj-hospital-5', name: '天津泰达心血管病医院', type: 'hospital', lat: 39.0156, lng: 117.7089, capacity: '床位500张', description: '专科医院，接收烧伤患者' },
    { id: 'tj-fire-1', name: '天津港消防支队', type: 'fire_station', lat: 39.0289, lng: 117.7489, description: '第一时间到场扑救，遭受重大伤亡' },
    { id: 'tj-fire-2', name: '滨海新区消防支队', type: 'fire_station', lat: 39.0456, lng: 117.7234, description: '增援力量' },
    { id: 'tj-fire-3', name: '天津消防总队特勤支队', type: 'fire_station', lat: 39.1256, lng: 117.2156, description: '危化品处置专业力量' },
    { id: 'tj-police-1', name: '天津港公安局', type: 'police_station', lat: 39.0267, lng: 117.7456, description: '现场警戒和交通管制' },
    { id: 'tj-police-2', name: '滨海新区公安局', type: 'police_station', lat: 39.0423, lng: 117.7312, description: '增援警力' },
    { id: 'tj-shelter-1', name: '泰达二中临时安置点', type: 'shelter', lat: 39.0389, lng: 117.7289, description: '安置周边疏散居民约3000人' },
    { id: 'tj-shelter-2', name: '滨海新区文化中心', type: 'shelter', lat: 39.0356, lng: 117.7189, description: '临时避难场所' },
    { id: 'tj-shelter-3', name: '天津科技大学体育馆', type: 'shelter', lat: 39.0556, lng: 117.7389, description: '临时安置点' },
    { id: 'tj-command-1', name: '滨海新区应急指挥中心', type: 'command_center', lat: 39.0423, lng: 117.7312, description: '现场指挥调度' },
    { id: 'tj-army-1', name: '北京军区天津疗养院', type: 'army_base', lat: 39.0856, lng: 117.6856, description: '军队医疗资源' },
  ],
  rescueForces: [
    { id: 'tj-force-1', name: '天津港专职消防队', type: 'fire_brigade', lat: 39.0289, lng: 117.7489, arrivalTime: '23:40', description: '首批到场，共约100人，遭受重大伤亡', strength: '约100人' },
    { id: 'tj-force-2', name: '天津市公安消防总队', type: 'fire_brigade', lat: 39.1256, lng: 117.2156, arrivalTime: '00:30', description: '调集46个消防中队，1200余名消防官兵', strength: '1200余人' },
    { id: 'tj-force-3', name: '武警天津总队', type: 'armed_police', lat: 39.0856, lng: 117.6856, arrivalTime: '01:00', description: '约2200名武警官兵参与救援', strength: '约2200人' },
    { id: 'tj-force-4', name: '北京军区某部', type: 'army', lat: 39.1567, lng: 117.5234, arrivalTime: '02:00', description: '防化部队和工程兵参与', strength: '约1500人' },
    { id: 'tj-force-5', name: '国家核生化应急救援队', type: 'engineering', lat: 39.1056, lng: 117.6234, arrivalTime: '03:00', description: '核生化检测和洗消', strength: '约200人' },
    { id: 'tj-force-6', name: '天津医科大学医疗队', type: 'medical_team', lat: 39.1023, lng: 117.1756, arrivalTime: '00:15', description: '多支医疗队赶赴现场', strength: '约300人' },
    { id: 'tj-force-7', name: '天津警备区民兵', type: 'militia', lat: 39.0456, lng: 117.7234, arrivalTime: '23:50', description: '地方民兵参与救援', strength: '约500人' },
  ],
  timeline: [
    { time: '22:50', event: '瑞海公司仓库发生火灾', source: '监控记录' },
    { time: '23:06', event: '天津港消防支队接警出动', source: '消防记录' },
    { time: '23:13', event: '首批消防员到达现场开始扑救', source: '消防记录' },
    { time: '23:34:06', event: '发生第一次爆炸，震级约2.3级', source: '地震台网' },
    { time: '23:34:36', event: '发生第二次更剧烈爆炸，震级约2.9级', source: '地震台网' },
    { time: '23:40', event: '天津市委、市政府主要负责同志赶赴现场', source: '官方通报' },
    { time: '00:00', event: '成立现场救援指挥部', source: '官方通报' },
    { time: '00:30', event: '周边3公里范围内人员开始疏散', source: '应急指挥' },
    { time: '02:00', event: '国务院工作组赶赴现场', source: '国务院' },
    { time: '06:00', event: '明火基本扑灭，转入清理阶段', source: '消防报告' },
  ],
  decisionPoints: [
    {
      time: '23:10',
      description: '消防员到场后发现火势异常，仓库内可能存放危险品',
      options: ['继续内攻灭火', '撤出人员、扩大警戒范围', '请求危化品专家到场'],
      consequences: ['坚持内攻导致重大伤亡', '可能延误灭火时机但保护人员', '需要时间但更安全'],
    },
    {
      time: '23:35',
      description: '发生两次大爆炸后，现场情况不明，可能存在二次爆炸风险',
      options: ['立即组织所有力量进入现场搜救', '先评估风险再进入', '仅在外围搜救'],
      consequences: ['可能遭遇二次爆炸', '延误救援时间', '无法救出核心区被困人员'],
    },
    {
      time: '00:00',
      description: '有毒气体扩散，下风向居民区受到威胁',
      options: ['疏散下风向3公里居民', '疏散下风向5公里居民', '仅建议居民关窗避难'],
      consequences: ['疏散3万人', '疏散10万人，社会成本巨大', '可能造成人员中毒'],
    },
  ],
  lessons: [
    '危险品仓库规划布局不合理，距离居民区过近',
    '消防力量对危化品火灾处置能力不足',
    '企业瞒报、谎报危险品储存情况',
    '应急响应机制不够完善，初期决策困难',
    '需要建立危化品事故专业处置队伍',
  ],
};

// 郑州"7·20"特大暴雨灾害
export const zhengzhouFlood: RealDisasterCase = {
  id: 'zhengzhou-720',
  name: '河南郑州"7·20"特大暴雨灾害',
  type: 'flood',
  date: '2021-07-20',
  location: {
    name: '河南省郑州市',
    lat: 34.7659,
    lng: 113.6841,
  },
  severity: 'critical',
  casualties: {
    deaths: 380,
    injuries: 292,
    missing: 50,
  },
  economicLoss: '532亿元人民币',
  description: '2021年7月17日至23日，河南省遭遇历史罕见特大暴雨，郑州市最大小时降雨量达201.9毫米，突破中国大陆小时降雨量极值。郑州地铁5号线隧道积水导致14人死亡，京广北路隧道大量车辆被淹。',
  dangerZones: [
    { center: { lat: 34.7659, lng: 113.6841 }, radius: 5000, level: 'high' },
    { center: { lat: 34.7659, lng: 113.6841 }, radius: 10000, level: 'medium' },
  ],
  facilities: [
    { id: 'zz-hospital-1', name: '郑州大学第一附属医院', type: 'hospital', lat: 34.7506, lng: 113.6489, capacity: '床位10000张', description: '河医院区停电，紧急转移重症患者' },
    { id: 'zz-hospital-2', name: '河南省人民医院', type: 'hospital', lat: 34.7689, lng: 113.6789, capacity: '床位3000张', description: '接收暴雨伤员' },
    { id: 'zz-hospital-3', name: '郑州市中心医院', type: 'hospital', lat: 34.7456, lng: 113.6289, capacity: '床位2000张', description: '参与救援' },
    { id: 'zz-hospital-4', name: '郑州人民医院', type: 'hospital', lat: 34.7589, lng: 113.6589, capacity: '床位1500张', description: '接收伤员' },
    { id: 'zz-shelter-1', name: '郑州国际会展中心', type: 'shelter', lat: 34.7567, lng: 113.7189, description: '安置受灾群众约5000人' },
    { id: 'zz-shelter-2', name: '河南省体育馆', type: 'shelter', lat: 34.7589, lng: 113.6689, description: '临时避难场所' },
    { id: 'zz-shelter-3', name: '郑州大学体育馆', type: 'shelter', lat: 34.8189, lng: 113.5389, description: '新校区安置点' },
    { id: 'zz-shelter-4', name: '郑州奥林匹克体育中心', type: 'shelter', lat: 34.6989, lng: 113.5389, description: '大型安置点' },
    { id: 'zz-fire-1', name: '郑州市消防支队', type: 'fire_station', lat: 34.7389, lng: 113.6589, description: '地铁隧道排水救援' },
    { id: 'zz-fire-2', name: '河南省消防救援总队', type: 'fire_station', lat: 34.7689, lng: 113.6889, description: '省级消防指挥中心' },
    { id: 'zz-police-1', name: '郑州市公安局', type: 'police_station', lat: 34.7289, lng: 113.6489, description: '交通管制和秩序维护' },
    { id: 'zz-school-1', name: '郑州外国语学校', type: 'school', lat: 34.7789, lng: 113.6889, description: '临时安置点' },
    { id: 'zz-school-2', name: '郑州一中', type: 'school', lat: 34.7489, lng: 113.6689, description: '临时安置点' },
    { id: 'zz-army-1', name: '郑州联勤保障中心', type: 'army_base', lat: 34.6856, lng: 113.5589, description: '军队后勤保障基地' },
    { id: 'zz-airport-1', name: '郑州新郑国际机场', type: 'airport', lat: 34.5189, lng: 113.8389, description: '救援物资空运基地' },
  ],
  rescueForces: [
    { id: 'zz-force-1', name: '中部战区陆军', type: 'army', lat: 34.6856, lng: 113.5589, arrivalTime: '07-20 14:00', description: '第83集团军某旅约3000人', strength: '约3000人' },
    { id: 'zz-force-2', name: '武警河南总队', type: 'armed_police', lat: 34.7156, lng: 113.6189, arrivalTime: '07-20 12:00', description: '约1500名武警官兵', strength: '约1500人' },
    { id: 'zz-force-3', name: '河南省消防救援总队', type: 'fire_brigade', lat: 34.7389, lng: 113.6589, arrivalTime: '07-20 08:00', description: '调集全省消防力量', strength: '约2000人' },
    { id: 'zz-force-4', name: '国家矿山应急救援队', type: 'engineering', lat: 34.6956, lng: 113.5789, arrivalTime: '07-20 16:00', description: '隧道排水专业设备', strength: '约300人' },
    { id: 'zz-force-5', name: '蓝天救援队', type: 'volunteer', lat: 34.7256, lng: 113.6389, arrivalTime: '07-20 10:00', description: '民间救援力量', strength: '约500人' },
    { id: 'zz-force-6', name: '空降兵某旅', type: 'army', lat: 34.6556, lng: 113.5989, arrivalTime: '07-20 18:00', description: '空降兵"黄继光英雄连"', strength: '约800人' },
    { id: 'zz-force-7', name: '河南陆军预备役', type: 'militia', lat: 34.7456, lng: 113.6289, arrivalTime: '07-20 09:00', description: '地方预备役部队', strength: '约1000人' },
  ],
  timeline: [
    { time: '07-17', event: '河南省气象台发布暴雨预警', source: '气象部门' },
    { time: '07-19 21:00', event: '郑州市气象局发布暴雨红色预警', source: '气象局' },
    { time: '07-20 08:00', event: '郑州城区开始严重积水', source: '市民报告' },
    { time: '07-20 16:00', event: '郑州地铁5号线隧道进水', source: '地铁公司' },
    { time: '07-20 18:00', event: '地铁5号线列车迫停，乘客被困', source: '乘客求救' },
    { time: '07-20 20:00', event: '京广北路隧道大量车辆被淹', source: '现场视频' },
    { time: '07-20 21:00', event: '郑大一附院河医院区停电', source: '医院通报' },
    { time: '07-21 02:00', event: '地铁被困人员陆续获救', source: '救援报告' },
    { time: '07-21 06:00', event: '解放军和武警部队大规模投入救援', source: '军方通报' },
  ],
  decisionPoints: [
    {
      time: '07-20 08:00',
      description: '城区积水严重，地铁是否停运？',
      options: ['立即停运所有地铁线路', '部分线路限速运行', '维持正常运行'],
      consequences: ['影响数十万人出行', '5号线最终仍发生事故', '造成重大伤亡'],
    },
    {
      time: '07-20 16:00',
      description: '地铁5号线隧道进水，列车被困',
      options: ['组织乘客隧道内疏散', '尝试倒车返回车站', '等待外部救援'],
      consequences: ['疏散困难，水位上涨', '隧道已被淹无法倒车', '延误救援时机'],
    },
    {
      time: '07-20 21:00',
      description: '三甲医院停电，ICU重症患者生命垂危',
      options: ['紧急转运所有重症患者', '启用备用发电机维持', '请求军队支援发电'],
      consequences: ['转运风险极高', '备用电源有限', '需要协调时间'],
    },
  ],
  lessons: [
    '城市排水系统设计标准偏低',
    '地铁防洪预案不完善',
    '极端天气预警响应机制需要完善',
    '医院应急供电能力不足',
    '城市地下空间防洪是薄弱环节',
  ],
};

// 四川凉山森林火灾
export const liangshanFire: RealDisasterCase = {
  id: 'liangshan-330',
  name: '四川凉山木里森林火灾',
  type: 'forest_fire',
  date: '2019-03-30',
  location: {
    name: '四川省凉山州木里县雅砻江镇',
    lat: 27.9289,
    lng: 101.2789,
  },
  severity: 'critical',
  casualties: {
    deaths: 31,
    injuries: 0,
  },
  economicLoss: '生态损失巨大',
  description: '2019年3月30日，四川省凉山州木里县雅砻江镇立尔村发生森林火灾。3月31日下午，扑火人员在转场途中突遇山火爆燃，31名扑火人员不幸牺牲，包括27名森林消防员和4名地方干部群众。',
  dangerZones: [
    { center: { lat: 27.9289, lng: 101.2789 }, radius: 2000, level: 'high' },
    { center: { lat: 27.9289, lng: 101.2789 }, radius: 5000, level: 'medium' },
  ],
  facilities: [
    { id: 'ls-hospital-1', name: '木里县人民医院', type: 'hospital', lat: 27.9389, lng: 101.2589, capacity: '床位100张', description: '县级医院，救治能力有限' },
    { id: 'ls-hospital-2', name: '西昌市人民医院', type: 'hospital', lat: 27.8989, lng: 102.2689, capacity: '床位800张', description: '距离约200公里，最近的三甲医院' },
    { id: 'ls-hospital-3', name: '凉山州第一人民医院', type: 'hospital', lat: 27.8889, lng: 102.2589, capacity: '床位1000张', description: '州级医院' },
    { id: 'ls-fire-1', name: '木里县森林消防大队', type: 'fire_station', lat: 27.9289, lng: 101.2789, description: '地方森林消防力量' },
    { id: 'ls-fire-2', name: '凉山州森林消防支队', type: 'fire_station', lat: 27.8989, lng: 102.1989, description: '州级森林消防' },
    { id: 'ls-shelter-1', name: '立尔村村委会', type: 'shelter', lat: 27.9189, lng: 101.2889, description: '村民临时避难' },
    { id: 'ls-shelter-2', name: '雅砻江镇中心小学', type: 'shelter', lat: 27.9389, lng: 101.2689, description: '临时避难场所' },
    { id: 'ls-command-1', name: '火场前线指挥部', type: 'command_center', lat: 27.9256, lng: 101.2756, description: '火场指挥' },
    { id: 'ls-army-1', name: '西昌卫星发射中心', type: 'army_base', lat: 28.1289, lng: 102.0289, description: '军队基地，提供支援' },
  ],
  rescueForces: [
    { id: 'ls-force-1', name: '凉山州森林消防支队', type: 'fire_brigade', lat: 27.8989, lng: 102.1989, arrivalTime: '03-30 18:00', description: '地方专业森林消防队伍', strength: '约200人' },
    { id: 'ls-force-2', name: '四川省森林消防总队', type: 'fire_brigade', lat: 30.6589, lng: 104.0689, arrivalTime: '03-31 06:00', description: '省级增援力量', strength: '约500人' },
    { id: 'ls-force-3', name: '应急管理部森林消防局', type: 'fire_brigade', lat: 39.9049, lng: 116.4074, arrivalTime: '03-31 12:00', description: '国家层面调派', strength: '约300人' },
    { id: 'ls-force-4', name: '当地民兵应急分队', type: 'militia', lat: 27.9189, lng: 101.2689, arrivalTime: '03-30 20:00', description: '地方民兵参与扑救和后勤', strength: '约300人' },
    { id: 'ls-force-5', name: '直升机灭火编队', type: 'engineering', lat: 27.9089, lng: 102.1589, arrivalTime: '03-31 08:00', description: 'M-26、K-32等直升机吊桶灭火', strength: '约10架' },
    { id: 'ls-force-6', name: '武警凉山支队', type: 'armed_police', lat: 27.8889, lng: 102.2489, arrivalTime: '03-31 04:00', description: '武警参与救援', strength: '约400人' },
  ],
  timeline: [
    { time: '03-30 18:00', event: '木里县雅砻江镇立尔村发生森林火灾', source: '村民报告' },
    { time: '03-30 19:00', event: '凉山州森林消防支队接警出动', source: '消防记录' },
    { time: '03-31 08:00', event: '多路扑火人员向火场集结', source: '指挥部' },
    { time: '03-31 13:00', event: '扑火人员从山脚向山顶转场', source: '现场记录' },
    { time: '03-31 15:30', event: '突发山火爆燃，31人被困', source: '幸存者' },
    { time: '03-31 16:00', event: '31名扑火人员确认牺牲', source: '救援报告' },
    { time: '04-01', event: '应急管理部工作组赶赴现场', source: '应急管理部' },
    { time: '04-04', event: '明火全部扑灭', source: '消防报告' },
  ],
  decisionPoints: [
    {
      time: '03-31 08:00',
      description: '火场风力加大，是否继续组织人员上山扑救？',
      options: ['继续组织人员上山', '暂停人工扑救、改用直升机', '全部撤出、设置隔离带'],
      consequences: ['遭遇爆燃造成重大伤亡', '可能延误灭火时机', '放弃扑救让火势蔓延'],
    },
    {
      time: '03-31 13:00',
      description: '扑火人员从山脚向山顶转场，风向突变',
      options: ['加速通过危险区域', '原地避险等待风停', '立即撤离到安全区'],
      consequences: ['突遇爆燃', '可能错过最佳撤离时间', '火势扩大'],
    },
  ],
  lessons: [
    '对高山林区火场气象变化认识不足',
    '火场指挥员对爆燃风险判断不够',
    '缺乏火场紧急避险训练',
    '需要加强航空灭火能力建设',
    '应建立火场气象实时监测机制',
  ],
};

// 江苏响水"3·21"特别重大爆炸事故
export const xiangshuiExplosion: RealDisasterCase = {
  id: 'xiangshui-321',
  name: '江苏响水"3·21"特别重大爆炸事故',
  type: 'chemical',
  date: '2019-03-21',
  location: {
    name: '江苏省盐城市响水县陈家港镇',
    lat: 34.1989,
    lng: 119.5789,
  },
  severity: 'critical',
  casualties: {
    deaths: 78,
    injuries: 617,
  },
  economicLoss: '19.86亿元人民币',
  description: '2019年3月21日14时48分，位于江苏省盐城市响水县生态化工园区的天嘉宜化工有限公司发生特别重大爆炸事故。事故造成78人死亡、76人重伤、640人住院治疗。',
  dangerZones: [
    { center: { lat: 34.1989, lng: 119.5789 }, radius: 800, level: 'high' },
    { center: { lat: 34.1989, lng: 119.5789 }, radius: 2000, level: 'medium' },
  ],
  facilities: [
    { id: 'xs-hospital-1', name: '响水县人民医院', type: 'hospital', lat: 34.2289, lng: 119.5989, capacity: '床位500张', description: '接收大量伤员，超负荷运转' },
    { id: 'xs-hospital-2', name: '盐城市第一人民医院', type: 'hospital', lat: 33.3789, lng: 120.1289, capacity: '床位2000张', description: '接收重症伤员' },
    { id: 'xs-hospital-3', name: '连云港市第一人民医院', type: 'hospital', lat: 34.5989, lng: 119.1789, capacity: '床位1500张', description: '跨区域接收伤员' },
    { id: 'xs-hospital-4', name: '滨海县人民医院', type: 'hospital', lat: 34.0089, lng: 119.8289, capacity: '床位800张', description: '接收伤员' },
    { id: 'xs-fire-1', name: '响水县消防大队', type: 'fire_station', lat: 34.2189, lng: 119.5889, description: '首批到场' },
    { id: 'xs-fire-2', name: '盐城市消防支队', type: 'fire_station', lat: 33.3889, lng: 120.1189, description: '增援力量' },
    { id: 'xs-fire-3', name: '连云港市消防支队', type: 'fire_station', lat: 34.5989, lng: 119.1789, description: '跨区域增援' },
    { id: 'xs-shelter-1', name: '响水中学', type: 'shelter', lat: 34.2089, lng: 119.5689, description: '临时安置点' },
    { id: 'xs-shelter-2', name: '响水县体育馆', type: 'shelter', lat: 34.2189, lng: 119.5989, description: '临时安置点' },
    { id: 'xs-police-1', name: '响水县公安局', type: 'police_station', lat: 34.2189, lng: 119.5989, description: '现场警戒' },
    { id: 'xs-command-1', name: '盐城市应急指挥中心', type: 'command_center', lat: 33.3789, lng: 120.1289, description: '市级指挥' },
    { id: 'xs-army-1', name: '东部战区某部', type: 'army_base', lat: 34.2589, lng: 119.6089, description: '军队支援基地' },
  ],
  rescueForces: [
    { id: 'xs-force-1', name: '盐城市消防救援支队', type: 'fire_brigade', lat: 33.3889, lng: 120.1189, arrivalTime: '14:55', description: '首批专业救援力量', strength: '约300人' },
    { id: 'xs-force-2', name: '江苏省消防救援总队', type: 'fire_brigade', lat: 32.0589, lng: 118.7789, arrivalTime: '16:00', description: '调集全省消防力量', strength: '约800人' },
    { id: 'xs-force-3', name: '国家危险化学品应急救援队', type: 'engineering', lat: 39.9049, lng: 116.4074, arrivalTime: '18:00', description: '危化品专业处置', strength: '约200人' },
    { id: 'xs-force-4', name: '东部战区陆军某部', type: 'army', lat: 34.2589, lng: 119.6089, arrivalTime: '15:30', description: '防化部队参与救援', strength: '约1000人' },
    { id: 'xs-force-5', name: '武警江苏总队', type: 'armed_police', lat: 32.0589, lng: 118.7789, arrivalTime: '16:30', description: '现场警戒和搜救', strength: '约600人' },
    { id: 'xs-force-6', name: '江苏省军区民兵', type: 'militia', lat: 34.2189, lng: 119.5889, arrivalTime: '15:00', description: '地方民兵参与', strength: '约400人' },
  ],
  timeline: [
    { time: '14:48', event: '天嘉宜公司发生爆炸', source: '监控记录' },
    { time: '14:50', event: '响水县消防大队接警', source: '消防记录' },
    { time: '14:55', event: '首批消防力量到场', source: '消防记录' },
    { time: '15:00', event: '盐城市启动应急响应', source: '市政府' },
    { time: '15:30', event: '周边群众开始疏散', source: '应急指挥' },
    { time: '16:00', event: '江苏省启动省级应急响应', source: '省政府' },
    { time: '18:00', event: '国务院工作组赶赴现场', source: '国务院' },
    { time: '22:00', event: '明火扑灭，转入搜救', source: '消防报告' },
  ],
  decisionPoints: [
    {
      time: '14:55',
      description: '爆炸后现场可能存在二次爆炸和有毒气体泄漏',
      options: ['立即进入核心区搜救', '先检测环境安全再进入', '仅在外围搜救'],
      consequences: ['可能遭遇二次爆炸', '延误救援时间', '无法救出核心区人员'],
    },
    {
      time: '15:30',
      description: '下风向检测到苯等有毒气体',
      options: ['疏散下风向1公里居民', '疏散下风向3公里居民', '仅建议居民关窗'],
      consequences: ['可能不够安全', '影响数万人', '可能造成中毒'],
    },
  ],
  lessons: [
    '化工园区规划不合理，安全距离不足',
    '企业长期违法储存硝化废料',
    '安全监管存在漏洞',
    '应急救援预案不完善',
    '危化品事故需要专业处置力量',
  ],
};

// 汶川地震
export const wenchuanEarthquake: RealDisasterCase = {
  id: 'wenchuan-512',
  name: '四川汶川特大地震',
  type: 'earthquake',
  date: '2008-05-12',
  location: {
    name: '四川省阿坝州汶川县映秀镇',
    lat: 31.0214,
    lng: 103.5689,
  },
  severity: 'critical',
  casualties: {
    deaths: 69227,
    injuries: 374643,
    missing: 17923,
  },
  economicLoss: '8451亿元人民币',
  description: '2008年5月12日14时28分04秒，四川省阿坝藏族羌族自治州汶川县发生里氏8.0级特大地震，震源深度14公里。地震造成69227人遇难、17923人失踪、374643人受伤。这是新中国成立以来破坏性最强、波及范围最广、救灾难度最大的一次地震。',
  dangerZones: [
    { center: { lat: 31.0214, lng: 103.5689 }, radius: 10000, level: 'high' },
    { center: { lat: 31.0214, lng: 103.5689 }, radius: 50000, level: 'medium' },
  ],
  facilities: [
    { id: 'wc-hospital-1', name: '汶川县人民医院', type: 'hospital', lat: 31.0214, lng: 103.5789, capacity: '已倒塌', description: '医院建筑严重损毁' },
    { id: 'wc-hospital-2', name: '都江堰市人民医院', type: 'hospital', lat: 30.9889, lng: 103.6189, capacity: '床位500张', description: '接收大量伤员' },
    { id: 'wc-hospital-3', name: '成都军区总医院', type: 'hospital', lat: 30.6689, lng: 104.0189, capacity: '床位1500张', description: '军队医院，接收重伤员' },
    { id: 'wc-hospital-4', name: '四川大学华西医院', type: 'hospital', lat: 30.6389, lng: 104.0589, capacity: '床位3000张', description: '国家级医疗中心' },
    { id: 'wc-shelter-1', name: '映秀镇中学操场', type: 'shelter', lat: 31.0114, lng: 103.5589, description: '临时避难场所' },
    { id: 'wc-shelter-2', name: '都江堰聚源中学', type: 'shelter', lat: 30.9789, lng: 103.6089, description: '学校倒塌，后改为救援点' },
    { id: 'wc-shelter-3', name: '北川中学', type: 'shelter', lat: 31.8189, lng: 104.4589, description: '学校倒塌，救援重点区域' },
    { id: 'wc-command-1', name: '成都军区抗震救灾指挥部', type: 'command_center', lat: 30.6689, lng: 104.0489, description: '军队前线指挥' },
    { id: 'wc-command-2', name: '国务院抗震救灾指挥部', type: 'command_center', lat: 30.6689, lng: 104.0689, description: '国家级指挥' },
    { id: 'wc-fire-1', name: '阿坝州消防支队', type: 'fire_station', lat: 31.9014, lng: 102.2289, description: '州级消防力量' },
    { id: 'wc-police-1', name: '汶川县公安局', type: 'police_station', lat: 31.0214, lng: 103.5789, description: '建筑倒塌' },
    { id: 'wc-airport-1', name: '成都双流国际机场', type: 'airport', lat: 30.5789, lng: 103.9489, description: '救援物资空运基地' },
    { id: 'wc-airport-2', name: '绵阳南郊机场', type: 'airport', lat: 31.4289, lng: 104.7389, description: '军用机场，救援通道' },
  ],
  rescueForces: [
    { id: 'wc-force-1', name: '成都军区第13集团军', type: 'army', lat: 30.6689, lng: 104.0689, arrivalTime: '5-12 16:00', description: '首批进入震中的部队', strength: '约10000人' },
    { id: 'wc-force-2', name: '空降兵15军', type: 'army', lat: 31.0014, lng: 103.5489, arrivalTime: '5-14 12:00', description: '空降茂县，开辟生命通道', strength: '约5000人' },
    { id: 'wc-force-3', name: '武警四川总队', type: 'armed_police', lat: 30.6689, lng: 104.0189, arrivalTime: '5-12 15:30', description: '首批救援力量', strength: '约8000人' },
    { id: 'wc-force-4', name: '国家地震灾害紧急救援队', type: 'engineering', lat: 39.9049, lng: 116.4074, arrivalTime: '5-12 20:00', description: '中国国际救援队', strength: '约300人' },
    { id: 'wc-force-5', name: '消防四川总队', type: 'fire_brigade', lat: 30.6689, lng: 104.0289, arrivalTime: '5-12 15:00', description: '专业搜救', strength: '约2000人' },
    { id: 'wc-force-6', name: '民兵预备役部队', type: 'militia', lat: 31.0214, lng: 103.5689, arrivalTime: '5-12 14:40', description: '地方民兵第一时间自救互救', strength: '约50000人' },
    { id: 'wc-force-7', name: '海军陆战队', type: 'army', lat: 31.2189, lng: 104.4589, arrivalTime: '5-13 08:00', description: '海军参与救援', strength: '约3000人' },
    { id: 'wc-force-8', name: '第二炮兵部队', type: 'army', lat: 30.8689, lng: 104.1689, arrivalTime: '5-13 10:00', description: '工程兵部队', strength: '约5000人' },
  ],
  timeline: [
    { time: '14:28:04', event: '发生里氏8.0级特大地震', source: '地震台网' },
    { time: '14:40', event: '四川省启动应急响应', source: '省政府' },
    { time: '14:46', event: '胡锦涛总书记作出重要指示', source: '新华社' },
    { time: '15:00', event: '温家宝总理飞赴灾区', source: '新华社' },
    { time: '16:00', event: '成都军区部队向震中开进', source: '军方' },
    { time: '17:00', event: '道路全部中断，部队徒步进入', source: '军方' },
    { time: '5-13', event: '全国动员，多省救援队赶赴灾区', source: '应急指挥' },
    { time: '5-14', event: '空降兵15军空降茂县', source: '军方' },
    { time: '5-15', event: '打通通往汶川的生命通道', source: '交通部' },
  ],
  decisionPoints: [
    {
      time: '14:40',
      description: '通信中断，震中情况不明',
      options: ['等待通信恢复再行动', '立即派侦察分队徒步进入', '先在外围展开救援'],
      consequences: ['延误黄金救援时间', '冒着余震和塌方风险', '无法了解震中灾情'],
    },
    {
      time: '5-13',
      description: '大量伤员需要转运，道路中断',
      options: ['组织直升机大规模转运', '抢修道路后转运', '就地治疗'],
      consequences: ['直升机运力有限', '需要数天时间', '医疗条件不足'],
    },
    {
      time: '5-14',
      description: '堰塞湖形成，下游数十万人受威胁',
      options: ['立即疏散下游群众', '组织力量爆破排险', '等待自然溃坝'],
      consequences: ['疏散数十万人', '爆破风险极高', '可能造成更大灾难'],
    },
  ],
  lessons: [
    '建筑抗震设防标准需要提高',
    '学校等公共建筑应优先保障安全',
    '应急救援通道需要保障',
    '需要建立军地协同应急机制',
    '地震预警系统建设迫在眉睫',
  ],
};

// 所有案例集合
export const realDisasterCases: RealDisasterCase[] = [
  tianjinExplosion,
  zhengzhouFlood,
  liangshanFire,
  xiangshuiExplosion,
  wenchuanEarthquake,
];

// 按类型索引
export const casesByType: Record<string, RealDisasterCase[]> = {
  explosion: [tianjinExplosion, xiangshuiExplosion],
  flood: [zhengzhouFlood],
  forest_fire: [liangshanFire],
  earthquake: [wenchuanEarthquake],
  chemical: [xiangshuiExplosion],
  fire: [tianjinExplosion, liangshanFire],
};

// 获取指定类型的案例
export function getCasesByType(type: string): RealDisasterCase[] {
  return casesByType[type] || [];
}

// 获取指定ID的案例
export function getCaseById(id: string): RealDisasterCase | undefined {
  return realDisasterCases.find(c => c.id === id);
}

// 将真实案例转换为地图实体
export function caseToMapEntities(caseData: RealDisasterCase): any[] {
  const entities: any[] = [];

  // 事件中心
  entities.push({
    id: `${caseData.id}-center`,
    lat: caseData.location.lat,
    lng: caseData.location.lng,
    type: 'sensor',
    status: 'danger',
    label: `💥 ${caseData.name}`,
  });

  // 设施
  caseData.facilities.forEach(facility => {
    const typeMap: Record<string, string> = {
      hospital: 'hospital',
      fire_station: 'fire_station',
      police_station: 'police_station',
      shelter: 'shelter',
      command_center: 'team',
      school: 'shelter',
      army_base: 'team',
      airport: 'vehicle',
    };
    entities.push({
      id: facility.id,
      lat: facility.lat,
      lng: facility.lng,
      type: typeMap[facility.type] || 'sensor',
      status: 'normal',
      label: facility.name,
      data: facility,
    });
  });

  // 救援力量（初始位置）
  caseData.rescueForces.forEach(force => {
    const typeMap: Record<string, string> = {
      fire_brigade: 'fire_truck',
      armed_police: 'police_car',
      army: 'team',
      militia: 'team',
      medical_team: 'ambulance',
      engineering: 'vehicle',
      volunteer: 'team',
    };
    entities.push({
      id: force.id,
      lat: force.lat,
      lng: force.lng,
      type: typeMap[force.type] || 'vehicle',
      status: 'normal',
      label: force.name,
      data: force,
    });
  });

  return entities;
}

// 获取危险区域配置
export function getDangerZones(caseData: RealDisasterCase): { center: { lat: number; lng: number }; radius: number; level: string }[] {
  return caseData.dangerZones || [];
}
