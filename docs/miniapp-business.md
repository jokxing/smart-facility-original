# 关联微信小程序

小程序「智慧设施助手」面向现场查看、预约及设备操作，SaaS 面向管理和配置。两端同属一个业务系统，演示使用一致的主要 ID 和规则，各自保存本地数据，没有自动同步。

## 运行

使用 HBuilderX 导入 `miniprogram`，Vue 2 编译目标为微信小程序。微信开发者工具导入生成目录 `miniprogram/unpackage/dist/dev/mp-weixin`，不能导入 `.vue` 源码作为原生微信项目。

自动打开需在微信工具开启「设置 → 安全设置 → 服务端口」，并在 HBuilderX 配好工具路径。AppID 应使用自己有权限的测试标识；登录为 `demo` / `Demo1234`。完整步骤见 [仓库首页](../README.md)。

## 模块与数据

| 模块 | 功能及规则 |
| --- | --- |
| 登录与首页 | 本地会话守卫、统计、下拉刷新与 Tab 导航 |
| 设备 | 共享仪器池、分页筛选、详情与监测；默认 970008 报警 |
| 房间 | 业务归属设备、统计与详情；房间 B 含异常设备，走廊无仪器时业务统计按正常处理 |
| 预约 | 同一仓库驱动日历、我的预约和统计，冲突与所有权校验 |
| 告警与消息 | 人工处理、我的负责范围、待办数、消息已读及清空 |
| 移液枪 | 列表、枪架槽位、模拟取还、超时与记录 |
| 运单 | 列表、统计、详情、发运和送达；创建由 SaaS 承担 |

列表统计按位置、关键字等业务范围计算，状态 Tab 不应把总览计数缩小成当前列表长度。首页传入的状态筛选在进入对应页面后消费，避免残留影响后续导航。切换/返回相关页面后重新读取业务状态，保持记录与统计一致。

## Mock 与持久化

[config.js](../miniprogram/utils/config.js) 默认开启本地演示，命名空间为 `sf-mini-demo:`。请求经过 [request.js](../miniprogram/utils/request.js) 与 [Mock 入口](../miniprogram/utils/demo/index.js)，未知接口明确失败，不回退原服务。

业务存储与会话分开，退出不删除预约、枪状态和运单操作记录。设备、房间和告警共享本端实体规则，不在各页面分别复制一份数据。两端同 ID 不表示存储已经联网。

真实微信登录、扫码取枪、蓝牙、真实打印、真实通知、硬件控制、资产审批及完整 BPM 未接入。运单轨迹为模拟；H5 不能代替微信 API 和真机环境验证。

## 检查入口

在仓库根目录运行：

```powershell
node scripts/check-mp1-demo.cjs
node scripts/check-mp2-demo.cjs
node scripts/check-mp3-demo.cjs
node scripts/check-mp4-demo.cjs
node scripts/check-mp5-demo.cjs
node scripts/check-mp6-demo.cjs
node scripts/check-mp7-transport.cjs
```

脚本保留原有编号命名，分别覆盖登录、设备、房间、预约、告警、移液枪与运单，不代表历史批次说明需要逐篇阅读。

已有微信模拟器记录覆盖登录、首页、刷新、部分导航与退出；这些记录不等同于最新全部功能已做 GUI 验收。冷启动、跨开发工具重开持久化和完整真机流程未完成全面验收；自动化重开曾出现环境读数不稳定，不能据此判定源码持久化必然错误或宣布通过。

更多业务规则见 [预约与告警](reservation-and-alarm.md)、[移液枪](pipette-gun.md)、[运单](transport.md)。
