# 数据统计 4B —— 设备状态饼图只读演示

核对与交付日期：2026-10-01。依据 `EquipmentStateStasticalPie.vue`、`api/labDevice` 的 `getinstrumentStatistics`，在 4A 页面上有限开放状态饼图。利用率/电量/排行仍不开放。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 4A 总览 + 告警 | **保持**（不重做） |
| 「设备状态统计」`EquipmentStatePieCharts` | **已开放** |
| `GET /instrument/instrumentStatistics` | **已开放** |
| 使用统计 / 使用率排行 / 电量 | **4C 已开放使用统计**；排行/电量仍隐藏 |

## 入口与组件

| 项 | 路径 |
| --- | --- |
| 页面 | `/ds/statistics` → `Statistics.vue`（4B 单独挂载饼图；`showDeferredStats` 仍为 false） |
| 组件 | `views/labDevice/components/EquipmentStateStasticalPie.vue` |
| API | `GET /instrument/instrumentStatistics`（`getinstrumentStatistics({})`，无业务查询参数） |
| UI 字段 | `runCount` → 工作中；`standbyCount` → 待机；`closeCount` → 已关机；`totalCount` → 总数 |

组件成功时用接口字段覆写 `num`；失败/`code!==1` 时 `total=0` 且 `num` 保持 0（**不**回退虚构「全正常」）。

## 聚合口径（活跃仪器运行状态）

源：`listActiveInstrumentSeeds()` → `buildInstrumentRow`（与列表 / `GET /statistic/overview` 仪器总数同源）。

依据 `utils/constant.js` `LABSTATUS` 注释：`0` 已关机、`1` 运行中、`2` 待机中。

| 返回字段 | 判定 |
| --- | --- |
| `totalCount` | 活跃仪器行数（= overview `instrumentTotal`） |
| `runCount` | `status === 1`（= overview `instrumentNormalCount`，在当前仅场景驱动 status 时成立） |
| `standbyCount` | `status === 2` |
| `closeCount` | `status === 0` |

**非 0/1/2 的 status**（演示场景告警 `-1`、离线 `-100`，以及维护 `3` / 缺省 `4`）：**计入 `totalCount`，不计入三环**。因此场景切到告警/离线时，三环可为 0 而总数仍 >0——这是明确空态，禁止把未分桶行改写成「正常」。

增删仪器后：`totalCount` 与对应分桶同步变化。

## 与 4A overview 关系

| overview 字段 | 本接口 |
| --- | --- |
| `instrumentTotal` | `totalCount` |
| `instrumentNormalCount`（status===1） | `runCount` |
| `instrumentAlarmCount` / `OffLineCount` | **无**对应环；不并入 standby/close |

## 验收要点

1. 统计页可见「设备状态统计」三环；使用统计/使用率仍不可见。
2. 默认场景：`runCount === totalCount === 12`，standby/close 为 0。
3. 删除一台未绑定仪器后 `totalCount`/`runCount` 减 1。
4. 场景告警：`totalCount` 仍为活跃数，三环为 0（不回退全正常）。
5. 未登录 `code===2`；浏览器 `externalAttempts===0`。

## 4C 建议（不本轮实现）

设备使用统计条形图（`GET /statistic/instrument/use`），或补齐运行态与告警/离线场景的可演示映射（须单独契约，避免 silently 把 `-1` 算成关机）。
