// Start only the local demo. Override inherited environment and .env defaults.
const { spawn } = require('child_process');
const path = require('path');
const crypto = require('crypto');

const port = Number(process.env.DEMO_PORT || 8088);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('DEMO_PORT must be an integer between 1024 and 65535.');
}
const flags = [];
try {
  crypto.createHash('md4');
} catch (_) {
  // Webpack 4 uses MD4; retain the historical toolchain on modern Node.
  flags.push('--openssl-legacy-provider');
}
const child = spawn(process.execPath, [
  ...flags,
  require.resolve('@vue/cli-service/bin/vue-cli-service.js'),
  'serve', '--mode', 'demo', '--host', '127.0.0.1', '--port', String(port)
], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  windowsHide: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    VUE_APP_DEMO: 'true',
    VUE_APP_BASE_URL: '/__demo_api__',
    BROWSERSLIST_IGNORE_OLD_DATA: 'true'
  }
});
child.on('error', () => {
  console.error('Unable to start the local demo. Check the installed dependencies.');
  process.exitCode = 1;
});
child.on('exit', code => { process.exitCode = code == null ? 1 : code; });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
