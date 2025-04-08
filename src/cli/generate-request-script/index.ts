import type TeeKoa from '../..';
import type { DataKey, RequestMethod, RouterDataSchema, RouterInfo, RouterSchema } from '../../types';
import fs from 'node:fs';
import path from 'node:path';
import { noop } from '@cmtlyt/base';
import { pick_ } from '@cmtlyt/base/fp/utils';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import { camelCase } from 'scule';
import { generateTypes } from 'untyped';
import { getStorage, setStorage } from '../../storage';
import { getPkgInfo, loadModule, parseConfig, parseOptions } from '../../utils';
import { API_METHOD_SYMBOL, API_TYPE_SYMBOL, template } from './template';

function filterValidRouter(routerInfoMap: Record<string, RouterInfo>) {
  const validRouterInfoMap: Record<string, RouterInfo> = {};

  for (const key in routerInfoMap) {
    const routerInfo = routerInfoMap[key];
    validRouterInfoMap[key] = routerInfo;
  }

  return validRouterInfoMap;
}

type TypeInfo = Partial<Record<DataKey | 'response', string>>;

export type MethodTypeInfo = {
  path: string | RegExp;
  schemaPath: string;
  params: string[];
} & Partial<Record<RequestMethod, TypeInfo>>;

function getDataKeyName(key: string): DataKey {
  switch (key) {
    case 'params':
      return 'params';
    case 'query':
      return 'query';
    case 'data':
    case 'body':
      return 'body';
    default:
      return key as DataKey;
  }
}

function getRouterParams(path: string) {
  const splitPath = path.split('/');
  const params: string[] = [];
  splitPath.forEach((item) => {
    if (item.startsWith(':')) {
      params.push(item.slice(1));
    }
  });
  return params;
}

function getRouterDataSchema(dataKey: string, schema: RouterDataSchema) {
  if (dataKey === 'response') {
    return schema.response?.['200'] || schema.response?.default || {};
  }
  return schema[dataKey];
}

function parseRouterDataSchema(methodSchema: RouterDataSchema) {
  const typeInfo: TypeInfo = {};
  for (const dataKey in methodSchema) {
    const schema = getRouterDataSchema(dataKey, methodSchema)!;
    const declaration = generateTypes(schema, { addDefaults: false, addExport: false, allowExtraKeys: true });
    typeInfo[getDataKeyName(dataKey)] = declaration.slice(declaration.indexOf('{')).replace(/\n\s*/g, ' ');
  }
  return typeInfo;
}

function parseMethodSchema(schemaMap: RouterSchema) {
  const methodTypeInfo: Partial<Record<RequestMethod, TypeInfo>> = {};
  for (const method in schemaMap) {
    const methodSchema = schemaMap[method as RequestMethod];
    methodTypeInfo[method as RequestMethod] = parseRouterDataSchema(methodSchema!);
  }
  return methodTypeInfo;
}

function parseTypeInfo(routerInfoMap: Record<string, RouterInfo>) {
  const typeInfoList: MethodTypeInfo[] = [];
  for (const stringPath in routerInfoMap) {
    const routerSchema = routerInfoMap[stringPath];
    const { schema: schemaMap, path } = routerSchema;
    const baseMethodTypeInfo: MethodTypeInfo = { path, schemaPath: stringPath, params: getRouterParams(stringPath) };
    if (!schemaMap)
      continue;
    const methodTypeInfo = parseMethodSchema(schemaMap);
    typeInfoList.push(Object.assign(baseMethodTypeInfo, methodTypeInfo));
  }
  return typeInfoList;
}

function getMethodName(method: string, path: string) {
  const splitPath = path.split('/').filter(item => item && !item.startsWith(':'));
  return camelCase(`${method}/${splitPath.join('/')}`);
}

function getMethodOptionsType(typeInfo: TypeInfo) {
  const optionsType: string[] = [];
  for (const dataKey in typeInfo) {
    const type = typeInfo[dataKey as DataKey];
    optionsType.push(`${dataKey}: ${type}`);
  }
  return `{ ${optionsType.join(', ')} }`;
}

interface APIInfo {
  type: string;
  request: string;
}

function parseAPIInfo(typeInfoList: MethodTypeInfo[]) {
  const apiInfoList: APIInfo[] = [];
  typeInfoList.forEach((item) => {
    const { path: _, schemaPath, params, ...methodType } = item;
    for (const method in methodType) {
      const { response, ...typeInfo } = methodType[method as RequestMethod]!;
      const methodName = getMethodName(method, schemaPath);
      const apiInfo = {
        type: `${methodName}: <T = ${response || 'unknown'}>(option: ${getMethodOptionsType(typeInfo)}) => Promise<T>`,
        request: `${methodName}: request(${JSON.stringify(Object.assign({ method: method.toLowerCase() }, pick_(['path', 'schemaPath', 'params'], item)))})`,
      };
      apiInfoList.push(apiInfo);
    }
  });
  return apiInfoList;
}

function parseAPIContentInfo(apiInfo: APIInfo[]) {
  const { type, method } = apiInfo.reduce<{ type: string[]; method: string[] }>((prev, cur) => {
    prev.type.push(cur.type);
    prev.method.push(cur.request);
    return prev;
  }, { type: [], method: [] });
  return {
    type: type.join(',\n  '),
    method: method.join(',\n    '),
  };
}

function generateAPIFile(contentInfo: { type: string; method: string }) {
  return template.replace(API_TYPE_SYMBOL, contentInfo.type).replace(API_METHOD_SYMBOL, contentInfo.method);
}

export async function generateRequestScriptCli() {
  setStorage('disabledConsola', true);
  globalThis.console = new Proxy({}, { get: () => noop }) as Console;

  const { port, sourceDir } = await parseConfig();
  const { pkgPath } = await getPkgInfo();
  const devOptions = { pkgPath, sourceDir, port, isCli: true };
  const options = await parseOptions(devOptions);

  const app = new Koa() as TeeKoa.Application;
  const router = new KoaRouter();

  setStorage('app', app);
  setStorage('router', router);

  await loadModule(app, router, options);

  const routerInfoMap = getStorage('routerInfoMap');
  const validRouterInfoMap = filterValidRouter(routerInfoMap);

  const typeInfoList = parseTypeInfo(validRouterInfoMap);
  const apiInfoList = parseAPIInfo(typeInfoList);
  const contentInfo = parseAPIContentInfo(apiInfoList);

  const outputContent = generateAPIFile(contentInfo);

  const outputFile = path.resolve(pkgPath, './lib/api.ts');

  if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  }

  fs.writeFileSync(outputFile, outputContent);
}
