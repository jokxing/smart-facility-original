/*------------实验室设备接口合集------------*/
/*-------------post请求第三个参数为请求头配置，不传默认为 application/x-www-form-urlencoded--------------*/
import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";

/*-------------获取实验室设备列表--------------*/
export const postInstrumentList = params => {
  return post("/instrument/list", params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------删除实验室设备列表--------------*/
export const getInstrumentRemove = (params, id) => {
  return post(`/instrument/remove/${id}`, params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------新增实验室设备列表--------------*/
export const getInstrumentAdd = params => {
  return post("/instrument/add", params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------修改实验室设备列表--------------*/
export const getInstrumentUpdate = params => {
  return post("/instrument/update/basic", params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------修改实验室设备详情--------------*/
export const getInstrumentDetail = params => {
  return get("/instrument/detail", params);
};

/*------------获取绑定设备列表--------------*/
export const getInstrumentThingsList = params => {
  return get("/instrument/things/list", params);
};

/*------------获取预约信息列表--------------*/
export const getInstrumentReservationSchedulerList = params => {
  return post("/instrument/reservation/schedulerList", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------查询预约人信息-用于日历控件回显--------------*/
export const getInstrumentReservationSchedulerListV1 = params => {
  return post("/instrument/reservation/schedulerListV1", params, {
    headers: { "content-type": "application/json" }
  });
};

/*----------------添加预约----------------*/
export const getInstrumentReservationAdd = (params, id) => {
  return post("/instrument/reservation/add", params, {
    headers: { "content-type": "application/json" }
  });
};

/*----------------取消预约----------------*/
export const getInstrumentReservationCancle = (params, id) => {
  return post(`/instrument/reservation/cancel/${id}`, params, {
    headers: { "content-type": "application/json" }
  });
};

/*----------------修改预约----------------*/
export const getInstrumentReservationUpdate = params => {
  return post(`/instrument/reservation/update`, params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------获取维保信息列表--------------*/
export const postMaintenanceList = params => {
  return post("/maintenance/list", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------申请维保--------------*/
export const postMaintenanceAdd = params => {
  return post("/maintenance/add", params, {
    headers: { "content-type": "application/json" }
  });
};

/*-----------设置下一次的维保时间--------------*/
export const postMaintenanceUpdateMaintenance = params => {
  return post("/maintenance/updateMaintenance", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------获取维保核查确认--------------*/
export const getMaintenanceComplete = params => {
  return get("/maintenance/complete", params);
};

/*------------获取管理员列表--------------*/
export const getinstrumentUserList = params => {
  return get("/instrumentUser/list", params);
};

/*------------获取可绑定的智能硬件列表--------------*/
export const postInstrumentThingsPreLink = params => {
  return post("/instrument/things/preLink", params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------智能硬件解绑--------------*/
export const postInstrumentThingsRemove = params => {
  return post("/instrument/things/remove", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------智能硬件绑定--------------*/
export const getInstrumentThingsAdd = params => {
  return post("/instrument/things/add", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------获取实验室设备统计信息--------------*/
export const getinstrumentDashnoard = params => {
  return get("/instrument/dashboard", params);
};
/*------------获取各个状态占比--------------*/
export const getinstrumentStatistics = params => {
  return get("/instrument/instrumentStatistics", params);
};
/*------------实验室设备异常统计--------------*/
export const getinstrumentAlarmStatistics = params => {
  return get("/instrument/alarmStatistics", params);
};

/*------------用电量统计--------------*/
export const postSmartSocketElectricityConsumption = params => {
  return post("/smartSocket/electricityConsumption", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------使用次数统计--------------*/
export const postSmartSocketUsageDuration = params => {
  return post("/smartSocket/usageDuration", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------使用时长统计--------------*/
export const postSmartSocketUsageTimes = params => {
  return post("/smartSocket/usageTimes", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------使用智能插座使用状态--------------*/
export const postSmartSocketElectricityStatistics = params => {
  return post("/smartSocket/electricityStatistics", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------智能插座自定义范围的使用状态--------------*/
export const postSmartSocketelectricityCustom = params => {
  return post("/smartSocket/electricityCustom", params, {
    headers: { "content-type": "application/json" }
  });
};




/*------------查询单个设备最近一个月的报警离线情况--------------*/
export const postInstrumentDeviceErrorStatistics = params => {
  return post("/instrument/deviceErrorStatistics", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------查询行政物品列表--------------*/
export const postInstrumentAdministrationList = params => {
  return post("/instrument/administrationList", params, {
    headers: { "content-type": "application/json" }
  });
};
/*------------查询行政设备统计--------------*/
export const postInstrumentAdministrationDashboard = params => {
  return get("/instrument/administrationDashboard", params);
};

/*------------批量更新设备--------------*/
export const postInstrumentBatchUpdate = params => {
  return post("/instrument/batch/update", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------批量删除设备--------------*/
export const postInstrumentBatchDelete = params => {
  return post("/instrument/batch/delete", params, {
    headers: { "content-type": "application/json" }
  });
};

/*------------导出设备列表--------------*/
export const postUserExport = data => {
  return post("/instrument/export", data, {
    headers: { "content-type": "application/json" },
    responseType: "blob",
    timeout: 100000
  });
};
export const postMonitorHistoryAlarmExport = data => {
  return post("/monitorIndicator/historyAlarmExport", data, {
    headers: { "content-type": "application/json" },
    responseType: "blob",
    timeout: 100000
  });
};

/*-------- 设备绑定的历史数据查询 -------*/
export const postInstrumentBindingEquipmentHistroy = params => {
  return post("/instrument/binding/equipment/histroy", params, {
    headers: { "content-type": "application/json" },
  });
};

/*-------- 导出绑定设备的硬件的汇报历史数据 -------*/
export const postInstrumentExportHistory = data => {
  return post("/instrument/export/history", data, {
    headers: { "content-type": "application/json" },
    responseType: "blob"
  });
};

/*-------- 别名列表 -------*/
export const getEquipmentSensorAliasList = params => {
  return get("/equipment/sensor/alias/list", params);
};
/*-------- 修改别名 -------*/
export const postEquipmentSensorAliasUpdate = data => {
  return post("/equipment/sensor/alias/update", data, {
    headers: { "content-type": "application/json" },
  });
};

// 设备查询被绑定的历史数据
export const postInstrumentBindingHistory = data => {
  return post("/instrument/binding/equipment/history", data, {
    headers: { "content-type": "application/json" },
  });
};

/*-------- 解绑设备与标签的绑定关系 -------*/
export const getInstrumentUnbind = params => {
  return get("/instrument/unbind", params);
};

// 设备使用统计
export const getStatisticEquipmentUse = params => {
  return get("/statistic/equipment/use", params);
};
// 设备使用导出
export function postStatisticEquipmentUsePort(data) {
  return request({
    url: "/statistic/equipment/use/port",
    data,
    method: "POST",
    responseType: "blob"
  })
}
// 查询设备功耗'
export const getSmartSocketGetStandbyParams = params => {
  return get("smartSocket/getStandbyParams/" + params.id);
};


// 数据权限设备列表
export const postDataAuthInstrumentList = data => {
  return post("/instrument/dataAuth/instrumentList", data, {
    headers: { "content-type": "application/json" },
  });
};
// 增加分类
export const postInstrumentCategoryInfoAdd = data => {
  return post("/instrumentCategoryInfo/add", data, {
    headers: { "content-type": "application/json" },
  });
};
// 删除分类
export const postInstrumentCategoryInfoDelete = data => {
  return post("/instrumentCategoryInfo/delete", data, {
    headers: { "content-type": "application/json" },
  });
};
// 分类列表
export const getInstrumentCategoryInfoList = params => {
  return get("/instrumentCategoryInfo/superior/cat", params);
};
// 编辑分类
export const postInstrumentCategoryInfoUpdate = data => {
  return post("/instrumentCategoryInfo/update", data, {
    headers: { "content-type": "application/json" },
  });
};
// 导出分类
export function postInstrumentCategoryInfoExport(data) {
  return request({
    url: "/instrumentCategoryInfo/export",
    data,
    method: "GET",
    responseType: "blob"
  })
}
// 分类名称校验、编码校验
export const getInstrumentCategoryInfoValid = params => {
  return get("/instrumentCategoryInfo/valid", params);
};
// 分类名称校验、编码校验
export const getInstrumentDashboardNew = params => {
  return get("/instrument/dashboard/new", params);
};
// 修改顺序
export const postInstrumentCategoryInfoUpdateSort = data => {
  return post("/instrumentCategoryInfo/updateSort", data, {
    headers: { "content-type": "application/json" },
  });
};
// 筛选结果使用率统计
export const postInstrumentFiltrateStatistics = data => {
  return post("/instrument/filtrate/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 筛选结果综合利用率分级统计
export const postInstrumentClassificationStatistics = data => {
  return post("/instrument/classification/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 当前参数监测统计
export const postInstrumentParameterStatistics = data => {
  return post("/instrument/parameter/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 使用率统计
export const postInstrumentUseRateStatistics = data => {
  return post("/instrument/useRate/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 新版-时段综合使用率统计
export const postInstrumentTimeIntervalStatistics = data => {
  return post("/statistic/instrument/timeIntervalCount", data, {
    headers: { "content-type": "application/json" },
  });
};
// 新版-日使用率趋势统计
export const postInstrumentUseDayCountStatistics = data => {
  return post("/statistic/instrument/useDayCount", data, {
    headers: { "content-type": "application/json" },
  });
};
// 新版-设备使用状态统计
export const postInstrumentUseCountStatistics = data => {
  return post("/statistic/instrument/useCount", data, {
    headers: { "content-type": "application/json" },
  });
};
// 使用率统计V3负责人
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/useRateV5UsingPOST
export const queryUseRateV3ManagerStatistics = data => {
  return post("/instrument/useRateV3/manager/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 使用率统计V3部门
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/useRateV4UsingPOST
export const queryUseRateV3DepartmentStatistics = data => {
  return post("/instrument/useRateV3/department/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
// 使用率统计V3房间
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/useRateV3UsingPOST
export const queryUseRateV3RoomStatistics = data => {
  return post("/instrument/useRateV3/room/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};

// 使用率统计V3设备
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/useRateV7UsingPOST
export const queryUseRateV3InstrumentStatistics = data => {
  return post("/instrument/useRateV3/instrument/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};


// 使用率分级统计
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/classificationStatisticsV3UsingPOST
export const queryClassificationV3Statistics = data => {
  return post("/instrument/classificationV3/statistics", data, {
    headers: { "content-type": "application/json" },
  });
};
//

// 根据设备类型获取设备名称
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/instrumentTypeNameUsingPOST
export const queryinstrumentTypeByName = data => {
  return post("/instrument/instrumentType/name", data, {
    headers: { "content-type": "application/json" },
  });
};

// 导出设备使用率情况
// http://47.107.102.103:9005/doc.html#/default/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E8%AE%BE%E5%A4%87%E6%8E%A5%E5%8F%A3/exportInstrumentUseRateUsingPOST
export function exportUseRate(data) {
  return request({
    url: "/instrument/export/useRate",
    data,
    method: "POST",
    responseType: "blob",
    timeout: 100000
  })
}
// 新设备综合使用接口
export const getStatisticEquipmentUseRate = data => {
  return post("/statistic/equipment/useRate", data, {
    headers: { "content-type": "application/json" },
  });
};
// 新设备利用率分级统计
export const getStatisticEquipmentClassification = data => {
  return post("/statistic/equipment/classification", data, {
    headers: { "content-type": "application/json" },
  });
};
// 探头上下移
export const postSensorBindLogadjustOrder = data => {
  return post("/sensorBindLog/adjustOrder", data, {
    headers: { "content-type": "application/json" },
  });
};
// 查询已关联智能硬件列表
export const getMonitorIndicatorSensorBindInfo = data => {
  return get("/monitorIndicator/sensorBindInfo", data, );
};
// 查询已关联智能硬件列表
export const getEquipmentBindEquipmentType = data => {
  return get("/equipment/bindEquipmentType", data, );
};

// 月度使用率统计/statistic/instrument/monthlyStatistics
export const postInstrumentMonthlyStatistics = data => {
  return post("/statistic/instrument/monthlyStatistics", data, {
    headers: { "content-type": "application/json" },
  });
};

// 月度使用率统计导出
export function exportInstrumentMonthlyStatistics(data) {
  return request({
    url: "/statistic/instrument/monthlyStatistics/export",
    data,
    method: "POST",
    responseType: "blob",
    timeout: 100000
  })
}
