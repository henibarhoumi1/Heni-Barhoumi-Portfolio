import type { Project } from './types.ts';

const ig = (handle: string) => ({ name: `@${handle}`, href: `https://www.instagram.com/${handle}/` });

/**
 * Every project, in the order of the running order on Work. Projects without
 * a `spread` appear only in Everything, which lists all work, newest first.
 *
 * Images and clips come from photos/<slug>/, sorted by file name.
 * These seven portrait series are placeholders until new work arrives.
 */
export const projects: Project[] = [
  {
    slug: 'the-sea-is-a-vast-graveyard',
    title: 'The Sea Is a Vast Graveyard',
    year: 2024,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    credits: [
      { role: 'Model', ...ig('woujouud') },
      { role: 'Makeup and styling', ...ig('yasmine_basty420') },
    ],
    spread: 'full',
    room: '#0b2a2f',
    preset: 'editorial',
    blocks: [
      { type: 'opening' },
      { type: 'sequence', layout: 'offset', media: ['01'], side: 'left' },
      { type: 'sequence', layout: 'pair', media: ['02', '03'] },
      { type: 'pull', text: 'The sea is a vast graveyard, where the mysteries of life and death merge into one.' },
      { type: 'sequence', layout: 'full', media: ['06'] },
      { type: 'sequence', layout: 'pair', media: ['04', '05'] },
      { type: 'credits' },
    ],
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
    spread: 'offset',
    room: 'bright',
    preset: 'editorial',
  },
  {
    slug: 'express-yourself',
    title: 'Express Yourself Through Art',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'El Mourouj, Tunis',
    credits: [{ role: 'Model', ...ig('laballade_desgensheureux') }],
    spread: 'small',
    room: '#33121b',
    preset: 'campaign',
  },
  {
    slug: 'women-who-wear-black',
    title: 'Women Who Wear Black',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    credits: [{ role: 'Model', ...ig('wojoud222') }],
    spread: 'pair',
    room: '#13200f',
    preset: 'campaign',
    image: { trim: true },
  },
  {
    slug: 'dark-fantasy',
    title: 'Dark Fantasy',
    year: 2023,
    type: 'Portrait series',
    role: 'Photography',
    place: 'La Marsa, Tunis',
    credits: [],
    spread: 'pair',
    room: '#06141a',
    preset: 'personal',
    blocks: [
      { type: 'opening' },
      { type: 'sequence', layout: 'strip', media: ['01', '02', '03', '04'] },
      { type: 'credits' },
    ],
  },
  {
    slug: 'que-da-maneira',
    title: 'Que da maneira',
    year: 2022,
    type: 'Portrait series',
    role: 'Photography',
    place: 'El Menzah, Tunis',
    credits: [],
    spread: 'offset',
    room: '#22260a',
    preset: 'editorial',
  },
  {
    slug: 'shining-through',
    title: 'Shining Through',
    year: 2022,
    type: 'Portrait series',
    role: 'Photography',
    place: 'Sidi Bou Said, Tunis',
    credits: [{ role: 'Model', ...ig('cher.1f') }],
    spread: 'small',
    room: '#031726',
    preset: 'personal',
    blocks: [
      { type: 'opening' },
      { type: 'sequence', layout: 'offset', media: ['01'], side: 'right' },
      { type: 'sequence', layout: 'pair', media: ['02', '03'] },
      { type: 'credits' },
    ],
  },
];
