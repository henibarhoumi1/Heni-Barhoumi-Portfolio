/**
 * Image pipeline.
 *
 * Every file in photos/<series>/ becomes one "frame": a set of AVIF and WebP
 * files at several widths plus a JPEG fallback. Sources are never enlarged
 * unless a series asks for it; the layout shows images small enough that
 * Instagram-sized files stay sharp.
 *
 * Results are cached in .cache/images, keyed by the source bytes and the
 * options, so only new or changed photos are re-encoded.
 */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp, { type Sharp } from 'sharp';

/** Bump to invalidate every cached image after changing the pipeline. */
const PIPELINE_VERSION = 8;
const WIDTHS = [240, 480, 720, 1080, 1440];
const MAX_WIDTH = 1920;
const DEFAULT_UPSCALE = 1;
const SOURCE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']);

export interface Variant {
  width: number;
  url: string;
}

export interface Frame {
  /** "<series>/<name>", unique across the site. */
  id: string;
  series: string;
  /** Filename without extension. */
  name: string;
  /** Pixel size of the largest variant. */
  width: number;
  height: number;
  /** width / height */
  ratio: number;
  avif: Variant[];
  webp: Variant[];
  jpg: Variant;
}

export interface ImageOptions {
  /** Crop solid black bars off the edges. */
  trim?: boolean;
  /** Upper limit for enlarging small sources. Default 1: never. */
  upscale?: number;
  /** Push a near-white studio background to pure white so it joins the page. */
  whiten?: boolean;
}

interface CacheEntry {
  frame: Frame;
  files: string[];
}

const exists = (p: string) => stat(p).then(() => true, () => false);

async function pool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

/**
 * Finds solid black bars (letterbox or frame) on the edges of an image.
 * A row or column counts as bar when it is both dark and flat; real dark
 * picture content has texture and is left alone.
 */
async function blackBars(image: Sharp): Promise<{ left: number; top: number; width: number; height: number } | null> {
  const { data, info } = await image.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const isBar = (values: number[]): boolean => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const spread = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    return mean < 26 && spread < 10;
  };
  const row = (y: number) => Array.from({ length: width }, (_, x) => data[y * width + x] as number);
  const col = (x: number) => Array.from({ length: height }, (_, y) => data[y * width + x] as number);

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;
  while (top < height / 3 && isBar(row(top))) top++;
  while (bottom > (height * 2) / 3 && isBar(row(bottom))) bottom--;
  while (left < width / 3 && isBar(col(left))) left++;
  while (right > (width * 2) / 3 && isBar(col(right))) right--;

  // Ignore slivers, and shave a few more pixels to clear the soft edge of a bar.
  const edge = (n: number) => (n >= 4 ? n + 5 : 0);
  const box = {
    left: edge(left),
    top: edge(top),
    width: width - edge(left) - edge(width - 1 - right),
    height: height - edge(top) - edge(height - 1 - bottom),
  };
  return box.width === width && box.height === height ? null : box;
}

async function processOne(
  file: string,
  series: string,
  options: ImageOptions,
  cacheDir: string,
  outDir: string,
): Promise<Frame> {
  const source = await readFile(file);
  const name = path.basename(file, path.extname(file));
  const key = createHash('sha256')
    .update(source)
    .update(JSON.stringify({ options, WIDTHS, MAX_WIDTH, PIPELINE_VERSION }))
    .digest('hex')
    .slice(0, 10);

  const entryDir = path.join(cacheDir, series, `${name}.${key}`);
  const entryFile = path.join(entryDir, 'entry.json');
  const destDir = path.join(outDir, 'media', series);
  await mkdir(destDir, { recursive: true });

  if (!(await exists(entryFile))) {
    await mkdir(entryDir, { recursive: true });

    // 1. Orient, optionally crop black bars.
    let base = sharp(await sharp(source, { failOn: 'none' }).rotate().toBuffer());
    if (options.trim) {
      const box = await blackBars(base);
      if (box) base = base.extract(box);
    }
    if (options.whiten) {
      // Scale each channel so the top-left corner (the backdrop) lands just past white.
      const corner = await base.clone().extract({ left: 0, top: 0, width: 8, height: 8 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const channels = corner.info.channels;
      const mean = [0, 1, 2].map((c) => {
        let sum = 0;
        for (let i = c; i < corner.data.length; i += channels) sum += corner.data[i] as number;
        return sum / (corner.data.length / channels);
      });
      const gain = mean.map((m) => 258 / Math.max(m, 1));
      base = sharp(await base.png({ compressionLevel: 1 }).toBuffer()).linear(gain, [0, 0, 0]);
    }
    const oriented = await base.toColourspace('srgb').png({ compressionLevel: 1 }).toBuffer({ resolveWithObject: true });

    // 2. Master: never above MAX_WIDTH, upscaled at most `upscale` times.
    const srcW = oriented.info.width;
    const target = Math.min(MAX_WIDTH, Math.round(srcW * (options.upscale ?? DEFAULT_UPSCALE)));
    let masterPipe = sharp(oriented.data);
    if (target !== srcW) masterPipe = masterPipe.resize({ width: target, kernel: 'lanczos3' });
    if (target > srcW) masterPipe = masterPipe.sharpen({ sigma: 0.8, m1: 0.4, m2: 1.2 });
    const master = await masterPipe.png({ compressionLevel: 1 }).toBuffer({ resolveWithObject: true });
    const { width, height } = master.info;

    const widths = WIDTHS.filter((w) => w <= width - 80);
    widths.push(width);

    const files: string[] = [];
    const encode = async (w: number, ext: 'avif' | 'webp' | 'jpg'): Promise<Variant> => {
      const filename = `${name}.${key}-${w}.${ext}`;
      const resized = sharp(master.data).resize({ width: w, kernel: 'lanczos3' });
      const out =
        ext === 'avif' ? resized.avif({ quality: 58, effort: 2 })
        : ext === 'webp' ? resized.webp({ quality: 80, effort: 4 })
        : resized.jpeg({ quality: 82, mozjpeg: true });
      await out.toFile(path.join(entryDir, filename));
      files.push(filename);
      return { width: w, url: `/media/${series}/${filename}` };
    };

    const avif: Variant[] = [];
    const webp: Variant[] = [];
    for (const w of widths) {
      avif.push(await encode(w, 'avif'));
      webp.push(await encode(w, 'webp'));
    }
    const jpgWidth = widths.filter((w) => w <= 1080).pop() ?? width;
    const jpg = await encode(jpgWidth, 'jpg');

    const frame: Frame = {
      id: `${series}/${name}`,
      series,
      name,
      width,
      height,
      ratio: Number((width / height).toFixed(4)),
      avif,
      webp,
      jpg,
    };
    const entry: CacheEntry = { frame, files };
    await writeFile(entryFile, JSON.stringify(entry));
  }

  const entry = JSON.parse(await readFile(entryFile, 'utf8')) as CacheEntry;
  await Promise.all(entry.files.map((f) => copyFile(path.join(entryDir, f), path.join(destDir, f))));
  return entry.frame;
}

/** Process every photo of one folder under photos/. Frames are sorted by filename. */
export async function processFolder(
  photosDir: string,
  series: string,
  options: ImageOptions,
  cacheDir: string,
  outDir: string,
): Promise<Frame[]> {
  const dir = path.join(photosDir, series);
  if (!(await exists(dir))) return [];
  const files = (await readdir(dir))
    .filter((f) => SOURCE_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map((f) => path.join(dir, f));
  const limit = Math.max(1, Math.min(os.availableParallelism(), 6));
  return pool(files, limit, (file) => processOne(file, series, options, cacheDir, outDir));
}

/** 1200x630 share image cut from a frame's source file. */
export async function shareImage(file: string, outFile: string): Promise<void> {
  await mkdir(path.dirname(outFile), { recursive: true });
  await sharp(file, { failOn: 'none' })
    .rotate()
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outFile);
}
