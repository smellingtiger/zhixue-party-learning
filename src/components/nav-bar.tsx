'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Library, Bookmark, PenTool, User, Layers, Play } from 'lucide-react';
import { ReactNode } from 'react';

type NavTab = 'home' | 'library' | 'bookshelf' | 'notes' | 'profile';

interface NavBarProps {
  activeTab?: NavTab;
  children?: ReactNode;
}

const navItems = [
  { id: 'library' as NavTab, label: '知识库', icon: Library, path: '/library' },
  { id: 'bookshelf' as NavTab, label: '书架', icon: Bookmark, path: '/bookshelf' },
  { id: 'notes' as NavTab, label: '笔记', icon: PenTool, path: '/notes' },
  { id: 'governance' as NavTab, label: '数据治理', icon: Layers, path: '/governance' },
  { id: 'profile' as NavTab, label: '我的', icon: User, path: '/profile' },
];

export function NavBar({ activeTab = 'home', children }: NavBarProps) {
  const pathname = usePathname();
  
  // 根据路径自动判断当前激活的tab
  const currentTab = navItems.find(item => pathname.startsWith(item.path))?.id || activeTab;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航头 - 融合欢迎信息 */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          {/* 左侧：Logo + 标题 */}
          <div className="flex items-center gap-3">
            <img 
              src="/welcome-character.png" 
              alt="欢迎" 
              className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <h1 className="text-white font-bold text-base leading-tight">全省统一战线网络学院</h1>
              <p className="text-white/70 text-xs">开启您的党建学习之旅</p>
            </div>
          </div>
          
          {/* 右侧：搜索按钮 */}
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>
        
        {/* 搜索框区域 - 可展开 */}
        <div className="mt-3 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-orange-400" />
          </div>
          <input 
            type="text"
            placeholder="需要我帮您查点什么..."
            className="w-full pl-10 pr-12 py-2.5 rounded-full bg-white text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none shadow-inner"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-center text-white shadow-sm hover:shadow-md transition-shadow">
            <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
          </button>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      
      {/* 底部导航栏 - 融合在NavBar内 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-2' : ''}`} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Home 特殊处理 - 点击回到首页 */}
        <Link
          href="/"
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${
            currentTab === 'home' ? 'ring-4 ring-orange-200' : ''
          }`}
        >
          <span className="text-white font-bold text-lg">首</span>
        </Link>
      </nav>
      
      {/* 底部安全区域 - iOS适配 */}
      <div className="h-5 bg-white fixed bottom-0 left-0 right-0 z-[60]" />
    </div>
  );
}

export default NavBar;
