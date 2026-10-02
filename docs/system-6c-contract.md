# 部门与员工管理 6C —— 离职及角色调整

核对与交付日期：2026-10-02。依据 `Department.vue` 离职、`Modal.vue` CROLE、`api/user`（`postLeaveJob` / `updateUserRole`）；在 6B 之上开放离职与独立改角色。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 行内/批量离职 | **已开放** → `POST /user/delete/batch` |
| 行内「变更角色」+ Modal `CROLE` | **已开放** → `POST /user/update/role` |
| 列表不再显示已离职员工 | **已开放**（tombstone） |
| 设备负责人 / 维保申请人选项 | **同源活跃池**（不含已离职） |
| 维保历史申请人姓名 | **仍可按 id 解析**（含已离职） |
| 导入/导出、部门树写、变更部门、权限分配 | **仍不开放** |
| 演示登录身份 `DEMO_USER` | **不修改**；不可对其离职或改角色 |

## `POST /user/delete/batch`

会话保护。Body：`{ ids: number[] }`（页面实际）。

| 规则 | 说明 |
| --- | --- |
| 不可含 `900001`（演示登录） | 明确失败，不写 |
| 须为现存活跃员工 | 已离职或不存在 → 失败 |
| 成功 | `staffMeta[id].left=true`，`editFlag=0`；列表与活跃池过滤 |

不物理删除种子/created 记录，避免维保快照姓名丢失。本演示**不**实现 i18n 文案中的设备自动解绑（前端未另调解绑接口）。

## `POST /user/update/role`

会话保护。Body：`{ id, roleId }`（`roleId` 可为数字或数组，对齐 Modal 多选）。

| 规则 | 说明 |
| --- | --- |
| 不可改 `900001` | 明确失败 |
| 目标须属 `DEMO_ROLES` | 非法失败 |
| 已离职不可改 | 明确失败 |
| 成功 | `staffMeta` 写 `roleId` / `roleName`（取首个为主角色供列表） |

## UI

- 操作列增加「变更角色」；离职按钮演示态可用（保留 `editFlag===0`）。
- Modal 对 `CROLE` 走 `updateUserRole`，不再误走 `updateUserBasic`。
- 导入/导出/新增部门/部门树写仍禁用。

## 验证

- 单测：`system-6c.spec.js`；全量 `test:demo`。
- 浏览器：`test:demo:system:6c`；证据 `docs/evidence/system-6c`。
