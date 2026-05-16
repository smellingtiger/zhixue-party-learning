import fs from 'fs';

const content = fs.readFileSync('d:/TraeProject/zhixue-party-learning/src/lib/knowledge-graph.ts', 'utf-8');

// 统计课程数量
const courseMatches = content.match(/createCourse\(/g) || [];
const courseInNodeMatches = content.match(/courses:\s*\[/g) || [];

// 统计节点数量
const nodeMatches = content.match(/id:\s*['"][^'"]+['"]/g) || [];

// 统计children数组数量
const childrenMatches = content.match(/children:\s*\[/g) || [];

console.log('知识图谱数据统计:');
console.log('  createCourse调用:', courseMatches.length);
console.log('  节点内courses数组:', courseInNodeMatches.length);
console.log('  节点ID定义:', nodeMatches.length);
console.log('  children数组:', childrenMatches.length);

// 估算总节点数（包括课程子节点）
let totalCourses = 0;
const courseArrays = content.match(/courses:\s*\[[\s\S]*?\]/g) || [];
courseArrays.forEach(arr => {
  const ids = arr.match(/id:\s*['"]/g) || [];
  totalCourses += ids.length;
});
console.log('  知识节点中的课程总数:', totalCourses);

// 统计知识节点数（不含课程子节点）
let knowledgeNodes = 0;
const lines = content.split('\n');
lines.forEach(line => {
  if (line.includes('id:') && !line.includes('course-') && !line.includes('createCourse')) {
    knowledgeNodes++;
  }
});
console.log('  知识节点数（不含课程）:', knowledgeNodes);
console.log('  预估总渲染节点数（知识节点+课程节点）:', knowledgeNodes + totalCourses);
