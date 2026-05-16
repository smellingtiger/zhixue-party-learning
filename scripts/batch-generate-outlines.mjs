// 智能课程大纲生成器
// 基于深度文本清理和智能模式匹配，生成真正有学习指导价值的标题

import fs from 'fs';
import path from 'path';

const STT_BASE_DIR = 'E:\\社院课程stt';

function readTranscript(category, filename) {
  const filePath = path.join(STT_BASE_DIR, category, 'output_funasr', filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ========== 深度文本清理 ==========
const FILLER_PREFIXES = [
  // 语气词
  '嗯', '呃', '啊', '哎', '哦', '唉', '哼', '哈', '呵',
  // 口语化引导
  '那么', '那', '这个', '那个', '这些', '那些', '这里', '那里',
  '我们', '我说', '我想', '我看', '我觉得', '我认为', '我的理解',
  '就是说', '就是说呢', '也就是说', '可以说是', '可以说', '可以讲',
  '说白了', '简单说', '总的来说', '总体来看', '总体上', '总的来看',
  '大家都知道', '我们知道', '大家知道', '众所周知',
  '我们看到', '可以看到', '我们发现', '我们看到',
  '实际上', '事实上', '当然', '当然了', '确实', '确实说', '的确', '其实',
  '所以', '因此', '因而', '于是', '然后', '那么说',
  '今天', '这次', '这个',
  // 转述词
  '总书记', '习近平总书记', '习近平', '他指出', '他强调', '总书记指出',
  '总书记强调', '就是', '就是说',
];

function cleanTextStart(text) {
  let result = text;
  for (const prefix of FILLER_PREFIXES) {
    result = result.replace(new RegExp(`^${prefix}+`), '');
  }
  return result.trim();
}

function deepClean(text) {
  if (!text) return '';
  let result = text;
  // 去除开头的连续语气词
  result = result.replace(/^[嗯呃啊哎哦唉]+/, '');
  // 循环清理，直到不再有匹配项
  let prev = '';
  while (prev !== result) {
    prev = result;
    for (const prefix of FILLER_PREFIXES) {
      const regex = new RegExp('^(?:' + prefix + ')[，,\\s]?');
      result = result.replace(regex, '').trim();
    }
  }
  return result.trim();
}

// ========== 标题生成策略 ==========

// 从文本中提取第一个有内容的句子
function extractFirstContentSentence(text) {
  // 先清理开头
  let cleaned = cleanTextStart(text);
  // 按句号分割
  const sentences = cleaned.split(/[。！？；]/).filter(s => s.trim().length > 5);
  for (const s of sentences) {
    // 检查是否包含实质性内容
    const hasContent = /[的是一不为在有了会等中不至人大上这到出要发与着子]/.test(s);
    if (hasContent) return s.trim();
  }
  return '';
}

// 获取定义性内容
function extractDefinition(text) {
  const defMatch = text.match(/([^，。]{4,30})(?:是指|就是|就是说是|指的是|说的就是|实质上|本质上)([^，。]{3,20})/);
  if (defMatch) return defMatch[1] + defMatch[2];
  return null;
}

// 获取结构性内容（X个方面/维度/问题/层次）
function extractStructure(text) {
  const structMatch = text.match(/([^。]{4,35})(?:方面|维度|层面|角度|问题|内容|部分|层次|类型|环节)/);
  if (structMatch) {
    let prefix = '';
    const numMatch = text.match(/^[第第一第二第三第四第五第六1-9\d一二三四五六七八九十百]+/);
    if (numMatch && structMatch.index < 5) {
      prefix = numMatch[0];
    }
    let title = (prefix + structMatch[1]).trim();
    return title;
  }
  return null;
}

// 获取命令/要求性内容
function extractRequirement(text) {
  const reqMatch = text.match(/([^，。]{4,12}[要必须需要应当应该][不]?[^，。]{5,25})/);
  if (reqMatch && reqMatch[1].length > 12) {
    return reqMatch[1];
  }
  return null;
}

// 提取关键事件/主题
function extractEvent(text) {
  // 习近平浙江探索实践系列
  const eventMatch = text.match(/(走进|来到|关注|围绕|沿着)([^。]{6,30})/);
  if (eventMatch) return eventMatch[1] + eventMatch[2];
  return null;
}

// 主要标题生成函数
function generateTitle(content, index) {
  if (!content || content.length < 8) return `章节 ${index + 1}`;
  
  // 步骤1：深度清理
  let text = deepClean(content);
  if (text.length < 8) text = content.replace(/^[嗯呃啊哎哦唉]+/, '').trim();
  if (text.length < 8) return `章节 ${index + 1}`;
  
  // 步骤2：尝试多种策略提取标题
  let title = null;
  
  // 策略A：查找定义性内容
  title = extractDefinition(text);
  if (title && title.length > 8 && title.length < 45) return title;
  
  // 策略B：查找结构性内容（方面/维度/问题）
  title = extractStructure(text);
  if (title && title.length > 8 && title.length < 45) return title;
  
  // 策略C：查找"学习/贯彻XXX精神"模式
  const studyMatch = text.match(/(学习|深入领会|贯彻|落实)(习近平(?:总书记)?(?:关于|在|对)?[^，。]{4,25})/);
  if (studyMatch) {
    let t = studyMatch[0];
    if (t.length > 45) t = t.substring(0, 42) + '...';
    return t;
  }
  
  // 策略D：查找会议要求/强调内容
  title = extractRequirement(text);
  if (title && title.length > 10 && title.length < 45) return title;
  
  // 策略E：查找事件/地点描述（新闻类）
  title = extractEvent(text);
  if (title && title.length > 8 && title.length < 45) return title;
  
  // 策略F：取第一个完整句子，清理后使用
  let firstSentence = extractFirstContentSentence(text);
  if (firstSentence && firstSentence.length > 8) {
    // 尝试在自然断点处截断
    firstSentence = firstSentence.substring(0, 50);
    const breaks = ['，', '、', '；', '：', ',', ' '];
    for (const b of breaks) {
      const idx = firstSentence.indexOf(b, 12);
      if (idx > 8 && idx < 40) {
        return firstSentence.substring(0, idx);
      }
    }
    return firstSentence.length > 42 ? firstSentence.substring(0, 40) + '...' : firstSentence;
  }
  
  // 步骤3：最后回退 - 清理后取前40字
  let fallback = text.substring(0, 45);
  const commaIdx = fallback.indexOf('，');
  if (commaIdx > 5 && commaIdx < 38) {
    return fallback.substring(0, commaIdx);
  }
  return fallback.length > 42 ? fallback.substring(0, 40) + '...' : (fallback || `章节 ${index + 1}`);
}

// 处理单个课程
function processCourse(courseId, category, filename) {
  const transcript = readTranscript(category, filename);
  if (!transcript || transcript.length === 0) {
    console.log(`✗ ${courseId}: 无转写内容`);
    return false;
  }

  const outlinePath = path.join(STT_BASE_DIR, category, 'output_outline', filename);
  if (!fs.existsSync(outlinePath)) {
    console.log(`✗ ${courseId}: 无大纲文件`);
    return false;
  }

  const outlines = transcript.map((p, i) => {
    const rawTitle = generateTitle(p.content, i);
    
    // 后处理：确保标题不以无意义词开头
    let finalTitle = cleanTextStart(rawTitle);
    // 如果清理后太短，使用原始
    if (finalTitle.length < 5) finalTitle = rawTitle;
    // 限制最大长度
    if (finalTitle.length > 50) finalTitle = finalTitle.substring(0, 47) + '...';
    
    return {
      paragraph_index: i + 1,
      start_time_second: p.start_time_second,
      end_time_second: p.end_time_second,
      content: p.content.substring(0, 300),
      title: finalTitle
    };
  });

  fs.writeFileSync(outlinePath, JSON.stringify(outlines, null, 2), 'utf-8');
  console.log(`✓ ${courseId}: ${outlines.length}段`);
  return true;
}

// ========== 执行 ==========
console.log('=== 智能课程大纲生成 ===\n');

const allCourses = [
  // 乡村振兴系列
  ['1328', '政治理论', 'DSPTXYZY20050801.json'],
  ['1329', '政治理论', 'DSPTXYZY20073101.json'],
  ['1330', '政治理论', 'DSPTXYZY20073102.json'],
  ['1331', '政治理论', 'DSPTXYZY20073103.json'],
  ['1332', '政治理论', 'DSPTXYZY20073104.json'],
  ['1333', '政治理论', 'DSPTXYZY20073105.json'],
  // 乡村治理系列
  ['1334', '政治理论', 'DSPTXYZY20092401.json'],
  ['1335', '政治理论', 'DSPTXYZY20092402.json'],
  ['1336', '政治理论', 'DSPTXYZY20092403.json'],
  // 廉政教育系列
  ['1337', '政治理论', 'DSPTXYZY20092404.json'],
  ['1338', '政治理论', 'DSPTXYZY20092405.json'],
  ['1339', '政治理论', 'DSPTXYZY20092406.json'],
  ['1340', '政治理论', 'DSPTXYZY20092407.json'],
  ['1341', '政治理论', 'DSPTXYZY20092408.json'],
  // 监督执纪系列
  ['1342', '政治理论', 'DSPTXYZY20120101.json'],
  ['1343', '政治理论', 'DSPTXYZY20120102.json'],
  ['1344', '政治理论', 'DSPTXYZY20120103.json'],
  ['1345', '政治理论', 'DSPTXYZY20120104.json'],
  // 党史学习系列
  ['1288', '政治理论', 'DSPTXYZY20041710.json'],
  ['1289', '政治理论', 'DSPTXYZY20041711.json'],
  ['1290', '政治理论', 'DSPTXYZY20041712.json'],
  ['1291', '政治理论', 'DSPTXYZY20041713.json'],
  ['1292', '政治理论', 'DSPTXYZY20041714.json'],
  ['1293', '政治理论', 'DSPTXYZY20041715.json'],
  // 党的创新理论系列
  ['1294', '政治理论', 'DSPTXYZY20041716.json'],
  ['1295', '政治理论', 'DSPTXYZY20041717.json'],
  ['1296', '政治理论', 'DSPTXYZY20041718.json'],
  ['1297', '政治理论', 'DSPTXYZY20041719.json'],
  ['1298', '政治理论', 'DSPTXYZY20041720.json'],
  ['1299', '政治理论', 'DSPTXYZY20041721.json'],
  ['1300', '政治理论', 'DSPTXYZY20041722.json'],
  // 党的二十大精神
  ['1050', '政治理论', 'DSPTXYZY20041723.json'],
  // 党章学习系列
  ['1283', '政治理论', 'DSPTXYZY20041704.json'],
  ['1284', '政治理论', 'DSPTXYZY20041706.json'],
  ['1285', '政治理论', 'DSPTXYZY20041708.json'],
  ['1286', '政治理论', 'DSPTXYZY20041709.json'],
  ['1287', '政治理论', 'DSP210705.json'],
  // 统战理论系列
  ['1301', '统战理论', 'DSPTXYZY20041728.json'],
  ['1302', '统战理论', 'DSPTXYZY20041729.json'],
  ['1303', '统战理论', 'DSPTXYZY20041730.json'],
  ['1304', '统战理论', 'DSPTXYZY20041731.json'],
  ['1305', '统战理论', 'DSPTXYZY20041732.json'],
  ['1306', '统战理论', 'DSPTXYZY20041733.json'],
  ['1307', '统战理论', 'DSPTXYZY20041734.json'],
  ['1308', '统战理论', 'DSPTXYZY20041735.json'],
  ['1309', '统战理论', 'DSPTXYZY20041736.json'],
  ['1310', '统战理论', 'DSPTXYZY20041737.json'],
  ['1311', '统战理论', 'DSPTXYZY20041738.json'],
  ['1312', '统战理论', 'DSPTXYZY20041739.json'],
  ['1313', '统战理论', 'DSPTXYZY20041740.json'],
  ['1314', '统战理论', 'DSPTXYZY20041741.json'],
  ['1315', '统战理论', 'DSPTXYZY20041742.json'],
  ['1316', '统战理论', 'DSPTXYZY20041743.json'],
];

let success = 0, fail = 0;
for (const [id, cat, file] of allCourses) {
  if (processCourse(id, cat, file)) success++;
  else fail++;
}
console.log(`\n完成! 成功: ${success}, 失败: ${fail}`);
console.log('\n=== 注意 ===');
console.log('1131, 1132: 转写文件内容与课程标题不匹配');
console.log('1089-1092: 无转写文件');