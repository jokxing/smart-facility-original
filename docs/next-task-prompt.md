# 下一任务：数据统计之后——高级统计页或其他模块（可选）

4A–4E 已覆盖 `/ds/statistics` 主路径：总览、告警、状态饼图、使用统计（含时长/次数/功耗）、使用率排行。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。先读 STATUS 文末与 statistics-4*-contract。用户身份按前端主力及 Vue 2 重构组成员表述。

## 可选下一小任务（择一，勿并行）

**方案 A**：有限开放 `/ds/device/chart` 记录仪图表统计（另页），单独放行路由与 Mock，不回改 4A–4E。

**方案 B**：切到其他未演示模块（系统用户/工单等），另写 next-task-prompt。

若选 A：先契约 → Mock 会话保护 → 单测 + 浏览器 → 更新 STATUS/demo-guide；不安装依赖、不 commit/push、不重写 Vue 2。未执行验证须标明。
