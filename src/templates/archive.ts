import type { Frame } from '../../build/images.ts';
import type { Entry } from '../../build/projects.ts';
import { capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Archive: every image of every project in one grid, each whole in its box;
 * the first image of each project carries its number and title. On large screens pointing at one shows it large in
 * the pane on the right; choosing it opens the project. On smaller screens
 * choosing one opens it large on its own, with the way to its project.
 */

const webp = (frame: Frame) => frame.webp.map((v) => `${v.url} ${v.width}w`).join(', ');

function tile(entry: Entry, frame: Frame, first: boolean): string {
  return `<li><a class="tile" href="${entry.path}" data-preview="${webp(frame)}" data-src="${frame.jpg.url}" data-w="${frame.width}" data-h="${frame.height}" data-cap="${capOf(frame)}" data-title="${esc(entry.title)}" data-caption="${esc(entry.caption)}" data-alt="${esc(entry.alt(frame))}">
<span class="tile__label"${first ? '' : ' aria-hidden="true"'}>${first ? `(${entry.number}) ${esc(entry.title)}` : ''}</span>
<span class="tile__img">${picture(frame, { alt: entry.alt(frame), sizes: '(max-width: 767px) 30vw, (max-width: 1099px) 18vw, 9vw' })}</span>
</a></li>`;
}

export function renderArchive(ctx: BuildContext): string {
  // One continuous grid; each project's first image carries its number and title.
  const tiles = ctx.entries.flatMap((entry) => entry.frames.map((frame, i) => tile(entry, frame, i === 0))).join('\n');

  const first = ctx.entries[0];
  const lead = first?.cover;
  const pane = first && lead
    ? `<aside class="pane" aria-hidden="true">
<div class="pane__frame" data-pane-frame style="--ar:${(lead.width / lead.height).toFixed(4)};--cap:${capOf(lead)}px">
<img data-pane-img src="${lead.jpg.url}" srcset="${webp(lead)}" sizes="(max-width: 1099px) 0px, 30vw" width="${lead.width}" height="${lead.height}" alt="" decoding="async">
</div>
<p class="pane__title" data-pane-title>${esc(first.title)}</p>
<p class="label" data-pane-caption>${esc(first.caption)}</p>
</aside>`
    : '';

  const viewer = `<dialog class="viewer" data-viewer aria-label="Image">
<figure class="viewer__figure">
  <img data-viewer-img alt="">
  <figcaption class="viewer__caption">
    <span class="viewer__title" data-viewer-title></span>
    <span class="label" data-viewer-caption></span>
    <a class="viewer__open" href="/" data-viewer-open>Open project</a>
  </figcaption>
</figure>
<div class="viewer__controls">
  <button type="button" data-viewer-prev>Previous</button>
  <button type="button" data-viewer-next>Next</button>
  <button type="button" data-viewer-close>Close</button>
</div>
</dialog>`;

  const main = `<main id="main" class="archive" data-archive>
<div class="archive__list">
<h1 class="sr">Archive</h1>
<ol class="archive__grid">
${tiles}
</ol>
</div>
${pane}
${viewer}
</main>`;

  return page(ctx, {
    title: 'Archive',
    description: `Every series by ${ctx.site.name}, image by image.`,
    path: '/archive/',
    section: 'archive',
    bodyClass: 'page-archive',
    main,
  });
}
