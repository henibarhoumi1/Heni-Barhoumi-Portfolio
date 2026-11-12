/** Shows the current time in the studio's time zone, e.g. "03:34". */
export function initClock(): void {
  const clocks = document.querySelectorAll<HTMLTimeElement>('[data-clock]');
  if (clocks.length === 0) return;

  const tick = () => {
    const now = new Date();
    for (const el of clocks) {
      const timeZone = el.dataset.timeZone ?? 'UTC';
      el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(now);
      el.dateTime = now.toISOString();
    }
  };

  tick();
  setInterval(tick, 15_000);
}
