import type { DevOptions } from '../types';
import { existsSync } from 'node:fs';
import { resolve } from 'pathe';
import { getCoreUtils } from '../core-adapter';
import { getStorages } from '../storage';
import { jitiImport } from './jiti-import';

/**
 * 运行入口文件, 默认为项目根目录的 main.ts 文件
 */
export async function runSourceMain({ pkgPath, sourceDir }: DevOptions) {
  const { app, modules, router, isProd, config: { adapter } } = getStorages(['app', 'router', 'isProd', 'config', 'modules'], { isProd: false });
  const coreUtils = getCoreUtils(adapter);
  coreUtils.initBuiltInMiddleware(app);
  const sourceMainPath = resolve(pkgPath, isProd ? `${sourceDir}/main.js` : 'main.ts');
  if (!existsSync(sourceMainPath))
    return;
  return jitiImport(sourceMainPath).then(({ default: main }) => main({ app, modules, router }), () => {});
}
