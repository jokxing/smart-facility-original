# 部门与员工管理 6A —— 只读演示

核对与交付日期：2026-10-02。依据 `views/system/Department.vue`、`api/user/index.js`、`api/department`、`router/index.js`、`permission.js`、`mock/fixtures/auth.js`；**不**把 `/sys/user` 当员工列表。

## 入口核实（不能凭名字猜）

| 路径 | 源码 | 演示 |
| --- | --- | --- |
| `/sys/department` | `menuManager.js`「部门与成员」；`router/index.js` → `Department.vue` | **已开放**（`DEMO_MENUS` 系统子项 + `permission.js`） |
| `/sys/user` | `User.vue` 个人资料页 | **不开放**（勿当员工管理） |
| `/sys/role` / `/sys/base` | 角色/基础设置 | **不开放** |

首页「系统」卡片在演示态改写为 `/sys/department`（`Dashboard.vue`；`menuManager` 原 path 仍是 `/sys/user`）。侧栏「系统 → 部门与成员」同路径。侧栏按 `path.indexOf(item.id)` 匹配：`/sys/department` 归入 `sys`。`slice(0,-1)` 去掉的是「地图设置」，不是系统组。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 侧栏 系统 → 部门与成员 → `/sys/department` | **已开放** |
| `GET /department/list` 部门树（只读） | **已开放**（既有 Mock） |
| `GET /user/list` 员工分页/筛选 | **已开放**（扩展既有 `listDemoStaff`，不另注册） |
| 公司根节点 `departmentId=0` 看全员 | **已开放** |
| 新增/编辑员工、离职、改角色、导出、导入 | **本轮不开放**（按钮禁用，不发请求） |
| 部门树新增/编辑/删除/排序 | **本轮不开放**（`Tree` `isHandle=false`） |
| 权限引擎 / 数据授权 | **不扩大** |
| 演示登录身份 `DEMO_USER` | **不修改** |

## 实体（禁止第二套 ID）

| 实体 | ID | 源 |
| --- | --- | --- |
| 员工 | `900001`–`900003` | `DEMO_STAFF`（与设备负责人、维保申请人同一池） |
| 部门 | `900101` 运维 / `900102` 研发 | `DEMO_DEPARTMENTS` |
| 公司 | `companyId` / `companyName` 跟 `DEMO_USER` | 列表展示用 |

## `GET /user/list`

会话保护。请求（`Department.vue` `userListParams`）：

| 字段 | 用途 |
| --- | --- |
| `departmentId` | 部门；空、`0`、公司根 **不筛** |
| `keyword` | 匹配 `name` / `loginId`；空则页面不传该字段 |
| `pageNum` / `pageSize` | 默认与页面一致（1 / 10） |

成功：`{code:1, items:{list, total, pageNum, pageSize}}`。

行字段（本轮接入）：`id, loginId, name, tel, email, isBoundWeixin, departmentId, departmentName, roleName, companyName, companyId, createDate, editFlag`。未接入字段诚实空态。

前端行为：换部门（含公司根）清 keyword 并回第一页；搜索回第一页；翻页保留 departmentId + keyword。

## 写操作

本轮全部禁用，**不**注册假成功写接口。留给 6B–6D：员工增改校验、离职与角色约束、部门操作与跨模块联动。
