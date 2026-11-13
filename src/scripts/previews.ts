import { canHover, prefersStill, saveData } from './motion.ts';

/**
 * Previews on Work. On a pointer, resting on a project plays its clip or
 * shows its second still; leaving puts the first still back. On a touch
 * screen, the project nearest the middle of the screen does the same once
 * scrolling settles. Only one project previews at a time, and nothing loads
 * until it is asked for.
 */
let active: HTMLElement | null = null;

function ready(el: HTMLElement): void {
  el.classList.add('is-ready');
}

function start(media: HTMLElement): void {
  if (active === media) return;
  if (active) stop(active);
  active = media;
  media.classList.add('is-previewing');

  const clip = media.querySelector<HTMLVideoElement>('.preview-clip');
  if (clip && !prefersStill() && !saveData()) {
    clip.preload = 'auto';
    const played = clip.play();
    played?.then(() => ready(clip)).catch(() => undefined);
    return;
  }
  const still = media.querySelector<HTMLElement>('.preview-still');
  if (!still) return;
  still.hidden = false;
  const img = still.querySelector('img');
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) ready(still);
  else img.addEventListener('load', () => media === active && ready(still), { once: true });
}

function stop(media: HTMLElement): void {
  media.classList.remove('is-previewing');
  const clip = media.querySelector<HTMLVideoElement>('.preview-clip');
  if (clip) {
    clip.classList.remove('is-ready');
    clip.pause();
    clip.currentTime = 0;
  }
  media.querySelector('.preview-still')?.classList.remove('is-ready');
  if (active === media) active = null;
}

export function initPreviews(): void {
  const all = [...document.querySelectorAll<HTMLElement>('[data-preview]')].filter(
    (m) => m.querySelector('.preview-still, .preview-clip'),
  );
  if (all.length === 0) return;

  if (canHover()) {
    for (const media of all) {
      const link = media.closest('a') ?? media;
      link.addEventListener('pointerenter', () => start(media));
      link.addEventListener('pointerleave', () => stop(media));
      link.addEventListener('focus', () => start(media));
      link.addEventListener('blur', () => stop(media));
    }
    return;
  }

  // Touch: when scrolling settles, preview the project nearest the middle of the screen.
  if (prefersStill()) return;
  let timer: number | undefined;
  const settle = (): void => {
    const middle = window.innerHeight / 2;
    let best: HTMLElement | null = null;
    let distance = Infinity;
    for (const media of all) {
      const r = media.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - middle);
      if (d < distance) {
        distance = d;
        best = media;
      }
    }
    if (best && distance < window.innerHeight * 0.25) start(best);
    else if (active) stop(active);
  };
  window.addEventListener(
    'scroll',
    () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 220);
    },
    { passive: true },
  );
}
