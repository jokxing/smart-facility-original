import {get, post} from "@/utils/axios";
import request from "@/utils/request";

// 房间列表
export const getRoomList = data => {
    return post("/room/list", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};
//下拉框房间信息
export const getRoomSelectList = params => {
    return get("/room/selectList", params);
};
// 房间统计
export const getRoomDashboard = data => {
    return get("/room/dashboardV1", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

//创建房间
export function addRoom(data) {
    return post('/room/add', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 更新房间基本信息
export function updateRoomBasic(data) {
    return post('/room/update/basic', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 删除房间
export function removeRoom(data) {
    return post('/room/remove/' + data.id, data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 房间异常统计图
export const getRoomAlarmStatistics = params => {
    return get("/room/alarmStatistics", params);
};
// 房间详情
export const getRoomDetail = params => {
    return get("/room/detail", params)
}
// 查询已关联的智能硬件
export const getRoomThingsList = params => {
    return get("/room/things/list", params)
}

// 关联智能硬件
export function addRoomThings(data) {
    return post('/room/things/add', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 当前房间所有被监测设备的温湿度情况
export const getRoomMonitorInstrument = params => {
    return get("/room/monitor/instrument", params)
}

// 解绑智能硬件
export function removeRoomThings(data) {
    return post('/room/things/remove', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 单个房间近一个月报警离线i
export const getRoomDeviceErrorStatistics = data => {
    return post("/room/deviceErrorStatistics", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 解绑关联实验室设备/room/goods/remove
export const removeRoomGoods = data => {
    return post("/room/goods/remove", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 房间查询绑定硬件历史数据
export const postRoomBindingHistory = data => {
    return post("/room/binding/equipment/histroy", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 获取巡查报告列表
export const getRoomReportList = data => {
    return post("/roomReport/list", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 添加巡查模板/
export const addReportTemplate = data => {
    return post("/reportTemplate/add", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 模板列表
export const getReportTemplateList = data => {
    return post("/reportTemplate/list", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 新增检查项
export const addReportTemplateItem = data => {
    return post("/reportTemplate/add/item", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 查询模板及其检查项
export const getReportTemplateObtainItem = params => {
    return get("/reportTemplate/obtain/item", params)
}
// 删除模板
export const deleteReportTemplate = data => {
    return post("/reportTemplate/delete", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 编辑和删除检查项
export const updateReportTemplateEditItem = data => {
    return post("/reportTemplate/edit/item", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 不分页模板列表
export const getReportTemplateListNoPage = data => {
    return post("/reportTemplate/listNoPage", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 新增房间巡查报告
export const addReportRoomReport = data => {
    return post("/roomReport/addReport", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 删除巡查报告
export const removeReportRoomReport = data => {
    return post("/roomReport/remove/" + data.id, data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 获取巡查报告及其详情
export const getObtainReportRoomReport = params => {
    return get("/roomReport/obtainRoomReport/"+ params.id, params)
}
// 填写房间巡查报告
export const editReportRoomReport = data => {
    return post("/roomReport/editReport", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 批量修改房间
export const updateRoomBatch = data => {
    return post("/room/batch/update", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 批量删除
export const deleteRoomBatch = data => {
    return post("/room/batch/delete", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
// 导出房间
export const getExportRoom = data => {
    return post("/room/export", data, {
        headers: {
            "content-type": "application/json"
        },
        responseType: "blob"
    })
}

// 房间绑定硬件的历史数据查询
export const postRoomBindingEquipmentHistroy = data => {
    return post("/room/binding/equipment/histroy", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
//导出绑定房间的硬件的汇报历史数据
export const postRoomExportHistory = data => {
    return post("/room/export/history", data, {
        headers: {
            "content-type": "application/json"
        },
        responseType: "blob"
    })
}

// 位置调整所属房间列表
export function getRoomPositionRoomList(params) {
    return get("/room/positionRoom/list", params);
}

// 网关所属房间列表
export function getRoomGatewayRoomList(params) {
    return get("/room/gatewayRoom/list", params);
}

// 获取报警规则设置列表
export const queryMonitorAlarmRule = data => {
    return post("/monitorAlarmRule/queryList", data, {
        headers: {
            "content-type": "application/json"
        },
    })
}
// 设置时间时间规则
export const setMonitorAlarmRules = data => {
    return post("/monitorAlarmRule/setAlarmRule", data, {
        headers: {
            "content-type": "application/json"
        },
    })
}
// 设置范围规则
export const setMonitorAlarmRuleLimits = data => {
    return post("/monitorAlarmRuleLimit/setAlarmRuleLimit", data, {
        headers: {
            "content-type": "application/json"
        },
    })
}
// 删除时间规则
// export const deleteMonitorAlarmRule = data => {
//     return post("/monitorAlarmRule/deleteAlarmRule", data, {
//         headers: {
//             "content-type": "application/json"
//         }
//     })
// }


// 获取房间列表(树型结构)
export const getRoomTree = data => {
    return post("/room/tree", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

//数据权限房间列表
export const postRoomDataAuthRoomList = data => {
    return post("/room/dataAuth/roomList", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}