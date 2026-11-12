/** Marks images as loaded so the stylesheet can fade them in. */
export function watchImage(img: HTMLImageElement): void {
  const done = () => img.classList.add('is-loaded');
  if (img.complete && img.naturalWidth > 0) done();
  else {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
}

export function initImages(): void {
  document.querySelectorAll('img').forEach(watchImage);
}
