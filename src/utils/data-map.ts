import type { DeepRequired, FileInfo, Tee } from '../types';
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

  const { adapter } = getStorage('config');
  const routerInfoMap = getStorage('routerInfoMap', {});

  const router = module as Tee.TeeRouter;

  adapter.router.getRoutesPaths(router).forEach((_path) => {
    routerInfoMap[String(_path)] = {
      ...routerInfoMap[String(_path)],
      filePath: path,
      path: _path,
    };
  });
}
