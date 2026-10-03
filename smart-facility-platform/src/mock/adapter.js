import qs from 'qs';

export const DEMO_BASE_URL = '/__demo_api__';

function mockError(code, message, config, status = 501) {
  const error = new Error(message);
  error.code = code;
  error.config = config;
  error.response = { status, data: { code: 0, message, items: null }, headers: {}, config };
  return error;
}

export function parseBody(data) {
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const result = {};
    data.forEach((value, key) => {
      result[key] = key in result ? [].concat(result[key], value) : value;
    });
    return result;
  }
  if (typeof data !== 'string') return data || {};
  if (!data.trim()) return {};
  if (/^[\[{]/.test(data.trim())) return JSON.parse(data);
  return qs.parse(data);
}

export function createMockAdapter(routes) {
  return async config => {
    const url = config.url || '';
    if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\') ||
        (config.baseURL && config.baseURL !== DEMO_BASE_URL)) {
      throw mockError('MOCK_EXTERNAL_BLOCKED', '演示模式已阻止非本地接口地址。', config);
    }
    const [pathname, query = ''] = url.split('?');
    const path = pathname.startsWith(DEMO_BASE_URL + '/') ? pathname.slice(DEMO_BASE_URL.length) : pathname;
    const method = (config.method || 'get').toUpperCase();
    const route = routes.find(item => {
      if (item.method !== method) return false;
      if (item.path instanceof RegExp) return item.path.test(path);
      return item.path === path;
    });
    if (!route) {
      throw mockError('MOCK_NOT_IMPLEMENTED', '当前演示尚未接入此接口。', config);
    }
    let body;
    try { body = parseBody(config.data); } catch (_) {
      throw mockError('MOCK_BAD_REQUEST', '演示接口参数格式错误。', config, 400);
    }
    const data = await route.handle({
      method, path, body, params: { ...qs.parse(query), ...config.params },
      headers: config.headers || {}
    });
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}
