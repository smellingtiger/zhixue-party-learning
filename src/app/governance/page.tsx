'use client';

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  FileText,
  Lock,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Target,
} from 'lucide-react';

// 数据标准统计
const standardStats = {
  total: 1256,
  published: 1089,
  draft: 156,
  underReview: 11,
  coverage: 94.5,
};

// 数据标准列表
const standardList = [
  { id: 1, name: '统一社会信用代码', category: '基础标准', status: '已发布', domain: '组织标识', updateTime: '2024-03-15' },
  { id: 2, name: '行政区划代码', category: '基础标准', status: '已发布', domain: '地理信息', updateTime: '2024-03-12' },
  { id: 3, name: '人员姓名规范', category: '业务标准', status: '已发布', domain: '人员管理', updateTime: '2024-03-10' },
  { id: 4, name: '日期时间格式', category: '技术标准', status: '已发布', domain: '技术规范', updateTime: '2024-03-08' },
  { id: 5, name: '电子证照编码规则', category: '业务标准', status: '草稿', domain: '证照管理', updateTime: '2024-03-05' },
  { id: 6, name: '数据分类分级', category: '安全标准', status: '审核中', domain: '安全管理', updateTime: '2024-03-01' },
];

// 数据质量统计
const qualityStats = {
  totalRecords: 15678900,
  validRecords: 15234567,
  invalidRecords: 444333,
  completeness: 97.2,
  accuracy: 98.8,
  timeliness: 95.6,
  consistency: 96.4,
};

// 质量规则列表
const qualityRules = [
  { id: 1, name: '完整性校验', type: '完整性', passed: 15678, failed: 234, rate: 98.5 },
  { id: 2, name: '格式规范性', type: '规范性', passed: 15234, failed: 678, rate: 95.7 },
  { id: 3, name: '数值范围检查', type: '准确性', passed: 15890, failed: 22, rate: 99.9 },
  { id: 4, name: '一致性比对', type: '一致性', passed: 15456, failed: 456, rate: 97.1 },
  { id: 5, name: '时效性监控', type: '时效性', passed: 15123, failed: 789, rate: 95.0 },
];

// 数据安全统计
const securityStats = {
  totalAssets: 456,
  classifiedAssets: 456,
  sensitiveAssets: 89,
  protectedAssets: 456,
  accessRequests: 234,
  pendingRequests: 12,
  securityEvents: 5,
  criticalEvents: 0,
};

// 安全资产分类
const securityAssets = [
  { id: 1, name: '用户基础信息表', level: '核心', category: '个人信息', size: '120MB', lastScan: '2024-03-18' },
  { id: 2, name: '党组织信息表', level: '重要', category: '组织信息', size: '45MB', lastScan: '2024-03-18' },
  { id: 3, name: '学习记录表', level: '一般', category: '业务数据', size: '890MB', lastScan: '2024-03-18' },
  { id: 4, name: '系统日志表', level: '重要', category: '日志数据', size: '2.3GB', lastScan: '2024-03-18' },
  { id: 5, name: '认证凭据表', level: '核心', category: '安全数据', size: '12MB', lastScan: '2024-03-18' },
];

// 质量趋势数据
const qualityTrend = [
  { month: '9月', completeness: 94.5, accuracy: 96.2, timeliness: 93.1 },
  { month: '10月', completeness: 95.2, accuracy: 97.1, timeliness: 94.0 },
  { month: '11月', completeness: 95.8, accuracy: 97.8, timeliness: 94.5 },
  { month: '12月', completeness: 96.5, accuracy: 98.2, timeliness: 95.0 },
  { month: '1月', completeness: 96.9, accuracy: 98.5, timeliness: 95.3 },
  { month: '2月', completeness: 97.2, accuracy: 98.8, timeliness: 95.6 },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState('standard');

  return (
    <NavBar activeTab="governance">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">数据治理中心</h1>
            <p className="text-gray-500">建立完善的数据标准、质量和安全体系，确保数据的准确性、一致性和安全性</p>
          </div>

          {/* 总体概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 数据标准 */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  数据标准
                </CardTitle>
                <CardDescription>标准化数据定义与规范</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{standardStats.total}</p>
                    <p className="text-sm text-gray-500">标准总数</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    {standardStats.coverage}% 覆盖率
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">已发布</span>
                    <span className="font-medium text-green-600">{standardStats.published}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">草稿</span>
                    <span className="font-medium text-amber-600">{standardStats.draft}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">审核中</span>
                    <span className="font-medium text-orange-600">{standardStats.underReview}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据质量 */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  数据质量
                </CardTitle>
                <CardDescription>数据质量监测与评估</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{qualityStats.completeness}%</p>
                    <p className="text-sm text-gray-500">综合完整率</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.7%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-gray-900">{qualityStats.completeness}%</p>
                    <p className="text-xs text-gray-500">完整</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-gray-900">{qualityStats.accuracy}%</p>
                    <p className="text-xs text-gray-500">准确</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold text-gray-900">{qualityStats.timeliness}%</p>
                    <p className="text-xs text-gray-500">及时</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据安全 */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  数据安全
                </CardTitle>
                <CardDescription>数据安全防护与监控</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{securityStats.totalAssets}</p>
                    <p className="text-sm text-gray-500">数据资产</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    100% 覆盖
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">核心数据</span>
                    <span className="font-medium text-red-600">{securityStats.sensitiveAssets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">安全事件</span>
                    <span className="font-medium text-green-600">{securityStats.securityEvents}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">待审批请求</span>
                    <span className="font-medium text-amber-600">{securityStats.pendingRequests}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详情卡片 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="standard" className="gap-2">
                <Scale className="h-4 w-4" />
                数据标准
              </TabsTrigger>
              <TabsTrigger value="quality" className="gap-2">
                <Target className="h-4 w-4" />
                数据质量
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                数据安全
              </TabsTrigger>
            </TabsList>

            {/* 数据标准 */}
            <TabsContent value="standard">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>数据标准管理</CardTitle>
                      <CardDescription>管理和维护数据标准，确保数据定义的一致性</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        导出
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        新增标准
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 筛选栏 */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="搜索标准名称..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      筛选
                    </Button>
                  </div>

                  {/* 标准列表 */}
                  <div className="space-y-3">
                    {standardList.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span>{item.category}</span>
                              <span>|</span>
                              <span>{item.domain}</span>
                              <span>|</span>
                              <span>更新于 {item.updateTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant="outline"
                            className={
                              item.status === '已发布' ? 'bg-green-50 text-green-600 border-green-200' :
                              item.status === '草稿' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-orange-50 text-orange-600 border-orange-200'
                            }
                          >
                            {item.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 数据质量 */}
            <TabsContent value="quality">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 质量概览 */}
                <Card>
                  <CardHeader>
                    <CardTitle>质量概览</CardTitle>
                    <CardDescription>数据质量综合评分与趋势</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: '完整性', value: qualityStats.completeness, color: 'bg-blue-500' },
                        { label: '准确性', value: qualityStats.accuracy, color: 'bg-green-500' },
                        { label: '及时性', value: qualityStats.timeliness, color: 'bg-amber-500' },
                        { label: '一致性', value: qualityStats.consistency, color: 'bg-purple-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-gray-500">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 质量趋势图表 */}
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-3">近6个月趋势</p>
                      <div className="flex items-end justify-between h-24 gap-1">
                        {qualityTrend.map((item) => (
                          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-blue-100 rounded-t" style={{ height: `${item.completeness / 100 * 80}px` }}>
                              <div className="w-full bg-green-400 rounded-t" style={{ height: `${item.accuracy / 100 * 60}px` }} />
                            </div>
                            <span className="text-xs text-gray-400">{item.month}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded" />
                          完整率
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded" />
                          准确率
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 质量规则 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>质量规则</CardTitle>
                        <CardDescription>数据质量检查规则执行情况</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        规则配置
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qualityRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              rule.rate >= 98 ? 'bg-green-100' :
                              rule.rate >= 95 ? 'bg-amber-100' : 'bg-red-100'
                            }`}>
                              {rule.rate >= 98 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : rule.rate >= 95 ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{rule.name}</p>
                              <p className="text-xs text-gray-500">{rule.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{rule.rate}%</p>
                            <p className="text-xs text-gray-500">通过率</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重新扫描
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 数据安全 */}
            <TabsContent value="security">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 安全资产 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>数据资产</CardTitle>
                        <CardDescription>已登记的数据资产及分类分级</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        登记资产
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {securityAssets.map((asset) => (
                        <div 
                          key={asset.id}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              asset.level === '核心' ? 'bg-red-100' :
                              asset.level === '重要' ? 'bg-amber-100' : 'bg-blue-100'
                            }`}>
                              <Layers className={`h-5 w-5 ${
                                asset.level === '核心' ? 'text-red-600' :
                                asset.level === '重要' ? 'text-amber-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{asset.name}</p>
                              <p className="text-xs text-gray-500">{asset.category} | {asset.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline"
                              className={
                                asset.level === '核心' ? 'bg-red-50 text-red-600 border-red-200' :
                                asset.level === '重要' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-blue-50 text-blue-600 border-blue-200'
                              }
                            >
                              {asset.level}
                            </Badge>
                            <span className="text-xs text-gray-400">{asset.lastScan}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 安全态势 */}
                <Card>
                  <CardHeader>
                    <CardTitle>安全态势</CardTitle>
                    <CardDescription>数据安全实时监控与告警</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">安全</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{securityStats.totalAssets - securityStats.securityEvents}</p>
                        <p className="text-sm text-green-600">正常资产</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-700">告警</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{securityStats.securityEvents}</p>
                        <p className="text-sm text-red-600">安全事件</p>
                      </div>
                    </div>

                    {/* 最近安全事件 */}
                    <p className="text-sm font-medium text-gray-700 mb-3">最近安全事件</p>
                    <div className="space-y-2">
                      {[
                        { time: '10:32', event: '异常登录尝试', level: 'warning', status: '已处理' },
                        { time: '09:15', event: '敏感数据访问', level: 'info', status: '已处理' },
                        { time: '昨天', event: '权限变更', level: 'success', status: '已处理' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{item.event}</span>
                            <span className="text-xs text-gray-400">{item.time}</span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              item.status === '已处理' ? 'bg-green-50 text-green-600 border-green-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full mt-4">
                      <Eye className="h-4 w-4 mr-1" />
                      查看全部事件
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NavBar>
  );
}
