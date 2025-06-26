import type { coreUtilsKey } from '../register-center';
import type { CoreUtils } from './core-utils';

export * from './core-utils';
export * from './module-extends-options';

interface BaseImpl {
  getInstance: (force?: boolean) => any;
  use: (...args: any[]) => any;
}

export interface AppImpl extends BaseImpl {
  listen: (port: number, hostname?: string, callback?: () => void) => any;
}

export interface RouterImpl extends BaseImpl {
  registerRoutes: (router: any, moduleRouter: any) => any;
  getRoutesPaths: (router: any) => (string | RegExp)[];
}

export interface CoreAdapter {
  id: symbol;
  name: string;
  app: AppImpl;
  router: RouterImpl;
  [coreUtilsKey]: CoreUtils;
}
