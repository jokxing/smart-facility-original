# 楼宇、地图与布局

本模块将业务实体、底图和布局分开：园区/楼宇/楼层/房间/设备表达业务归属；底图表达空间；布局只记录实体在图中的位置和变换。本文描述当前本地演示，原项目背景见 [仓库首页](../README.md)。

## 操作入口

- 楼宇进入楼层预览 `/floor/view`，点击房间标记，在点击点附近打开操作卡；可查看详情或进入该房间。
- 楼层配置 `/floor/designer`：候选房间拖入或点击放置，移动、移除、撤销、保存。
- 房间预览 `/room/view`，配置 `/room/designer`：设备放置、移动、缩放和旋转。
- 房间管理 `/rm/room`：新增/编辑/删除房间及上传房间底图。
- 地图设置 `/ms/mapSet`：楼层新增/编辑、底图预览和配置入口。无底图时不借用其他房间的图片。

底图不带业务文字；名称、设备标记和状态由数据动态绘制。内置 SVG 使用登记键，新上传仅支持 PNG/JPEG，文件存入本地 IndexedDB。替换底图不会自动迁移或清除既有坐标。

## 数据与保存

楼层房间布局使用 `type:11`，设备布局使用 `type:4`，由同一 `/map/element/config` 接口分流，不能混合提交。

```json
{"type":11,"floorId":930001,"mediaId":940001,"list":[{"type":11,"elementId":950001,"mediaId":940001,"x":400,"y":200}]}
```

```json
{"type":4,"roomId":950001,"list":[]}
```

保存为完整快照，部分布局和空列表都有效。未保存过时读取种子布局；保存空列表后保持空态，不回退种子。名称、分类及状态读取最新业务数据，不在布局中复制一套档案。

校验楼层/房间归属、对象类型、重复或未知 ID、有限坐标、缩放和边界；非法提交整次拒绝，保存失败保留草稿。楼层房间使用 1678×795 基准坐标，标记框 180×40；显示比例不持久化。房间设备使用既有中心点及变换约定，新增房间按底图几何适配，校验与显示共用几何。

## 关联约束与交互

| 操作 | 结果 |
| --- | --- |
| 从地图移除 | 仅移除布局，实体回候选列表，档案仍存在 |
| 改名或改分类 | 读侧合并最新信息，不重建底图 |
| 设备换房间 / 房间换楼层 | 清除旧位置，到新空间重新放置；移回不会复活旧坐标 |
| 删除设备 | 先检查硬件绑定，成功后清理布局 |
| 删除房间 | 有关联设备或硬件时拒绝，允许删除时清理布局 |

选中框右上角圆形 × 移除布局，拖动期间隐藏移除图标。撤销恢复进入时快照；未保存离开先确认。保存成功返回预览，配置层及时离场。

## 3D 页面生命周期

Three.js 楼宇加载使用页面存活标记及请求标识，迟到的模型回调不会挂载到已退出页面。退出时取消动画帧并释放控制器、几何体、材质、纹理及渲染器。

## 代码与验证

- [Building.vue](../smart-facility-platform/src/views/building/Building.vue)：模型加载和资源释放。
- [DemoFloorDesigner.vue](../smart-facility-platform/src/views/floorConfiguar/components/DemoFloorDesigner.vue)：房间布局草稿。
- [设备 Designer.vue](../smart-facility-platform/src/views/roomConfiguar/components/Designer.vue)：设备画布交互。
- [floorRoomLayout.js](../smart-facility-platform/src/mock/fixtures/floorRoomLayout.js)：楼层快照及校验。
- [地图布局测试](../smart-facility-platform/tests/unit/demo/map-m4.spec.js)、[设备联动测试](../smart-facility-platform/tests/unit/demo/map-m5.spec.js)、[媒体测试](../smart-facility-platform/tests/unit/demo/map-png.spec.js)。

已有浏览器记录覆盖画布鼠标移动、保存刷新及退出确认；候选拖入部分通过 DragEvent/DataTransfer 派发验证。未完成完整触屏、多分辨率、多标签并发编辑及任意尺寸图片坐标自动迁移验收。
