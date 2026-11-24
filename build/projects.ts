/**
 * Turns the content of a project into what the templates draw: names of
 * images and clips become processed files, and the project page becomes a
 * list of spreads.
 */
import type { Credit, Project, Spread } from '../content/types.ts';
import type { Frame } from './images.ts';
import type { Clip } from './videos.ts';

/** A picture or a clip with its poster. */
export type Media = { kind: 'still'; frame: Frame } | { kind: 'clip'; clip: Clip; poster: Frame };

export interface Film {
  id: string;
  hash?: string;
  poster: Frame;
  ratio: number;
}

export type Page =
  | { kind: 'opening'; large: Media; small?: Media }
  | { kind: 'pair'; media: [Media, Media] }
  | { kind: 'single'; media: Media; side: 'left' | 'right' }
  | { kind: 'small-large'; small: Media; large: Media }
  | { kind: 'film'; film: Film };

export interface Entry {
  slug: string;
  kind: 'series' | 'case';
  title: string;
  year: number;
  type: string;
  role: string;
  /** Heni's roles as shown: `roles` when given, otherwise `role`. */
  roles: string[];
  /** Case-study sections that have content, in reading order. */
  sections: { label: string; text: string }[];
  client?: string;
  place?: string;
  description?: string;
  path: string;
  /** On the Work strip. */
  selected: boolean;
  /** Two digits, in order of the site: selected work first. Set by number(). */
  number: string;
  /** One line under the title: type, place, year. */
  caption: string;
  cover: Frame;
  frames: Frame[];
  /** Images on the Work strip. */
  strip: Frame[];
  spreads: Page[];
  /** Heni's role first, then the collaborators. */
  credits: Credit[];
  /** Text alternative for each image, by file name. */
  alt: (frame: Frame) => string;
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

/**
 * The automatic page: an opening, then a rhythm of pairs, singles and
 * small-beside-large, so no two projects with different counts of images
 * read the same. A spread that would be short of images becomes a single.
 */
export function autoSpreads(names: string[], cover: string, hasFilm: boolean): Spread[] {
  const rest = names.filter((n) => n !== cover);
  const take = (n: number) => rest.splice(0, n);
  const out: Spread[] = [];
  const small = take(1)[0];
  out.push(small ? { kind: 'opening', large: cover, small } : { kind: 'opening', large: cover });
  if (hasFilm) out.push({ kind: 'film' });
  const rhythm = ['pair', 'single-left', 'small-large', 'pair', 'single-right'] as const;
  let beat = 0;
  while (rest.length > 0) {
    const step = rhythm[beat % rhythm.length] as (typeof rhythm)[number];
    beat += 1;
    const two = step === 'pair' || step === 'small-large';
    if (two && rest.length >= 2) {
      const [a, b] = take(2) as [string, string];
      out.push(step === 'pair' ? { kind: 'pair', media: [a, b] } : { kind: 'small-large', small: a, large: b });
    } else if (!two || rest.length === 1) {
      const [a] = take(1) as [string];
      out.push({ kind: 'single', media: a, side: step === 'single-right' ? 'right' : 'left' });
    }
  }
  return out;
}

export function resolve(project: Project, frames: Frame[], clips: Map<string, Clip>): Entry {
  const where = `project "${project.slug}"`;
  const still = (name: string, what: string): Frame => {
    const frame = frames.find((f) => f.name === name);
    if (!frame) throw new Error(`${where}: ${what} "${name}" is not an image in photos/${project.slug}/`);
    return frame;
  };
  const cover = project.cover ? still(project.cover, 'cover') : (frames[0] as Frame);
  /** A name: an image, or a clip whose poster is the image of the same name, else the cover. */
  const media = (name: string): Media => {
    const clip = clips.get(name);
    if (clip) {
      const base = name.replace(/\.[^.]+$/, '');
      return { kind: 'clip', clip, poster: frames.find((f) => f.name === base) ?? cover };
    }
    return { kind: 'still', frame: still(name, 'image') };
  };

  const film = (): Film => {
    if (!project.film) throw new Error(`${where}: a film spread needs project.film`);
    return {
      ...parseVimeo(project.film.vimeo),
      poster: project.film.poster ? still(project.film.poster, 'film poster') : cover,
      ratio: project.film.ratio ?? 16 / 9,
    };
  };

  const plan =
    project.spreads ??
    autoSpreads(
      frames.map((f) => f.name),
      cover.name,
      Boolean(project.film),
    );
  if (plan[0]?.kind !== 'opening') throw new Error(`${where}: the first spread must be the opening`);

  const spreads: Page[] = plan.map((s): Page => {
    switch (s.kind) {
      case 'opening':
        return s.small ? { kind: 'opening', large: media(s.large), small: media(s.small) } : { kind: 'opening', large: media(s.large) };
      case 'pair':
        return { kind: 'pair', media: [media(s.media[0]), media(s.media[1])] };
      case 'single':
        return { kind: 'single', media: media(s.media), side: s.side ?? 'left' };
      case 'small-large':
        return { kind: 'small-large', small: media(s.small), large: media(s.large) };
      case 'film':
        return { kind: 'film', film: film() };
    }
  });

  const caption = [project.type, project.place, String(project.year)].filter(Boolean).join(', ');
  const roles = project.roles?.length ? project.roles : [project.role];
  const said = (text?: string) => text?.trim() ?? '';
  const sections = [
    { label: 'Project', text: said(project.description) },
    { label: 'Context', text: said(project.context) },
    { label: 'Creative direction', text: said(project.direction) },
    { label: 'Execution', text: said(project.execution) },
    { label: 'Heni’s contribution', text: said(project.contribution) },
  ].filter((s) => s.text !== '');
  const alts = project.alt ?? {};
  for (const name of Object.keys(alts)) still(name, 'alt text for');

  return {
    slug: project.slug,
    kind: project.kind ?? 'series',
    title: project.title,
    year: project.year,
    type: project.type,
    role: project.role,
    roles,
    sections,
    ...(project.client ? { client: project.client } : {}),
    ...(project.place ? { place: project.place } : {}),
    ...(project.description?.trim() ? { description: project.description.trim() } : {}),
    path: `/work/${project.slug}/`,
    selected: project.selected,
    number: '',
    caption,
    cover,
    frames,
    strip: project.strip ? project.strip.map((n) => still(n, 'strip image')) : frames,
    spreads,
    credits: [...roles.map((role) => ({ role, name: 'Heni Barhoumi' })), ...project.credits],
    alt: (frame) => alts[frame.name] ?? project.title,
  };
}

/** Selected work first, then the archive, each numbered in that order. */
export function number(entries: Entry[]): Entry[] {
  const ordered = [...entries.filter((e) => e.selected), ...entries.filter((e) => !e.selected)];
  ordered.forEach((e, i) => (e.number = String(i + 1).padStart(2, '0')));
  return ordered;
}
