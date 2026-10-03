import {peekDemoMediaUrl, isDemoMediaKey} from './demoMediaStore';

/**
 * Explicit allow-list for floor plan mapUrl values used by /floor/view.
 * Keys are stored in space seed subDivisions[].mapUrl; values are public/ static paths.
 * Demo media keys resolve via IndexedDB object-URL cache (hydrateDemoMediaCache).
 */
export const DEMO_FLOOR_MAP_REGISTRY = Object.freeze({
  'demo-floor-a-1f': '/demo/floors/floor-a-1f.svg'
});

const ALLOWED_PATHS = new Set(Object.values(DEMO_FLOOR_MAP_REGISTRY));

/**
 * Resolve a floor mapUrl for Image()/Konva background.
 * @returns {string|null}
 */
export function resolveFloorMapUrl(url, fileBaseUrl) {
  if (url == null) return null;
  const value = String(url).trim();
  if (!value) return null;

  if (process.env.VUE_APP_DEMO !== 'true') {
    return String(fileBaseUrl || '') + value;
  }

  if (/^(https?:)?\/\//i.test(value) || /^\/\//.test(value) || /^blob:/i.test(value)) {
    return null;
  }
  if (value.includes('\\') || value.includes('..') || /%2e%2e/i.test(value)) {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(DEMO_FLOOR_MAP_REGISTRY, value)) {
    return DEMO_FLOOR_MAP_REGISTRY[value];
  }
  if (ALLOWED_PATHS.has(value)) return value;
  if (isDemoMediaKey(value)) return peekDemoMediaUrl(value);
  return null;
}
