/**
 * 回合制推演引擎测试
 * 测试内容：
 * 1. 方案输入验证（简单输入拦截）
 * 2. 方案解析逻辑
 * 3. 回合推演流程
 * 4. 上帝AI推演结果
 */

import { RoundBasedEngine, createRoundBasedEngine } from '../round-based-engine';
import { wuhanDecisionRoleMappings } from '../wuhan-waterlogging-case';
import { getDutiesByScenario } from '../emergency-training-new';

// 测试数据
const testDecisionMapping = wuhanDecisionRoleMappings[0];
const testScenarioId = 'urban-waterlogging-1';

console.log('=== 回合制推演引擎测试开始 ===\n');

// 测试1：方案输入验证 - 简单输入拦截
console.log('【测试1】方案输入验证 - 简单输入拦截');
console.log('----------------------------------------');

const engine1 = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');

// 测试1.1：过于简短的输入（如"全力配合"）
const simplePlan1 = '全力配合';
const validation1 = engine1.validatePlayerPlan(simplePlan1);
console.log(`输入: "${simplePlan1}"`);
console.log(`长度: ${simplePlan1.length} 字符`);
console.log(`验证结果: ${validation1.isValid ? '通过' : '拦截'}`);
console.log(`缺少要素: ${validation1.missingElements.join(', ')}`);
console.log(`建议: ${validation1.suggestions.join('\n  ')}`);
console.log(`预期: 应该被拦截 ✓\n`);

// 测试1.2：只有措施没有部门
const simplePlan2 = '组织人员转移，实施交通管制，部署医疗救治';
const validation2 = engine1.validatePlayerPlan(simplePlan2);
console.log(`输入: "${simplePlan2}"`);
console.log(`长度: ${simplePlan2.length} 字符`);
console.log(`验证结果: ${validation2.isValid ? '通过' : '拦截'}`);
console.log(`缺少要素: ${validation2.missingElements.join(', ')}`);
console.log(`预期: 应该被拦截（缺少部门和时间） ✓\n`);

// 测试1.3：有措施和部门但没有时间
const simplePlan3 = '组织城管局实施排涝作业，公安局维护交通秩序';
const validation3 = engine1.validatePlayerPlan(simplePlan3);
console.log(`输入: "${simplePlan3}"`);
console.log(`长度: ${simplePlan3.length} 字符`);
console.log(`验证结果: ${validation3.isValid ? '通过' : '拦截'}`);
console.log(`缺少要素: ${validation3.missingElements.join(', ')}`);
console.log(`预期: 应该被拦截（缺少时间） ✓\n`);

// 测试1.4：完整的方案
const completePlan = `【应急处置方案】

一、总体要求
针对当前暴雨内涝灾情，立即启动应急响应，统筹各部门开展处置工作。

二、具体措施
1. 组织城管局在30分钟内调派移动泵站20台，实施强排作业
2. 部署公安局在15分钟内实施交通管制，引导车辆绕行积水路段
3. 安排卫健委预置医疗救护队伍5支，做好伤员救治准备
4. 协调街道办组织网格员排查低洼区域，转移受威胁群众

三、时间节点
- 立即：启动响应，人员到位
- 15分钟内：交通管制到位
- 30分钟内：排涝设备到位
- 1小时内：完成首轮灾情评估

四、资源需求
移动泵站20台、救护车5辆、警力100人、网格员50人`;

const validation4 = engine1.validatePlayerPlan(completePlan);
console.log(`输入: 完整方案（${completePlan.length} 字符）`);
console.log(`验证结果: ${validation4.isValid ? '通过' : '拦截'}`);
console.log(`缺少要素: ${validation4.missingElements.join(', ') || '无'}`);
console.log(`建议: ${validation4.suggestions.join('\n  ') || '无'}`);
console.log(`预期: 应该通过 ✓\n`);

// 测试2：方案解析逻辑
console.log('【测试2】方案解析逻辑');
console.log('----------------------------------------');

const engine2 = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');

// 测试2.1：解析包含多个措施的方案
const multiActionPlan = `组织城管局实施排涝作业，调派移动泵站20台。
部署公安局实施交通管制，封闭积水路段。
安排卫健委预置医疗救治力量，准备救护车5辆。
协调街道办组织群众转移，确保受威胁人员安全。`;

engine2.setPlayerPlan(multiActionPlan);
const roundState2 = engine2.getCurrentRound();
console.log(`方案内容: ${multiActionPlan.slice(0, 50)}...`);
console.log(`解析出的行动数量: ${roundState2.actions.length}`);
roundState2.actions.forEach((action, idx) => {
  console.log(`  行动${idx + 1}: ${action.action}`);
  console.log(`    - 执行者: ${action.roleName}`);
  console.log(`    - 目标部门: ${action.targetRoles.join(', ') || '无'}`);
  console.log(`    - 资源: ${action.resources.join(', ') || '无'}`);
});
console.log(`预期: 应该解析出4个行动 ✓\n`);

// 测试2.2：解析模糊方案
const vaguePlan = '我们会尽力做好相关工作，确保群众安全';
const engine2b = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');
engine2b.setPlayerPlan(vaguePlan);
const roundState2b = engine2b.getCurrentRound();
console.log(`方案内容: "${vaguePlan}"`);
console.log(`解析出的行动数量: ${roundState2b.actions.length}`);
roundState2b.actions.forEach((action, idx) => {
  console.log(`  行动${idx + 1}: ${action.action}`);
});
console.log(`预期: 应该解析出1个通用行动 ✓\n`);

// 测试3：回合推演流程
console.log('【测试3】回合推演流程');
console.log('----------------------------------------');

const engine3 = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');

// 模拟添加AI消息
engine3.addMessage({
  agentId: 'urban-management',
  agentName: '城管局',
  agentDepartment: '城管局',
  message: '城管局汇报：已启动排涝预案，调派移动泵站10台。',
  emotion: 'worried',
  timestamp: Date.now(),
  action: '调派移动泵站',
});

engine3.addMessage({
  agentId: 'police-bureau',
  agentName: '公安局',
  agentDepartment: '公安局',
  message: '公安局汇报：已增派警力维持秩序，实施路段封控。',
  emotion: 'urgent',
  timestamp: Date.now(),
  action: '实施路段封控',
});

// 设置玩家方案
const playerPlan3 = `【应急处置方案】

一、总体要求
针对当前暴雨内涝灾情，立即启动应急响应。

二、具体措施
1. 组织城管局在30分钟内调派移动泵站20台实施排涝
2. 部署公安局在15分钟内实施交通管制
3. 安排卫健委预置医疗救护队伍
4. 协调街道办组织群众转移

三、时间节点
- 立即启动响应
- 15分钟内交通管制到位
- 30分钟内排涝设备到位

四、资源需求
移动泵站20台、警力100人、救护车5辆`;

engine3.setPlayerPlan(playerPlan3);

// 设置AI方案
engine3.setAIPlan('urban-management', '调派移动泵站20台，实施强排作业');
engine3.setAIPlan('police-bureau', '实施交通管制，引导车辆绕行');
engine3.setAIPlan('health-bureau', '预置医疗救治力量，准备批量伤员救治');

console.log('回合状态（推演前）:');
console.log(`  回合数: ${engine3.getCurrentRoundNumber()}`);
console.log(`  消息数: ${engine3.getCurrentRound().messages.length}`);
console.log(`  行动数: ${engine3.getCurrentRound().actions.length}`);
console.log(`  玩家方案: ${engine3.getCurrentRound().playerPlan ? '已设置' : '未设置'}`);

// 执行回合推演
const result3 = engine3.endRound();
console.log('\n回合推演结果:');
console.log(`  回合数: ${result3.roundNumber}`);
console.log(`  评级: ${result3.grade}`);
console.log(`  总结: ${result3.summary}`);
console.log(`  事件数: ${result3.events.length}`);
console.log(`  缺口数: ${result3.gaps.length}`);
console.log(`  下一回合情况: ${result3.nextSituation.slice(0, 100)}...`);

console.log('\n推演事件:');
result3.events.forEach((event, idx) => {
  console.log(`  ${idx + 1}. [${event.type}] ${event.title}`);
  console.log(`     ${event.description.slice(0, 80)}...`);
});

if (result3.gaps.length > 0) {
  console.log('\n行动缺口:');
  result3.gaps.forEach((gap, idx) => {
    console.log(`  ${idx + 1}. ${gap.roleName}: ${gap.consequence.slice(0, 80)}...`);
  });
}

console.log(`\n预期: 应该有评级、事件、缺口、下一回合情况 ✓\n`);

// 测试4：上帝AI推演结果
console.log('【测试4】上帝AI推演结果');
console.log('----------------------------------------');

const outcome = result3.outcome;
console.log('推演结局:');
console.log(`  成功: ${outcome.success ? '是' : '否'}`);
console.log(`  评级: ${outcome.grade}`);
console.log(`  总结: ${outcome.summary}`);
console.log(`\n伤亡统计:`);
console.log(`  死亡: ${outcome.casualties.deaths}人`);
console.log(`  受伤: ${outcome.casualties.injuries}人`);
console.log(`  失踪: ${outcome.casualties.missing}人`);
console.log(`  转移: ${outcome.casualties.evacuated}人`);
console.log(`\n统计数据:`);
console.log(`  响应时间: ${outcome.statistics.responseTime}分钟`);
console.log(`  资源利用率: ${outcome.statistics.resourceUtilization}%`);
console.log(`  协同评分: ${outcome.statistics.coordinationScore}`);
console.log(`  公众满意度: ${outcome.statistics.publicSatisfaction}`);
console.log(`\n关键事件:`);
outcome.keyEvents.forEach((event, idx) => {
  console.log(`  ${idx + 1}. ${event}`);
});
console.log(`\n经验教训:`);
outcome.lessons.forEach((lesson, idx) => {
  console.log(`  ${idx + 1}. ${lesson}`);
});
console.log(`\n角色表现:`);
outcome.rolePerformance.forEach((role) => {
  console.log(`  ${role.roleName}: ${role.score}分 - ${role.comment}`);
});

console.log(`\n预期: 应该有完整的伤亡、统计、事件、教训、角色表现 ✓\n`);

// 测试5：多回合推演
console.log('【测试5】多回合推演');
console.log('----------------------------------------');

const engine5 = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');

// 第一回合
engine5.setPlayerPlan(playerPlan3);
const result5a = engine5.endRound();
console.log(`第一回合评级: ${result5a.grade}`);
console.log(`第一回合缺口: ${result5a.gaps.length}个`);

// 第二回合（使用新的方案）
const playerPlan5b = `【第二回合调整方案】

针对${result5a.nextSituation.slice(0, 30)}...

补充措施:
1. 加强水利局水库调度，控制泄洪流量
2. 增派自然资源局监测地质灾害
3. 协调通信办保障应急通信
4. 安排供电公司做好断电避险

时间: 立即执行
资源: 监测设备10套、通信车2辆`;

engine5.setPlayerPlan(playerPlan5b);
const result5b = engine5.endRound();
console.log(`第二回合评级: ${result5b.grade}`);
console.log(`第二回合缺口: ${result5b.gaps.length}个`);
console.log(`总回合数: ${engine5.getAllRounds().length}`);

console.log(`\n预期: 应该能连续推演多个回合 ✓\n`);

console.log('=== 所有测试完成 ===');
