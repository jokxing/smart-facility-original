# smart-facility-platform 第一轮源码审查

> 历史快照说明（2026-09-23 后续更新）：本报告记录第一轮只读审查时的源码与依赖锁文件，后续行号可能变化。现已增量完成隔离演示启动和登录切片；最新文件、实际安装版本、验证及未完成项见 `docs/STATUS.md` 和 `docs/demo-guide.md`。下文“未实施”指第一轮当时状态，不替代最新 STATUS。

审查日期：2026-09-23。范围：当前 `smart-facility-platform` 副本。结论依据：`docs/PROJECT_CONTEXT.md` 与本次实际源码；不把目录存在、依赖声明或方法名称当作功能完成证明。

本文文件依据均相对 `smart-facility-platform/`，冒号后为本轮源码行号。敏感值不转录；相对接口路径仅用于后续契约设计，不包含服务域名、凭证或真实数据。

## 1. 范围、工作区与验证边界

- 已先阅读 `docs/PROJECT_CONTEXT.md`。当前根目录只有 `docs/` 和平台目录，关联小程序尚未放入。
- 检查了 `E:/AGENTS.md`、`E:/project/AGENTS.md`、工作区根目录、`docs/` 及平台子树，未发现适用的 `AGENTS.md`。
- 根目录和平台目录的 Git 状态检查均返回“不是 Git 仓库”。不能声称工作树干净、判断既有改动或通过提交历史核实个人贡献；本轮未初始化仓库。
- 平台共 741 个文件，其中 403 个 Vue 文件、32 个 API 文件；数量仅表示扫描范围。没有 `node_modules/`，未安装依赖、启动应用、调用接口、执行构建/部署或推送 Git。
- 执行文本检索、调用链抽查、配置/锁文件解析、资源清点及 ZIP 目录只读检查。没有执行 ZIP 内程序、读取其数据库内容或逐一解析 XLS、图片、字体。
- “保留 / 替换 / 删除 / 待核实”是后续处置建议，本轮没有实施业务修改。“已实现”下文均指存在实质源码，不代表已经运行验收。

## 2. 工程与构建事实

### 2.1 入口和结构

`public/index.html:24` 提供挂载节点；`src/main.js:1–36` 装配 Vue、App、Router、Vuex、i18n、Element UI、全局组件及路由守卫；`src/App.vue:1–39` 为路由视图、转场和 reload 注入。

`src/router/index.js` 是实际导入的路由表，`new VueRouter({ routes })` 未指定 history 模式，使用默认 hash 路由。`src/router/index.last.js`、`src/router/subRoute.js` 是并存文件，本轮全源码引用检索未发现它们被导入；不能以旧表替代当前路由判断。

主结构：`src/views/` 页面、`src/components/` 公共组件、`src/api/` 接口模块、`src/utils/axios.js` 请求方法包装、`src/utils/request.js` Axios 实例、`src/store/` 状态模块、`src/i18n/` 中英语言包、`src/assets/` 源码素材、`public/` 直接复制的静态资源。

### 2.2 依赖核实

| 能力 | package.json 声明 | package-lock.json 实际记录 / 补充证据 |
| --- | --- | --- |
| Vue 2 | Vue `^2.6.11`，compiler `^2.6.14` | 两者锁定 `2.6.14`，并非仅凭声明判定版本冲突 |
| 构建 | Vue CLI `~4.5.0`，Webpack `^4.5.0` | CLI service `4.5.19`；根 Webpack `4.5.0`，CLI 嵌套 Webpack `4.46.0` |
| 路由 / 状态 | Router `^3.2.0`、Vuex `^3.4.0` | 锁定 `3.6.5`、`3.6.2` |
| UI / 国际化 | Element UI `2.15.8`、i18n `^8.28.2` | 锁定 `2.15.8`、`8.28.2`；main.js 实际注册 |
| 请求 | Axios `^0.24.0`、qs | Axios 锁定 `0.24.0`；API 经统一实例调用 |
| 3D | Three `^0.136.0` | 锁定 `0.136.0`；Building.vue 使用 GLTFLoader、OrbitControls；同时列在 dependencies/devDependencies |
| 大屏 | DataV `^2.10.0`、ECharts `^4.8.0`、V-Charts `^1.19.0` | 锁定 `2.10.0`、`4.9.0`、`1.19.0`；后两者列在 devDependencies，但业务组件确有导入 |
| 平面图 | Konva `^8.3.2`、vue-konva `^2.1.7`、SVG.js `^3.1.1` | Konva 锁定 `8.3.10`、SVG.js `3.1.2`；楼层/房间 Designer 有 Konva 拖拽与变形，SVG.js 的具体展示范围仍需细查 |
| 其他 | 高德 loader、FullCalendar、Moment、html2canvas、jsPDF、打印插件 | TransportMap.vue 实际加载高德；LabDeviceDrawer.vue 引入 Fullcalendar；其他导出/打印功能未逐页验收 |

锁文件版本为 2。没有通过安装验证完整依赖树。根 `html-webpack-plugin` 锁定 5.5.0，而 CLI 嵌套版本是 3.2.0；需在后续离线演示构建准备时核对解析结果，不在本轮盲目升级依赖。

### 2.3 脚本、环境与生产资源

| 脚本 | 实际行为 | 审查判断 |
| --- | --- | --- |
| `serve` | `vue-cli-service serve` | 默认开发模式，也会读取现有开发环境配置，不能直接当作安全演示启动 |
| `dev` | `vue-cli-service serve --mode prod` | 名称容易误导，实际读取 prod 模式配置 |
| `build:dev` | `vue-cli-service build --mode development` | 构建命令与 development 模式组合，后续需显式核对 NODE_ENV 和产物差异 |
| `build` / `report` | build 使用 prod 模式，report 加构建分析 | 构建而非部署；本轮均未执行 |
| `test:unit` | Vue CLI Jest | 测试仅发现一个模板性质的用例，未运行 |

依据：`package.json:5–12`；`vue.config.js:5,15–47,50–61,104–135`；`public/index.html:25–31`。

构建输出为 `dist/`、资源目录 `static/`、相对 publicPath；生产关闭 source map，有分包、时间戳文件名、gzip。配置名为 cdn，但 Vue、Router、Vuex、Axios 实际指向 `public/js/` 的本地脚本，不能误写成全部依赖外部 CDN。

生产 external 脚本头可确认 Vue 2.6.14、Router 3.5.3、Vuex 3.6.2；Router 与锁文件的 3.6.5 不同，属于开发/生产运行时差异待验证。`babel.config.js` 使用 CLI Babel preset 和 Element 按需样式插件；`postcss.config.js:3–18` 配置 1920 基准 px 转 vw，排除部分大屏/中控路径。

### 2.4 .env 检查（不记录任何真实值）

| 文件 | 存在的键 | 仅描述类型与风险 |
| --- | --- | --- |
| `.env.development:1` | `VUE_APP_BASE_URL` | 非空绝对服务地址，值已隐藏；开发启动可能访问原服务 |
| `.env.prod:1–2` | `NODE_ENV`、`VUE_APP_BASE_URL` | 非空模式值和相对请求前缀，全部值已隐藏；相对路径并不等于无网络依赖 |

两个文件均已在内存中检查，未改写。`.gitignore:7–11` 排除了这两个文件，但文件仍实际存在于副本中；忽略规则不能替代脱敏，也不能证明 Git 历史中从未保存配置。`vue.config.js:43` 还有硬编码远端代理目标，不能只改 env 就宣称隔离完成。

## 3. 四条真实功能链路

### 3.1 Three.js 楼宇与平面图

入口：`Dashboard.vue:115–121` 增加 `/building` 按钮；`router/index.js:675–683` 路由指向 `views/building/Building.vue`。

调用链：

```text
Dashboard → /building → Building.vue
  → api/map.getGardenList → 园区列表
  → api/map.getBuilding(gardenId) → 楼栋、模型 url、subDivisions
  → BASE_URL + url → GLTFLoader → Three 场景/相机/灯光/OrbitControls
  → 楼层按钮 → /floor/view → floorConfiguar/index.vue
  → 房间交互 → 房间详情抽屉；另有 /room/view 平面预览
```

实质实现证据：`Building.vue:140–275` 加载和切换园区/楼栋、模型进度；`:278–389` 场景渲染；`:418–444` 携带 floorId/mapId/mapUrl 等跳转，并保存 Vuex `building` 下 gardenId/gardenListData/buildingId。对应状态：`store/building/store.js:1–5`、`mutations.js:6–15`。

接口：`api/map/index.js:3–9` 的园区/楼栋读取；`utils/constant.js:7–16` 的文件地址拼接。全文件清点未发现 `.glb/.gltf/.obj/.fbx/.bin`，模型依赖接口返回的文件资源，不是开箱即用的离线 3D 演示。

平面图链路：`router/index.js:620–649` 将楼层/房间 designer 和 view 分开；`floorConfiguar/index.vue:251–264,640` 调用 `mapFloorOverview`，使用 Konva、房间统计/详情抽屉；`roomConfiguar/index.vue:75–83,206` 调用 `mapElementGetRoonInstrumentInfoList`，显示设备和设备抽屉。`store/centerController/store.js` 的 `cmap` 主要保存抽屉可见性及配置元素列表。

编辑闭环证据：`floorConfiguar/components/Designer.vue:19–28,402,461` 有拖拽/变形；`floorConfiguar/Layout.vue:166–211` 将 mapElementList 提交到 `api/centerController.mapElementConfig`，成功后回预览；房间对应 `roomConfiguar/Layout.vue:217,261`。`/ms/mapSet` 指向 `mapSettings/MapSettings.vue`，负责园区/楼栋/楼层/房间配置，接口来自 `api/mapSet`。

边界：未发现模型射线拾取、模型内部楼层拆解等足够证据，不写成已完成；目前明确的楼层进入方式是按钮。`Building.vue:395–406,451–461` 仅移除场景或置空引用，未见显式 geometry/material/texture/renderer/controls dispose，后续要验证资源释放及模型切换竞态。接口列表为空时访问首项的假设也需覆盖。

### 3.2 数据大屏

真实路由：`/roomDataV/` → `views/datav/RoomDataV.vue`；`/floorDataV` → `views/datav/FloorDataV.vue`，依据 `router/index.js:685–700`。Building.vue:161–175 提供跳转。`/dashboard` 是门户与概览，不应与这两个大屏混称。

组件：两页引入 `plugins/dataV`、`ScaleBox`、`datavSelectTree`、`FloorSelectTree`、`AlarmThingStatistics`。`AlarmThingStatistics.vue:43–51,232,258` 真正使用 V-Charts 柱图、ECharts 渐变并调用告警统计接口；并非仅安装图表依赖。

数据与状态：筛选项、选中房间/楼层、列表、统计和定时器主要在组件本地 data 中；园区树来自 `api/mapSet`，硬件类型来自 `api/labDevice`。`RoomDataV.vue:525–529` 消费 instrumentCount/instrumentList/roomDetail；`FloorDataV.vue:445–466` 消费 roomList/roomData/floorDetail/roomCount/alarmCount。

实际接口与交互：`api/dataV/index.js:6–46` 提供 floor/room screenV1、告警排行和展示房间保存；界面有类型/空间筛选、状态统计、卡片轮播、语音告警。`RoomDataV.vue:476–486` 与 `FloorDataV.vue:411–419` 每 15 秒 HTTP 刷新、每秒更新时间，销毁钩子中有清理；不是 WebSocket 推送。

限制：`FloorDataV.vue:517–522` 的部分语音文案使用固定数量；`components/ScaleBox/index.vue:32–64` 是横纵独立缩放并注册 resize，未见销毁清理，不宜未经验证写成等比适配或已完成性能优化。大屏筛选切换与轮询是否重复注册也需运行验证。

### 3.3 智能监控

没有单一 `/monitor` 页面。实际聚合在设备、房间、硬件列表及详情抽屉：

| 入口 | 组件和状态依据 | 接口依赖及能力 |
| --- | --- | --- |
| `/ld/labdevice` 及同组件资产/设备分组 | `views/labDevice/index.vue:199–208,352–387,1028–1072,1196`；Vuex `lab` 和本地查询条件 | 设备筛选、分页、统计、详情、编辑/绑定/批处理；`api/labDevice`、`api/mapSet`、`api/room` |
| `/rm/room` | `views/room/Room.vue:163–214,395,504` | 房间分页/状态统计与详情；`api/room` |
| 设备/房间详情 | `labDevice/components/LabDeviceDrawer.vue:198–205,383–405,702–740`；`room/components/RoomDrawerNew.vue:79–88,122–139,211–251` | `MonitorSensor`、`MonitorInfo`、`SensorTable`、`AdvancedAlarmSet`；全局 thingDetail/sensorsFlag，局部 sensors/detail |
| 监测曲线/历史 | `components/MonitorInfo/index.vue:88–93,198–280`；`MonitorInfoSeeHistoryData/index.vue` | `api/monitorIndicator` 的状态标签、monitorInfo、historyPage；长时间范围分段请求，并发参数 3、合并排序已有代码 |
| `/sys/a/log` | `router/index.js:538–544`；`alarmLog/index.vue:175–186,291,350`；`AlarmProcessing.vue:127–136` | 分页历史告警、选中批量处理、处理后刷新；`api/alarmLog` 的 summary 与 exceptionHandle/batch |
| `/lhd/device`、`/lhd/gateway` 等 | `router/index.js:31–53` 及后续硬件路由 | 硬件管理与绑定来源，不能用“设备管理”一词混淆资产 instrument 与采集硬件 device |

`store/index.js:19–33,127–132` 注册 `lab/sys/detail/cmap/building`；`store/detail/store.js` 保存详情/绑定弹窗等 UI 状态。`store/labDevice/actions.js`、`store/detail/actions.js` 为空对象，不能描述成 Vuex 已统一托管全部请求，很多调用直接发生在页面中。

WebSocket 搜索覆盖 WebSocket、ws/wss URL、socket.io、SockJS、EventSource；匹配主要来自锁文件的构建依赖，没有发现业务 WebSocket 客户端实现。这里的结论是“本轮未发现”，不是断言后端或原系统从未使用实时推送。

### 3.4 SaaS 后台及流程

`router/index.js:7–16`：`/` → `layout/Layout.vue` → `/pro` 所用的 `SubLayout.vue` → 业务子路由；各子路由使用绝对路径。`Layout.vue:23–36` 获取角色菜单并写入 localStorage 和 Vuex；`Slidebar.vue:57–111` 消费该菜单。静态路由表与菜单接口共同决定展示，未发现当前通过 subRoute 动态注入路由的调用。

登录链路：`login/Login.vue:219–295,314–347` → 验证码/登录/用户信息 → token、sessionId、USERINFO 等本地存储；部分用户信息条件下还调用数据授权逻辑。`permission.js:19–43` 检查 token、加载部门和资产分类并设置角色层级；`utils/request.js:20–22` 请求头实际发送 sessionId；Mock 不能仅伪造 token 而遗漏用户信息、菜单、部门和分类。

| 业务 | 路由及文件依据 | 完成度判断 |
| --- | --- | --- |
| 预约管理 | `/apply/order`；`orderManager/index.vue:139–142` 使用 ReservationSchedulerList / ReservationCancle | 有列表、取消及弹窗交互；名称 order 不等于维修工单，不应误认 |
| 现有维保管理 | `/apply/maintenance`；`maintenance/index.vue:131,328,376–388` | 有列表与完成接口调用，可作为后续工单式演示的参考；派单/验收全状态流未证实 |
| 巡查报告 | `/apply/room/report`；`roomReport/RoomReport.vue:296–315,369–394,440–461`；`api/room/index.js:115–202` | 报告/模板查询、编辑、删除等有调用；待整改复核闭环未证实 |
| 资产审批 | `/apply/asset/process` 与 `/asset/management`；`assetProcess/components/WaitCheckAccept.vue:134,176,214`；`api/activiti/index.js:4–80` | 申请、流程设置、任务/历史接口存在实质调用；完整审批运行与权限正确性未验证 |
| 资产维保新页面 | `/asset/maintenance`；`assetMaintenance/AssetMaintenance.vue:18–20` | 子组件 Maintenance.vue、SpotCheck.vue 为空；UpkeepPlan.vue:61–72 是硬编码数据和空查询/导出方法，应标为未完成 |

前端菜单可见性和 roleId 判断不等于后端权限隔离。无后端源码与运行证据，不宣称完整多租户安全或权限体系已验证。

## 4. 敏感内容与公开展示风险

扫描覆盖源码、配置、README、锁文件、静态文本、素材清单和两份 env；用关键词、URL/IP、凭证赋值、坐标及业务字段模式定位，人工区分注释、库元数据和实际调用。以下只保留定位与类型。

| 分类 | 已核实位置 | 结论 / 处置方向 |
| --- | --- | --- |
| 原品牌与内部仓库信息 | `package.json:2,76,85`、`README.md:1,7–8`、`package-lock.json` 根元数据、`permission.js:12`、`i18n/config/zh.js:1682,1688`、`en.js:1689` | 替换名称、作者/版权文案、仓库元信息；不能只更换首页标题 |
| 品牌素材 | `assets/systemImages/logo2.png`、`company-title.png`、`company-title1.png`；`Dashboard.vue:38–41`、`Building.vue:13`；`public/favicon.ico` | 已确认页面引用品牌图；favicon 及图片具体像素/授权仍需视觉检查 |
| 客户定制及标识 | `router/index.js:668`、`utils/request.js:39–43`、`login/Login.vue:258–263`、`Dashboard.vue:150–154`、`floorConfiguar/index.vue:357–362` | 存在专用登录、租户判断、默认园区及跳转分支；删除客户绑定条件并改为通用演示配置，不能转录真实 ID |
| 客户/公司名称候选 | `components/FloorDrawer/index.vue:9`、`SelectAssetClassTree/index.vue:10`、`mapSettings/MapSettings.vue:169` | 定位到默认文案/名称；需结合显示逻辑逐处替换，不将关键词命中全当真实客户资料 |
| 服务地址 | `.env.development:1`、`.env.prod:1–2`、`vue.config.js:43`、`README.md:45,49,84` | 环境、代理及文档都有服务配置；真实值不输出，后续统一切换演示模式 |
| 接口和文件资源 | `api/` 32 文件；`utils/constant.js:7–16`；`api/upload/index.js:4–18` | 业务接口统一代理之外，还有 img/GLTF 等直接文件请求；相对地址也可能打到同源真实服务 |
| 直连上传 | `components/ChuxouUpload/index.vue:103–111`、`views/room/components/chuxouUpload.vue:76–84`、`views/detect/components/Inspected.vue:46–54` | 上传目标硬编码，且签名字段来自文件策略；不能仅拦截 Axios 就覆盖所有上传 |
| 地图 Key | `transport/components/TransportMap.vue:65–68` | 确认存在非空硬编码地图 Key；有效性、权限未测试；后续移除公开副本中的原值并隔离地图 SDK |
| 坐标 / 轨迹 | `TransportMap.vue:74,87,190–198`；`TransportIndexTable.vue:77–78`、`WaybillInfo.vue:285` | 同时有注释坐标样例和运行时 gps 字段；不能证明坐标均为真实客户轨迹，仍应换为合成数据，不保留原值 |
| 账号 / 密钥字段 | `login/Login.vue:165–170,231,254,319`；`utils/request.js:20–22`；上传组件 ossData | 登录初始用户名/密码为空，token/sessionId 来自流程；OSSAccessKeyId/policy/signature 初始为空。字段存在不是硬编码生产凭证证据；地图 Key 单列确认，其他文本扫描未确认真实账号密码 |
| 写死的业务记录 | `assetMaintenance/components/UpkeepPlan.vue:61–66` | 存在人名、单号、日期和资产记录；真实性未确认，按敏感候选处理并用合成种子替换，不在报告中复述 |
| 注释内遗留信息 | `Building.vue:244`、`api/labDevice/index.js:376–424` | URL/接口说明命中；有注释而非运行请求，公开前也需清理，不能计作额外活动接口 |
| XLS 模板 | `public/static/` 下 28 份 `.xls`；`components/ImportFile/index.vue:71–100` | 被导入组件引用；未解析单元格，不能保证只有表头、没有账号/客户/设备样本 |
| 旧下载工具包 | `public/backupSuite/AutoBackupTool.zip`、`DataExportTool.zip`；`downloadSuite/DownloadSuite.vue:29–39` | ZIP 目录分别有 42/35 项，均包含 exe/dll/config，前者还有 db；未执行或读取数据库。建议移出公开演示产物，并同步处理下载入口 |
| 图像/字体/图标 | `src/assets/`、`public/favicon.ico`、`assets/iconfontSource/`、`public/js/` | 图片、模型纹理、图标、字体与第三方脚本授权/内嵌文字未全面核实；package.json 的 license 字段不能证明全部素材可公开 |
| WebSocket | `package-lock.json` 构建依赖命中；两份大屏定时器见上文 | 未定位到业务 ws/wss 入口，不应虚构原系统推送能力 |
| 生产脚本 | `package.json:5–12`、`vue.config.js`、`README.md`；全文件名搜索 shell/bat/ps1/Docker/nginx/deploy/CI 线索 | 未发现独立生产部署脚本；prod 构建脚本确实存在且未执行。`api/activiti/index.js:28–29` 的 deploy 是业务流程发布，不是服务器部署 |

网络搜索中的第三方库许可 URL、锁文件 registry、Excel XML namespace（如 `assetManagement/components/mixin.js:82–84`）不等于原公司接口；不可对全部 URL 做无差别替换。二进制、压缩包配置、图片内文字及未命中规则的值仍是审查盲区，不宣称已完成彻底脱敏。

## 5. 处置分类清单（本轮仅建议）

| 分类 | 对象 | 文件依据 | 后续处理 |
| --- | --- | --- | --- |
| 保留 | Vue 2 第二版结构和重构背景 | `main.js`、`router/index.js`、`store/index.js`；项目上下文 | 保留 Router 3/Vuex 3/Element UI 的历史语境；以离线化、模块边界和可演示性体现整理价值 |
| 保留 | 楼宇加载、楼层/房间配置与联动 | `Building.vue`、`floorConfiguar/Layout.vue`、`roomConfiguar/Layout.vue`、两份 Designer | 保留交互，替换数据、模型和文件来源，补资源释放/错误场景 |
| 保留 | 双大屏与统计组件 | `datav/RoomDataV.vue`、`FloorDataV.vue`、`AlarmThingStatistics.vue` | 保留筛选、统计、轮播、图表，统一数据源并修正文案常量 |
| 保留 | 监控历史和告警处理 | `MonitorInfo/index.vue`、`alarmLog/index.vue`、`AlarmProcessing.vue` | 用统一实体和时间序列复现已有交互，不写死每页数据 |
| 保留 | API 分层和公共表格/抽屉 | `utils/request.js`、`utils/axios.js`、`api/`、`components/Table/index.vue` | 以现有 API 函数为兼容边界，不整体重写所有页面 |
| 替换 | 网络、认证、角色菜单和文件访问 | env、`vue.config.js`、`Login.vue`、`Layout.vue`、上传组件、`constant.js` | Mock 模式默认关闭外部访问；身份、菜单、上传/下载/模型均走统一演示契约 |
| 替换 | 原品牌、素材与业务样本 | 上节品牌定位；`UpkeepPlan.vue:61–66`、`public/static/` | 通用产品身份、合成记录、自制/许可清晰资源；XLS 检查后重建演示模板 |
| 替换 | 地图 Key 和地图依赖 | `TransportMap.vue:65–78` | 离线演示先以本地轨迹展示替代外部 SDK；真实地图仅在后续另行确定使用方式后考虑 |
| 删除 | 原客户专属硬编码分支、旧服务注释 | `router/index.js:668`、`request.js:39–43`、`Login.vue:258–263`、`Building.vue:244` | 后续从展示版移除专属条件/注释；基础登录和通用流程保留 |
| 删除 | 旧下载工具包及对应入口 | 两份 `public/backupSuite/*.zip`、`DownloadSuite.vue:29–39` | 后续从公开产物移除；这是展示副本的处置建议，不删除外部保存的原件 |
| 待核实 | 旧路由 / 中控实现 / IDE 元文件 | `router/index.last.js`、`router/subRoute.js`、`views/centerControl/Layout.vue`、根 `.iml` | 未发现旧路由引用；先补引用与功能对照，再决定删除，不能按名称认定是主入口 |
| 待核实 | 资产维保新页与完整工单/巡检闭环 | `assetMaintenance/components/`、`maintenance/index.vue`、`roomReport/RoomReport.vue` | 空组件与演示表格不能算完成；明确哪些能力需新增、哪些已有接口可复用 |
| 待核实 | 运行兼容、测试有效性和素材权属 | `package-lock.json`、`public/js/`、`tests/unit/example.spec.js`、`src/assets/` | 受本轮限制未构建、未运行、未确认授权；先恢复可控演示启动再验证 |

## 6. 简历展示优先级与事实边界

1. **优先展示空间可视化链路**：楼宇模型加载、园区/楼栋切换、楼层平面图、设备/房间信息联动，另有拖拽配置保存。源码链路充分，视觉辨识度高；必须补本地模型与合成空间数据，不能说离线版已经可用。
2. **优先展示双大屏与监控告警**：有筛选、统计排行、状态卡片、曲线历史、批量告警处理。适合展示数据到交互的完整过程；轮询应如实表述，性能、规模、告警时延等指标没有测量依据。
3. **展示 SaaS 中的一条完整流程**：选设备/房间管理、巡查报告或已存在的申请/审批交互，复用表格、抽屉、权限菜单和国际化。不要罗列几十个目录作为成果；预约管理不能当维修工单，空资产维保子页不能宣称交付完成。
4. **后置运输地图与全量后台**：有外部 Key、定位和业务数据依赖，首轮展示收益低于前三项；本轮未证明完整运输闭环。

用户身份以 PROJECT_CONTEXT 为准：前端主力、Vue 2 第二版重构组成员；不是独立主导者、架构负责人或团队负责人。源码能证明工程中有这些实现，不能单独证明每行代码由谁完成。本副本没有 Git 历史，具体个人负责范围仍应由用户经历或可信交付记录补充。

建议基础表述：

> 作为前端主力及重构组成员，参与智慧设施运营平台从 Vue 1 第一版到 Vue 2 第二版的重构与核心功能交付，参与楼宇可视化、数据大屏、智能监控及 SaaS 管理功能开发。

后续可在确认个人职责后细化“负责”的具体模块。本次 Mock、脱敏与展示整理应独立列为后续项目整理，不能倒写成当年已经交付的技术成果。小程序尚未审查，不用本轮源码结论证明其完成度。

## 7. 统一 Mock 层设计（未实施）

### 7.1 位置与接入原则

直接在现有 `smart-facility-platform` 内增量改造，不复制第三个工程，不迁移到 Vue 3，不更换整套 UI。建议增加以下逻辑模块；这些路径是设计，不是已存在实现：

```text
src/mock/
  index.js                 演示初始化/模式选择
  adapter.js               Axios adapter，匹配 method + path
  contracts/               字段、枚举、分页与接口形状说明
  fixtures/                唯一合成种子、实体关系、资源索引
  db.js                    内存数据库与版本化持久化/重置
  handlers/                auth、map、monitor、alarm、workflow 等
  services/                业务操作与跨实体统计
  realtime.js              可控时钟、事件订阅与回放
  scenarios.js             正常、空态、离线、故障、告警场景
src/services/media.js       统一图片/模型/上传/下载入口
public/demo/               自制或可公开的模型、纹理、模板
```

保留 `页面 → api/* → utils/axios.js → utils/request.js`。在统一实例注入 Mock adapter，可以同时覆盖封装 get/post 与直接 request 调用，保持 Axios 响应拦截器兼容。先使用当前能力实现，不要求引入新的 Mock 框架。

adapter 收到的 POST 可能已经被 qs 编成表单，也可能是 JSON 字符串；需统一解析 GET query、重复数组参数、JSON、urlencoded、FormData。响应保持 Axios 的 status/data/headers/config 形状，再由现有拦截器返回业务 `{ code, message, items }`；Blob 导出单独兼容，不能套 JSON 外壳。

Mock 模式对未注册接口明确报“未实现”，**禁止透传原服务**；真实请求模式即使未来保留，也不能由请求失败自动回退启用。新增独立演示模式与脚本，后续启动前先解除代理/地图/直接资源请求风险。

### 7.2 身份、契约与关系

第一批必须同时覆盖验证码、登录、用户信息、语言、角色菜单、部门树、资产分类，避免进入守卫后再访问原服务。模拟 sessionId/token/USERINFO 均为新建的演示标识；不能复用浏览器遗留登录数据。存储建议使用独立命名空间，兼容迁移放在统一身份/存储模块。

实体关系建议为：Tenant → Department、Garden → Building → Floor → Room；Instrument 表示被管理资产，Device/Gateway 表示采集硬件，Binding/Sensor 表示绑定与探头；Alarm、MaintenanceOrder、InspectionReport、WorkflowTask 引用这些实体。使用统一合成 ID、时间基准和种子，避免楼层总数、大屏统计、设备列表各自造数。

| 已有入口 | Mock 输出契约 / 注意事项 |
| --- | --- |
| `api/map.getGardenList`、`getBuilding` | `items` 数组；园区 gardenId/gardenName；楼栋 id/name/url/subDivisions。模型 url 必须解析到本地演示资源 |
| `api/centerController` | 楼层 overview、房间图元/设备列表、mapElementConfig 保存；坐标变换与元素关联按页面字段适配 |
| `api/dataV` | 从同一实体库投影出 roomCount/roomData/roomList、instrumentCount/instrumentList 等，不强迫两个现有页面消费全新统一形状 |
| `api/monitorIndicator` | 当前标签、探头、时间范围/间隔、历史曲线及历史告警；保留 objId/type/objSensorId 等既有参数 |
| `api/alarmLog` | summary 分页与 batch 处理写操作；处理后再次查询应持久反映状态变化 |
| 设备/房间/部门/角色 | 普通列表按真实消费字段提供 `items.list/total/pageNum/pageSize` 等；逐端点对照，不能假设所有接口都是同一种分页结构 |
| 上传/导出/二维码 | 本地 File/Blob/object URL 或许可清晰的静态资源；避免响应拦截器把 Blob 当业务 JSON |

现有状态值存在多套约定：`utils/constant.js:41–46,71–75` 与大屏/详情的 senorStatus、monitorStatus 消费不同。内部可用语义枚举，兼容层显式映射，不能把所有“异常”统一成一个数字导致页面统计失真。

### 7.3 最低业务能力

- 分页、关键字、空间/部门/类型/状态、时间范围过滤和稳定排序在 handlers/services 中实现；页码、边界与空集合有确定行为。
- 设备在线、离线、异常及探头时间序列从同一时钟生成；可手动推进、暂停和重放，刷新页面不出现互相矛盾的数据。
- 告警由阈值/场景产生，支持查看、批量处理、处理人/时间/原因记录；处理后更新历史状态。是否改变设备当前异常应由业务规则决定，不能“处理告警即强制设备恢复”。
- 维修工单演示目标：创建 → 分派 → 处理中 → 完成 → 验收/关闭，拒绝非法迁移，保留操作历史。现有维保接口只证明部分步骤，新增状态要标为后续演示能力，不能借预约接口伪装完整工单。
- 巡检演示目标：模板 → 任务/执行记录 → 异常项 → 整改关联 → 复核；先复用 roomReport 已有报告与模板，再补不存在的环节。
- 多页面查询均来自同一数据库；变更后重算大屏统计，提供版本化重置与可选 localStorage 持久化，防止旧种子污染新契约。

### 7.4 可控实时与网络边界

统一 `realtime` 服务负责订阅、取消订阅、暂停、步进、场景注入与清理，底层先用本地事件总线和可控定时器。原大屏可先保留轮询同一数据库，再按小步改造接入订阅；不需要连接外部 WebSocket，也不能在履历中把新增本地推送说成原工程已有技术。

Axios adapter 不覆盖全部网络面。必须同时处理：GLTFLoader 与纹理、`img src`、`BASE_URL`、Element 上传默认 XHR、OSS 策略、地图 loader、二维码/Blob、下载链接和外部脚本。媒体服务统一映射演示资源，上传组件用自定义请求接入本地操作；演示模式不加载高德 SDK，不请求真实定位。后续以浏览器网络记录确认只有本地资源请求。

### 7.5 后续验收与最小切片

先建立“演示启动与身份隔离”小切片：Mock adapter + 合成登录/用户/菜单/部门/分类 + 无外部访问的启动配置。确认刷新、退出、守卫和未知接口行为后，再扩展楼宇/平面图 → 大屏 → 监控告警 → 维保/巡检。

需要新增的有效验证包括：未注册请求不得外发；JSON/form/Blob 兼容；分页筛选与跨页面统计一致；告警批处理再查询；工单非法状态迁移；时间步进与销毁清理；模型/上传/下载离线资源闭环。现有 `tests/unit/example.spec.js` 只挂载 Device 并断言 msg 文本，不能作为这些能力的测试证据。

本轮到此停止。上述目录、接口契约和验收方案均未实现；没有开始批量脱敏、Mock 改造或生产运行。
