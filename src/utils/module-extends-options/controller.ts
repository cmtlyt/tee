import type { AppRouterOptions } from './type';

export function getControllerExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ControllerExtendsOptions = ReturnType<typeof getControllerExtendsOptions>;
