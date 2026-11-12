import type { Frame } from '../../build/images.ts';
import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext, SeriesEntry } from './types.ts';

/** How wide a frame may be shown in the viewer, in CSS pixels, so it stays sharp. */
export const viewerWidth = (frame: Frame): number => Math.round(frame.width * 0.75);

/**
 * Column spans on a 12-column sheet (6 on small screens). Frames sit in
 * top-aligned rows of three sizes, so no two rows of a series look the same.
 */
const SPANS = [4, 3, 3, 2, 2, 3, 4, 3, 3, 2, 4, 3];
const SPANS_SMALL = [4, 2, 3, 3, 2, 4];
/** Width of n columns on a 1512px screen, the size the sheet is tuned for. */
const columnsWidth = (n: number): number => n * 109 + (n - 1) * 16;

/** The widest span a frame can take and still be sharp on a high-density screen. */
function span(frame: Frame, wanted: number): number {
  let n = wanted;
  while (n > 2 && columnsWidth(n) > frame.width / 2) n -= 1;
  // Wide frames read smaller than upright ones at the same width; never drop them to the narrowest size.
  return frame.ratio > 1.15 ? Math.max(n, 3) : n;
}

export function renderSeries(ctx: BuildContext, entry: SeriesEntry): string {
  const { series } = ctx;
  const total = entry.frames.length;
  const next = series[entry.number % series.length] as SeriesEntry;
  const previous = series[(entry.number - 2 + series.length) % series.length] as SeriesEntry;

  const frames = entry.frames
    .map((frame, i) => {
      const first = i === 0;
      const wide = span(frame, SPANS[i % SPANS.length] as number);
      const small = SPANS_SMALL[i % SPANS_SMALL.length] as number;
      return `<li class="frame" style="--span:${wide};--span-small:${small}${first ? `;view-transition-name:cover-${entry.slug}` : ''}">
  <a href="${frame.jpg.url}" data-lightbox data-max="${viewerWidth(frame)}" data-caption="${esc(entry.title)}">
    ${picture(frame, { alt: `${entry.title}, image ${i + 1} of ${total}. ${entry.place}, ${entry.year}.`, sizes: `(min-width: 800px) ${Math.round(wide * 8.2)}vw, ${Math.round(small * 16.2)}vw`, eager: i < 4 })}
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
  <nav class="pager" aria-label="More work">
    <a class="pager__link" href="${previous.path}">
      <span class="pager__label">Previous</span>
      <span class="pager__title">${esc(previous.title)}</span>
    </a>
    <a class="pager__link" href="${next.path}">
      <span class="pager__label">Next</span>
      <span class="pager__title">${esc(next.title)}</span>
    </a>
  </nav>
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
