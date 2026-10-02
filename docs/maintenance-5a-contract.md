# 设备维保 5A —— 列表只读演示

核对与交付日期：2026-10-02。依据 `views/maintenance/index.vue`、`api/labDevice/index.js`、`router/index.js`、`router/subRoute.js`、`utils/menuManager.js`；**不**混用资产维保 `/asset/maintenance`。

## 入口核实（不能凭名字猜）

| 路径 | 源码 | 演示 |
| --- | --- | --- |
| `/ld/maintenance` | `menuManager.js` `shebei1`「维保管理」；`subRoute.js` 映射同页。`subRoute.js` **未被工程引用**，故在 `router/index.js` 补静态路由 | **已开放**（首页卡片 + `DEMO_MENUS` 设备管理子项 + `permission.js`） |
| `/apply/maintenance` | `router/index.js` 已静态注册同一 `views/maintenance` | **不放行**（守卫拦回首页；避免双入口） |
| `/asset/maintenance` | 资产模块另一套页面 | **不开放** |

侧栏按 `path.indexOf(item.id)` 匹配：`/ld/maintenance` 归入 `ld`，因此维保必须作为设备管理子菜单，不能单独用 `/apply/maintenance`（侧栏会空）。

详情：行 `id` 是维保记录 id；抽屉用 `instrumentId`。源码 `handleSeedDetail` 在 `openTwoSystem` 时走已演示 `LabDeviceDrawer`。设备已删除时不打开旧 Drawer（会误用记录 id 打未注册接口）。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 首页「维保管理」→ `/ld/maintenance` | **已开放** |
| 侧栏 设备管理 → 维保管理 | **已开放** |
| `POST /maintenance/list` 分页/筛选 | **已开放** |
| 点名称/编号 → `LabDeviceDrawer`（存活设备） | **已开放** |
| 申请维保 `POST /maintenance/add` | **5B 已开放**（见 `maintenance-5b-contract.md`） |
| 修改下次日期 `POST /maintenance/updateMaintenance` | **5C 已开放** |
| 完成确认 `GET /maintenance/complete` | **5C 已开放** |

## 实体

| 实体 | ID | 源 |
| --- | --- | --- |
| 维保记录 | `960001`–`960014` | `fixtures/maintenance.js` 合成；**快照**设备名/编号/部门 |
| 仪器 | `970001`–`970012` | 共享 `DEMO_INSTRUMENTS`，禁止第二套设备 |
| 部门 | `900101` 运维 / `900102` 研发 | 记录上的 `departmentId` 跟申请时部门 |
| 申请人 | `DEMO_STAFF` 姓名 | `userName` / `tel` |

删除设备（`instrumentDeleted`）：列表仍展示该仪器的历史维保（快照字段），`instrumentDeleted: true`，`openTwoSystem: false`。点击名称提示已删除、不打开抽屉。不改设备删除/tombstone 逻辑。

## `POST /maintenance/list`

会话保护。请求（页面 `changeTableData` + 抽屉 Tab）：

| 字段 | 用途 |
| --- | --- |
| `keyword` | 匹配快照 `instrumentName` / `instrumentNo` / `userName` / `tel` / `remark`；空不筛 |
| `departmentId` | 部门；空、`0`、公司根节点 **不筛**（选择公司不当成部门过滤） |
| `startDate` / `endDate` | 按 **`createDate`（申请时间）** 闭区间；皆空不筛；缺一端、非法、逆序明确失败。演示页面按天选择时将结束日发送为 23:59:59 |
| `pageNum` / `pageSize` | 默认 1 / 10 |
| `instrumentId` | 设备详情维保 Tab；按记录 `instrumentId` |

成功：`{code:1, items:{list, total, pageNum, pageSize}}`。

行字段：`id, instrumentId, instrumentName, instrumentNo, userName, tel, createDate, maintenanceDate, completeDate, nextMaintenanceDate, remark, completeFlag, departmentId, openTwoSystem, instrumentDeleted`。

状态枚举（源码 `STATUSSET`，禁止自创）：

| `completeFlag` | 文案（`zh.js`） |
| --- | --- |
| `0` | 维护中（`labDevice.maintained`） |
| `1` | 维护完成（`labDevice.maintainedFin`） |

前端：关键字/部门/日期变化回第一页；清空日期后日期条件消失且不报错；换页保留筛选。

## 写操作

见 5B（add）与 5C（updateMaintenance / complete）。
