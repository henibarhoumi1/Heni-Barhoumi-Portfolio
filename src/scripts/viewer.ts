import { watchImage } from './images.ts';

/**
 * The viewer. Any image link marked data-viewer-open opens its picture full
 * screen in the page's <dialog>, in the project's room. Arrows and the two
 * halves of the screen step through; on touch screens, swipe. Pinching zooms
 * the page as usual and is never mistaken for a swipe. Neighbouring images
 * are fetched ahead. Closing returns focus to the image that opened it.
 * Without scripts the link simply opens the image file.
 */
export function initViewer(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-viewer]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-viewer-open]')];
  if (!dialog || links.length === 0 || typeof dialog.showModal !== 'function') return;

  const stage = dialog.querySelector<HTMLElement>('[data-viewer-stage]');
  const caption = dialog.querySelector<HTMLElement>('[data-viewer-caption]');
  const strip = dialog.querySelector<HTMLElement>('[data-viewer-strip]');
  const preload = dialog.querySelector<HTMLElement>('[data-viewer-preload]');
  if (!stage) return;
  if (links.length === 1) dialog.dataset.single = '';

  /** A copy of a link's picture, sized for the viewer and never wider than its file carries. */
  const copyOf = (link: HTMLAnchorElement, sizes: string): HTMLPictureElement | null => {
    const source = link.querySelector('picture');
    if (!source) return null;
    const picture = source.cloneNode(true) as HTMLPictureElement;
    picture.querySelectorAll('source').forEach((s) => (s.sizes = sizes));
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.removeAttribute('fetchpriority');
      img.classList.remove('is-loaded');
      img.alt = link.querySelector('img')?.alt ?? '';
      if (link.dataset.max) img.style.maxWidth = `min(100%, ${link.dataset.max}px)`;
    }
    return picture;
  };

  // The strip of small images at the foot (large screens only; CSS hides it elsewhere).
  const thumbs: HTMLButtonElement[] = [];
  let stripBuilt = false;
  const buildStrip = (): void => {
    if (stripBuilt || !strip || links.length < 2) return;
    stripBuilt = true;
    links.forEach((link, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show image ${i + 1}`);
      const picture = copyOf(link, '80px');
      if (picture) {
        picture.querySelector('img')?.style.removeProperty('max-width');
        button.append(picture);
        const img = picture.querySelector('img');
        if (img) watchImage(img);
      }
      button.addEventListener('click', () => show(i));
      strip.append(button);
      thumbs.push(button);
    });
  };

  let current = 0;

  const show = (index: number): void => {
    current = (index + links.length) % links.length;
    const link = links[current] as HTMLAnchorElement;
    const picture = copyOf(link, '100vw');
    if (!picture) return;
    const img = picture.querySelector('img');
    if (img) watchImage(img);
    stage.replaceChildren(picture);
    if (caption) caption.textContent = link.dataset.caption ?? '';
    thumbs.forEach((t, i) => t.setAttribute('aria-current', String(i === current)));
    thumbs[current]?.scrollIntoView({ block: 'nearest', inline: 'center' });

    // Fetch the neighbours now so stepping to them is instant.
    if (preload && links.length > 1) {
      const around = [links[(current + 1) % links.length], links[(current - 1 + links.length) % links.length]];
      preload.replaceChildren(...around.flatMap((n) => (n ? [copyOf(n, '100vw')].filter((p) => p !== null) : [])));
    }
  };

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      buildStrip();
      show(index);
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-viewer-close]')?.focus();
    });
  });

  dialog.querySelector('[data-viewer-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-viewer-prev]')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-viewer-next]')?.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current - 1);
    }
  });

  // Swipe with one finger. Two fingers, or a page already zoomed in, belong to pinch-zoom.
  let startX = 0;
  let startY = 0;
  let tracking = false;
  dialog.addEventListener(
    'touchstart',
    (event) => {
      const zoomed = (window.visualViewport?.scale ?? 1) > 1.01;
      tracking = event.touches.length === 1 && !zoomed;
      startX = event.touches[0]?.clientX ?? 0;
      startY = event.touches[0]?.clientY ?? 0;
    },
    { passive: true },
  );
  dialog.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) tracking = false;
  }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (!tracking) return;
    tracking = false;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => {
    stage.replaceChildren();
    preload?.replaceChildren();
    links[current]?.focus({ preventScroll: true });
  });
}
