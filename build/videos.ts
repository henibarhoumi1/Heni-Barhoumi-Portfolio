/**
 * Short clips (previews and hero loops) are published as they are, under a
 * name that changes when the file changes so browsers can cache them forever.
 * Encode them before adding them: about six seconds, muted, under 1.5 MB.
 * Full films do not live here; they play from Vimeo.
 */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const VIDEO_EXT: Record<string, string> = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime' };
const LIMIT = 1.5 * 1024 * 1024;

export interface Clip {
  /** File name as written in the content, e.g. 'preview.mp4'. */
  name: string;
  url: string;
  type: string;
  bytes: number;
}

export async function processClips(photosDir: string, folder: string, outDir: string): Promise<Map<string, Clip>> {
  const dir = path.join(photosDir, folder);
  const clips = new Map<string, Clip>();
  const files = await readdir(dir).catch(() => [] as string[]);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const type = VIDEO_EXT[ext];
    if (!type) continue;
    const source = path.join(dir, file);
    const bytes = (await stat(source)).size;
    if (bytes > LIMIT) console.warn(`  ${folder}/${file} is ${(bytes / 1024 / 1024).toFixed(1)} MB; previews should stay under 1.5 MB`);
    const hash = createHash('sha256').update(await readFile(source)).digest('hex').slice(0, 10);
    const name = `${path.basename(file, ext)}.${hash}${ext}`;
    await mkdir(path.join(outDir, 'media', folder), { recursive: true });
    await copyFile(source, path.join(outDir, 'media', folder, name));
    clips.set(file, { name: file, url: `/media/${folder}/${name}`, type, bytes });
  }
  return clips;
}
