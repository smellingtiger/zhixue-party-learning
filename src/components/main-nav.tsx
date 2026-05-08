'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Home,
  Search,
  Bell,
  User,
  Library,
  Users,
  Bookmark,
  PenTool,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavContext } from './nav-context';
import { useAuth } from '@/lib/auth';

const navItems = [
  { id: 'home', name: '首页', href: '/', icon: Home },
  { id: 'ai-course', name: 'AI智能生成课程', href: '/ai-course', icon: Sparkles },
  { id: 'aiclass', name: 'AI组班', href: '/training-candidates', icon: Users },
  { id: 'profile', name: '我的', href: '/profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 使用全局 Context 共享展开/收起状态
  const { isExpanded, setIsExpanded } = useNavContext();
  
  // 使用登录状态管理
  const { user, loading, logout } = useAuth();
  
  // 强制同步用户状态
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        // 直接从localStorage读取用户信息，确保导航栏立即显示
        setHasCompletedOnboarding(true);
      }
    }
  }, []);

  // 检测引导完成状态
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('onboarding_completed');
      setHasCompletedOnboarding(completed === 'true');
    }
  }, [user, pathname, loading]); // 当登录状态、路径或加载状态变化时重新检查

  // 监听登录成功事件，强制更新用户状态
  useEffect(() => {
    const handleLoginSuccess = (event: CustomEvent) => {
      if (event.detail) {
        // 直接更新用户状态，确保导航栏立即显示用户信息
        setHasCompletedOnboarding(true);
      }
    };

    // 监听引导完成事件，更新导航栏状态
    const handleOnboardingComplete = () => {
      // 直接更新引导完成状态，确保导航栏立即显示
      setHasCompletedOnboarding(true);
    };

    // 只在客户端添加事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('userLoggedIn', handleLoginSuccess as EventListener);
      window.addEventListener('onboardingCompleted', handleOnboardingComplete as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('userLoggedIn', handleLoginSuccess as EventListener);
        window.removeEventListener('onboardingCompleted', handleOnboardingComplete as EventListener);
      }
    };
  }, []);

  // 路由切换时收起/展开导航栏
  useEffect(() => {
    if (isHomePage) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 登录页面：隐藏导航栏
  if (isLoginPage) {
    return null;
  }

  // 引导页：隐藏导航栏，因为OnboardingFlow组件有自己的导航栏
  if (hasCompletedOnboarding === false) {
    return null;
  }

  // 所有页面都支持展开/收起状态
  const showExpandedContent = hasCompletedOnboarding === true;

  // 通用红色系样式
  const baseHeaderStyle = showExpandedContent
    ? "bg-gradient-to-r from-red-700 via-red-600 to-orange-500"
    : "bg-gradient-to-r from-red-700 via-red-600 to-orange-500";

  return (
    <header 
      className={cn(
        "w-full z-50 sticky top-0 transition-all duration-500 ease-in-out",
        baseHeaderStyle,
        isExpanded && showExpandedContent ? "h-56" : "h-16"
      )}
      style={{
        backgroundImage: showExpandedContent && isExpanded 
          ? `url('/nav-bg.png')` 
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 渐变遮罩 */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          showExpandedContent && isExpanded 
            ? "bg-gradient-to-b from-red-600/80 via-red-500/60 to-orange-400/40" 
            : "bg-gradient-to-r from-red-600 via-red-500 to-orange-400"
        )}
      />
      
      {/* 内容层 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 顶部导航行 */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/icon.png" 
                alt="全省统一战线网络学院" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-lg hidden md:block text-white">
                全省统一战线网络学院
              </span>
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
                        "gap-2 transition-all duration-300",
                        "text-white/90 hover:text-white hover:bg-white/10",
                        isActive && "bg-white/20 text-white font-medium"
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
            {/* 收起状态：导航栏右侧显示搜索框 */}
            <AnimatePresence>
              {!isExpanded && showExpandedContent && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  <input 
                    type="text"
                    placeholder="搜索内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-lg text-sm bg-white/20 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => showExpandedContent && setIsExpanded(!isExpanded)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
            </Button>
            
            {user ? (
              <div className="relative group">
                <Link href="/profile">
                  <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/50">
                    <AvatarFallback className="bg-white text-red-600 font-medium">{user.name?.charAt(0) || user.Account?.charAt(0) || '党'}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    {user.name || user.Account || '用户'}
                  </div>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => logout()}
                  >
                    <LogOut className="inline-block h-4 w-4 mr-2" />
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-white text-red-600 hover:bg-white/90"
                >
                  登录
                </Button>
              </Link>
            )}
            
            {/* 展开/收起按钮 */}
            {showExpandedContent && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isExpanded ? 'up' : 'down'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            )}
          </div>
        </div>
        
        {/* 欢迎区 - 展开状态时显示 */}
        <AnimatePresence>
          {showExpandedContent && isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 flex flex-col items-center justify-center px-6 pb-6"
            >
              {/* 欢迎文字 */}
              <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                欢迎来到全省统一战线网络学院
              </h1>
              <p className="text-white/80 text-sm mb-5 drop-shadow">
                开启您的党建学习之旅
              </p>
              
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
