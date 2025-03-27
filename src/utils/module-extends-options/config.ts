import type { AppRouterOptions } from './type';

export function getConfigExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ConfigExtendsOptions = ReturnType<typeof getConfigExtendsOptions>;
