import { esc } from './html.ts';
import type { BuildContext } from './types.ts';

type Section = 'work' | 'frames' | 'about' | 'none';

interface PageOptions {
  /** Shown in the browser tab, before the site name. Leave empty on the home page. */
  title?: string;
  description?: string;
  /** Site path of the page, e.g. /about/ */
  path: string;
  section: Section;
  /** Extra class on <body>. */
  bodyClass: string;
  main: string;
  /** Hide the page footer (the home page has its own). */
  noFooter?: boolean;
  noIndex?: boolean;
}

const NAV: { section: Section; label: string; href: string }[] = [
  { section: 'work', label: 'Work', href: '/' },
  { section: 'frames', label: 'Index', href: '/frames/' },
  { section: 'about', label: 'About', href: '/about/' },
];

export function clock(ctx: BuildContext): string {
  return `<span class="clock">${esc(ctx.site.location)} <time data-clock data-time-zone="${esc(ctx.site.timeZone)}"></time></span>`;
}

export function page(ctx: BuildContext, options: PageOptions): string {
  const { site, assets } = ctx;
  const title = options.title ? `${options.title} | ${site.name}` : `${site.name} | ${site.role}`;
  const description = options.description ?? site.description;
  const canonical = `${site.url}${options.path}`;
  const instagram = site.contact.instagram;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    jobTitle: 'Creative director and filmmaker',
    address: { '@type': 'PostalAddress', addressLocality: 'Tunis', addressCountry: 'TN' },
    sameAs: [instagram.href],
  };

  const nav = NAV.map(
    (item) => `<a href="${item.href}"${item.section === options.section ? ' aria-current="page"' : ''}>${item.label}</a>`,
  ).join('');

  const footer = options.noFooter
    ? ''
    : `<footer class="colophon label">
  <span>&copy; ${ctx.year} ${esc(site.name)}</span>
  ${clock(ctx)}
  <a href="${instagram.href}" rel="me noopener">Instagram</a>
</footer>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${options.noIndex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${ctx.ogImage ? `<meta property="og:image" content="${esc(site.url + ctx.ogImage)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#f2f2ee">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/inter-medium.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script type="module" src="${assets.js}"></script>
<script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body class="${options.bodyClass}">
<a class="skip label" href="#main">Skip to content</a>
<header class="masthead label">
  <a class="masthead__name" href="/">${esc(site.name)}</a>
  <nav class="masthead__nav" aria-label="Main">${nav}</nav>
</header>
${options.main}
${footer}
<dialog class="lightbox" data-lightbox-dialog aria-label="Frame viewer">
  <div class="lightbox__bar label">
    <span data-lightbox-caption></span>
    <span data-lightbox-count></span>
    <button type="button" data-lightbox-close>Close</button>
  </div>
  <div class="lightbox__stage" data-lightbox-stage></div>
  <button type="button" class="lightbox__nav lightbox__nav--prev" data-lightbox-prev aria-label="Previous frame"></button>
  <button type="button" class="lightbox__nav lightbox__nav--next" data-lightbox-next aria-label="Next frame"></button>
</dialog>
</body>
</html>
`;
}
