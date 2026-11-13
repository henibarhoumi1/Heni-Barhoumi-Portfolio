import type { Frame } from '../../build/images.ts';
import type { Media } from '../../build/projects.ts';
import type { BuildContext } from './types.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for use in HTML content or attribute values. */
export const esc = (value: string | number): string => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c] as string);

/**
 * Pixels of the file per CSS pixel on screen. An image is never shown wider
 * than its file's width divided by this, so it stays sharp on dense screens.
 * Raise it toward 2 for stricter sharpness once full-resolution files arrive.
 */
export const DENSITY = 1.5;

/** The widest an image may be shown, in CSS pixels. */
export const capOf = (frame: Frame): number => Math.round(frame.width / DENSITY);

/** True when the file is large enough to run edge to edge on a wide screen. */
export const canFill = (frame: Frame): boolean => frame.width >= 2400;

interface PictureOptions {
  alt: string;
  /** The `sizes` attribute: how wide the image is shown at each breakpoint. */
  sizes: string;
  /** Load immediately and with priority. Use for the first image on a page only. */
  eager?: boolean;
  className?: string;
  /** Leave out of the page until shown (the extra stills of previews). */
  hidden?: boolean;
}

const srcset = (variants: Frame['avif']): string => variants.map((v) => `${v.url} ${v.width}w`).join(', ');

/** Responsive <picture>: AVIF, then WebP, then a JPEG fallback, with its intrinsic size so nothing shifts. */
export function picture(frame: Frame, { alt, sizes, eager = false, className, hidden = false }: PictureOptions): string {
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture${className ? ` class="${className}"` : ''}${hidden ? ' hidden' : ''}>
<source type="image/avif" srcset="${srcset(frame.avif)}" sizes="${esc(sizes)}">
<source type="image/webp" srcset="${srcset(frame.webp)}" sizes="${esc(sizes)}">
<img src="${frame.jpg.url}" width="${frame.width}" height="${frame.height}" alt="${esc(alt)}" ${loading} decoding="async">
</picture>`;
}

/** The poster frame of a piece of media. */
export const posterOf = (media: Media): Frame => (media.kind === 'still' ? media.frame : media.poster);

/**
 * A still, or a muted loop over its poster. Loops never carry sound and only
 * play when on screen and when motion is welcome (scripts/clips.ts).
 */
export function mediaHtml(media: Media, options: PictureOptions): string {
  if (media.kind === 'still') return picture(media.frame, options);
  const poster = media.poster;
  return `${picture(poster, options)}
<video class="clip" muted loop playsinline preload="none" data-autoplay width="${poster.width}" height="${poster.height}" aria-hidden="true">
<source src="${media.clip.url}" type="${media.clip.type}">
</video>`;
}

/** The local time, kept current by scripts/clock.ts. */
export function localTime(ctx: BuildContext): string {
  return `<time data-clock data-time-zone="${esc(ctx.site.timeZone)}"></time>`;
}
