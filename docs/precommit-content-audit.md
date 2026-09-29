# 仓库内容审查清单（2026-09-29）

## 范围与结论

第一轮仅审查，没有脱敏或业务修改。开始时工作区干净，当前提交为 5984e07，上一基线为 f9eaaea；因此没有待提交业务差异，实际检查的是现有已跟踪内容。扫描 812 个跟踪文件；只包含平台和 docs，小程序尚未放入。未找到适用 AGENTS.md。

**结论（第一轮）：演示隔离不等于仓库已脱敏，当时不具备已核验的公开发布条件。** 已确认非空硬编码地图 Key、旧服务地址和品牌/客户定制引用仍在源码；不输出任何原始配置值。没有访问远程、验证凭证有效性、运行生产脚本、修改 Git 历史或推送。

**本批（第一批配置与地址脱敏，工作区）：** 已移除源码中的地图 Key 字面量、硬编码上传目标，并重写平台 README；演示模式不加载外部地图 SDK；未接入上传明确提示不可用。代理目标在基线中已是本机占位，本批仅加注释约束。地图 Key 仍存在于历史提交，**本批只清理工作区，不表示历史已清除或凭证已失效**。P2 品牌元数据、素材、XLS 等未动。

## 按优先级分类

以下路径相对 smart-facility-platform，docs 另行标明。行号为本轮快照；处理状态以源码为准。

| 优先级 / 分类 | 文件依据 | 发现和建议 | 处理状态 |
| --- | --- | --- | --- |
| P1 / 替换 | src/views/transport/components/TransportMap.vue | 地图 SDK 曾含非空字面量 Key。从演示副本移除原值；演示或未配置 Key 时不调用 loader，展示未接入提示。 | **本批已处理（工作区）**：无字面量 Key；`VUE_APP_DEMO` 或空 `VUE_APP_AMAP_KEY` 时不加载外部地图。 |
| P1 / 待核实 | 上述文件在 f9eaaea、5984e07 中均存在 | 仅改最新源码不能清除历史值。需用户确认是否已推送及凭证归属；若仍有效，由有权限者轮换/撤销。历史清理另行计划，本轮不重写历史。 | **仍待核实 / 未改历史**：工作区已无原值；历史提交仍可能含 Key。不声称凭证失效。 |
| P1 / 替换 | README.md；vue.config.js 非演示代理 | 文档及非演示代理曾含或指向旧仓库/服务表述。重写 README 为演示启动、限制和历史背景；代理仅本机占位。 | **本批已处理**：README 已改为演示说明；代理保持 `127.0.0.1` 占位并加注释，禁止指回原内部服务。 |
| P1 / 替换 | src/components/ChuxouUpload/index.vue；src/views/room/components/chuxouUpload.vue；src/views/detect/components/Inspected.vue | 上传存在硬编码外部目标。替换配置并明确未开放能力，不盲删上传组件。 | **本批已处理**：去掉硬编码上传目标；`before-upload` 直接提示不可用并中止，不伪造成功、不回退原服务。 |
| P2 / 替换 | package.json:2,80,89；package-lock.json 根元数据；src/i18n/config/zh.js:1688、en.js:1689；README.md 品牌名 | 品牌/作者/项目元信息仍残留。名称与锁文件根信息需同步。 | **未处理（下一批）** |
| P2 / 替换 | src/views/building/Building.vue:12–13；src/views/dashboard/Dashboard.vue:38–41；src/assets/systemImages/logo2.png、company-title.png、company-title1.png | 页面仍引用旧品牌素材。需自制通用标识及背景。 | **未处理（后续素材批）** |
| P2 / 删除或通用化 | src/router/index.js:673；src/utils/request.js:52–54；src/views/login/Login.vue:274；src/views/dashboard/Dashboard.vue:151–153；src/views/layout/components/Navbar.vue:217–219 | 客户定制路径/分支仍存在。 | **未处理（下一批文本/路由）** |
| P2 / 删除 | src/api/labDevice/index.js:376,383,390,398,407,416,424 | 注释含旧接口地址。 | **未处理（下一批）** |
| P2 / 替换 | src/views/assetMaintenance/components/UpkeepPlan.vue:62–65 | 硬编码业务样例含记录字段。 | **未处理（下一批）** |
| P2 / 待核实后替换 | src/views/transport/components/TransportMap.vue 坐标样例 | 坐标样例存在；建议换合成轨迹。 | **未处理**（本批只断外部地图，未改轨迹样例） |
| P2 / 待核实 | public/static/ 下 28 份 XLS | 全部仍被 Git 跟踪；未解析单元格。 | **未处理（后续模板批）** |
| P2 / 待核实 | src/assets、public/favicon.ico、public/js、src/assets/iconfontSource | 图片/字体等未做完整 OCR 与许可核验。 | **未处理（后续素材批）** |
| 保留并核实署名 | public/demo/models/README.md:19–21；office-building-low-rise.glb | 已有作者、来源和 CC BY 4.0 记录，应保留署名。 | **保留** |
| 保留 | public/demo/floors、public/demo/devices、scripts/write-floor-svg.cjs | 自制平面图/设备 SVG 与动态数据分离。 | **保留** |
| 保留 | src/mock、config/demo.js、scripts/demo.js、测试及 docs/PROJECT_CONTEXT.md | 统一 Mock、演示隔离、验证和角色事实。 | **保留** |

## 环境、忽略规则和脚本

- 已检查三份 env，未打印其内容。仅 .env.demo 被跟踪，三项配置通过演示白名单核验；.env.development 和 .env.prod 被忽略。后两者仍在本地，不能据忽略规则认为它们被删除。
- backupSuite 工具包不在跟踪列表，忽略规则有效；对应旧下载入口仍应在后续清理范围中，不执行包内程序。
- package 脚本仍含非演示启动和构建入口；本批未执行生产构建。
- Mock 文本中未发现字面量 HTTP(S) 外部目标（静态扫描）。本批重跑单测与浏览器回归：外部应用请求 0。
- URL / 品牌关键词命中仍含 P2 残留与合理引用；不等于本批已全部清零。

## 下一轮最小修改建议

1. ~~先移除地图原 Key、旧服务/上传目标和文档原地址~~ → **本批工作区已完成；历史与凭证轮换仍待用户明确。**
2. 再统一项目元数据与文本品牌（package / i18n / 客户定制分支 / 注释地址），验证锁文件一致性。
3. 最后单独处理图像、字体、XLS 及授权，避免同时改源码与全部素材。

本批完成后停止，不自动进入第二批。报告没有证明所有内容已安全，也没有确认远程仓库可见性；不表示 Git 历史中的地图 Key 已清除。
