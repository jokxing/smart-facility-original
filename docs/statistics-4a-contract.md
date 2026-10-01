# 数据统计 4A —— 总览与告警统计只读演示

核对与交付日期：2026-10-01。依据 `views/statistics/Statistics.vue`、`api/statistic/index.js` 与共享仪器/房间/硬件/告警实体；**不**开放利用率、电量、排行榜、导出或系统管理。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 首页「数据统计」→ `/ds/statistics` | **已开放**（`permission.js` + `DEMO_MENUS`） |
| `GET /statistic/overview` 三张总览卡 | **已开放**（当前状态聚合） |
| `GET /statistic/alarm/overview` 三环图 | **已开放**（历史告警分布） |
| `GET /statistic/equipment/alarm` 柱图 | **已开放**（智能硬件历史告警） |
| 设备状态饼图 / 使用统计 / 使用率排行 | **UI 隐藏**；不发请求 |
| `/ds/device/chart` 等兄弟路由 | **未放行** |
| 利用率 / 电量 / 分级统计 / 导出 | **未接入**；不得写成真实结果 |

## 入口（源码核实）

| 项 | 路径 |
| --- | --- |
| 首页卡片 | `utils/menuManager.js` id=`ds`，path=`/ds/statistics` |
| 侧栏菜单 | `fixtures/auth.js` `DEMO_MENUS` 增补 `ds` |
| 路由 | `router/index.js` `/ds/statistics` → `Statistics.vue` |
| 守卫 | `permission.js` `demoAllowed` 含 `/ds/statistics` |
| 总览卡跳转 | 仪器 `/ld/labdevice`；房间 `/rm/room`；硬件 **`/lhd/hardware/home`**（`init` 内已修正，避免 `/lhd/device` 被拦） |

## 实体与口径

| 实体 | ID / 源 | 总览影响 |
| --- | --- | --- |
| 仪器 | 活跃 `970xxx` + `instrumentCreated` − `instrumentDeleted` | 增删后总数与分桶变 |
| 房间 | `950001`–`950003` | CRUD 未开放；状态跟场景/有无仪器 |
| 智能硬件 | `980001`–`980026` 种子 | 本阶段无硬件增删；分桶跟种子 `status` |
| 仪器/房间历史告警 | `DEMO_ALARM_EVENTS`（thingsType 4 / 11） | 环图；仪器侧可被报警记录「已处理」排除 |
| 硬件历史告警 | `DEMO_EQUIPMENT_ALARMS` + `DEMO_EQUIPMENT_OFFLINE_ALARMS` | 环图 + 柱图；已处理（种子或 `equipmentAlarmHandles`）排除 |

### 当前状态 vs 历史告警

| 区块 | 数据性质 | 说明 |
| --- | --- | --- |
| 总览三卡 | **当前状态** | 跟演示场景 + 活跃实体；**不是**历史告警计数 |
| 报警总览三环 | **历史告警** | 按探头名/告警种类聚合；空数组 → 空态，不回退默认 |
| 智能硬件报警柱图 | **历史告警** | 按日 × 种类；空数组 → 空态 |

未实现的利用率/电量/排行榜**不得**用 Mock 编造成功率冒充真实结果。

## 接口契约

### `GET /statistic/overview`

无查询参数。会话保护。成功 `items`：

| 字段 | 口径 |
| --- | --- |
| `instrumentTotal` | 活跃仪器行数 |
| `instrumentNormalCount` | `status === 1` |
| `instrumentAlarmCount` | `status === -1` |
| `instrumentOffLineCount` | `status === -100` |
| `roomTotal` | 演示房间数（同 `getRoomDashboard({}).totalNum`） |
| `roomNormalCount` | `senorStatus === 1` |
| `roomAlarmCount` | `senorStatus === 2` |
| `roomOffLineCount` | `senorStatus === -100` |
| `equipmentTotal` | `DEMO_EQUIPMENTS.length` |
| `equipmentNormalCount` | `status === 1` |
| `equipmentAlarmCount` | `status === -1` |
| `equipmentOffLineCount` | `status === -100` |

备注：走廊等 `senorStatus === 3`（未监测）计入 `roomTotal`，不计入正常/告警/离线三桶；硬件 `status === 0` 同理只计入总数。

页面映射（`Statistics.vue`）：`total` / `normal` / `error` / `offLine`。

### `GET /statistic/alarm/overview`

无查询参数。默认窗口：演示时钟锚点往前 30 天至锚点（与大屏告警默认一致）。成功 `items`：

| 字段 | 行形状 | 来源 |
| --- | --- | --- |
| `instrumentOverview` | `{name, count}[]` | 仪器历史告警按 `sensorName`；**已处理排除** |
| `labOverview` | `{name, count}[]` | 房间历史告警按 `sensorName`；无处理链路，全计 |
| `equipmentOverview` | `{name, count}[]` | 硬件历史按种类名（`阈值` / `离线`）；**已处理排除** |

页面将 `columns` 统一为 `["name","count"]`；空数组走 `DataEmpty`。

### `GET /statistic/equipment/alarm`

无查询参数。同默认时间窗。成功 `items`：

```text
[{ lineName: "YYYY-MM-DD", data: [{ typeName, count }, ...] }, ...]
```

- `lineName`：告警开始日（演示时区日）
- `typeName`：`阈值` 或 `离线`
- 仅含仍有未处理计数的日期；全空则 `items: []`

## 页面裁剪（4A）

`Statistics.vue` 仅保留：总览标题 + 三卡、报警总览三环、智能硬件报警柱图。下列区块 `v-if` 关闭且 `init` **不调用**对应 API：

- `EquipmentStatePieCharts`（会自请求 `GET /instrument/instrumentStatistics`）
- 设备使用统计（`getStatisticInstrumentUse`）
- 设备使用率统计（`getStatisticInstrumentUseRanKing`）

## 已有 / 缺失接口

| 接口 | 4A |
| --- | --- |
| `GET /statistic/overview` | Mock 已接 |
| `GET /statistic/alarm/overview` | Mock 已接 |
| `GET /statistic/equipment/alarm` | Mock 已接 |
| `GET /statistic/instrument/use` | 未接；页面不请求 |
| `GET /statistic/instrument/useRanking` | 未接；页面不请求 |
| `GET /statistic/electricity*` | 未接 |
| `GET /statistic/status` | 未接 |
| `GET /instrument/instrumentStatistics` | 未接；饼图已卸 |

## 验收要点

1. 首页点「数据统计」进入，不弹「尚未接入」。
2. 默认场景下总览仪器/房间/硬件数量与列表/dashboard 口径一致；删一台仪器后总览仪器总数 −1。
3. 场景切告警/离线后，有仪器的房间与仪器分桶跟随；硬件种子状态不变。
4. 处理一条仪器报警记录或硬件阈值告警后，对应环/柱未处理计数下降；空则空态。
5. 未登录 `code === 2`；`externalAttempts === 0`。

## 4B 建议（不本轮实现）

设备状态饼图：接通 `GET /instrument/instrumentStatistics`（或等价），与仪器运行/待机口径对齐；仍隐藏利用率与电量。
