import type { DevOptions, GenerateTypeOptions, TeeKoa } from '../types';
import fs from 'node:fs';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import { resolve } from 'pathe';
import { getStorage, setStorage } from '../storage';
import { consola, getPkgInfo, loadModule, parseConfig, parseOptions, runSourceMain } from '../utils';

/**
 * 初始化应用, 返回应用实例和路由
 */
export async function bootstrap(_options?: GenerateTypeOptions) {
  const options = await parseOptions(_options);

  const app = new Koa() as TeeKoa.Application;
  const router = new KoaRouter();

  setStorage('app', app);
  setStorage('router', router);

  const { typeDeclarations, sourcePath } = await loadModule(app, router, options);

  app.middlewares ||= {};

  const devOptions = getStorage('devOptions');
  if (devOptions?.isCli) {
    await runSourceMain(devOptions);
  }

  app.use(router.routes()).use(router.allowedMethods());

  if (!getStorage('isProd', false)) {
    fs.writeFileSync(resolve(sourcePath, 'module.d.ts'), typeDeclarations, 'utf-8');
  }

  return { app, router };
}

function debounce<F extends (...args: any[]) => any>(fn: F, delay = 200) {
  let timer: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as F;
}

function errorHandler(e: Error) {
  consola.error(e);
}

/**
 * 重启服务
 */
async function restart(options: DevOptions) {
  try {
    const oldServer = getStorage('server');
    oldServer.closeAllConnections();
    oldServer.close();
    const { app, router } = await bootstrap();
    setStorage('server', app.listen(options.port));
    return { app, router };
  }
  catch (e: any) {
    errorHandler(e);
    return {};
  }
}

/**
 * 监听文件变化的处理函数
 *
 * 打印日志和重启服务
 */
const watchHandler = debounce(async (options: DevOptions) => {
  consola.start('Watching for changes...');
  await restart(options);
  consola.success('Restarted');
});

/**
 * 监听文件变化
 */
async function devHandler(options: DevOptions) {
  const { pkgPath, sourceDir } = options;
  fs.watchFile(resolve(pkgPath, 'main.ts'), () => watchHandler(options));
  fs.watch(sourceDir, { recursive: true }, async (_, filename) => {
    if (filename?.endsWith('module.d.ts'))
      return;
    watchHandler(options);
  });
}

/**
 * 命令行初始化应用的函数, 进行一些前后置处理
 */
export async function bootstrapCli() {
  const { port, sourceDir } = await parseConfig();
  const { pkgPath } = await getPkgInfo();
  const devOptions = { pkgPath, sourceDir, port, isCli: true };
  setStorage('devOptions', devOptions);
  const { app } = await bootstrap();
  await devHandler(devOptions);
  setStorage('server', app.listen(port, () => {
    consola.box('live server', `http://localhost:${port}`);
  }));
}
