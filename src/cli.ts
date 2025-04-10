#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import { version } from '../package.json';
import { bootstrapCli } from './cli/bootstrap';
import { build as buildApp } from './cli/build';
import { generateRequestScriptCli } from './cli/generate-request-script';
import { runProd } from './cli/run-prod';

const dev = defineCommand({
  meta: {
    name: 'dev',
    description: 'Start development server',
  },
  async run() {
    await bootstrapCli();
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

const requestScript = defineCommand({
  meta: {
    name: 'requestScript',
    description: 'Generate request script with router schema',
  },
  async run() {
    await generateRequestScriptCli();
  },
});

const generate = defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate other file',
  },
  subCommands: { requestScript },
});

const main = defineCommand({
  meta: {
    name: 'tee',
    version,
    description: '@cmtlyt/tee cli',
  },
  subCommands: { dev, build, run, generate, g: generate },
});

runMain(main);
