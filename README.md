# Heni Barhoumi

Personal site of Heni Barhoumi, creative director and filmmaker, Tunis.

A static site with its own small build. No framework runtime ships to the
browser: the pages are plain HTML, one stylesheet and a small script.

## The idea

Heni Barhoumi, Creative Director & Filmmaker, based in Tunis. One white page,
black type, and the photographs; nothing else carries colour. The name and
role head every page. Work is a single row of photographs, each in its own
proportions; the one at the slot is large and slightly bent, like a print in
the hand, with its project's number, title and details above it. Scroll,
drag, swipe or use the arrow keys to move along; any photograph opens its
project. Projects are spreads on a four-column grid (two columns on tablets,
one on phones). The Archive groups every image under its project.

Type: Heros for names, titles, navigation and reading text; Source Code Pro,
small and in capitals, for labels only (numbers, years, places, field names).

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
  projects.ts    Every project: selected work first, then the archive
  types.ts       What each field means
photos/        Media, one folder per project (folder name = project slug)
  _portrait/     The About portrait
src/
  fonts.ts       The two typefaces; swap files here
  templates/     One file per page type, plain TypeScript returning HTML
  styles/        main.css, the whole stylesheet
  scripts/       Browser code: the strip and its print warp (WebGL), archive pane, film, clock
build/         The build: images, clips, spreads, pages, dev server
public/        Copied as-is: fonts, favicon, Cloudflare _headers
```

## Pages

- `/` Work: the row of photographs from every selected project
- `/work/<slug>/` a project: title and facts (year, client, place, type, Heni's role), then spreads, credits and Next
- `/archive/` every image, grouped by project, uncropped; a pane on large screens, a full-screen viewer on phones and tablets
- `/about/` name and role, Heni's own words, selected experience (when confirmed), the portrait
- `/contact/` "Discuss a project": the email large, WhatsApp, the kind of work, where Heni is

## Adding a project

1. Create `photos/<slug>/` with the images named in order: `01.jpg`, `02.jpg`, ...
2. Add an entry to `content/projects.ts` with the same `slug`.

The fields, all described in `content/types.ts`:

| Field | What it does |
| --- | --- |
| `title`, `year`, `type`, `role` | The title, and the facts beside it. `role` is Heni's role, written exactly as credited. |
| `roles` | Several roles, e.g. `['Director of photography', 'Editor']`. Never a bigger role than the one held. |
| `client`, `place`, `description` | Optional. Only words that already exist; nothing is invented. |
| `credits` | Collaborators. Heni's role(s) are added first automatically. |
| `alt` | A plain description of each image, by file name, for people who cannot see it. |
| `selected` | `true` puts the project on the Work strip, in file order, numbered 01, 02... `false` keeps it in the Archive only. |
| `published` | `false` keeps a project off the site entirely (no page, no listing, no sitemap) until its assets, permissions and credits are final. `DRAFTS=1 npm run dev` shows drafts locally. |
| `cover` | The image used in the Archive pane, on Contact, for Next and when sharing. Defaults to the first. |
| `strip` | Which images run on the Work strip. Defaults to all. |
| `spreads` | Optional. The page spread by spread (`opening`, `pair`, `single`, `small-large`, `film`). Without it the page is laid out automatically from the images. |
| `film` | A full film from Vimeo. |

### Commercial and film work: case studies

Set `kind: 'case'` and fill whichever of these exist: `description` (Project),
`context`, `direction` (Creative direction), `execution`, `contribution`
(Heni's contribution). Each becomes a numbered section after the opening,
followed by Final work and Credits; empty ones are left out and the numbers
close up. Keep it `published: false` until the client has agreed and the
credits are confirmed.

`npm run test:case` checks the template with a placeholder project
(`test/fixtures/case-study.ts`) built into `.cache/case-test/`; it never
touches `dist/`.

### About and Contact

In `content/site.ts`: `about.experience` (year, what, exact role) and
`elsewhere` (another place Heni's work lives, such as a production company)
are hidden while empty. Fill them only with confirmed entries.

## Film and clips

- **Full films** play from Vimeo behind the project's own poster:
  `film: { vimeo: 'https://vimeo.com/123456789' }`. Nothing from Vimeo loads
  until Play is pressed. Unlisted links keep their hash. The film gets its own
  spread after the opening, or wherever `{ kind: 'film' }` is listed.
- **Clips**: an `.mp4` in the project folder can stand in any spread by its
  file name; an image with the same base name (`03.jpg` for `03.mp4`) becomes
  its poster. Clips play only on screen, muted, and stay as their poster when
  the visitor prefers reduced motion or is saving data.

## Images

`build/images.ts` turns each photo into AVIF and WebP at several widths plus a
JPEG fallback. Nothing is ever enlarged: each image is shown no wider than its
file divided by `DENSITY` in `src/templates/html.ts`, so it stays sharp.
Today's files are Instagram-sized (720 to 1,440 px wide), so spreads show them
at their sharp size inside the half page; larger originals fill more of it
with no change to the code.

## Typefaces

Set in `src/fonts.ts`. TeX Gyre Heros (GUST Font License) for names, titles,
navigation and reading text; Source Code Pro (SIL Open Font License) for small
labels. Licences are in `public/fonts/`. To use other fonts, put the files in
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
