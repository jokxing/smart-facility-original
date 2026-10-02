# 工作状态

## 当前下一任务：智能硬件 1A（2026-09-30，用户调整优先级）

- 用户确认转向首页业务模块，不继续把品牌/装饰素材审查作为功能推进前置。剩余素材与授权审查暂缓，公开发布前仍需处理。
- 下一执行任务已重写为智能硬件首页入口与只读列表闭环：核实契约、统一 Mock、筛选/分页/状态/排序、有限开放入口和本地验证。
- 已核实源码线索：/pro → /lhd/hardware/home、HardwareHome.vue、DeviceTable/DeviceTotal/SelectdePartment、api/device.getEquipmentSortList、permission.js。详细提示词见 next-task-prompt.md。
- 1B 预留类型匹配的详情/曲线/告警联动；管理写操作及其他首页模块后续分批处理。本轮只整理交接文档，未实现 1A，未提交推送。

## 当前收尾：品牌页面验收完成（2026-09-30）

- 修复 check-demo-brand-ui.cjs 的验收条件：等待转场退出、Logo 可见且未遮挡、前页 DOM 移除和楼宇 canvas/加载遮罩就绪；截图前等待绘制。语言通过真实菜单切换，读取演示命名空间配置；favicon 实际 HTTP 加载、解码及透明像素断言。
- 运行：本地 demo 编译成功（实际端口 8090）；Edge 验收通过，已查看英文登录、楼宇和后台截图。原楼宇截图为首页、导航叠层均因截图过早，稳定后未复现，不改业务代码。
- 产物：docs/evidence/brand-ui 下 6 张中英文登录/首页、楼宇、导航截图；移除 public 中 5 份旧截图/文本，避免错误证据作为应用资源。生成器及品牌资源保持。
- 检查：favicon SVG/ICO 均成功加载、解码，角点透明；中英文首页标题无横向溢出；登录浅底、首页/楼宇/导航深底 Logo 可辨认；脚本语法通过。
- 限制：1440×900 Edge 本地验收；未做旧浏览器历史缓存、所有分辨率、生产构建与完整英文业务翻译验收。本轮仅测试脚本/文档/证据变化，未重复业务单测。
- 下一任务扩大到大屏/中控装饰素材、残留敏感文案、素材授权记录。楼宇环境图可见未核实字样，下一批优先追踪；不代表本轮全量脱敏。未暂存、提交或推送。

## 最新复盘：品牌清理通过，页面视觉验收需补验（2026-09-30）

- 独立检查：六份已删除旧品牌图片在 src/public/config/scripts 中未发现运行时引用（README 历史清单除外）；生成器旧 --replace-brand 分支已拒绝执行；两份脚本语法检查通过。ICO 766 字节，目录项终点 766，无旧尾部。
- P2：04-building.png 实际为首页画面；05-navbar.png 存在首页背景/内容与后台导航叠加，不能作为稳定页面验收证据。脚本等待 DOM/图片加载，但未验证转场结束、页面可见性或楼宇渲染就绪。不能据此认定业务页面存在稳定复现的叠层问题，需补验区分。
- 验证缺口：02-login-en.txt 只读取 i18n 字典，没有切换英文页面；favicon 只断言 link 存在，没有浏览器加载及缓存验证。深浅背景适配尚无完整证据。
- 本次只读复盘源码和现有截图，未重跑浏览器/单测，未改业务代码，未提交推送。下一最小任务是修验收等待条件、补真实截图并更正文档结论，暂不扩展其他残留审查。

## 最新补充：统一透明楼宇标识（2026-09-30）

- 新增 facility-logo.svg（楼宇节点 + SF，深浅青蓝双层线条）和 public/favicon.svg；登录、首页、楼宇及后台导航默认 Logo 切换到 SVG。首页中英文标题由图片改为页面文字，bashboard.less 增加标题排版。
- generate-demo-brand-assets.cjs 的 favicon 改为同造型透明楼宇，保留 File.Create 截断；仅运行 --favicon-only 更新 ICO，favicon-preview.png 同步。public/index.html 优先提供 SVG，保留 ICO 兼容入口。
- 验证：四份修改的 Vue 模板编译通过；生成器语法检查通过；ICO 文件终点与目录项一致，无额外尾部；预览可解码、左上角 alpha=0，已查看图标。
- 未验证：本轮未做浏览器页面截图、缓存与深浅主题实际验收；未跑生产构建。没有更改业务逻辑。
- 残留：原六份品牌 PNG 尚在磁盘，旧 --replace-brand 生成分支尚在；不可宣称全量品牌脱敏。下一任务交另 AI 做页面验收、引用核实后移除旧资产与过时生成逻辑，详见 next-task-prompt.md。
- 未暂存、提交或推送；不自动进入下一批。

更新时间：2026-09-23。

## 当前状态：任务 3B 已完成并停止

本轮完成：**本地自建 GLB + 受限模型解析 + 有限开放 `/building`**。未接入楼层平面图、大屏、设计器。运行说明见 `docs/demo-guide.md`；下一项提示词见 `docs/next-task-prompt.md`。

当前演示开放：`/login`、`/dashboard`、`/building`。账号 `demo` / `Demo1234` / 验证码 `2468`（合成）。

### 本轮修改文件（任务 3B）

以下平台路径相对 `smart-facility-platform/`：

| 文件 | 修改内容 |
| --- | --- |
| `scripts/generate-demo-models.cjs`、`public/demo/models/*` | 自包含合成楼体 GLB（蓝/绿/琥珀差异）；README 说明来源 |
| `src/utils/demoModelUrl.js` | 演示仅允许登记键/路径；非 demo 仍用 `BASE_URL + url`；不放开 `/api` 文件服务 |
| `src/mock/fixtures/space.js` | 三栋楼 `url` 映射 `demo-building-a/b/c`；`DEMO_MODEL_PENDING.buildingUrlReady=true`，`floorMapUrlReady` 仍 false |
| `src/views/building/Building.vue` | 经解析模块加载；空态/失败收尾；请求与模型竞态 token；组件内释放；demo 禁用楼层/大屏跳转 |
| `src/permission.js` | 额外放行 `/building`；楼宇导航不重跑登录 bootstrap、不清 building Vuex |
| `tests/unit/demo/map.spec.js` | 改为断言登记本地模型；保留空 mapUrl 与未知接口拒绝 |
| `scripts/check-demo-browser.cjs` | 验证进入楼宇、模型入场景、园区切换、回首页；未开放路由仍拦截 |
| `package.json` | 增加 `demo:models` 脚本 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 本轮状态与下一项楼层只读契约提示 |

未改：平面图/大屏业务、全局 `BASE_URL`、`config/demo.js` 对 `/api` 的阻断、依赖升级、批量脱敏。未下载原客户模型、未连原服务、未推 Git。

### 验证结果

- `npm run test:demo -- --watch=false`：3 文件 / **12** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：登录回归 + **楼宇页打开、模型挂到 scene、园区切换、回首页、未开放大屏路由仍挡回、CSP/直连 API 阻断**；`externalAttempts: 0`，`uncaughtExceptions: 0`。
- 本地静态资源：`GET /demo/models/building-a.glb` → 200（浏览器脚本已断言）。
- 本轮未声称 GPU 像素级「视觉精美验收」；以 canvas 存在、`glbScene` 非空、切换后楼栋 ID/url 一致、无异常作为 3D 最小可用证据。headless Edge 下软件渲染可用。

### 模型来源

- 生成：`node scripts/generate-demo-models.cjs`（或 `npm run demo:models`）。
- 资产：纯几何盒子 + PBR 颜色，无纹理、无外链 buffer；**非**原客户模型。
- 种子 `url` 为登记键；运行时解析为 `/demo/models/*.glb`，不经过被阻断的文件 API。

### 未验证 / 遗留风险

- 楼层 `mapUrl`、平面图、房间/楼层大屏仍未接入。
- 未做全工程 WebGL 性能审计；仅 Building 组件内 dispose。
- 品牌/客户定制未批量脱敏；公开部署前仍不可用。
- 快速切换的人为延迟竞态未单独加网络延迟注入用例（有 token 防护，浏览器做了园区切换）。

### 下一步最小任务（未开始）

执行 `docs/next-task-prompt.md`：**一个楼层的只读平面图契约**（不展开房间编辑器与大屏）。完成后停止再复盘。

---

## 任务 3A 与复盘（历史摘要）

园区/楼栋只读 Mock 与合成空间种子已交付并复盘通过；详见 `docs/review-task-3a.md`。3B 已按复盘接缝接入受限模型解析，未放开文件 API。

---

## 任务 1–2 完成记录（历史）

隔离演示启动、统一 Mock、账号登录与原首页仍有效。

---

## 追加：任务 4A 已完成并停止（2026-09-24）

> 约定：后续 STATUS 更新在文末追加，不覆盖上方历史段落。

本轮完成：**一个楼层的只读平面图契约**（演示一号楼 1F）。未开放楼层/房间设计器与大屏。说明见 `docs/demo-guide.md`；下一项见 `docs/next-task-prompt.md`。

当前演示开放：`/login`、`/dashboard`、`/building`、`/floor/view`。账号同前（合成）。

### 本轮修改文件（任务 4A）

路径相对 `smart-facility-platform/`：

| 文件 | 修改内容 |
| --- | --- |
| `public/demo/floors/floor-a-1f.svg`、`README.md`、`scripts/write-floor-svg.cjs` | 合成只读平面 SVG |
| `src/utils/demoFloorMapUrl.js` | 平面图登记解析；不放开文件 API |
| `src/mock/fixtures/space.js` | 930001 的 `mapUrl=demo-floor-a-1f`；`floorMapUrlReady=true` |
| `src/mock/fixtures/floor.js`、`handlers/floor.js`、`mock/index.js` | `GET /map/floor/overview`；空 `labList` |
| `src/permission.js` | 额外放行 `/floor/view` |
| `src/views/building/Building.vue` | 有 mapUrl 的楼层可进预览；无 mapUrl 仍提示 |
| `src/views/floorConfiguar/index.vue` | 经 `resolveFloorMapUrl` 加载背景；demo 禁用设计器/大屏 |
| `tests/unit/demo/floor.spec.js`、`map.spec.js` | 平面契约与种子断言 |
| `scripts/check-demo-browser.cjs` | 进楼层、平面图、回楼宇、设计器仍拦截 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 本轮追加状态与下一项提示词 |

### 验证结果

- `npm run test:demo -- --watch=false`：4 文件 / **15** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：含楼层只读预览与平面图背景；`floorView`/`floorPlanImage`/`designerBlocked` 通过；外网 0、异常 0。
- 静态：`/demo/floors/floor-a-1f.svg` → 200。

### 契约判断

| 项 | 判断 |
| --- | --- |
| `/floor/view` + query `floorId/mapUrl/mapId/floorName` | 源码确认（Building.goFloorView） |
| 背景 `Image` 原为 `BASE_URL+mapUrl`；demo 改为登记本地路径 | 资源边界按 3B 同策略 |
| `GET /map/floor/overview?floorId=` → `items.labList` | 源码确认；本轮空列表，房间点位后续 |
| 仅一层有 mapUrl | 有意最小切片 |

### 未验证 / 遗留

- 其余楼层 mapUrl、房间标记、设计器保存、大屏。
- 品牌脱敏、GPU 精修。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`：**房间只读列表/点位的最小读取切片**（仍不开放设计器与大屏）。

---

## 追加：任务 4B 已完成并停止（2026-09-24）

本轮完成：在演示一号楼 1F 平面上展示 **3 个合成房间标记**（overview.labList）。未开放设计器、房间抽屉详情写操作、大屏。

### 本轮修改文件（任务 4B）

| 文件 | 修改内容 |
| --- | --- |
| `src/mock/fixtures/floor.js` | `DEMO_FLOOR_ROOMS`（950001–950003）；`listFloorOverview` 返回确认字段 |
| `tests/unit/demo/floor.spec.js` | 断言 labList 名称/字段；未接线楼层仍空；设计器 API 拒绝 |
| `scripts/check-demo-browser.cjs` | 断言 `deviceList` 含「演示房间 A」等标记 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项提示 |

### 验证结果

- `npm run test:demo -- --watch=false`：4 文件 / **15** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`roomMarkers: true`；外网 0、异常 0。

### 契约判断

| 项 | 判断 |
| --- | --- |
| `labList[].id/name/x/y/width/fontSize/color/senorStatus/equipments` | 源码确认（floorConfiguar 渲染与 overview 展开） |
| `equipments` 可为空数组 | 源码要求可遍历；本轮无探头 |
| 房间坐标/文案 | 暂定演示值，对齐合成 SVG 区域 |
| `isEdit: false` | 演示避免打开房间抽屉；非后端规范 |

### 未验证 / 遗留

- 探头/设备状态图标、房间详情抽屉、设计器保存、其余楼层、大屏。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`：**一张大屏的最小只读切片**（或按提示词；不自动展开监控闭环）。

---

## 追加：任务 5A 已完成并停止（2026-09-24）

本轮完成：**FloorDataV（楼层/房间大屏）最小只读切片**。未接 RoomDataV、设计器、进房间详情。

### 本轮修改文件（任务 5A）

| 文件 | 修改内容 |
| --- | --- |
| `src/mock/fixtures/dataV.js`、`handlers/dataV.js`、`mock/index.js` | `POST /map/floor/screenV1` 及依赖：`GET /map/garden`、设备类型、告警统计空集、`PUT showRoom/batch` |
| `src/permission.js` | 额外放行 `/floorDataV` |
| `src/views/building/Building.vue` | demo 可进楼层大屏并带 `floorId` |
| `src/views/floorConfiguar/index.vue` | demo 仅允许跳转 `floorDataV` |
| `tests/unit/demo/dataV.spec.js` | screenV1 契约与 room 大屏仍拒绝 |
| `scripts/check-demo-browser.cjs` | 打开 FloorDataV、房间卡片、返回楼宇；RoomDataV 仍拦截 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项 |

### 验证结果

- `npm run test:demo -- --watch=false`：5 文件 / **18** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`floorDataV: true`；外网 0、异常 0。

### 契约判断

| 项 | 判断 |
| --- | --- |
| `POST /map/floor/screenV1` → roomList/roomData/floorDetail/roomCount/alarmCount | 源码确认（FloorDataV） |
| roomList[].data 探头字段 | 源码确认消费；数值为暂定演示 |
| `GET /map/garden` 树形 subDivisions | 源码确认（与 `/map/garden/list` 不同路径） |
| 告警统计空数组 | 合法空态，避免组件挂死 |

### 未验证 / 遗留

- RoomDataV、点房间进详情抽屉、真实告警曲线、15s 轮询业务含义、语音播报观感。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`（建议：房间只读详情，或另一张大屏）。

---

## 追加：任务 5B 已完成并停止（2026-09-24）

本轮完成：**平面图点房间打开 RoomDrawer 只读详情**。未接 RoomDataV、设计器保存、写操作。

### 本轮修改文件（任务 5B）

| 文件 | 修改内容 |
| --- | --- |
| `src/mock/fixtures/room.js`、`handlers/room.js`、`mock/index.js` | `GET /room/detail` 及关联只读：things/monitor/roomReport/thingsUser |
| `src/mock/fixtures/floor.js` | 演示房间 `isEdit: true`（可点开抽屉） |
| `tests/unit/demo/room.spec.js` | 详情契约、空关联列表、写接口仍拒绝 |
| `scripts/check-demo-browser.cjs` | 点房间开抽屉、断言详情、关闭回平面 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项 |

### 验证结果

- `npm run test:demo -- --watch=false`：6 文件 / **21** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`roomDrawer: true`；外网 0、异常 0。

### 契约判断

| 项 | 判断 |
| --- | --- |
| `GET /room/detail` → name/no/floorName/senorStatus/departmentName/createDate/status/id | 源码确认（RoomModule） |
| 关联列表可为空 | 源码可空态；本轮空数组/分页 |
| `isEdit: true` | 演示放开点开；非后端规范 |
| 走 RoomDrawer（非 New） | `openTwoSystem` 未置，源码分支确认 |

### 未验证 / 遗留

- RoomDataV、房间内写操作、巡查/硬件真实数据、设计器。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`（RoomDataV 或监控/告警切片）。

---

## 追加：5B 修复 — 单击房间名误跳首页（2026-09-24）

根因：平面图房间名单击走 `handleMouseDown` → `RoomView`（`/room/view`），demo 未放行该路由，被 `permission` 拦回 `/dashboard` 并提示「其他功能将分步接入」。状态图标/双击才走抽屉，演示房间无状态图标，用户单击文案必中此路径。

修复：demo 下 `handleMouseDown` 改为打开 RoomDrawer（与 5B 一致）；浏览器回归改为模拟房间名单击路径。

验证：`test:demo` 21 通过；`roomDrawer: true` 且停留在 `#/floor/view`。

---

## 追加：任务 6A 已完成并停止（2026-09-24）

本轮完成：**RoomDataV（设备监控大屏）最小只读切片**。未开放设计器、写操作、告警闭环。

### 本轮修改文件（任务 6A）

| 文件 | 修改内容 |
| --- | --- |
| `src/mock/fixtures/dataV.js`、`handlers/dataV.js` | `POST /map/room/screenV1` → instrumentCount/instrumentList/roomDetail |
| `src/permission.js` | 放行 `/roomDataV`、`/roomDataV/` |
| `src/views/building/Building.vue` | demo 可进设备大屏并带 `buildingId` |
| `src/views/floorConfiguar/index.vue` | demo 允许跳转 `roomDataV` |
| `tests/unit/demo/dataV.spec.js` | room screenV1 契约；设计器 API 仍拒绝 |
| `scripts/check-demo-browser.cjs` | 打开 RoomDataV、设备卡片、返回；未开放路由改断言 `/rm/room` |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项 |

### 验证结果

- `npm run test:demo -- --watch=false`：6 文件 / **22** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`roomDataV: true`；外网 0、异常 0。

### 契约判断

| 项 | 判断 |
| --- | --- |
| `POST /map/room/screenV1` → instrumentCount/instrumentList/roomDetail | 源码确认（RoomDataV） |
| instrumentList[].data 探头字段 | 源码确认消费；数值为暂定演示 |
| 告警统计空、设备类型空 | 复用 5A；合法空态 |
| 入口 buildingId / floorId | 源码确认 query 分支 |

### 未验证 / 遗留

- 房间筛选弹层 `/room/selectList`、真实告警曲线、语音播报观感、设计器。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`（监控/告警只读，或设计器只读预览）。

---

## 追加：全量 docs 进度复盘（2026-09-24）

- 当前实际进度：6A 最小展示切片；顶部 3B 为历史记录。详细结论见 `docs/progress-review-2026-09-24.md`。
- 本轮修改文件：新增上述报告，追加本 STATUS；未修改业务源码或 next-task-prompt。
- 验证：本轮重跑 demo 单测，6 文件 / 22 用例通过；核对关键 Mock、页面与浏览器脚本。根目录和平台均不是 Git 仓库。
- 未验证：本轮未重跑 Edge；历史外网 0 / 异常 0 不作为本轮观测。视觉、真实点击、筛选、竞态、长时间轮询、完整脱敏和生产构建未验收。
- 发现：showRoom/batch 空成功、roomIds 按数量截取、非法空间 ID 回落默认空间、跨页房间状态不一致；现有测试未覆盖这些行为。
- 设计决定：保留统一 Mock 与原接口消费结构，逐切片接页面；不整体重写 Vue 2，不将最小可展示等同完整业务。
- 下一步最小任务：先收口大屏只读边界，demo 禁用未实现控件、移除假成功保存并验证原展示路径；完成后停止。旧 next-task-prompt 的 6B 暂缓，待交接时按复盘重新限定。

## 追加：四项问题修复完成，移交 6B（2026-09-24）

用户本轮授权一次处理复盘四项问题；已完成，未开始 6B 或素材替换。

### 修改文件与结果

- `src/mock/handlers/dataV.js`：删除 PUT showRoom/batch 的空成功处理，统一拒绝未知写接口。
- `src/views/dataV/FloorDataV.vue`：demo 房间展示保存改为明确禁用入口；方法增加 demo 防护。`RoomDataV.vue`：禁用尚未接入的房间筛选弹层。非 demo 保持原入口与逻辑。
- `src/mock/fixtures/dataV.js`：设备卡片明确关联 roomId/floorId，按 ID 过滤而非数量截取；楼栋范围汇总楼层；非法 ID/冲突范围返回空集合，仅缺省参数使用默认空间；房间大屏状态读取 floor 共享种子，不按索引伪造异常。
- `tests/unit/demo/dataV.spec.js`：改为断言保存被拒绝；新增不同房间/重复或未知 ID/空选择、非法空间/范围冲突、跨页面状态和计数一致性测试。
- `scripts/check-demo-browser.cjs`：增加两个大屏禁用控件的 DOM 检查，保留全部隔离及主路径回归。
- 文档：更新 `docs/demo-guide.md`、`docs/next-task-prompt.md`，追加本 STATUS。复盘报告保留为修复前历史记录。

### 实际验证

- 单测：6 文件 / 25 用例通过。
- `npm run demo` 编译成功，本次分配本地端口 8090。
- 首次沙箱 Edge 回归 CDP Page.enable 超时；经提权重跑通过。登录、模型、平面、抽屉、双大屏、禁用控件、未开放路由和 API 拦截通过；外部请求尝试 0、未捕获异常 0。
- 未安装依赖、未连接原服务、未执行生产构建或部署、未推 Git。

### 设计决定与未验证项

- 演示只读保存应明确不可用，不伪造成功；房间筛选 API 语义已修正，但房间选择弹层及其 selectList 依赖仍未接入，因此保持禁用。
- 无效空间使用成功空集合的演示约定，非原后端规范；当前共享种子三个房间均正常，不在页面另造告警状态。
- 浏览器为路径烟测及 DOM 禁用检查，不等于完整视觉验收；仍未验证长时间轮询、模型竞态、所有筛选、全量脱敏及生产构建。
- GLB/SVG 仍是自建占位素材，本轮只提供选材建议。素材增强另开独立小任务。

### 下一步最小任务

6B 仅实现现有 AlarmThingStatistics 的合成历史告警排行：两条已存在统计接口，同源种子、类型/日期/探头筛选，明确计数验收。完整可复制提示词见 `docs/next-task-prompt.md`。不同时接告警处理、曲线、设计器或视觉美化；完成后停止。

---

## 追加：任务 6B 已完成并停止（2026-09-24）

本轮完成：**双大屏 AlarmThingStatistics 合成历史告警排行**。未接告警处理、曲线、设计器、素材美化。

### 本轮修改文件（任务 6B）

| 文件 | 修改内容 |
| --- | --- |
| `src/mock/fixtures/alarm.js` | 固定锚点 `2026-09-24` 同源历史事件；按 thingsType/日期/探头聚合 |
| `src/mock/fixtures/dataV.js`、`handlers/dataV.js` | 两个统计接口传入 body；去掉空数组桩 |
| `tests/unit/demo/alarm.spec.js` | 类型隔离、日期边界、探头过滤、空结果、同源计数（不自回显） |
| `tests/unit/demo/dataV.spec.js` | HTTP 排行/探头契约与认证；仍拒绝写接口 |
| `scripts/check-demo-browser.cjs` | Floor 排行名称/计数 + 近一周切换；Room 培养箱计数 |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项 |

### 验证结果

- `npm run test:demo -- --watch=false`：7 文件 / **30** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`alarmRank: true`；外网 0、异常 0。

### 契约与设计决定

| 项 | 判断 |
| --- | --- |
| `POST /alarm/thing/statistics` → alarmStatistics[].thingsName/alarmCount | 源码确认 |
| `POST /alarm/thing/sensors/statistics` → sensors[].sensorId/sensorName | 源码确认 |
| thingsType 11 / 4 | FloorDataV / RoomDataV 源码确认 |
| 历史事件 ≠ 当前 senorStatus | 房间/设备仍全部正常；排行仅读历史种子 |
| 相对日期锚点 | UI 近墙钟 end 映射到固定锚点，避免过几天近七天变空 |

### 未验证

- 自定义日期选择器完整交互、告警处理写闭环、图表视觉精细验收、长时间 15s 轮询、生产构建、GLB/SVG 换装。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`（设计器只读预览，或公共素材增强；二选一单独切片）。

---

## 追加：任务 7A 已完成并停止（2026-09-24）

本轮完成：**楼层平面设计器只读预览**。保存/拖拽配置禁用；`POST /map/element/config` 仍拒绝。未做房间设计器、素材换装、告警处理。

### 本轮修改文件（任务 7A）

| 文件 | 修改内容 |
| --- | --- |
| `src/permission.js` | 放行 `/floor/designer` |
| `src/router/index.js` | FloorDesigner 提到顶层（避免 SaaS 壳层未 Mock 接口） |
| `src/views/floorConfiguar/index.vue` | demo 可进入配置 |
| `src/views/floorConfiguar/Layout.vue` | demo 禁用保存/多选；拖拽提示只读；list 失败收尾 |
| `src/views/floorConfiguar/components/Designer.vue` | `resolveFloorMapUrl` 加载平面；demo 关闭画布拖拽 |
| `src/mock/handlers/floor.js` | `POST /room/list` 空列表（侧栏） |
| `tests/unit/demo/floor.spec.js` | room/list 空态；写接口仍拒绝 |
| `scripts/check-demo-browser.cjs` | 进设计器、见标记、保存禁用；`designerPreview` |
| `docs/STATUS.md`、`docs/demo-guide.md`、`docs/next-task-prompt.md` | 文末追加与下一项 |

### 验证结果

- `npm run test:demo -- --watch=false`：7 文件 / **30** 用例通过。
- `DEMO_PORT=8089 npm run test:demo:browser`：`designerPreview: true`；外网 0、异常 0。

### 设计决定

- 设计器与 `/floor/view` 同为顶层路由，避免主 Layout 轮询 logo/待办/消息等未接入接口。
- 只读：按钮 disabled + `handleSave` 早退 + 画布/侧栏不可改；写接口保持 MOCK_NOT_IMPLEMENTED。
- 侧栏 `room/list` 空列表合法（演示房间已在 overview.labList 上图）。

### 未验证

- 非 demo 保存全链路、房间设计器、自定义拖拽交互视觉、生产构建、GLB/SVG 换装。

### 下一步（未开始）

执行 `docs/next-task-prompt.md`（公共素材增强，或告警只读列表）。

## 追加：6B / 7A 复盘，7A 尚未通过只读验收（2026-09-24）

- 详细报告：`docs/review-task-7a.md`。新增该报告并追加本 STATUS，未修改业务源码。
- 本轮验证：7 文件 / 30 单测通过；内存固定 Date.now 复现自定义日期回映到九月历史事件。
- 发现：Designer 的 draggable=false 未用于实际 group（仍绑定 item.isEdit），拖动/缩放/编辑/删除缺少 demo 防护；顶层设计器路由无条件影响非 demo；告警 48 小时时间启发式会改写自定义绝对日期。
- 未验证：本轮未重跑浏览器、真实画布操作或非 demo 流程；现有浏览器脚本仅验证数据和保存按钮，不能证明画布只读。生产构建、全量脱敏、素材替换仍未完成。
- 决定与下一步：先单独修复 7A 画布只读与 demo 路由隔离，之后单独修正 6B 日期语义；暂缓现有提示词的 8A，不自动继续开发。

## 追加：三项复盘问题已修复（2026-09-24）

本轮按用户授权修复三项问题，未开始 8A。

### 修改文件

- `src/views/floorConfiguar/components/Designer.vue`：demo 图元不可拖动，不渲染 Transformer 与编辑弹窗；拖动、变形、编辑、删除等方法加只读保护，不修改共享 isEdit 种子。
- `src/router/index.js`：FloorDesigner 单一定义；仅 demo 放顶层，非 demo 放回 Layout.children（与 RoomDesigner 同级），路由匹配测试确认无重复 FloorDesigner。
- `src/mock/clock.js`：固定演示时钟与快捷日期范围。`src/mock/fixtures/alarm.js`：删除墙钟 48 小时重映射，绝对日期直接筛选；无时区日期按 UTC+8 解析，非法/倒序区间返回空。
- `src/views/dataV/components/AlarmThingStatistics.vue`：demo 初始化和快捷日期使用固定时钟，自定义日期保持原值；展示演示日期基准，demo 自定义时间使用 24 小时格式。非 demo 保留原日期路径。
- `tests/unit/demo/designer-route.spec.js`、`alarm.spec.js`、`dataV.spec.js`：demo/非 demo 路由匹配、墙钟变化、绝对日期、时区等价、边界、非法区间及 HTTP 默认路径回归。
- `scripts/check-demo-browser.cjs`：实际 Konva 节点不可拖动、无 Transformer、CDP 鼠标拖动/双击、编辑方法防护，验证图元和 Vuex 前后相同。
- 文档更新：STATUS、demo-guide、next-task-prompt；review-task-7a 保留为修复前历史记录。

### 验证

- 最终单测：8 文件 / 36 用例通过；此前 35 用例版本在 TZ=UTC 下也全部通过。
- 本地 8090 Edge 回归通过：包含新增画布只读交互检查，以及登录/楼宇/平面/抽屉/双大屏/告警排行/路由与网络隔离；外部请求尝试 0，未捕获异常 0。
- 路由测试暴露原表中 Gateway、AssetCount、Labdevice、Login 重名警告，非本轮新增；没有扩大范围修复。

### 未验证与决定

- 非 demo 仅验证路由匹配与源码条件分支，没有连接原服务验证保存全链路。
- 未做生产构建、完整视觉验收、全量脱敏、模型下载或素材替换；自定义日期选择器未逐项人工点击验收。
- 快捷日期以 2026-09-24 UTC+8 为明确演示基准，后端 Mock 不再猜测查询意图；历史告警与实时正常状态分开。
- 三项复盘阻塞已解决，可交接 8A；下一最小任务建议只改善一层 SVG，楼宇选材独立处理。完成后停止，不扩展业务。

## 追加：下载楼宇模型接入完成（2026-09-29）

用户授权先替换楼宇，SVG 等参考图。本轮只替换演示一号楼，二号楼和乙园区仍用占位模型。

### 修改文件

- `src/utils/demoModelUrl.js`：demo-building-a 映射用户提供的 `public/demo/models/office-building-low-rise.glb`。操作时文件已采用此名称，无需再次重命名；未修改 GLB 二进制。
- `src/views/building/Building.vue`：demo 按应用节点变换后的包围盒统一缩放到最大边 55，居中并落地；同步 OrbitControls 目标、相机位置，降低演示灯光强度并使用 sRGB 输出。非 demo 保留原变换与灯光路径。
- `public/demo/models/README.md`：记录作者 aitortilla01、原始来源与 GLB 内嵌 CC-BY-4.0 信息；区分第三方模型与自建占位模型，生成脚本不覆盖外部模型。演示楼层数据不代表模型真实楼层结构。
- `scripts/check-demo-browser.cjs`：断言实际加载 1423 三角面、贴图已解码、新资源 HTTP 200；支持可选 DEMO_SCREENSHOT 本地截图。
- 文档：追加 STATUS，更新 demo-guide。下一项仍等待用户提供 SVG 参考。

### 验证与未验证

- 8 文件 / 36 单测通过；隔离 demo 编译成功，本次端口 8091。
- Edge 完整回归通过：登录、实际模型/贴图、园区切换、楼层、抽屉、双大屏、告警排行与设计器只读；外部请求尝试 0、未捕获异常 0。
- 截图人工检查楼体完整、贴图可见、落地且无明显裁切；截图位于平台 node_modules/.cache/office-building-preview.png（临时验收产物）。
- 未修改平面 SVG、未安装依赖、未访问原服务或运行生产构建。未做全尺寸视觉验收、长时间显存压力测试；原品牌/背景素材仍待专门脱敏阶段处理。

### 下一步

等待用户的平面图参考，再执行单独 SVG 改善任务；不自动扩大业务或替换另外两栋楼。

## 追加：恢复环境色并提亮楼宇（2026-09-29）

- 按用户反馈修改 `src/views/building/Building.vue`：撤销全局 sRGB 输出和环境方向光强度修改，恢复原深蓝环境；仅 demo 楼宇材质增加与原贴图一致的轻微自发光补亮（0.3）。模型位置、视角与侧栏保持不变。
- 验证：本地 8091 Edge 回归通过，外部请求 0、异常 0；已查看新截图，环境恢复深蓝，楼宇外墙更亮。此次为局部视觉调整，未新增或重跑单测；未验证所有屏幕尺寸。
- 修改文件：Building.vue、本 STATUS；临时预览截图刷新。下一步仍等待 SVG 参考。

## 追加：默认楼宇显示放大（2026-09-29）

- 修改 Building.vue 的 demo 初始相机距离，沿原观察方向靠近约 13%，楼宇显示约放大 15%；未改变模型尺寸、光照和颜色。
- 本地 8091 Edge 回归通过，外部请求 0、异常 0；刷新截图用于检查边界。局部相机参数调整，未新增单测；未逐屏幕尺寸验收。
- 修改文件：Building.vue、本 STATUS。下一步仍等待 SVG 参考。

## 追加：8A 实验室底图与动态设备边界（2026-09-29）

- 用户提供办公楼俯视参考，要求减少桌椅、采用大型实验台与靠墙设备，并最终由 SaaS 配置设备布局、Mock 动态展示。按既定小步范围，本轮先完成底图，设备不烘焙入 SVG。
- 修改 `scripts/write-floor-svg.cjs`、生成 `public/demo/floors/floor-a-1f.svg`：两间实验室、中央走廊、大型固定实验台、墙边台面、门窗、楼梯、电梯及准备区；保留 1678×795 坐标系和资源 key。
- `src/mock/fixtures/floor.js`：同步三个房间标记坐标，保留 ID/名称及详情链路。`public/demo/floors/README.md` 记录台面坐标和静态/动态边界。
- `scripts/check-demo-browser.cjs` 支持 DEMO_FLOOR_SCREENSHOT，并在该模式用 1920×1080 桌面尺寸截取楼层。36 单测通过；Edge 全链路通过，外部请求 0、异常 0；实际检查桌面截图，底图与房间标记对齐。
- 小尺寸默认浏览器截图存在原画布裁切，1920×1080 正常；响应式画布全尺寸适配未在此任务改造。尚无设备图元、布局写入/持久化或动态设备状态，本轮不能宣称后台配置闭环完成。
- 真实源码：楼层设计器配置房间；roomConfiguar/Layout.vue 配置设备，读取 POST /map/element/getRoonInstrumentInfoList?roomId，保存 POST /map/element/config（type:4）。后续沿用真实契约，不在楼层 SVG 硬编码设备。
- 文档：更新 STATUS、demo-guide、next-task-prompt。下一步 8B 只接设备布局读取/预览和共享实体；8C 再做后台拖放保存、演示存储与刷新恢复。底图完成后停止，不提前开放写接口。

## 追加：首组设备 SVG 素材（2026-09-29）

- 用户授权绘制三种设备。本轮新增 `public/demo/devices/analyzer.svg`、`lab-refrigerator.svg`、`incubator.svg`，以及 `preview.html`、`README.md`。修改本 STATUS 和 next-task-prompt 的素材说明。
- 自绘统一 128×144 透明背景图标，冷灰蓝机身、轻微立体边缘；不包含业务名称、监控读数、告警状态。图标仅表达设备类别，不表示真实工程外形。
- 验证：三个 SVG 均可解析为 XML；本地 Edge 渲染预览并人工检查大图、48px 缩略和台面排列。截图为 node_modules/.cache/device-art-preview.png。素材变更未新增测试或重跑业务测试。
- 尚未接 Mock/路由/设备布局或保存。下一步仍是 8B，将素材 key 映射设备实体并独立叠加状态；位置、尺寸、旋转由布局数据提供。8C 再做后台保存，不将静态素材预览当业务完成。

## 追加：设备叠加到底图的效果预览（2026-09-29）

- 用户要求先看放置效果。新增 `public/demo/devices/floor-preview.html`：检测仪/培养箱放实验台，冷藏柜沿墙，复用原 SVG 底图并独立叠加图片，不修改业务页面或 Mock。
- 本地 Edge 渲染并查看截图 `node_modules/.cache/device-floor-preview.png`，检查设备落位与底图对齐；纯静态预览未跑业务测试。
- 此 HTML 坐标仅为视觉样例，不是设备布局数据源。动态状态、后台保存及 8B 仍未实现；后续按真实接口迁移到统一 Mock，不能把预览硬编码带入业务页面。

## 追加：补齐六类设备并更新平面预览（2026-09-29）

- 新增 `public/demo/devices/oscilloscope.svg`、`monitor-terminal.svg`、`equipment-rack.svg`，延续 128×144 透明底和冷灰蓝风格；示波器示意线条是图标装饰，不代表实时曲线。
- 更新同目录 `preview.html`、`floor-preview.html`、`README.md`。台面放检测仪/示波器/监测终端，左右墙边分别排列冷藏柜/培养箱/设备机柜，预览共 16 台。
- 六个 SVG XML 解析通过；本地 Edge 渲染平面预览并检查实际落位。截图更新为 node_modules/.cache/device-floor-preview.png。静态素材任务未重跑业务测试。
- 业务源码、底图、Mock 和保存接口未修改；8B 动态数据接入仍待后续，预览不等于后台布局完成。

## 追加：8B 交接提示词收紧（2026-09-29）

- 用户确认六类设备效果后，更新 docs/next-task-prompt.md：完整可复制任务包含六类素材与摆放基准、共享设备 ID/告警引用、房间坐标转换、明确入口、只读边界及验收路径。
- 将动态 Mock 限定为最小可重复的正常/异常/离线场景切换，通过共享层让平面与设备大屏一致；不做持续推送或布局写入。8C 才处理拖放保存与持久化。
- 本轮仅修改提示词和本 STATUS，未实施 8B，未运行代码测试。下一步交给执行者按该提示词处理单项任务。

## 追加：8B 房间设备布局只读接入（2026-09-29）

- 目标：现有房间平面预览接入统一 Mock 设备实体与布局；可发现入口；最小场景切换；布局只读。未做拖放保存/持久化（留给 8C）。
- **契约与坐标**
  - 读：`POST /map/element/getRoonInstrumentInfoList?roomId=` → `items.list`（x/y/rotation/scaleX/scaleY/url/status/isMonitor/types/sortIndex/isEdit/elementId）+ `board` + `simpleEquipmentList`。
  - 写：`POST /map/element/config` 仍 `MOCK_NOT_IMPLEMENTED`。
  - 房间画布 1600×790；楼层 1678×795；Lab A `78,78,762×327`、Lab B `840,78,760×327`。预览百分比经 `floorPctToRoomLocal` 转入房间局部坐标，不用全楼层底图当房间背景。
  - 状态：RoomView `status` 1 / -1 / -100；RoomDataV `senorStatus` 1 / 2 / -100；由共享 `scenario`（normal/alarm/offline）派生。
- **修改文件（平台）**
  - Mock：`fixtures/instrument.js`、`fixtures/scenario.js`、`fixtures/dataV.js`（大屏改读共享实体）、`handlers/instrument.js`、`mock/index.js`。
  - 资源：`scripts/write-floor-svg.cjs` 生成 `room-a.svg` / `room-b.svg`；`utils/demoDeviceUrl.js`、`utils/demoRoomMapUrl.js`。
  - API：`api/demoScenario.js`。
  - 视图：`roomConfiguar/index.vue`、`ImageNode.vue`；`floorConfiguar/index.vue`（入口+场景）；`room/components/RoomModule.vue`（抽屉入口）；`permission.js` 放行 `/room/view`。
  - 测试：`tests/unit/demo/instrument.spec.js`；更新 `dataV.spec.js`；`scripts/check-demo-browser.cjs`（进入/返回布局 + 场景后大屏计数）；文档 STATUS / demo-guide / next-task-prompt；floors/devices README。
- **共享实体**：保留告警引用 ID 970001–970003；新增 970004–970012；六类素材覆盖两间实验室；走廊无布局；一设备一房间。
- **验证**
  - `test:demo`：9 文件 / **41** 用例通过。
  - `test:demo:browser`（端口 8088）：全链路通过；外部请求 0、未捕获异常 0。
  - 1920×1080 截图 `node_modules/.cache/device-room-layout.png`：房间 A 裁切底图、台面/墙边设备与绿色状态点对齐。
- **未验证 / 边界**
  - 未开放布局写入、刷新持久化、RoomDesigner 拖放。
  - 设备详情抽屉因 `isEdit=0` 禁用；小屏画布适配未改；持续推送/监测曲线未做。
  - 历史告警事件不随场景改写（有意）。
- **下一步**：8C 受限写接口、演示命名空间持久化、重置与跨页同步。底图与只读接入完成后停止，不提前宣称后台配置闭环。

## 追加：8C 设备布局拖放保存与演示持久化（2026-09-29）

- 目标：在 8B 只读布局上开放受限 type:4 写入、命名空间持久化、重置；场景切换仍不改坐标。未做多租户 SaaS 或侧栏增删设备。
- **契约**
  - 写：`POST /map/element/config` 接受设备数组（`type:4`、`elementId`、`mediaId/roomId`、`x/y/rotation/scaleX/scaleY/sortIndex`）；校验归属与画布范围；须提交该房间全部已上图设备。
  - 重置：`POST /demo/room-layout/reset` `{roomId}` → 清除覆盖，读回种子。
  - 拒绝：`type:11`、未知 ID、跨房间、缺设备、越界、空列表。
  - 持久化键：`smart-facility-demo:v1:roomLayoutOverrides`。
- **修改文件**
  - Mock：`fixtures/instrument.js`（覆盖合并/保存/重置）、`handlers/instrument.js`；`api/demoLayout.js`。
  - 路由/权限：demo 下 `/room/designer` 提到壳外（与楼层设计器一致）；`permission.js` 放行。
  - UI：`roomConfiguar/index.vue`（进入配置）、`Layout.vue`（跳过 instrument/list、重置、保存）、`Designer.vue`（demo 底图/设备 URL、禁删）。
  - 测试：`instrument.spec.js`、`floor.spec.js`、`dataV.spec.js`、`designer-route.spec.js`、`check-demo-browser.cjs`（保存→重进→重置）。
  - 文档：STATUS、demo-guide、next-task-prompt。
- **验证**：`test:demo` 9 文件 / 42 用例；Edge 全链路通过，外部请求 0、异常 0（端口 8091）。
- **未验证**：真实鼠标拖拽手感、小屏适配、设备详情抽屉、楼层标记写入、侧栏新增设备。
- **下一步**：等待用户指定方向（品牌脱敏、其他楼宇等）；不自动扩大范围。

## 追加：8B / 8C 复盘（2026-09-29）

- 新增 docs/review-task-8bc.md，追加本 STATUS；本轮没有业务修改。
- 9 文件 / 42 单测重跑通过；内存复现左侧旋转设备边界 x=-19，且保存接受 scaleX=100、重复设备、x=-40。
- 发现：中心/左上角旋转语义不一致；图标和房间比例被拉伸；保存只验坐标点不验完整几何、覆盖缺校验；设计器状态 -1/-100 落为黑色；浏览器保存测试直接改数组而非拖动，未验证布局整页刷新恢复。
- 未验证：本轮未重跑 Edge 或真实鼠标、未做生产构建/原服务验证。历史通过记录只证明有限路径。
- 决定：暂不按“8C 全部验收”扩展下一业务；先修坐标与受限保存，并补真实拖动→保存→刷新→重置。随后单独优化完整房间边界、等比适配和状态信息展示。

## P1 修复验收（2026-09-29）

- 修改文件（平台目录内）：新增 src/utils/demoLayoutGeometry.js；修改 src/mock/fixtures/instrument.js、src/views/roomConfiguar/index.vue、src/views/roomConfiguar/components/Designer.vue、src/views/roomConfiguar/components/ImageNode.vue、tests/unit/demo/instrument.spec.js、scripts/check-demo-browser.cjs。本轮同时更新 STATUS、review-task-8bc、demo-guide、next-task-prompt。
- P1 几何：演示设备改为中心坐标及中心旋转，按 SVG 的 128×144 比例显示；底图和种子设备采用同一等比映射；设计器视口变化不再重写演示逻辑坐标。
- P1 校验：拖动和变换结束时校验完整旋转包围盒，非法操作回退；保存拒绝重复设备、冲突房间、非有限数值、无效顺序、非正/过大缩放和越界；读取持久化记录复用相同校验。
- 设计决定：缩放范围 0.2–3；缓存使用 version:2 的 rooms 信封。旧版左上角坐标缓存及损坏记录回退种子，不做有歧义的自动迁移；首次重新保存使用新版。只改变演示分支。
- 验证：9 文件 / 53 单测通过；本机 8090 开发编译成功；Edge 真实鼠标拖动→保存→返回→整页刷新恢复→重置回归通过，外部请求 0、未捕获异常 0。截图检查左侧三台设备完整显示、图形等比。
- 未验证：人工连续缩放/旋转手感、触屏和小屏、原服务/生产构建；原有重复路由警告仍存在。
- 下一步最小任务：单独修复设计器状态 -1/-100 的颜色映射（P2），与房间只读视图一致；需用户确认后开工。房间墙体视觉完善不纳入本轮。
- Git：按用户要求跳过初始化、提交和推送，回复提供本轮 commit 信息。

## 首次提交忽略规则（2026-09-29）

- 用户已在根目录初始化 Git；当前实际目录只有 smart-facility-platform 和 docs，facility-miniapp 尚未放入。
- 修改：新增根 .gitignore，排除各项目依赖、构建输出、缓存、日志、编辑器文件、环境文件、证书及本地小程序配置；排除旧 backupSuite 工具目录。平台 .gitignore 移除 yarn.lock 忽略，允许保留依赖锁文件。
- 单独放行平台 .env.demo：以白名单核验其仅含本地演示设置，不记录真实环境值。未修改业务代码或环境文件。
- 验证：git check-ignore 验证依赖、生产/开发环境、小程序私有配置和构建目录；808 个候选文件中无上述敏感路径、无大于等于 50 MiB 的文件；暂存区为空。
- 限制：忽略规则不等于源码全量脱敏。尚未对所有候选源码、文档及二进制素材完成提交前内容审查，小程序也尚未审查。
- 下一最小任务：首次暂存前审查候选文件中的硬编码凭据、内部地址、真实业务资料及素材授权；本轮未暂存、提交、设置远程或推送。

## P2 状态颜色修复（2026-09-29）

- 修改文件：平台新增 src/utils/demoDeviceStatus.js、tests/unit/demo/device-status.spec.js；修改 src/views/roomConfiguar/index.vue 和 components/Designer.vue；更新 STATUS、review-task-8bc、next-task-prompt。
- 设计决定：演示房间只读视图和设计器共用 status 映射：1 绿色、-1 红色、-100 灰色；未知值保守显示灰色。不能把大屏 senorStatus=2 的告警约定混用到房间布局。非演示分支保留原有逻辑。
- 验证：10 文件 / 57 单测通过，覆盖三种场景接口状态及字符串状态、未知值兜底；原有重复路由警告仍存在。
- 未验证：本轮未重跑浏览器和人工视觉检查；P1 阶段的真实拖动、保存、刷新、重置通过记录仍有效，但不声称覆盖真实旋转/缩放手势。
- 下一最小任务：补设计器真实旋转/缩放手势和非法操作回退的浏览器断言；房间墙体、状态点方向及信息布局美化另行安排，不自动扩展。未执行 Git 暂存、提交或推送。

## 真实变换交互补验（2026-09-29）

- 修改：scripts/check-demo-browser.cjs；同步 STATUS、review-task-8bc、next-task-prompt。未修改业务代码。
- 新增：鼠标拖动 bottom-right 控制点缩放、rotater 控制点旋转；断言 scale 和 rotation 实际变化。真实拖到房间外后同时核验 Vuex 逻辑几何和 Konva 节点几何回退；保存并整页刷新后核验 x/y/rotation/scaleX/scaleY 全部恢复。测试只读取节点几何定位控制点，不直接写数组或触发业务回调模拟变换。
- 验证：本机 8092 演示编译成功，完整 Edge 浏览器回归通过，外部请求 0、未捕获异常 0，包含既有重置链路。此次仅补浏览器测试，未重复运行此前已通过的 57 项单测。
- 未验证：触屏、小屏、负缩放和超大缩放的真实鼠标回退；这些异常数据的保存拒绝已有单测覆盖，但不等价于手势验收。
- 下一最小任务：房间视图完整墙体/门窗背景和画布信息布局方案，先确定视觉范围再改动，不扩展设备详情或新业务。Git 首次提交前内容审查仍待处理。未提交或推送。

## 房间建筑边界与默认视图优化（2026-09-29）

- 修改：scripts/write-floor-svg.cjs、public/demo/floors/room-a.svg、room-b.svg、src/views/roomConfiguar/index.vue；同步 STATUS 和 next-task-prompt。生成器同时重生成楼层 SVG，其内容规则未变。
- 补充房间内侧墙边、四组窗户、入口虚线和实验操作区标识；保留裁切原点、尺寸和所有设备坐标，已有 version:2 布局无需迁移。底图只有建筑和固定实验台，设备仍由 Mock/Konva 动态提供。
- 只读演示画布根据浏览器可用宽高计算等比尺寸，覆盖旧 CSS 默认 1.12 倍放大，防止适配后再次裁切；非演示原逻辑保留。
- 验证：57 单测通过；完整本地 Edge 回归通过（含真实旋转/缩放、越界拖动、保存刷新与重置），外部请求/未捕获异常均 0；1920×1080 截图确认房间 A 墙边完整、窗户可见、左右留白。截图位于平台 node_modules/.cache/room-visual.png，不提交。
- 未验证：房间 B 单独截图、触屏、多种窄屏尺寸、用户滚轮放大后的边界。此次没有扩展设备详情或状态统计。
- 下一最小任务：增加只读房间正常/告警/离线数量及清晰图例，基于已加载设备数据计算；等待用户继续指示。Git 审查仍待处理，未提交或推送。

## 房间状态数量与图例（2026-09-29）

- 修改：平台 src/views/roomConfiguar/index.vue、src/utils/demoDeviceStatus.js、tests/unit/demo/device-status.spec.js；同步 STATUS、next-task-prompt。
- 演示只读房间顶部新增当前显示设备数、正常/告警/离线数量及颜色图例；计数从当前 deviceList 派生，跟随列表及场景更新，不增加接口或页面硬编码数据。未知状态独立计数，存在时才显示；空列表全部为零。图例复用状态点颜色映射。
- 验证：10 文件 / 58 单测通过，新增混合状态及空列表计数测试；本地 Edge 全量回归通过，外部请求与未捕获异常均为 0；1920×1080 截图检查统计条位于工具栏下方，不遮挡房间图。
- 未验证：多尺寸视觉检查、每个筛选与每个场景的统计 DOM 专项断言；现有浏览器场景验证仍检查设备数据变化。
- 下一最小任务：只读房间设备悬停卡，显示设备名称、状态及现有 Mock 已提供的监测值；编辑模式不弹卡，避免干扰布局。未提交或推送 Git。

## 房间设备悬停卡（2026-09-29）

- 修改：平台 src/views/roomConfiguar/index.vue、scripts/check-demo-browser.cjs；同步 STATUS、next-task-prompt。
- 仅演示只读房间增加设备悬停信息卡，显示名称、状态、已有 simpleEquipmentList.sensors 的值及单位，并标注演示数据；离线或无数据时显示暂无读数。不新增接口，不在页面写死读数。
- 卡片不捕获鼠标事件，移出设备、筛选、切换场景、调整窗口、滚轮及触摸开始时关闭；按视口限制弹出位置。编辑器未添加悬停卡。
- 验证：58 单测通过；Edge 真实鼠标进入设备后显示正常状态及已有温度值，移开关闭，完整回归通过，外部请求和未捕获异常均为 0。脚本补充图片加载等待，避免图标未绘制时提前命中。
- 未验证：离线卡片、无读数、边缘设备和窄屏的专项浏览器断言，触屏无悬停交互。现有设备传感器种类仍按既有演示契约显示，未扩写业务读数。
- 下一最小任务：楼层只读平面图的房间悬停卡，复用房间及设备状态统计，保持房间点击入口。未提交或推送 Git。

## 楼层房间悬停卡（2026-09-29）

- 修改：平台 src/views/floorConfiguar/index.vue、src/mock/fixtures/floor.js、tests/unit/demo/floor.spec.js、scripts/check-demo-browser.cjs；同步 STATUS、next-task-prompt。
- 楼层只读演示视图在房间名称及状态标记上增加悬停卡，显示房间名称、设备总数、正常/告警/离线数量，未知状态独立显示。Mock 楼层响应新增 deviceSummary，从共享房间设备数据和状态统计函数派生，空房间为零；未新增真实接口依赖。
- 悬停卡不拦截指针，保留原房间点击处理；演示状态标记不再触发旧悬停监测面板，避免重复弹层。移开、切换场景、调整窗口、触摸或滚轮时关闭。编辑器不添加弹卡。
- 验证：10 文件 / 59 单测通过，覆盖三种场景与空房间；完整 Edge 回归通过，新增实际鼠标经过房间名称时显示 6 台正常设备、移开关闭断言，外部请求与未捕获异常均为 0。
- 未验证：状态图标命中的专项断言、窄屏/触屏、长房间名和悬停卡边缘视觉截图；不能据此声称全尺寸验收。
- 下一最小任务：专项验证两级悬停卡的告警/离线/空房间及边缘显示，完成交互收尾后再扩展其他业务。Git 首次提交前内容审查仍待处理；未提交或推送。

## 中控地图演示收尾（2026-09-29）

- 修改：scripts/check-demo-browser.cjs、STATUS、next-task-prompt；无业务变更。
- 新增验证：两级悬停卡正常/告警/离线、空房间 0 台、离线暂无读数及右下角定位，完整 Edge 回归通过，外部请求和未捕获异常均 0。鼠标悬停为真实输入；场景调用现有页面方法；边缘为合成坐标传入定位函数，不代表真实边缘设备命中。此前 59 单测未重复运行。
- 结论：当前桌面中控地图演示切片收尾，不代表全量 SaaS 完成。触屏、窄屏、全部边角与缩放越限手势仍未全面覆盖；其他楼宇素材占位、楼层布局写入、设备增删仍有限制。
- 下一模块：建议智能监控，第一小步仅设备只读详情 Mock 与地图点击衔接；随后分开做历史曲线和告警处理。全量脱敏与 Git 提交前审查仍待处理。未自动开工下一模块，未提交或推送。

## 设备只读详情（2026-09-29）

- 修改：`src/mock/fixtures/instrument.js`、`handlers/instrument.js`、`views/roomConfiguar/index.vue`、`tests/unit/demo/instrument.spec.js`、`scripts/check-demo-browser.cjs`；同步 STATUS、next-task-prompt。
- 入口：只读房间复用现有 `LabDeviceDrawer`（布局列表 `openTwoSystem: true`）；演示点击改为打开详情，不再提示「进入配置」。编辑模式布局操作未改。
- Mock 最小范围：`GET /instrument/detail`、`GET /monitorIndicator/getOpenMonitorFlag`、`GET /monitorIndicator/getMonitorFlag`；为抽屉挂载补空壳 `GET /monitorIndicator/monitorInfo`（空数组）与 `POST /instrument/reservation/schedulerList`（空分页）。传感器读数与悬停卡共用 `sensorReadingForInstrument`；离线不伪造实时正常值；`logoUrl` 留空避免外链图片。
- 明确未做：历史曲线真数据、告警处理、设备增删、真实控制；空 `monitorInfo` 仅防未知请求，不称为完整监控。
- 验证：10 文件 / 61 单测通过；完整 Edge 回归通过（悬停→点击开抽屉→关闭→切换设备、离线空读数），`deviceDetail: true`，外部请求与未捕获异常均为 0。
- 未验证：抽屉内编辑/预约/维保按钮、触屏点击、窄屏抽屉布局、历史曲线图表视觉。
- 下一最小任务：设备历史曲线（真实分段 Mock + MonitorInfo 接入，不顺带做告警处理）。全量脱敏与 Git 提交前审查仍待处理；未提交或推送。

## 设备历史曲线（2026-09-29）

- 修改：`src/mock/fixtures/instrument.js`、`handlers/instrument.js`、`tests/unit/demo/instrument.spec.js`、`scripts/check-demo-browser.cjs`；同步 STATUS、next-task-prompt、demo-guide。
- 入口：复用详情内现有 `MonitorInfo` → `GET /monitorIndicator/monitorInfo`；无页面硬编码业务 JSON。
- Mock：按 `interval` / `beginTime+endTime` / `historyTimeInterval` 生成固定时钟（`DEMO_NOW_MS`）下的可控序列；告警场景抬升读数；离线返回 `[]`。详情监测标签增加「演示湿度」便于切换传感器。`historyPage` 仅空表桩，避免对话框 501；导出接口仍未接入。
- 明确未做：历史检索表真数据、导出、告警处理、房间 type:3 曲线、真实控制。不把本切片称为完整监控历史。
- 验证：10 文件 / 62 单测通过；完整 Edge 回归通过（开抽屉有曲线、切 7 天加长、切湿度换序列、离线空曲线），`deviceHistory: true`，外部请求与未捕获异常均为 0。
- 未验证：30/90 天分段并发的浏览器专项、自定义日期选择器、查看历史对话框检索、触屏/窄屏图表。
- 下一最小任务：告警列表与处理闭环（最小只读列表 + 单条处理 Mock，不顺带扩写全量 SaaS）。全量脱敏与 Git 提交前审查仍待处理；未提交或推送。

## 告警列表与处理闭环（2026-09-29）

- 修改：`src/mock/fixtures/alarm.js`、`handlers/alarmLog.js`、`handlers/auth.js`、`mock/index.js`、`fixtures/auth.js`、`permission.js`、`tests/unit/demo/alarm.spec.js`、`scripts/check-demo-browser.cjs`；同步 STATUS、next-task-prompt、demo-guide。
- 入口：开放 `/sys/a/log`，复用现有 `alarmLog` + `AlarmProcessing`；菜单增加「系统 / 报警记录」。
- Mock：`POST /monitorIndicator/historyAlarmRecord/summary`（设备 thingsType:4 种子）、`POST /monitorIndicator/exceptionHandle/batch`（处理写回 session 存储）、`GET /alarm/errorList`、`GET /monitorIndicator/allSensorType/v2`。Layout 壳补空桩（logo/未读/消息/待办），避免 Navbar 挂载 501。导出仍未接入。
- 明确未做：报警导出、实时推送、全量工单/审批、房间侧报警列表、批量以外的复杂筛选验收。不把本切片称为完整告警体系。
- 验证：10 文件 / 63 单测通过；完整 Edge 回归通过（列表加载、单条处理刷新为已处理），`alarmLog: true`，外部请求与未捕获异常均为 0。
- 未验证：批量多选处理专项、导出按钮、窄屏/触屏、菜单文案 i18n 全覆盖。
- 下一最小任务：建议演示收尾——全量脱敏与首次 Git 提交前内容审查；或用户指定的下一业务切片。未自动开工；未提交或推送。

## 智能监控复盘（2026-09-29）

- 新增 review-monitoring.md，更新 STATUS、next-task-prompt；无业务修改。
- Git 已有基线 f9eaaea，监控相关功能为未提交增量，含未跟踪 alarmLog handler；“首次提交”说法已过时，应称下一次提交前审查。
- 重跑 10 文件 / 63 单测通过，本轮未重跑浏览器。发现三项 P2：多选告警处理日期缺初始化及校验、非法历史范围静默回退、缓存 patch 可覆盖告警身份字段；证据和限制见复盘文档。
- 下一最小任务改为修复上述边界并补验证，随后做脱敏/提交前内容审查，不直接扩展业务模块。未提交或推送。

## 智能监控三项边界修复（2026-09-29）

- 修改：`AlarmProcessing.vue`（每次 open 初始化日期/类型，提交校验）；`fixtures/alarm.js`（sanitize + batch 拒绝非法写入）；`fixtures/instrument.js`（非法显式范围失败）；`components/MonitorInfo/index.vue`（30/90 天用 DEMO_NOW）；`instrument.spec.js` / `alarm.spec.js`；同步 STATUS、review-monitoring、demo-guide、next-task-prompt。
- 验证：`npm run test:demo -- --watch=false` → 10 文件 / **64** 用例通过。本轮未重跑浏览器。
- 未验证：多选处理真实点击、自定义非法日期选择器 UI、触屏/窄屏、生产构建。
- 下一最小任务：提交前内容审查与脱敏准备（见 next-task-prompt）；不自动扩展业务、不自动提交。

## 三项修复复核与补强（2026-09-29）

- 接手时已有初步修复，保留表单初始化/提交校验、固定演示时钟和缓存白名单。本轮修改 clock.js、fixtures/instrument.js、fixtures/alarm.js、instrument.spec.js、alarm.spec.js 及复盘文档。
- 共享严格日期解析拒绝不存在日期（包括带时区日期）；离线也先校验显式范围。告警写入拒绝非法或重复编号，不再过滤后部分成功；拒绝对象型文本，缓存字段类型非法则回退种子。
- 最终 10 文件 / 64 单测通过，扩展现有用例验证非法写入不改变存储、批量成功、损坏缓存回退。完整 Edge 回归通过，详情/曲线/告警链路通过，外部请求和未捕获异常均 0。最后调整离线范围校验顺序后重跑单测，浏览器成功记录对应本轮此前版本。
- 未验证：真实多选处理点击、自定义日期 UI、触屏/窄屏。浏览器覆盖单条处理，不能把批量数据层测试称作完整点击验收。
- 下一步：补多选处理浏览器专项，再做提交前内容审查；不扩展新模块。未提交或推送。

## 多选告警处理浏览器验收（2026-09-29）

- 修改 scripts/check-demo-browser.cjs、STATUS、next-task-prompt；无业务代码变更。
- 使用实际鼠标依次点击两行复选框、批量处理、确认；不直接改选中数组或提交表单数据。验证两条 ID、固定演示时间、清空上次处理内容，以及提交刷新和整页重载后两条记录均保持已处理。
- 修正测试点击时序：滚动至可见区域后等待稳定，再读取坐标；初次测试坐标过早导致复选框未命中，不是业务批量处理故障。保留浏览器求值的具体错误信息，便于定位既有测试时序问题。
- 最终完整 Edge 回归通过，外部请求及未捕获异常均 0。此前 64 单测通过，本轮仅测试脚本/文档变更未重跑单测。触屏、窄屏、自定义日期选择器及导出仍不属于此次验收。
- 下一任务：提交前内容审查与脱敏准备，不扩展业务功能；未暂存、提交或推送。提交说明应覆盖未提交的设备详情、历史曲线、告警闭环及边界修复增量，不能仍称首次初始化。

## 仓库内容审查第一轮（2026-09-29）

- 开始时工作区干净，当前 5984e07 已提交智能监控增量，旧“未提交增量”记录是历史状态。共 812 个跟踪文件，小程序未放入。
- 新增 precommit-content-audit.md，更新 STATUS、next-task-prompt；仅文档修改，无脱敏、业务/素材修改、暂存、提交或推送。
- 确认：非空地图 Key 在当前源码及两个既有提交中存在；README/代理/上传目标、品牌/客户定制引用、业务记录样例仍需处理。仅记录路径和类型，未输出真实值，未测试凭证有效性。
- env 仅演示配置被跟踪且白名单检查通过；原环境文件和 backupSuite 被忽略。28 份 XLS 仍被跟踪，未解析内容。完整清单含保留/替换/删除/待核实分类及文件依据。
- 验证：Git 状态/文件清单、静态文本模式、env 键与白名单、ignore、历史指定文件检查；未联网、未重跑单测/浏览器、未运行生产脚本。图片/字体/XLS 深度内容及权属、远程可见性和推送状态未核实。
- 下一最小任务：用户指定后先处理地图原 Key、服务/上传目标及文档地址；历史处理与凭证轮换另行明确，不自动重写历史。其后再分批文本品牌、素材与模板。第一轮审查已停止。

## 第一批配置与地址脱敏（2026-09-29）

- 修改：`TransportMap.vue`（移除字面量地图 Key；演示或空 Key 不调用外部地图 loader，展示未接入提示）；三处上传组件（去掉硬编码上传目标，选择文件即提示不可用并中止，不伪造成功）；`README.md`（改为演示启动/限制说明）；`vue.config.js`（本机代理占位加注释）；更新 `precommit-content-audit.md`、本 STATUS、`next-task-prompt.md`。保留审查清单文档中既有未提交增量（precommit 文档本身）。
- 设计决定：上传组件保留结构与接口引用形状，仅切断外发；地图不内嵌任何 Key，非演示若需地图须自行通过未跟踪 env 提供，演示永不加载 SDK。不改 Vue 2、Mock 与已接通演示路由。
- 验证：`npm run test:demo -- --watch=false` → 10 文件 / **64** 用例通过；`DEMO_PORT=8088` 完整 Edge 回归通过，`externalAttempts: 0`，`uncaughtExceptions: 0`，`cspBlocksExternal: true`。静态扫描工作区已无原地图 Key 字面量与原上传主机字面量。
- 未验证：运输地图页浏览器专项（演示路由未开放该页）、上传组件点击专项 UI 断言、凭证是否仍有效、远程是否已推送、Git 历史是否仍含 Key（已知历史提交仍含，本批未改历史）。
- 明确未做：不重写历史、不轮换凭证、不处理 P2 品牌/package 元数据/素材/XLS/客户定制分支；不自动提交或推送。
- 下一最小任务：第二批统一项目元数据与文本品牌（package / i18n / 客户定制路径 / 注释地址），验证锁文件；再单独处理素材与模板。等待用户指定后开工。

## 第一批脱敏复盘（2026-09-29）

- 新增 review-sanitization-batch1.md，更新 STATUS；保留其他 AI 所有业务改动，未直接修复。
- 本轮 64 单测通过，未重跑浏览器。地图 loader 阻断、三处上传前置阻断及 README 方向正确，但 Inspected.vue:74 的检测完成确认仍会请求接口，建议补提示/禁用和专项验证后确认本批提交。
- 智能硬件 /lhd/hardware/home 未在演示白名单，截图返回首页提示符合当前范围；房间设备详情/曲线不等于整个智能硬件模块开放。
- 不能确认公开推送安全：历史 Key 未清除，品牌/素材/XLS 等仍未完成脱敏。提交说明可沿用但先补上述入口；未暂存、提交或推送。下一最小任务优先补此 P2，而非直接展开第二批。

## 检测报告确认入口修复（2026-09-29）

- 修改 Inspected.vue：移除检测完成 API 引用，handleSubmit 仅提示上传未接入并返回 false，不改 loading、不关闭弹窗、不发出成功刷新事件。
- 新增 tests/unit/demo/inspected-unavailable.spec.js，覆盖选文件拒绝、确认拒绝、成功回调不伪造完成，即使有残留文件名也不调用检测完成接口。
- 验证：11 文件 / 65 单测通过；本轮未运行未开放检测页的浏览器专项。其余业务改动保留。
- 本批该 P2 已解决，可使用第一批脱敏提交说明；公开推送仍受历史 Key 和后续脱敏待办限制。未暂存、提交或推送。下一最小任务为第二批项目元数据和文本品牌，需用户指定后开始。

## 第二批项目元数据与文本品牌（2026-09-29）

- 修改：`package.json` / `package-lock.json` 根名称与作者、去掉内部仓库字段、license 标为 UNLICENSED；`i18n` 中英文品牌文案；Building/Dashboard/Navbar/Login/permission 及若干选择器回退公司名；删除客户登录路由与失效/退出时的客户跳转；`floorConfiguar` 去掉客户专用布局与配色分支；`labDevice` 注释去掉外部文档地址；`UpkeepPlan` 改为合成样例；TransportMap 内硬编码轨迹样例改为合成坐标；`iconfontSource/iconfont.json` 仅改 name 元数据。同步审查清单、本 STATUS、next-task-prompt。
- 设计决定：保留 Vue 2 与现有接口路径（含 `/map/runpengData`）；不重命名 `ChuxouUpload` 组件目录以免大范围改引用；不换品牌 PNG/XLS；不重写历史。
- 验证：`npm run test:demo -- --watch=false` → 11 文件 / **65** 用例通过；重启演示服务后 `DEMO_PORT=8088` 完整 Edge 回归通过，`externalAttempts: 0`，`uncaughtExceptions: 0`。（中途一次失败疑为热更新残留，干净重启后复测通过。）
- 未验证：维保页/运输地图浏览器专项、客户旧登录 URL 书签、素材视觉与 XLS 内容、历史提交中的品牌与 Key。
- 明确未做：素材与模板批、组件文件重命名、历史清理、暂存/提交/推送。
- 下一最小任务：第三批图像/字体/XLS 及授权（单独处理）；等待用户指定。

## 第二批已提交复盘（2026-09-30）

- 复盘 fc7f35f，新增 review-sanitization-batch2.md；仅文档修改。元数据/锁文件一致，依赖节点未变，65 单测重跑通过，未重复浏览器回归。
- 无需回退本批；发现一项 P2：中英文微信公众号文案将未接入能力表述成演示可用，应另作小提交明确未接入，保持键名和功能范围。
- 客户专用死 helper 可后续清理；运输轨迹修改为硬编码数组而非仅注释，文档描述需校正。第三批素材/XLS 与历史 Key 仍待处理，不据此批准公开推送。
- 下一最小任务先修微信文案，再安排第三批素材审查；未改业务或提交推送。

## 微信未接入文案修正（2026-09-30）

- 修改：`i18n` zh/en 的 `system.bindWechat1–7` 与 `login` 扫码相关文案，统一标明本演示未接入微信绑定/公众号登录/提醒；保留键名与 User/Login 结构，不新增微信服务、不开放系统用户页。校正 STATUS/审查清单中运输轨迹为「硬编码样例」表述；更新 review-sanitization-batch2、next-task-prompt。
- 验证：`npm run test:demo -- --watch=false` → 11 文件 / **65** 用例通过；未重跑浏览器（登录页文案变更，账号登录链路未改行为）。
- 未验证：系统用户页微信绑定 UI 点击、扫码面板真实交互。
- 下一最小任务：第三批图像/字体/XLS 及授权审查；客户专用死 helper 可顺带清理但不阻塞。等待用户指定。

## 第三批图像 / 字体演示页 / XLS（2026-09-30）

- 修改：新增 `scripts/generate-demo-brand-assets.cjs`、`generate-demo-xls.cjs`；替换 `logo*.png`、`company-title*.png`、`building-logo.png`、`favicon.ico`、微信/二维码占位图、`loginImages/weixin.jpg`；`public/static` 下 28 份 xls 改为合成空表；`iconfontSource/demo.css`、`demo_index.html` 改为离线 stub，去掉外链 CDN；`iconfont.css` 注释去掉原项目 id；补充 `public/static/README.md`、`public/demo/brand/README.md`；`package.json` 增加 `demo:brand` / `demo:xls`。同步审查清单、本 STATUS、next-task-prompt。
- 设计决定：保留布局引用路径与 ImportFile 文件名；演示仍 403 拦截模板下载；不整批替换 DataV 装饰图；保留 GLB CC BY 署名；不重写历史。
- 验证：65 单测通过；`DEMO_PORT=8088` Edge 回归通过，`externalAttempts: 0`，`uncaughtExceptions: 0`。
- 未验证：每张装饰 PNG 的 OCR/嵌入元数据、iconfont 字形再授权、导入流程真实打开合成 xls（演示路由未开放导入）。
- 明确未做：历史 Key 清理、ChuxouUpload 重命名、自动提交/推送。
- 下一最小任务：可选继续装饰图/字形许可审查，或由用户决定提交本批；公开推送仍受历史 Key 限制。

## 第三批未提交复盘（2026-09-30）

- 新增 review-sanitization-batch3.md，更新 STATUS；仅文档修改，未运行生成器或改业务素材，未暂存提交。
- 确认 P1：favicon 使用 OpenWrite 未截断，4286 字节文件中仅前 766 字节为新图标引用范围，尾部 3520 字节与 HEAD 旧文件完全相同。
- P2：标题/Logo 不透明黑底；weixin.jpg 实际 PNG；28 份 XLS 实际占位 HTML 且无业务表头契约；生成器“从 Git 清除原工作簿”注释不准确。
- 验证方式：差异及源码、直接图片查看、ICO 目录与旧尾部逐字节比较、文件签名检查；不重复全链路单测/浏览器，已有通过记录不足以验收这些产物问题。
- 决定：暂不提交第三批，先修生成器/产物及文档，补格式/透明通道/页面截图验证；装饰图和字形授权残留另批处理，不自动扩展。

## 按用户要求恢复 Logo/标题（2026-09-30）

- 从当前 HEAD 恢复第三批修改前的 logo.png、logo2.png、logo-gold.png、company-title.png、company-title1.png、building-logo.png，其他第三批改动保留。
- 生成器默认不覆盖上述六张图片；仅显式 --replace-brand 时替换。可选生成的 Logo/标题改透明背景及 AntiAliasGridFit，防止黑底/黑边。未运行整批生成器，避免覆盖用户其他素材。
- 验证：恢复文件来自 Git 原始字节，直接查看 Logo；检查五张系统图片左上角 alpha，脚本 node --check。未重复单测或浏览器，未提交推送。
- 恢复素材包含原品牌，不能继续称为已脱敏，品牌 README 已注明。favicon 旧尾部、伪 XLS/JPG 等第三批问题仍待单独修复。
# P2 文件格式修正（2026-09-30，最新补充）

- 修改：weixin.jpg 更名 weixin.png，PNG 字节保留；Login.vue、generate-demo-brand-assets.cjs 同步引用。
- 修改：移除 public/static 下 28 份 HTML 伪 XLS、generate-demo-xls.cjs 和 demo:xls 命令；ImportFile 下载改为中英文未接入提示，适用于本副本所有模式。保留原文件名定义和演示 HTTP 防护。
- 文档：public/static/README.md、next-task-prompt.md、第三批复盘说明同步。
- 验证：PNG 签名、伪 XLS 移除、生成器语法检查通过；新增模板下载提示测试，12 套 67 项演示单测通过。
- 未验证：本轮未跑浏览器和生产构建；真实模板字段及导入流程未实现。全量 diff --check 有既有 precommit-content-audit.md 四处行尾空格，未顺带修改。
- 决定：不伪造业务模板；原品牌 Logo 暂保留，不能宣称全量脱敏；favicon 未改。
- 下一最小任务：另 AI 仅修 favicon 截断写入与重生成，见 next-task-prompt.md。未暂存、提交或推送。

## favicon 截断写入修复（2026-09-30）

- 修改：`generate-demo-brand-assets.cjs` 的 `New-Favicon` 使用 `File.Create` 截断写入；新增 `--favicon-only` 与 `npm run demo:favicon`；仅重写 `public/favicon.ico`；补充 `favicon-preview.png` 与 brand README 说明。未运行完整 `demo:brand`，未改六份已恢复 Logo/标题。
- 验证：两次生成长度均为 766；ICO 目录与图像块终点一致（offset 22 + 744 = 766）；无 4286 旧尾；DIB `biSize=40`；预览图可见 SF；`node --check` 通过。六份品牌图路径 git 无变更。
- 未验证：浏览器标签页缓存图标专项、多尺寸 ICO、非 Windows 生成路径。
- 决定：本项 P1 已关闭；原品牌 Logo 仍未脱敏；伪 XLS 移除与模板未接入提示保持。未暂存、提交或推送。
- 建议 commit（不自动执行）：`fix: 截断写入演示 favicon 避免残留旧图标尾部`
- 下一最小任务：由用户决定是否提交当前工作区（含第三批其余改动与本修复），或继续其他残留审查。

## 新 Logo 页面验收与旧品牌 PNG 清理（2026-09-30）

- 验收：`scripts/check-demo-brand-ui.cjs`（Edge CDP，`DEMO_PORT=8088`）通过。登录/首页/楼宇/报警记录导航均加载 `facility-logo.svg`；比例约 2.5；登录标题「智慧设施」，i18n en「Smart Facility」；首页标题「智慧设施智能监控平台」无溢出；租户名「智慧设施演示空间」；`getLogo`→`logoUrl:''`，导航回退 SVG；`favicon.ico`+`favicon.svg` 均已链接。截图在 `public/demo/brand/ui-shots/`（先写缓存目录再复制，避免 public 写入触发热更新打断登录）。
- 样式：登录/首页 Logo 改为 `height:auto` 保比例；首页标题略缩字号并 `nowrap`。
- 引用检索后删除未使用的六份 PNG（logo/logo2/logo-gold/company-title/company-title1/building-logo）。生成器移除 `--replace-brand` 旧 SF 占位分支（调用即报错退出）；仅保留微信占位 + favicon。
- 未验证：生产构建、标签页缓存专项、全量装饰图 OCR、Git 历史脱敏。不可宣称全量素材已脱敏。
- 未暂存、提交或推送。建议 commit：`chore: 验收新楼宇 Logo 并移除未引用旧品牌 PNG`
- 下一最小任务：由用户决定提交当前工作区，或继续 DataV/字形许可等残留审查。

## 追加：智能硬件 1A 已完成并停止（2026-09-30）

智能硬件首页入口与只读列表闭环。契约：`docs/hardware-1a-contract.md`。未覆盖上文历史条目，仅追加。

### 本轮修改（相对 smart-facility-platform/，另含 docs）

| 文件 | 内容 |
| --- | --- |
| `src/mock/fixtures/equipment.js`、`handlers/equipment.js`、`mock/index.js` | 22 条合成硬件；`POST /equipment/sort/list` 过滤/分页/排序/分面统计；dashboard 同源 |
| `src/mock/fixtures/auth.js`、`handlers/auth.js` | 两部门；菜单补硬件主页；dashboard 迁出 auth |
| `src/permission.js` | 放行 `/lhd/hardware/home`、`/pro`；更新开放范围提示 |
| `src/router/index.js` | 硬件首页 `name` 改为 `HardwareHome`（消除与网关同名） |
| `src/views/hardwareHome/HardwareHome.vue` | 列表请求 `catch/finally` 结束 loading |
| `src/components/DeviceTable/index.vue` | 演示模式拦截详情抽屉并提示 |
| `tests/unit/demo/equipment.spec.js`、`auth.spec.js` | Mock 契约与部门/菜单断言 |
| `scripts/check-demo-hardware-1a.cjs`、`package.json` | 浏览器验收 + `test:demo:hardware` |
| `docs/*`、`docs/evidence/hardware-1a/*.png` | 状态、指南、契约、截图证据 |

### 验证

- `npm run test:demo -- --watch=false`：13 文件 / **73** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware`：首页卡片进入、搜索有/无结果、部门+类型、分页、筛选重置页码、排序、正常/告警/离线、详情拦截、刷新、未开放 `/lhd/device` 挡回、`externalAttempts:0`。
- 证据：`docs/evidence/hardware-1a`（01–06 png）。

### 能用 / 不能用

- **能用**：登录 → 首页「智能硬件」→ 总览列表；关键词/部门/传感类型/硬件类别筛选；分页与列排序；统计卡片随接口。
- **不能用**：点名称/编号的详情抽屉、曲线、告警联动（1B）；网关/记录仪管理等子页；新增编辑删除导入导出。

### 未验证 / 残留

- 未跑完整 `test:demo:browser` 回归套件（本批用专用 hardware 脚本）。
- 侧栏仍可见「记录仪」菜单项，点击会被 permission 挡回首页。
- 品牌/装饰素材授权审查仍暂缓。
- 未暂存、提交或推送。

### 下一步

- 1A 已停止。下一提示词已写：`docs/next-task-prompt.md`（智能硬件 1B：类型匹配的详情/曲线/告警联动）。未执行 1B。

## 追加：智能硬件 1B 已完成并停止（2026-09-30）

类型匹配的只读详情 / 曲线 / 告警联动。契约：`docs/hardware-1b-contract.md`。本文仅追加，不覆盖上文。

### 本轮修改（相对 smart-facility-platform/，另含 docs）

| 文件 | 内容 |
| --- | --- |
| `src/mock/fixtures/equipment.js` | 详情/监测标签/曲线 type=1/告警历史/空壳绑定与负责人 |
| `src/mock/handlers/equipment.js` | `/device/detail`、Device*MonitorFlag、binding、statusPdf、historyAlarmRecord、exceptionHandle 拒绝写 |
| `src/mock/handlers/instrument.js` | `monitorInfo` 按 type=1 走硬件曲线 |
| `src/components/DeviceTable/index.vue` | 演示仅放行记录仪(0)/设备管理器(10)+openTwoSystem |
| `tests/unit/demo/equipment.spec.js` | 详情与 instrument 隔离、曲线/告警单测 |
| `scripts/check-demo-hardware-1b.cjs`、`package.json` | `test:demo:hardware:1b` |
| `docs/hardware-1b-contract.md`、`demo-guide.md`、`next-task-prompt.md`、`evidence/hardware-1b` | 契约、指南、下一批提示、截图 |

### 验证

- `npm run test:demo -- --watch=false`：13 文件 / **75** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：记录仪详情+曲线、设备管理器详情、声光类型仍拦截、`externalAttempts:0`。
- 证据：`docs/evidence/hardware-1b`（01–04 png）。

### 能用 / 不能用

- **能用（在 1A 列表之上）**：点记录仪/设备管理器 → DeviceDrawerNew 基础信息、监测曲线、告警历史只读。
- **不能用**：声光/断电/信号等其它类型详情；硬件告警处理提交（明确失败）；编辑/绑定/导入导出等写操作；`/lhd/device` 管理页。

### 下一步

- 1B 已停止。下一提示词：`docs/next-task-prompt.md`（写操作 / 其它类型详情 / 其它首页模块，待用户指定）。未执行下一批。未暂存、提交或推送。

## 1A/1B 独立复盘（2026-09-30）

- 重跑演示单测：13 文件/75 项通过；阅读实际源码与现有详情截图，未重跑浏览器。
- 发现：只读详情管理开关缺少能力限制与失败 loading 恢复；报警范围 undefined/阈值单位不一致；水浸离散曲线错误；离线告警标签可能混入阈值告警。完整依据见 review-hardware-1ab.md。
- 当前不能以单测通过判定详情已收尾。建议先修这些问题，再优先做硬件告警处理闭环、监测规则设置，最后扩展其它管理功能。
- 本轮只更新复盘文档与 STATUS，未改业务源码，未提交推送。

## 追加：智能硬件 1B 第 0 批收尾修复（2026-09-30）

依据 `docs/review-hardware-1ab.md`。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| P1 | `DeviceDrawerNew`：demo 隐藏管理工具栏/基础信息编辑/添加负责人；开关与下拉写操作拦截；非 demo 开关补 catch/finally |
| P2 字段 | `equipment.js`：传感器补 `min`/`max`（HardwareState 真实字段）；阈值与告警样本对齐（温湿度/温度 0–30、压差 0–10）；信号强度改为 dBm（正常 -70 / 离线 -95） |
| P2 曲线 | 水浸等离散量仅 0/1；`Number.isFinite` 保留合法 0，不再 `\|\| 20` |
| P2 告警 | 离线 Tab（仅 objId）与阈值（objSensorIds）分种子；互不混入 |
| 测试 | `equipment.spec.js` 断言加强；`check-demo-hardware-1b.cjs` 断言无管理栏且 min/max 有效 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **75** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过，`externalAttempts:0`；证据已更新 `docs/evidence/hardware-1b`。

### 下一步

- 第 0 批停止。下一提示词：`docs/next-task-prompt.md`（硬件告警处理闭环）。未执行。未暂存/提交/推送。

## 追加：智能硬件告警处理闭环（2026-09-30）

依据 `docs/next-task-prompt.md`（告警处理）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | `equipment.js`：`handleEquipmentException` / `equipmentAlarmHandles`；981001 未处理 + 981002 已处理样例；列表 merge 回显 |
| Handler | `POST /monitorIndicator/exceptionHandle` 真实持久化（按 objSensorId+time）；失败不写库 |
| UI | `AlarmProcessing`：提交 catch/finally；`processDate` 格式化为字符串再提交 |
| 测试 | `equipment.spec.js` 闭环单测；`check-demo-hardware-1b.cjs` 浏览器处理 980002 告警并截图 |
| 文档 | `hardware-1b-contract.md`、`demo-guide.md`；`next-task-prompt.md` → 阈值/汇报间隔 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **76** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `alarmProcessed`），`externalAttempts:0`；证据含 `05-alarm-processed.png`。

### 能用 / 不能用

- **能用**：硬件详情阈值告警「添加/修改处理」→ 刷新回显已处理；离线告警仍不可处理。
- **不能用**：阈值规则/汇报间隔设置；其它类型详情；管理写操作区（demo 仍隐藏）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（阈值/汇报间隔设置）。未执行。未暂存/提交/推送。

## 追加：智能硬件阈值 / 汇报间隔设置（2026-09-30）

依据 `docs/next-task-prompt.md`（阈值/间隔）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| UI | `DeviceDrawerNew`：demo 工具栏仅开放汇报间隔/报警间隔/报警参数；`handleDropdownMenu` 白名单放行 |
| Mock | `equipmentSettings` 持久化；`updateEquipmentReportingInterval` / `AlarmInterval` / `Sensors`；详情与监测标签 merge 回显 |
| Handler | `POST /device/update/interval/report`、`/interval/alarm`、`/sensors` |
| 测试 | `equipment.spec.js`；浏览器脚本断言间隔与阈值回显，截图 `06-settings-updated.png` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 负责人/部门 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **77** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `settingsUpdated`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：详情改汇报间隔、报警间隔、传感器报警范围并刷新回显。
- **不能用**：声光/平台开关、部门/负责人编辑、联网配置、其它类型详情。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（负责人/部门编辑）。未执行。未暂存/提交/推送。

## 追加：智能硬件负责人 / 部门编辑（2026-09-30）

依据 `docs/next-task-prompt.md`（负责人/部门）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| UI | demo 开放「编辑」名称部门、`添加负责人`；`UpdateDepartment` 白名单 |
| Mock | `equipmentMeta` / `equipmentUsers`；`updateEquipmentBasic`；`list/add/remove` 负责人；`DEMO_STAFF` + `/user/list` |
| Handler | `/device/update/basic`；`/equipmentUser/*`；`/user/list` |
| 测试 | 单测 + 浏览器 `ownerDeptUpdated`；证据 `07-owner-dept-updated.png` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 绑定事物 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **78** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `ownerDeptUpdated`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：改名称与部门并回显；添加/删除负责人；员工列表来自演示人员池。
- **不能用**：绑定事物、联网配置、其它类型详情、声光/平台开关。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（绑定事物）。未执行。未暂存/提交/推送。

## 追加：智能硬件绑定事物（2026-09-30）

依据 `docs/next-task-prompt.md`（绑定事物）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| UI | `DeviceBindRelationship`：demo 展示绑定区；绑定房间/仪器、解绑；不打开级联抽屉 |
| Mock | `equipmentBindings`；`list/add/remove` 房间(type=11)/仪器(type=4)；房间互斥替换 |
| Handler | `/device/binding`；`/room/things/add|remove`；`/instrument/things/add|remove`；`/device/deviceBindThings` |
| 测试 | 单测 + 浏览器 `bindingUpdated`；证据 `08-binding-updated.png` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 其它类型详情 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `bindingUpdated`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：详情绑定/解绑演示房间与仪器并回显；列表接口可读。
- **不能用**：点击绑定名打开房间/仪器抽屉（demo 禁用级联）；联网配置；声光/断电等其它类型详情。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（其它类型详情）。未执行。未暂存/提交/推送。

## 追加：智能硬件声光 / 断电详情（2026-09-30）

依据 `docs/next-task-prompt.md`（其它类型详情）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| 列表 | `DeviceTable` 演示放行 type `7` / `8+openTwoSystem`；信号等仍拦截 |
| UI | `AlerterDrawer` / `PowerDrawerNew`：demo 隐藏写工具栏与风险子模块（Common/Multifunction） |
| Mock | `DEMO_EQUIPMENT_DETAIL_CODES` 含 7/8；详情补 `defenceAlarmStatus`/`powerFailure`；`getAlertorBeepTime` |
| Handler | `GET /alertor/obtain/beepTime`；`closeAlarm/*` 明确失败 |
| 测试 | 单测 980012/980014/beepTime；浏览器 `09-alerter-detail`、`10-power-detail`；信号仍拦截 |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 信号接收器或联网配置 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `alerterDetail`/`powerDetail`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：列表打开声光只读详情（含蜂鸣时长）；打开断电只读详情（供电态、绑定/曲线区）；开关类写操作拒绝。
- **不能用**：信号接收器详情；联网配置；真实指令下发；声光关联设备/多功能子页。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（信号接收器详情）。未执行。未暂存/提交/推送。

## 追加：智能硬件信号接收器详情（2026-09-30）

依据 `docs/next-task-prompt.md`（信号接收器详情）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| 列表 | `DeviceTable` 演示放行 type `14`；枪架/网关等仍拦截 |
| UI | `SignalSourceDrawer`：demo 隐藏编辑/绑定/解绑与级联打开 |
| Mock | `DEMO_EQUIPMENT_DETAIL_CODES` 含 14；`statusStr`/`runStatus`；`listSignalReceiverBindings`；`getHistoryDeviceChart` |
| Handler | `GET /device/signal/bind/list`；`GET /history/device/chart`；bind/unbind/devices 明确失败 |
| 测试 | 单测 980016；浏览器 `11-signal-detail`；枪架仍拦截 |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 联网配置或枪架/网关 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `signalDetail`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：列表打开信号接收器只读详情（状态、探头、曲线、预置绑定列表）。
- **不能用**：信号绑定/解绑写；编辑部门；枪架/网关详情；联网配置；真实指令。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（联网配置只读）。未执行。未暂存/提交/推送。

## 追加：智能硬件联网配置只读（2026-09-30）

依据 `docs/next-task-prompt.md`（联网配置只读）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| UI | `DeviceDrawerNew`/`PowerDrawerNew` demo 开放「联网配置」；`NetworkConfiguration`/`NetworkAdvancedSetup` 只读 |
| Mock | `getDeviceWifiEcho`（type 8/10）；SSID/IP 等演示字段 |
| Handler | `GET /device/wifi/echo`；`POST /device/wifi/input|inputBatch` 明确失败 |
| 测试 | 单测 echo/拒绝；浏览器 `12-network-config` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 枪架或网关详情 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `networkConfig`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：设备管理器/断电详情打开联网配置弹窗，只读查看 Wi‑Fi/LAN 演示参数。
- **不能用**：联网配置下发；枪架/网关详情；真实指令。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（枪架或网关详情）。未执行。未暂存/提交/推送。

## 追加：智能硬件枪架详情（2026-09-30）

依据 `docs/next-task-prompt.md`（枪架详情）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| 种子 | `980023/980024` 移液枪架；`EQUIPMENT_TYPE_META` 含 13 |
| 列表 | `DeviceTable` 演示放行 type `13`；网关等仍拦截 |
| UI | `GunRackDrawer`：demo 隐藏开关/编辑/负责人添加等写入口 |
| Mock | 详情补 `roomName/remark/companyName`；`listGunPipetteBindings`；历史告警空桩 |
| Handler | `POST /gun/pipette/binding/list`；`GET /history/device/alarm`、`/history/my/alarm` |
| 测试 | 单测 980023；浏览器 `13-gunrack-detail` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 网关或其它模块 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `gunRackDetail`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：列表打开枪架只读详情（基础信息、枪位列表、负责人区、告警空态）。
- **不能用**：声光开关/编辑/语音提醒/添加负责人；网关详情；真实指令。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（网关详情或其它模块）。未执行。未暂存/提交/推送。

## 追加：智能硬件网关详情（2026-09-30）

依据 `docs/next-task-prompt.md`（开工网关）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| 种子 | `980025/980026` 资产网关；`EQUIPMENT_TYPE_META` 含 16 |
| 列表 | `DeviceTable` 演示放行 type `16`；未知类型仍拦截 |
| UI | `AssetGatewayDrawer`：demo 下联网配置随 `wifiFlag` 只读开放 |
| Mock | 详情补 `roomName/companyName/propertyNum/wifiFlag`；`listLabelBindings`；`getDeviceWifiEcho` 含 16 |
| Handler | `POST /label/binding/list`；历史告警空桩已复用 |
| 测试 | 单测 980025 + 标签列表；浏览器 `14-gateway-detail` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 其它首页模块 |

### 验证

- `npm run test:demo -- --watch=false`：13 / **79** 通过。
- `DEMO_PORT=8088 npm run test:demo:hardware:1b`：通过（含 `gatewayDetail`），`externalAttempts:0`。

### 能用 / 不能用

- **能用**：列表打开网关只读详情（基础信息、绑定标签、历史告警空态、联网配置只读）。
- **不能用**：联网配置下发；未知类型详情；真实指令。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（其它首页模块）。未执行。未暂存/提交/推送。

## 智能硬件全模块独立复盘（2026-09-30）

- 完整报告：review-hardware-module.md，覆盖入口、总览、七类详情、告警/设置/负责人/绑定、联网配置与管理页边界。
- 实测：13 套 79 项正式单测通过；8088 本地 Edge hardware:1b 通过，外部请求尝试 0、未捕获异常 0；查看本轮真实断电/网关截图。
- 额外临时边界测试 3 项均失败：错误 idx/type 被接受、空阈值被转为 0、批量绑定失败后前项仍保存。临时测试已移除，正式测试未修改。
- 另发现断电曲线显示约 220℃、页面与 Mock 重复硬编码绑定目录、记录仪菜单可见却被路由拦回首页。不能把全部详情可打开等同于全模块完成。
- 上轮开关 loading、范围 undefined、水浸曲线、离线/阈值事件混淆已有对应修复；本报告评估的是扩展后的新基线。
- 建议转其它模块前先有限修复本报告五项问题。真实硬件通信、未接入管理页与空告警占位继续明确受限。
- 本轮未改业务源码、未提交/推送。浏览器脚本更新了 docs/evidence/hardware-1b 的验收截图；未运行生产构建或全站浏览器回归。

## 智能硬件五项质量收尾完成（2026-09-30）

- 指标：equipment.js 按硬件类型处理探头；断电使用 sensorId/type 17、0/1 供电状态；温湿度设备明确演示单独温度通道，单位 ℃；无环境探头的声光/枪架/资产网关不再计入温湿度类别，监测标签返回空集。没有实现湿度第二通道。
- 写入：规则拒绝不存在/重复/不匹配探头及空值/null/非有限阈值，合法零保留；批量仪器绑定先校验整批与重复关系，再一次持久化，失败不部分保存。
- 目录：绑定候选从共享 DEMO_FLOOR_ROOMS/DEMO_INSTRUMENTS 派生，通过受保护的 GET /__demo/equipment/bindable 提供；api/device 与 DeviceBindRelationship 接入接口加载及失败/加载状态，删除页面候选常量。目录增加了共享实体中原未列出的仪器和空间，绑定规则仍由服务校验。
- 导航：demo 菜单移除未开放的 /lhd/device 项；permission 与 DeviceTable 提示按实际能力更新，未放宽管理页权限。
- 测试：新增 equipment-review.spec.js，五项行为测试覆盖异常参数、原子绑定、指标语义、统一目录与会话保护、菜单边界。14 套/84 项 test:demo 通过。
- 浏览器：8088 本地硬件 1A、1B 均通过，外部请求尝试 0、未捕获异常 0；1B 首页入口、房间/仪器绑定改为实际 DOM 按钮与下拉选项操作，补断电详情无 ℃ 的断言。1A 过时的“所有详情受限”改为未知类型受限。截图更新至 docs/evidence/hardware-1a、hardware-1b，已查看供电曲线正确截图。
- 验证限制：没有运行生产构建或全站浏览器回归；仍只在本地 Edge 1440×900 验收。规则保存不等于真实设备下发；状态/新事件自动重算、房间/仪器反向绑定联动、真实通信不在此次范围。
- 文档：复盘报告与 1B 契约补收尾结论；next-task-prompt.md 已重写为设备管理 2A，目标为 /ld/labdevice 的共享仪器列表、筛选统计及已有详情入口。未开始 2A，未暂存/提交/推送。
- 如提交整个当前硬件工作区，建议：feat: 接通智能硬件演示并完善监测语义与配置绑定校验。若只提交本轮收尾，建议：fix: 修复智能硬件指标语义与配置绑定一致性。

## 追加：设备管理 2A 统一仪器列表（2026-09-30）

依据 `docs/next-task-prompt.md`（设备管理 2A）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| 契约 | `docs/device-management-2a-contract.md` |
| Mock | `listInstruments` / `getInstrumentDashboardNew`；写接口明确拒绝；分类补 `types`+`childrenList`；`bindEquipmentType` 返回硬件类型；房间 keyword 搜索 |
| Handler | `POST /instrument/list`；`GET /instrument/dashboard/new`；add/update/remove/batch/export/unbind 拒绝 |
| 导航 | `permission` 放行 `/ld/labdevice`；`DEMO_MENUS` 增加设备管理 |
| UI | 列表/详情 demo 隐藏写入口；复用 `LabDeviceDrawer` 只读 |
| 测试 | `instrument-list.spec.js`；浏览器 `check-demo-device-2a.cjs` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 2B 编辑闭环 |

### 验证

- `npm run test:demo -- --watch=false`：15 套 / **93** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2a`：通过，`externalAttempts:0`；证据 `docs/evidence/device-management-2a`（01–08）。
- 已查看列表与详情截图：总数 12、分页两页、DEMO-EQ-970xxx、只读详情含监测卡。

### 能用 / 不能用

- **能用**：首页「设备管理」→ 仪器列表筛选/分页/统计 → 点名称打开只读详情与监测曲线。
- **不能用**：仪器新增/编辑/删除/批量/导入导出/解绑；兄弟路由（关注设备、行政设备、使用统计等）。

### 设计决定

- 列表/详情/布局/bindable 共用 `DEMO_INSTRUMENTS`；研发部 3 台便于部门筛选；页大小 10 验两页。
- `floorIds` 按页面实际为楼层 id；离线运行状态计入「未运行」桶。
- `objType` 按当前硬件绑定关系过滤（无绑定则空结果）。

### 未验证

- 未跑生产构建 / 全站浏览器回归；未在非 Edge 浏览器验收。
- 详情内预约/维保 Tab 仅依赖既有空桩，未做完整 Tab 点检。
- 未验证硬件 1B 全量脚本本轮是否仍绿（本切片未改硬件写路径；建议提交前按需复跑）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（2B 一种仪器编辑持久化）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器列表与只读详情演示`。

## 追加：设备管理 2B 仪器编辑持久化（2026-09-30）

依据 `docs/next-task-prompt.md`（设备管理 2B）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | `updateInstrumentBasic` + `instrumentMeta`（name/departmentId/types）；列表/详情/布局/bindable 叠加 |
| 分类 | 增加 `types:2` 演示辅助设备 |
| Handler | `POST /instrument/update/basic` 可写；grade/file/room.tree 空桩；其它写仍拒绝 |
| 房间列表 | 设计器 `floorId` 无 keyword 仍空；编辑弹窗无 floorId 返回共享房间 |
| UI | 列表/详情开放「编辑」；删除/新增/导入导出仍隐藏 |
| 测试 | `instrument-edit.spec.js`；浏览器 `check-demo-device-2b.cjs` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 2C 删除 |

### 验证

- `npm run test:demo -- --watch=false`：16 套 / **97** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2b`：通过，`externalAttempts:0`；证据 `docs/evidence/device-management-2b`（01–04）。
- 已查看编辑后列表与详情截图：名称「演示培养箱二编」、部门「演示研发部」、分类「演示辅助设备」。

### 能用 / 不能用

- **能用**：列表/详情编辑名称、部门、分类；刷新后列表、详情、布局名、bindable 一致。
- **不能用**：新增/删除/批量/导入导出/解绑；房间/品牌等其它字段虽可提交但不持久化。

### 设计决定

- 对标硬件 `equipmentMeta`，仅持久化本轮三字段；分类补第二叶以便改 types。
- SelectTree `getNode` 在弹窗打开时有既有噪声，浏览器验收已忽略，不视为本切片回归。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B 全量脚本。
- 未验编辑房间/负责人/图片上传；`file/policy` 为空桩。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（2C 仪器删除）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器名称部门分类编辑演示`。

## 追加：设备管理 2C 仪器单条删除（2026-10-01）

依据 `docs/next-task-prompt.md`（设备管理 2C）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | `removeInstrument` + `instrumentDeleted` tombstone；剪 `instrumentMeta` 与布局点 |
| 读路径 | 列表/dashboard/详情/布局/bindable 排除已删 id |
| Handler | `POST /instrument/remove/:id`（按 seed id 注册）；batch/delete 等仍拒绝 |
| UI | 列表操作列开放「删除」；新增/批量/导入导出仍 `!isDemo` 隐藏 |
| 测试 | `instrument-delete.spec.js`；浏览器 `check-demo-device-2c.cjs` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 2D 导入或新增 |

### 验证

- `npm run test:demo -- --watch=false`：17 套 / **100** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2c`：通过，`externalAttempts:0`；证据 `docs/evidence/device-management-2c`（01–04）。
- 删除 970012 后 total=11、统计卡同步、关键词搜编号为空。

### 能用 / 不能用

- **能用**：列表单条删除；刷新后列表、统计、详情、布局、bindable 不再含该 id。
- **不能用**：批量删除/新增/导入导出/解绑；有标签设备解绑仍拒绝（本切片种子无 labelId）。

### 设计决定

- Tombstone overlay，不改 seed；删除时同步剪布局避免孤儿点。
- 未知 id 不注册 HTTP 路由（adapter 精确匹配）；单测在 fixture 层断言拒绝。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B 全量脚本。
- 未验带 `labelId` 的解绑→删除链路（种子无标签）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（2D 导入或新增）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器单条删除演示`。

## 追加：设备管理 2D 仪器导入（2026-10-01）

依据 `docs/next-task-prompt.md`（设备管理 2D，优先导入）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | `importDemoInstruments` + `instrumentCreated`（id 970101–970150，走廊 950002） |
| Handler | `POST /instrument/import`；remove 路由预注册导入 id 段；add/batch/export 仍拒 |
| 布局 | `imported: true` 不进入 `listInstrumentsByRoomId`，避免破坏 A/B 室布局保存 |
| UI | 列表开放「导入」；`ImportFile` 仪器模板本地下载示意 CSV |
| 测试 | `instrument-import.spec.js`；模板单测更新；浏览器 `check-demo-device-2d.cjs` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 2E 导出或批量删除 |

### 验证

- `npm run test:demo -- --watch=false`：18 套 / **104** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2d`：通过，`externalAttempts:0`；证据 `docs/evidence/device-management-2d`（01–04）。
- 导入后 total=13、统计卡同步、关键词「演示导入设备」命中 970101。

### 能用 / 不能用

- **能用**：下载 `设备导入.csv`；按首行写入名称/部门/分类/房间；列表/统计/详情/bindable 可见。
- **不能用**：解析 Excel 二进制 `.xls/.xlsx`（无表格库）；新增表单；批量删除/导出/解绑。

### 设计决定

- 解析文本 CSV 首行；二进制表拒绝并提示另存 CSV。
- 导入设备 `imported: true` 不进布局集合，避免与「房间须保留全部已上图设备」冲突。

### 追加修复（同日）

- 用户改表后内容不一致：已改为按 CSV 字段落库；请重新下载 CSV 模板编辑上传，勿用 Excel 另存 xls/xlsx。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B 全量脚本。
- 未验连续导入至 970150 上限后的 UI 文案展示。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（2E 导出或批量删除）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器导入演示`。

## 设备管理四个本地提交复盘（2026-10-01）

- 检查起点工作区干净，本地相对缓存 origin/master 领先四提交（列表、编辑、单删、导入），未 fetch/push。
- 独立重跑 18 套 104 项单测通过；临时补测多行导入、并发 ID、导入后绑定三项失败，临时测试已移除。未重跑浏览器；2D 现有脚本改写上传方法，不足以证明真实上传流程。
- 详细问题与建议见 review-device-management-2a-2d.md。建议先补导入质量和关系一致性，再做预览确认；暂不自动执行 2E 或修改业务代码。
- 本轮仅维护复盘文档与 STATUS，未提交推送。


## XLSX 导入闭环（2026-10-01，实施中）

- 用户指定 XLSX 优先，替代此前 CSV 方案，暂缓2E。修改 ImportFile、instrumentWorkbook、instrument/equipment fixture、instrument handler；整批校验保存，提交锁，解析后同步分配ID，动态绑定校验，绑定中设备禁止删除。导入设备已登记但不自动上图。
- 模板四列：名称/部门/分类/房间；目录来自受保护 Mock 接口；单文件10MB、最多50行，错误整批不保存并提示行号。仅支持真正.xlsx。
- 更新导入单测并新增UI提交锁/失败重试测试；浏览器脚本改真实选择文件，移除上传方法覆盖。
- 依赖由用户安装ExcelJS4.4.0；原有peer冲突与deasync旧安装脚本导致前两次失败，等待使用--legacy-peer-deps --ignore-scripts安装后验收。未提交推送。


### XLSX 导入闭环验收完成（2026-10-01）

- 用户已用 npm install exceljs@4.4.0 --save-exact --legacy-peer-deps --ignore-scripts 完成安装，package.json/lock纳入本批；比较锁文件，既有packages版本变化为0。npm报告183项漏洞属于当前整棵依赖树，本轮未做依赖安全修复或audit fix。
- npm run test:demo -- --watch=false --silent：19套112项通过；包括真实XLSX多行、错误第二行整批不写、并发唯一ID、重复名称、容量、非法格式/公式、模板往返、导入后绑定/绑定中拒绝删除、UI防重入/重试。
- 本机8090演示编译通过（5条既有Vue模板key警告）。首次沙箱内Edge CDP超时，沙箱外同一本机阻断外网脚本通过。补充版2D浏览器验收：真实点击下载模板且ExcelJS可读；原生文件选择错误第二行→无写入→移除重选正确两行→total14→按名称查询→整页刷新仍保留两条；externalAttempts=0。截图见docs/evidence/device-management-2d，已查看弹窗及错误行截图。
- git diff --check通过；未跑生产构建/全站回归/其他硬件浏览器脚本，未验证跨标签页并发写入；本轮并发保证范围为同一页面。未执行部署、提交、推送。
- 修改文件：src/components/ImportFile/index.vue；src/mock/instrumentWorkbook.js；src/mock/fixtures/{instrument,equipment}.js；src/mock/handlers/instrument.js；tests/unit/demo/{instrument-import,instrument-import-ui,import-template-unavailable}.spec.js；scripts/check-demo-device-2d.cjs；package.json/package-lock.json；本批docs与2D截图。
- 设计决定：单文件.xlsx、多行原子导入，最多50行/10MB、名称/部门/分类/房间可读模板；导入设备已登记未布置，不扩展布局。旧CSV撤下；预览确认留给下一切片。
- 下一最小任务：按next-task-prompt.md做导入预览确认，预览不落库，确认前重新校验；不自动开始2E。建议commit：feat: 完成设备XLSX批量导入闭环并修复绑定一致性。

## 追加：设备导入预览确认（2026-10-01）

依据 `docs/next-task-prompt.md`（导入预览确认）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | 抽取 `buildInstrumentImportPlan`；新增 `previewDemoInstruments`（不写存储） |
| Handler | `POST /instrument/import/preview`；确认仍走 `/instrument/import`（再次校验） |
| UI | 选文件自动预览表（行号/名称/部门/分类/房间/错误）；整批通过才可「确认导入」；换文件清空预览；提交锁与失败后重预览 |
| 测试 | 预览不落库单测；UI 预览/确认/重试；浏览器脚本验预览门闩 |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 2E |

### 验证

- `npm run test:demo -- --watch=false --silent`：19 套 / **114** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2d`：通过，`externalAttempts:0`；错误行预览未写入 → 换正确文件预览通过 → 确认后 total=14。
- 证据：`docs/evidence/device-management-2d`。

### 能用 / 不能用

- **能用**：选择 XLSX → 预览校验（不落库）→ 确认导入写入；错误行可视化。
- **不能用**：预览阶段落库；导出/批量删除/新增表单。

### 设计决定

- 预览与确认共用 `buildInstrumentImportPlan`，页面不复制业务规则。
- 确认失败后释放锁并重新 preview，避免容量/重名状态过期仍可点确认。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B 脚本。
- 未验跨标签页并发写入。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（2E 导出或批量删除）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备导入预览确认流程`。

## 追加：设备管理 2E 筛选导出（2026-10-01）

依据 `docs/next-task-prompt.md`（设备管理 2E，优先导出）。本文仅追加。

### 修改

| 项 | 内容 |
| --- | --- |
| Mock | `exportDemoInstruments` + `createInstrumentExportWorkbook`；复用 `listInstruments` 筛选，忽略分页 |
| Handler | `POST /instrument/export` 返回 XLSX 二进制；`batch/delete` 仍拒绝 |
| UI | 列表开放「导出」；demo 下传完整筛选字段并立即下载 `.xlsx` |
| 测试 | `instrument-export.spec.js`；列表单测同步；浏览器 `check-demo-device-2e.cjs` |
| 文档 | contract / demo-guide；`next-task-prompt.md` → 批量删除或新增 |

### 验证

- `npm run test:demo -- --watch=false --silent`：20 套 / **117** 项通过。
- `DEMO_PORT=8088 npm run test:demo:device:2e`：通过，`externalAttempts:0`；关键词「培养箱」筛选后导出 2 行。
- 证据：`docs/evidence/device-management-2e`。

### 能用 / 不能用

- **能用**：按当前筛选导出全部匹配仪器为本地 XLSX。
- **不能用**：批量删除/新增/解绑。

### 设计决定

- 导出与列表共用筛选逻辑；不接外部下载任务服务。
- 批量删除留待下一切片，避免本轮范围膨胀。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B 脚本。
- 未验超大筛选集（>10000）导出表现。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（批量删除或新增）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器筛选导出演示`。

## 2026-10-01 — 设备管理 2F：批量删除

### 做了什么

- 接通 `POST /instrument/batch/delete`：`batchRemoveInstruments` 先校验再逐条复用 `removeInstrument` tombstone；空 ids / 无效或已删 / 任一条已绑定 → 整批失败不写。
- 列表恢复「多选」；演示下 `visibleSetUpList` 仅保留「批量删除」（value=6）；新增仍隐藏，`add` / `batch/update` / `unbind` 仍拒绝。
- 单测：删除/列表/导出用例更新；原子性与绑定拒绝覆盖。
- 浏览器：`npm run test:demo:device:2f`，证据 `docs/evidence/device-management-2f`。
- 文档：契约 / demo-guide / next-task-prompt（下一刀：新增一台）。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/fixtures/instrument.js` | `batchRemoveInstruments` |
| `src/mock/handlers/instrument.js` | 开放 batch/delete |
| `src/views/labDevice/index.vue` | 多选入口 + 演示仅批量删除 |
| `tests/unit/demo/instrument-delete.spec.js` 等 | 断言更新 |
| `scripts/check-demo-device-2f.cjs`、`package.json` | 浏览器验收 |
| `docs/device-management-2a-contract.md`、`demo-guide.md`、`STATUS.md`、`next-task-prompt.md` | 复盘与下一刀 |

### 验证

- `npm run test:demo -- --watch=false`：20 套 / 119 项通过。
- `$env:DEMO_PORT='8088'; npm run test:demo:device:2f`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：多选勾选 → 批量删除 → 列表/统计/布局/bindable 同步排除。
- **不能用**：新增表单；批量改部门/房间/图片/保管人；解绑。

### 设计决定

- 与单删同一 tombstone 与绑定守卫；先校验后删除保证原子失败。
- 演示不开放其它批量写，避免假成功。

### 未验证

- 未跑生产构建 / 全站回归 / 硬件 1B。
- 未在真实已绑定硬件场景做浏览器点击（单测覆盖 resolver）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（新增一台）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器批量删除演示`。

## 2026-10-01 — 设备管理 2G：手填新增一台

### 做了什么

- 接通 `POST /instrument/add`：`addDemoInstrument` 校验名称/部门/分类/房间，写入与导入同一 `instrumentCreated` 池（`imported: true`，不上图）。
- 列表恢复「新增」按钮（原 Modal）；其它 body 字段接受但忽略。
- 单测 `instrument-add.spec.js`；列表/导出断言更新。
- 浏览器：`npm run test:demo:device:2g`，证据 `docs/evidence/device-management-2g`。
- 文档：契约 / demo-guide / next-task-prompt（下一刀：收口或其它模块）。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/fixtures/instrument.js` | `addDemoInstrument` |
| `src/mock/handlers/instrument.js` | 开放 add |
| `src/views/labDevice/index.vue` | 演示显示新增 |
| `tests/unit/demo/instrument-add.spec.js` 等 | 覆盖与断言 |
| `scripts/check-demo-device-2g.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 复盘与下一刀 |

### 验证

- `npm run test:demo` 相关：21 套 / 123 项通过。
- `$env:DEMO_PORT='8088'; npm run test:demo:device:2g`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：新增一台 → 列表/统计/详情/bindable；同房间名称查重。
- **不能用**：解绑；`batch/update`；自动上图。

### 设计决定

- 与导入共用 id 段与持久化键，避免第二套创建路径。
- 表单仍用原 Modal；Mock 只持久化四字段。

### 未验证

- 未跑生产构建 / 全站回归。
- 未验人手点选部门树/房间树全部交互路径（脚本经 Vue 赋值提交）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（收口或其它模块）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理仪器手填新增演示`。

## 2026-10-01 — 设备管理 2H：解绑后才能删除

### 做了什么

- 接通 `GET /instrument/unbind`：`unbindInstrumentHardware` 清除该仪器全部智能硬件绑定。
- 列表/详情增加 `boundHardware`；已绑定删除 UI 直接提示「请先解绑」；Mock 单删/批量删仍拒绝。
- 详情抽屉演示区展示绑定状态与解绑入口。
- 单测 `instrument-unbind.spec.js`；浏览器 `test:demo:device:2h`，证据 `docs/evidence/device-management-2h`。
- 文档：契约 / demo-guide / next-task-prompt。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/fixtures/equipment.js` | `unbindInstrumentHardware` |
| `src/mock/handlers/instrument.js` | 开放 unbind |
| `src/mock/fixtures/instrument.js` | 行字段 `boundHardware` |
| `src/views/labDevice/index.vue` | 绑定中禁止删除 |
| `src/views/labDevice/components/LabDeviceDrawer.vue` | 解绑入口 |
| `tests/unit/demo/instrument-unbind.spec.js` 等 | 覆盖 |
| `scripts/check-demo-device-2h.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 复盘与下一刀 |

### 验证

- `npm run test:demo` 相关：22 套 / 126 项通过。
- `$env:DEMO_PORT='8088'; npm run test:demo:device:2h`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：绑定后不可删 → 详情解绑 → 再删；批量删遇绑定整批失败。
- **不能用**：`batch/update`。

### 设计决定

- 不解绑后自动删除，强制两步，避免误删已绑设备。
- 仪器侧 unbind 与硬件侧 things/remove 共用同一绑定存储。

### 未验证

- 未跑生产构建 / 全站回归。
- 未从硬件抽屉完整点选绑定再回设备管理的人工路径（脚本写入绑定存储）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通设备管理绑定解绑与删除守卫`。


## 设备管理整体复盘及绑定可见性修复（2026-10-01）

- 起点Git干净，HEAD 7a2afb5。复盘列表/详情/新增/编辑/导入预览确认/导出/单删批删/解绑；报告review-device-management-module.md。
- 根因：boundHardware已存在且解绑成功会通知列表刷新，但表格没展示绑定状态，删除按钮也没禁用。
- 修改labDevice/index.vue：演示专用智能硬件绑定列，已绑定提供查看/解绑入口并禁用删除；未绑定恢复删除；批删含绑定项提前提示。LabDeviceDrawer.vue未绑定明确说明可返回列表删除。保留Mock最终删除守卫。
- 修改check-demo-device-2h.cjs：校验真实DOM状态及按钮，真实确认框点击，移除解绑后手动刷新；初始绑定仍由演示存储构造，不代表跨硬件页面绑定路径已验收。
- 验证：22套126项单测通过；8090演示编译成功；最终2H浏览器验收通过externalAttempts=0，解绑后自动刷新并恢复删除，随后确认删除成功；git diff --check通过。截图见evidence/device-management-2h。中间脚本因等待条件返回DOM无法按值传递而超时，改显式布尔条件后通过，不能据此认为业务确认框故障。
- 未验证：生产构建、全站回归、其他设备管理浏览器脚本，本轮未重复运行；编辑重名与新增表单字段问题为静态源码发现。
- 待收尾：新增表单可填但不持久化的字段需收口；编辑应同房间查重并排除自身。已更新next-task-prompt.md，只处理这两项，暂不跳其它模块。
- 未提交推送。建议commit：fix: 展示设备硬件绑定状态并明确解绑后删除流程。


## 设备管理两项收尾完成（2026-10-01）

- 修改src/views/labDevice/modal.vue：演示新增只开放名称/部门/分类/房间，编号禁用并提示自动生成、取消编号必填；房间必填，编辑时房间只读；隐藏未持久化字段，跳过无用图片/等级/上传策略/负责人请求；非演示表单保持原行为。
- 修改src/mock/fixtures/instrument.js：updateInstrumentBasic同房间名称查重，排除自身；与新增/导入规则一致。
- 修改tests/unit/demo/instrument-edit.spec.js，覆盖冲突不写入、原名保存、跨房间同名；修改scripts/check-demo-device-2g.cjs验证五个表单项、自动编号只读，走handleFormSubmit而非直接addAsny，并核对保存值。
- 验证：22套127项单测通过；8090演示编译通过；2G新增与2B编辑浏览器通过，externalAttempts=0；已查看新增表单截图。2G首次因脚本替换form对象后未等Vue渲染而校验失败，补nextTick后通过。2B旧脚本报告ignoredTreeErrors=1754（树组件既有异常被脚本过滤），不能据此声称浏览器零异常。
- 未验证：生产构建、全站回归、非演示后端、完整人工树选择路径（浏览器脚本赋表单值后走正常校验提交）；编辑重名分支由单测验证，本轮浏览器回归普通编辑成功路径。
- 同步契约、指南、review-device-management-module及2B/2G截图；两项收尾关闭。下一任务已改为房间管理3A列表+只读详情，交另AI执行，未提前改动房间模块。
- 未安装依赖、未提交推送。建议commit：fix: 收口设备登记表单并统一编辑重名校验。


## 2026-10-01 — 房间管理 3A：列表与只读详情

### 做了什么

- 开放首页「房间管理」→ `/rm/room`（`permission.js`）。
- 增强 `POST /room/list`：完整行字段、关键词/部门/位置/状态/分页；保留设计器仅 `floorId` 空侧栏语义。
- 接通 `GET /room/dashboardV1`（位置口径）；详情 `openTwoSystem: 1` → `RoomDrawerNew`；`GET /room/monitor/instrument` 读已上图 `970xxx`。
- 演示隐藏写入口与未支持的硬件类型筛选；房间写 API 明确拒绝。
- 走廊种子 `senorStatus: 3`（未监测）；契约 / demo-guide / next-task-prompt(3B 建议)。
- 单测 `room-list.spec.js`；浏览器 `test:demo:room:3a`，证据 `docs/evidence/room-management-3a`。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/fixtures/room.js` | list/dashboard/detail/monitor |
| `src/mock/fixtures/floor.js` | 走廊未监测；list 委托 room fixture |
| `src/mock/fixtures/instrument.js` | `roomId` + `monitor` 筛 |
| `src/mock/handlers/room.js` / `floor.js` / `instrument.js` | 读路径 + 写拒绝；objType 3 空探头 |
| `src/permission.js` | 放行 `/rm/room` |
| `src/views/room/Room.vue` 等 | 演示只读 UI |
| `tests/unit/demo/room-list.spec.js` 等 | 覆盖 |
| `scripts/check-demo-room-3a.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 契约/指南/STATUS/下一刀 |

### 验证

- `npm run test:demo`：23 套 / 133 项通过。
- `$env:DEMO_PORT='8089'; npm run test:demo:room:3a`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：首页进入列表 → 筛选/分页/统计 → 只读详情与已上图仪器。
- **不能用**：房间增删改、导入导出、绑定/解绑、关联硬件类型筛选、巡查报告写。

### 设计决定

- 设计器空侧栏靠「无 gardenId 等管理键」识别，避免房间页按楼层筛选被误伤。
- 已上图 vs 空间归属：monitor/instrument 仅 placement；`instrument/list`+`monitor:2` 为未上图。

### 未验证

- 未跑生产构建 / 全站回归。
- 未人工点选部门树/楼层抽屉全部交互（脚本赋筛选值后请求）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（3B 建议）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通房间管理列表与只读详情演示`。


## 2026-10-01 — 房间管理 3B：详情关联硬件只读

### 做了什么

- 共享 `equipmentBindings` 增加按房间反查 `listBoundEquipmentForRoom`；冷启动种子 `980010→950001`、`980018→950003`（不碰 `980001`）。
- 接通 `GET /monitorIndicator/things/newList`（objType 3/2）；`RoomDrawerNew` 演示区只读展示 `BindHardwareTable`。
- 单测 `room-hardware-bind.spec.js`；浏览器 `test:demo:room:3b`，证据 `docs/evidence/room-management-3b`。
- 更新契约 / demo-guide / next-task-prompt（3C 建议）。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/fixtures/equipment.js` | 种子 + 反查 + newList |
| `src/mock/handlers/equipment.js` | 注册 newList |
| `src/views/room/components/RoomDrawerNew.vue` | 演示只读绑定表 |
| `tests/unit/demo/room-hardware-bind.spec.js` | 覆盖 |
| `scripts/check-demo-room-3b.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 契约/指南/STATUS/下一刀 |

### 验证

- `npm run test:demo`：24 套 / 136 项通过。
- `$env:DEMO_PORT='8089'; npm run test:demo:room:3b`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：房间详情见已绑定硬件名称/编号；与硬件详情绑定同源。
- **不能用**：房间侧绑定/解绑；列表硬件类型筛选仍隐藏。

### 设计决定

- 种子避开 `980001`，避免破坏既有硬件绑定单测「初始为空」断言。
- 详情用 inline 表而非 popover，便于演示与脚本验收。

### 未验证

- 未跑生产构建 / 全站回归。
- 未从硬件详情改绑后再回房间详情的人工跨页路径（单测覆盖写后反查）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（3C 建议）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通房间详情关联硬件只读演示`。


## 2026-10-01 — 房间管理 3C：筛选导出

### 做了什么

- 接通 `POST /room/export`：与列表同筛选、忽略分页，本地 XLSX「房间列表」。
- 演示开放导出按钮；导入及其它写仍隐藏/拒绝；`handleExport` 带上位置筛选并补 `.xlsx` 后缀。
- 单测 `room-export.spec.js`；浏览器 `test:demo:room:3c`，证据 `docs/evidence/room-management-3c`。
- 更新契约 / demo-guide / next-task-prompt（3D 建议）。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `src/mock/roomWorkbook.js` | XLSX 表头与行 |
| `src/mock/fixtures/room.js` | `exportDemoRooms` |
| `src/mock/handlers/room.js` | 开放 export |
| `src/views/room/Room.vue` | 演示导出 |
| `tests/unit/demo/room-export.spec.js` 等 | 覆盖 |
| `scripts/check-demo-room-3c.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 契约/指南/STATUS/下一刀 |

### 验证

- `npm run test:demo`：25 套 / 139 项通过。
- `$env:DEMO_PORT='8089'; npm run test:demo:room:3c`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：筛选后导出全部匹配行（含空结果仅表头）。
- **不能用**：导入；房间增删改/批量/绑定写。

### 设计决定

- 导出筛选与 `listRooms` 共用，避免第二套口径。
- 演示 payload 显式带 `dashboardItem` 位置字段（原页面只传 `items` 会丢楼层筛）。

### 未验证

- 未跑生产构建 / 全站回归。
- 未人工点选位置抽屉后再导出（脚本用关键词筛）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`（3D 建议）。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通房间管理筛选导出演示`。


## 2026-10-01 — 房间管理 3D：未监测设备 Tab

### 做了什么

- 验收路径：设备管理手填新增（`instrumentCreated` / `imported:true`）→ 房间 A 详情「未监测设备」可见；已上图仍为 6。
- 单测 `room-unmonitored.spec.js`；浏览器 `test:demo:room:3d`（经设备管理真实新增，非直接打 API），证据 `docs/evidence/room-management-3d`。
- 无新增冷启动未上图种子（避免打乱设备列表 total=12）。
- 更新契约 / demo-guide / next-task-prompt（停刀或绑定写建议）。

### 修改文件

| 路径 | 作用 |
| --- | --- |
| `tests/unit/demo/room-unmonitored.spec.js` | 冷空 + 新增后 monitor=2 |
| `scripts/check-demo-room-3d.cjs`、`package.json` | 浏览器验收 |
| `docs/*` | 契约/指南/STATUS/下一刀 |

### 验证

- `npx vue-cli-service test:unit --testPathPattern=room-unmonitored`：2 项通过。
- `$env:DEMO_PORT='8089'; npm run test:demo:room:3d`：通过；externalAttempts=0。

### 可用 / 不能用

- **可用**：空间归属未上图仪器出现在房间「未监测设备」；与已上图 Tab 互斥。
- **不能用**：房间侧新增/绑定写；未监测冷启动种子。

### 设计决定

- 复用 2G `instrumentCreated`，不另造房间侧创建入口。
- 浏览器脚本从 `.room-drawer .el-tabs` 上溯找 MonitorEquipment（全树 walk 在经设备管理后过大且 CDP 不能 `returnByValue` 组件实例）。

### 未验证

- 未跑生产构建 / 全站 `test:demo` 全量（本轮仅 3D 相关单测 + 浏览器）。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`。未执行。未暂存/提交/推送。
- 建议 commit：`feat: 接通房间未监测设备 Tab 演示`。


## 2026-10-01 — 房间管理 3D 补丁：未监测分类 type 过滤

### 做了什么

- `listInstruments` 补齐 `body.type`（房间详情分类按钮：4=全部，1/2/3=分类），此前忽略导致 Tab 切换列表不变。
- 单测覆盖；契约补一句。

### 验证

- `room-unmonitored.spec.js`：3 项通过。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议随 3D 一并 commit，或单独：`fix: 房间未监测设备按分类 type 过滤`。


## 2026-10-01 — 房间管理模块复盘（3A–3D）

### 做了什么

- 只读复盘 3A–3D：入口、列表/统计、详情、已上图/未监测、硬件反查、导出与写拒绝边界。
- 复跑房间相关单测 4 套 / 15 项通过；未重跑浏览器、未改业务源码。
- 产出 `docs/review-room-management-module.md`；`next-task-prompt.md` 改为切模块 / 慎选房间绑定写。

### 可用 / 不能用（复盘结论）

- **可用**：房间读演示主路径（列表→详情→仪器双 Tab→硬件只读→导出）。
- **不能用**：房间 CRUD/导入；房间侧绑定写；房间级探头/报警/巡查。

### 下一步

- 本轮停止。下一提示词：`docs/next-task-prompt.md`。未执行。未暂存/提交/推送。
- 建议 commit（文档）：`docs: 房间管理 3A–3D 模块复盘`。

## 房间管理独立复核（2026-10-01）

- HEAD 6989a34；保留已有 STATUS / next-task-prompt 修改及未跟踪复盘报告。
- 全量 demo 单测26套142项通过。临时补测编辑分类后房间筛选，预期命中行政分类但实际未命中，临时文件已移除；首次组件补测受 Jest require.context 限制，不作为分页问题的动态证据。
- 三项P2：已上图分类过滤旧实体；未监测换分类/搜索沿用旧页码；卡片素材键拼为文件接口URL而未走SVG映射。详见复盘报告顶部。
- 查看已有3D截图；未重跑浏览器、未跑生产构建、未验证实时图片响应。分类错误已单测复现；分页与素材为源码及既有截图核实。
- 本轮仅维护三份文档，无业务修改、依赖安装、提交推送。下一最小任务为这三项收尾，交另AI，不直接跳模块。

## 房间三项修复完成（2026-10-01）

- 修改fixtures/room.js先resolveInstrumentEntity再分类过滤；MonitorEquipment.vue搜索、分类、Tab回第一页，分页保留页码；图片复用demoDeviceUrl映射；EquipmentCard.vue无素材显示暂无图片。
- 补room-unmonitored.spec.js编辑后分类归属回归；修改check-demo-room-3d.cjs验证六张SVG加载、第二页切分类/搜索回首页。26套143项单测通过，8090演示编译和3D浏览器通过externalAttempts=0，已查看并更新3D截图；git diff --check通过。
- 页码2由脚本设置以构造回归前提，实际点击分类与搜索；编辑分类分支由单测验证。未跑生产构建、全站浏览器、真实后端或其它浏览器。
- 同步复盘、契约、指南及下一任务。下一任务为数据统计4A总览与告警统计只读演示，交另AI；本轮未修改统计模块。
- 未安装依赖、未提交推送。建议commit：fix: 修复房间设备分类筛选分页与素材展示。

## 2026-10-01 — 数据统计 4A（总览与告警只读）

### 做了什么

- 契约 `docs/statistics-4a-contract.md`：钉死 overview / alarm/overview / equipment/alarm 字段与当前状态 vs 历史告警口径。
- Mock：`fixtures/statistic.js` + `handlers/statistic.js`；复用活跃仪器、房间 dashboard、硬件种子与共享告警（仪器报警记录处理、硬件阈值/离线告警处理影响环/柱）。
- 放行 `/ds/statistics`（permission + DEMO_MENUS）；`Statistics.vue` 隐藏利用率/电量/排行/状态饼图且不发未接请求；硬件卡跳转修正为 `/lhd/hardware/home`。
- 单测 `statistics-4a.spec.js`；浏览器 `test:demo:statistics:4a`，证据 `docs/evidence/statistics-4a`。

### 验证

- `npm run test:demo -- --watch=false`：27 套 / 149 项通过。
- 演示编译 `http://127.0.0.1:8090`；`$env:DEMO_PORT='8090'; npm run test:demo:statistics:4a` → `externalAttempts=0`。
- 未跑生产构建、全站浏览器回归、真实后端。

### 可用 / 不能用

- **可用**：首页「数据统计」→ 总览三卡 + 报警三环 + 硬件告警柱图；增删仪器与告警处理影响对应统计。
- **不能用**：设备状态饼图、使用统计、使用率排行、电量、`/ds/device/chart`。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`feat: 接通数据统计总览与告警只读演示`。
- 下一提示词：`docs/next-task-prompt.md`（4B 设备状态饼图）。

## 2026-10-01 — 数据统计 4B（设备状态饼图）

### 做了什么

- 契约 `docs/statistics-4b-contract.md`；Mock `GET /instrument/instrumentStatistics`（活跃仪器 LABSTATUS 0/1/2 分桶）。
- `Statistics.vue` 单独开放状态饼图；使用统计/使用率仍 `showDeferredStats=false`。
- 单测 `statistics-4b.spec.js`；浏览器 `test:demo:statistics:4b`，证据 `docs/evidence/statistics-4b`。

### 验证

- `npm run test:demo -- --watch=false`：28 套 / 152 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:4b` → `externalAttempts=0`。
- 未跑生产构建、全站浏览器、真实后端。

### 可用 / 不能用

- **可用**：4A + 设备状态三环（默认全工作中；删机同步；告警/离线场景三环为 0 不造正常）。
- **不能用**：使用统计、使用率排行、电量、`/ds/device/chart`。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`feat: 接通数据统计设备状态饼图演示`。
- 下一提示词：`docs/next-task-prompt.md`（4C 设备使用统计）。

## 2026-10-01 — 数据统计 4C（设备使用统计）

### 做了什么

- 契约 `docs/statistics-4c-contract.md`；Mock `GET /statistic/instrument/use`（活跃仪器 + 演示时钟窗口派生时长/次数；电量维度空列表；UI 去掉电量按钮）。
- `Statistics.vue` 开放使用统计条图；使用率排行仍隐藏。
- 单测 `statistics-4c.spec.js`；浏览器 `test:demo:statistics:4c`，证据 `docs/evidence/statistics-4c`。

### 验证

- `npm run test:demo -- --watch=false`：29 套 / 155 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:4c` → `externalAttempts=0`。
- 未跑生产构建、全站浏览器、真实后端。

### 可用 / 不能用

- **可用**：4A/4B + 使用统计（时长/次数、日周月、类型筛；行政/IT 可空）。
- **不能用**：使用率排行、真实电量、`/ds/device/chart`。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`feat: 接通数据统计设备使用统计演示`。
- 下一提示词：`docs/next-task-prompt.md`（4D 使用率排行）。

## 2026-10-01 — 数据统计 4D（设备使用率排行）

### 做了什么

- 契约 `docs/statistics-4d-contract.md`；Mock `GET /statistic/instrument/useRanking`（`items` 为数组；工作日/自然日/时段派生）。
- `Statistics.vue` 开放使用率排行表与高级查询；去掉 `showDeferredStats` 门闸。
- 单测 `statistics-4d.spec.js`；浏览器 `test:demo:statistics:4d`。

### 验证

- `npm run test:demo -- --watch=false`：30 套 / 158 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:4d` → `externalAttempts=0`；证据 `docs/evidence/statistics-4d`。
- 未跑生产构建、全站浏览器、真实后端。

### 可用 / 不能用

- **可用**：`/ds/statistics` 主路径 4A–4D。
- **不能用**：真实电量、`/ds/device/chart`、导出。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`feat: 接通数据统计设备使用率排行演示`。
- 下一提示词：`docs/next-task-prompt.md`（电量或高级统计页可选）。

## 2026-10-01 — 数据统计 4E（使用统计功耗维度）

### 做了什么

- 契约 `docs/statistics-4e-contract.md`：计量源 = 演示铭牌 kW（按 assetKey）× 4C 派生使用小时；禁止全 0 冒充。
- Mock：`GET /statistic/instrument/use?queryType=2` 返回正 `electricPower`；时长/次数行同步带功耗字段。
- `Statistics.vue` 恢复「功耗」维度按钮；未注册 `/statistic/electricity*`。
- 单测 `statistics-4e.spec.js`；浏览器 `test:demo:statistics:4e`。

### 验证

- `npm run test:demo -- --watch=false`：31 套 / 161 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:4e` → `externalAttempts=0`；证据 `docs/evidence/statistics-4e`。
- 未跑生产构建、全站浏览器、真实后端。

### 可用 / 不能用

- **可用**：`/ds/statistics` 4A–4E（含功耗条图）。
- **不能用**：真实电表、`/statistic/electricity*`、`/ds/device/chart`、导出。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`feat: 接通数据统计设备功耗维度演示`。
- 下一提示词：`docs/next-task-prompt.md`（高级统计页或其他模块可选）。

# 数据统计复盘补记（2026-10-01）

- 基线 3cc1969；仅修改本 STATUS、review-statistics-module.md、next-task-prompt.md，未改业务源码、未提交或推送。
- 验证：独立全量单测 31 套 / 161 项通过；日期处理方法传 null 复现 TypeError，数字零点默认值错误已确认。
- 未验证：本轮浏览器、生产构建、真实后端、全站行为。
- 设计决定：先收尾日期清空、非法区间回退、零点回显；保留现有派生 Mock，建议页面说明模拟统计及估算能耗。
- 下一最小任务：next-task-prompt 的 S1，完成后停止，再分别处理 S2–S4。完整文件依据见 review-statistics-module.md。

## 2026-10-01 — 数据统计 S1（自定义日期清空）

### 做了什么

- `Statistics.vue`：`handleUserTime` / `handleEquipmentData` 在清空或非法区间时恢复 `dateType=1`、清空 begin/end，再请求；不再直接读 `val[0]/val[1]`。
- 抽出 `utils/statisticCustomRange.js`；`ChartDimension` 去掉 `@close` 重复触发，并对同值去重 emit。
- 单测 `statistics-s1.spec.js`；浏览器 `test:demo:statistics:s1`。

### 验证

- `npm run test:demo -- --watch=false`：32 套 / 166 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:s1` → `externalAttempts=0`；证据 `docs/evidence/statistics-s1`。
- 未跑生产构建、全站浏览器、真实后端。

### 设计决定

- 清空后统一回到默认「日」（`dateType=1`），与冷启动一致；与 LabDeviceDrawer「清空回维度」同思路。
- 共享 ChartDimension 只去重/去掉 close，不改其它业务页清空语义（transport 等仍可能有同类 bug，本轮不做）。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`fix: 数据统计自定义日期清空恢复日维度`。
- 下一提示词：`docs/next-task-prompt.md`（S2 无效区间校验）。

## 2026-10-02 — 数据统计 S2（无效日期/小时区间校验）

### 做了什么

- 共用校验 `src/utils/statisticRangeValidate.js`：区分未指定与缺一端/非法/逆序；日期与时段分别拒绝。
- Mock：`statistic.js` 非法区间抛错（禁止静默回退默认天/全天）；handlers 返回 `failure`。
- 前端：`Statistics.vue` 自定义日期与高级查询前校验并 `$message.error`；`UseRanHighSearch` 提交前校验逆序时段（不改零点回显，留给 S3）。
- 单测 `statistics-s2.spec.js`；浏览器 `test:demo:statistics:s2`。

### 验证

- `npm run test:demo -- --watch=false`：33 套 / 172 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:s2` → `externalAttempts=0`；证据 `docs/evidence/statistics-s2`。
- 未跑生产构建、全站浏览器、真实后端。

### 设计决定

- 两端皆空 = 未指定（走 dateType / 全天）；一端有值必须成对且 begin≤end。
- 零点 `obj.end || 23` 仍属 S3，本轮未改。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`fix: 数据统计拒绝无效日期与时段区间`。
- 下一提示词：`docs/next-task-prompt.md`（S3 零点回显）。

## 2026-10-02 — 数据统计 S3（零点小时回显）

### 做了什么

- `formatStatisticHourOption`：空才回退默认；数字 `0` / `"00"` 保持 `"00"`，不再被 `|| 23` 吞掉。
- `UseRanHighSearch`：小时选项统一为零填充字符串 `"00"`–`"23"`；提交与重新打开回显一致。
- 单测 `statistics-s3.spec.js`；浏览器 `test:demo:statistics:s3`。

### 验证

- `npm run test:demo -- --watch=false`：34 套 / 175 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:s3` → `externalAttempts=0`；证据 `docs/evidence/statistics-s3`。
- 未跑生产构建、全站浏览器、真实后端。

### 设计决定

- 仅修空值判断与选项类型；S2 区间校验保持不变。页面「模拟统计」文案留给 S4。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`fix: 数据统计高级查询零点小时回显`。
- 下一提示词：`docs/next-task-prompt.md`（S4 模拟统计说明）。

## 2026-10-02 — 数据统计 S4（模拟统计说明）

### 做了什么

- `Statistics.vue` 页顶标注「模拟统计」；使用统计区标注「估算能耗（kWh）」口径。
- i18n `demoSimNote` / `demoEnergyNote`（中英文）；`demo-guide` 同步说明。
- 单测 `statistics-s4.spec.js`；浏览器 `test:demo:statistics:s4`。

### 验证

- `npm run test:demo -- --watch=false`：35 套 / 176 项通过。
- `$env:DEMO_PORT='8090'; npm run test:demo:statistics:s4` → `externalAttempts=0`；证据 `docs/evidence/statistics-s4`。
- 未跑生产构建、全站浏览器、真实后端。

### 设计决定

- 仅轻量文案，不改 4A–4E 派生口径与接口。

### 下一步

- 本轮停止。未暂存/提交/推送。
- 建议 commit：`docs: 数据统计页标注模拟统计与估算能耗`。
- 数据统计 S1–S4 收尾完成；下一提示词可再选新模块（如 `/ds/device/chart` 或其他）。
