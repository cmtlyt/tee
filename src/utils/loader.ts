import type { DeepRequired, FileInfo, GenerateTypeOptions, ModuleInfo, ModuleType, TeeKoa } from '../types';
import KoaRouter from '@koa/router';
import { assoc, configMerge, consola, parseConfig } from '.';
import { MODULE_LOAD_ORDER } from '../constant';
import { getStorage, getStorages } from '../storage';
import { createRouterInfoMap, createRouterSchemaInfoMap } from './data-map';
import { getFileInfoMapAndTypeDeclarations } from './get-info';
import { jitiImport } from './jiti-import';
import { getConfigExtendsOptions, getControllerExtendsOptions, getExtendExtendsOptions, getMiddlewareExtendsOptions, getRouterExtendsOptions, getRouterSchemaExtendsOptions, getServiceExtendsOptions } from './module-extends-options';

/**
 * 获取单个模块加载结束后的方法
 *
 * 例如一个 router 模块加载成功后就会执行这个方法
 */
export function getModuleLoaded(app: TeeKoa.Application, router: KoaRouter) {
  const { moduleHook } = getStorage('config');
  const { loaded } = moduleHook;

  return async (moduleInfo: DeepRequired<FileInfo>) => {
    const { type: _type, moduleInfo: { content: module }, nameSep, name } = moduleInfo;
    const result = await loaded({ app, router, moduleInfo });
    if (result)
      return;
    switch (_type) {
      case 'router':{
        createRouterInfoMap(moduleInfo);
        // 合并所有子路由到主路由中
        router.use(module.routes(), module.allowedMethods());
        return;
      }
      case 'config':
      case 'controller':
      case 'service':
        // 树状对象
        return assoc([_type, ...nameSep], module, app);
      case 'extend':
        // 添加到上下文对象
        return (app as any)[name] = module;
      case 'routerSchema':{
        createRouterSchemaInfoMap(moduleInfo);
        return assoc([_type, ...nameSep], module, app);
      }
      case 'middlewares':{
        const target = app.middlewares ||= {};
        // 扁平对象
        return Object.assign(target, { [name]: module });
      }
      default:{
        _type satisfies never;
        consola.warn('unknown type:', _type);
      }
    }
  };
}

/**
 * 获取模块的处理方法
 */
function getModuleHandler(loadModuleOptions: GenerateTypeOptions['loadModuleOptions']) {
  const { config: { moduleHook } } = getStorages(['config']);
  const { parser: otherModParser } = moduleHook;

  return async (_type: ModuleType, mod: any): Promise<ModuleInfo> => {
    const { parser, getOptions, ..._options } = loadModuleOptions?.[_type] || {};
    const { transform = (mod: any) => mod, ...options } = getOptions?.(_type, mod, _options) || _options;
    if (parser) {
      const result = parser(mod, options);
      if (typeof result !== 'undefined')
        return result;
    }
    switch (_type) {
      case 'controller':
      case 'service':{
        const Mod = await transform(await mod(options));
        return { ...options, content: new Proxy(new Mod(options), {
          get(target, prop, receiver) {
            const result = Reflect.get(target, prop, receiver);
            if (typeof result === 'function')
              return result.bind(target);
            return result;
          },
        }) };
      }
      case 'config':
      case 'extend':
      case 'middlewares':
      case 'routerSchema':{
        return { ...options, content: await transform(await mod(options)) };
      }
      case 'router':{
        await mod(options);
        return { ...options, content: await transform(options.router) };
      }
      default: {
        const otherOptions = { type: _type, mod, ...options };
        const result = await otherModParser(otherOptions);
        if (typeof result !== 'undefined')
          return { ...otherOptions, content: result };
        _type satisfies never;
      }
        return { content: undefined };
    }
  };
}

/**
 * 基本加载模块方法
 */
export async function baseLoadModule(options: GenerateTypeOptions) {
  const { loadModuleOptions, loadModuleOrder = MODULE_LOAD_ORDER, hooks = {} } = options;
  const { onModuleLoaded = () => {}, onModulesLoaded = () => {}, onModulesLoadBefore = () => {} } = hooks;
  const { fileInfoMap, ...other } = await getFileInfoMapAndTypeDeclarations(options);
  const { ignoreModules } = await parseConfig();

  const moduleHandler = getModuleHandler(loadModuleOptions || {} as Record<string, any>);

  /**
   * 加载模块所有文件
   *
   * 例如 router/test1.ts 和 router/test2.ts
   */
  const modulesLoadProcess = async (type: string, items: FileInfo[]) => {
    await onModulesLoadBefore(type, items);
    await Promise.all(items.map(async (item) => {
      const moduleInfo = await moduleHandler(item.type, (await jitiImport(item.path)).default);
      await onModuleLoaded({ ...item, moduleInfo });
      if (!moduleInfo)
        return;
      item.moduleInfo = moduleInfo;
    }));
    await onModulesLoaded(type, items as any);
    consola.success(`${type} module load done`);
  };

  for (const type of (loadModuleOrder as ModuleType[])) {
    const items = fileInfoMap[type];
    if (!items)
      continue;
    await modulesLoadProcess(type, items);
  }

  await Promise.all(Object.keys(fileInfoMap).filter(type =>
    !loadModuleOrder.includes(type) && !ignoreModules.includes(type),
  ).map(async (type) => {
    const items = fileInfoMap[type as ModuleType];
    if (!items)
      return;
    return modulesLoadProcess(type, items);
  }));

  return { ...other, fileInfoMap };
}

/**
 * 获取每个模块加载时需要的入参
 */
function getLoadModuleOptions(app: TeeKoa.Application, router: KoaRouter) {
  const appRouterOptions = { app, router };
  return {
    config: { app, ...getConfigExtendsOptions(appRouterOptions) },
    controller: { app, ...getControllerExtendsOptions(appRouterOptions) },
    extend: { app, ...getExtendExtendsOptions(appRouterOptions) },
    middlewares: { app, router, ...getMiddlewareExtendsOptions(appRouterOptions) },
    router: { getOptions: () => {
      const localRouter = new KoaRouter();
      return {
        app,
        router: localRouter,
        ...getRouterExtendsOptions({
          ...appRouterOptions,
          router: localRouter,
          globalRouter: router,
        }),
      };
    } },
    routerSchema: { getOptions: () => ({ app, ...getRouterSchemaExtendsOptions(appRouterOptions) }) },
    service: { app, ...getServiceExtendsOptions(appRouterOptions) },
  };
}

/**
 * 默认配置的模块加载方法
 */
export async function loadModule(app: TeeKoa.Application, router: KoaRouter, options?: GenerateTypeOptions) {
  let configType = '';
  const { typeDeclarations, ...rest } = await baseLoadModule({
    loadModuleOptions: getLoadModuleOptions(app, router),
    hooks: {
      onModulesLoaded(type, modules) {
        if (type === 'config') {
          const { config, configTypeDeclarations } = configMerge(app, modules);
          configType = configTypeDeclarations;
          app.context.config = config;
          // @ts-expect-error any
          delete app.config;
        }
      },
      onModuleLoaded: getModuleLoaded(app, router),
    },
    ...(options || {}),
  });
  return { ...rest, typeDeclarations: typeDeclarations.replace('#{configType}', configType) };
}
