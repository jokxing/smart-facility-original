# 交给新对话 / 另 AI：MP1 小程序启动与首页演示闭环

> 2026-10-06：MP2–MP6 已实施。下文 MP1 要求保留为历史背景。MP6 契约见 [pipette-gun-contract.md](pipette-gun-contract.md)。

你在 E:\project\smart-facility-original 工作。用户已放入 miniprogram 小程序副本并授权直接修改。请实际完成 MP1，再复盘修复；不要只输出方案，不自动扩展 MP2–MP5。

先读 docs/PROJECT_CONTEXT.md、docs/miniapp-audit.md、miniprogram/README.md；检查适用 AGENTS.md 与 git status，保留用户已有改动。旧 docs/next-task-prompt.md 是 Web 任务，不作为本次范围限制。

## 范围与约束

- 主要修改 miniprogram 与本批 docs；后台仅只读参照，不修改 smart-facility-platform。
- 保留 uni-app、Vue 2、现有 uni_modules、自定义 TabBar、i18n 和布局，不迁移 Vue 3、不整体重写、不为了启动先引入 CLI。
- 用户自行安装 HBuilderX 和微信开发者工具；先完成源码可做的工作，不把安装工具作为静态修复前置。缺少实际编译环境时明确未验证项，不伪造运行证据。
- 不安装依赖、不连接原公司接口、不使用旧账号、不推送或提交 Git。旧 AppID、域名、客户资料不得复制到文档/日志；不需要询问或索要 AppSecret。
- 产品展示名统一“智慧设施助手”，英文 Smart Facility Assistant，SF 品牌与后台一致；本批保留目录 miniprogram，不移动目录。

## 必须完成

1. 核实 HBuilderX Vue 2 工程设置、入口与 pages.json 路由，修复 App.vue 中错误登录路径，使用 onLaunch/onShow 等合适生命周期。冷启动未登录进入登录、登录后首页、重开保留有效会话、退出后清会话并返回登录。不能因反复 onShow 循环跳转。
2. utils/request.js 统一接入明确默认开启的本地演示模式。演示请求先由 Mock 处理，不调用 uni.request；未知接口返回清楚的未开放结果而不回落旧服务。查找初始化、语言切换、上传、下载等绕过请求入口的外部调用，演示入口隔离。
3. 演示配置移除旧域名和旧应用标识；manifest.json 的微信 AppID 留待用户有权限的测试标识配置，不凭空填有效 ID。修默认旧品牌标题和可见登录品牌；仅使用可复用/已审查的素材，微信图像使用其支持的格式，不假定 Web SVG 在 image 中直接可用。
4. 使用 uni.getStorageSync/setStorageSync，专用命名空间；仅清演示数据，禁止 uni.clearStorageSync 清用户全部数据。统一 {code,message,items}，按页面契约提供分页/统计。隔离演示与真实登录，不调用 wx.login/getUserProfile 作为演示必需条件。
5. 登录页提供本地演示入口（demo / Demo1234 可与后台文案一致，校验发生本地），用户信息为演示数据。处理失败、loading、重复点击和退出；不能直接跳过所有鉴权。
6. 首页实际使用的接口返回一致 Mock：统计由同一份种子计算，房间 A 正常、B 有一个参数报警设备，其余正常；运行状态与参数状态分别统计。首页出现未开放模块，隐藏或明确说明，不点击后等待旧接口。
7. 自定义 TabBar 和路由可用；未完成设备/房间/运单业务接口暂不伪造闭环，可保留明确的待完善空态。首页消息/待办不编造真实通知发送。
8. 初始化 wx 全局引用加平台条件或改用 uni API，基础 H5 登录/首页可用于低成本布局预览。微信更新、扫码、蓝牙功能保留微信端边界；H5 给明确支持范围。

## 与后台业务对齐

只读参考 smart-facility-platform/src/mock/fixtures/{auth,instrument,room,roomTree,scenario,equipment}.js 及 docs/datav-review-contract.md。不得直接 import 含 window、Web UI、axios 的模块。可以提取或复制适配后的纯种子/字段，但将来源和差异写入契约，禁止散落页面硬编码。

设备/房间 ID、名称、归属、状态一致。Mock 在小程序自己保存；本批不承诺 Web localStorage 与小程序 storage 自动同步，不指向 Web 开发端口冒充业务 API。

## 验收与交付

- 检查请求是否全部本地化，未支持接口不会回落到旧服务。
- 检查页面路由存在、Vue 模板和导入路径、平台守卫以及演示数据命名空间。
- 有编译环境时实际运行微信模拟器：冷启动 → 本地登录 → 首页 → 下拉刷新 → 导航 → 退出 → 重开，验证统计、错误/空态与重复点击。记录 HBuilderX / 微信工具版本、编译结果和证据。
- 可以 H5 验证布局，但不能宣称这等于微信模拟器/真机验收；未安装工具不标成功。
- 不为简单文案写镜像测试；对 Mock 鉴权、统计一致、分页和 storage 隔离做有意义验证，若缺测试工具不用安装大套件代替实际检查。
- 写 docs/miniapp-mp1-contract.md、docs/miniapp-mp1-review.md，更新 docs/STATUS.md 文末小程序段落。列已改文件、验证、限制、后续 MP2 线索。
- 完成本批就停止，不执行 git commit/push。用户另有审查 AI 会复盘并修复后统一给 commit 信息。

接手后的首次回复简述已核实的框架与范围，然后开始处理。

## 后续已授权任务：MP6 移液枪与 SaaS 一并完善（2026-10-05 补充）

用户要求小程序推进到移液枪模块时，同时处理 SaaS 对应功能。此授权在该批生效，不要求在 MP1 中一次做完。MP6 可修改 miniprogram、smart-facility-platform 及相关 docs；前面的“后台仅只读参照”只适用于 MP1。

- 先审查后台 src/views/pipetteGun、pipetteGunRack、src/api/gun/index.js、路由和演示权限；小程序 pages/tabBar/Labdevice/PipetteGun.vue、detailPage/PipetteGunDetail、PipetteGunRackDetail、utils/api.js。
- 后台现有 /gun/pipette/binding/list 仅为枪架只读种子，不能据此宣称移液枪功能完成。小程序 /api/gun/pipette/list 与后台 /gun/pipette/listV1 有差异，先核实响应再适配。
- 建立统一的移液枪、枪架、枪位、使用人、取还记录及状态契约，种子 ID 与名称一致。空枪位不算移液枪实体；在位、使用中、超时未归还及离线语义分别核实。
- 后台开放适用的入口，完成列表、统计、筛选分页、详情、枪架绑定关系和使用记录；小程序完成列表、详情、枪架查看、模拟取枪与归还及记录回显。
- 取还状态与记录、统计在各端本地一致；阻止重复取枪、重复归还、占用枪位等非法操作。超时按同一规则判断，不靠静态数字伪造；离线枪架不显示真实硬件操作成功。
- 取枪 API 发出申请不等于硬件已取走。真实枪架确认或轮询逻辑与模拟确认明确区分；演示可以模拟取还完成，但 UI 与文档不可声称已连接硬件。
- 用户明确不需要共享 API 或跨端实时同步：各端独立本地 Mock，保持业务契约一致，不新增服务器、不假装小程序取枪后 Web 自动变化。
- 在 README 和本批演示契约补充说明：两端属于同一业务系统，演示使用独立本地存储；真实联动需要共享后端及枪架反馈。项目简历说明暂不完善，用户之后统一安排；不凭本批改造扩写个人履历贡献。
- 验证两端各自列表 → 详情/枪架 → 模拟取枪 → 使用记录与统计更新 → 归还，以及重复操作、空态、超时状态和刷新持久化。微信验证需实际模拟器，Web 验证用现有本地浏览器方式。
- 完成后写 docs/pipette-gun-contract.md 与 docs/review-pipette-gun.md，记录各端验证及限制，更新 STATUS。交原审查 AI 复盘修复后再统一给 commit 信息，不自动 commit/push。
