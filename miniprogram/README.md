# 智慧设施助手（关联小程序）

这是智慧设施平台的 uni-app 副本。源码使用 Vue 2、uni-ui、自定义 TabBar、uCharts，保留微信小程序能力，并适配 H5。构建复用本机安装的 HBuilderX Vue 2 编译器，`package.json` 提供统一命令入口。

原小程序由本人从 0 搭建，并开发首页、预约、数据图表、移液枪等部分模块，其他功能按团队协作说明。当前副本使用 AI 辅助脱敏、Mock 化及修复，原开发职责与展示整理分别介绍。

先按[小程序主线：首页 → 设备 → 图表 → 预约](../docs/miniapp-business.md#先看这条链路)查看界面、体验流程与对应代码；H5 用于跨端补充，安卓为后续扩展方向。

当前默认开启**本地演示模式**：请求不访问旧服务，登录账号 `demo` / `Demo1234`。展示名：智慧设施助手 / Smart Facility Assistant。源码目录为 `miniprogram`。

**已开放**：本地登录、首页统计、设备列表/详情监测、房间列表/详情、设备预约、告警处理、我的负责范围、消息已读/清空、告警待办、**移液枪列表/详情/枪架查看与模拟取还**、**运单列表/统计/详情/发运/送达**。

**未开放**：运单创建（由 SaaS 承担）、扫码/蓝牙/真实打印、真实微信登录、房间增删改、资产异动处理、维保/资产流程、完整 BPM、真实枪架硬件。

两端属于同一业务系统，**演示使用独立本地存储**（小程序 `sf-mini-demo:`，Web `smart-facility-demo:v1:`）。真实联动需要共享后端及枪架反馈，当前小程序取枪后 Web 不会自动变化。

微信开发者工具需自行安装，并在 `manifest.json` 的 `mp-weixin.appid` 填入有权限的测试 AppID。已移除带旧 AppID 的重复 `project.config.json`；编译器根据 manifest 生成微信配置，未配置账号时为游客标识。H5 的验证结果不能代替微信模拟器或 App 真机验收。

## H5 运行

以源码及下述本地运行方式展示，账号 `demo` / `Demo1234`。此前脱敏展示副本未提供公网入口；原工作中的小程序有部署上线经验。本次另行尝试的第三方静态托管存在访问拦截，不作为可靠的面试访问入口。各端实际验证范围及该限制见[跨端验证记录](../docs/cross-platform-validation.md)。

安装 HBuilderX 及 uni-app Vue 2 编译插件。脚本支持本机路径自动发现，也可设置环境变量 `HBUILDERX_ROOT`。

```powershell
# 在仓库根目录打开 PowerShell
cd miniprogram
npm run build:h5
npm run preview:h5
```

访问 `http://127.0.0.1:8188`，登录 `demo` / `Demo1234`。输出为 `unpackage/dist/build/h5`，使用 hash 路由，可部署到静态托管。H5、微信小程序、原 SaaS 各自保存本地数据，不会自动同步。

浏览器自动化是维护检查，不是运行 H5 的必要步骤。先在 `miniprogram` 执行 `npm install` 和 `npx playwright install chromium` 安装测试工具，并保持另一个终端中的预览服务运行。当前测试文件位于仓库 `scripts` 目录，需将本次 PowerShell 会话的依赖查找目录指向 `miniprogram/node_modules`：

```powershell
# 当前目录为 miniprogram
$env:NODE_PATH = Join-Path (Get-Location).Path 'node_modules'
npm run test:h5
```

已有浏览器时可使用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定，`H5_URL` 可指向自选站点。测试会修改其新建浏览器上下文的演示数据。此命令说明仅补齐依赖位置，本次文档整理未重新安装工具或运行测试；移液枪详情的现有断言偏弱，不能仅凭脚本整体通过判定详情数据加载完成。

`npm run build:mp-weixin` 编译微信目标；`npm run build:app` 仅编译 App 资源，**不生成 APK / IPA 安装包**。详细范围、证据与打包限制见[跨端验证记录](../docs/cross-platform-validation.md)。

## 运行与阅读

- [项目介绍、个人贡献与启动步骤](../README.md)
- [小程序模块、存储与验收范围](../docs/miniapp-business.md)
- [小程序面试路线与代码入口](../docs/miniapp-business.md#先看这条链路)
- [检查脚本用途与运行条件](../scripts/README.md)
- [预约与告警规则](../docs/reservation-and-alarm.md)
- [移液枪与枪架](../docs/pipette-gun.md)
- [运单与状态流转](../docs/transport.md)
