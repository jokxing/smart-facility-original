# 下一任务：设备维保 5A——列表只读演示

工作区 E:\project\smart-facility-original。先阅读 PROJECT_CONTEXT、适用 AGENTS、STATUS 文末和 Git 状态。仅改 smart-facility-platform 和 docs，保留 Vue 2、既有接口与统一 Mock。不复制工程、不安装依赖、不连接旧服务、不部署、不 commit/push。用户身份为前端主力及第二版重构组成员。

## 本轮只执行 5A，完成后停止

先核实实际入口与接口契约：router/index.js 的 `/apply/maintenance`、router/subRoute.js 和 menuManager.js 的 `/ld/maintenance` 均关联维保，不凭名字猜应开放哪个路径。读取 views/maintenance/index.vue、相关 Modal/Drawer、api/labDevice/index.js、路由守卫及演示菜单白名单；记录实际可达路径、请求参数和返回字段至 docs/maintenance-5a-contract.md。

接入 `POST /maintenance/list` 只读 Mock，会话保护、分页、关键字、部门、日期筛选；输出 `{code, items: {list, total}}`，字段按源码消费补齐，包括 instrumentId、instrumentName、instrumentNo、userName、tel、createDate、maintenanceDate、completeDate、nextMaintenanceDate、remark、completeFlag。状态枚举以源码为准，不能自创。

引用共享设备 ID/名称与部门，避免创建另一套设备；为已完成、待完成维保生成合成记录。明确共享设备删除后历史记录如何展示，不因删除设备造成列表异常，也不自动修改已交付设备逻辑。关键字、部门、日期变化回第一页，清空日期安全，分页保留筛选；不支持的筛选不假装生效。

只开放必要菜单与路由。详情点击若可复用已演示设备抽屉则沿用 instrumentId，核实维保记录 id 与设备 id；未接入的申请、修改下次日期、完成确认明确不可用，不出现可点击后请求未注册接口的操作，也不实现假成功。

验证：未登录接口拒绝；筛选、分页、清空日期、空结果和设备关联；运行相关单测与 test:demo。浏览器验证入口、筛选、分页、无外部请求、无控制台异常；不能执行须记录。更新 STATUS（只在文末追加）、demo-guide、下一最小任务，给出 commit 信息，不代提交。

## 后续分步计划，本轮不执行

- 5B：从设备详情申请维保，表单校验与记录持久化，列表可查。
- 5C：设置下次维保日期、完成确认及幂等状态约束，形成最小闭环。
- 5D：复盘设备/维保联动与展示文案。是否扩大为工单需另核实真实源码。

数据统计 4A–4E、S1–S4 与复盘残留修复已完成；不再扩展高级统计页。本轮不连做 5B–5D。
