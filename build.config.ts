import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
  {
    entries: ['src/index'],
    outDir: 'dist',
    clean: true,
    declaration: true,
    sourcemap: false,
    rollup: {
      cjsBridge: true,
      emitCJS: true,
      esbuild: {
        minify: true,
      },
    },
    failOnWarn: false,
  },
  {
    entries: ['src/cli'],
    outDir: 'bin',
    sourcemap: false,
    rollup: {
      esbuild: {
        minify: true,
      },
    },
    failOnWarn: false,
  },
  {
    entries: ['src/request-adapter/index'],
    outDir: 'dist',
    declaration: true,
    sourcemap: false,
    rollup: {
      cjsBridge: true,
      emitCJS: true,
      esbuild: {
        minify: true,
      },
    },
    failOnWarn: false,
  },
]);
