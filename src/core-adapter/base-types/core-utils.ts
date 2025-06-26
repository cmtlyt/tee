import type { Tee } from '../../types';

export interface CoreUtils {
  getEnv: (...args: any[]) => string;
  initBuiltInMiddleware: (app: Tee.Application) => void;
  getLoadModuleOptions: (app: Tee.Application, router: Tee.TeeRouter) => Record<string, any>;
}
