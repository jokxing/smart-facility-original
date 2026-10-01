# 下一任务：数据统计 4C——设备使用统计只读演示

请直接执行这个小任务。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、demo-guide.md、statistics-4a-contract.md、statistics-4b-contract.md，检查适用 AGENTS 和 Git，保留未提交修改。4A/4B 已通过，不重复重做总览、告警与状态饼图。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围
在 `/ds/statistics` 有限开放「设备使用统计」条形图（`getStatisticInstrumentUse` / `GET /statistic/instrument/use`），保留现有 ChartDimension 筛选交互能接多少接多少。保留 Vue 2。暂不做使用率排行、电量、导出。

## 实际源码线索
- Statistics.vue：`showDeferredStats` 仍为 false；4C 只解开使用统计一块，不要打开使用率排行。
- `getStatisticInstrumentUse(equipmentUse)` 参数含 dateType/queryType/beginTime/endTime/type 等；先核实页面拼装与响应 `instrumentUseList` 字段，不能猜。
- 数据须可说明来源：共享仪器实体 + 演示时钟；禁止不可变假排行导致增删后不变却宣称真实。空态明确。

## 执行顺序
1. 写 `docs/statistics-4c-contract.md`：请求参数、响应字段、时间口径、与活跃仪器关系、能力边界。
2. Mock 读接口会话保护；使用率排行仍隐藏且不请求。
3. 单测 + 浏览器验证筛选/空态/会话；externalAttempts 为零。
4. 更新 STATUS、demo-guide、契约；给准确 commit 信息，完成后停止。4D 只写建议。

不安装依赖，不访问旧服务，不输出 env 真实值，不跑生产脚本，不暂存/commit/push，不升级或重写 Vue 2。未执行的验证必须标明。
