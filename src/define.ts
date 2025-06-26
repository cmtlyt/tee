import type { TAnyFunc } from '@cmtlyt/base';
import type { TeeOptions } from '.';
import type { RouterSchema, Tee } from './types';

interface DefineMiddlewareOptions {
  needWrap?: boolean;
}

interface DefineMiddlewareNeedWrapOptions extends DefineMiddlewareOptions {
  needWrap: true;
}

declare function _TdefineMiddleware<C extends (options: TeeOptions<'middleware'>) => (...args: any[]) => Tee.Middleware>(callback: C, options: DefineMiddlewareNeedWrapOptions): C;
declare function _TdefineMiddleware<C extends (options: TeeOptions<'middleware'>) => Tee.Middleware>(callback: C): C;

interface Defines {
  defineMiddleware: typeof _TdefineMiddleware;
  defineConfig: <C extends (options: TeeOptions<'config'>) => Record<string, any>>(callback: C) => C;
  defineRouter: <C extends (options: Required<TeeOptions<'router'>>) => void>(callback: C) => C;
  defineController: <C extends (options: TeeOptions<'controller'>) => new (...args: any) => any>(callback: C) => C;
  defineService: <C extends (options: TeeOptions<'service'>) => new (...args: any) => any>(callback: C) => C;
  defineExtend: <C extends (options: TeeOptions<'extend'>) => any>(callback: C) => C;
  defineRouterSchema: <C extends (options: TeeOptions<'routerSchema'>) => Record<string, RouterSchema>>(callback: C) => C;
  defineEntry: <C extends (options: Tee.AppOptions & Tee.RouterOptions) => void>(callback: C) => C;
}

const defineFuncNames = new Set<keyof Defines>([
  'defineConfig',
  'defineController',
  'defineEntry',
  'defineExtend',
  'defineMiddleware',
  'defineRouter',
  'defineRouterSchema',
  'defineService',
]);

const defineMap: Defines = new Proxy({} as any, {
  get(_, p: keyof Defines) {
    if (!defineFuncNames.has(p)) {
      throw new Error(`z.${String(p)} 无法通过内置脚本生成类型, 请使用其他方式定义`);
    }
    return (c: TAnyFunc) => c;
  },
});

/** 定义一个 config */
export const defineConfig = defineMap.defineConfig;

/** 定义一个 controller */
export const defineController = defineMap.defineController;

/** 定义一个入口 */
export const defineEntry = defineMap.defineEntry;

/** 定义一个 extend */
export const defineExtend = defineMap.defineExtend;

/** 定义一个 middleware */
export const defineMiddleware = defineMap.defineMiddleware;

/** 定义一个 router */
export const defineRouter = defineMap.defineRouter;

/**
 * 定义一个 routerSchema
 *
 * 可用于自动生成前端接口请求文件
 *
 * TODO: 生成 OpenAPI 规范的请求文档
 */
export const defineRouterSchema = defineMap.defineRouterSchema;

/** 定义一个 service */
export const defineService = defineMap.defineService;
