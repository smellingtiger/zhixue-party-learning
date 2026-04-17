'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Play, Library, Bookmark, PenTool, User } from 'lucide-react';
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
  { id: 'profile' as NavTab, label: '我的', icon: User, path: '/profile' },
];

export function NavBar({ activeTab = 'home', children }: NavBarProps) {
  const pathname = usePathname();
  
  // 根据路径自动判断当前激活的tab
  const currentTab = navItems.find(item => pathname.startsWith(item.path))?.id || activeTab;

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部横幅区域 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-pink-50" />
        
        {/* 内容层 */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
          {/* 欢迎角色 */}
          <img 
            src="/welcome-character.png" 
            alt="欢迎" 
            className="h-24 w-auto object-contain mb-3"
          />
          
          {/* 欢迎文字 */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">欢迎来到全省统一战线网络学院</h1>
          <p className="text-gray-600 text-base mb-5">开启您的党建学习之旅</p>
          
          {/* 搜索框 */}
          <div className="relative w-full max-w-xl flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-orange-500" />
            </div>
            <input 
              type="text"
              placeholder="需要我帮您查点什么..."
              className="w-full pl-12 pr-24 py-3.5 rounded-full border-2 border-orange-400 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-lg transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-center text-white shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all">
              <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden pb-16">
        {children}
      </div>
      
      </div>
    </div>
  );
}

export default NavBar;
