'use client';

import { useState, useEffect } from 'react';
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
      { id: 1, title: '第一讲：总则概述', duration: '15:00', isCompleted: true },
      { id: 2, title: '第二讲：政治纪律', duration: '20:00', isCompleted: true },
      { id: 3, title: '第三讲：组织纪律', duration: '18:00', isCompleted: false },
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
      { id: 1, title: '第一讲：思想概述', duration: '20:00', isCompleted: true },
      { id: 2, title: '第二讲：十个明确', duration: '25:00', isCompleted: true },
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
  // 诊断数据
  const [diagnosticData, setDiagnosticData] = useState<{ roles: string[]; topics: string[]; difficulty: string } | null>(null);
  // 生成逻辑说明（动态）
  const [generationLogic, setGenerationLogic] = useState<any>(null);

  const presetCourseTopics = [
    {
      key: 'xjp_thought',
      name: '习近平新时代中国特色社会主义思想专题',
      data: {
        courseName: '习近平新时代中国特色社会主义思想专题课程',
        courseType: '理论课程',
        totalHours: 1.2,
        difficulty: '高级',
        targetAudience: '全省统战系统干部',
        chapters: [
          { id: 1, title: '课程目标与课程概述', duration: '3分钟', type: 'video', content: '本课程旨在引导学员深刻领悟党的创新理论的核心要义、精神实质和实践要求，使学员成为习近平新时代中国特色社会主义思想的坚定信仰者和忠实实践者。\n\n课程涵盖理论体系掌握、思想共识凝聚、实践能力提升、责任使命担当四大目标，通过系统学习习近平新时代中国特色社会主义思想的形成背景、核心要义、理论体系和历史地位，学员能够全面把握这一伟大思想的科学内涵和时代价值。\n\n【课程目标一：理论体系掌握】通过系统学习习近平新时代中国特色社会主义思想的形成背景、核心要义、理论体系和历史地位，学员能够全面把握这一伟大思想的科学内涵和时代价值。学员能够准确阐述"十个明确"的核心要义、"十四个坚持"的基本方略，深刻理解习近平新时代中国特色社会主义思想的理论逻辑、历史逻辑、实践逻辑。\n\n【课程目标二：思想共识凝聚】深刻领悟"两个确立"的决定性意义，增强"四个意识"、坚定"四个自信"、做到"两个维护"，在思想上政治上行动上同以习近平同志为核心的党中央保持高度一致。\n\n【课程目标三：实践能力提升】将习近平新时代中国特色社会主义思想作为指导思想和行动指南，运用其立场观点方法分析和解决实际问题，推动工作高质量发展。\n\n【课程目标四：责任使命担当】深刻认识新时代党的历史使命，增强干事创业的责任感、使命感和紧迫感，为全面建设社会主义现代化国家贡献力量。' },
          { id: 2, title: '第一讲：习近平新时代中国特色社会主义思想的形成背景与历史地位', duration: '4.5分钟', type: 'video', content: '系统学习习近平新时代中国特色社会主义思想的创立背景、理论渊源、实践基础，深刻理解其作为当代中国马克思主义、二十一世纪马克思主义的理论定位，掌握"两个结合"的理论创新路径。\n\n习近平新时代中国特色社会主义思想是当代中国马克思主义、二十一世纪马克思主义，是中华文化和中国精神的时代精华，实现了马克思主义中国化时代化新的飞跃。这一思想从理论和实践结合上系统回答了新时代坚持和发展什么样的中国特色社会主义、怎样坚持和发展中国特色社会主义，建设什么样的社会主义现代化强国、怎样建设社会主义现代化强国，建设什么样的长期执政的马克思主义政党、怎样建设长期执政的马克思主义政党等重大时代课题。\n\n这一思想内涵丰富、思想深邃，涵盖改革发展稳定、内政外交国防、治党治国治军等各个领域，构成一个完整的科学理论体系。这一思想既坚持了老祖宗，又讲了很多新话，提出了一系列原创性的治国理政新理念新思想新战略。\n\n"两个结合"是指坚持把马克思主义基本原理同中国具体实际相结合、同中华优秀传统文化相结合。这是习近平新时代中国特色社会主义思想的理论创新路径，是开辟马克思主义中国化时代化新境界的必由之路。' },
          { id: 3, title: '第二讲：核心要义与科学体系——"十个明确"与"十四个坚持"', duration: '6分钟', type: 'video', content: '深入学习"十个明确"的核心要义、"十四个坚持"的基本方略、"十三个方面成就"的历史贡献，系统把握这一思想的科学体系和理论框架。\n\n【"十个明确"的核心要义】"十个明确"是习近平新时代中国特色社会主义思想的核心要义，明确了中国特色社会主义最本质的特征、新时代我国社会主要矛盾、中国特色社会主义事业总体布局和战略布局、全面深化改革总目标、全面推进依法治国总目标、坚持和完善社会主义基本经济制度、党在新时代的强军目标、中国特色大国外交、全面从严治党战略方针等。"十个明确"从理论层面系统概括了习近平新时代中国特色社会主义思想的核心要义，是这一思想的"四梁八柱"，构成了完整的理论体系。\n\n【"十四个坚持"的基本方略】"十四个坚持"是新时代坚持和发展中国特色社会主义的基本方略，包括：坚持党对一切工作的领导、坚持以人民为中心、坚持全面深化改革、坚持新发展理念、坚持人民当家作主、坚持全面依法治国、坚持社会主义核心价值体系、坚持在发展中保障和改善民生、坚持人与自然和谐共生、坚持总体国家安全观、坚持党对人民军队的绝对领导、坚持"一国两制"和推进祖国统一、坚持推动构建人类命运共同体、坚持全面从严治党。\n\n【"十三个方面成就"】党的十八大以来，在坚持党的全面领导、全面从严治党、经济建设、全面深化改革开放、政治建设、全面依法治国、文化建设、社会建设、生态文明建设、国防和军队建设、维护国家安全、坚持"一国两制"和推进祖国统一、外交工作等十三个方面取得了历史性成就、发生了历史性变革。' },
          { id: 4, title: '第三讲："两个确立"的决定性意义', duration: '5分钟', type: 'video', content: '深刻领悟"两个确立"的历史必然性、政治内涵和实践要求，增强"四个意识"、坚定"四个自信"、做到"两个维护"，自觉在思想上政治上行动上同以习近平同志为核心的党中央保持高度一致。\n\n"两个确立"即确立习近平同志党中央的核心、全党的核心地位，确立习近平新时代中国特色社会主义思想的指导地位。这是党在新时代取得的重大政治成果，是推动党和国家事业取得历史性成就、发生历史性变革的决定性因素。\n\n"两个确立"体现了全党共同意志，反映了全国各族人民共同心愿，对新时代党和国家事业发展、对推进中华民族伟大复兴历史进程具有决定性意义。"两个确立"是历史的选择、人民的选择、时代的选择。\n\n【"两个确立"的政治内涵】体现了党的高度政治自觉，实现了马克思主义中国化时代化新的飞跃，在新时代伟大实践中形成和确立，反映了党的事业发展的客观要求。\n\n【"两个维护"的实践要求】坚决维护习近平总书记党中央的核心、全党的核心地位，坚决维护党中央权威和集中统一领导。要把"两个维护"体现在坚决贯彻党中央决策部署的行动上，体现在履职尽责、做好本职工作的实效上，体现在党员、干部的日常言行上。' },
          { id: 5, title: '第四讲：世界观和方法论——"六个必须坚持"', duration: '5.5分钟', type: 'video', content: '深刻理解"六个必须坚持"的内涵要义，掌握习近平新时代中国特色社会主义思想的世界观和方法论，运用这一思想的立场观点方法分析和解决实际问题。\n\n"六个必须坚持"即必须坚持人民至上、必须坚持自信自立、必须坚持守正创新、必须坚持问题导向、必须坚持系统观念、必须坚持胸怀天下。这是习近平新时代中国特色社会主义思想的世界观和方法论的集中体现，是继续推进党的理论创新的根本遵循。\n\n【坚持人民至上】人民性是马克思主义的本质属性，党的理论是来自人民、为了人民、造福人民的理论，人民的创造性实践是理论创新的不竭源泉。要站稳人民立场、把握人民愿望、尊重人民创造、集中人民智慧。\n\n【坚持自信自立】中国人民和中华民族从近代以后的深重苦难走向伟大复兴的光明前景，从来就没有教科书，更没有现成答案。党的百年奋斗成功道路是党领导人民独立自主探索开辟出来的。要坚持对马克思主义的坚定信仰、对中国特色社会主义的坚定信念，坚定道路自信、理论自信、制度自信、文化自信。\n\n【坚持守正创新】守正才能不迷失方向、不犯颠覆性错误，创新才能把握时代、引领时代。要以科学的态度对待科学、以真理的精神追求真理，坚持马克思主义基本原理不动摇，坚持党的全面领导不动摇，坚持中国特色社会主义不动摇。\n\n【坚持问题导向】问题是时代的声音，回答并指导解决问题是理论的根本任务。要不断增强问题意识，聚焦实践遇到的新问题、改革发展稳定存在的深层次问题、人民群众急难愁盼问题、国际变局中的重大问题、党的建设面临的突出问题。\n\n【坚持系统观念】万事万物是相互联系、相互依存的。只有用普遍联系的、全面系统的、发展变化的观点观察事物，才能把握事物发展规律。要善于通过历史看现实、透过现象看本质，把握好全局和局部、当前和长远、宏观和微观、主要矛盾和次要矛盾、特殊和一般的关系。\n\n【坚持胸怀天下】中国共产党是为中国人民谋幸福、为中华民族谋复兴的党，也是为人类谋进步、为世界谋大同的党。要拓展世界眼光，深刻洞察人类发展进步潮流，积极回应各国人民普遍关切，为解决人类面临的共同问题作出贡献。' },
          { id: 6, title: '第五讲：新时代统一战线工作的根本遵循', duration: '6分钟', type: 'video', content: '深入学习习近平总书记关于做好新时代党的统一战线工作的重要思想，理解统一战线是凝聚人心、汇聚力量的强大法宝，掌握促进政党关系、民族关系、宗教关系、阶层关系、海内外同胞关系和谐的要求。\n\n统一战线是凝聚人心、汇聚力量的强大法宝。党的十八大以来，以习近平同志为核心的党中央高度重视统一战线工作，提出一系列新理念新思想新战略，推动统一战线事业取得历史性成就，统一战线呈现出团结、奋进、开拓、活跃的良好局面。\n\n【加强党对统一战线工作的集中统一领导】完善大统战工作格局，形成全党全社会共同做统战工作的良好局面。坚持党委统一领导、统战部门牵头协调、有关方面各负其责的大统战工作格局。\n\n【支持民主党派和无党派人士履行职能】坚持中国共产党领导的多党合作和政治协商制度，做好政治协商、民主监督、参政议政工作，加强中国特色社会主义参政党建设。\n\n【以铸牢中华民族共同体意识为主线做好民族工作】全面推进中华民族共有精神家园建设，推动各民族共同走向社会主义现代化，促进各民族交往交流交融，提升民族事务治理体系和治理能力现代化水平。\n\n【坚持我国宗教中国化方向】完整准确全面贯彻党的宗教信仰自由政策，依法管理宗教事务，坚持独立自主自办原则，积极引导宗教与社会主义社会相适应。\n\n【做好党外知识分子和新的社会阶层人士统战工作】加强政治引领，发挥作用，创新方法，加强平台建设，加强代表人士队伍建设。\n\n【促进非公有制经济健康发展和非公有制经济人士健康成长】构建亲清政商关系，加强民营经济人士思想政治建设，发挥工商联和商会作用。\n\n【做好港澳台和海外统战工作】坚持和完善"一国两制"制度体系，做好港澳统战工作，做好对台工作，做好海外统战工作，凝聚侨心侨力侨智。' },
          { id: 7, title: '实践应用方法与案例分析', duration: '7分钟', type: 'video', content: '通过具体案例分析，学习将党的创新理论转化为工作思路和举措的方法，提升运用理论指导实践的能力，推动工作高质量发展。\n\n【案例一：全面建设社会主义现代化国家的实践】党的二十大擘画了全面建设社会主义现代化国家、以中国式现代化全面推进中华民族伟大复兴的宏伟蓝图。以习近平同志为核心的党中央团结带领全党全国各族人民，贯彻新发展理念，构建新发展格局，推动高质量发展。新时代十年，我国经济实力实现历史性跃升，国内生产总值从54万亿元增长到121万亿元，稳居世界第二位；建成世界上规模最大的教育体系、社会保障体系、医疗卫生体系；打赢人类历史上规模最大的脱贫攻坚战，历史性地解决了绝对贫困问题。\n\n【案例二：新时代统一战线工作的创新发展】党的十八大以来，以习近平同志为核心的党中央高度重视统一战线工作，提出一系列新理念新思想新战略，推动统一战线事业取得历史性成就。统一战线的政治引领更加有力，统一战线的工作格局更加完善，统一战线的法宝作用更加彰显。\n\n【案例三：以人民为中心的发展思想实践】党的十八大以来，以习近平同志为核心的党中央坚持以人民为中心的发展思想，把人民对美好生活的向往作为奋斗目标。人民生活全方位改善，居民人均可支配收入从16500元增加到36883元，中等收入群体规模超过4亿人；基本医疗保险参保率稳定在95%以上；人均预期寿命从74.8岁增长到78.2岁。\n\n【实践应用方法】\n1. 理论学习方法：系统性学习原著原文，专题化研讨，联系实际思考。\n2. 能力提升方法：政治能力提升，思维能力提升，实践能力提升。\n3. 推动工作方法：调查研究，改革创新，狠抓落实。' },
          { id: 8, title: '最新发展动态与总结思考', duration: '5分钟', type: 'video', content: '学习党的二十大以来党的创新理论的最新发展，总结课程学习收获，思考如何在实际工作中贯彻落实，增强干事创业的责任感、使命感和紧迫感。\n\n【最新发展动态】\n2023年6月：学习贯彻习近平新时代中国特色社会主义思想主题教育开展，主题教育以"学思想、强党性、重实践、建新功"为总要求。\n2023年10月：党的二十届三中全会审议通过《中共中央关于进一步全面深化改革、推进中国式现代化的决定》。\n2024年3月：全国两会审议通过《中华人民共和国爱国主义教育法》。\n2025年3月：党的二十届六中全会审议通过《中共中央关于全面推进法治中国建设若干重大问题的决定》。\n\n【主要收获】\n1. 理论素养的提升：全面把握了习近平新时代中国特色社会主义思想的科学体系。\n2. 政治觉悟的提高：深刻领悟了"两个确立"的决定性意义。\n3. 实践能力的增强：掌握了运用党的创新理论武装头脑、指导实践、推动工作的方法。\n4. 思想共识的凝聚：进一步统一了思想、凝聚了共识。\n\n【思考问题】\n1. 如何将习近平新时代中国特色社会主义思想内化于心、外化于行？\n2. 如何运用"六个必须坚持"的世界观和方法论指导实践？\n3. 如何做好新时代党的统一战线工作？\n4. 如何在推进中国式现代化中担当作为？\n\n【结语】习近平新时代中国特色社会主义思想是当代中国马克思主义、二十一世纪马克思主义，是中华文化和中国精神的时代精华，实现了马克思主义中国化时代化新的飞跃。新时代新征程，我们要更加紧密地团结在以习近平同志为核心的党中央周围，以中国式现代化全面推进中华民族伟大复兴，为全面建成社会主义现代化强国、全面推进中华民族伟大复兴而团结奋斗！' },
        ],
        description: '本课程系统讲授习近平新时代中国特色社会主义思想的科学体系、核心要义和实践要求，特别聚焦统一战线工作的重要论述，引导学员深刻领悟党的创新理论的真理力量和实践伟力。课程涵盖理论渊源、实践基础、核心要义、历史地位等内容，帮助学员全面把握这一当代中国马克思主义、二十一世纪马克思主义。',
        learningObjectives: [
          '深刻理解习近平新时代中国特色社会主义思想的丰富内涵',
          '准确把握十个明确、十四个坚持的核心要义',
          '深刻领悟两个确立的决定性意义',
          '熟练掌握新时代统一战线工作的理论方针政策',
          '提升运用党的创新理论指导实践的能力水平',
        ],
      }
    },
    {
      key: 'united_front',
      name: '新时代统一战线工作实务',
      data: {
        courseName: '新时代统一战线工作实务课程',
        courseType: '实务课程',
        totalHours: 1.6,
        difficulty: '中级',
        targetAudience: '基层统战干部',
        chapters: [
          { id: 1, title: '课程概述与理论基础', duration: '3分钟', type: 'video', content: '本课程围绕新时代统一战线各领域工作，从理论基础、制度设计、政策要求到实践操作进行全链条讲解，特别注重案例教学和经验分享。\n\n新时代爱国统一战线是指在中国共产党领导下，以工农联盟为基础，包括全体社会主义劳动者、社会主义事业的建设者、拥护社会主义的爱国者、拥护祖国统一和致力于中华民族伟大复兴的爱国者的联盟。新时代爱国统一战线的历史方位是：我国发展面临新的战略机遇、新的战略任务、新的战略阶段、新的战略要求、新的战略环境，需要巩固和发展最广泛的爱国统一战线，团结一切可以团结的力量，调动一切可以调动的积极因素，为全面建设社会主义现代化国家、全面推进中华民族伟大复兴而团结奋斗。\n\n统一战线具有空前的广泛性、巨大的包容性、鲜明的多样性、显著的社会性。统一战线涵盖了政党关系、民族关系、宗教关系、阶层关系、海内外同胞关系，是凝聚人心、汇聚力量的强大法宝。' },
          { id: 2, title: '第一讲：新时代统一战线的历史方位与重要作用', duration: '4.5分钟', type: 'video', content: '深入学习习近平总书记关于做好新时代党的统一战线工作的重要思想，理解统一战线是凝聚人心、汇聚力量的强大法宝，掌握"十二个必须"的核心要义。\n\n"十二个必须"是习近平总书记关于做好新时代党的统一战线工作的重要思想的核心要义，即必须充分发挥统一战线的重要法宝作用，必须解决好人心和力量问题，必须正确处理一致性和多样性关系，必须坚持好发展好完善好中国新型政党制度，必须以铸牢中华民族共同体意识为党的民族工作主线，必须坚持我国宗教中国化方向，必须做好党外知识分子和新的社会阶层人士统战工作，必须促进非公有制经济健康发展和非公有制经济人士健康成长，必须发挥港澳台和海外统战工作争取人心的作用，必须加强党外代表人士队伍建设，必须把握做好统战工作的规律，必须加强党对统战工作的全面领导。\n\n"十二个必须"是一个有机整体，系统回答了新时代统一战线的一系列重大理论和实践问题，为做好新时代统战工作指明了方向、提供了遵循。它涵盖了统战工作的各个方面，构成完整的理论体系，具有系统性、原创性、实践性、时代性的特点。' },
          { id: 3, title: '第二讲：中国新型政党制度与多党合作', duration: '5.5分钟', type: 'video', content: '系统学习中国共产党领导的多党合作和政治协商制度，掌握民主党派和无党派人士工作的方法，做好政治协商、民主监督、参政议政工作，加强中国特色社会主义参政党建设。\n\n中国新型政党制度即中国共产党领导的多党合作和政治协商制度，是中国共产党、中国人民和各民主党派、无党派人士的伟大政治创造，是从中国土壤中生长出来的新型政党制度。这一制度的基本方针是"长期共存、互相监督、肝胆相照、荣辱与共"，根本政治准则是坚持中国共产党的领导，坚持四项基本原则。\n\n中国新型政党制度的显著特征是共产党领导、多党派合作，共产党执政、多党派参政。这一制度既坚持中国共产党的坚强领导，又发扬社会主义民主，能够真实、广泛、持久代表和实现最广大人民根本利益、全国各族各界根本利益。\n\n做好多党合作和政治协商工作，要支持民主党派和无党派人士履行职能，做好政治协商工作，做好民主监督工作，做好参政议政工作，加强中国特色社会主义参政党建设，发挥好民主党派和无党派人士作用。' },
          { id: 4, title: '第三讲：铸牢中华民族共同体意识——民族工作实务', duration: '6分钟', type: 'video', content: '深入学习以铸牢中华民族共同体意识为主线的党的民族工作，掌握全面推进中华民族共有精神家园建设、推动各民族共同走向社会主义现代化、促进各民族交往交流交融、提升民族事务治理体系和治理能力现代化水平的方法。\n\n铸牢中华民族共同体意识是党的民族工作的主线，就是要引导各族人民牢固树立休戚与共、荣辱与共、生死与共、命运与共的共同体理念，增进对伟大祖国、中华民族、中华文化、中国共产党、中国特色社会主义的认同，不断推进中华民族共同体建设。\n\n铸牢中华民族共同体意识是新时代党的民族工作的"纲"，所有工作要向此聚焦。要全面推进中华民族共有精神家园建设，推动各民族共同走向社会主义现代化，促进各民族交往交流交融，提升民族事务治理体系和治理能力现代化水平。\n\n做好新时代民族工作，必须深入持久开展民族团结进步创建，不断创新创建方式方法，提高创建质量和水平。各族群众的"五个认同"不断增强，中华民族共同体意识更加牢固，各民族交往交流交融更加深入，民族地区经济社会发展取得显著成就，民族事务治理体系和治理能力现代化水平不断提高，民族团结进步事业蓬勃发展。' },
          { id: 5, title: '第四讲：坚持我国宗教中国化方向——宗教工作实务', duration: '5.5分钟', type: 'video', content: '完整准确全面贯彻党的宗教信仰自由政策，依法管理宗教事务，坚持独立自主自办原则，积极引导宗教与社会主义社会相适应，以社会主义核心价值观为引领，用中华优秀传统文化浸润宗教。\n\n坚持我国宗教中国化方向，就是要引导和支持我国宗教以社会主义核心价值观为引领，增进宗教界人士和信教群众对伟大祖国、中华民族、中华文化、中国共产党、中国特色社会主义的认同，在宗教教义教规阐释上，用社会主义核心价值观引领，用中华优秀传统文化浸润，作出符合当代中国发展进步要求、符合中华优秀传统文化的阐释，使我国宗教更好与社会主义社会相适应。\n\n坚持我国宗教中国化方向是新时代党的宗教工作的重大战略举措，是解决我国宗教领域突出问题的治本之策，是引导宗教与社会主义社会相适应的重要抓手。推进我国宗教中国化，必须以社会主义核心价值观为引领，增进"五个认同"，用社会主义核心价值观引领宗教教义教规阐释，用中华优秀传统文化浸润宗教，引导宗教与社会主义社会相适应。必须坚持党的宗教工作基本方针，依法管理宗教事务，坚持独立自主自办原则。' },
          { id: 6, title: '第五讲：促进"两个健康"——民营经济统战工作', duration: '5分钟', type: 'video', content: '深入学习促进非公有制经济健康发展和非公有制经济人士健康成长的要求，构建亲清政商关系，加强民营经济人士思想政治建设，发挥工商联和商会作用。\n\n促进非公有制经济健康发展和非公有制经济人士健康成长，是民营经济统战工作的重要任务。做好新时代民营经济统战工作，必须坚持"两个毫不动摇"，促进"两个健康"，加强民营经济人士思想政治建设，构建亲清政商关系，支持民营企业发展，发挥工商联和商会作用。必须创新民营经济统战工作方式方法，提高工作质量和水平。\n\n民营经济人士的思想政治素质不断提高，亲清政商关系不断完善，民营经济发展环境不断优化，民营经济在促进发展、扩大就业、改善民生等方面的作用得到充分发挥，工商联和商会的桥梁纽带作用得到充分发挥。' },
          { id: 7, title: '第六讲：新的社会阶层人士统战工作', duration: '5分钟', type: 'video', content: '认识新的社会阶层人士的构成和特点，加强对新的社会阶层人士的政治引领，发挥新的社会阶层人士作用，创新新的社会阶层人士统战工作方法，加强平台建设。\n\n新的社会阶层人士是中国特色社会主义事业的建设者，是新时代统战工作新的着力点。做好新时代新的社会阶层人士统战工作，必须加强政治引领，发挥作用，创新方法，加强平台建设，加强代表人士队伍建设。\n\n新的社会阶层人士的思想政治素质不断提高，新的社会阶层人士作用得到充分发挥，新的社会阶层人士统战工作平台建设取得显著成效，新的社会阶层代表人士队伍建设不断加强，新的社会阶层人士统战工作不断创新发展。\n必须把握新的社会阶层人士的特点和规律，不断创新工作方式方法，提高工作质量和水平。要加强对新的社会阶层人士的政治引领，发挥新的社会阶层人士作用，创新新的社会阶层人士统战工作方法，加强新的社会阶层人士统战工作平台建设，加强新的社会阶层代表人士队伍建设。' },
          { id: 8, title: '第七讲：港澳台海外统战工作', duration: '5.5分钟', type: 'video', content: '坚持和完善"一国两制"制度体系，做好港澳统战工作，做好对台工作，做好海外统战工作，凝聚侨心侨力侨智。\n\n坚持和完善"一国两制"制度体系，是做好港澳台海外统战工作的根本遵循。要全面准确贯彻"一国两制"、"港人治港"、"澳人治澳"、高度自治的方针，坚持依法治港治澳，维护宪法和基本法确定的特别行政区宪制秩序。\n做好对台工作，要坚持一个中国原则和"九二共识"，推动两岸关系和平发展，深化两岸融合发展，增进台湾同胞福祉，实现祖国完全统一。\n做好海外统战工作，要广泛团结海外侨胞和归侨侨眷，凝聚侨心侨力侨智，为实现中华民族伟大复兴的中国梦贡献力量。要发挥侨胞融通中外的独特优势，讲好中国故事，传播中国声音，促进中外友好交流合作。' },
          { id: 9, title: '第八讲：党外代表人士队伍建设', duration: '4.5分钟', type: 'video', content: '加强党外代表人士的发现培养、教育引导、选拔使用和管理服务，建设一支高素质的党外代表人士队伍。\n\n党外代表人士队伍建设是统一战线的基础性、战略性工程。加强党外代表人士队伍建设，要做到"四个加强"：\n一是加强党外代表人士的发现培养。拓宽视野、广开渠道，及时发现优秀人才，建立党外代表人士数据库，实行动态管理。\n二是加强党外代表人士的教育引导。坚持政治培训为主，创新培训方式，提高培训的针对性和实效性，帮助党外代表人士坚定理想信念，增强政治认同。\n三是加强党外代表人士的选拔使用。坚持德才兼备、以德为先，坚持五湖四海、任人唯贤，把优秀党外人才选拔到适合的岗位上来。\n四是加强党外代表人士的管理服务。建立健全联系服务制度，关心党外代表人士的工作和生活，帮助解决实际困难。' },
          { id: 10, title: '实践应用与案例研讨', duration: '9分钟', type: 'discussion', content: '通过具体案例分析，学习基层统战工作创新实践，掌握正确处理一致性和多样性关系、尊重维护照顾同盟者利益的方法，提升实际工作能力。\n\n【案例一：构建大统战工作格局的实践】健全党委统一领导、统战部门牵头协调、有关方面各负其责的大统战工作格局，形成全党全社会共同做统战工作的良好局面。党委对统战工作的领导更加有力，统战部门牵头协调作用更加凸显，有关方面各负其责、协同配合。\n【案例二：民族团结进步创建工作的实践】以铸牢中华民族共同体意识为主线，全面深入持久开展民族团结进步创建。各族群众的"五个认同"不断增强，中华民族共同体意识更加牢固，各民族交往交流交融更加深入。\n【案例三：民营经济统战工作的创新实践】加强民营经济人士思想政治建设，构建亲清政商关系，支持民营企业发展，发挥工商联和商会作用。民营经济人士的思想政治素质不断提高，民营经济发展环境不断优化。\n【案例四：新的社会阶层人士统战工作的实践探索】加强对新的社会阶层人士的政治引领，发挥作用，创新方法，加强平台建设。新的社会阶层人士的思想政治素质不断提高，作用得到充分发挥。\n【案例五：宗教中国化的实践探索】以社会主义核心价值观为引领，增进"五个认同"，用中华优秀传统文化浸润宗教。我国宗教中国化取得显著成效，宗教与社会主义社会相适应迈出新步伐。\n【思考问题】\n1. 如何深刻理解和准确把握习近平总书记关于做好新时代党的统一战线工作的重要思想？\n2. 如何健全完善大统战工作格局？如何加强党对统战工作的全面领导？\n3. 如何做好新时代统一战线各领域工作？如何坚持好发展好完善好中国新型政党制度？\n4. 如何创新新时代统战工作方式方法？如何创新思想引领方式、联谊交友方式、服务方式？\n5. 如何加强党外代表人士队伍建设？如何加强发现培养、教育引导、选拔使用、管理服务？\n6. 如何提高统战工作质量和水平？如何正确处理一致性和多样性关系？' },
        ],
        description: '本课程围绕新时代统一战线各领域工作，从理论基础、制度设计、政策要求到实践操作进行全链条讲解，特别注重案例教学和经验分享，提升基层统战干部的实际工作能力。课程涵盖统一战线基本理论、各领域工作实务、工作方法创新等内容，帮助学员全面掌握新时代统战工作的核心要义、政策要求和实践方法。',
        learningObjectives: [
          '掌握新时代统一战线各领域工作的基本理论',
          '熟悉多党合作、民族宗教、民营经济等领域政策',
          '了解基层统战工作创新发展的方向路径',
          '提升解决实际问题的能力水平',
          '增强做好新时代统战工作的责任感使命感',
        ],
      }
    },
    {
      key: 'party_style',
      name: '党风廉政建设专题',
      data: {
        courseName: '党风廉政建设专题课程',
        courseType: '廉政课程',
        totalHours: 1,
        difficulty: '中级',
        targetAudience: '党员干部',
        chapters: [
          { id: 1, title: '课程概述与党的自我革命重要思想', duration: '3分钟', type: 'video', content: '本课程聚焦党风廉政建设，通过系统讲授全面从严治党要求、党纪党规、警示案例，引导党员干部知敬畏、存戒惧、守底线，增强廉洁自律意识。课程涵盖党的自我革命、全面从严治党、党的纪律建设、廉洁自律、反腐败斗争等内容。\n\n党的自我革命是指党坚持真理、修正错误，敢于刀刃向内，敢于直面问题，敢于自我否定，不断清除一切损害党的先进性和纯洁性的因素，不断清除一切侵蚀党的健康肌体的病毒，确保党永远不变质、不变色、不变味。习近平总书记关于党的自我革命的重要思想，科学回答了我们党"为什么要自我革命、为什么能自我革命、怎样推进自我革命"等重大问题，标志着我们党对马克思主义政党建设规律、共产党执政规律的认识达到新高度。' },
          { id: 2, title: '第一讲：党的自我革命与全面从严治党战略方针', duration: '5分钟', type: 'video', content: '深入学习习近平总书记关于党的自我革命的重要思想，理解全面从严治党是新时代党的自我革命的伟大实践，深刻认识党风廉政建设和反腐败斗争的极端重要性。\n\n全面从严治党是党的十八大以来党中央作出的重大战略部署，是"四个全面"战略布局的重要组成部分。全面从严治党，核心是加强党的领导，基础在全面，关键在严，要害在治。"全面"就是管全党、治全党，面向全体党员、党组织，覆盖党的建设各个领域、各个方面、各个部门，重点是抓住"关键少数"。"严"就是真管真严、敢管敢严、长管长严。"治"就是从党中央到地方各级党委，从中央部委、国家机关部门党组（党委）到基层党支部，都要肩负起主体责任。\n\n党的十八大以来，全面从严治党取得了历史性、开创性成就，产生了全方位、深层次影响，赢得了保持同人民群众的血肉联系、人民衷心拥护的历史主动，赢得了全党高度团结统一、走在时代前列、带领人民实现中华民族伟大复兴的历史主动。' },
          { id: 3, title: '第二讲：党的纪律建设与《中国共产党纪律处分条例》解读', duration: '6分钟', type: 'video', content: '系统学习党的纪律的主要内容，重点解读《中国共产党纪律处分条例》，掌握政治纪律、组织纪律、廉洁纪律、群众纪律、工作纪律、生活纪律的具体要求。\n\n党的纪律是党的各级组织和全体党员必须遵守的行为规则，是维护党的团结统一、完成党的任务的保证。党的纪律主要包括政治纪律、组织纪律、廉洁纪律、群众纪律、工作纪律、生活纪律。政治纪律是最重要、最根本、最关键的纪律，是维护党的团结统一的根本保证。\n\n《中国共产党纪律处分条例》是规范党的纪律处分工作的重要党内法规，坚持问题导向，针对管党治党存在的突出问题作出新的规定，坚持严的基调，体现全面从严的要求，坚持纪法贯通，实现党纪与国法的衔接。党员干部必须熟练掌握条例的各项规定，做到知敬畏、存戒惧、守底线。' },
          { id: 4, title: '第三讲：中央八项规定精神与作风建设', duration: '5.5分钟', type: 'video', content: '深入学习中央八项规定及其实施细则精神，掌握持之以恒纠治"四风"、反对特权思想和特权现象、树立新风正气的要求，保持同人民群众的血肉联系。\n\n中央八项规定是2012年12月4日中共中央政治局会议审议通过的《十八届中央政治局关于改进工作作风、密切联系群众的八项规定》的简称。主要内容包括：改进调查研究、精简会议活动、精简文件简报、规范出访活动、改进警卫工作、改进新闻报道、严格文稿发表、厉行勤俭节约。\n\n作风建设永远在路上，落实中央八项规定精神只能紧、不能松。党的十八大以来，以习近平同志为核心的党中央从制定和落实中央八项规定开局破题，持之以恒正风肃纪，以钉钉子精神纠治"四风"，反对特权思想和特权现象，刹住了一些长期没有刹住的歪风，纠治了一些多年未除的顽瘴痼疾，风清气正的党内政治生态不断形成和发展。' },
          { id: 5, title: '第四讲：一体推进不敢腐、不能腐、不想腐', duration: '5.5分钟', type: 'video', content: '深入学习一体推进不敢腐、不能腐、不想腐的重要方略，理解不敢腐是前提、不能腐是关键、不想腐是根本，掌握同时发力、同向发力、综合发力的方法。\n\n一体推进不敢腐、不能腐、不想腐，是习近平总书记在长期实践中总结提出的新时代全面从严治党的重要方略，是反腐败斗争的基本方针。不敢腐、不能腐、不想腐是相互依存、相互促进的有机整体，必须统筹联动，增强总体效果。不敢腐是前提，侧重于惩治和威慑，解决的是腐败成本问题；不能腐是关键，侧重于制约和监督，解决的是腐败机会问题；不想腐是根本，侧重于教育和引导，解决的是腐败动机问题。\n\n这一方针体现了唯物辩证法的思想方法，体现了我们党对反腐败斗争规律认识的深化，为新时代深化反腐败斗争、巩固发展压倒性胜利提供了科学指引和根本遵循。' },
          { id: 6, title: '第五讲：警示教育典型案例分析', duration: '6分钟', type: 'video', content: '通过典型案例分析，用身边事教育身边人，增强警示教育的针对性和实效性，深刻认识违纪违法的严重后果。\n\n【违反政治纪律案例】某省原省委书记严重违反政治纪律，落实党中央决策部署不坚决，打折扣、搞变通，存在落实党中央脱贫攻坚决策部署不坚决、开展扫黑除恶专项斗争不力等问题；违反政治规矩，严重破坏党内政治生活，在党内搞团团伙伙、拉帮结派。警示教训：政治纪律是党最根本、最重要的纪律，党员干部必须严守党的政治纪律和政治规矩，深刻领悟"两个确立"的决定性意义。\n\n【违反中央八项规定精神案例】某市委原副书记严重违反中央八项规定精神，违规收受礼品礼金，接受可能影响公正执行公务的宴请和旅游安排，违规出入私人会所。警示教训：作风建设永远在路上，党员干部必须严格执行中央八项规定及其实施细则精神，持之以恒纠治"四风"。\n\n【违反廉洁纪律案例】某省原副省长利用职务上的便利和职权或者地位形成的便利条件，为他人谋取利益，非法收受他人财物，数额特别巨大。警示教训：廉洁自律是党员干部的立身之本、为政之德，必须严格遵守廉洁自律各项规定。' },
          { id: 7, title: '第六讲：廉洁自律与党性修养', duration: '5分钟', type: 'video', content: '增强廉洁自律意识，树立正确的权力观、地位观、利益观，做到廉洁从政、廉洁用权、廉洁修身、廉洁齐家，保持共产党人的政治本色，加强党性修养。\n\n廉洁自律是党员干部的立身之本、为政之德。党员干部必须严格遵守廉洁自律各项规定，树立正确的权力观、地位观、利益观，自觉抵制各种诱惑，做到廉洁从政、廉洁用权、廉洁修身、廉洁齐家，保持共产党人的政治本色。\n\n加强党性修养要从以下几个方面入手：一是加强理论学习，用党的创新理论武装头脑；二是加强政治修养，坚定理想信念；三是加强道德修养，培养高尚道德情操；四是加强作风修养，坚持和发扬党的优良传统和作风；五是加强纪律修养，增强纪律意识和规矩意识。' },
          { id: 8, title: '专题研讨与总结思考', duration: '6分钟', type: 'discussion', content: '专题讨论如何做到廉洁自律，总结课程学习收获，思考如何在实际工作中贯彻落实，增强管党治党政治责任，落实"两个责任"。\n\n【思考问题】\n1. 如何深刻理解习近平总书记关于党的自我革命的重要思想？如何深刻认识党的自我革命的重大意义？如何准确把握党的自我革命的历史经验？如何推进党的自我革命实践？\n2. 如何坚定不移推进全面从严治党？如何健全全面从严治党体系？如何把严的基调、严的措施、严的氛围长期坚持下去？如何解决大党独有难题？\n3. 如何加强党的纪律建设？如何严明党的政治纪律和政治规矩？如何严格执行党的纪律？如何强化纪律监督？如何运用"四种形态"？\n4. 如何一体推进不敢腐、不能腐、不想腐？如何强化不敢腐的震慑？如何扎牢不能腐的笼子？如何增强不想腐的自觉？\n5. 如何落实"两个责任"？如何落实党委（党组）主体责任？如何落实纪委监督责任？如何履行"一岗双责"？如何层层传导压力？\n6. 如何增强廉洁自律意识？如何树立正确的权力观、地位观、利益观？如何自觉抵制各种诱惑？如何做到廉洁从政、廉洁用权、廉洁修身、廉洁齐家？\n\n【结语】全面从严治党永远在路上，党的自我革命永远在路上。我们要以习近平新时代中国特色社会主义思想为指导，深入学习贯彻习近平总书记关于党的自我革命的重要思想，坚定不移推进全面从严治党，为全面建设社会主义现代化国家、全面推进中华民族伟大复兴提供坚强保证！' },
        ],
        description: '本课程聚焦党风廉政建设，通过系统讲授全面从严治党要求、党纪党规、警示案例，引导党员干部知敬畏、存戒惧、守底线，增强廉洁自律意识。课程涵盖党的自我革命、全面从严治党、党的纪律建设、廉洁自律、反腐败斗争等内容，帮助学员深刻认识党风廉政建设和反腐败斗争的重要意义，系统掌握党纪党规的具体要求，增强廉洁自律意识和拒腐防变能力。',
        learningObjectives: [
          '深刻领会全面从严治党的重大意义',
          '熟练掌握党纪党规的具体要求',
          '通过案例警示增强廉洁自律意识',
          '树立正确的权力观、地位观、利益观',
          '增强管党治党政治责任，落实"两个责任"',
        ],
      }
    },
  ];

  const router = useRouter();

  const thinkingSteps = [
    '正在读取您的知识图谱诊断结果...',
    '正在分析课程需求与目标受众...',
    '正在检索相关知识点与资料...',
    '正在设计课程结构与章节安排...',
    '正在生成课程内容与学习目标...',
    '正在优化课程大纲与教学设计...',
    '课程生成完成！',
  ];

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
        title: '第一讲：核心要义与科学体系',
        content: `深入学习${topic}的核心要义,理解其理论体系和实践要求。\n\n【理论内涵】${topic}具有深刻的理论内涵,是党的创新理论的重要组成部分。要从理论逻辑、历史逻辑、实践逻辑三个维度全面把握其科学体系。\n【核心要义】准确把握${topic}的核心要义,理解其时代价值和实践意义。要坚持理论联系实际,将学习成果转化为工作思路和举措。\n【实践要求】将${topic}作为指导思想和行动指南,运用其立场观点方法分析和解决实际问题,推动工作高质量发展。`
      },
      {
        title: '第二讲：政策要求与制度设计',
        content: `系统学习${topic}的政策要求和制度设计,掌握相关工作规范。\n\n【政策要求】深入学习党中央关于${topic}的重要决策部署,理解政策背景和目标要求。要准确把握政策精神,确保工作方向正确。\n【制度设计】了解${topic}相关的制度安排,掌握工作程序和操作方法。要严格按照制度要求开展工作,确保工作规范有序。\n【实践应用】将政策要求与工作实际相结合,创造性地开展工作。要善于运用制度优势解决实际问题,提高工作效率和质量。`
      },
      {
        title: '第三讲：实践方法与案例分析',
        content: `通过具体案例分析,学习${topic}的实践应用方法。\n\n【实践方法】掌握${topic}的工作方法和实践路径,提升解决实际问题的能力。要坚持问题导向,着力解决实际问题。\n【案例分析】通过典型案例学习,用身边事教育身边人,增强学习的针对性和实效性。案例涵盖成功经验做法,也有警示教训。\n【经验总结】总结提炼本地本部门的好经验好做法,形成可复制可推广的工作模式。要学习借鉴先进地区的成功经验,结合实际创新发展。`
      },
      {
        title: '第四讲：工作创新与发展趋势',
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
  const handleStartLearn = (chapterId: number) => {
    // 保存当前课程到localStorage供学习页使用
    if (generatedCourse) {
      localStorage.setItem('current_ai_course', JSON.stringify(generatedCourse));
    }
    router.push(`/library/course-learn/${chapterId}`);
  };

  return (
      <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
        {/* 搜索栏 */}
        <Card className="mb-8 border-orange-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索课程、知识点..." 
                  className="pl-10 border-orange-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="hot">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">最热</SelectItem>
                  <SelectItem value="latest">最新</SelectItem>
                  <SelectItem value="progress">我的进度</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">系统课程</TabsTrigger>
            <TabsTrigger value="micro">微课速学</TabsTrigger>
            <TabsTrigger value="quotes">金句收藏</TabsTrigger>
            <TabsTrigger value="ai-course">AI生成课程</TabsTrigger>
          </TabsList>

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
            {/* 顶部横幅导航区 */}
            <div className="mb-6 border-2 border-black bg-amber-400 px-5 py-3 flex items-center justify-between" style={{ boxShadow: '4px 4px 0 0 #000' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </div>
                <span className="text-lg font-black text-black tracking-tight">AI课程生成控制台</span>
              </div>
              <div className="flex items-center gap-2">
                {['平台总览', '课程库', '生成记录', '模板中心'].map((label) => (
                  <button
                    key={label}
                    className="px-4 py-1.5 bg-white border-2 border-black text-xs font-bold hover:bg-black hover:text-amber-400 transition-colors"
                    style={{ boxShadow: '2px 2px 0 0 #000' }}
                    disabled
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 主视觉标题区 + 右侧信息面板 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* 左侧：超大标题区 */}
              <div className="lg:col-span-2 border-2 border-black bg-white p-8 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000', transform: 'rotate(2deg)' }}>
                  AI DRIVEN
                </div>
                <h1 className="text-5xl font-black text-black mb-4 leading-none tracking-tighter" style={{ textShadow: '2px 2px 0 #e0e0e0' }}>
                  AI智能<br/>生成课程
                </h1>
                <p className="text-base text-gray-600 mb-6 max-w-lg leading-relaxed">
                  输入课程主题，AI自动设计课程结构、生成章节内容、匹配学习目标，让课程创作效率提升10倍。
                </p>
                {/* 输入区 */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="输入课程主题，如：习近平关于宗教工作的重要论述..."
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

                {/* 生成逻辑说明 */}
                <div className="mt-6 pt-6 border-t-2 border-black">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-amber-400 flex items-center justify-center border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                      <Lightbulb className="h-4 w-4 text-black" />
                    </div>
                    <span className="font-black text-sm text-black">
                      {generationLogic ? '本次生成逻辑解读' : '课程生成逻辑说明'}
                    </span>
                    {generationLogic && !generationLogic.hasDiagnosis && (
                      <span className="text-[10px] text-gray-500 ml-2">（通用模式）</span>
                    )}
                  </div>

                  {generationLogic ? (
                    /* 动态生成逻辑说明 - 基于诊断结果 */
                    <div className="space-y-3">
                      {/* 角色解读 */}
                      <div className="flex items-start gap-3 p-3 border-2 border-black bg-red-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="absolute -top-2.5 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5">身份匹配</div>
                        <div className="mt-1">
                          <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic.roleInterpretation}</div>
                        </div>
                      </div>
                      {/* 主题关联 */}
                      <div className="flex items-start gap-3 p-3 border-2 border-black bg-purple-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="absolute -top-2.5 left-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5">主题关联</div>
                        <div className="mt-1">
                          <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic.topicConnection}</div>
                        </div>
                      </div>
                      {/* 难度匹配 */}
                      <div className="flex items-start gap-3 p-3 border-2 border-black bg-amber-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="absolute -top-2.5 left-2 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5">难度适配</div>
                        <div className="mt-1">
                          <div className="text-[12px] text-gray-800 leading-relaxed">{generationLogic.difficultyMatch}</div>
                        </div>
                      </div>
                      {/* 综合推荐 */}
                      <div className="flex items-start gap-3 p-3 border-2 border-black bg-emerald-50 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="absolute -top-2.5 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">综合推荐</div>
                        <div className="mt-1">
                          <div className="text-[12px] text-gray-800 leading-relaxed font-medium">{generationLogic.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 通用5步流程说明 - 未生成课程时显示 */
                    <>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { step: '01', title: '诊断读取', desc: '读取您的知识图谱诊断结果' },
                          { step: '02', title: '需求分析', desc: '理解您的课程主题与目标受众' },
                          { step: '03', title: '知识检索', desc: '从党建知识库中匹配相关内容' },
                          { step: '04', title: '结构设计', desc: '自动编排章节顺序与课时分配' },
                          { step: '05', title: '目标匹配', desc: '输出学习目标与课程简介' },
                        ].map((item) => (
                          <div key={item.step} className="border-2 border-black bg-gray-50 p-3 relative" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                            <div className="absolute -top-2.5 left-2 bg-black text-amber-400 text-[10px] font-black px-2 py-0.5">
                              {item.step}
                            </div>
                            <div className="font-black text-sm text-black mb-1 mt-1">{item.title}</div>
                            <div className="text-[11px] text-gray-600 leading-snug">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1 h-3 bg-purple-600 rounded-full"></span>
                        基于大语言模型 + 党建知识图谱 + 您的诊断结果 · 生成结果可编辑后确认创建
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 右侧信息面板 */}
              <div className="border-2 border-black bg-purple-600 p-6 text-white relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                <div className="absolute top-3 right-3 bg-amber-400 text-black text-xs font-bold px-2 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                  平台能力
                </div>
                <div className="mt-4">
                  <div className="text-6xl font-black mb-1" style={{ textShadow: '3px 3px 0 #000' }}>
                    {isGenerating ? `${currentStep + 1}` : '5'}
                  </div>
                  <div className="text-sm font-bold mb-4">大步骤智能生成</div>
                  <div className="space-y-2 mb-5">
                    {thinkingSteps.slice(0, isGenerating ? currentStep + 1 : 5).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1.5 border border-white/30">
                        {idx < currentStep || !isGenerating ? (
                          <CheckCircle2 className="h-3 w-3 text-amber-400 flex-shrink-0" />
                        ) : (
                          <span className="w-3 h-3 flex-shrink-0 animate-pulse text-amber-400">●</span>
                        )}
                        <span className="truncate">{step.replace('正在', '').replace('...', '')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/60 border-t border-white/20 pt-3">
                    基于大语言模型与知识图谱驱动
                  </div>
                </div>
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
                      <span className={idx <= currentStep ? 'text-white' : 'text-gray-600'}>{step}</span>
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
                {/* 功能统计卡片行 */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: '课程类型', value: generatedCourse.courseType, color: 'bg-purple-500', icon: '📋' },
                    { label: '总学时', value: `${generatedCourse.totalHours}学时`, color: 'bg-amber-400', icon: '⏱' },
                    { label: '难度等级', value: generatedCourse.difficulty, color: 'bg-pink-500', icon: '📊' },
                    { label: '章节数', value: `${editMode ? editedChapters.length : generatedCourse.chapters.length}章`, color: 'bg-emerald-500', icon: '📑' },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`${stat.color} border-2 border-black p-5 relative text-white`}
                      style={{ boxShadow: '4px 4px 0 0 #000' }}
                    >
                      <div className="absolute top-2 right-2 text-xl">{stat.icon}</div>
                      <div className="text-3xl font-black mb-1" style={{ textShadow: '2px 2px 0 #000' }}>{stat.value}</div>
                      <div className="text-sm font-bold opacity-80">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* 课程基本信息卡片 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {/* 左侧：课程简介 */}
                  <div className="border-2 border-black bg-white p-6 relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                    <div className="absolute -top-3 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                      01 · 课程简介
                    </div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <h3 className="font-black text-xl text-black">{generatedCourse.courseName}</h3>
                      <div className="flex gap-2">
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

                  {/* 右侧：目标受众 */}
                  <div className="border-2 border-black bg-emerald-500 p-6 text-white relative" style={{ boxShadow: '4px 4px 0 0 #000' }}>
                    <div className="absolute -top-3 right-4 bg-amber-400 text-black text-xs font-black px-3 py-1 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                      02 · 受众分析
                    </div>
                    <div className="mt-2">
                      <div className="text-4xl font-black mb-2" style={{ textShadow: '2px 2px 0 #000' }}>
                        {generatedCourse.targetAudience}
                      </div>
                      <div className="text-sm opacity-90 mb-6">目标受众群体</div>
                      <div className="bg-white text-black p-4 border-2 border-black" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                        <div className="font-bold text-sm mb-2">课程信息</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">类型</span>
                            <span className="font-bold">{generatedCourse.courseType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">学时</span>
                            <span className="font-bold">{generatedCourse.totalHours}学时</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">难度</span>
                            <span className="font-bold">{generatedCourse.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                                    📑 图文课
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {!editMode && (
                            <Button size="sm" className="bg-amber-400 text-black font-bold border-2 border-black hover:bg-amber-500" style={{ borderRadius: '0', boxShadow: '2px 2px 0 0 #000' }} onClick={() => handleStartLearn(chapter.id)}>
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
                        {/* 章节内容详情展示 */}
                        {!editMode && chapter.content && (
                          <div className="mt-4 pt-4 border-t-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-bold text-gray-700">章节内容</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-1">{chapter.content}</p>
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
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
  );
}
