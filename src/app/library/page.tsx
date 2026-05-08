'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { 
  BookOpen, 
  Search,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  Filter,
  Video,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Lock,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Home,
  Eye,
  Edit3,
  Save,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// 课程分类
const categories = [
  { id: 'politics', name: '时政要闻', count: 12580, color: 'bg-red-600' },
  { id: 'party', name: '党史学习', count: 8960, color: 'bg-orange-500' },
  { id: 'theory', name: '理论学习', count: 4520, color: 'bg-amber-600' },
  { id: 'practice', name: '实务技能', count: 3280, color: 'bg-yellow-500' },
  { id: 'spirit', name: '会议精神', count: 2580, color: 'bg-green-600' },
  { id: 'ai-course', name: 'AI生成课程', count: '智能生成', color: 'bg-purple-600' },
];

// 课程列表
const courses = [
  {
    id: 1,
    title: '中国共产党纪律处分条例解读',
    category: '党史学习',
    chapterCount: 8,
    completedChapter: 2,
    totalDuration: '2小时30分',
    progress: 25,
    level: '必修',
    chapters: [
      { id: 1, title: '第1章：总则概述', duration: '15:00', isCompleted: true },
      { id: 2, title: '第2章：政治纪律', duration: '20:00', isCompleted: true },
      { id: 3, title: '第3章：组织纪律', duration: '18:00', isCompleted: false },
    ]
  },
  {
    id: 2,
    title: '习近平新时代中国特色社会主义思想概论',
    category: '理论学习',
    chapterCount: 12,
    completedChapter: 8,
    totalDuration: '4小时',
    progress: 67,
    level: '必修',
    chapters: [
      { id: 1, title: '第1章：思想概述', duration: '20:00', isCompleted: true },
      { id: 2, title: '第2章：十个明确', duration: '25:00', isCompleted: true },
    ]
  },
  {
    id: 3,
    title: '基层党建工作实务指南',
    category: '实务技能',
    chapterCount: 6,
    completedChapter: 0,
    totalDuration: '1小时45分',
    progress: 0,
    level: '选修',
    chapters: []
  },
  {
    id: 4,
    title: '2024年全国两会精神解读',
    category: '会议精神',
    chapterCount: 4,
    completedChapter: 4,
    totalDuration: '1小时20分',
    progress: 100,
    level: '热门',
    chapters: []
  },
];

// 精选内容
const featuredContents = [
  {
    id: 1,
    type: 'video',
    title: '3分钟读懂新质生产力',
    duration: '3:24',
    views: 12580,
  },
  {
    id: 2,
    type: 'image',
    title: '二十大报告金句摘录',
    duration: '停留阅读',
    views: 45600,
  },
  {
    id: 3,
    type: 'video',
    title: '四个意识 flashcard',
    duration: '5:00',
    views: 28900,
  },
];

export default function LibraryPage() {
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('ai_generated_course');
    return saved ? 'ai-course' : 'courses';
  });

  // 保存AI生成课程到localStorage
  useEffect(() => {
    if (generatedCourse) {
      localStorage.setItem('ai_generated_course', JSON.stringify(generatedCourse));
    }
  }, [generatedCourse]);

  // 页面重新激活时重新读取localStorage
  useEffect(() => {
    const restoreState = () => {
      const saved = localStorage.getItem('ai_generated_course');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGeneratedCourse(parsed);
          setShowResult(true);
          setActiveTab('ai-course');
        } catch { /* ignore */ }
      }
    };
    // 初始读取
    restoreState();
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', restoreState);
    // 监听窗口焦点
    window.addEventListener('focus', restoreState);
    return () => {
      document.removeEventListener('visibilitychange', restoreState);
      window.removeEventListener('focus', restoreState);
    };
  }, []);
  const [editMode, setEditMode] = useState(false);
  const [editedChapters, setEditedChapters] = useState<any[]>([]);
  // 诊断数据（组件挂载时同步读取localStorage）
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
  // 生成逻辑说明（动态）
  const [generationLogic, setGenerationLogic] = useState<any>(null);

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
          { id: 2, title: '第1章：什么是具身智能——从概念到国家战略', duration: '6分钟', type: 'mixed', content: '## 第 1 章·学习目标\n\n- 准确理解具身智能的定义与核心三要素\n- 区分"自动"与"自主"的本质差异\n- 掌握具身智能与"纯大模型""传统机器人"的关系\n- 了解我国将其纳入国家战略的背景与顶层设计\n\n---PAGE---\n\n## 第 1 章｜P1：从一句话定义开始\n\n### 什么是具身智能？\n\n有专家将具身智能概括为 **"有物理载体的智能体"** 。更精确地说，具身智能（Embodied Intelligence）是人工智能与机器人学交叉的前沿领域，强调智能体通过身体与环境的动态交互实现自主学习和进化，其核心在于将 **感知、行动与认知深度融合** 。\n\n通俗理解：\n\n- **传统人工智能**更像屏幕里的"参谋"——无论生成什么方案，始终停留在数字世界\n- **具身智能**是走进生产线的"智能工人"——把数字世界的算法变成物理世界的具体行动\n\n中国工程院院士蒋昌俊指出："我们希望能在真实物理世界中实现交互，这意味着要让人工智能拥有实体，让它们像人类一样具备感知、思考和行动能力。"\n\n**权威阅读链接**：\n\n- [人民网科普｜"具身智能"如何走向未来？](http://kpzg.people.com.cn/n1/2025/0306/c404214-40431999.html)\n- [人民日报｜首入《政府工作报告》，具身智能何以竞速未来](http://paper.people.com.cn/zgcsb/pc/content/202503/17/content_30062313.html)\n\n---PAGE---\n\n## 第 1 章｜P2：具身智能 ≠ "AI + 机器人"——核心三要素\n\n### 具身智能的三要素（信通院蓝皮书框架）\n\n中国信息通信研究院《具身智能发展报告（2025年）》将具身智能的核心三要素概括为：\n\n| 要素 | 内涵 | 政务理解 |\n|:---|:---|:---|\n| **具身本体** | 物理载体（人形机器人、四足机器狗、轮臂复合式、无人机、自动驾驶车辆等） | 具体形态依场景选定，不必拘泥"人形" |\n| **智能内核** | 依托大模型、世界模型与多模态技术，实现"认知—决策—行动"统一 | 判断项目的"智能真实性"而非花架子 |\n| **环境交互** | 以"第一人称视角"与现实物理世界动态交互和自适应学习 | 能否在真实复杂场景稳定作业是硬指标 |\n\n信通院指出：具身智能的核心在于构建一个**由数据驱动形成闭环的智能系统**，区别于传统"开环系统"需要注入人的知识经验和操作方式。\n\n国际电信联盟（ITU）已冻结的标准ITU-T F.748.66给出定义：具身智能指**与物理实体融合的人工智能，能够自主与物理世界交互并适应环境**，在传统AI基础上增加了认知、协作和学习三个主要功能。\n\n**权威阅读链接**：\n\n- [中国信通院《具身智能发展报告（2025年）》](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)\n\n---PAGE---\n\n## 第 1 章｜P3：不是什么——三个关键区分\n\n### 区分一：具身智能 ≠ 大模型\n\n以DeepSeek等为代表的国产大模型有强大的"大脑"，但没有"身体"——它们属于**"离身智能"**。具身智能需要一个能在物理世界中移动和操作的实体。\n\n### 区分二：具身智能 ≠ 传统机器人\n\n工厂里的传统机械臂虽然有"身体"，但只能靠人类预设指令完成简单重复任务，属于**"具身不智能"**。具身智能要求本体能"识变—应变—求变"——感知环境变化并自主调整行为。\n\n### 区分三：具身智能 ≠ 仅仅"人形机器人"\n\n人形机器人是具身智能的**重要载体之一**，但并非唯一。四足机器狗、轮臂复合式机器人、无人机、自动驾驶汽车等同样属于具身智能范畴。不同场景适配不同本体构型——政务场景采购不应盲目追求"人形"。\n\n**权威阅读链接**：\n\n- [共产党员网｜【新引擎向未来】具身智能大有可为](https://www.12371.cn/2026/01/01/VIDE1767253202680643.shtml)\n\n---PAGE---\n\n## 第 1 章｜P4：从实验室到国家战略——政策脉络\n\n### 关键政策节点\n\n| 时间 | 事件 | 意义 |\n|:---|:---|:---|\n| 2025年3月 | 首次写入《政府工作报告》，列入未来产业培育清单 | 进入国家战略话语 |\n| 2025年3月 | CEAI 2025发布"具身智能十五大重点方向"及白皮书 | 国内首次系统性梳理技术路线图 |\n| 2025年12月 | 工信部成立人形机器人与具身智能标准化技术委员会（HEIS） | 标准化治理"有庙有神" |\n| 2026年2月 | 首个国家级《人形机器人与具身智能标准体系（2026版）》发布 | 进入规范化发展新阶段 |\n| 2026年3月 | "十五五"规划纲要草案明确具身智能为未来产业重点 | 中长期战略定调 |\n\n### 为什么要关注？\n\n"十五五"规划建议明确提出推动具身智能成为**新的经济增长点**。据国务院发展研究中心报告，我国具身智能产业市场规模有望在2030年达4000亿元。同时，标准体系（2026版）已覆盖**基础共性、类脑与智算、肢体与部组件、整机与系统、应用、安全伦理**6个部分——这是机关干部参与治理的"制度抓手"。\n\n**权威阅读链接**：\n\n- [新华网｜首个人形机器人与具身智能标准体系发布](https://www.news.cn/tech/20260302/3d0ff411d1d94995b4f0277d29e58e19/c.html)\n- [新华网｜中国深化"人工智能+"打造增长新引擎](http://www.news.cn/liangzi/20260309/d030f708afa64de08f72833b03a88e0c/c.html)\n\n---PAGE---\n\n## 第 1 章｜P5：对干部的价值——三句话定位\n\n### 干部需要具身智能的三句话\n\n1. **研判**：看清这是一场由"感知→认知→决策→执行→反馈"闭环驱动的技术范式变革，而非单纯"换个更聪明的机器人"\n2. **论证**：以"闭环完整性+世界模型+安全围栏+评估方案"为硬门槛，判断项目是不是"真具身"\n3. **治理**：在标准体系（6部分）中找到自己的监管接口——无论是安全伦理、数据合规还是场景规范\n\n### 本章小测试（单选）\n\n**具身智能与"纯软件大模型"的本质区别是什么？**\n\n- A. 参数更多\n- B. 有"身体"并与物理世界交互 ✅\n- C. 语料更广\n- D. 训练更快' },
          { id: 3, title: '第2章：核心机制与关键技术', duration: '6分钟', type: 'mixed', content: '## 第 2 章·学习目标\n\n- 理解具身智能的完整技术闭环\n- 掌握从"规则驱动"到"模型驱动"的迁移逻辑\n- 认识世界模型在闭环中的关键地位\n- 了解核心术语体系，建立跨部门沟通的"通用语言"\n- 获得一套快速校验"真具身"项目的实用工具\n\n---PAGE---\n\n## 第 2 章｜P1：闭环——具身智能的第一性原理\n\n### 五步闭环\n\n具身智能的核心运行机制是一个**五步闭环**：\n\n**感知**（多模态传感器）→ **认知**（世界模型/大模型理解）→ **决策**（任务规划与推理）→ **执行**（本体运动与操作控制）→ **反馈**（环境响应/结果评估）\n\n### 为什么"云端聪明、落地失手"？\n\n传统大模型在数字空间表现惊艳，但一进入物理世界就频频出错。根本原因在于：\n\n1. **物理噪声**：光照变化、遮挡、摩擦力差异、传感器误差\n2. **长尾情境**：现实中的"corner case"远多于训练数据能覆盖的范围\n3. **域差（Sim2Real Gap）**：仿真环境与真实物理世界的差距导致模型迁移失败\n\n具身智能的闭环设计正是为了解决这些问题——通过**在线反馈**不断修正和适应。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能新浪潮与落地要点](http://finance.people.com.cn/n1/2025/1022/c1004-40587120.html)\n- [中国信通院蓝皮书（闭环系统图示）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)\n\n---PAGE---\n\n## 第 2 章｜P2：从"规则驱动"到"模型驱动"\n\n### 传统方式：规则/脚本驱动\n\n传统机器人依赖**人工编程**应对特定任务：工程师事先写好"如果A则B"的规则脚本。\n\n- 每换一个场景，就要重新编程\n- 无法应对环境中"没见过"的变化\n- 从"专才"走向"通才"极其困难\n\n### 新范式：模型驱动\n\n| 技术路径 | 说明 | 代表应用 |\n|:---|:---|:---|\n| **模块化分层** | 传统深度学习+机器人学习+人工编程组合 | 仓储搬运、舞蹈表演 |\n| **分层大模型** | LLM/VLM做"大脑"推理规划，调用API执行动作 | 谷歌Gemini Robotics、智源RoboBrain |\n| **端到端大模型（VLA）** | 视觉语言动作统一模型，输入指令直接输出动作 | Physical Intelligence π0、Figure Helix |\n| **世界模型** | 构建物理世界内在表征，预测—执行—修正 | 清华大学Ctrl-World、谷歌Genie |\n\n清华大学交叉信息研究院助理教授弋力指出，目标是从"专才"走向"通才"——机器人能在开放环境中执行开放任务。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身世界模型报道](http://finance.people.com.cn/n1/2025/1026/c1004-40589395.html)\n\n---PAGE---\n\n## 第 2 章｜P3：关键技术拼图——五块积木\n\n### 具身智能的五大关键技术\n\n| 技术 | 说明 | 政务场景关联 |\n|:---|:---|:---|\n| **多模态感知** | 视觉、触觉、力觉、听觉等多传感器融合 | 巡检中的异常识别精度 |\n| **模仿学习+强化学习** | 从人类示范或环境交互中学习技能 | 能否快速适配新任务 |\n| **世界模型** | 构建环境内在表征，预测物理行为后果 | 泛化性与稳健性底线 |\n| **运动与操作控制** | 移动底盘/机械臂/灵巧手的精确控制 | 实际作业的可靠性 |\n| **安全围栏+人机协作** | 碰撞避免、紧急制动、权限分级 | 公共场景部署的硬约束 |\n\n信通院指出：具身智能并非单一技术突破，而是一场由**技术、工程、场景与资本合力推动**的全球浪潮。\n\n**权威阅读链接**：\n\n- [智源社区｜术语与前沿论坛](https://hub.baai.ac.cn/view/28063)\n\n---PAGE---\n\n## 第 2 章｜P4：世界模型——让AI"理解"物理规律\n\n### 什么是世界模型？\n\n世界模型（World Model）是一种生成式AI系统，它从各种输入数据中**学习现实世界环境的内部表征**，包括物理特性、空间动态特性和因果关系。\n\n通俗理解：**世界模型是机器人脑中的"常识模拟器"**——拿起杯子之前，它就能"预演"：这个杯子多重？表面滑不滑？用什么力度合适？\n\n### 为什么世界模型是"关键一跃"？\n\n杨立昆（Yann LeCun）认为，机器人是否足够聪明甚至具备通用用途，**取决于能否在世界模型上取得重大进展**。\n\n信通院指出：端到端VLA尚未形成"感知—决策—执行"的完整闭环，**泛化性有限**——任何训练数据分布外的场景任务都会导致性能急剧下降。世界模型通过在"大脑"中构建物理模拟世界，进行行为推演和预测来优化行为策略，是弥补这一短板的核心方向。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身世界模型报道](http://finance.people.com.cn/n1/2025/1026/c1004-40589395.html)\n- [CEAI 2026世界模型论坛](https://ceai.caai.cn/static/upload/file/20260412/1775977669687642.pdf)\n\n---PAGE---\n\n## 第 2 章｜P5：现实挑战——三道坎\n\n### 挑战一：非结构化环境与长尾事件\n\n石油炼厂密集管廊、钢制格栅平台、狭窄通道——这些环境中存在大量"微小但致命"的障碍，机器人可能被卡住而无法脱困。长尾事件难以被训练数据覆盖。\n\n### 挑战二：仿真到现实的域差（Sim2Real Gap）\n\n仿真环境大量依赖理想化假设，难以对现实中的不确定性进行充分建模。真实环境中的摩擦力、光照、传感器噪声等问题导致模型迁移后性能"断崖式下跌"。\n\n### 挑战三：可解释与可验证难题\n\n具身智能核心依赖的人工智能技术具有**不可解释性**，在场景变化或执行泛化任务时存在失误甚至失控概率。在政务和公共安全场景中，这是不可接受的——必须有"可解释、可评估、可监管"三要素。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜产业侧共识：跑得快更要跑得稳](http://finance.people.com.cn/n1/2025/1015/c1004-40582220.html)\n\n---PAGE---\n\n## 第 2 章｜P6：术语对齐——干部工具箱\n\n### 核心术语体系\n\n| 术语 | 定义 | 来源 |\n|:---|:---|:---|\n| **具身智能** | 与物理实体融合的AI，自主交互与适应环境 | ITU-T F.748.66 |\n| **世界模型** | 对物理环境内在表征的学习系统，支持预测与推演 | 信通院/学界共识 |\n| **具身大模型/VLA** | 统一视觉、语言与动作的端到端基础模型 | 信通院报告 |\n| **Sim2Real** | 仿真环境训练→真实场景部署的迁移技术 | 信通院报告 |\n| **安全围栏** | 覆盖本体安全、交互安全与应用安全的防护体系 | 标准体系（2026版） |\n\n### 一张图识别"真具身"——五问快速校验\n\n1. **是否有真实物理本体？**（而非纯软件/屏幕演示）\n2. **是否有完整闭环？**（感知→认知→决策→执行→反馈缺一不可）\n3. **是否使用世界模型或策略学习？**（而非纯规则脚本）\n4. **是否有安全围栏？**（人/机安全隔离、紧急制动、权限分级）\n5. **是否有可评估方案？**（指标基线+评估方法+留痕机制）\n\n**术语参考链接**：\n\n- [智源社区术语与知识库](https://hub.baai.ac.cn/view/28063)\n- [标准体系全文（HEIS发布）](https://baike.baidu.com/item/%E4%BA%BA%E5%BD%A2%E6%9C%BA%E5%99%A8%E4%BA%BA%E4%B8%8E%E5%85%B7%E8%BA%AB%E6%99%BA%E8%83%BD%E6%A0%87%E5%87%86%E4%BD%93%E7%B3%BB%EF%BC%882026%E7%89%88%EF%BC%89/67431543)' },
          { id: 4, title: '第3章：1分钟看懂"自动"与"自主"的差别', duration: '4分钟', type: 'video', content: '## 第 3 章｜视频讲解\n\n分屏对比——同一"楼道消防巡检"任务。\n\n左侧自动模式：机器人按预设路线直行，撞到临时堆放的纸箱后停止——它只会"照章办事"。\n\n右侧自主模式：感知到纸箱障碍后绕行，继续巡检——它能"识变-应变-求变"。\n\n在"自主"一侧叠加五步闭环动画（感知→认知→决策→执行→反馈），每步高亮闪现。\n\n---PAGE---\n\n### 核心要点\n\n- **自动 ≠ 自主**\n- 自动按预设，自主能应变\n- 自主 = 感知—认知—决策—执行—反馈\n- 面向治理，必须可解释、可评估、可监管' },
          { id: 5, title: '第4章：面向公共治理的四大应用场景', duration: '6分钟', type: 'mixed', content: '## 第 4 章·学习目标\n\n- 了解具身智能在城运\n- 掌握从"场景识别"到"指标评估"的分析框架\n- 了解部署前必须完成的合规三件事\n\n---PAGE---\n\n## 第 4 章｜P1：场景总览——四大板块一张图\n\n### 四大政务应用场景\n\n基于信通院对行业应用的梳理及国内落地实践，具身智能在公共治理领域可聚焦四大板块：\n\n| 板块 | 代表性任务 | 本体形态 |\n|:---|:---|:---|\n| **城市运行与设施养护** | 道路/桥隧/管网巡检、微修复、公共空间保洁 | 四足机器狗、轮臂式机器人 |\n| **应急管理与安全生产** | 危化品巡检、灾害侦察、先期处置、消防辅助 | 防爆四足机器人、无人机 |\n| **民生服务与无障碍辅助** | 政务服务大厅导引、助老助残、药品配送 | 轮式人形、服务机器人 |\n| **生态环境与自然资源** | 自然保护区巡护、河湖水质监测、林火预警 | 无人机、四足机器狗 |\n\n浙江省应急管理厅已联合中控技术发布"危化巡检"具身智能应用场景；信通院报告指出，云深处绝影X30四足机器狗在浙江某换流站实现1000小时无故障电力巡检。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能应用场景拓展](http://finance.people.com.cn/n1/2025/1022/c1004-40587120.html)\n- [中国信通院蓝皮书（第三章：场景驱动下的产品谱系）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)\n\n---PAGE---\n\n## 第 4 章｜P2：场景深读（一）——城市运行与民生服务\n\n### 城运场景：从"看得见"到"做得好"\n\n传统安防摄像头只能"看见"异常，但无法处置。具身智能产品可以走得更远：\n\n- **巡检闭环**：搭载多模态传感器的机器人可自主开启柜门、读取仪表数据，通过触觉反馈识别设备异常振动\n- **微处置**：在管廊、配电室等环境中，机器人不仅巡检，还能完成简单的复位、清扫等微操作\n- **全天候**：7×24小时不间断自主巡逻，突破人力巡检的覆盖率瓶颈\n\n### 民生场景：走向"最后一米"\n\n2025年，"具身智能"已从工业场景走向更多生活场景：\n\n- **政务服务**：具身机器人在政务大厅提供引导、材料递送、多语种咨询\n- **助老助残**：中国移动建议加快家庭服务具身智能机器人研发与产业化；养老机构中已出现教老人跳舞、洗发、康复训练等初级应用\n- **智慧药房**：银河通用机器人可24小时完成取货、送货、补货任务\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能走向更多生活场景](http://finance.people.com.cn/n1/2025/1227/c1004-40633442.html)\n- [人民网经济·科技｜具身智能新浪潮与落地要点](http://finance.people.com.cn/n1/2025/1022/c1004-40587120.html)\n\n---PAGE---\n\n## 第 4 章｜P3：场景深读（二）——应急管理与生态保护\n\n### 应急场景：替代人工进入"不可达区域"\n\n具身智能在应急管理中的核心优势是"替人涉险"：\n\n- **危化巡检**：防爆四足机器人可在石油、化工等易燃易爆场景实现灵活作业，背部可加装轻型机械臂进行5kg级物品抓取转移\n- **消防救援**：云深处绝影X30与长沙市消防合作，代替指战员进入有毒、缺氧或浓烟等危险灾害事故现场进行侦察、探测和搜救\n- **电力抢修**：国家电网浙江电力公司试点"AR眼镜+数字孪生+智能体+远程辅助"模式，检修效率提升2倍以上，缺陷识别准确率升至98%\n\n### 生态场景：全时全域感知\n\n- **林火预警与巡护**：无人机具身智能实现自主导航与智能识别，覆盖人工巡护盲区\n- **河湖监测**：无人船搭载水质传感器、视觉系统，实现自主巡航与数据回传\n- **自然保护区**：四足机器狗可在复杂地形中实现长时间自主巡护\n\n**权威阅读链接**：\n\n- [人民网科普｜人形机器人半马倒逼"大脑"与安全机制提升](http://kpzg.people.com.cn/n1/2026/0420/c404214-40704544.html)\n- [赛迪顾问《具身智能赋能应急管理产业高质量发展研究》](https://www.ccidnet.com/u/cms/www/202603/09164948em32.pdf)\n\n---PAGE---\n\n## 第 4 章｜P4：从场景到指标——评估看板\n\n### 为什么需要指标体系？\n\n信通院强调：当前智能化评价体系尚未统一，不同企业和机构采用不同框架，难以形成行业共识。机关干部在论证和评估项目时，必须建立一套可操作、可量化的指标基线。\n\n### 六项核心评估指标\n\n| 指标 | 定义 | 数据来源 |\n|:---|:---|:---|\n| **任务成功率** | 规定条件下完成目标任务的比率 | 测试/试点运行日志 |\n| **平均恢复时间（MTTR）** | 故障发生后恢复至正常状态的平均时间 | 运维记录 |\n| **异常检测召回率/误报率** | 对真实异常的检出率与非异常的误判率 | 比对人工标注 |\n| **可解释性报告覆盖率** | 发生决策变化时能否生成可追溯的解释日志 | 系统功能检查 |\n| **触发安全围栏次数** | 作业期间安全机制被激活的频次与原因 | 安全日志 |\n| **合规审计通过率** | 数据使用、作业流程是否符合法规/标准 | 审计报告 |\n\n**权威阅读链接**：\n\n- [人民网教育·治理｜先立规后应用、指标先行导向](http://edu.people.com.cn/n1/2025/1120/c1006-40607831.html)\n\n---PAGE---\n\n## 第 4 章｜P5：部署前三件事——合规底线\n\n### 合规三件事\n\n在任何一个政务场景中部署具身智能产品前，必须完成三项合规准备：\n\n| 事项 | 内容 | 责任主体 |\n|:---|:---|:---|\n| **数据与场景权限** | 确认采集数据的合规边界（个人信息、涉密场所、生物特征等）；场景是否在授权范围内 | 数据管理/法务部门 |\n| **作业规范** | 建立人机隔离区、设定紧急制动机制、编写巡检/作业SOP | 业务部门+安全部门 |\n| **人员培训与问责界面** | 操作人员持证上岗、明确人机责任划分（留痕/日志/回放不可篡改） | 人事/培训部门 |\n\n《人形机器人与具身智能标准体系（2026版）》专设安全伦理板块，贯穿产业全生命周期，为技术演进和发展提供安全与合规保障。\n\n**权威阅读链接**：\n\n- [人民网经济·科技｜具身智能迈向标准引领新阶段](http://finance.people.com.cn/n1/2026/0322/c1004-40686329.html)\n- [CCTV报道｜标准体系如何助推产业规范化](https://news.cctv.com/2026/03/01/ARTIbXD8De5pudw4GuYxCo6S260301.shtml)' },
          { id: 6, title: '第5章：世界模型——一次关键跃迁', duration: '4分钟', type: 'video', content: '## 第 5 章｜视频讲解\n\n连贯镜头：机器人看到桌上的杯子 → 预演（半透明动画）：估算重量、判断表面材质 → 伸手抓取 → 成功拿起\n\n杯子换成不同材质/尺寸（玻璃杯→陶瓷杯→纸杯）；机器人自主调整力度和角度，全部成功。\n\n---PAGE---\n\n核心要点：\n\n- **世界模型** = 对物理环境的内在表征\n- 预测—执行—修正，形成经验闭环\n- 泛化与稳健，决定是否进得了真实场景\n- 世界模型赋能具身智能，走向自主的关键一跃' },
          { id: 7, title: '第6章：项目论证与评估方法', duration: '6分钟', type: 'mixed', content: '## 第 6 章·学习目标\n\n- 掌握"六问"论证清单，快速识别项目基本面\n- 学会使用加权评分表进行多项目比较\n- 理解"证据链"思维——避免仅凭厂商宣称做决策\n- 了解典型风险与对应治理对策\n\n---PAGE---\n\n## 第 6 章｜P1：论证清单——六问定基本面\n\n### 项目论证六问\n\n基于信通院对产业化挑战的分析和标准体系框架，机关干部在评估具身智能项目时，建议用以下六问逐一审视：\n\n| 序号 | 问题 | 判断要点 |\n|:---|:---|:---|\n| ① | 真实场景可得与权限合规？ | 能否进入真实作业环境？数据采集是否合规？ |\n| ② | 闭环是否完整？ | 世界模型/策略学习/安全围栏是否齐全？ |\n| ③ | 数据与仿真资源是否可持续？ | 训练数据从哪来？训练场/仿真平台是否到位？ |\n| ④ | 评估方案是否明确？ | 有可量化指标吗？有基线对比吗？ |\n| ⑤ | 安全与伦理如何落实？ | 对照标准体系6部分逐一检查 |\n| ⑥ | 经济与社会效益如何度量？ | 减少人力涉险次数？提升巡检覆盖率？缩短响应时间？ |\n\n信通院指出：具身智能处于发展早期，面临"数据—模型—本体—场景"难闭环的核心挑战。六问清单正是帮助机关干部识别"伪闭环"项目的工具。\n\n**权威阅读链接**：\n\n- [人民网教育·治理｜先立规后应用、指标先行导向](http://edu.people.com.cn/n1/2025/1120/c1006-40607831.html)\n\n---PAGE---\n\n## 第 6 章｜P2：加权评分表——量化比选\n\n### 六维评分模型\n\n| 维度 | 权重 | 1分 | 5分 |\n|:---|:---|:---|:---|\n| **机制完整性** | 25% | 仅规则脚本 | 完整闭环+世界模型 |\n| **场景价值** | 20% | 演示级 | 解决核心痛点 |\n| **安全与伦理** | 20% | 无方案 | 对标标准体系全达标 |\n| **可评估性** | 15% | 无指标 | 有基线+可回溯 |\n| **数据/仿真资源** | 10% | 无数据源 | 数据可共享可复用 |\n| **组织就绪度** | 10% | 无运维人员 | 有专职团队+预案 |\n\n综合得分 = Σ（维度得分 × 权重），满分5分。建议设定部门内部的最低核准线（如3.5分）。\n\n---PAGE---\n\n## 第 6 章｜P3：证据链——不要只听厂商说\n\n### 证据链思维\n\n全国政协常委、中国科学院院士谭铁牛强调，"推动我国具身智能的快速发展，需要在战略规划、学科融合、国际合作、人才培养等方面采取多层次的措施"。这提示机关干部：不能仅凭单一厂商的宣传材料做判断，必须多源交叉验证。\n\n| 证据类型 | 权重建议 |\n|:---|:---|\n| **国家级/行业级标准** | ★★★★★ |\n| **学会白皮书** | ★★★★ |\n| **权威媒体深度报道** | ★★★ |\n| **学术论文/会议** | ★★★ |\n| **厂商自述** | ★（需交叉验证） |\n\n**权威阅读链接**：\n\n- [CEAI白皮书（2026修订版）](https://ceai.caai.cn/static/upload/file/20260412/1775977669687642.pdf)\n- [CEAI大会官网](https://ceai.caai.cn/)\n\n---PAGE---\n\n## 第 6 章｜P4：风险—对策矩阵\n\n### 五大典型风险与治理对策\n\n| 风险 | 表现 | 治理对策 |\n|:---|:---|:---|\n| **域外迁移失败** | 仿真中表现优异，真实场景中"断崖式"失败 | 灰度试点、沙盒测试、分阶段验收 |\n| **长尾安全** | 遇到训练数据中未覆盖的情境时失控 | 安全围栏+冗余设计+人工应急接管机制 |\n| **不可解释** | AI决策过程"黑箱"，事故后无法追溯 | 可解释性报告+决策日志+回放能力 |\n| **责任界面不清** | 人机协作中事故归责困难 | 明确人机责任划分、日志不可篡改 |\n| **数据隐私** | 传感器收集个人信息、环境数据 | 数据分级分类、最小必要原则、合规审查 |\n\n信通院专设"安全问题"章节指出：宾夕法尼亚大学已成功在宇树GO2等三类机器人系统上实现"越狱"，操控机器人执行危险任务。这警示我们：安全治理不是可选项，而是前置条件。\n\n**权威阅读链接**：\n\n- [人民网科普｜标准体系发布](http://kpzg.people.com.cn/n1/2026/0303/c404214-40673359.html)\n- [人民网经济·科技｜标准引领新阶段](http://finance.people.com.cn/n1/2026/0322/c1004-40686329.html)\n- [人民网时评｜以未来产业塑造产业未来](http://opinion-app.people.cn/n1/2025/0611/c1003-40498051.html)' },
          { id: 8, title: '第7章："可解释、可评估、可监管"三要素', duration: '4分钟', type: 'video', content: '## 第 7 章｜视频讲解\n\n可解释示例：机器人完成任务后"决策路径"简报（为什么选择绕行而非等待？为什么力度为3N而非5N？）\n\n可评估示例：试点数据看板——成功率94.2%、MTTR 12min、安全事件0次\n\n可监管示例：权限分级界面（巡检员/管理员/审计员不同权限）、日志时间轴、安全围栏触发记录\n\n---PAGE---\n\n核心要点：\n\n- **具身智能治理三要素**：可解释、可评估、可监管\n- 可解释：决策过程留痕、可追溯\n- 可评估：指标先行、数据说话\n- 可监管：权限分级、日志不可篡改\n- 先治理后扩展，先试点再推广' },
          { id: 9, title: '第8章：组织一次本地化具身智能应用小调研', duration: '6分钟', type: 'mixed', content: '## 第 8 章·学习目标\n\n- 掌握一次小型调研的完整流程\n- 学会设计10题短问卷覆盖关键信息\n- 获得5页内评审材料的撰写模板\n- 了解如何将调研结果落地为试点建议\n\n---PAGE---\n\n## 第 8 章｜P1：调研目标与产出\n\n### 调研目标\n\n以本部门/园区/片区为范围，系统回答三个问题：\n\n1. 前3个可落地场景是什么？（按紧迫性×可行性排序）\n2. 每个场景的核心阻碍因素是什么？（技术？合规？成本？人员？）\n3. 如果启动一个试点，最小可行方案是什么？\n\n### 预期产出\n\n| 产出 | 内容 | 形式 |\n|:---|:---|:---|\n| **场景清单** | 场景名称、任务描述、环境复杂度、数据权限状态 | 一页表 |\n| **指标基线** | 当前人工模式的核心指标（覆盖率/响应时间/事故率等） | 数据表 |\n| **风险清单** | 安全、合规、技术三类风险及初步对策 | 风险矩阵 |\n| **试点建议** | 推荐场景、本体选型、时间表、预算概算（不涉及投资回报率） | 2页以内简报 |\n\n**方法参考链接**：\n\n- [信通院蓝皮书（产业生态与训练场评估）](http://www.caict.ac.cn/kxyj/qwfb/bps/202601/P020260130541978285206.pdf)\n\n---PAGE---\n\n## 第 8 章｜P2：样本与方法\n\n### 受访对象\n\n为获得立体信息，建议从四个角色维度选取受访对象：\n\n| 角色 | 人数 | 关注维度 |\n|:---|:---|:---|\n| **一线业务人员** | 3–5人 | 实际痛点、任务流程、环境约束 |\n| **信息/设备运维人员** | 2–3人 | 现有系统接口、数据格式、运维能力 |\n| **安全/法务人员** | 1–2人 | 合规边界、应急预案要求 |\n| **部门分管领导** | 1–2人 | 战略优先级、资源协调意愿 |\n\n### 调研方法\n\n1. **半结构访谈**（每人30–45分钟）：围绕"痛点—现状—期望—顾虑"四个核心问题展开\n2. **10题短问卷**：覆盖关键变量，便于量化比较\n3. **现场观察与录像留痕**（若条件允许）：记录当前作业环境、空间布局、潜在障碍\n\n---PAGE---\n\n## 第 8 章｜P3：10题短问卷\n\n### 问卷设计（10–15分钟内完成）\n\n1. 您所在岗位的日常任务中，哪些属于高危/高频/高重复类型？（请列举前3）\n2. 这些任务需要何种交互能力？（多选：移动/操作/社交交互/环境感知）\n3. 现场环境和作业数据是否可以采集？有哪些合规限制？\n4. 当前流程的主要痛点是什么？过去一年出现过几次重大失误？\n5. 如果引入具身智能，您认为"成功"的判断标准是什么？（请给出1–3个可量化指标）\n6. 现场有哪些安全约束？（人机隔离/应急停机位置/危险区域标识）\n7. 现有系统是否具备日志记录和回放能力？数据留存周期是多久？\n8. 本部门是否具备运维智能设备的人员储备？需要哪些培训？\n9. 如果开展试点，您认为合适的范围和灰度策略是什么？（范围/时长/验收标准）\n10. 您对引入具身智能最大的顾虑是什么？（安全/成本/效果/责任/其他）\n\n---PAGE---\n\n## 第 8 章｜P4：5页内评审材料模板\n\n### 推荐框架\n\n| 页码 | 内容 |\n|:---|:---|\n| **P1** | 背景与目标：国家政策导向（引用标准体系/十五五规划）+ 本部门现状与需求 |\n| **P2** | 场景分析：3个候选场景对比（场景描述、痛点、可行性、紧迫性排序） |\n| **P3** | 预期价值：社会效益（非经济）度量——减少涉险人次/提升覆盖率/缩短响应时间 |\n| **P4** | 风险评估与对策：五大风险维度评估+每项的对冲措施 |\n| **P5** | 试点路线图：时间表（3/6/12月里程碑）、责任主体、验收标准 |\n\n### 评审材料写作原则\n\n- **用数据代替形容词**："显著提升"不如"巡检覆盖率从60%提升至95%"\n- **对标国家标准**：直接引用标准体系条款号，增强说服力\n- **风险透明化**：坦诚列出"可能失败的情境"，比一味承诺更显专业\n\n---PAGE---\n\n## 第 8 章｜P5：从调研到试点——行动清单\n\n### 调研后的标准动作\n\n| 步骤 | 动作 | 时间建议 |\n|:---|:---|:---|\n| ① | 调研报告撰写：按上述5页模板完成 | 调研结束后2周内 |\n| ② | 内部汇报：向分管领导/决策层汇报，获取试点授权 | 报告完成后1周内 |\n| ③ | 供应商初筛：依据第6章六问清单筛选2–3家符合条件的企业 | 并行开展 |\n| ④ | 小范围灰度试点：选1个场景、1个月周期、明确验收标准 | 授权后启动 |\n| ⑤ | 试点评估与复盘：用第4章六项指标评估，决定是否扩展 | 试点结束后2周内 |\n\n### 本章结语\n\n具身智能的政务应用不是"买一个机器人"那么简单，而是一个涉及机制验证、场景适配、安全合规、人员培训的系统工程。通过一次规范的本地化调研，你不仅能为决策提供依据，也能在实践中学到"如何识别真具身、如何评估项目、如何治理风险"——这正是本课程希望赋予你的核心能力。' },
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

  // 根据诊断结果动态生成课程生成逻辑说明
  const generateLogicExplanation = (topic: string, diagnostic: { roles: string[]; topics: string[]; difficulty: string } | null) => {
    const hasDiag = diagnostic && (diagnostic.roles.length > 0 || diagnostic.topics.length > 0);
    
    // 角色解读
    const roleInterpretation = hasDiag ? (
      diagnostic!.roles.length > 0 
        ? `根据您在学习诊断中选择的身份「${diagnostic!.roles.join('、')}」，系统判断您需要侧重${diagnostic!.roles.includes('党支部书记') || diagnostic!.roles.includes('党务工作者') ? '实务操作和基层党建方法' : '理论学习和思想武装'}方面的内容。`
        : '系统根据您的身份标签，判断了适合您的内容深度和学习方向。'
    ) : '由于暂未完成学习诊断，系统默认以中级难度和综合受众为标准生成课程。';

    // 主题关联解读
    const topicConnection = hasDiag ? (
      diagnostic!.topics.length > 0
        ? `您在学习诊断中感兴趣的主题「${diagnostic!.topics.join('、')}」与本课程内容高度关联。AI已将相关知识点融入章节设计中，确保内容与您的学习偏好相匹配。`
        : '系统根据课程主题自动匹配了相关知识模块。'
    ) : '系统根据课程主题自动匹配了相关知识模块。';

    // 难度匹配解读
    const difficultyMatch = hasDiag ? (
      `您选择的难度等级「${diagnostic!.difficulty === 'beginner' ? '入门' : diagnostic!.difficulty === 'intermediate' ? '进阶' : '深入'}」决定了课程的深度和广度。AI已据此调整章节数量和理论深度。`
    ) : '系统默认以中级难度生成课程，包含适中的理论深度和实践内容。';

    // 综合推荐逻辑
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

  const handlePresetClick = (plan: any) => {
    setCourseTopic(plan.name);
    handleGenerate(plan.data);
  };

  const handleGenerate = (presetData?: any) => {
    if (!courseTopic.trim() && !presetData) return;

    // 读取诊断数据（同步读取，确保在生成逻辑中使用最新数据）
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
      // 使用局部变量currentDiagnostic，而不是状态变量diagnosticData（setState是异步的）
      console.log('[课程生成] 生成逻辑说明使用的诊断数据:', currentDiagnostic);
      setGenerationLogic(generateLogicExplanation(topic, currentDiagnostic));
      setIsGenerating(false);
      setShowResult(true);
    }, 2500);
  };

  const generateChapters = (topic: string) => {
    // 生成丰富的章节内容,而不是简单的占位文本
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

    // 根据主题选择合适的章节数量
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

  // 进入课程学习
  const handleStartLearn = (chapterIdx: number) => {
    // 保存当前课程到localStorage供学习页使用
    if (generatedCourse) {
      localStorage.setItem('current_ai_course', JSON.stringify(generatedCourse));
    }
    router.push(`/library/course-learn/1?chapter=${chapterIdx}`);
  };

  return (
      <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">

          {/* 系统课程 */}
          <TabsContent value="courses">
            {/* 分类浏览 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">分类浏览</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.filter(cat => cat.id !== 'ai-course').map((cat) => (
                  <Link key={cat.id} href={`/?channel=${cat.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-red-100 hover:border-red-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {typeof cat.count === 'number' ? `${cat.count.toLocaleString()} 课程` : cat.count}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* 我的课程 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的课程</h2>
                <Button variant="ghost" size="sm">
                  查看全部
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border-red-100">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* 封面 */}
                        <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0">
                          {course.level === '必修' && (
                            <Badge className="absolute -top-2 -left-2 bg-red-600 text-xs">必修</Badge>
                          )}
                          <Play className="h-8 w-8 text-white/80" />
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{course.category}</Badge>
                            {course.level === '热门' && (
                              <Badge className="text-xs bg-amber-100 text-amber-700">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                热门
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.chapterCount}章 · {course.totalDuration}
                          </p>
                          
                          {/* 进度 */}
                          {course.progress > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">学习进度</span>
                                <span className="text-red-600">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 章节列表 */}
                      {course.progress > 0 && course.chapters.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          {course.chapters.map((chapter, idx) => (
                            <div key={chapter.id} className="flex items-center gap-2 text-sm">
                              {chapter.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={chapter.isCompleted ? 'text-muted-foreground' : ''}>
                                {chapter.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button size="sm" className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-500">
                        {course.progress > 0 ? '继续学习' : '开始学习'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 微课速学 */}
          <TabsContent value="micro">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredContents.map((content) => (
                <Card key={content.id} className="border-red-100 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center relative">
                    {content.type === 'video' && (
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    )}
                    {content.type === 'image' && (
                      <ImageIcon className="h-12 w-12 text-white/80" />
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                      {content.duration}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{content.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Eye className="h-3 w-3 inline mr-1" />
                      {content.views >= 1000 ? `${(content.views/1000).toFixed(1)}k` : content.views}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 金句收藏 */}
          <TabsContent value="quotes">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6">
                    <Lightbulb className="h-6 w-6 text-amber-500 mb-3" />
                    <blockquote className="text-sm italic text-gray-700 mb-3">
                      "奋斗是青春最亮丽的底色，行动是青年最有效的磨砺。有责任有担当，青春才会闪光。"
                    </blockquote>
                    <p className="text-xs text-muted-foreground">—— 习近平</p>
                    <Button variant="ghost" size="sm" className="mt-3 w-full text-amber-700">
                      <Star className="h-4 w-4 mr-1" />
                      收藏金句
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI生成课程 */}
          <TabsContent value="ai-course">
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
                {/* 输入区 */}
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

                {/* 预设主题 - 标签式按钮 */}
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



            {/* 生成结果 */}
            {showResult && generatedCourse && (
              <>
                {/* 宽大画布容器 */}
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
                    03 · 课程章节
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
                          {/* 彩色封面块 + 编号角标 */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-14 h-14 flex items-center justify-center border-2 border-black font-black text-2xl text-white ${
                              idx % 5 === 0 ? 'bg-red-500' : idx % 5 === 1 ? 'bg-purple-600' : idx % 5 === 2 ? 'bg-amber-400 text-black' : idx % 5 === 3 ? 'bg-emerald-500' : 'bg-pink-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                              {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
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
                      setActiveTab('courses');
                      localStorage.removeItem('ai_generated_course');
                      localStorage.removeItem('current_ai_course');
                      // 清除学习进度（重新生成课程内容不同，旧进度无效）
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
          </TabsContent>
        </Tabs>
      </div>
  );
}
