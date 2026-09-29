import {isAuthenticated} from './session';

// Shared demo response envelope; keep code/message/items aligned with existing pages.
export const success = items => ({code: 1, message: '成功', items: JSON.parse(JSON.stringify(items))});
export const failure = message => ({code: 0, message, items: null});
export const protectedRoute = (method, path, handle) => ({
  method,
  path,
  handle: request => (
    isAuthenticated(request.headers)
      ? handle(request)
      : {code: 2, message: '演示登录已失效，请重新登录。', items: null}
  )
});
