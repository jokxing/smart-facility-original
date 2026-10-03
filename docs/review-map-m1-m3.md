# M1–M3 复盘（2026-10-03）

本批实现工具栏分组、楼层/房间基本管理、本地底图存储、地图读取共享实体。M4 的标记跳转、拖拽移除及布局保存尚未完成。

## 修复及依据

- `smart-facility-platform/src/utils/demoMediaStore.js`：媒体键须对应实际 IndexedDB 图片；打开失败可重试，写事务中止返回失败。
- `smart-facility-platform/src/mock/handlers/map.js`、`src/mock/handlers/room.js`：新增/编辑校验媒体存在；保存遇到存储异常返回失败。
- `smart-facility-platform/src/mock/fixtures/room.js`：现有房间读取共享楼层名称，改名后列表及详情同步。
- `smart-facility-platform/src/views/mapSettings/components/CreateFloor.vue`、`src/views/room/components/Create.vue`：仅 code=1 判定成功；请求异常提示失败。楼层上传 5 MB 限制仅用于演示模式。
- `smart-facility-platform/tests/unit/demo/map-m2.spec.js`：增加缺失图片、楼层改名、存储失败回归。

## 验证

独立运行 `npm run test:demo -- --watch=false --silent`：48 套、242 项通过（包含新房间底图适配回归）。

此前复盘未重跑浏览器，M2 旧脚本仅使用内置底图键。现已通过 `scripts/check-demo-map-png.cjs` 补验：由原稿同尺寸导出的 PNG 通过实际上传组件存入 IndexedDB，新增楼层/房间后刷新进入中控预览，持久键解析为新 blob URL、图片解码成功；新房间画布底图尺寸大于零。检查截图确认底图可见。外部请求次数为 0，证据在 `docs/evidence/map-png/`。测试通过浏览器构造 File 调用上传组件，未自动操作系统文件选择窗口；未覆盖 JPEG 或全部尺寸边界。

补验发现并修复新建房间底图零尺寸：原几何仅支持种子房间，现 `roomBackgroundFrame` 对新房间按图片宽高等比居中，预览和设计器共用，原种子设备坐标保持不变。PNG 素材保留 SVG 原稿，默认登记键继续读 SVG。

未安装依赖、运行生产部署、提交或推送 Git；未处理用户新出现的 `miniprogram/`。

## 下一步

M1–M3 及 PNG 上传补验已完成。下一步由当前 AI 实施 M4：房间标记进入对应房间、明确详情按钮、拖拽和移除回候选列表、保存与取消。设备布局联动等在 M4 完成后安排。
