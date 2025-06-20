import { z as zod } from 'zod/v4';

export * from 'zod/v4';

const ignoreProps = new Set(['globalRegistry'] as const);

type IgnoreProps = typeof ignoreProps extends Set<infer T> ? T : '';

/**
 * zod 实例代理 (重写部分内容)
 */
export const z: Omit<typeof zod, IgnoreProps> = new Proxy(zod, {
  get(target, p, receiver) {
    if (ignoreProps.has(p as any)) {
      throw new Error(`z.${String(p)} 无法通过内置脚本生成类型, 请使用其他方式定义`);
    }
    return Reflect.get(target, p, receiver);
  },
});

export default z;
