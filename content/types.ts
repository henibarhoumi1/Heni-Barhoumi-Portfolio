/**
 * Shapes of the content files. Edit content in site.ts and projects.ts.
 *
 * Media is referenced by file name, without extension, from the project's
 * folder: photos/<slug>/03.jpg is '03', photos/<slug>/preview.mp4 is
 * 'preview.mp4' (videos keep their extension).
 */

export interface Credit {
  /** What the person did, e.g. "Model". */
  role: string;
  /** Display name. Use the Instagram handle if there is no name. */
  name: string;
  /** Optional link. */
  href?: string;
}

/** How a project sits in the running order on Work. */
export type Spread =
  /** Edge to edge. For the lead project and for film. */
  | 'full'
  /** Image across about seven of twelve columns, the title set large beside it. */
  | 'offset'
  /** A modest image in a lot of white, balanced by a very large title. */
  | 'small'
  /** Two projects share a row. Put two 'pair' projects next to each other. */
  | 'pair';

/** Starting order of blocks for a project page. See build/presets.ts. */
export type Preset = 'film' | 'editorial' | 'campaign' | 'personal';

/** How a row of images is laid out inside a project page. */
export type SequenceLayout =
  /** One image, edge to edge when the file is large enough, otherwise centred at its sharp size. */
  | 'full'
  /** Two images side by side. */
  | 'pair'
  /** Three images in a row. */
  | 'trio'
  /** One image pushed to one side of the page. */
  | 'offset'
  /** Any number of images in a row that scrolls sideways. */
  | 'strip';

export type Block =
  /** Title and facts. Always present; placed first unless listed. */
  | { type: 'opening' }
  /** The hero: the hero film loop or still (see Project.hero). */
  | { type: 'hero' }
  /** Project.description as reading text. */
  | { type: 'description' }
  /** One row of images and clips. */
  | { type: 'sequence'; layout: SequenceLayout; media: string[]; side?: 'left' | 'right' }
  /** A full film from Vimeo, behind its own poster and controls. Defaults to Project.film. */
  | { type: 'film'; vimeo?: string; poster?: string; caption?: string }
  /** One line set large in the editorial voice. Use words that already exist; never invent a quote. */
  | { type: 'pull'; text: string }
  /** Heni's role and the collaborators. */
  | { type: 'credits' };

export interface Project {
  /** URL segment and folder name under photos/. */
  slug: string;
  title: string;
  year: number;
  /** What the work is, e.g. "Portrait series", "Brand film". */
  type: string;
  /** Heni's role on the project, e.g. "Direction", "Photography". */
  role: string;
  client?: string;
  place?: string;
  /** A short paragraph, 80 words at most. Left out when empty. */
  description?: string;
  credits: Credit[];

  /** Place in the curated running order on Work. Leave out to list the project in Everything only. */
  spread?: Spread;
  /** Which side the image takes in 'offset' and 'small' spreads. Alternates when left out. */
  side?: 'left' | 'right';

  /** The still that represents the project on Work, in Everything and when sharing. Defaults to the first image. */
  cover?: string;
  /** What the project shows on hover (desktop) or when centred on screen (phones). */
  preview?: {
    /** A second still. Defaults to the second image. */
    still?: string;
    /** A short muted loop in the project folder, about six seconds and under 1.5 MB, e.g. 'preview.mp4'. */
    video?: string;
  };
  /** The hero on the project page. */
  hero?: {
    /** A still. Defaults to the cover. */
    still?: string;
    /** A muted loop shown in place of the still, e.g. 'hero.mp4'. The still is its poster. */
    video?: string;
  };
  /** The full film, played from Vimeo behind the project's own poster. */
  film?: {
    /** A vimeo.com or player.vimeo.com address. Unlisted links keep their hash. */
    vimeo: string;
    /** Poster still. Defaults to the hero still. */
    poster?: string;
    /** Width / height of the film. Default 16 / 9. */
    ratio?: number;
  };

  /**
   * The project's room. 'bright' is white with black type. 'dark' turns the
   * page black with white type as you enter, like the house lights going down.
   * The site uses no other colours.
   */
  room: 'bright' | 'dark';

  /** Starting order of blocks. Ignored when `blocks` is given. */
  preset: Preset;
  /** The page, block by block, in place of the preset. Opening and Next are added when missing. */
  blocks?: Block[];

  /** Image processing for this project's folder. */
  image?: {
    /** Crop solid black bars off the edges. */
    trim?: boolean;
  };
}

export interface Site {
  name: string;
  /** Used in the page title and search results. */
  role: string;
  location: string;
  /** IANA time zone for the local time. */
  timeZone: string;
  /** Production URL, no trailing slash. */
  url: string;
  /** Search and share description. */
  description: string;
  contact: {
    email?: string;
    /** Phone number with country code, written as it should be read: '+216 26 191 555'. */
    whatsapp?: string;
    instagram: { handle: string; href: string };
    /** One sentence on who should write, shown on the Contact page. */
    invite: string;
  };
  about: {
    /** First person, plain, no titles and no project names. The first sentence is set large. */
    paragraphs: string[];
  };
}
