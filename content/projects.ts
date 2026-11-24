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
    alt: {
      '01': 'A woman in a white lace slip sits in the sea at dusk, a flare of light across her eyes.',
      '02': 'A woman with wet hair and smudged blue eye makeup leans against a pale wall, the beach behind her.',
      '03': 'Close portrait of the same woman against the pale wall, head tilted, a lace choker at her neck.',
      '04': 'Black and white: the lace slip in close-up, her hand holding its hem, bracelets on her wrist.',
      '05': 'Black and white diptych: her eyes under wet hair above, her body folded forward in the lace slip below.',
      '06': 'The woman in the lace slip half in the sea, one hand on her hip, looking into the camera.',
      '07': 'She walks barefoot along the shoreline at sunset, the coast and swimmers behind her.',
      '08': 'Black and white portrait at night: wet hair across her face, lace straps on her shoulders.',
    },
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
    alt: {
      '01': 'A woman in a black suit stands beside a tree in a sunlit garden, looking away.',
      '02': 'The woman in the black suit in front of a white and blue house, full length.',
      '03': 'Diptych: an ear with a jewelled ear cuff, and the woman looking down, her black jacket open.',
      '04': 'The woman in the black suit stands far off under the trees of a park.',
    },
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
    alt: {
      '01': 'A young man in a pale T-shirt stands in a doorway of iron lattice, looking into the camera.',
      '02': 'Black and white: the young man rests his head on his fist, sunglasses pushed into his hair.',
      '03': 'Black and white: the young man in sunglasses, mouth slightly open, in front of a lattice door.',
      '04': 'Black and white: he steps through an iron doorway, one arm raised against the frame.',
      '05': 'He leans out between two lattice doors wearing sunglasses.',
      '06': 'Black and white: he sits against a white wall, arms folded, dappled light on his T-shirt.',
      '07': 'Black and white close portrait, patterned sunlight across his face.',
      '08': 'He stands in a tiled hallway by an iron door, looking down at his phone.',
    },
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
    alt: {
      '01': 'At night, a man in sunglasses and a denim jacket, his face lit white by a flash.',
      '02': 'At night by the sea, a hand rests on the cheek of a man with a shaved head, seen from behind.',
      '03': 'At night, the back of a man’s shaved head lit by flash, a hand on his shoulder.',
    },
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
    alt: {
      '01': 'A shirtless young man in sunglasses and pink trousers twists his arms across his body against a white wall.',
      '02': 'In profile, the shirtless young man stands in front of a flowering oleander bush.',
      '03': 'The young man in pink trousers bends forward, looking back through his legs on a tiled pavement.',
    },
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
    alt: {
      '01': 'At night on a beach, a woman in sunglasses lit by a torch, a man in shadow, a white domed building behind.',
      '02': 'A blurred face in sunglasses emerging from the dark.',
      '03': 'At night on the beach, a group dressed in black stands in front of the white domed building.',
      '04': 'At night, a figure with pale hair turns away, the building tilted behind.',
    },
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
    alt: {
      '01': 'A young man with locs in a yellow Brazil football shirt leans against a wall, head bowed.',
      '02': 'Full length, the young man in the yellow shirt and black trousers leans against a painted wall.',
      '03': 'The young man in the yellow shirt half hidden under the branches of a pine tree.',
      '04': 'The young man stands under a pine tree in a garden, his face hidden by the branches.',
    },
  },
];
