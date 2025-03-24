import { bootstrap } from './bootstrap';
import { setStorage } from './storage';
import { getPkgInfo, parseConfig } from './utils';

export async function runProd() {
  setStorage('isProd', true);

  const { build = {}, port = 3000 } = await parseConfig();

  const sourceDir = build.outDir || 'dist';

  const { pkgPath } = await getPkgInfo();
  const devOptions = { pkgPath, sourceDir, port, isCli: true };
  setStorage('devOptions', devOptions);

  const { app } = await bootstrap({ sourceDir });

  app.listen(port);
}
