/**
 * Shapes of the content files. Edit content in site.ts and projects.ts.
 *
 * Media is referenced by file name, without extension, from the project's
 * folder: photos/<slug>/03.jpg is '03', photos/<slug>/loop.mp4 is
 * 'loop.mp4' (videos keep their extension).
 */

export interface Credit {
  /** What the person did, e.g. "Model". */
  role: string;
  /** Display name. Use the Instagram handle if there is no name. */
  name: string;
  /** Optional link. */
  href?: string;
}

/**
 * One spread of a project page: a white page the height of the screen on a
 * four-column grid. Pages are made of spreads automatically; list them on
 * the project only to take over.
 */
export type Spread =
  /** A large image on the right half, a small one floating in the second column, the caption and description on the left. Always first. */
  | { kind: 'opening'; large: string; small?: string }
  /** Two images, one on each half, sitting on the same baseline. */
  | { kind: 'pair'; media: [string, string] }
  /** One large image on one half; the other half stays white. */
  | { kind: 'single'; media: string; side?: 'left' | 'right' }
  /** A small image in the second column beside a large one on the right half. */
  | { kind: 'small-large'; small: string; large: string }
  /** A full film from Vimeo behind its poster. Defaults to Project.film. */
  | { kind: 'film' };

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
  /** A few lines in Heni's or the project's own words. Never invented. Left out when empty. */
  description?: string;
  credits: Credit[];

  /**
   * 'series' (default): a personal photographic series, shown as spreads.
   * 'case': commercial or film work, shown as a case study with the sections
   * below. Every section is optional and appears only when filled.
   */
  kind?: 'series' | 'case';
  /**
   * Heni's exact roles when there is more than one, e.g. ['Director of photography', 'Editor'].
   * Use the words of the credit as agreed: never a bigger role than the one held.
   */
  roles?: string[];
  /** Case study: what the project was for and what was asked. */
  context?: string;
  /** Case study: the visual idea. */
  direction?: string;
  /** Case study: how it was made. */
  execution?: string;
  /** Case study: what Heni himself did on it. */
  contribution?: string;

  /**
   * False keeps the project out of the published site entirely (no page, no
   * sitemap, no listing) until its assets, permissions and credits are final.
   * Default true.
   */
  published?: boolean;

  /** A plain description of each image for people who cannot see it, by file name. */
  alt?: Record<string, string>;

  /**
   * On the Work strip, in the order of this file. Leave false to show the
   * project in the Archive only; its page still exists.
   */
  selected: boolean;

  /** The still that represents the project in the Archive, on Contact and when sharing. Defaults to the first image. */
  cover?: string;
  /** Images on the Work strip, in order. Defaults to every image. */
  strip?: string[];
  /** The project page, spread by spread, in place of the automatic layout. */
  spreads?: Spread[];

  /** The full film, played from Vimeo behind its own poster. */
  film?: {
    /** A vimeo.com or player.vimeo.com address. Unlisted links keep their hash. */
    vimeo: string;
    /** Poster still. Defaults to the cover. */
    poster?: string;
    /** Width / height of the film. Default 16 / 9. */
    ratio?: number;
  };

  /** Image processing for this project's folder. */
  image?: {
    /** Crop solid black bars off the edges. */
    trim?: boolean;
  };
}

export interface Site {
  name: string;
  /** Used in the page title, the header and search results. */
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
    /** Heading of the Contact page. */
    action: string;
    /** One sentence on the work Heni takes on, shown on the Contact page. */
    invite: string;
  };
  about: {
    /** First person, in Heni's own words. */
    paragraphs: string[];
    /**
     * Selected experience, newest first. Only entries Heni confirms, with the
     * exact role. The list is not shown while it is empty.
     */
    experience: { year: string; what: string; role: string; href?: string }[];
  };
  /** Other places Heni's work lives, e.g. a production company. Not shown while empty. */
  elsewhere: { label: string; href: string; note?: string }[];
}
