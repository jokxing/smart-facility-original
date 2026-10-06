const WebSocket = require('../smart-facility-platform/node_modules/ws');
const fs = require('fs');
const path = require('path');

async function connect(endpoint = 'ws://127.0.0.1:9420') {
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  const events = [];
  let sequence = 0;
  socket.on('message', raw => {
    const message = JSON.parse(raw);
    const request = pending.get(message.id);
    if (request) {
      clearTimeout(request.timer);
      pending.delete(message.id);
      message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
    } else if (message.method) events.push(message);
  });
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(method + ' timed out')); }, 20000);
      pending.set(id, {resolve, reject, timer});
      socket.send(JSON.stringify({id, method, params}));
    });
  }
  async function evaluate(fn, ...args) {
    const response = await call('App.callFunction', {functionDeclaration: fn.toString(), args});
    return response.result;
  }
  async function wx(method, ...args) {
    const response = await call('App.callWxMethod', {method, args});
    return response.result;
  }
  async function screenshot(name) {
    const result = await call('App.captureScreenshot');
    const data = result.data || result.image || result.base64;
    if (!data) throw new Error('Screenshot response keys: ' + Object.keys(result));
    const directory = path.resolve(__dirname, '../docs/evidence/miniapp-mp1');
    fs.mkdirSync(directory, {recursive:true});
    fs.writeFileSync(path.join(directory, name + '.png'), Buffer.from(data.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
  }
  return {call, evaluate, wx, screenshot, events, close: () => socket.close()};
}
module.exports = {connect, delay: milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))};
