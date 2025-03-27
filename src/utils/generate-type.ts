import type { FileInfo, FileInfoMap, ModuleType } from '../types';
import { readPackageJSON } from 'pkg-types';
import { pascalCase } from 'scule';
import { NEED_READ_PROTOTYPE_TYPES, NEED_RETURN_TYPES } from '../constant';
import { getStorage } from '../storage';

export function getItemType(item: Pick<FileInfo, 'type' | 'relativePath' | 'path'>) {
  const { generateTypeConfig: { customNeedReturnTypeModules, useAbsolutePath } } = getStorage('config');
  const path = useAbsolutePath ? item.path : `./${item.relativePath}`;
  if (!path)
    return '{}';
  if (NEED_RETURN_TYPES.includes(item.type) || customNeedReturnTypeModules.includes(item.type))
    return `Awaited<ReturnType<typeof import('${path}')['default']>>${NEED_READ_PROTOTYPE_TYPES.includes(item.type) ? `['prototype']` : ''}`;
  return `typeof import('${path}')['default']${NEED_READ_PROTOTYPE_TYPES.includes(item.type) ? `['prototype']` : ''}`;
}

interface TypeInfo {
  [key: string]: string | TypeInfo;
}

function generateTypeInfo(fileInfoMap: FileInfoMap) {
  const { ignoreModules } = getStorage('config');
  const typeInfo: TypeInfo = {};
  for (const type in fileInfoMap) {
    if (ignoreModules.includes(type))
      continue;
    const fileInfos = fileInfoMap[type as ModuleType];
    fileInfos.forEach((item) => {
      const { nameSep } = item;
      const target = [type, ...nameSep].slice(0, -1).reduce((tree, name) => tree[name] ||= {} as any, typeInfo);
      target[nameSep.at(-1)!] = getItemType(item);
    });
  }
  return typeInfo;
}

function getSpace(indent: number) {
  return ' '.repeat(indent + 2);
}

function generateType(typeInfoMap: TypeInfo, indent = 0) {
  const typeList: string[] = [];
  for (const name in typeInfoMap) {
    const typeInfo = typeInfoMap[name];
    const objFlag = typeof typeInfo === 'object';
    objFlag && typeList.push(`${getSpace(indent)}${indent ? `${name}: {` : `interface I${pascalCase(name)} {`}`);
    if (objFlag) {
      typeList.push(generateType(typeInfo, indent + 2));
    }
    else {
      typeList.push(`${getSpace(indent)}${name}: ${typeInfo};`);
    }
    objFlag && typeList.push(`${getSpace(indent)}}`);
  }
  return typeList.join('\n');
}

export async function generateTypeString(fileInfo: FileInfoMap) {
  const { name } = await readPackageJSON(import.meta.url);

  const typeInfoMap = generateTypeInfo(fileInfo);

  const typeContent = generateType(typeInfoMap);

  return `import { MergeConfig } from '@cmtlyt/tee';\nexport {};\ndeclare module '${name}' {\n${typeContent}\n  #{configType}\n}`;
}
