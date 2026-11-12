/**
 * Frame viewer. Any link marked data-lightbox opens its picture full screen
 * in the page's <dialog>. Without JavaScript the link simply opens the image.
 */
export function initLightbox(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]')];
  if (!dialog || links.length === 0 || typeof dialog.showModal !== 'function') return;

  const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]');
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
  const count = dialog.querySelector<HTMLElement>('[data-lightbox-count]');
  if (!stage) return;

  let current = 0;
  const digits = String(links.length).length < 2 ? 2 : String(links.length).length;
  const pad = (n: number) => String(n).padStart(digits, '0');

  const show = (index: number): void => {
    current = (index + links.length) % links.length;
    const link = links[current] as HTMLAnchorElement;
    const source = link.querySelector('picture');
    if (!source) return;

    const picture = source.cloneNode(true) as HTMLPictureElement;
    picture.querySelectorAll('source').forEach((s) => (s.sizes = '100vw'));
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.removeAttribute('style');
    }
    stage.replaceChildren(picture);
    if (caption) caption.textContent = link.dataset.caption ?? '';
    if (count) count.textContent = `${pad(current + 1)} / ${pad(links.length)}`;
  };

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      show(index);
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  });

  // Swipe left or right on touch screens.
  let startX = 0;
  dialog.addEventListener('touchstart', (event) => (startX = event.touches[0]?.clientX ?? 0), { passive: true });
  dialog.addEventListener('touchend', (event) => {
    const dx = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => {
    stage.replaceChildren();
    links[current]?.focus({ preventScroll: true });
  });
}
