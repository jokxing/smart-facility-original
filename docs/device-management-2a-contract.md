# 设备管理 2A —— 统一仪器列表与只读详情入口

核对与交付日期：2026-09-30。依据 `views/labDevice/index.vue`、`SearchForm`、`LabDeviceDrawer` 与既有 `DEMO_INSTRUMENTS`；**不**混用智能硬件 `980xxx`。

## 本轮开放范围

| 能力 | 演示 |
| --- | --- |
| 首页「设备管理」→ `/ld/labdevice` | **已开放** |
| `POST /instrument/list` 筛选/分页 | **已开放** |
| `GET /instrument/dashboard/new` 统计卡 | **已开放** |
| 点击名称 → `LabDeviceDrawer` 只读详情 | **已开放**（复用 `GET /instrument/detail` + 监测标签） |
| 编辑基本信息（名称/部门/分类） | **2B 已开放**（`POST /instrument/update/basic` + `instrumentMeta`） |
| 单条删除 | **2C 已开放**（`POST /instrument/remove/:id` + `instrumentDeleted` tombstone） |
| 导入 | **2D 已开放**（XLSX + 预览确认） |
| 导出 | **2E 已开放**（`POST /instrument/export` → 本地 XLSX） |
| 批量删除 | **2F 已开放**（`POST /instrument/batch/delete` + 同 tombstone） |
| 新增 | **2G 已开放**（`POST /instrument/add` → 同 `instrumentCreated` 池） |
| 解绑智能硬件 | **2H 已开放**（`GET /instrument/unbind`；绑定后不可删） |
| 批量改 / 其它 | `batch/update` **明确拒绝** |

## 实体与 ID

| 实体 | ID | 源 |
| --- | --- | --- |
| 仪器 | `970001`–`970012` | `fixtures/instrument.js` `DEMO_INSTRUMENTS` |
| 房间 | `950001` / `950003`（走廊 `950002` 无仪器） | `DEMO_FLOOR_ROOMS` |
| 分类 | `types: 1`「演示设备」 | `DEMO_CATEGORIES`（`childrenList` + `types`） |
| 部门 | `900101` 运维 / `900102` 研发 | 仪器行带 `departmentId` |
| 智能硬件 | `980xxx` | **禁止**出现在本列表 |

列表行与详情、房间布局、`/__demo/equipment/bindable?kind=instrument` 共用同一仪器源，禁止第二套同名数据。

## 列表契约

### `POST /instrument/list`

请求体（页面实际字段，节选）：

| 字段 | 用途 |
| --- | --- |
| `keyword` | 匹配 `name` / `no` / `roomName` |
| `departmentIdList` | 部门 id（字符串或数字） |
| `typesList` | 分类 `types` 值 |
| `gardenId` / `buildingId` / `floorIds` | 空间；`floorIds` 实为楼层 id（级联第三级） |
| `roomIdList` | 房间 id（侧栏选房） |
| `status` | 运行：`1` 运行；`0` 未运行（含 `-1`/`2`）；`4` 未绑定 |
| `sensorStatus` | 参数：`1` 正常；`2` 异常；`3` 其它 |
| `objType` | 关联硬件类型 code；按当前仪器绑定关系过滤 |
| `pageNum` / `pageSize` | 分页（默认 10；12 条可验两页） |
| `type` | 固定 `4`（仪器） |

成功：`items: { list, total, pageNum, pageSize }`。

行字段（表列 + 详情入口）：

`id, name, no, departmentId, departmentName, roomId, roomName, types, typeName, status, bingStatus, createDate, openTwoSystem, labelId`

- `openTwoSystem: true` → 新抽屉 `LabDeviceDrawer`
- `status` / `bingStatus` 跟共享场景 `normal|alarm|offline`（同房间布局）

### `GET /instrument/dashboard/new`

成功：`items: { totalCount, data: [{ linaType, normalCount, abnormalCount, restsCount }, ...] }`

页面可见卡仅 `linaType` **5**（运行）与 **6**（参数）。UI 映射：

- `item.normalCount ← check.abnormalCount`
- `item.abnormalCount ← check.restsCount`
- `item.totalCount ← check.normalCount`

口径（全库，不受当前筛选）：

| linaType | normalCount | abnormalCount | restsCount |
| --- | --- | --- | --- |
| 5 运行 | 运行中 `status===1` | 未运行 `0/-1/2` | 未绑定 `3/4` |
| 6 参数 | 正常 `bingStatus===1` | 异常 `2/-1` | 其它 |

## 依赖下拉

| 方法 | 路径 | Demo |
| --- | --- | --- |
| GET | `/map/garden` | 既有园区树 |
| GET | `/instrumentCategoryInfo/superior/cat` | `{name, types, childrenList}` |
| GET | `/department/list` | 既有部门 |
| GET | `/equipment/bindEquipmentType` | `EQUIPMENT_TYPE_META` → `{code,name}` |
| POST | `/room/list` | 设计器：`floorId` 且无 keyword → 空；编辑弹窗/keyword → 共享房间 |
| POST | `/room/tree` | 编辑弹窗房间树（园区→楼→层→房间，level=4 可选） |
| GET | `/grade/getlist` | 空数组桩 |
| GET | `/file/policy` | 空策略桩（不上传） |
| GET | `/file/instrument/pic/search` | 空图片列表桩 |

## 写操作

### 2B 已开放：`POST /instrument/update/basic`

持久化键：`smart-facility-demo:v1:instrumentMeta`。

| 字段 | 规则 |
| --- | --- |
| `id` | 必须存在于 `DEMO_INSTRUMENTS` |
| `name` | trim 后 2–26 字 |
| `departmentId` | `900101` / `900102` |
| `types` | `1` 演示设备 / `2` 演示辅助设备 |

成功后列表、详情、房间布局名称、bindable 目录立即反映 overlay。其它 body 字段接受但忽略。已 tombstone 的 id 不可再编辑。

### 2C 已开放：`POST /instrument/remove/:id`

持久化键：`smart-facility-demo:v1:instrumentDeleted`（id 数组 tombstone；`DEMO_INSTRUMENTS` seed 不变）。

| 规则 | 说明 |
| --- | --- |
| id | 必须存在于 seed；已删再删 → failure「已删除」；未知 id 无路由（fixture 层拒绝） |
| 副作用 | 清除该 id 的 `instrumentMeta`；从 `roomLayoutOverrides` 剪掉对应点 |
| 读路径 | 列表 total/dashboard、详情、房间布局、`bindable?kind=instrument` 均排除已删 id |

列表操作列「删除」已开放（无 `labelId` 时确认后直删；有标签时仍走解绑，解绑接口仍拒绝）。

### 2D 已开放：导入（见文末 XLSX / 预览确认）

列表「导入」已开放；`POST /instrument/import/preview` + `POST /instrument/import`。详情见文末「XLSX 导入契约更新」。

### 2F 已开放：`POST /instrument/batch/delete`

| 规则 | 说明 |
| --- | --- |
| 请求 | `{ids: number[]}`；空数组/缺省 → failure「请选择要删除的设备」 |
| 校验 | 全部 id 须为活跃实体且**均未绑定**智能硬件；任一条无效/已删/已绑定 → **整批不删**（原子） |
| 副作用 | 逐条复用 `removeInstrument` tombstone（同 2C：清 meta、剪布局） |
| 成功 | `items: {count, ids}` |

列表「多选」已开放；演示下批量操作条**仅**「批量删除」（其它批量改部门/房间等仍隐藏且 `batch/update` 拒绝）。

### 2G 已开放：`POST /instrument/add`

| 规则 | 说明 |
| --- | --- |
| 字段 | `name`（2–26）、`departmentId`（900101/900102）、`types`（1/2）、`roomId`（950001/950002/950003） |
| 其它 body | 接受但忽略（编号由 `DEMO-EQ-{id}` 派生） |
| 持久化 | 同导入：`instrumentCreated`，id 段 `970101`–`970150`；`imported: true` |
| 查重 | 同房间名称不可与活跃设备重复 |
| 读路径 | 列表/dashboard/详情/bindable；**不**自动上图 |

列表「新增」按钮已开放（原 Modal type=4）。

### 2H 已开放：`GET /instrument/unbind?instrumentId=`

| 规则 | 说明 |
| --- | --- |
| 作用 | 清除该仪器上全部智能硬件绑定（`equipmentBindings` 中 type=4） |
| 未绑定 | failure「该设备未绑定智能硬件」 |
| 与删除 | 列表行/详情带 `boundHardware`；**已绑定不可删**（UI 提示 + Mock 拒绝）；解绑后方可单删/批量删 |

详情抽屉演示区展示绑定状态与「解绑」；硬件侧 `POST /instrument/things/remove` 仍可用。

### 2E 已开放：`POST /instrument/export`

按当前筛选条件导出**全部匹配行**（忽略分页）为本地 XLSX（`设备列表` 工作表）。

| 列 | 说明 |
| --- | --- |
| 名称 / 设备编号 / 部门 / 房间 / 分类 / 运行状态 / 参数状态 | 与列表同源 `listInstruments` |

无外部下载服务。

### 仍拒绝

`POST /instrument/batch/update` → `failure('本阶段演示未开放仪器写操作。')`。

## 导航

- `permission.js` demo 白名单增加 `/ld/labdevice`
- `DEMO_MENUS` 增加「设备管理」→ `/ld/labdevice`
- 不开放 `/ld/watchlabdevice`、`/ld/administration`、使用统计等兄弟路由

## 验证

- 单测：列表/编辑/删除/导入/导出/批量删除/新增/解绑；batch/update 仍拒
- 浏览器：证据 `docs/evidence/device-management-2a` … `2h`

## XLSX 导入契约更新（2026-10-01）

POST /instrument/import 接收 FormData 单个files（真实.xlsx）；设备导入页固定名称/部门/分类/房间，填写说明页列出候选名称。GET /__demo/instrument/import-options 返回共享departments/types/rooms，需登录。成功items含count/ids及首条兼容字段；失败code=0/message且整批不写。名称2–26字，同房间名称不能与现有或批次重复；最多50行/10MB、累计50个导入ID（删除不复用）。解析后同步校验分配保存；前端提交锁。绑定使用活跃实体，已绑定单删需先解绑。新设备已登记、未布置，不自动上图；旧CSV模板不再支持。验收见STATUS。

### 导入预览确认（2026-10-01）

| 项 | 说明 |
| --- | --- |
| `POST /instrument/import/preview` | 解析+业务校验，**不写**存储；items 含 `ok/message/rows/validCount/freeCount` |
| 预览行 | `rowNumber, name, department, type, room, error`（及解析出的 id 字段） |
| 确认 | 仅当 `ok=true` 可点「确认导入」；再次走 `POST /instrument/import`（重新校验名称重复与容量） |
| 换文件 | 清空预览后重新请求 preview |
| 共享 | `buildInstrumentImportPlan` 供 preview/import 共用，页面不复制规则 |


### 表单收尾（2026-10-01）
演示新增只可编辑名称/部门/分类/房间，编号自动生成；编辑只开放名称/部门/分类，房间只读。编辑与新增/导入统一同房间名称唯一语义，编辑排除自身；不同房间允许同名。未持久化字段不再提供输入。
