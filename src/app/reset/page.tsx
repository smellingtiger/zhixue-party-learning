'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export default function ResetPage() {
  const router = useRouter();

  const handleReset = () => {
    // 清除引导状态
    localStorage.removeItem('onboarding_completed');
    // 清除用户信息
    localStorage.removeItem('user_info');
    // 跳转到首页
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5" />
            演示重置工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            点击下方按钮重置演示状态，模拟新用户首次访问
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleReset} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置并进入引导页
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              直接返回首页
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2">重置说明：</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>清除 onboarding_completed 标志</li>
              <li>清除用户登录信息</li>
              <li>重置后可看到首次引导流程</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-sm text-red-700 mb-2">其他测试账号：</h3>
            <div className="text-xs text-red-600 space-y-1">
              <p>admin / admin123</p>
              <p>user1 / user123</p>
              <p>user2 / user123</p>
              <p>user3 / user123</p>
              <p>user4 / user123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
