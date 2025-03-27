import type KoaRouter from '@koa/router';
import type Koa from 'koa';

export * from './bootstrap';
export * from './build';
export * from './constant';
export * from './define';

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

  interface Context {
    config: IComputedConfig;
    routerSchema: IRouterSchema;
  }
  interface Application extends Koa<Koa.DefaultState, Context>, IExtend {
    middlewares: IMiddlewares;
    controller: IController;
    service: IService;
  }
  interface SetupOptionMap {
    router: {
      app: Application;
      router: KoaRouter;
    };
    middleware: {
      app: Application;
      router: KoaRouter;
    };
    [key: string]: {
      app: Application;
    };
  }
  interface Middleware extends Koa.Middleware<Koa.DefaultState, Context> {}
}

export default TeeKoa;
