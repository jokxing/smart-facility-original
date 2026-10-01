import ImportFile from '../../../src/components/ImportFile/index.vue';

jest.mock('../../../src/utils/request', () => ({__esModule: true, default: jest.fn()}));

test.each(['zh', 'en'])('non-instrument template is unavailable with localized notice (%s)', lang => {
  localStorage.setItem('lang', lang);
  const warning = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    expect(ImportFile.methods.handleDownImport.call({
      $message: {warning},
      title: 'user',
      importType: {instrument: {fileName: '设备导入.xls', enFileName: 'instrument.xls'}}
    })).toBe(false);
    expect(warning).toHaveBeenCalledWith(lang === 'en'
      ? 'Import templates are not available in this demo.'
      : '本演示未接入导入模板，暂不可下载。');
    expect(click).not.toHaveBeenCalled();
  } finally {
    click.mockRestore();
    localStorage.removeItem('lang');
  }
});

test('instrument demo template downloads locally', () => {
  const previous = process.env.VUE_APP_DEMO;
  process.env.VUE_APP_DEMO = 'true';
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const hadCreate = typeof URL.createObjectURL === 'function';
  const hadRevoke = typeof URL.revokeObjectURL === 'function';
  if (!hadCreate) URL.createObjectURL = () => 'blob:demo';
  if (!hadRevoke) URL.revokeObjectURL = () => {};
  const createObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:demo');
  const revoke = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  try {
    expect(ImportFile.methods.handleDownImport.call({
      $message: {warning: jest.fn()},
      title: 'instrument',
      importType: {instrument: {fileName: '设备导入.xls', enFileName: 'instrument.xls'}}
    })).toBe(true);
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();
  } finally {
    click.mockRestore();
    createObjectURL.mockRestore();
    revoke.mockRestore();
    if (!hadCreate) delete URL.createObjectURL;
    if (!hadRevoke) delete URL.revokeObjectURL;
    process.env.VUE_APP_DEMO = previous;
  }
});
