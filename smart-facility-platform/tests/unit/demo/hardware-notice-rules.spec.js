import storage from '../../../src/mock/storage';
import {addEquipmentUsers, listEquipmentUsers, updateEquipmentUserAlarm} from '../../../src/mock/fixtures/equipment';
beforeEach(()=>storage.clear());
const rule = {equipmentId:980001,userId:900002,weixin:0,sms:1,phone:-1,timeFlag:1,timeFrom:'09:00:00',timeTo:'18:00:00',receiveResumeMessageFlag:0};
test('notice rules persist per hardware and user without changing other owners',()=>{
  expect(addEquipmentUsers({equipmentIds:[980001],userIds:[900002,900003],type:'DEVICE'}).ok).toBe(true);
  expect(updateEquipmentUserAlarm(rule).ok).toBe(true);
  const rows=listEquipmentUsers({equipmentId:980001}).list;
  expect(rows.find(row=>row.userId===900002)).toMatchObject(rule);
  expect(rows.find(row=>row.userId===900003).sms).toBe(-1);
  expect(updateEquipmentUserAlarm({...rule,equipmentId:999999}).ok).toBe(false);
  expect(updateEquipmentUserAlarm({...rule,userId:999999}).ok).toBe(false);
});
test('invalid delays and times do not overwrite saved rules',()=>{
  addEquipmentUsers({equipmentIds:[980001],userIds:[900002],type:'DEVICE'});
  updateEquipmentUserAlarm(rule);
  for(const patch of [{sms:2},{phone:null},{timeFrom:'25:00:00'},{timeTo:''},{timeFlag:2},{receiveResumeMessageFlag:null}]) expect(updateEquipmentUserAlarm({...rule,...patch}).ok).toBe(false);
  expect(listEquipmentUsers({equipmentId:980001}).list[0]).toMatchObject(rule);
});
