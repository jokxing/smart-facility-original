import storage from '../../../src/mock/storage';
import {addDemoInstrument, updateInstrumentBasic, listInstruments, listRoonInstrumentInfo,
  saveRoomInstrumentLayout, removeInstrument, setBoundEquipmentTypesResolver} from '../../../src/mock/fixtures/instrument';
import {createDemoRoom} from '../../../src/mock/fixtures/room';
import axios from 'axios';
import qs from 'qs';
import mockAdapter from '../../../src/mock';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

beforeEach(() => { storage.clear(); setBoundEquipmentTypesResolver(() => []); });
const create = (roomId=950001) => addDemoInstrument({name:'新增布局检测仪', departmentId:900101, types:1, roomId});
const place = (id,roomId=950001) => ({type:4, elementId:id, roomId, mediaId:roomId,
  x:800,y:395,rotation:0,scaleX:0.8,scaleY:0.8,sortIndex:0});

test('created device starts as candidate; partial and empty layouts persist without deleting records', () => {
  const {id} = create();
  expect(listInstruments({roomId:950001, monitor:2}).list.some(row => row.id===id)).toBe(true);
  expect(saveRoomInstrumentLayout([place(id)],950001).ok).toBe(true);
  expect(listRoonInstrumentInfo(950001).list.map(row => row.id)).toEqual([id]);
  expect(saveRoomInstrumentLayout([],950001).ok).toBe(true);
  expect(listRoonInstrumentInfo(950001).list).toEqual([]);
  expect(listInstruments({roomId:950001, monitor:2}).total).toBe(7);
});

test('rename flows to layout; room change clears old coordinates and returning never revives them', () => {
  const {id} = create();
  saveRoomInstrumentLayout([place(id)],950001);
  const edit = {id,name:'改名检测仪',departmentId:900101,types:1,roomId:950003};
  expect(updateInstrumentBasic(edit).ok).toBe(true);
  expect(listRoonInstrumentInfo(950001).list).toEqual([]);
  expect(listInstruments({roomId:950003,monitor:2}).list.some(row=>row.id===id)).toBe(true);
  expect(updateInstrumentBasic({...edit,roomId:950001}).ok).toBe(true);
  expect(listRoonInstrumentInfo(950001).list).toEqual([]);
  saveRoomInstrumentLayout([place(id)],950001);
  expect(listRoonInstrumentInfo(950001).list[0].name).toBe('改名检测仪');
  expect(removeInstrument(id).ok).toBe(true);
  expect(listRoonInstrumentInfo(950001).list).toEqual([]);
});

test('seed device relocation cannot resurrect its old position', () => {
  const edit={id:970004,name:'搬迁检测仪',departmentId:900101,types:1};
  updateInstrumentBasic({...edit,roomId:950003});
  updateInstrumentBasic({...edit,roomId:950001});
  expect(listRoonInstrumentInfo(950001).list.some(row=>row.id===970004)).toBe(false);
});

test('new room with registered map supports device placement; invalid ownership and bounds reject atomically', () => {
  const room=createDemoRoom({name:'新增实验室',no:'M5-ROOM',floorId:930001,departmentId:900101,mapUrl:'demo-room-a'}).item;
  const {id}=create(room.id);
  expect(saveRoomInstrumentLayout([place(id,room.id)],room.id).ok).toBe(true);
  const before=storage.getItem('roomLayoutOverrides');
  for (const items of [[place(id,950001)], [{...place(id,room.id),x:0}], [place(id,room.id),place(id,room.id)]]) {
    expect(saveRoomInstrumentLayout(items,room.id).ok).toBe(false);
    expect(storage.getItem('roomLayoutOverrides')).toBe(before);
  }
});

test('storage failure reports failure and bound hardware still blocks business deletion', () => {
  const {id}=create();
  const write=jest.spyOn(storage,'setItem').mockImplementation(()=>{throw new Error('quota');});
  expect(saveRoomInstrumentLayout([place(id)],950001).ok).toBe(false);
  write.mockRestore();
  setBoundEquipmentTypesResolver(()=>[1]);
  expect(removeInstrument(id).ok).toBe(false);
});

test('room move rolls back layout if the entity write fails', () => {
  const {id}=create();
  saveRoomInstrumentLayout([place(id)],950001);
  const value=storage.getItem('roomLayoutOverrides');
  const original=storage.setItem;
  const write=jest.spyOn(storage,'setItem').mockImplementation((key,data)=>{
    if(key==='instrumentMeta') throw new Error('quota');
    return original(key,data);
  });
  expect(updateInstrumentBasic({id,name:'保存失败测试',departmentId:900101,types:1,roomId:950003}).ok).toBe(false);
  write.mockRestore();
  expect(storage.getItem('roomLayoutOverrides')).toBe(value);
  expect(listInstruments({roomId:950001}).list.some(row=>row.id===id)).toBe(true);
});

test('authenticated object API saves empty snapshot; missing room and mixed schemas reject', async () => {
  const client=axios.create({baseURL:DEMO_BASE_URL,adapter:mockAdapter});
  const body={type:4,roomId:950001,list:[]};
  expect((await client.post('/map/element/config',body)).data.code).toBe(2);
  const captcha=await client.get('/captchaCode');
  const sessionId=captcha.data.items.sessionId;
  client.defaults.headers.common.Authorization=sessionId;
  storage.setItem('sessionId',sessionId);
  const login=await client.post('/login',qs.stringify({...DEMO_CREDENTIALS,sessionId}));
  storage.setItem('token',login.data.items.token);
  expect((await client.post('/map/element/config',body)).data.code).toBe(1);
  expect(listRoonInstrumentInfo(950001).list).toEqual([]);
  for(const invalid of [{type:4,list:[]},{type:4,roomId:999999,list:[]},{...body,list:[{type:11,elementId:950001}]}])
    expect((await client.post('/map/element/config',invalid)).data.code).toBe(0);
});
