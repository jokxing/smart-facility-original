# 部门与员工管理 6B —— 新增/编辑员工与校验

核对与交付日期：2026-10-02。依据 `views/system/Modal.vue`、`Department.vue`、`api/user/index.js`（`userAdd` / `updateUserBasic`）、`api/system` `getRoleList`；在 6A 只读列表之上开放员工写路径。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 新增员工按钮 + `Modal` type `USER` | **已开放** |
| 行内编辑员工 | **已开放** |
| `POST /user/add` | **已开放**；持久化 `staffCreated` |
| `POST /user/update/basic` | **已开放**；`staffMeta` overlay |
| `GET /role/list` | **最小 stub**（含「普通成员」，供 Modal 默认角色） |
| 列表可读到新建/编辑结果 | **已开放**（同源 `listAllStaff`） |
| 设备负责人 / 维保申请人选项 | **同源员工池** |
| 离职、改角色页、导入/导出、部门树写 | **仍不开放** |
| 演示登录身份 `DEMO_USER` | **不修改** |

## 实体 ID

| 实体 | ID | 源 |
| --- | --- | --- |
| 种子员工 | `900001`–`900003` | `DEMO_STAFF` |
| 新建员工 | `901101`–`901150` | `staffCreated`（满则拒） |
| 部门 | `900101` / `900102` | 不新造部门 |

## `POST /user/add`

会话保护。字段对齐 Modal 提交：

| 字段 | 规则 |
| --- | --- |
| `departmentId` | 仅 900101/900102 |
| `loginId` | 必填；`/^\w{3,18}$/`；全局唯一（大小写不敏感） |
| `pwd` | 必填；长度 6–18；**不落库** |
| `name` | 必填；2–20 字 |
| `tel` | 必填 |
| `email` | 可空；有值须过邮箱正则 |
| `roleId` | 缺省为普通成员 `2`；须属 `DEMO_ROLES` |
| `departmentName` | 接受；展示名以部门表为准 |

成功：`items: {id}`。失败明确 `code:0`，不写存储。

## `POST /user/update/basic`

会话保护。`id` 须存在（种子或 created）。`loginId` **不可改**（以当前行为准）。其余字段同新增校验；`pwd` 前端仍必填但不落库。写 `staffMeta` overlay。

## `GET /role/list`

返回 `[{id:1,name:'演示管理员'},{id:2,name:'普通成员'}]`。不开放角色管理页。

## UI

- 演示态仅放开 USER 新增/编辑；导入/导出/离职/变更部门/部门树写仍禁用。
- `/sys/user` 个人资料仍不开放。

## 验证

- 单测：`system-6b.spec.js`；全量 `test:demo`。
- 浏览器：`test:demo:system:6a`（读写边界）+ `test:demo:system:6b`；证据 `docs/evidence/system-6b`。
