# Heni Barhoumi

Personal site of Heni Barhoumi, creative director and filmmaker, Tunis.

A static site with its own small build. No framework runtime ships to the browser:
the pages are plain HTML, one stylesheet and about 3 KB of JavaScript.

## Run it

Requires Node 22 or newer.

```sh
npm install
npm run dev        # build, serve at http://localhost:4321, rebuild on change
npm run build      # production build into dist/
npm run preview    # serve dist/ as built
npm run typecheck  # TypeScript, strict
```

The first build encodes every photo and takes a minute or two. After that only
new or changed photos are processed (cache in `.cache/`).

## Where things live

```
content/     What the site says. Edit these to change text, credits, order.
  site.ts      Name, role, contact, the About and Contact page copy
  series.ts    The portrait series, in display order
photos/      Source images, one folder per series (folder name = series slug)
  _portrait/   The portrait on the About page
src/
  templates/   One file per page type, plain TypeScript returning HTML
  styles/      CSS. tokens.css holds colours, type and spacing
  scripts/     Browser code: hover sequence on the home sheet, image viewer, clock
build/       The build: image pipeline, bundling, page output, dev server
public/      Copied as-is: fonts, favicon, Cloudflare _headers
```

## Common changes

**Add a series.** Create `photos/<slug>/` with the images named in order
(`01.jpg`, `02.jpg`, ...), then add an entry with the same `slug` to
`content/series.ts`. Its position in that list is its position on the site.

**Replace Instagram exports with originals.** Put the full-resolution file in
the series folder under the same name and delete the old one. The pipeline
stops upscaling as soon as the source is large enough.

**Change the cover of a series.** Set `cover: '03'` on the series entry.

**Change contact details.** Email, WhatsApp and Instagram are in `content/site.ts` under `contact`.

## Pages

- `/` the work as a sheet of small numbered images; hovering a series steps through its frames
- `/work/<slug>/` one series: title, credits, frames, full-screen viewer
- `/about/` and `/contact/`

## Images

`build/images.ts` turns each source photo into AVIF and WebP at several widths
plus a JPEG fallback. Sources are never enlarged: the layout shows images small
enough that Instagram-sized files stay sharp, and the viewer caps each image at
what its file can carry. `image.trim` on a series crops solid black bars off
the edges. The About portrait's backdrop is pushed to pure white so it joins
the page.

## Deploy

The site deploys to Cloudflare Workers as static assets (`wrangler.jsonc`).

Connected to GitHub (recommended): in the Cloudflare dashboard create a Worker
from this repository with

- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`

Every push to `main` then builds and deploys.

By hand: `npm run deploy` (asks you to log in to Cloudflare the first time).

The production URL is read from `SITE_URL` at build time and defaults to
`https://henibarhoumi.com`. It is used for canonical links, the sitemap and
share previews.

## Fonts

TeX Gyre Heros (a Helvetica-class grotesk, GUST Font License) in regular and
bold, subset to Latin and self-hosted from `public/fonts/`. The licence is in
that folder. To use a licensed typeface instead, replace the two files and the
`@font-face` rules in `src/styles/tokens.css`.
