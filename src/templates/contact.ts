import { endCredits } from './credits.ts';
import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

/** Contact is the end credits, filling the window. */
export function renderContact(ctx: BuildContext): string {
  const main = `<main id="main" class="contact">
${endCredits(ctx, { level: 'h1', invite: ctx.site.contact.invite })}
</main>`;

  return page(ctx, {
    title: 'Contact',
    description: `Contact ${ctx.site.name}. ${ctx.site.contact.invite}`,
    path: '/contact/',
    section: 'contact',
    bodyClass: 'page-contact',
    room: { bg: '#000000', ink: '#ffffff', dark: true },
    credits: false,
    main,
  });
}
