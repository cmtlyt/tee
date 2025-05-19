# @cmtlyt/tee

## 简介

支持 ts 的仿 egg 后端框架

基于 koa3.0 实现

内置 cors, multer, bodyParse, static 中间件

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

```bash
npm i @cmtlyt/tee
```
