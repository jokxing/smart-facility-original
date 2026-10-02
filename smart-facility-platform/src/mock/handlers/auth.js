import {
  DEMO_CREDENTIALS, DEMO_USER, DEMO_CATEGORIES, DEMO_MENUS, DEMO_ROLES,
  listDemoStaff, addDemoStaff, updateDemoStaffBasic, updateDemoStaffRole, leaveDemoStaff,
  listDemoDepartments, addDemoDepartment, updateDemoDepartment, removeDemoDepartment,
  moveDemoDepartments, listDepartmentRemoveIds
} from '../fixtures/auth';
import {readSession, saveSession, newSession, authenticateSession} from '../session';
import {createCaptchaImage} from '../captcha';
import {success, failure, protectedRoute} from '../response';

const departmentRemoveRoutes = listDepartmentRemoveIds().map(id =>
  protectedRoute('POST', `/department/remove/${id}`, () => {
    const result = removeDemoDepartment(id);
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  })
);

export default [
  {method: 'GET', path: '/captchaCode', handle: ({params}) => {
    const previous = readSession();
    const session = previous && params.sessionId === previous.sessionId && previous.expiresAt > Date.now()
      ? previous : newSession();
    return success({sessionId: session.sessionId, captchaImageStr: createCaptchaImage(DEMO_CREDENTIALS.captchaCode)});
  }},
  {method: 'POST', path: '/login', handle: ({body, headers}) => {
    const session = readSession();
    if (!session || session.expiresAt <= Date.now() || body.sessionId !== session.sessionId ||
        (headers.Authorization || headers.authorization) !== session.sessionId) {
      return failure('验证码会话已失效，请刷新验证码。');
    }
    if (body.captchaCode !== DEMO_CREDENTIALS.captchaCode) return failure('验证码不正确。');
    if (body.username !== DEMO_CREDENTIALS.username || body.password !== DEMO_CREDENTIALS.password) {
      return failure('演示账号或密码不正确。');
    }
    return success({token: authenticateSession(session).token});
  }},
  protectedRoute('GET', '/user/info', () => success(DEMO_USER)),
  protectedRoute('GET', '/user/list', ({params}) => success(listDemoStaff(params || {}))),
  protectedRoute('POST', '/user/add', ({body}) => {
    const result = addDemoStaff(body || {});
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  }),
  protectedRoute('POST', '/user/update/basic', ({body}) => {
    const result = updateDemoStaffBasic(body || {});
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  }),
  protectedRoute('POST', '/user/update/role', ({body}) => {
    const result = updateDemoStaffRole(body || {});
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  }),
  protectedRoute('POST', '/user/delete/batch', ({body}) => {
    const result = leaveDemoStaff(body || {});
    if (!result.ok) return failure(result.message);
    return success({ids: result.ids});
  }),
  protectedRoute('GET', '/role/list', () => success(DEMO_ROLES.map(item => ({...item})))),
  protectedRoute('GET', '/department/list', () => success({list: listDemoDepartments()})),
  protectedRoute('POST', '/department/add', ({body}) => {
    const result = addDemoDepartment(body || {});
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  }),
  protectedRoute('POST', '/department/update', ({body}) => {
    const result = updateDemoDepartment(body || {});
    if (!result.ok) return failure(result.message);
    return success({id: result.id});
  }),
  protectedRoute('PUT', '/department/move', ({params}) => {
    const result = moveDemoDepartments(params || {});
    if (!result.ok) return failure(result.message);
    return success(null);
  }),
  ...departmentRemoveRoutes,
  protectedRoute('POST', '/logout', () => {
    // The existing logout UI still reads USERINFO before clearing localStorage.
    saveSession({...readSession(), authenticated: false, token: ''});
    return success(null);
  }),
  protectedRoute('GET', '/user/language', () => success(null)),
  protectedRoute('GET', '/role/menu', () => success(DEMO_MENUS)),
  protectedRoute('GET', '/instrumentCategoryInfo/superior/cat', () => success(DEMO_CATEGORIES)),
  // /equipment/dashboard lives in handlers/equipment.js (same seed as sort/list).
  // Layout Navbar / MessageNotification shell — empty stubs so SaaS chrome can mount.
  protectedRoute('GET', '/company/getLogo', () => success({logoUrl: ''})),
  protectedRoute('GET', '/activiti/unread', () => success({activitiUnread: 0, notifyUnread: 0})),
  protectedRoute('GET', '/notify/message/query', () => success({
    list: [],
    total: 0,
    statisticalVO: {alarmCount: 0, propertyCount: 0, sysCount: 0}
  })),
  protectedRoute('GET', '/property/unusualMsg/noReadCount', () => success(0)),
  protectedRoute('POST', '/activiti/task/queryAgenda', () => success({list: [], total: 0})),
  protectedRoute('GET', '/activiti/task/query', () => success({list: [], total: 0}))
];
