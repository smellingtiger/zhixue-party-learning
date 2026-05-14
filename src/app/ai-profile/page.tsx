'use client';

import { PenTool, Brain, TrendingUp, Target, Award, BookOpen, Clock, Activity, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const learningStats = [
  { icon: BookOpen, label: '学习时长', value: '128小时', progress: 75 },
  { icon: Award, label: '获得证书', value: '8个', progress: 60 },
  { icon: TrendingUp, label: '学习进度', value: '78%', progress: 78 },
  { icon: Target, label: '目标完成', value: '15个', progress: 85 },
];

const skillTags = [
  { name: '政治理论', level: 90 },
  { name: '党务知识', level: 85 },
  { name: '政策解读', level: 78 },
  { name: '党史学习', level: 88 },
  { name: '公文写作', level: 72 },
  { name: '演讲表达', level: 65 },
];

const learningHistory = [
  { date: '2024-03-20', duration: '2小时30分', courses: 3 },
  { date: '2024-03-19', duration: '1小时45分', courses: 2 },
  { date: '2024-03-18', duration: '3小时15分', courses: 4 },
  { date: '2024-03-17', duration: '1小时00分', courses: 1 },
  { date: '2024-03-16', duration: '2小时00分', courses: 2 },
];

export default function AIProfilePage() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">AI画像</h1>
            <p className="text-sm text-white/80">基于AI分析的个人学习画像</p>
          </div>
          <Button className="bg-white text-blue-600 hover:bg-white/90">
            <Sparkles className="h-4 w-4 mr-2" />
            更新画像
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧用户信息 */}
        <div className="w-80 bg-white border-r p-6 overflow-y-auto">
          {/* 用户头像 */}
          <div className="text-center mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-blue-100">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                党
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold">党员同志</h2>
            <p className="text-sm text-muted-foreground">学习达人</p>
            <Badge className="mt-2 bg-green-100 text-green-700">Lv.8 资深学员</Badge>
          </div>

          {/* 学习统计 */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">学习概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{stat.label}</span>
                        </div>
                        <span className="text-sm font-medium">{stat.value}</span>
                      </div>
                      <Progress value={stat.progress} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 学习徽章 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">获得徽章</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"
                  >
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* 能力雷达图区域 */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                能力分析
              </CardTitle>
              <Button variant="ghost" size="sm">详细报告</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {skillTags.map((skill) => (
                  <div key={skill.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-blue-600 font-bold">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 学习趋势 */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                学习趋势
              </CardTitle>
              <Button variant="ghost" size="sm">查看图表</Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-40 gap-4">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
                  const heights = [40, 65, 45, 80, 55, 90, 70];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-400"
                        style={{ height: `${heights[index]}%`, minHeight: '20px' }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{day}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 学习记录 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                近期学习记录
              </CardTitle>
              <Button variant="ghost" size="sm">查看全部</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningHistory.map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{record.date}</p>
                        <p className="text-xs text-muted-foreground">学习了 {record.courses} 门课程</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{record.duration}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI分析建议 */}
          <Card className="mt-6 border-l-4 border-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                AI学习建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm">
                    根据您的学习数据分析，建议您重点提升「公文写作」能力，目前水平为72%，
                    推荐学习《党政机关公文写作规范》课程。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm">
                    您的学习活跃度很高，建议保持当前学习节奏，预计还需2周即可完成本月学习目标。
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm">
                    检测到您对「党史学习」有浓厚兴趣，推荐您关注最新上线的党史专题课程。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}