import {roomBackgroundFrame, roomFrame} from '../../../src/utils/demoLayoutGeometry';

test('new room image fits the canvas without stretching', () => {
  const frame = roomBackgroundFrame(950201, 0.8, 762, 327);
  expect(frame.width).toBeGreaterThan(0);
  expect(frame.height).toBeGreaterThan(0);
  expect(frame.width / frame.height).toBeCloseTo(762 / 327);
  expect(frame.x).toBeGreaterThanOrEqual(0);
  expect(frame.y).toBeGreaterThanOrEqual(0);
  expect(frame.width + 2 * frame.x).toBeCloseTo(1600 * 0.8);
  expect(frame.height + 2 * frame.y).toBeCloseTo(790 * 0.8);
});

test('seeded room backgrounds retain device geometry', () => {
  expect(roomBackgroundFrame(950001, 0.8, 762, 327)).toEqual(roomFrame(950001, 0.8));
  expect(roomBackgroundFrame(950003, 0.8, 760, 327)).toEqual(roomFrame(950003, 0.8));
});
