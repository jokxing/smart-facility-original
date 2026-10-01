# 房间管理模块复盘（2026-10-01）

## 三项收尾已完成

room.js先解析当前设备实体后过滤分类；MonitorEquipment分类、搜索和Tab切换回第一页，分页查询保留页码；图片复用resolveDeviceAssetUrl，EquipmentCard无素材显示回退。26套143项单测通过；补充3D浏览器验证六张本地SVG加载，第二页切分类及搜索回第一页，externalAttempts=0。已查看更新截图。下文三项问题作为发现记录保留，不再是待办。下一任务切到数据统计4A。

## 独立复核补充：三项需要修正

本次核实 HEAD 6989a34；保留已有未提交文档。独立运行全量 demo 单测：26 套 / 142 项通过；未重跑浏览器，查看已有 3D 已监测截图。

1. **P2 编辑分类后房间筛选仍用旧分类。** `src/mock/fixtures/room.js` 的 listRoomMonitorInstrument 先按原始 entity.types 过滤，再 resolveInstrumentEntity。将 970001 改为 types=2 后，房间 950001 的 types=2 列表仍找不到它；临时回归测试已复现失败，临时文件已移除。应先解析当前实体再筛选。
2. **P2 未监测列表换分类或搜索不重置页码。** `src/views/room/components/MonitorEquipment.vue` 的 handleTabPosition 和搜索入口沿用 monitorItems.pageNum。从第二页改成少量匹配结果时会显示空列表。分类、关键词、Tab 切换应回第一页；真正的分页动作保留页码。本项为源码核实，未做浏览器复现。
3. **P2 已监测卡片素材地址错误。** room.js 的 logoUrl 为 demo-device-* 素材键，MonitorEquipment.vue 用 BASE_URL + item.logoUrl 拼接 `/file/picUrl?fileName=`，EquipmentCard.vue 直接作为 img.src。现有 utils/demoDeviceUrl.js 的 resolveDeviceAssetUrl 可映射本地 SVG，但组件未使用；3D 既有截图卡片没有设备图。应复用映射和回退，验证图片加载。本次未实时验证图片响应。

本次只维护文档，未修业务源码。下一任务为以上三项收尾，替代文末原有“切模块”建议；现有成功路径通过不代表这些分支已通过。

## 结论与范围

核对 3A–3D 当前源码、Mock、契约与证据；房间相关单测 4 套 / 15 项通过（`room-list` / `room-hardware-bind` / `room-export` / `room-unmonitored`）。列表筛选统计、只读详情、已上图仪器、关联硬件只读、筛选导出、未监测 Tab（含分类 `type`）已接通。不能把房间增删改、导入、房间侧绑定/解绑写、房间级探头/报警/巡查模板算作已完成。本轮只读复盘，未改业务源码，未重跑浏览器脚本，未跑生产构建或全站回归。

## 切片对照

| 切片 | 交付 | 证据 / 脚本 |
| --- | --- | --- |
| 3A 列表 + 只读详情 | `/rm/room`；`POST /room/list`；`GET /room/dashboardV1`；`RoomDrawerNew`；已上图 `GET /room/monitor/instrument`；写 API 拒绝 | `docs/evidence/room-management-3a`；`test:demo:room:3a` |
| 3B 关联硬件只读 | `things/newList` objType=3 ↔ 共享 `equipmentBindings` type:11；种子 A=`980010`、B=`980018` | `room-management-3b`；`test:demo:room:3b` |
| 3C 筛选导出 | `POST /room/export` 与列表同筛、忽略分页；导入仍拒 | `room-management-3c`；`test:demo:room:3c` |
| 3D 未监测 Tab | `monitor:"2"` + 设备管理 `instrumentCreated`；分类 `type` 过滤已补 | `room-management-3d`；`test:demo:room:3d` |

契约：`docs/room-management-3a-contract.md`。演示说明：`docs/demo-guide.md`（3A–3D 段）。

## 各链路核实

| 链路 | 实际范围与依据 |
| --- | --- |
| 入口 | `permission.js` + `DEMO_MENUS` + 首页 `rm` → `views/room/Room.vue` |
| 列表 / 统计 | `fixtures/room.js` listRooms / dashboard；设计器仅 `{floorId}` 仍空侧栏；空筛不回退全量 |
| 详情 | `openTwoSystem:1` → `RoomDrawerNew`；演示隐藏探头编辑/报警/巡查/绑定弹层写入口 |
| 已上图仪器 | `listRoomMonitorInstrument`：placement 存在且未删；`types` 分类有效 |
| 未监测仪器 | `listInstruments`：`roomId` + `monitor:2` + `type`（4=全部，1/2/3=分类）；无冷启动未上图种子 |
| 关联硬件 | `listBoundEquipmentForRoom` 反查 bindings；`BindHardwareTable` 仅只读表 |
| 导出 | `exportDemoRooms` + `roomWorkbook.js`；演示 payload 显式带位置字段 |
| 实体复用 | 房间 `950xxx`、仪器 `970xxx`、硬件 `980xxx`；禁止第二套 ID |

## 已知限制（非阻塞，勿夸大完成度）

1. **分类观感**：演示种子仪器几乎全是 `types:1`，「全部」与「实验室设备」列表常相同；「行政 / IT」为空属过滤生效，不是坏掉。
2. **未监测依赖跨模块路径**：须先走设备管理新增（或导入）未上图仪器；冷启动 Tab 为空是约定，不是漏种子。
3. **房间侧写仍关闭**：增删改/批量/导入/解绑/`goods/remove` UI 隐藏 + Mock 拒绝；硬件详情绑定写路径不变，房间详情不开放对称写。
4. **列表仍请求硬件类型下拉**：`init` 仍调 `getEquipmentBindEquipmentType`，但 `objType` 筛 UI 已隐藏（P3 冗余请求，不影响口径）。
5. **旧抽屉并存**：`RoomDrawer` 仍挂在页面上；演示行 `openTwoSystem:1` 只开 `RoomDrawerNew`，旧抽屉不在演示主路径。

## 3D 补丁（同日）

`listInstruments` 曾忽略详情分类按钮的 `body.type`，导致未监测 Tab 切换列表不变；已按仪器 `types` 过滤并补单测。详见 STATUS「3D 补丁」条。

## 验证边界

- 本轮复跑：房间相关 unit 15 项通过。
- 浏览器 3A–3D 以既有 STATUS 记录与 `docs/evidence/room-management-3*` 为准，本轮未重跑。
- 未验证：生产构建、非 Edge、跨模块「硬件页点选绑定 → 房间详情即时反查」的完整人工路径（3B 用共享 store / 冷种子覆盖）。

## 建议下一步

房间读演示链路已够用。优先停刀切其它模块，或按产品需要单开「房间侧绑定写」（须与 `equipmentBindings` 双向一致并带解绑守卫）。勿在本复盘刀顺手扩大写能力。
