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
<div class="contact__main">
  <p class="label">Contact</p>
  <h1 class="title">${esc(site.contact.action)}</h1>
  ${email ? `<a class="contact__email" href="mailto:${esc(email)}">${esc(email)}</a>` : ''}
  ${whatsapp ? `<a class="contact__wa" href="${wa}" rel="noopener" target="_blank">WhatsApp <span class="nowrap">${esc(whatsapp)}</span></a>` : ''}
  <p class="contact__invite">${esc(site.contact.invite)}</p>
</div>
<dl class="facts contact__facts">
  <div><dt class="label">Based in</dt><dd>${esc(site.location)}, <span class="nowrap">${localTime(ctx)} local time</span></dd></div>
  <div><dt class="label">Instagram</dt><dd><a href="${esc(instagram.href)}" rel="noopener" target="_blank">${esc(instagram.handle)}</a></dd></div>
  ${site.elsewhere.map((e) => `<div><dt class="label">${esc(e.note ?? 'Elsewhere')}</dt><dd><a href="${esc(e.href)}" rel="noopener" target="_blank">${esc(e.label)}</a></dd></div>`).join('')}
</dl>
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
