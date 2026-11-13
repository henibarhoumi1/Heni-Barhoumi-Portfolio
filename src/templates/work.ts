import type { Entry, Row } from '../../build/projects.ts';
import { canFill, capOf, esc, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** Title, then year, type and role: always visible, never behind a hover. */
function info(entry: Entry, level: 'h2' | 'h3' = 'h2'): string {
  return `<div class="spread__info">
      <${level} class="spread__title">${esc(entry.title)}</${level}>
      <p class="spread__facts"><span>${entry.year}</span><span>${esc(entry.type)}</span><span>${esc(entry.role)}</span></p>
    </div>`;
}

/**
 * The project's image on Work, with what it reveals on hover or when centred
 * on a phone: a short muted clip, or a second still. Neither loads until it
 * is needed (scripts/previews.ts). `data-vt` lets the image travel into the
 * project page as it opens.
 */
function media(entry: Entry, sizes: string, eager: boolean, extra = ''): string {
  const { cover, preview } = entry;
  const still = preview.still ? picture(preview.still, { alt: '', sizes, hidden: true, className: 'preview-still' }) : '';
  const clip = preview.clip
    ? `<video class="preview-clip" muted loop playsinline preload="none" aria-hidden="true" width="${cover.width}" height="${cover.height}"><source src="${preview.clip.url}" type="${preview.clip.type}"></video>`
    : '';
  return `<div class="spread__media${extra}" data-preview data-vt="${entry.path}" style="--cap:${capOf(cover)}px;--ar:${cover.ratio}">
      ${picture(cover, { alt: '', sizes, eager })}
      ${still}
      ${clip}
    </div>`;
}

function spread(row: Row, index: number): string {
  const eager = index < 2;

  if (row.layout === 'pair') {
    const [a, b] = row.entries;
    const one = (e: Entry, i: number) => `<div class="pair__item pair__item--${i ? 'b' : 'a'}" data-slate="${esc(e.title)}">
    <a class="spread__link" href="${e.path}">
      ${media(e, `(min-width: 800px) min(${i ? 26 : 34}vw, ${capOf(e.cover)}px), 46vw`, eager)}
      ${info(e, 'h3')}
    </a>
  </div>`;
    return `<li class="spread spread--pair">
  ${one(a, 0)}
  ${one(b, 1)}
</li>`;
  }

  const { entry, side } = row;
  const cap = capOf(entry.cover);

  if (row.layout === 'full') {
    // Edge to edge when the file allows; otherwise the image sits at its sharp size in the project's own colour.
    const fill = canFill(entry.cover) || Boolean(entry.preview.clip);
    return `<li class="spread spread--full${fill ? ' is-fill' : ''}" data-slate="${esc(entry.title)}" data-room style="--room:${entry.room.bg};--ink:${entry.room.ink}">
  <a class="spread__link" href="${entry.path}">
    ${media(entry, fill ? '100vw' : `(min-width: 800px) min(60vw, ${cap}px), 92vw`, eager)}
    ${info(entry)}
  </a>
</li>`;
  }

  const sizes = row.layout === 'offset' ? `(min-width: 800px) min(56vw, ${cap}px), 86vw` : `(min-width: 800px) min(24vw, ${cap}px), 56vw`;
  return `<li class="spread spread--${row.layout} is-${side}" data-slate="${esc(entry.title)}">
  <a class="spread__link" href="${entry.path}">
    ${media(entry, sizes, eager)}
    ${info(entry)}
  </a>
</li>`;
}

/** Everything: the whole archive as a plain list, newest first. */
function everything(entries: Entry[]): string {
  const rows = entries
    .map(
      (e) => `<li class="row">
      <a class="row__link" href="${e.path}">
        <span class="row__thumb" style="--ar:${e.cover.ratio}">${picture(e.cover, { alt: '', sizes: '(min-width: 800px) 200px, 56px' })}</span>
        <span class="row__title">${esc(e.title)}</span>
        <span class="row__type">${esc(e.type)}</span>
        <span class="row__year">${e.year}</span>
      </a>
    </li>`,
    )
    .join('\n    ');
  return `<section class="everything" aria-labelledby="everything-title">
  <h2 class="everything__label" id="everything-title">Everything</h2>
  <ol class="everything__list">
    ${rows}
  </ol>
</section>`;
}

export function renderWork(ctx: BuildContext): string {
  const main = `<main id="main" class="work">
  <h1 class="visually-hidden">${esc(ctx.site.name)}, work</h1>
  <ol class="issue">
${ctx.rows.map(spread).join('\n')}
  </ol>
  ${everything(ctx.everything)}
</main>`;

  return page(ctx, { path: '/', section: 'work', bodyClass: 'page-work', main });
}
