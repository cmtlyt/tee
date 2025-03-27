import type { AppRouterOptions } from './type';

export function getRouterSchemaExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type RouterSchemaExtendsOptions = ReturnType<typeof getRouterSchemaExtendsOptions>;
