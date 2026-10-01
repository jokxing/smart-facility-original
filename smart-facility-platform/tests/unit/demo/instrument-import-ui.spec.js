import ImportFile from '../../../src/components/ImportFile/index.vue';
import request from '../../../src/utils/request';

jest.mock('../../../src/utils/request', () => ({__esModule: true, default: jest.fn()}));

function context(extra = {}) {
  return {
    isDemoInstrument: true,
    submitLoading: false,
    previewLoading: false,
    importError: '',
    previewRows: [],
    previewOk: false,
    fileList: [{raw: new File(['placeholder'], '设备.xlsx')}],
    $message: {success: jest.fn(), warning: jest.fn(), error: jest.fn()},
    $emit: jest.fn(),
    clearPreview: ImportFile.methods.clearPreview,
    previewSelectedFile: ImportFile.methods.previewSelectedFile,
    ...extra
  };
}

beforeEach(() => request.mockReset());

test('file change clears preview and requests preview without writing import', async () => {
  request.mockResolvedValue({
    code: 1,
    items: {
      ok: true,
      message: '',
      rows: [{rowNumber: 2, name: '甲', department: '演示运维部', type: '演示设备', room: '演示走廊', error: ''}]
    }
  });
  const vm = context();
  await ImportFile.methods.handleFileList.call(vm, vm.fileList[0], vm.fileList);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0].url).toBe('/instrument/import/preview');
  expect(vm.previewOk).toBe(true);
  expect(vm.previewRows).toHaveLength(1);
});

test('confirm stays locked until preview passes; double-click sends one import', async () => {
  let complete;
  request.mockImplementation(config => {
    if (config.url === '/instrument/import') return new Promise(resolve => { complete = resolve; });
    return Promise.resolve({code: 1, items: {ok: true, rows: [], message: ''}});
  });
  const vm = context({previewOk: true});
  const first = ImportFile.methods.submitInstrumentImport.call(vm);
  await ImportFile.methods.submitInstrumentImport.call(vm);
  await Promise.resolve();
  expect(request.mock.calls.filter(call => call[0].url === '/instrument/import')).toHaveLength(1);
  expect(vm.$emit).not.toHaveBeenCalled();
  complete({code: 1, items: {count: 2}});
  await first;
  expect(vm.$emit).toHaveBeenCalledWith('handleUpdateInit', {count: 2});
  expect(vm.submitLoading).toBe(false);
});

test('preview error keeps confirm gated; import failure allows retry after re-preview', async () => {
  const vm = context({previewOk: false, previewRows: [{rowNumber: 3, error: '房间无效'}]});
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(request).not.toHaveBeenCalled();
  expect(vm.importError).toContain('通过校验');

  vm.previewOk = true;
  request
    .mockResolvedValueOnce({code: 0, message: '第 3 行：房间无效'})
    .mockResolvedValueOnce({
      code: 1,
      items: {ok: false, message: '存在校验错误', rows: [{rowNumber: 3, error: '房间无效'}]}
    });
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(vm.$emit).not.toHaveBeenCalled();
  expect(vm.previewOk).toBe(false);
  expect(vm.previewRows[0].error).toContain('房间');
  expect(vm.importError).toMatch(/第 3 行|存在校验错误/);

  request.mockReset();
  vm.previewOk = true;
  vm.importError = '';
  request.mockResolvedValue({code: 1, items: {count: 1}});
  await ImportFile.methods.submitInstrumentImport.call(vm);
  expect(vm.$emit).toHaveBeenCalledTimes(1);
});

test('removing file clears preview; unsupported file never reaches request', async () => {
  const vm = context({
    previewOk: true,
    previewRows: [{rowNumber: 2, name: '甲', error: ''}]
  });
  ImportFile.methods.handleRemove.call(vm, null, []);
  expect(vm.previewOk).toBe(false);
  expect(vm.previewRows).toHaveLength(0);

  vm.fileList = [{raw: new File(['csv'], '设备.csv')}];
  await ImportFile.methods.previewSelectedFile.call(vm);
  expect(request).not.toHaveBeenCalled();
  expect(vm.importError).toContain('.xlsx');
});
