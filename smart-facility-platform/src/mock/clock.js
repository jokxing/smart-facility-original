// Fixed demo clock, independent of the machine's date and time zone.
export const DEMO_NOW_MS = Date.parse('2026-09-24T12:00:00+08:00');

export function demoAlarmRange(days) {
  const day = new Date(DEMO_NOW_MS + 8 * 3600000 - days * 86400000).toISOString().slice(0, 10);
  return {beginDate: day + ' 00:00:00', endDate: '2026-09-24 12:00:00'};
}
