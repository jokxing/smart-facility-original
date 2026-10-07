# 智慧设施助手（关联小程序）

这是智慧设施平台的 uni-app 小程序副本。源码使用 Vue 2、uni-ui、自定义 TabBar、uCharts 和微信能力；当前为 HBuilderX 工程，没有根目录 package.json，不适用直接执行 npm run dev。

当前默认开启**本地演示模式**：请求不访问旧服务，登录账号 `demo` / `Demo1234`。展示名：智慧设施助手 / Smart Facility Assistant。源码目录为 `miniprogram`。

**已开放**：本地登录、首页统计、设备列表/详情监测、房间列表/详情、设备预约、告警处理、我的负责范围、消息已读/清空、告警待办、**移液枪列表/详情/枪架查看与模拟取还**、**运单列表/统计/详情/发运/送达**。

**未开放**：运单创建（由 SaaS 承担）、扫码/蓝牙/真实打印、真实微信登录、房间增删改、资产异动处理、维保/资产流程、完整 BPM、真实枪架硬件。

两端属于同一业务系统，**演示使用独立本地存储**（小程序 `sf-mini-demo:`，Web `smart-facility-demo:v1:`）。真实联动需要共享后端及枪架反馈，当前小程序取枪后 Web 不会自动变化。

微信开发者工具需自行安装，并在 `manifest.json` 的 `mp-weixin.appid` 填入有权限的测试 AppID（不要使用旧标识）。H5 只能预览登录和首页布局，不能代替微信模拟器或真机。

## 运行与阅读

- [项目介绍、个人贡献与启动步骤](../README.md)
- [小程序模块、存储与验收范围](../docs/miniapp-business.md)
- [预约与告警规则](../docs/reservation-and-alarm.md)
- [移液枪与枪架](../docs/pipette-gun.md)
- [运单与状态流转](../docs/transport.md)
