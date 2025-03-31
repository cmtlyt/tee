import type { AppRouterOptions, GetExtendsOptions } from './type';

export function getRouterSchemaExtendsOptions(_: AppRouterOptions) {
  const handler = {
    prefix: '',
    setPrefix(prefix: string) {
      this.prefix = prefix;
    },
    getPrefix() {
      return this.prefix;
    },
    transform(mod: any) {
      const result: Record<string, any> = {};
      const prefix = this.prefix;
      for (const key in mod) {
        result[`${prefix}${key}`] = mod[key];
      }
      return result;
    },
  };
  return new Proxy(handler, {
    get(target, p, receiver) {
      const result = Reflect.get(target, p, receiver);
      if (typeof result === 'function')
        return result.bind(target);
      return result;
    },
  });
}

export type RouterSchemaExtendsOptions = GetExtendsOptions<typeof getRouterSchemaExtendsOptions>;
