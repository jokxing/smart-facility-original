export const ROOM_CANVAS = {width: 1600, height: 790};
export const DEVICE_SIZE = {width: 128, height: 144};
import {peekDemoMediaDimensions} from './demoMediaStore';
export const ROOM_BOUNDS = Object.freeze({
  950001: {minX: 78, minY: 78, w: 762, h: 327},
  950003: {minX: 840, minY: 78, w: 760, h: 327}
});

// One uniform transform for the background and all device centers.
export function roomFrame(roomId, ratio = 1) {
  let b = ROOM_BOUNDS[roomId];
  if (!b) {
    const {getRoomMapUrlKey} = require('../mock/fixtures/room');
    const key = getRoomMapUrlKey(roomId);
    const dimensions = key === 'demo-room-a' ? {width: 762, height: 327}
      : key === 'demo-room-b' ? {width: 760, height: 327} : peekDemoMediaDimensions(key);
    if (dimensions && dimensions.width > 0 && dimensions.height > 0) b = {w: dimensions.width, h: dimensions.height};
  }
  if (!b) return {x: 0, y: 0, width: 0, height: 0, scale: 0};
  const scale = Math.min(ROOM_CANVAS.width / b.w, ROOM_CANVAS.height / b.h);
  return {x: (1600 - b.w * scale) / 2 * ratio, y: (790 - b.h * scale) / 2 * ratio,
    width: b.w * scale * ratio, height: b.h * scale * ratio, scale: scale * ratio};
}

export function placementBounds(item) {
  const angle = item.rotation * Math.PI / 180;
  const w = DEVICE_SIZE.width * item.scaleX, h = DEVICE_SIZE.height * item.scaleY;
  const halfW = (Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h) / 2;
  const halfH = (Math.abs(Math.sin(angle)) * w + Math.abs(Math.cos(angle)) * h) / 2;
  return {left: item.x - halfW, right: item.x + halfW, top: item.y - halfH, bottom: item.y + halfH};
}

// Keep seeded device coordinates; fit uploaded backgrounds for new rooms.
export function roomBackgroundFrame(roomId, ratio, imageWidth, imageHeight) {
  const frame = roomFrame(roomId, ratio);
  if (frame.scale > 0) return frame;
  const scale = Math.min(ROOM_CANVAS.width / imageWidth, ROOM_CANVAS.height / imageHeight) * ratio;
  const width = imageWidth * scale, height = imageHeight * scale;
  return {x: (ROOM_CANVAS.width * ratio - width) / 2,
    y: (ROOM_CANVAS.height * ratio - height) / 2, width, height};
}

export function validPlacement(item, roomId) {
  if (!['x', 'y', 'rotation', 'scaleX', 'scaleY', 'sortIndex'].every(k => Number.isFinite(item[k]))) return false;
  if (item.scaleX < 0.2 || item.scaleX > 3 || item.scaleY < 0.2 || item.scaleY > 3
    || Math.abs(item.rotation) > 360 || !Number.isInteger(item.sortIndex) || item.sortIndex < 0) return false;
  const frame = roomFrame(roomId), box = placementBounds(item), eps = 0.001;
  return frame.scale > 0 && box.left >= frame.x - eps && box.top >= frame.y - eps
    && box.right <= frame.x + frame.width + eps && box.bottom <= frame.y + frame.height + eps;
}
