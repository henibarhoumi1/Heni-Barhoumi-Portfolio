import { esc, localTime, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Contact: one clear action. The heading, the email set large, WhatsApp as
 * the second way, one sentence on the work Heni takes on, then where he is.
 * A row of the work closes the page on larger screens, each a way back in.
 */
export function renderContact(ctx: BuildContext): string {
  const { site } = ctx;
  const { email, whatsapp, instagram } = site.contact;
  const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '';

  const row = ctx.entries
    .slice(0, 6)
    .map(
      (e) =>
        `<li style="--ar:${(e.cover.width / e.cover.height).toFixed(4)}"><a href="${e.path}" aria-label="${esc(e.title)}">${picture(e.cover, { alt: '', sizes: '(max-width: 1099px) 20vw, 14vw' })}</a></li>`,
    )
    .join('');

  const main = `<main id="main" class="contact">
<h1 class="sr">Contact</h1>
<div class="contact__cols">
  <p class="contact__label">(${esc(site.contact.action)})</p>
  <ul class="contact__list">
    ${email ? `<li><a href="mailto:${esc(email)}">${esc(email)}</a></li>` : ''}
    ${whatsapp ? `<li><a href="${wa}" rel="noopener" target="_blank">WhatsApp <span class="nowrap">${esc(whatsapp)}</span></a></li>` : ''}
    <li><a href="${esc(instagram.href)}" rel="noopener" target="_blank">Instagram ${esc(instagram.handle)}</a></li>
    ${site.elsewhere.map((e) => `<li><a href="${esc(e.href)}" rel="noopener" target="_blank">${esc(e.label)}</a></li>`).join('')}
  </ul>
  <p class="contact__label">(Based in)</p>
  <p>${esc(site.location)}<br><span class="nowrap">${localTime(ctx)} local time</span></p>
  <p class="contact__label">(Work)</p>
  <p class="contact__invite">${esc(site.contact.invite)}</p>
</div>
<ul class="contact__row">${row}</ul>
</main>`;

  return page(ctx, {
    title: 'Contact',
    description: `${site.contact.action} with ${site.name}: ${email ?? instagram.handle}.`,
    path: '/contact/',
    section: 'contact',
    bodyClass: 'page-contact',
    main,
  });
}
