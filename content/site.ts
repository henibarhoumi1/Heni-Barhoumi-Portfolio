import type { Site } from './types.ts';

export const site: Site = {
  name: 'Heni Barhoumi',
  role: 'Creative direction, film and photography',
  location: 'Tunis, Tunisia',
  timeZone: 'Africa/Tunis',
  url: process.env.SITE_URL ?? 'https://henibarhoumi.com',
  description:
    'Heni Barhoumi works across creative direction, filmmaking and production in Tunis. Portrait series, 2022 to 2024.',
  contact: {
    // email: 'hello@henibarhoumi.com',
    instagram: { handle: '@henibarhoumi_', href: 'https://www.instagram.com/henibarhoumi_/' },
  },
  about: {
    statement: [
      'I started with the hands-on side of making images: shooting, operating cameras, editing.',
      'Now I care as much about what comes before the image. The idea, the direction, the production, and the reason the work exists.',
    ],
    practice: [
      'Creative development',
      'Creative direction',
      'Filmmaking and cinematography',
      'Editing and post-production',
      'Production',
      'Photography and portraits',
    ],
    method: [
      { title: 'The objective', text: 'What the project, the brand or the audience actually needs.' },
      { title: 'The idea', text: 'The concept, angle or story that makes the work worth watching.' },
      { title: 'The execution', text: 'Turning that idea into something real and well produced. I stay close to this part.' },
    ],
    now: {
      updated: 'November 2026',
      items: [
        'Building GECKO, an independent creative house for direction, production, film and photography.',
        'Commercial and e-commerce work, with a point of view.',
        'Looking toward film campaigns, brand stories, and sports and lifestyle work.',
      ],
    },
    collaborate:
      'Brands, directors, producers and photographers: if the idea, the production and the result all matter to you, write to me.',
  },
};
