import storage from '../storage';
import moment from 'moment';
import {getDemoInstrumentDetail} from './instrument';

const KEY = 'instrumentReservations';
function rows() { return JSON.parse(storage.getItem(KEY) || '[]'); }
function time(value) {
  const parsed = moment(value, [moment.ISO_8601, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], true);
  return parsed.isValid() ? parsed.valueOf() : NaN;
}
export function listReservations(body = {}) {
  if (!getDemoInstrumentDetail(body.instrumentId)) throw new Error('设备不存在。');
  return rows().filter(row => !row.cancelled && row.instrumentId === Number(body.instrumentId) &&
    (!body.startDate || time(row.timeTo) > time(body.startDate)) &&
    (!body.endDate || time(row.timeFrom) < time(body.endDate)));
}
export function reservationPage(body = {}) {
  const detail = getDemoInstrumentDetail(body.instrumentId);
  if (!detail) throw new Error('设备不存在。');
  const list = rows().filter(row => row.instrumentId === Number(body.instrumentId)).map(row => ({
    ...row, instrumentName: detail.name, instrumentNo: detail.no, tel: row.tel || '—',
    updateDate: row.createDate || row.updateDate || '—',
    status: row.cancelled ? 3 : time(row.timeTo) <= Date.now() ? 2 : time(row.timeFrom) <= Date.now() ? 1 : 0
  })).sort((a,b) => b.id - a.id);
  const pageNum = Math.max(1, Number(body.pageNum) || 1), pageSize = Math.min(100, Math.max(1, Number(body.pageSize) || 10));
  return {list: list.slice((pageNum-1)*pageSize,pageNum*pageSize), total:list.length,pageNum,pageSize};
}
export function saveReservation(body = {}, update = false) {
  const list = rows();
  const old = update && list.find(row => row.id === Number(body.id));
  if (update && (!old || old.instrumentId !== Number(body.instrumentId))) throw new Error('预约不存在。');
  if (old && old.cancelled) throw new Error('预约已取消，不能修改。');
  if (old && time(old.timeTo) <= Date.now()) throw new Error('预约已结束，不能修改。');
  if (!getDemoInstrumentDetail(body.instrumentId)) throw new Error('设备不存在。');
  const start = time(body.timeFrom), end = time(body.timeTo);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) throw new Error('请选择有效的开始和结束时间，结束时间须晚于开始时间。');
  if (end <= Date.now() || ((!old || time(old.timeFrom) > Date.now()) && start < Date.now()) ||
    (old && time(old.timeFrom) <= Date.now() && start !== time(old.timeFrom))) throw new Error('预约时间已过去，进行中的预约不可修改开始时间。');
  if (list.some(row => !row.cancelled && row.instrumentId === Number(body.instrumentId) && row.id !== (old && old.id) && time(row.timeFrom) < end && time(row.timeTo) > start)) throw new Error('该时段已有预约，请选择其他时间。');
  const row = {...old, id: old ? old.id : Math.max(Date.now(), ...list.map(item => item.id + 1)), instrumentId: Number(body.instrumentId), userName: old ? old.userName : (storage.getItem('username') || '演示用户'), timeFrom: moment(start).format('YYYY-MM-DD HH:mm:ss'), timeTo: moment(end).format('YYYY-MM-DD HH:mm:ss')};
  row.createDate = old ? old.createDate : moment().format('YYYY-MM-DD HH:mm:ss');
  row.userId = old ? old.userId : 900001;
  storage.setItem(KEY, JSON.stringify(old ? list.map(item => item.id === old.id ? row : item) : [...list, row]));
  return row;
}
export function cancelReservation(body = {}) {
  const list = rows(), row = list.find(item => item.id === Number(body.id) && item.instrumentId === Number(body.instrumentId));
  if (!row || !getDemoInstrumentDetail(body.instrumentId)) throw new Error('预约不存在。');
  storage.setItem(KEY, JSON.stringify(list.map(item => item.id === row.id ? {...item,cancelled:true} : item)));
  return row;
}
