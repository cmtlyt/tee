import { setStorage } from '../storage';
import { consola, getPkgInfo, parseConfig } from '../utils';
import { bootstrap } from './bootstrap';

export async function runProd() {
  setStorage('isProd', true);

  const { build, port = 3000 } = await parseConfig();

  const sourceDir = build.outDir || 'dist';

  const { pkgPath } = await getPkgInfo();
  const devOptions = { pkgPath, sourceDir, port, isCli: true };
  setStorage('devOptions', devOptions);

  const { app } = await bootstrap({ sourceDir });

  app.listen(port, () => {
    consola.box('live server', `http://localhost:${port}`);
  });
}
