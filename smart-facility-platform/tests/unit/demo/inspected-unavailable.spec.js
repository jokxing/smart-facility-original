import Inspected from '../../../src/views/detect/components/Inspected.vue';
import {getDetectComplete} from '../../../src/api/detect';

jest.mock('../../../src/api/detect', () => ({getDetectComplete: jest.fn()}));

test('unavailable report upload and confirmation never complete detection', () => {
  const vm = {
    form: {detectId: 990001, reportFileName: 'stale-report.pdf'},
    loading: false,
    dialogVisible: true,
    $message: {warning: jest.fn(), success: jest.fn(), error: jest.fn()},
    $emit: jest.fn(),
    handleClose: jest.fn()
  };
  expect(Inspected.methods.beforeAvatarUpload.call(vm, {name: 'demo.pdf'})).toBe(false);
  expect(Inspected.methods.handleSubmit.call(vm)).toBe(false);
  Inspected.methods.handleSuccess.call(vm, {code: 1});
  expect(getDetectComplete).not.toHaveBeenCalled();
  expect(vm.$message.warning).toHaveBeenCalledTimes(3);
  expect(vm.$message.success).not.toHaveBeenCalled();
  expect(vm.$emit).not.toHaveBeenCalled();
  expect(vm.handleClose).not.toHaveBeenCalled();
  expect(vm.loading).toBe(false);
  expect(vm.dialogVisible).toBe(true);
});
