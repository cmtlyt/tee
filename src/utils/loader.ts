/**
 * TODO: 核心抽离
 *
 * 核心概念:
 *
 * 适配器: 运行时需要的核心模块 (Koa, KoaRouter)
 * 适配器模块: 包含获取适配器的方法, 其余相关辅助方法 (tee 内部调用)
 * 辅助函数注册器: 通过适配器 id 注册对应框架的辅助函数 (tee 内部调用, 不对外部开放)
 *
 * 核心理念:
 *
 * 所有适配器模块均独立打包, 对外部导出创建适配器的方法
 * 适配器尽量少的依赖适配器模块导出的其余辅助方法, 辅助方法由 tee 内部使用, 不对外部导出
 * 默认使用 koa 适配器, 其余适配器存在不同实现, 辅助方法缺失等情况需要适配器模块自行处理
 * 如果无法实现则直接抛出错误, 而不是静默处理
 * tee 内部通过适配器 id 从适配器模块导出的注册对象中获取辅助方法
 *
 * 大致工作:
 * 重写 loader, 加载模块扩展参数从 适配器模块中统一导入
 * 抽离 koa 相关内容到适配器模块, 导出统一 api
 */

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
