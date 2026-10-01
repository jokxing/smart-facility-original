# 数据统计 4E —— 设备使用统计「功耗」维度只读演示

核对与交付日期：2026-10-01。依据 `Statistics.vue` 的 `handleUserInterval(2)` / `GET /statistic/instrument/use?queryType=2`；在 4A–4D 之上恢复功耗按钮与条图。**不**开放 `GET /statistic/electricity*`（页面无独立电量表/图调用）、导出、`/ds/device/chart`。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 4A–4D | **保持** |
| 使用统计维度「功耗」（`queryType=2`） | **已开放** |
| `GET /statistic/instrument/use` 电量列 `electricPower` | **已开放**（非空派生） |
| `GET /statistic/electricity` / `electricity/graphStat` | **未注册**（无页面入口） |

## 计量源（必须如实表述）

演示**没有**智能插座采样或真实电表。功耗为：

> **演示铭牌功率（kW，按 `assetKey`）× 同窗口派生使用时长（h）**

即 `electricPower = round(nameplateKw × (useTime / 3600) × 100) / 100`（单位 kW·h）。

| `assetKey` | 铭牌 kW |
| --- | ---: |
| `demo-device-incubator` | 0.80 |
| `demo-device-lab-refrigerator` | 0.35 |
| `demo-device-analyzer` | 0.45 |
| `demo-device-equipment-rack` | 0.60 |
| `demo-device-oscilloscope` | 0.12 |
| `demo-device-monitor-terminal` | 0.05 |
| 其它 / 缺省 | 0.20 |

`useTime` 口径与 4C 相同（`workingHours × 天数 × 3600 × factor`）。**禁止**用全 0 冒充已计量；无活跃仪器时仍返回空列表。

## 请求

同 4C：`GET /statistic/instrument/use`，`queryType=2` 时按 `electricPower` 降序；`type` / `dateType` / 自定义区间规则不变。会话保护。

## 响应

```text
{ instrumentUseList: [{ instrumentName, useTime, useCount, electricPower }] }
```

- `queryType=2`：行集非空时每行 `electricPower > 0`（有铭牌与时长）。
- `queryType=0|1`：仍返回行；`electricPower` 同步填入派生值（便于切维度），排序仍按时长/次数。

## 能力边界

- 非真实功耗；文档与演示说明须写「铭牌 × 派生时长」。
- 不接 `/statistic/electricity*`、导出、高级统计页。

## 验收要点

1. 使用统计可见「功耗」切换；切到后 columns 含 `electricPower`，默认约 12 行且值 > 0。
2. 周窗口功耗大于日窗口；删机后行数 −1。
3. `externalAttempts=0`；未登录 `code===2`。
