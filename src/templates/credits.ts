import { esc, localTime } from './html.ts';
import type { BuildContext } from './types.ts';

interface CreditsOptions {
  /** h1 on the Contact page, where the credits are the page; h2 everywhere else. */
  level: 'h1' | 'h2';
  /** One sentence on who should write. */
  invite?: string;
}

/**
 * The end credits: how to reach Heni, closing every page. In the dark: on a
 * dark project they continue its room; on bright pages the lights go down.
 * `data-room` lets the header take the same colours when it passes over.
 */
export function endCredits(ctx: BuildContext, { level, invite }: CreditsOptions): string {
  const { contact } = ctx.site;
  const whatsapp = contact.whatsapp?.replace(/\D/g, '');

  const rows = [
    contact.email
      ? `<div class="credits__row">
      <dt>Email</dt>
      <dd><a class="credits__value" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a><button type="button" class="credits__copy" data-copy="${esc(contact.email)}">Copy</button></dd>
    </div>`
      : '',
    whatsapp
      ? `<div class="credits__row">
      <dt>WhatsApp</dt>
      <dd><a class="credits__value" href="https://wa.me/${whatsapp}" rel="noopener">${esc(contact.whatsapp as string)}</a></dd>
    </div>`
      : '',
    `<div class="credits__row">
      <dt>Instagram</dt>
      <dd><a class="credits__value" href="${esc(contact.instagram.href)}" rel="me noopener">${esc(contact.instagram.handle)}</a></dd>
    </div>`,
  ].join('\n    ');

  return `<section class="credits${level === 'h1' ? ' credits--page' : ''}" data-room aria-labelledby="credits-title">
  <div class="credits__head">
    <${level} class="credits__label" id="credits-title">Contact</${level}>
    ${invite ? `<p class="credits__invite">${esc(invite)}</p>` : ''}
  </div>
  <dl class="credits__list">
    ${rows}
  </dl>
  <div class="credits__foot">
    <p>${esc(ctx.site.location.split(',')[0] ?? ctx.site.location)} ${localTime(ctx)}</p>
    <p>&copy; ${ctx.year} ${esc(ctx.site.name)}</p>
    <p class="credits__status" role="status" data-copy-status></p>
  </div>
</section>`;
}
