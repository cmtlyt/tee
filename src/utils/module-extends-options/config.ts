import type { AppRouterOptions, GetExtendsOptions } from './type';

/**
 * config 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getConfigExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ConfigExtendsOptions = GetExtendsOptions<typeof getConfigExtendsOptions>;
