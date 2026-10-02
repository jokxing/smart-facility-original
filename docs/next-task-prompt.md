# 下一任务：部门与员工管理 6A——只读演示

工作区 E:\project\smart-facility-original。先阅读 PROJECT_CONTEXT、适用 AGENTS、STATUS 文末和 Git 状态。仅改 smart-facility-platform 和 docs，保留 Vue 2、既有接口与统一 Mock。不复制工程、不安装依赖、不连接旧服务、不部署、不 commit/push。用户身份为前端主力及第二版重构组成员。

## 本轮只执行 6A，完成后停止

维保 5A–5D 已收尾。本轮切到 `/sys/department`，源码是 views/system/Department.vue；`/sys/user` 是个人资料页，不要误当员工列表。先核实 router/index.js、permission.js、菜单和 api/user/index.js，读取 Department.vue 相关抽屉、部门树和员工字段消费，形成 docs/system-6a-contract.md。

复用现有 DEMO_STAFF、部门树和负责人选项来源，不创建另一套用户/部门 ID。接入必要的只读接口（页面使用 GET /user/list），会话保护，返回 items.list/total；按实际源码实现 departmentId、keyword、分页。保证部门切换/搜索回第一页，分页保留条件，空结果及公司根节点行为正确。检查现有同名 Mock 路由，避免重复注册或破坏设备负责人/维保申请人等已交付页面。

只开放必要菜单和路由；新增、编辑、离职、角色变更、导出及部门树写操作本轮不接入，按钮明确不可用，不产生未注册请求或假成功。不扩大到权限引擎，不修改演示登录身份。需要详情时仅展示已经接入的字段；未实现字段诚实显示空态。

验证未登录拒绝、部门/关键字/分页组合、空结果和共享用户一致性；运行相关单测和 test:demo。浏览器验证入口与筛选，检查异常及外部请求。更新 STATUS（仅文末追加）、demo-guide、下一任务，给 commit 信息。不能执行的验证明确记录。

## 说明

后续分开：6B 新增/编辑员工与校验；6C 离职及角色调整的业务约束；6D 部门操作与跨模块联动复盘。仅为计划，不本轮连做；真实角色/部门关系先核实源码，不按目录推断。
