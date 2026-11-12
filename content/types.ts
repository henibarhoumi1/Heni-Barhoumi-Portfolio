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
  /** Free text, shown as written. e.g. "July 2024". */
  date: string;
  /** ISO year-month, used for sorting and metadata. */
  shot: string;
  place: string;
  credits: Credit[];
  /** Camera and lens, shown as written. */
  kit?: string;
  /** Optional line shown under the frames. */
  note?: string;
  /** Filename (without extension) of the frame used as the cover. Defaults to the first. */
  cover?: string;
  /** Image processing overrides for this series. */
  image?: {
    /** Crop solid black bars off the edges before processing. */
    trim?: boolean;
    /** Upper limit for upscaling small sources. 1 = never upscale. */
    upscale?: number;
  };
}

export interface Site {
  name: string;
  /** One line under the name. */
  role: string;
  location: string;
  /** IANA time zone for the clock in the footer. */
  timeZone: string;
  /** Production URL, no trailing slash. */
  url: string;
  description: string;
  contact: {
    email?: string;
    instagram: { handle: string; href: string };
  };
  about: {
    statement: string[];
    practice: string[];
    method: { title: string; text: string }[];
    now: { updated: string; items: string[] };
    collaborate: string;
  };
}
