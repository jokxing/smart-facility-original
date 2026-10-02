# 部门与员工管理 6D —— 部门操作与跨模块联动

核对与交付日期：2026-10-02。依据 `Tree.vue`、`ModalDept.vue`、`api/department`；在 6A–6C 之上开放部门树写操作，并复盘跨模块部门一致性。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 新增部门 / 添加子部门 | **已开放** → `POST /department/add` |
| 编辑部门名称 | **已开放** → `POST /department/update` |
| 删除部门 | **已开放** → `POST /department/remove/:id`（tombstone） |
| 同级上移/下移 | **已开放** → `PUT /department/move` |
| 员工/仪器/硬件部门校验 | **扩展为活跃部门池**（含新建） |
| 导入/导出、批量变更部门、权限分配 | **仍不开放** |

## 实体 ID

| 实体 | ID | 说明 |
| --- | --- | --- |
| 种子部门 | `900101` / `900102` | 不可删除（设备/维保/房间仍引用） |
| 新建部门 | `900103`–`900150` | `departmentCreated` |

## 写接口要点

- **add**：`name` 必填 ≤26；`parentDepartmentId` 空/`undefined` → 根级；上级须存活。
- **update**：改名写入 `departmentMeta`；员工列表 `departmentName` 随部门名刷新。
- **remove**：拒绝种子部门；拒绝仍有活跃员工、子部门、活跃仪器或硬件引用；成功 `deleted:true`。
- **move**：仅同级互换 `sortIndex`。

## 验证

- 单测 `system-6d.spec.js`；复盘 `review-system-module.md`。
- 浏览器 `test:demo:system:6d`；证据 `docs/evidence/system-6d`。
- 跨模块拒删与硬件改名联动见 6E。
