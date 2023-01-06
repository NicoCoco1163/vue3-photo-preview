import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import vue from 'rollup-plugin-vue';
import postcss from 'rollup-plugin-postcss';
import external from 'rollup-plugin-peer-deps-external';
import autoprefixer from 'autoprefixer';

import pkg from './package.json';

const outputConf = {
  exports: 'named',
  sourcemap: true,
  globals: {
    'vue': 'Vue',
  },
};

export default {
  input: 'src/index.ts',
  preserveSymlinks: false,
  external: ['vue'],
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: pkg.name,
      ...outputConf,
    },
    {
      file: pkg.module,
      format: 'es',
      ...outputConf,
    }
  ],
  plugins: [
    vue({
      preprocessStyles: true,
    }),
    nodeResolve({
      dedupe: ['vue'],
      extensions: ['.mjs', '.js', '.json', '.ts'],
    }),
    external(),
    commonjs(),
    esbuild({
      target: 'esnext',
      sourceMap: true
    }),
    postcss({
      extract: 'index.css',
      plugins: [autoprefixer()]
    }),
  ]
};
