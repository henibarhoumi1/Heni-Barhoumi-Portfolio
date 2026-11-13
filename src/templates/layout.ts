import type { Room } from '../../build/projects.ts';
import { endCredits } from './credits.ts';
import { esc } from './html.ts';
import type { BuildContext } from './types.ts';

type Section = 'work' | 'about' | 'contact' | 'none';

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
  /** The room of the page. Bright unless a project says otherwise. */
  room?: Room;
  /** A project page: entering it takes the longer, darker transition. */
  project?: boolean;
  /** The end credits close the page. The Contact page is the credits, so it leaves them out. */
  credits?: boolean;
  /** Include the image viewer. */
  viewer?: boolean;
  /** Search and share image, absolute or site path. */
  image?: string;
  noIndex?: boolean;
}

const BRIGHT: Room = { bg: '#ffffff', ink: '#000000', dark: false };

const NAV: { section: Section; label: string; href: string }[] = [
  { section: 'work', label: 'Work', href: '/' },
  { section: 'about', label: 'About', href: '/about/' },
  { section: 'contact', label: 'Contact', href: '/contact/' },
];

/**
 * Runs in the head, before the page is drawn: marks scripting as available,
 * and on page changes names the image that should travel between the two
 * pages (scripts never block on this; browsers without view transitions just
 * load the page). Also returns Work to where it was left.
 */
const HEAD_SCRIPT = `(()=>{var d=document.documentElement;d.classList.add('js');
var store=function(k,v){try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}};
var read=function(k){try{return sessionStorage.getItem(k)}catch(e){return null}};
var path=function(u){try{return new URL(u,location.href).pathname}catch(e){return''}};
var project=function(p){return /^\\/work\\/[^/]+\\/$/.test(p)};
var name=function(el,n){if(el)el.style.viewTransitionName=n};
var target='';
addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a)target=a.href},true);
addEventListener('pageswap',function(e){
var to=path(e.activation&&e.activation.entry?e.activation.entry.url:target);
if(location.pathname==='/')store('work-y',String(scrollY));
if(!e.viewTransition||!project(to))return;
var from=document.querySelector('[data-vt="'+to+'"]');
if(!from)return;
document.querySelectorAll('[data-vt-self]').forEach(function(el){if(el!==from)name(el,'none')});
name(from,'hero');});
addEventListener('pagereveal',function(e){
var nav=window.navigation&&navigation.activation;
var from=path(nav&&nav.from?nav.from.url:document.referrer);
var kind=nav?nav.navigationType:'';
var y=read('work-y');
if(location.pathname==='/'&&project(from)&&kind!=='traverse'&&kind!=='reload'&&y!==null)scrollTo(0,+y);
if(!e.viewTransition)return;
if(!project(from))return;
var el=location.pathname==='/'?document.querySelector('[data-vt="'+from+'"]'):null;
if(el){name(el,'hero');e.viewTransition.finished.then(function(){name(el,'')})}});
})()`;

export function page(ctx: BuildContext, options: PageOptions): string {
  const { site, assets } = ctx;
  const room = options.room ?? BRIGHT;
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

  const nav = NAV.map(
    (item) => `<a href="${item.href}"${item.section === options.section ? ' aria-current="page"' : ''}>${item.label}</a>`,
  ).join('');

  const classes = [room.dark ? 'room-dark' : 'room-bright', options.project ? 'is-project' : ''].filter(Boolean).join(' ');

  return `<!doctype html>
<html lang="en" class="${classes}" style="--room:${room.bg};--ink:${room.ink}">
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
${imageUrl ? `<meta property="og:image" content="${esc(imageUrl)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="${room.bg}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${ctx.preload.map((file) => `<link rel="preload" href="/fonts/${file}" as="font" type="font/${file.endsWith('2') ? 'woff2' : 'woff'}" crossorigin>`).join('\n')}
<style>${ctx.fontCss}</style>
<link rel="stylesheet" href="${assets.css}">
<link rel="expect" href="#main" blocking="render">
<script>${HEAD_SCRIPT}</script>
<script type="module" src="${assets.js}"></script>
<script type="application/ld+json">${JSON.stringify(person)}</script>
</head>
<body class="${options.bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead" data-masthead>
  <a class="masthead__name" href="/">${esc(site.name)}</a>
  <p class="masthead__slate" data-slate></p>
  <nav class="masthead__nav" aria-label="Main">${nav}</nav>
</header>
${options.main}
${options.credits === false ? '' : endCredits(ctx, { level: 'h2' })}
${options.viewer ? viewer() : ''}
</body>
</html>
`;
}

/** Full-screen image viewer, filled by scripts/viewer.ts. */
function viewer(): string {
  return `<dialog class="viewer" data-viewer aria-label="Image viewer">
  <p class="viewer__caption" data-viewer-caption></p>
  <button type="button" class="viewer__close" data-viewer-close>Close</button>
  <div class="viewer__stage" data-viewer-stage></div>
  <button type="button" class="viewer__step viewer__step--prev" data-viewer-prev><span>Previous</span></button>
  <button type="button" class="viewer__step viewer__step--next" data-viewer-next><span>Next</span></button>
  <div class="viewer__strip" data-viewer-strip></div>
  <div hidden data-viewer-preload></div>
</dialog>`;
}
