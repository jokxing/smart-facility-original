# 本地演示：含设备管理列表、编辑、删除与导入（2A–2D）

当前演示链路：一层实验室平面 + 房间设备布局 + 设备只读详情/历史曲线 + 报警记录处理 + 共享场景 + 双大屏 + 告警排行 + 楼层设计器只读 + **智能硬件总览/详情（1A/1B）** + **设备管理仪器列表（2A）、基本信息编辑（2B）、单条删除（2C）、导入（2D）**。开放：`/login`、`/dashboard`、`/building`、`/floor/view`、`/floor/designer`、`/room/view`、`/room/designer`、`/floorDataV`、`/roomDataV`、`/sys/a/log`、`/lhd/hardware/home`、`/ld/labdevice`。

首页「设备管理」进入实验室仪器列表：关键词/部门/分类/空间/状态筛选、分页、统计卡。点仪器名称打开只读详情；列表/详情可编辑名称、部门、分类（`instrumentMeta`）；操作列可单条删除（`instrumentDeleted`）；「导入」下载 CSV 模板并上传后按表内首行写入（`instrumentCreated`）。勿用 Excel 另存为二进制 xls/xlsx。新增/批量/导出在演示下仍拒绝。

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
首页或顶栏 **设备管理**：仪器列表筛选分页 → 点名称打开只读详情 → **编辑** / **删除** → **导入**写入「演示导入设备」。

## Mock 要点

| 项 | 说明 |
| --- | --- |
| 平面 / 标记 | `GET /map/floor/overview`（实验室房间状态跟场景） |
| 房间设备布局读 | `POST /map/element/getRoonInstrumentInfoList?roomId=` |
| 房间设备布局写 | `POST /map/element/config`（仅 type:4；演示会话 + 校验） |
| 布局重置 | `POST /demo/room-layout/reset` |
| 演示场景 | `GET/POST /demo/scenario` |
| 仪器列表 / 统计 | `POST /instrument/list`；`GET /instrument/dashboard/new`（970xxx 共享实体） |
| 仪器编辑 | `POST /instrument/update/basic`（name/departmentId/types → `instrumentMeta`） |
| 仪器单删 | `POST /instrument/remove/:id`（→ `instrumentDeleted`；同步剪布局点） |
| 仪器导入 | `POST /instrument/import`（CSV 文本：名称/部门/分类/房间 → `instrumentCreated`，id 970101+） |
| 设备只读详情 | `GET /instrument/detail`；监测标签 `getOpenMonitorFlag` / `getMonitorFlag` |
| 设备历史曲线 | `GET /monitorIndicator/monitorInfo`（离线为空）；`historyPage` 空表桩 |
| 仪器其它写 | `add` / `batch/*` / `export` / `unbind` **明确拒绝** |
| 报警记录处理 | `POST …/historyAlarmRecord/summary`；`POST …/exceptionHandle/batch`；`GET /alarm/errorList` |
| 硬件告警处理 | `POST /monitorIndicator/historyAlarmRecord`；`POST /monitorIndicator/exceptionHandle`（objSensorId+time） |
| 硬件间隔/频率 | `POST /device/update/interval/report|alarm`；`POST /device/update/sensors` |
| 硬件部门/负责人 | `POST /device/update/basic`；`GET/POST /equipmentUser/list|add|remove`；`GET /user/list` |
| 硬件绑定事物 | `POST /device/binding`；`POST /room/things/add|remove`；`POST /instrument/things/add|remove` |
| 声光蜂鸣时长 | `GET /alertor/obtain/beepTime`（仅 type=7） |
| 信号绑定列表 | `GET /device/signal/bind/list`；`POST …/bind|unbind` 拒绝 |
| 信号曲线 | `GET /history/device/chart` |
| 联网配置回显 | `GET /device/wifi/echo`（type 8/10/16）；`POST …/wifi/input*` 拒绝 |
| 枪架枪位列表 | `POST /gun/pipette/binding/list`；历史告警空桩 |
| 网关标签绑定 | `POST /label/binding/list`（980025 预置 TAG-001…）；历史告警空桩 |
| 声光/平台开关 | `POST /device/update/closeAlarm/*` 明确拒绝 |
| 持久化 | `…equipmentMeta`；`equipmentUsers`；`equipmentBindings`；`instrumentMeta`；`instrumentDeleted`；`instrumentCreated` |
| 楼层房间标记写 / 侧栏仪器列表 | 仍拒绝或跳过 |

## 复测

```powershell
npm run test:demo -- --watch=false

$env:DEMO_PORT = '8088'   # 以实际端口为准
npm run test:demo:device:2d
# 可选：npm run test:demo:device:2c
# 可选：npm run test:demo:device:2b
# 可选：npm run test:demo:hardware:1b
```

顶栏「系统 → 报警记录」支持多选批量处理（须有处理时间与类型）。曲线非法自定义日期应失败/空态，不再变成默认窗口。

下一项见 `docs/next-task-prompt.md`。

## 房间布局缓存升级（P1 修复）

设备坐标改为中心坐标，图标保持 128×144 原始比例；底图等比显示。旧版布局缓存不能直接沿用，会显示默认布局，请重新调整并保存。新版 version:2 缓存支持刷新恢复；非法或损坏布局回退默认值。设备完整边界必须在房间内，缩放范围 0.2–3；无效拖动/变换回到操作前的位置。


### XLSX 设备导入（2026-10-01）

设备管理→导入→下载设备导入.xlsx，按填写说明页的候选名称填写设备导入页。选择文件后先出现校验预览（不落库），整批通过后点「确认导入」才写入；确认时会再次校验名称重复与容量。错误行在预览表展示；换文件会清空预览。最多50行，成功后显示数量并刷新。不自动上图，不支持旧.xls/CSV。

### 导入预览确认（同日追加）

流程：选择文件 → `POST /instrument/import/preview` → 预览表（行号/名称/部门/分类/房间/错误）→「确认导入」→ `POST /instrument/import`。预览与确认共用同一套解析与业务校验。
