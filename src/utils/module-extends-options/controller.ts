import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getControllerExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ControllerExtendsOptions = GetExtendsOptions<typeof getControllerExtendsOptions>;
