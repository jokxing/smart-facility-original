# 小程序检查脚本

更新：2026-10-29。图文阅读入口见[小程序与 H5 导览](../docs/miniapp-business.md)，分端结果见[跨端验证记录](../docs/cross-platform-validation.md)。本次只整理文档及已有图片，未重新运行检查。

2026-10-28 新增跨端入口：`build-miniapp.ps1 -Platform h5|mp-weixin|app-plus`、`serve-miniapp-h5.cjs`、`check-miniapp-h5.cjs` 和 `stage-miniapp-h5.cjs`。H5 浏览器检查使用 Playwright，输出到 `docs/evidence/cross-platform-h5`；只对新建的测试浏览器上下文执行写入。阶段与结果见[跨端验证记录](../docs/cross-platform-validation.md)。

2026-10-14 核对：目录中 15 个现有脚本均有用途，未确认可删除的废弃文件。脚本不在应用启动时执行，供维护和回归使用，不需要面试官逐个阅读。

## 业务与专项检查

在仓库根目录使用 Node 运行，无需开启微信开发者工具。使用模拟 uni 存储与页面环境，不作为微信 GUI 或真机验收。

| 文件 | 检查内容 |
| --- | --- |
| check-mp1-demo.cjs | 本地登录、会话及基础演示规则 |
| check-mp2-demo.cjs | 设备业务 |
| check-mp3-demo.cjs | 房间业务 |
| check-mp4-demo.cjs | 预约时间、冲突及身份约束 |
| check-mp5-demo.cjs | 告警、消息及负责范围 |
| check-mp6-demo.cjs | 移液枪与枪架规则 |
| check-mp7-transport.cjs | 运单状态流转 |
| check-miniapp-gun-navigation.cjs | 取枪完成后的返回栈 |
| check-miniapp-gun-return-list.cjs | 返回列表时的刷新及状态读取 |
| check-miniapp-status-color.cjs | 状态颜色及未知/空值 |

2026-10-14 与 2026-10-28 的历史记录为上述 10 个脚本通过。通过的只是脚本覆盖的逻辑，不扩大为全部小程序流程验收。

## H5 编译与浏览器检查

| 文件 | 用途与运行条件 |
| --- | --- |
| build-miniapp.ps1 | 复用本机 HBuilderX Vue 2 编译器；支持 H5、微信和 App 资源目标 |
| serve-miniapp-h5.cjs | 仅在本机 127.0.0.1:8188 预览已构建的 H5 文件 |
| check-miniapp-h5.cjs | Playwright 浏览器流程检查；生成结果与截图，需要先启动预览服务 |
| stage-miniapp-h5.cjs | 历史托管尝试使用的暂存脚本；本地阅读和预览无需执行 |

`miniprogram/package.json` 提供上述命令入口。Playwright 安装在 `miniprogram/node_modules` 时，根目录 `scripts` 下的测试文件需要额外的依赖查找设置；安装与 PowerShell 会话配置见[小程序运行说明](../miniprogram/README.md#h5-运行)。

现有 H5 脚本只等待“移液枪”字样便记录详情通过，尚未断言名称、编号和状态。整体报告通过不能替代这一项数据加载验收；本次未改测试脚本。`build:app` 仅编译资源，不生成 APK / IPA。

## 依赖本机工具的辅助文件

| 文件 | 用途与条件 |
| --- | --- |
| check-mp1-simulator.cjs | 连接已编译小程序的微信自动化端口，可通过 --native 使用原生交互检查 |
| mp1-native-ui.cjs | 被模拟器入口调用，执行输入、点击、导航和工具重开等场景 |
| mp1-simulator-driver.cjs | 两个检查入口共用的 WebSocket 驱动，依赖 Web 工程 node_modules/ws |
| check-miniapp-device-navigation.cjs | 通过该驱动检查设备相关页面导航并输出记录 |
| build-miniapp-review.ps1 | 使用已安装 HBuilderX 编译到 unpackage/review/mp-weixin |

编译脚本与模拟器入口含本机 F 盘工具路径，自动化默认连接 ws://127.0.0.1:9420。换电脑需修改安装路径并配置微信服务端口；编译输出目录与工具导入目录需对应，不假定脚本自动配置 AppID。

这些操作会启动/控制开发工具、改动模拟器存储或写入验证文件，面试现场不直接运行。2026-10-29 文档整理未运行这 5 个环境相关文件，不把它们记为最新通过。

小程序使用说明见[小程序专题](../docs/miniapp-business.md)。
