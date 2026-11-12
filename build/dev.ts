/**
 * Development: build once, serve dist/, rebuild when a source file changes.
 *
 *   npm run dev
 */
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { serve } from './serve.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Each rebuild runs in a fresh process so edited templates and content are re-read.
let running = false;
let queued = false;
function rebuild(): void {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const child = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'build', 'build.ts')], { cwd: root, stdio: 'inherit' });
  child.on('exit', () => {
    running = false;
    if (queued) {
      queued = false;
      rebuild();
    }
  });
}

let timer: NodeJS.Timeout | undefined;
for (const dir of ['src', 'content', 'photos', 'public']) {
  watch(path.join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

rebuild();
serve(path.join(root, 'dist'), Number(process.env.PORT ?? 4321));
