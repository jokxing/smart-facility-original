# 中控地图 M2 —— SaaS 楼层/房间实体与本地底图

核对日期：2026-10-02。接通楼层新增/编辑与房间新增/编辑/单删；底图本地持久化。不开放楼宇增删、楼层删除、房间批量、M3 读侧同步、M4 标记拖拽。

## 开放入口

| 入口 | 路径 | 演示 |
| --- | --- | --- |
| 地图设置（最小） | `/ms/mapSet` | **开放**：仅浏览园区/楼宇树；楼层列表；楼层新增/编辑底图。隐藏园区/楼宇增删改、楼层删除、房间绑定/解绑 |
| 房间管理 | `/rm/room` | **开放**：新增、行内编辑、单删。批量/导入仍隐藏 |

## 接口与字段

| 操作 | 方法 | 字段 |
| --- | --- | --- |
| 楼层列表 | `GET /map/floor?buildingId` | `id,name,mapId,mapUrl,uid,buildingId,buildingName,gardenName` |
| 楼层新增 | `POST /map/floor` | `name, buildingId, media:{url,uid}`；`media.url` 为媒体键或内置 key |
| 楼层编辑 | `PUT /map/floor` | 同上 + `id`；无新图时保留原 `mapUrl` |
| 房间新增 | `POST /room/add` | `name,no,departmentId,floorId,buildingId,remark,mapUrl?` |
| 房间编辑 | `POST /room/update/basic` | 同上 + `id`；改楼层不得跨楼宇且房间有设备/硬件时拒绝 |
| 房间单删 | `POST /room/remove/:id` | 有仪器/硬件/布局设备拒绝；空房间删除并清布局索引 |

## 实体 ID

| 实体 | 种子 | 新建池 |
| --- | --- | --- |
| 楼层 | `930001–930103` 等 | `931201–931250`；`mapId` `941201–941250` |
| 房间 | `950001–950003` | `950201–950250` |
| 媒体键 | 内置 `demo-floor-a-1f` / `demo-room-a/b` | `demo-media-*`（IndexedDB Blob） |

楼宇仍用共享 `DEMO_SPACE`（`920001` 等），本轮不新增。

## 底图上传与显示

1. 本地选 PNG/JPEG（≤5MB，边长 ≤8192）；**不支持新上传 SVG**（内置 SVG 登记键保留）。
2. Blob 写入 IndexedDB（`smart-facility-demo-media`）；元数据 `media.url`/`mapUrl` 存媒体键；会话内 object URL 缓存，刷新后 hydrate。
3. **禁止**把 blob: URL 或整图写入 localStorage。
4. 读侧：`resolveFloorMapUrl` / `resolveRoomMapUrl*` 先查内置登记，再查媒体缓存；缺图返回 null（页面空态/占位），不串用其他实体底图。
5. 编辑无新文件：保留原图。对话框关闭重置表单，不泄漏上一实体。
6. 替换底图：若该楼层/房间已有布局标记，提示「替换底图不会自动迁移或清除布局」；**不**自动清布局、不迁坐标。

## 校验与拒绝

- 未登录 / 错误 `buildingId`/`floorId` / 楼层名或房间编号冲突 → 明确失败。
- 楼层新增缺图 → 拒绝。
- 有关联设备/硬件的房间改跨楼宇或删除 → 拒绝。
- 楼层删除 API 演示仍拒绝（UI 隐藏）。

## 非本轮

M3 中控读侧同步、候选待放置列表；M4 拖拽保存；CreateRoom（地图绑定）写路径；楼宇 CRUD。
