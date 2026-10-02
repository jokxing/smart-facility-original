# 设备维保 5B —— 从设备详情申请维保

核对与交付日期：2026-10-02。依据 `MaintenanceModal.vue`、`LabDeviceDrawer.vue`、`POST /maintenance/add`；在 5A 列表之上开放申请写路径。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 设备抽屉「申请维保」 | **已开放**（演示态单独按钮，不放开预约等其它写入口） |
| `POST /maintenance/add` | **已开放**；持久化 `maintenanceCreated` |
| 列表 / 详情维保 Tab 可读到新记录 | **已开放**（同源 `listMaintenances`） |
| 修改下次日期 / 完成确认 | **5C 已开放**（见 `maintenance-5c-contract.md`） |

## `POST /maintenance/add`

会话保护。请求体（页面实际字段）：

| 字段 | 规则 |
| --- | --- |
| `instrumentId` | 必须为活跃共享设备（`970xxx` 或 `instrumentCreated`）；已 tombstone → failure |
| `instrumentName` / `instrumentNo` / `departmentId` | 接受但身份以共享设备当前行为准；部门仅允许 900101/900102（非法则拒） |
| `remark` | trim；最长 50；可空 |
| `userId` | 若属 `DEMO_STAFF` 则用作申请人，否则回落演示用户 `900001` |
| `companyId` / `departmentName` | 接受但忽略 |

成功：`items: {id, instrumentId}`。新记录：

- id 段 `960101`–`960150`（满则拒）
- `completeFlag: 0`（维护中）
- `createDate` / `maintenanceDate` = 演示时钟 `DEMO_NOW`
- 名称/编号/部门为申请时快照

校验失败不写。删除设备后不可再申请；历史种子记录仍按 5A 展示。

## 导航 / UI

- 入口仍为 `/ld/maintenance` 与设备管理抽屉；不新开路由。
- 列表操作列、维保 Tab 写按钮见 5C。

## 验证

- 单测：`maintenance-5b.spec.js`；5A 中 add 不再断言拒绝。
- 浏览器：`test:demo:maintenance:5b`；证据 `docs/evidence/maintenance-5b`。
