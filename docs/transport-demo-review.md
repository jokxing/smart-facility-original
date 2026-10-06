# 双端运单 Mock 与 SaaS 移液枪复盘

日期：2026-10-06。对照 `docs/transport-dual-client-task-prompt.md`。

## 各批改动

### T0 SaaS 移液枪

核对业务码：0 使用中、1 在架、2 超时（由取出时间相对演示时钟满 24h 计算）。统计卡本来按 `homingNum=1` / `noHomingNum=0` 取值是对的，但 `GUNSTATUS` 把 0 标成「在枪架上」，列表/详情颜色文案反了。已对调标签与颜色类。详情/枪架模拟取还后向父页 `handle`，刷新列表和统计。归还时间不得早于取出。演示权限原先未放行 `/lhd/pipetteGun*`，文档却已写开放，已补菜单与 `permission.js`。存储仍独立，不是跨端联动。

### T1 契约与种子

`docs/transport-demo-contract.md`：实体 0 待装车；小程序查询 `state=0` 表示全部。10 条同 ID 合成运单，覆盖待装车/已装车/运输中/已送达、超温与延迟。异常独立于运输状态。

### T2 SaaS 运单

`src/mock/fixtures/transport.js` + `handlers/transport.js` 接入 adapter。菜单运输管理 → 主页/运单。列表搜索分页状态筛选、同源统计、详情、创建、装车、发运、送达、状态机、车辆占用与送达释放、本地覆盖层、确认后重置。冷藏车/品名/单位管理页未开放，下拉走同源种子。导出拒绝。地图页保持不加载高德，文案标明演示时钟与模拟轨迹。

### T3 小程序运单

独立 `utils/demo/transport.js`。列表/搜索/筛选/统计/详情/发运/送达。无创建入口。返回 `onShow` 重新查询。未知 ID 空态。loading 序号避免串请求。打印预览为演示凭证；蓝牙入口禁用并提示未接入。

### T4 监测与边界

温湿度由同一时钟生成，超温阈值 2～8℃ 与列表/详情一致。轨迹为合成坐标，标模拟，不请求定位服务。未做真实扫码/蓝牙/硬件/打印。

## 验证

- `npx vue-cli-service test:unit --runInBand tests/unit/demo/pipette-gun.spec.js tests/unit/demo/transport.spec.js`
- `node scripts/check-mp6-demo.cjs`、`node scripts/check-mp7-transport.cjs`
- 适用 MP1–MP5 检查（若本机已有脚本）

浏览器 / 微信模拟器点击验收需本机已启动 `npm run demo` 与 HBuilderX 编译；本轮以源码检查与单测/node 脚本为主。未完成的 UI 点击项见下。

## 已通过

- 枪超时由取出时长计算；PG-003 归还后状态 1、超时列表为空、统计同源、重复归还失败。
- 运单查询 0≠待装车（SaaS `state:0` 才是待装车；小程序 `state:0` 为全部）。
- 跳状态/无车装车/未知 ID 失败且不改数据。
- 发运同车已装车单、送达释放占用、重置恢复 10 条。
- 退出登录保留运单覆盖层。

## 未通过 / 未完成

- 未在本轮用 Edge 实际点击 `/apply/transport/waybill` 截图。
- 未在微信模拟器点击运单 Tab 截图。
- 未重跑完整 `test:demo` 全量（仅枪+运单相关单测）。
- 未重编译微信产物。

## 运行方式

SaaS：`npm run demo`，账号 `demo` / `Demo1234` / `2468`，顶栏运输管理或智能硬件→移液枪。  
小程序：HBuilderX 编译到微信开发者工具，运单 Tab。两端重置互不影响。

## 仍未接入

真实扫码、蓝牙、硬件采集、高德实网、电子签收签名、跨端同步、冷藏车/品名/单位 CRUD、运单删除与导出。

不编写履历生产上线或硬件联调。未 commit/push。
