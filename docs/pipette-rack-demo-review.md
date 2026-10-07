# SaaS 枪架管理核心 Mock 复盘

## 2026-10-07 二次复盘与实际验收

已复核本批接口接入、共享枪仓库、在线/离线和空槽位规则。核心实现可运行，补修以下问题：

- 枪架列表快速筛选时旧响应可能覆盖新结果；增加请求序号，只允许最新响应修改列表及 loading，并检查成功码/响应结构。
- 枪架分页支持小数或非有限输入时返回不合理结果；页码/每页数量规范化、每页最多50。
- 取枪不能仅凭 code=1 就显示确认成功；同时要求 items.status=1。未知详情失败清空旧槽位并结束槽位加载。
- 浏览器脚本原侧栏选择器误取顶部导航“智能硬件”，改为侧栏范围；归还后新增具体枪状态1及归还时间断言，未捕获异常改为失败条件。

验证：npm run test:demo，59组/287项通过，包含新增筛选乱序响应及失败收尾回归。启动本机 demo 后运行隔离 Edge 验收脚本，通过两个Tab、侧栏选中、2个枪架统计、在线架4槽位/3绑定枪/1空位、取枪、归还及返回列表；外部应用请求0、未捕获异常0。脚本部分流程调用实际 Vue 组件方法，不能称全部物理点击。截图保存在 docs/evidence/pipette-rack，05-after-return.png 已查看。

本次未修改小程序、不重复微信验收。未 commit/push。以下原交付记录保留，原“浏览器未执行”状态由本节更新。

日期：2026-10-07。对照 `docs/pipette-rack-next-task-prompt.md`。

## 改动文件

| 区域 | 路径 |
| --- | --- |
| Mock | `smart-facility-platform/src/mock/fixtures/equipment.js`（`listDevices`、按 `equipmentType` 的 dashboard） |
| Mock | `smart-facility-platform/src/mock/handlers/equipment.js`（`POST /device/list`、dashboard 传参、未开放写接口拒绝） |
| Mock | `smart-facility-platform/src/mock/fixtures/gun.js`（槽位补齐取出/归还时间与位置） |
| 页面 | `src/views/pipetteGunRack/index.vue`、`components/GunRackDrawer.vue` |
| Tab | `src/views/pipetteGun/index.vue`（路由同步，避免无条件 push） |
| i18n | `zh.js` / `en.js`：枪架 Tab「枪架管理」/「Gun Rack」 |
| 侧栏 | 保留既有 `Slidebar.vue` 两 Tab 共用入口选中 |
| 测试 | `tests/unit/demo/pipette-rack.spec.js`、保留 `pipette-sidebar.spec.js` |
| 浏览器脚本 | `scripts/check-demo-pipette-rack.cjs`（可选） |

## 接口契约

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/equipment/dashboard?equipmentType=13` | 与列表同源：`total/normalCount/offLineCount/noActivatedCount` |
| GET | `/equipment/dashboard`（无参） | 仍为全量 `{total, alarmCount}`，兼容硬件首页/单测 |
| POST | `/device/list` | `equipmentType:13`；查询 `status=0` 表示全部；`-99`→未激活实体 0 |
| GET | `/device/detail` | 枪架 980023/980024，房间/负责人/公司名合成字段 |
| POST | `/gun/pipette/binding/list` | 含空位 `no==='null'`；绑定枪带 `takeOutTime/homingTime/position` |
| POST/GET | `/gun/take/pipette`、`/gun/take`、`/gun/return/pipette` | 复用 MP6 取还；离线架拒绝 |
| 拒绝 | remove/batch、output/equipment、room、add、openGun/remind、import | 明确失败，不回落真实 HTTP |

种子仍为枪架 980023（在线）/980024（离线），枪 991001–991004；空槽不计枪。

## 运行方式

```bash
cd smart-facility-platform
npm run demo
# 账号 demo / Demo1234 / 2468
# 智能硬件 → 移液枪 → Tab「枪架管理」
```

可选浏览器：`DEMO_PORT=8089 node scripts/check-demo-pipette-rack.cjs`

## 验证结果

- `npm run test:demo`：59 suites / 285 tests 通过（含 `pipette-rack` / `pipette-gun` / `pipette-sidebar` / `equipment`）。
- 统计与列表同源：type=13 时总数 2、在线 1、离线 1，不再出现默认占位。
- 列表失败/成功均结束 loading；筛选复位 `pageNum`。
- 演示模式隐藏新增/导入/导出/多选与行内编辑删除；取还按钮有明确成败提示。
- Edge 物理点击截图：本轮未执行（浏览器脚本已备，需本机 Edge + demo 端口）。

## 未开放

批量导入、语音提醒下发、报警规则配置、真实硬件轮询、跨端同步、枪架 CRUD/导出/改房间。

未 commit/push。不编写履历生产上线表述。
