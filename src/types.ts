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

export interface GenerateTypeOptions {
  sourceDir?: string;
  generateTypeFunc?: (fileInfo: FileInfoMap) => string | Promise<string>;
  loadModuleOptions?: Partial<Record<ModuleType, LoadModuleOptions>>;
  loadModuleOrder?: (ModuleType | string)[];
  hooks?: {
    onModulesLoadBefore?: (type: string, modules: FileInfo[]) => any;
    onModuleLoaded?: (moduleInfo: Required<FileInfo>) => any;
    onModulesLoaded?: (type: string, modules: FileInfo[]) => any;
  };
}

export interface BuildConfig {
  outDir?: string;
  clean?: boolean;
}

export interface ModuleLoadedContext {
  app: TeeKoa.Application;
  router: KoaRouter;
  moduleInfo: Required<FileInfo>;
}

export interface ModuleHandlerContext {
  type: string;
  mod: any;
  app: TeeKoa.Application;
  router: KoaRouter;
}

export interface ConfigFile {
  port?: number;
  sourceDir?: string;
  ignoreModules?: string[];
  loadModuleOrder?: (ModuleType | string)[];
  moduleHook?: {
    loaded?: (ctx: ModuleLoadedContext) => boolean | Promise<boolean>;
    parser?: (ctx: ModuleHandlerContext) => any | Promise<any>;
  };
  build?: BuildConfig;
}

export interface Storage {
  app: TeeKoa.Application;
  router: KoaRouter;
  config: Required<ConfigFile>;
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
