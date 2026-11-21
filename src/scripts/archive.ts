/**
 * Archive: pointing at a tile, or moving to it with the keyboard, shows it
 * large in the pane with its caption, and names it in the bottom bar.
 */
export function initArchive(): void {
  const root = document.querySelector<HTMLElement>('[data-archive]');
  if (!root) return;
  const img = root.querySelector<HTMLImageElement>('[data-pane-img]');
  const frame = root.querySelector<HTMLElement>('[data-pane-frame]');
  const caption = root.querySelector<HTMLElement>('[data-pane-caption]');
  const bar = document.querySelector<HTMLElement>('[data-archive-caption]');
  let current: HTMLAnchorElement | null = null;

  const show = (tile: HTMLAnchorElement) => {
    if (tile === current) return;
    current?.classList.remove('is-chosen');
    current = tile;
    tile.classList.add('is-chosen');
    const text = tile.dataset.caption ?? '';
    if (caption) caption.textContent = text;
    if (bar) bar.textContent = text;
    if (img && frame) {
      const w = Number(tile.dataset.w);
      const h = Number(tile.dataset.h);
      frame.style.setProperty('--ar', String(w / h));
      frame.style.setProperty('--cap', `${tile.dataset.cap}px`);
      img.width = w;
      img.height = h;
      img.srcset = tile.dataset.preview ?? '';
      img.src = tile.querySelector('img')?.currentSrc || img.src;
    }
  };

  root.querySelectorAll<HTMLAnchorElement>('.tile').forEach((tile, i) => {
    if (i === 0) tile.classList.add('is-chosen');
    tile.addEventListener('pointerenter', () => show(tile));
    tile.addEventListener('focus', () => show(tile));
  });
  current = root.querySelector<HTMLAnchorElement>('.tile');
}
