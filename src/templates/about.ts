import { capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * About: the name and what Heni does, his own words, then (when Heni has
 * confirmed entries) selected experience and where else his work lives. The
 * portrait, on its own white, takes the right half.
 */
export function renderAbout(ctx: BuildContext): string {
  const { site, portrait } = ctx;
  const ar = portrait ? (portrait.width / portrait.height).toFixed(3) : '1';

  const figure = portrait
    ? `<figure class="cell cell--large at-34 about__portrait" style="--cap:${capOf(portrait)}px;--ar:${ar}">
${picture(portrait, { alt: `Portrait of ${site.name}`, sizes: `(max-width: 767px) 92vw, (max-width: 1099px) 46vw, min(48vw, calc((100svh - 7rem) * ${ar}), ${capOf(portrait)}px)`, eager: true })}
</figure>`
    : '';

  const experience = site.about.experience.length
    ? `<div class="about__block">
<h2 class="label">Selected experience</h2>
<dl class="facts facts--list">${site.about.experience
        .map(
          (x) =>
            `<div><dt class="label">${esc(x.year)}</dt><dd>${x.href ? `<a href="${esc(x.href)}" rel="noopener" target="_blank">${esc(x.what)}</a>` : esc(x.what)}, <span class="role">${esc(x.role)}</span></dd></div>`,
        )
        .join('')}</dl>
</div>`
    : '';

  const elsewhere = site.elsewhere.length
    ? `<div class="about__block">
<h2 class="label">Elsewhere</h2>
<ul>${site.elsewhere.map((e) => `<li><a href="${esc(e.href)}" rel="noopener" target="_blank">${esc(e.label)}</a>${e.note ? `, ${esc(e.note)}` : ''}</li>`).join('')}</ul>
</div>`
    : '';

  const email = site.contact.email;

  const main = `<main id="main" class="about">
<section class="spread spread--about">
<div class="cell cell--head">
  <p class="label">About</p>
  <h1 class="title">${esc(site.name)}</h1>
  <p class="lead">${esc(site.role)}, based in ${esc(site.location)}.</p>
</div>
<div class="cell cell--read about__text">
${site.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}
${experience}
${elsewhere}
${email ? `<p class="about__contact">To discuss a project, write to <a href="mailto:${esc(email)}">${esc(email)}</a>.</p>` : ''}
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
    ...(portrait ? { image: portrait.jpg.url } : {}),
  });
}
