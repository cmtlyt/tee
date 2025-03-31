import type { TeeKoa } from '../../types';

export type AppRouterOptions = TeeKoa.AppOptions & TeeKoa.RouterOptions;

export type GetExtendsOptions<T extends (...args: any[]) => Record<string, any>> = Omit<ReturnType<T>, 'transform'>;
