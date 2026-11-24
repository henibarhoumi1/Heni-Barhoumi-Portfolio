import type { Entry, Film, Media, Page } from '../../build/projects.ts';
import { capOf, esc, mediaHtml, picture, posterOf } from './html.ts';
import { back, page } from './layout.ts';
import { credits, facts, projectData } from './parts.ts';
import type { BuildContext } from './types.ts';

/**
 * A project page, as spreads: one screen each on large screens, two columns
 * on tablets, one column on phones.
 *
 * A personal series opens on its title and facts beside its photographs.
 * A case study (kind: 'case') adds its written sections after the opening:
 * Project, Context, Creative direction, Execution, Heni's contribution, each
 * only when filled, then the final work and the credits, numbered in order.
 */

/** Height a spread leaves for images below the header. Keep in step with --area in styles. */
const AREA = '(100svh - 7rem)';

const ratio = (m: Media): number => {
  const f = posterOf(m);
  return f.width / f.height;
};

/** Large images take up to half the page, and never more than their file allows. */
const largeSizes = (m: Media) =>
  `(max-width: 767px) 92vw, (max-width: 1099px) 46vw, min(48vw, calc(${AREA} * ${ratio(m).toFixed(3)}), ${capOf(posterOf(m))}px)`;
const smallSizes = (m: Media) => `(max-width: 767px) 56vw, (max-width: 1099px) 30vw, min(15vw, calc(${AREA} * 0.42 * ${ratio(m).toFixed(3)}))`;

function figure(m: Media, entry: Entry, kind: 'large' | 'small', place: string, extra = ''): string {
  const frame = posterOf(m);
  const style = `--cap:${capOf(frame)}px;--ar:${ratio(m).toFixed(4)}${extra}`;
  const sizes = kind === 'large' ? largeSizes(m) : smallSizes(m);
  return `<figure class="cell cell--${kind} ${place}${ratio(m) > 1.05 ? ' is-wide' : ''}" style="${style}">${mediaHtml(m, { alt: entry.alt(frame), sizes })}</figure>`;
}

function film(f: Film, entry: Entry): string {
  const src = `https://player.vimeo.com/video/${f.id}?${f.hash ? `h=${f.hash}&` : ''}autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
  return `<div class="film" data-film data-src="${esc(src)}" style="--ar:${f.ratio};--cap:${capOf(f.poster)}px">
<div class="film__frame" data-film-frame>${picture(f.poster, { alt: `${entry.title}, film still`, sizes: '(max-width: 767px) 92vw, 72vw' })}</div>
<button type="button" class="film__play" data-film-play>Play film</button>
</div>`;
}

/** A small numbered label, used to mark the parts of a case study. */
const marker = (n: number | undefined, label: string) => (n === undefined ? '' : `<p class="marker">(${String(n).padStart(2, '0')}) ${esc(label)}</p>`);

function spread(s: Page, entry: Entry, mark = ''): string {
  switch (s.kind) {
    case 'opening':
      return `<section class="spread spread--opening" aria-labelledby="title">
<div class="cell cell--head">
  <p class="num">(${entry.number})</p>
  <h1 class="title" id="title">${esc(entry.title)}</h1>
  ${facts(entry)}
</div>
${entry.description && entry.kind === 'series' ? `<div class="cell cell--read"><p>${esc(entry.description)}</p></div>` : ''}
${s.small ? figure(s.small, entry, 'small', 'at-2') : ''}
${figure(s.large, entry, 'large', 'at-34', ';view-transition-name:hero')}
</section>`;
    case 'pair':
      return `<section class="spread spread--pair">${mark}
${figure(s.media[0], entry, 'large', 'at-12')}
${figure(s.media[1], entry, 'large', 'at-34')}
</section>`;
    case 'single':
      return `<section class="spread spread--single">${mark}
${figure(s.media, entry, 'large', s.side === 'left' ? 'at-12' : 'at-34')}
</section>`;
    case 'small-large':
      return `<section class="spread spread--small-large">${mark}
${figure(s.small, entry, 'small', 'at-2')}
${figure(s.large, entry, 'large', 'at-34')}
</section>`;
    case 'film':
      return `<section class="spread spread--film" aria-label="Film">${mark}${film(s.film, entry)}</section>`;
  }
}

export function renderProject(ctx: BuildContext, entry: Entry): string {
  const at = ctx.entries.indexOf(entry);
  const next = ctx.entries[(at + 1) % ctx.entries.length] as Entry;
  const isCase = entry.kind === 'case';

  // Case studies number their parts: the written sections, the final work, the credits.
  let n = 0;
  const count = () => (isCase ? ++n : undefined);
  const sections = isCase ? entry.sections.map((s) => ({ ...s, n: count() })) : [];
  const [opening, ...rest] = entry.spreads;
  const workNumber = rest.length ? count() : undefined;
  const creditsNumber = count();

  const writing = sections.length
    ? `<section class="spread spread--text" aria-label="About the project">
${sections
  .map(
    (s) => `<div class="part">
  ${marker(s.n, s.label)}
  <div class="part__text">${s.text
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p)}</p>`)
    .join('')}</div>
</div>`,
  )
  .join('\n')}
</section>`
    : '';

  const body = [
    opening ? spread(opening, entry) : '',
    writing,
    ...rest.map((s, i) => spread(s, entry, i === 0 ? marker(workNumber, 'Final work') : '')),
  ].join('\n');

  const end = `<section class="spread spread--end" aria-label="Credits and next project">
<div class="cell cell--credits">
  ${isCase ? marker(creditsNumber, 'Credits') : '<p class="marker">(Credits)</p>'}
  ${credits(entry)}
</div>
<a class="cell cell--next" href="${next.path}">
  <span class="marker">(Next)</span>
  <span class="next__img" style="--ar:${(next.cover.width / next.cover.height).toFixed(4)}">${picture(next.cover, { alt: '', sizes: '(max-width: 767px) 40vw, 12vw' })}</span>
  <span class="next__title">${esc(next.title)}</span>
  <span class="next__caption">${esc(next.caption)}</span>
</a>
</section>`;

  const main = `<main id="main" class="project${isCase ? ' project--case' : ''}" data-project>
${body}
${end}
</main>`;

  const large = opening?.kind === 'opening' ? posterOf(opening.large) : entry.cover;

  return page(ctx, {
    title: entry.title,
    description: `${entry.title}: ${entry.type.toLowerCase()}${entry.place ? `, ${entry.place}` : ''}, ${entry.year}. ${entry.roles.join(', ')} by ${ctx.site.name}.`,
    path: entry.path,
    section: 'work',
    bodyClass: 'page-project',
    main,
    mid: back(),
    image: entry.cover.jpg.url,
    preload: { frame: large, sizes: largeSizes({ kind: 'still', frame: large }) },
    data: [projectData(ctx, entry)],
  });
}
