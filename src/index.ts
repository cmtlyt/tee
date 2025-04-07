import type KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { ConfigExtendsOptions, ControllerExtendsOptions, ExtendExtendsOptions, MiddlewareExtendsOptions, RouterExtendsOptions, RouterSchemaExtendsOptions, ServiceExtendsOptions } from './utils/module-extends-options';

export * from './cli/bootstrap';
export * from './cli/build';
export * from './cli/run-prod';
export * from './constant';
export * from './define';

export type { TeeMiddlewareCtx, TeeOptions } from './types';
export { getEnv } from './utils';

export type { Defu as MergeConfig } from 'defu';

// eslint-disable-next-line ts/no-namespace
declare namespace TeeKoa {
  interface IController {}
  interface IExtend {}
  interface IMiddlewares {}
  interface IRouterSchema {}
  interface IService {}

  interface IComputedConfig {}

  interface Context extends Koa.DefaultContext {
    config: IComputedConfig;
  }

  interface Application extends Koa<Koa.DefaultState, Context>, IExtend {
    middlewares: IMiddlewares;
    controller: IController;
    service: IService;
    routerSchema: IRouterSchema;
  }

  interface AppOptions {
    app: Application;
  }

  interface RouterOptions {
    router: KoaRouter;
  }

  interface SetupOptionMap {
    config: AppOptions & ConfigExtendsOptions;
    controller: AppOptions & ControllerExtendsOptions;
    extend: AppOptions & ExtendExtendsOptions;
    middleware: AppOptions & RouterOptions & MiddlewareExtendsOptions;
    router: AppOptions & RouterOptions & RouterExtendsOptions;
    routerSchema: AppOptions & RouterSchemaExtendsOptions;
    service: AppOptions & ServiceExtendsOptions;

    [key: string]: {
      app: Application;
    };
  }

  interface Middleware extends Koa.Middleware<Koa.DefaultState, Context> {}
}

export default TeeKoa;
