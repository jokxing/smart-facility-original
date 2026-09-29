import storage from './storage';

const SESSION_KEY = '_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

export function readSession() {
  try { return JSON.parse(storage.getItem(SESSION_KEY)) || null; } catch (_) { return null; }
}
export function saveSession(session) { storage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function newSession() {
  const session = {
    sessionId: 'demo-session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
    authenticated: false, token: '', expiresAt: Date.now() + SESSION_DURATION
  };
  saveSession(session);
  return session;
}
export function authenticateSession(session) {
  const authenticated = {...session, authenticated: true, token: 'demo-token-' + session.sessionId,
    expiresAt: Date.now() + SESSION_DURATION};
  saveSession(authenticated);
  return authenticated;
}
export function isAuthenticated(headers) {
  const session = readSession();
  const authorization = headers.Authorization || headers.authorization;
  return !!(session && session.authenticated && session.expiresAt > Date.now() && authorization === session.sessionId);
}
export function hasDemoSession() {
  const session = readSession();
  let user;
  try { user = JSON.parse(storage.getItem('USERINFO')); } catch (_) { return false; }
  return !!(session && session.authenticated && session.expiresAt > Date.now() &&
    storage.getItem('token') === session.token && storage.getItem('sessionId') === session.sessionId &&
    user && user.loginId === 'demo');
}
export function clearDemoSession() {
  [SESSION_KEY, 'token', 'sessionId', 'USERINFO', 'username', 'departmentId', 'MENU', 'menuKey']
    .forEach(key => storage.removeItem(key));
}
