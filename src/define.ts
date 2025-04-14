import type KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { ConfigFile, RouterSchema, TeeKoa, TeeOptions } from './types';

interface DefineMiddlewareOptions {
  needWrap?: boolean;
}

interface DefineMiddlewareNeedWrapOptions extends DefineMiddlewareOptions {
  needWrap: true;
}

/**
 * 定义一个中间件
 */
export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => (...args: any[]) => TeeKoa.Middleware>(callback: C, options: DefineMiddlewareNeedWrapOptions): C;
export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => TeeKoa.Middleware>(callback: C): C;
export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => (...args: any[]) => any>(callback: C, _options?: DefineMiddlewareOptions): C {
  return callback;
}

/**
 * 定义一个 config
 */
export function defineConfig<C extends (options: TeeOptions<'config'>) => Record<string, any>>(callback: C): C {
  return callback;
}

/**
 * 定义一个 router
 */
export function defineRouter<C extends (options: Required<TeeOptions<'router'>>) => void>(callback: C): C {
  return callback;
}

export interface TeeContext extends KoaRouter.RouterContext<Koa.DefaultState, TeeKoa.Context> {}

/**
 * 定义一个控制器
 */
export function defineController<C extends (options: TeeOptions<'controller'>) => new (...args: any) => any>(callback: C): C {
  return callback;
}

/**
 * 定义一个 service
 */
export function defineService<C extends (options: TeeOptions<'service'>) => new (...args: any) => any>(callback: C): C {
  return callback;
}

/**
 * 定义一个扩展
 */
export function defineExtend<C extends (options: TeeOptions<'extend'>) => any>(callback: C): C {
  return callback;
}

/**
 * 定义一个 routerSchema
 *
 * 可用于自动生成前端接口请求文件
 *
 * TODO: 生成 OpenAPI 规范的请求文档
 */
export function defineRouterSchema<C extends (options: TeeOptions<'routerSchema'>) => Record<string, RouterSchema>>(callback: C): C {
  return callback;
}

/**
 * 定义一个 tee 配置
 */
export function defineTeeConfig(config: ConfigFile): ConfigFile {
  return config;
}

/**
 * 定义一个入口
 */
export function defineEntry<C extends (app: TeeKoa.Application, router: KoaRouter) => void>(callback: C): C {
  return callback;
}
