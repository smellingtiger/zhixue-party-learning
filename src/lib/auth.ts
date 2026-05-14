import { useState, useEffect, useRef } from 'react';

const createGuestUser = () => ({
  UserId: 'guest_default',
  UserName: '游客用户',
  NickName: '游客',
  name: '游客用户',
  display_name: '游客',
  Avatar: '',
  IsFirstLogin: false,
  LoginTime: new Date().toISOString(),
});

let globalUser: any = createGuestUser();

export const useAuth = () => {
  const [user, setUser] = useState<any>(createGuestUser());
  const [loading, setLoading] = useState(true);
  const callbackRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
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
          globalUser = createGuestUser();
          setUser(createGuestUser());
        }
      } else {
        const guestUser = createGuestUser();
        globalUser = guestUser;
        setUser(guestUser);
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
    const guestUser = createGuestUser();
    globalUser = guestUser;
    setUser(guestUser);
  };

  return { user, loading, login, logout };
};