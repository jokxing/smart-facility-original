import {demoDeviceStatusColor, countDemoDeviceStatus} from '../../../src/utils/demoDeviceStatus';
import {statusForScenario} from '../../../src/mock/fixtures/scenario';
test('summary partitions mixed statuses without treating unknown as offline', () => {
  expect(countDemoDeviceStatus([1, '1', -1, -100, null, 2].map(status => ({status})))).toEqual({total: 6, normal: 2, alarm: 1, offline: 1, unknown: 2});
  expect(countDemoDeviceStatus([])).toEqual({total: 0, normal: 0, alarm: 0, offline: 0, unknown: 0});
});

test.each([
  ['normal', '#13ce66'], ['alarm', '#ff4949'], ['offline', '#343f4b']
])('room layout color follows the %s scenario contract', (scenario, color) => {
  const {status} = statusForScenario(scenario);
  expect(demoDeviceStatusColor(status)).toBe(color);
  expect(demoDeviceStatusColor(String(status))).toBe(color);
});

test('unknown status does not appear healthy or use the DataV alarm code', () => {
  [null, undefined, '', 2, 3, 'invalid'].forEach(status => {
    expect(demoDeviceStatusColor(status)).toBe('#343f4b');
  });
});
