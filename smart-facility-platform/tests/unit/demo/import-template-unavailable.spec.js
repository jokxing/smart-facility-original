import ImportFile from '../../../src/components/ImportFile/index.vue';

jest.mock('../../../src/utils/request', () => ({__esModule: true, default: jest.fn()}));

test.each(['zh', 'en'])('template is unavailable with localized notice (%s)', lang => {
  localStorage.setItem('lang', lang);
  const warning = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    expect(ImportFile.methods.handleDownImport.call({$message: {warning}})).toBe(false);
    expect(warning).toHaveBeenCalledWith(lang === 'en'
      ? 'Import templates are not available in this demo.'
      : '本演示未接入导入模板，暂不可下载。');
    expect(click).not.toHaveBeenCalled();
  } finally {
    click.mockRestore();
    localStorage.removeItem('lang');
  }
});
