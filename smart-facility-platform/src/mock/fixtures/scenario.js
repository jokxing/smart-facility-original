/**
 * Minimal shared demo scenario for instrument status (task 8B).
 * Does not move layouts or rewrite historical alarm events.
 *
 * Values: normal | alarm | offline
 */

const STORAGE_KEY = 'demoScenario';

let current = 'normal';

export function getDemoScenario() {
  return current;
}

export function setDemoScenario(value) {
  const next = String(value || '').trim();
  if (next !== 'normal' && next !== 'alarm' && next !== 'offline') {
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
