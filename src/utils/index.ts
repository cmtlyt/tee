import { createDefu } from 'defu';

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
export * from './data-map';
export * from './get-info';
export * from './jiti-import';
export * from './loader';
export * from './parse';
export * from './run-main';

/**
 * 将值赋值到对象上
 */
export function assoc(path: string[], value: any, source: Record<string, any>) {
  const target = path.slice(0, -1).reduce((acc, cur) => acc[cur as any] ||= {}, source);

  target[path.at(-1)! as any] = value;
}
