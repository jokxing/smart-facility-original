# 文档与源码进度复盘（2026-09-24）

## 结论与范围

已对照原有六份 docs 文档及当前关键源码。进度达到 **6A 的最小展示切片**：统一 Mock 基础已接通若干页面，不是仍在等待全部 Mock 写完，也不表示智能监控和 SaaS 已完整可用。应按“一个接口切片 → 页面接入 → 行为验证”继续推进。

本轮只复盘、运行已有单测、记录文档；未修改业务源码、安装依赖、访问原服务、执行生产脚本或推送 Git。根目录与平台目录均不是 Git 仓库，无法通过提交差异归因。未发现适用 AGENTS.md。

## 六份文档如何解读

| 文档 | 角色与当前判断 |
| --- | --- |
| PROJECT_CONTEXT.md | 长期目标与事实约束；分页、告警处理、巡检闭环、可控推送是目标，不能计入当前完成项 |
| source-audit.md | 第一轮历史快照；其“无本地模型”“Mock 未实施”等是当时状态，不能当作当前结论 |
| review-task-3a.md | 3A 的历史验收及 3B 接缝，不代表后续全部功能已验收 |
| STATUS.md | 追加历史已到 6A，但顶部仍写 3B、日期仍是 9 月 23 日，阅读时应以末尾最新记录为准 |
| demo-guide.md | 当前可走通的最小路径说明；不能据此推断筛选、关联列表、写操作均可用 |
| next-task-prompt.md | 尚未执行的 6B 计划；“告警或监控”范围不够唯一，建议先完成下述收口任务再选定具体接口 |

## 实际进度

以下源码路径相对 smart-facility-platform。

| 阶段 | 已有实现 | 完成边界 / 文件依据 |
| --- | --- | --- |
| 演示启动与登录 | 独立启动、Mock adapter、认证及存储隔离 | scripts/demo.js、config/demo.js、src/mock/adapter.js、session.js、storage.js；不等于全仓脱敏完成 |
| 3A / 3B 楼宇 | 合成空间树、本地 GLB、楼宇路由与模型加载 | fixtures/space.js、utils/demoModelUrl.js、views/building/Building.vue、public/demo/models；简单演示模型，不代表原项目真实楼宇素材已可公开 |
| 4A / 4B 平面 | 一层 SVG、三个房间标记 | fixtures/floor.js、utils/demoFloorMapUrl.js、public/demo/floors；仅 floorId 930001 有房间种子 |
| 5A 房间大屏 | 房间卡片、楼层信息、基础统计 | fixtures/dataV.js 的 listFloorScreen；告警图表仍为空依赖 |
| 5B 房间详情 | RoomDrawer 基础详情 | fixtures/room.js、handlers/room.js；关联设备、监控、报告、用户列表为空 |
| 6A 设备大屏 | 设备卡片、基本计数、楼栋/楼层查询入口 | fixtures/dataV.js 的 listRoomScreen、handlers/dataV.js；筛选语义尚不完整 |
| 未完成 | 监测曲线、告警处理、后台业务闭环、设计器演示、完整脱敏 | 当前路由白名单见 src/permission.js；未开放模块不能因原代码存在而算演示已完成 |

## 本轮发现：先修正行为，再扩展模块

1. **展示房间保存是假成功。** handlers/dataV.js 注册 `PUT /map/showRoom/batch` 后直接 success(null)，没有保存选项；fixtures/dataV.js 每次仍返回 screenShowFlag: 1。FloorDataV.vue 的 handleCheckBoxList 会显示操作成功并重新读取。因此当前不能笼统写“没有开放写操作”。下一步应先在 demo 隐藏或禁用此未支持操作并说明原因，非 demo 保持原行为；不要为了只读切片扩大成持久化开发。
2. **房间筛选没有按身份过滤。** fixtures/dataV.js 的 listRoomScreen 根据 roomIds 的数量 slice 列表。不同房间 ID 只要数量相同，就会返回相同设备；设备卡片也未建立明确 roomId 关系。后续应从共享实体映射过滤，不能用截取数组代替业务语义。
3. **非法空间 ID 被替换成默认空间。** findFloorContext/findBuildingContext 查不到 ID 时仍返回默认第一楼层。无参数默认展示与传入错误 ID 应分开处理，防止用户选择错误空间却看到正常数据。
4. **跨页状态尚未统一。** fixtures/floor.js 的三个房间均为正常，room.js 沿用该状态；dataV.js 又按数组索引把第二个房间设成异常。当前同一房间可在详情与大屏显示不同状态；必须由一个种子状态派生，若不同接口枚举不同则显式映射。
5. **测试通过不等于完整点击与视觉验收。** check-demo-browser.cjs 多处直接调用 Vue 实例的 goFloorView、handleMouseDown、handleFloorDataV、handleRoomDataV，并检查组件数据。它能验证链路，但不能证明真实按钮命中、Konva 文本点击、布局和 WebGL 视觉均正确。dataV.spec.js 的部分断言直接调用同一个 fixture 作为预期，未覆盖以上错误 ID、身份筛选和跨页状态问题。

## 验证证据与未验证项

- 本轮实际运行 `npm run test:demo -- --watch=false`：**6 文件、22 用例通过**。仅有 Node 弃用警告，不影响本次退出码。
- STATUS 中 6A 的 Edge 回归“外部请求 0、异常 0”是上一执行者记录；本轮检查了脚本，但**没有重新运行浏览器回归**，不能当作本轮观测。
- 尚未验证：真实鼠标交互与画面、完整筛选、模型延迟加载竞态、长时间轮询与资源释放、所有页面错误/空态、全量素材权属及脱敏、生产构建。
- 已存在隔离演示不代表工程可以直接公开；原审查列出的素材、静态文件与配置处置仍需专门阶段完成。

## 下一步最小任务与决定

**优先只做“5A/6A 只读边界收口”，暂不扩展 6B。** 查清两个大屏现有控件，对未实现的保存/筛选操作在 demo 下明确禁用或提示；移除 showRoom/batch 的空成功 handler，并把原来断言成功的测试改为拒绝。验收：不会出现“操作成功但结果不变”，现有主展示路径不退化，未知接口仍不外发，非 demo 行为保持不变。完成后停止。

再下一项才是共享房间/设备关系、非法 ID 与筛选契约修正；之后再指定一个明确的告警只读接口。不要把这些合成一次性大任务。本轮未修改现有 next-task-prompt，以免把复盘建议误当成已经实施；继续交接前应按此结论替换旧 6B 提示词。

展示价值仍以空间可视化、双大屏、后续一条完整监控链路优先。保留 Vue 2 第二版背景；用户身份仍为前端主力及重构组成员。当前 Mock 整理是后续演示改造，不能写成当年独立主导或原项目已交付的新能力。
