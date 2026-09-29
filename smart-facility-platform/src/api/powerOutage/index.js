import {get,post} from "@/utils/axios";
import request from "@/utils/request";

// 消警
export const getPowerInvalidateAlarm = params => {
    return get("/power/invalidate/alarm", params);
};
// 批量导出断电
export const  outputPowerDevice = data => {
    return post("/device/export/device", data,{
        headers: { "content-type": "application/json" },
        responseType: "blob"
    })
}
