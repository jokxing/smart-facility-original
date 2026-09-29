// Room layout uses status, not the DataV senorStatus contract.
export function countDemoDeviceStatus(devices = []) {
  return devices.reduce((counts, device) => {
    const key = {'1': 'normal', '-1': 'alarm', '-100': 'offline'}[String(device.status)] || 'unknown';
    counts[key]++;
    counts.total++;
    return counts;
  }, {total: 0, normal: 0, alarm: 0, offline: 0, unknown: 0});
}

export function demoDeviceStatusColor(status) {
  switch (String(status)) {
    case '1': return '#13ce66';
    case '-1': return '#ff4949';
    case '-100': return '#343f4b';
    default: return '#343f4b';
  }
}
