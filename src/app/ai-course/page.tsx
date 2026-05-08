'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { 
  Search,
  Clock,
  TrendingUp,
  Star,
  Video,
  FileText,
  Sparkles,
  Lightbulb,
  Users,
  Eye,
  Edit3,
  Save,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const presetCourseTopics = [
  {
    key: 'embodied_ai',
    name: '具身智能基础与政务应用',
    data: {
      courseName: '具身智能基础与政务应用——从认识机制到组织调研',
      courseType: '前沿技术',
      totalHours: 0.8,
      difficulty: '中级',
      targetAudience: '党政类在线学习平台成人用户（机关干部）',
      chapters: [
        { id: 1, title: '前言：为什么机关干部要了解具身智能？', duration: '6分钟', type: 'mixed', content: '2025年"具身智能"首次写入《政府工作报告》，列入生物制造、量子科技、6G等未来产业培育清单。2026年《政府工作报告》进一步提出"打造智能经济新形态"，深化拓展"人工智能+"，促进新一代智能终端和智能体加快推广。同年发布的"十五五"规划纲要草案明确：统筹布局具身智能实训场，推进虚实融合的协同训练与进化，研发大小脑一体化的具身模型与算法，攻关本体及核心零部件等关键技术，加速人形机器人等各类具身智能产品应用。\n\n这意味着具身智能已从实验室概念完成向国家战略高地的跃迁。国务院发展研究中心发布的《中国发展报告2025》预计，我国具身智能产业市场规模有望在2030年达到4000亿元，2035年突破万亿元。\n\n作为机关干部，无论从事政策研究、数字政府建设、应急管理、产业与科技主管，还是监管与纪检工作，都需要对这一前沿领域建立**可操作的理解框架**——不是为了追逐概念，而是为了**判断项目、评估风险、制定规则、组织试点**。\n\n本课程以"机制为轴、治理为尺、场景为落点"展开，通过8章内容，帮助你从零建立起对具身智能的系统认知和实操能力。' },
        { id: 2, title: '第1章：什么是具身智能——从概念到国家战略', duration: '6分钟', type: 'mixed', content: '## 第 1 章·学习目标\n\n- 准确理解具身智能的定义与核心三要素\n- 区分"自动"与"自主"的本质差异\n- 掌握具身智能与"纯大模型""传统机器人"的关系\n- 了解我国将其纳入国家战略的背景与顶层设计\n\n---PAGE---\n\n## 第 1 章｜P1：从一句话定义开始\n\n### 什么是具身智能？\n\n有专家将具身智能概括为 **"有物理载体的智能体"** 。更精确地说，具身智能（Embodied Intelligence）是人工智能与机器人学交叉的前沿领域，强调智能体通过身体与环境的动态交互实现自主学习和进化，其核心在于将 **感知、行动与认知深度融合** 。\n\n通俗理解：\n\n- **传统人工智能**更像屏幕里的"参谋"——无论生成什么方案，始终停留在数字世界\n- **具身智能**是走进生产线的"智能工人"——把数字世界的算法变成物理世界的具体行动\n\n中国工程院院士蒋昌俊指出："我们希望能在真实物理世界中实现交互，这意味着要让人工智能拥有实体，让它们像人类一样具备感知、思考和行动能力。"\n\n**权威阅读链接**：\n\n- [人民网科普｜"具身智能"如何走向未来？](http://kpzg.people.com.cn/n1/2025/0306/c404214-40431999.html)\n- [人民日报｜首入《政府工作报告》，具身智能何以竞速未来](http://paper.people.com.cn/zgcsb/pc/content/202503/17/content_30062313.html)' },
        { id: 3, title: '第2章：核心机制与关键技术', duration: '6分钟', type: 'mixed', content: '## 第 2 章·学习目标\n\n- 理解具身智能的完整技术闭环\n- 掌握从"规则驱动"到"模型驱动"的迁移逻辑\n- 认识世界模型在闭环中的关键地位\n- 了解核心术语体系，建立跨部门沟通的"通用语言"\n- 获得一套快速校验"真具身"项目的实用工具\n\n---PAGE---\n\n## 第 2 章｜P1：闭环——具身智能的第一性原理\n\n### 五步闭环\n\n具身智能的核心运行机制是一个**五步闭环**：\n\n**感知**（多模态传感器）→ **认知**（世界模型/大模型理解）→ **决策**（任务规划与推理）→ **执行**（本体运动与操作控制）→ **反馈**（环境响应/结果评估）\n\n### 为什么"云端聪明、落地失手"？\n\n传统大模型在数字空间表现惊艳，但一进入物理世界就频频出错。根本原因在于：\n\n1. **物理噪声**：光照变化、遮挡、摩擦力差异、传感器误差\n2. **长尾情境**：现实中的"corner case"远多于训练数据能覆盖的范围\n3. **域差（Sim2Real Gap）**：仿真环境与真实物理世界的差距导致模型迁移失败\n\n具身智能的闭环设计正是为了解决这些问题——通过**在线反馈**不断修正和适应。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能新浪潮与落地要点](http://finance.people.com.cn/n1/2025/1022/c1004-40587120.html)\n- [中国信通院蓝皮书（闭环系统图示）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)' },
        { id: 4, title: '第3章：1分钟看懂"自动"与"自主"的差别', duration: '4分钟', type: 'video', content: '## 第 3 章｜视频讲解\n\n分屏对比——同一"楼道消防巡检"任务。\n\n左侧自动模式：机器人按预设路线直行，撞到临时堆放的纸箱后停止——它只会"照章办事"。\n\n右侧自主模式：感知到纸箱障碍后绕行，继续巡检——它能"识变-应变-求变"。\n\n在"自主"一侧叠加五步闭环动画（感知→认知→决策→执行→反馈），每步高亮闪现。\n\n---PAGE---\n\n### 核心要点\n\n- **自动 ≠ 自主**\n- 自动按预设，自主能应变\n- 自主 = 感知—认知—决策—执行—反馈\n- 面向治理，必须可解释、可评估、可监管' },
        { id: 5, title: '第4章：面向公共治理的四大应用场景', duration: '6分钟', type: 'mixed', content: '## 第 4 章·学习目标\n\n- 了解具身智能在城运\n- 掌握从"场景识别"到"指标评估"的分析框架\n- 了解部署前必须完成的合规三件事\n\n---PAGE---\n\n## 第 4 章｜P1：场景总览——四大板块一张图\n\n### 四大政务应用场景\n\n基于信通院对行业应用的梳理及国内落地实践，具身智能在公共治理领域可聚焦四大板块：\n\n| 板块 | 代表性任务 | 本体形态 |\n|:---|:---|:---|\n| **城市运行与设施养护** | 道路/桥隧/管网巡检、微修复、公共空间保洁 | 四足机器狗、轮臂式机器人 |\n| **应急管理与安全生产** | 危化品巡检、灾害侦察、先期处置、消防辅助 | 防爆四足机器人、无人机 |\n| **民生服务与无障碍辅助** | 政务服务大厅导引、助老助残、药品配送 | 轮式人形、服务机器人 |\n| **生态环境与自然资源** | 自然保护区巡护、河湖水质监测、林火预警 | 无人机、四足机器狗 |\n\n浙江省应急管理厅已联合中控技术发布"危化巡检"具身智能应用场景；信通院报告指出，云深处绝影X30四足机器狗在浙江某换流站实现1000小时无故障电力巡检。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能应用场景拓展](http://finance.people.com.cn/n1/2025/1022/c1004-40587120.html)\n- [中国信通院蓝皮书（第三章：场景驱动下的产品谱系）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)' },
        { id: 6, title: '第5章：世界模型——一次关键跃迁', duration: '4分钟', type: 'video', content: '## 第 5 章｜视频讲解\n\n连贯镜头：机器人看到桌上的杯子 → 预演（半透明动画）：估算重量、判断表面材质 → 伸手抓取 → 成功拿起\n\n杯子换成不同材质/尺寸（玻璃杯→陶瓷杯→纸杯）；机器人自主调整力度和角度，全部成功。\n\n---PAGE---\n\n核心要点：\n\n- **世界模型** = 对物理环境的内在表征\n- 预测—执行—修正，形成经验闭环\n- 泛化与稳健，决定是否进得了真实场景\n- 世界模型赋能具身智能，走向自主的关键一跃' },
        { id: 7, title: '第6章：项目论证与评估方法', duration: '6分钟', type: 'mixed', content: '## 第 6 章·学习目标\n\n- 掌握"六问"论证清单，快速识别项目基本面\n- 学会使用加权评分表进行多项目比较\n- 理解"证据链"思维——避免仅凭厂商宣称做决策\n- 了解典型风险与对应治理对策\n\n---PAGE---\n\n## 第 6 章｜P1：论证清单——六问定基本面\n\n### 项目论证六问\n\n基于信通院对产业化挑战的分析和标准体系框架，机关干部在评估具身智能项目时，建议用以下六问逐一审视：\n\n| 序号 | 问题 | 判断要点 |\n|:---|:---|:---|\n| ① | 真实场景可得与权限合规？ | 能否进入真实作业环境？数据采集是否合规？ |\n| ② | 闭环是否完整？ | 世界模型/策略学习/安全围栏是否齐全？ |\n| ③ | 数据与仿真资源是否可持续？ | 训练数据从哪来？训练场/仿真平台是否到位？ |\n| ④ | 评估方案是否明确？ | 有可量化指标吗？有基线对比吗？ |\n| ⑤ | 安全与伦理如何落实？ | 对照标准体系6部分逐一检查 |\n| ⑥ | 经济与社会效益如何度量？ | 减少人力涉险次数？提升巡检覆盖率？缩短响应时间？ |\n\n信通院指出：具身智能处于发展早期，面临"数据—模型—本体—场景"难闭环的核心挑战。六问清单正是帮助机关干部识别"伪闭环"项目的工具。\n\n**权威阅读链接**：\n\n- [人民网教育·治理｜先立规后应用、指标先行导向](http://edu.people.com.cn/n1/2025/1120/c1006-40607831.html)' },
        { id: 8, title: '第7章："可解释、可评估、可监管"三要素', duration: '4分钟', type: 'video', content: '## 第 7 章｜视频讲解\n\n可解释示例：机器人完成任务后"决策路径"简报（为什么选择绕行而非等待？为什么力度为3N而非5N？）\n\n可评估示例：试点数据看板——成功率94.2%、MTTR 12min、安全事件0次\n\n可监管示例：权限分级界面（巡检员/管理员/审计员不同权限）、日志时间轴、安全围栏触发记录\n\n---PAGE---\n\n核心要点：\n\n- **具身智能治理三要素**：可解释、可评估、可监管\n- 可解释：决策过程留痕、可追溯\n- 可评估：指标先行、数据说话\n- 可监管：权限分级、日志不可篡改\n- 先治理后扩展，先试点再推广' },
        { id: 9, title: '第8章：组织一次本地化具身智能应用小调研', duration: '6分钟', type: 'mixed', content: '## 第 8 章·学习目标\n\n- 掌握一次小型调研的完整流程\n- 学会设计10题短问卷覆盖关键信息\n- 获得5页内评审材料的撰写模板\n- 了解如何将调研结果落地为试点建议\n\n---PAGE---\n\n## 第 8 章｜P1：调研目标与产出\n\n### 调研目标\n\n以本部门/园区/片区为范围，系统回答三个问题：\n\n1. 前3个可落地场景是什么？（按紧迫性×可行性排序）\n2. 每个场景的核心阻碍因素是什么？（技术？合规？成本？人员？）\n3. 如果启动一个试点，最小可行方案是什么？\n\n### 预期产出\n\n| 产出 | 内容 | 形式 |\n|:---|:---|:---|\n| **场景清单** | 场景名称、任务描述、环境复杂度、数据权限状态 | 一页表 |\n| **指标基线** | 当前人工模式的核心指标（覆盖率/响应时间/事故率等） | 数据表 |\n| **风险清单** | 安全、合规、技术三类风险及初步对策 | 风险矩阵 |\n| **试点建议** | 推荐场景、本体选型、时间表、预算概算（不涉及投资回报率） | 2页以内简报 |\n\n**方法参考链接**：\n\n- [信通院蓝皮书（产业生态与训练场评估）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)' },
      ],
      description: '2025年"具身智能"首次写入《政府工作报告》，2026年"十五五"规划纲要明确其为未来产业重点。本课程以"机制为轴、治理为尺、场景为落点"，通过前言+8章内容，帮助机关干部从零建立起对具身智能的系统认知和实操能力——不是为了追逐概念，而是为了判断项目、评估风险、制定规则、组织试点。',
      learningObjectives: [
        '准确理解具身智能的定义与核心三要素',
        '掌握五步闭环机制与五大关键技术',
        '了解四大政务应用场景与六项评估指标',
        '掌握项目论证六问与加权评分方法',
        '学会组织本地化调研与灰度试点',
      ],
    }
  },
];

export default function AICoursePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseTopic, setCourseTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(() => {
    const saved = localStorage.getItem('ai_generated_course');
    return !!saved;
  });
  const [generatedCourse, setGeneratedCourse] = useState<any>(() => {
    const saved = localStorage.getItem('ai_generated_course');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [editMode, setEditMode] = useState(false);
  const [editedChapters, setEditedChapters] = useState<any[]>([]);
  
  const [diagnosticData, setDiagnosticData] = useState<{ roles: string[]; topics: string[]; difficulty: string } | null>(() => {
    try {
      const saved = localStorage.getItem('user_diagnostic');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          roles: parsed.roles || [],
          topics: parsed.topics || [],
          difficulty: parsed.difficulty || 'intermediate',
        };
      }
    } catch {}
    return null;
  });
  
  const [generationLogic, setGenerationLogic] = useState<any>(null);

  const router = useRouter();
  const hasDiagnostic = diagnosticData && (diagnosticData.roles.length > 0 || diagnosticData.topics.length > 0);

  const thinkingSteps = useMemo(() => [
    { title: '读取知识图谱诊断结果', detail: `正在加载学习诊断数据...\n\n• 身份角色：${hasDiagnostic ? diagnosticData.roles.join('、') : '未检测'}\n• 学习主题：${hasDiagnostic ? diagnosticData.topics.join('、') : '未选择'}\n• 难度等级：${hasDiagnostic ? (diagnosticData.difficulty === 'beginner' ? '入门级' : diagnosticData.difficulty === 'intermediate' ? '进阶级' : '深入级') : '未设定'}` },
    { title: '分析课程需求与目标受众', detail: `基于具身智能专题分析：\n\n• 核心需求：机关干部对前沿技术的认知与治理能力\n• 知识缺口：具身智能从概念到国家战略的政策脉络、技术闭环机制、应用场景与项目论证\n• 受众定位：党政类在线学习平台成人用户（机关干部）\n• 课程深度：${hasDiagnostic ? (diagnosticData.difficulty === 'beginner' ? '入门级——侧重基础概念和认知框架' : diagnosticData.difficulty === 'intermediate' ? '进阶级——技术与治理并重' : '深入级——强化实操评估与调研方法') : '进阶级'}` },
    { title: '检索相关知识点与资料', detail: `检索资源包括：\n\n📚 知识库新增课程\n   • 具身智能引论（ID:3464，时长4.7分钟）\n   • 前沿技术系列课程\n\n📖 图书与期刊资源\n   • 《具身智能发展报告（2025年）》\n   • 《人形机器人与具身智能标准体系（2026版）》\n   • CEAI中国具身智能白皮书\n\n✏️ 试题库相关试题\n   • 具身智能概念辨析题\n   • 核心技术理解与应用题\n   • 政策与治理场景选择题\n\n🌐 权威网站检索\n   • 信通院官网（caict.ac.cn）\n   • 人民网科技频道\n   • 新华网"人工智能+"专题\n   • 共产党员网权威解读` },
    { title: '进行内容合规审核', detail: `三级合规校验：\n\n• 政治方向：确保与《二十大报告》原文一致，核心表述准确\n• 政策解读：对照最新政策文件版本（如2024年修订版《纪律处分条例》）\n• 敏感筛查：不涉及未公开文件，所有链接均为官方权威来源` },
    { title: '设计课程结构与章节安排', detail: `构建课程框架：\n\n• 章节结构：前言+5-8章（含核心概念、政策法规、实务操作、案例剖析等）\n• 章节时长：${hasDiagnostic ? (diagnosticData.difficulty === 'beginner' ? '入门级约50分钟' : diagnosticData.difficulty === 'intermediate' ? '进阶级约75分钟' : '深入级约100分钟') : '约75分钟'}\n• 学习目标：每章2-4条，可衡量\n• 互动设计：章节末尾设单选测试题` },
    { title: '生成课程内容与学习目标', detail: `AI撰写各章节：\n\n• 生成方式：大语言模型 + 知识图谱驱动\n• 每章结构：学习目标→知识点讲解→政策引用→实务指南→案例分析→权威链接\n• 输出格式：Markdown文档，支持编辑` },
    { title: '优化课程大纲与教学设计', detail: `教学化加工：\n\n• 复杂条文通俗化，添加"干部视角"解读\n• 选取与岗位角色相关的典型案例\n• 每章设置情境分析题，附详细解析\n• 根据内容密度校准时长` },
    { title: '课程生成完成', detail: `✅ 课程已全部生成！\n\n• 章节数：8章+前言\n• 预计时长：约40-50分钟\n• 内容来源：信通院具身智能发展报告、人形机器人与具身智能标准体系(2026版)、国务院发展研究中心报告等权威文献\n\n课程已保存，可随时查看或重新生成。` },
  ], [diagnosticData, hasDiagnostic]);

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const generateLogicExplanation = (topic: string, diagnostic: { roles: string[]; topics: string[]; difficulty: string } | null) => {
    const hasDiag = diagnostic && (diagnostic.roles.length > 0 || diagnostic.topics.length > 0);
    
    const roleInterpretation = hasDiag ? (
      diagnostic!.roles.length > 0 
        ? `根据您在学习诊断中选择的身份「${diagnostic!.roles.join('、')}」，系统判断您需要侧重${diagnostic!.roles.includes('党支部书记') || diagnostic!.roles.includes('党务工作者') ? '实务操作和基层党建方法' : '理论学习和思想武装'}方面的内容。`
        : '系统根据您的身份标签，判断了适合您的内容深度和学习方向。'
    ) : '由于暂未完成学习诊断，系统默认以中级难度和综合受众为标准生成课程。';

    const topicConnection = hasDiag ? (
      diagnostic!.topics.length > 0
        ? `您在学习诊断中感兴趣的主题「${diagnostic!.topics.join('、')}」与本课程内容高度关联。AI已将相关知识点融入章节设计中，确保内容与您的学习偏好相匹配。`
        : '系统根据课程主题自动匹配了相关知识模块。'
    ) : '系统根据课程主题自动匹配了相关知识模块。';

    const difficultyMatch = hasDiag ? (
      `您选择的难度等级「${diagnostic!.difficulty === 'beginner' ? '入门' : diagnostic!.difficulty === 'intermediate' ? '进阶' : '深入'}」决定了课程的深度和广度。AI已据此调整章节数量和理论深度。`
    ) : '系统默认以中级难度生成课程，包含适中的理论深度和实践内容。';

    const recommendation = hasDiag
      ? `综上，AI根据您完整的诊断画像（身份 + 主题偏好 + 难度等级），为您智能生成了这套课程。所有章节、时长、学习目标均经过个性化匹配，旨在最大化您的学习效率。`
      : `当前课程基于通用标准生成。建议前往引导页完成学习诊断，获取更精准的个性化课程推荐。`;

    return {
      roleInterpretation,
      topicConnection,
      difficultyMatch,
      recommendation,
      hasDiagnosis: hasDiag,
    };
  };

  useEffect(() => {
    if (generatedCourse) {
      localStorage.setItem('ai_generated_course', JSON.stringify(generatedCourse));
    }
  }, [generatedCourse]);

  useEffect(() => {
    const restoreState = () => {
      const saved = localStorage.getItem('ai_generated_course');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGeneratedCourse(parsed);
          setShowResult(true);
        } catch { /* ignore */ }
      }
    };
    restoreState();
    document.addEventListener('visibilitychange', restoreState);
    window.addEventListener('focus', restoreState);
    return () => {
      document.removeEventListener('visibilitychange', restoreState);
      window.removeEventListener('focus', restoreState);
    };
  }, []);

  const handlePresetClick = (plan: any) => {
    setCourseTopic(plan.name);
    handleGenerate(plan.data);
  };

  const handleGenerate = (presetData?: any) => {
    if (!courseTopic.trim() && !presetData) return;

    let currentDiagnostic: { roles: string[]; topics: string[]; difficulty: string } | null = null;
    try {
      const saved = localStorage.getItem('user_diagnostic');
      console.log('[课程生成] localStorage中的诊断数据:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        currentDiagnostic = {
          roles: parsed.roles || [],
          topics: parsed.topics || [],
          difficulty: parsed.difficulty || 'intermediate',
        };
        setDiagnosticData(currentDiagnostic);
        console.log('[课程生成] 诊断数据解析成功:', currentDiagnostic);
      } else {
        console.log('[课程生成] localStorage中没有诊断数据');
      }
    } catch (e) {
      console.error('[课程生成] 读取诊断数据失败:', e);
    }

    setIsGenerating(true);
    setCurrentStep(0);
    setShowResult(false);
    setGenerationLogic(null);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    setTimeout(() => {
      const topic = presetData ? presetData.courseName : courseTopic;
      const courseData = presetData || {
        courseName: `${courseTopic}专题课程`,
        courseType: '专题课程',
        totalHours: (Math.floor(Math.random() * 8) + 4) / 10,
        difficulty: '中级',
        targetAudience: '统战系统干部',
        chapters: generateChapters(courseTopic),
        description: `本课程围绕"${courseTopic}"主题，系统讲解相关理论知识和实践方法，帮助学员全面掌握核心要义，提升业务能力。`,
        learningObjectives: [
          `深刻理解${courseTopic}的核心内涵`,
          `掌握相关的政策要求和工作方法`,
          `提升解决实际问题的能力`,
          `推动工作创新发展`,
        ],
      };
      setGeneratedCourse(courseData);
      setEditedChapters([...courseData.chapters]);
      console.log('[课程生成] 生成逻辑说明使用的诊断数据:', currentDiagnostic);
      setGenerationLogic(generateLogicExplanation(topic, currentDiagnostic));
      setIsGenerating(false);
      setShowResult(true);
    }, 2500);
  };

  const generateChapters = (topic: string) => {
    const chapterTemplates = [
      {
        title: '课程概述与理论基础',
        content: `本课程围绕"${topic}"主题,从理论基础、制度设计、政策要求到实践操作进行全链条讲解。课程旨在帮助学员全面掌握核心要义,提升理论水平和实践能力。\n${topic}是新时代党的建设的重要组成部分,具有重要的理论意义和实践价值。通过系统学习,学员能够深刻理解其核心内涵,掌握相关政策要求和工作方法。\n课程涵盖理论渊源、实践基础、核心要义等内容,帮助学员全面把握这一专题的科学体系和理论框架。`
      },
      {
        title: '第1章：核心要义与科学体系',
        content: `深入学习${topic}的核心要义,理解其理论体系和实践要求。\n\n【理论内涵】${topic}具有深刻的理论内涵,是党的创新理论的重要组成部分。要从理论逻辑、历史逻辑、实践逻辑三个维度全面把握其科学体系。\n【核心要义】准确把握${topic}的核心要义,理解其时代价值和实践意义。要坚持理论联系实际,将学习成果转化为工作思路和举措。\n【实践要求】将${topic}作为指导思想和行动指南,运用其立场观点方法分析和解决实际问题,推动工作高质量发展。`
      },
      {
        title: '第2章：政策要求与制度设计',
        content: `系统学习${topic}的政策要求和制度设计,掌握相关工作规范。\n\n【政策要求】深入学习党中央关于${topic}的重要决策部署,理解政策背景和目标要求。要准确把握政策精神,确保工作方向正确。\n【制度设计】了解${topic}相关的制度安排,掌握工作程序和操作方法。要严格按照制度要求开展工作,确保工作规范有序。\n【实践应用】将政策要求与工作实际相结合,创造性地开展工作。要善于运用制度优势解决实际问题,提高工作效率和质量。`
      },
      {
        title: '第3章：实践方法与案例分析',
        content: `通过具体案例分析,学习${topic}的实践应用方法。\n\n【实践方法】掌握${topic}的工作方法和实践路径,提升解决实际问题的能力。要坚持问题导向,着力解决实际问题。\n【案例分析】通过典型案例学习,用身边事教育身边人,增强学习的针对性和实效性。案例涵盖成功经验做法,也有警示教训。\n【经验总结】总结提炼本地本部门的好经验好做法,形成可复制可推广的工作模式。要学习借鉴先进地区的成功经验,结合实际创新发展。`
      },
      {
        title: '第4章：工作创新与发展趋势',
        content: `深入把握${topic}的特点和规律,积极探索创新工作方式方法。\n\n【工作创新】创新${topic}的工作思路和方法,不断提高工作质量和水平。要与时俱进,适应新形势新任务新要求。\n【发展趋势】了解${topic}的最新发展动态,把握未来发展方向。要关注党中央的最新决策部署,及时学习最新政策要求。\n【能力提升】通过学习和实践,提升做好${topic}工作的能力水平。要加强理论学习,注重实践锻炼,不断总结经验、改进方法。`
      },
      {
        title: '总结思考与专题研讨',
        content: `总结课程学习收获,思考如何在实际工作中贯彻落实。\n\n【主要收获】\n1. 理论素养的提升：全面把握了${topic}的科学体系和核心要义。\n2. 政策理解的深化：深刻理解了相关政策要求和制度设计。\n3. 实践能力的增强：掌握了运用理论指导实践的方法。\n4. 创新意识的增强：学习了创新工作方式方法的思路和举措。\n\n【思考问题】\n1. 如何深刻理解${topic}的核心内涵和时代价值?\n2. 如何将理论学习成果转化为工作思路和举措?\n3. 如何创新工作方法,提高工作质量和水平?\n4. 如何在实际工作中贯彻落实相关政策要求?\n\n【结语】${topic}是新时代的重要课题,需要我们不断学习、不断探索、不断创新。我们要以习近平新时代中国特色社会主义思想为指导,深入学习贯彻相关理论方针政策,以高度的政治自觉做好各项工作,为全面建设社会主义现代化国家贡献力量！`
      }
    ];

    const chapterCount = Math.min(6, Math.max(4, Math.floor(topic.length / 5) + 3));
    
    return chapterTemplates.slice(0, chapterCount).map((template, i) => ({
      id: i + 1,
      title: template.title,
      duration: `${(Math.floor(Math.random() * 20) + 30) / 10}分钟`,
      type: i === chapterCount - 1 ? 'discussion' : 'video',
      content: template.content,
    }));
  };

  const handleChapterEdit = (index: number, field: string, value: any) => {
    const newChapters = [...editedChapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setEditedChapters(newChapters);
  };

  const handleAddChapter = () => {
    setEditedChapters([
      ...editedChapters,
      {
        id: editedChapters.length + 1,
        title: '新增章节',
        duration: '3分钟',
        type: 'video',
        content: '',
      },
    ]);
  };

  const handleDeleteChapter = (index: number) => {
    const newChapters = editedChapters.filter((_, i) => i !== index);
    setEditedChapters(newChapters);
  };

  const handleSave = () => {
    setGeneratedCourse({ ...generatedCourse, chapters: editedChapters });
    setEditMode(false);
  };

  const handleStartLearn = (chapterIdx: number) => {
    if (generatedCourse) {
      localStorage.setItem('current_ai_course', JSON.stringify(generatedCourse));
    }
    router.push(`/library/course-learn/1?chapter=${chapterIdx}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
      {/* 生成前区域：标题、输入、逻辑解读、生成步骤 */}
      {!showResult && (
        <>
      {/* 第一行：标题区 + 右侧生成逻辑解读 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 左侧：标题 + 输入 + 预设主题 */}
        <div className="lg:col-span-2 border-2 border-black bg-white p-8 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <h1 className="text-5xl font-black text-black mb-4 leading-none tracking-tighter" style={{ textShadow: '2px 2px 0 #e0e0e0' }}>
            AI智能生成课程
          </h1>
          <p className="text-base text-gray-600 mb-6 max-w-lg leading-relaxed">
            输入课程主题，AI自动设计课程结构、生成章节内容、匹配学习目标，让课程创作效率提升10倍。
          </p>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder=""
                className="pl-10 h-12 text-base border-2 border-black font-medium"
                style={{ borderRadius: '0' }}
                value={courseTopic}
                onChange={(e) => setCourseTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <Button
              className="h-12 px-8 bg-amber-400 hover:bg-amber-500 text-black font-bold border-2 border-black text-base"
              style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }}
              onClick={() => handleGenerate()}
              disabled={isGenerating || !courseTopic.trim()}
            >
              {isGenerating ? '生成中...' : '🚀 开始生成'}
            </Button>
          </div>

          <div className="mt-6 border-2 border-black bg-white p-5" style={{ boxShadow: '4px 4px 0 0 #000' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                <span className="text-white text-xs font-black">热</span>
              </div>
              <span className="font-bold text-black">热门预设主题</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetCourseTopics.map(plan => (
                <Button
                  key={plan.key}
                  className="px-5 py-2 border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-colors"
                  style={{
                    borderRadius: '0',
                    boxShadow: '2px 2px 0 0 #000',
                    backgroundColor: plan.key === 'xjp_thought' ? '#fbbf24' : plan.key === 'united_front' ? '#c084fc' : '#fb7185',
                  }}
                  onClick={() => handlePresetClick(plan)}
                  disabled={isGenerating}
                >
                  {plan.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：生成逻辑解读面板（常驻） */}
        <div className="border-2 border-black bg-white p-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-400 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <Lightbulb className="h-4 w-4 text-black" />
            </div>
            <span className="font-black text-sm text-black">本次生成逻辑解读</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border-2 border-black bg-red-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <div className="absolute -top-2.5 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5">身份匹配</div>
              <div className="mt-1">
                <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic?.roleInterpretation || '根据您的学习诊断身份，AI将匹配对应的课程内容侧重方向。'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border-2 border-black bg-purple-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <div className="absolute -top-2.5 left-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">主题关联</div>
              <div className="mt-1">
                <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic?.topicConnection || 'AI将根据您感兴趣的学习主题，自动关联知识图谱中相关知识点。'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border-2 border-black bg-amber-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <div className="absolute -top-2.5 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5">难度适配</div>
              <div className="mt-1">
                <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic?.difficultyMatch || 'AI将根据您选择的难度等级，调整课程的理论深度与章节数量。'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border-2 border-black bg-emerald-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <div className="absolute -top-2.5 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">综合推荐</div>
              <div className="mt-1">
                <div className="text-[12px] text-gray-800 leading-relaxed font-medium">{generationLogic?.recommendation || '请先完成学习诊断，或直接输入课程主题开始生成。'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：智能生成步骤（全宽） */}
      <div className="border-2 border-black bg-gradient-to-b from-indigo-700 to-indigo-900 p-6 text-white mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="text-6xl font-black text-amber-300" style={{ textShadow: '3px 3px 0 #000' }}>
            {isGenerating ? `${currentStep + 1}` : `${thinkingSteps.length}`}
          </div>
          <div>
            <div className="text-base font-black tracking-wide">大步骤智能生成</div>
            <div className="text-xs text-white/50">点击卡片查看详情</div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {thinkingSteps.slice(0, isGenerating ? currentStep + 1 : thinkingSteps.length).map((step, idx) => (
            <div
              key={idx}
              className={`border p-3 cursor-pointer select-none transition-all h-[72px] ${
                expandedStep === idx
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-white/20 bg-black/20 hover:bg-black/40'
              }`}
              onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
            >
              <div className="flex items-center gap-2 mb-1">
                {idx < currentStep || !isGenerating ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-300 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-amber-300 text-xs">●</span>
                )}
                <span className="text-xs font-bold text-amber-300/80">Step {idx + 1}</span>
              </div>
              <div className="text-[13px] font-semibold leading-snug truncate">{step.title}</div>
            </div>
          ))}
        </div>
        {expandedStep !== null && expandedStep < thinkingSteps.length && (
          <div className="mt-3 p-4 bg-black/40 border border-white/10 text-[13px] text-white/95 leading-relaxed whitespace-pre-line">
            <div className="text-xs font-bold text-amber-300 mb-2">
              {thinkingSteps[expandedStep].title}
            </div>
            {thinkingSteps[expandedStep].detail}
          </div>
        )}
        <div className="mt-4 text-[11px] text-white/40 border-t border-white/10 pt-3 font-medium text-center">
          基于大语言模型与知识图谱驱动 · 诊断 → 生成 → 优化的全链路智能化
        </div>
      </div>

      {/* AI思考过程（生成中显示） */}
      {isGenerating && (
        <div className="border-2 border-black bg-gray-900 p-5 mb-6 text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="animate-pulse text-2xl">🤖</span>
            <span className="font-bold text-amber-400">AI正在生成课程</span>
            <span className="text-xs text-gray-400 ml-auto">Step {currentStep + 1}/{thinkingSteps.length}</span>
          </div>
          <div className="space-y-1.5">
            {thinkingSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm pl-4 relative">
                {idx < currentStep ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 absolute left-0" />
                ) : idx === currentStep ? (
                  <span className="absolute left-0 animate-pulse text-amber-400">▶</span>
                ) : (
                  <span className="absolute left-0 text-gray-600">○</span>
                )}
                <span className={idx <= currentStep ? 'text-white' : 'text-gray-600'}>{step.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-purple-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / thinkingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
        </>
      )}

      {/* 生成结果 */}
      {showResult && generatedCourse && (
        <>
          <div className="overflow-x-visible -mx-4 px-4 py-2">
            {/* 课程简介卡片（全宽） */}
            <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                课程简介
              </div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="font-black text-3xl text-black">{generatedCourse.courseName}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  {editMode ? (
                    <>
                      <Button size="sm" variant="outline" className="border-2 border-black" style={{ borderRadius: '0' }} onClick={() => setEditMode(false)}>
                        取消
                      </Button>
                      <Button size="sm" className="bg-green-500 text-white font-bold border-2 border-black" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        保存
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="border-2 border-black font-bold" style={{ borderRadius: '0' }} onClick={() => setEditMode(true)}>
                      <Edit3 className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                  )}
                </div>
              </div>

              {/* 4个属性标签 */}
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { label: '课程类型', value: generatedCourse.courseType, color: 'bg-purple-500', icon: '📋' },
                  { label: '总学时', value: `${generatedCourse.totalHours}学时`, color: 'bg-amber-400', icon: '⏱' },
                  { label: '难度等级', value: generatedCourse.difficulty, color: 'bg-pink-500', icon: '📊' },
                  { label: '章节数', value: `${editMode ? editedChapters.length : generatedCourse.chapters.length}章`, color: 'bg-emerald-500', icon: '📑' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`${stat.color} border-2 border-black flex items-center gap-2 px-4 py-2 text-white`}
                    style={{ boxShadow: '3px 3px 0 0 #000' }}
                  >
                    <span className="text-base">{stat.icon}</span>
                    <span className="text-sm font-black">{stat.value}</span>
                    <span className="text-[10px] font-bold opacity-75 ml-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">{generatedCourse.description}</p>
              <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="text-sm font-bold text-black mb-2">学习目标</div>
                <ul className="space-y-1.5">
                  {generatedCourse.learningObjectives.map((obj: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 课程章节列表 */}
            <div className="border-2 border-black bg-white p-6 relative mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                课程章节
              </div>
              <div className="flex items-center justify-between mb-5 mt-2">
                <h3 className="font-black text-xl text-black">
                  共{editMode ? editedChapters.length : generatedCourse.chapters.length}章
                </h3>
                {editMode && (
                  <Button size="sm" className="bg-amber-400 text-black font-bold border-2 border-black" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={handleAddChapter}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加章节
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {(editMode ? editedChapters : generatedCourse.chapters).map((chapter: any, idx: number) => (
                  <div key={chapter.id} className="p-4 border-2 border-black bg-white relative" style={{ boxShadow: '3px 3px 0 0 #000' }}>
                    <div className="flex items-center gap-4">
                      {/* 彩色封面块 */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 flex items-center justify-center border-2 border-black font-black text-2xl text-white ${
                          idx % 5 === 0 ? 'bg-red-500' : idx % 5 === 1 ? 'bg-purple-600' : idx % 5 === 2 ? 'bg-amber-400 text-black' : idx % 5 === 3 ? 'bg-emerald-500' : 'bg-pink-500'
                        }`}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {editMode ? (
                          <div className="space-y-2">
                            <Input
                              value={chapter.title}
                              onChange={(e) => handleChapterEdit(idx, 'title', e.target.value)}
                              className="font-bold border-2 border-black"
                              style={{ borderRadius: '0' }}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={chapter.duration}
                                onChange={(e) => handleChapterEdit(idx, 'duration', e.target.value)}
                                className="w-32 text-sm border-2 border-black"
                                style={{ borderRadius: '0' }}
                                placeholder="学时"
                              />
                              <select
                                value={chapter.type}
                                onChange={(e) => handleChapterEdit(idx, 'type', e.target.value)}
                                className="border-2 border-black px-3 py-2 text-sm font-medium"
                                style={{ borderRadius: '0' }}
                              >
                                <option value="video">视频课</option>
                                <option value="discussion">研讨课</option>
                                <option value="mixed">图文课</option>
                              </select>
                            </div>
                            <textarea
                              value={chapter.content || ''}
                              onChange={(e) => handleChapterEdit(idx, 'content', e.target.value)}
                              className="w-full text-sm border-2 border-black p-3"
                              style={{ borderRadius: '0' }}
                              placeholder="输入章节内容..."
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-black text-base">{chapter.title}</div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-xs bg-gray-100 border border-black px-2 py-0.5 font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {chapter.duration}
                              </span>
                              <span className={`text-xs px-2 py-0.5 font-bold border border-black ${
                                chapter.type === 'video' ? 'bg-red-100' :
                                chapter.type === 'mixed' ? 'bg-blue-100' :
                                'bg-purple-100'
                              }`}>
                                {chapter.type === 'video' ? '🎬 视频课' : '📑 图文课'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {!editMode && (
                        <Button size="sm" className="bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={() => handleStartLearn(idx)}>
                          <Play className="h-4 w-4 mr-1" />
                          学习
                        </Button>
                      )}
                      {editMode && (
                        <Button
                          size="sm"
                          className="bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600"
                          style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }}
                          onClick={() => handleDeleteChapter(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {/* 章节内容预览 */}
                    {!editMode && chapter.content && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-bold text-gray-700">章节内容预览</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{
                          chapter.content
                            .replace(/##\s*第\s*\d+\s*章[·｜][^\n]+/g, '')
                            .replace(/---PAGE---/g, '')
                            .replace(/###\s+/g, '')
                            .replace(/\*\*/g, '')
                            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
                            .replace(/\n+/g, ' ')
                            .trim()
                            .substring(0, 200)
                        }</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="border-2 border-black bg-gray-900 p-5 flex items-center justify-between text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="text-sm">
                课程已生成：<span className="font-bold text-amber-400">{generatedCourse.courseName}</span> ·
                共<span className="font-bold text-amber-400">{editMode ? editedChapters.length : generatedCourse.chapters.length}</span>章节 ·
                <span className="font-bold text-amber-400">{generatedCourse.totalHours}</span>学时
              </div>
              <div className="flex gap-3">
                <Button size="lg" variant="outline" className="border-2 border-gray-400 text-gray-400 font-bold hover:bg-gray-400 hover:text-white" style={{ borderRadius: '0' }} onClick={() => {
                  setShowResult(false);
                  setGeneratedCourse(null);
                  localStorage.removeItem('ai_generated_course');
                  localStorage.removeItem('current_ai_course');
                  localStorage.removeItem('completed_slides_1');
                  localStorage.removeItem('slide_notes_1');
                  localStorage.removeItem('current_chapter_1');
                  localStorage.removeItem('current_slide_1');
                }}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  重新生成
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-amber-400 text-amber-400 font-bold hover:bg-amber-400 hover:text-black" style={{ borderRadius: '0' }}>
                  收藏课程
                </Button>
                <Button size="lg" className="bg-green-500 text-white font-bold border-2 border-black hover:bg-green-600" style={{ borderRadius: '0', boxShadow: '3px 3px 0 0 #000' }} onClick={() => {
                  if (generatedCourse) {
                    localStorage.setItem('current_ai_course', JSON.stringify(generatedCourse));
                    router.push('/library/course-learn/1');
                  }
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  确认创建并学习
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
