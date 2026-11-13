/**
 * The header steps aside while you read down a page and comes back as soon
 * as you scroll up. It takes the colours of the room under it, and its slate
 * names the project in view.
 */
const SLACK = 6;

export function initMasthead(): void {
  const header = document.querySelector<HTMLElement>('[data-masthead]');
  if (!header) return;
  const slate = header.querySelector<HTMLElement>('[data-slate]');
  const rooms = [...document.querySelectorAll<HTMLElement>('[data-room]')];
  const slated = [...document.querySelectorAll<HTMLElement>('[data-slate]')].filter((el) => el !== slate);
  const after = document.querySelector<HTMLElement>('[data-slate-after]');

  let lastY = window.scrollY;
  let ticking = false;
  let shown = '';

  const setSlate = (text: string): void => {
    if (!slate || text === shown) return;
    shown = text;
    slate.classList.add('is-changing');
    window.setTimeout(() => {
      slate.textContent = text;
      slate.classList.remove('is-changing');
    }, 150);
  };

  const update = (): void => {
    ticking = false;
    const y = window.scrollY;
    const h = header.offsetHeight;

    // Hide on the way down, show on the way up, always show near the top or with focus inside.
    if (y < h || header.contains(document.activeElement)) header.classList.remove('is-hidden');
    else if (y > lastY + SLACK) header.classList.add('is-hidden');
    else if (y < lastY - SLACK) header.classList.remove('is-hidden');
    lastY = y;

    // Take the colours of the room that sits under the header's lower edge.
    const under = rooms.find((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= h && r.bottom > h;
    });
    if (under) {
      const style = getComputedStyle(under.matches('.spread') ? (under.querySelector('.spread__link') as HTMLElement) : under);
      header.style.setProperty('--mh-room', style.backgroundColor);
      header.style.setProperty('--mh-ink', style.color);
    } else {
      header.style.removeProperty('--mh-room');
      header.style.removeProperty('--mh-ink');
    }

    // The slate: on Work, the project nearest the middle of the screen; on a project, its title once the opening has passed.
    if (after) {
      setSlate(after.getBoundingClientRect().bottom < h ? (after.dataset.slateAfter ?? '') : '');
    } else if (slated.length) {
      const middle = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let distance = Infinity;
      for (const el of slated) {
        const r = el.getBoundingClientRect();
        if (r.bottom < h || r.top > window.innerHeight) continue;
        const d = r.top <= middle && r.bottom >= middle ? 0 : Math.min(Math.abs(r.top - middle), Math.abs(r.bottom - middle));
        if (d < distance) {
          distance = d;
          best = el;
        }
      }
      setSlate(best && distance < window.innerHeight * 0.4 ? (best.dataset.slate ?? '') : '');
    }
  };

  const request = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}
