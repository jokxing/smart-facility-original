# 数据统计复盘（2026-10-01）

## 2026-10-02 复核结论

下面三项历史 P2 已由 S1–S4 修复：清空恢复日维度、非法区间拒绝、零点回显保持；模拟统计及估算能耗说明也已接入。不能再将历史发现当作当前未修问题。

本轮补修两类校验残留：日期校验禁止 Date.parse 宽松回退（例如省略秒的不存在日期被归一化）；小时必须为整数 0–23，拒绝小数、布尔值、数组及非十进制字符串。高级弹窗先校验原始值，再格式化，防止非法输入被替换为默认值后提交。

修改：src/utils/statisticRangeValidate.js、src/components/UseRanHighSearch/index.vue、tests/unit/demo/statistics-s2.spec.js、statistics-s3.spec.js（均在 platform）。独立全量单测 35 套 / 178 项通过，包括闰日、非法日期、小数小时和弹窗拒绝提交；未重跑浏览器或生产构建。统计当前范围可以收尾，下一任务为维保 5A，只读列表。

基线 HEAD `3cc1969`，开始时工作区干净。本轮只更新文档。

4A–4E 已接入总览、告警、状态饼图、使用统计及使用率排行。统一接口依据：smart-facility-platform/src/mock/handlers/statistic.js；数据依据：src/mock/fixtures/statistic.js。使用统计是合成派生数据，能耗是铭牌功率乘派生时长的估算，不是真实计量。

## 三项 P2 问题

1. ~~清空日期异常~~：**S1 已修**（Statistics 清空恢复日维度；ChartDimension 去掉 close 重复 emit）。
2. ~~无效区间静默回退~~：**S2 已修**（共用校验 + Mock failure + 前端提示；禁止静默回退默认天/全天）。
3. ~~零点回显~~：**S3 已修**（`formatStatisticHourOption`；选项统一字符串；`0`/`"00"` 不再变 `23`）。

以上源码路径均在 smart-facility-platform 下。高级查询入口已转换 type/start/end，初步怀疑的字段不匹配不成立。

## 验证与建议

- 本轮独立全量单测：31 套、161 项通过；现有测试未覆盖上述边界。
- 未重新验证浏览器、生产构建、真实后端或全站行为；历史浏览器证据不算本轮结果。
- 建议页面轻量标注“模拟统计”“估算能耗（kWh）” → **S4 已做**。
- 统计收尾 S1–S4 完成；再按 next-task-prompt 选新模块，不同时扩大范围。
