/**
 * Home strip. One cover is "active" and opens to full size; the pointer,
 * the arrow keys, the wheel or keyboard focus move the active cover.
 * On small screens the strip is a plain column and this does nothing.
 */
const DESKTOP = '(min-width: 800px)';
const SETTLE_MS = 520;

export function initStrip(): void {
  const strip = document.querySelector<HTMLElement>('[data-strip]');
  if (!strip) return;

  const items = [...strip.querySelectorAll<HTMLElement>('.strip__item')];
  const counter = document.querySelector<HTMLElement>('[data-strip-count]');
  const desktop = window.matchMedia(DESKTOP);
  let active = Math.max(0, items.findIndex((item) => item.classList.contains('is-active')));
  let settling = false;
  let settleTimer: number | undefined;

  const activate = (index: number): void => {
    const next = Math.min(items.length - 1, Math.max(0, index));
    if (next === active) return;
    items[active]?.classList.remove('is-active');
    items[next]?.classList.add('is-active');
    active = next;
    if (counter) counter.textContent = String(next + 1).padStart(2, '0');

    // While the covers resize they slide under the pointer; ignore hover until they settle.
    settling = true;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => (settling = false), SETTLE_MS);
  };

  items.forEach((item, index) => {
    item.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'mouse' && desktop.matches && !settling) activate(index);
    });
    item.querySelector('a')?.addEventListener('focus', () => activate(index));
  });

  document.addEventListener('keydown', (event) => {
    if (!desktop.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const target = Math.min(items.length - 1, Math.max(0, active + step));
    items[target]?.querySelector('a')?.focus({ preventScroll: true });
  });

  // The home page does not scroll on large screens, so the wheel steps through the strip.
  let travelled = 0;
  let lastStep = 0;
  window.addEventListener(
    'wheel',
    (event) => {
      if (!desktop.matches) return;
      event.preventDefault();
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      travelled += delta;
      const now = performance.now();
      if (Math.abs(travelled) < 50 || now - lastStep < 260) return;
      activate(active + Math.sign(travelled));
      travelled = 0;
      lastStep = now;
    },
    { passive: false },
  );
}
