# 下一任务：设备管理 2C——一种仪器删除的持久化闭环

请直接执行本任务，不只写方案。工作区 E:\project\smart-facility-original；仅修改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、device-management-2a-contract.md，检查适用 AGENTS.md、Git 状态。保留已有未提交改动，不重复重做 Logo、智能硬件、2A 列表或 2B 编辑。

## 本轮目标
在已开放的仪器列表与编辑之上，打通**一种**删除写路径的持久化闭环（优先：单条删除；批量删除可后置）。只做 2C，完成后停止复盘；不一次实现导入导出或预约维保。

## 已核实的入口与数据线索
- 2A 列表/统计/详情；2B `POST /instrument/update/basic` + `instrumentMeta`（名称/部门/分类）。
- 删除入口：列表操作列「删除」→ `getInstrumentUnbind`（有 labelId 时）+ `POST /instrument/remove/:id`；批量 → `POST /instrument/batch/delete`。
- 当前 demo 隐藏删除按钮，handler 明确拒绝。删除必须写回统一源（或 tombstone overlay），使列表/统计/详情/布局/bindable 一致；不得留下孤儿布局点。
- 以实际源码确认确认框文案、成功刷新与错误提示。

## 分步执行
1. 核实单条删除请求链与成功后刷新；更新契约记录删除持久化键与对布局的影响。
2. 实现最小删除 Mock：会话保护；校验 id；持久化；列表 total/dashboard 同步；详情对已删 id 失败；布局不再展示该设备（或明确拒绝含已删设备的布局保存）。
3. 有限恢复列表删除入口；批量删除可同开若共用逻辑，否则继续拒绝。其它写操作保持拒绝。
4. 仅修本切片问题。不开放导入导出/新增/预约维保。
5. 补单测与浏览器验收；跑 test:demo 与本轮浏览器脚本。

## 验收
- 真实页面删除一台后列表与统计减少，详情不可再开，布局/bindable 无该 id；未删仪器不受影响。
- 未接入写操作不假成功；外部请求为零。
- 未实际执行的检查标未验证。

## 交付与停止
在 STATUS.md 文末追加复盘；更新契约、demo-guide 与 next-task-prompt。下一步可建议导入或其它首页模块，仅写提示词不自动执行。给出准确 commit 信息后停止，不暂存/提交/推送。
