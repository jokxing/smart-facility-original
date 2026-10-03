# 中控地图 M3 —— SaaS 与中控读侧同步（含 M4 交接）

核对日期：2026-10-03。基于 M2 共享实体，接通楼层列表/切换、底图预览与配置候选房间。不实现拖拽、移除、保存（M4）。

## 开放读侧

| 入口 | 路径 | 演示 |
| --- | --- | --- |
| 楼宇 | `/building` | 楼层按钮来自 `GET /map/building`（含 `floorCreated`/`floorMeta`）；有 `mapUrl` 可进预览 |
| 楼层预览 | `/floor/view` | `GET /map/floor/overview`：底图/名称以 overview 为准；`labList` **仅已布局**房间 |
| 楼层配置 | `/floor/designer` | 已布局 = overview；候选 = `POST /room/list`（仅 `floorId+page*`）返回**未布局**房间。保存按钮仍禁用 |

## 实体 vs 布局

| 概念 | 来源 | 说明 |
| --- | --- | --- |
| 业务归属 | `room.floorId`（seed / `roomCreated` / `roomMeta`） | 房间属于哪一层 |
| 已布局 | overview `labList` 有效坐标 | 种子 `DEMO_FLOOR_ROOMS` 或 meta/`room` 上的 `x/y`（非 sentinel） |
| 未布局 | designer `/room/list` | 该层业务房间且无有效布局坐标；**不**自动布点 |

sentinel：`x/y ≤ -1000`（历史 `-9999`）视为未布局，不得出现在预览标记中。

## 接口语义（M3）

| 操作 | 方法 | 读侧约定 |
| --- | --- | --- |
| 楼宇楼层 | `GET /map/building` | `subDivisions` = `listFloorsByBuildingId`（含新建楼层与 mapUrl） |
| 楼层概览 | `GET /map/floor/overview?floorId` | `labList` 仅已布局；附带 `floorId,floorName,mapId,mapUrl` |
| 候选房间 | `POST /room/list` `{floorId,pageNum,pageSize}`（无 gardenId 等管理筛选项） | 仅未布局；字段含 `id,name,no,floorId,mapUrl?` |
| 房间管理列表 | 同 URL，带 `gardenId` 等 | 仍返回该层全部业务房间（含已布局） |

名称/底图编辑后：building / overview / list / 大屏树投影均走同一 overlay，刷新仍一致。空房间删除后 overview 与候选均无残留；有关联拒删（M2）。

## 给 M4 的交接

### 未布局列表

- 来源：designer `POST /room/list`（上表）；stable `roomId`。
- UI 可展示名称；**不得**在 M3/M4 未真正保存前显示「已保存」。

### 已布局结构

```
labList[]: { id, name, x, y, width, fontSize, color, scaleX, scaleY, senorStatus, equipments[], isEdit, openTwoSystem? }
```

### 坐标系

- 底图像素空间；楼层预览设计基准约 **1678×795**（与 `floorConfiguar` Konva 一致）。
- 种子坐标对齐 `public/demo/floors/floor-a-1f.svg`（`demo-floor-a-1f`）。
- UI `ratio` 仅影响显示；持久化应存未缩放坐标（M4 核实 Designer 回写后再钉死）。

### 保存边界（M4 实现，本轮不开放）

- 前端意图：`POST /map/element/config`，房间标记 historically `type:11` + `elementId=roomId` + `mediaId=mapId` + `x/y/...`。
- 现状 Mock 将该 URL 绑到**房间内设备布局**（`pctLeft/pctTop`），楼层 `type:11` **明确拒绝**。
- M4：须区分 schema 或独立 storage key（如 `floorRoomLayout`）；**禁止**与 `saveRoomInstrumentLayout` 混用字段；demo 未接通前禁止假成功。

### 删除 / 换楼层

- 空房间删除：清业务行 + 布局索引（设备布局 reset）；M4 另清楼层标记 overlay。
- 换归属楼层：旧层标记不得残留；新层默认未布局（进候选），不自动迁移坐标。
- 替换底图：提示不自动迁坐标（M2）；M4 不因换图清标记 unless 产品另定。

## 非本轮

拖拽/移除/保存；楼宇 CRUD；楼层删除；房间批量；设备联动 M5。
