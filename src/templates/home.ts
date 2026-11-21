import { esc, picture } from './html.ts';
import { clock, page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Work: one row of prints across the middle of the page. The print at the
 * slot is shown large, bent like a photograph held in the hand, with its
 * number and caption above it; the others wait small on either side and
 * fade out at the edges. Scroll, drag, swipe or use the arrow keys to move
 * along; the row never ends. Without scripts the row simply scrolls.
 */
export function renderHome(ctx: BuildContext): string {
  const projects = ctx.selected.map((e) => ({ number: e.number, caption: e.caption, path: e.path, title: e.title }));
  const items = ctx.selected.flatMap((entry, p) => entry.strip.map((frame) => ({ entry, frame, p })));
  const first = ctx.selected[0];

  const strip = items
    .map(
      ({ entry, frame, p }, i) => `<li class="strip__item${i === 0 ? ' is-active' : ''}" data-p="${p}" data-r="${(frame.width / frame.height).toFixed(4)}" data-vt="${entry.path}">
<a href="${entry.path}" tabindex="${i === 0 ? 0 : -1}">${picture(frame, { alt: entry.title, sizes: i === 0 ? '40vh' : '16vh', eager: i < 4 })}</a>
</li>`,
    )
    .join('\n');

  const caption = first ? `<span data-caption-text>${esc(first.caption)}</span>` : '';

  const main = `<main id="main" class="stage" data-stage>
<h1 class="sr">${esc(ctx.site.name)}, selected work</h1>
<div class="stage__caption" aria-hidden="true">
  <p class="stage__num" data-num>${first ? `(${first.number})` : ''}</p>
  <p class="stage__text" data-text>${first ? esc(first.caption) : ''}</p>
</div>
<ol class="strip" data-strip aria-label="Selected work">
${strip}
</ol>
<p class="sr" aria-live="polite" data-live></p>
<script type="application/json" data-projects>${JSON.stringify(projects).replace(/</g, '\\u003c')}</script>
</main>`;

  return page(ctx, {
    path: '/',
    section: 'work',
    bodyClass: 'page-home',
    main,
    top: clock(ctx),
    caption,
  });
}
