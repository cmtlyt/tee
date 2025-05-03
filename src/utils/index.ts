import type { DevOptions } from '../types';
import { createDefu } from 'defu';
import { resolve } from 'pathe';
import { getStorages } from '../storage';
import { jitiImport } from './jiti-import';

/**
 * 合并对象
 */
export const defu = createDefu((object, key, value) => {
  const targetValue = object[key];
  if (Array.isArray(targetValue) && Array.isArray(value)) {
    object[key] = value;
    return true;
  }
});

export * from './config';
export * from './consola';
export * from './get-info';
export * from './jiti-import';
export * from './loader';
export * from './object';
export * from './parse';

/**
 * 将值赋值到对象上
 */
export function assoc(path: string[], value: any, source: Record<string, any>) {
  const target = path.slice(0, -1).reduce((acc, cur) => acc[cur as any] ||= {}, source);

  target[path.at(-1)! as any] = value;
}

/**
 * 运行入口文件, 默认为项目根目录的 main.ts 文件
 */
export async function runSourceMain({ pkgPath, sourceDir }: DevOptions) {
  const { app, router, isProd } = getStorages(['app', 'router', 'isProd'], { isProd: false });
  const sourceMainPath = resolve(pkgPath, isProd ? `${sourceDir}/main.js` : 'main.ts');
  return jitiImport(sourceMainPath).then(({ default: main }) => main(app, router), () => {});
}
