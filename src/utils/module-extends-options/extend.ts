import type { AppRouterOptions, GetExtendsOptions } from './type';

/**
 * extend 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getExtendExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ExtendExtendsOptions = GetExtendsOptions<typeof getExtendExtendsOptions>;
