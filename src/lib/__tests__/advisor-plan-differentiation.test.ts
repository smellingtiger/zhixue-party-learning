/**
 * AI参谋方案差异化测试
 * 验证不同角色层级（决策层/核心层/协同层）生成的方案内容是否有明显差异
 */

import { createRoundBasedEngine } from '../round-based-engine';
import { wuhanDecisionRoleMappings } from '../wuhan-waterlogging-case';

const testDecisionMapping = wuhanDecisionRoleMappings[0];
const testScenarioId = 'urban-waterlogging-1';
const situation = '城区出现持续强降雨，1小时降雨量达30mm，主干道积水深度≥20cm且持续30分钟';

console.log('=== AI参谋方案差异化测试开始 ===\n');

// 测试1：决策层方案（市长）
console.log('【测试1】决策层方案 - 市长（统筹全局）');
console.log('----------------------------------------');

const decisionEngine = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'mayor', 'decision');
const decisionPlan = decisionEngine.generateAdvisorPlan('decision', situation);

console.log(`方案标题: ${decisionPlan.split('\n')[0]}`);
console.log(`方案长度: ${decisionPlan.length} 字符`);
console.log(`包含"统筹": ${decisionPlan.includes('统筹') ? '是' : '否'}`);
console.log(`包含"指挥体系": ${decisionPlan.includes('指挥体系') ? '是' : '否'}`);
console.log(`包含"监督落实": ${decisionPlan.includes('监督落实') ? '是' : '否'}`);
console.log(`包含"调度": ${decisionPlan.includes('调度') ? '是' : '否'}`);
console.log(`包含"配合": ${decisionPlan.includes('配合') ? '是' : '否'}`);
console.log(`\n方案前300字符预览:`);
console.log(decisionPlan.slice(0, 300) + '...\n');

// 测试2：核心层方案（应急管理局）
console.log('【测试2】核心层方案 - 应急管理局（调度执行）');
console.log('----------------------------------------');

const coreEngine = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'emergency-bureau', 'core');
const corePlan = coreEngine.generateAdvisorPlan('core', situation);

console.log(`方案标题: ${corePlan.split('\n')[0]}`);
console.log(`方案长度: ${corePlan.length} 字符`);
console.log(`包含"统筹": ${corePlan.includes('统筹') ? '是' : '否'}`);
console.log(`包含"指挥体系": ${corePlan.includes('指挥体系') ? '是' : '否'}`);
console.log(`包含"监督落实": ${corePlan.includes('监督落实') ? '是' : '否'}`);
console.log(`包含"调度": ${corePlan.includes('调度') ? '是' : '否'}`);
console.log(`包含"配合": ${corePlan.includes('配合') ? '是' : '否'}`);
console.log(`包含"信息汇总": ${corePlan.includes('信息汇总') ? '是' : '否'}`);
console.log(`包含"物资调配": ${corePlan.includes('物资调配') ? '是' : '否'}`);
console.log(`\n方案前300字符预览:`);
console.log(corePlan.slice(0, 300) + '...\n');

// 测试3：协同层方案（城管局）
console.log('【测试3】协同层方案 - 城管局（配合执行）');
console.log('----------------------------------------');

const collabEngine = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'urban-management', 'collab');
const collabPlan = collabEngine.generateAdvisorPlan('collab', situation);

console.log(`方案标题: ${collabPlan.split('\n')[0]}`);
console.log(`方案长度: ${collabPlan.length} 字符`);
console.log(`包含"统筹": ${collabPlan.includes('统筹') ? '是' : '否'}`);
console.log(`包含"指挥体系": ${collabPlan.includes('指挥体系') ? '是' : '否'}`);
console.log(`包含"监督落实": ${collabPlan.includes('监督落实') ? '是' : '否'}`);
console.log(`包含"调度": ${collabPlan.includes('调度') ? '是' : '否'}`);
console.log(`包含"配合": ${collabPlan.includes('配合') ? '是' : '否'}`);
console.log(`包含"本部门": ${collabPlan.includes('本部门') ? '是' : '否'}`);
console.log(`包含"按预案": ${collabPlan.includes('按预案') ? '是' : '否'}`);
console.log(`\n方案前300字符预览:`);
console.log(collabPlan.slice(0, 300) + '...\n');

// 测试4：协同层方案（不同部门 - 公安局）
console.log('【测试4】协同层方案 - 公安局（不同部门对比）');
console.log('----------------------------------------');

const collabEngine2 = createRoundBasedEngine(testDecisionMapping, testScenarioId, 'police-bureau', 'collab');
const collabPlan2 = collabEngine2.generateAdvisorPlan('collab', situation);

console.log(`方案标题: ${collabPlan2.split('\n')[0]}`);
console.log(`方案长度: ${collabPlan2.length} 字符`);
console.log(`包含"公安局"相关职责: ${collabPlan2.includes('治安') || collabPlan2.includes('交通') || collabPlan2.includes('封控') ? '是' : '否'}`);
console.log(`\n方案前300字符预览:`);
console.log(collabPlan2.slice(0, 300) + '...\n');

// 测试5：差异化验证
console.log('【测试5】差异化验证总结');
console.log('----------------------------------------');

const decisionKeywords = ['统筹', '指挥体系', '监督落实', '总体要求'];
const coreKeywords = ['调度', '信息汇总', '物资调配', '执行要求'];
const collabKeywords = ['配合', '本部门', '按预案', '协同'];

console.log('\n决策层方案特征验证:');
decisionKeywords.forEach(kw => {
  const hasInDecision = decisionPlan.includes(kw);
  const hasInCore = corePlan.includes(kw);
  const hasInCollab = collabPlan.includes(kw);
  console.log(`  "${kw}": 决策层${hasInDecision ? '✓' : '✗'} | 核心层${hasInCore ? '✓' : '✗'} | 协同层${hasInCollab ? '✓' : '✗'}`);
});

console.log('\n核心层方案特征验证:');
coreKeywords.forEach(kw => {
  const hasInDecision = decisionPlan.includes(kw);
  const hasInCore = corePlan.includes(kw);
  const hasInCollab = collabPlan.includes(kw);
  console.log(`  "${kw}": 决策层${hasInDecision ? '✓' : '✗'} | 核心层${hasInCore ? '✓' : '✗'} | 协同层${hasInCollab ? '✓' : '✗'}`);
});

console.log('\n协同层方案特征验证:');
collabKeywords.forEach(kw => {
  const hasInDecision = decisionPlan.includes(kw);
  const hasInCore = corePlan.includes(kw);
  const hasInCollab = collabPlan.includes(kw);
  console.log(`  "${kw}": 决策层${hasInDecision ? '✓' : '✗'} | 核心层${hasInCore ? '✓' : '✗'} | 协同层${hasInCollab ? '✓' : '✗'}`);
});

// 验证方案模板差异化
console.log('\n\n【测试6】方案模板差异化');
console.log('----------------------------------------');

const decisionTemplate = decisionEngine.getPlanTemplate();
const coreTemplate = coreEngine.getPlanTemplate();
const collabTemplate = collabEngine.getPlanTemplate();

console.log(`决策层模板标题: ${decisionTemplate.title}`);
console.log(`核心层模板标题: ${coreTemplate.title}`);
console.log(`协同层模板标题: ${collabTemplate.title}`);

console.log(`\n决策层模板章节:`);
decisionTemplate.sections.forEach((s, i) => {
  console.log(`  ${i + 1}. ${s.name}`);
});

console.log(`\n核心层模板章节:`);
coreTemplate.sections.forEach((s, i) => {
  console.log(`  ${i + 1}. ${s.name}`);
});

console.log(`\n协同层模板章节:`);
collabTemplate.sections.forEach((s, i) => {
  console.log(`  ${i + 1}. ${s.name}`);
});

console.log('\n=== AI参谋方案差异化测试完成 ===');
