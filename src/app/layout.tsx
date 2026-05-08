import type { Metadata } from 'next';
import { Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { NavProvider } from '@/components/nav-context';
import { MainNav } from '@/components/main-nav';
import VideoMappingInitializer from '@/components/video-mapping-initializer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '精英在线智能学习平台 - 党政学习全屏沉浸平台',
    template: '%s | 精英在线智能学习平台',
  },
  description:
    '全屏沉浸式党政学习平台，像刷抖音一样学习。整合权威学习资源，智能推荐精品内容，让学习更高效。',
  keywords: [
    '精英在线智能学习平台',
    '党政学习',
    '主题教育',
    '党课',
    '微课',
    '金句',
    '刷课',
    '学习强国',
  ],
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 白名单配置
  const whitelist = [
    '/login',
    '/reset',
    '/api/*',
  ];

  return (
    <html lang="zh-CN" suppressHydrationWarning className={notoSerifSC.variable}>
      <body className="antialiased">
        <NavProvider>
          <VideoMappingInitializer />
          <MainNav />
          <ProtectedRoute whitelist={whitelist}>
            <main className="flex-1 flex flex-col">{children}</main>
          </ProtectedRoute>
        </NavProvider>
        <Toaster />
      </body>
    </html>
  );
}
