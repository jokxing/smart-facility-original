# 当前状态：中控地图 M5 已完成，后续任务待安排

M1–M5 已完成。设备档案与房间布局联动契约见 `docs/map-m5-contract.md`。本轮停止，其他后置任务待用户安排。

工作区 E:\project\smart-facility-original。复盘时先读 PROJECT_CONTEXT、适用 AGENTS、STATUS 文末、docs/map-m3-contract.md、map-m1-m3-handoff.md。仅改 smart-facility-platform 和 docs；不安装依赖、不部署、不 commit/push，除非用户另行要求。

## M3 已交付要点

- 契约 `docs/map-m3-contract.md`（含 M4 交接：未布局列表、已布局结构、坐标系、保存边界）。
- Building / overview / designer 读侧与 M2 实体同步；候选 = 未布局；labList 不含 sentinel。
- 验证：`test:demo` + `test:demo:map:m3`；证据 `docs/evidence/map-m3`。

## 原 AI 下一步

M1–M3 独立复盘见 `docs/review-map-m1-m3.md`；M4 见 `docs/map-m4-contract.md`；M5 见 `docs/map-m5-contract.md`。全量 50 套、255 项单测通过。M5 已实现候选设备放置/移除、部分/空布局保存、改名、换房间及删除联动。验证进度以 STATUS 文末为准；不自动开始后续任务。
