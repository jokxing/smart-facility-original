/**
 * Statistics custom datetimerange: empty/partial clear → not custom.
 * Used by Statistics.vue S1 date-clear fix.
 */
export function isStatisticCustomDateRange(val) {
  return Array.isArray(val)
    && val.length >= 2
    && val[0] != null && val[0] !== ''
    && val[1] != null && val[1] !== '';
}
