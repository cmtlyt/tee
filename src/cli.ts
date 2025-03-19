import fs from 'node:fs';
import { defineCommand, runMain } from 'citty';
import { resolve } from 'pathe';
import { version } from '../package.json';
import { bootstrap } from './bootstrap';
import { build as buildApp } from './build';
import { runProd } from './run-prod';
import { getStorage, getStorages, setStorage } from './storage';
import { getPkgInfo, jitiImport, parseConfig } from './utils';

interface DevOptions {
  pkgPath: string;
  sourceDir: string;
  port: number;
}

function debounce<F extends (...args: any[]) => any>(fn: F, delay = 200) {
  let timer: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as F;
}

async function runSourceMain({ pkgPath }: DevOptions) {
  const { app, router } = getStorages(['app', 'router']);
  return jitiImport(resolve(pkgPath, 'main.ts')).then(({ default: main }) => main(app, router), () => {});
}

function errorHandler(e: Error) {
  console.error(e);
}

async function restart(options: DevOptions) {
  try {
    const oldServer = getStorage('server');
    oldServer.closeAllConnections();
    oldServer.close();
    const { app, router } = await bootstrap();
    await runSourceMain(options);
    setStorage('server', app.listen(options.port));
    return { app, router };
  }
  catch (e) {
    errorHandler(e);
    return {};
  }
}

const watchHandler = debounce(async (options: DevOptions) => {
  console.warn('Watching for changes...');
  await restart(options);
  console.warn('Restarted');
});

async function devHandler(options: DevOptions) {
  const { pkgPath, sourceDir } = options;
  fs.watchFile(resolve(pkgPath, 'main.ts'), () => watchHandler(options));
  fs.watch(sourceDir, { recursive: true }, async (_, filename) => {
    if (filename?.endsWith('module.d.ts'))
      return;
    watchHandler(options);
  });
}

const dev = defineCommand({
  meta: {
    name: 'dev',
    description: 'Start development server',
  },
  async run() {
    const { port, sourceDir } = await parseConfig();
    const { pkgPath } = await getPkgInfo();
    const { app } = await bootstrap();
    const devOptions = { pkgPath, sourceDir, port };
    await runSourceMain(devOptions);
    await devHandler(devOptions);
    setStorage('server', app.listen(port));
  },
});

const build = defineCommand({
  meta: {
    name: 'build',
    description: 'Build for production',
  },
  async run() {
    await buildApp();
  },
});

const run = defineCommand({
  meta: {
    name: 'run',
    description: 'Run production server',
  },
  async run() {
    await runProd();
  },
});

const main = defineCommand({
  meta: {
    name: 'tee',
    version,
    description: '@cmtlyt/tee cli',
  },
  subCommands: { dev, build, run },
});

runMain(main);
