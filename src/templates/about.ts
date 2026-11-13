import { canFill, capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * About: the portrait holds the left half of the window while the words
 * move through the right. The first sentence, when it is short, is set large
 * in the editorial voice; the words themselves are Heni's, unchanged.
 */
export function renderAbout(ctx: BuildContext): string {
  const { site, portrait } = ctx;
  const [first = '', ...more] = site.about.paragraphs;
  const split = first.match(/^(.{1,40}?[.!?])\s+(.+)$/);
  const opening = split ? (split[1] as string) : first;
  const lead = split ? (split[2] as string) : '';

  // A file large enough to fill the half is shown edge to edge; a small one
  // stands on the bottom-left corner, where its own cut edges are.
  const fill = portrait ? canFill(portrait) : false;
  const figure = portrait
    ? `<figure class="about__portrait${fill ? ' is-fill' : ''}" style="--cap:${capOf(portrait)}px;--ar:${portrait.ratio}">
    ${picture(portrait, { alt: `Portrait of ${site.name}`, sizes: fill ? '(min-width: 800px) 50vw, 100vw' : `(min-width: 800px) ${capOf(portrait)}px, 100vw`, eager: true })}
  </figure>`
    : '';

  const main = `<main id="main" class="about">
  ${figure}
  <div class="about__text">
    <h1 class="visually-hidden">About ${esc(site.name)}</h1>
    <p class="about__opening">${esc(opening)}</p>
    ${lead ? `<p class="about__lead">${esc(lead)}</p>` : ''}
    ${more.map((p) => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
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
