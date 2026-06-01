export interface DisasterScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  level: 'IV' | 'III' | 'II' | 'I';
  levelName: string;
  requiredRoles: string[];
  situation: string;
}

export interface Role {
  id: string;
  name: string;
  department: string;
  level: 'decision' | 'core' | 'collab';
  description: string;
}

export const availableRoles: Role[] = [
  { id: 'mayor', name: '张明', department: '市长（指挥长）', level: 'decision', description: '统筹调度全市应急响应工作，督促各单位落实防汛措施' },
  { id: 'vice-mayor', name: '李强', department: '副市长（副指挥长）', level: 'decision', description: '指令水文部门监测河道水位、流量，协调各部门开展应急处置' },
  { id: 'emergency-bureau', name: '王刚', department: '市应急局局长', level: 'core', description: '安排专职人员值班，实时接收气象水文数据，调拨应急物资' },
  { id: 'urban-management', name: '赵军', department: '市城管局局长', level: 'collab', description: '负责市区排涝设施维护，排水管网疏通，积水抽排' },
  { id: 'traffic-bureau', name: '刘伟', department: '市交通局局长', level: 'collab', description: '保障抢险运输通道畅通，调度公交绕行，组织抢修受损道路' },
  { id: 'police-bureau', name: '陈勇', department: '市公安局局长', level: 'collab', description: '负责疏导受灾地区道路交通，实施交通管制，维护治安秩序' },
  { id: 'health-bureau', name: '周敏', department: '市卫健委主任', level: 'collab', description: '负责组建医疗卫生应急队伍，指导灾区实施医疗救治' },
  { id: 'weather-bureau', name: '孙磊', department: '市气象局局长', level: 'collab', description: '实时监测雨情，每小时更新气象预警信息' },
  { id: 'street-office', name: '吴涛', department: '属地街道办主任', level: 'collab', description: '负责信息上报、社区通知、隐患排查、脆弱群体转移' },
  { id: 'housing-bureau', name: '郑强', department: '市住建局局长', level: 'collab', description: '负责在建工程停工、人员转移安置、建筑安全监测' },
  { id: 'natural-resources', name: '林峰', department: '市自然资源局局长', level: 'collab', description: '负责地质灾害监测预警、山体滑坡风险评估' },
  { id: 'cyberspace', name: '韩雪', department: '市委网信办主任', level: 'collab', description: '负责网络安全保障、舆情监控与谣言处置' },
  { id: 'telecom', name: '马超', department: '市通讯办主任', level: 'collab', description: '负责通信网络保障、应急通信资源调配' },
  { id: 'power-company', name: '钱进', department: '市供电公司总经理', level: 'collab', description: '负责电力抢修保障、关键设施双回路供电' },
  { id: 'armed-police', name: '雷震', department: '武警部队支队长', level: 'collab', description: '负责人员转移救援、抢险装备调配、军事化救援行动' },
  { id: 'water-bureau', name: '冯涛', department: '市水利局局长', level: 'collab', description: '负责水库河道监测、洪水预警、水利工程调度' },
  { id: 'civil-affairs', name: '何芳', department: '市民政局局长', level: 'collab', description: '负责流浪人员救助、弱势群体保障、御寒物资调拨' },
  { id: 'agriculture-bureau', name: '田野', department: '市农业农村局局长', level: 'collab', description: '负责农业防冻指导、农作物保护、大棚加固' },
  { id: 'seismology-bureau', name: '赵震', department: '市地震局局长', level: 'collab', description: '负责震情监测、余震预测、烈度速报' },
  { id: 'fire-brigade', name: '郑勇', department: '市消防支队支队长', level: 'collab', description: '负责地震救援、生命搜救、次生灾害处置' },
  { id: 'fire-rescue', name: '林锋', department: '市消防救援支队支队长', level: 'collab', description: '负责森林火灾扑救、火场指挥、安全避险' },
];

export const disasterScenarios: DisasterScenario[] = [
  { id: 'urban-waterlogging-1', name: '城市内涝IV级响应', type: '内涝', description: '城区出现持续强降雨，主干道积水深度≥30cm且持续20分钟', level: 'IV', levelName: 'IV级（蓝色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'urban-management', 'traffic-bureau', 'street-office'], situation: '本次城区内出现持续强降雨，1小时降雨量≥30mm，主干道积水深度≥30cm且持续20分钟，气象局发布蓝色预警，根据市局防汛抗旱应急预案此时需启动Ⅳ级响应。' },
  { id: 'urban-waterlogging-2', name: '城市内涝III级响应', type: '内涝', description: '降雨量持续上升，单小时降雨量≥50mm且持续，城市排水系统超负荷运行', level: 'III', levelName: 'III级（黄色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'police-bureau', 'traffic-bureau', 'urban-management', 'health-bureau', 'weather-bureau'], situation: '降雨量持续上升，本市单小时降雨量≥50mm且持续，气象局发布黄色预警，交警监测到多个主干道积水深度超30mm且持续30分钟以上，城市管理局上报超过5处内涝点，排水系统超负荷运行，根据市局防汛抗旱应急预案此时需启动Ⅲ级响应。' },
  { id: 'urban-waterlogging-3', name: '城市内涝II级响应', type: '内涝', description: '12小时降水量≥100mm，大面积城市积水，多条主干道断交', level: 'II', levelName: 'II级（橙色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'police-bureau', 'traffic-bureau', 'urban-management', 'health-bureau', 'weather-bureau', 'housing-bureau', 'natural-resources', 'cyberspace', 'telecom', 'power-company', 'armed-police'], situation: '降雨量持续上升，本市12小时内持续降水量≥100mm，气象局发布橙色预警，交警监测到降雨引发大面积城市积水，主干道积水深度≥80cm且持续2小时以上，城市管理上报超过5条主干道同时断交，其中涉及电子设备周边道路全面中断影响供电，Ⅱ级响应下已投入全部移动排涝车、冲锋舟但积水消退率＜30%，且灾情持续强化，根据市局防汛抗旱应急预案此时需启动Ⅱ级响应。' },
  { id: 'urban-waterlogging-4', name: '城市内涝I级响应', type: '内涝', description: '12小时降雨量≥300mm，特大暴雨，全城瘫痪，需国家级力量支援', level: 'I', levelName: 'I级（红色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'water-bureau', 'police-bureau', 'traffic-bureau', 'urban-management', 'housing-bureau', 'health-bureau', 'weather-bureau', 'natural-resources', 'telecom', 'power-company', 'armed-police'], situation: '降雨量持续上升，本市连续12小时降雨量≥300mm，气象局发布红色预警，交警监测到降雨引发大面积城市积水，主干道积水深度≥100cm且持续扩大，城市管理局上报超过10条主干道同时断交超过12小时，医院、应急指挥中心周边道路全部中断救援车辆无法通行，Ⅱ级响应下已投入全部省级救援力量如龙吸水泵车、省级武警但灾情持续恶化需申请国家级力量支援，根据市局防汛抗旱应急预案此时需启动Ⅰ级响应。' },
  { id: 'cold-wave-1', name: '寒潮IV级响应（蓝色预警）', type: '寒潮', description: '48小时降温幅度≥8℃，最低气温将降至4℃以下', level: 'IV', levelName: 'IV级（蓝色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'weather-bureau', 'civil-affairs', 'urban-management', 'street-office'], situation: '受强冷空气影响，预计未来48小时内全市降温幅度≥8℃，最低气温将降至4℃以下，市气象台已发布寒潮蓝色预警信号。部分山区可能出现道路结冰现象，对交通运输、农业生产、市政设施及市民生活产生一定影响。根据《市低温雨雪冰冻灾害应急预案》规定，此时需启动Ⅳ级响应。' },
  { id: 'cold-wave-2', name: '寒潮III级响应（黄色预警）', type: '寒潮', description: '48小时降温幅度≥10℃，最低气温将降至0℃以下', level: 'III', levelName: 'III级（黄色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'weather-bureau', 'civil-affairs', 'urban-management', 'traffic-bureau', 'agriculture-bureau', 'health-bureau', 'power-company', 'street-office'], situation: '强冷空气持续南下影响本市，预计48小时内降温幅度≥10℃，最低气温将降至0℃以下，市气象台已发布寒潮黄色预警信号。城区主干道已出现薄冰，部分路段结冰厚度达1-2cm；农业大棚受损报告增至15处；电力负荷较日常峰值上升20%。根据《市低温雨雪冰冻灾害应急预案》规定，此时需启动Ⅲ级响应。' },
  { id: 'cold-wave-3', name: '寒潮II级响应（橙色预警）', type: '寒潮', description: '48小时降温幅度≥12℃，最低气温将降至-4℃以下', level: 'II', levelName: 'II级（橙色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'weather-bureau', 'civil-affairs', 'urban-management', 'traffic-bureau', 'agriculture-bureau', 'health-bureau', 'power-company', 'street-office'], situation: '极端强冷空气持续影响本市，预计48小时内降温幅度≥12℃，最低气温将降至-4℃以下，市气象台已发布寒潮橙色预警信号。城区超过60%主干道结冰厚度≥3cm，10条以上公交线路停运；农业受灾面积超5000亩；电网最大负荷已达历史极值的95%，3处变电站出现覆冰告警；养老机构供暖不足报警12起。Ⅲ级响应下已投入全部除雪融盐设备，但路面结冰清除速度不及新增速度。根据《市低温雨雪冰冻灾害应急预案》规定，此时需启动Ⅱ级响应。' },
  { id: 'cold-wave-4', name: '寒潮I级响应（红色预警）', type: '寒潮', description: '48小时降温幅度≥16℃，最低气温将降至-8℃以下', level: 'I', levelName: 'I级（红色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'weather-bureau', 'civil-affairs', 'urban-management', 'traffic-bureau', 'agriculture-bureau', 'health-bureau', 'power-company', 'street-office'], situation: '特强寒潮天气持续侵袭本市，预计48小时内降温幅度≥16℃，最低气温将降至-8℃以下，市气象台已发布寒潮红色预警信号。全域主干道结冰厚度≥5cm且持续扩大，城市交通近乎瘫痪；农业遭受毁灭性打击；电网面临崩溃风险，停电影响范围已覆盖40%居民小区；集中供热系统因极端低温运行压力达到设计极限；供水主管网多处冻裂，数万居民用水受影响。Ⅱ级响应下已投入全部省级救援力量，但灾情仍持续恶化，需申请国家级力量支援。根据《市低温雨雪冰冻灾害应急预案》规定，此时需启动Ⅰ级响应。' },
  { id: 'earthquake-1', name: '地震IV级响应（一般地震灾害）', type: '地震', description: '发生4.0-4.9级地震，震中烈度VI度以下', level: 'IV', levelName: '一般地震灾害', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'seismology-bureau', 'housing-bureau', 'health-bureau', 'police-bureau', 'traffic-bureau', 'fire-brigade', 'street-office'], situation: '本市及周边区域发生4.0-4.9级地震，震中烈度VI度以下，造成少量房屋轻微损坏，无人员死亡或仅有个别轻伤，生命线工程基本正常，社会秩序稳定。根据市地震应急预案需启动Ⅳ级响应。' },
  { id: 'earthquake-2', name: '地震III级响应（较大地震灾害）', type: '地震', description: '发生5.0-5.9级地震，震中烈度VII-VIII度', level: 'III', levelName: '较大地震灾害', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'seismology-bureau', 'housing-bureau', 'health-bureau', 'police-bureau', 'traffic-bureau', 'fire-brigade', 'street-office'], situation: '本市及周边区域发生5.0-5.9级地震，震中烈度VII-VIII度，造成部分房屋损坏或倒塌，出现人员受伤情况，个别老旧建筑结构性受损，交通、供水、供电等基础设施局部中断。根据市地震应急预案需启动Ⅲ级响应。' },
  { id: 'earthquake-3', name: '地震II级响应（重大地震灾害）', type: '地震', description: '发生6.0-6.9级地震，震中烈度IX-X度', level: 'II', levelName: '重大地震灾害', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'seismology-bureau', 'housing-bureau', 'health-bureau', 'police-bureau', 'traffic-bureau', 'fire-brigade', 'street-office'], situation: '本市及周边区域发生6.0-6.9级地震，震中烈度IX-X度，造成大量房屋严重损坏或倒塌，人员伤亡较重，交通干线、供水供电、通信网络等基础设施大面积损毁，可能引发滑坡、液化等次生灾害。根据市地震应急预案需启动Ⅱ级响应。' },
  { id: 'earthquake-4', name: '地震I级响应（特别重大地震灾害）', type: '地震', description: '发生≥7.0级地震，震中烈度XI度以上', level: 'I', levelName: '特别重大地震灾害', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'seismology-bureau', 'housing-bureau', 'health-bureau', 'police-bureau', 'traffic-bureau', 'fire-brigade', 'street-office'], situation: '本市及周边区域发生≥7.0级地震，震中烈度XI度以上，造成大面积房屋毁灭性倒塌，重大人员伤亡，城市功能基本瘫痪，交通、电力、通信、供水等生命线系统全面中断，极易引发大规模次生灾害链（滑坡、泥石流、堰塞湖、危化品泄漏等）。根据市地震应急预案需启动Ⅰ级响应，并请求国家级救援力量支援。' },
  { id: 'typhoon-1', name: '台风IV级响应（热带低压·蓝色预警）', type: '台风', description: '近海最大风力达6-7级（10.8-17.1m/s）', level: 'IV', levelName: '热带低压（蓝色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'weather-bureau', 'urban-management', 'traffic-bureau', 'police-bureau', 'housing-bureau', 'street-office'], situation: '市气象台发布台风蓝色预警，预计未来24小时内可能受热带低压影响，近海最大风力达6-7级（风速10.8-17.1m/s），沿海地区可能出现阵风8级以上。根据《市防汛防台应急预案》，此时需启动Ⅳ级响应。' },
  { id: 'typhoon-2', name: '台风III级响应（热带风暴·黄色预警）', type: '台风', description: '近海最大风力达8-9级（17.2-24.4m/s），并伴有大到暴雨', level: 'III', levelName: '热带风暴（黄色预警）', requiredRoles: ['vice-mayor', 'emergency-bureau', 'weather-bureau', 'urban-management', 'traffic-bureau', 'police-bureau', 'housing-bureau', 'street-office'], situation: '市气象台升级发布台风黄色预警，热带风暴已进入我市48小时警戒线，近海最大风力达8-9级（风速17.2-24.4m/s），沿海地区阵风10级以上，并伴有大到暴雨。渔船已全部回港避风，部分景区关闭。根据《市防汛防台应急预案》，此时需启动Ⅲ级响应。' },
  { id: 'typhoon-3', name: '台风II级响应（强热带风暴/台风·橙色预警）', type: '台风', description: '近海最大风力达10-12级（24.5-32.6m/s），全市普降暴雨到大暴雨', level: 'II', levelName: '强热带风暴/台风（橙色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'weather-bureau', 'urban-management', 'traffic-bureau', 'police-bureau', 'housing-bureau', 'street-office'], situation: '市气象台升级发布台风橙色预警，强热带风暴或台风已进入我市24小时警戒线，近海最大风力达10-12级（风速24.5-32.6m/s），内陆地区阵风9-11级以上，全市普降暴雨到大暴雨，部分地区特大暴雨。多处树木倒伏、广告牌脱落、低洼区域积水严重，部分公交线路停运。Ⅲ级响应措施已全面执行但灾情持续恶化。根据《市防汛防台应急预案》，此时需启动Ⅱ级响应。' },
  { id: 'typhoon-4', name: '台风I级响应（强台风/超强台风·红色预警）', type: '台风', description: '近中心最大风力达13-17级以上（≥32.7m/s），全市遭遇特大暴雨', level: 'I', levelName: '强台风/超强台风（红色预警）', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'weather-bureau', 'urban-management', 'traffic-bureau', 'police-bureau', 'housing-bureau', 'street-office'], situation: '市气象台发布最高等级台风红色预警，强台风或超强台风正面袭击或严重影响我市，近中心最大风力达13-17级以上（风速≥32.7m/s），内陆地区普遍出现12级以上大风，全市遭遇特大暴雨，城市内涝、山洪、地质灾害风险极高。大面积电力中断、通信受阻、交通瘫痪，多区域人员受困需紧急转移。Ⅱ级响应下已投入全部救援力量但灾情持续恶化，需申请国家级力量支援。根据《市防汛防台应急预案》，此时需启动Ⅰ级响应。' },
  { id: 'wildfire-1', name: '森林火灾IV级响应（一般森林火灾）', type: '森林火灾', description: '受害森林面积<1公顷，火势处于初发阶段', level: 'IV', levelName: '一般森林火灾', requiredRoles: ['vice-mayor', 'emergency-bureau', 'fire-rescue', 'weather-bureau', 'police-bureau', 'health-bureau', 'traffic-bureau', 'street-office'], situation: '本市某林区发生火情，经初步核实受害森林面积在1公顷以下，火势处于初发阶段，尚未造成人员伤亡，未威胁居民区和重要设施安全。根据《森林火灾应急预案》及森林火灾分级标准，此时需启动Ⅳ级响应，由属地街道/乡镇牵头组织初期扑救。' },
  { id: 'wildfire-2', name: '森林火灾III级响应（较大森林火灾）', type: '森林火灾', description: '受害森林面积1-100公顷，火线长度超过500米', level: 'III', levelName: '较大森林火灾', requiredRoles: ['vice-mayor', 'emergency-bureau', 'fire-rescue', 'weather-bureau', 'police-bureau', 'health-bureau', 'traffic-bureau', 'street-office'], situation: '火情持续蔓延，受害森林面积已达1-100公顷，火场周边风速较大（≥3级），火线长度超过500米，扑救难度明显增加，可能对周边村庄、自然保护区构成潜在威胁。Ⅲ级响应下已调集属地专业森林消防队伍和半专业扑火队，但火势仍未得到有效控制。根据《森林火灾应急预案》此时需启动Ⅲ级响应，由市应急局/林业局统一指挥调度。' },
  { id: 'wildfire-3', name: '森林火灾II级响应（重大森林火灾）', type: '森林火灾', description: '受害森林面积100-1000公顷，多个火头，加速蔓延趋势', level: 'II', levelName: '重大森林火灾', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'fire-rescue', 'weather-bureau', 'police-bureau', 'health-bureau', 'traffic-bureau', 'street-office'], situation: '火情急剧恶化，受害森林面积已达100-1000公顷，火场出现多个火头，火势受气象条件（大风、干燥、高温）影响呈加速蔓延趋势，已对周边居民区、重要基础设施（输电线路、油气管道、通信基站）构成严重威胁，部分群众需紧急转移安置。Ⅲ级响应下已投入市级全部森林消防力量及邻近区县支援队伍，但灾情持续恶化。根据《森林火灾应急预案》此时需启动Ⅱ级响应。' },
  { id: 'wildfire-4', name: '森林火灾I级响应（特别重大森林火灾）', type: '森林火灾', description: '受害森林面积≥1000公顷，多点爆发，形成大范围火海', level: 'I', levelName: '特别重大森林火灾', requiredRoles: ['mayor', 'vice-mayor', 'emergency-bureau', 'fire-rescue', 'weather-bureau', 'police-bureau', 'health-bureau', 'traffic-bureau', 'street-office'], situation: '火情达到特别重大级别，受害森林面积已达1000公顷以上，火场呈现多点爆发、立体燃烧态势，火线总长度超过10公里，形成大范围火海，已造成人员伤亡或重大财产损失，严重威胁城镇安全、国家级自然保护区及重要战略设施。Ⅱ级响应下已调动全省森林消防力量及武警部队参与扑救，但火势仍在持续扩大，急需申请国家级航空消防力量和跨省增援。根据《森林火灾应急预案》此时需启动Ⅰ级响应。' }
];

export function getRoleById(id: string): Role | undefined {
  return availableRoles.find(r => r.id === id);
}

export function getScenarioById(id: string): DisasterScenario | undefined {
  return disasterScenarios.find(s => s.id === id);
}

export function getRequiredRoles(scenarioId: string): Role[] {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return [];
  return scenario.requiredRoles.map(id => getRoleById(id)!).filter(Boolean);
}

export function getScenariosByType(disasterType: string): DisasterScenario[] {
  return disasterScenarios.filter(s => s.type === disasterType);
}

export function getAvailableDisasterTypes(): string[] {
  return [...new Set(disasterScenarios.map(s => s.type))];
}

export interface RoleDutyDetail {
  roleId: string;
  coreResponsibility: string;
  specificActions: string[];
  timeLimit: string;
  indicators: string[];
}

export interface ScenarioDutyMap {
  scenarioId: string;
  disasterType: string;
  level: 'IV' | 'III' | 'II' | 'I';
  duties: RoleDutyDetail[];
}

export const scenarioDutyMaps: ScenarioDutyMap[] = [
  {
    scenarioId: 'urban-waterlogging-1',
    disasterType: '内涝',
    level: 'IV',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '统筹指挥IV级内涝应急响应，协调各成员单位落实防汛措施', specificActions: ['召集应急响应研判会议，启动IV级应急响应指令', '督导各责任单位按预案要求到岗值班', '协调气象部门实时推送降雨预报数据'], timeLimit: '预警发布后30分钟内完成响应启动', indicators: ['响应启动及时率≥95%', '各单位到位率100%', '指令传达覆盖率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '执行IV级响应调度，负责信息汇总与物资备勤', specificActions: ['安排专职人员24小时值班值守', '实时接收并转发气象水文预警信息至各成员单位', '检查应急物资储备状态，通知排涝车辆待命'], timeLimit: '预警发布后15分钟内完成值班部署', indicators: ['预警信息转发及时率100%', '物资备勤完好率≥98%', '值班人员在岗率100%'] },
      { roleId: 'urban-management', coreResponsibility: '组织城区排水管网巡查和积水点监测', specificActions: ['派出巡查队对重点低洼路段排水管网进行排查', '实时上报积水点位置和深度信息', '调度移动排涝泵车至易涝点位待命'], timeLimit: '预警发布后30分钟内巡查队到达指定点位', indicators: ['重点路段巡查覆盖率100%', '积水信息上报及时率≥95%', '排涝设备就位率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '保障重点运输通道畅通，发布交通出行提示', specificActions: ['通知公交运营单位加强车辆安全检测', '向市民发布雨天出行安全提示', '安排巡检人员对易积水路段进行动态监控'], timeLimit: '预警发布后1小时内完成出行提示发布', indicators: ['出行提示发布覆盖率100%', '重点路段监控覆盖率≥90%', '公交线路正常运行率≥95%'] },
      { roleId: 'street-office', coreResponsibility: '负责社区预警通知、隐患排查及脆弱群体摸排', specificActions: ['通过社区广播、微信群等方式通知居民做好防涝准备', '组织社区网格员排查低洼区域和地下空间', '摸排辖区孤寡老人、残障人士等脆弱群体名单'], timeLimit: '预警发布后2小时内完成社区通知全覆盖', indicators: ['社区通知覆盖率100%', '地下空间排查完成率100%', '脆弱群体摸排完成率100%'] }
    ]
  },
  {
    scenarioId: 'urban-waterlogging-2',
    disasterType: '内涝',
    level: 'III',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '升级指挥体系，统筹多部门协同处置III级内涝灾害', specificActions: ['召开应急指挥部紧急会议，研判灾情发展趋势', '下达跨部门联合调度指令，协调城管、交警、卫健协同作业', '向上级报告灾情进展并请求市级资源增援'], timeLimit: '升级指令发布后20分钟内完成指挥部署', indicators: ['跨部门调度指令下达率100%', '灾情信息上报及时率100%', '应急资源调拨到位率≥95%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '强化应急调度中心运转，统筹物资调配和数据整合', specificActions: ['升级值班等级，增加值守人员至双岗制', '实时汇总各内涝点积水深度、交通中断、人员受困等数据', '向各内涝点紧急调拨抽水泵、沙袋、警示牌等物资'], timeLimit: '每30分钟更新一次灾情汇总报告', indicators: ['灾情数据更新频率≤30min', '物资调拨到位率≥90%', '应急通讯畅通率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '实施积水路段交通管制，疏导受灾区域交通秩序', specificActions: ['对积水深度≥30cm的路段实施临时交通管制', '增派警力在积水路段引导车辆绕行', '维护内涝区域治安秩序，防止次生刑事事件'], timeLimit: '积水报告确认后15分钟内警力到达现场', indicators: ['管制路段设置完成率100%', '交通疏导效率≥90%', '受涝区域治安事件发生率≤0'] },
      { roleId: 'traffic-bureau', coreResponsibility: '调度公交绕行，抢修受损道路，保障抢险通道畅通', specificActions: ['发布公交线路绕行/停运公告并实时更新', '组织抢修队伍对受损路面进行应急修复', '确保通往医院、应急指挥中心的抢险通道畅通'], timeLimit: '公交调整公告在积水确认后30分钟内发布', indicators: ['公交公告更新及时率100%', '抢险通道畅通率100%', '受损道路抢修完成率≥85%'] },
      { roleId: 'urban-management', coreResponsibility: '全面启动城区排涝作业，疏通排水设施', specificActions: ['调集全部移动排涝车对重点内涝点实施强排作业', '组织人员清理雨水口堵塞物，打通排水通道', '对排水泵站运行状态进行实时监控和应急维护'], timeLimit: '内涝点排涝作业在30分钟内启动', indicators: ['排涝设备出动率100%', '积水消退速率达标', '泵站运行正常率≥95%'] },
      { roleId: 'health-bureau', coreResponsibility: '组建医疗应急队伍，做好伤员救治准备', specificActions: ['指令全市急救中心增加值班救护车辆', '通知各医院急诊科做好批量伤员接收准备', '向重点内涝区域预置医疗急救小组'], timeLimit: '响应启动后1小时内完成医疗力量部署', indicators: ['急救车辆备勤率≥120%', '医院应急床位预留数达标', '医疗小组到位率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '加密气象监测频次，提供精细化降雨预报', specificActions: ['将降雨监测更新频次加密至每30分钟一次', '对未来2小时降雨趋势进行短临预报', '向指挥部实时推送雨量分布图和雷达回波图'], timeLimit: '每30分钟发布一次短临预报', indicators: ['预报更新频率≤30min', '降雨量预报准确率≥85%', '预警信息推送覆盖率100%'] }
    ]
  },
  {
    scenarioId: 'urban-waterlogging-3',
    disasterType: '内涝',
    level: 'II',
    duties: [
      { roleId: 'mayor', coreResponsibility: '全面接管II级应急指挥，统筹调度全市抢险救援力量', specificActions: ['主持召开市防汛抗旱指挥部全体会议', '下达全市防汛II级应急响应指令，启动战时指挥机制', '向上级政府报告灾情并请求省级支援'], timeLimit: '升级指令发布后15分钟内完成指挥权交接', indicators: ['指挥命令传达率100%', '省级支援请求提交及时率100%', '指挥部会议召开及时率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '协助市长指挥，分管现场抢险和人员转移工作', specificActions: ['分赴重点受灾区域现场督战抢险作业', '协调武警、消防等力量开展受困人员救援', '督导危房区域居民转移安置工作'], timeLimit: '灾害升级后30分钟内到达重点受灾区域', indicators: ['现场督导覆盖率100%', '受困人员救援完成率≥95%', '危房区域人员转移率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转应急指挥平台，统筹全市应急资源调度', specificActions: ['全面启动应急指挥大厅全要素运行模式', '统筹调拨全市防汛物资至各受灾点', '对接省级应急管理部门申请增援物资和专业队伍'], timeLimit: '每15分钟汇总一次全市灾情数据', indicators: ['灾情数据更新频率≤15min', '物资调度满足率≥90%', '省级对接响应时效≤30min'] },
      { roleId: 'police-bureau', coreResponsibility: '大面积交通管制与社会面管控，维护全域治安', specificActions: ['对全市所有断交主干道实施分级交通管制和分流', '增派警力维护安置点、物资集散点治安秩序', '配合属地街道办开展群众紧急疏散'], timeLimit: '断交路段管制措施30分钟内全部就位', indicators: ['主干道管制覆盖率100%', '安置点治安事件发生率≤0', '群众疏散配合率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面调整公共交通运行，保障生命救援通道', specificActions: ['停运所有涉水公交线路并发布替代出行方案', '协调工程车队抢修塌陷路段和桥梁', '划定并保障不少于3条生命救援绿色通道'], timeLimit: '公交停运公告在断交确认后20分钟内发布', indicators: ['生命救援通道畅通率100%', '公交调整公告覆盖率100%', '道路抢修施工效率达标'] },
      { roleId: 'urban-management', coreResponsibility: '全城排涝总动员，最大限度提升排水能力', specificActions: ['投入全部移动排涝车、龙吸水泵车开展强排作业', '开启所有应急排水闸门和溢流通道', '对排水泵站实施不间断值守和应急供电保障'], timeLimit: '所有排涝设备在指令下达后30分钟内全部投入运行', indicators: ['排涝设备投入率100%', '积水消退率持续监测', '泵站运转率≥98%'] },
      { roleId: 'health-bureau', coreResponsibility: '启动医疗应急一级响应，全面保障医疗救治', specificActions: ['在各主要安置点设立临时医疗站', '组织市级医疗专家组赴重灾区巡回诊疗', '储备充足急救药品和血液制品，做好批量伤员救治准备'], timeLimit: '临时医疗站在安置点启用后1小时内到位', indicators: ['临时医疗站设置率100%', '急救药品储备满足率≥120%', '伤员救治及时率≥98%'] },
      { roleId: 'weather-bureau', coreResponsibility: '滚动发布精准短临预报，支撑决策指挥', specificActions: ['降雨监测预报频次加密至每15分钟一次', '发布未来1小时降雨强度和落区精准预报', '派首席预报员进驻应急指挥大厅现场解读'], timeLimit: '每15分钟更新一次精细化预报', indicators: ['预报更新频率≤15min', '短临预报准确率≥90%', '驻场预报员到位率100%'] },
      { roleId: 'housing-bureau', coreResponsibility: '负责在建工程停工监管和建筑安全监测', specificActions: ['指令全市所有在建工地立即停工并撤离人员', '对基坑、地下工程等重点部位进行安全排查', '组织专家对受涝区域的建筑结构安全进行评估'], timeLimit: '停工指令下达后1小时内完成人员撤离', indicators: ['在建工地停工率100%', '基坑安全排查完成率100%', '建筑安全评估报告出具及时率≥90%'] },
      { roleId: 'natural-resources', coreResponsibility: '地质灾害监测预警，防范内涝引发的次生地质灾害', specificActions: ['加密山区和边坡地带的地质灾害监测频次', '对已发生滑坡或出现隐患的点位发布警示', '向指挥部提供地质灾害风险评估报告'], timeLimit: '每30分钟更新一次地质灾害监测数据', indicators: ['地质灾害监测覆盖率100%', '隐患点警示发布及时率100%', '风险评估报告出具及时率≥95%'] },
      { roleId: 'cyberspace', coreResponsibility: '网络安全保障与舆情监控，及时处置谣言信息', specificActions: ['启动应急舆情24小时监测机制', '对涉灾不实信息及时辟谣并追踪来源', '保障应急指挥网络和关键信息系统安全运行'], timeLimit: '谣言信息发现后15分钟内启动处置流程', indicators: ['舆情监测覆盖率100%', '谣言处置及时率≥95%', '应急网络可用率≥99.9%'] },
      { roleId: 'telecom', coreResponsibility: '通信网络保障，确保应急指挥通信畅通', specificActions: ['调派应急通信车至重灾区域保障通信', '组织抢修队伍修复受损基站和光缆', '对应急指挥调度系统实施带宽保障和冗余切换'], timeLimit: '通信中断区域在30分钟内恢复基本通信', indicators: ['应急通信车部署到位率100%', '通信中断恢复时效≤30min', '指挥调度系统可用率≥99.9%'] },
      { roleId: 'power-company', coreResponsibility: '电力抢修保障，确保关键设施供电安全', specificActions: ['对受涝区域配电设施实施紧急断电避险', '组织抢修队伍恢复中断供电线路', '保障医院、应急指挥中心等关键部位双回路供电'], timeLimit: '断电避险措施在积水威胁确认后15分钟内执行', indicators: ['涉水区域断电避险执行率100%', '关键设施供电保障率100%', '居民供电恢复时效达标'] },
      { roleId: 'armed-police', coreResponsibility: '执行人员转移救援和抢险突击任务', specificActions: ['出动救援分队携带冲锋舟、绳索等装备转移受困群众', '承担堤防加固、沙袋堆筑等紧急抢险任务', '在重点区域设立临时执勤点维护秩序'], timeLimit: '受领任务后20分钟内完成兵力出动', indicators: ['受困群众转移完成率≥95%', '抢险任务执行率100%', '兵力到位及时率≥95%'] }
    ]
  },
  {
    scenarioId: 'urban-waterlogging-4',
    disasterType: '内涝',
    level: 'I',
    duties: [
      { roleId: 'mayor', coreResponsibility: '担任总指挥长，全面启动I级响应，发布全市动员令并请求国家级支援', specificActions: ['发布全市防汛I级响应总动员令，启动最高级别应急指挥体制', '向省政府和国家防总提交灾情报告并请求国家级力量支援', '坐镇市应急指挥中心，统筹指挥全市抢险救援行动'], timeLimit: 'I级响应条件触发后10分钟内签署发布动员令', indicators: ['动员令发布及时率100%', '国家级支援请求提交时效≤15min', '指挥命令覆盖全域'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干前线指挥，组织最大范围人员疏散转移', specificActions: ['分赴各重灾片区担任前线指挥长，现场调度救援力量', '组织协调各救援力量对被困群众实施全面救援', '督导全域危旧房屋及低洼区域人员强制撤离'], timeLimit: '前线指挥部在指令下达后20分钟内建立运转', indicators: ['前线指挥部建立率100%', '人员撤离完成率≥98%', '救援协调响应时效≤10min'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转国家级应急协调，统筹全域救援力量和物资调配', specificActions: ['全面开启国家级应急协调机制，对接国家防总调度平台', '统筹管理全市及外来增援的救援力量和救灾物资', '建立受灾群众信息数据库，协调安置点和物资分发'], timeLimit: '每10分钟汇总一次全域灾情态势', indicators: ['灾情态势更新频率≤10min', '救援力量统筹调配率100%', '物资接收分发准确率≥98%'] },
      { roleId: 'water-bureau', coreResponsibility: '水库河道全流域监测调度，防洪工程应急运行', specificActions: ['实时监测全市水库水位、库容及下游河道行洪能力', '执行水库紧急泄洪调度，控制下游洪峰流量', '对堤防、水闸等防洪工程进行不间断巡查和应急加固'], timeLimit: '水库泄洪调度方案在指令下达后15分钟内执行', indicators: ['水库河道监测数据实时率100%', '泄洪调度执行准确率100%', '堤防巡查覆盖率达到每公里≤2小时'] },
      { roleId: 'police-bureau', coreResponsibility: '全域交通封闭管控，维护社会面最高等级治安秩序', specificActions: ['对全市全部受灾道路实施分区封控和强制分流', '部署警力在灾民安置区、物资仓储区等重点区域维持秩序', '组织特警力量应对可能出现的突发事件'], timeLimit: '全域封控方案30分钟内完成部署', indicators: ['受灾区域封控覆盖率100%', '重点区域治安事件发生率≤0', '应急处突力量备勤率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '公共交通全面停运协调，保障国家级救援力量通行', specificActions: ['协调全市公共交通系统安全停运并发布公告', '为国家级救援车队划设专属绿色通道并全程引导', '组织工程力量抢通关键交通枢纽和生命线通道'], timeLimit: '公共交通停运公告在总动员令发布后30分钟内发布', indicators: ['公共交通停运执行率100%', '国家级救援通道畅通率100%', '关键通道抢通时效达标'] },
      { roleId: 'urban-management', coreResponsibility: '不计成本全力排涝，保障城市核心功能区运转', specificActions: ['投入所有可用排涝设备24小时不间断强排作业', '组织全部人力对排水管网进行清淤疏通', '对全市排水泵站实施应急供电和极限运行保障'], timeLimit: '所有排涝力量在总动员令发布后20分钟内全面启动', indicators: ['排涝设备全负荷运转率≥99%', '核心功能区积水控制达标', '排水泵站极限运行安全率100%'] },
      { roleId: 'housing-bureau', coreResponsibility: '建筑安全应急评估，组织危险建筑人员强制撤离', specificActions: ['组织专家组对受涝区域全部建筑进行安全应急评估', '对鉴定为危险的建筑立即组织人员强制撤离', '协调大型工程机械对倒塌建筑进行紧急清理'], timeLimit: '建筑应急评估在受灾后4小时内完成首轮', indicators: ['受涝区域建筑评估覆盖率100%', '危险建筑人员撤离率100%', '倒塌建筑清理时效达标'] },
      { roleId: 'health-bureau', coreResponsibility: '启动全市医疗卫生最高级别应急响应，大规模医疗救治', specificActions: ['在全市安置点及重灾区设立不少于20个临时医疗救护站', '协调省市级医疗专家组成巡回医疗队深入灾区', '建立灾区防疫消杀机制，防止灾后疫情暴发'], timeLimit: '临时医疗站在安置点启用后30分钟内投入运转', indicators: ['临时医疗站覆盖率100%', '伤病患者救治及时率≥98%', '防疫消杀覆盖面积达标'] },
      { roleId: 'weather-bureau', coreResponsibility: '最高级别气象监测保障，提供分钟级精准预报', specificActions: ['将降雨监测和预报频次提升至每5-10分钟一次', '提供未来30分钟降雨落区和强度的超高精度预报', '启用气象应急雷达和卫星加密观测，保障数据不间断'], timeLimit: '每10分钟发布一次超短临精准预报', indicators: ['预报更新频率≤10min', '超短临预报准确率≥92%', '气象监测数据连续性100%'] },
      { roleId: 'natural-resources', coreResponsibility: '全方位地质灾害监测与次生灾害链预警', specificActions: ['对全市地质灾害隐患点实施24小时不间断监测', '评估洪涝引发大规模滑坡、泥石流的可能性并发布预警', '为撤离安置选址提供地质灾害安全性评估'], timeLimit: '每20分钟更新一次地质灾害风险态势图', indicators: ['地质灾害监测不间断率100%', '次生灾害预警发布及时率100%', '安置选址安全性评估完成率100%'] },
      { roleId: 'telecom', coreResponsibility: '保障极限条件下应急通信不中断', specificActions: ['调度全部应急通信车和卫星通信设备覆盖重灾区', '组织抢修队伍对中断通信设施实施不间断抢修', '协调通信运营商启动全网应急保障和漫游互通'], timeLimit: '通信中断区域在20分钟内启动应急通信覆盖', indicators: ['重灾区通信覆盖率≥99%', '应急通信设备就位率100%', '指挥通信链路可用率≥99.9%'] },
      { roleId: 'power-company', coreResponsibility: '受灾区域电力紧急处置与关键设施供电保障', specificActions: ['对全市受涝配电设施执行分级断电安全处置', '调集全部抢修力量优先恢复医院、水厂等关键设施供电', '协调移动发电车为应急指挥中心和安置点提供临时供电'], timeLimit: '涉电安全处置在灾害确认后15分钟内执行', indicators: ['受涝区域断电安全处置率100%', '关键设施供电恢复时效≤2h', '移动发电车部署到位率100%'] },
      { roleId: 'armed-police', coreResponsibility: '大规模军事化救援，承担急难险重抢险任务', specificActions: ['出动全部可用兵力携带重型救援装备参与大规模人员搜救', '承担堤防决口封堵、溃坝抢险等急难险重任务', '协助维护全域社会秩序，在关键节点设立武装执勤点'], timeLimit: '总动员令发布后30分钟内完成兵力集结', indicators: ['兵力出动率100%', '人员搜救任务完成率≥95%', '急险任务执行率100%'] }
    ]
  },
  {
    scenarioId: 'cold-wave-1',
    disasterType: '寒潮',
    level: 'IV',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '启动寒潮IV级应急响应，统筹协调各成员单位落实防寒措施', specificActions: ['主持召开寒潮防御工作会议，部署IV级应急响应工作', '督促各职能部门按预案执行防寒任务', '协调气象部门密切监测降温趋势'], timeLimit: '蓝色预警发布后30分钟内启动响应', indicators: ['响应启动及时率100%', '防寒工作部署覆盖率100%', '各部门响应联动效率达标'] },
      { roleId: 'emergency-bureau', coreResponsibility: '执行寒潮应急调度，统筹防寒物资储备和信息汇总', specificActions: ['安排应急值守人员24小时值班', '检查御寒物资储备情况，确保棉衣棉被等物资充足', '向各成员单位转发气象预警和降温趋势信息'], timeLimit: '预警发布后20分钟内完成值班部署', indicators: ['值班人员在岗率100%', '御寒物资储备满足率≥100%', '预警信息转发及时率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '加密寒潮监测频次，提供精准降温预报', specificActions: ['将气温监测更新频次加密至每2小时一次', '发布48小时降温幅度、最低气温和风力预报', '通过各类渠道向社会公众发布寒潮预警提示'], timeLimit: '每2小时更新一次降温预报', indicators: ['预报更新频率≤2h', '降温幅度预报准确率≥90%', '公众预警覆盖率达95%'] },
      { roleId: 'civil-affairs', coreResponsibility: '负责流浪乞讨人员救助和弱势群体御寒保障', specificActions: ['启动街头流浪乞讨人员巡查救助机制', '开放全市避寒救助站并提供充足御寒物资', '摸排低保户、特困人员等弱势群体的取暖需求'], timeLimit: '预警发布后2小时内启动街头巡查救助', indicators: ['街头巡查覆盖率达100%', '救助站开放率100%', '弱势群体摸排完成率100%'] },
      { roleId: 'urban-management', coreResponsibility: '负责市政设施防冻维护和道路防滑准备', specificActions: ['对城市供水管网进行防冻巡查和维护', '储备融雪剂和防滑沙等除冰防滑物资', '检查桥梁、天桥等易结冰路段的防滑设施'], timeLimit: '预警发布后4小时内完成防冻巡查', indicators: ['供水管网巡查覆盖率≥95%', '融雪物资储备满足率100%', '易结冰路段防滑设施完好率100%'] },
      { roleId: 'street-office', coreResponsibility: '负责社区防寒通知、隐患排查及脆弱群体关怀', specificActions: ['通过社区公告、微信群等方式通知居民做好防寒保暖', '组织排查老旧小区供暖设施运行情况', '对独居老人、留守儿童等脆弱群体进行上门关怀'], timeLimit: '预警发布后3小时内完成社区通知全覆盖', indicators: ['社区通知覆盖率100%', '老旧小区供暖排查完成率100%', '脆弱群体关怀走访率100%'] }
    ]
  },
  {
    scenarioId: 'cold-wave-2',
    disasterType: '寒潮',
    level: 'III',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '升级寒潮应急指挥，组织多部门协同应对III级寒潮', specificActions: ['召开应急指挥部会议，研判降温发展趋势', '下达跨部门防寒联合调度指令', '向上级报告寒潮灾情并申请增援资源'], timeLimit: '黄色预警升级后20分钟内完成指挥部署', indicators: ['跨部门协调指令下达率100%', '灾情报告提交及时率100%', '资源调配响应时效≤30min'] },
      { roleId: 'emergency-bureau', coreResponsibility: '强化寒潮应急调度，扩大御寒物资调配范围', specificActions: ['升级应急值守等级，增加值守人员', '向各街道和救助站紧急调拨棉衣、棉被等御寒物资', '汇总全市道路结冰、供暖故障、人员冻伤等灾情数据'], timeLimit: '每1小时更新一次寒潮灾情汇总报告', indicators: ['灾情数据更新频率≤1h', '御寒物资调拨到位率≥95%', '应急值守升级完成率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '高频次寒潮监测预报，提供精细化气象服务', specificActions: ['将气温和风力监测预报频次加密至每1小时一次', '发布道路结冰黄色预警和具体结冰路段预测', '向指挥部提供逐小时降温曲线和风力分布图'], timeLimit: '每1小时发布一次精细化降温预报', indicators: ['预报更新频率≤1h', '道路结冰预报准确率≥85%', '气象服务产品覆盖率100%'] },
      { roleId: 'civil-affairs', coreResponsibility: '扩大救助范围，保障流浪人员和弱势群体生命安全', specificActions: ['全面开放全市所有避寒救助站点并24小时运营', '增派巡查车辆加强街头流浪人员主动救助', '向低保户、特困人员发放御寒补贴和取暖设备'], timeLimit: '巡查救助频次加密至每2小时一轮', indicators: ['救助站点24小时运营率100%', '街头流浪人员救助覆盖率100%', '御寒补贴发放完成率100%'] },
      { roleId: 'urban-management', coreResponsibility: '全面开展道路除冰和市政设施防冻作业', specificActions: ['对已结冰路段撒布融雪剂并组织除冰作业', '对供水管网和燃气管道进行加密巡查', '在主要桥梁和坡道铺设防滑垫并设置警示标志'], timeLimit: '结冰路段发现后30分钟内启动除冰作业', indicators: ['主干道除冰完成率≥95%', '供水供气管线巡查覆盖率100%', '防滑设施设置率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '保障寒潮期间交通运输安全，发布出行预警', specificActions: ['发布道路结冰交通安全预警和出行提示', '对结冰严重的公交线路进行临时调整或停运', '协调高速公路管理部门做好除冰保畅工作'], timeLimit: '结冰预警发布后1小时内完成交通调整公告', indicators: ['交通安全预警覆盖率100%', '公交线路调整及时率100%', '高速公路除冰保畅协调率100%'] },
      { roleId: 'agriculture-bureau', coreResponsibility: '负责农业防寒技术指导，组织农作物和大棚防护', specificActions: ['派出农技专家组赴各乡镇指导农作物防寒抗冻', '组织农户对蔬菜大棚进行加固和保温覆盖', '统计农业受灾面积和损失情况并上报'], timeLimit: '预警发布后4小时内农技专家组到达各乡镇', indicators: ['农业生产防寒指导覆盖率≥90%', '大棚加固完成率≥85%', '农业灾情统计上报及时率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '做好冻伤患者救治准备，加强呼吸道疾病防控', specificActions: ['通知各医院急诊科做好冻伤患者接诊准备', '发布寒潮健康防护提示，提醒市民防寒保暖', '加强呼吸道感染等寒潮相关疾病的监测报告'], timeLimit: '预警发布后2小时内完成医疗力量部署', indicators: ['冻伤救治准备就绪率100%', '健康防护提示发布覆盖率≥95%', '寒潮相关疾病监测报告率100%'] },
      { roleId: 'power-company', coreResponsibility: '保障电网安全运行，应对寒潮用电高峰', specificActions: ['启动电网寒潮应急运行方案，加强负荷监测', '组织线路巡查队伍对输电线路进行防覆冰巡查', '准备应急发电车等备用电源应对突发停电'], timeLimit: '预警发布后2小时内启动电网应急方案', indicators: ['电网负荷监测实时率100%', '输电线路巡查覆盖率100%', '应急电源备勤率100%'] },
      { roleId: 'street-office', coreResponsibility: '负责社区防寒保暖落实，确保居民安全过冬', specificActions: ['逐户排查老旧小区供暖设备运行情况', '组织志愿者为行动不便老人提供送餐送药服务', '设立社区临时取暖点供供暖故障居民使用'], timeLimit: '预警发布后4小时内完成供暖排查', indicators: ['供暖排查覆盖率100%', '临时取暖点设置率100%', '脆弱群体服务响应率100%'] }
    ]
  },
  {
    scenarioId: 'cold-wave-3',
    disasterType: '寒潮',
    level: 'II',
    duties: [
      { roleId: 'mayor', coreResponsibility: '全面接管寒潮II级应急指挥，发布全市防寒动员指令', specificActions: ['主持召开市低温雨雪冰冻灾害应急指挥部全体会议', '签署发布全市II级防寒应急响应指令', '向上级政府报告灾情并请求省级支援'], timeLimit: '橙色预警发布后15分钟内完成指挥权接管', indicators: ['指挥命令传达率100%', '省级支援请求提交及时率100%', '动员令发布时效达标'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片督导防寒工作落实，协调重大供暖和交通问题', specificActions: ['分赴重点受寒区域现场督导防寒措施落实', '协调解决大面积供暖故障和交通中断问题', '统筹调度各方救援力量和物资'], timeLimit: '指令下达后30分钟内到达重点区域现场', indicators: ['现场督导覆盖率100%', '供暖故障协调解决率≥90%', '跨部门协同效率达标'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转应急指挥体系，统筹全市防寒资源', specificActions: ['全面升级应急指挥大厅运行模式', '统筹调拨全市御寒物资、除冰设备和应急能源', '对接省级应急管理部门申请防寒物资增援'], timeLimit: '每30分钟汇总一次全市寒潮受灾数据', indicators: ['灾情数据更新频率≤30min', '物资调度满足率≥90%', '省级对接响应时效≤30min'] },
      { roleId: 'weather-bureau', coreResponsibility: '超高频次寒潮监测预报，为重大决策提供精准数据', specificActions: ['将气温、风力、降雪等监测预报频次加密至每30分钟一次', '发布道路结冰橙色预警和精细化结冰路段预测', '派首席预报员进驻应急指挥大厅现场解读寒潮走势'], timeLimit: '每30分钟更新一次精细化预报', indicators: ['预报更新频率≤30min', '精细化预报准确率≥92%', '驻场预报员到位率100%'] },
      { roleId: 'civil-affairs', coreResponsibility: '全力保障流浪人员和困难群众生命安全，防止冻死冻伤', specificActions: ['全面启动市区两级救助站联动机制，24小时不间断救助', '组织街面巡查队伍对桥洞、地下通道等重点区域地毯式排查', '为低保特困家庭紧急发放取暖补贴和燃料'], timeLimit: '巡查频次加密至每1小时一轮', indicators: ['流浪人员救助覆盖率100%', '重点区域排查完成率100%', '困难群众取暖保障率100%'] },
      { roleId: 'urban-management', coreResponsibility: '大规模道路除冰和市政生命线保障', specificActions: ['组织全部除冰机械和人员对主干道进行不间断除冰作业', '对全市供水、供暖、供气管网进行24小时监护', '调集全部融雪剂储备应对持续降雪和低温'], timeLimit: '除冰作业在橙色预警期间持续不间断', indicators: ['主干道除冰覆盖率100%', '市政管网监护不间断率100%', '融雪剂储备满足率≥100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面管控寒潮期间交通运输，最大限度保障通行安全', specificActions: ['对不具备安全通行条件的道路实施封闭管制', '动态调整公交线路，对结冰严重线路实施停运', '组织应急运输车队保障必需物资和人员运输'], timeLimit: '道路封闭决策在结冰确认后20分钟内执行', indicators: ['道路安全管控覆盖率100%', '公交调整公告及时率100%', '应急运输保障满足率≥95%'] },
      { roleId: 'agriculture-bureau', coreResponsibility: '紧急农业防冻救灾，最大限度减少农业损失', specificActions: ['组织全市农技力量下乡指导紧急防冻措施', '协调调拨农膜、草帘等保温材料覆盖受灾作物', '对受灾严重的农业设施发布保险理赔指引'], timeLimit: '橙色预警发布后2小时内农技力量全部下乡', indicators: ['农业防冻技术指导覆盖率≥95%', '保温物资调拨到位率≥90%', '农业受灾统计上报及时率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '全面启动寒潮医疗卫生应急响应', specificActions: ['全市二级以上医院全面启动寒潮应急救治绿色通道', '向各社区发放防冻伤药品和保暖物资', '加强一氧化碳中毒等寒潮次生疾病的预防宣传'], timeLimit: '应急救治绿色通道在预警升级后1小时内全部开通', indicators: ['应急救治绿色开通率100%', '防冻伤药品发放覆盖率≥90%', '寒潮次生疾病预防宣传覆盖率100%'] },
      { roleId: 'power-company', coreResponsibility: '极限条件下保障电网安全和基本供电', specificActions: ['启动电网最高负荷运行方案，实施有序用电调度', '组织全部抢修力量24小时待命应对线路覆冰故障', '对关键变电站和线路实施融冰作业'], timeLimit: '线路故障抢修响应时间≤30min', indicators: ['电网安全运行率≥99%', '线路覆冰处理及时率100%', '关键用户供电保障率100%'] },
      { roleId: 'street-office', coreResponsibility: '社区防寒全覆盖，确保每一位居民安全过冬', specificActions: ['逐户排查供暖情况，对供暖中断户提供临时取暖设备', '组织社区志愿者为老弱病残群体提供生活必需品代购配送', '设立社区24小时防寒求助热线和临时避寒点'], timeLimit: '橙色预警发布后4小时内完成供暖全覆盖排查', indicators: ['供暖排查覆盖率100%', '临时避寒点设置率100%', '脆弱群体帮扶响应率100%'] }
    ]
  },
  {
    scenarioId: 'cold-wave-4',
    disasterType: '寒潮',
    level: 'I',
    duties: [
      { roleId: 'mayor', coreResponsibility: '担任寒潮I级响应总指挥，发布全市最高级别防寒动员令，请求国家级支援', specificActions: ['发布全市寒潮I级应急响应总动员令', '向省政府和国家相关部委提交灾情报告并请求国家级支援', '坐镇市应急指挥中心统筹指挥全市防寒救灾行动'], timeLimit: '红色预警发布后10分钟内签署发布动员令', indicators: ['动员令发布及时率100%', '国家级支援请求提交时效≤15min', '指挥命令全域覆盖'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干前线督战，组织全区域防寒救援行动', specificActions: ['分赴各重灾片区担任前线指挥长', '协调调度各方力量解决供暖、供电、供水重大中断问题', '督导全市脆弱群体转移至安全温暖的安置点'], timeLimit: '前线指挥部在指令下达后20分钟内建立运转', indicators: ['前线指挥部建立率100%', '重大民生问题协调解决率≥95%', '脆弱群体转移完成率≥98%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转国家级应急协调机制，统筹全域防寒救灾资源', specificActions: ['全面开启国家级寒潮应急协调机制', '统筹管理全市及外来增援的防寒救灾力量和物资', '建立全市受灾群众救助数据库，协调安置点和物资精准分发'], timeLimit: '每15分钟汇总一次全域寒潮受灾态势', indicators: ['灾情态势更新频率≤15min', '防寒物资调配满足率≥95%', '国家级协调机制对接时效≤20min'] },
      { roleId: 'weather-bureau', coreResponsibility: '最高级别气象保障，提供分钟级精细化寒潮预报', specificActions: ['将气温、风力、降雪监测预报频次提升至每15分钟一次', '发布逐小时精细化寒潮路径图和极值温度预报', '启用全部气象观测设备确保数据连续性和准确性'], timeLimit: '每15分钟发布一次超精细化寒潮预报', indicators: ['预报更新频率≤15min', '极端温度预报准确率≥95%', '气象观测数据连续性100%'] },
      { roleId: 'civil-affairs', coreResponsibility: '动员全社会力量保障各类困难群众生命安全', specificActions: ['联合公安、城管等部门对全市所有露宿点进行地毯式清查救助', '启用全市所有大型公共建筑作为临时避寒安置点', '协调社会组织和志愿者力量参与防寒救助'], timeLimit: '红色预警发布后3小时内完成首次全域清查', indicators: ['露宿人员救助覆盖率100%', '临时避寒安置点开放率100%', '社会救助力量动员率≥90%'] },
      { roleId: 'urban-management', coreResponsibility: '不计成本保障城市生命线工程运行', specificActions: ['组织全部力量对全市道路进行不间断除冰清雪', '对供水、供暖、供气等市政管网实施极限运行保障', '调集全部可用除冰融雪设备实施全域作业'], timeLimit: '道路除冰作业在红色预警期间24小时不间断', indicators: ['主干道路除冰覆覆盖率100%', '市政管网运行保障不间断率100%', '除冰融雪设备出动率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '寒潮期间交通运输全面管控，保障国家救援力量通道', specificActions: ['对全市交通进行最高级别管控，非必需通行全面限制', '为国家级救援和物资运输车队划设专属快速通道', '组织应急运力保障必需生活物资的运输配送'], timeLimit: '交通管控方案在动员令发布后30分钟内全面实施', indicators: ['交通管控覆盖率100%', '国家级救援通道畅通率100%', '生活物资运输保障率≥98%'] },
      { roleId: 'agriculture-bureau', coreResponsibility: '全力组织农业抗寒救灾，全面评估农业灾损', specificActions: ['组织全市农技和救灾力量开展农业抗寒保产行动', '协调保险机构快速启动农业保险理赔程序', '评估极端低温对全年农业生产的影响并制定恢复方案'], timeLimit: '红色预警发布后2小时内完成农业抗寒力量部署', indicators: ['农业抗寒力量出动率100%', '农业保险理赔启动及时率100%', '农业灾损评估报告出具时效≤24h'] },
      { roleId: 'health-bureau', coreResponsibility: '启动全市医疗最高级别应急响应，大规模防冻救治', specificActions: ['全市所有医疗机构全面启动寒潮应急救治机制', '向各安置点和社区派驻巡回医疗队', '建立冻伤、一氧化碳中毒等寒潮急症的快速转诊通道'], timeLimit: '巡回医疗队在安置点启用后30分钟内到位', indicators: ['应急救治机制启动率100%', '巡回医疗队覆盖率100%', '冻伤患者救治及时率≥99%'] },
      { roleId: 'power-company', coreResponsibility: '极端低温条件下保障电力生命线', specificActions: ['执行电网极限运行方案，实施全社会有序用电', '组织全部抢修力量和应急发电车24小时待命', '对覆冰严重的输电线路实施带电融冰作业'], timeLimit: '大面积停电故障恢复时限≤2h', indicators: ['电网极限运行安全率≥99.5%', '覆冰线路处理及时率100%', '关键用户供电保障率100%'] },
      { roleId: 'street-office', coreResponsibility: '社区防寒全覆盖兜底，确保辖区零冻死冻伤', specificActions: ['对辖区所有居民供暖情况进行逐户排查登记', '组织社区力量为所有脆弱群体提供24小时关怀服务', '设立社区应急供暖点和物资分发点'], timeLimit: '红色预警发布后4小时内完成辖区全覆盖排查', indicators: ['居民供暖排查覆盖率100%', '脆弱群体关怀服务响应率100%', '社区应急供暖点设置率100%'] }
    ]
  },
  {
    scenarioId: 'earthquake-1',
    disasterType: '地震',
    level: 'IV',
    duties: [
      { roleId: 'mayor', coreResponsibility: '启动地震IV级应急响应，全面掌握震情态势', specificActions: ['签发地震IV级应急响应启动指令', '召集应急指挥部成员研判震情发展趋势', '部署震后各项应急处置工作'], timeLimit: '震后15分钟内启动应急响应', indicators: ['响应启动及时率100%', '指挥部会议召开及时率100%', '应急处置指令下达率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '协助市长指挥，分管震情信息收集和现场处置', specificActions: ['协调地震局快速获取震中位置、震级、烈度等信息', '组织各职能部门按预案分工开展震后排查', '赴震中区域现场指导初期处置工作'], timeLimit: '震后20分钟内完成信息汇总上报', indicators: ['震情信息获取时效≤10min', '现场指导到位率100%', '各部门响应联动率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '执行地震应急调度，统筹灾情信息汇总和物资备勤', specificActions: ['启动应急指挥大厅震后响应模式', '通知各成员单位立即开展灾情排查和信息上报', '检查地震应急救援物资储备状态'], timeLimit: '震后10分钟内启动指挥大厅运转', indicators: ['灾情信息首报时效≤30min', '应急物资备勤完好率≥98%', '成员单位通知覆盖率100%'] },
      { roleId: 'seismology-bureau', coreResponsibility: '快速测定地震参数，发布震情信息和余震趋势判断', specificActions: ['在震后5分钟内完成地震三要素（时间、地点、震级）测定', '发布震中烈度分布图和震感范围评估', '研判余震趋势并发布余震预警信息'], timeLimit: '震后5分钟内完成地震速报', indicators: ['地震速报时效≤5min', '烈度分布图发布及时率100%', '余震趋势判断准确率≥85%'] },
      { roleId: 'housing-bureau', coreResponsibility: '组织建（构）筑物震后安全排查和应急评估', specificActions: ['派出专家组对老旧房屋和重要建筑进行安全排查', '统计房屋受损数量和安全状况', '对存在安全隐患的建筑物设置警戒标识'], timeLimit: '震后2小时内完成重点建筑首轮排查', indicators: ['重点建筑排查覆盖率100%', '危险建筑警戒设置率100%', '房屋受损统计上报及时率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '启动医疗应急准备，做好伤员收治准备', specificActions: ['通知全市急救中心进入应急状态', '各医院急诊科做好接收地震伤员的准备', '统计全市医疗机构自身受损和运行情况'], timeLimit: '震后15分钟内完成医疗系统应急启动', indicators: ['医疗应急状态启动率100%', '急救车辆备勤率100%', '医疗机构运行情况上报率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '维护震后社会治安和交通秩序', specificActions: ['增派警力加强社会面巡逻防控', '疏导震后道路交通，保障救援车辆优先通行', '维护紧急避难场所的治安秩序'], timeLimit: '震后15分钟内警力部署到位', indicators: ['社会面巡逻覆盖率≥90%', '救援通道畅通率100%', '治安事件发生率≤正常水平'] },
      { roleId: 'traffic-bureau', coreResponsibility: '排查交通基础设施受损情况，保障交通畅通', specificActions: ['组织对桥梁、隧道、道路进行震后安全巡查', '统计交通设施受损情况并上报', '协调抢修力量对受损路段进行应急修复'], timeLimit: '震后1小时内完成重点交通设施巡查', indicators: ['重点交通设施巡查覆盖率100%', '受损信息上报及时率100%', '应急抢修响应时效≤2h'] },
      { roleId: 'fire-brigade', coreResponsibility: '地震搜救备勤，随时准备出动救援', specificActions: ['集结搜救队伍和救援装备进入备勤状态', '检查生命探测仪、破拆工具等救援装备完好性', '接收指挥部救援指令，做好随时出动准备'], timeLimit: '震后10分钟内完成搜救力量集结备勤', indicators: ['搜救队伍备勤率100%', '救援装备完好率≥98%', '出动响应时间≤5min'] },
      { roleId: 'street-office', coreResponsibility: '负责社区震后排查、居民安抚和信息上报', specificActions: ['组织网格员逐户排查居民房屋受损和人员受伤情况', '通过社区渠道安抚居民情绪，发布官方震情信息', '统计上报辖区受灾情况和应急需求'], timeLimit: '震后1小时内完成首轮社区排查', indicators: ['社区排查覆盖率100%', '居民安抚信息传达率100%', '灾情信息上报及时率100%'] }
    ]
  },
  {
    scenarioId: 'earthquake-2',
    disasterType: '地震',
    level: 'III',
    duties: [
      { roleId: 'mayor', coreResponsibility: '升级地震应急指挥，统筹调度全市抗震救灾工作', specificActions: ['签发地震III级应急响应升级指令', '主持召开市抗震救灾指挥部紧急会议', '向上级政府报送灾情初报'], timeLimit: '灾情确认后20分钟内完成响应升级', indicators: ['响应升级指令下达及时率100%', '指挥部会议召开及时率100%', '灾情初报上报时效≤1h'] },
      { roleId: 'vice-mayor', coreResponsibility: '协助市长指挥，分管人员搜救和伤员救治协调', specificActions: ['协调消防、医疗等力量开展人员搜救和伤员转运', '赴受灾较重区域现场指挥应急处置', '督导各成员单位按分工落实抗震救灾任务'], timeLimit: '指令下达后30分钟内到达受灾现场', indicators: ['现场指挥到位率100%', '人员搜救协调效率达标', '成员单位任务执行率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '强化应急指挥中心运转，统筹灾情数据和救灾资源', specificActions: ['升级应急指挥大厅运行等级，增加值守力量', '实时汇总房屋倒塌、人员伤亡、基础设施损毁等灾情数据', '向灾区紧急调拨帐篷、食品、饮用水等救灾物资'], timeLimit: '每1小时更新一次灾情汇总报告', indicators: ['灾情数据更新频率≤1h', '救灾物资调拨到位率≥90%', '应急指挥系统运行正常率100%'] },
      { roleId: 'seismology-bureau', coreResponsibility: '持续震情监测，提供精细化余震预报', specificActions: ['建立余震序列监测台网，实时跟踪余震活动', '每30分钟更新余震趋势判断和烈度修正', '对可能发生强余震进行预警提示'], timeLimit: '每30分钟发布一次余震趋势预报', indicators: ['余震监测实时率100%', '余震预报更新频率≤30min', '强余震预警发布及时率100%'] },
      { roleId: 'housing-bureau', coreResponsibility: '全面组织建（构）筑物安全评估和危险建筑处置', specificActions: ['派出多组专家对受灾建筑进行全面安全评估', '对鉴定为危险的建筑实施围挡封控和人员禁入', '协调工程机械对倒塌建筑进行应急清理'], timeLimit: '震后4小时内完成受灾区域建筑首轮评估', indicators: ['建筑安全评估覆盖率≥95%', '危险建筑封控率100%', '应急清理时效达标'] },
      { roleId: 'health-bureau', coreResponsibility: '全面启动地震医疗救治，组织伤员分级救治', specificActions: ['启动全市医疗应急救治网络，实施伤员分级收治', '在灾区设立临时医疗点进行现场救治', '组织重伤员向市级医院转运并做好手术准备'], timeLimit: '临时医疗点在震后2小时内设立', indicators: ['医疗救治网络启动率100%', '临时医疗点覆盖率≥90%', '重伤员转运及时率≥98%'] },
      { roleId: 'police-bureau', coreResponsibility: '加强灾区治安维护和交通管制', specificActions: ['在受灾区域实施分级交通管制，保障救援通道', '增派警力维护灾区和安置点治安秩序', '协助街道办开展群众疏散和转移'], timeLimit: '交通管制措施在30分钟内全面实施', indicators: ['救援通道畅通率100%', '灾区治安案件发生率≤0', '群众转移协助率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '排查修复受损交通设施，保障救援运输', specificActions: ['对灾区桥梁、隧道、公路进行全面安全检测', '协调工程力量对受损路段进行抢通修复', '发布交通管制和绕行方案公告'], timeLimit: '震后2小时内完成灾区交通设施检测', indicators: ['交通设施检测覆盖率100%', '受损路段抢通时效达标', '交通公告发布及时率100%'] },
      { roleId: 'fire-brigade', coreResponsibility: '执行地震搜救任务，全力搜救被困人员', specificActions: ['出动搜救分队携带生命探测仪、破拆工具等进入灾区', '对倒塌建筑进行地毯式搜索，定位被困人员', '与医疗队配合，安全转运救出的伤员'], timeLimit: '受领任务后15分钟内完成力量出动', indicators: ['搜救力量出动率100%', '被困人员定位效率达标', '伤员安全转运率100%'] },
      { roleId: 'street-office', coreResponsibility: '组织社区居民疏散转移和安置', specificActions: ['组织危房和受损房屋居民紧急疏散至安全区域', '协调开放学校、体育馆等场所作为临时安置点', '统计辖区人员伤亡和财产损失情况并及时上报'], timeLimit: '震后2小时内完成危险区域人员疏散', indicators: ['危险区域人员疏散率≥98%', '临时安置点启用及时率100%', '灾情统计上报准确率≥95%'] }
    ]
  },
  {
    scenarioId: 'earthquake-3',
    disasterType: '地震',
    level: 'II',
    duties: [
      { roleId: 'mayor', coreResponsibility: '全面接管II级抗震救灾指挥，发布全市动员令并请求省级支援', specificActions: ['签发地震II级应急响应动员令', '主持召开市抗震救灾指挥部全体扩大会议', '向省政府报告灾情并请求省级救援力量和物资支援'], timeLimit: '灾情确认后15分钟内发布动员令', indicators: ['动员令发布及时率100%', '省级支援请求提交时效≤30min', '指挥部会议召开及时率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干前线指挥，统筹大规模人员搜救和灾民安置', specificActions: ['分赴各重灾片区担任前线指挥长，现场调度救援力量', '统筹协调消防、武警、医疗等多方力量开展联合搜救', '督导大规模受灾群众转移安置工作'], timeLimit: '前线指挥部在指令下达后30分钟内建立运转', indicators: ['前线指挥部建立率100%', '联合搜救协同效率达标', '受灾群众安置率≥95%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转应急指挥平台，统筹全市及省级救灾资源', specificActions: ['全面升级应急指挥大厅至最高运行模式', '统筹调配全市及省级增援的救灾物资和救援队伍', '建立灾情大数据平台，实时呈现灾区全要素态势'], timeLimit: '每30分钟更新一次全域灾情态势图', indicators: ['灾情态势更新频率≤30min', '救灾物资调度满足率≥90%', '大数据平台运行正常率100%'] },
      { roleId: 'seismology-bureau', coreResponsibility: '加密震情监测网，提供精准余震预报和烈度速报', specificActions: ['建立地震现场流动监测台网，加密震区监测', '每15分钟更新余震序列和强余震概率预测', '绘制并发布震区精细烈度分布图和地震动参数'], timeLimit: '每15分钟发布一次余震趋势和烈度速报', indicators: ['余震监测数据实时率100%', '强余震预测准确率≥90%', '烈度速报更新频率≤15min'] },
      { roleId: 'housing-bureau', coreResponsibility: '大规模建筑安全评估，组织危险建筑应急拆除', specificActions: ['调集全市建筑安全专家对灾区建筑进行网格化评估', '对严重损坏且存在倒塌风险的建筑组织应急拆除', '为灾后过渡安置房的选址提供安全性论证'], timeLimit: '震后8小时内完成灾区建筑首轮网格化评估', indicators: ['建筑评估网格化覆盖率100%', '危险建筑拆除时效达标', '安置房选址安全性评估完成率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '全面启动地震医疗救治体系，实施大规模伤员救治', specificActions: ['在灾区建立野战医院或临时医疗中心', '组织全市医疗力量实施伤员检伤分类和分级救治', '协调血液中心保障充足血液制品供应'], timeLimit: '野战医院在震后4小时内建立运转', indicators: ['野战医院建立率100%', '伤员检伤分类准确率≥98%', '血液制品供应满足率≥120%'] },
      { roleId: 'police-bureau', coreResponsibility: '灾区全面治安管控和交通管制', specificActions: ['对灾区实施分区分级治安管控', '建立救援车辆专用通道并实施严格交通管制', '维护各安置点、物资分发点的治安秩序'], timeLimit: '分区管控方案在30分钟内全面实施', indicators: ['灾区治安管控覆盖率100%', '救援通道通行效率达标', '安置点治安事件发生率≤0'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面抢通灾区交通生命线', specificActions: ['组织全部工程力量抢通通往灾区的公路和桥梁', '协调铁路、航空部门建立救灾人员和物资运输绿色通道', '发布灾区交通管制图和通行指引'], timeLimit: '通往灾区主干道在震后6小时内抢通', indicators: ['灾区主干道抢通率≥90%', '绿色通道协调时效≤2h', '交通指引发布及时率100%'] },
      { roleId: 'fire-brigade', coreResponsibility: '大规模地震搜救，承担最危险的救援任务', specificActions: ['出动全部搜救力量携带重型救援装备进入灾区', '对倒塌建筑实施连续不间断搜索和救援', '与结构工程师配合，确保救援作业安全'], timeLimit: '搜救力量在受领任务后20分钟内全部出动', indicators: ['搜救力量出动率100%', '72小时黄金救援期搜救效率达标', '救援作业安全事故率≤0'] },
      { roleId: 'street-office', coreResponsibility: '大规模居民疏散转移和安置点管理', specificActions: ['组织辖区全部危险区域居民紧急疏散转移', '协助建立和管理临时安置点，做好登记造册', '组织志愿者为安置点居民提供生活服务和心理疏导'], timeLimit: '震后4小时内完成危险区域人员全部转移', indicators: ['危险区域人员转移率100%', '安置点登记管理准确率≥98%', '基本生活保障满足率100%'] }
    ]
  },
  {
    scenarioId: 'earthquake-4',
    disasterType: '地震',
    level: 'I',
    duties: [
      { roleId: 'mayor', coreResponsibility: '担任抗震救灾总指挥长，发布全市最高级别动员令，请求国家级支援', specificActions: ['签发地震I级应急响应全市总动员令', '向省政府和国家抗震救灾指挥部报告灾情并请求国家级力量支援', '坐镇市应急指挥中心24小时不间断指挥'], timeLimit: '大震发生后10分钟内签署发布总动员令', indicators: ['总动员令发布及时率100%', '国家级支援请求提交时效≤15min', '指挥体系24小时不间断运转率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干重灾区前线总指挥，协调全域救援力量', specificActions: ['分赴各极重灾区担任前线总指挥，直接调度所有救援力量', '协调解放军、武警、消防、医疗等各系统救援力量协同作战', '督导全域受灾群众紧急转移、救治和安置'], timeLimit: '总动员令发布后20分钟内建立前线指挥体系', indicators: ['前线指挥体系建立率100%', '多系统协同救援效率达标', '受灾群众基本保障到位率≥95%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转国家级应急协调机制，统筹全域抗震救灾', specificActions: ['全面开启国家级抗震救灾协调机制，对接国家应急管理部', '统筹管理全市及外来增援的全部救援力量和救灾物资', '建立全域灾情实时数据库，支撑科学决策指挥'], timeLimit: '每10分钟更新一次全域灾情态势', indicators: ['灾情态势更新频率≤10min', '国家级协调机制对接时效≤20min', '救援力量统筹调配准确率≥98%'] },
      { roleId: 'seismology-bureau', coreResponsibility: '建立震区密集监测网，提供秒级地震预警和精准余震预报', specificActions: ['在震区紧急布设密集流动地震监测台网', '与国家和省级地震局联动提供秒级地震预警服务', '每5分钟更新强余震概率预测和地震动参数'], timeLimit: '震后1小时内完成流动台网布设', indicators: ['流动台网布设完成时效≤1h', '余震预报更新频率≤5min', '强余震预测准确率≥95%'] },
      { roleId: 'housing-bureau', coreResponsibility: '全面评估建筑安全，组织大规模应急拆除和安置房建设', specificActions: ['调集全国建筑安全专家对灾区全部建筑进行评估分类', '对倒塌和严重损坏建筑进行大规模应急清理和拆除', '启动过渡安置房紧急建设计划，协调建材和施工力量'], timeLimit: '震后24小时内完成灾区建筑首轮全面评估', indicators: ['建筑评估全面覆盖率100%', '应急清理拆除效率达标', '过渡安置房建设启动时效≤48h'] },
      { roleId: 'health-bureau', coreResponsibility: '启动全国医疗资源动员，建立灾区医疗救治体系', specificActions: ['在重灾区建立多个野战医院和医疗救治中心', '协调全国医疗专家队伍和军队医疗力量参与救治', '建立灾区防疫体系，防止大灾之后出现大疫'], timeLimit: '野战医院在震后6小时内建立并运转', indicators: ['野战医院覆盖率100%', '伤员救治及时率≥99%', '防疫体系建立时效≤24h'] },
      { roleId: 'police-bureau', coreResponsibility: '全域最高级别治安管控和救援通道保障', specificActions: ['对灾区实施最高级别治安管控和出入管制', '建立全域救援车辆专用通道网络', '部署特警和武警联勤维护社会治安'], timeLimit: '全域管控方案在总动员令发布后1小时内实施', indicators: ['全域治安管控覆盖率100%', '救援通道网络畅通率100%', '灾区刑事案件发生率≤0'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全力抢通全域交通生命线，保障大规模救援力量通行', specificActions: ['组织全部工程力量抢通通往各灾区的所有公路和桥梁', '协调铁路、航空建立国家救援力量大规模运输通道', '动态发布灾区交通态势图和通行指引'], timeLimit: '通往各灾区主干道在震后12小时内全部抢通', indicators: ['灾区主干道全部抢通率≥95%', '大规模运输通道建立时效≤12h', '交通态势图更新频率≤1h'] },
      { roleId: 'fire-brigade', coreResponsibility: '承担最艰巨的生命搜救任务，与全国增援力量协同作战', specificActions: ['出动全部搜救力量并与全国增援消防队伍协同作业', '对倒塌建筑实施全天候不间断搜索救援', '使用重型设备和先进技术进行深层生命探测'], timeLimit: '搜救行动在总动员令发布后持续72小时不间断', indicators: ['72小时不间断搜救执行率100%', '与增援队伍协同效率达标', '深层搜救技术应用覆盖率100%'] },
      { roleId: 'street-office', coreResponsibility: '组织辖区全面疏散转移，建立大规模安置体系', specificActions: ['组织辖区全部居民紧急疏散转移至安全区域', '协助建立和管理大规模灾民安置点', '建立安置点基本生活保障体系和心理援助服务'], timeLimit: '震后6小时内完成辖区全部人员疏散', indicators: ['辖区人员疏散完成率≥98%', '安置点基本生活保障率100%', '心理援助服务覆盖率≥90%'] }
    ]
  },
  {
    scenarioId: 'typhoon-1',
    disasterType: '台风',
    level: 'IV',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '启动台风IV级应急响应，统筹各成员单位做好防台准备', specificActions: ['主持召开防台会商会议，研判台风发展趋势', '向各成员单位下达防台IV级响应工作指令', '督促沿海地区做好渔船回港和人员上岸工作'], timeLimit: '台风蓝色预警发布后30分钟内启动响应', indicators: ['响应启动及时率100%', '防台指令下达覆盖率100%', '渔船回港执行率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '执行防台应急调度，统筹信息汇总和防台物资准备', specificActions: ['启动应急值班机制，安排人员24小时值守', '检查防台应急物资储备，包括沙袋、水泵、发电机等', '向各成员单位转发台风预警及路径预报信息'], timeLimit: '预警发布后20分钟内完成值班部署', indicators: ['值班人员在岗率100%', '防台物资储备满足率100%', '预警信息转发及时率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '加密台风监测预报，为防台决策提供精准气象数据', specificActions: ['将台风监测预报频次加密至每3小时一次', '发布台风路径、强度、风雨影响范围预报', '通过多渠道向社会公众发布台风预警信息'], timeLimit: '每3小时更新一次台风预报', indicators: ['预报更新频率≤3h', '台风路径预报准确率≥85%', '公众预警覆盖率≥95%'] },
      { roleId: 'urban-management', coreResponsibility: '排查城市易涝区域，加固户外设施', specificActions: ['组织对城市排水管网和易涝点进行全面排查', '加固或拆除存在安全隐患的户外广告牌', '检查路灯、行道树等可能倾倒的市政设施'], timeLimit: '预警发布后4小时内完成重点区域排查', indicators: ['易涝点排查覆盖率100%', '户外广告牌加固率100%', '市政设施安全检查完成率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '排查交通设施安全，发布交通出行提示', specificActions: ['对桥梁、隧道、沿海道路等交通设施进行安全检查', '发布台风天气交通安全出行提示', '通知公交、客运等运营单位做好防御准备'], timeLimit: '预警发布后3小时内完成交通设施排查', indicators: ['交通设施排查覆盖率100%', '出行提示发布及时率100%', '运营单位通知覆盖率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '加强社会面巡逻和交通秩序维护', specificActions: ['增派沿海及易受灾区域警力加强巡逻', '疏导可能受台风影响路段的交通', '协助沿海景区和危险区域的人员劝离'], timeLimit: '预警发布后2小时内警力部署到位', indicators: ['重点区域巡逻覆盖率100%', '交通疏导响应及时率100%', '危险区域人员劝离率≥95%'] },
      { roleId: 'housing-bureau', coreResponsibility: '负责在建工地安全检查，组织工地人员撤离准备', specificActions: ['通知全市在建工地做好防台准备', '排查塔吊、脚手架等高空作业设施安全状况', '统计工地人员数量，做好紧急撤离预案'], timeLimit: '预警发布后3小时内完成工地安全排查', indicators: ['在建工地通知覆盖率100%', '高空设施安全检查完成率100%', '工地撤离预案制定率100%'] },
      { roleId: 'street-office', coreResponsibility: '负责社区防台通知和隐患排查', specificActions: ['通过各类渠道通知社区居民做好防台准备', '排查辖区低洼区域和危旧房屋', '通知沿海养殖户和渔民做好防风避险'], timeLimit: '预警发布后3小时内完成社区通知全覆盖', indicators: ['社区通知覆盖率100%', '低洼危房排查完成率100%', '沿海从业人员通知率100%'] }
    ]
  },
  {
    scenarioId: 'typhoon-2',
    disasterType: '台风',
    level: 'III',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '升级台风应急指挥，组织多部门联合防御III级台风', specificActions: ['召开防台应急指挥部会议，升级响应指令', '下达跨部门防台联合行动指令', '向上级报告防台工作进展并协调资源'], timeLimit: '黄色预警升级后20分钟内完成指挥部署', indicators: ['响应升级指令下达及时率100%', '跨部门协调指令覆盖率100%', '工作进展上报及时率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '强化防台应急调度，扩大物资调拨范围', specificActions: ['升级应急值守等级至双岗制', '向沿海各街道和重点区域紧急调拨防台物资', '实时汇总风情、雨情、灾情数据'], timeLimit: '每1小时更新一次防台灾情报告', indicators: ['灾情数据更新频率≤1h', '防台物资调拨到位率≥95%', '值守升级完成率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '高频次台风监测预报，提供精细化风雨影响评估', specificActions: ['将台风监测预报频次加密至每1小时一次', '发布逐小时台风路径和风雨影响精细化预报', '向防台指挥部提供台风可能登陆点和影响范围评估'], timeLimit: '每1小时发布一次精细化台风预报', indicators: ['预报更新频率≤1h', '风雨影响预报准确率≥90%', '决策气象服务产品覆盖率100%'] },
      { roleId: 'urban-management', coreResponsibility: '全面开展城市排涝和户外设施加固', specificActions: ['启动全部排水泵站，做好强降雨排涝准备', '对全市广告牌、路灯、行道树进行全面加固或拆除', '在易涝点预置排涝设备和人员'], timeLimit: '黄色预警发布后2小时内完成排涝准备', indicators: ['排水泵站启动率100%', '户外设施加固率100%', '易涝点排涝力量预置率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面管控交通运输，保障防风安全', specificActions: ['视情停运沿海和受台风威胁线路的公交', '对存在安全风险的桥梁和路段实施限行或封闭', '协调港口、机场等交通枢纽做好停运准备'], timeLimit: '公交调整公告在风力达到8级前发布', indicators: ['公交安全管控覆盖率100%', '风险路段限行措施到位率100%', '交通枢纽停运协调率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '加强沿海区域封控和人员疏散', specificActions: ['对沿海危险区域实施封控，禁止人员进入', '增派警力协助沿海村镇人员疏散转移', '维护安置点和应急物资分发点的治安秩序'], timeLimit: '封控措施在黄色预警发布后1小时内到位', indicators: ['沿海危险区域封控率100%', '人员疏散协助完成率100%', '安置点治安事件发生率≤0'] },
      { roleId: 'housing-bureau', coreResponsibility: '组织在建工地全面停工和人员撤离', specificActions: ['指令全市在建工地全面停工', '组织工地人员撤离至安全地点', '对工地临时设施进行加固或拆除'], timeLimit: '停工撤离指令在黄色预警发布后2小时内执行完毕', indicators: ['工地停工率100%', '工地人员撤离完成率100%', '临时设施加固拆除率100%'] },
      { roleId: 'street-office', coreResponsibility: '动员社区居民防风避险，组织危险区域人员转移', specificActions: ['通知辖区居民减少外出，做好防风避险', '组织沿海、低洼和危房区域居民紧急转移', '开放社区避险场所，储备应急生活物资'], timeLimit: '黄色预警发布后3小时内完成危险区域人员转移', indicators: ['防风避险通知覆盖率100%', '危险区域人员转移率100%', '社区避险场所开放率100%'] }
    ]
  },
  {
    scenarioId: 'typhoon-3',
    disasterType: '台风',
    level: 'II',
    duties: [
      { roleId: 'mayor', coreResponsibility: '全面接管台风II级应急指挥，发布全市防台动员令并请求省级支援', specificActions: ['主持召开市防汛防台指挥部全体会议', '签署发布全市防台II级应急响应动员令', '向上级政府报告灾情并请求省级防台力量支援'], timeLimit: '橙色预警发布后15分钟内完成指挥权接管', indicators: ['动员令发布及时率100%', '省级支援请求提交时效≤30min', '指挥部会议召开及时率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干前线指挥，督导防台措施全面落实', specificActions: ['分赴沿海重灾片区担任前线指挥长', '督导人员转移、设施加固、物资储备等防台措施落实', '协调各方力量处置台风引发的突发险情'], timeLimit: '指令下达后30分钟内到达前线指挥位置', indicators: ['前线指挥到位率100%', '防台措施落实督导覆盖率100%', '突发险情处置及时率≥95%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转防台应急指挥平台，统筹全市防台资源', specificActions: ['全面升级应急指挥大厅运行模式', '统筹调配全市及省级增援的防台救灾物资', '实时监控台风动态和灾情发展，支撑指挥决策'], timeLimit: '每30分钟更新一次全市防台灾情态势', indicators: ['灾情态势更新频率≤30min', '防台物资调度满足率≥90%', '指挥决策信息支撑率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '超高频次台风监测预报，支撑精准防台决策', specificActions: ['将台风监测预报频次加密至每15分钟一次', '提供逐小时台风路径、风力和降雨精细化预报', '派首席预报员进驻应急指挥大厅实时解读'], timeLimit: '每15分钟发布一次超精细化台风预报', indicators: ['预报更新频率≤15min', '台风路径预报准确率≥92%', '驻场预报员到位率100%'] },
      { roleId: 'urban-management', coreResponsibility: '全力开展城市排涝和市政设施抢险', specificActions: ['投入全部排涝设备对积水区域进行不间断强排', '组织应急队伍清理倒伏树木和脱落广告牌', '对受损市政设施进行紧急抢修'], timeLimit: '排涝设备在橙色预警期间持续运转', indicators: ['排涝设备全负荷运转率≥99%', '倒伏障碍物清理时效达标', '市政设施抢修及时率≥95%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面管控交通运输，保障生命通道', specificActions: ['停运全部受台风影响的公交线路并发布公告', '对存在严重风险的桥梁、道路实施封闭', '协调工程力量保障不少于3条生命救援通道'], timeLimit: '停运公告在风力达10级前全面发布', indicators: ['公交安全停运率100%', '生命救援通道畅通率100%', '风险路段封闭率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '全域治安管控和强制人员疏散', specificActions: ['对沿海及高风险区域实施全面封控', '协助地方政府对危险区域人员进行强制疏散', '在安置点和关键节点部署充足警力维护秩序'], timeLimit: '全域封控方案在橙色预警发布后1小时内实施', indicators: ['高风险区域封控率100%', '人员强制疏散完成率100%', '安置点治安保障到位率100%'] },
      { roleId: 'housing-bureau', coreResponsibility: '全面管控在建工程安全，组织工地人员强制撤离', specificActions: ['确保全市在建工地100%停工并完成人员撤离', '对塔吊、施工电梯等大型设备进行安全锁定', '组织专家对受台风威胁区域建筑进行应急评估'], timeLimit: '橙色预警发布后1小时内完成工地全面停工撤离', indicators: ['工地停工撤离率100%', '大型设备安全锁定率100%', '建筑应急评估完成率≥90%'] },
      { roleId: 'street-office', coreResponsibility: '全面动员社区居民防风避险，组织大规模人员转移安置', specificActions: ['动员辖区全部居民做好最高级别防风避险', '组织沿海和危险区域居民全部转移至安全安置点', '在安置点建立基本生活保障和医疗服务'], timeLimit: '橙色预警发布后3小时内完成全部人员转移', indicators: ['防风避险动员覆盖率100%', '危险区域人员转移率100%', '安置点基本保障到位率100%'] }
    ]
  },
  {
    scenarioId: 'typhoon-4',
    disasterType: '台风',
    level: 'I',
    duties: [
      { roleId: 'mayor', coreResponsibility: '担任防台I级响应总指挥，发布全市最高级别动员令，请求国家级支援', specificActions: ['签发全市防台I级应急响应总动员令', '向省政府和国家防总报告灾情并请求国家级力量支援', '坐镇市应急指挥中心24小时不间断指挥'], timeLimit: '红色预警发布后10分钟内签署发布总动员令', indicators: ['总动员令发布及时率100%', '国家级支援请求提交时效≤15min', '指挥体系24小时不间断运转率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干重灾区前线总指挥，统筹全域防风救灾', specificActions: ['分赴各极重灾区担任前线总指挥直接调度救援', '协调解放军、武警、消防等力量开展紧急救援', '督导全域受灾群众安全转移和生命保障'], timeLimit: '总动员令发布后20分钟内建立前线指挥体系', indicators: ['前线指挥体系建立率100%', '多力量协同救援效率达标', '受灾群众基本保障到位率≥95%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转国家级应急协调机制，统筹全域防风救灾资源', specificActions: ['全面开启国家级防台协调机制，对接国家防总', '统筹管理全市及外来增援的全部防台力量和物资', '建立全域灾情实时数据库支撑科学决策'], timeLimit: '每10分钟更新一次全域灾情态势', indicators: ['灾情态势更新频率≤10min', '国家级协调机制对接时效≤20min', '防台资源统筹调配准确率≥98%'] },
      { roleId: 'weather-bureau', coreResponsibility: '最高级别气象保障，提供分钟级台风精准预报', specificActions: ['将台风监测预报频次提升至每5-10分钟一次', '提供台风眼路径、最大风力半径和逐小时降雨量预报', '启用全部气象探测设备确保数据不间断'], timeLimit: '每10分钟发布一次超精细台风预报', indicators: ['预报更新频率≤10min', '台风路径精细化预报准确率≥95%', '气象探测数据连续性100%'] },
      { roleId: 'urban-management', coreResponsibility: '不计成本保障城市排涝和市政生命线运行', specificActions: ['投入全部排涝设备24小时不间断作业', '组织全部力量清理倒伏障碍物和抢修市政设施', '对关键市政设施实施极限运行保障'], timeLimit: '排涝清障作业在红色预警期间24小时不间断', indicators: ['排涝设备全负荷运转率≥99%', '市政设施抢险及时率≥95%', '关键市政设施运行保障率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全域交通最高级别管控，保障国家救援力量通道', specificActions: ['对全市交通实施最高级别管控，非必需通行全面禁止', '为国家级救援和物资运输车队划设专属快速通道', '组织应急运力保障必需生活物资运输'], timeLimit: '交通管控方案在总动员令发布后30分钟内全面实施', indicators: ['交通管控覆盖率100%', '国家级救援通道畅通率100%', '生活物资运输保障率≥98%'] },
      { roleId: 'police-bureau', coreResponsibility: '全域最高级别治安管控，强制疏散和封控', specificActions: ['对全市高风险区域实施最高级别封控', '协助对拒绝撤离人员进行强制疏散', '部署全部警力维护社会治安和安置点秩序'], timeLimit: '全域封控在总动员令发布后1小时内实施', indicators: ['高风险区域封控率100%', '强制疏散执行率100%', '社会治安事件发生率≤0'] },
      { roleId: 'housing-bureau', coreResponsibility: '全面管控建筑安全，组织安置房紧急建设', specificActions: ['确保全市所有建筑工地和危旧房屋人员全部撤离', '对受台风损毁的建筑进行全面安全评估', '启动灾后过渡安置房紧急建设计划'], timeLimit: '建筑人员撤离在总动员令发布后2小时内完成', indicators: ['建筑人员撤离率100%', '建筑安全评估完成率≥95%', '安置房建设计划启动时效≤48h'] },
      { roleId: 'street-office', coreResponsibility: '组织辖区全员转移避险，建立大规模安置体系', specificActions: ['组织辖区全部危险区域居民强制转移至安全安置点', '协助建立和管理大规模灾民安置点', '建立安置点基本生活保障体系和应急医疗服务'], timeLimit: '总动员令发布后3小时内完成全员转移', indicators: ['辖区人员转移完成率≥98%', '安置点基本生活保障率100%', '应急医疗服务覆盖率100%'] }
    ]
  },
  {
    scenarioId: 'wildfire-1',
    disasterType: '森林火灾',
    level: 'IV',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '启动森林火灾IV级应急响应，统筹初期扑救指挥', specificActions: ['签发森林火灾IV级应急响应启动指令', '听取火情初报并研判火势发展趋势', '部署属地街道和专业队伍开展初期扑救'], timeLimit: '火情确认后15分钟内启动响应', indicators: ['响应启动及时率100%', '火情研判准确率≥90%', '初期扑救指令下达率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '执行森林火灾应急调度，统筹扑救力量和物资', specificActions: ['启动应急值守机制，24小时监控火情发展', '通知属地森林消防队伍立即出动扑救', '检查扑火物资储备，准备风力灭火机、灭火弹等装备'], timeLimit: '火情确认后10分钟内完成力量调度', indicators: ['扑救力量调度及时率100%', '扑火物资备勤完好率≥98%', '火情监控不间断率100%'] },
      { roleId: 'fire-rescue', coreResponsibility: '出动森林消防队伍，执行初期火场扑救任务', specificActions: ['出动属地森林消防专业队伍携带装备赶赴火场', '在火场建立前线指挥点，研判火势和地形', '采取直接扑打、开设隔离带等方式控制火势蔓延'], timeLimit: '受领任务后15分钟内队伍出动', indicators: ['队伍出动及时率100%', '火场前线指挥点建立时效≤30min', '火势控制有效率达标'] },
      { roleId: 'weather-bureau', coreResponsibility: '提供火场气象服务，支撑扑救决策', specificActions: ['发布火场区域未来24小时天气预报', '提供火场风力、风向、温度、湿度等关键气象要素', '评估气象条件对火势发展的影响'], timeLimit: '火情确认后30分钟内发布火场气象专报', indicators: ['火场气象专报发布时效≤30min', '气象要素监测准确率≥90%', '气象服务信息支撑率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '维护火场周边治安秩序和交通管控', specificActions: ['对通往火场的道路实施交通管控，保障扑救车辆通行', '疏散火场周边无关人员，设置警戒区域', '调查火灾起因，排查是否涉及人为纵火'], timeLimit: '火情确认后30分钟内完成火场周边封控', indicators: ['火场周边封控率100%', '扑救通道畅通率100%', '火灾原因调查启动及时率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '做好扑火人员医疗保障和伤员救治准备', specificActions: ['通知就近医院做好烧伤和吸入性损伤救治准备', '派出医疗救护车在火场外围待命', '储备烧伤急救药品和呼吸系统急救设备'], timeLimit: '火情确认后1小时内医疗力量到位', indicators: ['医疗救护力量到位率100%', '烧伤急救药品储备满足率100%', '伤员救治准备就绪率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '保障扑火救援交通通道畅通', specificActions: ['协调通往火场的主要道路保持畅通', '为扑火车辆和装备运输提供交通引导', '发布火场周边交通管制公告'], timeLimit: '火情确认后30分钟内发布交通管制公告', indicators: ['扑火通道畅通率100%', '交通引导到位率100%', '交通公告发布及时率100%'] },
      { roleId: 'street-office', coreResponsibility: '组织属地力量参与初期扑救和群众疏散', specificActions: ['组织半专业扑火队和志愿者参与初期扑救', '通知火场周边居民做好疏散准备', '摸清火场周边居民点、重要设施分布情况'], timeLimit: '火情确认后1小时内完成群众疏散准备', indicators: ['半专业扑火队动员率≥90%', '群众疏散通知覆盖率100%', '周边情况摸排完成率100%'] }
    ]
  },
  {
    scenarioId: 'wildfire-2',
    disasterType: '森林火灾',
    level: 'III',
    duties: [
      { roleId: 'vice-mayor', coreResponsibility: '升级森林火灾应急指挥，统筹多部门联合扑救', specificActions: ['召开森林火灾应急指挥部会议，升级响应指令', '协调消防、气象、公安、医疗等多部门联合行动', '向上级报告火情进展并请求市级资源增援'], timeLimit: '火情升级确认后20分钟内完成指挥部署', indicators: ['响应升级指令下达及时率100%', '多部门联合行动协调效率达标', '火情报告上报及时率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '强化森林火灾应急调度，扩大扑救力量和物资调配', specificActions: ['升级应急值守等级，增加指挥调度人员', '调集市级森林消防专业队伍和邻近区县增援力量', '向火场紧急调拨灭火弹、水泵、油料等消耗物资'], timeLimit: '每30分钟更新一次火情态势报告', indicators: ['火情态势更新频率≤30min', '增援力量调度到位率≥95%', '消耗物资补给满足率≥90%'] },
      { roleId: 'fire-rescue', coreResponsibility: '扩大扑救规模，采取多手段控制火势蔓延', specificActions: ['调集更多森林消防专业队伍支援火场', '结合风力灭火、以水灭火、开设隔离带等多种手段扑救', '在火场侧翼和火头薄弱处实施重点突击'], timeLimit: '增援力量在受领任务后30分钟内到达火场', indicators: ['扑救力量投入达标率100%', '多手段扑救协同效率达标', '火势蔓延控制有效率≥90%'] },
      { roleId: 'weather-bureau', coreResponsibility: '加密火场气象监测，提供精细化气象服务', specificActions: ['将火场气象监测频次加密至每30分钟一次', '发布火场短临天气预报，重点关注风力风向变化', '提供火险等级评估和火行为预测'], timeLimit: '每30分钟更新一次火场气象专报', indicators: ['气象专报更新频率≤30min', '风力风向预报准确率≥90%', '火险等级评估准确率≥85%'] },
      { roleId: 'police-bureau', coreResponsibility: '扩大火场周边封控范围，维护扑救秩序', specificActions: ['扩大火场周边警戒封控范围，禁止无关人员进入', '疏导疏散转移车辆和人员，维护沿线交通秩序', '深入调查火灾原因，排查可疑线索'], timeLimit: '封控范围调整在火情升级后30分钟内完成', indicators: ['火场周边封控覆盖率100%', '疏散沿线交通秩序维护率100%', '火灾调查深入推进率达标'] },
      { roleId: 'health-bureau', coreResponsibility: '加强火场医疗保障，建立现场救治点', specificActions: ['在火场安全区域设立现场医疗救治点', '增派医疗救护车和医护人员', '做好批量伤员转运和分级救治准备'], timeLimit: '现场医疗救治点在火情升级后1小时内设立', indicators: ['现场医疗救治点设立率100%', '医疗救护力量增援到位率100%', '伤员转运绿色通道畅通率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面保障扑火救援交通网络畅通', specificActions: ['扩大火场周边交通管控范围，设多级交通引导点', '协调高速管理部门对扑火车辆免收通行费', '组织道路养护力量保障通往火场道路畅通'], timeLimit: '交通管控调整在火情升级后30分钟内到位', indicators: ['多级交通引导点设置率100%', '扑火车辆通行保障率100%', '通往火场道路畅通率100%'] },
      { roleId: 'street-office', coreResponsibility: '组织火场周边居民疏散转移和后勤保障', specificActions: ['组织火场周边受威胁村庄居民有序疏散转移', '设立临时安置点接收转移群众', '组织志愿者为扑火队伍提供饮水和食品等后勤支持'], timeLimit: '火情升级后2小时内完成受威胁群众转移', indicators: ['受威胁群众转移率100%', '临时安置点设立及时率100%', '扑火队伍后勤保障到位率≥90%'] }
    ]
  },
  {
    scenarioId: 'wildfire-3',
    disasterType: '森林火灾',
    level: 'II',
    duties: [
      { roleId: 'mayor', coreResponsibility: '全面接管森林火灾II级应急指挥，发布全市防火动员令并请求省级支援', specificActions: ['主持召开市森林防火指挥部全体会议', '签署发布全市森林火灾II级应急响应动员令', '向省政府报告火情并请求省级扑火力量和航空消防支援'], timeLimit: '火情升级确认后15分钟内完成指挥权接管', indicators: ['动员令发布及时率100%', '省级支援请求提交时效≤30min', '指挥部会议召开及时率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干火场前线指挥，统筹大规模扑救行动', specificActions: ['赴火场前线担任总指挥，直接调度所有扑救力量', '统筹协调地面队伍与航空消防力量联合扑救', '督导火场周边居民大规模转移安置工作'], timeLimit: '指令下达后30分钟内到达火场前线指挥位置', indicators: ['前线指挥到位率100%', '地空联合扑救协同效率达标', '居民转移安置率≥98%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转应急指挥平台，统筹全市及省级扑救资源', specificActions: ['全面升级应急指挥大厅运行模式', '统筹调配全市及省级增援的扑火力量和物资', '建立火场全要素监控平台，实时呈现火情态势'], timeLimit: '每20分钟更新一次火情态势图', indicators: ['火情态势更新频率≤20min', '扑火资源调度满足率≥90%', '全要素监控平台运行正常率100%'] },
      { roleId: 'fire-rescue', coreResponsibility: '大规模扑救作战，组织实施立体化灭火战术', specificActions: ['调集全部市级森林消防力量和省级增援队伍', '组织实施地面围歼、空中洒水、开设防火隔离带等立体战术', '在火场关键地段设立防线，保护居民区和重要设施'], timeLimit: '增援力量在受领任务后1小时内全部到达指定位置', indicators: ['扑救力量投入率100%', '立体战术实施覆盖率≥90%', '居民区和重要设施保护成功率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '超高频次火场气象保障，支撑精准扑救决策', specificActions: ['将火场气象监测预报频次加密至每15分钟一次', '提供火场精细化风力风向场预报和火行为预测', '派首席预报员进驻前线指挥部实时解读气象条件'], timeLimit: '每15分钟更新一次火场气象专报', indicators: ['气象专报更新频率≤15min', '火行为预测准确率≥90%', '驻场预报员到位率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '大规模火场封控和群众疏散秩序维护', specificActions: ['对火场周边实施大范围分级封控', '组织警力维护大规模群众疏散转移沿线秩序', '在安置点和物资集散点部署充足警力'], timeLimit: '大范围封控在动员令发布后1小时内实施', indicators: ['火场周边封控覆盖率100%', '疏散沿线秩序维护率100%', '安置点治安事件发生率≤0'] },
      { roleId: 'health-bureau', coreResponsibility: '全面启动火场医疗救治体系', specificActions: ['在火场周边安全区域建立多个医疗救治站', '组织全市烧伤和呼吸科专家组成巡回医疗队', '建立烧伤重伤员快速转运至市级烧伤中心的绿色通道'], timeLimit: '多个医疗救治站在动员令发布后2小时内建立', indicators: ['医疗救治站覆盖率100%', '巡回医疗队到位率100%', '重伤员转运通道畅通率100%'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全面管控火场周边交通，保障大规模救援力量通行', specificActions: ['对火场周边区域实施全面交通管控', '为省级增援和航空消防力量划设专用通道', '协调工程力量抢修受损道路'], timeLimit: '全面交通管控在动员令发布后1小时内实施', indicators: ['交通管控覆盖率100%', '增援力量专用通道畅通率100%', '受损道路抢修及时率≥95%'] },
      { roleId: 'street-office', coreResponsibility: '大规模群众疏散转移和安置点管理', specificActions: ['组织火场周边全部受威胁居民紧急疏散转移', '建立和管理多个临时安置点', '做好安置点群众生活保障和心理安抚'], timeLimit: '动员令发布后3小时内完成全部受威胁群众转移', indicators: ['受威胁群众转移率100%', '安置点管理规范率≥98%', '群众生活保障到位率100%'] }
    ]
  },
  {
    scenarioId: 'wildfire-4',
    disasterType: '森林火灾',
    level: 'I',
    duties: [
      { roleId: 'mayor', coreResponsibility: '担任森林火灾I级响应总指挥，发布全市最高级别防火动员令，请求国家级支援', specificActions: ['签发全市森林火灾I级应急响应总动员令', '向省政府和国家森防指报告火情并请求国家级力量支援', '坐镇市应急指挥中心24小时不间断指挥'], timeLimit: '火情达特别重大级别后10分钟内签署发布总动员令', indicators: ['总动员令发布及时率100%', '国家级支援请求提交时效≤15min', '指挥体系24小时不间断运转率100%'] },
      { roleId: 'vice-mayor', coreResponsibility: '分片包干重火区前线总指挥，统筹全域扑救力量', specificActions: ['分赴各重火区担任前线总指挥，直接调度所有扑救力量', '协调解放军、武警、森林消防、航空消防等多兵种协同作战', '督导全域受威胁群众紧急转移和生命安全保障'], timeLimit: '总动员令发布后20分钟内建立前线指挥体系', indicators: ['前线指挥体系建立率100%', '多兵种协同作战效率达标', '受威胁群众安全保障率100%'] },
      { roleId: 'emergency-bureau', coreResponsibility: '全负荷运转国家级应急协调机制，统筹全域扑救资源', specificActions: ['全面开启国家级森林火灾应急协调机制', '统筹管理全市及外来增援的全部扑救力量和物资', '建立全域火情实时数据库，支撑科学决策指挥'], timeLimit: '每10分钟更新一次全域火情态势', indicators: ['火情态势更新频率≤10min', '国家级协调机制对接时效≤20min', '扑救资源统筹调配准确率≥98%'] },
      { roleId: 'fire-rescue', coreResponsibility: '组织最大规模扑救作战，实施全域立体化灭火', specificActions: ['调集全部可用力量并整合国家级增援队伍', '组织实施大规模地空协同、多梯队轮战的立体化灭火战术', '在居民区、重要设施、保护区外围建立最终防线'], timeLimit: '国家级增援力量到达后30分钟内完成力量整合部署', indicators: ['全域扑救力量整合率100%', '立体化灭火战术覆盖率100%', '重点保护目标安全率100%'] },
      { roleId: 'weather-bureau', coreResponsibility: '最高级别火场气象保障，提供分钟级精准预报', specificActions: ['建立火场移动气象站，提供秒级气象要素监测', '每10分钟提供火场精细化风力风向和火行为预报', '提供人工影响天气作业条件评估，争取有利气象窗口'], timeLimit: '每10分钟发布一次火场超精细气象预报', indicators: ['气象预报更新频率≤10min', '火行为预报准确率≥95%', '人工影响天气条件评估及时率100%'] },
      { roleId: 'police-bureau', coreResponsibility: '全域最高级别封控和社会治安维护', specificActions: ['对火场周边实施全域最高级别封控', '维护大规模群众疏散和安置区域社会治安', '配合火灾调查组全面深入调查起火原因'], timeLimit: '全域封控在总动员令发布后1小时内实施', indicators: ['全域封控覆盖率100%', '社会治安事件发生率≤0', '火灾原因调查配合率100%'] },
      { roleId: 'health-bureau', coreResponsibility: '全面启动火场大规模医疗救治体系', specificActions: ['在火场周边建立多个野战医疗救治点', '协调省内外烧伤救治专家和军队医疗力量参与救治', '建立空中医疗转运通道，快速转运危重伤员'], timeLimit: '野战医疗点在总动员令发布后2小时内建立运转', indicators: ['医疗救治点覆盖率100%', '专家和军队医疗力量到位率100%', '空中转运通道建立时效≤4h'] },
      { roleId: 'traffic-bureau', coreResponsibility: '全域交通最高级别管控，保障国家级救援力量通行', specificActions: ['对火场周边实施全域最高级别交通管控', '为国家救援车队和航空消防力量建立专属通道', '协调铁路、航空部门保障扑火人员和物资快速投送'], timeLimit: '交通管控方案在总动员令发布后30分钟内全面实施', indicators: ['交通管控覆盖率100%', '国家级救援通道畅通率100%', '人员和物资快速投送效率达标'] },
      { roleId: 'street-office', coreResponsibility: '组织辖区全员疏散，建立大规模安置和后勤保障体系', specificActions: ['组织火场周边全部居民强制疏散转移至安全区域', '协助建立和管理大规模灾民安置点', '组织全社会力量为扑火队伍提供全方位后勤支持'], timeLimit: '总动员令发布后3小时内完成全员疏散', indicators: ['辖区人员疏散完成率≥98%', '安置点基本生活保障率100%', '扑火后勤支持保障率≥95%'] }
    ]
  }
];

export function getDutiesByScenario(scenarioId: string): ScenarioDutyMap | undefined {
  return scenarioDutyMaps.find(d => d.scenarioId === scenarioId);
}