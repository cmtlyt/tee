import type { FileInfo, FileInfoMap, ModuleType, TypeInfo } from '../types';
import { isNull } from '@cmtlyt/base';
import { readPackageJSON } from 'pkg-types';
import { pascalCase } from 'scule';
import { NEED_READ_PROTOTYPE_TYPES, NEED_RETURN_TYPES } from '../constant';
import { getStorage } from '../storage';

export function getItemType(item: Pick<FileInfo, 'type' | 'relativePath' | 'path'>) {
  const { generateTypeConfig: { customNeedReturnTypeModules, useAbsolutePath } } = getStorage('config');
  const path = useAbsolutePath ? item.path : item.relativePath && `./${item.relativePath}`;
  if (!path)
    return '{}';
  if (NEED_RETURN_TYPES.includes(item.type) || customNeedReturnTypeModules.includes(item.type))
    return `Awaited<ReturnType<typeof import('${path}')['default']>>${NEED_READ_PROTOTYPE_TYPES.includes(item.type) ? `['prototype']` : ''}`;
  return `typeof import('${path}')['default']${NEED_READ_PROTOTYPE_TYPES.includes(item.type) ? `['prototype']` : ''}`;
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
  Object.keys(typeInfoMap).sort().forEach((name) => {
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
  });
  return typeList.join('\n');
}

// function getObjectFlatValues(typeInfoMap: TypeInfo, propName: string) {
//   const result = typeInfoMap[propName];
//   if (!result)
//     return [];
//   if (typeof result === 'string')
//     return [result];
//   const names: string[] = [];
//   for (const name in result) {
//     names.push(...getObjectFlatValues(result, name));
//   }
//   return names;
// }

// function routerSchemaTypeMerge(typeInfoMap: TypeInfo) {
//   const allExtendsTypes = getObjectFlatValues(typeInfoMap, 'routerSchema');

//   if (!allExtendsTypes.length)
//     return '';

//   delete typeInfoMap.routerSchema;

//   return `interface IRouterSchema extends ${allExtendsTypes.join(', ')}, Record<string, any> {}`;
// }

export async function generateTypeString(fileInfo: FileInfoMap) {
  const { name } = await readPackageJSON(import.meta.url);
  const { generateTypeConfig: { extendsInfo, getInterface } } = getStorage('config');
  const originTypeInfoMap = generateTypeInfo(fileInfo);
  const typeInfoMap = { ...originTypeInfoMap };

  const userTypeContent: string[] = [];

  await Promise.all(Object.keys(typeInfoMap).sort().map(async (type) => {
    const _interface = await getInterface(type, typeInfoMap[type] as TypeInfo);
    if (!_interface)
      return;
    delete typeInfoMap[type];
    userTypeContent.push(_interface);
  }));

  const routerSchemaTypeContent = ''; // routerSchemaTypeMerge(typeInfoMap);

  const typeContent = generateType(typeInfoMap);

  let computedType = `import { MergeConfig } from '${name}';\n#{extendsImport}\nexport {};\ndeclare module '${name}' {\n${typeContent}\n  ${userTypeContent.join('\n')}\n  ${routerSchemaTypeContent}\n  #{configType}\n  #{extendsType}\n}`;

  if (extendsInfo) {
    const { importContent, typeContent } = extendsInfo;
    if (!isNull(importContent)) {
      const content = typeof importContent === 'string' ? importContent : await importContent(typeInfoMap);
      computedType = computedType.replace('#{extendsImport}', content);
    }
    if (!isNull(typeContent)) {
      const content = typeof typeContent === 'string' ? typeContent : await typeContent(typeInfoMap);
      computedType = computedType.replace('#{extendsType}', content);
    }
  }

  return computedType;
}
