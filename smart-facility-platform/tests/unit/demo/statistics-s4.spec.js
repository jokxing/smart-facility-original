import zh from '../../../src/i18n/config/zh';
import en from '../../../src/i18n/config/en';

test('statistics demo note i18n keys exist in zh and en', () => {
  expect(zh.statistics.demoSimNote).toMatch(/模拟统计/);
  expect(zh.statistics.demoEnergyNote).toMatch(/估算能耗/);
  expect(zh.statistics.demoEnergyNote).toMatch(/kWh/);
  expect(en.statistics.demoSimNote).toMatch(/simulated statistics/i);
  expect(en.statistics.demoEnergyNote).toMatch(/estimated energy/i);
  expect(en.statistics.demoEnergyNote).toMatch(/kWh/);
});
