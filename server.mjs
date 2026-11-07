import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

export function createStaticServer() {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const filePath = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      const relativePath = filePath.slice(root.length);
      if (!filePath.startsWith(root.endsWith(sep) ? root : root + sep) || relativePath.split(sep).some((part) => part.startsWith('.'))) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }
      const mimeType = contentTypes[extname(filePath)];
      if (!mimeType || !(await stat(filePath)).isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      const content = await readFile(filePath);
      response.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': content.length,
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      const status = error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : error instanceof URIError ? 400 : 500;
      response.writeHead(status);
      response.end(status === 404 ? 'Not found' : status === 400 ? 'Bad request' : 'Server error');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const server = createStaticServer();
  server.on('error', (error) => {
    console.error(`Unable to start the proposal: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`Orelli × Stalite proposal is ready on http://0.0.0.0:${port}`);
  });
}
