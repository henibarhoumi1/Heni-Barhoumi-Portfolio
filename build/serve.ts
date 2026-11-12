/**
 * Minimal static server for dist/, used by `npm run preview` and `npm run dev`.
 * Mirrors the Cloudflare behaviour we rely on: directory index files and 404.html.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const isFile = (p: string) => stat(p).then((s) => s.isFile(), () => false);

export function serve(dir: string, port: number): Server {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const safe = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(dir, safe);
    if (!file.startsWith(dir)) file = path.join(dir, '404.html');
    if (!(await isFile(file))) file = path.join(file, 'index.html');
    let status = 200;
    if (!(await isFile(file))) {
      file = path.join(dir, '404.html');
      status = 404;
    }
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  server.listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  serve(path.join(root, 'dist'), Number(process.env.PORT ?? 4321));
}
