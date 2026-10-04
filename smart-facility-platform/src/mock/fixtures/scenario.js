/**
 * Shared per-device demo status, with legacy scenario overrides for regression.
 * Does not move layouts or rewrite historical alarm events.
 *
 * Default mixed: 970008 alarms, all other devices are normal.
 * Legacy values: normal | alarm | offline; no UI switching entry.
 */

const STORAGE_KEY = 'demoScenario';

let current = 'mixed';

// One shared device state source; other devices (including newly created ones) are normal.
export function statusForInstrument(id) {
  return statusForScenario(current === 'mixed' ? (Number(id) === 970008 ? 'alarm' : 'normal') : current);
}

// Runtime state is independent of sensor alarms. Legacy scene overrides remain test-compatible.
export function runningStatusForInstrument(id) {
  return current === 'mixed' ? 1 : statusForInstrument(id).status;
}

export function aggregateInstrumentStatus(devices) {
  const states = devices.map(item => statusForInstrument(item.id).senorStatus);
  if (states.includes(2)) return 2;
  if (states.includes(-100)) return -100;
  return states.length ? 1 : 3;
}

export function getDemoScenario() {
  return current;
}

export function setDemoScenario(value) {
  const next = String(value || '').trim();
  if (next !== 'mixed' && next !== 'normal' && next !== 'alarm' && next !== 'offline') {
    return current;
  }
  current = next;
  return current;
}

export function resetDemoScenario() {
  current = 'normal';
  return current;
}

/**
 * Map shared scenario → RoomView layout `status` (circle color in index.vue):
 * 1 green, -1 red (else branch), -100 gray.
 * And RoomDataV `senorStatus`: 1 / 2 / -100.
 */
export function statusForScenario(scenario = current) {
  if (scenario === 'alarm') return {status: -1, senorStatus: 2};
  if (scenario === 'offline') return {status: -100, senorStatus: -100};
  return {status: 1, senorStatus: 1};
}

export {STORAGE_KEY};
