# Android 核心验收与适配记录

验证日期：2026-10-29（Asia/Shanghai）。本文记录标准基座阶段；该阶段未制作独立 APK。2026-10-30 已完成独立 APK 打包及模拟器安装，最新交付与限制以 [独立 APK 验收记录](android-apk-validation.md) 为准。下文“尚未生成”等表述仅指 10 月 29 日当时状态。

## 环境与方法

- Windows、HBuilderX 5.33、现有 App 真机运行插件、标准基座 `io.dcloud.HBuilder`。
- MuMu Android 15，模拟器上报 `HUAWEI NCO-AL00`，并非华为真机。
- 标准显示为 720×1280；另临时改为 640×1136 检查小屏，随后恢复。WebView 小屏实际报告宽 321px、高 568px。
- 通过现有 ADB 连接设备，使用 Android WebView 调试接口读取显示内容、发送触屏事件与输入，并使用 ADB 截取完整设备画面。没有用调用 Mock 接口代替界面验收。
- 16384 调试连接中断后，改用 MuMu 同时提供的 5555 端口。HBuilderX 原连接未同步的改动，通过 ADB 将同一编译目录同步到标准基座后复测。没有新增安装开发工具。

## 实际验证范围

| 模块 | 实际操作与结果 | 证据（`docs/evidence/android-core/`） |
| --- | --- | --- |
| 启动与登录 | 未登录冷启动进入登录页；演示账号登录；已登录冷启动进入首页；退出重登；当前进程未记录 JS 错误 | `results-cold-start.json`、`60-logged-out-cold-start.png`、`61-logged-in-cold-start.png` |
| 首页及导航 | 五个底部导航可跳转；首页设备/房间统计显示；扫码为提示，自动关闭，不调用硬件 | `results-initial.json`、`results-final.json`、`03-scan-notice.png` |
| 搜索 | 名称及编号输入、提交，显示匹配设备 | `45-search-result.png`、`results-back-final.json` |
| 消息与待办 | 消息四分类切换、一键已读；待办四分类切换；空状态展示 | `32-final-message-tabs.png`、`55-backlog-switching.png` |
| 设备 | 列表、报警筛选、分页至第 12 个设备、详情编号与传感器数值、历史图表及 24h 切换 | `08-device-filter.png`、`09-device-detail.png`、`10-chart.png`、`57-device-pagination.png` |
| 预约 | 日期/时段选择、创建成功、我的预约列表、取消确认、退出重登后取消历史保留 | `12-reservation-created.png`、`15-reservation-cancel.png`、`58-cancel-history-persisted.png` |
| 房间 | 房间列表、房间 B 关联设备、报警记录；卡片间距及横向溢出断言通过 | `17-room-detail.png`、`33-final-room-spacing.png`、`results-final.json` |
| 报警处理 | 输入处理方法、确认提交，列表显示已处理；未处理/已处理计数更新 | `19-alarm-form.png`、`21-alarm-handled.png` |
| 运单 | 出发确认、送达确认、已送达状态、操作历史；重启/重登后的业务状态；演示凭证页面提示蓝牙打印未接入 | `23-depart.png`、`24-arrive.png`、`39-waybill-persisted.png`、`40-voucher.png` |
| 移液枪 | 全部及三个状态筛选、高亮切换、列表及详情内容 | `38-gun-detail.png`、`56-gun-filter-switch.png` |
| 我的 | 负责设备、负责房间、设备报警及房间报警列表、个人信息、退出登录 | `34-responsible-devices.png`、`35-responsible-rooms.png`、`36-alarm-list-0.png`、`36-alarm-list-1.png`、`41-profile.png` |
| 系统交互 | 预约弹窗打开时系统返回先关闭弹窗并保留详情；再次返回列表；切换系统桌面后恢复项目 | `49-popup-closed-stays-detail.png`、`59-background-resume.png` |
| 小屏 | 首页不横向溢出，导航位于可视区；预约日期、关闭入口与底部按钮完整显示 | `results-small-screen.json`、`52-home-small.png`、`54-reservation-small.png` |

初轮脚本曾因页面尚未加载、调试连接中断或没有切换到新 WebView 而中止；这些中间结果不作为通过依据。最终凭证、移液枪、个人页等以 `results-final.json` 为准，分页和分类以 `results-extra.json` 为准。列表核对、截图和状态断言只证明表中列出的操作。

## 已修复问题

1. 登录检查延后到页面就绪，应用生命周期与未授权请求共用跳转锁，未登录首页不再请求受保护数据，避免重复导航及离开页面后的弹窗回调。
2. 匹配手动启动屏配置，在目标页面就绪后关闭启动屏。
3. Android 首页使用紧凑布局并保留状态栏空间；代码按页面背景设置状态栏前景样式，但 MuMu 基座截图中首页前景仍为深色，颜色切换不列为已验证通过。
4. 页面就绪后隐藏原生 TabBar，消除自定义导航下方残留空白；调整自定义导航高度和内部留白。
5. Android 报警卡片使用明确间距，房间筛选宽度使用容器宽度；消息按钮内图标、文字居中，按钮组仍靠右。
6. 预约时间列表按屏高限制高度，避免小屏弹窗顶部超出视口；系统返回优先关闭可见弹窗，并执行表单关闭清理。
7. 修复设备页高度属性类型、个人页数字标题类型及运单对话框未定义 `msgType` 的开发期警告。
8. H5 回归发现框架通过 `body::after` 动画预加载远程导航阴影，已关闭该动画并使用 CSS 渐变，避免外部图片依赖。

## 回归结果

- App 发布资源编译通过。资源编译不等于独立 APK 打包或安装验证。
- 微信小程序生产编译通过，没有上传发布；本轮未做微信真机验收。
- H5 生产编译及 `scripts/check-miniapp-h5.cjs` 核心回归通过，运行错误和失败资源请求均为 0；覆盖 320/390/768/1280px 视口。记录：`docs/evidence/android-h5-regression/results.json`。
- MP1～MP7 业务逻辑检查、移液枪返回列表检查、启动时机/导航锁检查和弹窗返回处理检查通过。新增可重复检查为 `scripts/check-miniapp-startup.cjs`、`scripts/check-miniapp-popup-back.cjs`。
- 编译仍有已有的 Moment locale 提示、H5 资源体积提示、微信子包建议及鸿蒙 UA 检查提示；本轮没有处理这些非阻塞项。

## 限制与下一阶段

### 报警分类计数补充验收（2026-10-29）

用户指出房间 A 切换分类后标签数量随列表变化，补充了此前未覆盖的统计不变断言。原因是 Mock 在按处理状态过滤后计算 `alarmStat`。现改为先按对象/负责人范围统计，再筛选和分页；空列表也返回顶层统计，组件优先读取该统计。列表分页的 `total` 仍为当前筛选数量。

MuMu 实际反复切换全部、未处理、已处理，标签始终为 `3 / 2 / 1`，列表分别为 `3 / 2 / 1` 条，记录为 `docs/evidence/android-core/results-alarm-counts.json`。H5 另验证 `3 / 3 / 0` 的空已处理列表，再通过界面处理一条，验证更新为 `3 / 2 / 1`，记录为 `docs/evidence/alarm-counts-h5/results.json`。MP5 新增处理后统计、分页空页、负责人范围及反复筛选检查通过；MP2、MP3 及微信小程序编译通过。

### 验证限制

- 尚未生成项目独立 APK；本轮只验证标准调试基座中的应用，不等同于独立安装包验收。
- 仅一台 MuMu Android 15；未验证 Android 真机、其他 Android 版本、厂商 ROM 或真实系统手势导航/刘海设备。
- 输入框输入和提交已验证。临时开启软键盘选项后系统报告输入法显示，但完整设备截图没有可见的键盘面板，不能据此声称已通过真实软键盘遮挡验收。测试后已恢复原键盘设置。
- 状态栏空间与页面内容无重叠；首页状态栏前景颜色在标准基座中未呈现预期浅色效果，独立 APK 及真机阶段需补查原生窗口设置与实际颜色。
- 屏幕尺寸调整已恢复；没有修改用户的 HBuilderX 端口设置。后续手工运行若设备列表为空，可使用当前实际有效的 MuMu 端口 5555。
- 真实蓝牙、打印、枪架硬件未接入；没有以演示提示替代硬件通过记录。
- DCloud 打包账号、独立包名、签名证书及 APK 安装验证留待打包阶段。iOS 仍受 Mac、Apple 账号、签名及设备条件限制，本轮不涉及。
- 本轮未公开部署、未改简历。
