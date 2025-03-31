import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getExtendExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ExtendExtendsOptions = GetExtendsOptions<typeof getExtendExtendsOptions>;
