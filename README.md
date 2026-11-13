# Heni Barhoumi

Personal site of Heni Barhoumi, creative director and filmmaker, Tunis.

A static site with its own small build. No framework runtime ships to the
browser: the pages are plain HTML, one stylesheet and about 11 KB of JavaScript.

## The idea: house lights

You browse the work in a bright room and watch it in a dark one. The site is
black and white only. Work and About are white with black type. Opening a dark
project brings the lights down: the page turns black while its image travels
into place. Every page closes on the same end credits: how to reach Heni.

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
content/       What the site says. Edit these; nothing else needs to change.
  site.ts        Name, contact details, About text
  projects.ts    Every project, in running order
  types.ts       What each field means
photos/        Media, one folder per project (folder name = project slug)
  _portrait/     The About portrait
src/
  fonts.ts       The two typefaces; swap files here
  templates/     One file per page type, plain TypeScript returning HTML
  styles/        CSS. tokens.css holds type, space and motion
  scripts/       Browser code: header, previews, viewer, film player, clock
build/         The build: images, clips, presets, pages, dev server
public/        Copied as-is: fonts, favicon, Cloudflare _headers
```

## Pages

- `/` Work: the curated running order of spreads, then Everything, the whole archive
- `/work/<slug>/` a project, in its own room, built from blocks
- `/about/` the portrait holds the left half, the words move through the right
- `/contact/` the end credits, filling the window

## Adding a project

1. Create `photos/<slug>/` with the images named in order: `01.jpg`, `02.jpg`, ...
2. Add an entry to `content/projects.ts` with the same `slug`.

The fields, all described in `content/types.ts`:

| Field | What it does |
| --- | --- |
| `title`, `year`, `type`, `role` | Shown on Work, in Everything and on the page. `role` is Heni's role. |
| `client`, `place`, `description` | Optional. The description is one short paragraph. |
| `credits` | Collaborators. Heni's role is added first automatically. |
| `spread` | Place in the running order: `full`, `offset`, `small` or `pair` (two `pair` projects in a row share it). Leave out to list the project in Everything only. |
| `room` | `'bright'` (white) or `'dark'` (black) for the project's page. No other colours. |
| `preset` | `film`, `editorial`, `campaign` or `personal`: a starting order of blocks. |
| `blocks` | Optional. The page block by block, replacing the preset. |
| `cover`, `preview`, `hero`, `film` | Which media to use where. See below. |

**Blocks**: `opening`, `hero`, `description`, `sequence` (layouts `full`,
`pair`, `trio`, `offset`, `strip`), `film`, `pull` (one line set large; only
words that already exist), `credits`. Opening and Next are always present.

## Film and clips

- **Full films** play from Vimeo behind the project's own poster:
  `film: { vimeo: 'https://vimeo.com/123456789' }`. Nothing from Vimeo loads
  until Play is pressed. Unlisted links keep their hash.
- **Previews** on Work: `preview: { video: 'preview.mp4' }`, a file in the
  project folder, about six seconds, muted, under 1.5 MB. Without one, the
  second image is shown on hover instead.
- **Hero loops**: `hero: { video: 'hero.mp4' }`. The hero still is its poster.
- A clip can sit in any sequence by its file name; an image with the same base
  name (`03.jpg` for `03.mp4`) becomes its poster.

To make a preview from a longer cut:

```sh
ffmpeg -ss 00:00:12 -t 6 -i film.mov -an -vf "scale=1280:-2" \
  -c:v libx264 -crf 28 -preset slow -movflags +faststart preview.mp4
```

Clips play only on screen, never with sound, and stay as their poster when the
visitor prefers reduced motion or is saving data.

## Images

`build/images.ts` turns each photo into AVIF and WebP at several widths plus a
JPEG fallback. Nothing is ever enlarged: each image is shown no wider than its
file divided by `DENSITY` in `src/templates/html.ts`, so it stays sharp. Files
2,400 px wide or more run edge to edge where the layout allows; the current
Instagram-sized placeholders sit at their sharp size instead.

The About portrait works the same way: a small file stands on the corner of
the left half; a large one (2,400 px or more) fills it.

## Typefaces

Set in `src/fonts.ts`. Today: TeX Gyre Heros for the structure and TeX Gyre
Pagella Italic for the editorial voice, both under the GUST Font License
(licences in `public/fonts/`). To use licensed fonts, put the files in
`public/fonts/` and change the file names there.

## Deploy

The site deploys to Cloudflare Workers as static assets (`wrangler.jsonc`),
connected to this repository:

- Build command: `npm install && npm run build`
- Deploy command: `npx wrangler deploy`

Every push to `main` builds and deploys. Other branches get a preview build.

The production URL is read from `SITE_URL` at build time and defaults to
`https://henibarhoumi.com`. It is used for canonical links, the sitemap and
share previews.
