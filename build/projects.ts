/**
 * Turns the content of a project into what the templates draw: names of
 * images and clips become processed files, the preset becomes blocks, the
 * room colour becomes a pair of colours with enough contrast.
 */
import type { Block, Credit, Project, SequenceLayout, Spread } from '../content/types.ts';
import type { Frame } from './images.ts';
import { presetBlocks } from './presets.ts';
import type { Clip } from './videos.ts';

/** A picture or a clip with its poster. */
export type Media = { kind: 'still'; frame: Frame } | { kind: 'clip'; clip: Clip; poster: Frame };

export interface Room {
  /** Background. */
  bg: string;
  /** Text. */
  ink: string;
  /** True when the page goes dark. */
  dark: boolean;
}

export interface Film {
  id: string;
  hash?: string;
  poster: Frame;
  ratio: number;
  caption?: string;
}

export type Section =
  | { type: 'opening' }
  | { type: 'hero'; media: Media }
  | { type: 'description'; text: string }
  | { type: 'sequence'; layout: SequenceLayout; media: Media[]; side: 'left' | 'right' }
  | { type: 'film'; film: Film }
  | { type: 'pull'; text: string }
  | { type: 'credits'; credits: Credit[] };

export interface Entry {
  slug: string;
  title: string;
  year: number;
  type: string;
  role: string;
  client?: string;
  place?: string;
  path: string;
  spread?: Spread;
  side?: 'left' | 'right';
  cover: Frame;
  frames: Frame[];
  preview: { still?: Frame; clip?: Clip };
  hero: Media;
  room: Room;
  sections: Section[];
}

/** Black and white only: the bright room is white with black type, the dark room the reverse. */
export function room(project: Pick<Project, 'room'>): Room {
  if (project.room === 'bright') return { bg: '#ffffff', ink: '#000000', dark: false };
  if (project.room === 'dark') return { bg: '#000000', ink: '#ffffff', dark: true };
  throw new Error(`room must be 'bright' or 'dark', got "${String(project.room)}"`);
}

/** Accepts vimeo.com/123, vimeo.com/123/abcdef, player.vimeo.com/video/123?h=abcdef. */
export function parseVimeo(url: string): { id: string; hash?: string } {
  const u = new URL(url);
  if (!/(^|\.)vimeo\.com$/.test(u.hostname)) throw new Error(`not a Vimeo address: ${url}`);
  const parts = u.pathname.split('/').filter(Boolean);
  const at = parts.findIndex((p) => /^\d+$/.test(p));
  const id = parts[at];
  if (!id) throw new Error(`no video number in ${url}`);
  const hash = u.searchParams.get('h') ?? (parts[at + 1] && /^[0-9a-f]+$/i.test(parts[at + 1] as string) ? parts[at + 1] : undefined);
  return hash ? { id, hash } : { id };
}

export function resolve(project: Project, frames: Frame[], clips: Map<string, Clip>): Entry {
  const where = `project "${project.slug}"`;
  const still = (name: string, what: string): Frame => {
    const frame = frames.find((f) => f.name === name);
    if (!frame) throw new Error(`${where}: ${what} "${name}" is not an image in photos/${project.slug}/`);
    return frame;
  };
  const clip = (name: string, what: string): Clip => {
    const found = clips.get(name);
    if (!found) throw new Error(`${where}: ${what} "${name}" is not a clip in photos/${project.slug}/`);
    return found;
  };
  /** A name in a sequence: an image, or a clip whose poster is the image of the same name, else the cover. */
  const media = (name: string): Media => {
    if (clips.has(name)) {
      const base = name.replace(/\.[^.]+$/, '');
      return { kind: 'clip', clip: clip(name, 'clip'), poster: frames.find((f) => f.name === base) ?? cover };
    }
    return { kind: 'still', frame: still(name, 'image') };
  };

  const cover = project.cover ? still(project.cover, 'cover') : (frames[0] as Frame);
  const heroStill = project.hero?.still ? still(project.hero.still, 'hero still') : cover;
  const hero: Media = project.hero?.video ? { kind: 'clip', clip: clip(project.hero.video, 'hero video'), poster: heroStill } : { kind: 'still', frame: heroStill };

  const previewStill = project.preview?.still ? still(project.preview.still, 'preview still') : frames.find((f) => f !== cover);
  const preview = {
    ...(previewStill ? { still: previewStill } : {}),
    ...(project.preview?.video ? { clip: clip(project.preview.video, 'preview video') } : {}),
  };

  const film = (block?: { vimeo?: string; poster?: string; caption?: string }): Film | null => {
    const vimeo = block?.vimeo ?? project.film?.vimeo;
    if (!vimeo) return null;
    const posterName = block?.poster ?? project.film?.poster;
    return {
      ...parseVimeo(vimeo),
      poster: posterName ? still(posterName, 'film poster') : heroStill,
      ratio: project.film?.ratio ?? 16 / 9,
      ...(block?.caption ? { caption: block.caption } : {}),
    };
  };

  const stillNames = frames.map((f) => f.name);
  const blocks: Block[] = project.blocks ? [...project.blocks] : presetBlocks(project, stillNames, heroStill.name);
  if (!blocks.some((b) => b.type === 'opening')) blocks.unshift({ type: 'opening' });

  // Heni's role leads the credits.
  const credits: Credit[] = [{ role: project.role, name: 'Heni Barhoumi' }, ...project.credits];

  let turn = 0;
  const sections: Section[] = blocks.flatMap((block): Section[] => {
    switch (block.type) {
      case 'opening':
        return [{ type: 'opening' }];
      case 'hero':
        return [{ type: 'hero', media: hero }];
      case 'description':
        return project.description ? [{ type: 'description', text: project.description }] : [];
      case 'sequence': {
        turn += 1;
        if (block.media.length === 0) return [];
        return [{ type: 'sequence', layout: block.layout, media: block.media.map(media), side: block.side ?? (turn % 2 ? 'left' : 'right') }];
      }
      case 'film': {
        const f = film(block);
        return f ? [{ type: 'film', film: f }] : [];
      }
      case 'pull':
        return block.text.trim() ? [{ type: 'pull', text: block.text.trim() }] : [];
      case 'credits':
        return [{ type: 'credits', credits }];
    }
  });

  return {
    slug: project.slug,
    title: project.title,
    year: project.year,
    type: project.type,
    role: project.role,
    ...(project.client ? { client: project.client } : {}),
    ...(project.place ? { place: project.place } : {}),
    path: `/work/${project.slug}/`,
    ...(project.spread ? { spread: project.spread } : {}),
    ...(project.side ? { side: project.side } : {}),
    cover,
    frames,
    preview,
    hero,
    room: room(project),
    sections,
  };
}

/** One spread of the running order: a single project, or two side by side. */
export type Row = { layout: Exclude<Spread, 'pair'>; entry: Entry; side: 'left' | 'right' } | { layout: 'pair'; entries: [Entry, Entry] };

/** The curated running order. Consecutive 'pair' projects share a row; a lone one becomes an offset. */
export function runningOrder(entries: Entry[]): Row[] {
  const picked = entries.filter((e) => e.spread);
  const out: Row[] = [];
  // Each layout alternates its own side, so two offsets (or two smalls) never mirror each other.
  const turns: Record<string, number> = {};
  for (let i = 0; i < picked.length; i++) {
    const e = picked[i] as Entry;
    const next = picked[i + 1];
    if (e.spread === 'pair' && next?.spread === 'pair') {
      out.push({ layout: 'pair', entries: [e, next] });
      i += 1;
      continue;
    }
    const layout = e.spread === 'pair' ? 'offset' : (e.spread as Exclude<Spread, 'pair'>);
    // Offsets and smalls alternate sides unless the content says otherwise.
    const turn = (turns[layout] = (turns[layout] ?? -1) + 1);
    const side = e.side ?? (layout === 'small' ? (turn % 2 === 0 ? 'right' : 'left') : turn % 2 === 0 ? 'left' : 'right');
    out.push({ layout, entry: e, side });
  }
  return out;
}
