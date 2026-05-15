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

function isNextInternalPath(pathname: string | undefined): boolean {
  if (!pathname) return false;
  return NEXT_INTERNAL_PATHS.some(path => pathname.startsWith(path));
}

function shouldProxy(pathname: string | undefined): boolean {
  if (!pathname || isNextInternalPath(pathname)) {
    return false;
  }
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/sso/') ||
    pathname.startsWith('/user/') ||
    pathname.startsWith('/live/')
  );
}

createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url!, true);

    if (shouldProxy(parsedUrl.pathname)) {
      const proxy = createProxyMiddleware({
        target: 'http://192.168.1.244:8082',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/api',
          '^/sso': '/sso',
          '^/user': '/user',
          '^/live': '/live',
        },
      });

      proxy(req, res);
    } else {
      const app = next({ dev, hostname, port });
      await app.prepare();
      const handle = app.getRequestHandler();
      await handle(req, res, parsedUrl);
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
