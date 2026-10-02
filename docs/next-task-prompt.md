# 下一任务：数据统计 S2——无效日期/小时区间校验

S1 已完成（自定义日期清空恢复默认日维度）。先读 STATUS 文末、review-statistics-module.md。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围（仅 S2）

前端与 Mock 一致校验无效日期区间、无效小时时段：区分「未指定」与「已输入但非法/逆序/缺一端」；非法须拒绝或明确提示，禁止静默回退默认天数/全天。涉及 `statistic.js` windowDays / 小时解析、`UseRanHighSearch` 提交、handlers 可选拒绝。勿并行 S3/S4，勿开新模块。

验证：补单测 + `test:demo`；浏览器能跑则跑。更新 STATUS；不安装依赖、不 commit/push、不重写 Vue 2。完成后停止，下一提示词再写 S3。
