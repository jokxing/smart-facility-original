# 智能硬件 1B —— 详情 / 曲线 / 告警契约

核对与交付日期：2026-09-30。依据 DeviceDrawerNew / AlerterDrawer / PowerDrawerNew / SignalSourceDrawer 源码；**不**使用 `instrument/detail`。

## 本轮开放范围

| equipmentTypeCode | 抽屉 | 演示 |
| --- | --- | --- |
| `0` 记录仪 | DeviceDrawerNew（`openTwoSystem`） | **已开放**（读写能力见下） |
| `10` 设备管理器 | 同上 | **已开放** |
| `7` 声光报警器 | AlerterDrawer | **已开放只读** |
| `8` 断电报警器 | PowerDrawerNew（`openTwoSystem`） | **已开放只读** |
| `14` 信号接收器 | SignalSourceDrawer | **已开放只读** |
| `13` 移液枪架 | GunRackDrawer | **已开放只读**（枪位列表；写开关拒绝） |
| `16` 资产网关 | AssetGatewayDrawer | **已开放只读**（标签绑定列表；联网配置只读） |

列表点击：`DeviceTable.handleShowDrawer` 演示下仅放行 `0/10 + openTwoSystem`、`7`、`8 + openTwoSystem`、`14`、`13`、`16`。

## 联网配置（只读）

适用：`wifiFlag` 设备（type `10` 设备管理器、`8` 断电、`16` 网关）。入口：详情「联网配置」按钮。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/wifi/echo?deviceId=` | 回显 networkMode / wifiConfig / lanConfig |
| POST | `/device/wifi/input` | **明确拒绝**（不下发） |
| POST | `/device/wifi/inputBatch` | **明确拒绝** |

Demo：表单控件 disabled；无确认按钮；高级设置默认展开。

### GunRackDrawer（13）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情；含 `roomName` / `remark` / `companyName` |
| POST | `/gun/pipette/binding/list` | 枪位列表（980023 预置 4 位） |
| GET | `/history/device/alarm`、`/history/my/alarm` | 空列表桩 |
| GET | `/equipmentUser/list` | 负责人（只读展示） |

Demo 隐藏：声光开关、编辑、返回指令、语音提醒、添加负责人。

### AssetGatewayDrawer（16）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情；含 `roomName` / `companyName` / `propertyNum` / `wifiFlag` |
| POST | `/label/binding/list` | 绑定资产标签（980025 预置 3 条） |
| GET | `/device/wifi/echo` | 联网配置只读回显 |
| GET | `/history/device/alarm`、`/history/my/alarm` | 空列表桩 |

Demo：无编辑入口；联网配置只读不下发。

## 详情加载请求面

### DeviceDrawerNew（0 / 10）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情主体 |
| GET | `/monitorIndicator/getDeviceSingleMonitorFlag?equipmentId=` | MonitorInfo 探头 |
| GET | `/monitorIndicator/getDeviceMonitorFlag?equipmentId=` | vuex `deviceSensorsFlag` |
| GET | `/monitorAlarmRule/isOpenTwoSystem?equipmentId=` | 演示固定 `false` |
| GET | `/equipmentUser/list` | 负责人 |
| GET | `/useStatus/query` | 使用状态日志；空列表（type≠10） |
| POST | `/device/binding` | 绑定事物 |
| GET | `/device/statusPdf` | DrawerNav 出厂 PDF；空串 |
| GET | `/monitorIndicator/monitorInfo` | **type=1** 硬件曲线 |
| POST | `/monitorIndicator/historyAlarmRecord` | 硬件告警历史 |

### AlerterDrawer（7）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情；含 `defenceAlarmStatus` / `powerFailure` / `statusStr` |
| GET | `/alertor/obtain/beepTime?equipmentId=` | 蜂鸣时长（秒），演示固定 `30` |

Demo 隐藏：工具栏写开关、编辑、Common/Multifunction 子模块。

### PowerDrawerNew（8）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情；含 `powerFailure`、`wifiFlag` |
| 同 DeviceDrawerNew | 监测标签 / 绑定 / 负责人 / 曲线 / 告警 | 复用既有 Mock |

Demo 隐藏：声光/平台开关、联网配置、编辑、添加负责人；绑定区只读。

### SignalSourceDrawer（14）

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/device/detail?deviceId=` | 详情；含 `statusStr` / `runStatus`；sensors 带 `deviceId`/`sensorAlias` |
| GET | `/device/signal/bind/list?signId=` | 已绑定硬件列表（980016→980001） |
| GET | `/history/device/chart` | DeviceMonitorMessage 曲线 |

Demo 隐藏：编辑、绑定/解绑、级联打开绑定设备。写：`POST /device/signal/bind|unbind`、`GET /device/signal/bind/devices` **明确拒绝**。

## 写操作

- 写能力仅 `DEMO_EQUIPMENT_WRITE_CODES = [0, 10]`（记录仪/设备管理器）。
- `POST /monitorIndicator/exceptionHandle`；间隔/阈值；部门负责人；房间/仪器绑定。
- `POST /device/update/closeAlarm/*`；信号 bind/unbind：**明确拒绝**。
- type `7/8/14/13/16` 的间隔/部门/负责人/绑定写：**拒绝**（网关无写入口）。

## 与 instrument 的边界

- 房间布局设备详情：`GET /instrument/detail` + `getOpenMonitorFlag` / `getMonitorFlag`（objType=2）。
- 智能硬件：`/device/detail` + `getDevice*MonitorFlag`；曲线 `monitorInfo` type=1 或 `/history/device/chart`。
- 实体 ID：硬件 980xxx；仪器 970xxx。禁止混用。

## 验证

- 单测：含 980023 枪架、980025 网关详情与 label binding list。
- 浏览器：证据 `13-gunrack-detail`、`14-gateway-detail`；未知类型仍拦截。
## 五项收尾后的契约补充（2026-09-30）

- 温湿度类型当前只演示温度通道，名称明确说明，单位 ℃。断电类型映射独立供电状态 code=8、sensorId/type=17，值为 0/1；离线曲线空集。声光/枪架/资产网关无虚构温湿度探头。
- 新增受会话保护的 GET /__demo/equipment/bindable?kind=room|instrument：success.items 为 [{id,name,type,openTwoSystem}]，直接派生共享房间/仪器实体；未知 kind 失败。只用于演示目录，不改变原生产查询接口。
- /device/update/sensors 校验设备真实探头 idx/type、重复 idx、空值/null/非有限数与范围顺序；失败不更新旧规则。
- /instrument/things/add 支持单项或数组；先验证整批、已有/批内重复，全部通过才一次保存；统一失败不残留部分关系。
- 演示菜单只暴露可用硬件总览，独立记录仪管理页仍受限。配置保存与绑定持久化不意味着真实设备下发或跨模块实时联动。
