import { noop } from '@cmtlyt/base';
import { createConsola } from 'consola';
import { getStorage } from '../storage';

/**
 * 日志输出工具
 */
export const consola = new Proxy(createConsola({}), {
  get(target, prop, receiver) {
    if (getStorage('disabledConsola', false))
      return noop;
    return Reflect.get(target, prop, receiver);
  },
  apply(target, thisArg, argArray) {
    if (getStorage('disabledConsola', false))
      return;
    return Reflect.apply(target as any, thisArg, argArray);
  },
});
