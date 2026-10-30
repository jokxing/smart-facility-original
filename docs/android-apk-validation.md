# Android 独立 APK 验收记录

日期：2026-10-30（Asia/Shanghai）。已完成独立 APK 打包、签名检查及 MuMu 核心流程验收，并补充用户确认的 Android 真机业务页面展示。两部分覆盖分别记录。

## 交付文件

- 最终 APK：`miniprogram/unpackage/release/apk/__UNI__3E9B8E1__20261030011021.apk`。
- 大小：22,629,089 字节（约 21.58 MiB）。
- SHA-256：`6FBCEB10FD0C0378EB5806C0771B572FC149A66087CAA0CAAE037881756E8D85`。
- 包名：`uni.app.UNI3E9B8E1`；DCloud AppID：`__UNI__3E9B8E1`；版本：1.0.0 / 100。
- 正式 APK，云端证书，快速安心打包；未启用广告、原生混淆或 SourceMap。最终包使用已有原生包缓存生成，无需重新排长队。
- `apksigner verify --verbose` 通过，v1 / v2 签名均通过，1 个签名者。记录：`docs/evidence/android-apk/signature-check.txt`。
- 架构配置：arm64-v8a、x86。初版解包元数据：minSdk 21、targetSdk 28；未据此声明其他系统版本兼容。

首个云打包文件 `__UNI__3E9B8E1__20261029230833.apk` 保留。其安装验收发现历史曲线空白，因此交付使用上述修复版。最终包执行 `adb install -r` 返回 Success，覆盖安装保留了已有演示数据。

## 环境和方法

Windows、HBuilderX 5.33、MuMu Android 15，720×1280。模拟器上报 HUAWEI NCO-AL00，不能记为华为真机。ADB 使用 `127.0.0.1:16384`，设备 ABI 上报 x86_64 / arm64-v8a / x86。

使用 ADB 实际点击、输入、滑动及全屏截图，逐张查看结果。正式 APK 未暴露可用的 WebView 调试接口，未将标准基座的 DOM 断言算成独立 APK 检查。截图位于 `docs/evidence/android-apk/`；下表明确区分初版与修复版，目录内其他中间截图不作为通过证据。

## 实际验证

| 安装版本 | 操作与实际结果 | 截图文件 |
| --- | --- | --- |
| 初版 | 首次启动显示登录；demo / Demo1234 登录；首页统计及五个底部导航正常 | 01-first-launch、02-login-home、03-device-list、04-room-list、05-waybills、06-my |
| 初版 | 消息四分类、右侧按钮和空状态；待办页分类与数量显示 | 07-message、08-todo |
| 初版 | 报警设备筛选，设备详情与传感器数值展示 | 09-alarm-device-filter、10-device-detail |
| 初版 → 修复版 | 初版创建 10 月 31 日预约；修复版覆盖安装后记录仍存在，取消成功 | 12-reservation-popup、13-reservation-created、14-my-reservation、22-reservation-after-apk-update、23-reservation-cancelled-verified |
| 修复版 | 历史曲线实际可见；切换 24h 后横轴时间跨度变化 | 20-fixed-chart、21-fixed-chart-24h |
| 修复版 | 房间报警全部/空已处理列表均保持 3 / 3 / 0；界面处理一条后为 3 / 2 / 1；切换分类数量不随列表错误变化 | 32-room-counts-all、33-room-counts-empty、34-room-handle-form、35-alarm-handled、36-unprocessed-counts、37-processed-counts |
| 修复版 | 确认关联的两张演示运单发车：已装车 2→0、运输中 3→5；TO-DEMO-003 确认送达：运输中 5→4、已送达 2→3 | 38-waybill-loaded-filter、40-depart-scroll-footer、41-depart-result、42-transit-orders、43-arrive-dialog、44-delivered-order |
| 修复版 | 强制停止调试基座及独立应用，再启动独立包，成功进入首页；送达状态及已取消预约保留 | 45-standalone-cold-start、46-delivery-after-cold-start、47-cancel-history-after-cold-start |

最后核对独立应用进程存活、调试基座无进程；当前应用进程日志未检出 FATAL EXCEPTION / AndroidRuntime / Uncaught / TypeError。正式包日志可见性有限，不能扩大为“全部 JavaScript 无错误”。结果见 `runtime-check.json`。

## 本轮修复与回归

历史图表父容器没有明确高度，初版独立 APK 出现空白。为图表竖屏和横屏容器补充明确尺寸；修复版已实际看到曲线。H5 自动检查同时加强为检查画布可见高度及蓝色曲线像素，避免只检查 canvas 元素存在就判为通过。

最新源码 H5 生产编译及核心浏览器回归通过，运行错误和失败资源请求均为 0，结果为 `docs/evidence/android-h5-regression/results.json`。微信小程序生产编译通过；未新增微信真机或发布验证。Moment locale、资源体积及子包建议等已有编译提示保留。

## Android 真机业务页面

用户确认提供的安卓图片来自真机，已纳入[小程序面试导览](miniapp-business.md)。

| 页面 | 图片显示内容 |
| --- | --- |
| [设备预约弹窗](images/miniapp/android-reservation.jpg) | 设备详情、预约选时及已选时段 |
| [报警分类统计](images/miniapp/android-alarms.jpg) | 全部、未处理、已处理数量及报警记录 |
| [运单详情](images/miniapp/android-waybill.jpg) | 已送达状态、运单资料及操作记录 |

上述内容按真机页面展示记录；独立冷启动、曲线切换与本地状态保留等完整操作，仍以上方 MuMu 验收范围为准。设备型号和系统版本不从图片推断。

## 限制和已知现象

- 核心流程验收环境为 MuMu Android 15，真机展示范围见上表；其他机型、系统版本及厂商 ROM 按后续测试补充。小屏和系统返回等此前标准基座结果见 [基座验收记录](android-core-validation.md)，没有全部在最终独立包重跑。
- 首页冷启动截图仍出现深色状态栏图标，浅色切换效果不稳定；不能声明已解决。内容与状态栏未重叠。
- 输入及提交完成；真实软键盘面板未在模拟器完整截图中确认，遮挡和键盘收起行为仍待真机补验。
- 真实蓝牙、打印、枪架硬件、微信授权和真实消息推送均未接入；所有业务修改使用本端本地演示数据。
- 本文为 Android 验收；后续 iOS 已通过免费签名基座在 iPhone 真机验证核心主线，见 [iOS 真机记录](ios-device-validation.md)。未制作项目独立发行 IPA。
- DCloud 所有权和手机号验证已由用户完成，使用云端证书；没有读取或记录证书密码。未支付排队加速或其他费用。
- ADB 曾 offline；MuMu 重启后恢复。此连接限制与应用业务结果分别记录。
- 没有新增安装 Android Studio / SDK。项目、APK、截图在 E 盘；HBuilderX 快速打包仍使用工具默认的 C 盘用户缓存 `AppData/Local/HBuilder X/AndroidPackWork`。
- 本轮未新增公开部署，未修改简历。H5 托管域名被拦截的历史限制见 [跨端记录](cross-platform-validation.md)。

## 手工安装

将最终 APK 拖入已启动的 MuMu 安卓窗口，按提示安装；或使用已有 ADB 执行 `adb -s 127.0.0.1:16384 install -r <最终APK路径>`。打开“智慧设施助手”，首次登录使用 demo / Demo1234。无需保持 HBuilderX 调试基座运行。
