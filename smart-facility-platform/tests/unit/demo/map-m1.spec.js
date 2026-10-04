const fs = require('fs');
const path = require('path');

const floorVue = fs.readFileSync(path.resolve(__dirname, '../../../src/views/floorConfiguar/index.vue'), 'utf8');
const floorLess = fs.readFileSync(path.resolve(__dirname, '../../../src/views/floorConfiguar/index.less'), 'utf8');
const roomVue = fs.readFileSync(path.resolve(__dirname, '../../../src/views/roomConfiguar/index.vue'), 'utf8');
const roomLess = fs.readFileSync(path.resolve(__dirname, '../../../src/views/roomConfiguar/index.less'), 'utf8');

describe('map M1 header toolbar source contract', () => {
  test('floor preview separates scenario and filter groups with labels', () => {
    expect(floorVue).not.toMatch(/data-testid="demo-scenario-group"/);
    expect(floorVue).toMatch(/data-testid="status-filter-group"/);
    expect(floorVue).not.toMatch(/class="toolbar-label">场景</);
    expect(floorVue).toMatch(/class="toolbar-label">筛选</);
    expect(floorVue).not.toMatch(/@click="handleDemoScenario/);
    expect(floorVue).toMatch(/handleShowAllData/);
    expect(floorVue).not.toMatch(/场景·正常/);
  });

  test('floor styles no longer absolutely stack two layout-switch blocks', () => {
    expect(floorLess).toMatch(/\.header-toolbar\s*\{/);
    expect(floorLess).toMatch(/\.layout-switch\s*\{[\s\S]*?position:\s*static/);
    expect(floorLess).not.toMatch(/\.layout-switch\s*\{[\s\S]*?position:\s*absolute[\s\S]*?left:\s*30px/);
  });

  test('room preview mirrors labeled scenario + type filter toolbar', () => {
    expect(roomVue).not.toMatch(/data-testid="demo-scenario-group"/);
    expect(roomVue).toMatch(/data-testid="device-type-filter-group"/);
    expect(roomVue).not.toMatch(/class="toolbar-label">场景</);
    expect(roomVue).toMatch(/class="toolbar-label">筛选</);
    expect(roomVue).not.toMatch(/@click="handleDemoScenario/);
    expect(roomVue).toMatch(/handleDemoScenarioCycle/);
    expect(roomVue).not.toMatch(/@click="handleDemoScenarioCycle"/);
    expect(roomLess).toMatch(/\.header-toolbar\s*\{/);
    expect(roomLess).toMatch(/position:\s*static/);
  });

  test('room drawers resolve device logos via demo asset registry, not picUrl', () => {
    const roomModule = fs.readFileSync(path.resolve(__dirname, '../../../src/views/room/components/RoomModule.vue'), 'utf8');
    const monitor = fs.readFileSync(path.resolve(__dirname, '../../../src/views/room/components/MonitorEquipment.vue'), 'utf8');
    expect(roomModule).toMatch(/resolveDeviceAssetUrl\(item\.logoUrl/);
    expect(roomModule).not.toMatch(/url:\s*BASE_URL\s*\+\s*item\.logoUrl/);
    expect(monitor).toMatch(/resolveDeviceAssetUrl\(item\.logoUrl/);
  });
});
