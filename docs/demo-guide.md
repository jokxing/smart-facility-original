# 本地演示：含房间管理至未监测 Tab（3A–3D）

当前演示链路：一层实验室平面 + 房间设备布局 + 设备只读详情/历史曲线 + 报警记录处理 + 共享场景 + 双大屏 + 告警排行 + 楼层设计器只读 + **智能硬件总览/详情（1A/1B）** + **设备管理仪器列表（2A）～解绑（2H）** + **房间管理列表/只读详情（3A）+ 关联硬件只读（3B）+ 筛选导出（3C）+ 未监测设备 Tab（3D）**。开放：`/login`、`/dashboard`、`/building`、`/floor/view`、`/floor/designer`、`/room/view`、`/room/designer`、`/floorDataV`、`/roomDataV`、`/sys/a/log`、`/lhd/hardware/home`、`/ld/labdevice`、`/rm/room`。

首页「设备管理」进入实验室仪器列表：关键词/部门/分类/空间/状态筛选、分页、统计卡。点仪器名称打开详情；可编辑名称/部门/分类；可单条/批量删除（**已绑定智能硬件须先解绑**）；可手填新增；可 XLSX 导入（先预览再确认）；可导出。批量改部门等仍拒绝。

首页「房间管理」进入房间列表：关键词/部门/位置/状态筛选、分页、统计卡；可**导出**当前筛选全部匹配行。点房间名称打开只读详情（基本信息 + 已上图关联仪器 + **未监测设备** Tab + 已绑定智能硬件只读表）。**不开放**房间新增/编辑/删除/导入/绑定解绑；列表上的关联硬件类型筛选取消（不假生效）。

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
首页或顶栏 **设备管理**：筛选分页 → 详情/编辑/删除 → **解绑（若已绑定）** → **新增** → **多选批量删除** → **导入**（预览确认）→ **导出**当前筛选结果。  
首页 **房间管理**：筛选分页 → 点名称打开只读详情与关联仪器；可导出；未监测 Tab 依赖设备管理新增未上图仪器。

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
| 仪器导入 | `POST /instrument/import/preview` + `POST /instrument/import`（XLSX） |
| 仪器导出 | `POST /instrument/export`（当前筛选 → 本地 XLSX，忽略分页） |
| 仪器批量删除 | `POST /instrument/batch/delete`（原子 tombstone，同单删守卫） |
| 仪器新增 | `POST /instrument/add`（名称/部门/分类/房间 → `instrumentCreated`，不上图） |
| 仪器解绑 | `GET /instrument/unbind?instrumentId=`（清智能硬件绑定；绑定中不可删） |
| 房间列表 / 统计 | `POST /room/list`；`GET /room/dashboardV1`（950xxx 共享空间；设计器仅 `floorId` 仍空侧栏） |
| 房间详情 / 已上图仪器 | `GET /room/detail`；`GET /room/monitor/instrument`（空间归属且已上图） |
| 房间未监测仪器 | `POST /instrument/list`（`roomId` + `monitor:"2"`：归属未上图） |
| 房间关联硬件只读 | `GET /monitorIndicator/things/newList?objType=3`（共享 `equipmentBindings` type:11） |
| 房间导出 | `POST /room/export`（当前筛选 → 本地 XLSX，忽略分页） |
| 房间写 | add/update/remove/batch/goods/remove **明确拒绝**；导入未开放 |
| 设备只读详情 | `GET /instrument/detail`；监测标签 `getOpenMonitorFlag` / `getMonitorFlag` |
| 设备历史曲线 | `GET /monitorIndicator/monitorInfo`（离线为空）；`historyPage` 空表桩 |
| 仪器其它写 | `batch/update` **明确拒绝** |
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
npm run test:demo:room:3d
# 可选：npm run test:demo:room:3c / 3b / 3a
```

顶栏「系统 → 报警记录」支持多选批量处理（须有处理时间与类型）。曲线非法自定义日期应失败/空态，不再变成默认窗口。

下一项见 `docs/next-task-prompt.md`。

## 房间布局缓存升级（P1 修复）

设备坐标改为中心坐标，图标保持 128×144 原始比例；底图等比显示。旧版布局缓存不能直接沿用，会显示默认布局，请重新调整并保存。新版 version:2 缓存支持刷新恢复；非法或损坏布局回退默认值。设备完整边界必须在房间内，缩放范围 0.2–3；无效拖动/变换回到操作前的位置。


### XLSX 设备导入（2026-10-01）

设备管理→导入→下载设备导入.xlsx，按填写说明页的候选名称填写设备导入页。选择文件后先出现校验预览（不落库），整批通过后点「确认导入」才写入；确认时会再次校验名称重复与容量。错误行在预览表展示；换文件会清空预览。最多50行，成功后显示数量并刷新。不自动上图，不支持旧.xls/CSV。

### 导入预览确认（同日追加）

流程：选择文件 → `POST /instrument/import/preview` → 预览表（行号/名称/部门/分类/房间/错误）→「确认导入」→ `POST /instrument/import`。预览与确认共用同一套解析与业务校验。

### 筛选导出（2E）

设备管理列表设好筛选后点「导出」，下载当前筛选全部匹配行的本地 XLSX（忽略分页）；无外部下载服务。

### 批量删除（2F）

列表点「多选」→ 勾选设备 →「批量删除」。未绑定智能硬件的设备可删；任一条已绑定或无效则整批不删。

### 手填新增（2G）

列表点「新增」→ 填写名称/编号/部门/分类/房间 → 确定。写入后出现在列表与统计，不自动上图；同房间名称不可重复。

### 绑定与解绑（2H）

仪器若已绑定智能硬件（硬件详情绑定区写入），列表删除会提示「请先解绑」；详情抽屉可点「解绑」。解绑后即可删除。批量删除遇任一条已绑定则整批失败。


### 设备登记表单
演示新增填写名称、部门、分类、房间，编号保存后自动生成。编辑可改名称、部门、分类，房间只读。同房间不能重名；品牌、价格、工作时长等未开放字段不再提供输入。

### 房间管理列表与只读详情（3A）

首页「房间管理」→ 三间演示房（A/走廊/B）。支持关键词、部门、位置、状态筛选与分页；统计卡跟位置范围。点名称打开只读详情，可见已上图关联仪器。走廊无仪器计为未监测。不提供房间新增/编辑/删除/导入；关联硬件类型筛选已隐藏。列表可导出（见 3C）。

### 房间关联硬件只读（3B）

详情内「绑定设备」表只读：房间 A 预置设备管理器 A（EQ-SK-001），房间 B 预置温湿度记录仪 C（EQ-TH-003），走廊为空。数据与硬件详情绑定共用 `equipmentBindings`；房间侧不提供绑定/解绑。

### 房间筛选导出（3C）

列表设好筛选后点「导出」，下载当前筛选全部匹配行的本地 XLSX（忽略分页）；空结果仅表头。不开放导入。

### 未监测设备 Tab（3D）

设备管理手填新增一台归属某房间、未上图的仪器后，打开该房间详情 →「未监测设备」可见；「监测设备」仍为已上图列表且数量不变。冷启动无未上图种子。
