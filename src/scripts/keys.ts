/**
 * On a project page, the left and right arrow keys go to the previous and
 * next project, unless something else on the page is using them.
 */
export function initKeys(): void {
  const prev = document.querySelector<HTMLAnchorElement>('[data-key-prev]');
  const next = document.querySelector<HTMLAnchorElement>('[data-key-next]');
  if (!prev || !next) return;

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (document.querySelector('dialog[open]') || document.fullscreenElement) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable], [data-strip], [data-film], iframe')) return;
    (event.key === 'ArrowLeft' ? prev : next).click();
  });
}
