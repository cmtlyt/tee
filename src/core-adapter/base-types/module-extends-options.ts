import type { Tee } from '../../types';

export type AppRouterOptions = Tee.AppOptions & Tee.RouterOptions;

export interface ModuleExtendsOptions {
  config: Record<string, any>;
  controller: Record<string, any>;
  extend: Record<string, any>;
  middleware: Record<string, any>;
  router: Record<string, any>;
  routerSchema: Record<string, any>;
  service: Record<string, any>;
}

export interface ModuleExtendsFuncs<ARO = AppRouterOptions, Opts extends Record<keyof ModuleExtendsOptions, any> = ModuleExtendsOptions> {
  getConfigExtendsOptions: (option: ARO) => Opts['config'];
  getControllerExtendsOptions: (option: ARO) => Opts['controller'];
  getExtendExtendsOptions: (option: ARO) => Opts['extend'];
  getMiddlewareExtendsOptions: (option: ARO) => Opts['middleware'];
  getRouterExtendsOptions: (option: ARO) => Opts['router'];
  getRouterSchemaExtendsOptions: (option: ARO) => Opts['routerSchema'];
  getServiceExtendsOptions: (option: ARO) => Opts['service'];
}
