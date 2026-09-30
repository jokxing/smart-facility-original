# 本地演示：含房间设备布局配置（8C）

当前演示链路：一层实验室平面 + 房间设备布局 + 设备只读详情/历史曲线 + 报警记录处理 + 共享场景 + 双大屏 + 告警排行 + 楼层设计器只读 + **智能硬件总览列表（1A）** + **记录仪/设备管理器详情（1B）** + **声光/断电/信号/枪架/网关只读详情**。开放：`/login`、`/dashboard`、`/building`、`/floor/view`、`/floor/designer`、`/room/view`、`/room/designer`、`/floorDataV`、`/roomDataV`、`/sys/a/log`、`/lhd/hardware/home`。

首页「智能硬件」进入总览列表：关键词/部门/类型筛选、分页、排序。点**记录仪或设备管理器**打开详情（曲线、告警、间隔阈值、负责人、绑定）；点**声光 / 断电 / 信号 / 枪架 / 网关**打开对应只读详情。设备管理器/断电/网关可打开**联网配置**只读弹窗。未知类型仍提示未接入。

## 启动

```powershell
npm run demo
```

端口以终端为准（常见 8088 / 8091）。账号：`demo` / `Demo1234` / `2468`。

## 路径

登录 → 楼宇 → 1F → **查看设备布局** → 悬停看读数 / **点击设备**打开只读详情与曲线 → **进入配置**拖动保存。  
顶栏 **系统 → 报警记录**：查看设备告警列表，单条「添加处理」后刷新为已处理。  
楼层/房间可用 **场景·正常/异常/离线**；切换不改坐标。  
楼层「进入配置」仍只读；不支持从侧栏新增/删除设备。

## Mock 要点

| 项 | 说明 |
| --- | --- |
| 平面 / 标记 | `GET /map/floor/overview`（实验室房间状态跟场景） |
| 房间设备布局读 | `POST /map/element/getRoonInstrumentInfoList?roomId=` |
| 房间设备布局写 | `POST /map/element/config`（仅 type:4；演示会话 + 校验） |
| 布局重置 | `POST /demo/room-layout/reset` |
| 演示场景 | `GET/POST /demo/scenario` |
| 设备只读详情 | `GET /instrument/detail`；监测标签 `getOpenMonitorFlag` / `getMonitorFlag` |
| 设备历史曲线 | `GET /monitorIndicator/monitorInfo`（离线为空）；`historyPage` 空表桩 |
| 报警记录处理 | `POST …/historyAlarmRecord/summary`；`POST …/exceptionHandle/batch`；`GET /alarm/errorList` |
| 硬件告警处理 | `POST /monitorIndicator/historyAlarmRecord`；`POST /monitorIndicator/exceptionHandle`（objSensorId+time） |
| 硬件间隔/阈值 | `POST /device/update/interval/report|alarm`；`POST /device/update/sensors` |
| 硬件部门/负责人 | `POST /device/update/basic`；`GET/POST /equipmentUser/list|add|remove`；`GET /user/list` |
| 硬件绑定事物 | `POST /device/binding`；`POST /room/things/add|remove`；`POST /instrument/things/add|remove` |
| 声光蜂鸣时长 | `GET /alertor/obtain/beepTime`（仅 type=7） |
| 信号绑定列表 | `GET /device/signal/bind/list`；`POST …/bind|unbind` 拒绝 |
| 信号曲线 | `GET /history/device/chart` |
| 联网配置回显 | `GET /device/wifi/echo`（type 8/10/16）；`POST …/wifi/input*` 拒绝 |
| 枪架枪位列表 | `POST /gun/pipette/binding/list`；历史告警空桩 |
| 网关标签绑定 | `POST /label/binding/list`（980025 预置 TAG-001…）；历史告警空桩 |
| 声光/平台开关 | `POST /device/update/closeAlarm/*` 明确拒绝 |
| 持久化 | `…equipmentMeta`；`equipmentUsers`；`equipmentBindings` |
| 楼层房间标记写 / 侧栏仪器列表 | 仍拒绝或跳过 |

## 复测

```powershell
npm run test:demo -- --watch=false

$env:DEMO_PORT = '8088'   # 以实际端口为准
npm run test:demo:hardware:1b
```

顶栏「系统 → 报警记录」支持多选批量处理（须有处理时间与类型）。曲线非法自定义日期应失败/空态，不再变成默认窗口。

下一项见 `docs/next-task-prompt.md`。

## 房间布局缓存升级（P1 修复）

设备坐标改为中心坐标，图标保持 128×144 原始比例；底图等比显示。旧版布局缓存不能直接沿用，会显示默认布局，请重新调整并保存。新版 version:2 缓存支持刷新恢复；非法或损坏布局回退默认值。设备完整边界必须在房间内，缩放范围 0.2–3；无效拖动/变换回到操作前的位置。
