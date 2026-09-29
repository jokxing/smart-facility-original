const fs = require('fs');
const path = require('path');
// Architecture/fixed benches only. Device icons, readings and positions belong to Mock + Konva.
const bench = (x,y,w=230,h=66) => `<g transform="translate(${x} ${y})"><rect x="4" y="6" width="${w}" height="${h}" rx="4" fill="#102838" opacity=".3"/><rect width="${w}" height="${h}" rx="4" fill="#b6cbd2" stroke="#375c70" stroke-width="3"/><rect x="8" y="8" width="${w-16}" height="${h-16}" rx="2" fill="#e1e9e8"/><path d="M12 ${h/2}H${w-12}" stroke="#9bb5bf" stroke-width="2"/><rect x="${w/2-22}" y="${h/2-4}" width="44" height="8" rx="2" fill="#7e9eac"/></g>`;
const windows = [150,310,470,630,930,1090,1250,1410].map(x => `<g stroke="#80b6c7"><rect x="${x}" y="64" width="112" height="12" fill="#c7eaf0" stroke-width="3"/><path d="M${x+56} 64v12" stroke-width="2"/></g>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1678" height="795" viewBox="0 0 1678 795">
<title>合成实验室楼层底图：固定建筑与实验台，设备由独立数据层提供</title>
<defs>
  <pattern id="tile" width="52" height="52" patternUnits="userSpaceOnUse"><rect width="52" height="52" fill="#91aab6"/><path d="M52 0H0V52" fill="none" stroke="#a9bec7" stroke-width="1"/></pattern>
  <pattern id="corridor" width="104" height="40" patternUnits="userSpaceOnUse"><rect width="104" height="40" fill="#698895"/><path d="M0 40H104" stroke="#809aa5"/></pattern>
</defs>
<rect width="1678" height="795" rx="10" fill="#10293c"/>
<text x="70" y="38" fill="#b9d9e7" font-family="sans-serif" font-size="20" letter-spacing="3">LABORATORY · 1F</text>
<text x="1608" y="38" text-anchor="end" fill="#719aaf" font-family="sans-serif" font-size="15">实验空间 / 楼层总览</text>
<rect x="78" y="80" width="1534" height="662" fill="#071a29" opacity=".6"/>
<rect x="70" y="70" width="1538" height="660" fill="url(#tile)" stroke="#213e50" stroke-width="16"/>
<!-- Two large laboratories above a continuous circulation spine. -->
<rect x="78" y="405" width="1522" height="116" fill="url(#corridor)"/>
<path d="M840 78V405 M78 405H365 M455 405H1200 M1290 405H1600 M78 521H1600" fill="none" stroke="#294859" stroke-width="12"/>
<path d="M365 405v-82 M365 323a82 82 0 0 1 82 82 M1290 405v-82 M1208 405a82 82 0 0 1 82-82" fill="none" stroke="#d1e3e7" stroke-width="3"/>
${windows}
<!-- Long wall benches and central islands; no monitoring instruments baked into the image. -->
${bench(115,105,72,246)}${bench(1490,105,72,246)}
${bench(270,215,390,72)}${bench(270,322,390,54)}
${bench(975,215,390,72)}${bench(975,322,390,54)}
<!-- Lower support areas, central preparation benches, lifts and stairs. -->
<path d="M330 527V722 M590 527V722 M1090 527V722 M1350 527V722" stroke="#294859" stroke-width="12"/>
<rect x="95" y="555" width="210" height="142" rx="3" fill="#5c7888" stroke="#c0d4dc" stroke-width="3"/>
<path d="M110 570h180 M110 590h180 M110 610h180 M110 630h180 M110 650h180 M110 670h180" stroke="#9fbac6" stroke-width="2"/>
<path d="M205 681V566m-9 11 9-11 9 11" fill="none" stroke="#dfebed" stroke-width="3"/>
<g fill="#657f8e" stroke="#c0d4dc" stroke-width="3"><rect x="359" y="558" width="92" height="132"/><rect x="472" y="558" width="92" height="132"/></g>
<path d="M405 563v120 M518 563v120" stroke="#a6c5d2" stroke-width="2"/>
${bench(635,574,410,76)}
${bench(1124,552,190,52)}${bench(1124,646,190,52)}
<g fill="#c5d9de" stroke="#7896a6" stroke-width="2"><rect x="1380" y="555" width="78" height="62" rx="8"/><rect x="1490" y="555" width="78" height="62" rx="8"/><rect x="1380" y="652" width="188" height="40" rx="4"/></g>
<path d="M700 521h100 M920 521h100" stroke="#698895" stroke-width="14"/>
<g font-family="sans-serif" font-size="15" fill="#d2e4e9" text-anchor="middle">
<text x="200" y="716">楼梯</text><text x="463" y="716">电梯</text><text x="840" y="701">公共准备区</text><text x="1220" y="630">辅助区</text>
</g>
<path d="M710 465h-70m12-8-12 8 12 8 M975 465h70m-12-8 12 8-12 8" fill="none" stroke="#bad6df" stroke-width="3"/>
<text x="70" y="770" fill="#688fa4" font-family="sans-serif" font-size="14">实验区 / 公共准备区 / 辅助区</text>
</svg>
`;
const outDir = path.join(__dirname, '../public/demo/floors');
const file = path.join(outDir, 'floor-a-1f.svg');
fs.writeFileSync(file, svg);
console.log('wrote', file, fs.statSync(file).size);

// Room crops: same geometry, viewBox limited to each lab so RoomView is not the full floor.
function writeRoomCrop(name, viewBox, width, height, title) {
  const cropped = svg
    .replace('width="1678" height="795" viewBox="0 0 1678 795"', `width="${width}" height="${height}" viewBox="${viewBox}"`)
    .replace(
      '<title>合成实验室楼层底图：固定建筑与实验台，设备由独立数据层提供</title>',
      `<title>${title}</title>`
    );
  const target = path.join(outDir, name);
  fs.writeFileSync(target, cropped);
  console.log('wrote', target, fs.statSync(target).size);
}
writeRoomCrop('room-a.svg', '78 78 762 327', 762, 327, '演示房间 A 局部底图（自楼层 SVG 裁切）');
writeRoomCrop('room-b.svg', '840 78 760 327', 760, 327, '演示房间 B 局部底图（自楼层 SVG 裁切）');
