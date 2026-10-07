/**
 * Pipette gun demo store. Independent of mini program storage.
 * homingStatus 0 in-use / 1 on-rack / 2 timeout (from takeOutTime vs 24h).
 */
import {DEMO_NOW_MS, formatDemoDateTime} from '../clock';
import storage from '../storage';

const STATE_KEY = 'gunState';
const RECORD_KEY = 'gunRecords';
const PENDING_KEY = 'gunPending';
export const TIMEOUT_MS = 24 * 3600 * 1000;
const RACK_A = 980023;
const RACK_B = 980024;
const PAGE_MAX = 50;

function nowMs() { return DEMO_NOW_MS; }
function fmt(ms) { return formatDemoDateTime(ms); }
function read(key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function write(key, value) {
  storage.setItem(key, JSON.stringify(value));
}

export const DEMO_RACKS = [
  {id: RACK_A, name: '演示移液枪架 A', no: 'EQ-GR-001', status: 1, roomId: 950001, departmentId: 900101, slots: 4, roomName: '演示房间 A'},
  {id: RACK_B, name: '演示移液枪架 B', no: 'EQ-GR-002', status: -100, roomId: 950003, departmentId: 900102, slots: 2, roomName: '演示房间 B'}
];

function defaultGuns() {
  const now = nowMs();
  return [
    {pipetteGunId: 991001, name: '演示移液枪 1', no: 'PG-001', gunRackId: RACK_A, detent: 1, homingStatus: 0, takeOutTime: fmt(now - 2 * 3600000), homingTime: fmt(now - 26 * 3600000), endUser: '演示用户', endUserId: 900001},
    {pipetteGunId: 991002, name: '演示移液枪 2', no: 'PG-002', gunRackId: RACK_A, detent: 2, homingStatus: 1, takeOutTime: fmt(now - 50 * 3600000), homingTime: fmt(now - 28 * 3600000), endUser: '演示运维员', endUserId: 900002},
    {pipetteGunId: 991003, name: '演示移液枪 3', no: 'PG-003', gunRackId: RACK_A, detent: 3, homingStatus: 0, takeOutTime: fmt(now - 36 * 3600000), homingTime: '', endUser: '演示研发员', endUserId: 900003},
    {pipetteGunId: 991004, name: '演示移液枪 4', no: 'PG-004', gunRackId: RACK_B, detent: 1, homingStatus: 1, takeOutTime: fmt(now - 80 * 3600000), homingTime: fmt(now - 72 * 3600000), endUser: '演示用户', endUserId: 900001}
  ];
}

function defaultRecords() {
  const now = nowMs();
  return [
    {id: 992001, pipetteGunId: 991001, no: 'PG-001', pipetteGunName: '演示移液枪 1', pipetteGunUser: '演示用户', gunUserId: 900001, gunRackId: RACK_A, gunRackName: '演示移液枪架 A', position: '1号位', backGunRackName: '', backPosition: '', takeOutTime: fmt(now - 2 * 3600000), homingTime: ''},
    {id: 992002, pipetteGunId: 991002, no: 'PG-002', pipetteGunName: '演示移液枪 2', pipetteGunUser: '演示运维员', gunUserId: 900002, gunRackId: RACK_A, gunRackName: '演示移液枪架 A', position: '2号位', backGunRackName: '演示移液枪架 A', backPosition: '2号位', takeOutTime: fmt(now - 50 * 3600000), homingTime: fmt(now - 28 * 3600000)},
    {id: 992003, pipetteGunId: 991003, no: 'PG-003', pipetteGunName: '演示移液枪 3', pipetteGunUser: '演示研发员', gunUserId: 900003, gunRackId: RACK_A, gunRackName: '演示移液枪架 A', position: '3号位', backGunRackName: '', backPosition: '', takeOutTime: fmt(now - 36 * 3600000), homingTime: ''}
  ];
}

function parseTime(value) {
  if (!value) return NaN;
  const n = Date.parse(String(value).replace(' ', 'T') + '+08:00');
  return Number.isFinite(n) ? n : Date.parse(String(value));
}

function findRack(id) {
  return DEMO_RACKS.find(item => item.id === Number(id)) || null;
}

function loadGuns() {
  const overlay = read(STATE_KEY, null);
  const list = defaultGuns();
  if (!overlay) return list;
  return list.map(gun => overlay[String(gun.pipetteGunId)] ? {...gun, ...overlay[String(gun.pipetteGunId)]} : gun);
}

function saveGuns(list) {
  const map = {};
  list.forEach(gun => {
    map[String(gun.pipetteGunId)] = {
      homingStatus: gun.homingStatus, takeOutTime: gun.takeOutTime, homingTime: gun.homingTime,
      endUser: gun.endUser, endUserId: gun.endUserId, detent: gun.detent, gunRackId: gun.gunRackId
    };
  });
  write(STATE_KEY, map);
}

function loadRecords() {
  const stored = read(RECORD_KEY, null);
  if (Array.isArray(stored) && stored.length) return stored;
  const seed = defaultRecords();
  write(RECORD_KEY, seed);
  return seed;
}

function saveRecords(list) { write(RECORD_KEY, list); }

function computedStatus(gun) {
  if (Number(gun.homingStatus) === 1) return 1;
  const take = parseTime(gun.takeOutTime);
  if (Number.isFinite(take) && nowMs() - take >= TIMEOUT_MS) return 2;
  return 0;
}

function overtimeHours(gun) {
  if (computedStatus(gun) !== 2) return 0;
  const take = parseTime(gun.takeOutTime);
  return Number.isFinite(take) ? Math.floor((nowMs() - take) / 3600000) : 0;
}

function positionOf(rack) {
  return `演示甲园区演示一号楼1F${rack.roomName}`;
}

export function presentGun(gun) {
  const rack = findRack(gun.gunRackId);
  const status = computedStatus(gun);
  const hour = overtimeHours(gun);
  const loc = rack ? `${rack.name} ${gun.detent}号位` : '';
  const deptName = rack && rack.departmentId === 900102 ? '演示研发部' : '演示运维部';
  return {
    pipetteGunId: gun.pipetteGunId,
    id: gun.pipetteGunId,
    name: gun.name,
    no: gun.no,
    gunRackId: gun.gunRackId,
    gunRackName: rack ? rack.name : '',
    detent: gun.detent,
    homingStatus: status,
    takeOutTime: gun.takeOutTime || '',
    homingTime: gun.homingTime || '',
    endUser: gun.endUser || '',
    endUserId: gun.endUserId || 0,
    headUser: '演示用户',
    departmentId: rack ? rack.departmentId : 900101,
    departmentName: deptName,
    companyName: '智慧设施演示空间',
    position: rack ? positionOf(rack) : '',
    preciseLocation: status === 1 ? loc : '使用中',
    overTime: hour ? `${hour}h` : '',
    hour,
    roomId: rack ? rack.roomId : 0,
    gardenId: 910001,
    buildingId: 920001,
    floorId: 930001,
    createDate: '2026-03-01 09:00:00',
    reportDate: fmt(nowMs()),
    remark: '演示移液枪。取还为本地模拟确认，未连接真实枪架。',
    cancelAlarmFlag: 1
  };
}

function parsePage(data) {
  let pageNum = Number(data && data.pageNum);
  let pageSize = Number(data && data.pageSize);
  if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
  if (pageSize > PAGE_MAX) pageSize = PAGE_MAX;
  return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

export function presentedList() {
  return loadGuns().map(presentGun);
}

export function listGuns(data = {}) {
  const page = parsePage(data);
  let status = data.status;
  if (status === '' || status == null) status = null;
  else status = Number(status);
  const keyword = data.keyword ? String(data.keyword).toLowerCase() : '';
  const deptId = data.departmentId != null && data.departmentId !== '' ? Number(data.departmentId) : null;
  const gardenId = data.gardenId != null && data.gardenId !== '' ? Number(data.gardenId) : null;
  const roomIds = Array.isArray(data.roomIds) ? data.roomIds.map(Number) : (data.roomId ? [Number(data.roomId)] : []);
  const signatureId = data.signatureId != null && data.signatureId !== '' ? Number(data.signatureId) : null;
  const rows = presentedList().filter(row => {
    if (status != null && !Number.isNaN(status) && Number(row.homingStatus) !== status) return false;
    if (keyword && String(row.name).toLowerCase().indexOf(keyword) === -1 && String(row.no).toLowerCase().indexOf(keyword) === -1) return false;
    if (deptId != null && !Number.isNaN(deptId) && Number(row.departmentId) !== deptId) return false;
    if (gardenId != null && Number(row.gardenId) !== gardenId) return false;
    if (roomIds.length && roomIds.indexOf(Number(row.roomId)) === -1) return false;
    if (signatureId != null && !Number.isNaN(signatureId) && Number(row.endUserId) !== signatureId) return false;
    return true;
  });
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function statistics() {
  const rows = presentedList();
  return {
    totalNum: rows.length,
    noHomingNum: rows.filter(r => r.homingStatus === 0).length,
    homingNum: rows.filter(r => r.homingStatus === 1).length,
    errorHomingNum: rows.filter(r => r.homingStatus === 2).length
  };
}

export function getGunDetail(gunId) {
  const id = Number(gunId);
  return presentedList().find(row => row.pipetteGunId === id) || null;
}

export function listGunPipetteBindings(body = {}) {
  const rackId = Number(body.gunRackId);
  const page = parsePage(body);
  const rack = findRack(rackId);
  if (!rack) return {list: [], total: 0, pageNum: page.pageNum, pageSize: page.pageSize};
  const guns = presentedList().filter(g => g.gunRackId === rackId);
  const slots = [];
  for (let detent = 1; detent <= rack.slots; detent++) {
    const gun = guns.find(g => Number(g.detent) === detent);
    if (gun) {
      slots.push({
        id: rackId * 10 + detent, detent, name: gun.name, no: gun.no, homingStatus: gun.homingStatus,
        gunRackId: rackId, gunRackName: rack.name, pipetteGunId: gun.pipetteGunId,
        takeOutTime: gun.takeOutTime || '', homingTime: gun.homingTime || '',
        position: gun.preciseLocation || `${detent}号位`, endUser: gun.endUser || ''
      });
    } else {
      slots.push({
        id: rackId * 10 + detent, detent, name: '', no: 'null', homingStatus: 0,
        gunRackId: rackId, gunRackName: rack.name, pipetteGunId: 0,
        takeOutTime: '', homingTime: '', position: '', endUser: ''
      });
    }
  }
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: slots.slice(start, start + page.pageSize), total: slots.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

function durationText(from, to) {
  const start = parseTime(from);
  const end = parseTime(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return '';
  const ms = end - start;
  return `${Math.floor(ms / 3600000)}小时${Math.floor((ms % 3600000) / 60000)}分钟`;
}

function presentRecord(row) {
  const end = row.homingTime || fmt(nowMs());
  return {
    ...row,
    durationUse: durationText(row.takeOutTime, end),
    status: row.homingTime ? 2 : 1
  };
}

export function listHistory(body = {}) {
  const page = parsePage(body);
  const gunId = Number(body.gunId || body.pipetteGunId);
  const status = body.status !== '' && body.status != null ? Number(body.status) : null;
  const userId = body.gunUserId != null && body.gunUserId !== '' ? Number(body.gunUserId) : null;
  const rows = loadRecords().map(presentRecord).filter(row => {
    if (gunId && !Number.isNaN(gunId) && Number(row.pipetteGunId) !== gunId) return false;
    if (status === 1 && row.homingTime) return false;
    if (status === 2 && !row.homingTime) return false;
    if (userId != null && !Number.isNaN(userId) && Number(row.gunUserId) !== userId) return false;
    return true;
  }).sort((a, b) => String(b.takeOutTime).localeCompare(String(a.takeOutTime)));
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function requestTake(body = {}) {
  const rackId = Number(body.gunRackId);
  const rack = findRack(rackId);
  if (!rack) return {ok: false, message: '未知枪架'};
  if (Number(rack.status) !== 1) return {ok: false, message: '枪架离线，演示不模拟硬件取枪成功'};
  const pending = read(PENDING_KEY, null);
  if (pending && Number(pending.gunRackId) === rackId && !pending.confirmed) {
    return {ok: false, message: '已有取枪申请，请等待模拟确认'};
  }
  const homed = presentedList().filter(g => g.gunRackId === rackId && g.homingStatus === 1);
  if (!homed.length) return {ok: false, message: '该枪架没有在位移液枪，无法取枪'};
  write(PENDING_KEY, {
    gunRackId: rackId,
    userId: Number(body.userId || 900001),
    userName: body.userName || '演示用户',
    confirmed: false,
    createdAt: fmt(nowMs())
  });
  return {ok: true, items: {status: 0}};
}

export function pollTake(body = {}) {
  const rackId = Number(body.gunRackId);
  const pending = read(PENDING_KEY, null);
  if (!pending || Number(pending.gunRackId) !== rackId) return {ok: false, message: '没有取枪申请'};
  if (pending.confirmed && pending.gunId) return {ok: true, items: {status: 1, gunId: pending.gunId, simulated: true}};
  const rack = findRack(rackId);
  if (!rack || Number(rack.status) !== 1) {
    storage.removeItem(PENDING_KEY);
    return {ok: false, message: '枪架离线，演示不模拟硬件取枪成功'};
  }
  const guns = loadGuns();
  const target = guns.find(g => presentGun(g).gunRackId === rackId && presentGun(g).homingStatus === 1);
  if (!target) {
    storage.removeItem(PENDING_KEY);
    return {ok: false, message: '该枪架没有在位移液枪，无法取枪'};
  }
  target.homingStatus = 0;
  target.takeOutTime = fmt(nowMs());
  target.homingTime = '';
  target.endUser = pending.userName || '演示用户';
  target.endUserId = pending.userId || 900001;
  saveGuns(guns);
  const records = loadRecords();
  const nextId = Math.max(992100, ...records.map(r => r.id + 1));
  records.push({
    id: nextId, pipetteGunId: target.pipetteGunId, no: target.no, pipetteGunName: target.name,
    pipetteGunUser: target.endUser, gunUserId: target.endUserId, gunRackId: rackId,
    gunRackName: rack.name, position: `${target.detent}号位`, backGunRackName: '', backPosition: '',
    takeOutTime: target.takeOutTime, homingTime: ''
  });
  saveRecords(records);
  const next = {...pending, confirmed: true, gunId: target.pipetteGunId};
  write(PENDING_KEY, next);
  return {ok: true, items: {status: 1, gunId: target.pipetteGunId, simulated: true}};
}

export function returnGun(body = {}) {
  const gunId = Number(body.gunId || body.pipetteGunId);
  const guns = loadGuns();
  const gun = guns.find(g => g.pipetteGunId === gunId);
  if (!gun) return {ok: false, message: '未知移液枪'};
  const view = presentGun(gun);
  if (view.homingStatus === 1) return {ok: false, message: '该移液枪已在位，不能重复归还'};
  const rack = findRack(gun.gunRackId);
  if (!rack) return {ok: false, message: '未知枪架'};
  if (Number(rack.status) !== 1) return {ok: false, message: '枪架离线，演示不模拟硬件归还成功'};
  const occupied = guns.some(other => {
    const v = presentGun(other);
    return v.pipetteGunId !== gunId && v.gunRackId === gun.gunRackId && v.detent === gun.detent && v.homingStatus === 1;
  });
  if (occupied) return {ok: false, message: '目标枪位已被占用'};
  const takeMs = parseTime(gun.takeOutTime);
  const homeMs = nowMs();
  if (Number.isFinite(takeMs) && homeMs < takeMs) {
    return {ok: false, message: '归还时间不能早于取出时间'};
  }
  gun.homingStatus = 1;
  gun.homingTime = fmt(homeMs);
  saveGuns(guns);
  const records = loadRecords();
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].pipetteGunId === gunId && !records[i].homingTime) {
      records[i].homingTime = gun.homingTime;
      records[i].backGunRackName = rack.name;
      records[i].backPosition = `${gun.detent}号位`;
      break;
    }
  }
  saveRecords(records);
  const pending = read(PENDING_KEY, null);
  if (pending && Number(pending.gunId) === gunId) storage.removeItem(PENDING_KEY);
  return {ok: true, items: presentGun(gun)};
}

export function useStatistics() {
  return presentedList().map(g => ({
    name: g.name,
    data: loadRecords().filter(r => r.pipetteGunId === g.pipetteGunId).length,
    dataUnit: '次'
  }));
}

export function timeoutStatistics() {
  return presentedList().filter(g => g.homingStatus === 2).map(g => ({
    name: g.name,
    data: 1,
    dataUnit: '次'
  }));
}

export function noHomingList(body = {}) {
  const page = parsePage(body);
  const hour = Number(body.hour);
  const minHour = Number.isFinite(hour) && hour > 0 ? hour : 24;
  const rows = presentedList().filter(g => g.homingStatus !== 1 && g.hour >= minHour).map(g => ({
    name: g.name,
    no: g.no,
    gunRackName: g.gunRackName,
    headUser: g.headUser,
    departmentName: g.departmentName,
    endUserName: g.endUser
  }));
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function mouseInfo(params = {}) {
  const detail = getGunDetail(params.gunId || params.id)
    || presentedList().find(g => g.no === params.no)
    || presentedList().find(g => Number(g.gunRackId) === Number(params.gunRackId) && Number(g.detent) === Number(params.detent));
  if (!detail) return null;
  return {
    status: detail.homingStatus,
    detent: detail.detent,
    hour: detail.hour,
    gunRackName: detail.gunRackName
  };
}

export function useFrequency() {
  const rows = presentedList();
  const inUse = rows.filter(g => g.homingStatus !== 1).length;
  const ratio = rows.length ? Math.round((inUse / rows.length) * 100) : 0;
  return {
    count: rows.length,
    gradeOneRatio: ratio < 20 ? ratio : 0,
    gradeTwoRatio: ratio >= 20 && ratio < 40 ? ratio : 0,
    gradeThreeRatio: ratio >= 40 && ratio < 60 ? ratio : 0,
    gradeFourRatio: ratio >= 60 && ratio < 80 ? ratio : 0,
    gradeFiveRatio: ratio >= 80 ? ratio : 0,
    gradeOneList: [],
    gradeTwoList: [],
    gradeThreeList: rows.filter(g => g.homingStatus !== 1).map(g => ({name: g.name, no: g.no})),
    gradeFourList: [],
    gradeFiveList: []
  };
}

export function signatureUseRanked(body = {}) {
  const page = parsePage(body);
  const list = [
    {name: '演示用户', data: loadRecords().filter(r => r.gunUserId === 900001).length, dataUnit: '次'}
  ];
  return {list: list.slice(0, page.pageSize), total: list.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function timeoutSignature(body = {}) {
  const page = parsePage(body);
  const list = presentedList().filter(g => g.homingStatus === 2).map(g => ({
    name: g.endUser || '未登记',
    data: 1,
    dataUnit: '次'
  }));
  return {list: list.slice(0, page.pageSize), total: list.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function detailsUsePerson(body = {}) {
  const records = listHistory({gunId: body.pipetteGunId || body.gunId, pageNum: 1, pageSize: 50}).list;
  const byUser = {};
  records.forEach(row => {
    const name = row.pipetteGunUser || '未登记';
    byUser[name] = (byUser[name] || 0) + 1;
  });
  const list = Object.keys(byUser).map(name => ({name, data: byUser[name], dataUnit: '次'}));
  return {
    pageData: {list, total: list.length, pageNum: 1, pageSize: 10},
    useDuration: records[0] ? records[0].durationUse : 0,
    useFrequency: records.length,
    useRatio: records.length ? 40 : 0
  };
}

export function detailsTimeout(body = {}) {
  const id = body.pipetteGunId || body.gunId;
  const gun = getGunDetail(id) || presentedList().find(g => g.no === body.no);
  const timed = !!(gun && gun.homingStatus === 2);
  const list = timed ? [{name: gun.endUser || '未登记', data: gun.hour, dataUnit: 'h'}] : [];
  return {
    pageData: {list, total: list.length, pageNum: 1, pageSize: 10},
    gunTimeoutFrequencyResult: {
      countHour: timed ? 1 : 0,
      countGTHour: timed && gun.hour > 1 ? 1 : 0,
      countGTHalfDay: timed && gun.hour >= 12 ? 1 : 0,
      countGTDay: timed && gun.hour >= 24 ? 1 : 0
    }
  };
}

export function detailsTimeoutDetails(body = {}) {
  return listHistory({...body, gunId: body.gunId, status: 1});
}

export function alarmRule() {
  return {timeoutHour: 24, remark: '超时按取出后 24 小时计算，演示不发送真实告警'};
}
