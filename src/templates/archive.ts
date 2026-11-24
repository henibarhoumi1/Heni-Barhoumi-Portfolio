import type { Frame } from '../../build/images.ts';
import type { Entry } from '../../build/projects.ts';
import { capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Archive: every image of every project, grouped under its project, each in
 * its own proportions. On large screens pointing at one shows it large in
 * the pane on the right; choosing it opens the project. On smaller screens
 * choosing one opens it large on its own, with the way to its project.
 */

const webp = (frame: Frame) => frame.webp.map((v) => `${v.url} ${v.width}w`).join(', ');

function tile(entry: Entry, frame: Frame): string {
  return `<li><a class="tile" href="${entry.path}" data-preview="${webp(frame)}" data-src="${frame.jpg.url}" data-w="${frame.width}" data-h="${frame.height}" data-cap="${capOf(frame)}" data-title="${esc(entry.title)}" data-caption="${esc(entry.caption)}" data-alt="${esc(entry.alt(frame))}" style="--ar:${(frame.width / frame.height).toFixed(4)}">
${picture(frame, { alt: entry.alt(frame), sizes: '(max-width: 767px) 40vw, 14vw' })}
</a></li>`;
}

export function renderArchive(ctx: BuildContext): string {
  const groups = ctx.entries
    .map(
      (entry) => `<section class="group" aria-labelledby="g-${entry.slug}">
<header class="group__head">
  <span class="label">${entry.number}</span>
  <h2 class="group__title" id="g-${entry.slug}"><a href="${entry.path}">${esc(entry.title)}</a></h2>
  <span class="label group__caption">${esc(entry.caption)}</span>
</header>
<ul class="group__images">
${entry.frames.map((frame) => tile(entry, frame)).join('\n')}
</ul>
</section>`,
    )
    .join('\n');

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
<header class="archive__head">
  <h1 class="title">Archive</h1>
  <p class="archive__intro">Every series, image by image.</p>
</header>
${groups}
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
