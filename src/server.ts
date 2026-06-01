import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const NEXT_INTERNAL_PATHS = [
  '/_next',
  '/__nextjs',
  '/__webpack_hmr',
];

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const apiProxy = createProxyMiddleware({
  target: 'http://192.168.1.244:8082',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
    '^/sso': '/sso',
    '^/user': '/user',
    '^/live': '/live',
  },
});

const videoProxy = createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api',
  },
});

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);

      const isLocalApiRoute =
        parsedUrl.pathname?.startsWith('/api/outline/') ||
        parsedUrl.pathname?.startsWith('/api/tts/') ||
        parsedUrl.pathname?.startsWith('/api/llm') ||
        parsedUrl.pathname?.startsWith('/api/knowledge-base/') ||
        parsedUrl.pathname?.startsWith('/api/knowledge-base') ||
        parsedUrl.pathname?.startsWith('/api/speech-writer') ||
        parsedUrl.pathname?.startsWith('/api/content-audit') ||
        parsedUrl.pathname?.startsWith('/api/lesson-prep') ||
        parsedUrl.pathname?.startsWith('/api/course-outline-gen') ||
        parsedUrl.pathname?.startsWith('/api/disaster-knowledge-graph') ||
        parsedUrl.pathname?.startsWith('/api/rescue-plan') ||
        parsedUrl.pathname?.startsWith('/api/emergency-qa') ||
        parsedUrl.pathname?.startsWith('/api/sentinel-chat') ||
        parsedUrl.pathname?.startsWith('/api/role-chat') ||
        parsedUrl.pathname?.startsWith('/api/generate-course') ||
        parsedUrl.pathname?.startsWith('/api/training') ||
        parsedUrl.pathname?.startsWith('/api/user/diagnostic') ||
        parsedUrl.pathname?.startsWith('/api/admin') ||
        parsedUrl.pathname?.startsWith('/api/emergency-documents');

      // 视频路由代理到8080端口
      const isVideoRoute = parsedUrl.pathname?.startsWith('/api/video');

      const shouldProxy =
        (parsedUrl.pathname?.startsWith('/api/') ||
          parsedUrl.pathname?.startsWith('/sso/') ||
          parsedUrl.pathname?.startsWith('/user/') ||
          parsedUrl.pathname?.startsWith('/live/')) &&
        !isLocalApiRoute &&
        !NEXT_INTERNAL_PATHS.some(p => parsedUrl.pathname?.startsWith(p));

      if (isVideoRoute) {
        videoProxy(req as any, res as any, () => {});
        return;
      }

      if (shouldProxy) {
        apiProxy(req as any, res as any, () => {});
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.listen(port, hostname, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
