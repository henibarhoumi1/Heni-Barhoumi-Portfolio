/** Shared answers to "may this move?" and "may this load a video?". */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersStill = (): boolean => reduced.matches;

/** Data saver on, or a slow connection: skip clips, keep stills. */
export function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? '');
}

export const canHover = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
