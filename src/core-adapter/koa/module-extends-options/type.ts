import type { Tee } from '../../../types';
import type { Application, TeeRouter } from '../types';

export interface AppRouterOptions {
  app: Application;
  router: TeeRouter;
  modules: Tee.TeeModules;
}

export type GetExtendsOptions<T extends (...args: any[]) => Record<string, any>> = Omit<ReturnType<T>, 'transform'>;
