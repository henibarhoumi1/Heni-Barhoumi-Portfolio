import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderNotFound(ctx: BuildContext): string {
  const main = `<main id="main" class="missing">
  <section class="section">
    <h1 class="section__label">Page not found</h1>
    <p class="display"><a class="link" href="/">Back to the work</a></p>
  </section>
</main>`;
  return page(ctx, { title: 'Page not found', path: '/404.html', section: 'none', bodyClass: 'page-missing', main, noIndex: true });
}
