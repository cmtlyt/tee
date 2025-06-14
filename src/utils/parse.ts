import type { ConfigFile, GenerateTypeOptions } from '../types';
import { resolve } from 'pathe';
import { defu } from '.';
import { MODULE_LOAD_ORDER } from '../constant';
import { getStorage, hasStorage, setStorage } from '../storage';
import { getPkgInfo } from './get-info';
import { jitiImport } from './jiti-import';

/**
 * 解析配置文件的内容
 */
export async function parseConfig() {
  if (hasStorage('config'))
    return getStorage('config');
  const { pkgPath } = await getPkgInfo();
  const configPath = resolve(pkgPath, 'tee.config.ts');
  const config: ConfigFile = await jitiImport(configPath, true).then(mod => mod.default, () => ({}));
  const finishedConfig = defu(config, {
    port: 3000,
    sourceDir: resolve(pkgPath, 'src'),
    ignoreModules: [] as string[],
    loadModuleOrder: MODULE_LOAD_ORDER,
    moduleHook: {
      loaded: () => false,
      parser: () => undefined,
    },
    build: {
      outDir: resolve(pkgPath, 'dist'),
      clean: false,
      copyPath: [],
    },
    generateTypeConfig: {
      customNeedReturnTypeModules: [],
      useAbsolutePath: false,
      extendsInfo: {
        importContent: '',
        typeContent: '',
      },
      getInterface: () => false,
    },
    middlewareOptions: {
      cors: {} as any,
      multer: {
        uploadDir: resolve(pkgPath, 'public', 'upload'),
      } as any,
      bodyParse: {} as any,
      static: {
        dir: resolve(pkgPath, 'public'),
        path: '/static',
      } as any,
    },
  } satisfies ConfigFile);
  setStorage('config', finishedConfig);
  return finishedConfig;
}

/**
 * 补全类型生成所需要的选项
 */
export async function parseOptions(options?: GenerateTypeOptions) {
  if (hasStorage('options'))
    return getStorage('options');
  const { sourceDir, loadModuleOrder } = await parseConfig();
  const finishedOptions = defu(options || {}, { sourceDir, loadModuleOrder });
  setStorage('options', finishedOptions);
  return finishedOptions;
}
