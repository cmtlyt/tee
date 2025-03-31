import type { ModuleType } from '../types';

export const NEED_READ_PROTOTYPE_TYPES = ['controller', 'service'];

export const NEED_RETURN_TYPES = ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router'];

export const MODULE_LOAD_ORDER: ModuleType[] = ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router'];
