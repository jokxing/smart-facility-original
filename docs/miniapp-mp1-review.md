# 小程序 MP1 复盘

日期：2026-10-05。对照 `docs/miniapp-next-task-prompt.md` 与 `docs/miniapp-mp1-contract.md`。

## 已完成

- 修正登录路径与 `onLaunch`/`onShow` 会话守卫，去掉 `mounted` 反复 `reLaunch`。
- 默认本地演示 Mock，未知接口不回落；配置与 OSS 去掉旧域名/密钥。
- 本地登录 `demo` / `Demo1234`，专用 storage 前缀，退出只清演示键。
- 首页统计与后台种子一致；运行/参数分列；消息待办空态说明。
- 品牌标题改为智慧设施助手；微信 AppID 留空。
- `wx` 启动路径改为 `uni` 或条件编译，便于 H5 预览登录/首页。

## 自检与修复

- 登录页不再依赖微信授权。
- `request.js` 演示分支不调用 `uni.request`。
- `lang/index.js` 初始化不再打语言接口。
- 首页未登录统计对象补了默认值，避免空对象取值。
- 我的页 `thingsUser` 默认结构，避免空字符串渲染报错。
- 上传入口短路，避免初始化后仍打 OSS。

## 验证

- `node scripts/check-mp1-demo.cjs` 通过：种子、统计、鉴权、未知接口、storage 隔离、空列表契约、源码不含 `uni.request`/旧域名。
- 未安装 HBuilderX / 微信开发者工具，**未做微信模拟器或真机验收**，不能标 MP1 运行成功。
- 未做 H5 实际打开；H5 仅从源码上隔离了首页/登录的 `wx` 调用。

## 限制

- 设备/房间/运单 Tab 可进，列表为未开放或空，不是业务闭环。
- 自定义 TabBar 图标仍用原 PNG；运单 Tab 仍暂用房间图标。
- 未把 Web localStorage 与小程序 storage 打通。
- `main.js` 仍保留未使用的 Vue 3 条件分支，工程按 Vue 2。

## 后续 MP2 线索

设备列表/详情、监测与告警状态对接同一种子；筛选分页与 970008 报警一致；不要把首页参数卡片误当成运行状态。

## 2026-10-05 微信模拟器补验收

本机已找到 HBuilderX 和微信开发者工具，并实际连接微信模拟器完成登录、首页统计、刷新、导航和退出检查。前面的“未安装工具”是早期记录。冷启动与跨工具重开持久化仍未完成，不标整体验收通过。详细结果、更正及证据见 [miniapp-mp1-simulator-review.md](miniapp-mp1-simulator-review.md)。
