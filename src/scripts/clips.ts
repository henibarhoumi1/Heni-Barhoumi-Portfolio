import { prefersStill, saveData } from './motion.ts';

/**
 * Muted loops on project pages (hero and sequences): they play while on
 * screen and pause when not. With reduced motion or data saving they stay
 * as their poster.
 */
export function initClips(): void {
  const clips = [...document.querySelectorAll<HTMLVideoElement>('video[data-autoplay]')];
  if (clips.length === 0 || prefersStill() || saveData()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.preload = 'auto';
          video
            .play()
            .then(() => video.classList.add('is-playing'))
            .catch(() => undefined);
        } else {
          video.pause();
        }
      }
    },
    { threshold: 0.25 },
  );
  clips.forEach((clip) => observer.observe(clip));
}
