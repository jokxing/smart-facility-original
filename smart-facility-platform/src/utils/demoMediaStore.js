/**
 * Demo local media store: IndexedDB Blobs + in-memory object URL cache.
 * mapUrl / media.url hold durable keys (demo-media-*); never persist blob: URLs.
 */

const DB_NAME = 'smart-facility-demo-media';
const DB_VERSION = 1;
const STORE = 'blobs';
const MEDIA_KEY_RE = /^demo-media-[a-z0-9-]+$/i;

const urlCache = new Map();
let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('当前环境不支持 IndexedDB，无法保存底图。'));
  }
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error || new Error('打开媒体库失败。'));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, {keyPath: 'id'});
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
  dbPromise = dbPromise.catch(error => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

function newMediaId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return 'demo-media-' + Date.now().toString(36) + '-' + rand;
}

export function isDemoMediaKey(value) {
  return MEDIA_KEY_RE.test(String(value || '').trim());
}

export function peekDemoMediaUrl(mediaId) {
  const key = String(mediaId || '').trim();
  if (!isDemoMediaKey(key)) return null;
  return urlCache.get(key) || null;
}

function cacheBlob(id, blob) {
  const prev = urlCache.get(id);
  if (prev) {
    try { URL.revokeObjectURL(prev); } catch (_) {}
  }
  const url = URL.createObjectURL(blob);
  urlCache.set(id, url);
  return url;
}

/**
 * Validate and store a local image File/Blob. PNG/JPEG only.
 * @returns {Promise<{id: string, url: string, width: number, height: number, mime: string, size: number}>}
 */
export async function putDemoMediaFile(file, options = {}) {
  const maxBytes = options.maxBytes != null ? options.maxBytes : 5 * 1024 * 1024;
  const maxEdge = options.maxEdge != null ? options.maxEdge : 8192;
  if (!file) throw new Error('请选择图片文件。');
  const mime = String(file.type || '').toLowerCase();
  if (mime !== 'image/png' && mime !== 'image/jpeg') {
    throw new Error('仅支持 PNG / JPEG 底图（不支持新上传 SVG）。');
  }
  if (file.size > maxBytes) {
    throw new Error('底图不能超过 5MB。');
  }
  const bitmap = await decodeImage(file);
  if (bitmap.width > maxEdge || bitmap.height > maxEdge) {
    throw new Error('图片边长不能超过 ' + maxEdge + ' 像素。');
  }
  const id = newMediaId();
  const db = await openDb();
  const record = {
    id,
    blob: file,
    mime,
    size: file.size,
    width: bitmap.width,
    height: bitmap.height,
    name: String(file.name || id),
    createdAt: Date.now()
  };
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('底图保存失败。'));
    tx.onabort = () => reject(tx.error || new Error('底图保存已中止。'));
    tx.objectStore(STORE).put(record);
  });
  const url = cacheBlob(id, file);
  return {id, url, width: bitmap.width, height: bitmap.height, mime, size: file.size};
}

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({width: img.naturalWidth, height: img.naturalHeight});
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片无法解码，请更换文件。'));
    };
    img.src = url;
  });
}

/** Hydrate object URL cache from IndexedDB (call once after demo boot). */
export async function hydrateDemoMediaCache() {
  try {
    const db = await openDb();
    const rows = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('读取媒体库失败。'));
    });
    rows.forEach(row => {
      if (row && row.id && row.blob) cacheBlob(row.id, row.blob);
    });
    return rows.length;
  } catch (_) {
    return 0;
  }
}

export async function getDemoMediaRecord(mediaId) {
  const key = String(mediaId || '').trim();
  if (!isDemoMediaKey(key)) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('读取底图失败。'));
  });
}

/** Durable map keys must point to a saved image, not merely match a pattern. */
export async function validateDemoStoredMedia(value) {
  if (!isDemoMediaKey(value)) return {ok: true};
  try {
    const record = await getDemoMediaRecord(value);
    if (!record || !record.blob || !record.width || !record.height) {
      return {ok: false, message: '底图文件不存在，请重新上传。'};
    }
    return {ok: true};
  } catch (_) {
    return {ok: false, message: '无法读取本地底图，请检查浏览器存储后重试。'};
  }
}
