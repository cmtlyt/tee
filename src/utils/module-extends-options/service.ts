import type { AppRouterOptions } from './type';

export function getServiceExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ServiceExtendsOptions = ReturnType<typeof getServiceExtendsOptions>;
