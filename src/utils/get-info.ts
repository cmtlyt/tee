import type { FileInfoMap, GenerateTypeOptions, ModuleType } from '../types';
import fg from 'fast-glob';
import { basename, dirname, resolve } from 'pathe';
import { resolvePackageJSON } from 'pkg-types';
import { camelCase } from 'scule';
import { generateTypeString } from './generate-type';

/**
 * 获取项目 package.json 的路径和和目录
 */
export async function getPkgInfo() {
  const pkg = await resolvePackageJSON();
  return { pkg, pkgPath: dirname(pkg) };
}

/**
 * 获取模块文件信息
 */
export async function getFileInfoMap({ sourceDir = 'src', ignoreFile = (fn: string, _p: string) => fn.startsWith('_') }) {
  const { pkgPath } = await getPkgInfo();
  const srcPath = resolve(pkgPath, sourceDir);
  const files = (await fg.glob(['./**/*.{ts,js}', '!**/*.d.ts'], {
    absolute: true,
    cwd: srcPath,
  })).filter((path) => {
    const fileName = basename(path);
    return !ignoreFile(fileName, path);
  });

  const fileInfoMap = files.reduce((fileInfo, path) => {
    const relativePath = path.slice(srcPath.length).replace(/^[\\/]/, '');
    const [type, ...nameSep] = relativePath
      .replace(/\.[^.]*$/, '')
      .replace(/\./g, '-')
      .split(/[\\/]/)
      .map(item => camelCase(item));
    if (!nameSep?.length)
      return fileInfo;
    (fileInfo[type as ModuleType] ||= []).push({
      type: type as ModuleType,
      path,
      relativePath,
      name: camelCase(nameSep.join('-')),
      nameSep,
    });
    return fileInfo;
  }, {} as FileInfoMap);

  return { pkgPath, sourcePath: srcPath, fileInfoMap };
}

/**
 * 获取模块文件信息和对应的类型
 */
export async function getFileInfoMapAndTypeDeclarations({
  sourceDir = 'src',
  loadOptions,
  generateTypeFunc = generateTypeString,
}: GenerateTypeOptions) {
  const { ignoreFile } = loadOptions || {};
  const { fileInfoMap, ...other } = await getFileInfoMap({ sourceDir, ignoreFile: ignoreFile as any });

  const typeDeclarations = await generateTypeFunc(fileInfoMap);

  return { ...other, fileInfoMap, typeDeclarations };
}
