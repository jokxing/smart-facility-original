jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test'}));
import axios from 'axios';
import mockAdapter from '../../../src/mock';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import {newSession, authenticateSession} from '../../../src/mock/session';
import storage from '../../../src/mock/storage';
import {DEMO_MENUS} from '../../../src/mock/fixtures/auth';
import {DEMO_INSTRUMENTS} from '../../../src/mock/fixtures/instrument';
import {DEMO_FLOOR_ROOMS} from '../../../src/mock/fixtures/floor';
import {
  updateEquipmentSensors, getEquipmentDetail, getEquipmentSingleMonitorFlag,
  getEquipmentMonitorInfo, listEquipmentSort, addEquipmentInstrumentBinding,
  listEquipmentBindings, listBindableCatalog
} from '../../../src/mock/fixtures/equipment';

beforeEach(() => storage.clear());

test('invalid probes, duplicates and blank ranges cannot overwrite persisted rules', () => {
  const good = {idx: 0, type: 1, min: 2, max: 28};
  expect(updateEquipmentSensors({id: 980001, sensors: [good]}).ok).toBe(true);
  const invalid = [
    [{...good, idx: 999}], [{...good, type: 999}], [good, good], [null],
    [{...good, min: ''}], [{...good, min: ' '}], [{...good, max: null}],
    [{...good, min: false}], [{...good, max: Infinity}],
    [{...good, switchOff: true, warningMin: '', warningMax: 10}]
  ];
  invalid.forEach(sensors => {
    expect(updateEquipmentSensors({id: 980001, sensors}).ok).toBe(false);
    expect(getEquipmentDetail(980001).sensors[0]).toMatchObject({min: 2, max: 28});
  });
  expect(updateEquipmentSensors({id: 980001, sensors: [{...good, min: 0}]}).ok).toBe(true);
});

test('batch binding is atomic for invalid targets and duplicate entries', () => {
  const first = {equipmentId: 980001, thingsId: 970001};
  for (const second of [{...first, thingsId: 999999}, {...first, equipmentId: 980012}, first]) {
    expect(addEquipmentInstrumentBinding([first, second]).ok).toBe(false);
    expect(listEquipmentBindings({equipmentId: 980001})).toEqual([]);
  }
  expect(addEquipmentInstrumentBinding([first, {...first, thingsId: 970002}]).ok).toBe(true);
  expect(listEquipmentBindings({equipmentId: 980001}).map(item => item.id)).toEqual([970001, 970002]);
  expect(addEquipmentInstrumentBinding([{...first, thingsId: 970003}, first]).ok).toBe(false);
  expect(listEquipmentBindings({equipmentId: 980001})).toHaveLength(2);
});

test('power monitoring uses discrete power values; devices without probes stay out of temperature facets', () => {
  const flag = getEquipmentSingleMonitorFlag(980014)[0];
  expect(flag).toMatchObject({sensorId: 17, sensorAlias: '供电状态', unit: ''});
  const curve = getEquipmentMonitorInfo({type: 1, objId: 980014, objSensorId: flag.objSensorId, interval: 4});
  expect(curve.length).toBeGreaterThan(0);
  expect(curve.every(item => item.data === 1)).toBe(true);
  expect(getEquipmentMonitorInfo({type: 1, objId: 980015, objSensorId: 9800151, interval: 4})).toEqual([]);
  const temperature = listEquipmentSort({deviceType: 1, pageSize: 100}).list;
  expect(temperature.every(item => ![7, 8, 13, 16].includes(item.equipmentTypeCode))).toBe(true);
  expect(getEquipmentSingleMonitorFlag(980025)).toEqual([]);
  expect(getEquipmentSingleMonitorFlag(980001)[0]).toMatchObject({unit: '℃'});
});

test('binding catalog comes from shared entities and is exposed through authenticated mock', async () => {
  expect(listBindableCatalog('instrument').map(item => item.id)).toEqual(DEMO_INSTRUMENTS.map(item => item.id));
  expect(listBindableCatalog('room').map(item => item.id)).toEqual(Object.values(DEMO_FLOOR_ROOMS).flat().map(item => item.id));
  const client = axios.create({baseURL: DEMO_BASE_URL, adapter: mockAdapter});
  expect((await client.get('/__demo/equipment/bindable', {params: {kind: 'room'}})).data.code).toBe(2);
  const session = authenticateSession(newSession());
  client.defaults.headers.common.Authorization = session.sessionId;
  const res = await client.get('/__demo/equipment/bindable', {params: {kind: 'instrument'}});
  expect(res.data.items).toEqual(listBindableCatalog('instrument'));
  expect((await client.get('/__demo/equipment/bindable', {params: {kind: 'unknown'}})).data.code).toBe(0);
});

test('hardware menu does not advertise the blocked recorder management route', () => {
  const hardware = DEMO_MENUS.find(menu => menu.id === 'lhd');
  expect(hardware.subMenu.map(item => item.path)).toEqual(['/lhd/hardware/home', '/lhd/pipetteGun/pipetteGun']);
});
