import type { Assets } from '../../build/assets.ts';
import type { Frame } from '../../build/images.ts';
import type { Entry, Row } from '../../build/projects.ts';
import type { Site } from '../../content/types.ts';

export interface BuildContext {
  site: Site;
  /** Every project, in content order. */
  entries: Entry[];
  /** The curated running order on Work. */
  rows: Row[];
  /** Every project in the order of the running order, then the rest: the order of previous and next. */
  sequence: Entry[];
  /** Every project, newest first. */
  everything: Entry[];
  portrait: Frame | undefined;
  assets: Assets;
  fontCss: string;
  preload: string[];
  ogImage: string | undefined;
  year: number;
}
