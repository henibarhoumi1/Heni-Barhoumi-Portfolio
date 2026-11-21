/**
 * Typefaces. Replace the files here to change the type of the whole site:
 * put the new files in public/fonts/, list them below, and nothing else needs
 * to change. Woff2 is preferred when you have it.
 *
 * Both are free and licensed (see public/fonts/): Source Code Pro (SIL Open
 * Font License) sets everything the site says about itself, small and in
 * capitals; Heros (GUST Font License) sets the few lines of reading text.
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

export const fonts: { mono: Family; grotesk: Family; preload: string[] } = {
  /** Bars, captions, labels, navigation. */
  mono: {
    family: 'Source Code Pro',
    fallback: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    faces: [{ file: 'source-code-pro-regular.woff', weight: 400 }],
  },
  /** Reading text: descriptions and About. */
  grotesk: {
    family: 'Heros',
    fallback: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    faces: [{ file: 'heros-regular.woff', weight: 400 }],
  },
  /** Files fetched before the stylesheet asks for them. Keep to what the first screen uses. */
  preload: ['source-code-pro-regular.woff'],
};

const format = (file: string) => (file.endsWith('.woff2') ? 'woff2' : file.endsWith('.woff') ? 'woff' : 'opentype');

/** @font-face rules and the family variables, inlined in every page's head. */
export function fontCss(): string {
  const faces = [fonts.mono, fonts.grotesk]
    .flatMap((f) =>
      f.faces.map(
        (face) =>
          `@font-face{font-family:'${f.family}';src:url('/fonts/${face.file}') format('${format(face.file)}');font-weight:${face.weight};font-style:${face.style ?? 'normal'};font-display:swap}`,
      ),
    )
    .join('');
  return `${faces}:root{--mono:'${fonts.mono.family}',${fonts.mono.fallback};--grotesk:'${fonts.grotesk.family}',${fonts.grotesk.fallback}}`;
}
