import type { CoreAdapter } from '../base-types';
import type { Application, KoaAdapter, KoaAdapterTypes, KoaAppImpl, KoaMiddlewareOptions, KoaRouterImpl, TeeContext, TeeRouter } from './types';
import process from 'node:process';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import { registerUtils } from '../register-center';
import { appKey, routerKey } from './constant';
import { initBuiltInMiddleware } from './init-built-in-middleware';
import { getLoadModuleOptions } from './loader-utils';

export type { ModuleExtendsOptions } from './module-extends-options';
export type { KoaAdapterTypes as AdapterTypes, KoaAdapter, KoaMiddlewareOptions as MiddlewareOptions, TeeContext };

let _adapter: KoaAdapter;

export function createKoaAdapter(): KoaAdapter {
  if (_adapter)
    return _adapter;

  let app: Application = new Koa();
  let router: TeeRouter = new KoaRouter();

  const adapter: KoaAdapter = _adapter = {
    id: Symbol('koa'),
    name: 'koa',
    get [appKey]() {
      return app;
    },
    get [routerKey]() {
      return router;
    },
    app: {
      getInstance(force = false) {
        return force ? app = new Koa() : app;
      },
      use(...args) {
        return app.use(...args);
      },
      listen(...args) {
        return app.listen(...args);
      },
    } satisfies KoaAppImpl,
    router: {
      getInstance(force = false) {
        return force ? router = new KoaRouter() : router;
      },
      use(...args) {
        return router.use(...args as any);
      },
      registerRoutes(router, moduleRouter) {
        return router.use(moduleRouter.routes(), moduleRouter.allowedMethods());
      },
      getRoutesPaths(router: KoaRouter) {
        return router.stack.map(item => item.path);
      },
    } satisfies KoaRouterImpl,
  } as any;

  _registerUtils(adapter);

  return adapter;
}

/**
 * 获取当前环境
 *
 * 目前仅用于 config 模块的读取和合并
 */
function getEnv() {
  if (process.env.TEE_ENV)
    return process.env.TEE_ENV;
  const { [appKey]: app } = _adapter;
  if (!app) {
    return 'local';
  }
  if (app.env === 'development')
    return 'local';
  if (app.env === 'production')
    return 'production';
  return app.env || 'local';
}

function _registerUtils(adapter: CoreAdapter) {
  registerUtils(adapter, {
    getEnv,
    getLoadModuleOptions: getLoadModuleOptions as any,
    initBuiltInMiddleware: initBuiltInMiddleware as any,
  });
}
