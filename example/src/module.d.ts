import { MergeConfig } from '@cmtlyt/tee';
export {};
declare module '@cmtlyt/tee' {
  interface IController {
    user: Awaited<ReturnType<typeof import('./controller/user.ts')['default']>>['prototype'];
  }
  interface IRouter {
    user: Awaited<ReturnType<typeof import('./router/user.ts')['default']>>;
  }
  interface IService {
    user: Awaited<ReturnType<typeof import('./service/user.ts')['default']>>['prototype'];
  }
  
}