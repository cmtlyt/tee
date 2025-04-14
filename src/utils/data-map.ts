import type KoaRouter from '@koa/router';
import type { DeepRequired, FileInfo } from '../types';
import { getStorage } from '../storage';

/**
 * 创建 routerSchema 的信息映射
 */
export function createRouterSchemaInfoMap(moduleInfo: DeepRequired<FileInfo>) {
  const { moduleInfo: { content: module }, path } = moduleInfo;

  const routerInfoMap = getStorage('routerInfoMap', {});

  for (const key in module) {
    const schema = module[key];
    routerInfoMap[key] = {
      ...routerInfoMap[key],
      schema,
      schemaPath: path,
    };
  }
}

/**
 * 创建路由信息映射
 */
export function createRouterInfoMap(moduleInfo: DeepRequired<FileInfo>) {
  const { moduleInfo: { content: module }, path } = moduleInfo;

  const routerInfoMap = getStorage('routerInfoMap', {});

  const router = module as KoaRouter;

  router.stack.forEach((item) => {
    routerInfoMap[String(item.path)] = {
      ...routerInfoMap[String(item.path)],
      filePath: path,
      path: item.path,
    };
  });
}
