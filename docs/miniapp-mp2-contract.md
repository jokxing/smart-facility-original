# 小程序 MP2 设备列表 / 详情 / 监测契约

日期：2026-10-05。范围：设备 Tab、详情、监测曲线、首页搜索。不含房间业务闭环、预约、告警处理、移液枪。

## 种子与字段映射

来源：Web `fixtures/instrument.js`、`scenario.js`、`space.js`；小程序 `utils/demo/seeds.js` + `utils/demo/instrument.js`。两端 ID/名称一致，存储不共享。

| 实体 | ID | 说明 |
| --- | --- | --- |
| 设备 | 970001–970012 | 运行均为 1；仅 970008 参数报警 |
| 房间 | A=950001、走廊=950002、B=950003 | 970008 在 B |
| 部门 | 900101 运维、900102 研发 | 970007–970009 属研发 |
| 分类 | types=1 演示设备 | types=2 筛选为空 |
| 园区/楼/层 | 910001 / 920001 / 930001 | 三间房均在 1F |

显式适配（禁止混用同名数字）：

| 字段 | 含义 | 取值 |
| --- | --- | --- |
| 列表/详情 `status` | 运行状态 LABSTATUS | 1 运行 |
| 列表 `senorStatus`、详情 `bingStatus` | 参数状态 MONITORSTATUS | 1 正常 / 2 报警 / -100 离线 |
| 列表筛选 `status` | 参数状态 Tab | 10 监控中（不过滤）、1/2/-100 |
| `instrumentStatus` | 运行筛选 | 1 运行、0 待机/关机 |
| 监测 `objType` / 图表 `type` | 绑设备 | 2 |
| 搜索项 `type` | 设备卡片 | 2（不含移液枪/硬件） |

编号：`DEMO-EQ-{id}`。演示时钟：`2026-10-05 12:00:00`（CST）。

## 开放接口

| 方法 | 路径 | 包装 |
| --- | --- | --- |
| GET | `/api/instrument/mini/statistics` | `{monitorCount,normalCount,alarmCount,offLineCount}`，随关键字/部门/分类/房间/运行筛选，**不受**参数 Tab 影响，不随分页变少 |
| POST | `/api/instrument/things/list/miniApp/v2` | `{list,total,pageNum,pageSize}`，默认 pageSize=10 |
| GET | `/api/instrument/detail` | 单行详情；未知 id → code=0 |
| GET | `/api/instrumentNewInfoExpand/details` | 资产只读字段，空项显示暂无 |
| POST | `/api/instrument/search` | 数组；MP2 为设备 `type=2`。MP3 起可附带房间 `type=3` |
| GET | `/api/monitorIndicator/getOpenMonitorFlag` | `{list,isBind:0}` 温度+湿度 |
| GET | `/api/monitorIndicator/getMonitorFlag` | 探头数组，含 `objSensorId` |
| GET | `/api/monitorIndicator/monitorInfo` | `{createDate,data}[]`，1h/6h/24h 采样 |
| GET | `/api/monitorIndicator/things/newList` | 绑定硬件空列表 |
| GET | `/api/department/list` | `{list}` |
| POST | `/api/room/list` | 房间芯片 |
| GET | `/api/map/garden` | 园区树 |
| POST | `/api/room/tree` | 园区→楼→层→房间 |
| GET | `/api/instrumentCategoryInfo/superior/cat` | 分类 |
| GET | `/api/equipment/bindEquipmentType` | 硬件类型；当前无绑定，筛选为空 |
| POST | `/api/monitorIndicator/miniAppHistoryAlarmRecord` | 只读：970008 一条未处理；处理入口关闭 |

成功 `code=1`，失败 `0`，会话无效 `2`。

## 监测读数

| 探头 | 正常 | 970008 报警 | 阈值 |
| --- | --- | --- | --- |
| 演示温度 | 5.2℃ | 45.2℃ | 0–40 |
| 演示湿度 | 55.0% | 85.0% | 30–70 |

曲线按探头分别生成，日期基准为演示时钟，不冒充实时采集。无绑定硬件：空态，不扩展解绑。

## 存储

沿用 `sf-mini-demo:`。新增会话键 `operatorName`（详情写入）。退出清会话/页面临时状态（含 `labStatus`）。本批无独立业务仓库。首页状态卡写入 `labStatus`，设备页消费后立即删除。

## 未开放（明确提示，不假成功）

预约、维保/资产流程申请、告警处理、移液枪、扫码、解绑硬件。
