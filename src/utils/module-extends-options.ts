import type KoaRouter from '@koa/router';
import type { TeeKoa } from '../types';

type AppRouterOptions = TeeKoa.AppOptions & TeeKoa.RouterOptions;
type MiddlewareCtx = Parameters<TeeKoa.Application['middleware'][number]>[0];

export function getMiddlewareExtendsOptions({ router }: AppRouterOptions) {
  return {
    getParams(ctx: MiddlewareCtx) {
      const { path, method } = ctx;
      const matchLayrt = router.match(path, method).path.find(item => item.opts.end);
      if (!matchLayrt)
        return {};
      return matchLayrt.params(path, matchLayrt.captures(path));
    },
  };
}

export type MiddlewareExtendsOptions = ReturnType<typeof getMiddlewareExtendsOptions>;

export function getRouterExtendsOptions(_options: AppRouterOptions & { globalRouter: KoaRouter }) {
  return { };
}

export type RouterExtendsOptions = ReturnType<typeof getRouterExtendsOptions>;

export function getConfigExtendsOptions(_options: AppRouterOptions) {
  return { };
}

export type ConfigExtendsOptions = ReturnType<typeof getConfigExtendsOptions>;

export function getExtendExtendsOptions(_options: AppRouterOptions) {
  return { };
}
export type ExtendExtendsOptions = ReturnType<typeof getExtendExtendsOptions>;

export function getControllerExtendsOptions(_options: AppRouterOptions) {
  return { };
}
export type ControllerExtendsOptions = ReturnType<typeof getControllerExtendsOptions>;

export function getServiceExtendsOptions(_options: AppRouterOptions) {
  return { };
}
export type ServiceExtendsOptions = ReturnType<typeof getServiceExtendsOptions>;

export function getRouterSchemaExtendsOptions(_options: AppRouterOptions) {
  return { };
}
export type RouterSchemaExtendsOptions = ReturnType<typeof getRouterSchemaExtendsOptions>;
