# 下一任务：设备管理——批量删除或新增（择一）

请直接执行本任务，不只写方案。工作区 E:\project\smart-facility-original；仅修改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、device-management-2a-contract.md，检查 Git 状态。保留已有未提交改动，不重复重做 Logo、智能硬件或 2A–2E。

## 本轮目标
在已开放的列表/编辑/单删/导入/导出之上，打通**一种**剩余写路径（优先：批量删除 tombstone，与单删语义一致；若批量过重则改做「新增一台」最小表单）。只做本切片，完成后停止；不一次实现预约维保。

## 已核实的入口与数据线索
- 2A–2E 已开放；批量删除入口仍 `!isDemo` 隐藏，`POST /instrument/batch/delete` 拒绝。
- 新增入口：列表「新增」→ `Modal` type=4；`POST /instrument/add` 拒绝。
- 批量删除须同步列表/统计/布局/bindable，并处理已绑定设备（与单删一致：先解绑或拒绝）。

## 分步执行
1. 核实请求链与成功后刷新；更新契约。
2. 实现最小 Mock：会话保护；校验；持久化；读路径一致。
3. 有限恢复对应 UI；另一条继续拒绝。
4. 补单测与浏览器验收；跑 test:demo 与本轮浏览器脚本。

## 验收
- 真实页面完成批量删除或新增后结果可验证；未接入写操作不假成功；外部请求为零。

## 交付与停止
在 STATUS.md 文末追加复盘；更新契约、demo-guide 与 next-task-prompt。给出准确 commit 信息后停止，不暂存/提交/推送。
