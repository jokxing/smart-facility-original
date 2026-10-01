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

test('instrument template delegates to XLSX download', () => {
  const previous = process.env.VUE_APP_DEMO;
  process.env.VUE_APP_DEMO = 'true';
  const downloadInstrumentTemplate = jest.fn(() => true);
  expect(ImportFile.methods.handleDownImport.call({title: 'instrument', downloadInstrumentTemplate})).toBe(true);
  expect(downloadInstrumentTemplate).toHaveBeenCalledTimes(1);
  process.env.VUE_APP_DEMO = previous;
});
