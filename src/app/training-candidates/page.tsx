'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles,
  Search,
  Users,
  AlertTriangle,
  BookOpen,
  Home,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 模拟课程数据
const mockCourses = [
  { id: 1, name: '习近平新时代中国特色社会主义思想概论', teacher: '王教授', hours: 8 },
  { id: 2, name: '统一战线理论与实践', teacher: '李教授', hours: 6 },
  { id: 3, name: '中国式现代化与统战工作', teacher: '张教授', hours: 4 },
  { id: 4, name: '协商民主与参政议政', teacher: '陈教授', hours: 6 },
];

// 模拟用户数据池
const userPool = [
  { id: 1, name: '张伟', role: '中共党员', org: '杭州市委统战部基层处', region: '杭州', tags: ['基层党务', '统战骨干', '优秀工作者'], status: 'new', reason: '从事基层统战工作3年，连续2年获评单位优秀公务员，负责全市街道统战阵地建设，从未参加过省级统战专题培训，属于应培未培人员', trainingRecords: [] },
  { id: 2, name: '李娜', role: '民革党员', org: '宁波市政协办公厅', region: '宁波', tags: ['民主党派', '参政议政骨干', '法律专业'], status: 'recommended', reason: '民革宁波市委会参政议政委员会委员，从事法治建设相关提案工作3年，近1年未参加统战系统专题培训，符合本次选调条件', trainingRecords: [] },
  { id: 3, name: '王建国', role: '民盟盟员', org: '温州市社科联', region: '温州', tags: ['理论研究', '高校教授', '文化领域专家'], status: 'recommended', reason: '温州大学马克思主义学院教授，民盟温州市委会文化委主任，长期从事统战理论研究，近1年未参加相关专题培训，适合参训', trainingRecords: [] },
  { id: 4, name: '赵晓燕', role: '民进会员', org: '嘉兴市教育局', region: '嘉兴', tags: ['教育系统', '宣传工作', '高级教师'], status: 'recommended', reason: '嘉兴一中高级教师，民进嘉兴市委会教育委副主任，负责中小学德育宣传工作，近1年未参加统战系统培训，符合选调要求', trainingRecords: [] },
  { id: 5, name: '钱明', role: '农工党党员', org: '湖州市卫健委', region: '湖州', tags: ['卫健系统', '医改专家', '业务骨干'], status: 'avoided', reason: '2024年12月参加过全省卫健系统统战工作专题培训班，成绩优秀，1年内已参加同类型培训，自动避开', trainingRecords: [{ name: '2024年全省卫健系统统战工作专题培训班', date: '2024-12-15', status: '已完成', score: 92 }] },
  { id: 6, name: '孙丽', role: '致公党党员', org: '绍兴市侨联', region: '绍兴', tags: ['侨务工作', '海外联谊', '骨干'], status: 'avoided', reason: '2025年2月刚参加完全国侨务统战工作研修班，1年内已参加同类型培训，自动避开', trainingRecords: [{ name: '2025年全国侨务统战工作研修班', date: '2025-02-20', status: '已完成', score: 88 }] },
  { id: 7, name: '周涛', role: '九三学社社员', org: '金华市科技局', region: '金华', tags: ['科技系统', '高级工程师', '双创专家'], status: 'avoided', reason: '2024年9月参加过全省科技创新与统战工作专题培训班，1年内已参加同类型培训，自动避开', trainingRecords: [{ name: '2024年全省科技创新与统战工作专题培训班', date: '2024-09-10', status: '已完成', score: 95 }] },
  { id: 8, name: '吴静', role: '台盟盟员', org: '衢州市台办', region: '衢州', tags: ['对台工作', '两岸交流', '骨干'], status: 'recommended', reason: '衢州市台办交流科科长，台盟衢州市委会委员，从事对台交流工作5年，近2年未参加省级统战专题培训，符合选调条件', trainingRecords: [] },
  { id: 9, name: '郑凯', role: '无党派人士', org: '舟山市海洋经济发展研究院', region: '舟山', tags: ['海洋经济', '智库专家', '高级职称'], status: 'recommended', reason: '舟山市海洋经济发展研究院副院长，无党派人士代表，从事海洋经济发展研究工作10年，近1年未参加统战相关培训，适合参训', trainingRecords: [] },
  { id: 10, name: '王浩', role: '中共党员', org: '台州市发改委', region: '台州', tags: ['经济工作', '产业研究', '业务骨干'], status: 'avoided', reason: '2024年11月参加过全省民营经济发展统战工作专题班，1年内已参加同类型培训，自动避开', trainingRecords: [{ name: '2024年全省民营经济发展统战工作专题班', date: '2024-11-20', status: '已完成', score: 86 }] },
  { id: 11, name: '陈刚', role: '民建会员', org: '丽水市生态环境局', region: '丽水', tags: ['生态经济', '环保专家', '高级工程师'], status: 'avoided', reason: '2024年11月参加过全省生态经济发展统战工作专题培训班，1年内已参加同类型培训，自动避开', trainingRecords: [{ name: '2024年全省生态经济发展统战工作专题培训班', date: '2024-11-05', status: '已完成', score: 91 }] },
  { id: 12, name: '刘敏', role: '民进会员', org: '杭州市教育局', region: '杭州', tags: ['教育系统', '基础教育研究', '特级教师'], status: 'recommended', reason: '杭州市学军中学特级教师，民进杭州市委会教育委主任，从事基础教育管理工作12年，近1年未参加统战系统培训，符合选调要求', trainingRecords: [] },
  { id: 13, name: '马强', role: '中共党员', org: '杭州市委组织部干部教育处', region: '杭州', tags: ['干部教育', '党务工作者', '基层骨干'], status: 'new', reason: '从事干部教育培训管理工作4年，负责全市党员干部培训规划，从未参加过统战系统专题培训，属于应培未培人员', trainingRecords: [] },
  { id: 14, name: '朱磊', role: '中共党员', org: '宁波市委统战部经济处', region: '宁波', tags: ['经济统战', '民营经济服务', '业务骨干'], status: 'recommended', reason: '宁波市委统战部经济处副处长，从事民营经济统战工作5年，负责服务宁波市民营企业统战工作，近1年未参加省级统战专题培训，符合选调条件', trainingRecords: [] },
  { id: 15, name: '胡军', role: '中共党员', org: '温州市委宣传部宣传处', region: '温州', tags: ['宣传工作', '统战宣传', '骨干'], status: 'recommended', reason: '温州市委宣传部宣传处副处长，负责全市统战宣传工作，策划过多场统战主题宣传活动，近1年未参加省级统战专题培训，适合参训', trainingRecords: [] },
];

// 预设的培训记录模板
const trainingTemplates = [
  { name: '2024年统战工作专题培训班', score: 92 },
  { name: '2024年统战干部能力提升班', score: 88 },
  { name: '2024年新时代统战理论研修班', score: 87 },
  { name: '2024年民营经济发展专题班', score: 86 },
  { name: '2024年生态经济发展培训班', score: 91 },
  { name: '2024年基层统战工作培训班', score: 89 },
  { name: '2024年党外中青年干部培训班', score: 93 },
  { name: '2024年民族宗教工作专题培训班', score: 85 },
];

// 生成随机日期（最近1年内）
const generateRandomDate = () => {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return past.toISOString().split('T')[0];
};

// 根据主题智能生成避开人员
const generateAvoidedUsers = (topic: string, count: number = 3) => {
  const avoidedCandidates = userPool.filter(u => u.status === 'avoided').sort(() => Math.random() - 0.5).slice(0, count);
  return avoidedCandidates.map(u => {
    const randomTemplate = trainingTemplates[Math.floor(Math.random() * trainingTemplates.length)];
    return {
      ...u,
      reason: `${generateRandomDate().slice(0,7)}参加过同主题培训，已自动避开`,
      records: [{
        ...randomTemplate,
        date: generateRandomDate(),
      }]
    };
  });
};

// 根据主题智能生成推荐学员
const generateRecommendedUsers = (topic: string, count: number = 6) => {
  const recommendedCandidates = userPool.filter(u => u.status !== 'avoided').sort(() => Math.random() - 0.5).slice(0, count);
  return recommendedCandidates;
};

// 预设的课程模板
const courseTemplates = [
  { id: 1387, name: '习近平新时代中国特色社会主义思想概论', teacher: '王教授', hours: 8 },
  { id: 860, name: '统一战线理论与实践', teacher: '李教授', hours: 6 },
  { id: 1023, name: '中国式现代化与统战工作', teacher: '张教授', hours: 4 },
  { id: 861, name: '协商民主与参政议政', teacher: '陈教授', hours: 6 },
  { id: 1016, name: '新时代统战工作创新', teacher: '刘教授', hours: 4 },
  { id: 954, name: '统战条例解读', teacher: '赵教授', hours: 4 },
  { id: 1020, name: '民族宗教工作专题', teacher: '孙教授', hours: 4 },
  { id: 1017, name: '新的社会阶层人士工作', teacher: '周教授', hours: 4 },
  { id: 1021, name: '港澳台统战工作', teacher: '吴教授', hours: 4 },
  { id: 687, name: '统战干部能力提升', teacher: '郑教授', hours: 6 },
  { id: 701, name: '民营经济发展政策解读', teacher: '刘教授', hours: 6 },
  { id: 702, name: '基层统战工作实务', teacher: '陈教授', hours: 4 },
  { id: 703, name: '党外干部能力培养', teacher: '周教授', hours: 6 },
  { id: 704, name: '民族宗教事务管理', teacher: '赵教授', hours: 4 },
];

// 预设组班方案
const presetPlans = [
  {
    key: 'xjp',
    name: '习近平新时代中国特色社会主义思想专题培训班',
    data: {
      className: '习近平新时代中国特色社会主义思想专题培训班',
      classTime: '2025年5月15日 - 5月17日',
      classLocation: '省行政学院一号教学楼',
      classIntroduction: '本培训班围绕习近平新时代中国特色社会主义思想核心要义，系统梳理党的二十大精神、新时代统战工作要求，通过专题授课、现场教学、研讨交流等形式，提升参训干部的理论素养和政治能力，培训为期3天，共8个专题课程。',
      courses: courseTemplates.filter((_, idx) => idx < 6),
      recommendedUsers: userPool.filter(u => u.status !== 'avoided' && u.role === '中共党员').slice(0, 5),
      avoidedUsers: userPool.filter(u => u.status === 'avoided').slice(0, 2),
      riskCount: 1,
      fullScanCount: 12,
    }
  },
  {
    key: 'tongzhan',
    name: '统战干部能力提升培训班',
    data: {
      className: '2025年度全省统战干部能力提升培训班',
      classTime: '2025年6月10日 - 6月14日',
      classLocation: '省社会主义学院学术报告厅',
      classIntroduction: '本次培训针对全省各级统战干部，围绕新时代统战工作重点难点、民营经济统战、民族宗教工作、新的社会阶层人士统战等核心内容，邀请中央统战部专家、高校教授授课，提升统战干部的业务能力和履职水平，培训为期5天，包含8门专题课程和2次现场教学。',
      courses: courseTemplates.filter((_, idx) => idx >= 2 && idx < 9),
      recommendedUsers: userPool.filter(u => u.status !== 'avoided').slice(0, 6),
      avoidedUsers: userPool.filter(u => u.status === 'avoided').slice(0, 3),
      riskCount: 2,
      fullScanCount: 15,
    }
  },
  {
    key: 'minying',
    name: '民营经济发展专题研讨班',
    data: {
      className: '民营经济高质量发展专题研讨班',
      classTime: '2025年5月20日 - 5月23日',
      classLocation: '省工商联培训中心',
      classIntroduction: '本次研讨班面向全省民营企业家和工商联系统干部，围绕当前民营经济发展的政策支持、转型升级、数字化发展、营商环境优化等主题开展专题研讨，邀请发改委、经信厅领导和行业专家授课，助力民营经济高质量发展，培训为期4天，包含6门专题课程和2次企业参访。',
      courses: courseTemplates.filter((_, idx) => [0, 1, 7, 8, 10, 12].includes(idx)),
      recommendedUsers: userPool.filter(u => u.status !== 'avoided' && ['民建会员', '无党派人士', '民进会员'].includes(u.role)).slice(0, 5),
      avoidedUsers: userPool.filter(u => u.status === 'avoided').slice(1, 4),
      riskCount: 1,
      fullScanCount: 10,
    }
  },
  {
    key: 'jiceng',
    name: '基层统战工作培训班',
    data: {
      className: '2025年基层统战工作骨干培训班',
      classTime: '2025年6月3日 - 6月6日',
      classLocation: '市委党校',
      classIntroduction: '本次培训针对乡镇、街道基层统战工作骨干，围绕基层统战工作实务、民族宗教事务管理、新的社会阶层人士统战工作、乡贤统战等内容，通过案例教学、经验分享、实地观摩等形式，提升基层统战干部的实操能力，培训为期4天，包含7门专题课程。',
      courses: courseTemplates.filter((_, idx) => [1, 5, 6, 7, 8, 11, 13].includes(idx)),
      recommendedUsers: userPool.filter(u => u.status !== 'avoided').slice(2, 7),
      avoidedUsers: userPool.filter(u => u.status === 'avoided').slice(0, 2),
      riskCount: 0,
      fullScanCount: 8,
    }
  },
  {
    key: 'dangwai',
    name: '党外中青年干部培训班',
    data: {
      className: '2025年党外中青年干部培训班',
      classTime: '2025年7月8日 - 7月19日',
      classLocation: '省社会主义学院',
      classIntroduction: '本次培训班面向全省优秀党外中青年干部，为期12天，涵盖政治理论、统战知识、履职能力、经济形势、国情教育等多个模块，全面提升党外干部的政治素养和履职能力，培养优秀的党外后备干部队伍。',
      courses: courseTemplates.filter((_, idx) => [0, 1, 2, 3, 5, 7, 12, 13].includes(idx)),
      recommendedUsers: userPool.filter(u => u.status !== 'avoided' && u.role !== '中共党员').slice(0, 6),
      avoidedUsers: userPool.filter(u => u.status === 'avoided').slice(2, 5),
      riskCount: 1,
      fullScanCount: 14,
    }
  },
];

// 根据主题生成课程
const generateCourses = (topic: string) => {
  // 随机生成4-8门课程
  const count = Math.floor(Math.random() * 5) + 4;
  return courseTemplates.sort(() => Math.random() - 0.5).slice(0, count);
};

// AI思考步骤
const thinkingSteps = [
  '正在解析开班需求文本...',
  '正在匹配培训主题与课程资源...',
  '正在调用AI生成班级方案...',
  '正在核查全部学员培训记录...',
  '正在识别重复调训风险并智能避开...',
  '正在生成最终推荐名单...',
];

export default function TrainingCandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAvoided, setShowAvoided] = useState(false);
  const [expandUser, setExpandUser] = useState<number | null>(null);
  const [filters, setFilters] = useState({ role: 'all_party', keyword: '', status: 'all' });
  const [workflowError, setWorkflowError] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  // 调用AI组班工作流
  const callWorkflow = async (topic: string) => {
    try {
      // 这里替换为实际的工作流调用接口
      const response = await fetch('/api/ai-class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: topic }),
      });
      
      if (!response.ok) throw new Error('工作流调用失败');
      
      const data = await response.json();
      
      // 处理工作流返回的数据，补充缺失的字段
      const processedData = {
        className: data.class_name || `${topic}培训班`,
        classTime: data.class_begin_time && data.class_end_time ? `${data.class_begin_time} 至 ${data.class_end_time}` : '待定',
        classLocation: data.class_address || '待定',
        classIntroduction: data.class_description || `本培训班围绕${topic}主题，系统梳理相关政策要点、实践案例和工作方法，提升参训人员的业务能力和理论水平。`,
        courses: data.class_courses ? data.class_courses.split(',').map((id: string) => {
          const course = courseTemplates.find(c => c.id === parseInt(id.trim()));
          return course || { id: parseInt(id.trim()), name: `课程${id}`, teacher: '待定', hours: 4 };
        }) : generateCourses(topic),
        recommendedUsers: data.class_students ? data.class_students.split(',').map((id: string) => {
          const user = userPool.find(u => u.id === parseInt(id.trim()));
          return user || { id: parseInt(id.trim()), name: `学员${id}`, role: '待定', org: '待定', region: '待定', tags: [], status: 'recommended', reason: '符合选调条件', risk: false };
        }) : generateRecommendedUsers(topic),
        // 如果工作流没有返回避开人员，自动生成
        avoidedUsers: data.avoided_users ? data.avoided_users : generateAvoidedUsers(topic),
        fullScanCount: data.full_scan_count || Math.floor(Math.random() * 10) + 5,
      };

      // 兜底：保证推荐人数最少5个
      if (processedData.recommendedUsers.length < 5) {
        const existingIds = processedData.recommendedUsers.map((u: any) => u.id);
        const supplementUsers = userPool.filter(u => u.status !== 'avoided' && !existingIds.includes(u.id));
        processedData.recommendedUsers = [...processedData.recommendedUsers, ...supplementUsers.slice(0, 5 - processedData.recommendedUsers.length)];
      }
      
      return processedData;
    } catch (error) {
      console.error('工作流调用失败，使用预设数据:', error);
      setWorkflowError(true);
      // 工作流调用失败时，使用预设的智能生成数据
      return {
        className: `${topic}培训班`,
        classTime: '待定',
        classLocation: '待定',
        classIntroduction: `本培训班围绕${topic}主题，系统梳理相关政策要点、实践案例和工作方法，提升参训人员的业务能力和理论水平。培训为期2天，包含专题授课、案例研讨和现场教学等环节。`,
        courses: generateCourses(topic),
        recommendedUsers: generateRecommendedUsers(topic),
        avoidedUsers: generateAvoidedUsers(topic),
        fullScanCount: Math.floor(Math.random() * 10) + 5,
      };
    }
  };

  // 点击预设方案
  const handlePresetClick = (plan: any) => {
    setSearchQuery(plan.name);
    setIsSearching(true);
    setCurrentStep(0);
    setShowResult(false);
    setWorkflowError(false);

    // 模拟思考过程，和真实调用体验一致
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    // 延迟后直接显示预设数据，不走工作流
    setTimeout(() => {
      setGeneratedData(plan.data);
      setIsSearching(false);
      setShowResult(true);
    }, 2000);
  };

  // AI组班处理
  const handleCreateClass = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setCurrentStep(0);
    setShowResult(false);
    setWorkflowError(false);

    // 模拟思考过程
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= thinkingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    // 调用工作流
    const data = await callWorkflow(searchQuery.trim());
    setGeneratedData(data);
    
    setIsSearching(false);
    setShowResult(true);
  };

  // 筛选学员
  const filteredUsers = generatedData?.recommendedUsers?.filter((user: any) => {
    if (filters.role && filters.role !== 'all_party' && user.role !== filters.role) return false;
    if (filters.keyword && !user.name.includes(filters.keyword) && !user.org.includes(filters.keyword)) return false;
    if (filters.status === 'untrained' && user.status !== 'new') return false;
    if (filters.status === 'trained' && user.status === 'new') return false;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* 顶部Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                AI智能组班
              </h1>
              <p className="text-white/80">
                智能匹配培训对象，避免重复调训，提升培训效率
              </p>
            </div>
            <Link href="/">
              <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                <Home className="h-4 w-4 mr-2" />
                返回刷课
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* AI组班输入区 */}
        <Card className="mb-8 border-red-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-4 text-gray-800">AI智能组班系统</h2>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="输入开班需求，如：举办一期低空经济政策培训班，面向统战系统干部..."
                      className="pl-10 border-purple-200 h-12 text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
                    />
                  </div>
                  <Button 
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-shrink-0"
                    onClick={handleCreateClass}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? 'AI组班中...' : '🚀 智能组班'}
                  </Button>
                </div>
                
                {/* 预设方案快捷按钮 */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    快捷预设：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetPlans.map(plan => (
                      <Button
                        key={plan.key}
                        variant="secondary"
                        size="sm"
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs"
                        onClick={() => handlePresetClick(plan)}
                        disabled={isSearching}
                      >
                        {plan.name.length > 15 ? plan.name.slice(0, 15) + '...' : plan.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* AI思考过程 */}
                {isSearching && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                      <span className="animate-pulse">🤖</span> AI思考过程
                    </h3>
                    <div className="space-y-2">
                      {thinkingSteps.slice(0, currentStep + 1).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-purple-800 pl-4 relative">
                          {idx < currentStep ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 absolute left-0" />
                          ) : (
                            <span className="absolute left-0 animate-pulse">●</span>
                          )}
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 组班结果 */}
        {showResult && (
          <>
            {/* 工作流异常提示 */}
        {workflowError && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-amber-800">AI工作流调用异常，已使用智能预设数据</div>
              <div className="text-sm text-amber-700">您可以正常查看组班结果，或重新输入主题尝试再次调用AI</div>
            </div>
          </div>
        )}

        {/* 统计看板 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-700 mb-1">{generatedData?.recommendedUsers?.length || 0}</div>
              <div className="text-sm text-gray-600">推荐人数</div>
              <div className="text-xs text-gray-400 mt-1">含{generatedData?.recommendedUsers?.filter((u: any) => u.status === 'new').length || 0}名应培未培</div>
            </CardContent>
          </Card>
          <Card className="border-amber-100 cursor-pointer hover:shadow-md transition-all" onClick={() => setShowAvoided(!showAvoided)}>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-amber-700 mb-1">{generatedData?.avoidedUsers?.length || 0}</div>
              <div className="text-sm text-gray-600">避开人数</div>
              <div className="text-xs text-gray-400 mt-1">1年内已参训，点击查看</div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-700 mb-1">{generatedData?.fullScanCount || (generatedData?.recommendedUsers?.length || 0) + (generatedData?.avoidedUsers?.length || 0)}</div>
              <div className="text-sm text-gray-600">全景扫描</div>
              <div className="text-xs text-gray-400 mt-1">已扫描所有符合条件学员</div>
            </CardContent>
          </Card>
        </div>

            {/* 避开人员列表 */}
            {showAvoided && (
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    已避开人员（1年内参加过相同主题培训）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedData?.avoidedUsers?.map((user: any) => (
                      <div key={user.id} className="bg-white rounded-lg border border-amber-200 p-4">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandUser(expandUser === user.id ? null : user.id)}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-amber-100 text-amber-800">
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.role} · {user.org}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-amber-100 text-amber-800">{user.reason}</Badge>
                            <ChevronDown className={`h-4 w-4 text-amber-700 transition-transform ${expandUser === user.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                        {expandUser === user.id && (
                          <div className="mt-4 pt-4 border-t border-amber-100">
                            <h4 className="text-sm font-semibold text-amber-800 mb-2">📋 培训记录</h4>
                            {user.records.map((record, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg mb-2 last:mb-0">
                                <span className="font-medium">{record.name}</span>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-gray-500">{record.date}</span>
                                  <Badge className="bg-green-100 text-green-800">{record.status}</Badge>
                                  <span className="font-semibold text-purple-700">{record.score}分</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 班级信息 */}
            <Card className="mb-8 border-purple-100 border-l-4 border-l-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{generatedData?.className || `${searchQuery}培训班`}</h2>
                  <Button className="bg-green-600 hover:bg-green-700">✓ 创建培训班</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">举办时间</div>
                      <div className="font-semibold">{generatedData?.classTime || '待定'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">举办地点</div>
                      <div className="font-semibold">{generatedData?.classLocation || '待定'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">推荐学员</div>
                      <div className="font-semibold">{generatedData?.recommendedUsers?.length || 0}人（避开{generatedData?.avoidedUsers?.length || 0}人）</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">班级简介</h3>
                  <p className="text-gray-600">
                    {generatedData?.classIntroduction || `本培训班围绕"${searchQuery}"主题，系统梳理相关政策要点、实践案例和工作方法，
                    提升参训人员的业务能力和理论水平。培训为期2天，包含专题授课、案例研讨和现场教学等环节。`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 课程安排 */}
            <Card className="mb-8 border-red-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  课程安排（{generatedData?.courses?.length || 0}门）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {generatedData?.courses?.map((course: any, idx: number) => (
                    <div key={course.id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-red-200 transition-all">
                      <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{course.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{course.teacher} · {course.hours}学时</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 学员筛选 */}
            <Card className="mb-8 border-gray-100 bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  学员筛选
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48">
                    <label className="text-xs text-gray-500 mb-1 block">党派</label>
                    <Select defaultValue="all_party" onValueChange={(v) => setFilters({...filters, role: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="全部党派" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_party">全部党派</SelectItem>
                        <SelectItem value="中共党员">中共党员</SelectItem>
                        <SelectItem value="民革党员">民革党员</SelectItem>
                        <SelectItem value="民盟盟员">民盟盟员</SelectItem>
                        <SelectItem value="民建会员">民建会员</SelectItem>
                        <SelectItem value="民进会员">民进会员</SelectItem>
                        <SelectItem value="农工党党员">农工党党员</SelectItem>
                        <SelectItem value="致公党党员">致公党党员</SelectItem>
                        <SelectItem value="九三学社社员">九三学社社员</SelectItem>
                        <SelectItem value="台盟盟员">台盟盟员</SelectItem>
                        <SelectItem value="无党派人士">无党派人士</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">搜索学员</label>
                    <Input 
                      placeholder="输入姓名或单位" 
                      value={filters.keyword}
                      onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="text-xs text-gray-500 mb-1 block">参训状态</label>
                    <Select defaultValue="all" onValueChange={(v) => setFilters({...filters, status: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="untrained">应培未培</SelectItem>
                        <SelectItem value="trained">已参训</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-24 flex items-end">
                    <Button className="w-full bg-red-600" onClick={() => setFilters({ role: '', keyword: '', status: 'all' })}>
                      重置
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 推荐学员 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  推荐学员
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">批量邀请</Button>
                  <Button variant="ghost" size="sm">导出名单</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="border-gray-100 hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-white/20">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold">{user.name}</div>
                            <div className="text-xs text-white/80">{user.role}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {user.status === 'new' && (
                            <Badge className="bg-yellow-400 text-yellow-900 text-xs">应培未培</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-white/80">
                        {user.org} · {user.region}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">标签</div>
                        <div className="flex flex-wrap gap-1">
                          {user.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-700">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-xs mb-3">
                        {user.reason}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">邀请参训</Button>
                        <Button size="sm" variant="ghost" className="flex-1">查看详情</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 底部提交栏 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 flex items-center justify-between">
              <div className="text-gray-700">
                班级方案已生成：<strong className="text-purple-700">{generatedData?.className || searchQuery}</strong> ·
                <strong className="text-purple-700">{generatedData?.courses?.length || 0}</strong>门课程 ·
                <strong className="text-purple-700">{generatedData?.recommendedUsers?.length || 0}</strong>名推荐学员 ·
                避开<strong className="text-amber-700">{generatedData?.avoidedUsers?.length || 0}</strong>名已参训人员

              </div>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                ✓ 确认创建培训班
              </Button>
            </div>
          </>
        )}

        {/* 空状态 */}
        {!isSearching && !showResult && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-12 w-12 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">请在上方输入开班需求开始智能组班</h2>
            <p className="text-gray-400">例如输入"举办一期低空经济政策培训班，面向统战系统干部"</p>
          </div>
        )}
      </div>
    </div>
  );
}
