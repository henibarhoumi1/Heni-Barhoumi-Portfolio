/** (Back) goes back through history when you came from this site, otherwise to Work. */
export function initBack(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-back]').forEach((link) => {
    link.addEventListener('click', (e) => {
      let same = false;
      try {
        same = document.referrer !== '' && new URL(document.referrer).origin === location.origin;
      } catch {
        same = false;
      }
      if (same && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    });
  });
}
