# 本地演示：含部门与成员 6A–6D

房间详情更新：设备分类随设备编辑生效；切分类、搜索或Tab会回第一页；设备卡片展示与平面图同源的本地SVG设备外观。

当前演示链路：一层实验室平面 + 房间设备布局 + 设备只读详情/历史曲线 + 报警记录处理 + 共享场景 + 双大屏 + 告警排行 + 楼层设计器只读 + **智能硬件总览/详情（1A/1B）** + **设备管理仪器列表（2A）～解绑（2H）** + **房间管理列表/只读详情（3A）+ 关联硬件只读（3B）+ 筛选导出（3C）+ 未监测设备 Tab（3D）** + **数据统计总览与告警（4A）+ 状态饼图（4B）+ 使用统计（4C）+ 使用率排行（4D）** + **设备维保列表（5A）+ 申请（5B）+ 下次日期/完成确认（5C）** + **部门与成员（6A–6D）**。开放：`/login`、`/dashboard`、`/building`、`/floor/view`、`/floor/designer`、`/room/view`、`/room/designer`、`/floorDataV`、`/roomDataV`、`/sys/a/log`、`/sys/department`、`/lhd/hardware/home`、`/ld/labdevice`、`/ld/maintenance`、`/rm/room`、`/ms/mapSet`、`/ds/statistics`。不开放 `/apply/maintenance`、`/asset/maintenance`、`/sys/user`（个人资料）、员工导入导出。

首页「设备管理」进入实验室仪器列表：关键词/部门/分类/空间/状态筛选、分页、统计卡。点仪器名称打开详情；可编辑名称/部门/分类；可单条/批量删除（**已绑定智能硬件须先解绑**）；可手填新增；可 XLSX 导入（先预览再确认）；可导出。批量改部门等仍拒绝。

首页「房间管理」进入房间列表：关键词/部门/位置/状态筛选、分页、统计卡；可**导出**；可**新增/编辑/单删**房间（有设备或硬件时拒删）；可选上传房间底图（PNG/JPEG→本地 IndexedDB）。批量/导入仍隐藏。

侧栏 **地图设置**（`/ms/mapSet`）：仅开放楼宇下**楼层新增/编辑底图**；园区/楼宇增删改、楼层删除、房间绑定未开放。内置 SVG 登记键可继续作底图；新图仅 PNG/JPEG。

没有其他图片也可演示上传：直接选择 `smart-facility-platform/public/demo/floors/floor-a-1f.png`（楼层）、`room-a.png` 或 `room-b.png`（房间）。它们由现有 SVG 原稿同尺寸导出；设备仍由 Mock 动态布局，不嵌入图片。

首页「数据统计」进入总览 + 报警 + 状态饼图 + 使用统计 + **使用率排行表**（工作日/自然日、高级时段）。真实电量与 `/ds/device/chart` 本阶段隐藏。

## 启动

```powershell
npm run demo
```

端口以终端为准（常见 8088 / 8091）。账号：`demo` / `Demo1234` / `2468`。

## 路径

登录 → 楼宇 → 1F → **查看设备布局** → 悬停看读数 / **点击设备**打开只读详情与曲线 → **进入配置**拖动保存。  
顶栏 **系统 → 报警记录**：查看设备告警列表，单条「添加处理」后刷新为已处理。  
楼层/房间顶部工具栏：**场景**（切换演示数据）与 **筛选**（过滤当前画布）分组显示、互不重叠；切换场景不改坐标。

地图设置新建楼层后，楼宇页可切换并预览底图；该层新建未布局房间出现在楼层配置左侧候选列表，预览画布不出现幽灵点；改名/删除后读侧同步。

楼层预览单击房间标记 → 操作卡 →「查看详情」或「进入房间」（使用对应房间底图，无图则提示上传）。「进入配置」→ 从左侧拖入/点击放置房间 → 单击选中、拖动调整 →「移除布局」回候选列表 → 保存返回预览；可撤销修改，未保存退出先确认。移除只改布局，不删除业务房间。
首页或顶栏 **设备管理**：筛选分页 → 详情/编辑/删除 → **解绑（若已绑定）** → **新增** → **多选批量删除** → **导入**（预览确认）→ **导出**当前筛选结果。  
首页 **房间管理**：筛选分页 → 点名称打开只读详情与关联仪器；可导出；未监测 Tab 依赖设备管理新增未上图仪器。
首页 **数据统计**：总览 → 报警 → 状态饼图 → 使用统计条图 → 使用率排行表。
首页 **维保管理**（或设备管理侧栏「维保管理」）：关键字/部门/日期筛选、分页；点存活设备名称打开已演示设备抽屉。设备抽屉可**申请维保**；列表/详情可设**下次维保日期**与**核查确认**（已完成不可再确认）。已删除设备的历史记录仍列出，点击只提示不打开抽屉，也不能再申请。
顶栏 **系统 → 部门与成员**：部门树可增/改/删（种子部门不可删）与同级排序；员工可新增/编辑/改角色/离职；关键字/部门筛选与分页。导入/导出仍禁用；不可对演示登录账号离职或改角色。

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
| 房间新增/编辑/单删 | `POST /room/add`；`POST /room/update/basic`；`POST /room/remove/:id`（有仪器/硬件拒删；空房间清布局） |
| 房间批量/导入等 | batch/goods/remove **明确拒绝**；导入未开放 |
| 楼层列表/增改 | `GET/POST/PUT /map/floor`（`floorCreated`/`floorMeta`；新建 id `931201+`；底图媒体键） |
| 楼层删除 | `DELETE /map/floor` **明确拒绝** |
| 本地底图媒体 | IndexedDB `smart-facility-demo-media`（`demo-media-*`）；内置 `demo-floor-*` / `demo-room-*` |
| 数据统计总览 | `GET /statistic/overview`（仪器/房间/硬件当前状态分桶） |
| 数据统计告警 | `GET /statistic/alarm/overview`；`GET /statistic/equipment/alarm`（历史未处理） |
| 数据统计状态饼图 | `GET /instrument/instrumentStatistics`（活跃仪器 run/standby/close） |
| 数据统计使用 | `GET /statistic/instrument/use`（活跃仪器 + 演示时钟窗口派生时长/次数） |
| 数据统计使用率排行 | `GET /statistic/instrument/useRanking`（数组 items；工作日/自然日/时段派生） |
| 维保列表 | `POST /maintenance/list`（共享 970xxx 快照；`completeFlag` 仅 0/1） |
| 维保申请 | `POST /maintenance/add`（→ `maintenanceCreated`；存活设备） |
| 维保下次日期 | `POST /maintenance/updateMaintenance`（→ `maintenanceMeta`） |
| 维保完成确认 | `GET /maintenance/complete`（已完成再确认拒绝） |
| 部门与成员列表 | `GET /user/list`（共享 `DEMO_STAFF`∪`staffCreated`+meta；公司根 `departmentId=0` 不筛） |
| 员工新增 | `POST /user/add`（→ `staffCreated`，id `901101`–`901150`） |
| 员工编辑 | `POST /user/update/basic`（→ `staffMeta`；loginId 不可改） |
| 员工改角色 | `POST /user/update/role`（→ `staffMeta`；不可改演示登录账号） |
| 员工离职 | `POST /user/delete/batch`（→ `staffMeta.left` tombstone） |
| 角色列表 stub | `GET /role/list`（含「普通成员」） |
| 部门树 | `GET /department/list`（种子 ∪ `departmentCreated` + meta） |
| 部门新增/编辑 | `POST /department/add`；`POST /department/update` |
| 部门删除/排序 | `POST /department/remove/:id`（tombstone）；`PUT /department/move` |
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
npm run test:demo:map:m3
# 可选：npm run test:demo:map:m2 / map:m1
```

顶栏「系统 → 报警记录」支持多选批量处理（须有处理时间与类型）。曲线非法自定义日期应失败/空态，不再变成默认窗口。

下一项见 `docs/next-task-prompt.md`。

### 数据统计总览与告警（4A）

首页「数据统计」→ 三张总览卡（跟活跃仪器/房间/硬件当前状态）→ 报警总览三环（仪器/房间/硬件历史告警按探头或种类）→ 智能硬件报警柱图（按日）。已处理告警不再计入环/柱。页顶有「模拟统计」说明；使用统计区有「估算能耗（kWh）」说明。不开放 `/statistic/electricity*` 与 `/ds/device/chart`。

### 设备状态统计饼图（4B）

同页「设备状态统计」：`runCount`/`standbyCount`/`closeCount`/`totalCount` 跟活跃仪器 `status`（LABSTATUS 0/1/2）。告警/离线场景（`-1`/`-100`）只计入总数、不填三环，不回退成全正常。

### 设备使用统计（4C）

同页「设备使用统计」：时长/次数条图，日/周/月或自定义区间（演示时钟）；类型筛全部/实验室/行政/IT。指标由活跃仪器 `workingHours` + 窗口天数派生，**不是**真实电表。行政/IT 默认可空。

### 设备使用率排行（4D）

同页「设备使用率统计」表：`useRate`/`variationRate`/`changed`；工作日/自然日与高级时段查询。与 4C 同源派生。

### 设备功耗维度（4E）

同页「设备使用统计」可切「功耗」：`electricPower`（kW·h）= 演示铭牌功率 × 派生使用小时，**不是**插座/电表采样。`/statistic/electricity*` 与 `/ds/device/chart` 仍未开放。

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

### 设备维保列表只读（5A）

首页「维保管理」→ `/ld/maintenance`：14 条合成记录，设备 ID/名称与设备管理共用。支持关键字、部门、申请日期筛选与分页；清空日期后恢复全部。点名称打开设备抽屉（`instrumentId`，不是维保记录 id）。`/apply/maintenance` 与资产维保页不放行。

### 设备维保申请（5B）

设备管理或维保列表打开存活设备抽屉 →「申请维保」→ 填写故障描述（≤50 字）→ 确定。新记录写入本地演示存储，维保列表与详情维保 Tab 可查；状态为维护中。已删除设备不可申请。

### 下次日期与完成确认（5C）

维保列表或详情维保 Tab：可修改下次维保日期（不得早于申请时间）；可对维护中记录核查确认，完成后状态变为维护完成且不可再确认。

### 维保收尾（5D）

申请成功自动切到详情维保记录第一页；详情中的申请、修改和完成确认会同步刷新外层维保列表。列表按天筛选包含结束日当天，非法日期区间明确提示。删除设备后历史维保保留，已删除设备不能再申请或打开详情。设备基本信息中的下次维保日期尚未作为记录聚合结果联动。

### 部门与成员只读（6A）

首页「系统管理」或顶栏「系统 → 部门与成员」→ `/sys/department`：左侧部门树（含公司根）、右侧共享员工。支持部门切换、关键字、分页；换部门/搜索回第一页。导入/导出/离职与部门树写操作按钮禁用。`/sys/user` 仍是个人资料页，未开放（顶栏个人资料入口仍会被守卫挡回）。

### 员工新增与编辑（6B）

同页可新增员工（登录名唯一、密码不落库）与编辑基本信息；新建 id `901101`–`901150`。列表与设备负责人、维保申请人共用同一员工池。

### 离职与角色调整（6C）

可变更角色（`POST /user/update/role`）；可单条/批量离职（tombstone，列表与负责人选项不再出现，维保历史仍可解析姓名）。不可对演示登录账号 `demo`/`900001` 离职或改角色。

### 部门操作与复盘（6D）

可新增/编辑部门、添加子部门、同级排序；种子部门 900101/900102 不可删；有员工或子部门不可删。员工与设备侧部门校验跟活跃部门池。导入/导出仍未开放。复盘见 `docs/review-system-module.md`。

### 跨模块一致性（6E）

删除新建部门前检查活跃仪器与硬件引用（移出后方可删）；硬件列表/详情部门名随共享部门改名刷新；员工基本编辑未传角色保持原角色，演示登录不可借基本编辑改角色；离职确认文案去掉自动解绑承诺。
