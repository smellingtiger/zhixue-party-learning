import Link from 'next/link';
import { 
  BookOpen, 
  PenTool, 
  Share2, 
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Users,
  CheckCircle2,
  Heart,
  MessageCircle,
  Bookmark,
  Share,
  TrendingUp,
  Clock,
  Eye,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Home,
  Flame,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 模拟信息流数据
const feedItems = [
  {
    id: 1,
    type: 'article',
    category: '重要讲话',
    title: '习近平在学习贯彻习近平新时代中国特色社会主义思想主题教育工作会议上发表重要讲话',
    summary: '会议强调，要牢牢把握"学思想、强党性、重实践、建新功"的总要求，把理论学习、调查研究、推动发展、检视整改贯通起来...',
    source: '学习强国',
    author: '新华社',
    publishTime: '2小时前',
    readCount: 12580,
    likeCount: 856,
    commentCount: 234,
    isLiked: false,
    isBookmarked: false,
    tags: ['主题教育', '习近平新时代中国特色社会主义思想'],
  },
  {
    id: 2,
    type: 'template',
    category: '范文',
    title: '2024年度基层党建工作总结范文（可直接使用）',
    summary: '包含全年党建工作回顾、存在问题分析、下一步工作计划三大板块，涵盖思想建设、组织建设、作风建设等方面...',
    source: '精品范文库',
    author: '红韵智创',
    publishTime: '4小时前',
    readCount: 8960,
    likeCount: 1203,
    commentCount: 89,
    isLiked: true,
    isBookmarked: true,
    tags: ['党建', '工作总结', '可直接使用'],
  },
  {
    id: 3,
    type: 'news',
    category: '时政要闻',
    title: '人民日报评论员：扎实推进高质量发展 奋力实现一季度经济开门红',
    summary: '一季度经济运行延续回升向好态势，实现良好开局。实践充分证明，高质量发展是全面建设社会主义现代化国家的首要任务...',
    source: '人民日报',
    author: '人民日报评论员',
    publishTime: '6小时前',
    readCount: 5680,
    likeCount: 445,
    commentCount: 67,
    isLiked: false,
    isBookmarked: false,
    tags: ['经济', '高质量发展', '开门红'],
  },
  {
    id: 4,
    type: 'inspiration',
    category: '金句',
    title: '人民日报金句摘抄 | 奋斗是青春最亮丽的底色',
    summary: '"青年一代有理想、有本领、有担当，国家就有前途，民族就有希望。"这些振奋人心的金句，值得收藏转发！',
    source: '灵感库',
    author: '红韵智创',
    publishTime: '8小时前',
    readCount: 12450,
    likeCount: 3456,
    commentCount: 156,
    isLiked: false,
    isBookmarked: false,
    tags: ['金句', '奋斗', '青春'],
    isHighlighted: true,
  },
  {
    id: 5,
    type: 'template',
    category: '讲话稿',
    title: '党委书记在党建工作会议上的讲话稿（珍藏版）',
    summary: '讲话稿围绕"六个强化"展开：强化政治引领、强化理论武装、强化组织功能、强化队伍建设...',
    source: '精品范文库',
    author: '某央企党委',
    publishTime: '1天前',
    readCount: 7890,
    likeCount: 967,
    commentCount: 45,
    isLiked: false,
    isBookmarked: true,
    tags: ['党建', '讲话稿', '党委书记'],
  },
  {
    id: 6,
    type: 'news',
    category: '政策解读',
    title: '国务院办公厅关于加强数字政府建设的指导意见',
    summary: '《意见》提出，到2025年和2035年两个阶段的发展目标，明确了七方面重点任务，推动政府数字化转型...',
    source: '国务院办公厅',
    author: '中国政府网',
    publishTime: '1天前',
    readCount: 4560,
    likeCount: 328,
    commentCount: 23,
    isLiked: false,
    isBookmarked: false,
    tags: ['数字政府', '政策', '数字化转型'],
  },
  {
    id: 7,
    type: 'article',
    category: '理论学习',
    title: '党的二十大报告学习辅导百问（第1-10问）',
    summary: '为帮助广大党员干部群众深入学习领会党的二十大精神，特推出系列学习辅导材料...',
    source: '学习强国',
    author: '人民出版社',
    publishTime: '2天前',
    readCount: 23450,
    likeCount: 2156,
    commentCount: 312,
    isLiked: true,
    isBookmarked: false,
    tags: ['二十大', '理论学习', '辅导材料'],
  },
  {
    id: 8,
    type: 'template',
    category: '调研报告',
    title: '关于加强和改进思想政治工作的调研报告模板',
    summary: '报告包含调研背景、主要做法、存在问题、对策建议四大部分，附赠数据图表模板...',
    source: '精品范文库',
    author: '某省宣传部',
    publishTime: '3天前',
    readCount: 3450,
    likeCount: 567,
    commentCount: 34,
    isLiked: false,
    isBookmarked: false,
    tags: ['调研报告', '思想政治', '模板'],
  },
];

const categories = [
  { id: 'all', name: '推荐', icon: Flame },
  { id: 'news', name: '时政要闻', icon: TrendingUp },
  { id: 'article', name: '重要讲话', icon: FileText },
  { id: 'template', name: '精品范文', icon: BookOpen },
  { id: 'inspiration', name: '金句灵感', icon: Lightbulb },
];

// 信息流卡片组件
function FeedCard({ item }: { item: typeof feedItems[0] }) {
  return (
    <Card className={`mb-4 transition-all hover:shadow-lg ${item.isHighlighted ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50' : 'border-red-50'}`}>
      <CardContent className="p-4">
        {/* 分类标签 */}
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            className={item.type === 'template' ? 'bg-blue-600' : 
                        item.type === 'inspiration' ? 'bg-amber-600' : 'bg-red-600'}
          >
            {item.category}
          </Badge>
          {item.isHighlighted && (
            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500">
              <Sparkles className="h-3 w-3 mr-1" />
              精选
            </Badge>
          )}
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-2 hover:text-red-600 cursor-pointer line-clamp-2">
          {item.title}
        </h3>

        {/* 摘要 */}
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {item.summary}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-red-100 text-red-600">
                  {item.author.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{item.author}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.publishTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.readCount >= 1000 ? `${(item.readCount/1000).toFixed(1)}k` : item.readCount}
            </span>
          </div>

          {/* 互动按钮 */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors group">
              <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'}`} />
            </button>
            <span className="text-xs text-muted-foreground mr-2">{item.likeCount}</span>
            <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
              <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            </button>
            <span className="text-xs text-muted-foreground mr-2">{item.commentCount}</span>
            <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors group">
              <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-400 group-hover:text-amber-500'}`} />
            </button>
            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors group">
              <Share className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
            </button>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-red-100 hover:bg-red-50">
            <FileText className="h-3 w-3 mr-1" />
            查看详情
          </Button>
          {item.type === 'template' && (
            <Button size="sm" className="flex-1 text-xs h-8 bg-gradient-to-r from-red-600 to-orange-500">
              <Sparkles className="h-3 w-3 mr-1" />
              立即使用
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 py-6">
      {/* 左侧边栏 - 分类导航 */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Card className="sticky top-24 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">内容分类</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <Icon className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{cat.name}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* 快捷入口 */}
        <Card className="mt-4 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">快捷入口</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/library" className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50">
              <BookOpen className="h-4 w-4 text-orange-600" />
              <span className="text-sm">权威智库</span>
            </Link>
            <Link href="/create" className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50">
              <PenTool className="h-4 w-4 text-red-600" />
              <span className="text-sm">AI创作</span>
            </Link>
            <Link href="/media" className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50">
              <Share2 className="h-4 w-4 text-amber-600" />
              <span className="text-sm">新媒体赋能</span>
            </Link>
          </CardContent>
        </Card>

        {/* 热门标签 */}
        <Card className="mt-4 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              热门标签
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                更多
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['主题教育', '二十大', '党建', '工作总结', '调研报告', '领导讲话', '高质量发展', '中国式现代化'].map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-red-50 hover:border-red-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* 主内容区 - 信息流 */}
      <main className="flex-1 min-w-0">
        {/* 顶部搜索和筛选 */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索资讯、范文、金句..." 
              className="pl-10 border-red-100"
            />
          </div>
          <Select defaultValue="latest">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新发布</SelectItem>
              <SelectItem value="hot">最热文章</SelectItem>
              <SelectItem value="recommend">精选推荐</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* 移动端分类 */}
        <div className="lg:hidden mb-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm whitespace-nowrap"
                >
                  <Icon className="h-3 w-3" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 信息流内容 */}
        <div className="space-y-4">
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>

        {/* 加载更多 */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            加载更多
          </Button>
        </div>
      </main>

      {/* 右侧边栏 - 热门内容 */}
      <aside className="hidden xl:block w-80 flex-shrink-0">
        {/* 热门文章 */}
        <Card className="sticky top-24 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-red-600" />
              热门文章
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedItems.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex gap-3 cursor-pointer group">
                <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.readCount >= 1000 ? `${(item.readCount/1000).toFixed(1)}k阅读` : `${item.readCount}阅读`}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 创作助手 */}
        <Card className="mt-4 border-red-100 bg-gradient-to-br from-red-600 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">AI创作助手</span>
            </div>
            <p className="text-sm text-white/90 mb-3">
              输入主题，AI帮您生成专业公文初稿
            </p>
            <Link href="/create">
              <Button size="sm" variant="secondary" className="w-full bg-white text-red-600 hover:bg-gray-100">
                立即体验
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 今日金句 */}
        <Card className="mt-4 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
              今日金句
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-sm italic text-gray-700 mb-2">
              "奋斗是青春最亮丽的底色，行动是青年最有效的磨砺。"
            </blockquote>
            <p className="text-xs text-muted-foreground">—— 习近平</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full text-amber-700">
              <Bookmark className="h-4 w-4 mr-1" />
              收藏金句
            </Button>
          </CardContent>
        </Card>

        {/* 推荐场景 */}
        <Card className="mt-4 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">推荐场景</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: '两会宣传', count: '2,580+篇' },
                { name: '主题教育', count: '4,120+篇' },
                { name: '年终总结', count: '6,350+篇' },
                { name: '领导讲话', count: '3,890+篇' },
              ].map((scenario) => (
                <div 
                  key={scenario.name}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                  <span className="text-sm">{scenario.name}</span>
                  <Badge variant="outline" className="text-xs">{scenario.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
