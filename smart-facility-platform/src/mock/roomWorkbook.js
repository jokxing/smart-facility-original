// XLSX transport for room list export. Filtering stays in fixtures/room.js.
import ExcelJS from 'exceljs';

export const ROOM_EXPORT_HEADERS = ['名称', '编号', '部门', '园区', '楼宇', '楼层', '参数状态', '创建时间', '备注'];

function senorStatusLabel(status) {
  const n = Number(status);
  if (n === 1) return '正常';
  if (n === 2) return '异常';
  if (n === -100) return '离线';
  if (n === 3) return '未监测';
  return '-';
}

/** Build list-export workbook from room list rows (already filtered). */
export async function createRoomExportWorkbook(rows = []) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('房间列表');
  sheet.addRow(ROOM_EXPORT_HEADERS);
  sheet.getRow(1).font = {bold: true};
  for (const row of rows) {
    sheet.addRow([
      row.name || '',
      row.no || '',
      row.departmentName || '',
      row.gradenName || '',
      row.buildingName || '',
      row.floorName || '',
      senorStatusLabel(row.senorStatus),
      row.createDate || '',
      row.remark || ''
    ]);
  }
  sheet.columns.forEach(column => { column.width = 18; });
  return workbook.xlsx.writeBuffer();
}
