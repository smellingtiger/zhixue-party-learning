'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Sparkles,
  Home,
  Search,
  Bell,
  User,
  Library,
  Bookmark,
  PenTool,
  Layers3
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', name: '首页', href: '/', icon: Home },
  { id: 'library', name: '知识库', href: '/library', icon: Library },
  { id: 'bookshelf', name: '书架', href: '/bookshelf', icon: Bookmark },
  { id: 'notes', name: '笔记', href: '/notes', icon: PenTool },
  { id: 'profile', name: '我的', href: '/profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');

  // 首页使用简约导航
  if (isHomePage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">红韵智学</span>
          </div>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.id} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "text-white hover:bg-white/20",
                      pathname === item.href && "bg-white/20"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input 
                type="text"
                placeholder="搜索内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-red-600 text-white">党员</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // 其他页面使用完整导航
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">红韵智学</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.id === 'library' && pathname.startsWith('/library'));
              return (
                <Link key={item.id} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "gap-2",
                      isActive ? "bg-red-50 text-red-700" : "text-gray-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="搜索内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Link href="/profile">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-red-600 text-white">党员</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
