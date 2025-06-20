import type { DeepRequired, FileInfo, GenerateTypeOptions, ModuleInfo, ModuleType, Tee } from '../types';
import { noop } from '@cmtlyt/base';
import { assoc, configMerge, consola, createRouterInfoMap, createRouterSchemaInfoMap, getFileInfoMapAndTypeDeclarations, jitiImport } from '.';
import { MODULE_LOAD_ORDER } from '../constant';
import { getCoreUtils } from '../core-adapter';
import { getStorage, getStorages, setStorage } from '../storage';

/**
 * 获取单个模块加载结束后的方法
 *
 * 例如一个 router 模块加载成功后就会执行这个方法
 */
export function getModuleLoaded(app: Tee.Application, router: Tee.TeeRouter) {
  const { adapter, loadOptions: { moduleHook } } = getStorage('config');
  const { modules } = getStorages(['modules']);
  const { loaded } = moduleHook;

  return async (moduleInfo: DeepRequired<FileInfo>) => {
    const { type: mtype, moduleInfo: { content: module }, nameSep } = moduleInfo;
    const result = await loaded({ app, router, modules, moduleInfo });
    if (result)
      return;
    switch (mtype) {
      case 'router':{
        createRouterInfoMap(moduleInfo);
        // 合并所有子路由到主路由中
        adapter.router.registerRoutes(router, module);
        return;
      }
      case 'routerSchema':{
        createRouterSchemaInfoMap(moduleInfo);
        return assoc([mtype, ...nameSep], module, modules);
      }
      case 'config':
      case 'controller':
      case 'service':
      case 'extend':
      case 'middlewares':{
        // 树状对象
        return assoc([mtype, ...nameSep], module, modules);
      }
      default:{
        mtype satisfies never;
        consola.warn('unknown type:', mtype);
      }
    }
  };
}

/**
 * 获取模块的处理方法
 */
function getModuleHandler(loadModuleOptions: GenerateTypeOptions['loadModuleOptions']) {
  const { config: { loadOptions: { moduleHook } } } = getStorages(['config']);
  const { parser: otherModParser } = moduleHook;

  return async (mtype: ModuleType, mod: any): Promise<ModuleInfo> => {
    const { parser, getOptions, ..._options } = loadModuleOptions?.[mtype] || {};
    const { transform = (mod: any) => mod, ...options } = getOptions?.(mtype, mod, _options) || _options;
    if (parser) {
      const result = parser(mod, options);
      if (typeof result !== 'undefined')
        return result;
    }
    switch (mtype) {
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
        const otherOptions = { type: mtype, mod, ...options };
        const result = await otherModParser(otherOptions);
        if (typeof result !== 'undefined')
          return { ...otherOptions, content: result };
        mtype satisfies never;
      }
        return { content: undefined };
    }
  };
}

/**
 * 基本加载模块方法
 */
export async function baseLoadModule(options: GenerateTypeOptions) {
  const { loadModuleOptions, loadOptions, hooks } = options;
  const { onModuleLoaded = noop, onModulesLoaded = noop, onModulesLoadBefore = noop } = hooks || {};
  const { fileInfoMap, ...other } = await getFileInfoMapAndTypeDeclarations(options);
  const { ignoreModules: hostIgnoreModules, loadModuleOrder: hostLoadModuleOrder = MODULE_LOAD_ORDER } = loadOptions || {};

  const ignoreModules = new Set(hostIgnoreModules);
  const loadModuleOrder = new Set(hostLoadModuleOrder);

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

  for (const type of (loadModuleOrder.values() as unknown as ModuleType[])) {
    const items = fileInfoMap[type];
    if (!items)
      continue;
    await modulesLoadProcess(type, items);
  }

  await Promise.all(Object.keys(fileInfoMap).filter(type =>
    !loadModuleOrder.has(type) && !ignoreModules.has(type),
  ).map(async (type) => {
    const items = fileInfoMap[type as ModuleType];
    if (!items)
      return;
    return modulesLoadProcess(type, items);
  }));

  return { ...other, fileInfoMap };
}

/**
 * 默认配置的模块加载方法
 */
export async function loadModule(app: Tee.Application, router: Tee.TeeRouter, options?: GenerateTypeOptions) {
  const { config } = getStorages(['config']);
  const { adapter } = config!;
  const coreUtils = getCoreUtils(adapter);
  const teeModules = {} as Tee.TeeModules;
  setStorage('modules', teeModules);

  const loadModuleOptions = coreUtils.getLoadModuleOptions(app, router);

  let configType = '';

  const { typeDeclarations, ...rest } = await baseLoadModule({
    loadModuleOptions,
    hooks: {
      onModulesLoaded(type, modules) {
        if (type === 'config') {
          const { config, configTypeDeclarations } = configMerge(modules);
          configType = configTypeDeclarations;
          teeModules.config = config;
        }
      },
      onModuleLoaded: getModuleLoaded(app, router),
    },
    ...(options || {}),
  });

  return { ...rest, typeDeclarations: typeDeclarations.replace('#{configType}', configType) };
}
