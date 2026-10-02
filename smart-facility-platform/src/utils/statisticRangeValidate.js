/**
 * Statistics S2 — distinguish unspecified vs invalid date/hour windows.
 * Shared by Mock handlers and Statistics / UseRanHighSearch UI.
 */

export function hasStatisticRangeText(value) {
  return value != null && String(value).trim() !== '';
}

function parseAt(value) {
  if (value == null || value === '') return NaN;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : NaN;
  }
  const text = String(value).trim();
  // Prefer strict demo datetime; fall back for Date.toString from pickers is via Date instance above.
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})?)?$/.exec(text);
  if (match) {
    const [, y, m, d, h = '00', min = '00', sec = '00', zone = '+08:00'] = match;
    const canonical = `${y}-${m}-${d}T${h}:${min}:${sec}`;
    const local = Date.parse(canonical + 'Z');
    if (!Number.isFinite(local) || new Date(local).toISOString().slice(0, 19) !== canonical) return NaN;
    return Date.parse(canonical + zone);
  }
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  const withZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) ? normalized : normalized + '+08:00';
  return Date.parse(withZone);
}

export function parseStatisticHour(value) {
  if (value == null || value === '') return NaN;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 23) return NaN;
  return Math.floor(n);
}

/**
 * Date window: both empty → ok (use dateType).
 * One side only / unparseable / begin>end → reject (no silent fallback).
 */
export function validateStatisticDateParams(params = {}) {
  const hasBegin = hasStatisticRangeText(params.beginTime);
  const hasEnd = hasStatisticRangeText(params.endTime);
  if (!hasBegin && !hasEnd) return {ok: true};
  if (hasBegin !== hasEnd) {
    return {ok: false, message: '请完整填写起止日期。'};
  }
  const begin = parseAt(params.beginTime);
  const end = parseAt(params.endTime);
  if (!Number.isFinite(begin) || !Number.isFinite(end)) {
    return {ok: false, message: '日期格式无效。'};
  }
  if (begin > end) {
    return {ok: false, message: '开始日期不能晚于结束日期。'};
  }
  return {ok: true};
}

/**
 * Hour window: both empty → ok (full day).
 * One side only / out of 0–23 / begin>end → reject (no silent full-day fallback).
 */
export function validateStatisticHourParams(params = {}) {
  const hasBegin = hasStatisticRangeText(params.periodBeginTime);
  const hasEnd = hasStatisticRangeText(params.periodEndTime);
  if (!hasBegin && !hasEnd) return {ok: true};
  if (hasBegin !== hasEnd) {
    return {ok: false, message: '请完整填写时段起止小时。'};
  }
  const beginH = parseStatisticHour(params.periodBeginTime);
  const endH = parseStatisticHour(params.periodEndTime);
  if (!Number.isFinite(beginH) || !Number.isFinite(endH)) {
    return {ok: false, message: '时段小时无效。'};
  }
  if (beginH > endH) {
    return {ok: false, message: '时段开始不能晚于结束。'};
  }
  return {ok: true};
}

export function validateStatisticUseParams(params = {}) {
  return validateStatisticDateParams(params);
}

export function validateStatisticRankingParams(params = {}) {
  const dateCheck = validateStatisticDateParams(params);
  if (!dateCheck.ok) return dateCheck;
  return validateStatisticHourParams(params);
}
