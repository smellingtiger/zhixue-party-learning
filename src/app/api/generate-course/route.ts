import { NextRequest } from 'next/server';

const PYTHON_SERVICE_URL = 'http://localhost:8081';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, diagnostic } = body;

    if (!topic || !topic.trim()) {
      return new Response(JSON.stringify({ error: '课程主题不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/api/generate-course`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim(), diagnostic: diagnostic || null }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error('[generate-course] Python服务错误:', errorText);
      return new Response(JSON.stringify({ error: '课程生成服务异常' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(pythonResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[generate-course] 请求处理错误:', error);
    const message = error instanceof Error && error.message.includes('ECONNREFUSED')
      ? '课程生成服务未启动，请先启动Python服务（knowledge-server/course_generator.py）'
      : '课程生成请求失败';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
