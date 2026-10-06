# 小程序 MP1 演示契约

日期：2026-10-05。范围：启动、品牌、本地 Mock、演示登录与首页。不覆盖 MP2–MP5。

## 名称与工程

- 展示名：智慧设施助手 / Smart Facility Assistant。
- 目录仍为 `miniprogram`，HBuilderX Vue 2（`manifest.json` `vueVersion: "2"`）。
- 微信 AppID 留空，由使用者填入有权限的测试号。DCloud `appid` 仅本地工程标识。

## 演示模式

- `utils/config.js` 中 `DEMO_MODE` 默认 `true`。`baseUrl` 为空，不含旧域名。
- 全部业务请求经 `utils/request.js` → `utils/demo/handlers.js`。演示开启时不调用 `uni.request`，未知路径返回 `{code:0,message:'该功能演示尚未开放',items:null}`，不回落旧服务。
- 语言初始化不再请求 `/api/user/language`；该接口若被调用则由 Mock 处理。
- 上传：OSS 配置已清空；`uploadFile.js`、入库确认与铭牌上传在演示中直接拒绝，不发远程上传。

## 会话与存储

- 命名空间：`sf-mini-demo:`。键：`token`、`userInfo`、`username`、`avatarUrl`、`labStatus`、`roomStatus`、`tabBarIndex`。
- 退出只 `remove` 上述键，禁止 `uni.clearStorageSync`。
- 演示 token 前缀 `sf-demo-`。受保护接口无有效演示 token 时 `code: 2`。
- 登录与真实微信授权隔离：不调用 `wx.login` / `getUserProfile`。

## 登录

- 页面：`/myPage/Login/Login`。账号 `demo` / `Demo1234`（与后台演示文案一致），本地校验。
- `POST /api/demo/login`；用户信息 `GET /api/user/info`。
- 启动：`App.vue` `onLaunch`/`onShow` 按会话跳转登录或首页，已在目标页则不再 `reLaunch`。

## 种子来源与差异

来源（只读复制字段，未 import Web 模块）：

- `smart-facility-platform/src/mock/fixtures/auth.js`：演示用户与口令。
- `instrument.js`：设备 970001–970012 及房间归属。
- `room.js` / 空间约定：房间 A=950001、走廊=950002、B=950003。
- `scenario.js`：默认混合态，仅 970008 参数报警，运行状态均为运行中。

写入小程序：`miniprogram/utils/demo/seeds.js`。

差异：无布局坐标、无创建/删除覆盖、无 Web localStorage / axios。两端存储不自动同步。

## 首页统计

同一份种子计算：

| 维度 | 监控中 | 正常 | 报警 | 离线 | 运行/待机/关机 |
| --- | --- | --- | --- | --- | --- |
| 设备参数 | 12 | 11 | 1 | 0 | — |
| 设备运行 | 12 | — | — | — | 12 / 0 / 0 |
| 房间 | 3 | 2（A、走廊） | 1（B） | 0 | — |

首页三块卡片按**参数状态**；运行状态单独一行，避免与参数混计。

## 本批开放接口

登录、用户信息、语言、首页统计、未读空标记、我的页统计（待办/预约/报警次数为 0，不编造通知）、消息空列表、待办空列表、运单空列表与零仪表盘、搜索空数组、扫码业务明确未开放。

设备列表、房间列表、预约、告警处理、移液枪等返回未开放或空态，不伪造闭环。

## 平台边界

- 微信：更新检查与扫码保留在 `MP-WEIXIN`；扫码后业务仍为未开放。
- H5：可用于登录/首页布局预览；不支持扫码、蓝牙、微信更新；不等于模拟器/真机验收。
