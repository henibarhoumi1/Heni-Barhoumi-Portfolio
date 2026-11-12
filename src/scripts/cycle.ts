/**
 * Home sheet. While the pointer rests on a series, its image steps through
 * the other frames of that series. The extra frames load on first hover.
 */
const STEP_MS = 650;

export function initCycle(): void {
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll<HTMLElement>('[data-cycle]').forEach((media) => {
    const pictures = [...media.querySelectorAll('picture')];
    if (pictures.length < 2) return;

    const link = media.closest('a') ?? media;
    let timer: number | undefined;
    let current = 0;

    const show = (index: number): void => {
      pictures[current]?.classList.remove('is-current');
      current = index;
      pictures[current]?.classList.add('is-current');
    };

    const start = (): void => {
      if (!hover.matches || still.matches || timer !== undefined) return;
      pictures.forEach((picture) => picture.removeAttribute('hidden'));
      timer = window.setInterval(() => {
        const next = (current + 1) % pictures.length;
        const img = pictures[next]?.querySelector('img');
        // Wait for a frame that has not arrived yet rather than showing a blank.
        if (img && img.complete && img.naturalWidth > 0) show(next);
      }, STEP_MS);
    };

    const stop = (): void => {
      window.clearInterval(timer);
      timer = undefined;
      show(0);
    };

    link.addEventListener('pointerenter', start);
    link.addEventListener('pointerleave', stop);
  });
}
