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
    year: 2024,
    place: 'La Marsa, Tunis',
    credits: [
      { role: 'Model', ...ig('woujouud') },
      { role: 'Makeup and styling', ...ig('yasmine_basty420') },
    ],
    note: 'The sea is a vast graveyard, where the mysteries of life and death merge into one.',
    image: { trim: true },
  },
  {
    slug: 'thinking-for-myself',
    title: 'I’m Just Thinking for Myself',
    year: 2023,
    place: 'Lafayette, Tunis',
    credits: [{ role: 'Model', ...ig('hamzaa_chiheeb') }],
  },
  {
    slug: 'express-yourself',
    title: 'Express Yourself Through Art',
    year: 2023,
    place: 'El Mourouj, Tunis',
    credits: [{ role: 'Model', ...ig('laballade_desgensheureux') }],
  },
  {
    slug: 'women-who-wear-black',
    title: 'Women Who Wear Black',
    year: 2023,
    place: 'La Marsa, Tunis',
    credits: [{ role: 'Model', ...ig('wojoud222') }],
    image: { trim: true },
  },
  {
    slug: 'dark-fantasy',
    title: 'Dark Fantasy',
    year: 2023,
    place: 'La Marsa, Tunis',
    credits: [],
  },
  {
    slug: 'que-da-maneira',
    title: 'Que da maneira',
    year: 2022,
    place: 'El Menzah, Tunis',
    credits: [],
  },
  {
    slug: 'shining-through',
    title: 'Shining Through',
    year: 2022,
    place: 'Sidi Bou Said, Tunis',
    credits: [{ role: 'Model', ...ig('cher.1f') }],
  },
];
