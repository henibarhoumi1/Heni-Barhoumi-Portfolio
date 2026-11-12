import type { Frame } from '../../build/images.ts';
import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext, SeriesEntry } from './types.ts';

type Spread = { kind: 'a' | 'b' | 'c' | 'd' | 'wide' | 'pair'; frames: Frame[] };

const isLandscape = (frame: Frame) => frame.ratio > 1.15;

/**
 * Lays the frames after the first one out as a run of "spreads".
 * Upright frames cycle through four placements; landscape frames run wide or in pairs.
 */
function spreads(frames: Frame[]): Spread[] {
  const out: Spread[] = [];
  const cycle: Spread['kind'][] = ['a', 'b', 'c', 'd'];
  let turn = 0;
  let i = 0;
  while (i < frames.length) {
    const frame = frames[i] as Frame;
    const next = frames[i + 1];
    if (isLandscape(frame)) {
      if (next && isLandscape(next)) {
        out.push({ kind: 'pair', frames: [frame, next] });
        i += 2;
      } else {
        out.push({ kind: 'wide', frames: [frame] });
        i += 1;
      }
      continue;
    }
    let kind = cycle[turn % cycle.length] as Spread['kind'];
    const twoUp = kind === 'a' || kind === 'c';
    if (twoUp && (!next || isLandscape(next))) kind = kind === 'a' ? 'b' : 'd';
    if (kind === 'a' || kind === 'c') {
      out.push({ kind, frames: [frame, next as Frame] });
      i += 2;
    } else {
      out.push({ kind, frames: [frame] });
      i += 1;
    }
    turn += 1;
  }
  return out;
}

const SIZES: Record<Spread['kind'], string[]> = {
  a: ['(min-width: 800px) 58vw, 100vw', '(min-width: 800px) 33vw, 100vw'],
  b: ['(min-width: 800px) 50vw, 100vw'],
  c: ['(min-width: 800px) 33vw, 100vw', '(min-width: 800px) 58vw, 100vw'],
  d: ['(min-width: 800px) 42vw, 100vw'],
  wide: ['100vw'],
  pair: ['(min-width: 800px) 50vw, 100vw', '(min-width: 800px) 50vw, 100vw'],
};

export function renderSeries(ctx: BuildContext, entry: SeriesEntry): string {
  const { series } = ctx;
  const total = entry.frames.length;
  const [hero, ...rest] = entry.frames as [Frame, ...Frame[]];
  const next = series[entry.number % series.length] as SeriesEntry;
  const alt = (frame: Frame) => `${entry.title}, frame ${entry.frames.indexOf(frame) + 1} of ${total}. ${entry.place}, ${entry.date}.`;
  const caption = (frame: Frame) => `${entry.title}, ${pad(entry.frames.indexOf(frame) + 1)} / ${pad(total)}`;

  const figure = (frame: Frame, sizes: string, hero = false) => `<figure class="frame${hero ? ' series__hero' : ''}"${hero ? ` style="view-transition-name:cover-${entry.slug}"` : ''}>
  <a href="${frame.jpg.url}" data-lightbox data-caption="${esc(caption(frame))}">
    ${picture(frame, { alt: alt(frame), sizes, eager: hero })}
  </a>
  <figcaption class="label">${pad(entry.frames.indexOf(frame) + 1)}</figcaption>
</figure>`;

  const credits = entry.credits.length
    ? entry.credits
        .map((c) => `<div><dt>${esc(c.role)}</dt><dd>${c.href ? `<a href="${esc(c.href)}" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}</dd></div>`)
        .join('')
    : `<div><dt>Photography and direction</dt><dd>${esc(ctx.site.name)}</dd></div>`;

  const body = spreads(rest)
    .map(
      (spread) => `<div class="spread spread--${spread.kind}">
${spread.frames.map((frame, i) => figure(frame, SIZES[spread.kind][i] as string)).join('\n')}
</div>`,
    )
    .join('\n');

  const main = `<main id="main" class="series">
  <section class="series__head${isLandscape(hero) ? ' series__head--landscape' : ''}">
    <dl class="meta">
      <div class="meta__col">
        <dt class="label">Series</dt>
        <dd>(${pad(entry.number)}) of ${pad(series.length)}<br>Portraits</dd>
      </div>
      <div class="meta__col">
        <dt class="label">Credits</dt>
        <dd><dl class="credits">${credits}</dl></dd>
      </div>
      <div class="meta__col">
        <dt class="label">Place and date</dt>
        <dd>${esc(entry.place)}<br>${esc(entry.date)}</dd>
      </div>
      <div class="meta__col">
        <dt class="label">Frames</dt>
        <dd>${total}${entry.kit ? `<br>${esc(entry.kit)}` : ''}</dd>
      </div>
    </dl>
    <h1 class="series__title">${esc(entry.title)}</h1>
    ${figure(hero, '(min-width: 800px) 50vw, 100vw', true)}
  </section>
  <section class="spreads" aria-label="Frames">
${body}
  </section>
  ${entry.note ? `<p class="series__note">${esc(entry.note)}</p>` : ''}
  <a class="next" href="${next.path}">
    <span class="label">Next series (${pad(next.number)})</span>
    <span class="next__title">${esc(next.title)}</span>
    ${picture(next.coverFrame, { alt: '', sizes: '160px', className: 'next__cover' })}
  </a>
</main>`;

  return page(ctx, {
    title: entry.title,
    description: `${entry.title}. A portrait series by ${ctx.site.name}, ${entry.place}, ${entry.date}. ${total} frames.`,
    path: entry.path,
    section: 'work',
    bodyClass: 'page-series',
    main,
  });
}
