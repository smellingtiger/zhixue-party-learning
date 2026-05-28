export interface SensorData {
  id: string;
  type: 'water-level' | 'wind-speed' | 'temperature' | 'humidity' | 'smoke' | 'earthquake' | 'people-flow';
  location: { lat: number; lng: number; name: string };
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
  trend: 'rising' | 'falling' | 'stable';
}

export interface MapLayer {
  id: string;
  type: 'danger-zone' | 'evacuation-route' | 'shelter' | 'resource' | 'sensor';
  name: string;
  visible: boolean;
  data: any[];
}

export interface SituationState {
  disasterType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  updateTime: Date;
  sensors: SensorData[];
  mapLayers: MapLayer[];
  keyMetrics: KeyMetric[];
  activeAlerts: Alert[];
}

export interface KeyMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon?: string;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

export const generateSensorData = (disasterType: string, count: number = 8): SensorData[] => {
  const types = {
    'flood': ['water-level', 'people-flow'],
    'typhoon': ['wind-speed', 'humidity'],
    'earthquake': ['earthquake', 'temperature'],
    'forest-fire': ['smoke', 'temperature'],
    'cold-wave': ['temperature', 'humidity']
  };
  
  const sensorTypes = types[disasterType as keyof typeof types] || ['water-level'];
  const locations = [
    { lat: 31.23, lng: 121.47, name: '人民广场' },
    { lat: 31.22, lng: 121.53, name: '陆家嘴' },
    { lat: 31.19, lng: 121.45, name: '徐家汇' },
    { lat: 31.25, lng: 121.49, name: '静安寺' },
    { lat: 31.20, lng: 121.52, name: '外滩' },
    { lat: 31.17, lng: 121.43, name: '虹桥' },
    { lat: 31.26, lng: 121.42, name: '宝山' },
    { lat: 31.21, lng: 121.57, name: '浦东' }
  ];

  return locations.slice(0, count).map((loc, idx) => {
    const type = sensorTypes[idx % sensorTypes.length];
    let value, unit, status, trend;

    switch (type) {
      case 'water-level':
        value = 30 + Math.random() * 80;
        unit = 'cm';
        status = value > 80 ? 'critical' : value > 50 ? 'warning' : 'normal';
        trend = Math.random() > 0.5 ? 'rising' : 'falling';
        break;
      case 'wind-speed':
        value = 10 + Math.random() * 35;
        unit = 'm/s';
        status = value > 32 ? 'critical' : value > 24 ? 'warning' : 'normal';
        trend = Math.random() > 0.6 ? 'rising' : 'stable';
        break;
      case 'temperature':
        value = disasterType === 'cold-wave' ? (-10 + Math.random() * 15) : (20 + Math.random() * 20);
        unit = '°C';
        status = value > 35 || value < 0 ? 'warning' : 'normal';
        trend = Math.random() > 0.5 ? 'rising' : 'falling';
        break;
      case 'humidity':
        value = 50 + Math.random() * 45;
        unit = '%';
        status = value > 90 ? 'warning' : 'normal';
        trend = 'stable';
        break;
      case 'smoke':
        value = 10 + Math.random() * 200;
        unit = 'ppm';
        status = value > 150 ? 'critical' : value > 80 ? 'warning' : 'normal';
        trend = 'rising';
        break;
      case 'earthquake':
        value = 2 + Math.random() * 5;
        unit = '级';
        status = value > 5 ? 'critical' : value > 4 ? 'warning' : 'normal';
        trend = 'stable';
        break;
      case 'people-flow':
        value = Math.floor(100 + Math.random() * 1000);
        unit = '人/时';
        status = value > 800 ? 'warning' : 'normal';
        trend = 'rising';
        break;
      default:
        value = Math.random() * 100;
        unit = '';
        status = 'normal';
        trend = 'stable';
    }

    return {
      id: `sensor-${type}-${idx}`,
      type: type as any,
      location: loc,
      value: Math.round(value * 10) / 10,
      unit,
      status,
      timestamp: new Date(),
      trend
    };
  });
};

export const generateKeyMetrics = (disasterType: string, severity: string): KeyMetric[] => {
  const severityMultiplier = severity === 'critical' ? 2 : severity === 'high' ? 1.5 : 1;

  const baseMetrics: KeyMetric[] = [
    { id: 'people-affected', name: '受影响人数', value: Math.floor(1000 * severityMultiplier), status: severity === 'critical' ? 'critical' : severity === 'high' ? 'warning' : 'good', trend: 'up' },
    { id: 'people-evacuated', name: '已疏散人数', value: Math.floor(300 * severityMultiplier), status: 'good', trend: 'up' },
    { id: 'response-time', name: '响应时间', value: '15', unit: '分钟', status: 'good', trend: 'stable' },
    { id: 'resource-utilization', name: '资源利用率', value: Math.floor(60 + severityMultiplier * 20), unit: '%', status: severity === 'critical' ? 'warning' : 'good', trend: 'up' }
  ];

  const disasterSpecific: Record<string, KeyMetric[]> = {
    'flood': [
      { id: 'water-level', name: '最高积水', value: Math.round(60 * severityMultiplier), unit: 'cm', status: severity === 'critical' ? 'critical' : 'warning', trend: 'rising' },
      { id: 'shelters-open', name: '开放避难所', value: Math.floor(5 * severityMultiplier), status: 'good', trend: 'stable' }
    ],
    'typhoon': [
      { id: 'wind-speed', name: '最大风力', value: Math.round(25 + severityMultiplier * 5), unit: 'm/s', status: severity === 'critical' ? 'critical' : 'warning', trend: 'rising' },
      { id: 'warning-level', name: '预警等级', value: severity === 'critical' ? '红色' : severity === 'high' ? '橙色' : '黄色', status: severity === 'critical' ? 'critical' : 'warning', trend: 'stable' }
    ],
    'earthquake': [
      { id: 'magnitude', name: '震级', value: (4 + severityMultiplier).toFixed(1), unit: '级', status: severity === 'critical' ? 'critical' : 'warning', trend: 'stable' },
      { id: 'building-damaged', name: '建筑受损', value: Math.floor(10 * severityMultiplier), unit: '栋', status: severity === 'critical' ? 'critical' : 'warning', trend: 'up' }
    ],
    'forest-fire': [
      { id: 'fire-area', name: '过火面积', value: Math.floor(5 * severityMultiplier), unit: '公顷', status: severity === 'critical' ? 'critical' : 'warning', trend: 'up' },
      { id: 'firefighters', name: '投入人员', value: Math.floor(50 * severityMultiplier), status: 'good', trend: 'up' }
    ],
    'cold-wave': [
      { id: 'min-temp', name: '最低温度', value: Math.round(-5 - severityMultiplier * 5), unit: '°C', status: severity === 'critical' ? 'critical' : 'warning', trend: 'falling' },
      { id: 'power-recovery', name: '电力恢复率', value: Math.floor(80 - severityMultiplier * 10), unit: '%', status: 'good', trend: 'up' }
    ]
  };

  return [...baseMetrics, ...(disasterSpecific[disasterType] || [])];
};

export const generateAlerts = (disasterType: string, severity: string): Alert[] => {
  const baseAlerts: Alert[] = [
    { id: 'alert-1', level: 'warning', title: '气象预警', description: '根据最新预报，未来6小时内灾情可能进一步发展', timestamp: new Date(Date.now() - 1000 * 60 * 30), acknowledged: false, source: '气象部门' },
    { id: 'alert-2', level: 'info', title: '应急响应启动', description: `已启动${severity === 'critical' ? '一级' : severity === 'high' ? '二级' : '三级'}应急响应`, timestamp: new Date(Date.now() - 1000 * 60 * 60), acknowledged: true, source: '应急办' }
  ];

  const disasterAlerts: Record<string, Alert[]> = {
    'flood': [
      { id: 'alert-flood-1', level: 'danger', title: '积水警告', description: '部分路段积水超过50cm，车辆无法通行', timestamp: new Date(), acknowledged: false, source: '交通部门' },
      { id: 'alert-flood-2', level: 'warning', title: '电力设施警戒', description: '地下配电房存在进水风险', timestamp: new Date(Date.now() - 1000 * 60 * 15), acknowledged: false, source: '供电公司' }
    ],
    'typhoon': [
      { id: 'alert-typhoon-1', level: 'danger', title: '阵风预警', description: '预计阵风可达12-14级，请勿外出', timestamp: new Date(), acknowledged: false, source: '气象部门' },
      { id: 'alert-typhoon-2', level: 'warning', title: '高空坠物风险', description: '请加固广告牌、空调外机等设施', timestamp: new Date(Date.now() - 1000 * 60 * 20), acknowledged: true, source: '城管部门' }
    ],
    'earthquake': [
      { id: 'alert-quake-1', level: 'critical', title: '余震预警', description: '未来24小时可能发生余震', timestamp: new Date(), acknowledged: false, source: '地震局' },
      { id: 'alert-quake-2', level: 'danger', title: '燃气泄漏', description: '发现多处燃气管道破损', timestamp: new Date(Date.now() - 1000 * 60 * 10), acknowledged: false, source: '燃气公司' }
    ],
    'forest-fire': [
      { id: 'alert-fire-1', level: 'critical', title: '火情蔓延', description: '火势向东北方向蔓延', timestamp: new Date(), acknowledged: false, source: '森林防火' },
      { id: 'alert-fire-2', level: 'warning', title: '空气质量', description: '周边区域PM2.5严重超标', timestamp: new Date(Date.now() - 1000 * 60 * 25), acknowledged: false, source: '环保部门' }
    ],
    'cold-wave': [
      { id: 'alert-cold-1', level: 'danger', title: '道路结冰', description: '高架桥、快速路有结冰现象', timestamp: new Date(), acknowledged: false, source: '交通部门' },
      { id: 'alert-cold-2', level: 'warning', title: '供暖保障', description: '部分区域供暖压力较大', timestamp: new Date(Date.now() - 1000 * 60 * 45), acknowledged: true, source: '供热公司' }
    ]
  };

  return [...(disasterAlerts[disasterType] || []), ...baseAlerts].slice(0, 4);
};

export const generateMapLayers = (disasterType: string): MapLayer[] => {
  return [
    {
      id: 'danger-zone',
      type: 'danger-zone',
      name: '危险区域',
      visible: true,
      data: [
        { lat: 31.23, lng: 121.48, radius: 500, level: 'critical' },
        { lat: 31.21, lng: 121.50, radius: 300, level: 'warning' }
      ]
    },
    {
      id: 'evacuation-routes',
      type: 'evacuation-route',
      name: '疏散路线',
      visible: true,
      data: [
        [{ lat: 31.23, lng: 121.48 }, { lat: 31.24, lng: 121.50 }, { lat: 31.25, lng: 121.52 }]
      ]
    },
    {
      id: 'shelters',
      type: 'shelter',
      name: '避难所',
      visible: true,
      data: [
        { lat: 31.25, lng: 121.52, name: '体育中心', capacity: 2000, current: 1200 },
        { lat: 31.22, lng: 121.45, name: '会展中心', capacity: 3000, current: 1800 }
      ]
    },
    {
      id: 'resources',
      type: 'resource',
      name: '资源点',
      visible: true,
      data: [
        { lat: 31.24, lng: 121.49, type: 'medical', name: '急救站' },
        { lat: 31.20, lng: 121.51, type: 'supply', name: '物资分发' }
      ]
    }
  ];
};

export const simulateSensorUpdate = (sensors: SensorData[]): SensorData[] => {
  return sensors.map(sensor => {
    let newValue = sensor.value;
    let newTrend = sensor.trend;
    let newStatus = sensor.status;

    const change = (Math.random() - 0.4) * (sensor.value * 0.1);
    newValue = Math.max(0, sensor.value + change);

    if (Math.random() > 0.9) {
      newTrend = ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as any;
    }

    return {
      ...sensor,
      value: Math.round(newValue * 10) / 10,
      trend: newTrend,
      status: newStatus,
      timestamp: new Date()
    };
  });
};

export const createInitialSituation = (disasterType: string, severity: string = 'high'): SituationState => {
  return {
    disasterType,
    severity: severity as any,
    updateTime: new Date(),
    sensors: generateSensorData(disasterType, 8),
    mapLayers: generateMapLayers(disasterType),
    keyMetrics: generateKeyMetrics(disasterType, severity),
    activeAlerts: generateAlerts(disasterType, severity)
  };
};
