import type { Metadata } from 'next';
import { Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { MainNav } from '@/components/main-nav';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '红韵智学 - 党政学习全屏沉浸平台',
    template: '%s | 红韵智学',
  },
  description:
    '全屏沉浸式党政学习平台，像刷抖音一样学习。整合权威学习资源，智能推荐精品内容，让学习更高效。',
  keywords: [
    '红韵智学',
    '党政学习',
    '主题教育',
    '党课',
    '微课',
    '金句',
    '刷课',
    '学习强国',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={notoSerifSC.variable}>
      <body className="antialiased">
        <MainNav />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
