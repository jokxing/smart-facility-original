# 任务 3A 复盘

日期：2026-09-23。范围：园区/楼栋只读 Mock 与合成空间种子。本轮只复盘、运行已有验证、更新文档，没有实现任务 3B。

## 结论

**任务 3A 在限定范围内通过复盘，可以进入 3B。** 未发现阻止这两个只读接口交付的问题；不代表楼宇页面或真实后端全契约已验证。

根目录、平台目录仍不是 Git 仓库，未发现适用 AGENTS.md。没有提交差异可供归因，结论基于当前源码、上一轮任务边界和重新执行的验证。

## 源码核对

源码路径相对 `smart-facility-platform/`。

| 检查项 | 文件依据 | 结果 |
| --- | --- | --- |
| 单一空间种子 | `src/mock/fixtures/space.js:28–70` | 2 园区、3 栋楼、8 楼层；合成 ID/名称集中定义，没有写进页面 |
| 读取投影 | `src/mock/fixtures/space.js:120–134` | 园区投影 gardenId/gardenName；楼栋按 gardenId 过滤，兼容数字/字符串；复制楼层对象 |
| 接口形状 | `src/api/map/index.js:3–9`、`src/mock/handlers/map.js:5–8`、`src/views/building/Building.vue:183–229` | 保持 GET、现有路径和 Building 消费字段；未知园区成功空数组是演示约定，未验证真实后端此行为 |
| 认证与响应 | `src/mock/response.js:4–13`、`src/mock/handlers/auth.js:4` | 复用 success/failure/protectedRoute；未认证 code 2，没有另建认证链路 |
| 注册范围 | `src/mock/index.js:1–6` | 仅新增两个 map 读取接口；未给 adapter 增加网络回退 |
| 模型边界 | `src/mock/fixtures/space.js:22–25,36,38–40` | url/mapUrl 为空且标为未就绪，没有假模型或原服务 URL |
| 页面边界 | `src/permission.js:18–33` | 仍仅开放登录和首页，没有擅自开放楼宇或大屏 |
| 测试 | `tests/unit/demo/map.spec.js:30–85` | 覆盖认证、明确 ID 结果、过滤、响应一致、空资源与未知接口拒绝 |

## 本轮重新验证

- `npm run test:demo -- --watch=false`：3 文件、12 用例通过，包括原登录与隔离测试。
- 已运行的本地演示首页 HTTP 200，存在 CSP。
- `node scripts/check-demo-browser.cjs`：本地 Edge 真实登录回归通过。错误密码、登录、刷新、退出、再次登录、过期、存储隔离、直接 API 阻断及 CSP 均通过；外部应用请求尝试 0、未捕获异常 0。
- 全副本（排除 node_modules）未发现 GLB/GLTF。没有连接原文件服务。
- 本轮文档修改前后比对平台文件集合和 SHA-256，确认源码/测试/配置未被复盘修改。

浏览器回归验证的是登录切片和楼宇仍被阻止，**没有验证楼宇 UI 调用 map 接口或 WebGL 渲染**。

## 进入 3B 的必处理接缝

这些是旧页面与下一任务的接缝，不应归因成 3A 超出其范围的缺陷。

1. **不要为模型放开文件 API。** `Building.vue:243` 使用 BASE_URL + url，`utils/constant.js:7–16` 生成文件服务前缀，而 `config/demo.js:25–27` 有意拒绝此类直接访问。上一版 3B 提示词“让 BASE_URL+url 解析到本地”容易诱导误改全局前缀或移除阻断；应新增受限模型资源解析入口，demo 只接登记的本地资源，非 demo 保留原语义。
2. **迁移旧测试而不是删除保护。** `map.spec.js:60,76–81` 断言楼栋 url 为空；`check-demo-browser.cjs:106–107` 预期 building 被挡回首页。3B 应改成有效本地模型/楼宇渲染验证，保留楼层未接入和其他页面受限断言。
3. **空数据收尾。** 当前 map handler 合法返回 []；`Building.vue:188–189,223–228` 直接访问首项。开放前处理无园区、无楼栋、缺模型、加载失败，清理旧选择与 loading。
4. **模型加载竞态。** `Building.vue:237–275,392–415` 未区分新旧请求回调。快速切换后只允许当前选择进入场景；页面销毁后回调不能继续访问 scene。
5. **释放而非仅置空。** `Building.vue:373–377,451–461` 缺少明确动画句柄取消和 GPU 资源释放。仅在这个组件内处理 controls/renderer/geometry/material/texture、监听器和定时器；不能声称全工程性能优化完成。
6. **初始化与导航分开。** 当前守卫为首页加载部门/分类/菜单。开放 building 后应检查普通导航不清空 building Vuex 选择，不被当成重新登录。

非阻塞建议：今后增强种子校验时，可补重复 ID/缺字段等失败用例。当前校验函数加载时执行，不等于其全部异常分支已测试。

## 本轮交付

新建本文件，更新 STATUS 并重写 next-task-prompt。下一项只做 **3B：本地自建模型与 /building 最小可用链路**；验收资源来源、实际可见、切换/销毁和隔离边界后停止。本轮没有业务修改、安装依赖、生产执行或 Git 推送。
