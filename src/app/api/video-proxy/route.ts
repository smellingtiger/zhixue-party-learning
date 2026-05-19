import { NextRequest } from 'next/server';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_CHUNK_SIZE = 2 * 1024 * 1024;

function createStreamingRequest(
  options: http.RequestOptions,
  protocol: typeof http | typeof https
): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      resolve(res);
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy(new Error('Request timeout'));
    });
    req.end();
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const parsedUrl = new URL(targetUrl);
    let rangeHeader = request.headers.get('range') || '';

    const referer = `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    console.log('[VideoProxy] Request:', targetUrl.slice(0, 120), 'Range:', rangeHeader || '(none)');

    if (rangeHeader && /^bytes=\d+-$/i.test(rangeHeader)) {
      const startByte = parseInt(rangeHeader.match(/bytes=(\d+)-/)?.[1] || '0', 10);
      const endByte = startByte + MAX_CHUNK_SIZE - 1;
      const originalRange = rangeHeader;
      rangeHeader = `bytes=${startByte}-${endByte}`;
      console.log('[VideoProxy] Converted Range:', originalRange, '->', rangeHeader);
    }

    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': referer,
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
      },
    };

    if (rangeHeader) {
      (options.headers as Record<string, string>)['Range'] = rangeHeader;
    }

    const upstream = await createStreamingRequest(options, protocol);

    const statusCode = upstream.statusCode || 500;
    console.log('[VideoProxy] OSS response:', statusCode, 'CT:', upstream.headers['content-type'], 'CL:', upstream.headers['content-length']);

    if (statusCode === 403 || statusCode === 404) {
      upstream.resume();
      console.error(`[VideoProxy] OSS ${statusCode}`);
      return new Response(`OSS returned ${statusCode}`, { status: 502 });
    }

    if (statusCode >= 400) {
      upstream.resume();
      console.error(`[VideoProxy] OSS error ${statusCode}`);
      return new Response(`OSS error ${statusCode}`, { status: 502 });
    }

    const contentType = upstream.headers['content-type'] || 'video/mp4';
    const contentLength = upstream.headers['content-length'];
    const contentRange = upstream.headers['content-range'];
    const acceptRanges = upstream.headers['accept-ranges'];

    const responseHeaders: Record<string, string> = {
      'Content-Type': String(contentType),
      'Accept-Ranges': acceptRanges || 'bytes',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
    };

    const isPartial = statusCode === 206 || !!contentRange;

    if (isPartial && contentRange) {
      responseHeaders['Content-Range'] = String(contentRange);
      if (contentLength) {
        responseHeaders['Content-Length'] = String(contentLength);
      }
    } else if (contentLength) {
      responseHeaders['Content-Length'] = String(contentLength);
    }

    const responseStatus = isPartial ? 206 : 200;

    console.log('[VideoProxy] Returning:', responseStatus, 'CT:', contentType, 'CL:', responseHeaders['Content-Length'], 'CR:', contentRange?.slice(0, 60));

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        upstream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        upstream.on('end', () => controller.close());
        upstream.on('error', (err) => controller.error(err));
      },
      cancel() {
        upstream.destroy();
      },
    });

    return new Response(stream, {
      status: responseStatus,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[VideoProxy] Error:', error.message);

    if (error.message?.includes('timeout')) {
      return new Response('Proxy timeout', { status: 504 });
    }

    return new Response('Proxy failed: ' + (error.message || 'Unknown error'), { status: 500 });
  }
}
