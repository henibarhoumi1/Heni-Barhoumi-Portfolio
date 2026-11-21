import { capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * About: one spread. The portrait, on its own white, takes the right half
 * and dissolves into the page; Heni's words sit low in the second column.
 * The words are his, unchanged.
 */
export function renderAbout(ctx: BuildContext): string {
  const { site, portrait } = ctx;

  const figure = portrait
    ? `<figure class="cell cell--large at-34 about__portrait" style="--cap:${capOf(portrait)}px;--ar:${(portrait.width / portrait.height).toFixed(4)}">
${picture(portrait, { alt: `Portrait of ${site.name}`, sizes: `(max-width: 899px) 92vw, min(48vw, calc((100svh - 9rem) * ${(portrait.width / portrait.height).toFixed(3)}), ${capOf(portrait)}px)`, eager: true })}
</figure>`
    : '';

  const main = `<main id="main" class="about">
<section class="spread spread--about">
<div class="cell cell--head">
  <p class="num">(About)</p>
  <h1 class="caption">${esc(site.name)}, ${esc(site.location)}</h1>
</div>
<div class="cell cell--read about__text">
${site.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}
</div>
${figure}
</section>
</main>`;

  return page(ctx, {
    title: 'About',
    description: site.description,
    path: '/about/',
    section: 'about',
    bodyClass: 'page-about',
    main,
    caption: `${esc(site.location)} ©${ctx.year}`,
    ...(portrait ? { image: portrait.jpg.url } : {}),
  });
}
