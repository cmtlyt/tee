import type { Storage } from '../types';

const storage = {} as Storage;

export function setStorage<K extends keyof Storage>(key: K, value: Storage[K]) {
  storage[key] = value;
}

export function getStorage<K extends keyof Storage>(key: K): Storage[K] {
  return storage[key];
}

export function getStorages<K extends keyof Storage>(keys: K[]): Pick<Storage, K> {
  return keys.reduce((prev, key) => {
    prev[key] = storage[key];
    return prev;
  }, {} as Pick<Storage, K>);
}
