# 本地演示指南

项目背景与原项目开发经历见 [仓库首页](../README.md)。本页说明如何运行与体验当前演示。

## Web 启动

在仓库根目录执行：

```powershell
cd smart-facility-platform
npm ci
npm run demo
```

已安装依赖时跳过 `npm ci`。默认地址 `http://127.0.0.1:8088`，以终端输出为准；脚本处理 Webpack 4 在现代 Node 上的 OpenSSL 兼容参数。使用 `demo` / `Demo1234` 登录，验证码 `2468`。

## 推荐体验

| 顺序 | 操作 | 观察重点 |
| --- | --- | --- |
| 1 | 楼宇进入 1F，点击房间 A / B | 3D 到平面图导航；A 正常，B 中设备异常 |
| 2 | 楼层/房间进入配置，拖动、移除、保存 | 移除只改布局；返回预览及刷新后读取结果 |
| 3 | 打开设备/房间大屏，选中报警，再点击取消 | 总览保留空间范围统计，下方卡片变化 |
| 4 | 设备详情打开预约日历 | 新建未来时段、重叠拒绝、修改取消、记录同步 |
| 5 | 系统管理进入报警记录，添加处理 | 处理记录改变，异常读数仍保留 |
| 6 | 智能硬件进入移液枪和枪架管理 | 在线模拟取还、离线拒绝、超时及槽位规则 |
| 7 | 运单管理查看或创建运单 | 待装车、已装车、运输中、已送达的合法顺序 |

地图设置 `/ms/mapSet`：楼宇下新增/编辑楼层及上传底图，选择楼层查看房间并进入配置。房间增删改在 `/rm/room`。无底图时显示空态，不借用其他房间底图。

可选择仓库中的 `smart-facility-platform/public/demo/floors/floor-a-1f.png`、`room-a.png`、`room-b.png` 体验上传。图片只包含空间，名称和设备由数据动态绘制。

## H5 本地启动

安装 HBuilderX 及 uni-app Vue 2 编译插件，在仓库根目录执行：

```powershell
cd miniprogram
npm run build:h5
npm run preview:h5
```

访问 `http://127.0.0.1:8188`，使用 `demo` / `Demo1234` 登录。无法自动发现编译器时设置 `HBUILDERX_ROOT`。截图、移动端体验路线与源码入口见[小程序与 H5 导览](miniapp-business.md)。当前以本地方式展示，历史第三方托管不作为可靠面试入口。

## 微信小程序启动

1. HBuilderX 导入 `miniprogram`，使用 uni-app Vue 2 工程。
2. `manifest.json` 配置自己有权限的微信 AppID。
3. 微信工具开启「设置 → 安全设置 → 服务端口」，在 HBuilderX 配置工具路径。
4. 运行到微信开发者工具；手动导入选择 `miniprogram/unpackage/dist/dev/mp-weixin`。
5. 使用 `demo` / `Demo1234` 登录，体验设备、房间、预约及移液枪。

`app.json` 由编译生成，不能把 `.vue` 源码目录作为原生微信项目运行。当前 `miniprogram/package.json` 提供编译、预览及浏览器检查命令，不提供 `npm run dev`。运行到微信工具的开发输出为 `unpackage/dist/dev/mp-weixin`；执行 `npm run build:mp-weixin` 的生产输出为 `unpackage/dist/build/mp-weixin`。H5 不能代替微信环境验证。

`npm run build:app` 只生成 App 编译资源，不是 APK / IPA 安装包。各端实际进展见[跨端验证记录](cross-platform-validation.md)。

## 数据与验证

Web 命名空间 `smart-facility-demo:v1:`，小程序 `sf-mini-demo:`，两端不自动同步。预约使用当前实际日期，监测及部分运输样例使用演示基准时间，不能混用时钟。

演示不连接原业务服务器，未知接口明确失败。通知规则不发送电话/短信/微信，模拟取还不控制真实枪架，轨迹不是真实 GPS。资产审批及完整工单/BPM 流程不作为演示功能。

Web 目录运行 `npm run test:demo -- --watch=false`；根目录运行 `scripts/check-mp1-demo.cjs` 至 `check-mp7-transport.cjs` 对应的小程序检查。浏览器/微信模拟器脚本需要对应服务和工具已启动。逻辑检查通过不等于全部 GUI、真机和硬件验收通过。

## 进一步阅读

- [地图与布局](map-and-layout.md)：坐标、交互、快照和资源释放。
- [监控与大屏](monitoring-and-dashboard.md)：状态、统计及估算数据。
- [设备与房间](device-and-room.md)：实体关联、导入与删除约束。
- [预约与告警](reservation-and-alarm.md)：时间校验、人工处理及通知规则。
- [小程序](miniapp-business.md)：模块、持久化和验收范围。
- [移液枪](pipette-gun.md)、[运单](transport.md)：状态机与模拟规则。
