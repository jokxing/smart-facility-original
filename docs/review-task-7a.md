# 6B / 7A 复盘（2026-09-24）

## 结论

6B 已有同源告警历史聚合；7A 已能进入设计器并阻止保存，但 **7A 的只读边界未完成，不建议直接进入 8A**。本轮只读核对源码、重跑单测与执行内存复现实验，没有修改业务代码。

## 需要修正的问题

### P1：设计器的房间仍可编辑

依据：`smart-facility-platform/src/views/floorConfiguar/components/Designer.vue:19` 的 Konva group 使用 `draggable: item.isEdit`。`:200` 设置的 `this.draggable = false` 未被该模板使用，全文也没有其他消费它的代码。房间种子 `src/mock/fixtures/floor.js` 仍为 isEdit: true，setRoomList 通过展开对象保留该属性。

画布仍绑定拖动、transform、双击事件；handleDragEnd 更新 Vuex 的 roomDrawerList，handleTypeClick 无 demo 防护即可打开编辑弹窗，handleSubmit 和 handleDeleteClick 仍能改临时图元。Layout 的保存按钮与保存方法防护是有效的，侧栏拖入也有防护，但不能据此声称整个画布只读。影响是演示过程中仍能修改位置、宽度、字体或移除房间；不能保存到后端不等于不能编辑。

建议下一小任务：在 Designer 层定义明确的 demo 只读条件，禁用图元拖动、Transformer、双击编辑和删除，并保护对应变更方法；不修改共享 isEdit 种子，否则会影响平面详情入口。用真实 Konva 节点/鼠标交互验证前后坐标、宽度、样式与 Vuex 不变，同时保持非 demo 原行为。

### P2：告警日期映射混淆相对时间与自定义日期

依据：`src/mock/fixtures/alarm.js` 的 resolveRange 只根据 endDate 距 Date.now 小于 48 小时决定回映固定锚点，无法区分用户手选日期和快捷日期。parseDemoDate 还优先按本机时区解析无偏移时间，而锚点固定 +08:00。

本轮内存复现：把 Date.now 固定到 2026-10-24，查询 2026-10-17 至 2026-10-24。默认处理返回房间 A=3、房间 B=1；按原始绝对日期查询应为空，设置 remap:false 后确实为空。这说明用户自定义的十月日期可以返回九月事件。

现有 alarm.spec.js 的日期测试传入 remap:false，绕过了 HTTP 默认执行的关键映射分支。建议单独小任务使用统一演示时钟驱动快捷日期，保留绝对日期查询语义，并显式确定时区；补跨日期、跨时区、非法日期与反向区间测试。

### P2：路由调整影响了非 demo

依据：`src/router/index.js:637` 把 FloorDesigner 无条件设为顶层；没有以 demo 模式隔离路由位置。STATUS 明确记录迁移是为了避开 SaaS 壳层的未 Mock 接口，但当前非 demo 也使用这套路由，原壳层、导航与初始化行为存在回归风险。

建议核对并恢复非 demo 的原父子路由，仅 demo 使用顶层设计器；保持路径/name 唯一。没有 Git 仓库，不能从提交历史恢复原路由，需依据现有路由结构和记录确认，不能凭猜测复制。

## 验证证据

- 本轮 `npm run test:demo -- --watch=false`：7 文件 / 30 用例通过。
- 在 Node 内存加载告警 fixture 并固定 Date.now，复现自定义日期被改写，未写测试或源码文件。
- 浏览器脚本当前只检查设计器的 roomDrawerList 和保存按钮 disabled；未验证 Konva 节点实际不可拖动、缩放、编辑或删除，因此原 designerPreview:true 不能覆盖上述问题。
- 本轮未重跑 Edge、未做视觉验收或非 demo 运行验证。历史浏览器通过记录属于上一执行者证据。
- 根目录与平台目录均不是 Git 仓库；未找到适用 AGENTS.md。未安装依赖、调用原服务、执行生产脚本或推 Git。

## 进度与交接建议

保留 6B / 7A 已有的读取与保存阻断成果。下一项应先做 **7A-修复：设计器真正只读及 demo 路由隔离**，完成即停止；再单独修正 6B 日期语义。当前 next-task-prompt 的 8A 素材增强应暂缓，不在本轮自动实施或覆盖该提示词。

本次文档变更：新增本报告，STATUS 末尾追加复盘。素材下载查询与源码审查独立，不下载或接入外部模型。
