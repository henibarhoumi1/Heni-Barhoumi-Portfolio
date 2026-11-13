import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderNotFound(ctx: BuildContext): string {
  const main = `<main id="main" class="missing">
  <h1 class="missing__title">This page is not here.</h1>
  <p class="missing__link"><a href="/">Back to the work</a></p>
</main>`;
  return page(ctx, { title: 'Page not found', path: '/404.html', section: 'none', bodyClass: 'page-missing', main, noIndex: true });
}
