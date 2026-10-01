# 房间管理 3A —— 列表与只读详情

三项收尾更新（2026-10-01）：已监测设备分类按当前编辑实体过滤；未监测分类/搜索/Tab切换回第一页，分页仍保留目标页；素材键通过现有resolveDeviceAssetUrl映射本地SVG，无素材显示回退。验证见STATUS最新记录。

核对与交付日期：2026-10-01。依据 `views/room/Room.vue`、`RoomDrawerNew`、`MonitorEquipment`、`api/room/index.js` 与既有空间/仪器实体；**不**开放房间增删改。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 首页「房间管理」→ `/rm/room` | **已开放**（`permission.js` + `DEMO_MENUS`） |
| `POST /room/list` 筛选/分页 | **已开放** |
| `GET /room/dashboardV1` 统计卡 | **已开放**（仅跟位置筛选） |
| 点击名称 → `RoomDrawerNew` 只读详情 | **已开放**（`openTwoSystem` 真值） |
| 详情内关联仪器（空间归属 / 已上图） | **已开放**（读活跃 `970xxx`） |
| 详情内关联硬件只读 | **3B 已开放**（`things/newList` + 共享 bindings） |
| 筛选导出 | **3C 已开放**（`POST /room/export` → 本地 XLSX） |
| 未监测设备 Tab | **3D 已开放**（依赖 `instrumentCreated` / 设备管理新增） |
| 关联硬件类型筛选 `objType` | **隐藏**（列表筛；详情只读列表另见 3B） |
| 新增 / 编辑 / 删除 / 批量 / 导入 | **UI 隐藏** + Mock **明确拒绝** |
| 详情内探头编辑 / 报警体系 / 巡查模板 / 绑定解绑写 | **UI 隐藏**；解绑等写 **拒绝** |

## 入口（源码核实）

| 项 | 路径 |
| --- | --- |
| 首页卡片 | `utils/menuManager.js` id=`rm`，path=`/rm/room` |
| 侧栏菜单 | `fixtures/auth.js` `DEMO_MENUS` |
| 路由 | `router/index.js` `/rm/room` → `views/room/Room.vue` |
| 守卫 | `permission.js` `demoAllowed` 含 `/rm/room` |

## 实体与 ID（复用，禁止第二套）

| 实体 | ID | 源 |
| --- | --- | --- |
| 园区 | `910001` | `DEMO_SPACE` |
| 楼宇 | `920001` | 演示一号楼 |
| 楼层 | `930001` | 1F（有平面） |
| 房间 | `950001` 演示房间 A（运维） | `DEMO_FLOOR_ROOMS` |
| | `950002` 演示走廊（运维，无仪器→未监测） | 同上 |
| | `950003` 演示房间 B（研发） | 同上 |
| 仪器 | `970001`–`970012` | `fixtures/instrument.js`；A 六台 / B 六台 / 走廊无 |
| 部门 | `900101` 运维 / `900102` 研发 | `auth.js` |

列表行、详情、楼层平面、仪器列表共用同一房间/仪器源。

## 列表契约

### `POST /room/list`

请求体（`Room.vue` 实际拼装 `items` + `dashboardItem`）：

| 字段 | 用途 |
| --- | --- |
| `keyword` | 匹配 `name` / `no`（大小写不敏感） |
| `departmentId` | 部门 id；空不筛 |
| `status` | `1` 正常 / `2` 异常 / `-100` 离线 / `3` 未监测 |
| `gardenId` / `buildingId` / `floorId` | 位置；空字符串不筛 |
| `pageNum` / `pageSize` | 分页（默认 10） |
| `objType` | **本切片忽略**（UI 已隐藏） |

**设计器兼容（必须保留）：**

- `Layout.vue` 调用 `{floorId, pageNum, pageSize}`（**无** `gardenId` / `buildingId` / `departmentId` / `status` / `objType` 键）且无 keyword → **固定空列表**（侧栏「待上图房间」）。
- 房间管理页始终带 `gardenId` 等键（可为 `""`），按 `floorId` 等正常过滤，**不**走上述空列表分支。
- 空筛选结果 `total: 0`，**不**回退全量。

成功：`items: { list, total, pageNum, pageSize }`。

行字段（表列 + 详情分叉）：

`id, name, no, departmentId, departmentName, gradenName, buildingName, floorName, gardenId, buildingId, floorId, senorStatus, createDate, remark, openTwoSystem`

- `openTwoSystem: 1` → 打开 `RoomDrawerNew`
- `senorStatus`：有活跃仪器则跟共享场景；无仪器跟房间种子（走廊为 `3` 未监测）
- `gradenName`：与页面模板拼写一致（非 gardenName）

下拉/树依赖（已有）：`GET /map/garden`、`GET /equipment/bindEquipmentType`（本切片不展示硬件筛）。

### `GET /room/dashboardV1`

查询参数：`gardenId` / `buildingId` / `floorId`（与列表位置一致；**不受** keyword/部门/status 影响）。

成功：`items: { totalNum, normalNum, policeNum, leaveNum, notMonitoringNum }`

| 字段 | 口径 |
| --- | --- |
| `totalNum` | 位置范围内房间数 |
| `normalNum` | `senorStatus === 1` |
| `policeNum` | `senorStatus === 2` |
| `leaveNum` | `senorStatus === -100` |
| `notMonitoringNum` | `senorStatus === 3` |

## 详情契约

### `GET /room/detail?id=`

已有；未知 ID → failure。字段含 `openTwoSystem: 1` 及列表同口径部门/状态/空间名。

### `GET /room/monitor/instrument?roomId=&types=`

返回该房间**已上图**仪器（布局 placement 存在且未删除），元素：

`{ id, name, logoUrl, simpleEquipments: [{ type, powerFailure, sensors }] }`

- `types`：`0`/空=全部；否则按仪器 `types` 过滤
- **空间归属但未上图**的仪器不出现在此列表（见下）

### `POST /instrument/list`（详情「未监测设备」Tab）

本切片补齐：`roomId` 单房间 + `monitor: "2"` → 仅该房间**有空间归属且未上图**的活跃仪器。空结果不回退全库。

分类按钮传 `type`：`4`/空=全部；`1` 实验室 / `2` 行政 / `3` IT，按仪器 `types` 过滤（演示种子多为 `1`，行政/IT 空属正常）。

### 探头标签

`GET /monitorIndicator/getOpenMonitorFlag|getMonitorFlag`：`objType===3` 时返回空列表/空数组（房间级探头本切片不做）；`objType===2` 仍为设备切片。

### 只读配套

| API | 行为 |
| --- | --- |
| `GET /thingsUser/list` | 空分页（已有） |
| `POST /roomReport/list` | 空分页（已有） |
| `GET /room/things/list` | 空 list（旧抽屉；3B 详情用 newList） |
| `GET /monitorIndicator/things/newList` | **3B**：`objType=3` 按房间反查共享 `equipmentBindings`（type:11） |

### 3B 房间关联硬件只读

| 项 | 说明 |
| --- | --- |
| UI | `RoomDrawerNew` 演示区展示 `BindHardwareTable`（无绑定/解绑按钮） |
| 种子 | 冷启动（bindings 键未写入）：`980010`→`950001`，`980018`→`950003`；走廊无绑定；**不**预绑 `980001` |
| 字段 | `equipmentName` / `equipmentNo`（及 id） |
| 写 | 房间侧仍隐藏；硬件详情既有绑定写路径不变 |

## 写操作（拒绝）

| API | 文案要点 |
| --- | --- |
| `POST /room/add` | 本阶段演示未开放房间新增 |
| `POST /room/update/basic` | 未开放房间编辑 |
| `POST /room/remove/:id` | 未开放房间删除 |
| `POST /room/batch/delete` | 未开放批量删除 |
| `POST /room/batch/update` | 未开放批量更新 |
| `POST /room/goods/remove` | 未开放解绑房间设备 |

### 3C 筛选导出

`POST /room/export`：与列表相同筛选（keyword/departmentId/status/gardenId/buildingId/floorId），**忽略分页**，返回本地 XLSX（工作表「房间列表」）。空筛选结果仅表头，不回退全量。导入仍未开放。

### 3D 未监测设备 Tab

| 项 | 说明 |
| --- | --- |
| 路径 | 设备管理手填新增（`POST /instrument/add` → `instrumentCreated`，`imported: true`）→ 房间详情「未监测设备」 |
| 口径 | `monitor:"2"` + `roomId`：有空间归属且未上图；不上 `GET /room/monitor/instrument` |
| 冷启动 | 房间 A/B 未监测为空（种子均已上图）；走廊始终为空 |
| UI | Tab 可切换；演示区不展示房间内「添加设备」入口 |

## 验收要点

1. 首页点「房间管理」进入列表，统计与 3 间房口径一致。
2. 关键词/部门/位置/状态筛选；清空后恢复；空结果不回退。
3. 点名称打开 `RoomDrawerNew`，可见基本信息与已上图仪器。
4. 写按钮不可见；直接打写 API 得明确失败。
5. 设计器 `{floorId}` 无 keyword 仍为空列表。
6. 单测 + 浏览器脚本；`externalAttempts=0`。
7. **3D**：设备管理新增未上图仪器后，对应房间「未监测设备」可见且已上图数不变。
