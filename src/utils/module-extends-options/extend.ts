import type { AppRouterOptions } from './type';

export function getExtendExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ExtendExtendsOptions = ReturnType<typeof getExtendExtendsOptions>;
