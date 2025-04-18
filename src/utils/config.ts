import type { DeepRequired, FileInfo, TeeKoa } from '../types';
import process from 'node:process';
import { defu } from '.';
import { consola } from './consola';
import { getItemType } from './generate-type';

/**
 * 获取当前环境
 *
 * 目前仅用于 config 模块的读取和合并
 */
export function getEnv(app: TeeKoa.Application) {
  if (process.env.TEE_ENV)
    return process.env.TEE_ENV;
  if (app.env === 'development')
    return 'local';
  if (app.env === 'production')
    return 'production';
  return app.env || 'local';
}

/**
 * 根据当前运行环境合并 config 模块
 */
export function configMerge(app: TeeKoa.Application, configs: DeepRequired<FileInfo>[]) {
  const {
    default: defaultConfig = { config: {}, relativePath: '' },
    ...envConfigMap
  } = configs.reduce((result, item) => {
    const { nameSep, moduleInfo: { content: module }, relativePath } = item;
    const name = nameSep.at(-1)!;
    try {
      if (name.includes('Default'))
        result.default = { relativePath, config: module };
      else if (name.includes('Local'))
        result.local = { relativePath, config: module };
      else if (name.includes('Beta'))
        result.beta = { relativePath, config: module };
      else if (name.includes('Production'))
        result.production = { relativePath, config: module };
    }
    catch (e) {
      consola.error(e, item);
      throw e;
    }
    return result;
  }, {} as Record<string, { relativePath: string; config: Record<string, any> }>);

  const env = getEnv(app);

  const envConfig = envConfigMap[env] || envConfigMap.production || { config: {} };

  const defaultConfigType = getItemType({ path: defaultConfig.relativePath, relativePath: defaultConfig.relativePath, type: 'config' });
  const envConfigType = getItemType({ path: envConfig.relativePath, relativePath: envConfig.relativePath, type: 'config' });
  const computedConfig = defu(envConfig.config, defaultConfig.config);

  // 生成 config 模块类型
  const configTypeDeclarations = `interface IComputedConfig extends MergeConfig<${defaultConfigType}, [${envConfigType}]> {}`;

  return { config: computedConfig, configTypeDeclarations };
}
