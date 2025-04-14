import type { AppRouterOptions, GetExtendsOptions } from './type';

/**
 * service 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getServiceExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ServiceExtendsOptions = GetExtendsOptions<typeof getServiceExtendsOptions>;
