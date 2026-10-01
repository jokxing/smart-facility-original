# 数据统计 4C —— 设备使用统计只读演示

核对与交付日期：2026-10-01。依据 `Statistics.vue` 的 `handleEquipmentUsers` / `getStatisticInstrumentUse`；在 4A/4B 之上开放使用统计条形图。**不**开放使用率排行、电量统计、导出。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 4A 总览 + 告警、4B 状态饼图 | **保持** |
| 「设备使用统计」ChartDimension + ve-bar | **已开放** |
| `GET /statistic/instrument/use` | **已开放** |
| 维度：时长（`queryType=0`）、次数（`queryType=1`） | **已开放** |
| 维度：电量（原 `queryType=2`） | **UI 去掉**；若仍请求则 `instrumentUseList: []` |
| 设备类型筛：全部 / 实验室 / 行政 / IT | **已开放**（IT 无种子 → 空态） |
| 时间：日/周/月预设 + 自定义区间 | **已开放**（演示时钟） |
| 使用率排行 | **仍隐藏**；不发 `useRanking` |

## 请求（页面实际拼装 `equipmentUse`）

`GET /statistic/instrument/use`，查询参数：

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `dateType` | `1` | `1` 日 / `2` 周 / `3` 月；自定义时间时页面置 `null` |
| `beginTime` / `endTime` | `""` | 自定义区间，`YYYY-MM-DD HH:mm:ss`；与 `dateType` 二选一 |
| `queryType` | `0` | `0` 时长秒 `useTime`；`1` 次数 `useCount`；`2` 电量 → 空列表 |
| `type` | `0` | `0` 全部；`1` `types===1` 实验室；`2` `types===2` 行政；`3` IT（无实体 → 空） |
| `pageNum` / `pageSize` | 1 / 10 | 本切片**忽略分页**，返回筛选后全部行（图用） |

会话保护：未登录 `code===2`。

## 响应

成功 `items`：

```text
{ instrumentUseList: [{ instrumentName, useTime, useCount, electricPower }] }
```

| 字段 | 口径 |
| --- | --- |
| `instrumentName` | 活跃仪器 `name` |
| `useTime` | 秒；`workingHours × 窗口天数 × 3600 × 稳定因子(id)`，再取整 |
| `useCount` | 次；`max(1, round(天数 × (1 + id%5)))`（窗口≥1 天） |
| `electricPower` | 固定 `0`（未计量；`queryType=2` 时整表为空） |

窗口天数：

- 有合法 `beginTime`≤`endTime`：按演示时区日历日差（至少 1）
- 否则 `dateType`：`1→1`、`2→7`、`3→30`；非法/缺省按 `1`

行集 = 活跃仪器（增删同步）经 `type` 过滤后，按当前 `queryType` 对应指标**降序**。无行 → `instrumentUseList: []` → 页面 `DataEmpty`，不回退默认条。

## 能力边界

- 使用时长/次数为**演示派生量**（共享实体 + 演示时钟窗口），不是真实插座采样；文档与演示须如实表述。
- 不接 `useRanking` / `electricity*` / 导出。
- 行政分类（`types=2`）种子默认为空；可通过设备管理改分类或新增后看到筛选变化。

## 验收要点

1. 统计页可见「设备使用统计」条图；不见使用率排行。
2. 默认：12 行、时长维度、名称来自活跃仪器。
3. `type=2` 或 `3` → 空态；删一台后行数 −1。
4. 切换次数维度列切到 `useCount`；`externalAttempts=0`。

## 4D 建议

使用率排行表（`GET /statistic/instrument/useRanking`），或真实电量维度（须独立计量源，禁止用 0 冒充）。
