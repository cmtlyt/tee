import type { TypeSpecificSchema } from '../../types/schema-type';
import type { AppRouterOptions, GetExtendsOptions } from './type';
import { isPlainObject } from '@cmtlyt/base';

/** string 类型 schema */
const stringType = { type: 'string' } as const;
/** number 类型 schema */
const numberType = { type: 'number' } as const;
/** boolean 类型 schema */
const booleanType = { type: 'boolean' } as const;
/** 获取 array 类型 schema */
function getArrayType(items: TypeSpecificSchema<'array'>['items'], other?: Omit<TypeSpecificSchema<'array'>, 'items'>) {
  return { type: 'array', items, ...other } as const;
}
/** 获取 object 类型 schema */
function getObjectType<O extends TypeSpecificSchema<'object'>['properties']>(properties: O, required?: (keyof O)[], other?: Omit<TypeSpecificSchema<'object'>, 'properties' | 'required'>) {
  if (!required && isPlainObject(properties)) {
    required = Object.keys(properties) as any;
  }
  return { type: 'object', properties, required, ...other } as const;
}

/**
 * router-schema 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getRouterSchemaExtendsOptions(_: AppRouterOptions) {
  const handler = {
    prefix: '',
    stringType,
    numberType,
    booleanType,
    getArrayType,
    getObjectType,
    setPrefix(prefix: string) {
      this.prefix = prefix;
    },
    getPrefix() {
      return this.prefix;
    },
    transform(mod: any) {
      const result: Record<string, any> = {};
      const prefix = this.prefix;
      for (const key of Object.keys(mod)) {
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
