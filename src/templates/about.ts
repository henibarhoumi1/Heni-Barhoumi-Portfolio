import { esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext, SeriesEntry } from './types.ts';

export function renderAbout(ctx: BuildContext): string {
  const { site, portrait, series } = ctx;
  const { about } = site;

  // Fields of work, set very large, with covers from the work placed between the words.
  const covers = [...series];
  const thumb = (s: SeriesEntry | undefined) =>
    s
      ? `<a class="fields__image" href="${s.path}" style="--ar:${s.coverFrame.ratio}" aria-label="${esc(s.title)}">${picture(s.coverFrame, { alt: '', sizes: '8vw' })}</a>`
      : '';
  // How many images follow each field, in order. Reads as a rhythm: 2, 0, 1, 1, 0, 2, 1.
  const rhythm = [2, 0, 1, 1, 0, 2, 1];
  const fields = about.fields
    .map((field, i) => {
      const last = i === about.fields.length - 1;
      const count = rhythm[i % rhythm.length] ?? 0;
      const images = Array.from({ length: count }, () => thumb(covers.shift())).join('');
      return `<span class="fields__word">${esc(field)}${last ? '.' : ','}</span> ${images}`;
    })
    .join(' ');

  const main = `<main id="main" class="about">
  <section class="section about__intro">
    <h1 class="section__label">About</h1>
    <div class="about__text">${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    ${portrait ? `<figure class="about__portrait">${picture(portrait, { alt: `Portrait of ${site.name}`, sizes: '(min-width: 800px) 24vw, 64vw', eager: true })}</figure>` : ''}
  </section>

  <section class="section">
    <h2 class="section__label">Fields of work</h2>
    <p class="fields display">${fields}</p>
  </section>

  <section class="section">
    <h2 class="section__label">Contact</h2>
    <p class="display"><a class="link" href="/contact/">Say hello</a></p>
  </section>
</main>`;

  return page(ctx, {
    title: 'About',
    description: site.description,
    path: '/about/',
    section: 'about',
    bodyClass: 'page-about',
    main,
  });
}
