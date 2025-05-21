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

function getUrl(url: string, query: AdapterOptions['query'] = {}) {
  if (!url.startsWith('http')) {
    url = `https://${location.host}${url}`;
  }
  const _url = new URL(url);
  Object.keys(query).forEach((key) => {
    _url.searchParams.append(key, query[key]);
  });
  return _url;
}

function getRequestOption(url: string, option: AdapterOptions) {
  const { body = null, query = {} } = option;
  const _url = getUrl(url, query);
  const contentType = getContentType(body);
  const bodyContent = getBody(body, contentType);
  const result = { url: _url, body: bodyContent };
  return result;
}

interface FetchAdapterOptions {
  baseURL?: string;
  onRequest?: (option: RequestInit & { url: string | URL | Request }) => void;
  onResponse?: (response: Response) => any;
}

interface FetchAdapter extends RequestAdapter {
  getContentType: typeof getContentType;
  getBody: typeof getBody;
  getUrl: typeof getUrl;
  getRequestOption: typeof getRequestOption;
  request: typeof request;
}

export function createFetchAdapter(option?: FetchAdapterOptions) {
  const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
  const { baseURL, onRequest, onResponse } = option || {};

  return new Proxy({
    getContentType,
    getBody,
    getUrl,
    getRequestOption,
    request,
  } as FetchAdapter, {
    get(target, prop: string, receiver) {
      if (!methods.includes(prop)) {
        return Reflect.get(target, prop, receiver);
      }
      return async function (url: string, option: AdapterOptions) {
        const requestOption = getRequestOption(`${baseURL?.replace(/\/$/, '') || ''}${url}`, option);
        if (onRequest) {
          onRequest(requestOption);
        }
        const response = await request({ method: prop.toUpperCase(), ...requestOption });
        if (onResponse) {
          return onResponse(response);
        }
        return response;
      };
    },
  });
}
