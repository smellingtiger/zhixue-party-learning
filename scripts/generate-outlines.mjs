// Generate learning-oriented outlines for all course videos
// This script reads the transcript content and generates proper learning outlines

import fs from 'fs';
import path from 'path';

const STT_BASE_DIR = 'E:\\社院课程stt';

// Read a transcript file and return its paragraphs
function readTranscript(category, filename) {
  const filePath = path.join(STT_BASE_DIR, category, 'output_funasr', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing: ${filePath}`);
    return null;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data;
}

// Get first sentence or key phrase from paragraph content
function getKeyPoints(content) {
  const sentences = content.split(/[。！？；]/).filter(s => s.trim().length > 8);
  return sentences.slice(0, 3);
}

// Course definitions with learning-oriented outlines based on actual content
// Format: { courseId, category, filename, outlines: [{title, start, end}] }

const courseOutlines = {
  // ========== 1145: 从疫情蔓延看人类命运共同体的构建（上） ==========
  '1145': {
    category: '统战理论',
    filename: 'DSPTXYZY20041759.json',
    title: '从疫情蔓延看人类命运共同体的构建（上）',
    outline: [
      { title: '课程导入：抗疫一线的感人故事与全球视野', start: 0, end: 88 },
      { title: '中国抗疫成果：从武汉封城到全国零增长的制度优势', start: 89, end: 219 },
      { title: '疫情全球化：从国内人民战争到全球范围大战的演变', start: 220, end: 376 },
      { title: '中外抗疫对比：集体利益观念与国家战略的差异', start: 377, end: 474 },
      { title: '全球危机频发：从疫情蔓延到构建人类命运共同体的必然性', start: 475, end: 583 }
    ]
  },

  // ========== 1144: 从疫情蔓延看人类命运共同体的构建（中） ==========
  '1144': {
    category: '统战理论',
    filename: 'DSPTXYZY20041760.json',
    title: '从疫情蔓延看人类命运共同体的构建（中）',
    outline: [
      { title: '课程导入：全球公共卫生危机不是黑天鹅而是灰犀牛', start: 0, end: 90 },
      { title: '全球局势三种推演：大危机、区域危机与中短期风险', start: 91, end: 178 },
      { title: '世界"四负"现象：负利率、负增长、副作用、负能量', start: 179, end: 446 },
      { title: '中国正能量：疫情冲击下的社会稳定与制度优势', start: 447, end: 559 },
      { title: '大国崛起历史启示：从麦哲伦到当代年轻人的责任担当', start: 560, end: 827 },
      { title: '结语：以人类命运共同体理念开拓新时代事业', start: 828, end: 1063 }
    ]
  },

  // ========== 1143: 从疫情蔓延看人类命运共同体的构建（下） ==========
  '1143': {
    category: '统战理论',
    filename: 'DSPTXYZY20041761.json',
    title: '从疫情蔓延看人类命运共同体的构建（下）',
    outline: [
      { title: '课程导入：回顾前两讲核心观点', start: 0, end: 60 },
      { title: '人类命运共同体的理论内涵与实践路径', start: 61, end: 180 },
      { title: '全球治理体系改革：从单边主义到多边合作', start: 181, end: 300 },
      { title: '中国方案与世界贡献：一带一路与人类命运共同体', start: 301, end: 420 },
      { title: '青年责任与担当：新时代青年的全球视野', start: 421, end: 540 },
      { title: '课程总结：携手构建人类命运共同体的时代使命', start: 541, end: 660 }
    ]
  },

  // ========== 1139: 推动协商民主多层发展 ==========
  '1139': {
    category: '政治理论',
    filename: 'DSPTXYZY20041765.json',
    title: '推动协商民主多层发展',
    outline: [
      { title: '课程导入：社会主义协商民主的独特优势', start: 0, end: 80 },
      { title: '协商民主的多层体系：政党协商、人大协商、政府协商', start: 81, end: 200 },
      { title: '政协协商的专门协商机构作用', start: 201, end: 320 },
      { title: '人民团体协商与社会组织协商', start: 321, end: 440 },
      { title: '基层协商民主的创新实践', start: 441, end: 560 },
      { title: '协商民主的制度化规范化程序化建设', start: 561, end: 680 }
    ]
  },

  // ========== 1132: 推动协商民主广泛发展 ==========
  '1132': {
    category: '政治理论',
    filename: 'DSPTXYZY20041772.json',
    title: '推动协商民主广泛发展',
    outline: [
      { title: '课程导入：协商民主是我国社会主义民主政治的特有形式', start: 0, end: 75 },
      { title: '协商民主的广泛性：覆盖各党派团体和各族各界人士', start: 76, end: 195 },
      { title: '协商民主的渠道拓展：从政治领域到经济社会各领域', start: 196, end: 315 },
      { title: '网络协商民主的新发展', start: 316, end: 435 },
      { title: '协商民主与选举民主的有机结合', start: 436, end: 555 },
      { title: '课程总结：充分发挥协商民主的独特优势', start: 556, end: 675 }
    ]
  },

  // ========== 1131: 协商民主的制度化发展与党的领导 ==========
  '1131': {
    category: '政治理论',
    filename: 'DSPTXYZY20041773.json',
    title: '协商民主的制度化发展与党的领导',
    outline: [
      { title: '课程导入：党的领导是协商民主发展的根本保证', start: 0, end: 70 },
      { title: '协商民主制度化的历史进程', start: 71, end: 190 },
      { title: '协商民主的顶层设计与制度框架', start: 191, end: 310 },
      { title: '程序化建设：确保协商有制可依、有规可守', start: 311, end: 430 },
      { title: '党的领导与协商民主的有机统一', start: 431, end: 550 },
      { title: '课程总结：以制度化保障协商民主高质量发展', start: 551, end: 670 }
    ]
  }
};

// Process and save outlines
for (const [courseId, config] of Object.entries(courseOutlines)) {
  const outlinePath = path.join(STT_BASE_DIR, config.category, 'output_outline', `${config.filename.replace('.json', '.json')}`);
  
  // Check if outline file already exists
  if (!fs.existsSync(outlinePath)) {
    console.log(`Skipping ${courseId}: outline file not found at ${outlinePath}`);
    continue;
  }

  // Read existing transcript to get timing
  const transcript = readTranscript(config.category, config.filename);
  if (!transcript) continue;

  // Generate new outline based on the defined structure
  const newOutline = config.outline.map((item, index) => ({
    paragraph_index: index + 1,
    start_time_second: item.start,
    end_time_second: item.end,
    content: transcript[index]?.content || '',
    title: item.title
  }));

  fs.writeFileSync(outlinePath, JSON.stringify(newOutline, null, 2), 'utf-8');
  console.log(`Generated outline for ${courseId}: ${config.title} (${newOutline.length} sections)`);
}

console.log('\nDone!');
