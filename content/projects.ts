import type { Project } from './types.ts';

const ig = (handle: string) => ({ name: `@${handle}`, href: `https://www.instagram.com/${handle}/` });

/**
 * Every project. Selected projects run on the Work strip in this order and
 * are numbered (01), (02)… in it; the rest follow in the Archive only.
 *
 * Images and clips come from photos/<slug>/, sorted by file name.
 */
export const projects: Project[] = [
  {
    slug: 'the-sea-is-a-vast-graveyard',
    title: 'The Sea Is a Vast Graveyard',
    year: 2024,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    description: 'The sea is a vast graveyard, where the mysteries of life and death merge into one.',
    credits: [
      { role: 'Model', ...ig('woujouud') },
      { role: 'Makeup and styling', ...ig('yasmine_basty420') },
    ],
    selected: true,
    spreads: [
      { kind: 'opening', large: '07', small: '01' },
      { kind: 'pair', media: ['02', '03'] },
      { kind: 'single', media: '06', side: 'left' },
      { kind: 'small-large', small: '05', large: '08' },
      { kind: 'single', media: '04', side: 'right' },
    ],
    image: { trim: true },
  },
  {
    slug: 'women-who-wear-black',
    title: 'Women Who Wear Black',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    credits: [{ role: 'Model', ...ig('wojoud222') }],
    selected: true,
    image: { trim: true },
  },
  {
    slug: 'thinking-for-myself',
    title: 'I’m Just Thinking for Myself',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'Lafayette, Tunis',
    credits: [{ role: 'Model', ...ig('hamzaa_chiheeb') }],
    selected: true,
  },
  {
    slug: 'shining-through',
    title: 'Shining Through',
    year: 2022,
    type: 'Portrait series',
    role: 'Photography',
    place: 'Sidi Bou Said, Tunis',
    credits: [{ role: 'Model', ...ig('cher.1f') }],
    selected: true,
  },
  {
    slug: 'express-yourself',
    title: 'Express Yourself Through Art',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'El Mourouj, Tunis',
    credits: [{ role: 'Model', ...ig('laballade_desgensheureux') }],
    selected: true,
  },

  // Archive only.
  {
    slug: 'dark-fantasy',
    title: 'Dark Fantasy',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    credits: [],
    selected: false,
  },
  {
    slug: 'que-da-maneira',
    title: 'Que da maneira',
    year: 2022,
    type: 'Portrait series',
    role: 'Photography',
    place: 'El Menzah, Tunis',
    credits: [],
    selected: false,
  },
];
