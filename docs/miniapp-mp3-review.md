# 小程序 MP3 复盘

日期：2026-10-05。对照 `docs/miniapp-mp2-mp5-task-prompt.md` 第四节。

## 已改文件

- `miniprogram/utils/demo/room.js`：迷你房间列表/统计/详情/搜索；芯片列表走设计器空列表分支。
- `miniprogram/utils/demo/{handlers,instrument}.js`：房间接口分发；`objType=3` 探头空列表；搜索合并房间。
- `miniprogram/pages/tabBar/Room/Room.vue`：`code===1`、统计不受参数 Tab 影响、`roomStatus` 消费一次、loading 失败/超时收尾、位置清空。
- `miniprogram/detailPage/RoomDetail/RoomDetail.vue`：刷新重置 `instrumentList`，未知房间提示，房间级探头/硬件空态。
- 新增 `scripts/check-mp3-demo.cjs`、`docs/miniapp-mp3-contract.md`。

## 自检

- 统计默认 3/2/1/0；`status=2` 时统计仍为 3，列表仅房间 B。
- 走廊无仪器、参数正常、探头与硬件为空；B 详情含 970008、不含 A 的 970001。
- 无效 gardenId、越界页、未知房间 id、无 token 均不回退全量。
- `POST /api/room/list` 与 `POST /api/room/things/list/miniApp` 分开。

## 验证

- `node scripts/check-mp1-demo.cjs`、`check-mp2-demo.cjs`、`check-mp3-demo.cjs` 通过。
- 未在本轮重新编译微信模拟器；请用当前源码编译后跑：首页房间报警卡 → 仅 B → 详情 970008 → 设备详情；走廊空设备；筛选清空；空间无匹配。

## 限制

- 走廊在 Web 为未监测=3，小程序 MONITORSTATUS 无该档，演示记为正常。
- 房间告警 Tab 本批不编造房间级事件；处理在 MP5。
- 未开放房间 CRUD、巡查写入。未 commit/push。下一步仅用户要求的 MP4，不自动做 MP5–MP6。
