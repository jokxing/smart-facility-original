export const STORAGE_PREFIX = 'smart-facility-demo:v1:';

export function createDemoStorage(nativeStorage) {
  function keys() {
    const result = [];
    for (let i = 0; i < nativeStorage.length; i++) {
      const key = nativeStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) result.push(key);
    }
    return result;
  }
  return {
    get length() { return keys().length; },
    key(index) { const key = keys()[index]; return key ? key.slice(STORAGE_PREFIX.length) : null; },
    getItem(key) { return nativeStorage.getItem(STORAGE_PREFIX + key); },
    setItem(key, value) { nativeStorage.setItem(STORAGE_PREFIX + key, String(value)); },
    removeItem(key) { nativeStorage.removeItem(STORAGE_PREFIX + key); },
    clear() { keys().forEach(key => nativeStorage.removeItem(key)); }
  };
}

// Use the explicit window property to avoid ProvidePlugin injecting itself here.
export default createDemoStorage(window.localStorage);
