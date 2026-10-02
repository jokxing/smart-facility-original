import {shallowMount} from '@vue/test-utils';
import MaintenanceModal from '../../../src/views/labDevice/components/MaintenanceModal.vue';
import NextMintenanceTime from '../../../src/views/labDevice/components/NextMintenanceTime.vue';
import {postMaintenanceAdd, postMaintenanceUpdateMaintenance} from '../../../src/api/labDevice';

jest.mock('@c/SubmitForm', () => ({render: h => h('div')}), {virtual: true});
jest.mock('../../../src/api/labDevice', () => ({
  postMaintenanceAdd: jest.fn(),
  postMaintenanceUpdateMaintenance: jest.fn()
}));

const previousDemo = process.env.VUE_APP_DEMO;
beforeEach(() => { process.env.VUE_APP_DEMO = 'true'; jest.clearAllMocks(); });
afterAll(() => { process.env.VUE_APP_DEMO = previousDemo; });

function mountModal(component) {
  return shallowMount(component, {
    stubs: ['el-dialog', 'el-button', 'SubmitForm'],
    mocks: {$t: key => key, $message: {success: jest.fn(), error: jest.fn()}, $store: {commit: jest.fn()}}
  });
}

test.each([
  [MaintenanceModal, postMaintenanceAdd],
  [NextMintenanceTime, postMaintenanceUpdateMaintenance]
])('successful drawer mutation refreshes parent and blocks duplicate submit', async (component, request) => {
  let resolve;
  request.mockImplementation(() => new Promise(done => { resolve = done; }));
  const wrapper = mountModal(component);
  wrapper.vm.open({id: 960002, createDate: '2026-09-22 09:00:00'});
  wrapper.vm.data.nextMaintenanceDate = '2026-10-01 09:00:00';
  wrapper.vm.handleSubmit();
  wrapper.vm.handleSubmit();
  expect(request).toHaveBeenCalledTimes(1);
  resolve({code: 1});
  await Promise.resolve();
  await wrapper.vm.$nextTick();
  expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('lab/REFLESH');
  expect(wrapper.emitted().handle).toHaveLength(1);
  expect(wrapper.vm.dialogVisible).toBe(false);
  wrapper.destroy();
});
