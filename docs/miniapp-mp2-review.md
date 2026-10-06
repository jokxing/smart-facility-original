# 小程序 MP2 复盘

日期：2026-10-05。对照 `docs/miniapp-mp2-mp5-task-prompt.md` 第三节。

## 已改文件

- `miniprogram/utils/demo/{seeds,instrument,handlers,storage}.js`：12 台设备同源、列表分页筛选、监测与只读告警。
- `miniprogram/utils/api.js`：统计接口传递 data。
- `miniprogram/pages/tabBar/Labdevice/{index,Labdevice}.vue`：code===1、统计范围、筛选消费、移液枪入口提示。
- `miniprogram/detailPage/LabdeviceDetail/{LabdeviceDetail,common/AssetDetails}.vue`：详情/监测/未知设备；预约改未开放提示。
- `miniprogram/homePage/Search/Search.vue`、`components/{HistoryAlarmRecord,NavigationBar}`、`detailPage/HistoryDataChart`、`App.vue`、`scripts/check-mp1-demo.cjs`。
- 新增 `scripts/check-mp2-demo.cjs`、`docs/miniapp-mp2-contract.md`。

## 自检

- 列表 12 条两页不重不漏；报警筛选仅 970008；待机空；统计不随参数 Tab 变少，房间 B 范围 6/1。
- 详情运行中 + 参数报警；温度 45.2>40、湿度 85>70；曲线有采样。
- 搜索不含移液枪；未知 ID 失败；无 token 为 code=2。
- `columns.js` 仍用 `assign`；设备组件 init 时重新 assign。移液枪点击改为提示，避免指错实例。
- 首页 `if (res.code)`、导航栏无胶囊 API、会话仅校验非空 token：已改为 `code===1`、H5 守卫、`isDemoToken`。

## 验证

- `node scripts/check-mp1-demo.cjs`、`node scripts/check-mp2-demo.cjs` 通过。
- 未在本轮重新编译微信模拟器；请用当前源码在 HBuilderX 编译后再跑：首页 11/1/0 → 报警卡 → 仅 970008 → 详情/曲线 → 返回筛选；第二页；待机空态。

## 限制

- 告警 Tab 只读一条演示事件，处理在 MP5。
- 绑定硬件为空；分类 types=2 与硬件类型筛选为空是真实空态。
- 预约/维保/移液枪未开放。
- 未执行 git commit/push。下一步仅 MP3，不自动做 MP4–MP6。
