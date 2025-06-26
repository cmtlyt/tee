import type { Application, TeeRouter } from './types';
import KoaRouter from '@koa/router';
import { getStorage } from '../../storage';
import { moduleExtendsOptions } from './module-extends-options';

/**
 * 获取每个模块加载时需要的入参
 */
export function getLoadModuleOptions(app: Application, router: TeeRouter) {
  const modules = getStorage('modules');

  const appRouterOptions = { app, router, modules };

  return {
    config: { app, modules, ...moduleExtendsOptions.getConfigExtendsOptions(appRouterOptions) },
    controller: { app, modules, ...moduleExtendsOptions.getControllerExtendsOptions(appRouterOptions) },
    extend: { app, modules, ...moduleExtendsOptions.getExtendExtendsOptions(appRouterOptions) },
    middlewares: { app, modules, router, ...moduleExtendsOptions.getMiddlewareExtendsOptions(appRouterOptions) },
    router: { getOptions: () => {
      const localRouter = new KoaRouter();
      return {
        app,
        modules,
        router: localRouter,
        ...moduleExtendsOptions.getRouterExtendsOptions({
          ...appRouterOptions,
          router: localRouter,
          globalRouter: router,
        }),
      };
    } },
    routerSchema: { getOptions: () => ({ app, modules, ...moduleExtendsOptions.getRouterSchemaExtendsOptions(appRouterOptions) }) },
    service: { app, modules, ...moduleExtendsOptions.getServiceExtendsOptions(appRouterOptions) },
  };
}
