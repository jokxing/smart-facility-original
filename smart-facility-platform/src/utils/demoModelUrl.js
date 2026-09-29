/**
 * Explicit allow-list only. Keys are what mock space seed stores in building.url.
 * Values are same-origin static paths under public/ (not the blocked /api file service).
 */
export const DEMO_MODEL_REGISTRY = Object.freeze({
  'demo-building-a': '/demo/models/office-building-low-rise.glb',
  'demo-building-b': '/demo/models/building-b.glb',
  'demo-building-c': '/demo/models/building-c.glb'
});

const ALLOWED_PATHS = new Set(Object.values(DEMO_MODEL_REGISTRY));

/**
 * Resolve a building model url for GLTFLoader.
 * Demo: only registered keys/paths; reject empty, unknown, traversal, and external URLs.
 * Non-demo: keep original BASE_URL + fileName semantics (caller passes fileBaseUrl).
 * @param {string} url
 * @param {string} [fileBaseUrl] original BASE_URL from utils/constant when not in demo
 * @returns {string|null}
 */
export function resolveBuildingModelUrl(url, fileBaseUrl) {
  if (url == null) return null;
  const value = String(url).trim();
  if (!value) return null;

  if (process.env.VUE_APP_DEMO !== 'true') {
    return String(fileBaseUrl || '') + value;
  }

  if (/^(https?:)?\/\//i.test(value) || /^\/\//.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return null;
  }
  if (value.includes('\\') || value.includes('..') || /%2e%2e/i.test(value)) {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(DEMO_MODEL_REGISTRY, value)) {
    return DEMO_MODEL_REGISTRY[value];
  }
  if (ALLOWED_PATHS.has(value)) return value;
  return null;
}
