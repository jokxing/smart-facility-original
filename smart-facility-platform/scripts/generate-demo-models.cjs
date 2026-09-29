/**
 * Generate self-contained demo building GLB files (no textures, no external buffers).
 * Synthetic geometry only — not original customer assets.
 *
 * Usage: node scripts/generate-demo-models.cjs
 */
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../public/demo/models');

function boxGeometry(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  // 8 corners, then 24 vertices (unique normals per face) for flat shading-ish look
  const positions = new Float32Array([
    // +Z
    -x, -y, z, x, -y, z, x, y, z, -x, y, z,
    // -Z
    x, -y, -z, -x, -y, -z, -x, y, -z, x, y, -z,
    // +Y
    -x, y, z, x, y, z, x, y, -z, -x, y, -z,
    // -Y
    -x, -y, -z, x, -y, -z, x, -y, z, -x, -y, z,
    // +X
    x, -y, z, x, -y, -z, x, y, -z, x, y, z,
    // -X
    -x, -y, -z, -x, -y, z, -x, y, z, -x, y, -z
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ]);
  return {positions, indices, vertexCount: 24, indexCount: 36};
}

function buildGlb({name, width, height, depth, color}) {
  const {positions, indices, vertexCount, indexCount} = boxGeometry(width, height, depth);
  const positionBytes = positions.byteLength;
  const indexBytes = indices.byteLength;
  const indexPad = (4 - (indexBytes % 4)) % 4;
  const bin = Buffer.alloc(positionBytes + indexBytes + indexPad);
  Buffer.from(positions.buffer, positions.byteOffset, positionBytes).copy(bin, 0);
  Buffer.from(indices.buffer, indices.byteOffset, indexBytes).copy(bin, positionBytes);

  const json = {
    asset: {version: '2.0', generator: 'smart-facility-demo-generate-demo-models'},
    scene: 0,
    scenes: [{name, nodes: [0]}],
    nodes: [{mesh: 0, translation: [0, height / 2, 0]}],
    meshes: [{
      name,
      primitives: [{attributes: {POSITION: 0}, indices: 1, material: 0}]
    }],
    materials: [{
      name: name + '-mat',
      pbrMetallicRoughness: {
        baseColorFactor: [...color, 1],
        metallicFactor: 0.05,
        roughnessFactor: 0.85
      }
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: vertexCount,
        type: 'VEC3',
        max: [width / 2, height / 2, depth / 2],
        min: [-width / 2, -height / 2, -depth / 2]
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: indexCount,
        type: 'SCALAR'
      }
    ],
    bufferViews: [
      {buffer: 0, byteOffset: 0, byteLength: positionBytes, target: 34962},
      {buffer: 0, byteOffset: positionBytes, byteLength: indexBytes, target: 34963}
    ],
    buffers: [{byteLength: bin.length}]
  };

  let jsonText = JSON.stringify(json);
  const jsonPad = (4 - (Buffer.byteLength(jsonText) % 4)) % 4;
  jsonText += ' '.repeat(jsonPad);
  const jsonChunk = Buffer.from(jsonText, 'utf8');

  const totalLength = 12 + 8 + jsonChunk.length + 8 + bin.length;
  const out = Buffer.alloc(totalLength);
  out.writeUInt32LE(0x46546C67, 0); // glTF
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(totalLength, 8);
  out.writeUInt32LE(jsonChunk.length, 12);
  out.writeUInt32LE(0x4E4F534A, 16); // JSON
  jsonChunk.copy(out, 20);
  const binOffset = 20 + jsonChunk.length;
  out.writeUInt32LE(bin.length, binOffset);
  out.writeUInt32LE(0x004E4942, binOffset + 4); // BIN
  bin.copy(out, binOffset + 8);
  return out;
}

const buildings = [
  {file: 'building-a.glb', name: 'demo-building-a', width: 18, height: 42, depth: 18, color: [0.22, 0.45, 0.78]},
  {file: 'building-b.glb', name: 'demo-building-b', width: 28, height: 28, depth: 16, color: [0.20, 0.62, 0.42]},
  {file: 'building-c.glb', name: 'demo-building-c', width: 34, height: 20, depth: 22, color: [0.82, 0.52, 0.18]}
];

fs.mkdirSync(outDir, {recursive: true});
for (const building of buildings) {
  const file = path.join(outDir, building.file);
  fs.writeFileSync(file, buildGlb(building));
  console.log('wrote', path.relative(process.cwd(), file), fs.statSync(file).size, 'bytes');
}
