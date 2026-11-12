/** Shapes of the content files. Edit content in site.ts and series.ts. */

export interface Credit {
  /** What the person did, e.g. "Model". */
  role: string;
  /** Display name. Use the Instagram handle if there is no name. */
  name: string;
  /** Optional link. */
  href?: string;
}

export interface Series {
  /** URL segment and folder name under photos/. */
  slug: string;
  title: string;
  year: number;
  place: string;
  credits: Credit[];
  /** Optional line shown under the frames. */
  note?: string;
  /** Filename (without extension) of the frame used as the cover. Defaults to the first. */
  cover?: string;
  /** Image processing overrides for this series. */
  image?: {
    /** Crop solid black bars off the edges before processing. */
    trim?: boolean;
    /** Upper limit for enlarging small sources. Default 1: never. */
    upscale?: number;
  };
}

export interface Site {
  name: string;
  /** Shown beside the name. */
  role: string;
  location: string;
  /** IANA time zone for the clock. */
  timeZone: string;
  /** Production URL, no trailing slash. */
  url: string;
  /** Search and share description. */
  description: string;
  /** The statement under the work on the home page. */
  intro: string;
  contact: {
    email?: string;
    instagram: { handle: string; href: string };
    /** Short invitation shown on the contact page. */
    invite: string;
  };
  about: {
    paragraphs: string[];
    now: string[];
    /** Set very large on the about page, with work between the words. */
    fields: string[];
    method: { title: string; text: string }[];
  };
}
