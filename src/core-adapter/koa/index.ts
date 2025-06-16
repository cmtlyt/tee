import type { KoaAdapter, KoaAppImpl, KoaRouterImpl } from './types';

export type { KoaAdapter };

export function createKoaAdapter(): KoaAdapter {
  return {
    id: 'koa',
    app: {} as KoaAppImpl,
    router: {} as KoaRouterImpl,
  } satisfies KoaAdapter;
}
