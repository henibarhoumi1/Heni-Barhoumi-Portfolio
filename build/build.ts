/**
 * Static build. Reads content/ and photos/, writes the finished site to dist/.
 *
 *   npm run build
 */
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { series as seriesContent } from '../content/series.ts';
import { site } from '../content/site.ts';
import { renderAbout } from '../src/templates/about.ts';
import { renderFrames } from '../src/templates/frames.ts';
import { renderHome } from '../src/templates/home.ts';
import { renderNotFound } from '../src/templates/not-found.ts';
import { renderSeries } from '../src/templates/series.ts';
import type { BuildContext, SeriesEntry } from '../src/templates/types.ts';
import { bundleAssets } from './assets.ts';
import { processFolder, shareImage } from './images.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');
const photosDir = path.join(root, 'photos');
const cacheDir = path.join(root, '.cache', 'images');

export async function buildSite({ minify = true } = {}): Promise<void> {
  const started = Date.now();
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(path.join(root, 'public'), outDir, { recursive: true });

  // Photos
  const entries: SeriesEntry[] = [];
  for (const s of seriesContent) {
    const frames = await processFolder(photosDir, s.slug, s.image ?? {}, cacheDir, outDir);
    if (frames.length === 0) {
      console.warn(`  skipped "${s.title}": no photos in photos/${s.slug}/`);
      continue;
    }
    const cover = frames.find((f) => f.name === s.cover) ?? frames[0]!;
    entries.push({ ...s, number: 0, frames, coverFrame: cover, path: `/work/${s.slug}/` });
  }
  entries.forEach((e, i) => (e.number = i + 1));
  const [portrait] = await processFolder(photosDir, '_portrait', { upscale: 1.5 }, cacheDir, outDir);

  // Share image from the first cover
  let ogImage: string | undefined;
  const first = entries[0];
  if (first) {
    const dir = path.join(photosDir, first.slug);
    const file = (await readdir(dir)).find((f) => path.basename(f, path.extname(f)) === first.coverFrame.name);
    if (file) {
      await shareImage(path.join(dir, file), path.join(outDir, 'share.jpg'));
      ogImage = '/share.jpg';
    }
  }

  const assets = await bundleAssets(root, outDir, minify);
  const ctx: BuildContext = { site, series: entries, portrait, assets, ogImage, year: new Date().getFullYear() };

  // Pages
  const pages = new Map<string, string>();
  pages.set('/', renderHome(ctx));
  pages.set('/frames/', renderFrames(ctx));
  pages.set('/about/', renderAbout(ctx));
  for (const entry of entries) pages.set(entry.path, renderSeries(ctx, entry));

  for (const [route, html] of pages) {
    const file = path.join(outDir, route, 'index.html');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  await writeFile(path.join(outDir, '404.html'), renderNotFound(ctx));

  const urls = [...pages.keys()].map((route) => `  <url><loc>${site.url}${route}</loc></url>`).join('\n');
  await writeFile(
    path.join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  const frameCount = entries.reduce((n, e) => n + e.frames.length, 0);
  console.log(`Built ${pages.size + 1} pages, ${frameCount} frames in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
