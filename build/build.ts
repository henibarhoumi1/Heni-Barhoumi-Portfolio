/**
 * Static build. Reads content/ and photos/, writes the finished site to dist/.
 *
 *   npm run build
 */
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../content/projects.ts';
import { site } from '../content/site.ts';
import { fontCss, fonts } from '../src/fonts.ts';
import { renderAbout } from '../src/templates/about.ts';
import { renderContact } from '../src/templates/contact.ts';
import { renderNotFound } from '../src/templates/not-found.ts';
import { renderProject } from '../src/templates/project.ts';
import type { BuildContext } from '../src/templates/types.ts';
import { renderWork } from '../src/templates/work.ts';
import { bundleAssets } from './assets.ts';
import { processFolder, shareImage, touchIcon } from './images.ts';
import { type Entry, resolve, runningOrder } from './projects.ts';
import { processClips } from './videos.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');
const photosDir = path.join(root, 'photos');
const cacheDir = path.join(root, '.cache', 'images');

export async function buildSite({ minify = true } = {}): Promise<void> {
  const started = Date.now();
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await cp(path.join(root, 'public'), outDir, { recursive: true });

  const slugs = new Set<string>();
  const entries: Entry[] = [];
  for (const project of projects) {
    if (slugs.has(project.slug)) throw new Error(`two projects share the slug "${project.slug}"`);
    slugs.add(project.slug);
    const frames = await processFolder(photosDir, project.slug, project.image ?? {}, cacheDir, outDir);
    if (frames.length === 0) {
      console.warn(`  skipped "${project.title}": no images in photos/${project.slug}/`);
      continue;
    }
    const clips = await processClips(photosDir, project.slug, outDir);
    entries.push(resolve(project, frames, clips));
  }
  const [portrait] = await processFolder(photosDir, '_portrait', { whiten: true }, cacheDir, outDir);

  const rows = runningOrder(entries);
  const curated = rows.flatMap((r) => (r.layout === 'pair' ? r.entries : [r.entry]));
  const sequence = [...curated, ...entries.filter((e) => !curated.includes(e))];
  const everything = [...entries].sort((a, b) => b.year - a.year);

  // Share card and home-screen icon.
  let ogImage: string | undefined;
  if (sequence.length > 0) {
    const covers = sequence.slice(0, 5).map((e) => path.join(outDir, e.cover.jpg.url));
    await shareImage(path.join(root, 'src', 'brand', 'share.svg'), covers, path.join(outDir, 'share.jpg'));
    ogImage = '/share.jpg';
  }
  await touchIcon(path.join(root, 'public', 'favicon.svg'), path.join(outDir, 'apple-touch-icon.png'));

  const assets = await bundleAssets(root, outDir, minify);
  const ctx: BuildContext = {
    site,
    entries,
    rows,
    sequence,
    everything,
    portrait,
    assets,
    fontCss: fontCss(),
    preload: fonts.preload,
    ogImage,
    year: new Date().getFullYear(),
  };

  const pages = new Map<string, string>();
  pages.set('/', renderWork(ctx));
  pages.set('/about/', renderAbout(ctx));
  pages.set('/contact/', renderContact(ctx));
  for (const entry of entries) pages.set(entry.path, renderProject(ctx, entry));

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

  const images = entries.reduce((n, e) => n + e.frames.length, 0);
  console.log(`Built ${pages.size + 1} pages, ${entries.length} projects, ${images} images in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
