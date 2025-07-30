'use client'

type StorageNamespace = {
  add: (value: string) => void;
  get: () => string | null;
  remove: () => void;
};

function createStorageNamespace(key: string): StorageNamespace {
  return {
    add: (value: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    },
    get: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    },
    remove: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  };
}

export default class LocalStorage {
  static JwtToken = createStorageNamespace('auth');
  static User = createStorageNamespace('user');
  static Bill = createStorageNamespace('bill');
}
