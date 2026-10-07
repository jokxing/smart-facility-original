# 移液枪与枪架

SaaS 与小程序均提供移液枪列表、详情、枪位查看和模拟取还。两端主要标识一致、本地存储独立，真实枪架未连接。

## 状态与默认数据

| `homingStatus` | 含义 | 判定 |
| --- | --- | --- |
| 0 | 使用中 | 已取出且未满 24 小时 |
| 1 | 在位 | 已归还到枪位 |
| 2 | 超时未归还 | 取出满 24 小时仍未归还 |

超时相对本端演示时钟计算，不写死状态徽章。枪架 `status:1` 在线，`-100` 离线。空枪位不是移液枪实体，不参与枪数量统计。

| ID | 默认状态 | 所属枪架 |
| --- | --- | --- |
| 991001 | 使用中 | 980023，在线枪架 A |
| 991002 | 在位 | 980023，在线枪架 A |
| 991003 | 超时未归还 | 980023，在线枪架 A |
| 991004 | 在位 | 980024，离线枪架 B |

默认 4 把枪：在位 2、使用中 1、超时 1。A 架 4 个槽位，B 架 2 个槽位，各有一个空槽位。

## 取还流程与约束

取枪 POST 只表示申请，随后 `/gun/take` 读取执行**模拟确认**，不能将申请成功解释为已控制真实硬件。确认后更新枪状态、取还记录和页面统计。

- 离线架拒绝模拟取还。
- 空枪位、未知枪/枪架不能操作。
- 重复申请、重复归还及目标槽位占用时拒绝。
- 归还时间不能早于取出时间。
- 超时归还后列表、详情和枪架均恢复在位语义与颜色。
- 页面返回或重新显示时刷新业务数据，保留筛选条件。

Web 命名空间 `smart-facility-demo:v1:`，小程序 `sf-mini-demo:`，业务键包括 `gunState`、`gunRecords`、`gunPending`。登出清会话，取还状态和记录保留。

## 接口与页面

小程序接口带 `/api`：`/gun/pipette/statistics`、`list`、`detail`、`binding/list`、`history`，以及 `/gun/take/pipette`、`/gun/take`、`/gun/return/pipette`。

Web 列表使用 `/gun/pipette/listV1`，入口 `/lhd/pipetteGun`；枪架管理 Tab 使用 `/device/list`、`/equipment/dashboard`（类型 13）和 `/device/detail`，详情槽位复用枪仓库。小程序在设备 Tab 切换移液枪，进入枪架查看槽位与模拟取枪。

编辑/删除档案、导出、扫码、语音下发、真实枪架指令与跨端同步未开放。真实系统需要共享 API 持久化及枪架反馈，演示不以本地状态变化冒充这些能力。

## 代码与验证

- [Web gun.js](../smart-facility-platform/src/mock/fixtures/gun.js)、[小程序 gun.js](../miniprogram/utils/demo/gun.js)。
- [Web 移液枪测试](../smart-facility-platform/tests/unit/demo/pipette-gun.spec.js)。
- 根目录运行 `node scripts/check-mp6-demo.cjs`、`node scripts/check-miniapp-gun-navigation.cjs`、`node scripts/check-miniapp-gun-return-list.cjs`。

规则与导航脚本不代表真实取枪成功，也不替代最新微信模拟器和硬件验收。
