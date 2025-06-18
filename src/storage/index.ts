import type { Storage } from '../types';

const globalStorageKey = '@cmtlyt/tee:global-storage';
// @ts-expect-error any
const storage = globalThis[globalStorageKey] ||= {} as Storage;

/**
 * 设置存储值
 */
export function setStorage<K extends keyof Storage>(key: K, value: Storage[K]) {
  storage[key] = value;
}

/**
 * 判断存储键是否存在
 */
export function hasStorage<K extends keyof Storage>(key: K) {
  return typeof storage[key] !== 'undefined';
}

/**
 * 获取对应键的存储值, 如果不存在则使用初始值, 如果未传递初始值则直接报错, 保证 key 对应的值一定存在
 */
export function getStorage<K extends keyof Storage>(key: K, initialValue?: Storage[K]): Storage[K] {
  // @ts-expect-error any
  const result = storage[key] || globalThis[globalStorageKey][key];
  if (typeof result === 'undefined') {
    if (typeof initialValue !== 'undefined') {
      setStorage(key, initialValue);
      return initialValue;
    }
    throw new TypeError(`${key} is not found in storage, 正确初始化后再获取, 如果还是无法解决请提交 issue, 或直接联系开发者`);
  }
  return result;
}

/**
 * 批量获取存储值
 *
 * @see getStorage
 */
export function getStorages<K extends keyof Storage>(keys: K[], initialValues?: Partial<Pick<Storage, K>>): Pick<Storage, K> {
  return keys.reduce((prev, key) => {
    prev[key] = getStorage(key, initialValues?.[key]);
    return prev;
  }, {} as Pick<Storage, K>);
}
