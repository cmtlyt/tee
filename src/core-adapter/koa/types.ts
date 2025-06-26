import type { Options as CorsOptions } from '@koa/cors';
import type { Options as MulterOptions } from '@koa/multer';
import type KoaRouter from '@koa/router';
import type Koa from 'koa';
import type { KoaBodyMiddlewareOptions } from 'koa-body';
import type { Options as StaticOptions } from 'koa-static';
import type Tee from '../..';
import type { AppImpl, CoreAdapter, RouterImpl } from '../base-types';
import type { appKey, routerKey } from './constant';

export interface KoaAppImpl extends AppImpl {
  use: Application['use'];
}

export interface KoaRouterImpl extends RouterImpl {
  use: TeeRouter['use'];
  registerRoutes: (router: KoaRouter, moduleRouter: KoaRouter) => KoaRouter;
}

export interface KoaAdapter extends CoreAdapter {
  [appKey]: Application;
  [routerKey]: TeeRouter;
  app: KoaAppImpl;
  router: KoaRouterImpl;
}

export interface Context {}

export interface Application extends Tee.Application, Koa<Koa.DefaultState, Context> {}

export interface TeeRouter extends KoaRouter {}

export interface Middleware extends Koa.Middleware<Koa.DefaultContext, Context> {}

export interface KoaAdapterTypes {
  Application: Application;
  TeeRouter: TeeRouter;
  Middleware: Middleware;
}

export type TeeMiddlewareCtx = Parameters<Middleware>[0];

export interface TeeContext extends KoaRouter.RouterContext<Koa.DefaultState, Context> {}

export interface KoaMiddlewareOptions {
  cors?: CorsOptions | false;
  multer?: (MulterOptions & { uploadDir?: string }) | false;
  bodyParse?: Partial<KoaBodyMiddlewareOptions> | false;
  static?: (StaticOptions & { dir?: string; path?: string }) | false;
}
