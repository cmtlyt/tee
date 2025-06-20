import type { Jiti } from 'jiti';
import type { Server } from 'node:http';
import type Tee from '..';
import type { CoreAdapter } from '../core-adapter';
import type { JsonSchema } from './schema-type';

export { Tee };

/**
 * 内置模块类型
 */
export type ModuleType = 'controller' | 'service' | 'middlewares' | 'router' | 'config' | 'extend' | 'routerSchema';

export interface ModuleInfo {
  content: any;
  [key: string]: any;
}

export interface FileInfo {
  /**
   * 模块类型
   */
  type: ModuleType;
  /**
   * 模块路径
   */
  path: string;
  /**
   * 模块相对路径, 相对于源码目录
   */
  relativePath: string;
  /**
   * 模块名称
   */
  name: string;
  /**
   * 模块名称分隔
   */
  nameSep: string[];
  /**
   * 模块内容
   */
  moduleInfo?: ModuleInfo;
}

export type FileInfoMap = Record<ModuleType, FileInfo[]>;

export interface LoadModuleOptions {
  /**
   * 直接替代模块加载器, 用于解析模块
   */
  parser?: (mod: any, options: Pick<LoadModuleOptions, Exclude<keyof LoadModuleOptions, 'parser'>>) => any;
  /**
   * 获取模块加载器选项
   */
  getOptions?: (type: string, mod: any, options: Record<string, any>) => any;

  [key: string]: any;
}

export type DeepRequired<O> = O extends (...args: any[]) => any ? O : O extends object ? {
  [K in keyof O]-?: DeepRequired<O[K]>;
} : O;

export interface GenerateTypeOptions {
  /**
   * 源码目录
   * @default src
   */
  sourceDir?: string;
  /**
   * 生成类型文件函数
   */
  generateTypeFunc?: (fileInfo: FileInfoMap) => string | Promise<string>;
  /**
   * 模块加载器选项
   */
  loadModuleOptions?: Partial<Record<ModuleType, LoadModuleOptions>>;
  /**
   * 模块钩子
   */
  hooks?: {
    /**
     * 模块加载前钩子
     */
    onModulesLoadBefore?: (type: string, modules: FileInfo[]) => any;
    /**
     * 模块文件加载完成钩子
     */
    onModuleLoaded?: (moduleInfo: DeepRequired<FileInfo>) => any;
    /**
     * 模块加载完成钩子
     */
    onModulesLoaded?: (type: string, modules: DeepRequired<FileInfo>[]) => any;
  };
  loadOptions?: Omit<LoadOptions, 'moduleHook'>;
}

type CopyPathItem = { from: string; to: string } | [string, string];

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
  /**
   * 复制目录
   * @default []
   */
  copyPath?: Array<CopyPathItem>;
}

export interface ModuleLoadedContext {
  /**
   * 应用实例
   */
  app: Tee.Application;
  /**
   * 路由实例
   */
  router: Tee.TeeRouter;
  /**
   * 模块
   */
  modules: Tee.TeeModules;
  /**
   * 模块信息
   */
  moduleInfo: DeepRequired<FileInfo>;
}

export interface ModuleHandlerContext {
  /**
   * 模块类型
   */
  type: string;
  /**
   * 模块内容
   */
  mod: any;
  /**
   * 应用实例
   */
  app: Tee.Application;
  /**
   * 路由实例
   */
  router: Tee.TeeRouter;
}

export interface ModuleHook {
  /**
   * 模块加载完成钩子
   *
   * 用于将模块内容注入到上下文
   *
   * 返回 true 表示已处理不进行默认处理, 返回 false 则表示未处理并执行默认处理, 如果不存在默认处理方式则跳出警告
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
}

export interface TypeInfo {
  [key: string]: string | TypeInfo;
}

export interface GenerateTypeExtendsConfig {
  importContent?: string | ((typeInfoMap: TypeInfo) => string | Promise<string>);
  typeContent?: string | ((typeInfoMap: TypeInfo) => string | Promise<string>);
}

export interface GenerateTypeConfig {
  /**
   * 自定义需要返回值类型的模块
   */
  customNeedReturnTypeModules?: string[];
  /**
   * 是否使用绝对路径
   * @default false
   */
  useAbsolutePath?: boolean;
  extendsInfo?: GenerateTypeExtendsConfig;
  getInterface?: (moduleType: string, typeInfoMap: TypeInfo) => void | string | false | Promise<string | void | false>;
}

export interface LoadOptions {
  /**
   * 需要忽略的模块
   * @default []
   */
  ignoreModules?: string[];
  /**
   * 需要忽略的文件
   * @default fileName => fileName.startsWith('_')
   */
  ignoreFile: RegExp | RegExp[] | ((fileName: string, filePath: string) => boolean);
  /**
   * 模块加载顺序
   * @default ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router']
   */
  loadModuleOrder?: (ModuleType | string)[];
  /**
   * 模块钩子
   */
  moduleHook?: ModuleHook;
}

export interface LoadOptions {
  /**
   * 需要忽略的模块
   * @default []
   */
  ignoreModules?: string[];
  /**
   * 需要忽略的文件
   * @default fileName => fileName.startsWith('_')
   */
  ignoreFile: RegExp | RegExp[] | ((fileName: string, filePath: string) => boolean);
  /**
   * 模块加载顺序
   * @default ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router']
   */
  loadModuleOrder?: (ModuleType | string)[];
  /**
   * 模块钩子
   */
  moduleHook?: ModuleHook;
}

export interface LoadOptions {
  /**
   * 需要忽略的模块
   * @default []
   */
  ignoreModules?: string[];
  /**
   * 需要忽略的文件
   * @default fileName => fileName.startsWith('_')
   */
  ignoreFile: RegExp | RegExp[] | ((fileName: string, filePath: string) => boolean);
  /**
   * 模块加载顺序
   * @default ['config', 'extend', 'routerSchema', 'service', 'middlewares', 'controller', 'router']
   */
  loadModuleOrder?: (ModuleType | string)[];
  /**
   * 模块钩子
   */
  moduleHook?: ModuleHook;
}

export interface ConfigFile {
  /**
   * 核心适配器
   */
  adapter?: CoreAdapter;
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
   * 构建配置
   */
  build?: BuildConfig;
  /**
   * 类型生成配置
   */
  generateTypeConfig?: GenerateTypeConfig;
  /**
   * 内置中间件选项
   */
  middlewareOptions?: Tee.MidOpts;
  /**
   * 模块加载配置
   */
  loadOptions?: LoadOptions;
}

export type RouterDataSchema = Partial<{
  response: Record<string, JsonSchema>;
  [key: string]: JsonSchema | Record<string, JsonSchema>;
} & Record<DataKey, JsonSchema>>;

export type BaseRouterSchema = Record<RequestMethod | string & {}, RouterDataSchema>;

export type RouterSchema = Partial<BaseRouterSchema>;

export interface RouterInfo {
  filePath: string;
  path: string | RegExp;
  schema?: DeepRequired<RouterSchema>;
  schemaPath: string;
  prefix?: string;
}

export interface Storage {
  routerInfoMap: Record<string, RouterInfo>;
  /**
   * 应用实例
   */
  app: Tee.Application;
  /**
   * 路由实例
   */
  router: Tee.TeeRouter;
  /**
   * 模块
   */
  modules: Tee.TeeModules;
  /**
   * 配置
   */
  config: DeepRequired<ConfigFile>;
  /**
   * 生成类型文件函数
   */
  options: GenerateTypeOptions;
  /**
   * jiti
   */
  jiti: Jiti;
  /**
   * 监听服务
   */
  server: Server;
  /**
   * 是否是生产环境
   */
  isProd: boolean;
  /**
   * 开发环境配置
   */
  devOptions: DevOptions;
  /**
   * 是否禁用 consola
   */
  disabledConsola: boolean;
}

export interface DevOptions {
  /**
   * 项目包路径
   * @default /
   */
  pkgPath: string;
  /**
   * 源码目录
   * @default src
   */
  sourceDir: string;
  /**
   * 启动端口
   * @default 3000
   */
  port: number;
  /**
   * 是否是命令行
   * @default false
   */
  isCli: boolean;
}

export type TeeOptions<T extends string> = Tee.SetupOptionMap[T];

export type DataKey = 'params' | 'query' | 'body';

export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';
