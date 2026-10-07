# 运单与状态流转

SaaS 提供创建、装车、发运和送达；小程序提供列表、统计、详情、发运和送达。两端使用同 ID 合成样例与独立本地存储，不跨端实时同步。

## 实体状态机

合法顺序为 `0 → 1 → 2 → 3`：待装车 → 已装车 → 运输中 → 已送达。禁止跳状态、回退及重复操作，失败不修改记录。

| 动作 | 前置条件和结果 |
| --- | --- |
| 创建 | 收发单位存在、至少一件货、数量为正整数，生成本地运单号 |
| 分配车辆 | 校验车辆/司机；运输中被占用的资源不可分给其他运单 |
| 装车 | 仅待装车可操作，已有车辆和司机 |
| 发运 | 仅已装车可操作，同车其他已装车运单一并发运 |
| 送达 | 仅运输中可操作；没有其他已装车/运输中运单时释放车和司机 |

时间保持创建 ≤ 装车 ≤ 发运 ≤ 完成，尚未发生的阶段为空。

## 查询值与异常维度

小程序查询 `state=0` 表示**全部**，实体记录 `order.state=0` 表示**待装车**；不能直接共用同一解释。SaaS 查询 `null` 为全部。

超温 `tempOverrun` 和延迟 `delayed` 独立于运输状态，可以与运输中/已送达并存。列表读数、详情阈值和曲线同源，演示记录仪温度阈值为 2–8℃。

## 合成数据与存储

默认 10 条运单：待装车 3、已装车 2、运输中 3、已送达 2，ID 881001–881010。小程序全部数包含待装车，但无单独待装车 Tab。车辆、司机、单位及货品均为演示数据。

Web 种子相对 2026-09-24 12:00:00，小程序种子相对 2026-10-05 12:00:00（UTC+8）。近 7/30 天查询采用对应演示基准，两端不声称同一绝对日历。

`transportState` 与 `transportCreated` 保存在各端命名空间；登出不清业务操作。轨迹为模拟 GPS，打印预览仅为演示凭证；蓝牙打印、真实 GPS、电子签收及冷藏车/单位/货品管理未接入。

## 接口与代码

小程序主要接口：`GET /api/transportOrder/dashboard/wx`、`POST /api/transportOrder/list/wx`、`GET /api/transportOrder/detail/wx/:id`、状态信息读取及 `POST /api/transportOrder/change/state`。

Web 入口 `/apply/transport` 与 `/apply/transport/waybill`，提供 query、add、update、allocateCar、change/state 及详情；基础资料 CRUD 和导出未开放。

- [Web transport.js](../smart-facility-platform/src/mock/fixtures/transport.js)、[小程序 transport.js](../miniprogram/utils/demo/transport.js)。
- [Web 运单测试](../smart-facility-platform/tests/unit/demo/transport.spec.js)。
- 根目录运行 `node scripts/check-mp7-transport.cjs`。

测试覆盖状态与异常查询，不能替代车辆、硬件、真实签收或并发服务端操作验收。
