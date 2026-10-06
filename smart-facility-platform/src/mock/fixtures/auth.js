// Synthetic public demo credentials and identity; no original business data.
import storage from '../storage';
import {DEMO_NOW_MS, formatDemoDateTime} from '../clock';

export const DEMO_CREDENTIALS = {username: 'demo', password: 'Demo1234', captchaCode: '2468'};
export const DEMO_USER = {
  id: 900001, loginId: 'demo', name: '演示用户', companyId: 900001,
  companyName: '智慧设施演示空间', departmentId: 900101, roleId: 1,
  deviceSeeFlag: 1, instrumentSeeFlag: 1, roomSeeFlag: 1
};
/** Staff pool for SetPrincipal /user/list / Department page (demo only; same IDs). */
export const DEMO_STAFF = Object.freeze([
  {
    id: 900001, name: '演示用户', loginId: 'demo', departmentId: 900101,
    tel: '13800000001', email: 'demo@example.com', isBoundWeixin: true,
    departmentName: '演示运维部', roleName: '演示管理员',
    companyId: 900001, companyName: '智慧设施演示空间',
    createDate: '2026-01-08 09:00:00', editFlag: 1, roleId: 1
  },
  {
    id: 900002, name: '演示运维员', loginId: 'ops', departmentId: 900101,
    tel: '13800000002', email: 'ops@example.com', isBoundWeixin: false,
    departmentName: '演示运维部', roleName: '演示成员',
    companyId: 900001, companyName: '智慧设施演示空间',
    createDate: '2026-02-12 10:30:00', editFlag: 1, roleId: 2
  },
  {
    id: 900003, name: '演示研发员', loginId: 'rd', departmentId: 900102,
    tel: '13800000003', email: 'rd@example.com', isBoundWeixin: true,
    departmentName: '演示研发部', roleName: '演示成员',
    companyId: 900001, companyName: '智慧设施演示空间',
    createDate: '2026-03-05 14:15:00', editFlag: 1, roleId: 2
  }
]);
export const DEMO_DEPARTMENTS = [
  {
    id: 900101, name: '演示运维部', departmentName: '演示运维部',
    parentId: 0, parentDepartmentId: 0, isOperation: 1, defaultDepartment: 0, sortIndex: 0,
    children: [], subDivisions: []
  },
  {
    id: 900102, name: '演示研发部', departmentName: '演示研发部',
    parentId: 0, parentDepartmentId: 0, isOperation: 1, defaultDepartment: 0, sortIndex: 1,
    children: [], subDivisions: []
  }
];
const SEED_DEPARTMENT_IDS = Object.freeze([900101, 900102]);
const DEPT_CREATED_ID_MIN = 900103;
const DEPT_CREATED_ID_MAX = 900150;
const DEPARTMENT_CREATED_KEY = 'departmentCreated';
const DEPARTMENT_META_KEY = 'departmentMeta';
/** Minimal role stub for Modal.vue GET /role/list; name「普通成员」matches i18n normalUser. */
export const DEMO_ROLES = Object.freeze([
  {id: 1, name: '演示管理员'},
  {id: 2, name: '普通成员'}
]);
/** Cascader (SearchForm) expects `types` + `childrenList`; SelectAssetClassify label uses `code`. */
export const DEMO_CATEGORIES = [
  {id: 900201, name: '演示设备', catName: '演示设备', types: 1, code: 'DEMO-1', parentId: 0, children: [], childrenList: []},
  {id: 900202, name: '演示辅助设备', catName: '演示辅助设备', types: 2, code: 'DEMO-2', parentId: 0, children: [], childrenList: []}
];
export const DEMO_MENUS = [
  {id: 'ld', name: '设备管理', englishName: 'labDevice', path: '/ld/labdevice', subMenu: [
    {id: 'demo-labdevice', name: '实验室设备', englishName: 'labDevice', path: '/ld/labdevice', icon: 'icon-home1', subMenu: []},
    {id: 'demo-maintenance', name: '维保管理', englishName: 'maintenance', path: '/ld/maintenance', icon: 'icon-icon-repair', subMenu: []}
  ]},
  {id: 'lhd', name: '智能硬件', englishName: 'hardware', path: '/lhd/hardware/home', subMenu: [
    {id: 'demo-hardware-home', name: '主页', englishName: 'home', path: '/lhd/hardware/home', icon: 'icon-home1', subMenu: []},
    {id: 'demo-pipette-gun', name: '移液枪', englishName: 'pipetteGun', path: '/lhd/pipetteGun/pipetteGun', icon: 'icon-unbundle', subMenu: []}
  ]},
  {id: 'apply', name: '运输管理', englishName: 'transport', path: '/apply/transport', subMenu: [
    {id: 'demo-transport-home', name: '主页', englishName: 'home', path: '/apply/transport', icon: 'icon-home1', subMenu: []},
    {id: 'demo-waybill', name: '运单管理', englishName: 'waybill', path: '/apply/transport/waybill', icon: 'icon-document', subMenu: []}
  ]},
  {id: 'rm', name: '房间管理', englishName: 'room', path: '/rm/room', subMenu: [
    {id: 'demo-room', name: '房间', englishName: 'room', path: '/rm/room', icon: 'icon-home1', subMenu: []},
    {id: 'demo-map-set', name: '地图设置', englishName: 'mapSettings', path: '/ms/mapSet', icon: 'icon-building1', subMenu: []}
  ]},
  {id: 'ds', name: '数据统计', englishName: 'statistics', path: '/ds/statistics', subMenu: [
    {id: 'demo-statistics', name: '数据统计', englishName: 'statistics', path: '/ds/statistics', icon: 'icon-statistics', subMenu: []}
  ]},
  {id: 'sys', name: '系统', englishName: 'system', path: '/sys/a/log', subMenu: [
    {id: 'demo-alarm-log', name: '报警记录', englishName: 'alarmLog', path: '/sys/a/log', icon: 'icon-warning-line', subMenu: []},
    {id: 'demo-department', name: '部门与成员', englishName: 'sysDepartment', path: '/sys/department', icon: 'icon-employee', subMenu: []}
  ]}
];

const STAFF_CREATED_KEY = 'staffCreated';
const STAFF_META_KEY = 'staffMeta';
const CREATED_ID_MIN = 901101;
const CREATED_ID_MAX = 901150;
const LOGIN_ID_RE = /^\w{3,18}$/;
const EMAIL_RE = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

function asText(value) {
  return String(value == null ? '' : value).trim();
}

function readCreatedStaff() {
  try {
    const raw = storage.getItem(STAFF_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && Number.isFinite(Number(item.id)));
  } catch (_) {
    return [];
  }
}

function writeCreatedStaff(list) {
  storage.setItem(STAFF_CREATED_KEY, JSON.stringify(list));
}

export function clearStaffCreated() {
  storage.removeItem(STAFF_CREATED_KEY);
}

function readStaffMeta() {
  try {
    const raw = storage.getItem(STAFF_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeStaffMeta(map) {
  storage.setItem(STAFF_META_KEY, JSON.stringify(map));
}

export function clearStaffMeta() {
  storage.removeItem(STAFF_META_KEY);
}

function freeCreatedIds() {
  const created = readCreatedStaff();
  const used = new Set(created.map(item => Number(item.id)));
  const free = [];
  for (let id = CREATED_ID_MIN; id <= CREATED_ID_MAX; id++) {
    if (!used.has(id)) free.push(id);
  }
  return {created, free};
}

function departmentLabel(departmentId) {
  const row = findDepartmentById(departmentId);
  return row ? row.name : '';
}

function roleLabel(roleId) {
  const row = DEMO_ROLES.find(item => Number(item.id) === Number(roleId));
  return row ? row.name : '';
}

function readCreatedDepartments() {
  try {
    const raw = storage.getItem(DEPARTMENT_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && Number.isFinite(Number(item.id)));
  } catch (_) {
    return [];
  }
}

function writeCreatedDepartments(list) {
  storage.setItem(DEPARTMENT_CREATED_KEY, JSON.stringify(list));
}

export function clearDepartmentCreated() {
  storage.removeItem(DEPARTMENT_CREATED_KEY);
}

function readDepartmentMeta() {
  try {
    const raw = storage.getItem(DEPARTMENT_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeDepartmentMeta(map) {
  storage.setItem(DEPARTMENT_META_KEY, JSON.stringify(map));
}

export function clearDepartmentMeta() {
  storage.removeItem(DEPARTMENT_META_KEY);
}

function applyDepartmentMeta(seed) {
  if (!seed) return null;
  const patch = readDepartmentMeta()[String(seed.id)] || {};
  return {...seed, ...patch};
}

function isDepartmentDeleted(row) {
  return !!(row && (row.deleted === true || row.deleted === 1));
}

function rawAllDepartments() {
  return DEMO_DEPARTMENTS.map(item => ({...item}))
    .concat(readCreatedDepartments())
    .map(applyDepartmentMeta);
}

function freeDepartmentIds() {
  const created = readCreatedDepartments();
  const used = new Set(created.map(item => Number(item.id)));
  const free = [];
  for (let id = DEPT_CREATED_ID_MIN; id <= DEPT_CREATED_ID_MAX; id++) {
    if (!used.has(id)) free.push(id);
  }
  return {created, free};
}

/** Resolve department including deleted (for safety checks). */
export function findDepartmentById(id, options = {}) {
  const key = Number(id);
  if (!Number.isFinite(key)) return null;
  const includeDeleted = options.includeDeleted === true;
  const row = rawAllDepartments().find(item => Number(item.id) === key);
  if (!row) return null;
  if (!includeDeleted && isDepartmentDeleted(row)) return null;
  return row;
}

export function isActiveDepartment(id) {
  return !!findDepartmentById(id);
}

/** Flat active departments (no tree nesting). */
export function listActiveDepartmentsFlat() {
  return rawAllDepartments()
    .filter(item => !isDepartmentDeleted(item))
    .map(item => ({
      ...item,
      name: item.name,
      departmentName: item.departmentName || item.name,
      parentId: Number(item.parentId != null ? item.parentId : (item.parentDepartmentId || 0)),
      parentDepartmentId: Number(item.parentDepartmentId != null ? item.parentDepartmentId : (item.parentId || 0)),
      isOperation: item.isOperation == null ? 1 : item.isOperation,
      defaultDepartment: item.defaultDepartment == null ? 0 : item.defaultDepartment,
      sortIndex: Number(item.sortIndex) || 0,
      children: [],
      subDivisions: []
    }))
    .sort((a, b) => a.sortIndex - b.sortIndex || a.id - b.id);
}

/** Tree roots for GET /department/list (children in subDivisions). */
export function listDemoDepartments() {
  const flat = listActiveDepartmentsFlat();
  const byId = {};
  flat.forEach(item => {
    byId[item.id] = {...item, subDivisions: [], children: []};
  });
  const roots = [];
  flat.forEach(item => {
    const node = byId[item.id];
    const parentId = Number(item.parentDepartmentId) || 0;
    if (parentId && byId[parentId]) {
      byId[parentId].subDivisions.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function listDepartmentRemoveIds() {
  const ids = [];
  for (let id = 900101; id <= DEPT_CREATED_ID_MAX; id++) ids.push(id);
  return ids;
}

/** POST /department/add */
export function addDemoDepartment(body = {}) {
  const name = asText(body.name);
  if (!name) return {ok: false, message: '请输入名称'};
  if (name.length > 26) return {ok: false, message: '部门名称不能超过 26 字'};
  let parentId = 0;
  if (body.parentDepartmentId != null && body.parentDepartmentId !== '') {
    parentId = Number(body.parentDepartmentId);
    if (!Number.isFinite(parentId)) return {ok: false, message: '上级部门无效。'};
    if (parentId !== 0 && !isActiveDepartment(parentId)) {
      return {ok: false, message: '上级部门不存在。'};
    }
  }
  const {created, free} = freeDepartmentIds();
  if (!free.length) return {ok: false, message: '部门容量已满，本条未写入。'};
  const siblings = listActiveDepartmentsFlat().filter(
    item => Number(item.parentDepartmentId || 0) === parentId
  );
  const sortIndex = siblings.reduce((max, item) => Math.max(max, Number(item.sortIndex) || 0), -1) + 1;
  const entity = {
    id: free[0],
    name,
    departmentName: name,
    parentId,
    parentDepartmentId: parentId,
    isOperation: 1,
    defaultDepartment: 0,
    sortIndex,
    children: [],
    subDivisions: []
  };
  try {
    writeCreatedDepartments(created.concat([entity]));
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: entity.id};
}

/** POST /department/update */
export function updateDemoDepartment(body = {}) {
  const id = Number(body.id);
  if (!Number.isFinite(id)) return {ok: false, message: '部门不存在。'};
  const current = findDepartmentById(id);
  if (!current) return {ok: false, message: '部门不存在。'};
  const name = asText(body.name);
  if (!name) return {ok: false, message: '请输入名称'};
  if (name.length > 26) return {ok: false, message: '部门名称不能超过 26 字'};
  try {
    const map = readDepartmentMeta();
    map[String(id)] = {...(map[String(id)] || {}), name, departmentName: name};
    writeDepartmentMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id};
}

/** POST /department/remove/:id */
export function removeDemoDepartment(id) {
  const key = Number(id);
  if (!Number.isFinite(key)) return {ok: false, message: '部门不存在。'};
  if (SEED_DEPARTMENT_IDS.includes(key)) {
    return {ok: false, message: '演示基础部门不可删除（设备/维保等仍引用）。'};
  }
  const current = findDepartmentById(key);
  if (!current) return {ok: false, message: '部门不存在。'};
  const hasStaff = listAllStaff().some(item => Number(item.departmentId) === key);
  if (hasStaff) return {ok: false, message: '部门下仍有员工，无法删除。'};
  const hasChild = listActiveDepartmentsFlat().some(
    item => Number(item.parentDepartmentId || 0) === key
  );
  if (hasChild) return {ok: false, message: '请先删除子部门。'};
  // Lazy require avoids auth ↔ instrument/equipment top-level cycles.
  const {hasActiveInstrumentInDepartment} = require('./instrument');
  const {hasActiveEquipmentInDepartment} = require('./equipment');
  if (hasActiveInstrumentInDepartment(key) || hasActiveEquipmentInDepartment(key)) {
    return {ok: false, message: '部门下仍有设备或硬件，无法删除。'};
  }
  try {
    const map = readDepartmentMeta();
    map[String(key)] = {...(map[String(key)] || {}), deleted: true};
    writeDepartmentMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: key};
}

/** PUT /department/move — swap sortIndex of two sibling departments. */
export function moveDemoDepartments(params = {}) {
  const one = Number(params.departmentIdOne);
  const two = Number(params.departmentIdTwo);
  if (!Number.isFinite(one) || !Number.isFinite(two)) {
    return {ok: false, message: '排序参数无效。'};
  }
  const a = findDepartmentById(one);
  const b = findDepartmentById(two);
  if (!a || !b) return {ok: false, message: '部门不存在。'};
  const parentA = Number(a.parentDepartmentId != null ? a.parentDepartmentId : a.parentId) || 0;
  const parentB = Number(b.parentDepartmentId != null ? b.parentDepartmentId : b.parentId) || 0;
  if (parentA !== parentB) return {ok: false, message: '仅支持同级部门排序。'};
  const sortA = Number(a.sortIndex) || 0;
  const sortB = Number(b.sortIndex) || 0;
  try {
    const map = readDepartmentMeta();
    map[String(one)] = {...(map[String(one)] || {}), sortIndex: sortB};
    map[String(two)] = {...(map[String(two)] || {}), sortIndex: sortA};
    writeDepartmentMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true};
}

function applyStaffMeta(seed) {
  if (!seed) return null;
  const patch = readStaffMeta()[String(seed.id)] || {};
  return {...seed, ...patch};
}

function rawAllStaff() {
  return DEMO_STAFF.map(item => ({...item})).concat(readCreatedStaff()).map(applyStaffMeta);
}

function isStaffLeft(row) {
  return !!(row && (row.left === true || row.left === 1));
}

/** Active staff only — /user/list, equipment principals, applicant pickers. */
export function listAllStaff() {
  return rawAllStaff().filter(item => !isStaffLeft(item)).map(item => ({
    ...item,
    departmentName: departmentLabel(item.departmentId) || item.departmentName
  }));
}

/** Resolve by id; includeLeft keeps resigned staff for historical maintenance names. */
export function findStaffById(id, options = {}) {
  const key = Number(id);
  if (!Number.isFinite(key)) return null;
  const includeLeft = options.includeLeft !== false;
  const pool = includeLeft ? rawAllStaff() : listAllStaff();
  return pool.find(item => Number(item.id) === key) || null;
}

export function listDemoStaff(params = {}) {
  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 20);
  let list = listAllStaff();
  if (params.departmentId != null && params.departmentId !== '' && Number(params.departmentId) !== 0) {
    list = list.filter(item => Number(item.departmentId) === Number(params.departmentId));
  }
  if (params.keyword != null && String(params.keyword).trim() !== '') {
    const q = String(params.keyword).trim().toLowerCase();
    list = list.filter(item =>
      String(item.name).toLowerCase().includes(q) || String(item.loginId).toLowerCase().includes(q)
    );
  }
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNum,
    pageSize
  };
}

function validateStaffFields(body, {requireLoginId, requirePwd}) {
  const departmentId = Number(body.departmentId);
  if (!isActiveDepartment(departmentId)) {
    return {ok: false, message: '请选择有效部门。'};
  }
  const name = asText(body.name);
  if (!name) return {ok: false, message: '请输入姓名'};
  if (name.length < 2 || name.length > 20) return {ok: false, message: '长度在 2 到 20 个字符'};
  const tel = asText(body.tel);
  if (!tel) return {ok: false, message: '请输入手机号'};
  const email = asText(body.email);
  if (email && !EMAIL_RE.test(email)) return {ok: false, message: '请输入正确的邮箱地址'};
  let loginId = asText(body.loginId);
  if (requireLoginId) {
    if (!loginId) return {ok: false, message: '请输入登录名'};
    if (!LOGIN_ID_RE.test(loginId)) return {ok: false, message: '登录名须为 3–18 位字母数字或下划线'};
  }
  const pwd = asText(body.pwd);
  if (requirePwd) {
    if (!pwd) return {ok: false, message: '请输入密码'};
    if (pwd.length < 6 || pwd.length > 18) return {ok: false, message: '密码长度须为 6–18 位'};
  }
  let roleId = body.roleId == null || body.roleId === '' ? 2 : Number(body.roleId);
  if (!DEMO_ROLES.some(item => item.id === roleId)) {
    return {ok: false, message: '请选择有效角色。'};
  }
  return {
    ok: true,
    departmentId,
    name,
    tel,
    email,
    loginId,
    roleId,
    departmentName: departmentLabel(departmentId),
    roleName: roleLabel(roleId)
  };
}

/** POST /user/add — persist staffCreated; does not store password. */
export function addDemoStaff(body = {}) {
  const checked = validateStaffFields(body, {requireLoginId: true, requirePwd: true});
  if (!checked.ok) return checked;
  const taken = rawAllStaff().some(
    item => String(item.loginId).toLowerCase() === checked.loginId.toLowerCase()
  );
  if (taken) return {ok: false, message: '登录名已存在。'};
  const {created, free} = freeCreatedIds();
  if (!free.length) return {ok: false, message: '员工容量已满，本条未写入。'};
  const entity = {
    id: free[0],
    loginId: checked.loginId,
    name: checked.name,
    tel: checked.tel,
    email: checked.email,
    isBoundWeixin: false,
    departmentId: checked.departmentId,
    departmentName: checked.departmentName,
    roleId: checked.roleId,
    roleName: checked.roleName,
    companyId: DEMO_USER.companyId,
    companyName: DEMO_USER.companyName,
    createDate: formatDemoDateTime(DEMO_NOW_MS),
    editFlag: 1
  };
  try {
    writeCreatedStaff(created.concat([entity]));
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: entity.id};
}

/** POST /user/update/basic — staffMeta overlay; loginId immutable; password not stored. */
export function updateDemoStaffBasic(body = {}) {
  const id = Number(body.id);
  if (!Number.isFinite(id)) return {ok: false, message: '员工不存在。'};
  const current = findStaffById(id, {includeLeft: false});
  if (!current) return {ok: false, message: '员工不存在或已离职。'};
  const roleProvided = body.roleId != null && body.roleId !== '';
  if (id === DEMO_USER.id && roleProvided && Number(body.roleId) !== Number(current.roleId)) {
    return {ok: false, message: '不可变更演示登录账号的角色。'};
  }
  const checked = validateStaffFields({
    ...body,
    loginId: current.loginId,
    departmentId: body.departmentId != null && body.departmentId !== '' ? body.departmentId : current.departmentId,
    // Omit role → keep current (do not default to 普通成员).
    roleId: roleProvided ? body.roleId : current.roleId
  }, {requireLoginId: false, requirePwd: true});
  if (!checked.ok) return checked;
  const patch = {
    name: checked.name,
    tel: checked.tel,
    email: checked.email,
    departmentId: checked.departmentId,
    departmentName: checked.departmentName,
    roleId: checked.roleId,
    roleName: checked.roleName,
    roleIds: roleProvided && Number(checked.roleId) !== Number(current.roleId)
      ? [checked.roleId]
      : (current.roleIds || [current.roleId])
  };
  try {
    const map = readStaffMeta();
    map[String(id)] = {...(map[String(id)] || {}), ...patch};
    writeStaffMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id};
}

function normalizeRoleIds(raw) {
  const list = Array.isArray(raw) ? raw : (raw == null || raw === '' ? [] : [raw]);
  return list.map(value => {
    if (typeof value !== 'number' && typeof value !== 'string') return NaN;
    if (typeof value === 'string' && !/^\d+$/.test(value.trim())) return NaN;
    return Number(value);
  });
}

/** POST /user/update/role — CROLE; accepts roleId number or array; stores primary role for list. */
export function updateDemoStaffRole(body = {}) {
  const id = Number(body.id);
  if (!Number.isFinite(id)) return {ok: false, message: '员工不存在。'};
  if (id === DEMO_USER.id) {
    return {ok: false, message: '不可变更演示登录账号的角色。'};
  }
  const current = findStaffById(id, {includeLeft: false});
  if (!current) return {ok: false, message: '员工不存在或已离职。'};
  const roleIds = normalizeRoleIds(body.roleId != null ? body.roleId : body.roleIds);
  if (!roleIds.length) return {ok: false, message: '请选择角色。'};
  if (roleIds.some(roleId => !DEMO_ROLES.some(item => item.id === roleId))) {
    return {ok: false, message: '请选择有效角色。'};
  }
  const primary = roleIds[0];
  const patch = {
    roleId: primary,
    roleName: roleLabel(primary),
    roleIds
  };
  try {
    const map = readStaffMeta();
    map[String(id)] = {...(map[String(id)] || {}), ...patch};
    writeStaffMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id};
}

/** POST /user/delete/batch — resign; tombstone via staffMeta.left (keep id for maintenance names). */
export function leaveDemoStaff(body = {}) {
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(n => Number.isFinite(n)) : [];
  if (!ids.length) return {ok: false, message: '请选择要离职的员工。'};
  if (ids.some(id => id === DEMO_USER.id)) {
    return {ok: false, message: '不可对演示登录账号办理离职。'};
  }
  for (const id of ids) {
    const row = findStaffById(id, {includeLeft: true});
    if (!row) return {ok: false, message: '员工不存在。'};
    if (isStaffLeft(row)) return {ok: false, message: '员工已离职。'};
  }
  try {
    const map = readStaffMeta();
    for (const id of ids) {
      map[String(id)] = {...(map[String(id)] || {}), left: true, editFlag: 0};
    }
    writeStaffMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, ids};
}
// Dashboard overview is derived from fixtures/equipment.js (handlers/equipment).
