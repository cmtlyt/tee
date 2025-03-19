import type KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { ConfigFile, TeeKoa } from './types';

export type TeeOptions<T extends string> = TeeKoa.SetupOptionMap[T];

export function defineMiddleware<C extends (options: TeeOptions<'middleware'>) => TeeKoa.Middleware>(callback: C): C {
  return callback;
}

export function defineConfig<C extends (options: TeeOptions<'config'>) => Record<string, any>>(callback: C): C {
  return callback;
}

export function defineRouter<C extends (options: Required<TeeOptions<'router'>>) => void>(callback: C): C {
  return callback;
}

export interface TeeContext extends KoaRouter.RouterContext<Koa.DefaultState, TeeKoa.Context> {}

export function defineController<C extends (options: TeeOptions<'controller'>) => new (options: TeeOptions<'controller'>) => any>(callback: C): C {
  return callback;
}

export function defineService<C extends (options: TeeOptions<'service'>) => new (options: TeeOptions<'service'>) => any>(callback: C): C {
  return callback;
}

export function defineExtend<C extends (options: TeeOptions<'extend'>) => any>(callback: C): C {
  return callback;
}

export function defineTeeConfig(config: ConfigFile): ConfigFile {
  return config;
}

export function defineEntry<C extends (app: TeeKoa.Application, router: KoaRouter) => void>(callback: C): C {
  return callback;
}
