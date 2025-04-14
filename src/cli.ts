#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import { version } from '../package.json';
import { bootstrapCli } from './cli/bootstrap';
import { build as buildApp } from './cli/build';
import { generateRequestScriptCli } from './cli/generate-request-script';
import { runProd } from './cli/run-prod';

/** dev 命令 */
const dev = defineCommand({
  meta: {
    name: 'dev',
    description: 'Start development server',
  },
  async run() {
    await bootstrapCli();
  },
});

/** build 命令 */
const build = defineCommand({
  meta: {
    name: 'build',
    description: 'Build for production',
  },
  async run() {
    await buildApp();
  },
});

/** run 命令 */
const run = defineCommand({
  meta: {
    name: 'run',
    description: 'Run production server',
  },
  async run() {
    await runProd();
  },
});

/** 生成前端请求文件命令 */
const requestScript = defineCommand({
  meta: {
    name: 'requestScript',
    description: 'Generate request script with router schema',
  },
  async run() {
    await generateRequestScriptCli();
  },
});

/** generate 命令 */
const generate = defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate other file',
  },
  subCommands: { requestScript },
});

/** tee 命令主入口 */
const main = defineCommand({
  meta: {
    name: 'tee',
    version,
    description: '@cmtlyt/tee cli',
  },
  subCommands: { dev, build, run, generate, g: generate },
});

runMain(main);
