import {get, post} from "@/utils/axios";
import request from "@/utils/request";

/***** 信号接收器列表  ****/
export const getSignalList = data => {
    return post("/device/signal/list", data, {
        headers: {"content-type": "application/json"}
    });
}

/**** 信号接收器统计数据 ****/
export const getSignalStatistics = params => {
    return get("/device/signal/statistics", params);
};

/**** 信号接收器导出 ****/
export const  postDeviceExportReceiver = data => {
    return post("/device/export/receiver", data,{
        headers: { "content-type": "application/json" },
        responseType: "blob"
    })
}
/**** 获取可以绑定的智能硬件 ****/
export const getSignalBindDevices = params => {
    return get("/device/signal/bind/devices", params);
};

/**** 绑定智能硬件 ****/
export const postDeviceSignalBind = data => {
    return post("/device/signal/bind", data, {
        headers: {"content-type": "application/json"}
    });
}

/**** 获取已绑定的智能硬件 ****/
export const getDeviceSignalBindList = params => {
    return get("/device/signal/bind/list", params);
};

/**** 解除绑定 ****/
export const postDeviceSignalUnbind = data => {
    return post("/device/signal/unbind", data, {
        headers: {"content-type": "application/json"}
    });
}
