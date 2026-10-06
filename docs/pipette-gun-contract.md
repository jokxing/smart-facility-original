# 移液枪演示契约（MP6）

日期：2026-10-06。范围：小程序移液枪列表/详情/枪架/模拟取还；Web 列表/统计/筛选分页/详情/枪架绑定/使用记录与模拟取还。两端**各自本地 Mock**，ID/名称/状态规则一致，**不**跨端实时同步。

## 状态语义

| `homingStatus` | 含义 | 判定 |
| --- | --- | --- |
| 0 | 使用中（未在位） | 已取出且未超时 |
| 1 | 在位（已归还到枪位） | 实体在架 |
| 2 | 超时未归还 | **取出后满 24 小时仍未归还**，按演示时钟计算，不写死徽章 |

枪架 `status`：`1` 在线，`-100` 离线。离线枪架**拒绝**模拟取还成功。空枪位 `no === 'null'` **不是**移液枪实体，不计入枪列表/统计。

取枪 `POST` 只表示**申请**（`items.status=0`）。`GET /gun/take` 才做**模拟枪架确认**（`status=1, simulated:true`）。文案与文档不得声称已连接硬件。

## 种子（两端同 ID）

| ID | 名称 | 编号 | 枪架 | 枪位 | 默认 |
| --- | --- | --- | --- | --- | --- |
| 991001 | 演示移液枪 1 | PG-001 | 980023 A | 1 | 使用中（演示用户，约 2h） |
| 991002 | 演示移液枪 2 | PG-002 | 980023 A | 2 | 在位 |
| 991003 | 演示移液枪 3 | PG-003 | 980023 A | 3 | 超时（取出超过 24h） |
| 991004 | 演示移液枪 4 | PG-004 | 980024 B | 1 | 在位；枪架离线 |

枪架：`980023` 演示移液枪架 A（在线，房间 A，4 枪位其中 4 号空）；`980024` 演示移液枪架 B（离线，房间 B，2 枪位其中 2 号空）。

演示时钟：小程序 `2026-10-05`；Web `2026-09-24`。超时都按「取出时间 + 24h」相对**本端时钟**。

默认统计：总数 4；在位 2；使用中 1；超时 1。

## 存储（退出保留）

| 端 | 键 |
| --- | --- |
| 小程序 `sf-mini-demo:` | `gunState`、`gunRecords`、`gunPending` |
| Web `smart-facility-demo:v1:` | 同名 |

会话清除不影响取还状态与使用记录。

## 非法操作

- 重复取枪申请（同架未确认）
- 无可取在位枪 / 空枪位当枪取
- 离线枪架取还
- 已在位再归还
- 目标枪位已被另一把在位枪占用
- 未知枪/枪架

## 小程序接口（`/api` 前缀）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/gun/pipette/statistics` | `totalNum/noHomingNum/homingNum/errorHomingNum` |
| POST | `/gun/pipette/list` | `{list,total,pageNum,pageSize}`；`status`/`keyword` |
| GET | `/gun/pipette/detail` | `gunId` |
| POST | `/gun/pipette/binding/list` | 含空枪位 |
| POST | `/gun/take/pipette` | 申请 |
| GET | `/gun/take` | 模拟确认 |
| POST | `/gun/return/pipette` | `{gunId}` 模拟归还 |
| POST | `/gun/pipette/history` | 使用记录 |
| GET | `/device/detail` | 枪架 13 |
| POST | `/device/openGun/remind` | **拒绝**（需真实枪架） |

## Web 接口（无 `/api`）

列表走 `/gun/pipette/listV1`（与小程序 list 字段对齐）。另开放 statistics、detail、binding/list、history、take/return、使用/超时统计桩、mouseInfo。编辑/删除/改部门/改规则/导出 **明确拒绝**。

## 页面

- 小程序：设备 Tab 切换移液枪；列表筛选分页；详情归还；枪架枪位列表与模拟取枪。
- Web：`/lhd/pipetteGun` 列表统计筛选；详情模拟归还；枪架抽屉模拟取枪/归还在用枪。

## 未开放

真实枪架/轮询硬件、扫码取枪、语音播报下发、跨端同步、档案 CRUD、导出、报警规则写入。
