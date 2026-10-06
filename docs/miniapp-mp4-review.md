# 小程序 MP4 复盘

日期：2026-10-05。对照 `docs/miniapp-mp2-mp5-task-prompt.md` 第五节。

## 已改文件

- `miniprogram/utils/demo/{reservation,handlers,storage,session}.js`：预约仓库、冲突、所有权、退出保留业务键。
- `miniprogram/utils/api.js`：新增 `POST /api/instrument/reservation/update`。
- `miniprogram/components/TimeSelect/TimeSelect.vue`：日历占用、code===1、不信任请求用户、提交锁。
- `miniprogram/detailPage/LabdeviceDetail/{LabdeviceDetail,common/AppointmentPopup}.vue`：打开日历；弹层承担修改。
- `miniprogram/myPage/MyAppointment/*`、`pages/tabBar/My/My.vue`：列表筛选/修改/取消/提醒；统计随仓库变化。
- `scripts/check-mp4-demo.cjs`、`docs/miniapp-mp4-contract.md`。

## 自检

- 空仓库合法；创建后日历、我的预约、统计同源；userName 为演示用户。
- 重叠拒绝、相邻允许、跨天有效、非法/过去/未知设备失败。
- 修改保留 id 并释放旧时段；进行中不能改开始；已结束/已取消/他人失败。
- 取消保留 status=3 且日历不再占用；重复取消拒绝。
- 提醒只存本地；退出后再登录记录仍在。

## 验证

- `node scripts/check-mp1-demo.cjs` 至 `check-mp4-demo.cjs` 通过。
- 未本轮重编译微信模拟器。请用当前源码编译后：设备详情选未来时段 → 我的预约/统计可见 → 冲突失败 → 修改 → 取消后历史仍在。

## 差异与限制

- 已结束不可取消（Web 可将已结束标取消）。
- 默认不预置样例预约。
- 日历按自然日 15 分钟格；跨天创建走修改弹层的起止时间。
- 我的预约页不能引用 `detailPage` 分包组件（微信会整页空白）；预约弹层已放到主包 `components/AppointmentPopup`。
- 未 commit/push。下一步仅用户要求的 MP5，不自动做 MP6。
