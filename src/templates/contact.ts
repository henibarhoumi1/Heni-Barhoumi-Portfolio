import { esc } from './html.ts';
import { localTime, page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderContact(ctx: BuildContext): string {
  const { site } = ctx;
  const { contact } = site;

  const lines = [
    contact.email ? `<a class="link" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : '',
    `<a class="link" href="${esc(contact.instagram.href)}" rel="me noopener">Instagram</a>`,
    `<a class="link" href="${esc(contact.instagram.href)}" rel="me noopener">${esc(contact.instagram.handle)}</a>`,
  ].filter(Boolean);

  const main = `<main id="main" class="contact">
  <section class="section contact__intro">
    <h1 class="section__label">Contact</h1>
    <p class="about__text">${esc(contact.invite)}</p>
  </section>

  <section class="section">
    <h2 class="section__label">Write</h2>
    <p class="display contact__lines">${lines.map((line) => `<span>${line}</span>`).join('')}</p>
  </section>

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
