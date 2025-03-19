import type { ModuleType } from '../types';

export const NEED_READ_PROTOTYPE_TYPES = ['controller', 'service'];

export const NEED_RETURN_TYPES = ['config', 'extend', 'middlewares', 'router', 'controller', 'service'];

export const MODULE_LOAD_ORDER: ModuleType[] = ['config', 'extend', 'routerSchema', 'middlewares', 'controller', 'service', 'router'];
