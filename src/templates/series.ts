import type { Frame } from '../../build/images.ts';
import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext, SeriesEntry } from './types.ts';

/** How wide a frame may be shown in the viewer, in CSS pixels, so it stays sharp. */
export const viewerWidth = (frame: Frame): number => Math.round(frame.width * 0.75);

export function renderSeries(ctx: BuildContext, entry: SeriesEntry): string {
  const { series } = ctx;
  const total = entry.frames.length;
  const next = series[entry.number % series.length] as SeriesEntry;

  const frames = entry.frames
    .map((frame, i) => {
      const first = i === 0;
      return `<li class="frame"${first ? ` style="view-transition-name:cover-${entry.slug}"` : ''}>
  <a href="${frame.jpg.url}" data-lightbox data-max="${viewerWidth(frame)}" data-caption="${esc(entry.title)}">
    ${picture(frame, { alt: `${entry.title}, image ${i + 1} of ${total}. ${entry.place}, ${entry.year}.`, sizes: '(min-width: 800px) 24vw, 48vw', eager: i < 4 })}
  </a>
  <span class="frame__num">${pad(i + 1)}.</span>
</li>`;
    })
    .join('\n');

  const meta = [
    { label: 'Year', value: String(entry.year) },
    { label: 'Location', value: esc(entry.place) },
    ...entry.credits.map((c) => ({
      label: esc(c.role),
      value: c.href ? `<a href="${esc(c.href)}" rel="noopener">${esc(c.name)}</a>` : esc(c.name),
    })),
  ]
    .map((item) => `<div><dt>${item.label}</dt><dd>${item.value}</dd></div>`)
    .join('');

  const main = `<main id="main" class="series">
  <header class="series__head">
    <p class="series__num">${pad(entry.number)}.</p>
    <h1 class="display">${esc(entry.title)}</h1>
  </header>
  <dl class="series__meta">${meta}</dl>
  <ol class="frames">
${frames}
  </ol>
  ${entry.note ? `<p class="series__note">${esc(entry.note)}</p>` : ''}
  <a class="next" href="${next.path}">
    <span class="next__label">Next</span>
    <span class="next__title">${esc(next.title)}</span>
    ${picture(next.coverFrame, { alt: '', sizes: '120px', className: 'next__cover' })}
  </a>
</main>`;

  return page(ctx, {
    title: entry.title,
    description: `${entry.title}. Portrait series by ${ctx.site.name}, ${entry.place}, ${entry.year}.`,
    path: entry.path,
    section: 'work',
    bodyClass: 'page-series',
    main,
  });
}
