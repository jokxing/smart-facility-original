/**
 * Room preview backgrounds for /room/view (task 8B).
 * Cropped from the lab floor SVG — not the full-floor image stretched as a room map.
 */
export const DEMO_ROOM_MAP_REGISTRY = Object.freeze({
  'demo-room-a': '/demo/floors/room-a.svg',
  'demo-room-b': '/demo/floors/room-b.svg'
});

const ALLOWED_PATHS = new Set(Object.values(DEMO_ROOM_MAP_REGISTRY));

/** roomId → registry key for the two wired labs; corridor has no device layout. */
export const DEMO_ROOM_BACKGROUND_BY_ID = Object.freeze({
  950001: 'demo-room-a',
  950003: 'demo-room-b'
});

/**
 * @returns {string|null}
 */
export function resolveRoomMapUrl(url, fileBaseUrl) {
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
  if (Object.prototype.hasOwnProperty.call(DEMO_ROOM_MAP_REGISTRY, value)) {
    return DEMO_ROOM_MAP_REGISTRY[value];
  }
  if (ALLOWED_PATHS.has(value)) return value;
  return null;
}

export function resolveRoomMapUrlByRoomId(roomId, fileBaseUrl) {
  const key = DEMO_ROOM_BACKGROUND_BY_ID[Number(roomId)];
  if (!key) return null;
  return resolveRoomMapUrl(key, fileBaseUrl);
}
