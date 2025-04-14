import type { ModuleType } from '../types';

/**
 * 需要读取原型的模块类型
 *
 * 例如 controller 和 service 返回的是 class, 所以想要拿到方法就需要读取他的原型
 */
export const NEED_READ_PROTOTYPE_TYPES = ['controller', 'service'];

/**
 * 需要返回模块返回值内容的模块类型
 *
 * 例如模块返回的是函数, 那想要获取详细类型就需要读取他的返回值类型
 */
export const NEED_RETURN_TYPES = ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router'];

/**
 * 模块加载顺序
 */
export const MODULE_LOAD_ORDER: ModuleType[] = ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router'];
