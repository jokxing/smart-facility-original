# 小程序 MP5 告警 / 负责人 / 消息待办契约

日期：2026-10-06。范围：告警列表与处理、负责人范围、消息已读清空、待办红点。不含移液枪、资产异动写、BPM 审批。

## 类型映射（禁止混用）

| 场景 | 字段 | 设备 | 房间 |
| --- | --- | --- | --- |
| 监测/详情告警 Tab | `objType` | 2 | 3 |
| 我的任务 / 我的统计 | `type` / `thingsType` | 4 | 3（Web 房间历史为 11，小程序归一为 3） |
| 通知开关 | `thingsType` | 4 | 11（页面原值，仅本地开关） |

处理记录是人工确认，**不**改变 970008 / 房间 B 的参数报警种子。

## 事件

| ID | 来源 | 说明 |
| --- | --- | --- |
| 960001–960005 | Web 仪器历史样例 | 已结束；默认未处理 |
| 961001–961006 | Web 房间历史样例 | 已结束；默认未处理 |
| **990008** | 小程序当前演示事件 | 970008 温度 45.2℃，持续中，待处理 |

负责人默认 `900001 演示用户`（可本地改 `responsible`）。我的负责设备/房间 = 当前用户为负责人的实体。待办 `waitHandleNum` 仅统计 **990008 类 live 未处理** 事件。

## 开放接口

| 方法 | 路径 | 包装 |
| --- | --- | --- |
| POST | `/api/monitorIndicator/miniAppHistoryAlarmRecord` | `{list:[{alarmStat,alarmInfo}],total,pageNum,pageSize}` |
| GET | `/api/history/things/alarm/app` | 同上；`isHead=1` 限负责人 |
| GET | `/api/alarm/errorList` | `{list:[{id,name}]}` 误报/维护/环境波动 |
| POST | `/api/monitorIndicator/exceptionHandle`、`/api/alarm/add/process` | 提交处理；已处理/未知/越权失败 |
| POST | `/api/alarm/update/process` | 修改处理意见 |
| GET | `/api/alarm/process/info` | 回显处理字段 |
| GET | `/api/thingsUser/all/stat/app` | 负责数量 + `statList` + `waitHandleNum` + 预约统计 |
| GET | `/api/user/list` | 脱敏人员 900001–900003 |
| GET | `/api/notify/message/query` | `{list,total,statisticalVO}`；`types` 0 告警 |
| POST | `/api/notify/message/read/{id}` | 单条已读 |
| GET | `/api/message/read`、`/api/message/clean` | 按 type 已读/清空消息，**不删告警** |
| POST | `/api/activiti/task/queryAgenda` | live 未处理待办 |
| GET | `/api/activiti/task/query` | `taskStatus=1` 已处理告警任务 |
| GET | `/api/activiti/unread` | `notifyUnread` / `activitiUnread` 由实际数据计算 |
| POST | `/api/thingsUser/alarm/set`、`/api/alarm/things/status/update` | 仅本地偏好，文案标明不发通知 |

资产异动列表空；异动处理/审批 complete/transfer **明确未开放**。

## 存储（退出保留）

`alarmHandles`、`alarmMessages`、`responsible`、`alarmFlags`。会话键仍随退出清除。

## 未开放

移液枪、资产异动处理、安装确认/盘点流程、真实推送、硬件声光。
