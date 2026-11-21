/**
 * Full films: the project's own poster until Play is pressed, then Vimeo's
 * player in its place, with sound and its own controls. Nothing plays by itself.
 */
export function initFilms(): void {
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((film) => {
    const play = film.querySelector<HTMLButtonElement>('[data-film-play]');
    const frame = film.querySelector<HTMLElement>('[data-film-frame]');
    if (!play || !frame) return;
    play.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = film.dataset.src ?? '';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = 'Film';
      frame.replaceChildren(iframe);
      play.remove();
      iframe.focus();
    });
  });
}
