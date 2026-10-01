// XLSX transport only. Business validation and persistence stay in the fixture.
import ExcelJS from 'exceljs';

export const IMPORT_HEADERS = ['名称', '部门', '分类', '房间'];
export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;

export function validateImportFile(file) {
  if (!file || !/\.xlsx$/i.test(file.name || '')) return '请选择 .xlsx 文件；不支持 .xls 或 CSV。';
  if (!file.size || file.size > IMPORT_MAX_BYTES) return '文件不能为空且不能超过 10MB。';
  return '';
}

export async function createInstrumentWorkbook(options) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('设备导入');
  sheet.addRow(IMPORT_HEADERS);
  sheet.addRow(['新登记设备', options.departments[0].name, options.types[0].name, options.rooms[0].name]);
  sheet.columns.forEach(column => { column.width = 24; });
  sheet.getRow(1).font = {bold: true};
  const guide = workbook.addWorksheet('填写说明');
  guide.addRow(['填写说明', '仅填写设备导入页；名称 2–26 字；同房间名称不能重复；最多 50 行；不支持公式或合并单元格。']);
  for (const [label, values] of [['部门', options.departments], ['分类', options.types], ['房间', options.rooms]]) {
    guide.addRow([label, values.map(item => item.name).join('、')]);
  }
  return workbook.xlsx.writeBuffer();
}

export async function readInstrumentWorkbook(file) {
  const error = validateImportFile(file);
  if (error) throw new Error(error);
  const buffer = typeof file.arrayBuffer === 'function' ? await file.arrayBuffer() : await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('无法读取文件，请重新选择。'));
    reader.readAsArrayBuffer(file);
  });
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.load(buffer); } catch (_) { throw new Error('文件不是有效的 XLSX 工作簿，或文件已损坏。'); }
  const sheet = workbook.getWorksheet('设备导入');
  if (!sheet) throw new Error('缺少「设备导入」工作表，请使用下载的模板。');
  if (workbook.worksheets.some(item => !['设备导入', '填写说明'].includes(item.name) && item.actualRowCount)) {
    throw new Error('发现额外数据工作表，请将全部设备填写到「设备导入」页。');
  }
  if (sheet.rowCount > 51 || sheet.columnCount > 4) throw new Error('模板最多 50 行设备、4 列，请移除多余行列。');
  if ((sheet.model.merges || []).length) throw new Error('导入表不支持合并单元格。');
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    const cells = [1, 2, 3, 4].map(column => {
      const value = row.getCell(column).value;
      if (value != null && typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`第 ${rowNumber} 行第 ${column} 列只允许文本，不支持公式等复杂单元格。`);
      }
      return value == null ? '' : String(value).trim();
    });
    if (rowNumber === 1) {
      if (cells.some((value, index) => value !== IMPORT_HEADERS[index])) throw new Error('表头必须为：名称、部门、分类、房间。');
    } else if (cells.some(Boolean)) rows.push({rowNumber, cells});
  });
  if (sheet.getCell('A1').text !== IMPORT_HEADERS[0]) throw new Error('缺少模板表头。');
  if (!rows.length) throw new Error('请至少填写一行设备。');
  return rows;
}
