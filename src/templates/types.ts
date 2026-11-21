import type { Assets } from '../../build/assets.ts';
import type { Frame } from '../../build/images.ts';
import type { Entry } from '../../build/projects.ts';
import type { Site } from '../../content/types.ts';

export interface BuildContext {
  site: Site;
  /** Every project: selected work first, then the archive. Also the order of Next. */
  entries: Entry[];
  /** The projects on the Work strip. */
  selected: Entry[];
  portrait: Frame | undefined;
  assets: Assets;
  fontCss: string;
  preload: string[];
  ogImage: string | undefined;
  year: number;
}
