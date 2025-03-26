import type KoaRouter from '@koa/router';
import type { Jiti } from 'jiti';
import type { Server } from 'node:http';

import type TeeKoa from '.';

export { TeeKoa };

export type ModuleType = 'controller' | 'service' | 'middlewares' | 'router' | 'config' | 'extend' | 'routerSchema';

export interface FileInfo {
  type: ModuleType;
  path: string;
  relativePath: string;
  name: string;
  nameSep: string[];
  module?: any;
}

export type FileInfoMap = Record<ModuleType, FileInfo[]>;

export interface LoadModuleOptions {
  parser?: (mod: any, options: Pick<LoadModuleOptions, Exclude<keyof LoadModuleOptions, 'parser'>>) => any;

  [key: string]: any;
}

export type DeepRequired<O> = O extends (...args: any[]) => any ? O : O extends object ? {
  [K in keyof O]-?: DeepRequired<O[K]>;
} : O;

export interface GenerateTypeOptions {
  sourceDir?: string;
  generateTypeFunc?: (fileInfo: FileInfoMap) => string | Promise<string>;
  loadModuleOptions?: Partial<Record<ModuleType, LoadModuleOptions>>;
  loadModuleOrder?: (ModuleType | string)[];
  hooks?: {
    onModulesLoadBefore?: (type: string, modules: FileInfo[]) => any;
    onModuleLoaded?: (moduleInfo: DeepRequired<FileInfo>) => any;
    onModulesLoaded?: (type: string, modules: FileInfo[]) => any;
  };
}

export interface BuildConfig {
  /**
   * 构建输出目录
   * @default dist
   */
  outDir?: string;
  /**
   * 是否清除构建目录
   * @default false
   */
  clean?: boolean;
}

export interface ModuleLoadedContext {
  app: TeeKoa.Application;
  router: KoaRouter;
  moduleInfo: DeepRequired<FileInfo>;
}

export interface ModuleHandlerContext {
  type: string;
  mod: any;
  app: TeeKoa.Application;
  router: KoaRouter;
}

export interface ConfigFile {
  /**
   * 启动端口
   * @default 3000
   */
  port?: number;
  /**
   * 源码目录
   * @default src
   */
  sourceDir?: string;
  /**
   * 需要忽略的模块
   * @default []
   */
  ignoreModules?: string[];
  /**
   * 模块加载顺序
   * @default ['config', 'extend', 'routerSchema', 'middlewares', 'controller', 'service', 'router']
   */
  loadModuleOrder?: (ModuleType | string)[];
  /**
   * 模块钩子
   */
  moduleHook?: {
    /**
     * 模块加载完成钩子
     *
     * 用于将模块内容注入到上下文, 只有在内置模块无法处理时调用
     *
     * 返回 true 表示已处理, 返回 false 则表示未处理并跳出警告
     */
    loaded?: (ctx: ModuleLoadedContext) => boolean | Promise<boolean>;
    /**
     * 解析模块内容钩子
     *
     * 会读取到对应目录的内容, 然后通过该钩子传递
     *
     * 该钩子的返回值将作为模块最终透出的结果
     */
    parser?: (ctx: ModuleHandlerContext) => any | Promise<any>;
  };
  /**
   * 构建配置
   */
  build?: BuildConfig;
}

export interface Storage {
  app: TeeKoa.Application;
  router: KoaRouter;
  config: DeepRequired<ConfigFile>;
  options: GenerateTypeOptions;
  jiti: Jiti;
  server: Server;
  isProd: boolean;
  devOptions: DevOptions;
}

export interface DevOptions {
  pkgPath: string;
  sourceDir: string;
  port: number;
  isCli: boolean;
}
