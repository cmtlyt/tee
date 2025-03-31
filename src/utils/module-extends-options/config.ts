import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getConfigExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ConfigExtendsOptions = GetExtendsOptions<typeof getConfigExtendsOptions>;
