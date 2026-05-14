'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BrainCircuit, Loader2, AlertCircle, RefreshCw, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ApiService } from '@/lib/api-service';

interface LoginForm {
  account: string;
  password: string;
  ValidateCode: string;
  smsValidateCode: string;
  RememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({
    account: '',
    password: '',
    ValidateCode: '',
    smsValidateCode: '',
    RememberMe: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [verifyCodeUrl, setVerifyCodeUrl] = useState('');
  const [smsCountdown, setSmsCountdown] = useState(0);

  // 刷新图形验证码
  const refreshVerifyCode = async () => {
    try {
      const data = await ApiService.getVerifyCode();
      if (data.IsSuccess && data.Data && data.Data.Img) {
        setVerifyCodeUrl(data.Data.Img);
      }
    } catch (err) {
      // 静默失败，不影响页面使用
    }
  };

  // 初始化时加载图形验证码
  useEffect(() => {
    refreshVerifyCode();
  }, []);

  // 短信验证码倒计时
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (smsCountdown > 0) {
      interval = setInterval(() => {
        setSmsCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [smsCountdown]);

  // 发送短信验证码
  const sendSmsCode = async () => {
    if (smsCountdown > 0) return;
    if (!form.account) {
      setError('请输入手机号码');
      return;
    }

    try {
      const data = await ApiService.sendSmsCode(form.account);
      if (data.IsSuccess) {
        setSmsCountdown(60);
      } else {
        setError(data.Message || '发送短信验证码失败');
      }
    } catch (err) {
      setError('发送短信验证码失败，请稍后重试');
    }
  };

  // 切换登录方式
  const toggleLoginMethod = () => {
    setIsMobile(!isMobile);
    // 清空表单
    setForm({
      ...form,
      ValidateCode: '',
      smsValidateCode: '',
      password: ''
    });
    // 刷新验证码
    if (!isMobile) {
      refreshVerifyCode();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 构建登录参数
      const loginParams = {
        account: form.account,
        RememberMe: form.RememberMe
      };
      
      if (!isMobile) {
        Object.assign(loginParams, {
          password: form.password,
          ValidateCode: form.ValidateCode
        });
      } else {
        Object.assign(loginParams, {
          smsValidateCode: form.smsValidateCode
        });
      }

      const data = await ApiService.login(loginParams);
      console.log('登录请求响应数据:', data);

      // 处理不同的响应状态
      console.log('登录响应Type:', data.Type);
      console.log('登录响应Data:', data.Data);
      if (data.Type === 1) {
        // 登录成功
        // 调用LoginShort接口获取用户详细信息
        const userInfo = await ApiService.getLoginShort();
        console.log('获取用户信息响应:', userInfo);
        if (userInfo.Data && userInfo.Data.Model) {
          // 存储用户ID到localStorage
          if (userInfo.Data.Model.UserId) {
            localStorage.setItem('userId', userInfo.Data.Model.UserId);
            console.log('存储用户ID:', userInfo.Data.Model.UserId);
          }
          // 登录成功，存储用户信息
          console.log('登录成功，用户信息:', userInfo.Data.Model);
          // 使用回调函数确保状态更新后再跳转
          login(userInfo.Data.Model, () => {
            // 检查是否已完成引导
            const onboardingCompleted = localStorage.getItem('onboarding_completed');
            console.log('是否已完成引导:', onboardingCompleted);
            // 直接跳转到首页，使用现有的OnboardingFlow组件
            console.log('跳转到首页');
            router.push('/');
          });
        } else {
          console.error('获取用户信息失败:', userInfo);
          throw new Error('获取用户信息失败');
        }
      } else if (data.Type === 0) {
        // 登录失败
        throw new Error(data.Message || '账号或密码错误');
      } else if (data.Type === 2) {
        // 首次登录
        // 调用LoginShort接口获取用户详细信息
        const userInfo = await ApiService.getLoginShort();
        console.log('获取用户信息响应:', userInfo);
        if (userInfo.Data && userInfo.Data.Model) {
          // 存储用户ID到localStorage
          if (userInfo.Data.Model.UserId) {
            localStorage.setItem('userId', userInfo.Data.Model.UserId);
            console.log('存储用户ID:', userInfo.Data.Model.UserId);
          }
          // 登录成功，存储用户信息
          console.log('登录成功，用户信息:', userInfo.Data.Model);
          login(userInfo.Data.Model);
          // 首次登录，跳转到引导页
          console.log('首次登录，跳转到引导页');
          router.push('/');
        } else {
          console.error('获取用户信息失败:', userInfo);
          throw new Error('获取用户信息失败');
        }
      } else if (data.Type === 3) {
        // 账号在别处登录
        if (window.confirm('账号在别的地方登录，是否踢出？')) {
          // 调用踢出接口
          const kickData = await ApiService.kickOut(data.Message);
          if (kickData.Type === 1) {
            // 重新登录
            handleSubmit(e);
          } else {
            throw new Error('踢出操作失败');
          }
        }
      } else {
        throw new Error(data.Message || '登录失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请检查用户名和密码');
      // 刷新验证码
      refreshVerifyCode();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg">
              <BrainCircuit className="w-9 h-9 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">精英在线智能学习平台</CardTitle>
            <CardDescription className="text-slate-500">党政学习平台</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-4">
            {/* 登录方式切换 */}
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                type="button"
                variant={!isMobile ? 'default' : 'secondary'}
                className={`${!isMobile ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white' : ''}`}
                onClick={toggleLoginMethod}
              >
                密码登录
              </Button>
              <Button
                type="button"
                variant={isMobile ? 'default' : 'secondary'}
                className={`${isMobile ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white' : ''}`}
                onClick={toggleLoginMethod}
              >
                <Phone className="w-4 h-4 mr-2" />
                短信登录
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account" className="text-slate-700">
                  {isMobile ? '手机号码' : '用户名'}
                </Label>
                <Input
                  id="account"
                  type={isMobile ? 'tel' : 'text'}
                  placeholder={isMobile ? '请输入手机号码' : '请输入用户名'}
                  value={form.account}
                  onChange={(e) => setForm({ ...form, account: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
              
              {!isMobile && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
              )}

              {/* 图形验证码 */}
              {!isMobile && (
                <div className="space-y-2">
                  <Label htmlFor="ValidateCode" className="text-slate-700">验证码</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="ValidateCode"
                      type="text"
                      placeholder="请输入验证码"
                      value={form.ValidateCode}
                      onChange={(e) => setForm({ ...form, ValidateCode: e.target.value })}
                      className="h-11 flex-1"
                      required
                    />
                    <div className="relative h-11 w-32">
                      {verifyCodeUrl ? (
                        <img
                          src={verifyCodeUrl}
                          alt="验证码"
                          className="h-full w-full object-cover rounded-md cursor-pointer"
                          onClick={refreshVerifyCode}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-md">
                          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={refreshVerifyCode}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 text-white rounded-md hover:bg-black/30"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 短信验证码 */}
              {isMobile && (
                <div className="space-y-2">
                  <Label htmlFor="smsValidateCode" className="text-slate-700">短信验证码</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="smsValidateCode"
                      type="text"
                      placeholder="请输入短信验证码"
                      value={form.smsValidateCode}
                      onChange={(e) => setForm({ ...form, smsValidateCode: e.target.value })}
                      className="h-11 flex-1"
                      required
                    />
                    <Button
                      type="button"
                      className="h-11 whitespace-nowrap"
                      disabled={smsCountdown > 0}
                      onClick={sendSmsCode}
                    >
                      {smsCountdown > 0 ? `${smsCountdown}s后重试` : '获取验证码'}
                    </Button>
                  </div>
                </div>
              )}

              {/* 记住密码 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="RememberMe"
                  checked={form.RememberMe}
                  onCheckedChange={(checked) => setForm({ ...form, RememberMe: checked as boolean })}
                />
                <Label htmlFor="RememberMe" className="text-slate-600 text-sm cursor-pointer">
                  记住密码
                </Label>
              </div>

              {/* 错误提示 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>

              {/* 游客登录按钮 */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-2 border-dashed border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
                onClick={() => {
                  // 创建虚拟用户信息
                  const guestUser = {
                    UserId: 'guest_' + Date.now(),
                    UserName: '游客用户',
                    NickName: '游客',
                    Avatar: '',
                    IsFirstLogin: false,
                    LoginTime: new Date().toISOString(),
                  };
                  
                  // 调用登录函数
                  login(guestUser, () => {
                    // 跳转到首页
                    router.push('/');
                  });
                }}
              >
                游客登录（无需注册）
              </Button>

              {/* 密码重置链接 */}
              <div className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-slate-600 hover:text-red-600"
                >
                  忘记密码？
                </Button>
              </div>
            </form>

            <div className="text-center text-sm text-slate-500">
              <p>测试账号：jyzxcd / JYZXcd@2026</p>
              <p className="mt-1">测试账号：yyf / JYZXyyf@2026</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}