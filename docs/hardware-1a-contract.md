# 智能硬件 1A —— 接口与页面契约（只读核对）

核对日期：2026-09-30。依据源码，未猜字段。本轮范围：首页入口 → 硬件总览列表只读闭环。

## 1. 入口与权限

| 环节 | 源码位置 | 行为 |
| --- | --- | --- |
| 首页卡片 | `utils/menuManager.js` `menuList[0]`：`id: "lhd"`，`path: "/lhd/hardware/home"` | `Dashboard.handleForward` 写 `menuKey=lhd` 后 `router.push({path})` |
| 路由 | `router/index.js`：`/pro` → `/lhd/hardware/home` → `HardwareHome.vue`；`name: "Gateway"` | 与 `/lhd/gateway` **同名** `Gateway`；首页按 path 跳转，本轮 path 可用。若用 `name` 导航会歧义，不全量改路由，必要时局部改 home 的 name |
| 演示守卫 | `permission.js` `demoAllowed` | **当前未放行** `/lhd/hardware/home`；直达会 Message 提示并回 `/dashboard` |
| 侧栏 | `SubLayout` + `Slidebar`：按 path 含 `item.id`（`lhd`）取 `DEMO_MENUS` 的 `subMenu` | 现 fixtures 下 lhd 仅有 `/lhd/device`，**缺硬件主页项**；进入后侧栏无法高亮/回到 home，需在 Mock 菜单补 `/lhd/hardware/home` |
| Layout 壳 | 登录 bootstrap：`/department/list`、`/instrumentCategoryInfo/...`、`/role/menu` | 已有 Mock；进硬件页会再跑同一套（非 building 特例） |

**开放范围（第 3 步已做）**：已放行 `/lhd/hardware/home` 与 `/pro`。不放行 gateway/device/写操作路由。演示下表格行点击详情被拦截并提示，留给 1B。

## 2. 页面组件与请求面

`HardwareHome.vue` 子组件：

| 组件 | 列表加载时是否发请求 | 备注 |
| --- | --- | --- |
| `DeviceTotal` | 否 | 展示统计；点击改 `deviceType` / `equipmentType` 后由父组件 `getList` |
| `SelectdePartment` | 否（用 Vuex `departments`） | 变更触发 `handleQuery`；部门树字段 `id/name/subDivisions` |
| `DeviceTable`（`:type="true"`） | 否（纯渲染） | **点击名称/编号** → `handleShowDrawer` 按 `equipmentTypeCode` 打开各类 Drawer（会再打详情 API）→ **1A 须限制，不可假成功** |
| `HardwareValue` / `DeviceSignal` | 否 | 读行内 `sensors` / 信号字段 |
| `Pagination` | 否 | `v-show="total > 10"`；`@pagination` → `getList` |

**本页唯一列表契约 API**：`POST /equipment/sort/list`（`api/device.getEquipmentSortList`，JSON body）。

首页卡片区另有：`GET /equipment/dashboard` → `{total, alarmCount}`（与 equipment 种子同源；`alarmCount` 仅 status=-1）。与 sort/list 页内统计卡片不是同一套 UI，但总数口径一致。

Mock 状态（第 2 步）：已接入 `handlers/equipment.js` + `fixtures/equipment.js`（22 条）。

## 3. 请求体（HardwareHome 实际组装）

```text
{
  pageSize,          // 默认 10；created 可读 localStorage.pageSize
  pageNum,           // 默认 1；筛选变化会重置为 1，且 pageSize 会写回 PAGE_SIZE(10)
  status: 0,         // 首页固定 0，不用 Device 页的正常/告警/离线 status 筛选
  departmentId,      // null 或部门 id（树选择后常为字符串）
  deviceType,        // 传感类型：0=全部，1温湿度…7压力（与 DeviceTotal 顶栏 code 一致）
  equipmentType,     // 硬件类别：null=全部；底栏用 equipmentSortCount[].type（如 10 设备管理器）
  keyword?,          // 输入框；回车/搜索按钮触发
  sortName: {        // 列头排序；单字段有效，其余置 ""
    name, num, department, createTime   // 值: "" | "asc" | "desc"
  }
}
```

排序列映射（`sortChange`）：`no`→`num`，`createDate`→`createTime`，`departmentName`→`department`，`name`→`name`。

筛选语义（须 Mock 侧实现，不能只前端藏数据）：

- `keyword`：匹配名称/编号等（实现时对齐常见字段 `name`/`no`）
- `departmentId`：按部门过滤
- `deviceType`：按传感类型过滤（`0` 不过滤）
- `equipmentType`：按硬件类别过滤（`null` 不过滤）
- 分页：`pageNum`/`pageSize`
- `sortName` 非空字段：服务端排序

## 4. 响应体（HardwareHome 实际消费）

成功：`res.code` 真值；失败：`res.message`。

```text
res.items = {
  list: DeviceRow[],
  total: number,           // 注意：仅当 items.pageNum === 1 时页面才写入 this.total
  pageNum: number,         // 用于上述 total 判定
  deviceSortCount: {
    typeSorts: [{ code, name, count }, ...],  // 顶栏传感类型；会整表替换本地默认
    deviceCount: number                       // 左侧「硬件总数」
  },
  equipmentSortCount: [{ type, name, count }, ...]
  // 底栏：type !== 0 才展示；映射为 overview { title:name, status:type, num:count }
}
```

与 `Device.vue`（记录仪页）的差异：记录仪页还读 `normalCount/alarmCount/offLineCount/...`，且 `equipmentType` 固定为记录仪。**首页不读这些字段**；Mock 可只保证首页所需，但实体应独立于 instrument。

### 列表行字段（表格 + 状态列 + 详情入口）

| 字段 | 用途 |
| --- | --- |
| `id` | row-key |
| `strId` | 打开抽屉用（1A 限制抽屉） |
| `name`, `no` | 列展示与点击 |
| `departmentName` | 部门列 / 排序 |
| `sensors[]` | `HardwareValue`：`type`, `status`, `value`, `signalSwitchStatus`, `gps?`, `sensorType.{name,unit,id}` |
| `reportDate` | 检测时间 |
| `equipmentTypeCode` | 状态列分支 + 抽屉类型；`0`/`10` 显示信号+电池+detectFlag，其它用 `alarmType(status)` |
| `battery`, `detectFlag` | 仅 code 0/10 |
| `status` | 在线列：`=== OFFLINE(-100)` 离线；`alarmType`：`1`正常 / `-100`离线 / `0`未激活 / 其它异常 |
| `gatewayName`, `panId?` | 所属网关 |
| `createDate` | 创建时间（filter `localToUtc`） |
| `openTwoSystem` | 抽屉新旧版分支（1A 可不打开抽屉） |

状态常量（`constant.js`）：`NORMAL=1`，`ABNORMAL=-1`，`OFFLINE=-100`，`NEWLYBUILD=0`。离线与告警/异常不可混用。

硬件类别示例（`EQUIPMENT_TYPE` + DeviceTotal isHome）：`0` 记录仪，`10` 设备管理器，`7` 声光，`8` 断电，`14` 信号等。传感类型顶栏本地默认 0–7，以接口 `typeSorts` 为准。

## 5. 与 instrument / 已有 Mock 的关系

- **智能硬件 equipment ≠ 实验室仪器 instrument**。已有 `mock/fixtures/instrument.js` 服务 labDevice 等，**不能**把 sort/list 接到 instrument 详情接口。
- 可复用：部门 id、园区/房间关系若列表需要关联展示；稳定合成 ID 体系。
- 需新增：集中维护的 equipment 种子（足以 ≥2 页、含正常/告警/离线、多种 `equipmentTypeCode` 与 `deviceType`、≥2 部门）。

## 6. 行为缺口（实现时注意，本步不改代码）

1. `getList` 无 `.catch`：请求失败时 `loading` 可能不结束 → 第 3 步最小修复。
2. `total` 只在 `pageNum===1` 更新：翻页后若 total 变化可能陈旧；Mock 保持稳定 total 即可对齐现网行为。
3. 行点击抽屉会打未 Mock 的详情 API → 1A 明确限制，详情留给 1B（实体类型匹配后再接）。
4. `DEMO_OVERVIEW` 现为 `{total:0,alarmCount:0}`；有种子后可与 list 同源计算，避免首页圆盘与列表矛盾。
5. 部门 fixtures 仅 1 个部门且无 `subDivisions`；组合筛选需至少两部门。

## 7. 本轮验收相关 API 白名单（预期）

进入硬件首页闭环时应匹配：

- 已有：登录、user/info、department/list、role/menu、instrumentCategory、equipment/dashboard、logo/未读等壳接口
- **新增必须**：`POST /equipment/sort/list`
- **不应出现**：设备详情/曲线/告警处理、gateway CRUD、导入导出、外部 HTTP

侧栏若展示「记录仪」等子项，点击仍须被 permission 挡回 dashboard（未开放）。
