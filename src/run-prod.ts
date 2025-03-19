import { bootstrap } from './bootstrap';
import { setStorage } from './storage';
import { parseConfig } from './utils';

export async function runProd() {
  setStorage('isProd', true);

  const config = await parseConfig();

  const sourceDir = config.build.outDir || 'dist';

  const { app } = await bootstrap({ sourceDir });

  app.listen(config.port || 3000);
}
