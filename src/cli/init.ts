import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readPackageJSON } from 'pkg-types';
import { getPkgInfo, parseConfig } from '../utils';
import { generateCoverType } from '../utils/generate-type';

function getTeeConfigFile(name = '@cmtlyt/tee') {
  return `import { defineTeeConfig } from '${name}';
import { createKoaAdapter } from '${name}/koa';

export default defineTeeConfig({
  adapter: createKoaAdapter(),
});
`;
}

function initConfigFile(pkgPath: string, name = '@cmtlyt/tee') {
  const configFilePath = resolve(pkgPath, 'tee.config.ts');
  if (!existsSync(configFilePath)) {
    writeFileSync(configFilePath, getTeeConfigFile(name));
  }
}

export async function initCli() {
  const { pkgPath } = await getPkgInfo();
  const { name } = await readPackageJSON(import.meta.url);

  // tee.config.ts 文件初始化
  initConfigFile(pkgPath, name);

  await parseConfig();
  const typeDeclarations = await generateCoverType();
  const coverFilePath = resolve(pkgPath, 'tee.d.ts');

  // tee.d.ts 文件初始化
  writeFileSync(coverFilePath, typeDeclarations);
}
