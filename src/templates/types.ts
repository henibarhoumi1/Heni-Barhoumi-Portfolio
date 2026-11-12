import type { Assets } from '../../build/assets.ts';
import type { Frame } from '../../build/images.ts';
import type { Series, Site } from '../../content/types.ts';

export interface SeriesEntry extends Series {
  /** 1-based position on the site. */
  number: number;
  frames: Frame[];
  coverFrame: Frame;
  /** Site path, e.g. /work/dark-fantasy/ */
  path: string;
}

export interface BuildContext {
  site: Site;
  series: SeriesEntry[];
  portrait: Frame | undefined;
  assets: Assets;
  ogImage: string | undefined;
  year: number;
}
