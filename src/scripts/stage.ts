import { prefersStill } from './motion.ts';
import { createWarp, type Warp } from './warp.ts';

/**
 * The Work strip. One continuous position, `f`, measured in prints: the
 * print at round(f) sits at the slot, large; every other print is laid out
 * small on either side of it. Between two whole positions the leaving print
 * shrinks as the arriving one grows, so the row always reads as one object.
 *
 * Every print keeps its own proportions; only its height changes. Wheel,
 * trackpad, drag, swipe and the arrow keys move `f`; it eases to the nearest
 * whole print when you let go. Any print opens its project. The large print
 * is drawn by WebGL (warp.ts) slightly bent, like a photograph held in the
 * hand; without WebGL it is the plain image.
 */

interface Project {
  number: string;
  title: string;
  caption: string;
  path: string;
}

interface Item {
  el: HTMLLIElement;
  link: HTMLAnchorElement;
  img: HTMLImageElement | null;
  sources: HTMLSourceElement[];
  project: number;
  ratio: number;
  /** Fixed per print, so each one bends its own way. */
  seed: [number, number, number];
  large: boolean;
}

const STORE = 'stage-f';
const mod = (n: number, m: number) => ((n % m) + m) % m;
const smooth = (x: number) => x * x * (3 - 2 * x);
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function initStage(): void {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  const strip = stage?.querySelector<HTMLOListElement>('[data-strip]');
  const data = stage?.querySelector('[data-projects]');
  if (!stage || !strip || !data) return;
  const projects = JSON.parse(data.textContent ?? '[]') as Project[];
  const originals = [...strip.querySelectorAll<HTMLLIElement>(':scope > li')];
  if (originals.length === 0 || projects.length === 0) return;

  // The row never ends: with few prints, repeat them so the loop is never seen closing.
  const els = [...originals];
  while (els.length < 18) {
    for (const li of originals) {
      const copy = li.cloneNode(true) as HTMLLIElement;
      copy.classList.remove('is-active');
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelector('img')?.setAttribute('loading', 'lazy');
      strip.append(copy);
      els.push(copy);
    }
  }

  const items: Item[] = els.map((el, i) => ({
    el,
    link: el.querySelector('a') as HTMLAnchorElement,
    img: el.querySelector('img'),
    sources: [...el.querySelectorAll('source')],
    project: Number(el.dataset.p ?? 0),
    ratio: Number(el.dataset.r ?? 0.75),
    seed: [hash(i), hash(i + 17.3), hash(i + 51.9)],
    large: false,
  }));
  const N = items.length;
  for (const item of items) item.link.tabIndex = -1;

  const numEl = stage.querySelector<HTMLElement>('[data-num]');
  const titleEl = stage.querySelector<HTMLElement>('[data-title]');
  const textEl = stage.querySelector<HTMLElement>('[data-text]');
  const captionBox = stage.querySelector<HTMLElement>('.stage__caption');
  const live = stage.querySelector<HTMLElement>('[data-live]');
  const still = prefersStill();

  stage.classList.add('is-live');

  // Geometry, in CSS pixels. Proportions taken from the reference layout.
  let W = 0;
  let H = 0;
  let smallH = 0;
  /** The average width of a small print: the unit of dragging and scrolling. */
  let unit = 0;
  let bigH = 0;
  let gap = 0;
  let x0 = 0;
  let cy = 0;
  let maxBigW = 0;
  let capGap = 0;
  const measure = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const narrow = W < 700;
    bigH = Math.round(H * 0.4);
    smallH = Math.round(H * (narrow ? 0.14 : 0.185));
    unit = smallH * (items.reduce((a, i) => a + i.ratio, 0) / items.length);
    gap = Math.max(6, Math.round(smallH * 0.085));
    x0 = Math.round(W * (narrow ? 0.12 : 0.195));
    maxBigW = W - x0 - (narrow ? W * 0.06 : W * 0.3);

    // Fit caption and large print between the header and the footer, centred when there is room.
    const top = document.querySelector('.bar--top')?.getBoundingClientRect().bottom ?? 0;
    const foot = document.querySelector('.bar--bottom')?.getBoundingClientRect().top ?? H;
    const capH = captionBox?.offsetHeight ?? 0;
    capGap = H * 0.035;
    const room = foot - top - 24 - capH - capGap;
    if (bigH > room) bigH = Math.max(Math.round(H * 0.24), Math.round(room));
    const lowest = top + 12 + capH + capGap + bigH / 2;
    const highest = foot - 12 - bigH / 2;
    cy = Math.round(Math.min(Math.max(H * 0.505, lowest), Math.max(lowest, highest)));
  };
  const bigSize = (item: Item): [number, number] => {
    let w = bigH * item.ratio;
    let h = bigH;
    if (w > maxBigW) {
      w = maxBigW;
      h = w / item.ratio;
    }
    return [w, h];
  };

  let f = 0;
  const saved = Number(read(STORE));
  if (Number.isFinite(saved) && saved > 0) f = Math.round(saved);
  let target = f;
  let lastF = f;
  let velocity = 0;
  let activeIndex = -1;
  let activeProject = -1;

  let warp: Warp | null = null;
  try {
    warp = createWarp(stage, () => request());
  } catch {
    warp = null;
  }
  if (warp) stage.classList.add('is-gl');

  // Upgrade the files of prints near the slot so the large print is always sharp.
  const ensureLarge = (item: Item) => {
    if (item.large) return;
    item.large = true;
    for (const s of item.sources) s.sizes = '40vh';
    if (item.img) {
      item.img.sizes = '40vh';
      item.img.loading = 'eager';
    }
  };

  const setActive = (index: number) => {
    if (index === activeIndex) return;
    const hadFocus = strip.contains(document.activeElement);
    if (activeIndex >= 0) {
      const old = items[activeIndex] as Item;
      old.el.classList.remove('is-active');
      old.link.tabIndex = -1;
    }
    activeIndex = index;
    const item = items[index] as Item;
    item.el.classList.add('is-active');
    item.link.tabIndex = 0;
    if (hadFocus) item.link.focus({ preventScroll: true });
    for (let d = -2; d <= 3; d++) ensureLarge(items[mod(index + d, N)] as Item);

    if (item.project !== activeProject) {
      activeProject = item.project;
      const p = projects[item.project] as Project;
      if (numEl) numEl.textContent = p.number;
      if (titleEl) titleEl.textContent = p.title;
      if (textEl) textEl.textContent = p.caption;
      if (live) live.textContent = `${p.title}. ${p.caption}.`;
    }
  };

  const layout = (dt: number) => {
    const j = Math.floor(f);
    const t = f - j;
    const sizes = new Map<number, [number, number, number]>();
    const size = (v: number): [number, number, number] => {
      let s = sizes.get(v);
      if (!s) {
        const item = items[mod(v, N)] as Item;
        const g = smooth(Math.max(0, 1 - Math.abs(v - f)));
        const [bw, bh] = bigSize(item);
        const sw = smallH * item.ratio;
        s = [sw + (bw - sw) * g, smallH + (bh - smallH) * g, g];
        sizes.set(v, s);
      }
      return s;
    };
    const back = Math.min(5, Math.floor(N / 3));
    const xs = new Map<number, number>();
    xs.set(j, x0 - t * (size(j)[0] + gap));
    for (let v = j + 1; v <= j - back + N - 1; v++) xs.set(v, (xs.get(v - 1) as number) + size(v - 1)[0] + gap);
    for (let v = j - 1; v >= j - back; v--) xs.set(v, (xs.get(v + 1) as number) - gap - size(v)[0]);

    const drawn: Parameters<Warp['draw']>[0] = [];
    for (let v = j - back; v <= j - back + N - 1; v++) {
      const item = items[mod(v, N)] as Item;
      const [w, h, g] = size(v);
      const x = xs.get(v) as number;
      const y = cy - h / 2;
      const off = x > W + 40 || x + w < -40;
      item.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      item.el.style.width = `${w.toFixed(2)}px`;
      item.el.style.height = `${h.toFixed(2)}px`;
      item.el.style.visibility = off ? 'hidden' : '';
      if (warp && g > 0.001 && item.img) {
        const ready = warp.ready(item.img);
        item.el.classList.toggle('is-drawn', ready);
        if (ready) drawn.push({ img: item.img, x, y, w, h, g, seed: item.seed, ratio: item.ratio });
      } else {
        item.el.classList.remove('is-drawn');
      }
    }

    // Number and caption stand above the large print, left-aligned to it.
    const active = items[mod(Math.round(f), N)] as Item;
    const [, ah] = bigSize(active);
    if (captionBox) captionBox.style.transform = `translate3d(${x0}px,${(cy - ah / 2 - capGap).toFixed(1)}px,0) translateY(-100%)`;
    setActive(mod(Math.round(f), N));

    const speed = dt > 0 ? (f - lastF) / dt : 0;
    lastF = f;
    velocity += (speed - velocity) * 0.25;
    // The print keeps its bend but does not flex as it moves: quiet, not a demo.
    warp?.draw(drawn, W, H, 0);
  };

  // Motion.
  let frame = 0;
  let last = 0;
  let dragging = false;
  const tick = (now: number) => {
    frame = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    if (!dragging) {
      const ease = still ? 1 : 1 - Math.exp(-dt * 7.5);
      f += (target - f) * ease;
      if (Math.abs(target - f) < 0.0004) f = target;
    }
    layout(dt);
    const moving = dragging || f !== target || Math.abs(velocity) > 0.002;
    if (moving) request();
    else {
      last = 0;
      velocity = 0;
      write(STORE, String(mod(Math.round(f), N)));
    }
  };
  function request() {
    if (!frame) frame = requestAnimationFrame(tick);
  }
  const go = (to: number) => {
    target = Math.max(f - 8, Math.min(f + 8, to));
    request();
  };
  const step = (by: number) => go(Math.round(target) + by);

  // Wheel and trackpad: either axis moves the row.
  let snap = 0;
  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? H : 1;
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scale;
      target = Math.max(f - 8, Math.min(f + 8, target + delta / ((unit + gap) * 1.2)));
      window.clearTimeout(snap);
      snap = window.setTimeout(() => go(Math.round(target)), 120);
      request();
    },
    { passive: false },
  );

  // Drag and swipe.
  let startX = 0;
  let startF = 0;
  let moved = false;
  let samples: { x: number; t: number }[] = [];
  let pointer = -1;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pointer = e.pointerId;
    startX = e.clientX;
    startF = f;
    moved = false;
    samples = [{ x: e.clientX, t: e.timeStamp }];
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) {
      moved = true;
      dragging = true;
      stage.classList.add('is-dragging');
      // Capture only once it is a drag, so a plain click still reaches its print.
      stage.setPointerCapture?.(e.pointerId);
    }
    f = startF - dx / (unit + gap);
    target = f;
    samples.push({ x: e.clientX, t: e.timeStamp });
    if (samples.length > 5) samples.shift();
    request();
  });
  const release = (e: PointerEvent) => {
    if (e.pointerId !== pointer) return;
    pointer = -1;
    if (stage.hasPointerCapture?.(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    const a = samples[0];
    const b = samples[samples.length - 1];
    const v = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; // px per ms
    go(Math.round(f - (v * 180) / (unit + gap)));
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  // Any print opens its project; the large one lies flat first so it can travel.
  stage.addEventListener(
    'click',
    (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    },
    true,
  );
  strip.addEventListener('click', (e) => {
    const link = (e.target as Element).closest('a');
    if (!link) return;
    const index = items.findIndex((i) => i.link === link);
    if (index < 0) return;
    stage.classList.add('is-leaving');
    write(STORE, String(index));
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      step(1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Enter' && !strip.contains(document.activeElement) && document.activeElement === document.body) {
      (items[activeIndex] as Item).link.click();
    }
  });

  // Back from a project (bfcache): show the plain print again.
  window.addEventListener('pageshow', () => {
    stage.classList.remove('is-leaving');
    request();
  });

  measure();
  layout(0);
  window.addEventListener('resize', () => {
    measure();
    warp?.resize();
    request();
  });
}
