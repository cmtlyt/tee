import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'fast-glob';
import { basename, dirname, relative } from 'pathe';
import { readPackageJSON, writePackageJSON } from 'pkg-types';
import { defineBuildConfig } from 'unbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// 核心适配器
const coreAdapters = glob.globSync(['src/core-adapter/*/index.ts', '!src/core-adapter/base-types']);

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
    entries: [
      // 请求适配器
      'src/request-adapter/index',
      // zod 支持
      'src/zod/index',
      ...coreAdapters,
    ],
    hooks: {
      'build:done': async (ctx) => {
        // 自动更新 core-adapter 导出
        const adapters = await glob('core-adapter/*', { cwd: ctx.options.outDir, onlyDirectories: true })
          .then(res => res.map(item => basename(item)));
        const basePath = relative(__dirname, ctx.options.outDir);
        const pkgInfo = await readPackageJSON(import.meta.url);
        const exports = pkgInfo.exports || {} as any;
        const exportsSet = new Set(Object.keys(exports));
        let changed = false;

        adapters.forEach((item) => {
          if (exportsSet.has(`./${item}`))
            return;
          changed = true;
          exports[`./${item}`] = {
            types: `./${basePath}/core-adapter/${item}/index.d.ts`,
            import: `./${basePath}/core-adapter/${item}/index.mjs`,
            require: `./${basePath}/core-adapter/${item}/index.cjs`,
          };
        });

        if (!changed)
          return;

        await writePackageJSON(resolve(__dirname, 'package.json'), {
          ...pkgInfo,
          exports,
        });
      },
    },
  },
]);
