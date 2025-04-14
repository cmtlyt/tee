import type KoaRouter from '@koa/router';
import type { AppRouterOptions, GetExtendsOptions } from './type';

/**
 * router 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getRouterExtendsOptions(_options: AppRouterOptions & { globalRouter: KoaRouter }) {
  return { };
}

export type RouterExtendsOptions = GetExtendsOptions<typeof getRouterExtendsOptions>;
