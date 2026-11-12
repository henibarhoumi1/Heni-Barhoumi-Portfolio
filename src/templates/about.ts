import { esc, pad, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderAbout(ctx: BuildContext): string {
  const { site, portrait } = ctx;
  const { about, contact } = site;

  const contactLinks = [
    contact.email ? `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : '',
    `<a href="${esc(contact.instagram.href)}" rel="me noopener">Instagram ${esc(contact.instagram.handle)}</a>`,
  ]
    .filter(Boolean)
    .join('<br>');

  const main = `<main id="main" class="about">
  <section class="about__statement">
    <h1 class="statement">${about.statement.map((p) => `<span>${esc(p)}</span>`).join(' ')}</h1>
  </section>

  <section class="about__grid">
    ${portrait ? `<figure class="about__portrait">${picture(portrait, { alt: `Portrait of ${site.name}`, sizes: '(min-width: 800px) 16vw, 45vw' })}<figcaption class="label">${esc(site.name)}<br>${esc(site.location)}</figcaption></figure>` : ''}

    <div class="about__block">
      <h2 class="label">What I do</h2>
      <ul class="plain">${about.practice.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>

    <div class="about__block">
      <h2 class="label">How I work</h2>
      <ol class="method">${about.method
        .map((step, i) => `<li><span class="label">${pad(i + 1)}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`)
        .join('')}</ol>
    </div>

    <div class="about__block">
      <h2 class="label">Now, ${esc(about.now.updated)}</h2>
      <ul class="plain plain--spaced">${about.now.items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    </div>
  </section>

  <section class="about__contact">
    <h2 class="label">Inquiries</h2>
    <p class="about__invite">${esc(about.collaborate)}</p>
    <p class="about__links">${contactLinks}</p>
  </section>

  <p class="wordmark" aria-hidden="true">${esc(site.name)}</p>
</main>`;

  return page(ctx, {
    title: 'About',
    description: `${site.name}: ${site.role.toLowerCase()}, based in ${site.location}.`,
    path: '/about/',
    section: 'about',
    bodyClass: 'page-about',
    main,
  });
}
