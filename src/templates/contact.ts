import { esc } from './html.ts';
import { localTime, page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderContact(ctx: BuildContext): string {
  const { site } = ctx;
  const { contact } = site;

  const whatsapp = contact.whatsapp
    ? `<a class="link" href="https://wa.me/${contact.whatsapp.replace(/\D/g, '')}" rel="noopener">${esc(contact.whatsapp)}</a>`
    : '';

  // One way to reach him per section: a small label, then the address set large.
  const ways = [
    contact.email ? { label: 'Email', html: `<a class="link" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` } : null,
    whatsapp ? { label: 'WhatsApp', html: whatsapp } : null,
    { label: 'Instagram', html: `<a class="link" href="${esc(contact.instagram.href)}" rel="me noopener">${esc(contact.instagram.handle)}</a>` },
  ].filter((way) => way !== null);

  const main = `<main id="main" class="contact">
  <section class="section contact__intro">
    <h1 class="section__label">Contact</h1>
    <p class="contact__invite">${esc(contact.invite)}</p>
  </section>

${ways
  .map(
    (way) => `  <section class="section">
    <h2 class="section__label">${way.label}</h2>
    <p class="display contact__line">${way.html}</p>
  </section>`,
  )
  .join('\n')}

  <section class="section">
    <h2 class="section__label">Based in</h2>
    <p class="display contact__lines"><span>${esc(site.location)}</span><span>${localTime(ctx)}</span></p>
  </section>
</main>`;

  return page(ctx, {
    title: 'Contact',
    description: `Contact ${site.name}. ${contact.invite}`,
    path: '/contact/',
    section: 'contact',
    bodyClass: 'page-contact',
    main,
  });
}
