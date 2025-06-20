import type { BuildConfig, FileInfoMap, ModuleType } from '../types';
import { cpSync, existsSync, statSync } from 'node:fs';
import { getArray, isArray } from '@cmtlyt/base';
import { build as esbuild } from 'esbuild';
import { basename, resolve } from 'pathe';
import { rimraf } from 'rimraf';
import { defu, getFileInfoMap, getPkgInfo, parseConfig } from '../utils';

interface BuildOptions extends BuildConfig {
  sourceDir?: string;
}

/**
 * 解析构建参数
 */
async function parseOptions(options?: BuildOptions) {
  const { sourceDir, build: { outDir, ...rest } } = await parseConfig();

  return defu(options || {}, {
    sourceDir,
    ...rest,
    outDir: outDir!,
  });
}

/**
 * 格式化入口文件信息
 */
function entryFormat(fileInfoMap: FileInfoMap): { in: string; out: string }[] {
  const entries: { in: string; out: string }[] = [];
  for (const type in fileInfoMap) {
    const fileInfos = fileInfoMap[type as ModuleType];
    for (const fileInfo of fileInfos) {
      const target = fileInfo.relativePath.split('.').slice(0, -1).join('.');
      entries.push({ in: fileInfo.path, out: target });
    }
  }
  return entries;
}

/**
 * 获取单个文件的 point 信息
 *
 * 使用数组作为返回值, 是为了防止文件不存在返回 undefined 导致 esbuild 报错
 */
function getFilePoint(filePath: string) {
  const filePoints: { in: string; out: string }[] = [];
  if (existsSync(filePath)) {
    const out = basename(filePath, '.ts');
    filePoints.push({ in: filePath, out });
  }
  return filePoints;
}

function copyHandler(source: string, target: string) {
  if (!source || !target)
    return;

  if (!existsSync(source)) {
    return;
  }

  const isDir = statSync(source).isDirectory();

  cpSync(source, target, { recursive: isDir });
}

function copyPathHandler(options: BuildOptions) {
  const { copyPath } = options;

  if (!copyPath?.length) {
    return;
  }

  getArray(copyPath).forEach((item) => {
    if (isArray(item)) {
      copyHandler(item[0], item[1]);
    }
    else {
      copyHandler(item.from, item.to);
    }
  });
}

/**
 * 打包代码
 */
export async function build(_options?: BuildOptions) {
  const options = await parseOptions(_options);
  const { outDir: outdir, clean } = options;

  if (clean && outdir) {
    await rimraf(outdir);
  }

  const { fileInfoMap } = await getFileInfoMap({ ...options, ignoreFile: () => false });
  const entryPoints = entryFormat(fileInfoMap);
  const { pkgPath } = await getPkgInfo();
  const mainFilePath = resolve(pkgPath, 'main.ts');

  await esbuild({
    entryPoints: [
      ...entryPoints,
      ...getFilePoint(mainFilePath),
    ],
    outdir,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  });

  copyPathHandler(options);

  return fileInfoMap;
}
