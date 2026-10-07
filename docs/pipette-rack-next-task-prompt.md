# 交给另 AI：SaaS 枪架管理核心 Mock

在 E:\project\smart-facility-original 工作，实际实现并验证，不只给方案。项目用于求职演示。先读适用 AGENTS.md、git status、docs/PROJECT_CONTEXT.md、docs/pipette-gun-contract.md、docs/review-pipette-gun.md、docs/transport-demo-code-review.md。保留已有改动，不 commit/push、不安装依赖、不访问原服务、不清空业务存储。

## 当前问题及范围

SaaS /lhd/pipetteGun/pipetteGunRack 的“移液枪管理”Tab 实际为枪架管理，存在未接入接口、默认统计占位及失败后持续 loading。侧栏选中已在 Slidebar.vue 修复，两个 Tab 映射到实际菜单入口，保留该修复。

只完善：枪架列表、搜索、分页、在线/离线统计 → 详情 → 槽位、绑定枪和空位 → 模拟取枪/归还 → 相关页面及数量同步刷新。不扩展批量导入、语音、真实硬件配置，不重建框架。主要改 smart-facility-platform、测试及 docs；小程序作为参照，不覆盖已通过的导航和返回刷新逻辑。

## 先梳理真实请求

阅读 src/views/pipetteGun/index.vue、src/views/pipetteGunRack/index.vue 及 components/{GunRackDrawer,UpdateGunRack,VoiceReminderSet,BatchSetPerson,HistoryAlarmRecord}.vue；核实实际引用的设备/枪 API 方法、路径、字段和页面响应消费，不只看已有单测。

检查 src/mock/{fixtures,handlers}/{gun,equipment}.js、src/mock/index.js、src/mock/fixtures/auth.js、src/permission.js。参照 miniprogram/utils/demo/gun.js 和 MP6/枪导航检查。

沿用枪架980023/980024、枪991001–991004。枪状态0使用中/不在架、1在架、2超时。枪架在线/离线与既有种子一致；空槽位不算一支枪。不要新建与枪列表脱节的枪架数据池。

## 实施要求

1. 枪架接口消费统一仓库。复用设备接口时明确 type=13 分支，不影响其他设备。未知ID/非法请求明确失败，不回落真实HTTP。
2. 统计与列表同源，去掉26等默认数。支持关键词、状态筛选和分页，筛选后复位页码。
3. 详情显示合成名称/编号、部门、房间、负责人、在线状态与槽位。区分绑定枪在架、使用中、超时和未绑定空位；位置、取归还时间与枪详情一致。
4. 复用取枪请求→模拟确认逻辑，成功更新槽位、枪列表、统计和使用记录。成功只跳一次，轮询和延时在成功/卸载清理。
5. 归还校验未知枪、重复归还、离线枪架、占用槽位及时间顺序。成功写归还时间，实时超时列表移除，历史使用/超时记录按既有契约保留。
6. 本地存储沿用命名空间，退出只清会话；双端规则一致、存储独立，不声称实时联动。
7. 成功、失败、卸载都结束 loading。可达按钮必须有明确结果。未实现的编辑、删除、导出、导入、语音、报警规则配置等隐藏或禁用并说明；不暴露敏感模板或远程下载，不扩大本批写操作。
8. 两个 Tab 均保持侧栏“移液枪”选中。处理前进/后退的 Tab 同步，避免 mounted 无条件重复 push 当前路由。可将枪架 Tab 文案改为“枪架管理”，中英文一致。
9. 数据与素材脱敏，不复制旧人员、域名、账号或工具标识到日志/文档，不修改生成文件冒充源码修复。

## 验证和交付

回归覆盖实际页面接口、列表筛选分页、统计同源、空槽不计枪、在线/离线、取还后槽位/枪列表/数量一致、非法操作失败且不修改、历史保留及会话隔离。保留 pipette-sidebar.spec.js，运行适用枪测试及 npm run test:demo，修复失败，不删断言掩盖问题。

使用现有本地 demo 和浏览器工具验证两个 Tab、侧栏选中、枪架详情、取枪、归还、返回和刷新；保存合成页面截图。区分物理点击与组件方法驱动，单测/编译不等于页面验收。工具失败如实写未完成。小程序未改时无须重跑微信验收。

交付 docs/pipette-rack-demo-review.md：改动文件、接口契约、运行方式、验证结果及未开放功能。核心流程完成后停止，不扩展其他管理模块、不夸大简历贡献，不加入边做边讲解 Skill。
