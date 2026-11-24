/**
 * Checks the case-study template without publishing anything: builds the
 * site into a temporary folder with one placeholder project added, then
 * checks that its parts are there, numbered, and in order.
 *
 *   npm run test:case            (the built pages stay in .cache/case-test/ to look at)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const work = path.join(root, '.cache', 'case-test');
const photos = path.join(work, 'photos');
const out = path.join(work, 'dist');

rmSync(work, { recursive: true, force: true });
mkdirSync(photos, { recursive: true });
for (const folder of readdirSync(path.join(root, 'photos'))) symlinkSync(path.join(root, 'photos', folder), path.join(photos, folder));
// The placeholder project borrows an existing series' images.
symlinkSync(path.join(root, 'photos', 'the-sea-is-a-vast-graveyard'), path.join(photos, 'template-test'));

execFileSync(process.execPath, ['--import', 'tsx', path.join(root, 'build', 'build.ts')], {
  stdio: 'inherit',
  env: { ...process.env, OUT_DIR: out, PHOTOS_DIR: photos, FIXTURE: path.join(root, 'test', 'fixtures', 'case-study.ts') },
});

const html = readFileSync(path.join(out, 'work', 'template-test', 'index.html'), 'utf8');
const expect = ['(01) Project', '(02) Context', '(03) Creative direction', '(04) Execution', '(05) Heni’s contribution', '(06) Final work', '(07) Credits'];
let at = -1;
for (const label of expect) {
  const i = html.indexOf(label);
  if (i < 0) throw new Error(`missing "${label}"`);
  if (i < at) throw new Error(`"${label}" is out of order`);
  at = i;
}
for (const must of ['Placeholder client', 'Placeholder role A, Placeholder role B', 'project--case', '"@type":"CreativeWork"']) {
  if (!html.includes(must)) throw new Error(`missing "${must}"`);
}
if (existsSync(path.join(root, 'dist', 'work', 'template-test'))) throw new Error('the placeholder project leaked into dist/');
console.log(`Case-study template OK: ${expect.length} parts in order. Pages in ${path.relative(root, out)}/`);
