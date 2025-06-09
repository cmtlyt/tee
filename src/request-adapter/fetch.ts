import type { AdapterOptions, RequestAdapter } from './type';

function getContentType(body: AdapterOptions['body']) {
  if (body == null) {
    return;
  }
  switch (Object.prototype.toString.call(body).slice(8, -1)) {
    case 'String':
      return 'text/plain';
    case 'FormData':
      return 'multipart/form-data';
    case 'Blob':
    case 'ArrayBuffer':
      return 'application/octet-stream';
    case 'Object':
    case 'Array':
    default:
      return 'application/json';
  }
}

function getBody(body: AdapterOptions['body'], contentType?: string) {
  if (body == null) {
    return;
  }
  switch (contentType) {
    case 'text/plain':
    case 'application/octet-stream':
    case 'multipart/form-data':
      return body;
    case 'application/json':
    default:
      return JSON.stringify(body);
  }
}

function request(option: RequestInit & { url: string | URL | Request }) {
  const { url, ...rect } = option;
  return fetch(url, rect);
}

function queryValueHandler(value: any) {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return value == null ? '' : String(value);
}

function getUrl(url: string, query: AdapterOptions['query'] = {}): URL | string {
  if (!url.startsWith('http')) {
    url = `https://${location.host}${url}`;
  }
  const _url = new URL(url);
  Object.keys(query).forEach((key) => {
    _url.searchParams.append(key, queryValueHandler(query[key]));
  });
  return _url;
}

function getRequestOption(this: FetchAdapter, url: string, option: AdapterOptions) {
  const { body = null, query = {} } = option;
  // 使用 this 是为了方便用户直接改写适配器的对应方法, 但是不推荐这么做
  const _url = this.getUrl(url, query);
  const contentType = this.getContentType(body);
  const bodyContent = this.getBody(body, contentType);
  const result = { url: _url, body: bodyContent };
  return result;
}

interface FetchAdapterOptions {
  /** 基础 URL */
  baseURL?: string;
  /** 请求前处理 */
  onRequest?: (option: RequestInit & { url: string | URL | Request }) => void;
  /** 请求后处理 */
  onResponse?: (response: Response) => any;
}

interface FetchAdapter extends RequestAdapter {
  /** 获取请求体格式 (可覆盖但不推荐) */
  getContentType: typeof getContentType;
  /** 获取请求体 (可覆盖但不推荐) */
  getBody: typeof getBody;
  /** 获取请求 URL (可覆盖但不推荐) */
  getUrl: typeof getUrl;
  /** 获取请求选项 (可覆盖但不推荐) */
  getRequestOption: typeof getRequestOption;
  /** 发送请求 (可覆盖但不推荐) */
  request: typeof request;
}

const methods = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options']);

export function createFetchAdapter(option?: FetchAdapterOptions) {
  const { baseURL } = option || {};
  const { onRequest, onResponse } = option || {};
  const _baseURL = baseURL?.replace(/\/$/, '') || '';

  return new Proxy({
    getContentType,
    getBody,
    getUrl,
    getRequestOption,
    request,
  } as FetchAdapter, {
    get(target, prop: string, receiver: FetchAdapter) {
      if (!methods.has(prop)) {
        return Reflect.get(target, prop, receiver);
      }
      return async function (url: string, option: AdapterOptions) {
        const requestOption = Reflect.apply(receiver.getRequestOption, receiver, [`${_baseURL}${url}`, option]);
        if (onRequest) {
          onRequest(requestOption);
        }
        const response = await Reflect.apply(receiver.request, receiver, [{ method: prop.toUpperCase(), ...requestOption }]);
        if (onResponse) {
          return onResponse(response);
        }
        return response;
      };
    },
  });
}
