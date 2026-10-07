# 设备、智能硬件与房间管理

SaaS 管理业务档案与关联关系，地图负责展示位置。仪器与智能硬件是不同实体：演示仪器使用 970xxx ID，智能硬件使用 980xxx ID，不能用同一列表替代。

## 开放入口

| 路径 | 功能 |
| --- | --- |
| `/ld/labdevice` | 仪器筛选分页、详情、新增/编辑、删除、解绑、XLSX 导入导出 |
| `/lhd/hardware/home` | 智能硬件统计、列表、详情和监测 |
| `/rm/room` | 房间列表/详情、新增编辑、关联检查、底图及导出 |
| `/ms/mapSet` | 楼层列表、新增/编辑底图和地图配置入口 |
| `/ld/maintenance` | 设备维保列表、申请、下次日期和完成确认 |
| `/sys/department` | 部门与成员管理 |

## 数据一致性与删除约束

仪器列表、详情、房间设备与地图候选使用同一有效实体池；手填新增和导入设备都会参与统计及关联检查。

- 已绑定智能硬件的设备不能直接删除，应先解绑。
- 有设备或硬件的房间不能删除。
- 更改设备房间归属清除旧地图位置，名称和分类变更由读侧动态合并。
- 筛选或分类变化按页面规则回到第一页，详情刷新不累加旧列表。
- 删除档案与移除地图布局语义不同，见 [地图说明](map-and-layout.md)。

## XLSX 导入

先解析文件并展示预览，校验必填项、编号、分类和房间引用，再由用户确认写入。非法或重复记录不能伪装导入成功；导入与手填新增进入同一实体池。导出根据当前有效查询条件生成本地文件。

这种确认流程便于查看错误，演示校验不替代生产服务器的唯一性约束、权限及并发校验。

## 维保与组织管理

设备维保支持列表、从设备详情申请、下次维保日期以及完成确认，不等同于完整审批或工单系统。资产审批、完整 BPM 流转和未开放批量操作不纳入展示。

部门与成员操作保留引用约束。更改角色时需保持角色集合与主角色一致；基本信息编辑不应丢弃已有多角色。部门与设备、房间及硬件的引用关系需要在改名、调整或删除时保持一致。它们属于管理链路补充，不建议作为面试首个展示主题。

## 代码与验证

- [设备页面](../smart-facility-platform/src/views/labDevice/index.vue)、[仪器仓库](../smart-facility-platform/src/mock/fixtures/instrument.js)。
- [硬件仓库](../smart-facility-platform/src/mock/fixtures/equipment.js)、[房间仓库](../smart-facility-platform/src/mock/fixtures/room.js)。
- [导入测试](../smart-facility-platform/tests/unit/demo/instrument-import.spec.js)、[导入 UI 测试](../smart-facility-platform/tests/unit/demo/instrument-import-ui.spec.js)、[解绑测试](../smart-facility-platform/tests/unit/demo/instrument-unbind.spec.js)。

硬件类型有不同详情和曲线，不能把所有硬件伪装成温湿度仪器。本地数据保存、XLSX 操作和底图上传均不连接原业务服务器。
