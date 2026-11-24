import type { Entry } from '../../build/projects.ts';
import { esc } from './html.ts';
import type { BuildContext } from './types.ts';

/**
 * Pieces shared by several pages: the facts of a project as label and value,
 * credits, and the project's structured data for search engines.
 */

/** Year, place, type, client and Heni's role(s), as label and value. Empty fields are left out. */
export function facts(entry: Entry): string {
  const rows: [string, string][] = [
    ['Year', String(entry.year)],
    ...(entry.client ? ([['Client', entry.client]] as [string, string][]) : []),
    ...(entry.place ? ([['Place', entry.place]] as [string, string][]) : []),
    ['Type', entry.type],
    [entry.roles.length > 1 ? 'Roles' : 'Role', entry.roles.join(', ')],
  ];
  return `<dl class="facts">${rows.map(([k, v]) => `<div><dt>(${esc(k)})</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

export function credits(entry: Entry): string {
  return `<dl class="facts facts--credits">${entry.credits
    .map(
      (c) =>
        `<div><dt>(${esc(c.role)})</dt><dd>${c.href ? `<a href="${esc(c.href)}" rel="noopener" target="_blank">${esc(c.name)}</a>` : esc(c.name)}</dd></div>`,
    )
    .join('')}</dl>`;
}

/** The project as a CreativeWork made by Heni, with its images. */
export function projectData(ctx: BuildContext, entry: Entry): object {
  const { site } = ctx;
  return {
    '@context': 'https://schema.org',
    '@type': entry.kind === 'case' ? 'CreativeWork' : 'ImageGallery',
    name: entry.title,
    url: `${site.url}${entry.path}`,
    dateCreated: String(entry.year),
    genre: entry.type,
    ...(entry.description ? { description: entry.description } : {}),
    ...(entry.place ? { locationCreated: { '@type': 'Place', name: entry.place } } : {}),
    creator: { '@id': `${site.url}/#person` },
    image: entry.frames.map((f) => ({
      '@type': 'ImageObject',
      contentUrl: `${site.url}${f.jpg.url}`,
      width: f.width,
      height: f.height,
      caption: entry.alt(f),
    })),
  };
}
