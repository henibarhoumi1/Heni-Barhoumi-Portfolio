/**
 * Typefaces. Replace the files here to change the type of the whole site:
 * put the new files in public/fonts/, list them below, and nothing else needs
 * to change. Woff2 is preferred when you have it.
 *
 * Today both are free, licensed stand-ins from the TeX Gyre collection (GUST
 * Font License, see public/fonts/): Heros for the structure, Pagella Italic
 * for the editorial voice.
 */
export interface Face {
  file: string;
  weight: number;
  style?: 'normal' | 'italic';
}

export interface Family {
  family: string;
  /** Used while the file loads, and if it fails. */
  fallback: string;
  faces: Face[];
}

export const fonts: { grotesk: Family; serif: Family; preload: string[] } = {
  /** Navigation, titles, facts, reading text. */
  grotesk: {
    family: 'Heros',
    fallback: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    faces: [
      { file: 'heros-regular.woff', weight: 400 },
      { file: 'heros-bold.woff', weight: 700 },
    ],
  },
  /** The editorial voice: pull lines, the opening of About, a few small words. Italic only. */
  serif: {
    family: 'Pagella',
    fallback: "Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
    faces: [{ file: 'pagella-italic.woff', weight: 400, style: 'italic' }],
  },
  /** Files fetched before the stylesheet asks for them. Keep to what the first screen uses. */
  preload: ['heros-regular.woff'],
};

const format = (file: string) => (file.endsWith('.woff2') ? 'woff2' : file.endsWith('.woff') ? 'woff' : 'opentype');

/** @font-face rules and the two family variables, inlined in every page's head. */
export function fontCss(): string {
  const faces = [fonts.grotesk, fonts.serif]
    .flatMap((f) =>
      f.faces.map(
        (face) =>
          `@font-face{font-family:'${f.family}';src:url('/fonts/${face.file}') format('${format(face.file)}');font-weight:${face.weight};font-style:${face.style ?? 'normal'};font-display:swap}`,
      ),
    )
    .join('');
  return `${faces}:root{--grotesk:'${fonts.grotesk.family}',${fonts.grotesk.fallback};--serif:'${fonts.serif.family}',${fonts.serif.fallback}}`;
}
