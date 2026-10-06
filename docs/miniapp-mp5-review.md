# 小程序 MP5 复盘

日期：2026-10-06。对照 `docs/miniapp-mp2-mp5-task-prompt.md` 第六节。

## 已改文件

- `miniprogram/utils/demo/{alarm,handlers,instrument,room,storage}.js`
- 告警弹层与列表：`AbnormalFormPopup`、`AbnormalRecord`、`HistoryAlarmRecord`、`AlarmNotification`
- `homePage/{NewsInform,Backlog}`、`myPage/MyResponsible`、首页文案
- `scripts/check-mp5-demo.cjs`，并放宽 MP1 空消息断言

## 自检

- 990008 出现在设备详情与我的设备告警；处理后监测仍为参数报警。
- 待办与 `waitHandleNum` 随 live 事件完成归零；历史告警仍可在我的任务查看。
- 消息已读红点变化；清空消息后告警记录仍在。
- 未知 ID、他人负责范围、重复处理、BPM 完成均失败。
- 退出后再登录处理记录仍在。

## 验证

- `node scripts/check-mp1-demo.cjs` 至 `check-mp5-demo.cjs` 通过。
- 未本轮重编译微信。请编译后走：970008 告警 → 处理意见 → 待办/统计/消息 → 设备仍报警。

## MP2–MP5 开放入口

登录/首页统计、设备列表详情监测、房间列表详情、预约创建修改取消、告警处理、我的负责、消息已读清空、告警待办。

仍未开放：移液枪、运单写、扫码/蓝牙/打印、真实微信登录、房间 CRUD、资产异动写、维保资产流程、完整 BPM。

未 commit/push。不自动做 MP6。
