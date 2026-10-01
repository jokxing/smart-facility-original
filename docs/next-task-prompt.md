# 下一任务：房间管理 3A——列表与只读详情

请直接执行这个小任务。工作区E:\project\smart-facility-original，仅改smart-facility-platform和docs。先读PROJECT_CONTEXT.md、STATUS.md文末、demo-guide.md，检查AGENTS与Git状态，保留未提交改动。设备管理两项收尾已处理，不重复重做。用户是前端主力及Vue2重构组成员，不能写成架构或团队负责人。

## 本轮范围
核实首页房间管理真实入口→房间列表→只读详情，补齐缺失的Mock读路径，形成一个可验收闭环。本轮不做新增/编辑/删除房间，不做预约维保，不重画楼层/房间底图，不整体重写Vue2。

## 已知线索（必须以实际源码核实）
- 路由/rm/room，src/views/room/Room.vue，详情RoomDrawerNew及其下游组件。
- src/api/room.js；页面getRoomList/getRoomDashboard，部门、位置、关联硬件及关键词筛选。
- mock/handlers/floor.js已注册POST /room/list；fixtures/floor.js已有空间目录。mock/handlers/room.js已有/room/detail等局部只读依赖；不能把既有共享接口覆盖成另一套数据。
- mock/fixtures/auth.js已有房间菜单，仍需核实首页卡片与permission守卫是否放行，仅开放本切片。

## 执行顺序
1. 写docs/room-management-3a-contract.md：实际入口、API方法/路径/字段、已有/缺失、分页和统计口径，避免仅按目录判断。
2. 复用现有园区/楼宇/楼层/房间ID和统一Mock实体。实现分页、关键词、有效的部门/位置/硬件筛选；暂不支持的筛选明确隐藏，不假生效。列表、统计、详情保持约定口径，空结果不回退全量。
3. 房间关联设备从当前活跃实体和关系中读取，明确空间归属与是否已上图的区别；不得新增一套页面JSON或忽略已删除/新登记设备。
4. 有限开放页面；未接入写操作隐藏或明确不可用，不假成功。详情允许查看基本信息和已有设备/硬件关系，不新增写功能。
5. 单测覆盖筛选/分页/统计/未知ID/无权限及共享关系一致性；本机浏览器真实点击首页进入、筛选清空、打开关闭详情。不得覆盖组件请求/确认方法来制造成功，记录外部请求为零，未验证标明。

## 限制和交付
不安装依赖，不访问旧服务，不输出env真实值，不跑生产脚本，不暂存/commit/push。只执行3A；维护STATUS、契约、demo-guide，给准确commit信息并停止。3B只写小任务建议，不能顺手把房间模块全部做完。
