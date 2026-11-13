/** "Copy" beside the email address: copies it and says so. */
export function initCopy(): void {
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    if (!navigator.clipboard) {
      button.hidden = true;
      return;
    }
    let timer: number | undefined;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        button.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied';
      } catch {
        button.textContent = 'Select and copy';
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.textContent = 'Copy';
        if (status) status.textContent = '';
      }, 2400);
    });
  });
}
