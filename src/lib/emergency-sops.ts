export interface SopCard {
  name: string;
  role: string;
  level: string;
  instructions: string[];
}

const sopCards: SopCard[] = [
  { name: '市防汛指挥部', role: '市防汛指挥部', level: 'I', instructions: ['启动I级应急响应', '统筹调度全市应急资源', '发布全市应急通告'] },
  { name: '市防汛指挥部', role: '市防汛指挥部', level: 'II', instructions: ['启动II级应急响应', '组织会商研判', '调度重点区域应急力量'] },
  { name: '市防汛指挥部', role: '市防汛指挥部', level: 'III', instructions: ['启动III级应急响应', '加强监测预警', '部署重点地区防范'] },
  { name: '市防汛指挥部', role: '市防汛指挥部', level: 'IV', instructions: ['启动IV级应急响应', '加强值班值守', '做好应急准备'] },
  { name: '应急管理局', role: '应急管理局', level: 'I', instructions: ['调拨全部应急物资', '组织专业救援力量', '评估灾损情况'] },
  { name: '应急管理局', role: '应急管理局', level: 'II', instructions: ['调拨应急物资', '组织救援队伍待命', '收集灾情信息'] },
  { name: '应急管理局', role: '应急管理局', level: 'III', instructions: ['检查应急物资储备', '加强应急队伍备勤', '做好物资调配准备'] },
  { name: '应急管理局', role: '应急管理局', level: 'IV', instructions: ['清点应急物资', '加强值班值守', '保持通信畅通'] },
  { name: '公安局', role: '公安局', level: 'I', instructions: ['实施交通管制', '维护社会秩序', '协助人员转移'] },
  { name: '公安局', role: '公安局', level: 'II', instructions: ['加强重点路段管控', '维护现场秩序', '配合人员疏散'] },
  { name: '公安局', role: '公安局', level: 'III', instructions: ['加强巡逻防控', '维护交通秩序', '协助隐患排查'] },
  { name: '公安局', role: '公安局', level: 'IV', instructions: ['加强治安巡逻', '保持通信畅通', '做好应急准备'] },
  { name: '卫健委', role: '卫健委', level: 'I', instructions: ['组织医疗救治', '开展疾病预防', '保障药品供应'] },
  { name: '卫健委', role: '卫健委', level: 'II', instructions: ['组建医疗队', '加强疾病监测', '做好药品准备'] },
  { name: '卫健委', role: '卫健委', level: 'III', instructions: ['加强医疗值班', '做好防疫准备', '保持物资储备'] },
  { name: '卫健委', role: '卫健委', level: 'IV', instructions: ['加强值班值守', '检查医疗物资', '保持应急待命'] },
  { name: '气象局', role: '气象局', level: 'I', instructions: ['滚动发布预警', '加强气象监测', '提供决策支撑'] },
  { name: '气象局', role: '气象局', level: 'II', instructions: ['加强气象监测', '及时发布预警', '提供数据支撑'] },
  { name: '气象局', role: '气象局', level: 'III', instructions: ['加强雨情监测', '发布气象预警', '做好预报工作'] },
  { name: '气象局', role: '气象局', level: 'IV', instructions: ['加强值班观测', '监测天气变化', '及时上报数据'] },
  { name: '交通局', role: '交通局', level: 'I', instructions: ['实施交通管控', '调整公交线路', '保障运输通道'] },
  { name: '交通局', role: '交通局', level: 'II', instructions: ['加强道路巡查', '调整部分线路', '保障应急运输'] },
  { name: '交通局', role: '交通局', level: 'III', instructions: ['巡查道路状况', '做好绕行准备', '保障公交运行'] },
  { name: '交通局', role: '交通局', level: 'IV', instructions: ['加强道路监测', '保持公交运行', '做好应急准备'] },
  { name: '城管局', role: '城管局', level: 'I', instructions: ['全力排涝抢险', '清理倒伏树木', '保障排水通畅'] },
  { name: '城管局', role: '城管局', level: 'II', instructions: ['加强排水调度', '巡查管网状况', '组织清淤疏通'] },
  { name: '城管局', role: '城管局', level: 'III', instructions: ['加强设施巡查', '做好排涝准备', '清理排水口'] },
  { name: '城管局', role: '城管局', level: 'IV', instructions: ['检查排水设施', '保持管网畅通', '做好值班值守'] },
];

export function getCardsByLevel(level: string): SopCard[] {
  return sopCards.filter(card => card.level === level);
}

export function getCardByName(name: string): SopCard | undefined {
  return sopCards.find(card => card.name === name);
}

export function getCardByRole(role: string): SopCard | undefined {
  return sopCards.find(card => card.role === role);
}
