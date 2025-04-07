export const API_TYPE_SYMBOL = '#{APIType}';
export const API_METHOD_SYMBOL = '#{APIMethod}';

export const template = `interface AdapterOptions {
  query: Record<string, any>;
  body: any;
}

interface RequestAdapter {
  get: (url: string, option: AdapterOptions) => Promise<any>;
  post: (url: string, option: AdapterOptions) => Promise<any>;
  put: (url: string, option: AdapterOptions) => Promise<any>;
  delete: (url: string, option: AdapterOptions) => Promise<any>;
  patch: (url: string, option: AdapterOptions) => Promise<any>;
  head: (url: string, option: AdapterOptions) => Promise<any>;
  options: (url: string, option: AdapterOptions) => Promise<any>;
}

function getPath(basePath: string, params: Record<string, string>): string {
  return basePath.replace(/\\/:(\\w+)/g, (_, key) => \`/\${params[key]}\`);
}

function getRequest(adapter: RequestAdapter) {
  return (routerInfo: Record<string, any> & { method: keyof RequestAdapter }) => async (options: Record<string, any>): Promise<any> => {
    const path = String(routerInfo.path || routerInfo.schemaPath);
    const method = routerInfo.method;
    const params = (routerInfo.params as string[]).reduce<Record<string, string>>((prev, cur: string) => {
      prev[cur] = options.params[cur];
      return prev;
    }, {});
    return adapter[method](getPath(path, params), { query: options.query, body: options.body });
  };
}

interface API {
  ${API_TYPE_SYMBOL}
};

export function getAPI(adapter: RequestAdapter): API {
  const request = getRequest(adapter);
  return {
    ${API_METHOD_SYMBOL}
  };
}
`;
