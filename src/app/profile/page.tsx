'use client';

import { useState } from 'react';
import { 
  BookOpen,
  Search,
  Bell,
  Settings,
  User,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Home,
  Eye,
  Bookmark,
  Heart,
  Trophy,
  BarChart3,
  Target,
  Users,
  Video,
  FileText,
  Image as ImageIcon,
  Edit3,
  LogOut,
  ChevronRight,
  StarHalf,
  Flame,
  Layers3,
  Bell as BellIcon,
  Shield,
  Palette,
  Globe,
  Moon,
  Volume2,
  HelpCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

// 用户数据
const userData = {
  name: '优秀党员',
  avatar: null,
  department: '党委办公室',
  joinDate: '2022年3月',
  level: '学习达人',
  levelProgress: 75,
  totalDays: 365,
  totalHours: 128,
  totalCourses: 45,
  totalNotes: 23,
  streak: 12,
  rank: 156,
  totalUsers: 12580,
};

// 学习成就
const achievements = [
  { id: 1, name: '学习新星', desc: '完成首个课程', icon: Star, unlocked: true, date: '2022-03-15' },
  { id: 2, name: '连续7天', desc: '连续学习一周', icon: Flame, unlocked: true, date: '2022-04-01' },
  { id: 3, name: '理论达人', desc: '完成10篇理论学习', icon: BookOpen, unlocked: true, date: '2022-06-20' },
  { id: 4, name: '笔记达人', desc: '撰写20篇笔记', icon: Edit3, unlocked: false, date: null },
  { id: 5, name: '党史专家', desc: '完成党史专题', icon: Trophy, unlocked: false, date: null },
  { id: 6, name: '学习冠军', desc: '连续学习30天', icon: Award, unlocked: false, date: null },
];

// 学习日历数据
const calendarData = [
  { date: '2024-03-01', completed: true },
  { date: '2024-03-02', completed: true },
  { date: '2024-03-03', completed: true },
  { date: '2024-03-04', completed: false },
  { date: '2024-03-05', completed: true },
  { date: '2024-03-06', completed: true },
  { date: '2024-03-07', completed: true },
  { date: '2024-03-08', completed: true },
  { date: '2024-03-09', completed: true },
  { date: '2024-03-10', completed: false },
  { date: '2024-03-11', completed: true },
  { date: '2024-03-12', completed: true },
  { date: '2024-03-13', completed: true },
  { date: '2024-03-14', completed: true },
  { date: '2024-03-15', completed: true },
  { date: '2024-03-16', completed: true },
  { date: '2024-03-17', completed: false },
  { date: '2024-03-18', completed: true },
  { date: '2024-03-19', completed: true },
  { date: '2024-03-20', completed: true },
  { date: '2024-03-21', completed: true },
  { date: '2024-03-22', completed: true },
];

export default function ProfilePage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 顶部个人信息卡片 */}
      <div 
        className="relative"
        style={{
          backgroundImage: "url('/profile-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 半透明遮罩 - 增加文字对比度 */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* 内容 */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-3xl">党员</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
              <p className="text-white/80 mb-2">{userData.department}</p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>入党时间：{userData.joinDate}</span>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <Badge className="bg-white/20 text-white border-0">{userData.level}</Badge>
              </div>
            </div>
            <div className="ml-auto text-right text-white">
              <p className="text-3xl font-bold">第{userData.rank}名</p>
              <p className="text-white/70 text-sm">全站排名 (共{userData.totalUsers}人)</p>
            </div>
          </div>

          {/* 等级进度 */}
          <div className="mt-6 bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/90 text-sm">距离「学习专家」还需</span>
              <span className="text-white font-medium">750 学习积分</span>
            </div>
            <Progress value={userData.levelProgress} className="h-2 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
        <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 mx-auto mb-2 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold">{userData.totalDays}</p>
              <p className="text-xs text-muted-foreground">学习天数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 mx-auto mb-2 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold">{userData.totalHours}</p>
              <p className="text-xs text-muted-foreground">累计学习(小时)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 mx-auto mb-2 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">{userData.totalCourses}</p>
              <p className="text-xs text-muted-foreground">完成课程</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 mx-auto mb-2 flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{userData.totalNotes}</p>
              <p className="text-xs text-muted-foreground">学习笔记</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center">
                <Flame className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{userData.streak}</p>
              <p className="text-xs text-muted-foreground">连续学习(天)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 学习日历 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  学习日历
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs text-muted-foreground py-1">{day}</div>
                  ))}
                  {calendarData.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`aspect-square rounded flex items-center justify-center text-xs ${
                        item.completed 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-100" />
                    已学习
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100" />
                    未学习
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 成就 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-red-600" />
                  我的成就
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.unlocked 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          item.unlocked 
                            ? 'bg-amber-100' 
                            : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-5 w-5 ${item.unlocked ? 'text-amber-600' : 'text-gray-400'}`} />
                        </div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                        {item.unlocked && item.date && (
                          <p className="text-xs text-amber-600 mt-1">{item.date} 获得</p>
                        )}
                        {!item.unlocked && (
                          <p className="text-xs text-gray-400 mt-1">未解锁</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 */}
          <div className="space-y-6">
            {/* 设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BellIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">消息通知</span>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">深色模式</span>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">音效</span>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>
                <Separator />
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <Globe className="h-4 w-4 mr-2" />
                  清除缓存
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  帮助与反馈
                </Button>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <Info className="h-4 w-4 mr-2" />
                  关于我们
                </Button>
              </CardContent>
            </Card>

            {/* 退出登录 */}
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
