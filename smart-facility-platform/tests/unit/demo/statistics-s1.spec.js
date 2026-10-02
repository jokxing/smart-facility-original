import {shallowMount, createLocalVue} from '@vue/test-utils';
import {isStatisticCustomDateRange} from '../../../src/utils/statisticCustomRange';

jest.mock('../../../src/i18n', () => {
  const t = key => key;
  return {__esModule: true, default: {t}, t};
});
jest.mock('../../../src/utils/constant', () => ({
  TIME_DIMENSION: [
    {INTERVAL: 1, LABEL: 'day'},
    {INTERVAL: 2, LABEL: 'week'},
    {INTERVAL: 3, LABEL: 'month'}
  ]
}));
jest.mock('../../../src/components/CustomTime', () => ({
  __esModule: true,
  default: {name: 'CustomTime', render: h => h('div')}
}));

import ChartDimension from '../../../src/components/ChartDimension/index.vue';

const localVue = createLocalVue();

function mountChart() {
  return shallowMount(ChartDimension, {
    localVue,
    stubs: {
      'el-row': true,
      'el-button': true,
      'el-date-picker': true
    },
    mocks: {
      $t: key => key
    }
  });
}

test('ChartDimension clear emits handleTime once with empty value', () => {
  const wrapper = mountChart();
  const start = new Date('2026-09-01T00:00:00+08:00');
  const end = new Date('2026-09-02T00:00:00+08:00');
  wrapper.setData({equipmentDate: [start, end]});
  wrapper.vm.handleEquipmentData();
  expect(wrapper.emitted().handleTime).toHaveLength(1);
  expect(wrapper.emitted().handleTime[0][0]).toEqual([start, end]);

  wrapper.vm.handleEquipmentData();
  expect(wrapper.emitted().handleTime).toHaveLength(1);

  wrapper.setData({equipmentDate: null});
  wrapper.vm.handleEquipmentData();
  expect(wrapper.emitted().handleTime).toHaveLength(2);
  expect(wrapper.emitted().handleTime[1][0]).toBeNull();
});

test('ChartDimension day/week cut clears picker without emitting handleTime', () => {
  const wrapper = mountChart();
  wrapper.setData({
    equipmentDate: [new Date('2026-09-01T00:00:00+08:00'), new Date('2026-09-02T00:00:00+08:00')],
    lastEmittedRangeKey: 'x'
  });
  wrapper.vm.handleCutSensor(2);
  expect(wrapper.vm.equipmentDate).toBe('');
  expect(wrapper.vm.lastEmittedRangeKey).toBe('');
  expect(wrapper.emitted().handle).toEqual([[2]]);
  expect(wrapper.emitted().handleTime).toBeUndefined();
});

function applyStatisticCustomRange(state, val, defaultDateType = 1) {
  if (!isStatisticCustomDateRange(val)) {
    state.beginTime = '';
    state.endTime = '';
    state.dateType = defaultDateType;
    return false;
  }
  state.beginTime = val[0];
  state.endTime = val[1];
  state.dateType = null;
  return true;
}

test('isStatisticCustomDateRange rejects null empty partial', () => {
  expect(isStatisticCustomDateRange(null)).toBe(false);
  expect(isStatisticCustomDateRange('')).toBe(false);
  expect(isStatisticCustomDateRange([])).toBe(false);
  expect(isStatisticCustomDateRange([null, new Date()])).toBe(false);
  expect(isStatisticCustomDateRange(['', ''])).toBe(false);
  expect(isStatisticCustomDateRange([new Date(), new Date()])).toBe(true);
});

test('statistic custom range clear restores day and empties bounds', () => {
  const use = {beginTime: 'a', endTime: 'b', dateType: null};
  expect(applyStatisticCustomRange(use, null)).toBe(false);
  expect(use).toEqual({beginTime: '', endTime: '', dateType: 1});

  const start = new Date('2026-09-01T00:00:00+08:00');
  const end = new Date('2026-09-07T23:59:59+08:00');
  expect(applyStatisticCustomRange(use, [start, end])).toBe(true);
  expect(use.dateType).toBeNull();
  expect(applyStatisticCustomRange(use, null)).toBe(false);
  expect(use).toEqual({beginTime: '', endTime: '', dateType: 1});
});

test('ranking custom range clear restores day like use stats', () => {
  const rank = {beginTime: 'x', endTime: 'y', dateType: null};
  applyStatisticCustomRange(rank, null);
  expect(rank).toEqual({beginTime: '', endTime: '', dateType: 1});
});
