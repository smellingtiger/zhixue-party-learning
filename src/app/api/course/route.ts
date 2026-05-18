// 课程 API 代理路由 - 连接 Frontend8082 后端服务
import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const BACKEND_BASE_URL = 'http://192.168.1.244:8082';
const API_URL = `${BACKEND_BASE_URL}/api`;
const BACKEND_HOST = '192.168.1.244';
const BACKEND_PORT = 8082;
const BACKEND_PROTOCOL = 'http:';

// 后端 Session Cookie 缓存（服务端内存中共享）
let backendSessionCookie: string | null = null;
// 防伪造 Token（从后端获取）
let antiForgeryToken: Record<string, string> | null = null;
let isAuthenticating = false;
let authQueue: Array<() => void> = [];

/**
 * 使用 http 模块发送请求并捕获 Set-Cookie
 */
function httpPost(url: string, body: string, cookie?: string): Promise<{ data: string; cookies: string[]; status: number }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = body;
    
    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '80'),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    
    if (cookie) {
      (options.headers as Record<string, string>)['Cookie'] = cookie;
    }
    
    const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, (res) => {
      const cookies: string[] = res.headers['set-cookie'] || [];
      let data = '';
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ data, cookies, status: res.statusCode || 500 });
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 获取后端认证 Cookie + AntiForgeryToken
 */
async function ensureAuth(): Promise<{ cookie: string | null; token: Record<string, string> | null }> {
  if (backendSessionCookie && antiForgeryToken) {
    console.log('[Backend Auth] Using cached credentials');
    return { cookie: backendSessionCookie, token: antiForgeryToken };
  }

  if (isAuthenticating) {
    console.log('[Backend Auth] Waiting for ongoing authentication...');
    return new Promise((resolve) => {
      authQueue.push(() => resolve({ cookie: backendSessionCookie, token: antiForgeryToken }));
    });
  }

  isAuthenticating = true;
  try {
    console.log('[Backend Auth] Attempting login as yyf...');
    
    // 使用 http 模块直接获取 Set-Cookie
    const loginBody = new URLSearchParams({
      account: 'yyf',
      password: 'JYZXyyf@2026',
    }).toString();
    
    const loginResult = await httpPost(`${API_URL}/Page/userLogin`, loginBody);
    
    console.log('[Backend Auth] Login status:', loginResult.status);
    console.log('[Backend Auth] Login cookies count:', loginResult.cookies.length);
    console.log('[Backend Auth] Login data:', loginResult.data.slice(0, 300));
    
    let loginData: any = null;
    try {
      loginData = JSON.parse(loginResult.data);
      console.log('[Backend Auth] Login response:', JSON.stringify(loginData).slice(0, 500));
    } catch (e) {
      console.log('[Backend Auth] Login response is not JSON');
    }

    if (loginResult.cookies && loginResult.cookies.length > 0) {
      backendSessionCookie = loginResult.cookies.join('; ');
      console.log('[Backend Auth] Session cookie cached:', backendSessionCookie.slice(0, 150) + '...');
    } else {
      console.error('[Backend Auth] WARNING: No Set-Cookie header received!');
      console.error('[Backend Auth] Login data:', loginResult.data.slice(0, 200));
    }

    // 获取防伪造 Token（需要先有 Session）
    if (backendSessionCookie) {
      console.log('[Backend Auth] Fetching AntiForgeryToken...');
      const tokenResult = await httpPost(`${API_URL}/Page/AntiForgeryToken`, '', backendSessionCookie);
      const tokenHtml = tokenResult.data;
      console.log('[Backend Auth] AntiForgeryToken HTML:', tokenHtml.slice(0, 500));

      // 从 HTML 中提取 token: <input type="hidden" name="__RequestVerificationToken" value="xxx" />
      const nameMatch = tokenHtml.match(/name="([^"]+)"/);
      const valueMatch = tokenHtml.match(/value="([^"]+)"/);
      if (nameMatch && valueMatch) {
        antiForgeryToken = { [nameMatch[1]]: valueMatch[1] };
        console.log('[Backend Auth] AntiForgeryToken extracted:', antiForgeryToken);
      } else {
        console.error('[Backend Auth] WARNING: Could not extract AntiForgeryToken from HTML');
      }
    }

    authQueue.forEach(fn => fn());
    authQueue = [];
    return { cookie: backendSessionCookie, token: antiForgeryToken };
  } catch (error) {
    console.error('[Backend Auth] Login failed:', error);
    authQueue.forEach(fn => fn());
    authQueue = [];
    return { cookie: null, token: null };
  } finally {
    isAuthenticating = false;
  }
}

// 课程列表 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('id');
  const page = searchParams.get('page') || '1';
  const rows = searchParams.get('rows') || '10';
  const channelCode = searchParams.get('channelCode') || '';

  try {
    if (courseId) {
      const response = await fetch(`${API_URL}/Page/CourseContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ Id: courseId, titleNav: '课程详情' }),
      });
      return NextResponse.json(await response.json());
    }

    const response = await fetch(`${API_URL}/Page/CourseList`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({
        page, rows, sort: 'Sort', order: 'desc',
        courseType: 'All', channelId: '', channelCode, title: '',
        titleNav: '课程中心', wordLimt: '35', teacher: '', TagId: '', channelIds: '',
      }),
    });
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Failed to fetch course data:', error);
    return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500 });
  }
}

// 获取视频播放地址
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { courseId, playType = 'Single' } = body;
  
  // 支持强制重新认证（用于调试）
  const forceReauth = body.forceReauth === true;
  if (forceReauth) {
    console.log('[Play API] Force re-authentication requested');
    backendSessionCookie = null;
    antiForgeryToken = null;
  }

  try {
    // 获取认证信息
    const { cookie, token } = await ensureAuth();

    // 认证失败处理
    if (!cookie) {
      console.error('[Play API] Authentication failed! No session cookie available.');
      console.error('[Play API] Please check backend credentials and server connectivity.');
      return NextResponse.json({
        error: 'no-token',
        message: '后端登录失败，请检查服务器连接或联系管理员',
        IsSuccess: false,
        Type: 401
      }, { status: 401 });
    }

    // Jwplay 类型需要先调 Play API 获取数字 CourseId
    let targetCourseId = courseId;
    if (playType === 'Jwplay') {
      console.log('[Play API] Step 1: Fetching course info via Play API for', courseId);
      const playBody = new URLSearchParams({ id: courseId });
      if (token) {
        Object.entries(token).forEach(([key, value]) => {
          playBody.set(key, value);
        });
      }
      const playResult = await httpPost(`${API_URL}/Home/Play`, playBody.toString(), cookie);
      try {
        const playData = JSON.parse(playResult.data);
        if (playData.Data && playData.Data.CourseId) {
          const numericId = String(playData.Data.CourseId);
          console.log('[Play API] Got numeric CourseId:', numericId, 'from original:', courseId);
          targetCourseId = numericId;
        } else {
          console.log('[Play API] Play API did not return CourseId, trying direct call');
        }
      } catch {
        console.log('[Play API] Failed to parse Play response, trying direct call');
      }
    }

    let apiUrl: string;
    let requestBody: URLSearchParams;
    if (playType === 'JY') {
      apiUrl = `${API_URL}/Home/PlayJY`;
      requestBody = new URLSearchParams({ courseId: targetCourseId });
    } else if (playType === 'Office') {
      apiUrl = `${API_URL}/Home/PlayOffice`;
      requestBody = new URLSearchParams({ courseId: targetCourseId });
    } else if (playType === 'Jwplay') {
      apiUrl = `${API_URL}/Home/PlayJwplay`;
      requestBody = new URLSearchParams({ courseid: targetCourseId });
    } else {
      apiUrl = `${API_URL}/Home/PlaySingle`;
      requestBody = new URLSearchParams({ courseId: targetCourseId });
    }

    // 添加防伪造 Token
    if (token) {
      Object.entries(token).forEach(([key, value]) => {
        requestBody.set(key, value);
      });
    }

    console.log('[Play API] Calling:', apiUrl, 'with courseId:', targetCourseId);

    // 使用 http 模块发送请求，确保 Cookie 正确传递
    const playResult = await httpPost(apiUrl, requestBody.toString(), cookie);

    let data: any;
    try {
      data = JSON.parse(playResult.data);
    } catch (e) {
      data = { error: 'Invalid response', raw: playResult.data.slice(0, 500) };
    }

    console.log('[Play API] Response for', courseId, ':', JSON.stringify(data).slice(0, 300));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get video URL:', error);
    return NextResponse.json({ error: 'Failed to get video URL' }, { status: 500 });
  }
}
