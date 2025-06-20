import type { ModuleExtendsOptions as BaseModuleExtendsOptions, ModuleExtendsFuncs } from '../../base-types';
import type { TeeRouter } from '../types';
import type { MiddlewareExtendsOptions } from './middleware';
import type { RouterSchemaExtendsOptions } from './router-schema';
import type { AppRouterOptions } from './type';
import { camelCase } from 'scule';
import { BUILT_IN_MODULES } from '../../../constant';
import { getMiddlewareExtendsOptions } from './middleware';
import { getRouterSchemaExtendsOptions } from './router-schema';

function getExtendsFunc(moduleType: keyof BaseModuleExtendsOptions) {
  switch (moduleType) {
    case 'middleware':{
      return getMiddlewareExtendsOptions;
    }
    case 'routerSchema':{
      return getRouterSchemaExtendsOptions;
    }
    case 'config':
    case 'controller':
    case 'extend':
    case 'router':
    case 'service':
      return () => ({});
    default:
      moduleType satisfies never;
      return () => ({});
  }
}

const builtinModuleSet = new Set([...BUILT_IN_MODULES, 'middleware']);

function getModuleType(p: keyof ModuleExtendsFuncs) {
  return camelCase(/^get(.*?)ExtendsOptions$/.exec(String(p))?.[1] || '');
}

export type ModuleExtendsOptions = BaseModuleExtendsOptions & { middleware: MiddlewareExtendsOptions; routerSchema: RouterSchemaExtendsOptions };

// @ts-expect-error overload getRouterExtensdOptions
interface KoaModuleExtendsOptions extends ModuleExtendsFuncs<AppRouterOptions, ModuleExtendsOptions> {
  getRouterExtendsOptions: (option: AppRouterOptions & { globalRouter: TeeRouter }) => BaseModuleExtendsOptions['router'];
}

export const moduleExtendsOptions: KoaModuleExtendsOptions = new Proxy({} as any, {
  get(_, p: keyof ModuleExtendsFuncs) {
    const moduleType = getModuleType(p);
    if (!moduleType || !builtinModuleSet.has(moduleType)) {
      throw new Error(`${String(p)} 无内置支持`);
    }
    return getExtendsFunc(moduleType as any);
  },
});
