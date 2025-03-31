import type KoaRouter from '@koa/router';
import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getRouterExtendsOptions(_options: AppRouterOptions & { globalRouter: KoaRouter }) {
  return { };
}

export type RouterExtendsOptions = GetExtendsOptions<typeof getRouterExtendsOptions>;
