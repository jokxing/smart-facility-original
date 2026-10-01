# 下一任务：房间管理 3B——建议（未执行）

上一刀 3A（列表 + 只读详情）已完成。本文件仅写下一小任务建议，**不要**在本轮顺手把房间模块全部做完。

## 建议范围（择一，保持小刀）
1. **房间详情关联硬件只读**：接通房间侧绑定硬件列表（读共享 `equipmentBindings` / things），仍隐藏解绑与绑定写。
2. **房间导出**：对齐设备 2E，当前筛选结果本地 XLSX；不开放导入。
3. **未监测设备 Tab 可演示**：用「新增仪器未上图」路径验收空间归属 vs 已上图差异（依赖既有 `instrumentCreated`）。

## 执行约束（沿用）
工作区 `E:\project\smart-facility-original`，仅改 `smart-facility-platform` 与 `docs`。先读 `PROJECT_CONTEXT.md`、`STATUS.md` 文末、`demo-guide.md`、`room-management-3a-contract.md`。保留未提交改动；不安装依赖；不 commit/push。用户是前端主力及 Vue2 重构组成员。
