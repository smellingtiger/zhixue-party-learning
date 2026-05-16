// 通过AI智能生成课程大纲标题
// 调用项目的LLM API为每个段落生成学习导向标题

import fs from 'fs';
import path from 'path';

const STT_BASE_DIR = 'E:\\社院课程stt';
const API_URL = 'http://localhost:3000/course-outline-gen';

// 从video-mapping获取课程标题
const videoMappingPath = 'd:\\TraeProject\\zhixue-party-learning\\src\\lib\\video-mapping.ts';
const mappingContent = fs.readFileSync(videoMappingPath, 'utf-8');

function readTranscript(category, filename) {
  const filePath = path.join(STT_BASE_DIR, category, 'output_funasr', filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 从mapping.ts查找课程标题
function findCourseTitle(courseId) {
  const regex = new RegExp(`'${courseId}':\\s*\\{.*?category:\\s*'([^']+)',\\s*filename:\\s*'([^']+)'`, 's');
  const match = mappingContent.match(regex);
  if (match) return match[0].split('\n').find(l => l.includes('title'))?.match(/'([^']+)'/)?.[1] || courseId;
  return courseId;
}

// 课程配置
const coursesToProcess = [
  // 先测试一小批
  { id: '1328', category: '政治理论', file: 'DSPTXYZY20050801.json' },
  { id: '1330', category: '政治理论', file: 'DSPTXYZY20073102.json' },
  { id: '1288', category: '政治理论', file: 'DSPTXYZY20041710.json' },
  { id: '1283', category: '政治理论', file: 'DSPTXYZY20041704.json' },
];

async function generateOutline(course) {
  const transcript = readTranscript(course.category, course.file);
  if (!transcript || transcript.length === 0) {
    console.log(`✗ ${course.id}: 无转写内容`);
    return false;
  }

  // 准备要发送的段落实例（限制每个段落的前200字以节省token）
  const trimmedTranscript = transcript.map(p => ({
    start_time_second: p.start_time_second,
    end_time_second: p.end_time_second,
    content: p.content.substring(0, 200)
  }));

  try {
    console.log(`→ ${course.id}: 正在请求AI生成(${transcript.length}段)...`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: course.id,
        courseTitle: course.id,
        transcript: trimmedTranscript
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.log(`✗ ${course.id}: API错误 ${err}`);
      return false;
    }

    const result = await response.json();
    if (!result.titles || !Array.isArray(result.titles)) {
      console.log(`✗ ${course.id}: AI返回格式错误`);
      return false;
    }

    // 更新大纲文件
    const outlinePath = path.join(STT_BASE_DIR, course.category, 'output_outline', course.file);
    const existingOutlines = JSON.parse(fs.readFileSync(outlinePath, 'utf-8'));

    const updatedOutlines = existingOutlines.map((o, i) => {
      const aiTitle = result.titles.find(t => t.index === i + 1);
      return {
        ...o,
        title: aiTitle?.title || o.title
      };
    });

    fs.writeFileSync(outlinePath, JSON.stringify(updatedOutlines, null, 2), 'utf-8');
    console.log(`✓ ${course.id}: 成功更新${result.titles.length}个标题`);
    return true;
  } catch (err) {
    console.log(`✗ ${course.id}: 请求失败 ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== AI智能生成课程大纲标题 ===\n');
  console.log(`共 ${coursesToProcess.length} 门课程\n`);

  let success = 0;
  let fail = 0;

  for (const course of coursesToProcess) {
    const ok = await generateOutline(course);
    if (ok) success++;
    else fail++;
    // 避免请求过快
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n完成! 成功: ${success}, 失败: ${fail}`);
}

main().catch(console.error);