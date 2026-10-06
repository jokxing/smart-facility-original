import { sendGetRequest, sendPostRequest } from './request.js'

// 登录
export const getWxLogin = (data) => {
	return sendGetRequest({
		url: "/api/wx/app/login",
		data
	})
}

// 获取用户信息
export const getWxUser = (data) => {
	return sendGetRequest({
		url: "/api/wx/mini/user",
		data
	})
}

// 报警记录统计
export const getHistoryThingsAlarmAllApp = (data) => {
	return sendGetRequest({
		url: "/api/history/things/alarm/all/app",
		data
	})
}

// 设备参数和状态统计
export const getInstrumentStatistics  = (data) => {
	return sendGetRequest({
		url: "/api/instrument/mini/statistics",
		data
	})
}

// 数据统计概览
export const getHomeStatistics = (data) => {
	return sendGetRequest({
		url: "/api/instrument/mini/homePage/statistics",
		data
	})
}

// 实验室设备详情信息
export const getInstrumentDetail = (data) => {
	return sendGetRequest({
		url: "/api/instrument/detail",
		data
	})
}

// 查询资产详细信息
export const getInstrumentNewInfoExpandDetail = (data) => {
	return sendGetRequest({
		url: "/api/instrumentNewInfoExpand/details",
		data
	})
}

// 设备管理
export const postInstrumentThingsListApp = (data) => {
	return sendPostRequest({
		url: "/api/instrument/things/list/miniApp/v2",
		data
	})
}

// 查询该仪器已关联智能硬件列表
export const getInstrumentThingsList = (data) => {
	return sendGetRequest({
		url: "/api/instrument/things/list",
		data
	})
}

// 解绑设备与标签的绑定关系
export const getInstrumentUnbind = (data) => {
	return sendGetRequest({
		url: "/api/instrument/unbind",
		data
	})
}

// 设备&房间详情-获取标签列表，包括关闭的探头
export const getMonitorFlag = (data) => {
	return sendGetRequest({
		url: "/api/monitorIndicator/getMonitorFlag",
		data
	})
}

// 智能硬件获取标签列表，不包括绑定的设备和房间的探头记录
export const getDeviceSingleMonitorFlag = (data) => {
	return sendGetRequest({
		url: "/api/monitorIndicator/getDeviceSingleMonitorFlag",
		data
	})
}

// 图表形式获取记录仪日志记录(type类型：1---智能硬件 2---绑设备 3---绑房间)
export const getHistoryDeviceChart = (data) => {
	return sendGetRequest({
		url: "/api/history/device/chart",
		data
	})
}
// 查询监控信息
export const getMonitorInfo = (data) => {
	return sendGetRequest({
		url: "/api/monitorIndicator/monitorInfo",
		data
	})
}


// 报警记录
export const getHistoryThingsAlarmApp = (data) => {
	return sendGetRequest({
		url: "/api/history/things/alarm/app",
		data
	})
}
export const postHistoryAlarmRecordAlarmApp = (data) => {
	return sendPostRequest({
		url: "/api/monitorIndicator/miniAppHistoryAlarmRecord",
		data
	})
}


// 获取报警处理选项
export const getAlarmErrorList = (data) => {
	return sendGetRequest({
		url: "/api/alarm/errorList",
		data
	})
}

// 实验室设备负责人报警设置
export const postThingsUserAlarmSet = (data) => {
	return sendPostRequest({
		url: "/api/thingsUser/alarm/set",
		data
	})
}

// 修改实验室设备报警一键开关
export const postAlarmThingsStatusUpdate = (data) => {
	return sendPostRequest({
		url: "/api/alarm/things/status/update",
		data
	})
}

// 添加预约
export const postInstrumentReservationAdd = (data) => {
	return sendPostRequest({
		url: "/api/instrument/reservation/add",
		data
	})
}

// 修改报警处理
export const postAlarmUpdateProcess = (data) => {
	return sendPostRequest({
		url: "/api/alarm/update/process",
		data
	})
}

// 添加报警处理
export const postAlarmAddProcess = (data) => {
	return sendPostRequest({
		url: "/api/alarm/add/process",
		data
	})
}
export const postExceptionHandle = (data) => {
	return sendPostRequest({
		url: "/api/monitorIndicator/exceptionHandle",
		data
	})
}

// 获取处理报警信息
export const getAlarmProcessInfo = (data) => {
	return sendGetRequest({
		url: "/api/alarm/process/info",
		data
	})
}

// 仪器预约信息列表
export const postInstrumentReservationSchedulerList = (data) => {
	return sendPostRequest({
		url: "/api/instrument/reservation/mini/schedulerList",
		data
	})
}

// 取消预约
export const postInstrumentReservationCancel = (data) => {
	return sendPostRequest({
		url: "/api/instrument/reservation/cancel/" + data,
	})
}

// 预约提醒设置
export const postInstrumentReservationRemind = (data) => {
	return sendPostRequest({
		url: "/api/instrument/reservation/remind",
		data
	})
}

export const postInstrumentReservationUpdate = (data) => {
	return sendPostRequest({
		url: "/api/instrument/reservation/update",
		data
	})
}

// 获取当前登录用户信息
export const getUserInfo = (data) => {
	return sendGetRequest({
		url: "/api/user/info",
		data
	})
}

// 房间统计
export const getRoomStatistics = (data) => {
	return sendGetRequest({
		url: "/api/room/mini/statistics",
		data
	})
}

// 查询房间列表
export const postRoomList = (data) => {
	return sendPostRequest({
		url: "/api/room/things/list/miniApp",
		data
	})
}

export const postRooms = (data) => {
	return sendPostRequest({
		url: "/api/room/list",
		data
	})
}

// 房间详情信息
export const getRoomDetail = (data) => {
	return sendGetRequest({
		url: "/api/room/detail",
		data
	})
}

// 设备/房间绑定智能硬件
export const getThingsList = (data) => {
	return sendGetRequest({
		url: "/api/monitorIndicator/things/newList",
		data
	})
}

// 查询已关联智能硬件列表
export const getRoomThingsList = (data) => {
	return sendGetRequest({
		url: "/api/room/things/list",
		data
	})
}
export const getOpenMonitorFlag = (data) => {
	return sendGetRequest({
		url: "/api/monitorIndicator/getOpenMonitorFlag",
		data
	})
}

// 获取房间巡查报告列表
export const postRoomReportList = (data) => {
	return sendPostRequest({
		url: "/api/roomReport/list",
		data
	})
}

// 模板列表
export const postReportTemplateListNoPage = (data) => {
	return sendPostRequest({
		url: "/api/reportTemplate/listNoPage",
		data
	})
}

// 查询模板及其检查项
export const getReportTemplateObtainItem = (data) => {
	return sendGetRequest({
		url: "/api/reportTemplate/obtain/item",
		data
	})
}

// 申请维护
export const postMaintenanceAdd = (data) => {
	return sendPostRequest({
		url: "/api/maintenance/add",
		data
	})
}

// 新增巡查报告
export const postReportTemplateAddReport = (data) => {
	return sendPostRequest({
		url: "/api/roomReport/addReport",
		data
	})
}

// 查询模板及其检查项
export const getThingsUserAllStatApp = (data) => {
	return sendGetRequest({
		url: "/api/thingsUser/all/stat/app",
		data
	})
}

// 硬件详情信息
export const getDeviceDetail = (data) => {
	return sendGetRequest({
		url: "/api/device/detail",
		data
	})
}

// 硬件详情信息 - 新接口
export const getDeviceDetailApp = (data) => {
	return sendGetRequest({
		url: "/api/device/detail/app",
		data
	})
}

// 硬件详情信息-修改报警设置
export const postEquipmentUserAlarmSetting = (data) => {
	return sendPostRequest({
		url: "/api/equipmentUser/alarmSetting",
		data
	})
}

// 硬件详情信息-平台报警
export const postDeviceCloseAlarmSystem = (data) => {
	return sendPostRequest({
		url: "/api/device/update/closeAlarm/system",
		data
	})
}

// 硬件详情信息-声光报警
export const postDeviceCloseAlarmSoundLight = (data) => {
	return sendPostRequest({
		url: "/api/device/update/closeAlarm/soundLight",
		data
	})
}

// 硬件报警记录
export const getHistoryDeviceAlarmApp = (data) => {
	return sendGetRequest({
		url: "/api/history/device/alarm/app",
		data
	})
}

// 硬件报警记录-PC端
export const getHistoryDeviceAlarm = (data) => {
	return sendGetRequest({
		url: "/api/history/device/alarm",
		data
	})
}

// 扫码
export const getQrCodeInfo = (data) => {
	return sendGetRequest({
		url: "/api/qrCode/info",
		data
	})
}

// 当前枪架已绑定移液枪列表
export const postGunPipetteBindingList = (data) => {
	return sendPostRequest({
		url: "/api/gun/pipette/binding/list",
		data
	})
}

// 取枪
export const postGunTakePipette = (data) => {
	return sendPostRequest({
		url: "/api/gun/take/pipette",
		data
	})
}

// 查询枪是否已经取走
export const getGunTake = (data) => {
	return sendGetRequest({
		url: "/api/gun/take",
		data
	})
}

export const postGunReturnPipette = (data) => {
	return sendPostRequest({
		url: "/api/gun/return/pipette",
		data
	})
}

// 移液枪统计
export const postGunPipetteStatistics = (data) => {
	return sendPostRequest({
		url: "/api/gun/pipette/statistics",
		data
	})
}

// 移液枪列表
export const postGunPipetteList = (data) => {
	return sendPostRequest({
		url: "/api/gun/pipette/list",
		data
	})
}

// 移液枪详情
export const getGunPipetteDetail = (data) => {
	return sendGetRequest({
		url: "/api/gun/pipette/detail",
		data
	})
}

// 未扫码取枪语音提醒设置
export const postDeviceOpenGunRemind = (data) => {
	return sendPostRequest({
		url: "/api/device/openGun/remind",
		data
	})
}

// 标签详情页
export const getLabelDetail = (data) => {
	return sendGetRequest({
		url: "/api/label/detail",
		data
	})
}

// 根据编号或者名称搜索设备
export const getInstrumentBindingList = (data) => {
	return sendGetRequest({
		url: "/api/instrument/bindingList",
		data
	})
}

// 标签绑定设备
export const getInstrumentBinding = (data) => {
	return sendGetRequest({
		url: "/api/instrument/binding",
		data
	})
}

// 标签绑定设备
export const getQrCodeBingding = (data) => {
	return sendGetRequest({
		url: "/api/qrCode/binding",
		data
	})
}

// 消息中心列表
export const getNotifyMessageQuery = (data) => {
	return sendGetRequest({
		url: "/api/notify/message/query",
		data
	})
}

// 消息中心 已读
export const getNotifyMessageRead = (data) => {
	return sendPostRequest({
		url: "/api/notify/message/read/" + data.id
	})
}

// 消息中心 一键已读
export const getMessageRead = (data) => {
	return sendGetRequest({
		url: "/api/message/read",
		data
	})
}

// 消息中心 一键清空
export const getMessageClean = (data) => {
	return sendGetRequest({
		url: "/api/message/clean",
		data
	})
}

// 流程详情
export const postProcessOrderDetails = (data) => {
	return sendGetRequest({
		url: "/api/activiti/processOrderHistory/details",
		data
	})
}
// 流程转办
export const postTransferTask = (data) => {
	return sendPostRequest({
		url: "/api/activiti/task/transfer",
		data
	})
}

// 流程驳回
export const postTerminateTask = (data) => {
	return sendPostRequest({
		url: "/api/activiti/task/terminate",
		data
	})
}
// 流程同意进入下一步
export const postActivitiTransferTask = (data) => {
	return sendPostRequest({
		url: "/api/activiti/task/complete",
		data
	})
}

// 分页查询安装确认资产信息
export const getQueryAssetInformation = (data) => {
	return sendGetRequest({
		url: "/api/activiti/processOrderHistory/details/queryAssetInformation",
		data
	})
}

// 成员列表
export const getUserList = (data) => {
	return sendGetRequest({
		url: "/api/user/list",
		data
	})
}

// 获取oss信息
export const getOssPolicy = (data) => {
	return sendGetRequest({
		url: "/api/file/policy",
		data
	})
}

// 个人待办事项列表
export const getActivitiTaskList = (data) => {
	return sendPostRequest({
		url: "/api/activiti/task/queryAgenda",
		data
	})
}

// 待办事项个人任务信息列表
export const getActivitiTaskQuery = (data) => {
	return sendGetRequest({
		url: "/api/activiti/task/query",
		data
	})
}

// 资产报警信息
export const getPropertyReport = (data) => {
	return sendGetRequest({
		url: "/api/property/report",
		data
	})
}

// 未读标识
export const getActivitiUnread = (data) => {
	return sendGetRequest({
		url: "/api/activiti/unread",
		data
	})
}

// 首页搜索
export const postInstrumentSearch = (data) => {
	return sendPostRequest({
		url: "/api/instrument/search",
		data
	})
}

// 查询资产盘点
export const getPropertyNumStatistics = (data) => {
	return sendGetRequest({
		url: "/api/property/numStatistics",
		data
	})
}
//多语言
export const getLang = (data) => {
	return sendGetRequest({
		url: "/api/user/language",
		data
	})
}
// 移动资产列表
export const postPropertyMovePropertyList = (data) => {
	return sendPostRequest({
		url: "/api/property/move/propertyList",
		data
	})
}

// 运单首页
export const getTransportOrderDashboard = (data) => {
	return sendGetRequest({
		url: "/api/transportOrder/dashboard/wx",
		data
	})
}
// 打印运单数据
export const getTransportOrderPrint = (data) => {
    return sendGetRequest({
		url:"/api/transportOrder/print/stream", 
		data
	})
}
// 打印预览/transportOrder/print/
export const getTransportOrderPrintView = (data) => {
    return sendGetRequest({
		url:"/api/transportOrder/print/new/" + data.orderId,
		data: {
			historyTimeInterval: data.historyTimeInterval
		}
	})
}
// 打印预览/transportOrder/print/
export const getTransportOrderGetStateInfo = (data) => {
    return sendGetRequest({
		url:"/api/transportOrder/change/getStateInfo",
		data
	})
}
// 运单列表
export const postTransportOrderQuery = (data) => {
	return sendPostRequest({
		url: "/api/transportOrder/list/wx",
		data
	})
}
export const changeTransportOrderState = (data) => {
	return sendPostRequest({
		url: "/api/transportOrder/change/state",
		data
	})
}
// 运单列表
export const postTransportOrderDetail = (data) => {
	return sendGetRequest({
		url: "/api/transportOrder/detail/wx/" + data.id
	})
}
export const postDemoTransportReset = () => {
	return sendPostRequest({
		url: "/api/demo/transport/reset",
		data: {}
	})
}
// 修改历史流程单详情信息
export const postActivitiProcessOrderUpdate = (data) => {
	return sendPostRequest({
		url: "/api/activiti/processOrder/update",
		data
	})
}

/**  查询异动未读条数 **/
export const getPropertyNoReadCount = (data) => {
    return sendGetRequest({
		url:"/api/property/unusualMsg/noReadCount", 
		data
	})
}

/** 查询异动消息列表 **/
export const getPropertyUnusualMsg = (data) => {
    return sendPostRequest({
		url:"/api/property/unusualMsg",
		data
    })
}
/** 查询异动消息列表 **/
export const getPropertyUnusualMsgRead = (data) => {
    return sendPostRequest({
		url:"/api/property/unusualMsg/read",
		data
    })
}
// 位置调整所属房间列表
export const getRoomPositionRoomList = (data) => {
    return sendGetRequest({
		url:"/api/room/positionRoom/list", 
		data
	})
}
/** 异动忽略消息**/
export const postPropertyUnusualMsgIgnore = (data) => {
    return sendPostRequest({
		url:"/api/property/unusualMsg/ignore",
		data
    })
}
/** 异动忽略消息**/
export const postPropertyPositionChange = (data) => {
    return sendPostRequest({
		url:"/api/property/positionChange",
		data
    })
}

/** 查询预约人信息-用于日历控件回显**/
export const postInstrumentReservationSchedulerListV1 = (data) => {
    return sendPostRequest({
		url:"/api/instrument/reservation/schedulerListV1",
		data
    })
}

// 查询所有园区数据
export const getMapGarden = (data) => {
    return sendGetRequest({
		url:"/api/map/garden", 
		data
	})
}

// 设备类型
export const getInstrumentType = (data) => {
    return sendGetRequest({
		url:"/api/instrumentCategoryInfo/superior/cat", 
		data
	})
}

// 查询房间  
export const getRoomTree = (data) => {
    return sendPostRequest({
		url:"/api/room/tree", 
		data
	})
}

// 查询部门
export function getDepartment(data) {
  return sendGetRequest({
	  url:"/api/department/list",
	   data
  });
}

// 查询关联智能硬件
export const getEquipmentBindEquipmentType = data => {
  return sendGetRequest({
	  url:"/api/equipment/bindEquipmentType", data
  });
};

