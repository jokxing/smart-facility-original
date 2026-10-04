import storage from '../../../src/mock/storage';
import {setDemoScenario, resetDemoScenario} from '../../../src/mock/fixtures/scenario';
import {listFloorScreen, listRoomScreen} from '../../../src/mock/fixtures/dataV';
import {listInstruments, listRoonInstrumentInfo} from '../../../src/mock/fixtures/instrument';

beforeEach(() => { storage.clear(); setDemoScenario('mixed'); });
afterEach(() => resetDemoScenario());
test('device screen status and runtime filters intersect the room scope and reset to all', () => {
  expect(listRoomScreen({roomIds:[950003],status:2}).instrumentList.map(row=>row.id)).toEqual([970008]);
  expect(listRoomScreen({roomIds:[950003],type:2}).instrumentCount).toMatchObject({total:6,normalCount:5,alarmCount:1,runCount:6});
  expect(listRoomScreen({roomIds:[950001],status:2}).instrumentList).toEqual([]);
  expect(listRoomScreen({roomIds:[950003],status:1}).instrumentList).toHaveLength(5);
  for (const runStatus of [0,2,3]) expect(listRoomScreen({floorId:930001,runStatus}).instrumentList).toEqual([]);
  const mixed = listRoomScreen({floorId:930001});
  expect(mixed.instrumentCount).toMatchObject({total:12,normalCount:11,alarmCount:1,runCount:12});
  expect(listRoomScreen({roomIds:[950003],status:2,runStatus:1}).instrumentCount.runCount).toBe(6);
  expect(listInstruments({roomId:950003}).list.find(row=>row.id===970008)).toMatchObject({status:1,bingStatus:2});
  expect(listRoonInstrumentInfo(950003).list.find(row=>row.elementId===970008).status).toBe(-1);
});
test('room alarm category filters match alarm readings and invalid categories return empty', () => {
  expect(listFloorScreen({floorId:930001,type:101}).roomList.map(row=>row.id)).toEqual([950003]);
  expect(listFloorScreen({floorId:930001,type:101,status:1}).roomList).toEqual([]);
  expect(listFloorScreen({floorId:930001,type:999999}).roomCount.total).toBe(3);
  expect(listFloorScreen({floorId:930001}).roomCount.total).toBe(3);
});
