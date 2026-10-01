# 下一任务：设备管理 2D——一种仪器导入或新增写路径（择一）

请直接执行本任务，不只写方案。工作区 E:\project\smart-facility-original；仅修改 smart-facility-platform 和 docs。先读 PROJECT_CONTEXT.md、STATUS.md 文末、device-management-2a-contract.md，检查适用 AGENTS.md、Git 状态。保留已有未提交改动，不重复重做 Logo、智能硬件、2A 列表、2B 编辑或 2C 删除。

## 本轮目标
在已开放的仪器列表/编辑/单删之上，打通**一种**创建写路径的持久化闭环（优先：导入模板写入；若导入链路过重则改做「新增一台」最小表单）。只做 2D，完成后停止复盘；不一次实现导出、批量删除或预约维保。

## 已核实的入口与数据线索
- 2A 列表/统计/详情；2B `instrumentMeta`；2C `instrumentDeleted` tombstone；实体仍以 `DEMO_INSTRUMENTS` 970xxx 为源。
- 导入入口：列表「导入」→ 当前 demo 隐藏；相关 API/模板以源码核实为准。
- 新增入口：列表「新增」→ `Modal` type=4；当前 demo 隐藏且 `POST /instrument/add` 拒绝。
- 新建实体必须进入统一读路径（列表/统计/详情/布局或明确「未布局」态），不得第二套同名数据；ID 段勿与 980xxx 硬件冲突。

## 分步执行
1. 核实导入或新增的真实请求链与成功后刷新；更新契约记录持久化键与 ID 策略。
2. 实现最小创建 Mock：会话保护；字段校验；持久化；列表 total/dashboard 同步。
3. 有限恢复对应 UI 入口；另一条创建路径与批量/导出/解绑继续拒绝。
4. 仅修本切片问题。不开放预约维保或全量 CRUD。
5. 补单测与浏览器验收；跑 test:demo 与本轮浏览器脚本。

## 验收
- 真实页面创建一台后列表与统计增加，详情可开；未接入写操作不假成功；外部请求为零。
- 未实际执行的检查标未验证。

## 交付与停止
在 STATUS.md 文末追加复盘；更新契约、demo-guide 与 next-task-prompt。下一步可建议导出或其它首页模块，仅写提示词不自动执行。给出准确 commit 信息后停止，不暂存/提交/推送。
