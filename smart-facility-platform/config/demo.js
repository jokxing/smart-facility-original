const path = require('path');

// Only the loopback development server and its own HMR socket are allowed.
const contentSecurityPolicy = [
  "default-src 'self'",
  "connect-src 'self' ws://127.0.0.1:*",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "base-uri 'self'"
].join('; ');

module.exports = {
  storageModule: path.resolve(__dirname, '../src/mock/storage.js'),
  headers: { 'Content-Security-Policy': contentSecurityPolicy },
  before(app) {
    // These must never reach a proxy or fall back to the application's HTML.
    app.use(['/api', '/__demo_api__', '/backupSuite'], (_req, res) => {
      res.status(501).json({ code: 0, message: '演示模式禁止直接访问服务或旧工具包。', items: null });
    });
    app.use('/static', (req, res, next) => {
      if (/\.(xlsx?|zip)$/i.test(req.path)) {
        return res.status(403).send('Original templates are not exposed by the demo.');
      }
      next();
    });
  }
};
