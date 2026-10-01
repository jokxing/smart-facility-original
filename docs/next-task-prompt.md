# 下一任务：数据统计 4D——设备使用率排行只读演示

请直接执行这个小任务。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、demo-guide.md、statistics-4a/4b/4c-contract.md，检查适用 AGENTS 和 Git，保留未提交修改。4A–4C 已通过，不重复重做。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围
在 `/ds/statistics` 有限开放「设备使用率统计」表格（`getStatisticInstrumentUseRanKing` / `GET /statistic/instrument/useRanking`），保留 ChartDimension / 高级查询能接多少接多少。保留 Vue 2。暂不做电量、导出、`/ds/device/chart`。

## 实际源码线索
- Statistics.vue：`showDeferredStats` 仍为 false；4D 解开使用率排行区块。
- `handleGetInstrumentUserRanKing` 消费 `res.items` 为表格行（`instrumentName`/`useRate`/`variationRate`/`changed`）；先核实页面字段与参数，不能猜。
- 须与 4C 活跃仪器同源；增删后排行变化；空态明确；禁止不可变假排行。

## 执行顺序
1. 写 `docs/statistics-4d-contract.md`。
2. Mock 读接口会话保护。
3. 单测 + 浏览器验证；externalAttempts 为零。
4. 更新 STATUS、demo-guide、契约；给准确 commit 信息，完成后停止。后续只写建议。

不安装依赖，不访问旧服务，不输出 env 真实值，不跑生产脚本，不暂存/commit/push，不升级或重写 Vue 2。未执行的验证必须标明。
