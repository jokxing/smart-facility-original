# 数据统计 4D —— 设备使用率排行只读演示

核对与交付日期：2026-10-01。依据 `Statistics.vue` 的 `handleGetInstrumentUserRanKing` / `getStatisticInstrumentUseRanKing`；在 4A–4C 之上开放使用率排行表。**不**开放电量、导出、`/ds/device/chart`。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 4A–4C | **保持** |
| 「设备使用率统计」表 + ChartDimension + 高级查询弹层 | **已开放** |
| `GET /statistic/instrument/useRanking` | **已开放** |
| 电量 / 导出 / 高级统计页 | **未开放** |

## 请求（页面 `useRanKing`）

| 字段 | 默认 | 含义 |
| --- | --- | --- |
| `queryType` | `1` | `1` 设备使用率；`2` 日使用率；`3` 平均日使用率（演示均派生，口径见下） |
| `dateType` | `1` | `1` 日 / `2` 周 / `3` 月；自定义日期时置 `null` |
| `beginTime` / `endTime` | `""` | 自定义日历区间 |
| `periodType` | `1` | `1` 工作日；`2` 自然日（可用工时基数不同） |
| `periodBeginTime` / `periodEndTime` | `""` | 高级查询日内时段（小时 `"00"`–`"23"`）；空则全天 |

会话保护。页面底部分页控件仍绑 `equipmentPowerItems`（历史电量残留），**本切片不驱动分页**，一次返回全部活跃仪器行。

## 响应

成功时 `items` 为**数组**（页面 `this.useRanKings = res.items`）：

```text
[{ instrumentName, useRate, variationRate, changed }]
```

| 字段 | 口径 |
| --- | --- |
| `instrumentName` | 活跃仪器 `name` |
| `useRate` | `0–100` 数值（进度条按百分数用，不是 0–1） |
| `variationRate` | 环比变化百分点（演示派生，可为负） |
| `changed` | `variationRate >= 0` → `true`（↑），否则 `false`（↓） |

### 派生公式（演示，非真实计量）

与 4C 同源：活跃仪器 + `workingHours`（默认 7.5）+ id 稳定因子 `factor = 0.5 + (id%7)/10`。

1. 窗口天数：同 4C（自定义区间或 `dateType` 1/7/30）。
2. 日内时段：若 `periodBeginTime`/`periodEndTime` 可解析为小时，则 `hourSpan = max(1, endH - beginH + 1)`（不跨日）；否则全天。
3. 可用工时基数：`periodType===1` → `workingHours`；`periodType===2` → `24`。时段缩放 `hourSpan / base`（≤1）。
4. `useRate = min(100, round(factor * (workingHours / base) * hourScale * 100))`  
   - `queryType===2|3`：在上式基础上再按日均语义微调（`queryType===3` 再 ×0.95 取整），避免三档完全同一数，但仍可复算。
5. `variationRate = (id % 11) - 5`（整数 −5…+5）。

无活跃仪器 → `items: []`（空表），不回退假排行。增删仪器后行数与名称同步。

## 验收要点

1. 统计页可见使用率表；默认 12 行、含 `useRate` 进度条。
2. 删一台后行数 11；切换工作日/自然日或 queryType 可复算。
3. 高级查询改时段后请求带 `periodBeginTime`/`periodEndTime`。
4. `externalAttempts=0`；未登录 `code===2`。

## 后续建议

电量统计 / `/ds/device/chart` 高级统计页；或把排行分页与 `equipmentPowerItems` 解绑并接真实页码。
