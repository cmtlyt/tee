import type { AppImpl, CoreAdapter, RouterImpl } from '../base-types';

export interface KoaAppImpl extends AppImpl {}

export interface KoaRouterImpl extends RouterImpl {}

export interface KoaAdapter extends CoreAdapter {
  app: KoaAppImpl;
  router: KoaRouterImpl;
}
