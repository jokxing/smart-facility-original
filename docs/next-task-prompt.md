# 下一任务：数据统计 4A——总览与告警统计只读演示

请直接执行这个小任务。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、demo-guide.md，检查适用 AGENTS 和 Git，保留未提交修改。房间三项收尾已通过，不重复重做。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围
接通首页数据统计入口 → 总览数量 → 设备告警分布与告警概况，只做 4A。用现有页面和 ECharts/V-Charts，保留 Vue 2。暂不做电量、利用率、排行榜、导出或系统管理。

## 实际源码线索
- 路由 /ds/statistics；src/views/statistics/Statistics.vue。
- src/api/statistic/index.js：getStatisticOverview、getStatisticEquipmentAlarm、getStatisticAlarmOverview。先核实真实路径、参数和响应字段，不能猜接口结构。
- permission.js、mock/fixtures/auth.js 的 DEMO_MENUS 及首页卡片决定是否可进入。仅开放本次页面，避免放行整组未接入路由。
- 统计来源复用当前活跃仪器、房间、智能硬件、共享告警记录和本地时钟。新增、删除、报警处理状态应按明确口径影响统计，不另造页面 JSON。

## 执行顺序
1. 写 docs/statistics-4a-contract.md：页面实际请求、组件字段、统计范围、状态与时间口径、已有及缺失接口。确认哪些图表使用当前状态、哪些使用历史告警；不能把未实现利用率等写成真实结果。
2. 实现统一 Mock 聚合读接口，受会话保护；先复用共享实体，再聚合，避免使用不可变种子导致新增删除后统计不变。时间范围如需支持，使用项目统一演示时钟。
3. 有限开放总览及告警区域。未接入区域隐藏或明确不可用，避免一进入页面大量拒绝请求。空数据有明确空态，不能回退默认数据或写死“正常”。
4. 单测覆盖聚合口径、已删除/新增设备、告警状态或时间筛选、空结果及会话保护；浏览器真实点击首页进入，验证数量和图表显示、支持的筛选及返回首页。externalAttempts 为零，不覆盖组件请求制造成功。
5. 更新 STATUS、demo-guide、契约；给准确 commit 信息，完成后停止。4B只写下一小任务建议，不自动实现。

不安装依赖，不访问旧服务，不输出 env 真实值，不跑生产脚本，不暂存/commit/push，不升级或重写 Vue 2。未执行的验证必须标明。
