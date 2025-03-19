import type { BuildConfig, FileInfoMap, ModuleType } from './types';
import defu from 'defu';
import { build as esbuild } from 'esbuild';
import { rimraf } from 'rimraf';
import { getFileInfoMap, parseConfig } from './utils';

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

function entryFormat(fileInfoMap: FileInfoMap): string[] {
  const entrys: string[] = [];
  for (const type in fileInfoMap) {
    const fileInfos = fileInfoMap[type as ModuleType];
    for (const fileInfo of fileInfos) {
      entrys.push(fileInfo.path);
    }
  }
  return entrys;
}

export async function build(_options?: BuildOptions) {
  const options = await parseOptions(_options);
  const { outDir: outdir, clean } = options;

  if (clean && outdir) {
    await rimraf(outdir);
  }

  const { fileInfoMap } = await getFileInfoMap(options);
  const entryPoints = entryFormat(fileInfoMap);

  await esbuild({
    entryPoints,
    outdir,
    // minify: true,
    // minifyIdentifiers: true,
    // minifySyntax: true,
    // minifyWhitespace: true,
  });

  return fileInfoMap;
}
