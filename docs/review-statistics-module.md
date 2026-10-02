# 数据统计复盘（2026-10-01）

基线 HEAD `3cc1969`，开始时工作区干净。本轮只更新文档。

4A–4E 已接入总览、告警、状态饼图、使用统计及使用率排行。统一接口依据：smart-facility-platform/src/mock/handlers/statistic.js；数据依据：src/mock/fixtures/statistic.js。使用统计是合成派生数据，能耗是铭牌功率乘派生时长的估算，不是真实计量。

## 三项 P2 问题

1. ~~清空日期异常~~：**S1 已修**（Statistics 清空恢复日维度；ChartDimension 去掉 close 重复 emit）。
2. ~~无效区间静默回退~~：**S2 已修**（共用校验 + Mock failure + 前端提示；禁止静默回退默认天/全天）。
3. 零点回显：UseRanHighSearch/index.vue:70 的 obj.end || 23 将数字 0 变为 23；handleQ 产生混合字符串/数字选项。应统一类型、明确判断空值，验证 00→00 提交及重新打开。

以上源码路径均在 smart-facility-platform 下。高级查询入口已转换 type/start/end，初步怀疑的字段不匹配不成立。

## 验证与建议

- 本轮独立全量单测：31 套、161 项通过；现有测试未覆盖上述边界。
- 未重新验证浏览器、生产构建、真实后端或全站行为；历史浏览器证据不算本轮结果。
- 建议页面轻量标注“模拟统计”“估算能耗（kWh）”，避免用户误认为实测数据。
- 先按 next-task-prompt 执行 **S3** 零点回显，再处理说明文案（S4）；不同时扩大模块。
