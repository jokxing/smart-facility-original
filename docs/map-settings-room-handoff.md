# 交给另 AI：地图设置房间列表与配置入口收尾

工作区：`E:\project\smart-facility-original`，平台 `smart-facility-platform`。
先读 PROJECT_CONTEXT、适用 AGENTS、STATUS 文末、`docs/map-m3-contract.md`、`docs/map-m4-contract.md`、`docs/map-m5-contract.md`。用户授权本批实现，不必再确认常规代码修改。仅修改平台和 docs，保留工作区已有改动；不新增依赖、不部署、不 commit/push、不改 Git 历史、不接入旧外部服务、不改生产接口与非演示行为。保持 Vue 2。

## 已确认的问题

地图设置 `/ms/mapSet`，树点击楼层 1F 后：
1. `MapSettings.vue.handleRoomList` 调用 `GET /map/lab?floorId=930001`，演示 Mock 未实现，提示当前演示未接入接口。
2. 列表请求无 catch/finally，失败时 loading 不结束；楼层快速切换有旧请求覆盖风险。
3. 演示配置按钮统一被隐藏，房间没有进入设备布局配置的入口。

## 实现范围

1. 接通演示 GET `/map/lab` 的按楼层房间列表。复用 `src/mock/fixtures/room.js` 当前业务房间、归属及媒体数据，核对 `allDemoRoomRows` 等现有导出；不要再建房间种子、独立存储或只读取已布局房间。未在楼层画布放置的房间也属于列表。适配表格现有字段 `labId/labName/labMapUrl` 与部门、楼层、楼宇、园区列，明确返回结构为 items 数组。未知/空楼层按明确契约处理，不能回退默认楼层；不要顺带开放 floorId=0 的旧绑定业务。
2. 房间新增、改名、底图变更、删除、楼层归属变更后，重新进入/刷新列表读取同一业务来源，与房间管理及中控地图一致。
3. 房间底图预览继续使用现有 `handlePreviewImg`、`resolveRoomMapUrl`、本地媒体缓存。内置 SVG 和已上传媒体均可预览；无底图明确显示“未设置”，不提供无效预览链接。底图名称与文字动态展示，不修改 SVG。
4. 演示房间行补“配置设备”按钮，使用真实 roomId、roomName 进入 `/room/designer`，复用 M5 配置逻辑。无底图时按钮禁用并给简短说明。核对返回来源，配置退出/保存沿用已定义行为，不重写设计器。现有楼层配置入口若仍隐藏，本批不扩大开放它。
5. 列表请求补返回码判断、异常处理、结束加载。先核对 get 请求封装错误消息，避免双重提示。覆盖园区、楼宇、楼层列表共用的请求路径，建议请求序号保障最新点击获胜：旧请求既不能覆盖数据，也不能提前关闭新请求 loading。组件销毁后不写状态。失败显示可重试入口或明确失败状态，不能永久 loading 或把失败冒充“暂无数据”。空成功结果正常显示暂无数据。
6. 房间新增/编辑/删除统一留在 `/rm/room`，地图设置不开放旧房间绑定/解绑、园区楼宇 CRUD、楼层删除等业务。继续保留“返回房间管理”。可加轻量入口或说明引导维护房间，不重复建立 CRUD。

## 验证与验收

- 有针对性测试：按楼层查询、未知楼层为空、未布局房间仍出现、实体变更后同步；模拟失败 loading 结束、快速 A→B 切换后只有 B 数据。
- 本地浏览器从地图设置实际点击楼宇→1F：显示当前房间，表格归属字段正确，无未接入提示。切换无房间楼层，正确空结果。
- 内置与上传底图预览；无图行提示。点击配置进入正确房间，验证返回/退出，不破坏原 M5 的保存与空布局逻辑。
- 实际请求失败后显示失败可重试，重试恢复；快速切换楼层无串数据。
- 运行 `npm run test:demo -- --watch=false --silent`。当前基线 52 套、259 项，若现有测试断言旧口径，应依据当前契约修正，不能删失败测试掩盖问题。
- 浏览器用独立本地端口和隔离 profile，不干扰用户正在使用的浏览器/服务；沿用已有脚本模式拦截外部请求并要求外部请求为 0。不输出敏感地址、Key 或大块日志。

完成后更新 STATUS 文末和本交接文档：实际修改文件、数据契约、测试结果、证据路径、未验证项。给原 AI 一份精简完成清单便于复盘；不要给用户 commit 信息或自行提交，原 AI 复盘修复闭环后统一提供。只完成本批，其他模块继续后置。

## 完成记录（2026-10-04）

### 修改文件（平台）
- `src/mock/fixtures/room.js`：新增 `listMapLabsByFloorId`，投影 `allDemoRoomRows`
- `src/mock/handlers/map.js`：`GET /map/lab`
- `src/utils/demoRequestSeq.js`：请求序号锁
- `src/views/mapSettings/MapSettings.vue`：列表错误/重试/序号、底图未设置、演示「配置设备」
- `tests/unit/demo/map-settings-room.spec.js`
- `scripts/check-demo-map-settings-room.cjs`
- `package.json`：`test:demo:map:settings`

### 文档
- 本文件、`docs/STATUS.md`、`docs/demo-guide.md`

### 数据契约 `GET /map/lab?floorId=`
成功 `{code:1, items:[{labId, labName, labMapUrl, departmentName, floorName, buildingName, gardenName}]}`。
- 该层全部业务房间（含未布局）；内置底图缺 `mapUrl` 时用 `DEMO_ROOM_BACKGROUND_BY_ID`
- 缺/非法 `floorId`：`code:0`，不回退默认楼层
- 未知或无房间楼层：`code:1, items:[]`
- `floorId=0`：`items:[]`，不开放未绑定列表；`/map/bound/lab` 仍未实现

### 验证
- `npm run test:demo -- --watch=false --silent`：53 套、264 项通过
- 独立端口 8099 + 隔离 profile：1F 房间与归属、无未接入提示、走廊未设置且配置禁用、预览 A、进入/退出设计器、2F 空列表、失败可重试；外部请求 0
- 证据：`docs/evidence/map-settings-room/`

### 未验证
- 真实上传底图在本页的浏览器点击（契约与单测覆盖业务 mapUrl）；触屏；生产接口；多标签并发
- 未安装依赖、commit/push、部署

### 给原 AI 的精简清单

原 AI 复盘（2026-10-04）：265 项单测通过。地图设置房间浏览器脚本原先传入缺失 labMapUrl 的伪行，触发无图保护导致配置跳转超时；已修复为读取真实列表行，重跑通过（外部请求 0）。实际代码的无图禁用保护保留。补修房间大屏：删除无功能的禁用“房间展示设置（只读）”占位按钮，基本信息名称改为楼宇与楼层组合；大屏浏览器回归通过（外部请求 0）。真实上传底图的本页浏览器验收仍未覆盖，不能将此项称为已验证。未提交或推送。
1. Mock 接通 `GET /map/lab`，同源 `allDemoRoomRows`，未布局也出现。
2. 地图设置演示行「配置设备」→ `/room/designer`；无底图禁用；楼层配置仍隐藏。
3. 园区/楼宇/楼层/房间列表共用序号锁：旧请求不盖数据、不提前关 loading；失败可重试，空成功仍「暂无数据」。
4. CRUD 仍在 `/rm/room`；保留返回房间管理。
5. 单测 53/264；浏览器证据 map-settings-room；外部请求 0。
