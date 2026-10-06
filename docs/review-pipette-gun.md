# 移液枪 MP6 复盘

日期：2026-10-06。对照 `docs/miniapp-next-task-prompt.md` 末尾 MP6。

## 已改文件

小程序：`utils/demo/{gun,handlers,storage}.js`；`utils/api.js`；设备 Tab / 移液枪列表；枪详情归还；枪架枪位与取枪；中英文案。

Web：`src/mock/fixtures/gun.js`、`handlers/gun.js`、`mock/index.js`；`api/gun` 取还；枪列表统计卡与 GUNSTATUS 对齐；枪架/详情模拟按钮；`equipment.js` 枪位列表改为活数据。

检查：`scripts/check-mp6-demo.cjs`；`tests/unit/demo/pipette-gun.spec.js`。

## 自检

- 空枪位不出现在枪列表；统计 4/2/1/1。
- 991003 超时由取出时长计算，不是静态数字。
- 取枪申请 ≠ 已取走；确认后 991002 变为使用中；记录增加。
- 离线架 980024 取还失败；在位枪不能再还。
- 退出后再登录状态仍在。两端存储独立。

## 验证

- `node scripts/check-mp6-demo.cjs` 通过。
- Web：`npx vue-cli-service test:unit --runInBand tests/unit/demo/pipette-gun.spec.js`（及既有 equipment 枪架绑定断言）。
- 未本轮重编译微信；请编译后：设备 Tab → 移液枪 → 枪架 A 模拟取枪 → 详情记录/统计 → 归还。Web 用已启动的本地演示：`/lhd/pipetteGun`。

## 限制

未连接硬件。图表为记录派生，不是真实使用率算法。档案编辑/导出/语音/扫码未开放。不编写履历、未 commit/push。
