import { capOf, esc, picture } from './html.ts';
import { clock, page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Archive: every image of every project in one grid, each marked with the
 * number of its project. Pointing at one shows it large in the pane on the
 * right with its caption; choosing it opens the project.
 */
export function renderArchive(ctx: BuildContext): string {
  const tiles = ctx.entries
    .flatMap((entry) =>
      entry.frames.map(
        (frame) => `<li><a class="tile" href="${entry.path}" data-preview="${frame.webp.map((v) => `${v.url} ${v.width}w`).join(', ')}" data-w="${frame.width}" data-h="${frame.height}" data-cap="${capOf(frame)}" data-caption="(${entry.number}) ${esc(entry.caption)}">
<span class="tile__num" aria-hidden="true">(${entry.number})</span>
<span class="tile__img">${picture(frame, { alt: entry.title, sizes: '(max-width: 899px) 30vw, 8vw' })}</span>
</a></li>`,
      ),
    )
    .join('\n');

  const first = ctx.entries[0];
  const lead = first?.cover;
  const pane = lead
    ? `<aside class="pane" aria-hidden="true">
<p class="pane__caption" data-pane-caption>(${first.number}) ${esc(first.caption)}</p>
<div class="pane__frame" data-pane-frame style="--ar:${(lead.width / lead.height).toFixed(4)};--cap:${capOf(lead)}px">
<img data-pane-img src="${lead.jpg.url}" srcset="${lead.webp.map((v) => `${v.url} ${v.width}w`).join(', ')}" sizes="(max-width: 899px) 0px, 30vw" width="${lead.width}" height="${lead.height}" alt="" decoding="async">
</div>
</aside>`
    : '';

  const main = `<main id="main" class="archive" data-archive>
<h1 class="sr">Archive</h1>
<ol class="archive__grid">
${tiles}
</ol>
${pane}
</main>`;

  return page(ctx, {
    title: 'Archive',
    description: `Every series by ${ctx.site.name}, image by image.`,
    path: '/archive/',
    section: 'archive',
    bodyClass: 'page-archive',
    main,
    slot: clock(ctx),
    caption: `<span data-archive-caption>${first ? `(${first.number}) ${esc(first.caption)}` : ''}</span>`,
  });
}
