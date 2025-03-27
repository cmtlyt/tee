import type KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { ConfigFile, TeeKoa, TeeOptions } from './types';

interface DefineMiddlewareOptions {
  needWrap?: boolean;
}

interface DefineMiddlewareNeedWrapOptions extends DefineMiddlewareOptions {
  needWrap: true;
}

export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => (...args: any[]) => TeeKoa.Middleware>(callback: C, options: DefineMiddlewareNeedWrapOptions): C;
export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => TeeKoa.Middleware>(callback: C): C;
export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => (...args: any[]) => any>(callback: C, _options?: DefineMiddlewareOptions): C {
  return callback;
}

export function defineConfig<C extends (options: TeeOptions<'config'>) => Record<string, any>>(callback: C): C {
  return callback;
}

export function defineRouter<C extends (options: Required<TeeOptions<'router'>>) => void>(callback: C): C {
  return callback;
}

export interface TeeContext extends KoaRouter.RouterContext<Koa.DefaultState, TeeKoa.Context> {}

export function defineController<C extends (options: TeeOptions<'controller'>) => new (...args: any) => any>(callback: C): C {
  return callback;
}

export function defineService<C extends (options: TeeOptions<'service'>) => new (...args: any) => any>(callback: C): C {
  return callback;
}

export function defineExtend<C extends (options: TeeOptions<'extend'>) => any>(callback: C): C {
  return callback;
}

export function defineRouterSchema<C extends (options: TeeOptions<'routerSchema'>) => any>(callback: C): C {
  return callback;
}

export function defineTeeConfig(config: ConfigFile): ConfigFile {
  return config;
}

export function defineEntry<C extends (app: TeeKoa.Application, router: KoaRouter) => void>(callback: C): C {
  return callback;
}
