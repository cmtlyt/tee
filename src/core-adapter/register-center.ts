import type { CoreAdapter, CoreUtils } from './base-types';

export const coreUtilsKey = '@cmtlyt/tee:core-adapter-utils';

export function getCoreUtils(adapter: CoreAdapter) {
  const coreUtils = adapter[coreUtilsKey];
  if (!coreUtils) {
    throw new Error(`core utils not found for adapter: ${adapter.name}`);
  }
  return coreUtils;
}

export function registerUtils(adapter: CoreAdapter, utils: CoreUtils) {
  adapter[coreUtilsKey] = utils;
}
