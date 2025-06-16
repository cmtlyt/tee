interface BaseImpl {
  getInstance: () => any;
  use: (...args: any[]) => any;
}

export interface AppImpl extends BaseImpl {}

export interface RouterImpl extends BaseImpl {}

export interface CoreAdapter {
  id: string;
  app: AppImpl;
  router: RouterImpl;
}
