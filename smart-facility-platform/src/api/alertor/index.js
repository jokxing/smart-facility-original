import {get, post} from "@/utils/axios";

// 声光报警器列表
export const getAlertorList = params => {
    return get("/alertor/list", params);
}

// 创建报警器
export const addAlertor = data => {
    return post("/alertor/add", data, {
        headers: {"content-type": "application/json"}
    });
};

// 删除报警器
export const removeAlertor = data => {
    return post(`/alertor/remove/${data.id}`, data, {
        headers: {"content-type": "application/json"}
    });
};

// 关联记录仪一览
export const getSearchThingsAlertor = params => {
    return get("/alertor/things/list", params,);
};

// 绑定硬件
export const addThingsAlertor = params => {
    return post("/alertor/things/add", params, {
        headers: {"content-type": "application/json"}
    });
};

// 可关联的记录仪列表

export const getAlertorSearchThings = params => {
    return post("/instrument/alertor/preLink", params, {
        headers: {"content-type": "application/json"}
    });
};
// 解除绑定
export const deleteAlertorThings = params => {
    return post("/alertor/things/delete", params, {
        headers: {"content-type": "application/json"}
    });
};

// 编辑报警器
export const updateAlertor = data => {
    return post("/alertor/update", data, {
        headers: {"content-type": "application/json"}
    });
};

// 开启/关闭报警
export const closeAlarmAlertor = params => {
    return get("/alertor/closeAlarm", params);
};

// 消警
export const invalidateAlarmAlertor = params => {
    return get("/alertor/invalidate/alarm", params);
};

// 蜂鸣时长
export const getAlertorDeepAlarmTime = data => {
    return post("/alertor/beep/alarmTime", data, {
        headers: {"content-type": "application/json"}
    });
};

// 声光报警器
export const getSignalSourceUnit = params => {
    return get("/signalSource/unit", params);
};

// 编辑信号源
export const getSignalSourceEdit = data => {
    return post("/signalSource/edit", data, {
        headers: {"content-type": "application/json"}
    });
};

// 查找信号源
export const getSignalSourceList = data => {
    return post("/signalSource/list", data, {
        headers: {"content-type": "application/json"}
    });
};

// 查询防区五详情
export const getAlarmAlarmorMonitorInfoObtain = params => {
    return get("/alarm/alarmorMonitorInfo/obtain", params);
};

// 编辑防区五监控范围
export const getAlarmAlarmorMonitorInfoSaveEdit = data => {
    return post("/alarm/alarmorMonitorInfo/saveEdit", data, {
        headers: {"content-type": "application/json"}
    });
};

// 批量修改蜂鸣时长
export const getAlertorBeepAlarmTimeBatch = data => {
    return post("/alertor/beep/alarmTime/batch", data, {
        headers: {"content-type": "application/json"}
    });
};

// 获取蜂鸣时长
export const getAlertorObtainBeepTime = params => {
    return get("/alertor/obtain/beepTime", params);
};
