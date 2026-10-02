# 下一任务：数据统计 S3——零点小时回显

S2 已完成（无效日期/时段拒绝，禁止静默回退）。先读 STATUS 文末、review-statistics-module.md。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围（仅 S3）

`UseRanHighSearch`：统一小时选项类型；`obj.end || 23` 勿把数字 `0` 变成 `23`；空值判断明确。验证 `00→00` 提交及重新打开回显。勿并行 S4，勿开新模块。

验证：补单测 + `test:demo`；浏览器能跑则跑。STATUS **只在文末追加**；不安装依赖、不 commit/push、不重写 Vue 2。完成后停止，下一提示词再写 S4。
