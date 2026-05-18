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
  {
    key: 'rural_revitalization',
    name: '乡村振兴基础与政务应用',
    data: {
      courseName: '乡村振兴基础与政务应用——从战略理解到落地调研',
      courseType: '政策实践',
      totalHours: 0.8,
      difficulty: '中级',
      targetAudience: '党政类在线学习平台成人用户（机关干部）',
      chapters: [
        { id: 1, title: '前言：为什么机关干部要深刻理解乡村振兴？', duration: '6分钟', type: 'mixed', content: '党的十九大首次提出实施乡村振兴战略，党的二十大进一步强调全面推进乡村振兴，提出加快建设农业强国。2025年中央农村工作会议明确提出"学习运用千万工程经验，集中力量抓好办成一批群众可感可及的实事"。\n\n这意味着乡村振兴已从顶层设计进入系统推进、精准落地的关键阶段。据山东省等地实践经验，通过党员培训课程的分级开发与分类授课，成功将理论知识与实际操作相结合，为乡村振兴提供了强大的人才支撑。\n\n作为机关干部，无论从事政策研究、基层治理、产业发展、民生服务，还是统战与组织工作，都需要对此建立**可操作的理解框架**——不是为了堆砌术语，而是为了**识别痛点、设计方案、统筹资源、评估成效**。\n\n本课程以"战略为纲、案例为镜、项目为尺"展开，通过8章内容，帮助你从零建立起对乡村振兴的系统认知和实操能力。' },
        { id: 2, title: '第1章：什么是乡村振兴——从概念到国家战略', duration: '6分钟', type: 'mixed', content: '## 第 1 章·学习目标\n\n- 准确理解乡村振兴的定义与核心"二十字方针"\n- 区分"扶贫"与"振兴"的本质差异\n- 掌握乡村振兴与新型城镇化、农业农村现代化的关系\n- 了解我国将其纳入国家战略的背景与顶层设计\n\n---PAGE---\n\n## 第 1 章｜P1：从一句话定义开始\n\n### 什么是乡村振兴？\n\n乡村振兴战略是党的十九大提出的一项重大战略，旨在全面实现农村经济、社会、生态、文化等多个方面的全面发展与进步。其核心目标可以概括为"二十字方针"：\n\n> **产业兴旺、生态宜居、乡风文明、治理有效、生活富裕**\n\n通俗理解：\n\n- **脱贫攻坚** 解决的是"有没有"的问题——让贫困人口摆脱绝对贫困\n- **乡村振兴** 解决的是"好不好"的问题——让乡村成为安居乐业的美好家园\n\n习近平总书记强调："乡村振兴是包括产业振兴、人才振兴、文化振兴、生态振兴、组织振兴的全面振兴。"\n\n**权威阅读链接**：\n\n- [共产党员网｜乡村振兴战略专题](https://www.12371.cn/special/xczx/)\n- [共产党员网｜思想解析学习平台](https://www.12371.cn/special/xxzd/ws/)\n\n---PAGE---\n\n## 第 1 章｜P2：乡村振兴 ≠ "农村建设"——核心四维度\n\n### 乡村振兴的四维内涵\n\n| 维度 | 内涵 | 政务理解 |\n|:---|:---|:---|\n| **经济振兴** | 增加农民收入、发展现代农业、优化产业结构、促进农村经济多元化 | 产业是根基，没有产业支撑的振兴不可持续 |\n| **社会进步** | 改善农村公共服务，提升农民生活质量，加强农村社会治理 | 教育、医疗、养老等短板需要制度性补齐 |\n| **生态优化** | 保护和改善农村生态环境，推广绿色生产方式，实现可持续发展 | "绿水青山就是金山银山"的落地检验 |\n| **文化繁荣** | 传承与发展农村优秀传统文化，提升农民精神文化生活 | 文化是乡村的灵魂，不能"富了口袋穷了脑袋" |\n\n乡村振兴是一个**全方位、多领域的系统工程**，涵盖经济、社会、生态、文化等各个方面，需要长期规划和持续努力，强调渐进式发展而非急功近利。\n\n**权威阅读链接**：\n\n- [共产党员网｜乡村振兴战略专题](https://www.12371.cn/special/xczx/)\n\n---PAGE---\n\n## 第 1 章｜P3：不是什么——三个关键区分\n\n### 区分一：乡村振兴 ≠ 仅靠财政补贴\n\n单纯依赖转移支付和补贴无法实现长效振兴。乡村振兴的核心在于**增强乡村内生发展动力**——通过产业培育、人才回流、制度改革激发乡村自我发展能力。\n\n### 区分二：乡村振兴 ≠ 城镇化翻版\n\n"乡村振兴不是要把乡村变成城市，而是要让乡村成为乡村。"城乡融合发展的要义在于**各美其美**——城市有城市的繁华，乡村有乡村的特色。不能以城市化标准简单套用到乡村建设。\n\n### 区分三：乡村振兴 ≠ 仅仅"搞农业"\n\n产业兴旺不仅指传统种植养殖，还包括农产品深加工、乡村旅游、农村电商、文创产业等多元化发展路径。山东省潍坊市寒亭区一空桥村通过村党支部领办合作社种植优质强筋麦1万多亩，村集体分红过百万元，正是多元化思维的典型案例。\n\n**权威阅读链接**：\n\n- [共产党员网｜党旗在基层一线高高飘扬系列报道](https://www.12371.cn/2026/01/14/ARTI1768358145401195.shtml)\n\n---PAGE---\n\n## 第 1 章｜P4：从顶层设计到基层实践——政策脉络\n\n### 关键政策节点\n\n| 时间 | 事件 | 意义 |\n|:---|:---|:---|\n| 2017年10月 | 党的十九大首次提出实施乡村振兴战略 | 进入国家战略话语 |\n| 2018年 | 中央一号文件《关于实施乡村振兴战略的意见》发布，提出"二十字方针" | 战略框架确立 |\n| 2020年 | 脱贫攻坚战取得全面胜利，乡村振兴进入全面推进阶段 | 从"脱贫"到"振兴"的战略转段 |\n| 2022年 | 党的二十大强调全面推进乡村振兴，加快建设农业强国 | 战略定位进一步升级 |\n| 2025年 | 中央农村工作会议强调学习运用"千万工程"经验 | 进入系统推进、精准落地阶段 |\n\n山东省通过"省级抓统筹、市县分领域、乡镇强实践"的三级课程开发体系，实现了课程供给与层级需求精准匹配——这正是机关干部参与乡村振兴治理的"能力基建"。\n\n**权威阅读链接**：\n\n- [共产党员网｜山东省党员培训课程经验报道](https://www.12371.cn/2026/01/14/ARTI1768358145401195.shtml)' },
        { id: 3, title: '第2章：核心机制与关键路径', duration: '6分钟', type: 'mixed', content: '## 第 2 章·学习目标\n\n- 理解乡村振兴"五位一体"的完整推进框架\n- 掌握从"输血"到"造血"的机制转换逻辑\n- 认识党建引领在乡村振兴中的核心地位\n- 了解"分级开发、分类授课"的干部能力建设模式\n- 获得一套快速校验"真振兴"项目的实用工具\n\n---PAGE---\n\n## 第 2 章｜P1：五大振兴——乡村振兴的第一性原理\n\n### 五位一体振兴框架\n\n乡村振兴的核心推进机制是"五大振兴"协同驱动：\n\n**产业振兴**（根基）→ **人才振兴**（支撑）→ **文化振兴**（灵魂）→ **生态振兴**（底线）→ **组织振兴**（保障）\n\n### 为什么"有投入无产出"？\n\n一些地方轰轰烈烈搞乡村建设，但效果不佳。根本原因在于：\n\n1. **产业空心化**：只有基础设施投入，没有可持续的产业项目，农民增收无源\n2. **人才流失**：年轻人外出务工，留守群体难以承接发展任务\n3. **组织薄弱**：基层党组织战斗力不足，无法有效统筹资源、发动群众\n\n乡村振兴的"五位一体"正是为了解决这些结构性问题——通过**系统思维**破解单点困境。\n\n**权威阅读链接**：\n\n- [共产党员网｜乡村振兴战略专题](https://www.12371.cn/special/xczx/)\n\n---PAGE---\n\n## 第 2 章｜P2：从"输血"到"造血"——发展范式的根本转变\n\n### 传统方式：资源依赖型\n\n过去不少乡村发展依赖上级拨款、外部帮扶。外部资源一旦撤出，发展立即停滞；缺乏内生增长动力；群众参与度低，"干部干、群众看"。\n\n### 新范式：内生发展型\n\n| 路径 | 核心思路 | 代表实践 |\n|:---|:---|:---|\n| **党建引领** | 基层党组织领办合作社，发挥战斗堡垒作用 | 一空桥村党支部领办合作社带动种植1万多亩 |\n| **产业多元化** | 从单一农业向"种养加销游"全链条拓展 | 优质强筋麦种植+合作社分红 |\n| **能人返乡** | 吸引外出务工人员、退役军人、大学生返乡创业 | 各地"新农人""田秀才"培养计划 |\n| **科技赋能** | 农业技术专家团队驻村指导，推广现代农业技术 | 山东省农科院小麦遗传育种专家驻村指导 |\n| **多部门协同** | 统战、发改、农业、文旅等多部门联合推动 | "红石榴+"十大行动、"春雨润苗"专项行动 |\n\n山东省的经验表明，党员培训课程通过"分级开发、分类授课"，精准匹配不同层级、不同领域党员需求，有效提升了基层干部带领群众致富的能力。\n\n**权威阅读链接**：\n\n- [共产党员网｜山东省党员培训课程经验报道](https://www.12371.cn/2026/01/14/ARTI1768358145401195.shtml)\n- [中央统战部官网｜江苏省"红石榴+"十大行动推进会](http://www.zytzb.gov.cn/zytzb/2026-04/03/article_2026040309171035927.shtml)\n\n---PAGE---\n\n## 第 2 章｜P3：关键要素拼图——五块积木\n\n### 乡村振兴的五大关键要素\n\n| 要素 | 功能 | 政务场景关联 |\n|:---|:---|:---|\n| **党建引领** | 党组织领办合作社，统筹资源、发动群众 | 组织部门的核心抓手 |\n| **科技支撑** | 农业技术引进、品种改良、智慧农业 | 科技特派员制度的落地 |\n| **人才培育** | 分级分类培训、能人带动、技能提升 | 干部教育与实践结合 |\n| **政策协同** | 多部门联合行动，形成政策合力 | 跨部门协调能力的检验 |\n| **群众参与** | 从"要我干"到"我要干"的主体意识转变 | 基层治理能力的核心指标 |\n\n山东省构建的"省级抓统筹、市县分领域、乡镇强实践"三级课程开发体系，本质上是对**人才培育与组织建设**两大要素的制度化回应。江苏省民族工作"红石榴+"十大行动则将政策协同与群众参与有机结合，探索了多元文化背景下的乡村振兴新路径。\n\n**权威阅读链接**：\n\n- [中央统战部官网｜"春雨润苗"专项行动政策解读](http://www.zytzb.gov.cn/zytzb/2026-04/01/article_2026040115045562854.shtml)\n\n---PAGE---\n\n## 第 2 章｜P4：合作社模式——让农民"组织起来"的关键一跃\n\n### 什么是党支部领办合作社？\n\n党支部领办合作社是一种由村党支部主导、村民以土地或资金入股、统一经营管理的集体经济组织形式。其核心逻辑是：**以党组织的公信力为纽带，把分散的农民重新组织起来，形成市场竞争力**。\n\n通俗理解：**党支部就像是村里的"CEO"**——统一对接市场、技术、政策资源，把原本单打独斗的农户变成联合舰队。\n\n### 为什么合作社模式是"关键一跃"？\n\n山东省一空桥村的实践提供了典型案例验证：\n\n- **资源整合**：村党支部领办合作社，带动周边种植优质强筋麦1万多亩\n- **技术引入**：在省农科院小麦遗传育种专家团队驻村指导下，应用良种良法\n- **收益分配**：村集体分红过百万元，实现集体与村民"双增收"\n- **示范效应**：该案例被纳入山东省党员培训重点系列课程，成为可复制可推广的经验\n\n### **合作社模式的核心公式**\n\n> **党支部公信力 × 专家技术力 × 群众参与力 = 共同富裕实现力**\n\n**权威阅读链接**：\n\n- [共产党员网｜一空桥村致富实践案例](https://www.12371.cn/2026/01/14/ARTI1768358145401195.shtml)\n\n---PAGE---\n\n## 第 2 章｜P5：现实挑战——三道坎\n\n### 挑战一：产业同质化与市场风险\n\n不少乡村一窝蜂上同样的产业项目（如农家乐、采摘园），导致同质化竞争，产品滞销。关键在于**因地制宜**——根据本地资源禀赋选择差异化发展路径。\n\n### 挑战二：人才引不进、留不住\n\n乡村缺乏对年轻人的吸引力，懂农业、爱农村、爱农民的人才稀缺。需要从**培训赋能、政策激励、事业留人**三个层面系统解决。\n\n### 挑战三：组织动员能力不足\n\n一些基层党组织软弱涣散，无法有效发动和组织群众。"干部干、群众看"的困局亟需破解——关键路径是通过**利益联结机制**（如合作社分红）把群众真正动员起来。\n\n**权威阅读链接**：\n\n- [中央统战部官网｜"春雨润苗"专项行动](http://www.zytzb.gov.cn/zytzb/2026-04/01/article_2026040115045562854.shtml)' },
        { id: 4, title: '第3章：1分钟看懂"扶贫"与"振兴"的差别', duration: '4分钟', type: 'video', content: '## 第 3 章｜视频讲解\n\n分屏对比——同一村庄。\n\n左侧扶贫模式：干部送米送油、村民被动接受——它在"输血"，解决"有没有"的问题。\n\n右侧振兴模式：村民在合作社中自主劳作、分红大会上喜笑颜开——它在"造血"，解决"好不好"的问题。\n\n在"振兴"一侧叠加五大振兴图标（产业/人才/文化/生态/组织），依次高亮。\n\n---PAGE---\n\n### 核心要点\n\n- **扶贫 ≠ 振兴**\n- 扶贫是"送"，振兴是"造"\n- 振兴 = 产业—人才—文化—生态—组织协同推进\n- 面向基层，必须可落地、可评估、可推广' },
        { id: 5, title: '第4章：面向公共治理的四大实践领域', duration: '6分钟', type: 'mixed', content: '## 第 4 章·学习目标\n\n- 了解乡村振兴在产业发展、民生改善、生态治理、文化传承四类政务场景中的实际应用\n- 掌握从"场景识别"到"指标评估"的分析框架\n- 了解项目启动前必须完成的合规三件事\n\n---PAGE---\n\n## 第 4 章｜P1：场景总览——四大板块一张图\n\n### 四大政务实践场景\n\n基于山东省党员培训经验及江苏省"红石榴+"、九部门"春雨润苗"等实践案例，乡村振兴在公共治理领域可聚焦四大板块：\n\n| 板块 | 代表性任务 | 实践载体 |\n|:---|:---|:---|\n| **产业发展与集体经济** | 合作社建设、农业技术推广、小微企业扶持 | 村党支部领办合作社、产业园区 |\n| **民生改善与公共服务** | 农村教育提质、医疗养老保障、基础设施完善 | 乡镇卫生院、村级养老服务站 |\n| **生态保护与绿色发展** | 环境整治、生态修复、绿色农业推广 | 河湖长制、林长制、人居环境整治 |\n| **文化传承与民族团结** | 乡村文化保护、民族团结进步、精神文明创建 | "红石榴+"行动、农家书屋 |\n\n山东省潍坊市寒亭区一空桥村通过党支部领办合作社，实现优质强筋麦种植1万多亩、村集体分红过百万元；江苏省"红石榴+"十大行动则探索了民族工作与乡村振兴深度融合的新路径。\n\n**权威阅读链接**：\n\n- [共产党员网｜山东省党员培训系列报道](https://www.12371.cn/2026/01/14/ARTI1768358145401195.shtml)\n- [中央统战部官网｜江苏"红石榴+"行动](http://www.zytzb.gov.cn/zytzb/2026-04/03/article_2026040309171035927.shtml)\n\n---PAGE---\n\n## 第 4 章｜P2：场景深读（一）——产业发展与小微企业扶持\n\n### 产业发展场景：从"单打独斗"到"抱团发展"\n\n传统小农户面对大市场，议价能力弱、抗风险能力差。产业振兴要解决的问题就是：\n\n- **组织化经营**：通过党支部领办合作社，将分散的农户组织起来，统一品种、统一技术、统一销售\n- **科技赋能**：引入农业专家团队驻村指导，如山东省农科院小麦遗传育种专家为一空桥村提供全程技术支持\n- **产业链延伸**：从初级农产品向深加工、品牌化方向拓展\n\n### 小微企业扶持场景：走向"最后一公里"\n\n2021年启动的"春雨润苗"专项行动，至今已连续开展五年，累计服务小微经营主体1.8亿户次。2026年专项行动再升级：\n\n- **部门协同**：从最初两部门扩展至九部门联合，新增科技部、金融监管总局\n- **服务举措**：推出4个方面15项50条服务举措，聚焦"护航小微 合规发展"主题\n- **政策支持**：涵盖税务优惠、科技创新、融资支持、社保医保"一厅联办"等全方位服务\n\n对于乡村振兴中的乡村小微企业和个体经营户来说，这些政策是**从"生存"到"发展"的关键支撑**。\n\n**权威阅读链接**：\n\n- [中央统战部官网｜"春雨润苗"专项行动](http://www.zytzb.gov.cn/zytzb/2026-04/01/article_2026040115045562854.shtml)' },
        { id: 6, title: '第5章：合作社——一次关键跃迁', duration: '4分钟', type: 'video', content: '## 第 5 章｜视频讲解\n\n连贯镜头：分散的农户各自种地（画面凌乱）→ 党支部召开村民大会（红旗飘扬）→ 合作社统一耕种（大型农机作业）→ 分红大会上村民喜领现金\n\n不同地域场景切换：山东麦田→南方茶园→西部果园；合作社模式在各场景中灵活适配。\n\n---PAGE---\n\n核心要点：\n\n- **合作社** = 党建引领 × 群众参与 × 市场对接\n- 从单打独斗到抱团发展，从看天吃饭到品牌溢价\n- 因地制宜、因村施策，没有标准答案但有通用逻辑\n- 合作社模式：乡村振兴的关键制度创新' },
        { id: 7, title: '第6章：项目论证与评估方法', duration: '6分钟', type: 'mixed', content: '## 第 6 章·学习目标\n\n- 掌握"六问"论证清单，快速识别项目基本面\n- 学会使用加权评分表进行多项目比较\n- 理解"群众路线"思维——避免仅凭汇报材料做决策\n- 了解典型风险与对应治理对策\n\n---PAGE---\n\n## 第 6 章｜P1：论证清单——六问定基本面\n\n### 项目论证六问\n\n基于山东省党员培训经验和各地乡村振兴实践，机关干部在评估乡村振兴项目时，建议用以下六问逐一审视：\n\n| 序号 | 问题 | 判断要点 |\n|:---|:---|:---|\n| ① | 产业基础是否真实？ | 是否有本地资源禀赋支撑？市场需求是否真实存在？ |\n| ② | 群众意愿是否充分？ | 是否召开了村民代表大会？利益分配方案是否透明？ |\n| ③ | 组织保障是否到位？ | 是否有强有力的基层党组织？是否有专业人才支撑？ |\n| ④ | 资金方案是否可持续？ | 投入产出比是否合理？后续运营资金有无保障？ |\n| ⑤ | 生态红线是否严守？ | 是否符合国土空间规划？是否影响耕地保护和生态环境？ |\n| ⑥ | 评估方案是否明确？ | 有无可量化指标？有无定期评估与调整机制？ |\n\n山东省的经验表明："分级开发、分类授课"的课程体系之所以有效，正是因为它在顶层设计阶段就回答了"需求是什么、由谁来干、怎么评估"这三个核心问题。\n\n---PAGE---\n\n## 第 6 章｜P2：加权评分表——量化比选\n\n### 六维评分模型\n\n| 维度 | 权重 | 1分 | 5分 |\n|:---|:---|:---|:---|\n| **产业基础扎实度** | 25% | 无产业支撑 | 有特色产业链+品牌 |\n| **群众参与度** | 20% | 政府包办 | 群众主体+利益共享 |\n| **组织保障度** | 20% | 软弱涣散 | 党建引领+能人带头 |\n| **资金可持续性** | 15% | 纯靠拨款 | 自我造血+多元融资 |\n| **生态合规性** | 10% | 触碰红线 | 绿色发展+生态增值 |\n| **可评估性** | 10% | 无指标 | 全流程可量化、可追溯 |\n\n综合得分 = Σ（维度得分 × 权重），满分5分。建议设定部门内部的最低核准线（如3.5分）。\n\n---PAGE---\n\n## 第 6 章｜P3：群众路线——不要只听汇报\n\n### 群众路线思维\n\n习近平总书记强调："乡村振兴不是坐享其成，等不来、也送不来，要靠广大农民奋斗。"这提示机关干部：**不能仅凭单一汇报材料做判断，必须深入田间地头多源交叉验证。**\n\n| 验证方式 | 具体方法 | 权重建议 |\n|:---|:---|:---|\n| **村民访谈** | 入户走访、随机访谈、院坝会座谈 | ★★★★★ |\n| **实地察看** | 不看"样板间"，看随机抽取的自然村 | ★★★★★ |\n| **财务核查** | 村级财务账目、合作社分红记录 | ★★★★ |\n| **横向对比** | 同类地区、同类项目的成效比较 | ★★★ |\n| **材料汇报** | 项目实施方案、工作总结 | ★（需交叉验证） |\n\n**权威阅读链接**：\n\n- [共产党员网｜"四下基层"工作方法学习](https://www.12371.cn/)\n\n---PAGE---\n\n## 第 6 章｜P4：风险—对策矩阵\n\n### 五大典型风险与治理对策\n\n| 风险 | 表现 | 治理对策 |\n|:---|:---|:---|\n| **产业失败** | 市场判断失误，产品滞销，投入血本无归 | 小范围试点、逐步扩面、保险托底 |\n| **"垒大户"风险** | 资源过度集中于少数大户，普通群众被边缘化 | 利益联结机制全覆盖、定期公平性评估 |\n| **"政绩工程"** | 追求短期亮点，忽视长效制度建设 | 考核周期延长、引入第三方评估、群众评议 |\n| **人才断层** | 项目负责人调离后无人接手 | 培养本土接班人、建立标准化运营手册 |\n| **生态环境透支** | 急功近利破坏耕地、水源、生态环境 | 生态红线一票否决、绿色GDP考核 |\n\n山东省党员培训课程体系中专门设置了"说课研讨"环节，让基层干部以本村实践案例进行说课试讲，这一做法有效促进了**经验的可复制性与风险的可预判性**。' },
        { id: 8, title: '第7章："可落地、可评估、可推广"三要素', duration: '4分钟', type: 'video', content: '## 第 7 章｜视频讲解\n\n可落地示例：项目从"文件规划"变为"村民在田间劳作"的实景转变过程\n\n可评估示例：数据看板——农民收入增长率12%、村集体收入破百万、群众满意度95%\n\n可推广示例：一空桥村的合作社模式被写入省级培训教材→其他乡镇复制实践\n\n---PAGE---\n\n核心要点：\n\n- **乡村振兴治理三要素**：可落地、可评估、可推广\n- 可落地：从纸面到地面，从蓝图到实景\n- 可评估：指标量化、数据说话\n- 可推广：做成一个、带动一片\n- 先试点后推广，先组织后放活' },
        { id: 9, title: '第8章：组织一次本地化乡村振兴项目小调研', duration: '6分钟', type: 'mixed', content: '## 第 8 章·学习目标\n\n- 掌握一次小型调研的完整流程\n- 学会设计10题短问卷覆盖关键信息\n- 获得5页内评审材料的撰写模板\n- 了解如何将调研结果落地为试点建议\n\n---PAGE---\n\n## 第 8 章｜P1：调研目标与产出\n\n### 调研目标\n\n以本部门/乡镇/片区为范围，系统回答三个问题：\n\n1. 前3个最有潜力的振兴项目是什么？（按紧迫性×可行性排序）\n2. 每个项目的核心阻碍因素是什么？（资金？人才？组织？群众意愿？）\n3. 如果启动一个试点，最小可行方案是什么？\n\n### 预期产出\n\n| 产出 | 内容 | 形式 |\n|:---|:---|:---|\n| **项目清单** | 项目名称、产业方向、资源禀赋、群众基础、预期效益 | 一页表 |\n| **指标基线** | 当前状态核心指标（农民收入/集体经济/基础设施覆盖率等） | 数据表 |\n| **风险清单** | 市场、组织、资金、生态四类风险及初步对策 | 风险矩阵 |\n| **试点建议** | 推荐项目、实施主体、时间表、投入概算（不涉及投资回报率） | 2页以内简报 |\n\n---PAGE---\n\n## 第 8 章｜P2：样本与方法\n\n### 受访对象\n\n| 角色 | 人数 | 关注维度 |\n|:---|:---|:---|\n| **普通村民** | 5–8人 | 实际收入、生产困难、真实诉求 |\n| **村干部/合作社负责人** | 2–3人 | 项目运营瓶颈、管理能力、资源缺口 |\n| **乡镇分管领导** | 1–2人 | 政策资源、审批流程、协调难点 |\n| **农业经营主体** | 2–3人 | 市场渠道、技术需求、政策获得感 |\n\n### 调研方法\n\n1. **入户访谈**（每户20–30分钟）：围绕"收入—支出—困难—期望"四个核心问题展开\n2. **10题短问卷**：覆盖关键变量，便于量化比较\n3. **实地踏勘**：走访产业基地、基础设施、公共服务设施，拍照留存\n\n---PAGE---\n\n## 第 8 章｜P3：10题短问卷\n\n### 问卷设计（10–15分钟内完成）\n\n1. 您家目前的主要收入来源是什么？（多选：种植/养殖/务工/经商/其他）\n2. 过去一年家庭人均年收入大约是多少？与三年前相比的变化趋势？\n3. 您认为村里最有发展潜力的产业是什么？（请列举前2个）\n4. 如果村里发展集体产业项目，您是否愿意参与？（入股/务工/技术支持）\n5. 您对村干部带领群众致富的能力如何评价？（满意/一般/不满意）\n6. 村里年轻人外出务工比例大约是多少？返乡就业创业的意愿如何？\n7. 当前生产中最需要的外部支持是什么？（多选：资金/技术/销路/基础设施）\n8. 您是否了解当前的惠农政策？（非常了解/知道一些/不了解）\n9. 如果您是项目负责人，您认为最需要优先解决的问题是什么？\n10. 您对乡村振兴最大的期待是什么？（增收/环境改善/子女教育/医疗保障/其他）\n\n---PAGE---\n\n## 第 8 章｜P4：5页内评审材料模板\n\n### 推荐框架\n\n| 页码 | 内容 |\n|:---|:---|\n| **P1** | 背景与目标：国家政策导向（引用十九大/二十大/中央一号文件）+ 本区域现状与需求 |\n| **P2** | 项目分析：3个候选项目对比（产业方向、资源基础、群众意愿、可行性排序） |\n| **P3** | 预期价值：社会民生效益度量——预计覆盖农户数/增收幅度/就业带动/环境改善 |\n| **P4** | 风险评估与对策：五大风险维度评估+每项的对冲措施 |\n| **P5** | 试点路线图：时间表（3/6/12月里程碑）、责任主体、验收标准 |\n\n### 评审材料写作原则\n\n- **用数据代替形容词**："显著增收"不如"人均年收入从1.2万元提升至1.8万元"\n- **对标国家政策**：直接引用中央一号文件或乡村振兴促进法条款号，增强说服力\n- **风险透明化**：坦诚列出"可能失败的情境"，比一味承诺更显专业\n\n---PAGE---\n\n## 第 8 章｜P5：从调研到试点——行动清单\n\n| 步骤 | 内容 | 时间建议 |\n|:---|:---|:---|\n| ① **调研报告撰写** | 按上述5页模板完成 | 调研结束后2周内 |\n| ② **内部汇报** | 向分管领导/决策层汇报，获取试点授权 | 报告完成后1周内 |\n| ③ **村民议事** | 召开村民代表大会，讨论试点方案与利益分配 | 授权后1周内 |\n| ④ **小范围试点** | 选1个项目、1个自然村、明确阶段验收标准 | 村民议事通过后 |\n| ⑤ **试点评估与复盘** | 用六项指标评估，决定是否扩面推广 | 试点期末2周内 |\n\n### 本章结语\n\n乡村振兴的政务实践不是"找个村子投一笔钱"那么简单，而是一个涉及**产业选择、群众动员、组织建设、生态保护、长效机制**的系统工程。通过一次规范的本地化调研，你不仅能为决策提供依据，也能在实践中学到"如何识别真振兴、如何评估项目、如何防范风险"——这正是本课程希望赋予你的核心能力。' },
      ],
      description: '党的十九大提出实施乡村振兴战略，党的二十大进一步强调全面推进乡村振兴。本课程以"战略为纲、案例为镜、项目为尺"，通过前言+8章内容，帮助机关干部从零建立起对乡村振兴的系统认知和实操能力——从五大振兴框架到合作社模式，从产业论证到本地化调研，全面覆盖。',
      learningObjectives: [
        '准确理解乡村振兴的"二十字方针"与五大振兴框架',
        '掌握从"输血"到"造血"的发展范式转变',
        '了解四大政务实践领域与六项评估指标',
        '掌握项目论证六问与加权评分方法',
        '学会组织本地化乡村振兴项目调研',
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
  
  const [diagnosticData, setDiagnosticData] = useState<{ roles: string[]; topics: string[]; difficulty?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('user_diagnostic');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          roles: parsed.roles || [],
          topics: parsed.topics || [],
        };
      }
    } catch {}
    return null;
  });
  
  const [generationLogic, setGenerationLogic] = useState<any>(null);
  const [showGenerationPanel, setShowGenerationPanel] = useState(() => {
    const saved = localStorage.getItem('ai_generated_course');
    return !saved;
  });

  const router = useRouter();
  const hasDiagnostic = diagnosticData && (diagnosticData.roles.length > 0 || diagnosticData.topics.length > 0);

  const thinkingSteps = useMemo(() => [
    { title: '读取知识图谱诊断结果', detail: `正在加载学习诊断数据...\n\n• 身份角色：${hasDiagnostic ? diagnosticData.roles.join('、') : '未检测'}\n• 学习主题：${hasDiagnostic ? diagnosticData.topics.join('、') : '未选择'}` },
    { title: '分析课程需求与目标受众', detail: `基于具身智能专题分析：\n\n• 核心需求：机关干部对前沿技术的认知与治理能力\n• 知识缺口：具身智能从概念到国家战略的政策脉络、技术闭环机制、应用场景与项目论证\n• 受众定位：党政类在线学习平台成人用户（机关干部）` },
    { title: '检索相关知识点与资料', detail: `检索资源包括：\n\n📚 知识库（共565门课程）\n   • 根据课程主题从知识库中匹配相关课程资源\n   • 从565门课程中检索与主题关联的知识点和章节内容\n\n📖 图书与期刊资源\n   • 《具身智能发展报告（2025年）》\n   • 《人形机器人与具身智能标准体系（2026版）》\n   • CEAI中国具身智能白皮书\n\n✏️ 试题库相关试题\n   • 具身智能概念辨析题\n   • 核心技术理解与应用题\n   • 政策与治理场景选择题\n\n🌐 权威网站检索\n   • 信通院官网（caict.ac.cn）\n   • 人民网科技频道\n   • 新华网"人工智能+"专题\n   • 共产党员网权威解读` },
    { title: '进行内容合规审核', detail: `三级合规校验：\n\n• 政治方向：确保与《二十大报告》原文一致，核心表述准确\n• 政策解读：对照最新政策文件版本（如2024年修订版《纪律处分条例》）\n• 敏感筛查：不涉及未公开文件，所有链接均为官方权威来源` },
    { title: '设计课程结构与章节安排', detail: `构建课程框架：\n\n• 章节结构：前言+5-8章（含核心概念、政策法规、实务操作、案例剖析等）\n• 章节时长：约75分钟\n• 学习目标：每章2-4条，可衡量\n• 互动设计：章节末尾设单选测试题` },
    { title: '生成课程内容与学习目标', detail: `AI撰写各章节：\n\n• 生成方式：大语言模型 + 知识图谱驱动\n• 每章结构：学习目标→知识点讲解→政策引用→实务指南→案例分析→权威链接\n• 输出格式：Markdown文档，支持编辑` },
    { title: '优化课程大纲与教学设计', detail: `教学化加工：\n\n• 复杂条文通俗化，添加"干部视角"解读\n• 选取与岗位角色相关的典型案例\n• 每章设置情境分析题，附详细解析\n• 根据内容密度校准时长` },
    { title: '课程生成完成', detail: `✅ 课程已全部生成！\n\n• 章节数：8章+前言\n• 预计时长：约40-50分钟\n• 内容来源：信通院具身智能发展报告、人形机器人与具身智能标准体系(2026版)、国务院发展研究中心报告等权威文献\n\n课程已保存，可随时查看或重新生成。` },
  ], [diagnosticData, hasDiagnostic]);

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const generateLogicExplanation = (topic: string, diagnostic: { roles: string[]; topics: string[]; difficulty?: string } | null) => {
    const hasDiag = diagnostic && (diagnostic.roles.length > 0 || diagnostic.topics.length > 0);
    
    const roleInterpretation = hasDiag ? (
      diagnostic!.roles.length > 0 
        ? `根据您在学习诊断中选择的身份「${diagnostic!.roles.join('、')}」，系统判断您需要侧重${diagnostic!.roles.includes('党支部书记') || diagnostic!.roles.includes('党务工作者') ? '实务操作和基层党建方法' : '理论学习和思想武装'}方面的内容。`
        : '系统根据您的身份标签，判断了适合您的内容深度和学习方向。'
    ) : '由于暂未完成学习诊断，系统默认以综合受众为标准生成课程。';

    const topicConnection = hasDiag ? (
      diagnostic!.topics.length > 0
        ? `您在学习诊断中感兴趣的主题「${diagnostic!.topics.join('、')}」与本课程内容高度关联。AI已将相关知识点融入章节设计中，确保内容与您的学习偏好相匹配。`
        : '系统根据课程主题自动匹配了相关知识模块。'
    ) : '系统根据课程主题自动匹配了相关知识模块。';

    const recommendation = hasDiag
      ? `综上，AI根据您完整的诊断画像（身份 + 主题偏好），为您智能生成了这套课程。所有章节、时长、学习目标均经过个性化匹配，旨在最大化您的学习效率。`
      : `当前课程基于通用标准生成。建议前往引导页完成学习诊断，获取更精准的个性化课程推荐。`;

    return {
      roleInterpretation,
      topicConnection,
      difficultyMatch: null as string | null,
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

    let currentDiagnostic: { roles: string[]; topics: string[]; difficulty?: string } | null = null;
    try {
      const saved = localStorage.getItem('user_diagnostic');
      console.log('[课程生成] localStorage中的诊断数据:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        currentDiagnostic = {
          roles: parsed.roles || [],
          topics: parsed.topics || [],
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
    setShowGenerationPanel(true);
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
      setShowGenerationPanel(false);
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
      {/* 生成前区域：标题、输入、逻辑解读、生成步骤 - 可折叠 */}
      {(showGenerationPanel || isGenerating) && (
        <>
      {/* 第一行：标题区 + 右侧生成逻辑解读 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* 左侧：标题 + 输入 + 预设主题 */}
        <div className="lg:col-span-2 border-2 border-black bg-white p-8 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          {/* 右上角折叠按钮 */}
          <button
            onClick={() => setShowGenerationPanel(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs font-bold border border-gray-300 px-2 py-1 bg-white hover:bg-gray-100 transition-colors"
            title="折叠生成面板"
          >
            折叠 ▲
          </button>
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
                    backgroundColor: plan.key === 'xjp_thought' ? '#fbbf24' : plan.key === 'united_front' ? '#c084fc' : plan.key === 'rural_revitalization' ? '#22c55e' : '#fb7185',
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
              <div className="absolute -top-2.5 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5">智能分析</div>
              <div className="mt-1">
                <div className="text-[12px] text-gray-800 leading-relaxed">AI将综合您的身份角色和学习主题偏好，智能匹配课程内容的深度与广度。</div>
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
      <div className="border-2 border-black bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 text-white mb-6" style={{ boxShadow: '4px 4px 0 0 #000' }}>
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

      {/* 生成面板折叠状态栏 - 当折叠且有结果时显示 */}
      {!showGenerationPanel && !isGenerating && showResult && (
        <div className="border-2 border-black bg-gray-900 p-3 mb-6 flex items-center justify-between text-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-sm text-amber-400">AI生成面板</span>
              <span className="text-xs text-gray-400 ml-2">已折叠</span>
            </div>
          </div>
          <button
            onClick={() => setShowGenerationPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500 transition-all text-sm"
            style={{ boxShadow: '2px 2px 0 0 #000' }}
          >
            <span>▼</span>
            展开生成面板
          </button>
        </div>
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
                  setShowGenerationPanel(true);
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
