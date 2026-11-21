import { esc, localTime } from './html.ts';
import type { BuildContext } from './types.ts';

export type Section = 'work' | 'archive' | 'about' | 'contact' | 'none';

interface PageOptions {
  /** Shown in the browser tab, before the site name. Leave empty on Work. */
  title?: string;
  description?: string;
  /** Site path of the page, e.g. /about/ */
  path: string;
  section: Section;
  /** Class on <body>. */
  bodyClass: string;
  main: string;
  /** Centre of the top bar. Defaults to (Back). */
  top?: string;
  /** A third of the way along the bottom bar. Defaults to (Archive). */
  slot?: string;
  /** The caption in the bottom bar, a little right of centre. */
  caption?: string;
  /** Search and share image, absolute or site path. */
  image?: string;
  noIndex?: boolean;
}

const NAV: { section: Section; label: string; href: string }[] = [
  { section: 'work', label: 'Work', href: '/' },
  { section: 'about', label: 'About', href: '/about/' },
  { section: 'contact', label: 'Contact', href: '/contact/' },
];

/**
 * Runs in the head, before the page is drawn: marks scripting as available,
 * and on the way into a project names the image that travels with you
 * (browsers without cross-document view transitions simply load the page).
 */
const HEAD_SCRIPT = `(()=>{document.documentElement.classList.add('js');
var path=function(u){try{return new URL(u,location.href).pathname}catch(e){return''}};
var target='',clicked=null;
addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a){target=a.href;clicked=a}},true);
addEventListener('pageswap',function(e){
if(!e.viewTransition)return;
var to=path(e.activation&&e.activation.entry?e.activation.entry.url:target);
if(!/^\\/work\\/[^/]+\\/$/.test(to))return;
var el=document.querySelector('.is-active[data-vt="'+to+'"]')||(clicked&&path(clicked.href)===to&&clicked.querySelector('img'));
if(el)el.style.viewTransitionName='hero';});
})()`;

/** (Back) returns to the page you came from on this site, otherwise to Work. */
export const back = (): string => `<a href="/" data-back>(Back)</a>`;

export const archiveLink = (current = false): string => `<a href="/archive/"${current ? ' aria-current="page"' : ''}>(Archive)</a>`;

export const clock = (ctx: BuildContext): string => `<span class="clock">(Tunis ${localTime(ctx)})</span>`;

export function page(ctx: BuildContext, options: PageOptions): string {
  const { site, assets } = ctx;
  const title = options.title ? `${options.title} | ${site.name}` : `${site.name} | ${site.role}`;
  const description = options.description ?? site.description;
  const canonical = `${site.url}${options.path}`;
  const image = options.image ?? ctx.ogImage;
  const imageUrl = image ? (image.startsWith('http') ? image : site.url + image) : undefined;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    jobTitle: site.role,
    address: { '@type': 'PostalAddress', addressLocality: 'Tunis', addressCountry: 'TN' },
    sameAs: [site.contact.instagram.href],
  };

  const nav = (label: string) =>
    `<nav class="bar__nav" aria-label="${label}">${NAV.map(
      (item) => `<a href="${item.href}"${item.section === options.section ? ' aria-current="page"' : ''}>${item.label}</a>`,
    ).join('')}</nav>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${options.noIndex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${imageUrl ? `<meta property="og:image" content="${esc(imageUrl)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${ctx.preload.map((file) => `<link rel="preload" href="/fonts/${file}" as="font" type="font/${file.endsWith('2') ? 'woff2' : 'woff'}" crossorigin>`).join('\n')}
<style>${ctx.fontCss}</style>
<link rel="stylesheet" href="${assets.css}">
<script>${HEAD_SCRIPT}</script>
<script type="module" src="${assets.js}"></script>
<script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body class="${options.bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="bar bar--top">
  <a class="bar__name" href="/">${esc(site.name)}</a>
  <div class="bar__mid">${options.top ?? back()}</div>
  ${nav('Main')}
</header>
${options.main}
<footer class="bar bar--bottom">
  <a class="bar__name" href="/">${esc(site.name)}</a>
  <div class="bar__slot">${options.slot ?? archiveLink(options.section === 'archive')}</div>
  <p class="bar__caption" data-bar-caption>${options.caption ?? ''}</p>
  ${nav('Footer')}
</footer>
</body>
</html>
`;
}
