import { page } from './layout.ts';
import type { BuildContext } from './types.ts';

export function renderNotFound(ctx: BuildContext): string {
  const main = `<main id="main" class="missing">
  <p class="num">(404)</p>
  <h1 class="caption">This page is not here. The work is <a href="/">on the first page</a>.</h1>
</main>`;
  return page(ctx, { title: 'Page not found', path: '/404.html', section: 'none', bodyClass: 'page-missing', main, noIndex: true });
}
