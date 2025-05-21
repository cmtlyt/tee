export interface AdapterOptions {
  query?: Record<string, any>;
  body?: any;
}

export interface RequestAdapter {
  get: (url: string, option: AdapterOptions) => Promise<any>;
  post: (url: string, option: AdapterOptions) => Promise<any>;
  put: (url: string, option: AdapterOptions) => Promise<any>;
  delete: (url: string, option: AdapterOptions) => Promise<any>;
  patch: (url: string, option: AdapterOptions) => Promise<any>;
  head: (url: string, option: AdapterOptions) => Promise<any>;
  options: (url: string, option: AdapterOptions) => Promise<any>;
}
