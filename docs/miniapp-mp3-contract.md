# 小程序 MP3 房间列表 / 详情契约

日期：2026-10-05。范围：房间 Tab、详情关联设备、首页房间状态卡、搜索房间。不含预约、告警处理、移液枪、房间增删改。

## 种子与字段映射

来源：Web `fixtures/room.js`、`space.js`、`instrument.js`；小程序 `utils/demo/{seeds,room,instrument}.js`。与 MP2 同一实体池，存储不共享。

| 实体 | ID | 说明 |
| --- | --- | --- |
| 房间 | A=950001、走廊=950002、B=950003 | 均在 910001 / 920001 / 930001 |
| 设备归属 | A 六台、B 六台（含 970008）、走廊无 | 参数状态由设备聚合，不写死 room.alarmCount |
| 走廊 | 无仪器 | **小程序参数状态为正常(1)**，不采用 Web 未监测=3（小程序 MONITORSTATUS 无该档） |

显式适配：

| 字段 | 含义 | 取值 |
| --- | --- | --- |
| 列表筛选 `status` | 房间参数状态 Tab | 10 监控中不过滤；1 正常 / 2 报警 / -100 离线 |
| 列表/详情 `senorStatus` | 房间参数状态 | 有设备则聚合；无设备视为 1 |
| 详情 `instrumentList[].status` | 设备运行 | 1 运行中 |
| 详情 `instrumentList[].bingStatus` / `senorStatus` | 设备参数 | 1/2/-100 |
| 监测 `objType` | 房间 | 3（探头列表为空，不编造走廊温湿度） |
| 搜索项 `type` | 房间卡片 | 3（设备仍为 2） |
| 告警组件 `type` | 房间历史 | 3（本批只读空/既有设备事件，处理在 MP5） |

编号：`DEMO-RM-{id}`。`gradenName` 拼写与页面一致。

## 开放接口

| 方法 | 路径 | 包装 |
| --- | --- | --- |
| GET | `/api/room/mini/statistics` | `{monitoringNum,normalNum,policeNum,leaveNum}`，随园区/楼/层，**不受**参数 Tab 与分页影响 |
| POST | `/api/room/things/list/miniApp` | `{list,total,pageNum,pageSize}`，默认 pageSize=10；无效位置 → 空列表不回退 |
| GET | `/api/room/detail` | 含 `instrumentList`；未知 id → code=0 |
| GET | `/api/monitorIndicator/getOpenMonitorFlag` | `objType=3` → `{list:[],isBind:0,type:3}` |
| GET | `/api/monitorIndicator/monitorInfo` | `type=3` 且房间存在 → `[]` |
| GET | `/api/monitorIndicator/things/newList` | 绑定硬件空列表 |
| GET | `/api/room/things/list` | 空硬件列表 |
| POST | `/api/room/list` | **设备页房间芯片**，与 mini 列表不同包装；仅 `{floorId,pageNum,pageSize}` 且无 garden/building/keyword 键 → 设计器空列表 |
| GET | `/api/map/garden`、POST `/api/room/tree` | 与 MP2 同源空间树 |
| POST | `/api/instrument/search` | 设备 `type=2` **加上** 房间 `type=3` |

成功 `code=1`，失败 `0`，会话无效 `2`。分页：非法页码回落到 1/10，pageSize 上限 50，越界页 `list=[]` 且 total 不变。

## 存储

沿用 `sf-mini-demo:`。首页房间状态卡写入 `roomStatus`，房间页消费后立即删除。本批无独立业务仓库。

## 未开放

房间增删改、巡查报告写入、维护申请、告警处理、硬件绑定/解绑、移液枪。
