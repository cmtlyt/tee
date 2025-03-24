import { createJiti } from 'jiti';
import { resolve } from 'pathe';
import { getStorage, setStorage } from '../storage';
import { getPkgInfo } from './get-info';

export async function getJiti() {
  if (getStorage('jiti'))
    return getStorage('jiti');
  const { pkgPath } = await getPkgInfo();
  const jiti = createJiti(resolve(pkgPath, 'main.ts'), {
    moduleCache: false,
  });
  setStorage('jiti', jiti);
  return jiti;
}

export async function jitiImport(id: string, useJiti = false) {
  if (!useJiti && getStorage('isProd'))
    return import(id);
  const jiti = await getJiti();
  return jiti.import<any>(id);
}
