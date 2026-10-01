# 下一任务：设备管理 2E——仪器导出或批量删除（择一）

请直接执行本任务，不只写方案。工作区 E:\project\smart-facility-original；仅修改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、device-management-2a-contract.md，检查适用 AGENTS.md、Git 状态。保留已有未提交改动，不重复重做 Logo、智能硬件、2A–2D 或导入预览。

## 本轮目标
在已开放的仪器列表/编辑/单删/XLSX 导入（含预览确认）之上，打通**一种**剩余写路径（优先：导出当前筛选结果；若导出链路过重则改做批量删除 tombstone）。只做 2E，完成后停止复盘；不一次实现新增表单或预约维保。

## 已核实的入口与数据线索
- 2A–2D：`DEMO_INSTRUMENTS` + `instrumentMeta` / `instrumentDeleted` / `instrumentCreated`；导入预览 `POST /instrument/import/preview` + 确认 `POST /instrument/import`。
- 导出入口：列表「导出」→ 当前 demo 隐藏；以源码核实为准。
- 批量删除：多选 → `POST /instrument/batch/delete`；当前拒绝。
- 导出不得产生外部请求；批量删除须与单删 tombstone 语义一致。

## 分步执行
1. 核实导出或批量删除的真实请求链；更新契约。
2. 实现最小 Mock：会话保护；校验；持久化或本地文件生成。
3. 有限恢复对应 UI；另一条与新增/解绑继续拒绝。
4. 补单测与浏览器验收；跑 test:demo 与本轮浏览器脚本。

## 验收
- 真实页面完成导出或批量删除后结果可验证；未接入写操作不假成功；外部请求为零。

## 交付与停止
在 STATUS.md 文末追加复盘；更新契约、demo-guide 与 next-task-prompt。给出准确 commit 信息后停止，不暂存/提交/推送。
