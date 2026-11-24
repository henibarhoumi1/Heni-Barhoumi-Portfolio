/**
 * Archive. On large screens with a pointer, pointing at an image (or moving
 * to it with the keyboard) shows it in the pane on the right, and choosing it
 * opens its project. On smaller or touch screens, choosing an image opens it
 * large on its own: swipe, the arrow keys or the buttons move between images,
 * and "Open project" goes to its project.
 */
export function initArchive(): void {
  const root = document.querySelector<HTMLElement>('[data-archive]');
  if (!root) return;
  const tiles = [...root.querySelectorAll<HTMLAnchorElement>('.tile')];
  if (tiles.length === 0) return;

  // The pane.
  const img = root.querySelector<HTMLImageElement>('[data-pane-img]');
  const frame = root.querySelector<HTMLElement>('[data-pane-frame]');
  const title = root.querySelector<HTMLElement>('[data-pane-title]');
  const caption = root.querySelector<HTMLElement>('[data-pane-caption]');
  let current: HTMLAnchorElement | null = tiles[0] ?? null;
  current?.classList.add('is-chosen');

  const show = (tile: HTMLAnchorElement) => {
    if (tile === current) return;
    current?.classList.remove('is-chosen');
    current = tile;
    tile.classList.add('is-chosen');
    if (title) title.textContent = tile.dataset.title ?? '';
    if (caption) caption.textContent = tile.dataset.caption ?? '';
    if (img && frame) {
      const w = Number(tile.dataset.w);
      const h = Number(tile.dataset.h);
      frame.style.setProperty('--ar', String(w / h));
      frame.style.setProperty('--cap', `${tile.dataset.cap}px`);
      img.width = w;
      img.height = h;
      img.srcset = tile.dataset.preview ?? '';
      img.src = tile.dataset.src ?? img.src;
    }
  };
  for (const tile of tiles) {
    tile.addEventListener('pointerenter', () => show(tile));
    tile.addEventListener('focus', () => show(tile));
  }

  // The viewer.
  const viewer = root.querySelector<HTMLDialogElement>('[data-viewer]');
  if (!viewer || typeof viewer.showModal !== 'function') return;
  const vImg = viewer.querySelector<HTMLImageElement>('[data-viewer-img]') as HTMLImageElement;
  const vTitle = viewer.querySelector<HTMLElement>('[data-viewer-title]') as HTMLElement;
  const vCaption = viewer.querySelector<HTMLElement>('[data-viewer-caption]') as HTMLElement;
  const vOpen = viewer.querySelector<HTMLAnchorElement>('[data-viewer-open]') as HTMLAnchorElement;
  let at = 0;

  const large = window.matchMedia('(min-width: 1100px) and (hover: hover)');
  const load = (i: number) => {
    at = (i + tiles.length) % tiles.length;
    const tile = tiles[at] as HTMLAnchorElement;
    vImg.removeAttribute('srcset');
    vImg.src = tile.dataset.src ?? '';
    vImg.srcset = tile.dataset.preview ?? '';
    vImg.sizes = '92vw';
    vImg.width = Number(tile.dataset.w);
    vImg.height = Number(tile.dataset.h);
    vImg.alt = tile.dataset.alt ?? '';
    vTitle.textContent = tile.dataset.title ?? '';
    vCaption.textContent = tile.dataset.caption ?? '';
    vOpen.href = tile.getAttribute('href') ?? '/';
  };

  tiles.forEach((tile, i) => {
    tile.addEventListener('click', (e) => {
      if (large.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      load(i);
      viewer.showModal();
    });
  });

  viewer.querySelector('[data-viewer-prev]')?.addEventListener('click', () => load(at - 1));
  viewer.querySelector('[data-viewer-next]')?.addEventListener('click', () => load(at + 1));
  viewer.querySelector('[data-viewer-close]')?.addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') load(at + 1);
    else if (e.key === 'ArrowLeft') load(at - 1);
  });
  // A tap on the white around the image closes it.
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) viewer.close();
  });

  let startX = 0;
  let startY = 0;
  viewer.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  viewer.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - startY)) load(dx < 0 ? at + 1 : at - 1);
  });
}
