import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** Home: every series as one small numbered image, then a short statement. */
export function renderHome(ctx: BuildContext): string {
  const { site, series } = ctx;

  const cells = series
    .map((s, i) => {
      // The other frames stay unloaded until the pointer rests on the cell (scripts/cycle.ts).
      const rest = s.frames
        .filter((frame) => frame !== s.coverFrame)
        .map((frame) => picture(frame, { alt: '', sizes: '(min-width: 800px) 14vw, 34vw' }).replace('<picture>', '<picture hidden>'))
        .join('\n');
      return `<li class="work" style="--i:${i}">
  <a class="work__link" href="${s.path}">
    <span class="work__num">${pad(s.number)}.</span>
    <span class="work__media" data-cycle style="--ar:${s.coverFrame.ratio};view-transition-name:cover-${s.slug}">
      ${picture(s.coverFrame, { alt: `${s.title}, ${s.place}, ${s.year}`, sizes: '(min-width: 800px) 14vw, 34vw', eager: i < 4, className: 'is-current' })}
      ${rest}
    </span>
    <span class="work__caption"><span>${esc(s.title)}</span><span>${s.year}</span></span>
  </a>
</li>`;
    })
    .join('\n');

  const main = `<main id="main" class="home">
  <h1 class="visually-hidden">${esc(site.name)}, selected work</h1>
  <ol class="works">
${cells}
  </ol>
  <p class="home__intro">${esc(site.intro)}</p>
</main>`;

  return page(ctx, { path: '/', section: 'work', bodyClass: 'page-home', main });
}
