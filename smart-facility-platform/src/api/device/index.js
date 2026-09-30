import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

// 记录仪列表
export function getDeviceList(data) {
    return post("/device/list", data, {
        headers: {"content-type": "application/json"}
    });
}

// 创建记录仪
export function addDevice(data) {
    return post("/device/add", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取产品列表（分类型）
export function getDeviceProductOfType(params) {
    return get("/DEVICE_TYPE/list", params);
}

// 记录仪详情
export function getDeviceDetail(params) {
    return get("/device/detail", params, {
        timeout: 60000,
    });
}

//图表
export function getHistoryDeviceChart(params) {
    return get("/history/device/chart", params, {
        timeout: 60000
    });
}

//历史报警
export function getAlarmHistoryDevice(params) {
    return get("/history/device/alarm", params);
}

// 批量修改声光
export function updateAlarmLights(data) {
    return post("/device/update/batch/closeAlarm/soundLight", data, {
        headers: {"content-type": "application/json"}
    });
}
// 批量修改声光-新接口
export function updateAlarmLightsThread(data) {
    return post("/device/update/batch/closeAlarm/soundLight/thread", data, {
        headers: {"content-type": "application/json"},
        timeout: 60000,
    });
}
// 把批量修改声光新接口的数据传过去
export function updateAlarmResult(data) {
    return post("/device/update/batch/closeAlarm/result", data, {
        headers: {"content-type": "application/json"},
        timeout: 60000,
    });
}

// 批量修改平台报警器
export function updateAlarmSystems(data) {
    return post("/device/update/batch/closeAlarm/system", data, {
        headers: {"content-type": "application/json"}
    });
}

// 批量修改间隔报警
export function updateAlarmIntervals(data) {
    return post("/device/update/batch/interval/alarm", data, {
        headers: {"content-type": "application/json"}
    });
}

// 批量修改汇报时间
export function updateAlarmIntervalReports(data) {
    return post("/device/update/batch/interval/report", data, {
        headers: {"content-type": "application/json"}
    });
}

// 记录仪批量修改部门
export function mutilUpdateDepartmentsOfDevice(data) {
    return post("/device/update/batch/department", data, {
        headers: {"content-type": "application/json"}
    });
}

// 批量修改报警规则
export function postDeviceUpdateBatchSensors(data) {
    return post("/device/update/batch/sensors", data, {
        headers: {"content-type": "application/json"}
    });
}
// 批量修改报警规则-新接口
export function postDeviceUpdateBatchSensorsThread(data) {
    return post("/device/batch/update/sensors/thread", data, {
        headers: {"content-type": "application/json"},
        timeout: 60000,
    });
}
// 把批量修改报警规则新接口的数据传过去
export function postDeviceUpdateBatchSensorsResult(data) {
    return post("/device/update/batch/sensors/result", data, {
        headers: {"content-type": "application/json"},
        timeout: 60000,
    });
}

// 声光报警器开关
export function updateAlarmLight(data) {
    return post("/device/update/closeAlarm/soundLight", data, {
        headers: {"content-type": "application/json"}
    });
}

// 平台
export function updateCloseAlarmSystem(data) {
    return post("/device/update/closeAlarm/system", data, {
        headers: {"content-type": "application/json"}
    });
}

// 修改汇报时间
export function updateAlarmIntervalReport(data) {
    return post("/device/update/interval/report", data, {
        headers: {"content-type": "application/json"}
    });
}

//修改报警间隔
export function updateAlarmIntervalAlarm(data) {
    return post("/device/update/interval/alarm", data, {
        headers: {"content-type": "application/json"}
    });
}

//修改部门
export function updateDepartment(data) {
    return post("/device/update/basic", data, {
        headers: {"content-type": "application/json"}
    });
}

// 传感器最新值
export function currentDataDevice(params) {
    return get("/device/currentData", params);
}

// 记录仪历史分页记录
export function getHistoryDevice(params) {
    return get("/device/history", params);
}

//批量删除
export function removeBatchDevice(data) {
    return post("/device/remove/batch", data, {
        headers: {"content-type": "application/json"}
    });
}

// 单个删除
export function removeDevice(data) {
    return post("/device/remove/" + data.id, data, {
        headers: {"content-type": "application/json"}
    });
}

//修改报警规则
export function updateSensor(data) {
    return post("/device/update/sensors", data, {
        headers: {"content-type": "application/json"}
    });
}

// 导出数据
export function outputEquipmentDevice(params) {
    return request({
        url: "/device/output/equipment",
        params,
        responseType: "blob"
    })
}
// 导出记录仪历史数据
export function getExportHistoryDevice(params) {
    return request({
        url: "/device/export/history",
        params,
        responseType: "blob"
    })
}
// 监测编号是否存在
export const checkEquipmentNo = params => {
    return get("/device/check/equipmentNo", params);
};

// 记录仪导入
export const importEquipmentDevice = data => {
    return post("/device/import/batch/equipment", data);
};

// 智能硬件首页统计
export const getEquipmentDashboard = params => {
    return get("/equipment/dashboard", params);
};
// 传感器类型/sensorType/list
export const getSensorTypeList = params => {
    return get("/sensorType/list", params)
}

export const getAlarmErrorList = params => {
    return get("/alarm/errorList", params)
}
// 添加报警处理
export function addAlarmProcess(data) {
    return post("/alarm/add/process", data, {
        headers: {"content-type": "application/json"}
    });
}

export const getAlarmProcessInfo = params => {
    return get("/alarm/process/info", params)
}
// 修改报警处理
export function updateAlarmProcess(data) {
    return post("/alarm/update/process", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取设备返回
export const getBackData = data => {
    return post("/device/back/data", data, {
        headers: {"content-type": "application/json"}
    })
}

// 清空所有返回信息
export const getClearData = data => {
    return post("/device/clear/data?equipmentNo="+data.equipmentNo, data, {
        headers: {"content-type": "application/json"}
    })
}

// 我的报警历史
export const getHistoryDeviceAlarm = params => {
    return get("/history/my/alarm", params)
}

export const getDeviceBinding = data => {
    return post("/device/binding?equipmentIdStr=" + data.equipmentIdStr, data, {
        headers: {"content-type": "application/json"}
    })
}

// 获取分类
export const getEquipmentCount = params => {
    return get("/equipment/count", params)
}

// 分类列表
export const getEquipmentSortList = params => {
    return post("/equipment/sort/list", params, {
        headers: {"content-type": "application/json"}
    })
}


export const postDeviceWifiInput = params => {
    return post("/device/wifi/input", params, {
        headers: {"content-type": "application/json"}
    })
}

export const getDeviceWifiEcho = params => {
    return get("/device/wifi/echo", params)
}


// 批量修改枪架所属房间
export const postDeviceRoom = params => {
    return post("/device/room", params, {
        headers: {"content-type": "application/json"}
    })
}

// 批量更新管理人
export const postDeviceUser = params => {
    return post("/device/user", params, {
        headers: {"content-type": "application/json"}
    })
}

// 详情页修改记录仪
export const postDeviceUpdateEquipment = params => {
    return post("/device/update/equipment", params, {
        headers: {"content-type": "application/json"}
    })
}

// 未扫码取枪语音提醒设置
export const postDeviceOpenGunRemind = params => {
    return post("/device/openGun/remind", params, {
        headers: {"content-type": "application/json"}
    })
}

// 下载出厂检测报告PDF: 返回false表示没有出厂检测报告PDF
export const getEquipmentStatusPdf = params => {
    return get("/device/statusPdf", params)
}

// 硬件设备是否绑定了设备或房间
export const postDeviceBindThings = params => {
    return post("/device/deviceBindThings", params, {
        headers: {"content-type": "application/json"}
    })
}

// 数据权限设备列表
export function postDeviceDataAuthDeviceList(data) {
    return post("/device/dataAuth/deviceList", data, {
        headers: {"content-type": "application/json"}
    });
}
// 硬件使用状态-批量
export function postEquipmentUseStatus(data) {
    return post("/equipment/useStatus", data, {
        headers: {"content-type": "application/json"}
    });
}
// 查询分页
export function getUseStatusQuery(data) {
    return get("/useStatus/query", data);
}
// Demo-only catalog; the original production endpoints remain unchanged.
export function getDemoBindableCatalog(kind) {
    return get('/__demo/equipment/bindable', {kind});
}
