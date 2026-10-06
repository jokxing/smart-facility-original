# 小程序 MP4 设备预约契约

日期：2026-10-05。范围：设备详情日历新增、我的预约分页/状态筛选、修改、取消、提醒偏好、我的页预约统计。不含告警处理、移液枪。

## 时间与状态

- 判断用**当前实际时钟**（测试可注入），按 **Asia/Shanghai** 解析/存储 `YYYY-MM-DD HH:mm:ss`。不用监测曲线的固定演示日期。
- 区间 `[start, end)`：同设备有效预约重叠拒绝；结束等于下一开始允许；不同设备可同时段。
- 动态状态：`0` 未开始、`1` 使用中、`2` 已结束、`3` 已取消。不以种子写死未来状态。
- 新建：开始必须晚于现在，结束必须晚于开始且晚于现在。
- 修改：进行中只改结束时间、开始必须与原记录相同；已结束/已取消不能改；修改排除自身再查冲突。
- 取消：保留历史并释放时段；重复取消拒绝；已结束不能取消（比 Web 更严，Web 可将已结束标为取消）。他人记录不能改/不能取消。用户身份取自会话，忽略请求里的 userId/userName。

## 仓库与存储

| 键 | 说明 |
| --- | --- |
| `sf-mini-demo:reservations` | JSON 数组，业务键；**退出登录不清** |
| `sf-mini-demo:reservationRemind` | 本地提醒偏好数字；退出不清 |

默认无样例预约（空态合理）。记录仅由创建产生。退出只清会话键；再次登录后预约仍在。演示全量重置才走 `clearDemoStorage`。

同一仓库驱动：日历 `schedulerListV1`、我的预约 `mini/schedulerList`、我的页 `reservationStatistics`。

## 开放接口

| 方法 | 路径 | 包装 |
| --- | --- | --- |
| POST | `/api/instrument/reservation/add` | 成功 `items` 为记录；用户/设备名由会话与设备种子填充 |
| POST | `/api/instrument/reservation/update` | **新增适配**。body：`{id,timeFrom,timeTo,remark?}`，仪器取自原记录 |
| POST | `/api/instrument/reservation/schedulerListV1` | **数组**（日历）。按设备 + 日期窗，不含已取消。未知设备 code=0 |
| POST | `/api/instrument/reservation/mini/schedulerList` | `{remind,pageData:{list,total,pageNum,pageSize}}`，仅当前用户；`status` 10/缺省=全部 |
| POST | `/api/instrument/reservation/cancel/{id}` | 路径带 id，无 body |
| POST | `/api/instrument/reservation/remind` | 保存偏好；message 标明演示不发送通知 |
| GET | `/api/thingsUser/all/stat/app` | `reservationStatistics.{noStartNum,inUseNum,closedNum}`，`closedNum` 仅已结束不含取消 |

提交防抖：400ms 内同一 add/update/cancel 键返回「请勿重复提交」。页面另有 submitting 锁。

分页：默认 10，上限 50，越界 `list=[]` 且 total 不变。

## 页面

- 设备详情「预约申请」打开 `TimeSelect` 日历，不再弹出「功能尚未开放」。
- 我的预约：状态筛选、修改入口（弹层，走 update）、未开始/进行中可取消、提醒文案为本地偏好。

## 未开放

告警处理、维保/资产流程、移液枪、真实微信推送。
