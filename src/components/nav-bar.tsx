'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Play, Library, Bookmark, PenTool, User, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 根据路径自动判断当前激活的tab
  const currentTab = navItems.find(item => pathname.startsWith(item.path))?.id || activeTab;

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部横幅区域 - 可收缩 */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/welcome-character.png" 
                  alt="欢迎" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-white font-medium text-sm">全省统一战线网络学院</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-white/80" />
                <span className="text-white/80 text-sm">搜索...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 展开/收起按钮 */}
      <div className="flex justify-center -mt-3 relative z-20">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white border-2 border-orange-300 rounded-full px-4 py-1.5 shadow-md hover:shadow-lg hover:border-orange-400 transition-all flex items-center gap-1.5 group"
        >
          <span className="text-sm text-gray-600 group-hover:text-orange-600 font-medium">
            {isExpanded ? '收起' : '展开'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="h-4 w-4 text-orange-500" />
          </motion.div>
        </button>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden pb-16">
        {children}
      </div>
      
      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-2' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
