import {shallowMount, createLocalVue} from '@vue/test-utils';
import {formatStatisticHourOption} from '../../../src/utils/statisticRangeValidate';
import UseRanHighSearch from '../../../src/components/UseRanHighSearch/index.vue';

const localVue = createLocalVue();

function mountDialog() {
  return shallowMount(UseRanHighSearch, {
    localVue,
    stubs: {
      'el-dialog': true,
      'el-form': true,
      'el-form-item': true,
      'el-select': true,
      'el-option': true,
      'el-button': true
    },
    mocks: {
      $t: key => key,
      $message: {error: jest.fn()}
    }
  });
}

test('submit rejects malformed hours before option normalization', () => {
  const wrapper = mountDialog();
  wrapper.vm.open({type: 1});
  for (const periodBeginTime of ['bad', '1.5', '24']) {
    wrapper.vm.form.periodBeginTime = periodBeginTime;
    wrapper.vm.onsubmit();
    expect(wrapper.vm.dialogFormVisible).toBe(true);
    expect(wrapper.emitted().handle).toBeUndefined();
  }
  expect(wrapper.vm.$message.error).toHaveBeenCalledTimes(3);
});

test('formatStatisticHourOption keeps zero and pads strings', () => {
  expect(formatStatisticHourOption(0, '23')).toBe('00');
  expect(formatStatisticHourOption('00', '23')).toBe('00');
  expect(formatStatisticHourOption('', '23')).toBe('23');
  expect(formatStatisticHourOption(null, '23')).toBe('23');
  expect(formatStatisticHourOption(undefined, '00')).toBe('00');
  expect(formatStatisticHourOption(9, '00')).toBe('09');
  expect(formatStatisticHourOption('23', '00')).toBe('23');
});

test('open with end 0 or 00 shows 00 not 23', () => {
  const wrapper = mountDialog();
  wrapper.vm.open({type: 1, start: '00', end: 0});
  expect(wrapper.vm.form.periodBeginTime).toBe('00');
  expect(wrapper.vm.form.periodEndTime).toBe('00');
  expect(wrapper.vm.hours24).toHaveLength(24);
  expect(wrapper.vm.hours24[0]).toBe('00');
  expect(wrapper.vm.hours24[23]).toBe('23');
  expect(wrapper.vm.hours24.every(h => typeof h === 'string')).toBe(true);

  wrapper.vm.open({type: 2, start: 0, end: '00'});
  expect(wrapper.vm.form.periodType).toBe(2);
  expect(wrapper.vm.form.periodBeginTime).toBe('00');
  expect(wrapper.vm.form.periodEndTime).toBe('00');
});

test('open empty defaults then submit 00-00 and reopen', () => {
  const wrapper = mountDialog();
  wrapper.vm.open({type: 1, start: '', end: ''});
  expect(wrapper.vm.form.periodBeginTime).toBe('00');
  expect(wrapper.vm.form.periodEndTime).toBe('23');

  wrapper.setData({
    form: {
      periodType: 1,
      periodBeginTime: '00',
      periodEndTime: '00'
    }
  });
  wrapper.vm.onsubmit();
  expect(wrapper.emitted().handle).toHaveLength(1);
  expect(wrapper.emitted().handle[0][0]).toEqual({
    periodType: 1,
    periodBeginTime: '00',
    periodEndTime: '00'
  });

  wrapper.vm.open({
    type: 1,
    start: wrapper.emitted().handle[0][0].periodBeginTime,
    end: wrapper.emitted().handle[0][0].periodEndTime
  });
  expect(wrapper.vm.form.periodBeginTime).toBe('00');
  expect(wrapper.vm.form.periodEndTime).toBe('00');
});
