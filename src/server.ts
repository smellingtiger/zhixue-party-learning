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

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      
      // Proxy API requests to backend server
      // Exclude local API routes that should be handled by Next.js
      const isLocalApiRoute = parsedUrl.pathname?.startsWith('/api/outline/') ||
                               parsedUrl.pathname?.startsWith('/api/tts/') ||
                               parsedUrl.pathname?.startsWith('/api/llm') ||
                               parsedUrl.pathname?.startsWith('/api/knowledge-base/') ||
                               parsedUrl.pathname?.startsWith('/api/knowledge-base');
      
      if ((parsedUrl.pathname?.startsWith('/api/') || 
          parsedUrl.pathname?.startsWith('/sso/') || 
          parsedUrl.pathname?.startsWith('/user/') || 
          parsedUrl.pathname?.startsWith('/live/')) && !isLocalApiRoute) {
        const proxy = createProxyMiddleware({
          target: 'http://192.168.1.244:8082',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '/api',
            '^/sso': '/sso',
            '^/user': '/user',
            '^/live': '/live',
          },
        });
        
        // @ts-ignore
        proxy(req, res);
      } else {
        // Handle Next.js requests
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('Internal server error');
  }
}).listen(port, () => {
  console.log(
    `> Server listening at http://${hostname}:${port} as ${
      dev ? 'development' : process.env.COZE_PROJECT_ENV
    }`,
  );
});
