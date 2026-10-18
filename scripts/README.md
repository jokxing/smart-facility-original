# 小程序检查脚本

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

本轮上述 10 个脚本均执行通过。通过的只是脚本覆盖的逻辑，不扩大为全部小程序流程验收。

## 依赖本机工具的辅助文件

| 文件 | 用途与条件 |
| --- | --- |
| check-mp1-simulator.cjs | 连接已编译小程序的微信自动化端口，可通过 --native 使用原生交互检查 |
| mp1-native-ui.cjs | 被模拟器入口调用，执行输入、点击、导航和工具重开等场景 |
| mp1-simulator-driver.cjs | 两个检查入口共用的 WebSocket 驱动，依赖 Web 工程 node_modules/ws |
| check-miniapp-device-navigation.cjs | 通过该驱动检查设备相关页面导航并输出记录 |
| build-miniapp-review.ps1 | 使用已安装 HBuilderX 编译到 unpackage/review/mp-weixin |

编译脚本与模拟器入口含本机 F 盘工具路径，自动化默认连接 ws://127.0.0.1:9420。换电脑需修改安装路径并配置微信服务端口；编译输出目录与工具导入目录需对应，不假定脚本自动配置 AppID。

这些操作会启动/控制开发工具、改动模拟器存储或写入验证文件，面试现场不直接运行。本轮未运行这 5 个环境相关文件，不把它们记为最新通过。

小程序使用说明见[小程序专题](../docs/miniapp-business.md)。
