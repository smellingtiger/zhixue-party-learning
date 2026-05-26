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