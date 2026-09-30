# 设备管理 2A —— 统一仪器列表与只读详情入口

核对与交付日期：2026-09-30。依据 `views/labDevice/index.vue`、`SearchForm`、`LabDeviceDrawer` 与既有 `DEMO_INSTRUMENTS`；**不**混用智能硬件 `980xxx`。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 首页「设备管理」→ `/ld/labdevice` | **已开放** |
| `POST /instrument/list` 筛选/分页 | **已开放** |
| `GET /instrument/dashboard/new` 统计卡 | **已开放** |
| 点击名称 → `LabDeviceDrawer` 只读详情 | **已开放**（复用 `GET /instrument/detail` + 监测标签） |
| 新增/编辑/删除/批量/导入/导出/解绑 | **明确拒绝**（UI 隐藏 + Mock `failure`） |

## 实体与 ID

| 实体 | ID | 源 |
| --- | --- | --- |
| 仪器 | `970001`–`970012` | `fixtures/instrument.js` `DEMO_INSTRUMENTS` |
| 房间 | `950001` / `950003`（走廊 `950002` 无仪器） | `DEMO_FLOOR_ROOMS` |
| 分类 | `types: 1`「演示设备」 | `DEMO_CATEGORIES`（`childrenList` + `types`） |
| 部门 | `900101` 运维 / `900102` 研发 | 仪器行带 `departmentId` |
| 智能硬件 | `980xxx` | **禁止**出现在本列表 |

列表行与详情、房间布局、`/__demo/equipment/bindable?kind=instrument` 共用同一仪器源，禁止第二套同名数据。

## 列表契约

### `POST /instrument/list`

请求体（页面实际字段，节选）：

| 字段 | 用途 |
| --- | --- |
| `keyword` | 匹配 `name` / `no` / `roomName` |
| `departmentIdList` | 部门 id（字符串或数字） |
| `typesList` | 分类 `types` 值 |
| `gardenId` / `buildingId` / `floorIds` | 空间；`floorIds` 实为楼层 id（级联第三级） |
| `roomIdList` | 房间 id（侧栏选房） |
| `status` | 运行：`1` 运行；`0` 未运行（含 `-1`/`2`）；`4` 未绑定 |
| `sensorStatus` | 参数：`1` 正常；`2` 异常；`3` 其它 |
| `objType` | 关联硬件类型 code；按当前仪器绑定关系过滤 |
| `pageNum` / `pageSize` | 分页（默认 10；12 条可验两页） |
| `type` | 固定 `4`（仪器） |

成功：`items: { list, total, pageNum, pageSize }`。

行字段（表列 + 详情入口）：

`id, name, no, departmentId, departmentName, roomId, roomName, types, typeName, status, bingStatus, createDate, openTwoSystem, labelId`

- `openTwoSystem: true` → 新抽屉 `LabDeviceDrawer`
- `status` / `bingStatus` 跟共享场景 `normal|alarm|offline`（同房间布局）

### `GET /instrument/dashboard/new`

成功：`items: { totalCount, data: [{ linaType, normalCount, abnormalCount, restsCount }, ...] }`

页面可见卡仅 `linaType` **5**（运行）与 **6**（参数）。UI 映射：

- `item.normalCount ← check.abnormalCount`
- `item.abnormalCount ← check.restsCount`
- `item.totalCount ← check.normalCount`

口径（全库，不受当前筛选）：

| linaType | normalCount | abnormalCount | restsCount |
| --- | --- | --- | --- |
| 5 运行 | 运行中 `status===1` | 未运行 `0/-1/2` | 未绑定 `3/4` |
| 6 参数 | 正常 `bingStatus===1` | 异常 `2/-1` | 其它 |

## 依赖下拉

| 方法 | 路径 | Demo |
| --- | --- | --- |
| GET | `/map/garden` | 既有园区树 |
| GET | `/instrumentCategoryInfo/superior/cat` | `{name, types, childrenList}` |
| GET | `/department/list` | 既有部门 |
| GET | `/equipment/bindEquipmentType` | `EQUIPMENT_TYPE_META` → `{code,name}` |
| POST | `/room/list` | 有 `keyword` 时返回共享房间；无 keyword 保持空（设计器侧栏） |

## 写操作（拒绝）

`POST /instrument/add|update/basic|remove/:id|batch/delete|batch/update|export`，`GET /instrument/unbind` → `failure('本阶段演示未开放仪器写操作。')`。

## 导航

- `permission.js` demo 白名单增加 `/ld/labdevice`
- `DEMO_MENUS` 增加「设备管理」→ `/ld/labdevice`
- 不开放 `/ld/watchlabdevice`、`/ld/administration`、使用统计等兄弟路由

## 验证

- 单测：列表分页/筛选/统计/拒绝写/会话保护；分类与 bindable 同源
- 浏览器：证据 `docs/evidence/device-management-2a`
