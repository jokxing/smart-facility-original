# 当前状态：中控地图混合状态与大屏三项收尾完成，后续任务待安排

2026-10-04 大屏收尾：设备状态请求字段修正为 status（保留 Mock type 兼容）；运行状态独立于参数告警，默认告警设备仍运行。两屏未接入的部门/关联硬件筛选仅在演示隐藏；房间告警类型、设备运行筛选已实现。52 套、259 项单测与两屏浏览器验收通过，外部请求 0。契约见 `docs/datav-review-contract.md`；其余任务待用户安排。

M1–M5 已完成。本轮 M6 仅完成用户指定的混合状态：默认 A 正常，B 的 970008 告警，其余正常，移除场景按钮、保留筛选。列表、详情、地图和大屏使用同一状态与超阈值读数。旧场景 API 仅为兼容回归保留，页面无入口；新测试 `map-m6-status.spec.js` 与 `check-demo-map-m6-status.cjs`。51 套、257 项单测通过。其余后置任务待用户安排，设备档案与布局契约见 `docs/map-m5-contract.md`。

工作区 E:\project\smart-facility-original。复盘时先读 PROJECT_CONTEXT、适用 AGENTS、STATUS 文末、docs/map-m3-contract.md、map-m1-m3-handoff.md。仅改 smart-facility-platform 和 docs；不安装依赖、不部署、不 commit/push，除非用户另行要求。

## M3 已交付要点

- 契约 `docs/map-m3-contract.md`（含 M4 交接：未布局列表、已布局结构、坐标系、保存边界）。
- Building / overview / designer 读侧与 M2 实体同步；候选 = 未布局；labList 不含 sentinel。
- 验证：`test:demo` + `test:demo:map:m3`；证据 `docs/evidence/map-m3`。

## 原 AI 下一步

M1–M3 独立复盘见 `docs/review-map-m1-m3.md`；M4 见 `docs/map-m4-contract.md`；M5 见 `docs/map-m5-contract.md`。全量 50 套、255 项单测通过。M5 已实现候选设备放置/移除、部分/空布局保存、改名、换房间及删除联动。验证进度以 STATUS 文末为准；不自动开始后续任务。
