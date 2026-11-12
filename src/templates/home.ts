import { esc, pad, picture } from './html.ts';
import { clock, page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** Home: every series as one strip of covers. The active cover opens up. */
export function renderHome(ctx: BuildContext): string {
  const { site, series } = ctx;
  const total = pad(series.length);

  const items = series
    .map((s, i) => {
      const frames = `${s.frames.length} ${s.frames.length === 1 ? 'frame' : 'frames'}`;
      return `<li class="strip__item${i === 0 ? ' is-active' : ''}" style="--ar:${s.coverFrame.ratio}">
  <a class="strip__link" href="${s.path}" style="view-transition-name:cover-${s.slug}">
    ${picture(s.coverFrame, {
      alt: `${s.title}. ${s.place}, ${s.date}.`,
      sizes: '(min-width: 800px) 42vw, 100vw',
      eager: i === 0,
    })}
  </a>
  <div class="strip__caption label">
    <span class="strip__number">(${pad(s.number)})</span>
    <span class="strip__title">${esc(s.title)}</span>
    <span class="strip__meta">${esc(s.place)}<br>${esc(s.date)}, ${frames}</span>
  </div>
</li>`;
    })
    .join('\n');

  const main = `<main id="main" class="home">
  <h1 class="visually-hidden">${esc(site.name)}. Portrait series.</h1>
  <ol class="strip" data-strip>
${items}
  </ol>
  <div class="home__foot label">
    ${clock(ctx)}
    <span class="home__role">${esc(site.role)}</span>
    <span class="home__count" aria-hidden="true"><span data-strip-count>01</span> / ${total}</span>
  </div>
</main>`;

  return page(ctx, { path: '/', section: 'work', bodyClass: 'page-home', main, noFooter: true });
}
