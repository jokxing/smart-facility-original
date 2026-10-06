# 小程序首次审查与接手说明

日期：2026-10-04。实际目录：E:\project\smart-facility-original\miniprogram。用户确认是副本，可直接修改。

## 结论与名称

建议产品名“智慧设施助手”，英文 Smart Facility Assistant，与智慧设施平台及 SF 品牌一致。SaaS 面向管理和配置，小程序面向现场查看、告警处理和设备预约，无需将后台所有功能复制到手机。

代码目录可命名 smart-facility-miniapp，与 smart-facility-platform 对齐。本轮只整理文档，保留 miniprogram 实际路径，不移动目录或改变 AppID。展示名称、目录名称、DCloud AppID、微信 AppID 是不同配置，不能通过改名称替换账号归属。

## 技术与运行

已核实 main.js 的 Vue 2 入口、lang/index.js 的 Vue 与 vue-i18n 用法；main.js 虽有 Vue 3 条件分支，不能据此当作已兼容 Vue 3。manifest.json 未显式设置 vueVersion，接手时确认 HBuilderX 项目使用 Vue 2。

项目有 manifest.json、pages.json、uni_modules 和 unpackage，但没有根目录 package.json，属于 HBuilderX 工程形态。uni_modules 内的 package.json 是组件描述，不是根工程启动脚本。

推荐微信预览流程（先完成下面的本地请求隔离）：

1. 安装 HBuilderX App 开发版，或标准版加 uni-app 编译插件；安装微信开发者工具。
2. HBuilderX 导入现有目录 miniprogram，确认 Vue 2 编译设置。
3. 将 manifest.json 的微信 AppID 替换为用户有权限的测试小程序 AppID，不沿用副本中的旧标识。AppID 不等于 AppSecret，不要求提供密钥。
4. 在 HBuilderX 运行设置中填写微信开发者工具路径，微信工具“设置 → 安全”开启服务端口。
5. 运行 → 运行到小程序模拟器 → 微信开发者工具。若自动打开失败，手动导入本次编译生成的 unpackage/dist/dev/mp-weixin。
6. 修改源码，重新编译并检查模拟器日志；生成目录仅用于运行，不作为修改对象或提交源码。

HBuilderX 不是理论上唯一的编译方式，uni-app 也有 CLI。但现有工程没有 CLI 脚手架，为了预览不必先迁移。微信开发者工具不能直接把这套 .vue 源码作为原生微信项目运行。

H5 基础布局预览不需要微信开发者工具，但当前 wx 全局调用未隔离，不能承诺直接运行到浏览器就成功。浏览器也不能替代扫码、蓝牙、微信登录和真机验收。

依据：[DCloud HBuilderX 快速上手](https://uniapp.dcloud.net.cn/quickstart-hx.html)、[DCloud CLI 说明](https://uniapp.dcloud.net.cn/worktile/CLI.html)。工具具体版本兼容性仍需实际编译确认，本轮未安装工具或启动小程序。

## 模块与源码依据

|范围|源码入口|处理建议|
|---|---|---|
|首页与自定义导航|pages/tabBar/Home/Home.vue、components/tabBar/tabBar.vue|保留，优先修启动及真实点击导航；空数据与下拉刷新闭环|
|设备列表与详情|pages/tabBar/Labdevice/index.vue、detailPage/LabdeviceDetail/|保留，第二批接列表、筛选、监测与告警状态|
|房间列表与详情|pages/tabBar/Room/Room.vue、detailPage/RoomDetail/|保留，按同一空间树与设备所属房间关联|
|智能硬件|detailPage/HardwareDetail/|保留类型差异，不能所有硬件都显示同一种温度曲线|
|预约|components/TimeSelect/、detailPage/LabdeviceDetail/common/AppointmentPopup.vue、myPage/MyAppointment/|保留；跟设备预约契约一致，之后单独做闭环|
|告警与待办|homePage/AssetAlarm/、homePage/Backlog/、myPage/MyMission/|保留核心现场链路，后续接处理与回显|
|我的、账号、负责人|myPage/、pages/tabBar/My/|保留；演示登录替换原微信后端授权|
|资产、盘点、移液枪|homePage/AssetTagDetail/、AssetCountReport/、detailPage/PipetteGunDetail/等|源码存在，不等于已能运行；后置|
|运单、打印、蓝牙|pages/tabBar/Transport/、detailPage/TransportDetail/、PrintPreview/、detailPage/components/SearchBluetooh/|后置；未接通入口说明状态，不伪造扫码、打印或硬件成功|
|图表与通用组件|uni_modules/qiun-data-charts、uni_modules/uni-*、components/|保留，先复用现有组件，不整体重写|

## 与 SaaS 的关联

关联来自业务接口和实体字段，不是小程序直接访问 SaaS 网页。

utils/api.js 可见对应接口：

|业务|小程序现有路径|后台参照|
|---|---|---|
|设备详情|GET /api/instrument/detail|src/api/labDevice、src/mock/fixtures/instrument.js|
|设备列表|POST /api/instrument/things/list/miniApp/v2|后台设备实体；需适配列表包装，不直接复用路由|
|监测|GET /api/monitorIndicator/getMonitorFlag、monitorInfo|后台监测字段及 objId/type 语义|
|新增预约|POST /api/instrument/reservation/add|后台 src/mock/fixtures/reservation.js|
|日历预约|POST /api/instrument/reservation/schedulerListV1|同一设备、起止日期与时段规则|
|我的预约|POST /api/instrument/reservation/mini/schedulerList|需加入当前用户范围，不能泄露其他用户预约|
|取消预约|POST /api/instrument/reservation/cancel/{id}|演示适配到取消规则；保留已取消历史|
|园区与空间树|GET /api/map/garden、/api/room/tree|后台空间与房间 fixtures|
|告警|/api/monitorIndicator/miniAppHistoryAlarmRecord、exceptionHandle 等|先核实参数与响应再适配|

后台路径通常不带 /api，部分列表端点和鉴权方式不同。小程序 request.js 使用 token 放入 Authorization；Web 演示使用其专用会话。不得直接复制 Web 会话实现就认定可以互通。

Web Mock 是浏览器内的 axios adapter + localStorage，并非 8088/8098 上的 HTTP 业务后端。将小程序 baseUrl 指向 Web 开发服务器，不会自动得到这些 Mock 数据。

本阶段建议：小程序统一请求入口加入本地 Mock，复用后台业务字段、种子 ID、实体关联和状态规则，但使用 uni storage 适配。两个端各自本地保存，不承诺实时同步。不要直接跨项目 import 依赖 window、Element UI、Web 路由或 axios 的 fixtures。

后续若需要“后台修改 → 手机立即更新”，另立本地共享 API 服务任务，两端访问同一服务；真机另核实局域网地址及微信网络要求。当前任务不新增服务器，不混淆数据一致与存储共享。

种子与状态应以后台当前文件为准：房间 A=950001、走廊=950002、B=950003；设备 970001–970012；970008 是 B 中报警设备。运行状态与参数报警分开，报警设备仍可运行；不要照搬旧全正常页面。预约按当前实际时间验证，历史曲线的固定日期不可用于未来预约判断。

## 已确认的问题与优先级

1. utils/config.js 默认仍指向旧开发/生产服务，且模块加载即调用 wx.getAccountInfoSync；演示模式须先截断请求，不能编译后才关闭网络。
2. lang/index.js 初始化时调用 getLang，也会发请求；仅修改登录页面不能隔离全部请求。
3. App.vue 未登录跳转 /pages/Login/Login，但 pages.json 实际登录页面是 /myPage/Login/Login。启动逻辑在 mounted，需移到适合的 uni-app 生命周期并防止重复跳转。
4. myPage/Login/Login.vue 依赖微信资料授权、wx.login 和旧后端。演示需本地登录，真实微信授权后置。
5. App.vue、config.js、lang/index.js 等直接引用 wx，H5 预览需平台守卫及 uni API 替代；蓝牙/扫码不能只用空函数假装成功。
6. manifest.json 有旧应用标识，pages.json 默认标题含旧品牌；检查 utils/constant.js、静态图片、OSS 上传模块等。仅列文件，不将内部地址、账号或配置值复制到新文档。
7. 请求日志会输出响应对象；演示改造要清理无意义及敏感日志，统一错误、登录失效和 loading 收尾。
8. 运单 Tab 使用房间图标；后续确定保留运单入口时再调整，不优先扩大范围。

## 验证边界与任务顺序

本轮完成静态审查及文档，未修改业务源码、未编译、未完成全量脱敏；不能说小程序已可启动。

- MP1：启动、品牌、请求隔离、本地登录与首页，详见独立提示词。
- MP2：设备列表、详情、监测和告警状态一致。
- MP3：房间列表、详情和设备归属。
- MP4：设备预约、我的预约、修改取消和冲突校验。
- MP5：告警处理、负责人及消息闭环。
- MP6：移液枪与枪架，两端各自本地闭环（已实施，见 pipette-gun-contract.md）。不跨端实时同步。
- 资产、运单、蓝牙打印、真实登录、跨端共享服务后置，每批完成后复盘再安排。
