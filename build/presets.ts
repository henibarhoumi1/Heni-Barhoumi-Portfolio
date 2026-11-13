/**
 * Starting orders for project pages. A preset turns a project's images into
 * a page; listing `blocks` on the project replaces the preset entirely.
 * Each preset also has its own rhythm of image rows, so projects built from
 * the same preset still differ with the number and shape of their images.
 */
import type { Block, Preset, Project, SequenceLayout } from '../content/types.ts';

type Step = { layout: SequenceLayout; side?: 'left' | 'right' };

const RHYTHM: Record<Preset, Step[]> = {
  film: [{ layout: 'trio' }, { layout: 'offset', side: 'right' }, { layout: 'pair' }, { layout: 'full' }],
  editorial: [
    { layout: 'offset', side: 'left' },
    { layout: 'pair' },
    { layout: 'offset', side: 'right' },
    { layout: 'trio' },
    { layout: 'full' },
    { layout: 'pair' },
  ],
  campaign: [{ layout: 'pair' }, { layout: 'offset', side: 'right' }, { layout: 'trio' }, { layout: 'full' }],
  personal: [{ layout: 'offset', side: 'right' }, { layout: 'strip' }],
};

const SIZE: Record<SequenceLayout, number> = { full: 1, offset: 1, pair: 2, trio: 3, strip: 3 };

/** Rows of images following a preset's rhythm, until the media runs out. */
export function rows(media: string[], preset: Preset): Block[] {
  const out: Block[] = [];
  const rhythm = RHYTHM[preset];
  let left = [...media];
  let turn = 0;
  while (left.length > 0) {
    let step = rhythm[turn % rhythm.length] as Step;
    turn += 1;
    // A strip takes whatever is left; other layouts fall back when there is too little left.
    if (step.layout === 'strip') {
      if (left.length >= 3) {
        out.push({ type: 'sequence', layout: 'strip', media: left });
        break;
      }
      step = { layout: 'pair' };
    }
    if (left.length < SIZE[step.layout]) step = left.length === 2 ? { layout: 'pair' } : { layout: 'offset', side: turn % 2 ? 'left' : 'right' };
    const take = SIZE[step.layout];
    out.push({ type: 'sequence', layout: step.layout, media: left.slice(0, take), ...(step.side ? { side: step.side } : {}) });
    left = left.slice(take);
  }
  return out;
}

/**
 * The blocks of a project page before Next is added.
 * `stills` are the image names in order; `hero` is the name used by the hero block.
 */
export function presetBlocks(project: Project, stills: string[], hero: string): Block[] {
  const description: Block[] = project.description ? [{ type: 'description' }] : [];
  const film: Block[] = project.film ? [{ type: 'film' }] : [];
  const rest = stills.filter((name) => name !== hero);

  switch (project.preset) {
    case 'film':
      // The film itself opens the page when there is one; otherwise its loop or still.
      return [...(project.film ? film : [{ type: 'hero' } as Block]), { type: 'opening' }, ...description, ...rows(rest, 'film'), { type: 'credits' }];
    case 'campaign':
      return [{ type: 'hero' }, { type: 'opening' }, ...description, ...film, ...rows(rest, 'campaign'), { type: 'credits' }];
    case 'editorial': {
      const all = rows(stills, 'editorial');
      const half = Math.ceil(all.length / 2);
      return [{ type: 'opening' }, ...description, ...all.slice(0, half), ...film, ...all.slice(half), { type: 'credits' }];
    }
    case 'personal':
      return [{ type: 'opening' }, ...description, ...rows(stills, 'personal'), ...film, { type: 'credits' }];
  }
}
