// Fixed demo clock, independent of the machine's date and time zone.
export const DEMO_NOW_MS = Date.parse('2026-09-24T12:00:00+08:00');

// Strict calendar validation before Date.parse can normalize impossible dates.
export function parseDemoDateTime(value) {
  if (typeof value !== 'string') return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})?)?$/.exec(value.trim());
  if (!match) return NaN;
  const [, y, m, d, h = '00', min = '00', sec = '00', zone = '+08:00'] = match;
  const canonical = `${y}-${m}-${d}T${h}:${min}:${sec}`;
  const local = Date.parse(canonical + 'Z');
  if (!Number.isFinite(local) || new Date(local).toISOString().slice(0, 19) !== canonical) return NaN;
  return Date.parse(canonical + zone);
}

export function formatDemoDateTime(ms) {
  const shift = new Date(Number(ms) + 8 * 3600000);
  const pad = n => String(n).padStart(2, '0');
  return shift.getUTCFullYear() + '-' + pad(shift.getUTCMonth() + 1) + '-' + pad(shift.getUTCDate())
    + ' ' + pad(shift.getUTCHours()) + ':' + pad(shift.getUTCMinutes()) + ':' + pad(shift.getUTCSeconds());
}

export function demoAlarmRange(days) {
  const day = new Date(DEMO_NOW_MS + 8 * 3600000 - days * 86400000).toISOString().slice(0, 10);
  return {beginDate: day + ' 00:00:00', endDate: '2026-09-24 12:00:00'};
}
