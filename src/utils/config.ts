import type { FileInfo, TeeKoa } from '../types';
import process from 'node:process';
import defu from 'defu';
import { getItemType } from './generate-type';

export function getEnv(app: TeeKoa.Application) {
  if (process.env.TEE_ENV)
    return process.env.TEE_ENV;
  if (app.env === 'development')
    return 'local';
  if (app.env === 'production')
    return 'production';
  return app.env || 'local';
}

export function configMerge(app: TeeKoa.Application, configs: FileInfo[]) {
  const {
    default: defaultConfig = { config: {}, relativePath: '' },
    ...envConfigMap
  } = configs.reduce((result, item) => {
    const { nameSep, module, relativePath } = item;
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
      console.error(item);
      throw e;
    }
    return result;
  }, {} as Record<string, { relativePath: string; config: Record<string, any> }>);

  const env = getEnv(app);

  const envConfig = envConfigMap[env] || envConfigMap.production || { config: {} };

  const defaultConfigType = getItemType({ relativePath: defaultConfig.relativePath, type: 'config' });
  const envConfigType = getItemType({ relativePath: envConfig.relativePath, type: 'config' });
  const computedConfig = defu(envConfig.config, defaultConfig.config);

  const configTypeDeclarations = `interface IComputedConfig extends MergeConfig<${defaultConfigType}, [${envConfigType}]> {}`;

  return { config: computedConfig, configTypeDeclarations };
}
