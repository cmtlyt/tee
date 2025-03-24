import type { BuildConfig, FileInfoMap, ModuleType } from './types';
import { existsSync } from 'node:fs';
import defu from 'defu';
import { build as esbuild } from 'esbuild';
import { basename, resolve } from 'pathe';
import { rimraf } from 'rimraf';
import { getFileInfoMap, getPkgInfo, parseConfig } from './utils';

interface BuildOptions extends BuildConfig {
  sourceDir?: string;
}

async function parseOptions(options?: BuildOptions) {
  const { sourceDir, build: { outDir, ...rest } } = await parseConfig();

  return defu(options || {}, {
    sourceDir,
    ...rest,
    outDir,
  });
}

function entryFormat(fileInfoMap: FileInfoMap): { in: string; out: string }[] {
  const entrys: { in: string; out: string }[] = [];
  for (const type in fileInfoMap) {
    const fileInfos = fileInfoMap[type as ModuleType];
    for (const fileInfo of fileInfos) {
      entrys.push({ in: fileInfo.path, out: `${fileInfo.type!}/${fileInfo.name}` });
    }
  }
  return entrys;
}

function getFilePoints(filePath: string) {
  const filePoints: { in: string; out: string }[] = [];
  if (existsSync(filePath)) {
    const out = basename(filePath, '.ts');
    filePoints.push({ in: filePath, out });
  }
  return filePoints;
}

export async function build(_options?: BuildOptions) {
  const options = await parseOptions(_options);
  const { outDir: outdir, clean } = options;

  if (clean && outdir) {
    await rimraf(outdir);
  }

  const { fileInfoMap } = await getFileInfoMap(options);
  const entryPoints = entryFormat(fileInfoMap);
  const { pkgPath } = await getPkgInfo();
  const mainFilePath = resolve(pkgPath, 'main.ts');

  await esbuild({
    entryPoints: [
      ...entryPoints,
      ...getFilePoints(mainFilePath),
    ],
    outdir,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  });

  return fileInfoMap;
}
