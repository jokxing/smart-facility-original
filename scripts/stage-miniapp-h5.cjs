const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const destination = path.resolve(process.argv[2] || path.join(root, '.tmp/h5-site'));
const input = path.join(root, 'miniprogram');
const build = path.join(input, 'unpackage/dist/build/h5');
if (!fs.existsSync(path.join(build, 'index.html'))) throw new Error('Build H5 first.');
if (!destination.startsWith(root + path.sep) || destination === input || destination.startsWith(input + path.sep)) {
  throw new Error('Use a separate staging directory inside this workspace, outside miniprogram.');
}
fs.mkdirSync(destination, { recursive: true });
const excluded = new Set(['.git', '.idea', '.hbuilderx', '.tmp', 'node_modules', 'unpackage', 'project.private.config.json']);
fs.cpSync(input, path.join(destination, 'miniprogram'), {
  recursive: true,
  filter: filename => !path.relative(input, filename).split(path.sep).some(part => excluded.has(part) || part.startsWith('.env'))
});
fs.mkdirSync(path.join(destination, 'scripts'), { recursive: true });
for (const file of ['build-miniapp.ps1', 'serve-miniapp-h5.cjs', 'check-miniapp-h5.cjs', 'stage-miniapp-h5.cjs']) {
  fs.copyFileSync(path.join(root, 'scripts', file), path.join(destination, 'scripts', file));
}
// Replace only the generated dist owned by this staging workflow; never source or Git state.
const stagedDist = path.resolve(destination, 'dist');
if (!stagedDist.startsWith(destination + path.sep)) throw new Error('Invalid output directory.');
fs.rmSync(stagedDist, { recursive: true, force: true });
fs.cpSync(build, stagedDist, { recursive: true });
fs.mkdirSync(path.join(destination, '.openai'), { recursive: true });
fs.copyFileSync(path.join(input, '.openai/hosting.json'), path.join(destination, '.openai/hosting.json'));
if (fs.existsSync(path.join(root, 'docs/cross-platform-validation.md'))) {
  fs.copyFileSync(path.join(root, 'docs/cross-platform-validation.md'), path.join(destination, 'README.md'));
}
console.log(JSON.stringify({ destination, source: 'miniprogram', static: 'dist' }));
