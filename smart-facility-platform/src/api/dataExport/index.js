import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";

// 获取导出物品列表
export function postInstrumentExportList(data) {
    return post("/instrument/export/list", data, {
        headers: {"content-type": "application/json"}
    });
}

// 导出历史数据
export function postDeviceExportHistoryData(data) {
    return post("/device/export/history/data", data, {
        headers: {"content-type": "application/json"}
    });
}
// 导出历史数据列表
export function postDeviceExportList(data) {
    return get("/device/export/list", data);
}
// 导出记录详情
export function postDeviceExportDetail(data) {
    return get("/device/export/detail", data);
}

