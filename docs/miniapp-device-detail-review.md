# MP4 后设备详情跳转复盘

日期：2026-10-05。

## 发现与修复

截图中导航栏已变为“设备管理详情”，说明已进入详情路由，不能简单判断为 navigateTo 没执行。设备卡片的路由、ID，以及详情包装页对子组件的引用均正确。

发现确定的首次渲染缺陷：LabdeviceDetail.vue 初始 detail 没有 status/bingStatus，模板立即读取 statusColor(...).class；原 helper 在状态未匹配时返回 undefined，导致渲染异常。该缺陷与截图相符，但未取得完整模拟器异常堆栈，不能认定是唯一原因。

- utils/methods.js：未知或尚未加载的状态返回 `{ class: '' }`，已知状态按原规则着色，房间详情调用方也受益。
- detailPage/LabdeviceDetail/index.vue：移除卸载时强制 reLaunch 首页的逻辑，恢复自然返回，避免从房间/搜索进入后被送回首页及空页面栈访问异常。
- manifest.json：显式关闭 uniStatistics，避免当前 HBuilderX 编译器默认开启统计。

## 验证与限制

- check-miniapp-status-color.cjs 通过，覆盖有效状态、字符串状态、数组枚举、空值及未知值。
- MP1–MP4 的已有 Mock 检查均通过。
- 使用本机已有 HBuilderX uniapp-cli 重新编译成功，脚本为 scripts/build-miniapp-review.ps1。输出为 miniprogram/unpackage/review/mp-weixin，未替换常规 dev 产物。
- 编译仍有体积/分包建议、moment 可选 locale 解析及 project.config.json 重复输出警告。
- 旧产物直接 navigateTo 曾返回详情路由及实际详情组件数据，不能替代真实卡片点击验收。
- 新产物通过微信 CLI 打开并尝试自动化：Tool.getInfo 成功，页面查询/操作超时。因此真实点击→详情→刷新→返回的模拟器验收未完成，不记为通过。docs/evidence/miniapp-device-navigation 中空 results 不是通过证据。

## 后续验收

重新用 HBuilderX 运行当前源码，避免仍使用旧 dist/dev/mp-weixin。设备 Tab 点击首个设备，检查名称/编号及详情内容；下拉刷新后设备保持一致；返回回到列表。从房间设备列表或搜索进入后，应返回来源页面。再验证详情预约入口。

未改后台、未安装依赖、未 commit/push。
