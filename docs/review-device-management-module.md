# 设备管理模块复盘（2026-10-01）

## 结论与范围

检查2A–2H当前源码、Mock、页面及现有测试；22套126项单测通过。核心登记、查询、导入预览确认、导出、单删/批删、绑定解绑已接通。不能将目录中的预约、维保和全部字段表单都算作已完成。未运行全站回归或生产构建。

## 本轮修复

列表接口已有boundHardware，但没有对应列，删除一直可点；详情解绑会emit instrument-updated刷新列表。修复src/views/labDevice/index.vue：演示模式新增智能硬件绑定列，已绑定→查看/解绑+禁用删除，未绑定→可删除；批量删除包含绑定行时先明确提示。src/views/labDevice/components/LabDeviceDrawer.vue未绑定状态改为明确文案。参数状态与绑定状态分开；服务端单删和批删守卫仍保留。

## 各链路核实

| 链路 | 实际范围与依据 |
| --- | --- |
| 列表/筛选/详情 | labDevice/index.vue；fixtures/instrument.js listInstruments/buildInstrumentRow/getDemoInstrumentDetail，共享实体与状态场景 |
| 新增 | labDevice/modal.vue→/instrument/add→addDemoInstrument；仅名称、部门、分类、房间持久化，与导入共用ID池 |
| 编辑 | updateInstrumentBasic：名称、部门、分类；不等于全部详情字段可编辑 |
| 导入 | ImportFile/index.vue；instrumentWorkbook.js；previewDemoInstruments/buildInstrumentImportPlan/importDemoInstruments，预览不写入，确认重新校验 |
| 导出 | handleExport→/instrument/export→exportDemoInstruments，按当前筛选导出完整集合，不受分页限制 |
| 删除 | removeInstrument/batchRemoveInstruments：绑定守卫与tombstone；剪布局，已删除不再进入活跃目录 |
| 解绑 | equipment.js unbindInstrumentHardware：清除该设备全部type=4关系，详情通知列表刷新；不自动删除 |
| 空间布局 | 新增/导入标记imported，不自动上图；不可声称新增后布局链路已完整 |

## 尚需收尾的两处问题（静态源码发现）

1. P2 新增表单范围不一致：labDevice/modal.vue仍允许输入编号、工作时长等字段；addDemoInstrument只保存四字段，buildInstrumentRow又给编号、时长等生成或固定值。用户可能提交成功后发现输入丢失。建议演示表单只开放已支持字段，自动编号只读说明，其余隐藏或明确不可编辑，不扩展全部业务。
2. P2 同房间重名规则不一致：addDemoInstrument和buildInstrumentImportPlan做查重，updateInstrumentBasic没有排除自身后的同房间查重。建议复用校验逻辑并补改名冲突测试。

## 验证边界

2H浏览器脚本本轮新增DOM列文案及按钮禁用断言，移除确认框替换与解绑后的手动列表刷新。绑定初始数据仍由本地演示存储设置，未覆盖硬件页面点选绑定的完整跨模块路径。最终浏览器结果及截图见STATUS最新记录。未提交推送。


## 两项收尾实现（2026-10-01）
演示modal隐藏未持久化字段、编号只读且免必填，编辑时房间只读；非演示保留旧表单。updateInstrumentBasic增加同房间重名校验并排除自身。新增冲突/原名/跨房间同名单测，最终验收见STATUS。下一任务已切换房间管理3A。
