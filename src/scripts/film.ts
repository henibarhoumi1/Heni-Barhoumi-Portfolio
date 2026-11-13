import { canHover } from './motion.ts';

/**
 * Full films. The page shows the project's own poster and a Play action;
 * Vimeo's player is only requested when Play is pressed. On screens with a
 * pointer our own controls drive it (play and pause, sound, scrubbing, full
 * screen) through Vimeo's message interface. On touch screens Vimeo's own
 * controls are used, so the phone's full-screen player takes over.
 * Nothing ever starts with sound by itself: films only play when asked.
 */
const ORIGIN = 'https://player.vimeo.com';

type Message = { event?: string; method?: string; value?: unknown; data?: Record<string, number> };

const clock = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};

export function initFilms(): void {
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((film, n) => {
    const frame = film.querySelector<HTMLElement>('[data-film-frame]');
    const play = film.querySelector<HTMLAnchorElement>('[data-film-play]');
    const controls = film.querySelector<HTMLElement>('[data-film-controls]');
    const toggle = film.querySelector<HTMLButtonElement>('[data-film-toggle]');
    const scrub = film.querySelector<HTMLInputElement>('[data-film-scrub]');
    const time = film.querySelector<HTMLElement>('[data-film-time]');
    const mute = film.querySelector<HTMLButtonElement>('[data-film-mute]');
    const full = film.querySelector<HTMLButtonElement>('[data-film-full]');
    const id = film.dataset.id;
    if (!frame || !play || !id) return;

    const custom = canHover() && Boolean(controls && toggle && scrub && time && mute);
    let iframe: HTMLIFrameElement | null = null;
    let duration = 0;
    let playing = false;
    let volume = 1;
    let scrubbing = false;

    const send = (method: string, value?: unknown): void => {
      iframe?.contentWindow?.postMessage(value === undefined ? { method } : { method, value }, ORIGIN);
    };

    const setPlaying = (state: boolean): void => {
      playing = state;
      if (toggle) toggle.textContent = state ? 'Pause' : 'Play';
    };

    const setVolume = (v: number): void => {
      volume = v;
      if (mute) mute.textContent = v > 0 ? 'Sound off' : 'Sound on';
    };

    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== ORIGIN || event.source !== iframe?.contentWindow) return;
      let data: Message;
      try {
        data = typeof event.data === 'string' ? (JSON.parse(event.data) as Message) : (event.data as Message);
      } catch {
        return;
      }
      if (data.event === 'ready') {
        for (const name of ['play', 'pause', 'ended', 'timeupdate', 'volumechange']) send('addEventListener', name);
        send('getDuration');
        send('getVolume');
      } else if (data.method === 'getDuration' && typeof data.value === 'number') duration = data.value;
      else if (data.method === 'getVolume' && typeof data.value === 'number') setVolume(data.value);
      else if (data.event === 'play') setPlaying(true);
      else if (data.event === 'pause' || data.event === 'ended') setPlaying(false);
      else if (data.event === 'volumechange' && data.data) setVolume(data.data.volume ?? volume);
      else if (data.event === 'timeupdate' && data.data) {
        duration = data.data.duration ?? duration;
        const seconds = data.data.seconds ?? 0;
        if (time) time.textContent = duration ? `${clock(seconds)} / ${clock(duration)}` : clock(seconds);
        if (scrub && !scrubbing) scrub.value = String(Math.round((data.data.percent ?? 0) * 1000));
      }
    };

    play.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      if (iframe) return;
      const params = new URLSearchParams({
        autoplay: '1',
        dnt: '1',
        title: '0',
        byline: '0',
        portrait: '0',
        controls: custom ? '0' : '1',
        playsinline: custom ? '1' : '0',
        player_id: `film-${n}`,
      });
      if (film.dataset.hash) params.set('h', film.dataset.hash);
      iframe = document.createElement('iframe');
      iframe.src = `${ORIGIN}/video/${id}?${params}`;
      iframe.title = `${film.querySelector('figcaption')?.textContent ?? 'Film'}, video player`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      window.addEventListener('message', onMessage);
      frame.append(iframe);
      film.classList.add('is-playing');
      if (custom && controls) {
        controls.hidden = false;
        setPlaying(true);
        toggle?.focus();
      } else {
        iframe.focus();
      }
    });

    if (!custom) return;

    toggle?.addEventListener('click', () => send(playing ? 'pause' : 'play'));
    mute?.addEventListener('click', () => {
      const next = volume > 0 ? 0 : 1;
      send('setVolume', next);
      setVolume(next);
    });
    scrub?.addEventListener('input', () => {
      scrubbing = true;
      if (time && duration) time.textContent = `${clock((Number(scrub.value) / 1000) * duration)} / ${clock(duration)}`;
    });
    scrub?.addEventListener('change', () => {
      scrubbing = false;
      if (duration) send('setCurrentTime', (Number(scrub.value) / 1000) * duration);
    });

    if (full) {
      if (!document.fullscreenEnabled) full.hidden = true;
      full.addEventListener('click', () => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void film.requestFullscreen?.();
      });
      document.addEventListener('fullscreenchange', () => {
        full.textContent = document.fullscreenElement === film ? 'Exit full screen' : 'Full screen';
      });
    }
  });
}
