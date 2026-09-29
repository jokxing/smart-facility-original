import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

//
// export function addDevice(data) {
//     return post("/device/add", data, {
//         headers: {"content-type": "application/json"}
//     });
// }

// 获取最新状态标签列表
export function getOpenMonitorFlag(params) {
    return get("/monitorIndicator/getOpenMonitorFlag", params);
}

// 查询监控信息
export function getMonitorInfo(params) {
    return get("/monitorIndicator/monitorInfo", params);
}

/*------------获取编辑探头列表--------------*/
export const getSensorEditList = params => {
    return get("/monitorIndicator/sensorEditList", params);
};

/*-------- 设备与房间修改探头别名 -------*/
export const postSensorChange = data => {
    return post("/monitorIndicator/sensorChange", data, {
        headers: { "content-type": "application/json" },
    });
};

/*------------获取探头类型列表--------------*/
export const getAllSensorType = params => {
    return get("/monitorIndicator/allSensorType", params);
};

/*------------获取探头类型列表--------------*/
export const getAllSensorTypeV2 = params => {
    return get("/monitorIndicator/allSensorType/v2", params);
};

/*------------获取设备或房间可绑定的智能硬件列表--------------*/
export const postMonitorIndicatorList = params => {
    return post("/monitorIndicator/list", params, {
        headers: { "content-type": "application/json" }
    });
};

  /*------------设备与房间绑定智能硬件--------------*/
export const postMonitorIndicatorAdd = params => {
    return post("/monitorIndicator/addMonitorIndicator", params, {
      headers: { "content-type": "application/json" }
    });
};

// 获取标签列表，包括关闭的探头
export function getMonitorFlag(params) {
    return get("/monitorIndicator/getMonitorFlag", params);
}

  /*------------查询历史数据--------------*/
  export const postMonitorIndicatorHistory = params => {
    return post("/monitorIndicator/historyPage", params, {
      headers: { "content-type": "application/json" }
    });
};

// 历史监控信息导出功能
export function postmonitorIndicatorExportSingleThingsHistory(data) {
    return post("/monitorIndicator/export/exportSingleThingsHistory", data, {
        headers: {"content-type": "application/json"}
    });
}

// 查询已关联智能硬件列表,只展示当前绑定的智能硬件
export function getMonitorIndicatorThingsList(params) {
    return get("/monitorIndicator/things/newList", params);
}

// 历史报警记录
export function postMonitorIndicatorHistoryAlarmRecord(data) {
    return post("/monitorIndicator/historyAlarmRecord", data, {
        headers: {"content-type": "application/json"}
    });
}

// 异常处理
export function postMonitorIndicatorExceptionHandle(data) {
    return post("/monitorIndicator/exceptionHandle", data, {
        headers: {"content-type": "application/json"}
    });
}

// 我的报警信息
export function getMonitorIndicatorMyAlarmRecord(params) {
    return get("/monitorIndicator/myAlarmRecord", params);
}

// 智能硬件导出功能
export function postmonitorIndicatorExportHistory(data) {
    return post("/monitorIndicator/export/exportHistory", data, {
        headers: {"content-type": "application/json"}
    });
}

// 智能硬件导出功能
export function postMonitorIndicatorExportList(data) {
    return post("/monitorIndicator/export/list", data, {
        headers: {"content-type": "application/json"}
    });
}

// 房间/设备管理员列表
export function postNoticeGroupStrategyGetAdministrator(data) {
    return post("/noticeGroupStrategy/getAdministrator", data, {
        headers: {"content-type": "application/json"}
    });
}

// 我的报警信息
export function getDeviceMonitorFlag(params) {
    return get("/monitorIndicator/getDeviceMonitorFlag", params);
}

// 智能硬件获取标签列表，不包括绑定的设备和房间的探头记录
export function getDeviceSingleMonitorFlag(params) {
    return get("/monitorIndicator/getDeviceSingleMonitorFlag", params);
}

// 该智能硬件是否在2.0系统上
export function getIsAlarmRuleOpenTwoSystem(params) {
    return get("/monitorAlarmRule/isOpenTwoSystem", params);
}
