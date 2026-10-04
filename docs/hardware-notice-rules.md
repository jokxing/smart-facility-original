# 智能硬件负责人报警规则

本轮接通 POST `/equipmentUser/alarmSetting` 本地 Mock，规则按硬件 ID 与负责人 ID 保存，列表刷新回显。不实际发送微信、短信或电话。延迟使用现有选项，时间严格 HH:mm:ss，时间段模式及恢复提醒为 0/1。未知硬件/负责人和非法设置不能覆盖原数据；存储失败返回明确失败。

补齐新增负责人恢复提醒默认值，并兼容旧行缺失字段。演示提交失败避免重复通用“网络开小差”提示。生产逻辑保持。

验证：54 套、267 项单测通过；本地浏览器添加负责人、打开规则、修改保存及重新读取通过，外部请求 0。脚本 `scripts/check-demo-notice-rules.cjs`，证据 `docs/evidence/notice-rules/`。未提交、推送或安装依赖。

预约功能位置：`src/views/labDevice/components/LabDeviceDrawer.vue` 的新增预约按钮、Fullcalendar 与 handleIsFullcalendar；演示模式隐藏，未在本轮开放。另有旧 `src/views/detail/index.vue` 预约入口和 `src/api/labDevice/index.js` 预约列表、新增、修改、取消接口。下一步如开放预约，应独立实现日历、冲突校验、保存、修改取消闭环。
