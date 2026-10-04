/** Latest-click wins for list requests. Stale tokens must not write data or end a newer load. */

export function createSeqLock() {
  let seq = 0;
  let alive = true;
  return {
    start() {
      seq += 1;
      return seq;
    },
    accept(token) {
      return alive && token === seq;
    },
    kill() {
      alive = false;
    }
  };
}

export function settleLatestList(lock, token, payload) {
  if (!lock.accept(token)) return {applied: false};
  if (payload && payload.ok) {
    return {
      applied: true,
      loading: false,
      rows: Array.isArray(payload.items) ? payload.items : [],
      error: ''
    };
  }
  return {
    applied: true,
    loading: false,
    rows: [],
    error: (payload && payload.message) || '列表加载失败，请重试。'
  };
}

export function isDemoInterceptorMessage(error) {
  return !!(error && error.code && String(error.code).startsWith('MOCK_'));
}
