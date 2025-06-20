import { createJiti } from 'jiti';
import { resolve } from 'pathe';
import { getStorage, hasStorage, setStorage } from '../storage';
import { getPkgInfo } from './get-info';

/**
 * 获取 jiti 实例
 */
export async function getJiti() {
  if (hasStorage('jiti'))
    return getStorage('jiti');
  const { pkgPath } = await getPkgInfo();
  const jiti = createJiti(resolve(pkgPath, 'main.ts'), {
    moduleCache: false,
  });
  setStorage('jiti', jiti);
  return jiti;
}

/**
 * 导入一个模块
 *
 * dev 环境使用 jiti 实例进行导入, prod 环境使用 import 函数进行导入
 *
 * TODO: 因外部环境可能使用无后缀的相对路径导入, 原生 import 支持不太行, 所以还是使用 jiti 来代替导入, 后续打包重构之后会对逻辑进行调整
 *
 * 因为初始化时需要动态加载 ts 模块, 而 node 默认不支持 ts 文件的导入需要依赖三方工具提供该能力
 */
export async function jitiImport(id: string, _useJiti = false) {
  // if (!useJiti && getStorage('isProd', false))
  //   return import(id);
  const jiti = await getJiti();
  return jiti.import<any>(id);
}
