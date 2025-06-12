import { defineBuildConfig } from 'unbuild';

const baseConfig = {
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
} as const;

export default defineBuildConfig([
  {
    ...baseConfig,
    entries: ['src/index'],
    clean: true,
  },
  {
    ...baseConfig,
    entries: ['src/cli'],
    outDir: 'bin',
    declaration: false,
    rollup: {
      ...baseConfig.rollup,
      emitCJS: false,
    },
    failOnWarn: false,
  },
  {
    ...baseConfig,
    entries: ['src/request-adapter/index'],
  },
  {
    ...baseConfig,
    entries: ['src/zod/index'],
  },
]);
