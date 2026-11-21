import type { Entry, Film, Media, Page } from '../../build/projects.ts';
import { capOf, esc, mediaHtml, picture, posterOf } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** The height a spread leaves for images, between the two bars. Keep in step with --area in styles. */
const AREA = '(100svh - 9rem)';

const ratio = (m: Media): number => {
  const f = posterOf(m);
  return f.width / f.height;
};

/** Large images take up to half the page, and never more than their file allows. */
const largeSizes = (m: Media) => `(max-width: 899px) 92vw, min(48vw, calc(${AREA} * ${ratio(m).toFixed(3)}), ${capOf(posterOf(m))}px)`;
const smallSizes = (m: Media) => `(max-width: 899px) 56vw, min(15vw, calc(${AREA} * 0.42 * ${ratio(m).toFixed(3)}))`;

function figure(m: Media, entry: Entry, kind: 'large' | 'small', place: string, extra = ''): string {
  const frame = posterOf(m);
  const style = `--cap:${capOf(frame)}px;--ar:${ratio(m).toFixed(4)}${extra}`;
  const sizes = kind === 'large' ? largeSizes(m) : smallSizes(m);
  return `<figure class="cell cell--${kind} ${place}${ratio(m) > 1.05 ? ' is-wide' : ''}" style="${style}">${mediaHtml(m, { alt: entry.title, sizes })}</figure>`;
}

function film(f: Film, entry: Entry): string {
  const src = `https://player.vimeo.com/video/${f.id}?${f.hash ? `h=${f.hash}&` : ''}autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
  return `<div class="film" data-film data-src="${esc(src)}" style="--ar:${f.ratio};--cap:${capOf(f.poster)}px">
<div class="film__frame" data-film-frame>${picture(f.poster, { alt: `${entry.title}, film`, sizes: '(max-width: 899px) 92vw, 72vw' })}</div>
<button type="button" class="film__play" data-film-play>(Play film)</button>
</div>`;
}

function spread(s: Page, entry: Entry, i: number): string {
  switch (s.kind) {
    case 'opening':
      return `<section class="spread spread--opening" aria-labelledby="title">
<div class="cell cell--head">
  <p class="num">(${entry.number})</p>
  <h1 class="caption" id="title">${esc(entry.caption)}</h1>
</div>
${entry.description ? `<div class="cell cell--read"><p>${esc(entry.description)}</p></div>` : ''}
${s.small ? figure(s.small, entry, 'small', 'at-2') : ''}
${figure(s.large, entry, 'large', 'at-34', ';view-transition-name:hero')}
</section>`;
    case 'pair':
      return `<section class="spread spread--pair">
${figure(s.media[0], entry, 'large', 'at-12')}
${figure(s.media[1], entry, 'large', 'at-34')}
</section>`;
    case 'single':
      return `<section class="spread spread--single">
${figure(s.media, entry, 'large', s.side === 'left' ? 'at-12' : 'at-34')}
</section>`;
    case 'small-large':
      return `<section class="spread spread--small-large">
${figure(s.small, entry, 'small', 'at-2')}
${figure(s.large, entry, 'large', 'at-34')}
</section>`;
    case 'film':
      return `<section class="spread spread--film" aria-label="Film ${i}">${film(s.film, entry)}</section>`;
  }
}

export function renderProject(ctx: BuildContext, entry: Entry): string {
  const at = ctx.entries.indexOf(entry);
  const next = ctx.entries[(at + 1) % ctx.entries.length] as Entry;

  const credits = entry.credits
    .map(
      (c) =>
        `<li><span class="label">(${esc(c.role)})</span> ${c.href ? `<a href="${esc(c.href)}" rel="noopener" target="_blank">${esc(c.name)}</a>` : esc(c.name)}</li>`,
    )
    .join('');

  const end = `<section class="spread spread--end" aria-label="Credits and next">
<div class="cell cell--label"><p class="label">(Credits)</p></div>
<ul class="cell cell--list credits">${credits}</ul>
<div class="cell cell--label cell--next-label"><p class="label">(Next)</p></div>
<a class="cell cell--next" href="${next.path}">
  <span class="next__img" style="--ar:${(next.cover.width / next.cover.height).toFixed(4)}">${picture(next.cover, { alt: '', sizes: '(max-width: 899px) 40vw, 12vw' })}</span>
  <span class="next__text"><span class="num">(${next.number})</span> ${esc(next.caption)}</span>
</a>
</section>`;

  const main = `<main id="main" class="project" data-project>
${entry.spreads.map((s, i) => spread(s, entry, i)).join('\n')}
${end}
</main>`;

  return page(ctx, {
    title: entry.title,
    description: `${entry.title}. ${entry.type}${entry.place ? `, ${entry.place}` : ''}, ${entry.year}. ${entry.role} by ${ctx.site.name}.`,
    path: entry.path,
    section: 'work',
    bodyClass: 'page-project',
    main,
    slot: `<a href="${next.path}">(Next)</a>`,
    caption: `(${entry.number}) ${esc(entry.caption)}`,
    image: entry.cover.jpg.url,
  });
}
