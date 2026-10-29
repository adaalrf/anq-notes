import { createServer } from 'node:http';
import { lstat, readFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import config from '../site.config.js';
import { build } from './build.js';
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};
export function createPreview(root: string) {
  root = resolve(root);
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method || '')) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      if (
        path.includes('\\') ||
        path.includes('\0') ||
        path.split('/').some((part) => part.startsWith('.'))
      ) {
        response.writeHead(404);
        response.end();
        return;
      }
      const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
      // Walk each component so preview never serves through a symlink.
      let current = root;
      for (const part of file.slice(root.length + 1).split('/')) {
        current = join(current, part);
        const info = await lstat(current);
        if (info.isSymbolicLink())
          throw Object.assign(new Error('Link not served'), { code: 'ENOENT' });
      }
      const info = await lstat(file);
      if (info.isDirectory()) {
        response.writeHead(308, { Location: `${url.pathname}/${url.search}` });
        response.end();
        return;
      }
      if (!info.isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      response.end(request.method === 'HEAD' ? undefined : await readFile(file));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (error instanceof URIError) {
        response.writeHead(400);
        response.end();
        return;
      }
      response.writeHead(code === 'ENOENT' || code === 'ENOTDIR' ? 404 : 500, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      try {
        const fallback = await lstat(join(root, '404.html'));
        if (!fallback.isFile() || fallback.isSymbolicLink()) throw new Error('No safe fallback');
        response.end(
          request.method === 'HEAD' ? undefined : await readFile(join(root, '404.html')),
        );
      } catch {
        response.end('Not found');
      }
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await build(process.cwd(), config);
  const port = Number(process.env.PORT || 5176);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const server = createPreview(resolve('public'));
  server.listen(port, '127.0.0.1', () =>
    console.log(
      `ANQ Notes preview: http://localhost:${port}\nEdit content/styles and run npm run build to refresh. Ctrl-C stops the preview.`,
    ),
  );
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
