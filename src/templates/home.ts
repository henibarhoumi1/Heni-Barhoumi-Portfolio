import { esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Work: one row of the selected photographs across the middle of the page,
 * each in its own proportions. The one at the slot is shown large, held
 * slightly bent like a print, with its project's number, title and details
 * above it. Scroll, drag, swipe or use the arrow keys to move along; any
 * photograph opens its project. Without scripts the row simply scrolls.
 */
export function renderHome(ctx: BuildContext): string {
  const projects = ctx.selected.map((e) => ({ number: e.number, title: e.title, caption: e.caption, path: e.path }));
  const items = ctx.selected.flatMap((entry, p) => entry.strip.map((frame) => ({ entry, frame, p })));
  const first = ctx.selected[0];

  const strip = items
    .map(
      ({ entry, frame, p }, i) => `<li class="strip__item${i === 0 ? ' is-active' : ''}" data-p="${p}" data-r="${(frame.width / frame.height).toFixed(4)}" data-vt="${entry.path}">
<a href="${entry.path}" tabindex="${i === 0 ? 0 : -1}">${picture(frame, { alt: `${entry.alt(frame)} From ${entry.title}.`, sizes: i === 0 ? '40vh' : '16vh', eager: i < 4 })}</a>
</li>`,
    )
    .join('\n');

  const main = `<main id="main" class="stage" data-stage>
<p class="sr">Selected work. Use the arrow keys to move along the row, and Enter to open a project.</p>
<div class="stage__caption" aria-hidden="true">
  <p class="label" data-num>${first ? first.number : ''}</p>
  <p class="stage__title" data-title>${first ? esc(first.title) : ''}</p>
  <p class="label" data-text>${first ? esc(first.caption) : ''}</p>
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
    brandHeading: true,
    main,
    hint: 'Scroll, drag or use the arrow keys',
  });
}
