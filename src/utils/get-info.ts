import type { FileInfoMap, GenerateTypeOptions, ModuleType } from '../types';
import fg from 'fast-glob';
import { dirname, resolve } from 'pathe';
import { resolvePackageJSON } from 'pkg-types';
import { camelCase } from 'scule';
import { generateTypeString } from './generate-type';

export async function getPkgInfo() {
  const pkg = await resolvePackageJSON();
  return { pkg, pkgPath: dirname(pkg) };
}

export async function getFileInfoMap({ sourceDir = 'src' }) {
  const { pkgPath } = await getPkgInfo();
  const srcPath = resolve(pkgPath, sourceDir);
  const files = await fg.glob(['./**/*.{ts,js}', '!**/*.d.ts'], {
    absolute: true,
    cwd: srcPath,
  });

  const fileInfoMap = files.reduce((fileInfo, path) => {
    const relativePath = path.slice(srcPath.length).replace(/^[\\/]/, '');
    const [type, ...names] = relativePath.replace(/\.[^.]*$/, '').split(/[\\/]/);
    if (!names?.length)
      return fileInfo;
    (fileInfo[type as ModuleType] ||= []).push({
      type: type as ModuleType,
      path,
      relativePath,
      name: camelCase(names.join('-').replace(/\./g, '-')),
      nameSep: names.map(name => camelCase(name)),
    });
    return fileInfo;
  }, {} as FileInfoMap);

  return { pkgPath, sourcePath: srcPath, fileInfoMap };
}

export async function getFileInfoMapAndTypeDeclarations({
  sourceDir = 'src',
  generateTypeFunc = generateTypeString,
}: GenerateTypeOptions) {
  const { fileInfoMap, ...other } = await getFileInfoMap({ sourceDir });

  const typeDeclarations = await generateTypeFunc(fileInfoMap);

  return { ...other, fileInfoMap, typeDeclarations };
}
