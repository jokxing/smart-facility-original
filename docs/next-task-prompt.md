# 下一任务：数据统计 4B——设备状态饼图只读演示

请直接执行这个小任务。工作区 E:\project\smart-facility-original；仅改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、demo-guide.md、statistics-4a-contract.md，检查适用 AGENTS 和 Git，保留未提交修改。4A 已通过，不重复重做总览与告警。用户身份按前端主力及 Vue 2 重构组成员表述。

## 本轮范围
在 `/ds/statistics` 有限开放「设备状态统计」饼图（`EquipmentStatePieCharts` / `GET /instrument/instrumentStatistics`），与活跃仪器运行状态口径对齐。保留 Vue 2。暂不做利用率、电量、排行榜、导出。

## 实际源码线索
- Statistics.vue 中 `showDeferredStats` 目前为 false；4B 只解开状态饼图一块，不要整块打开使用统计/使用率。
- `src/views/labDevice/components/EquipmentStateStasticalPie.vue`：`GET /instrument/instrumentStatistics` → `runCount/standbyCount/closeCount/totalCount`。先核实真实字段，不能猜。
- 聚合须复用活跃仪器实体与场景状态；增删后饼图同步变化。空态明确，不回退默认「正常」。

## 执行顺序
1. 扩展 `docs/statistics-4a-contract.md` 或新建 `statistics-4b-contract.md`：饼图请求、字段、与 overview 运行分桶关系、已有及缺失接口。
2. Mock 读接口会话保护；隐藏区仍不请求 use/useRanking/electricity。
3. 单测 + 浏览器从首页进入验证饼图与空/删后变化；externalAttempts 为零。
4. 更新 STATUS、demo-guide、契约；给准确 commit 信息，完成后停止。4C 只写建议。

不安装依赖，不访问旧服务，不输出 env 真实值，不跑生产脚本，不暂存/commit/push，不升级或重写 Vue 2。未执行的验证必须标明。
