// utils/safeLocalStorage.ts

const isBrowser = typeof window !== 'undefined';

const safeLocalStorage = {
  getItem: (key: string) => {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (isBrowser) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (isBrowser) {
      localStorage.removeItem(key);
    }
  },
};

export default safeLocalStorage;
