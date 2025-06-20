/* eslint-disable ts/consistent-type-definitions */
import type { ConfigFile } from './types';

export * from './cli/bootstrap';
export * from './cli/build';
export * from './cli/run-prod';
export * from './constant';
export * from './define';
export type { TeeOptions } from './types';

/**
 * 定义一个 tee 配置
 */
export function defineTeeConfig(config: ConfigFile): ConfigFile {
  return config;
}

export { getEnv } from './utils';

export type { Defu as MergeConfig } from 'defu';

// eslint-disable-next-line ts/no-namespace
declare namespace Tee {
  interface IController {}
  interface IExtend {}
  interface IMiddlewares {}
  interface IRouterSchema {}
  interface IService {}

  interface IComputedConfig {}

  type TeeModules = {
    extend: IExtend;
    config: IComputedConfig;
    middlewares: IMiddlewares;
    controller: IController;
    service: IService;
    routerSchema: IRouterSchema;
  };

  interface AT {
    [key: string]: Record<string, any>;
  }
  type AdapterType<T extends string> = AT[T];

  type Application = AdapterType<'Application'> & {};
  type TeeRouter = AdapterType<'TeeRouter'> & {};
  type Middleware = AdapterType<'Middleware'> & {};

  type ModuleOptions = {
    modules: TeeModules;
  };

  type AppOptions = ModuleOptions & {
    app: Application;
  };

  type RouterOptions = {
    router: TeeRouter;
  };

  interface MEO {
    [key: string]: Record<string, any>;
  }

  interface SetupOptionMap {
    config: AppOptions & MEO['config'];
    controller: AppOptions & MEO['controller'];
    extend: AppOptions & MEO['extend'];
    middleware: AppOptions & RouterOptions & MEO['middleware'];
    router: AppOptions & RouterOptions & MEO['router'];
    routerSchema: AppOptions & MEO['routerSchema'];
    service: AppOptions & MEO['service'];

    [key: string]: AppOptions;
  }

  interface MidOpts {}
}

export default Tee;
