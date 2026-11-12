import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** Index: every frame of every series, numbered like a contact sheet. */
export function renderFrames(ctx: BuildContext): string {
  const all = ctx.series.flatMap((s) => s.frames.map((frame) => ({ frame, s })));
  const total = all.length;

  const cells = all
    .map(({ frame, s }, i) => {
      const n = pad(i + 1, 3);
      return `<li class="sheet__cell">
  <a href="${frame.jpg.url}" data-lightbox data-caption="${esc(`${s.title}, ${n} / ${pad(total, 3)}`)}">
    ${picture(frame, { alt: `${s.title}. ${s.place}, ${s.date}.`, sizes: '(min-width: 800px) 14vw, 30vw', eager: i < 6 })}
  </a>
  <p class="sheet__caption label"><span>${n}</span><a href="${s.path}">${esc(s.title)}</a></p>
</li>`;
    })
    .join('\n');

  const main = `<main id="main" class="sheet">
  <header class="sheet__head">
    <h1 class="display">Index</h1>
    <p class="sheet__intro">${total} frames from ${ctx.series.length} portrait series, ${esc(ctx.series.at(-1)?.date.split(' ').pop() ?? '')} to ${esc(ctx.series[0]?.date.split(' ').pop() ?? '')}. Select a frame to view it large.</p>
  </header>
  <ol class="sheet__grid">
${cells}
  </ol>
</main>`;

  return page(ctx, {
    title: 'Index',
    description: `All ${total} frames from the portrait series of ${ctx.site.name}.`,
    path: '/frames/',
    section: 'frames',
    bodyClass: 'page-frames',
    main,
  });
}
