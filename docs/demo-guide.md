# 本地演示：含房间设备布局配置（8C）

当前已完成到任务 **8C**：一层实验室平面 + 房间设备布局只读预览与拖放保存 + 共享场景切换 + 双大屏 + 告警排行 + 楼层设计器只读。开放：`/login`、`/dashboard`、`/building`、`/floor/view`、`/floor/designer`、`/room/view`、`/room/designer`、`/floorDataV`、`/roomDataV`。

## 启动

```powershell
npm run demo
```

端口以终端为准（常见 8088 / 8091）。账号：`demo` / `Demo1234` / `2468`。

## 路径

登录 → 楼宇 → 1F → **查看设备布局** → **进入配置** → 拖动已上图设备 → **保存配置** → 自动回到房间预览（位置保留）。  
设计器内 **重置布局** 可恢复种子坐标。  
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
| 持久化 | `smart-facility-demo:v1:roomLayoutOverrides` |
| 楼层房间标记写 / 侧栏仪器列表 | 仍拒绝或跳过 |

## 复测

```powershell
npm run test:demo -- --watch=false
# 9 文件 / 42 用例

$env:DEMO_PORT = '8091'   # 以实际端口为准
npm run test:demo:browser
```

下一项见 `docs/next-task-prompt.md`（待用户指定）。

## 房间布局缓存升级（P1 修复）

设备坐标改为中心坐标，图标保持 128×144 原始比例；底图等比显示。旧版布局缓存不能直接沿用，会显示默认布局，请重新调整并保存。新版 version:2 缓存支持刷新恢复；非法或损坏布局回退默认值。设备完整边界必须在房间内，缩放范围 0.2–3；无效拖动/变换回到操作前的位置。
