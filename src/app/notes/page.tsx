'use client';

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { 
  BookOpen,
  Search,
  Clock,
  Star,
  Filter,
  Video,
  Image as ImageIcon,
  FileText,
  Play,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Eye,
  Bookmark,
  Heart,
  Trash2,
  Download,
  Share2,
  Layers3,
  PenTool,
  Edit3,
  Save,
  Calendar,
  Tag,
  MoreHorizontal,
  Plus,
  X,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// 笔记数据
const notesData = [
  {
    id: 1,
    title: '两个确立学习笔记',
    content: `"两个确立"是党在新时代取得的重大政治成果。

要点总结：
1. 两个确立：核心地位 + 指导地位
2. 四个意识：政治、大局、核心、看齐
3. 两个维护：维护核心、维护权威

心得体会：
作为党员，要深刻领悟"两个确立"的决定性意义，坚决做到"两个维护"。`,
    sourceTitle: '深刻理解"两个确立"的决定性意义',
    sourceCategory: '理论学习',
    tags: ['二十大', '两个确立', '政治理论'],
    createdAt: '2024-03-18',
    updatedAt: '2024-03-18',
    isPinned: true,
  },
  {
    id: 2,
    title: '党章学习心得',
    content: `通过学习党章第一章，对党员条件有了更深入的理解。

入党条件：
- 年满18岁
- 承认党的纲领和章程
- 愿意参加党的一个组织
- 在其中积极工作
- 执行党的决议
- 按期交纳党费

党员标准：永远是劳动人民的普通一员。`,
    sourceTitle: '党章诵读：第一章 党员',
    sourceCategory: '党章',
    tags: ['党章', '党员标准'],
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
    isPinned: false,
  },
  {
    id: 3,
    title: '三会一课笔记',
    content: `三会一课是党的组织生活的基本制度。

三会：
1. 支部委员会：每月至少一次
2. 党员大会：每季度至少一次
3. 党小组会：每月至少一次

一课：
党课：每季度至少一次

要注意做好记录归档工作。`,
    sourceTitle: '基层党建工作实务20讲',
    sourceCategory: '实务',
    tags: ['三会一课', '基层党建', '党务'],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-12',
    isPinned: false,
  },
  {
    id: 4,
    title: '政府工作报告要点',
    content: `2024年政府工作报告十大关键数字：

- GDP增长目标：5%左右
- 城镇新增就业：1200万人以上
- 居民消费价格涨幅：3%左右
- 粮食产量：保持在1.3万亿斤以上
- 居民收入增长：与经济增长同步`,
    sourceTitle: '2024年政府工作报告：十大关键数字',
    sourceCategory: '时政',
    tags: ['两会', '政府工作报告', '经济'],
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
    isPinned: false,
  },
];

// 常用标签
const commonTags = ['二十大', '两个确立', '党章', '三会一课', '党纪', '基层党建', '时政'];

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNote, setSelectedNote] = useState<typeof notesData[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const filteredNotes = notesData.filter(note => {
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = activeTab === 'all' || 
      (activeTab === 'pinned' && note.isPinned) ||
      note.tags.some(tag => tag === activeTab);
    return matchSearch && matchTab;
  });

  const handleEdit = (note: typeof notesData[0]) => {
    setSelectedNote(note);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    // 保存逻辑
    setIsEditing(false);
  };

  return (
    <NavBar activeTab="notes">
      {/* 左侧笔记列表 */}
      <div className="w-96 bg-white border-r flex flex-col">
        {/* 搜索和筛选 */}
        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1 text-xs">全部</TabsTrigger>
              <TabsTrigger value="pinned" className="flex-1 text-xs">置顶</TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 text-xs">最近</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 标签筛选 */}
        <div className="p-4 border-b">
          <p className="text-xs text-muted-foreground mb-2">常用标签</p>
          <div className="flex flex-wrap gap-1">
            {commonTags.map(tag => (
              <Badge 
                key={tag} 
                variant={activeTab === tag ? 'default' : 'secondary'}
                className={`text-xs cursor-pointer ${activeTab === tag ? 'bg-red-600' : ''}`}
                onClick={() => setActiveTab(activeTab === tag ? 'all' : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* 笔记列表 */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                  selectedNote?.id === note.id 
                    ? 'bg-red-50 border border-red-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => { setSelectedNote(note); setIsEditing(false); }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                  {note.isPinned && <Sparkles className="h-3 w-3 text-amber-500" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{note.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{note.createdAt}</span>
                  <div className="flex items-center gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <PenTool className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-muted-foreground">暂无笔记</p>
                <p className="text-xs text-muted-foreground">点击文章卡片开始做笔记</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧笔记详情 */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* 笔记头部 */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedNote.isPinned && <Sparkles className="h-4 w-4 text-amber-500" />}
                    <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    来自：{selectedNote.sourceTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        取消
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(selectedNote)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        分享
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 笔记内容 */}
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto p-6">
                {/* 来源信息 */}
                <Card className="mb-6 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{selectedNote.sourceCategory}</Badge>
                      <span className="text-sm text-muted-foreground">{selectedNote.sourceTitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      创建于 {selectedNote.createdAt} · 更新于 {selectedNote.updatedAt}
                    </p>
                  </CardContent>
                </Card>

                {/* 笔记正文 */}
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[400px] text-base leading-relaxed"
                  />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-base">
                      {selectedNote.content}
                    </div>
                  </div>
                )}

                {/* 标签 */}
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">标签</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-red-50 text-red-700">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      添加标签
                    </Button>
                  </div>
                </div>

                {/* 相关推荐 */}
                <Card className="mt-8">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">相关学习内容</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-12 h-10 rounded bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{selectedNote.sourceTitle}</p>
                        <p className="text-xs text-muted-foreground">{selectedNote.sourceCategory}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <PenTool className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">选择一条笔记</h3>
              <p className="text-muted-foreground">从左侧列表选择笔记进行查看和编辑</p>
            </div>
          </div>
        )}
      </div>
    </NavBar>
  );
}
