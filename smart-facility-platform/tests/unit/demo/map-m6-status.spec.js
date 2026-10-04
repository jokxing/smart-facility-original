import storage from '../../../src/mock/storage';
import {setDemoScenario, resetDemoScenario, statusForInstrument, aggregateInstrumentStatus} from '../../../src/mock/fixtures/scenario';
import {listFloorOverview} from '../../../src/mock/fixtures/floor';
import {getDemoRoomDetail} from '../../../src/mock/fixtures/room';
import {listFloorScreen, listRoomScreen} from '../../../src/mock/fixtures/dataV';
import {listInstruments, listRoonInstrumentInfo, getDemoOpenMonitorFlag, updateInstrumentBasic} from '../../../src/mock/fixtures/instrument';

beforeEach(() => { storage.clear(); setDemoScenario('mixed'); });
afterEach(() => resetDemoScenario());

test('mixed device statuses agree across room aggregation, layout, list, readings and screens', () => {
  for (const [id, status] of [[950001, 1], [950003, 2], [950002, 3]]) {
    expect(listFloorOverview(930001).labList.find(room => room.id === id).senorStatus).toBe(status);
    expect(getDemoRoomDetail(id).senorStatus).toBe(status);
    expect(listFloorScreen({floorId:930001}).roomList.find(room => room.id === id).senorStatus).toBe(status);
  }
  const cards = listRoomScreen({floorId:930001}).instrumentList;
  expect(cards.filter(device => device.senorStatus === 2).map(device => device.id)).toEqual([970008]);
  expect(cards.filter(device => device.senorStatus === 1)).toHaveLength(11);
  const alarm = cards.find(device => device.id === 970008).data[0];
  expect(Number(alarm.monitorSensorVal)).toBeGreaterThan(alarm.normalMax);
  expect(listFloorScreen({floorId:930001}).roomList.find(room=>room.id===950003).data[0].monitorSensorVal).toBe(alarm.monitorSensorVal);
  expect(listInstruments({roomId:950003}).list.find(device=>device.id===970008).bingStatus).toBe(2);
  expect(listRoonInstrumentInfo(950003).list.filter(device=>device.senorStatus===2).map(device=>device.elementId)).toEqual([970008]);
  expect(getDemoOpenMonitorFlag(970008).list.some(sensor => sensor.activateFlag === 1)).toBe(true);
  expect(statusForInstrument(970101).senorStatus).toBe(1);
  expect(aggregateInstrumentStatus([])).toBe(3);
});

test('moving the alarm device changes both rooms without a global scene switch', () => {
  expect(updateInstrumentBasic({id:970008,name:'演示示波器 B',departmentId:900101,types:1,roomId:950001}).ok).toBe(true);
  expect(getDemoRoomDetail(950001).senorStatus).toBe(2);
  expect(getDemoRoomDetail(950003).senorStatus).toBe(1);
  expect(listFloorScreen({floorId:930001,status:2}).roomList.map(room=>room.id)).toEqual([950001]);
});
