/**
 * Strips scroll sideways by trackpad, touch, keyboard (when focused) and,
 * with a mouse, by dragging. A drag never counts as a click on an image.
 */
export function initStrips(): void {
  document.querySelectorAll<HTMLElement>('[data-strip]').forEach((strip) => {
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let pointer: number | null = null;

    strip.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointer = event.pointerId;
      startX = event.clientX;
      startScroll = strip.scrollLeft;
      moved = false;
    });

    strip.addEventListener('pointermove', (event) => {
      if (pointer !== event.pointerId) return;
      const dx = event.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        strip.classList.add('is-dragging');
        strip.setPointerCapture(event.pointerId);
      }
      if (moved) strip.scrollLeft = startScroll - dx;
    });

    const end = (event: PointerEvent): void => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
      window.setTimeout(() => strip.classList.remove('is-dragging'), 0);
    };
    strip.addEventListener('pointerup', end);
    strip.addEventListener('pointercancel', end);

    // Swallow the click that ends a drag.
    strip.addEventListener(
      'click',
      (event) => {
        if (moved) {
          event.preventDefault();
          event.stopPropagation();
          moved = false;
        }
      },
      true,
    );
  });
}
