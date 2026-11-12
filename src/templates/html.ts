import type { Frame } from '../../build/images.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for use in HTML content or attribute values. */
export const esc = (value: string | number): string => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c] as string);

/** 3 -> "03" */
export const pad = (n: number, length = 2): string => String(n).padStart(length, '0');

interface PictureOptions {
  alt: string;
  /** The `sizes` attribute: how wide the image is shown at each breakpoint. */
  sizes: string;
  /** Load immediately and with priority. Use for the first image on a page only. */
  eager?: boolean;
  className?: string;
}

const srcset = (variants: Frame['avif']): string => variants.map((v) => `${v.url} ${v.width}w`).join(', ');

/** Responsive <picture>: AVIF, then WebP, then a JPEG fallback. */
export function picture(frame: Frame, { alt, sizes, eager = false, className }: PictureOptions): string {
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture${className ? ` class="${className}"` : ''}>
<source type="image/avif" srcset="${srcset(frame.avif)}" sizes="${esc(sizes)}">
<source type="image/webp" srcset="${srcset(frame.webp)}" sizes="${esc(sizes)}">
<img src="${frame.jpg.url}" width="${frame.width}" height="${frame.height}" alt="${esc(alt)}" ${loading} decoding="async">
</picture>`;
}
