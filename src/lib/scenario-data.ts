/**
 * 江城危急 —— 武汉2024"暴力梅"防御战 完整战役数据
 * 基于《战役设定：江城危急 —— 武汉2024"暴力梅"防御战》与《镜头剧本》
 * 包含5个阶段：序章 + 4个回合，每回合含决策点、事件、镜头移动、AI提示词
 */

export type ScenarioEventType =
  | 'narration'
  | 'alert'
  | 'report'
  | 'meeting'
  | 'order'
  | 'camera_move'
  | 'critical_event'
  | 'decision_prompt';

export type EmotionType = 'calm' | 'urgent' | 'worried' | 'confident' | 'concerned';

export interface CameraStep {
  step: number;
  description: string;
  target: string;
  center: { lat: number; lng: number };
  zoom: number;
  action: 'flyTo' | 'panTo' | 'easeOut';
  duration?: number;
  overlay?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  consequence: string;
}

export interface DecisionPoint {
  id: string;
  question: string;
  options: DecisionOption[];
  recommendedOption?: string;
  sopReference?: string;
}

export interface ScenarioEvent {
  id: string;
  time: string;
  type: ScenarioEventType;
  speaker: string;
  speakerRole?: string;
  speakerDepartment?: string;
  title: string;
  content: string;
  location?: {
    lat: number;
    lng: number;
    label?: string;
    zoom?: number;
  };
  cameraConfig?: {
    center: { lat: number; lng: number };
    zoom: number;
    duration?: number;
    action?: 'flyTo' | 'panTo' | 'easeOut';
  };
  isUrgent?: boolean;
  isHighlight?: boolean;
  emotion?: EmotionType;
  soundEffect?: string;
  round?: number;
  attendees?: string[];
}

export interface PlayerRole {
  id: string;
  name: string;
  department: string;
  description: string;
  level?: 'decision' | 'core' | 'collab';
  levelName?: string;
}

export interface ScenarioPhase {
  id: string;
  name: string;
  description: string;
  roundNumber: number;
  responseLevel: string;
  startTime: string;
  endTime: string;
  situation: string;
  aiAdvisorPrompt: string;
  decisionPoints: DecisionPoint[];
  events: ScenarioEvent[];
  cameraSteps: CameraStep[];
  involvedDepartments: string[];
  playerRoles: PlayerRole[];
}

// ==================== POI 坐标常量 ====================
export const POI = {
  wuhanGov:       { lat: 30.599554, lng: 114.305393, label: '武汉市政府' },
  zhuyeshan:      { lat: 30.618765, lng: 114.293456, label: '竹叶山立交' },
  longwangmiao:   { lat: 30.569234, lng: 114.285678, label: '龙王庙险段' },
  wuchang:        { lat: 30.555789, lng: 114.316234, label: '武昌老城' },
  hongshan:       { lat: 30.523456, lng: 114.334567, label: '洪山体育馆' },
  wuhanStation:   { lat: 30.602345, lng: 114.357890, label: '武汉站' },
  tianheAirport:  { lat: 30.781234, lng: 114.207890, label: '天河机场' },
} as const;

// ==================== 5个完整阶段数据 ====================

export const scenarioPhases: ScenarioPhase[] = [
  // ==================== 序章：入梅 · 蓝色预警 · IV级响应准备 ====================
  {
    id: 'phase-0-prologue',
    name: '序章：入梅',
    description: '2024年6月18日武汉正式入梅，蓝色预警发布，IV级响应准备启动',
    roundNumber: 0,
    responseLevel: 'IV级响应准备（蓝色预警）',
    startTime: '06-18 00:00',
    endTime: '06-18 23:59',
    situation:
      '2024年6月18日，武汉正式入梅。西太平洋副热带高压北抬至华南沿海，暖湿气流开始活跃。' +
      '气象预测显示今年梅雨期将超过27天，累计降雨量可能突破800毫米。长江流域已进入主汛期，' +
      '上游来水量持续增加，城市排水系统将面临极限考验。全市各部门需密切关注天气变化，做好防汛准备。',
    aiAdvisorPrompt:
      '各位指挥部成员，武汉已正式入梅。根据气象部门预测，今年梅雨期将长达27天以上，' +
      '累计降雨量可能突破800毫米。根据《防汛抗旱应急预案》，建议各单位立即进入防汛备勤状态：\n' +
      '1. 气象局持续监测雨情变化\n' +
      '2. 城管局排查雨水管网和泵站运行状况\n' +
      '3. 各街道清理社区排水口，落实"门前三包"\n' +
      '4. 应急局检查防汛物资储备\n' +
      '请各部门汇报备勤情况。',
    decisionPoints: [
      {
        id: 'dp-0-1',
        question: '入梅初期，是否需要提前预置移动泵车至已知易涝点？',
        options: [
          {
            id: 'dp-0-1-a',
            label: '立即预置',
            description: '指令城管局提前将移动泵车部署至竹叶山立交、汉西路下穿通道等历史易涝点',
            consequence: '后续降雨来临时可快速排水，减少积水时间和损失',
          },
          {
            id: 'dp-0-1-b',
            label: '暂不预置，继续监测',
            description: '保持设备待命，等降雨达到阈值再调派',
            consequence: '若突发强降雨可能来不及部署，导致初期积水严重',
          },
        ],
        recommendedOption: 'dp-0-1-a',
        sopReference: '《防汛抗旱应急预案》IV级响应：预置应急排涝设备至易涝区域',
      },
    ],
    events: [
      // ===== 镜头1：全市大全景 =====
      {
        id: 'event-0-1',
        time: '06-18 08:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头1：卫星视角俯瞰武汉',
        content:
          '🎬 **镜头动作**：从太空视角缓缓降落至武汉上空\n\n' +
          '📍 **位置**：武汉市全域概览\n' +
          '📐 **坐标**：[114.305393, 30.599554]\n' +
          '🔍 **缩放**：9（卫星级别）\n\n' +
          '✨ **画面效果**：长江、汉江交汇处清晰可见，两江三镇格局一览无余',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '武汉全域', zoom: 9 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 9, duration: 3000, action: 'easeOut' },
        round: 0,
      },
      {
        id: 'event-0-2',
        time: '06-18 08:10',
        type: 'narration',
        speaker: '系统旁白',
        title: '入梅公告',
        content:
          '[2024年6月18日 · 武汉]\n\n' +
          '🌧 **武汉今日正式入梅**\n\n' +
          '西太平洋副热带高压北抬至华南沿海，南方暖湿气流开始活跃。\n' +
          '预计未来27天，我市将迎来历史罕见的"暴力梅"天气过程。\n\n' +
          '**预测数据**：\n' +
          '• 往年平均梅雨期：23天 → 今年预测：27天+\n' +
          '• 累计降雨量：可能突破800毫米\n' +
          '• 长江流域已进入主汛期',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '武汉全域', zoom: 9 },
        isHighlight: true,
        emotion: 'calm',
        round: 0,
      },

      // ===== 镜头2：推进至气象卫星云图 =====
      {
        id: 'event-0-3',
        time: '06-18 08:30',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头2：推进至气象监测视角',
        content:
          '🎬 **镜头动作**：从卫星视角推进至气象监测视角\n\n' +
          '📍 **位置**：长江流域上空\n' +
          '🔍 **缩放**：11\n\n' +
          '✨ **画面效果**：降雨云图层叠加显示，梅雨锋面清晰可见',
        location: { lat: 30.6, lng: 114.2, label: '长江流域', zoom: 11 },
        cameraConfig: { center: { lat: 30.6, lng: 114.2 }, zoom: 11, duration: 2000, action: 'flyTo' },
        overlay: '动态降雨云图层',
        round: 0,
      },
      {
        id: 'event-0-4',
        time: '06-18 09:00',
        type: 'alert',
        speaker: '市气象局值班员 小李',
        speakerRole: 'weather-bureau',
        speakerDepartment: '市气象局',
        title: '气象数据分析',
        content:
          '[09:00] 🔵 **气象数据分析报告**\n\n' +
          '📢 **气象局值班员 小李** 报告：\n\n' +
          '"指挥部，最新气象数据显示：\n\n' +
          '🌧 **预测数据**：\n' +
          '• 未来24小时预计降雨量：50-80毫米\n' +
          '• 梅雨锋面稳定维持，降雨将持续\n' +
          '• 不排除出现短时强降雨的可能\n\n' +
          '⚠ **建议发布暴雨蓝色预警**"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市气象局', zoom: 11 },
        isUrgent: true,
        emotion: 'urgent',
        soundEffect: 'alert_blue',
        round: 0,
      },

      // ===== 镜头3：推进至市政府应急指挥中心 =====
      {
        id: 'event-0-5',
        time: '06-18 09:30',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头3：进入应急指挥中心',
        content:
          '🎬 **镜头动作**：从气象视角推进至市政府应急指挥中心\n\n' +
          '� **位置**：武汉市政府\n' +
          '📐 **坐标**：[114.305393, 30.599554]\n' +
          '🔍 **缩放**：16（建筑级别）\n\n' +
          '✨ **画面效果**：聚焦应急指挥中心大楼，准备接收灾情报告',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 16 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 16, duration: 2500, action: 'flyTo' },
        round: 0,
      },
      {
        id: 'event-0-6',
        time: '06-18 09:45',
        type: 'meeting',
        speaker: '副市长 李强',
        speakerRole: 'vice-mayor',
        speakerDepartment: '市人民政府',
        title: '防汛备勤部署会议',
        content:
          '[09:45] � **防汛备勤部署会议**\n\n' +
          '📢 **副市长 李强** 主持：\n\n' +
          '"同志们，今天我市正式入梅，气象局已发布蓝色预警。\n' +
          '现召开防汛备勤部署会议，请各部门汇报准备情况。\n\n' +
          '首先请应急局汇报整体备勤状态。"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '应急指挥中心会议室', zoom: 16 },
        emotion: 'calm',
        round: 0,
      },

      // ===== 角色回答时机1：应急局局长汇报 =====
      {
        id: 'event-0-7',
        time: '06-18 09:50',
        type: 'report',
        speaker: '市应急局局长 王刚',
        speakerRole: 'emergency-bureau',
        speakerDepartment: '市应急管理局',
        title: '应急局备勤汇报',
        content:
          '[09:50] � **应急局备勤汇报**\n\n' +
          '📢 **应急局局长 王刚** 汇报：\n\n' +
          '"李市长，应急局备勤情况如下：\n\n' +
          '✅ **人员备勤**：\n' +
          '• 全市应急队伍2000人已进入备勤状态\n' +
          '• 24小时值班制度已启动\n' +
          '• 各应急点位责任人已就位\n\n' +
          '✅ **物资储备**：\n' +
          '• 防汛物资储备检查完毕\n' +
          '• 编织袋50万条、砂石料2万吨已备妥\n' +
          '• 救生衣、冲锋舟等救援器材状态良好\n\n' +
          '✅ **指挥系统**：\n' +
          '• 市、区、街三级指挥网络已联通\n' +
          '• 应急广播系统测试完毕\n\n' +
          '整体备勤就绪，随时可投入应急响应。"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '应急局汇报', zoom: 16 },
        emotion: 'confident',
        round: 0,
      },

      // ===== 角色回答时机2：城管局局长汇报 =====
      {
        id: 'event-0-8',
        time: '06-18 10:00',
        type: 'report',
        speaker: '市城管局局长 赵军',
        speakerRole: 'urban-management',
        speakerDepartment: '市城管局',
        title: '城管局排水设施排查汇报',
        content:
          '[10:00] 🔧 **城管局排水设施排查汇报**\n\n' +
          '📢 **城管局局长 赵军** 汇报：\n\n' +
          '"李市长，城管局排水设施排查情况：\n\n' +
          '✅ **管网排查**：\n' +
          '• 全市雨水管网排查：1200公里\n' +
          '• 雨水箅子清理：3500个\n' +
          '• 排涝泵站检修：12座全部正常\n\n' +
          '✅ **设备预置**：\n' +
          '• 移动泵车5台已部署至易涝点\n' +
          '• 抽水泵20台已就位\n\n' +
          '⚠ **需关注**：\n' +
          '• 竹叶山立交排水能力偏不足\n' +
          '• 武昌老城区部分管网老化\n' +
          '• 汉西路下穿通道需重点盯守\n\n' +
          '整体排水系统运行正常，已做好防汛准备。"',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: '城管局汇报', zoom: 14 },
        cameraConfig: { center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng }, zoom: 14, duration: 1500, action: 'flyTo' },
        emotion: 'calm',
        round: 0,
      },

      // ===== 角色回答时机3：交通局局长汇报 =====
      {
        id: 'event-0-9',
        time: '06-18 10:10',
        type: 'report',
        speaker: '市交通局局长 刘伟',
        speakerRole: 'traffic-bureau',
        speakerDepartment: '市交通局',
        title: '交通局防汛准备汇报',
        content:
          '[10:10] 🚗 **交通局防汛准备汇报**\n\n' +
          '📢 **交通局局长 刘伟** 汇报：\n\n' +
          '"李市长，交通局防汛准备情况：\n\n' +
          '✅ **道路排查**：\n' +
          '• 桥梁涵洞排水设施检查完毕\n' +
          '• 下穿通道积水监测设备已安装\n' +
          '• 重点路段巡查频次已加密\n\n' +
          '✅ **交通保障**：\n' +
          '• 应急绕行路线已规划\n' +
          '• 交通诱导系统已更新\n' +
          '• 公交公司防汛预案已审批\n\n' +
          '⚠ **需关注**：\n' +
          '• 二环线部分低洼路段积水风险较高\n' +
          '• 多个下穿通道排水能力不足\n\n' +
          '已做好交通保障准备。"',
        location: { lat: 30.585, lng: 114.295, label: '交通局汇报', zoom: 13 },
        cameraConfig: { center: { lat: 30.585, lng: 114.295 }, zoom: 13, duration: 1500, action: 'panTo' },
        emotion: 'calm',
        round: 0,
      },

      // ===== 角色回答时机4：街道办主任汇报 =====
      {
        id: 'event-0-10',
        time: '06-18 10:20',
        type: 'report',
        speaker: '属地街道办主任 吴涛',
        speakerRole: 'street-office',
        speakerDepartment: '属地街道办事处',
        title: '街道办社区排查汇报',
        content:
          '[10:20] 🏘 **街道办社区排查汇报**\n\n' +
          '📢 **街道办主任 吴涛** 汇报：\n\n' +
          '"李市长，街道办社区排查情况：\n\n' +
          '✅ **社区排查**：\n' +
          '• 辖区12个社区排水口清理完毕\n' +
          '• 低洼院落警示标志已设置\n' +
          '• 老旧房屋安全隐患排查完成\n\n' +
          '✅ **脆弱群体摸排**：\n' +
          '• 独居老人：87户，已逐一通知\n' +
          '• 残疾人：32户，已建立帮扶台账\n' +
          '• 低收入家庭：156户，已发放防汛告知书\n\n' +
          '✅ **应急准备**：\n' +
          '• 社区应急队伍已组建\n' +
          '• 应急物资储备点已确认\n\n' +
          '已做好社区防汛准备。"',
        location: { lat: 30.61, lng: 114.31, label: '街道办汇报', zoom: 15 },
        cameraConfig: { center: { lat: 30.61, lng: 114.31 }, zoom: 15, duration: 1500, action: 'panTo' },
        emotion: 'calm',
        round: 0,
      },

      // ===== 镜头4：回到指挥中心，发布预警 =====
      {
        id: 'event-0-11',
        time: '06-18 10:30',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头4：返回指挥中心',
        content:
          '🎬 **镜头动作**：从街道视角返回应急指挥中心\n\n' +
          '📍 **位置**：武汉市政府应急指挥中心\n' +
          '🔍 **缩放**：16\n\n' +
          '✨ **画面效果**：所有部门汇报完毕，准备发布预警',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 16 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 16, duration: 2000, action: 'flyTo' },
        round: 0,
      },
      {
        id: 'event-0-12',
        time: '06-18 10:35',
        type: 'order',
        speaker: '副市长 李强',
        speakerRole: 'vice-mayor',
        speakerDepartment: '市人民政府',
        title: '发布蓝色预警指令',
        content:
          '[10:35] 📢 **副市长 李强** 发布指令：\n\n' +
          '"同志们，根据各部门汇报情况，现发布如下指令：\n\n' +
          '1️⃣ **正式启用IV级应急响应**\n' +
          '2️⃣ **各单位严格执行24小时值班制度**\n' +
          '3️⃣ **城管局对易涝点实施24小时盯守**\n' +
          '4️⃣ **移动泵车预置至竹叶山立交、汉西路下穿通道**\n' +
          '5️⃣ **各街道对低洼区域设置警示标志**\n\n' +
          '请各单位立即执行！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 16 },
        isUrgent: true,
        emotion: 'urgent',
        round: 0,
      },

      // ===== 决策点：玩家做出第一个决策 =====
      {
        id: 'event-0-13',
        time: '06-18 10:40',
        type: 'decision_prompt',
        speaker: '系统提示',
        title: '🎯 决策点：移动泵车预置',
        content:
          '[10:40] 🎯 **决策点**\n\n' +
          '当前各部门已汇报完毕，您需要做出第一个决策：\n\n' +
          '城管局建议将移动泵车提前部署至历史易涝点，' +
          '但部分同志认为当前降雨尚未开始，建议保持设备待命。\n\n' +
          '请做出您的决策。',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '决策点', zoom: 16 },
        emotion: 'concerned',
        round: 0,
      },
    ],
    cameraSteps: [
      {
        step: 1,
        description: '卫星视角俯瞰武汉全市',
        target: '武汉全域',
        center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng },
        zoom: 9,
        action: 'easeOut',
        duration: 3000,
        overlay: '动态降雨云图层',
      },
      {
        step: 2,
        description: '推进至气象监测视角',
        target: '长江流域',
        center: { lat: 30.6, lng: 114.2 },
        zoom: 11,
        action: 'flyTo',
        duration: 2000,
        overlay: '梅雨锋面标记',
      },
      {
        step: 3,
        description: '进入应急指挥中心',
        target: '市应急指挥中心',
        center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2500,
        overlay: '无',
      },
      {
        step: 4,
        description: '城管局汇报时飞至竹叶山立交',
        target: '竹叶山立交',
        center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng },
        zoom: 14,
        action: 'flyTo',
        duration: 1500,
        overlay: '易涝点标记',
      },
      {
        step: 5,
        description: '交通局汇报时平移至重点路段',
        target: '交通局管辖区域',
        center: { lat: 30.585, lng: 114.295 },
        zoom: 13,
        action: 'panTo',
        duration: 1500,
        overlay: '交通路线标记',
      },
      {
        step: 6,
        description: '街道办汇报时平移至社区',
        target: '街道辖区',
        center: { lat: 30.61, lng: 114.31 },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '社区标记',
      },
      {
        step: 7,
        description: '返回指挥中心发布预警',
        target: '市应急指挥中心',
        center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2000,
        overlay: '预警标记',
      },
    ],
    involvedDepartments: ['市气象局', '市应急管理局', '市城管局', '市水务局', '市交通局'],
    playerRoles: [
      { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '统筹指挥IV级内涝应急响应，协调各成员单位落实防汛措施', level: 'decision', levelName: '决策层' },
      { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '执行IV级响应调度，负责信息汇总与物资备勤', level: 'core', levelName: '核心层' },
      { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '组织城区排水管网巡查和积水点监测', level: 'collab', levelName: '协同层' },
      { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '保障重点运输通道畅通，发布交通出行提示', level: 'collab', levelName: '协同层' },
      { id: 'street-office', name: '吴涛', department: '属地街道办主任', description: '负责社区预警通知、隐患排查及脆弱群体摸排', level: 'collab', levelName: '协同层' },
    ],
  },

  // ==================== 第一回合：梅雨初袭 · IV级响应 · 监测与预置 ====================
  {
    id: 'phase-1-level4',
    name: '第一回合：梅雨初袭',
    description: '暴雨初降，启动IV级响应，监测与预置',
    roundNumber: 1,
    responseLevel: 'IV级响应（蓝色/黄色预警）',
    startTime: '06-20 14:00',
    endTime: '06-20 22:00',
    situation:
      '入梅第3天，初期雨量逐渐增加。过去24小时累计降雨量达52毫米，最大小时雨强18毫米/小时。' +
      '部分低洼地段开始出现积水，竹叶山立交积水深度约20cm。市气象局预计未来24小时还将有50-80毫米降水。' +
      '根据《市防汛抗旱应急预案》，已启动IV级应急响应，各单位加强值班值守，排查排水设施运行状况。',
    aiAdvisorPrompt:
      '市长同志，当前已进入IV级响应状态。过去24小时累计降雨52毫米，' +
      '部分路段积水已达20cm。根据《手册》IV级响应要求：\n' +
      '1. 各单位加强值班值守，保持通讯畅通\n' +
      '2. 城管局对易涝点实施24小时盯守\n' +
      '3. 预置移动泵车至常发易涝点（竹叶山立交、汉西路下穿通道等）\n' +
      '4. 各街道对低洼区域设置警示标志\n' +
      '预计未来24小时仍有50-80毫米降水，请指示下一步行动。',
    decisionPoints: [
      {
        id: 'dp-1-1',
        question: '竹叶山立交积水已达20cm且持续降雨，是否立即实施交通管制？',
        options: [
          {
            id: 'dp-1-1-a',
            label: '立即管制',
            description: '对竹叶山立交实施限行，设置警示标志，引导车辆绕行',
            consequence: '保障交通安全，但可能影响周边交通流量',
          },
          {
            id: 'dp-1-1-b',
            label: '暂不管制，加强监测',
            description: '继续观察积水变化，积水超30cm再管制',
            consequence: '保持交通通行，但若积水快速上涨可能导致车辆涉水风险',
          },
        ],
        recommendedOption: 'dp-1-1-a',
        sopReference: '《手册》IV级响应：积水超20cm路段设置警示标志，超30cm实施交通管制',
      },
      {
        id: 'dp-1-2',
        question: '是否要求所有排涝泵站提前满负荷运行？',
        options: [
          {
            id: 'dp-1-2-a',
            label: '全部提前开机',
            description: '12座泵站全部满负荷运行，提前降低管网水位',
            consequence: '排水能力最大化，但能耗较高',
          },
          {
            id: 'dp-1-2-b',
            label: '按需启动',
            description: '根据实时积水情况逐步启动泵站',
            consequence: '节约能耗，但可能来不及应对突发强降雨',
          },
        ],
        recommendedOption: 'dp-1-2-a',
        sopReference: '《手册》IV级响应：确保排涝泵站正常运行，必要时提前开机',
      },
    ],
    events: [
      {
        id: 'event-1-1',
        time: '14:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头推进至指挥中心',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从序章全市概览（Zoom 10.5）→ 快速平滑推进至市政府（Zoom 16）\n\n' +
          '📍 **目标位置**：武汉市政府\n' +
          '📐 **坐标**：[114.305393, 30.599554]\n' +
          '🔍 **缩放**：16（高亮市政府图标）\n\n' +
          '✨ **画面效果**：聚焦指挥中枢，准备接收灾情报告',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: POI.wuhanGov.label, zoom: 16 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 16, duration: 2000, action: 'flyTo' },
        round: 1,
      },
      {
        id: 'event-1-2',
        time: '14:15',
        type: 'alert',
        speaker: '市气象局值班员 小李',
        speakerRole: 'weather-bureau',
        speakerDepartment: '市气象局',
        title: '蓝色预警确认',
        content:
          '[14:15] 🔵 **蓝色预警确认**\n\n' +
          '📢 **气象局值班员 小李** 紧急报告：\n\n' +
          '"市长！气象局监测数据显示：\n\n' +
          '🌧 **当前实况**：\n' +
          '• 过去24小时累计降雨量：52毫米\n' +
          '• 最大小时雨强：18毫米/小时\n' +
          '• 预计未来24小时还将有50-80毫米降水\n\n' +
          '⚠ **根据《市防汛抗旱应急预案》，维持暴雨蓝色预警！**\n\n' +
          '📋 **建议措施**：\n' +
          '• 各单位加强值班值守\n' +
          '• 排查排水设施运行状况\n' +
          '• 低洼区域设置警示标志\n' +
          '• 应急队伍进入待命状态"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市气象局' },
        isUrgent: true,
        emotion: 'urgent',
        soundEffect: 'alert_blue',
        round: 1,
      },
      {
        id: 'event-1-3',
        time: '14:30',
        type: 'report',
        speaker: '市城管局值班员 老张',
        speakerRole: 'urban-management',
        speakerDepartment: '市城管局',
        title: '道路积水巡查报告',
        content:
          '[14:30] 🌊 **道路积水巡查报告**\n\n' +
          '📢 **城管局值班员 老张** 汇报：\n\n' +
          '"指挥部，城区道路巡查情况如下：\n\n' +
          '🚧 **积水路段**：\n' +
          '• 竹叶山立交：积水20cm，车辆可缓慢通行\n' +
          '• 发展大道：积水15cm，正常通行\n' +
          '• 建设大道：积水12cm，正常通行\n' +
          '• 汉西路下穿通道：积水18cm，需密切关注\n\n' +
          '🚿 **排水设施状态**：\n' +
          '• 全市12座泵站全部运行正常\n' +
          '• 排涝能力约200立方米/秒\n' +
          '• 移动泵车5台已预置到位\n\n' +
          '⚠ 若降雨持续加强，建议提前升级响应等级。"',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: POI.zhuyeshan.label },
        isUrgent: true,
        emotion: 'worried',
        round: 1,
      },
      {
        id: 'event-1-4',
        time: '15:00',
        type: 'order',
        speaker: '市应急管理局 张副局长',
        speakerRole: 'emergency-bureau',
        speakerDepartment: '市应急管理局',
        title: 'IV级响应执行令',
        content:
          '[15:00] 🔵 **IV级响应执行令**\n\n' +
          '📢 **市应急管理局 张副局长** 签发：\n\n' +
          '"根据《市防汛抗旱应急预案》，现执行IV级应急响应：\n\n' +
          '📋 **响应措施**：\n' +
          '• 各成员单位按职责到岗值班\n' +
          '• 对积水超20cm路段设置警示标志\n' +
          '• 低洼区域做好人员转移准备\n' +
          '• 移动泵车满负荷运行\n' +
          '• 医疗救援队进入备勤状态\n\n' +
          '🏗 **工程调度**：\n' +
          '• 全力开启排涝泵站\n' +
          '• 加强堤防巡查，每2小时报告一次\n' +
          '• 易涝点安排专人盯守\n\n' +
          '📞 指挥部24小时值班电话已开通"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 16 },
        isUrgent: true,
        emotion: 'concerned',
        round: 1,
      },
      {
        id: 'event-1-5',
        time: '16:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头飞至竹叶山立交',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从市政府指挥中枢 → 飞至竹叶山立交（Zoom 15）\n\n' +
          '📍 **目标位置**：竹叶山立交（汉口经典易涝点）\n' +
          '📐 **坐标**：[114.293456, 30.618765]\n' +
          '🔍 **缩放**：15（放大积水区域）\n\n' +
          '🌊 **画面效果**：积水蓝色半透明覆盖层 + 移动泵车待命动画',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: POI.zhuyeshan.label, zoom: 15 },
        cameraConfig: { center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng }, zoom: 15, duration: 2000, action: 'flyTo' },
        round: 1,
      },
      {
        id: 'event-1-6',
        time: '20:00',
        type: 'decision_prompt',
        speaker: 'AI参谋长',
        title: 'AI决策建议',
        content:
          '💡 **AI参谋长决策建议**\n\n' +
          '🎯 **当前态势评估**：\n' +
          '• 降雨持续，竹叶山立交积水已达25cm\n' +
          '• 预计未来6小时还有40-60毫米降水\n' +
          '• 城管局建议对积水超30cm路段实施交通管制\n\n' +
          '📋 **SOP建议**：\n' +
          '根据《防汛抗旱应急预案》IV级响应，当路段积水超过30cm时，' +
          '应立即实施交通管制。同时应加强排涝泵站运行，确保排水能力最大化。\n\n' +
          '⏰ **请指挥部做出决策**：是否对竹叶山立交实施交通管制？',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: POI.zhuyeshan.label },
        emotion: 'concerned',
        round: 1,
      },
    ],
    cameraSteps: [
      {
        step: 1,
        description: '聚焦指挥中枢',
        target: '武汉市政府',
        center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2000,
      },
      {
        step: 2,
        description: '巡查易涝点',
        target: '竹叶山立交',
        center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '半径500米蓝色积水预警圈',
      },
      {
        step: 3,
        description: '检查龙王庙堤防',
        target: '龙王庙险段',
        center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng },
        zoom: 14,
        action: 'panTo',
        duration: 1500,
        overlay: '长江水位监测标记',
      },
    ],
    involvedDepartments: ['市气象局', '市应急管理局', '市城管局', '市水务局', '市交警支队', '市卫健委'],
    playerRoles: [
      { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '统筹指挥IV级内涝应急响应，协调各成员单位落实防汛措施', level: 'decision', levelName: '决策层' },
      { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '执行IV级响应调度，负责信息汇总与物资备勤', level: 'core', levelName: '核心层' },
      { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '组织城区排水管网巡查和积水点监测', level: 'collab', levelName: '协同层' },
      { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '保障重点运输通道畅通，发布交通出行提示', level: 'collab', levelName: '协同层' },
      { id: 'street-office', name: '吴涛', department: '属地街道办主任', description: '负责社区预警通知、隐患排查及脆弱群体摸排', level: 'collab', levelName: '协同层' },
    ],
  },

  // ==================== 第二回合：积水成河 · III级响应 · 交通管制+局部交战 ====================
  {
    id: 'phase-2-level3',
    name: '第二回合：积水成河',
    description: '暴雨持续升级，多个主干道积水超30cm，启动III级响应，交通管制+局部交战',
    roundNumber: 2,
    responseLevel: 'III级响应（黄色/橙色预警）',
    startTime: '06-21 16:00',
    endTime: '06-21 19:00',
    situation:
      '入梅第4天，暴雨持续升级。过去6小时累计降雨量达85毫米，最大小时雨强35毫米/小时。' +
      '长江汉口站水位逼近警戒线27.30米。城区多处主干道积水深度超过30cm，' +
      '竹叶山立交积水达35cm，车辆通行受阻。汉西路下穿通道积水40cm，已封闭。' +
      '长江水位超警，龙王庙险段需加强巡查。根据《预案》，需升级至III级响应，' +
      '实施交通管制、转移低洼群众、多部门联勤作战。',
    aiAdvisorPrompt:
      '报告指挥长！雨势已显著加强，多个关键指标已触发III级响应条件：\n' +
      '• 6小时累计降雨85mm，小时雨强35mm/h\n' +
      '• 3条主干道积水超30cm，1条下穿通道已封闭\n' +
      '• 长江水位逼近警戒线27.30m\n\n' +
      '根据《手册》第3页，需升级至III级响应。AI已自动建议交通局发布绕行方案。\n\n' +
      '请决策：\n' +
      '1. 是否对积水深度≥50cm的隧道实施硬隔离封闭？\n' +
      '2. 是否组织低洼区域群众转移？\n' +
      '3. 是否请求武警部队预置待命？',
    decisionPoints: [
      {
        id: 'dp-2-1',
        question: '竹叶山立交积水已达35cm且持续上涨，是否实施全面交通管制？',
        options: [
          {
            id: 'dp-2-1-a',
            label: '全面封闭',
            description: '竹叶山立交全向封闭，设置绕行指示牌，出动警力疏导交通',
            consequence: '彻底消除涉水风险，但区域交通压力增大',
          },
          {
            id: 'dp-2-1-b',
            label: '限行管制',
            description: '仅限制大型车辆通行，小型车辆缓慢通过',
            consequence: '保持部分通行能力，但仍有涉水风险',
          },
          {
            id: 'dp-2-1-c',
            label: '暂不管制',
            description: '继续监测，积水超50cm再封闭',
            consequence: '最大化保持通行，但风险极高',
          },
        ],
        recommendedOption: 'dp-2-1-a',
        sopReference: '《手册》第3页：积水超30cm路段实施交通管制，超50cm硬隔离封闭',
      },
      {
        id: 'dp-2-2',
        question: '长江水位逼近警戒线，是否组织龙王庙下游居民转移？',
        options: [
          {
            id: 'dp-2-2-a',
            label: '立即转移',
            description: '启动龙王庙下游500米范围内居民转移预案',
            consequence: '确保人员安全，但可能引起部分居民恐慌',
          },
          {
            id: 'dp-2-2-b',
            label: '做好转移准备',
            description: '通知居民做好转移准备，水位超警戒线再行动',
            consequence: '减少不必要转移，但若水位快速上涨可能来不及',
          },
        ],
        recommendedOption: 'dp-2-2-b',
        sopReference: '《手册》III级响应：水位逼近警戒线时做好转移准备，超警戒线立即转移',
      },
      {
        id: 'dp-2-3',
        question: '是否请求武警部队预置待命？',
        options: [
          {
            id: 'dp-2-3-a',
            label: '立即请求',
            description: '请求武警武汉支队预置200人待命，准备堤防加固和抢险',
            consequence: '抢险力量提前到位，可快速响应险情',
          },
          {
            id: 'dp-2-3-b',
            label: '暂不请求',
            description: '保持现有应急力量，视情况再请求支援',
            consequence: '节省兵力资源，但若突发险情可能来不及调派',
          },
        ],
        recommendedOption: 'dp-2-3-a',
        sopReference: '《手册》III级响应：必要时请求武装力量参与抢险救援',
      },
    ],
    events: [
      {
        id: 'event-2-1',
        time: '16:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头飞入竹叶山立交积水区',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从市政府指挥中枢 → 高速飞入竹叶山立交（Zoom 16）\n\n' +
          '📍 **目标位置**：竹叶山立交（汉口经典易涝点）\n' +
          '📐 **坐标**：[114.293456, 30.618765]\n' +
          '🔍 **缩放**：16（放大积水区域）\n\n' +
          '🌊 **画面效果**：积水蓝色半透明覆盖层 + 车辆涉水动画',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: POI.zhuyeshan.label, zoom: 16 },
        cameraConfig: { center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng }, zoom: 16, duration: 2000, action: 'flyTo' },
        round: 2,
      },
      {
        id: 'event-2-2',
        time: '16:15',
        type: 'alert',
        speaker: '市气象局值班员 小李',
        speakerRole: 'weather-bureau',
        speakerDepartment: '市气象局',
        title: '暴雨黄色预警升级',
        content:
          '[16:15] 🟡 **黄色预警升级**\n\n' +
          '📢 **气象局值班员 小李** 紧急报告：\n\n' +
          '"指挥长！暴雨持续增强：\n\n' +
          '🌧 **当前实况**：\n' +
          '• 过去6小时累计降雨量：85毫米\n' +
          '• 最大小时雨强：35毫米/小时\n' +
          '• 预计未来6小时还将有60-100毫米降水\n\n' +
          '⚠ **升级发布暴雨黄色预警！**\n\n' +
          '📋 **建议措施**：\n' +
          '• 建议启动III级响应\n' +
          '• 对积水路段实施交通管制\n' +
          '• 低洼区域组织人员转移\n' +
          '• 加强堤防巡查频次"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市气象局' },
        isUrgent: true,
        emotion: 'urgent',
        soundEffect: 'alert_yellow',
        round: 2,
      },
      {
        id: 'event-2-3',
        time: '16:30',
        type: 'report',
        speaker: '市城管局值班员 老张',
        speakerRole: 'urban-management',
        speakerDepartment: '市城管局',
        title: '道路积水情况汇报',
        content:
          '[16:30] 🌊 **道路积水报告**\n\n' +
          '📢 **城管局值班员 老张** 汇报：\n\n' +
          '"指挥长！城区道路巡查发现：\n\n' +
          '🚧 **积水路段**：\n' +
          '• 竹叶山立交：积水35cm，车辆通行受阻\n' +
          '• 发展大道：积水28cm，慢速通行\n' +
          '• 建设大道：积水22cm，尚可通行\n' +
          '• 汉西路下穿通道：积水40cm，已封闭\n\n' +
          '🚿 **排水设施状态**：\n' +
          '• 全市12座泵站全部开机\n' +
          '• 排涝能力达300立方米/秒\n' +
          '• 但降雨量已超过排水设计标准\n\n' +
          '⚠ 建议对积水超30cm路段实施交通管制！"',
        location: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng, label: POI.zhuyeshan.label },
        isUrgent: true,
        emotion: 'worried',
        round: 2,
      },
      {
        id: 'event-2-4',
        time: '17:00',
        type: 'report',
        speaker: '市交警支队 王队',
        speakerRole: 'traffic-bureau',
        speakerDepartment: '市交警支队',
        title: '交通管制方案',
        content:
          '[17:00] 🚦 **交通管控报告**\n\n' +
          '📢 **交警支队 王队** 汇报：\n\n' +
          '"指挥长！根据当前积水情况，建议：\n\n' +
          '🛑 **封控路段**：\n' +
          '• 竹叶山立交全向封闭\n' +
          '• 汉西路下穿通道封闭\n' +
          '• 发展大道（新华路-常青路段）限行\n\n' +
          '🚔 **警力部署**：\n' +
          '• 已出动警力200人\n' +
          '• 设置绕行指示牌45处\n' +
          '• 拖车待命15台\n\n' +
          '📱 **信息发布**：\n' +
          '• 通过交通广播、微博发布绕行提示\n' +
          '• 与高德/百度地图同步封路信息\n\n' +
          '请批准实施交通管制方案！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市交警支队' },
        isUrgent: true,
        round: 2,
      },
      {
        id: 'event-2-5',
        time: '17:30',
        type: 'order',
        speaker: '市应急管理局 张副局长',
        speakerRole: 'emergency-bureau',
        speakerDepartment: '市应急管理局',
        title: 'III级响应启动令',
        content:
          '[17:30] 🔶 **III级响应启动**\n\n' +
          '📢 **市应急管理局 张副局长** 签发：\n\n' +
          '"根据《市防汛抗旱应急预案》，现启动III级应急响应：\n\n' +
          '📋 **响应措施**：\n' +
          '• 各成员单位按职责到岗值班\n' +
          '• 对积水超30cm路段实施交通管制\n' +
          '• 低洼区域居民做好转移准备\n' +
          '• 开放临时安置点，保障基本生活物资\n' +
          '• 医疗救援队进入待命状态\n\n' +
          '🏗 **工程调度**：\n' +
          '• 全力开启排涝泵站\n' +
          '• 加强堤防巡查，每小时报告一次\n' +
          '• 龙王庙险段加强盯守\n\n' +
          '📞 指挥部24小时值班电话已开通"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 16 },
        isUrgent: true,
        emotion: 'concerned',
        round: 2,
      },
      {
        id: 'event-2-6',
        time: '18:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头平移至龙王庙险段',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从竹叶山立交 → 平滑横移至龙王庙险段（Zoom 15）\n\n' +
          '📍 **目标位置**：龙王庙险段（汉江与长江交汇处）\n' +
          '📐 **坐标**：[114.285678, 30.569234]\n' +
          '🔍 **缩放**：15\n\n' +
          '🌊 **画面效果**：长江水位超警红色标记 + 水流湍急动画\n\n' +
          '⚠ **AI参谋提示**：长江水位已超警戒，龙王庙是历史险段，需加强巡查！',
        location: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng, label: POI.longwangmiao.label, zoom: 15 },
        cameraConfig: { center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng }, zoom: 15, duration: 1500, action: 'panTo' },
        round: 2,
      },
      {
        id: 'event-2-7',
        time: '20:00',
        type: 'decision_prompt',
        speaker: 'AI参谋长',
        title: 'AI决策建议 - III级响应关键决策',
        content:
          '💡 **AI参谋长决策建议**\n\n' +
          '🎯 **当前态势评估**：\n' +
          '• III级响应已启动\n' +
          '• 竹叶山立交积水35cm，已实施交通管制\n' +
          '• 长江水位逼近警戒线27.30m\n' +
          '• 龙王庙险段每小时巡查一次\n\n' +
          '📋 **SOP建议**：\n' +
          '根据《手册》第3页III级响应要求：\n' +
          '1. 对积水深度≥50cm的隧道实施硬隔离封闭\n' +
          '2. 龙王庙下游500米范围内居民做好转移准备\n' +
          '3. 请求武警部队预置200人待命\n\n' +
          '⏰ **请指挥部做出决策**：以上三项是否立即执行？',
        location: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng, label: POI.longwangmiao.label },
        emotion: 'concerned',
        round: 2,
      },
    ],
    cameraSteps: [
      {
        step: 1,
        description: '飞入积水核心区',
        target: '竹叶山立交',
        center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2000,
        overlay: '半径800米蓝色积水扩散圈',
      },
      {
        step: 2,
        description: '平移至江堤险段',
        target: '龙王庙险段',
        center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '长江水位超警红色警戒线',
      },
      {
        step: 3,
        description: '检查交通封控点',
        target: '竹叶山立交',
        center: { lat: POI.zhuyeshan.lat, lng: POI.zhuyeshan.lng },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '交通管制红色标识',
      },
    ],
    involvedDepartments: ['市气象局', '市应急管理局', '市城管局', '市水务局', '市交警支队', '市卫健委', '武警武汉支队'],
    playerRoles: [
      { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '升级指挥体系，统筹多部门协同处置III级内涝灾害', level: 'decision', levelName: '决策层' },
      { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '强化应急调度中心运转，统筹物资调配和数据整合', level: 'core', levelName: '核心层' },
      { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '实施积水路段交通管制，疏导受灾区域交通秩序', level: 'collab', levelName: '协同层' },
      { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '调度公交绕行，抢修受损道路，保障抢险通道畅通', level: 'collab', levelName: '协同层' },
      { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '全面启动城区排涝作业，疏通排水设施', level: 'collab', levelName: '协同层' },
      { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '组建医疗应急队伍，做好伤员救治准备', level: 'collab', levelName: '协同层' },
      { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '加密气象监测频次，提供精细化降雨预报', level: 'collab', levelName: '协同层' },
    ],
  },

  // ==================== 第三回合：红色警报 · II级响应 · 生命救援+全面攻坚 ====================
  {
    id: 'phase-3-level2',
    name: '第三回合：红色警报',
    description: '暴雨达到峰值，2小时降雨超100mm，10条主干道同时断交，启动II级响应',
    roundNumber: 3,
    responseLevel: 'II级响应（橙色/红色预警）',
    startTime: '06-21 19:00',
    endTime: '06-21 22:00',
    situation:
      '入梅第4天傍晚，暴雨达到历史极值。过去12小时累计降雨量180毫米，最大小时雨强55毫米/小时，' +
      '已突破50年一遇降水强度。长江汉口站水位达27.30米（超警戒线），预计洪峰24小时内到达。' +
      '10条主干道断交超过3小时，竹叶山立交积水达60cm，武昌多处老旧社区一楼进水。' +
      '全市累计接诊受伤群众156人，其中重伤12人。根据《预案》，需启动II级响应，' +
      '全力开展生命救援、堤防加固、跨区支援、舆论管控。',
    aiAdvisorPrompt:
      '🚨 紧急报告指挥长！灾情已全面升级！\n\n' +
      '当前关键指标已全部触发II级响应条件：\n' +
      '• 12小时累计降雨180mm，已突破50年一遇\n' +
      '• 10条主干道断交，竹叶山立交积水60cm\n' +
      '• 长江水位27.30m（超警戒），洪峰24小时内到达\n' +
      '• 武昌老旧社区一楼进水，群众被困\n' +
      '• 累计受伤156人，重伤12人\n\n' +
      '根据《手册》第17页，需立即启动II级响应。AI已调用武警预备役。\n\n' +
      '请决策：\n' +
      '1. 是否强制关闭低洼地带的地下空间？\n' +
      '2. 是否启用"五包一"机制转移独居老人？\n' +
      '3. 是否请求省级支援？',
    decisionPoints: [
      {
        id: 'dp-3-1',
        question: '暴雨已达峰值，10条主干道断交，是否强制关闭所有低洼地带地下空间？',
        options: [
          {
            id: 'dp-3-1-a',
            label: '全面关闭',
            description: '立即关闭地铁站地下段、地下商场、地下停车场等所有低洼地下空间',
            consequence: '彻底消除倒灌风险，但影响大量市民出行和商业运营',
          },
          {
            id: 'dp-3-1-b',
            label: '部分关闭',
            description: '仅关闭积水严重区域的地下空间，其余加强抽排',
            consequence: '平衡安全与运行，但存在局部风险',
          },
          {
            id: 'dp-3-1-c',
            label: '暂不关闭',
            description: '加强地下空间抽排力量，保持运行',
            consequence: '维持城市运转，但若降雨持续可能导致严重倒灌',
          },
        ],
        recommendedOption: 'dp-3-1-a',
        sopReference: '《手册》第17页II级响应：强制关闭低洼地带地下空间，防止倒灌',
      },
      {
        id: 'dp-3-2',
        question: '武昌老城区多处一楼进水，是否启用"五包一"机制紧急转移独居老人和困难群众？',
        options: [
          {
            id: 'dp-3-2-a',
            label: '立即启动',
            description: '发动社区网格员、志愿者、党员对独居老人实行"五包一"包保转移',
            consequence: '最大程度保障弱势群体生命安全',
          },
          {
            id: 'dp-3-2-b',
            label: '重点转移',
            description: '仅转移一楼严重进水区域的独居老人',
            consequence: '资源集中使用，但可能遗漏部分风险区域',
          },
        ],
        recommendedOption: 'dp-3-2-a',
        sopReference: '《手册》第17页II级响应：对老弱病残孕等特殊群体实行"五包一"转移机制',
      },
      {
        id: 'dp-3-3',
        question: '长江水位已超警戒且洪峰即将到来，是否请求省级防汛抗旱指挥部支援？',
        options: [
          {
            id: 'dp-3-3-a',
            label: '立即请求',
            description: '请求省级派出防汛专家组和抢险队伍支援',
            consequence: '获得更多专业力量和物资支持',
          },
          {
            id: 'dp-3-3-b',
            label: '暂不请求',
            description: '先全力自救，若情况恶化再请求支援',
            consequence: '自主决策空间更大，但可能错过最佳支援时机',
          },
        ],
        recommendedOption: 'dp-3-3-a',
        sopReference: '《手册》II级响应：必要时向上级防指请求支援',
      },
    ],
    events: [
      {
        id: 'event-3-1',
        time: '19:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头飞入武昌老城区',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从龙王庙 → 高速飞越长江至武昌老城区（Zoom 16）\n\n' +
          '📍 **目标位置**：武昌老城区（市三医院附近）\n' +
          '📐 **坐标**：[114.316234, 30.555789]\n' +
          '🔍 **缩放**：16（老旧社区积水倒灌）\n\n' +
          '🏚 **画面效果**：老旧社区积水红色警报 + 居民被困求救信号',
        location: { lat: POI.wuchang.lat, lng: POI.wuchang.lng, label: POI.wuchang.label, zoom: 16 },
        cameraConfig: { center: { lat: POI.wuchang.lat, lng: POI.wuchang.lng }, zoom: 16, duration: 2000, action: 'flyTo' },
        round: 3,
      },
      {
        id: 'event-3-2',
        time: '19:15',
        type: 'alert',
        speaker: '市气象局值班员 小李',
        speakerRole: 'weather-bureau',
        speakerDepartment: '市气象局',
        title: '橙色预警发布',
        content:
          '[19:15] 🟠 **橙色预警发布**\n\n' +
          '📢 **气象局值班员 小李** 紧急报告：\n\n' +
          '"指挥长！暴雨已达到历史极值：\n\n' +
          '🌧 **当前实况**：\n' +
          '• 过去12小时累计降雨量：180毫米\n' +
          '• 最大小时雨强：55毫米/小时\n' +
          '• 已突破50年一遇降水强度\n\n' +
          '⚠ **升级发布暴雨橙色预警！**\n\n' +
          '🌊 **长江水位**：\n' +
          '• 汉口站水位：27.30米（警戒27.30米）\n' +
          '• 预计还将上涨0.5-1.0米\n' +
          '• 洪峰预计24小时内到达\n\n' +
          '📋 **建议立即启动II级响应！**"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市气象局' },
        isUrgent: true,
        emotion: 'urgent',
        soundEffect: 'alert_orange',
        round: 3,
      },
      {
        id: 'event-3-3',
        time: '19:30',
        type: 'meeting',
        speaker: '市长',
        speakerRole: 'mayor',
        speakerDepartment: '市人民政府',
        title: '紧急召开II级指挥部会议',
        content:
          '[19:30] 🚨 **紧急指挥部会议**\n\n' +
          '📢 **市长** 紧急召集：\n\n' +
          '"各成员单位注意！\n\n' +
          '当前全市已进入防汛紧急状态！\n\n' +
          '📊 **当前态势**：\n' +
          '• 10条主干道断交超过3小时\n' +
          '• 竹叶山立交积水达60cm\n' +
          '• 武昌多处老旧社区一楼进水\n' +
          '• 长江水位已超警戒\n' +
          '• 累计受伤156人，重伤12人\n\n' +
          '🎯 **会议议题**：\n' +
          '1. 是否升级为II级响应？\n' +
          '2. 是否请求省级支援？\n' +
          '3. 是否启动大面积人员转移？\n\n' +
          '请各单位按顺序汇报当前情况！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 17 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 17, duration: 2000, action: 'flyTo' },
        isUrgent: true,
        emotion: 'concerned',
        attendees: ['市长', '应急管理局', '水务局', '气象局', '交警支队', '卫健委', '城管局'],
        round: 3,
      },
      {
        id: 'event-3-4',
        time: '19:45',
        type: 'report',
        speaker: '市水务局 陈总工',
        speakerRole: 'water-bureau',
        speakerDepartment: '市水务局',
        title: '水利汛情汇报',
        content:
          '[19:45] 🌊 **水务局汛情通报**\n\n' +
          '📢 **水务局 陈总工** 汇报：\n\n' +
          '"指挥长！水利汛情严峻：\n\n' +
          '🏞 **长江汉口站**：\n' +
          '• 当前水位27.30m（警戒27.30m）\n' +
          '• 流量：55000立方米/秒\n' +
          '• 预计洪峰24小时内到达\n\n' +
          '🌉 **汉江**：\n' +
          '• 新沟站水位：28.50m（超警戒0.5m）\n' +
          '• 流速较快，冲刷严重\n\n' +
          '🏗 **堤防巡查**：\n' +
          '• 龙王庙险段每小时巡查一次\n' +
          '• 暂未发现管涌、渗漏等险情\n' +
          '• 但水位持续上涨压力巨大\n\n' +
          '⚠ 建议启动II级响应，加强堤防防守！"',
        location: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng, label: POI.longwangmiao.label },
        isUrgent: true,
        emotion: 'worried',
        round: 3,
      },
      {
        id: 'event-3-5',
        time: '20:00',
        type: 'report',
        speaker: '市卫健委 刘主任',
        speakerRole: 'health-bureau',
        speakerDepartment: '市卫健委',
        title: '医疗救援汇报',
        content:
          '[20:00] 🏥 **医疗救援报告**\n\n' +
          '📢 **卫健委 刘主任** 汇报：\n\n' +
          '"指挥长！医疗救援情况如下：\n\n' +
          '🚑 **伤员统计**：\n' +
          '• 累计接诊受伤群众156人\n' +
          '• 其中重伤12人（已转同济、协和）\n' +
          '• 轻伤已就近在社区卫生中心处理\n\n' +
          '🏥 **医院状态**：\n' +
          '• 同济医院：正常运行，已加开应急床位\n' +
          '• 协和医院：正常运行，救护车待命\n' +
          '• 市中心医院：一楼进水，部分科室停诊\n\n' +
          '💊 **物资储备**：\n' +
          '• 急救药品1000份已到位\n' +
          '• 防疫物资500套已分发\n' +
          '• 饮水消毒片20000片已调拨\n\n' +
          '⚠ 建议增派心理援助和防疫力量！"',
        location: { lat: 30.5796, lng: 114.2599, label: '同济医院' },
        isUrgent: false,
        round: 3,
      },
      {
        id: 'event-3-6',
        time: '20:30',
        type: 'order',
        speaker: '市长',
        speakerRole: 'mayor',
        speakerDepartment: '市人民政府',
        title: '签署II级响应令',
        content:
          '[20:30] 🟠 **II级响应启动令**\n\n' +
          '📢 **市长** 签发命令：\n\n' +
          '"根据《市防汛抗旱应急预案》，现启动II级应急响应！\n\n' +
          '📋 **核心指令**：\n' +
          '1. 全市进入防汛紧急状态\n' +
          '2. 老城区一楼居民立即转移至洪山体育馆安置点\n' +
          '3. 全市中小学、幼儿园停课\n' +
          '4. 地铁地面段停运，地下段加强抽排\n' +
          '5. 请求省级防汛抗旱指挥部支援\n' +
          '6. 强制关闭低洼地带地下空间\n' +
          '7. 启用"五包一"机制转移独居老人\n\n' +
          '🚨 **最高优先级**：保障人民群众生命安全！\n\n' +
          '各单位立即行动，不得有误！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 17 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 17, duration: 1000, action: 'flyTo' },
        isUrgent: true,
        emotion: 'confident',
        round: 3,
      },
      {
        id: 'event-3-7',
        time: '21:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头平移至洪山体育馆避难所',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从武昌老城区 → 平移至洪山体育馆避难所（Zoom 15）\n\n' +
          '📍 **目标位置**：洪山体育馆（可容纳5000人的临时安置点）\n' +
          '📐 **坐标**：[114.334567, 30.523456]\n' +
          '🔍 **缩放**：15\n\n' +
          '🏟 **画面效果**：避难所人流量热力图 + 救援物资转运动画',
        location: { lat: POI.hongshan.lat, lng: POI.hongshan.lng, label: POI.hongshan.label, zoom: 15 },
        cameraConfig: { center: { lat: POI.hongshan.lat, lng: POI.hongshan.lng }, zoom: 15, duration: 1500, action: 'panTo' },
        round: 3,
      },
      {
        id: 'event-3-8',
        time: '21:30',
        type: 'decision_prompt',
        speaker: 'AI参谋长',
        title: 'AI决策建议 - II级响应关键决策',
        content:
          '💡 **AI参谋长决策建议**\n\n' +
          '🎯 **当前态势评估**：\n' +
          '• II级响应已启动\n' +
          '• 老城区转移正在进行中\n' +
          '• 长江水位27.30m，洪峰24小时内到达\n' +
          '• 龙王庙险段持续巡查中\n\n' +
          '📋 **SOP建议**：\n' +
          '根据《手册》第17页II级响应要求：\n' +
          '1. 强制关闭所有低洼地带地下空间\n' +
          '2. 启用"五包一"机制转移独居老人和困难群众\n' +
          '3. 请求省级防汛抗旱指挥部支援\n' +
          '4. 加强舆情管控，防止谣言扩散\n\n' +
          '⏰ **请指挥部做出决策**：以上措施是否全部执行？',
        location: { lat: POI.hongshan.lat, lng: POI.hongshan.lng, label: POI.hongshan.label },
        emotion: 'concerned',
        round: 3,
      },
    ],
    cameraSteps: [
      {
        step: 1,
        description: '飞入老城区',
        target: '武昌老城',
        center: { lat: POI.wuchang.lat, lng: POI.wuchang.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2000,
        overlay: '老旧社区积水红色警报',
      },
      {
        step: 2,
        description: '平移至安置点',
        target: '洪山体育馆',
        center: { lat: POI.hongshan.lat, lng: POI.hongshan.lng },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '避难所人流量热力图',
      },
      {
        step: 3,
        description: '检查龙王庙堤防',
        target: '龙王庙险段',
        center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng },
        zoom: 15,
        action: 'panTo',
        duration: 1500,
        overlay: '长江水位超警红色警戒线',
      },
    ],
    involvedDepartments: ['市气象局', '市应急管理局', '市水务局', '市卫健委', '市城管局', '市交警支队', '市委网信办', '市通信办', '市住建局', '武警武汉支队'],
    playerRoles: [
      { id: 'mayor', name: '张明', department: '市长（指挥长）', description: '全面接管II级应急指挥，统筹调度全市抢险救援力量', level: 'decision', levelName: '决策层' },
      { id: 'vice-mayor', name: '李强', department: '副市长（副指挥长）', description: '协助市长指挥，分管现场抢险和人员转移工作', level: 'decision', levelName: '决策层' },
      { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '全负荷运转应急指挥平台，统筹全市应急资源调度', level: 'core', levelName: '核心层' },
      { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '大面积交通管制与社会面管控，维护全域治安', level: 'collab', levelName: '协同层' },
      { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '全面调整公共交通运行，保障生命救援通道', level: 'collab', levelName: '协同层' },
      { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '全城排涝总动员，最大限度提升排水能力', level: 'collab', levelName: '协同层' },
      { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '启动医疗应急一级响应，全面保障医疗救治', level: 'collab', levelName: '协同层' },
      { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '滚动发布精准短临预报，支撑决策指挥', level: 'collab', levelName: '协同层' },
      { id: 'housing-bureau', name: '郑强', department: '市住建局局长', description: '负责在建工程停工监管和建筑安全监测', level: 'collab', levelName: '协同层' },
      { id: 'natural-resources', name: '林峰', department: '市自然资源局局长', description: '地质灾害监测预警，防范内涝引发的次生地质灾害', level: 'collab', levelName: '协同层' },
      { id: 'cyberspace', name: '韩雪', department: '市委网信办主任', description: '网络安全保障与舆情监控，及时处置谣言信息', level: 'collab', levelName: '协同层' },
      { id: 'telecom', name: '马超', department: '市通讯办主任', description: '通信网络保障，确保应急指挥通信畅通', level: 'collab', levelName: '协同层' },
      { id: 'power-company', name: '钱进', department: '市供电公司总经理', description: '电力抢修保障，确保关键设施供电安全', level: 'collab', levelName: '协同层' },
      { id: 'armed-police', name: '雷震', department: '武警部队支队长', description: '执行人员转移救援和抢险突击任务', level: 'collab', levelName: '协同层' },
    ],
  },

  // ==================== 第四回合：决战长江 · I级响应 · 极限防御+灾后恢复 ====================
  {
    id: 'phase-4-level1',
    name: '第四回合：决战长江',
    description: '暴雨突破历史极值，启动I级红色预警，请求国家级支援，极限防御+灾后恢复',
    roundNumber: 4,
    responseLevel: 'I级响应（红色预警）',
    startTime: '06-21 22:00',
    endTime: '06-22 06:00',
    situation:
      '暴雨突破历史极值，12小时累计降雨量达310毫米，最大小时雨强82毫米/小时，' +
      '超越2016年7月特大暴雨记录。全市渍水点突破200处。长江水位达27.80米（超警戒0.50米），' +
      '龙王庙险段发现渗水点3处，若溃堤将危及汉口核心区。' +
      '全市进入I级响应最高状态：全面停运公共交通，全市车辆禁行，停工停业。' +
      '中部战区派出解放军1200人驰援，武警800人全员出动，舟桥部队冲锋舟30艘投入救援。' +
      '累计转移被困群众超过10000人，投入兵力超过3000人。',
    aiAdvisorPrompt:
      '🔴 最高级别警报！指挥长同志！\n\n' +
      '暴雨已突破历史极值！所有关键指标均已达到I级响应阈值：\n' +
      '• 12小时累计降雨310mm，超越2016年记录\n' +
      '• 全市渍水点超过200处\n' +
      '• 长江水位27.80m（超警戒0.50m）\n' +
      '• 龙王庙险段出现3处渗水，溃堤风险极高\n' +
      '• 交通全面瘫痪，铁路/机场/地铁全部停运\n\n' +
      '根据《手册》第36页，必须立即启动I级响应！\n\n' +
      '请决策：\n' +
      '1. 是否申请国家防总工作组支援？\n' +
      '2. 是否全面停运公共交通（含地铁/公交/轮渡/铁路）？\n' +
      '3. 是否征用周边物资优先保障安置点？',
    decisionPoints: [
      {
        id: 'dp-4-1',
        question: '龙王庙险段出现3处渗水，长江水位持续上涨，是否请求国家防总派出工作组？',
        options: [
          {
            id: 'dp-4-1-a',
            label: '立即申请',
            description: '请求国家防总派出专家组和工作组赴武汉指导抢险',
            consequence: '获得国家级专业力量支持，提升抢险成功率',
          },
          {
            id: 'dp-4-1-b',
            label: '先依靠省级支援',
            description: '先利用省级力量应对，若仍无法控制再请求国家支援',
            consequence: '自主决策权更大，但可能延误最佳抢险时机',
          },
        ],
        recommendedOption: 'dp-4-1-a',
        sopReference: '《手册》第36页I级响应：请求国家防总派出工作组指导抢险',
      },
      {
        id: 'dp-4-2',
        question: '暴雨持续，是否全面停运公共交通（地铁/公交/轮渡/铁路）？',
        options: [
          {
            id: 'dp-4-2-a',
            label: '全面停运',
            description: '地铁全线停运、公交停运、轮渡停航、铁路停运',
            consequence: '彻底消除交通风险，但影响大量滞留旅客和市民',
          },
          {
            id: 'dp-4-2-b',
            label: '部分停运',
            description: '仅停运地面交通，地铁地下段继续运行（加强抽排）',
            consequence: '保持部分运力，但地铁倒灌风险极高',
          },
          {
            id: 'dp-4-2-c',
            label: '暂不停运',
            description: '继续运行，加强巡查和抽排',
            consequence: '最大化保持城市运转，但安全风险极大',
          },
        ],
        recommendedOption: 'dp-4-2-a',
        sopReference: '《手册》第36页I级响应：全面停运公共交通，保障人员安全',
      },
      {
        id: 'dp-4-3',
        question: '安置点物资需求激增，是否征用周边超市和仓库的食品饮用水？',
        options: [
          {
            id: 'dp-4-3-a',
            label: '立即征用',
            description: '依法征用周边超市、仓库的食品和饮用水，优先保障安置点',
            consequence: '快速满足安置点需求，但可能影响商家正常经营',
          },
          {
            id: 'dp-4-3-b',
            label: '协调采购',
            description: '通过正常渠道协调采购，保障供应',
            consequence: '维护市场秩序，但速度可能不够快',
          },
        ],
        recommendedOption: 'dp-4-3-a',
        sopReference: '《手册》第36页I级响应：必要时依法征用物资保障安置点供应',
      },
    ],
    events: [
      {
        id: 'event-4-1',
        time: '22:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头飞入武汉站',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从洪山体育馆 → 高速飞入武汉站（Zoom 16）\n\n' +
          '📍 **目标位置**：武汉火车站（高铁枢纽）\n' +
          '📐 **坐标**：[114.357890, 30.602345]\n' +
          '🔍 **缩放**：16\n\n' +
          '🚄 **画面效果**：站前广场积水 + 列车停运红色标识 + 滞留旅客',
        location: { lat: POI.wuhanStation.lat, lng: POI.wuhanStation.lng, label: POI.wuhanStation.label, zoom: 16 },
        cameraConfig: { center: { lat: POI.wuhanStation.lat, lng: POI.wuhanStation.lng }, zoom: 16, duration: 2000, action: 'flyTo' },
        round: 4,
      },
      {
        id: 'event-4-2',
        time: '22:10',
        type: 'critical_event',
        speaker: '市气象局 李局长',
        speakerRole: 'weather-bureau',
        speakerDepartment: '市气象局',
        title: '暴雨红色预警 - 历史极值',
        content:
          '[22:10] 🔴 **红色预警发布**\n\n' +
          '📢 **气象局 李局长** 亲自汇报：\n\n' +
          '"指挥长！气象数据已突破历史极值！\n\n' +
          '🌧 **极端数据**：\n' +
          '• 12小时累计降雨量：310毫米\n' +
          '• 最大小时雨强：82毫米/小时\n' +
          '• 超越2016年7月特大暴雨记录\n\n' +
          '🔴 **发布暴雨红色预警！**\n\n' +
          '📊 **灾情对比**：\n' +
          '• 2016年：累计218mm，渍水点162处\n' +
          '• 2024年（当前）：累计310mm+，渍水点突破200处\n\n' +
          '⚠ 建议立即启动I级响应，请求国家防总支援！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市气象局' },
        isUrgent: true,
        emotion: 'urgent',
        soundEffect: 'alert_red',
        round: 4,
      },
      {
        id: 'event-4-3',
        time: '22:15',
        type: 'order',
        speaker: '市长',
        speakerRole: 'mayor',
        speakerDepartment: '市人民政府',
        title: 'I级响应启动 - 全城动员',
        content:
          '[22:15] 🔴 **I级响应启动令**\n\n' +
          '📢 **市长** 签发最高级别命令：\n\n' +
          '"根据《市防汛抗旱应急预案》，现启动I级应急响应！\n\n' +
          '📋 **总动员令**：\n' +
          '1. 全市进入防汛紧急最高状态\n' +
          '2. 全面停运公共交通（地铁/公交/轮渡/铁路）\n' +
          '3. 除应急车辆外，全市车辆禁行\n' +
          '4. 全市企事业单位停工停业（除保供单位）\n' +
          '5. 请求国家防总派出工作组\n' +
          '6. 龙王庙险段立即加固\n\n' +
          '🚨 **部队调用**：\n' +
          '• 请求中部战区派出解放军支援\n' +
          '• 武警武汉支队全员出动\n' +
          '• 民兵预备役动员集结\n\n' +
          '🙏 全市人民：生命安全第一，听从指挥，有序转移！"',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: '市应急指挥中心', zoom: 17 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 17, duration: 1200, action: 'flyTo' },
        isUrgent: true,
        emotion: 'confident',
        round: 4,
      },
      {
        id: 'event-4-4',
        time: '22:30',
        type: 'critical_event',
        speaker: '市应急管理局 张副局长',
        speakerRole: 'emergency-bureau',
        speakerDepartment: '市应急管理局',
        title: '龙王庙险段告急',
        content:
          '[22:30] 🆘 **龙王庙险段告急**\n\n' +
          '📢 **应急管理局 张副局长** 紧急汇报：\n\n' +
          '"指挥长！龙王庙险段出现险情！\n\n' +
          '🌊 **险情详情**：\n' +
          '• 长江水位：27.80m（超警戒0.50m）\n' +
          '• 发现渗水点3处\n' +
          '• 汉江汇流口水流湍急\n' +
          '• 若溃堤将危及汉口核心区\n\n' +
          '🛡 **当前防御**：\n' +
          '• 武警200人已到达现场加固堤坝\n' +
          '• 沙袋5000个正在运输中\n' +
          '• 下游居民正在紧急疏散\n\n' +
          '⚠ 需要增派部队和工程机械！刻不容缓！"',
        location: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng, label: POI.longwangmiao.label, zoom: 18 },
        cameraConfig: { center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng }, zoom: 18, duration: 2000, action: 'flyTo' },
        isUrgent: true,
        emotion: 'urgent',
        round: 4,
      },
      {
        id: 'event-4-5',
        time: '23:00',
        type: 'report',
        speaker: '武警武汉支队 赵支队长',
        speakerRole: 'armed-police',
        speakerDepartment: '武警武汉支队',
        title: '武装力量驰援到位',
        content:
          '[23:00] 💪 **国家级救援力量抵达**\n\n' +
          '📢 **武警武汉支队 赵支队长** 报告：\n\n' +
          '"指挥长！武装力量已全面部署：\n\n' +
          '🪖 **兵力部署**：\n' +
          '• 武警武汉支队：800人全员出动\n' +
          '• 中部战区陆军某旅：1200人驰援\n' +
          '• 舟桥部队：冲锋舟30艘、架桥设备5套\n\n' +
          '🎯 **任务分配**：\n' +
          '• 龙王庙险段：500人加固堤坝\n' +
          '• 武昌老城区：600人转移群众\n' +
          '• 汉口火车站：400人维持秩序\n' +
          '• 应急预备队：500人机动待命\n\n' +
          '🛡 请指挥长放心，我们坚决守住大堤！"',
        location: { lat: POI.wuhanStation.lat, lng: POI.wuhanStation.lng, label: '武警武汉支队', zoom: 15 },
        isUrgent: false,
        emotion: 'confident',
        round: 4,
      },
      {
        id: 'event-4-6',
        time: '23:30',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '镜头拉远至天河机场',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从武汉站 → 飞越城区至天河机场（Zoom 13）\n\n' +
          '📍 **目标位置**：武汉天河国际机场\n' +
          '📐 **坐标**：[114.207890, 30.781234]\n' +
          '🔍 **缩放**：13（大范围航拍机场状态）\n\n' +
          '🛫 **画面效果**：机场跑道积水 + 航班大面积延误橙色标识 + 滞留旅客',
        location: { lat: POI.tianheAirport.lat, lng: POI.tianheAirport.lng, label: POI.tianheAirport.label, zoom: 13 },
        cameraConfig: { center: { lat: POI.tianheAirport.lat, lng: POI.tianheAirport.lng }, zoom: 13, duration: 2000, action: 'panTo' },
        round: 4,
      },
      {
        id: 'event-4-7',
        time: '06-22 00:30',
        type: 'report',
        speaker: '市消防救援支队 孙队长',
        speakerRole: 'fire-brigade',
        speakerDepartment: '市消防救援支队',
        title: '排涝救援战报',
        content:
          '[00:30] 🚒 **消防救援战报**\n\n' +
          '📢 **消防救援支队 孙队长** 报告：\n\n' +
          '"指挥长！消防救援最新进展：\n\n' +
          '🚒 **排涝进展**：\n' +
          '• 龙吸水泵车2台满负荷运行\n' +
          '• 移动排涝车5台分散部署\n' +
          '• 累计抽排积水120万立方米\n\n' +
          '🛟 **救援成效**：\n' +
          '• 冲锋舟20艘全天候作业\n' +
          '• 累计转移被困群众3500余人\n' +
          '• 解救被困车辆180余台\n\n' +
          '⚠ 但降雨仍在持续，积水面积仍在扩大..."',
        location: { lat: 30.5798, lng: 114.2599, label: '市消防救援支队' },
        isUrgent: false,
        emotion: 'worried',
        round: 4,
      },
      {
        id: 'event-4-8',
        time: '06-22 06:00',
        type: 'camera_move',
        speaker: '镜头控制',
        title: '黎明俯瞰 — 全市灾后总结',
        content:
          '🎬 **镜头动作**：\n\n' +
          '从天河机场 → 缓慢拉远至全市俯瞰（Zoom 10.5）\n\n' +
          '📍 **目标位置**：武汉市政府（全市总结视角）\n' +
          '📐 **坐标**：[114.305393, 30.599554]\n' +
          '🔍 **缩放**：10.5（俯瞰三镇，长江汉水尽收眼底）\n\n' +
          '🌅 **画面效果**：\n' +
          '• 卫星图渐变显示全市积水覆盖范围\n' +
          '• 救援力量蓝色散点分布全城\n' +
          '• 雨量渐弱，云层开始消散\n\n' +
          '📊 **24小时灾情汇总**：\n' +
          '• 降雨量：突破320毫米\n' +
          '• 渍水点：超过200处\n' +
          '• 转移群众：超过10万人\n' +
          '• 投入兵力：超过3000人\n' +
          '• 响应等级：IV级 → III级 → II级 → I级',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: POI.wuhanGov.label, zoom: 10.5 },
        cameraConfig: { center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng }, zoom: 10.5, duration: 3000, action: 'easeOut' },
        isHighlight: true,
        emotion: 'calm',
        round: 4,
      },
      {
        id: 'event-4-9',
        time: '06-22 06:00',
        type: 'decision_prompt',
        speaker: 'AI参谋长',
        title: 'AI决策建议 - I级响应关键决策',
        content:
          '💡 **AI参谋长决策建议**\n\n' +
          '🎯 **当前态势评估**：\n' +
          '• I级响应已启动，全城动员\n' +
          '• 龙王庙险段3处渗水，武警正在加固\n' +
          '• 长江水位27.80m，仍持续上涨\n' +
          '• 累计转移群众超过10万人\n' +
          '• 国家级救援力量已全部到位\n\n' +
          '📋 **SOP建议**：\n' +
          '根据《手册》第36页I级响应要求：\n' +
          '1. 申请国家防总工作组支援\n' +
          '2. 全面停运公共交通（含地铁/公交/轮渡/铁路）\n' +
          '3. 征用周边物资优先保障安置点\n' +
          '4. 龙王庙险段24小时不间断加固\n' +
          '5. 准备灾后防疫消杀工作\n\n' +
          '⏰ **请指挥部做出决策**：以上措施是否全部执行？',
        location: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng, label: POI.wuhanGov.label },
        emotion: 'concerned',
        round: 4,
      },
    ],
    cameraSteps: [
      {
        step: 1,
        description: '飞入交通枢纽',
        target: '武汉站',
        center: { lat: POI.wuhanStation.lat, lng: POI.wuhanStation.lng },
        zoom: 16,
        action: 'flyTo',
        duration: 2000,
        overlay: '铁路停运红色标识',
      },
      {
        step: 2,
        description: '拉远至机场',
        target: '天河机场',
        center: { lat: POI.tianheAirport.lat, lng: POI.tianheAirport.lng },
        zoom: 13,
        action: 'panTo',
        duration: 2000,
        overlay: '航班大面积延误橙色标识',
      },
      {
        step: 3,
        description: '检查龙王庙险情',
        target: '龙王庙险段',
        center: { lat: POI.longwangmiao.lat, lng: POI.longwangmiao.lng },
        zoom: 18,
        action: 'panTo',
        duration: 2000,
        overlay: '堤防渗水红色警报 + 武警加固动画',
      },
      {
        step: 4,
        description: '全市俯瞰总结',
        target: '武汉市政府',
        center: { lat: POI.wuhanGov.lat, lng: POI.wuhanGov.lng },
        zoom: 10.5,
        action: 'easeOut',
        duration: 3000,
        overlay: '全市积水红色覆盖 + 救援力量蓝色散点',
      },
    ],
    involvedDepartments: ['市气象局', '市应急管理局', '市水务局', '市卫健委', '市城管局', '市交警支队', '市供电公司', '市交通局', '市发改委', '市商务局', '武警武汉支队', '中部战区', '国家防总'],
    playerRoles: [
      { id: 'mayor', name: '张明', department: '市长（指挥长）', description: '担任总指挥长，全面启动I级响应，发布全市动员令并请求国家级支援', level: 'decision', levelName: '决策层' },
      { id: 'vice-mayor', name: '李强', department: '副市长（副指挥长）', description: '分片包干前线指挥，组织最大范围人员疏散转移', level: 'decision', levelName: '决策层' },
      { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '全负荷运转国家级应急协调，统筹全域救援力量和物资调配', level: 'core', levelName: '核心层' },
      { id: 'water-bureau', name: '冯涛', department: '市水利局局长', description: '水库河道全流域监测调度，防洪工程应急运行', level: 'collab', levelName: '协同层' },
      { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '全域交通封闭管控，维护社会面最高等级治安秩序', level: 'collab', levelName: '协同层' },
      { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '公共交通全面停运协调，保障国家级救援力量通行', level: 'collab', levelName: '协同层' },
      { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '不计成本全力排涝，保障城市核心功能区运转', level: 'collab', levelName: '协同层' },
      { id: 'housing-bureau', name: '郑强', department: '市住建局局长', description: '建筑安全应急评估，组织危险建筑人员强制撤离', level: 'collab', levelName: '协同层' },
      { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '启动全市医疗卫生最高级别应急响应，大规模医疗救治', level: 'collab', levelName: '协同层' },
      { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '最高级别气象监测保障，提供分钟级精准预报', level: 'collab', levelName: '协同层' },
      { id: 'natural-resources', name: '林峰', department: '市自然资源局局长', description: '全方位地质灾害监测与次生灾害链预警', level: 'collab', levelName: '协同层' },
      { id: 'telecom', name: '马超', department: '市通讯办主任', description: '保障极限条件下应急通信不中断', level: 'collab', levelName: '协同层' },
      { id: 'power-company', name: '钱进', department: '市供电公司总经理', description: '受灾区域电力紧急处置与关键设施供电保障', level: 'collab', levelName: '协同层' },
      { id: 'armed-police', name: '雷震', department: '武警部队支队长', description: '大规模军事化救援，承担急难险重抢险任务', level: 'collab', levelName: '协同层' },
    ],
  },
];

// ==================== 辅助工具函数 ====================

export function getPhaseById(id: string): ScenarioPhase | undefined {
  return scenarioPhases.find((p) => p.id === id);
}

export function getPhaseByRound(round: number): ScenarioPhase | undefined {
  return scenarioPhases.find((p) => p.roundNumber === round);
}

export function getAllPhases(): ScenarioPhase[] {
  return scenarioPhases;
}

export function getResponseLevelColor(level: string): string {
  if (level.includes('I级') && level.includes('红色')) return '#dc2626';
  if (level.includes('II级') && level.includes('橙色')) return '#ea580c';
  if (level.includes('III级') && level.includes('黄色')) return '#eab308';
  if (level.includes('IV级') && level.includes('蓝色')) return '#2563eb';
  return '#94a3b8';
}

export function getEventTypeColor(type: ScenarioEventType): string {
  const colors: Record<ScenarioEventType, string> = {
    narration: '#94a3b8',
    alert: '#ef4444',
    report: '#f59e0b',
    meeting: '#8b5cf6',
    order: '#ec4899',
    camera_move: '#6366f1',
    critical_event: '#991b1b',
    decision_prompt: '#10b981',
  };
  return colors[type] || '#94a3b8';
}

export function getEventIcon(type: ScenarioEventType): string {
  const icons: Record<ScenarioEventType, string> = {
    narration: 'book-open',
    alert: 'alert-triangle',
    report: 'upload',
    meeting: 'users',
    order: 'clipboard-list',
    camera_move: 'video',
    critical_event: 'alert-octagon',
    decision_prompt: 'message-circle',
  };
  return icons[type] || 'circle';
}

export function getEmotionEmoji(emotion: EmotionType): string {
  const emojis: Record<EmotionType, string> = {
    calm: '😌',
    urgent: '🚨',
    worried: '😰',
    confident: '💪',
    concerned: '😟',
  };
  return emojis[emotion] || '📋';
}

// ==================== AI 参谋提示词生成 ====================

export function getAdvisorPromptForPhase(phaseIndex: number, playerRoleId?: string, situation?: string): string {
  const phase = scenarioPhases[phaseIndex];
  if (!phase) return '暂无可用数据。';

  let prompt = phase.aiAdvisorPrompt;

  if (situation) {
    prompt += `\n\n当前灾情：${situation}`;
  }

  if (playerRoleId) {
    const roleMessages: Record<string, string> = {
      'role-mayor': '\n\n作为市长，您需要统筹全局，协调各部门行动。',
      'role-emergency': '\n\n作为应急局局长，您需要统筹救援力量，协调物资调配。',
      'role-police': '\n\n作为公安局长，您需要实施交通管制，维护社会秩序。',
      'role-traffic': '\n\n作为交通局长，您需要发布绕行方案，抢通生命线。',
      'role-weather': '\n\n作为气象局长，您需要加密监测频次，及时发布预警。',
      'role-armed': '\n\n作为武警指挥官，您需要调度预备役参与救援行动。',
      'role-commerce': '\n\n作为商务局长，您需要保障物资供应，稳定市场秩序。',
    };
    if (roleMessages[playerRoleId]) {
      prompt += roleMessages[playerRoleId];
    }
  }

  return prompt;
}

// ==================== 兼容旧版 historical-replay 导出 ====================
export { scenarioPhases as wuhanScenario };

// ==================== 根据响应等级动态获取角色 ====================
export function getRolesByResponseLevel(responseLevel: string): PlayerRole[] {
  const level = responseLevel.includes('I级') && responseLevel.includes('红色') ? 'I' :
    responseLevel.includes('II级') ? 'II' :
    responseLevel.includes('III级') ? 'III' :
    responseLevel.includes('IV级') ? 'IV' : 'prologue';

  switch (level) {
    case 'IV':
      return [
        { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '统筹指挥IV级内涝应急响应，协调各成员单位落实防汛措施', level: 'decision', levelName: '决策层' },
        { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '执行IV级响应调度，负责信息汇总与物资备勤', level: 'core', levelName: '核心层' },
        { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '组织城区排水管网巡查和积水点监测', level: 'collab', levelName: '协同层' },
        { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '保障重点运输通道畅通，发布交通出行提示', level: 'collab', levelName: '协同层' },
        { id: 'street-office', name: '吴涛', department: '属地街道办主任', description: '负责社区预警通知、隐患排查及脆弱群体摸排', level: 'collab', levelName: '协同层' },
      ];
    case 'III':
      return [
        { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '升级指挥体系，统筹多部门协同处置III级内涝灾害', level: 'decision', levelName: '决策层' },
        { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '强化应急调度中心运转，统筹物资调配和数据整合', level: 'core', levelName: '核心层' },
        { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '实施积水路段交通管制，疏导受灾区域交通秩序', level: 'collab', levelName: '协同层' },
        { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '调度公交绕行，抢修受损道路，保障抢险通道畅通', level: 'collab', levelName: '协同层' },
        { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '全面启动城区排涝作业，疏通排水设施', level: 'collab', levelName: '协同层' },
        { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '组建医疗应急队伍，做好伤员救治准备', level: 'collab', levelName: '协同层' },
        { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '加密气象监测频次，提供精细化降雨预报', level: 'collab', levelName: '协同层' },
      ];
    case 'II':
      return [
        { id: 'mayor', name: '张明', department: '市长（指挥长）', description: '全面接管II级应急指挥，统筹调度全市抢险救援力量', level: 'decision', levelName: '决策层' },
        { id: 'vice-mayor', name: '李强', department: '副市长（副指挥长）', description: '协助市长指挥，分管现场抢险和人员转移工作', level: 'decision', levelName: '决策层' },
        { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '全负荷运转应急指挥平台，统筹全市应急资源调度', level: 'core', levelName: '核心层' },
        { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '大面积交通管制与社会面管控，维护全域治安', level: 'collab', levelName: '协同层' },
        { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '全面调整公共交通运行，保障生命救援通道', level: 'collab', levelName: '协同层' },
        { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '全城排涝总动员，最大限度提升排水能力', level: 'collab', levelName: '协同层' },
        { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '启动医疗应急一级响应，全面保障医疗救治', level: 'collab', levelName: '协同层' },
        { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '滚动发布精准短临预报，支撑决策指挥', level: 'collab', levelName: '协同层' },
        { id: 'housing-bureau', name: '郑强', department: '市住建局局长', description: '负责在建工程停工监管和建筑安全监测', level: 'collab', levelName: '协同层' },
        { id: 'natural-resources', name: '林峰', department: '市自然资源局局长', description: '地质灾害监测预警，防范内涝引发的次生地质灾害', level: 'collab', levelName: '协同层' },
        { id: 'cyberspace', name: '韩雪', department: '市委网信办主任', description: '网络安全保障与舆情监控，及时处置谣言信息', level: 'collab', levelName: '协同层' },
        { id: 'telecom', name: '马超', department: '市通讯办主任', description: '通信网络保障，确保应急指挥通信畅通', level: 'collab', levelName: '协同层' },
        { id: 'power-company', name: '钱进', department: '市供电公司总经理', description: '电力抢修保障，确保关键设施供电安全', level: 'collab', levelName: '协同层' },
        { id: 'armed-police', name: '雷震', department: '武警部队支队长', description: '执行人员转移救援和抢险突击任务', level: 'collab', levelName: '协同层' },
      ];
    case 'I':
      return [
        { id: 'mayor', name: '张明', department: '市长（指挥长）', description: '担任总指挥长，全面启动I级响应，发布全市动员令并请求国家级支援', level: 'decision', levelName: '决策层' },
        { id: 'vice-mayor', name: '李强', department: '副市长（副指挥长）', description: '分片包干前线指挥，组织最大范围人员疏散转移', level: 'decision', levelName: '决策层' },
        { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '全负荷运转国家级应急协调，统筹全域救援力量和物资调配', level: 'core', levelName: '核心层' },
        { id: 'water-bureau', name: '冯涛', department: '市水利局局长', description: '水库河道全流域监测调度，防洪工程应急运行', level: 'collab', levelName: '协同层' },
        { id: 'police-bureau', name: '陈勇', department: '市公安局局长', description: '全域交通封闭管控，维护社会面最高等级治安秩序', level: 'collab', levelName: '协同层' },
        { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '公共交通全面停运协调，保障国家级救援力量通行', level: 'collab', levelName: '协同层' },
        { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '不计成本全力排涝，保障城市核心功能区运转', level: 'collab', levelName: '协同层' },
        { id: 'housing-bureau', name: '郑强', department: '市住建局局长', description: '建筑安全应急评估，组织危险建筑人员强制撤离', level: 'collab', levelName: '协同层' },
        { id: 'health-bureau', name: '周敏', department: '市卫健委主任', description: '启动全市医疗卫生最高级别应急响应，大规模医疗救治', level: 'collab', levelName: '协同层' },
        { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', description: '最高级别气象监测保障，提供分钟级精准预报', level: 'collab', levelName: '协同层' },
        { id: 'natural-resources', name: '林峰', department: '市自然资源局局长', description: '全方位地质灾害监测与次生灾害链预警', level: 'collab', levelName: '协同层' },
        { id: 'telecom', name: '马超', department: '市通讯办主任', description: '保障极限条件下应急通信不中断', level: 'collab', levelName: '协同层' },
        { id: 'power-company', name: '钱进', department: '市供电公司总经理', description: '受灾区域电力紧急处置与关键设施供电保障', level: 'collab', levelName: '协同层' },
        { id: 'armed-police', name: '雷震', department: '武警部队支队长', description: '大规模军事化救援，承担急难险重抢险任务', level: 'collab', levelName: '协同层' },
      ];
    default: // 序章
      return [
        { id: 'vice-mayor', name: '李强', department: '副市长（指挥长）', description: '统筹指挥IV级内涝应急响应，协调各成员单位落实防汛措施', level: 'decision', levelName: '决策层' },
        { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', description: '执行IV级响应调度，负责信息汇总与物资备勤', level: 'core', levelName: '核心层' },
        { id: 'urban-management', name: '赵军', department: '市城管局局长', description: '组织城区排水管网巡查和积水点监测', level: 'collab', levelName: '协同层' },
        { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', description: '保障重点运输通道畅通，发布交通出行提示', level: 'collab', levelName: '协同层' },
        { id: 'street-office', name: '吴涛', department: '属地街道办主任', description: '负责社区预警通知、隐患排查及脆弱群体摸排', level: 'collab', levelName: '协同层' },
      ];
  }
}
