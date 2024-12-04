import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import externals from 'rollup-plugin-node-externals';
import dts from 'rollup-plugin-dts';
import builtins from 'rollup-plugin-node-builtins';
import type { RollupOptions } from 'rollup';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const configPath = join(dirname(fileURLToPath(import.meta.url)), './package.json');
const pkg = JSON.parse(readFileSync(configPath, 'utf8'));

const config: RollupOptions[] = [
  // browser-friendly UMD build
  {
    input: "src/index.ts",
    output: {
      name: "typescriptNpmPackage",
      file: pkg.browser,
      format: "umd",
      sourcemap: true,
    },
    external: ['bsv', 'cross-fetch', 'cross-fetch/polyfill'],
    plugins: [
      // @ts-ignore
      builtins(),
      resolve({
      // @ts-ignore
        skip: ['bsv'],
        browser: true,
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      typescript({ 
        tsconfig: "./tsconfig.json", 
        sourceMap: false,
        noEmitHelpers: true,
        importHelpers: true
      }),
      nodePolyfills(),
      externals({
        devDeps: true,
        peerDeps: true,
        exclude: ['tslib']
      }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs", sourcemap: true },
      { file: pkg.module, format: "es", sourcemap: true },
    ],
    external: ['bsv', 'cross-fetch', 'cross-fetch/polyfill'],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        sourceMap: false,
        noEmitHelpers: true,
        importHelpers: true
      }),
      resolve({
      // @ts-ignore
        skip: ['bsv'],
      }),
      externals({
        devDeps: true,
        peerDeps: true,
        exclude: ['tslib']
      }),
    ],
  },

  {
    // path to your declaration files root
    input: "src/index.ts",
    output: [
      { file: 'dist/typescript-npm-package.cjs.d.ts', format: 'es' },
      { file: 'dist/typescript-npm-package.esm.d.ts', format: 'es' },
      { file: 'dist/typescript-npm-package.umd.d.ts', format: 'es' }
    ],
    plugins: [dts()],
  },
]
export default config;
