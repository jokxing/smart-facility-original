import storage from '../../../src/mock/storage';
import {listReservations, reservationPage, saveReservation, cancelReservation} from '../../../src/mock/fixtures/reservation';
beforeEach(() => storage.clear());
const slot = (offset = 0) => ({instrumentId:970001, timeFrom:new Date(Math.ceil(Date.now()/60000)*60000 + 86400000 + offset).toISOString(), timeTo:new Date(Math.ceil(Date.now()/60000)*60000 + 90000000 + offset).toISOString()});
test('persist, conflict per device, adjoining slots and cancellation', () => {
  const body = slot(), row = saveReservation(body);
  expect(listReservations(body)).toHaveLength(1);
  expect(() => saveReservation(body)).toThrow('已有预约');
  expect(saveReservation({...body,instrumentId:970002}).instrumentId).toBe(970002);
  saveReservation({...body,timeFrom:body.timeTo,timeTo:new Date(Date.parse(body.timeTo)+3600000).toISOString()});
  expect(() => saveReservation({...body,id:row.id,timeTo:new Date(Date.parse(body.timeTo)+1800000).toISOString()},true)).toThrow('已有预约');
  expect(listReservations(body)[0].timeTo).toBe(row.timeTo);
  expect(() => cancelReservation({id:row.id,instrumentId:970002})).toThrow();
  cancelReservation(row);
  expect(listReservations(body)).toHaveLength(1);
  expect(reservationPage(body).list.find(item => item.id === row.id)).toMatchObject({status:3,instrumentName:'演示培养箱'});
  expect(() => saveReservation({...row},true)).toThrow('已取消');
  expect(saveReservation(body).id).not.toBe(row.id);
  expect(reservationPage({...body,pageSize:1}).list).toHaveLength(1);
});
test('update preserves identity and invalid or past ranges cannot mutate data', () => {
  const row = saveReservation(slot());
  expect(saveReservation({...slot(7200000),id:row.id},true).id).toBe(row.id);
  for (const patch of [{timeFrom:''},{timeFrom:'2026-02-30 12:00'},{timeTo:slot().timeFrom},{timeFrom:'2000-01-01 00:00',timeTo:'2000-01-02 00:00'},{instrumentId:999999}]) expect(() => saveReservation({...slot(),...patch})).toThrow();
  expect(listReservations({instrumentId:970001})).toHaveLength(1);
});
