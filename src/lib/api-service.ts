// API 服务封装

import { ALL_PORT } from './api-config';

/**
 * API 服务类，封装所有 API 请求
 */
export class ApiService {
  /**
   * 发送 API 请求
   * @param endpoint API 端点或 ALL_PORT 中的键
   * @param method 请求方法
   * @param params 请求参数
   * @param getParams URL 查询参数
   * @returns Promise<T> 请求结果
   */
  static async request<T>(
    endpoint: string | keyof typeof ALL_PORT,
    method: 'GET' | 'POST' = 'POST',
    params: any = {},
    getParams?: Record<string, string>
  ): Promise<T> {
    // 解析端点
    let url: string;
    // 检查endpoint是否是ALL_PORT中的键
    const allPortKeys = Object.keys(ALL_PORT) as Array<keyof typeof ALL_PORT>;
    if (allPortKeys.includes(endpoint as any)) {
      // 如果是ALL_PORT中的键，使用对应的url
      url = ALL_PORT[endpoint as keyof typeof ALL_PORT].url;
    } else {
      // 否则直接使用字符串作为url
      url = endpoint as string;
    }
    
    // 构建完整 URL（添加查询参数）
    let fullUrl = url;
    if (getParams) {
      const searchParams = new URLSearchParams(getParams);
      fullUrl = `${url}?${searchParams.toString()}`;
    }
    
    // 构建请求选项
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      credentials: 'include',
    };
    
    // 添加请求体（POST 请求）
    if (method === 'POST' && Object.keys(params).length > 0) {
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      options.body = formData.toString();
    }
    
    try {
      const response = await fetch(fullUrl, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  /**
   * 获取图形验证码
   * @returns Promise<{ Data: { Img: string } }>
   */
  static async getVerifyCode() {
    const timestamp = new Date().getTime();
    try {
      const response = await fetch(`/api/common/GetLoginVC?t=${timestamp}`);
      if (!response.ok) return { IsSuccess: false, Data: { Img: '' } };
      return await response.json();
    } catch {
      return { IsSuccess: false, Data: { Img: '' } };
    }
  }

  /**
   * 发送短信验证码
   * @param telephone 手机号码
   * @returns Promise<{ IsSuccess: boolean; Message: string }>
   */
  static async sendSmsCode(telephone: string) {
    return this.request<{ IsSuccess: boolean; Message: string }>(
      '/api/sms/sendVerificationCode',
      'POST',
      { telephone }
    );
  }
  
  /**
   * 用户登录
   * @param params 登录参数
   * @returns Promise<LoginResponse>
   */
  static async login(params: {
    account: string;
    password?: string;
    ValidateCode?: string;
    smsValidateCode?: string;
    RememberMe: boolean;
  }) {
    // 直接使用完整的API路径
    return this.request<LoginResponse>('/api/Page/userLogin', 'POST', params);
  }
  
  /**
   * 踢出其他登录
   * @param kickUserId 用户 ID
   * @returns Promise<{ Type: number }>
   */
  static async kickOut(kickUserId: string) {
    return this.request<{ Type: number }>('/api/Page/KickOut', 'POST', { kickUserId });
  }
  
  /**
   * 获取用户信息
   * @returns Promise<{ Data: { Model: any } }>
   */
  static async getLoginShort() {
    return this.request<{ Data: { Model: any } }>('/api/Page/LoginShort', 'POST');
  }
}

// 登录响应类型
export interface LoginResponse {
  Type: number;
  Message: string;
  Data: any;
}
