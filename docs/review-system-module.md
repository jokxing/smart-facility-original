# 部门与员工管理 6A–6E 复盘（2026-10-02）

## 结论

独立二次复核：6E 历史四项修复成立。本轮另外修复多角色重新打开只回显首项、基本编辑导致 roleId/roleIds 不一致、非法角色值被过滤后部分成功；角色弹窗提交中增加保护。Modal.vue 回显 roleIds，基本编辑未指定角色保留完整集合，显式改变主角色同步为该单角色；非法集合整次拒绝，未改登录认证或权限引擎。

本轮独立全量单测 **44 套 / 225 项通过**，补多角色保持/替换及非法集合拒绝测试；本地 **system:6e 浏览器重试通过，externalAttempts=0**。首次 CDP 连接超时；现有脚本验证部门引用与硬件改名等路径，新增多角色回显没有单独浏览器断言。未生产构建、真实服务或全站验收。

系统管理本批（部门与成员）经 6E 跨模块一致性修复后可收尾。演示范围是 `/sys/department` 员工与部门树读写，不是完整权限/组织引擎。

真实入口：首页「系统管理」卡片（演示态改写至 `/sys/department`）与侧栏「系统 → 部门与成员」。依据 router/index.js、permission.js、Dashboard.vue、mock/fixtures/auth.js。接口依据 api/user、api/department、mock/handlers/auth.js。`/sys/user` 仍是个人资料页，未当员工列表开放。

## 6E 修复（相对独立复核）

- **部门删除**：`removeDemoDepartment` 在员工/子部门规则之外，懒加载检查活跃仪器与硬件引用；转入后拒删、移出后可删；不引入 auth↔设备顶层循环依赖。
- **硬件部门名**：`applyEquipmentMeta` 始终从共享部门池解析当前名，覆盖无 overlay 种子与旧 `patch.departmentName`。
- **基本编辑角色**：未传 `roleId` 保持当前角色；`DEMO_USER` 不可借 `/user/update/basic` 改角色；与 `/user/update/role`、固定 `/user/info` 一致。
- **离职文案**：中英文去掉自动解绑承诺，说明活跃池变化与历史维保姓名保留。

## 6A–6D 交付摘要

- 只读列表 → 员工增改 → 离职/改角色 → 部门树增改删排序。
- 共享员工池 `staffCreated`/`staffMeta`；部门 `departmentCreated`/`departmentMeta`（tombstone）。
- 种子部门 900101/900102 不可删；新建段 900103–900150。

## 保留与边界

- 演示登录 `DEMO_USER` 不可离职/改角色；`/user/info` 固定身份。
- 维保历史申请人姓名与部门快照保留；设备负责人选项仅活跃员工。
- 未实现设备自动解绑；未开放导入导出与角色管理页；未扩大权限引擎。

## 验证

- 全量单测含 6A–6E；浏览器证据 docs/evidence/system-6a～6e。
- 未生产构建、未访问真实服务、未安装依赖、未提交或推送。

## 下一步

本批部门与成员闭环可收尾，按用户本轮要求提供整批 commit 信息；不代提交或推送。下一任务为 7A 全站跨模块验收，剩余必需和可选项见 remaining-work.md，不自动开始。
