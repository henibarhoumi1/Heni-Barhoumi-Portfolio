import { esc, localTime, picture } from './html.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/**
 * Contact: label and value in columns across the top, the page left white
 * below, and a row of the work along the foot, each one a way back in.
 */
export function renderContact(ctx: BuildContext): string {
  const { site } = ctx;
  const { email, whatsapp, instagram } = site.contact;
  const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '';

  const reach = [
    email ? `<li><a href="mailto:${esc(email)}">${esc(email)}</a></li>` : '',
    whatsapp ? `<li><a href="${wa}" rel="noopener" target="_blank">WhatsApp ${esc(whatsapp)}</a></li>` : '',
    `<li><a href="${esc(instagram.href)}" rel="noopener" target="_blank">Instagram ${esc(instagram.handle)}</a></li>`,
  ].join('');

  const row = ctx.entries
    .slice(0, 6)
    .map(
      (e) => `<li><a href="${e.path}" aria-label="${esc(e.title)}">${picture(e.cover, { alt: '', sizes: '(max-width: 899px) 33vw, 16vw' })}</a></li>`,
    )
    .join('');

  const main = `<main id="main" class="contact">
<h1 class="sr">Contact</h1>
<div class="contact__cols">
  <p class="label">(Contact)</p>
  <ul class="contact__list">${reach}</ul>
  <p class="label">(Location)</p>
  <p>${esc(site.location)}<br>${localTime(ctx)} local time</p>
  <p class="label">(For)</p>
  <p>${esc(site.contact.invite)}</p>
</div>
<ul class="contact__row">${row}</ul>
</main>`;

  return page(ctx, {
    title: 'Contact',
    description: `Write to ${site.name}: ${email ?? instagram.handle}.`,
    path: '/contact/',
    section: 'contact',
    bodyClass: 'page-contact',
    main,
    caption: email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : '',
  });
}
