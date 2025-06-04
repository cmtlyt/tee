import type { DevOptions } from '../types';
import { existsSync } from 'node:fs';
import { resolve } from 'pathe';
import { getStorages } from '../storage';
import { initBuiltInMiddleware } from './init-built-in-middleware';
import { jitiImport } from './jiti-import';

/**
 * 运行入口文件, 默认为项目根目录的 main.ts 文件
 */
export async function runSourceMain({ pkgPath, sourceDir }: DevOptions) {
  const { app, router, isProd } = getStorages(['app', 'router', 'isProd'], { isProd: false });
  initBuiltInMiddleware(app);
  const sourceMainPath = resolve(pkgPath, isProd ? `${sourceDir}/main.js` : 'main.ts');
  if (!existsSync(sourceMainPath))
    return;
  return jitiImport(sourceMainPath).then(({ default: main }) => main(app, router), () => {});
}
