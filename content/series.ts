import type { Series } from './types.ts';

const ig = (handle: string) => ({ name: `@${handle}`, href: `https://www.instagram.com/${handle}/` });

/**
 * Portrait series, newest first. The order here is the order on the site.
 * Frames come from photos/<slug>/ and are sorted by filename.
 */
export const series: Series[] = [
  {
    slug: 'the-sea-is-a-vast-graveyard',
    title: 'The Sea Is a Vast Graveyard',
    date: 'July 2024',
    shot: '2024-07',
    place: 'La Marsa, Tunis',
    credits: [
      { role: 'Model', ...ig('woujouud') },
      { role: 'Makeup and styling', ...ig('yasmine_basty420') },
    ],
    kit: 'Sony A6300, Helios 44-4 58mm',
    note: 'The sea is a vast graveyard, where the mysteries of life and death merge into one.',
    image: { trim: true },
  },
  {
    slug: 'thinking-for-myself',
    title: 'I’m Just Thinking for Myself',
    date: 'September 2023',
    shot: '2023-09',
    place: 'Lafayette, Tunis',
    credits: [{ role: 'Model', ...ig('hamzaa_chiheeb') }],
  },
  {
    slug: 'express-yourself',
    title: 'Express Yourself Through Art',
    date: 'July 2023',
    shot: '2023-07',
    place: 'El Mourouj, Tunis',
    credits: [{ role: 'Model', ...ig('laballade_desgensheureux') }],
    note: 'Express yourself through art, it works.',
  },
  {
    slug: 'women-who-wear-black',
    title: 'Women Who Wear Black',
    date: 'March 2023',
    shot: '2023-03',
    place: 'La Marsa, Tunis',
    credits: [{ role: 'Model', ...ig('wojoud222') }],
    kit: 'Sony A6300, Sigma 30mm f/1.4',
    image: { trim: true },
  },
  {
    slug: 'dark-fantasy',
    title: 'Dark Fantasy',
    date: 'March 2023',
    shot: '2023-03',
    place: 'La Marsa, Tunis',
    credits: [],
    image: { upscale: 2 },
  },
  {
    slug: 'que-da-maneira',
    title: 'Que da maneira',
    date: 'November 2022',
    shot: '2022-11',
    place: 'El Menzah, Tunis',
    credits: [],
    kit: 'Sony A6300, Sigma 30mm f/1.4',
  },
  {
    slug: 'shining-through',
    title: 'Shining Through',
    date: 'August 2022',
    shot: '2022-08',
    place: 'Sidi Bou Said, Tunis',
    credits: [{ role: 'Model', ...ig('cher.1f') }],
    kit: 'Sony A6300, Sigma 30mm f/1.4',
  },
];
