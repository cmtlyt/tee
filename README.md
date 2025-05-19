# @cmtlyt/tee

## 简介

支持 ts 的仿 egg 后端框架

基于 koa3.0 实现

内置 cors, multer, bodyParse, static 中间件, 可通过 `tee.config.ts` 配置文件关闭或修改中间件

内置 middlewares, service, router, routerSchema, config, extend, controller 模块的支持

推荐所有模块都使用对应的 define<Xxx> 函数创建以获取更好的类型提示

示例代码请查看 [GitHub 链接](https://github.com/cmtlyt/tee/tree/main/example)

## Cli

```bash
# 启动开发服务器
tee dev
# 打包项目
tee build
# 生成前端请求 api 代码
tee generate requestScript
tee g requestScript
```

> 生成前端请求 api 代码的逻辑需要依赖 routerSchema 模块, 如果未实现 routerSchema 模块, 则不会生成前端请求 api 代码

## Installation

**npm**

```bash
npm i @cmtlyt/tee
```

**yarn**

```bash
yarn add @cmtlyt/tee
```

**pnpm**

```bash
pnpm i @cmtlyt/tee
```

## 中间件默认配置

- cors 默认空配置
- multer 对于所有接口的文件进行代理, 存储路径为 `public/upload`, 文件名规则 `${getRandomString(8)}-${file.originalname}`
- bodyParse 默认空配置
- static 默认目录为 `public`, 接口路径前缀为 `/static`

## 代码示例

**config**

> `src/config/config.default.ts`

```ts
import { defineConfig } from '@cmtlyt/tee';

export default defineConfig(() => {
  return {
    dbConfig: {
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'test'
    }
  };
});
```

**extend**

> `src/extend/db.ts`

```ts
import { defineExtend } from '@cmtlyt/tee';
import { createConnection } from 'mysql';

export default defineExtend(({ app }) => {
  return createConnection(app.context.config.dbConfig);
});
```

**service**

> `src/service/example.ts`

```ts
import { defineService } from '@cmtlyt/tee';

export default defineService(({ app }) => {
  const db = app.extend.db;

  return class ExampleService {
    async getTime() {
      return new Date().toLocaleString();
    }
  };
});
```

**middleware**

> `src/middleware/logger.ts`

```ts
import { defineMiddleware } from '@cmtlyt/tee';

export default defineMiddleware(({ app }) => {
  return async (ctx, next) => {
    console.log(`${ctx.method} ${ctx.url}`);
    await next();
    console.log(`${ctx.method} ${ctx.url} ${ctx.status}`);
  };
});
```

**controller**

> `src/controller/example.ts`

```ts
import type { TeeContext } from '@cmtlyt/tee';
import { defineController } from '@cmtlyt/tee';

export default defineController(({ app }) => {
  return class ExampleController {
    async getName(ctx: TeeContext) {
      ctx.body = `${app.service.example.getTime()} example controller`;
    }
  };
});
```

**routerSchema**

> `src/router-schema/example.ts`

```ts
import { defineRouterSchema } from '@cmtlyt/tee';

export default defineRouterSchema(({ setPrefix, getObjectType, stringType }) => {
  setPrefix('/example');

  return {
    '/name': {
      get: {
        // 可选查询参数
        query: getObjectType({
          id: stringType,
        }, []),
      }
    },
    '/hello/:name': {
      get: {
        // 如果 getObjectType 不传递第二个参数则默认全部必填, 如果传递的话, 只有传递的字段为必填
        params: getObjectType({
          name: stringType,
        }),
      }
    }
  };
});
```

**router**

> `src/router/example.ts`

```ts
import { defineRouter } from '@cmtlyt/tee';

export default defineRouter(({ app, router }) => {
  router.setPrefix('/example');
  router.get('/name', app.controller.example.getName);
  router.get('/hello/:name', app.controller.example.getName);
});
```

**main**

> `main.ts`

```ts
import { defineEntry } from '@cmtlyt/tee';

export default defineEntry((app, router) => {
  router.setPrefix('/api');

  app.use(app.middlewares.logger);
});
```
