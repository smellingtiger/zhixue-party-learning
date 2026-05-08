import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 全局用户状态管理
let globalUser: any = null;

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const callbackRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // 只在客户端执行，避免服务器端渲染时的 localStorage 错误
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          globalUser = parsedUser;
          setUser(parsedUser);
        } catch (error) {
          console.error('解析用户数据失败:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          globalUser = null;
          setUser(null);
        }
      } else {
        // 确保在没有用户数据时设置为 null
        globalUser = null;
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = undefined;
    }
  }, [user]);

  const login = (userData: any, callback?: () => void) => {
    // 检查是否切换了用户
    const previousUserId = localStorage.getItem('userId');
    const currentUserId = userData.UserId;
    
    if (previousUserId && currentUserId && previousUserId !== currentUserId) {
      // 用户切换了，清空上一个用户的所有数据
      localStorage.removeItem('learning_progress');
      localStorage.removeItem('ai_generated_course');
      localStorage.removeItem('current_ai_course');
      localStorage.removeItem('user_diagnostic');
      localStorage.removeItem('user_diagnostic_completed');
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('completed_slides_1');
      localStorage.removeItem('slide_notes_1');
      localStorage.removeItem('current_chapter_1');
      localStorage.removeItem('current_slide_1');
      console.log(`[Auth] 用户切换: ${previousUserId} → ${currentUserId}，已清空所有学习数据`);
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
    // 同时存储userId到localStorage
    if (currentUserId) {
      localStorage.setItem('userId', currentUserId);
    }
    // 更新全局用户状态
    globalUser = userData;
    // 更新状态
    setUser(userData);
    // 触发登录成功事件，通知其他组件更新状态
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userData }));
    }
    // 强制刷新页面，确保导航栏立即显示用户信息
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('learning_progress');
    localStorage.removeItem('user_diagnostic');
    localStorage.removeItem('user_diagnostic_completed');
    localStorage.removeItem('onboarding_completed');
    // 清空全局用户状态
    globalUser = null;
    setUser(null);
    router.push('/login');
  };

  return { user, loading, login, logout };
};