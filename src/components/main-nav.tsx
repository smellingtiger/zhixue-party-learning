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

  return (
    <header className={cn(
      "w-full z-50",
      isHomePage 
        ? "bg-gradient-to-b from-black/80 via-black/40 to-transparent" 
        : "bg-white border-b border-gray-200 sticky top-0"
    )}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isHomePage 
                ? "bg-gradient-to-br from-red-600 to-orange-500" 
                : "bg-gradient-to-br from-red-600 to-orange-500"
            )}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className={cn(
              "font-bold text-xl",
              isHomePage ? "text-white" : "text-gray-900"
            )}>红韵智学</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link key={item.id} href={item.href}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "gap-2",
                      isHomePage 
                        ? cn("text-white/80 hover:text-white hover:bg-white/10", isActive && "bg-white/20 text-white")
                        : cn(isActive ? "bg-red-50 text-red-700" : "text-gray-600")
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
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              isHomePage ? "text-white/60" : "text-gray-400"
            )} />
            <input 
              type="text"
              placeholder="搜索内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
                isHomePage 
                  ? "bg-white/10 border border-white/20 text-white placeholder:text-white/60"
                  : "border border-gray-200 text-gray-900"
              )}
            />
          </div>
          <Button variant="ghost" size="icon" className={cn("relative", isHomePage ? "text-white" : "")}>
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
