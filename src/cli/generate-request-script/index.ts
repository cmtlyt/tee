import type { DataKey, RequestMethod, RouterDataSchema, RouterInfo, RouterSchema } from '../../types';
import type { JsonSchema, PlainJsonSchema } from '../../types/schema-type';
import fs from 'node:fs';
import path from 'node:path';
import { isNull, noop } from '@cmtlyt/base';
import { pick_ } from '@cmtlyt/base/fp/utils';
import { camelCase } from 'scule';
import { generateTypes } from 'untyped';
import { toJSONSchema as zodToJSONSchema } from 'zod/v4';
import { getStorage, setStorage } from '../../storage';
import { getPkgInfo, loadModule, parseConfig, parseOptions } from '../../utils';
import { API_METHOD_SYMBOL, API_TYPE_SYMBOL, template } from './template';

/**
 * 过滤无效的路由
 *
 * TODO: 暂时没有无效的定义, 留个口子
 */
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

/**
 * 获取 dataKey 对应的字段的名称
 */
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

/**
 * 通过字符串路径获取 params
 */
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

/**
 * 处理传入的 schema 转换为 jsonSchema
 */
function schemaTransform(schema: JsonSchema | undefined) {
  if (schema && '_zod' in schema) {
    return zodToJSONSchema(schema, {
      reused: 'inline',
      unrepresentable: 'any',
      io: 'input',
      override({ zodSchema, jsonSchema }) {
        const { def } = zodSchema._zod;
        switch (def.type) {
          case 'date': {
            jsonSchema.type = 'string';
            jsonSchema.format = 'date-time';
          }
        }
      },
    }) as PlainJsonSchema;
  }
  return schema;
}

/**
 * 获取 dataKey 对应的 schema
 */
function getRouterDataSchema(dataKey: string, schema: RouterDataSchema) {
  let result;
  if (dataKey === 'response') {
    result = (schema.response && (schema.response['200'] || schema.response.default)) || {};
  }
  else {
    result = schema[dataKey];
  }
  return schemaTransform(result);
}

/**
 * 解析 methodSchema 中对应 dataKey 的类型
 */
function parseRouterDataSchema(methodSchema: RouterDataSchema) {
  const typeInfo: TypeInfo = {};
  for (const dataKey in methodSchema) {
    const schema = getRouterDataSchema(dataKey, methodSchema)!;
    if (isNull(schema))
      continue;
    // TODO: 后续在 @cmtlyt/base 包中实现 generateTypes 支持更多的 jsonSchema 语法, 例如 anyOf, oneOf 等
    const declaration = generateTypes(schema, { addDefaults: false, addExport: false, allowExtraKeys: true, partial: true });
    typeInfo[getDataKeyName(dataKey)] = declaration.slice(declaration.indexOf('{'))
      // 压缩为单行
      .replace(/\n\s*/g, ' ')
      // 移除注释
      .replace(/\s*\/\*\*.*?\*\/\s*/g, ' ');
  }
  return typeInfo;
}

/**
 * 解析接口 methodSchema
 */
function parseMethodSchema(schemaMap: RouterSchema) {
  const methodTypeInfo: Partial<Record<RequestMethod, TypeInfo>> = {};
  for (const method in schemaMap) {
    const methodSchema = schemaMap[method as RequestMethod];
    methodTypeInfo[method as RequestMethod] = parseRouterDataSchema(methodSchema!);
  }
  return methodTypeInfo;
}

/**
 * 将 routerInfoMap 转换为 typeInfoList
 */
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

/**
 * 获取请求函数的函数名
 */
function getMethodName(method: string, path: string) {
  const splitPath = path.split('/').filter(item => item && !item.startsWith(':'));
  return camelCase(`${method}/${splitPath.join('/')}`);
}

/**
 * 获取请求函数的入参类型
 */
function getMethodOptionsType(typeInfo: TypeInfo) {
  const optionsType: string[] = [];
  for (const dataKey in typeInfo) {
    const type = typeInfo[dataKey as DataKey];
    if (dataKey === 'body') {
      optionsType.push(`body: ${type} | FormData`);
      continue;
    }
    optionsType.push(`${dataKey}: ${type}`);
  }
  return `{ ${optionsType.join(', ')} }`;
}

interface APIInfo {
  type: string;
  request: string;
}

/**
 * 将 typeInfo 解析为 api 信息
 *
 * 包含类型和请求方法
 */
function parseAPIInfo(typeInfoList: MethodTypeInfo[]) {
  const apiInfoList: APIInfo[] = [];
  typeInfoList.forEach((item) => {
    const { path: _, schemaPath, params, ...methodType } = item;
    for (const method in methodType) {
      const { response, ...typeInfo } = methodType[method as RequestMethod]!;
      const methodName = getMethodName(method, schemaPath);
      const optionType = getMethodOptionsType(typeInfo);
      const apiInfo = {
        type: `${methodName}: <T = ${response || 'unknown'}>(option: ${optionType}) => Promise<T>`,
        request: `${methodName}: request(${JSON.stringify(Object.assign({ method: method.toLowerCase() }, pick_(['path', 'schemaPath', 'params'], item)))})`,
      };
      apiInfoList.push(apiInfo);
    }
  });
  return apiInfoList;
}

/**
 * 解析 api 信息为实际代码内容
 */
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

/**
 * 生成前端请求接口的代码文件
 */
function generateAPIFile(contentInfo: { type: string; method: string }) {
  return template.replace(API_TYPE_SYMBOL, contentInfo.type).replace(API_METHOD_SYMBOL, contentInfo.method);
}

/**
 * 根据 router-schema 生成前端请求接口的代码文件
 *
 * TODO: 优化逻辑, 请求代码只需要根据 router 和 routerSchema 模块即可生成
 */
export async function generateRequestScriptCli() {
  // 禁用日志输出, 因为会载入代码收集依赖, 所以需要将 console 也进行代理, 屏蔽常用输出
  setStorage('disabledConsola', true);
  globalThis.console = new Proxy({}, { get: () => noop }) as Console;

  // 初始化应用
  const { adapter } = await parseConfig();
  const { pkgPath } = await getPkgInfo();

  const options = await parseOptions();

  const app = adapter.app.getInstance();
  const router = adapter.router.getInstance();

  setStorage('app', app);
  setStorage('router', router);

  await loadModule(app, router, options);

  // 处理文件依赖信息, 生成前端请求文件
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
