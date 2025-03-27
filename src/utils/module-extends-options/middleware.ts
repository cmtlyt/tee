import type { TeeKoa } from '../../types';
import type { AppRouterOptions } from './type';

type MiddlewareCtx = Parameters<TeeKoa.Application['middleware'][number]>[0];

export function getMiddlewareExtendsOptions({ router }: AppRouterOptions) {
  const getMatchLayer = (ctx: MiddlewareCtx) => {
    const { path, method } = ctx;
    const matchLayrt = router.match(path, method).path.find(item => item.opts.end);
    return matchLayrt;
  };
  return {
    getMatchLayer,
    getMatchPath(ctx: MiddlewareCtx) {
      const matchLayrt = getMatchLayer(ctx);
      if (!matchLayrt)
        return '';
      return matchLayrt.path;
    },
    getParams(ctx: MiddlewareCtx) {
      const { path } = ctx;
      const matchLayrt = getMatchLayer(ctx);
      if (!matchLayrt)
        return {};
      return matchLayrt.params(path, matchLayrt.captures(path));
    },
  };
}

export type MiddlewareExtendsOptions = ReturnType<typeof getMiddlewareExtendsOptions>;
