import type { AppRouterOptions, GetExtendsOptions } from './type';

/**
 * controller 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getControllerExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ControllerExtendsOptions = GetExtendsOptions<typeof getControllerExtendsOptions>;
