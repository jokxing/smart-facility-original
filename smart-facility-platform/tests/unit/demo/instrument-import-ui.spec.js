import ImportFile from '../../../src/components/ImportFile/index.vue';
import request from '../../../src/utils/request';

jest.mock('../../../src/utils/request', () => ({__esModule: true, default: jest.fn()}));

function context() {
  return {
    submitLoading: false, importError: '',
    fileList: [{raw: new File(['placeholder'], '设备.xlsx')}],
    $message: {success: jest.fn()}, $emit: jest.fn()
  };
}
beforeEach(() => request.mockReset());
test('double-click sends one request, emits refresh only after success, and releases lock', async () => {
  let complete;
  request.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
  const vm = context();
  const first = ImportFile.methods.submitInstrumentImport.call(vm);
  await ImportFile.methods.submitInstrumentImport.call(vm);
  await Promise.resolve();
  expect(request).toHaveBeenCalledTimes(1);
  expect(vm.$emit).not.toHaveBeenCalled();
  complete({code: 1, items: {count: 2}});
  await first;
  expect(vm.$emit).toHaveBeenCalledWith('handleUpdateInit', {count: 2});
  expect(vm.submitLoading).toBe(false);
});
test('validation error keeps dialog open and allows retry', async () => {
  const vm = context();
  request.mockResolvedValue({code: 0, message: '第 3 行：房间无效'});
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(vm.importError).toContain('第 3 行');
  expect(vm.$emit).not.toHaveBeenCalled();
  expect(vm.submitLoading).toBe(false);
  request.mockResolvedValue({code: 1, items: {count: 1}});
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(vm.importError).toBe('');
  expect(vm.$emit).toHaveBeenCalledTimes(1);
});
test('unsupported file never reaches request', async () => {
  const vm = context(); vm.fileList[0].raw = new File(['csv'], '设备.csv');
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(request).not.toHaveBeenCalled();
  expect(vm.importError).toContain('.xlsx');
});
