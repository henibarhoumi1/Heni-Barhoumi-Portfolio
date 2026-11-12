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
    email: 'contact@henibarhoumi.com',
    whatsapp: '+216 26 191 555',
    instagram: { handle: '@henibarhoumi_', href: 'https://www.instagram.com/henibarhoumi_/' },
    invite: 'For commissions and collaborations with brands, directors, producers and photographers.',
  },
  about: {
    paragraphs: [
      'I’m Heni. I started out behind the camera, shooting and editing, learning how an image actually gets made.',
      'These days I spend as much time on what comes before it. What is this for? What should it feel like? Who needs to be in the room? I like having an idea and then being there to see it through.',
      'I live in Tunis. Lately I’m drawn to film campaigns, brand stories, and work around sport and the way people live. I work best with people who care about the idea, how it gets made, and how it turns out.',
    ],
    fields: ['Creative Direction', 'Creative Development', 'Filmmaking', 'Cinematography', 'Editing', 'Production', 'Photography'],
  },
};
