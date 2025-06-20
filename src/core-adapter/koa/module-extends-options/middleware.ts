import type { RouterSchema } from '../../../types';
import type { TeeMiddlewareCtx } from '../types';
import type { AppRouterOptions, GetExtendsOptions } from './type';
import { getStorage } from '../../../storage';

/**
 * middleware 模块加载时的额外入参, 用于提供辅助方法等
 */
export function getMiddlewareExtendsOptions({ router }: AppRouterOptions) {
  const handlers = {
    getMatchLayer(ctx: TeeMiddlewareCtx) {
      const { path, method } = ctx;
      const matchLayrt = router.match(path, method).path.find(item => item.opts.end) || null;
      return matchLayrt;
    },
    getPrefix(ctx: TeeMiddlewareCtx) {
      const matchLayrt = this.getMatchLayer(ctx);
      if (!matchLayrt)
        return '';
      return matchLayrt.opts.prefix || '';
    },
    getMatchRouterSchema(ctx: TeeMiddlewareCtx): RouterSchema | null {
      const path = this.getMatchPath(ctx);
      const routerInfoMap = getStorage('routerInfoMap', {});
      const { schema } = routerInfoMap[String(path).slice(router.opts.prefix?.length || 0)] || {};
      return schema || null;
    },
    getMatchRouterInfo(ctx: TeeMiddlewareCtx) {
      const path = this.getMatchPath(ctx);
      const routerInfoMap = getStorage('routerInfoMap', {});
      return routerInfoMap[String(path).slice(router.opts.prefix?.length || 0)] || null;
    },
    getMatchPath(ctx: TeeMiddlewareCtx) {
      const matchLayrt = this.getMatchLayer(ctx);
      if (!matchLayrt)
        return '';
      return matchLayrt.path;
    },
    getParams(ctx: TeeMiddlewareCtx) {
      const { path } = ctx;
      const matchLayrt = this.getMatchLayer(ctx);
      if (!matchLayrt)
        return {};
      return matchLayrt.params(path, matchLayrt.captures(path));
    },
  };

  return new Proxy(handlers, {
    get(target, p, receiver) {
      const result = Reflect.get(target, p, receiver);
      if (typeof result === 'function')
        return result.bind(target);
      return result;
    },
  });
}

export type MiddlewareExtendsOptions = GetExtendsOptions<typeof getMiddlewareExtendsOptions>;
