import type { Frame } from '../../build/images.ts';
import type { Entry, Film, Media, Section } from '../../build/projects.ts';
import { canFill, capOf, esc, mediaHtml, picture, posterOf } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** How wide each layout shows an image, for the browser to pick a file. */
const SIZES: Record<string, (cap: number) => string> = {
  full: (cap) => `(min-width: 800px) min(100vw, ${cap}px), 100vw`,
  offset: (cap) => `(min-width: 800px) min(56vw, ${cap}px), 86vw`,
  pair: (cap) => `(min-width: 800px) min(42vw, ${cap}px), 46vw`,
  trio: (cap) => `(min-width: 800px) min(30vw, ${cap}px), 46vw`,
  strip: (cap) => `(min-width: 800px) min(52vw, ${cap}px), 78vw`,
};

interface PageState {
  entry: Entry;
  /** The cover travels from Work into the first place it appears on the page. */
  vtDone: boolean;
  eager: number;
}

/**
 * Attributes of the element that shows a frame: its sharp-size cap and shape,
 * and, on the first element showing the cover, the shared name that lets the
 * cover travel in from Work.
 */
function frameAttrs(state: PageState, frame: Frame): string {
  const style = `--cap:${capOf(frame)}px;--ar:${frame.ratio}`;
  if (state.vtDone || frame !== state.entry.cover) return ` style="${style}"`;
  state.vtDone = true;
  return ` data-vt-self style="${style};view-transition-name:hero"`;
}

function altFor(entry: Entry, frame: Frame): string {
  const n = entry.frames.indexOf(frame) + 1;
  return `${entry.title}, ${entry.type.toLowerCase()} by Heni Barhoumi${entry.place ? `, ${entry.place}` : ''}, ${entry.year}. Image ${n}.`;
}

/** One image or clip in a row; stills open in the viewer. */
function item(state: PageState, m: Media, layout: string): string {
  const frame = posterOf(m);
  const cap = capOf(frame);
  const eager = state.eager-- > 0;
  const inner = mediaHtml(m, { alt: altFor(state.entry, frame), sizes: (SIZES[layout] as (c: number) => string)(cap), eager });
  const body =
    m.kind === 'still'
      ? `<a class="seq__open" href="${frame.jpg.url}" data-viewer-open data-max="${cap}" data-caption="${esc(state.entry.title)}">${inner}</a>`
      : `<div class="seq__clip">${inner}</div>`;
  return `<figure class="seq__item"${frameAttrs(state, frame)}>${body}</figure>`;
}

function opening(entry: Entry): string {
  const facts = [
    ['Year', String(entry.year)],
    ['Type', entry.type],
    ['Role', entry.role],
    ...(entry.client ? [['Client', entry.client]] : []),
    ...(entry.place ? [['Location', entry.place]] : []),
  ]
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value as string)}</dd></div>`)
    .join('');
  return `<header class="opening" data-slate-after="${esc(entry.title)}">
  <h1 class="opening__title">${esc(entry.title)}</h1>
  <dl class="opening__facts">${facts}</dl>
</header>`;
}

function hero(state: PageState, m: Media): string {
  const frame = posterOf(m);
  const fill = canFill(frame) || m.kind === 'clip';
  const inner = mediaHtml(m, { alt: altFor(state.entry, frame), sizes: fill ? '100vw' : `(min-width: 800px) min(70vw, ${capOf(frame)}px), 100vw`, eager: true });
  state.eager -= 1;
  const body =
    m.kind === 'still'
      ? `<a class="hero__open" href="${frame.jpg.url}" data-viewer-open data-max="${capOf(frame)}" data-caption="${esc(state.entry.title)}">${inner}</a>`
      : inner;
  return `<div class="hero${fill ? ' is-fill' : ''}">
  <figure class="hero__media"${frameAttrs(state, frame)}>${body}</figure>
</div>`;
}

function film(state: PageState, f: Film): string {
  const watch = `https://vimeo.com/${f.id}${f.hash ? `/${f.hash}` : ''}`;
  return `<figure class="film" data-film data-id="${esc(f.id)}"${f.hash ? ` data-hash="${esc(f.hash)}"` : ''} style="--ar:${f.ratio}">
  <div class="film__frame" data-film-frame>
    ${picture(f.poster, { alt: '', sizes: '(min-width: 800px) 88vw, 100vw' })}
    <a class="film__play" href="${watch}" data-film-play rel="noopener"><span class="film__play-label">Play film</span></a>
  </div>
  <div class="film__controls" data-film-controls hidden>
    <button type="button" data-film-toggle>Pause</button>
    <input type="range" min="0" max="1000" step="1" value="0" data-film-scrub aria-label="Position in the film">
    <span class="film__time" data-film-time>0:00</span>
    <button type="button" data-film-mute>Sound off</button>
    <button type="button" data-film-full>Full screen</button>
  </div>
  <figcaption class="film__caption">${esc(f.caption ?? state.entry.title)}</figcaption>
</figure>`;
}

function section(state: PageState, s: Section): string {
  const { entry } = state;
  switch (s.type) {
    case 'opening':
      return opening(entry);
    case 'hero':
      return hero(state, s.media);
    case 'description':
      return `<div class="description"><p>${esc(s.text)}</p></div>`;
    case 'sequence': {
      const items = s.media.map((m) => item(state, m, s.layout)).join('\n');
      const fill = s.layout === 'full' && canFill(posterOf(s.media[0] as Media)) ? ' is-fill' : '';
      if (s.layout === 'strip')
        return `<div class="seq seq--strip" data-strip tabindex="0" role="group" aria-label="${esc(entry.title)}, images in a row. Scroll sideways.">
${items}
</div>`;
      return `<div class="seq seq--${s.layout} is-${s.side}${fill}">
${items}
</div>`;
    }
    case 'film':
      return film(state, s.film);
    case 'pull':
      return `<blockquote class="pull"><p>${esc(s.text)}</p></blockquote>`;
    case 'credits':
      return `<dl class="roles">${s.credits
        .map((c) => `<div><dt>${esc(c.role)}</dt><dd>${c.href ? `<a href="${esc(c.href)}" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}</dd></div>`)
        .join('')}</dl>`;
  }
}

/** Previous and next, in the running order. The next cover travels into the next page's opening. */
function next(previous: Entry, following: Entry): string {
  return `<nav class="next" aria-label="More work">
  <a class="next__prev" href="${previous.path}" data-key-prev><span class="next__label">Previous</span> <span class="next__prev-title">${esc(previous.title)}</span></a>
  <a class="next__link" href="${following.path}" data-key-next>
    <span class="next__label">Next</span>
    <span class="next__title">${esc(following.title)}</span>
    <span class="next__media" data-vt="${following.path}" style="--cap:${capOf(following.cover)}px;--ar:${following.cover.ratio}">${picture(following.cover, { alt: '', sizes: '(min-width: 800px) 18vw, 40vw' })}</span>
  </a>
</nav>`;
}

export function renderProject(ctx: BuildContext, entry: Entry): string {
  const order = ctx.sequence;
  const at = order.indexOf(entry);
  const previous = order[(at - 1 + order.length) % order.length] as Entry;
  const following = order[(at + 1) % order.length] as Entry;

  const state: PageState = { entry, vtDone: false, eager: 2 };
  const body = entry.sections.map((s) => section(state, s)).join('\n');

  const main = `<main id="main" class="project">
${body}
${next(previous, following)}
</main>`;

  return page(ctx, {
    title: entry.title,
    description: `${entry.title}. ${entry.type} by ${ctx.site.name}${entry.place ? `, ${entry.place}` : ''}, ${entry.year}.`,
    path: entry.path,
    section: 'work',
    bodyClass: 'page-project',
    room: entry.room,
    project: true,
    viewer: true,
    image: entry.cover.jpg.url,
    main,
  });
}
