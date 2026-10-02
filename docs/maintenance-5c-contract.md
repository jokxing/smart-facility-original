# 设备维保 5C —— 下次日期与完成确认

核对与交付日期：2026-10-02。依据列表 `Modal.vue`、`handleConfirm`、详情 `NextMintenanceTime.vue` / `TagPane` 与 `api/labDevice`。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 列表「下次维保日期」弹窗 | **已开放** |
| 列表「核查确认」 | **已开放**（已完成按钮禁用） |
| 详情维保 Tab 同名操作 | **已开放** |
| `POST /maintenance/updateMaintenance` | **已开放** → `maintenanceMeta` |
| `GET /maintenance/complete` | **已开放** → `maintenanceMeta`；已完成再确认 **拒绝** |

## `POST /maintenance/updateMaintenance`

| 字段 | 规则 |
| --- | --- |
| `maintenanceId` | 须存在于种子或 `maintenanceCreated` |
| `nextMaintenanceDate` | 必填；`parseDemoDateTime` 合法；不得早于该记录 `createDate` |

成功：`items: {id, nextMaintenanceDate}`。列表立即反映。已完成记录仍可改下次日期。

## `GET /maintenance/complete`

| 字段 | 规则 |
| --- | --- |
| `maintenanceId` | 须存在 |
| 幂等 | `completeFlag === 1` → failure「该维保已完成，无需重复确认。」 |

成功：`completeFlag: 1`，`completeDate` = 演示时钟。

## UI

- 列表操作列与 Modal 在演示态重新可见。
- 详情 Tab 操作列重新可见；`NextMintenanceTime` 提交字段改为 `data.nextMaintenanceDate`（修正源码未绑定 bug）。

## 验证

- 单测 `maintenance-5c.spec.js`
- 浏览器 `test:demo:maintenance:5c`；证据 `docs/evidence/maintenance-5c`
