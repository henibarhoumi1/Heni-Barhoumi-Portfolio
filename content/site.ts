import type { Site } from './types.ts';

export const site: Site = {
  name: 'Heni Barhoumi',
  role: 'Creative Director & Filmmaker',
  location: 'Tunis, Tunisia',
  timeZone: 'Africa/Tunis',
  url: process.env.SITE_URL ?? 'https://henibarhoumi.com',
  description: 'Heni Barhoumi is a creative director and filmmaker based in Tunis, Tunisia, working across film, photography and creative direction.',
  contact: {
    email: 'contact@henibarhoumi.com',
    whatsapp: '+216 26 191 555',
    instagram: { handle: '@henibarhoumi_', href: 'https://www.instagram.com/henibarhoumi_/' },
    action: 'Discuss a project',
    invite: 'Campaigns, films, creative direction, photography commissions and production collaborations.',
  },
  about: {
    paragraphs: [
      'I’m Heni. I started out behind the camera, shooting and editing, learning how an image actually gets made.',
      'These days I spend as much time on what comes before it. What is this for? What should it feel like? Who needs to be in the room? I like having an idea and then being there to see it through.',
      'My work moves between filmmaking, photography and creative direction. I work with brands, agencies, directors, producers and independent creatives.',
      'I live in Tunis. Lately I’m drawn to film campaigns, brand stories, and work around sport and the way people live. I work best with people who care about the idea, how it gets made, and how it turns out.',
    ],
    // Only entries Heni confirms, each with its year and exact role.
    experience: [],
  },
  // e.g. { label: 'GECKO', href: 'https://…', note: 'Production company' } once Heni wants it shown.
  elsewhere: [],
};
