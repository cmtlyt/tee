import type KoaRouter from '@koa/router';
import type { DeepRequired, FileInfo, GenerateTypeOptions, ModuleType, TeeKoa } from '../types';
import { assoc, configMerge, consola, parseConfig } from '.';
import { MODULE_LOAD_ORDER } from '../constant';
import { getStorage, getStorages } from '../storage';
import { getFileInfoMapAndTypeDeclarations } from './get-info';
import { jitiImport } from './jiti-import';

export function getModuleLoaded(app: TeeKoa.Application, router: KoaRouter) {
  const { moduleHook } = getStorage('config');
  const { loaded } = moduleHook;

  return async (moduleInfo: DeepRequired<FileInfo>) => {
    const { type: _type, module, nameSep, name } = moduleInfo;
    switch (_type) {
      case 'router':
      // 不处理
        return;
      case 'config':
      case 'controller':
      case 'service':
      // 树状对象
        return assoc([_type, ...nameSep], module, app);
      case 'extend':
      // 添加到上下文对象
        return (app as any)[name] = module;
      case 'routerSchema':{
        const target = (app.context as any)[name] ||= {};
        // 上下文合并对象
        return Object.assign(target, module);
      }
      case 'middlewares':{
        const target = app.middlewares ||= {};
        // 扁平对象
        return Object.assign(target, { [name]: module });
      }
      default:{
        const result = await loaded({ app, router, moduleInfo });
        if (result)
          return;
        _type satisfies never;
        consola.warn('unknown type:', _type);
      }
    }
  };
}

function getModuleHandler(loadModuleOptions: GenerateTypeOptions['loadModuleOptions']) {
  const { app, router, config: { moduleHook } } = getStorages(['app', 'router', 'config']);
  const { parser: otherModParser } = moduleHook;

  return async (_type: ModuleType, mod: any) => {
    const { parser, ...options } = loadModuleOptions?.[_type] || {};
    if (parser) {
      const result = parser(mod, options);
      if (typeof result !== 'undefined')
        return result;
    }
    switch (_type) {
      case 'controller':
      case 'service':{
        const Mod = await mod(options);
        return new Proxy(new Mod(options), {
          get(target, prop, receiver) {
            const result = Reflect.get(target, prop, receiver);
            if (typeof result === 'function')
              return result.bind(target);
            return result;
          },
        });
      }
      case 'config':
      case 'extend':
      case 'middlewares':
      case 'router':{
        return mod(options);
      }
      case 'routerSchema':{
        return mod;
      }
      default: {
        const result = await otherModParser({ type: _type, mod, app, router });
        if (typeof result !== 'undefined')
          return result;
        _type satisfies never;
      }
    }
  };
}

export async function baseLoadModule(options: GenerateTypeOptions) {
  const { loadModuleOptions, loadModuleOrder = MODULE_LOAD_ORDER, hooks = {} } = options;
  const { onModuleLoaded = () => {}, onModulesLoaded = () => {}, onModulesLoadBefore = () => {} } = hooks;
  const { fileInfoMap, ...other } = await getFileInfoMapAndTypeDeclarations(options);
  const { ignoreModules } = await parseConfig();

  const moduleHandler = getModuleHandler(loadModuleOptions || {} as Record<string, any>);

  const modulesLoadProcess = async (type: string, items: FileInfo[]) => {
    await onModulesLoadBefore(type, items);
    await Promise.all(items.map(async (item) => {
      const result = await moduleHandler(item.type, (await jitiImport(item.path)).default);
      await onModuleLoaded({ ...item, module: result });
      if (!result)
        return;
      item.module = result;
    }));
    await onModulesLoaded(type, items);
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

export async function loadModule(app: TeeKoa.Application, router: KoaRouter, options?: GenerateTypeOptions) {
  let configType = '';
  const { typeDeclarations, ...rest } = await baseLoadModule({
    loadModuleOptions: {
      config: { app },
      controller: { app },
      extend: { app },
      middlewares: { app },
      router: { app, router },
      routerSchema: { app },
      service: { app },
    },
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
