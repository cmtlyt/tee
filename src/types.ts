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
  test?: string;
  parser?: (mod: any, options: Pick<LoadModuleOptions, Exclude<keyof LoadModuleOptions, 'parser'>>) => any;

  [key: string]: any;
}

export interface GenerateTypeOptions {
  sourceDir?: string;
  generateTypeFunc?: (fileInfo: FileInfoMap) => string | Promise<string>;
  loadModuleOptions?: Partial<Record<ModuleType, LoadModuleOptions>>;
  loadModuleOrder?: (ModuleType | string)[];
  hooks?: {
    onModuleLoaded?: (moduleInfo: FileInfo) => any;
    onModulesLoaded?: (type: string, modules: FileInfo[]) => any;
  };
}

export interface BuildConfig {
  outDir?: string;
  clean?: boolean;
}

export interface ConfigFile {
  port?: number;
  sourceDir?: string;
  loadModuleOrder?: (ModuleType | string)[];
  build?: BuildConfig;
}

export interface Storage {
  app: TeeKoa.Application;
  router: KoaRouter;
  config: Record<string, any>;
  options: GenerateTypeOptions;
  jiti: Jiti;
  server: Server;
  isProd: boolean;
}
