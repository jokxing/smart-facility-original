import axios from 'axios';
import qs from 'qs';
import {createMockAdapter, DEMO_BASE_URL} from '../../../src/mock/adapter';
import routes from '../../../src/mock/handlers/auth';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {hasDemoSession, readSession, saveSession} from '../../../src/mock/session';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

let client;
let sessionId;
beforeEach(() => {
  storage.clear();
  client = axios.create({baseURL: DEMO_BASE_URL, adapter: createMockAdapter(routes)});
});
async function captcha() {
  const response = await client.get('/captchaCode', {params: {sessionId}});
  sessionId = response.data.items.sessionId;
  client.defaults.headers.common.Authorization = sessionId;
  storage.setItem('sessionId', sessionId);
  return response.data;
}
async function login(overrides = {}) {
  return (await client.post('/login', qs.stringify({...DEMO_CREDENTIALS, sessionId, ...overrides}))).data;
}
async function establishSession() {
  await captcha();
  const result = await login();
  storage.setItem('token', result.items.token);
  const info = (await client.get('/user/info')).data;
  storage.setItem('USERINFO', JSON.stringify(info.items));
  return info;
}

test('requires captcha session, correct captcha and password', async () => {
  expect((await login()).code).toBe(0);
  expect((await captcha()).items.captchaImageStr).toBe('test-png-base64');
  expect((await login({captchaCode: 'wrong'})).code).toBe(0);
  expect((await login({password: 'wrong'})).code).toBe(0);
  expect((await login()).code).toBe(1);
});

test('login and bootstrap preserve the exact contracts consumed by existing pages', async () => {
  expect((await client.get('/user/info')).data.code).toBe(2);
  const info = await establishSession();
  expect(info.items).toMatchObject({loginId: 'demo', roleId: 1});
  expect(hasDemoSession()).toBe(true);
  expect((await client.get('/department/list')).data.items.list).toHaveLength(1);
  expect(Array.isArray((await client.get('/instrumentCategoryInfo/superior/cat')).data.items)).toBe(true);
  expect((await client.get('/role/menu')).data.items[0].subMenu[0]).toHaveProperty('path');
  expect((await client.get('/equipment/dashboard')).data.items).toEqual({total: 0, alarmCount: 0});
  expect((await client.get('/user/language', {params: {code: 2}})).data.code).toBe(1);
});

test('session survives module reload, logout invalidates it before UI clears identity', async () => {
  await establishSession();
  jest.resetModules();
  expect(require('../../../src/mock/session').hasDemoSession()).toBe(true);
  expect((await client.post('/logout')).data.code).toBe(1);
  expect(hasDemoSession()).toBe(false);
  expect(JSON.parse(storage.getItem('USERINFO')).loginId).toBe('demo');
  expect((await client.get('/user/info')).data.code).toBe(2);
  storage.clear(); // Existing Dashboard / Navbar logout behavior.
  expect(storage.getItem('token')).toBeNull();
});

test('expired sessions and corrupt user storage cannot enter a protected route', async () => {
  await establishSession();
  storage.setItem('USERINFO', '{broken');
  expect(hasDemoSession()).toBe(false);
  storage.setItem('USERINFO', JSON.stringify({loginId: 'demo'}));
  saveSession({...readSession(), expiresAt: Date.now() - 1});
  expect(hasDemoSession()).toBe(false);
  expect((await client.get('/user/info')).data.code).toBe(2);
});
