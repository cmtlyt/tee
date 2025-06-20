import type { ConfigFile, DeepRequired, GenerateTypeOptions } from '../types';
import { getArray, isArray, isFunc } from '@cmtlyt/base';
import { resolve } from 'pathe';
import { defu } from '.';
import { MODULE_LOAD_ORDER } from '../constant';
import { getStorage, hasStorage, setStorage } from '../storage';
import { getPkgInfo } from './get-info';
import { jitiImport } from './jiti-import';

function transformConfig(config: DeepRequired<ConfigFile>) {
  const { loadOptions: { ignoreFile } } = config;
  /// 将 ignoreFile 转为函数
  if (!isFunc(ignoreFile)) {
    if (!(ignoreFile instanceof RegExp || isArray(ignoreFile))) {
      throw new TypeError('ignoreFile must be a function or an array of RegExp');
    }
    const _ignoreFile = getArray(ignoreFile);
    if (!_ignoreFile.every(item => item instanceof RegExp)) {
      throw new TypeError('ignoreFile must be a function or an array of RegExp');
    }
    config.loadOptions.ignoreFile = (fileName: string) => {
      return _ignoreFile.some((reg: RegExp) => reg.test(fileName));
    };
  }
  return config as any;
}

/**
 * 解析配置文件的内容
 */
export async function parseConfig() {
  if (hasStorage('config'))
    return getStorage('config');
  const { pkgPath } = await getPkgInfo();
  const configPath = resolve(pkgPath, 'tee.config.ts');
  const config: ConfigFile = await jitiImport(configPath, true).then(mod => mod.default, () => ({}));
  const tempConfig = defu(config, {
    port: 3000,
    sourceDir: resolve(pkgPath, 'src'),
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
    loadOptions: {
      ignoreModules: [] as string[],
      ignoreFile: fileName => fileName.startsWith('_'),
      loadModuleOrder: MODULE_LOAD_ORDER,
      moduleHook: {
        loaded: () => false,
        parser: () => undefined,
      },
    },
  } satisfies ConfigFile);
  const finishedConfig = transformConfig(tempConfig);
  setStorage('config', finishedConfig);
  return finishedConfig;
}

/**
 * 补全类型生成所需要的选项
 */
export async function parseOptions(options?: GenerateTypeOptions) {
  if (hasStorage('options'))
    return getStorage('options');
  const { sourceDir, loadOptions } = await parseConfig();
  const finishedOptions = defu(options || {}, { sourceDir, loadOptions });
  setStorage('options', finishedOptions);
  return finishedOptions;
}
