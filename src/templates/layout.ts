import { esc } from './html.ts';
import type { BuildContext } from './types.ts';

type Section = 'work' | 'about' | 'contact' | 'none';

interface PageOptions {
  /** Shown in the browser tab, before the site name. Leave empty on the home page. */
  title?: string;
  description?: string;
  /** Site path of the page, e.g. /about/ */
  path: string;
  section: Section;
  /** Class on <body>. */
  bodyClass: string;
  main: string;
  noIndex?: boolean;
}

const NAV: { section: Section; label: string; href: string }[] = [
  { section: 'work', label: 'Work', href: '/' },
  { section: 'about', label: 'About', href: '/about/' },
  { section: 'contact', label: 'Contact', href: '/contact/' },
];

/** The local time, kept current by scripts/clock.ts. */
export function localTime(ctx: BuildContext): string {
  return `<time data-clock data-time-zone="${esc(ctx.site.timeZone)}"></time>`;
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
    jobTitle: site.role,
    address: { '@type': 'PostalAddress', addressLocality: 'Tunis', addressCountry: 'TN' },
    sameAs: [instagram.href],
  };

  const nav = NAV.map(
    (item) => `<a href="${item.href}"${item.section === options.section ? ' aria-current="page"' : ''}>${item.label}</a>`,
  ).join('');

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
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/heros-regular.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="/fonts/heros-bold.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="module" src="${assets.js}"></script>
<script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body class="${options.bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead">
  <a class="masthead__name" href="/">${esc(site.name)}</a>
  <span class="masthead__role">${esc(site.role)}</span>
  <nav class="masthead__nav" aria-label="Main">${nav}</nav>
</header>
${options.main}
<footer class="colophon">
  <span>&copy; ${ctx.year} ${esc(site.name)}</span>
  <span>${esc(site.location.split(',')[0] ?? site.location)} ${localTime(ctx)}</span>
  <a href="${instagram.href}" rel="me noopener">Instagram</a>
</footer>
<dialog class="lightbox" data-lightbox-dialog aria-label="Image viewer">
  <div class="lightbox__bar">
    <span data-lightbox-caption></span>
    <span data-lightbox-count></span>
    <button type="button" data-lightbox-close>Close</button>
  </div>
  <div class="lightbox__stage" data-lightbox-stage></div>
  <button type="button" class="lightbox__nav lightbox__nav--prev" data-lightbox-prev>Previous</button>
  <button type="button" class="lightbox__nav lightbox__nav--next" data-lightbox-next>Next</button>
  <div hidden data-lightbox-preload></div>
</dialog>
</body>
</html>
`;
}
