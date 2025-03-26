import type { ConfigFile, GenerateTypeOptions } from '../types';
import defu from 'defu';
import { resolve } from 'pathe';
import { MODULE_LOAD_ORDER } from '../constant';
import { getStorage, setStorage } from '../storage';
import { getPkgInfo } from './get-info';
import { jitiImport } from './jiti-import';

export async function parseConfig() {
  if (getStorage('config'))
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
    },
  });
  setStorage('config', finishedConfig);
  return finishedConfig;
}

export async function parseOptions(options?: GenerateTypeOptions) {
  if (getStorage('options'))
    return getStorage('options');
  const { sourceDir, loadModuleOrder } = await parseConfig();
  const finishedOptions = defu(options || {}, { sourceDir, loadModuleOrder });
  setStorage('options', finishedOptions);
  return finishedOptions;
}
