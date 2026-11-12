/** Bundles the stylesheet and the client script with esbuild, with hashed filenames. */
import path from 'node:path';
import { build } from 'esbuild';

export interface Assets {
  css: string;
  js: string;
}

export async function bundleAssets(root: string, outDir: string, minify: boolean): Promise<Assets> {
  const result = await build({
    absWorkingDir: root,
    entryPoints: { main: 'src/scripts/main.ts', style: 'src/styles/main.css' },
    outdir: path.join(outDir, 'assets'),
    entryNames: '[name].[hash]',
    bundle: true,
    minify,
    format: 'esm',
    target: ['es2022', 'chrome111', 'firefox115', 'safari16.4'],
    external: ['/fonts/*'],
    metafile: true,
    logLevel: 'warning',
  });

  const outputs = Object.keys(result.metafile.outputs).map((file) => '/' + path.relative(outDir, path.join(root, file)).split(path.sep).join('/'));
  const css = outputs.find((f) => f.endsWith('.css'));
  const js = outputs.find((f) => f.endsWith('.js'));
  if (!css || !js) throw new Error('esbuild did not produce both a stylesheet and a script');
  return { css, js };
}
