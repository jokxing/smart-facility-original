/**
 * Allow-list for laboratory device artwork used by RoomView Konva nodes.
 * Mock layout stores registry keys; pages resolve to same-origin /demo/devices/*.svg.
 */
export const DEMO_DEVICE_ASSET_REGISTRY = Object.freeze({
  'demo-device-analyzer': '/demo/devices/analyzer.svg',
  'demo-device-oscilloscope': '/demo/devices/oscilloscope.svg',
  'demo-device-monitor-terminal': '/demo/devices/monitor-terminal.svg',
  'demo-device-lab-refrigerator': '/demo/devices/lab-refrigerator.svg',
  'demo-device-incubator': '/demo/devices/incubator.svg',
  'demo-device-equipment-rack': '/demo/devices/equipment-rack.svg'
});

const ALLOWED_PATHS = new Set(Object.values(DEMO_DEVICE_ASSET_REGISTRY));

/**
 * @returns {string|null}
 */
export function resolveDeviceAssetUrl(url, fileBaseUrl) {
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
  if (Object.prototype.hasOwnProperty.call(DEMO_DEVICE_ASSET_REGISTRY, value)) {
    return DEMO_DEVICE_ASSET_REGISTRY[value];
  }
  if (ALLOWED_PATHS.has(value)) return value;
  return null;
}
