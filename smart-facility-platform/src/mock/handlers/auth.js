import {DEMO_CREDENTIALS, DEMO_USER, DEMO_STAFF, DEMO_DEPARTMENTS, DEMO_CATEGORIES, DEMO_MENUS} from '../fixtures/auth';
import {readSession, saveSession, newSession, authenticateSession} from '../session';
import {createCaptchaImage} from '../captcha';
import {success, failure, protectedRoute} from '../response';

function listDemoStaff(params = {}) {
  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 20);
  let list = DEMO_STAFF.map(item => ({...item}));
  if (params.departmentId != null && params.departmentId !== '' && params.departmentId !== '0') {
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
  protectedRoute('POST', '/logout', () => {
    // The existing logout UI still reads USERINFO before clearing localStorage.
    saveSession({...readSession(), authenticated: false, token: ''});
    return success(null);
  }),
  protectedRoute('GET', '/user/language', () => success(null)),
  protectedRoute('GET', '/role/menu', () => success(DEMO_MENUS)),
  protectedRoute('GET', '/department/list', () => success({list: DEMO_DEPARTMENTS})),
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
