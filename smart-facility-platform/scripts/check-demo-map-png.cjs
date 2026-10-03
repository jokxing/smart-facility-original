/** Export our trusted SVG originals, then exercise actual PNG upload and reload.
 * Reuses the isolated local-only M2 browser harness; no extra dependency.
 */
const fs = require('node:fs');
const path = require('node:path');
const assets = path.resolve(__dirname, '../public/demo/floors');
const originals = ['floor-a-1f', 'room-a', 'room-b'].map(name => ({
  name, svg: fs.readFileSync(path.join(assets, name + '.svg'), 'utf8')
}));
for (const asset of originals) {
  if (/<(?:text|tspan|textPath|foreignObject)\b/i.test(asset.svg)) {
    throw new Error('Background must not contain rendered text: ' + asset.name);
  }
}
let source = fs.readFileSync(path.join(__dirname, 'check-demo-map-m2.cjs'), 'utf8');
function replaceOnce(before, after) {
  if (!source.includes(before)) throw new Error('M2 harness changed: ' + before.slice(0, 70));
  source = source.replace(before, after);
}
replaceOnce("../../docs/evidence/map-m2", "../../docs/evidence/map-png");
replaceOnce("'demo-map-m2-shots'", "'demo-map-png-shots'");
replaceOnce("    // --- Map settings:", `
    // Rasterize only the three repo-owned SVGs, preserving intrinsic dimensions.
    for (const asset of ${JSON.stringify(originals)}) {
      const png = await evaluate('(' + (async function (svg) {
        const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
        try {
          const image = new Image();
          image.src = url;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          canvas.getContext('2d').drawImage(image, 0, 0);
          return {width: canvas.width, height: canvas.height, data: canvas.toDataURL('image/png').split(',')[1]};
        } finally {URL.revokeObjectURL(url);}
      }).toString() + ')(' + JSON.stringify(asset.svg) + ')');
      assert.ok(png.width > 0 && png.height > 0);
      const bytes = Buffer.from(png.data, 'base64');
      assert.ok(bytes.length < 5 * 1024 * 1024);
      fs.writeFileSync(path.resolve(__dirname, '../public/demo/floors', asset.name + '.png'), bytes);
      console.log(asset.name + '.png: ' + png.width + 'x' + png.height + ', ' + bytes.length + ' bytes');
    }
    // --- Map settings:`);

// These browser functions run through the actual uploader and IndexedDB store.
const upload = async function(modal, asset) {
  await modal.$nextTick();
  const find = vm => vm && (vm.demoLocal && vm.beforeAvatarUpload ? vm : (vm.$children || []).map(find).find(Boolean));
  const uploader = find(modal);
  if (!uploader) throw new Error('local uploader not mounted');
  const blob = await (await fetch('/demo/floors/' + asset + '.png')).blob();
  uploader.beforeAvatarUpload(new File([blob], asset + '.png', {type: 'image/png'}));
  const deadline = Date.now() + 10000;
  while (uploader.uploading && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
  if (!modal.fileList[0] || !/^demo-media-/.test(modal.fileList[0].name)) throw new Error('PNG not saved');
  const preview = new Image();
  preview.src = modal.fileList[0].url;
  await preview.decode();
  return modal.fileList[0].name;
};
replaceOnce("modal.fileList = [{name: 'demo-floor-a-1f', uid: 'browser', url: '/demo/floors/floor-a-1f.svg'}];",
  'await (' + upload.toString() + ")(modal, 'floor-a-1f');");
replaceOnce("    // --- Room management:", `
    const floorKey = createRes.items.mapUrl;
    assert.match(floorKey, /^demo-media-/);
    await evaluate("location.hash = '#/floor/view?floorId=" + newFloorId + "&mapUrl=" + floorKey + "&floorName=PNG&mapId=0'");
    await send('Page.reload', {ignoreCache: true});
    await waitPage(\`(() => {
      const find = vm => vm && (vm.bgConfig && vm.floorId ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app') && document.querySelector('#app').__vue__);
      const image = page && page.bgConfig.image;
      return image && image.complete && image.naturalWidth === 1678 && image.src.startsWith('blob:');
    })()\`, 'floor PNG restored after reload');
    await screenshot('06-floor-png-reloaded');
    // --- Room management:`);
replaceOnce('    await evaluate(`(() => {\n      const page = ${findRoom};\n      const modal =',
  '    await evaluate(`(async () => {\n      const page = ${findRoom};\n      const modal =');
replaceOnce('      modal.form.buildingId = 920001;\n      return modal.handleSubmit();',
  '      modal.form.buildingId = 920001;\n      await (' + upload.toString() + ")(modal, 'room-a');\n      return modal.handleSubmit();");
replaceOnce('    // Seed room with devices:', `
    await evaluate("location.hash = '#/room/view?roomId=" + createdId + "&roomName=PNG'");
    await send('Page.reload', {ignoreCache: true});
    await waitPage(\`(() => {
      const find = vm => vm && (vm.bgConfig && vm.getDrawerDataAsync && vm.$route.query.roomId ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app') && document.querySelector('#app').__vue__);
      const image = page && page.bgConfig.image;
      return image && image.complete && image.naturalWidth === 762 && image.src.startsWith('blob:') && page.bgConfig.width > 0 && page.bgConfig.height > 0;
    })()\`, 'room PNG restored after reload');
    await screenshot('07-room-png-reloaded');
    await evaluate("location.hash = '#/rm/room'");
    await waitPage(\`\${findRoom} && !\${findRoom}.refreshLoading\`, 'room list after reload');
    // Seed room with devices:`);
replaceOnce("'map-m2 browser OK;", "'map-png browser OK;");
const previewCheck = `
    await evaluate(\`(async () => {
      const find = vm => vm && (vm.handlePreviewImg && vm.$refs.CreateFloor ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      await page.handlePreviewImg(PREVIEW_KEY);
    })()\`);
    await waitPage("Array.from(document.querySelectorAll('.el-dialog img')).some(img => img.naturalWidth === 1678 && img.getBoundingClientRect().width > 0)", 'floor dialog preview loaded');
    await screenshot(PREVIEW_SHOT);
    await evaluate(\`(() => {
      const find = vm => vm && (vm.handlePreviewImg && vm.$refs.CreateFloor ? vm : (vm.$children || []).map(find).find(Boolean));
      find(document.querySelector('#app').__vue__).isImage = false;
    })()\`);
`;
replaceOnce('    const createRes = await evaluate(',
  previewCheck.replace('PREVIEW_KEY', "'demo-floor-a-1f'").replace('PREVIEW_SHOT', "'08-builtin-dialog-preview'") + '    const createRes = await evaluate(');
replaceOnce('    const floorKey = createRes.items.mapUrl;',
  previewCheck.replace('PREVIEW_KEY', '${JSON.stringify(createRes.items.mapUrl)}').replace('PREVIEW_SHOT', "'09-uploaded-dialog-preview'") + '    const floorKey = createRes.items.mapUrl;');
new Function('require', '__dirname', source)(require, __dirname);
