import type { Site } from './types.ts';

export const site: Site = {
  name: 'Heni Barhoumi',
  role: 'Creative Director',
  location: 'Tunis, Tunisia',
  timeZone: 'Africa/Tunis',
  url: process.env.SITE_URL ?? 'https://henibarhoumi.com',
  description: 'Heni Barhoumi is a creative director and filmmaker based in Tunis, working across direction, film, production and photography.',
  intro:
    'Heni Barhoumi is a creative director and filmmaker based in Tunis. He works across direction, film, production and photography, from the first idea to the finished image.',
  contact: {
    // email: 'hello@henibarhoumi.com',
    instagram: { handle: '@henibarhoumi_', href: 'https://www.instagram.com/henibarhoumi_/' },
    invite: 'For commissions and collaborations with brands, directors, producers and photographers.',
  },
  about: {
    paragraphs: [
      'I started with the hands-on side of making images: shooting, operating cameras, editing. Over time the work grew past execution.',
      'Now I care as much about what comes before the image: the idea, the direction, the production, and the reason the work exists. I work between the two, close to the thinking and close to the set.',
    ],
    now: [
      'Building GECKO, an independent creative house for direction, production, film and photography.',
      'Looking toward film campaigns, brand stories, and sports and lifestyle work.',
    ],
    fields: ['Creative Direction', 'Creative Development', 'Filmmaking', 'Cinematography', 'Editing', 'Production', 'Photography'],
    method: [
      { title: 'The objective', text: 'What the project, the brand or the audience actually needs.' },
      { title: 'The idea', text: 'The concept, angle or story that makes the work worth watching.' },
      { title: 'The execution', text: 'Turning the idea into something real and well produced.' },
    ],
  },
};
