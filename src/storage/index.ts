import type { Storage } from '../types';

const storage = {} as Storage;

export function setStorage<K extends keyof Storage>(key: K, value: Storage[K]) {
  storage[key] = value;
}

export function hasStorage<K extends keyof Storage>(key: K) {
  return typeof storage[key] !== 'undefined';
}

export function getStorage<K extends keyof Storage>(key: K, initialValue?: Storage[K]): Storage[K] {
  const result = storage[key];
  if (typeof result === 'undefined') {
    if (typeof initialValue !== 'undefined') {
      setStorage(key, initialValue);
      return initialValue;
    }
    throw new TypeError(`${key} is not found in storage, 正确初始化后再获取, 如果还是无法解决请提交 issue, 或直接联系开发者`);
  }
  return result;
}

export function getStorages<K extends keyof Storage>(keys: K[], initialValues?: Partial<Pick<Storage, K>>): Pick<Storage, K> {
  return keys.reduce((prev, key) => {
    prev[key] = getStorage(key, initialValues?.[key]);
    return prev;
  }, {} as Pick<Storage, K>);
}
