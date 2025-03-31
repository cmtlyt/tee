import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getServiceExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ServiceExtendsOptions = GetExtendsOptions<typeof getServiceExtendsOptions>;
