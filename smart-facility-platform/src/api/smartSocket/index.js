import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";

// 智能插座列表
export const getSmartSocketList = params => {
  return get("/smartSocket/list", params);
};

// 修改智能插座待机功率
export const updateStandbyPowerSmartSocket = data => {
  return post("/smartSocket/update/standbyPowerV2", data, {
    headers: { "content-type": "application/json" }
  });
};
export const  getSmartSocketNum = params => {
  return get("/smartSocket/smartSocket/num", params)
}

// 智能插座耗电量历史记录

export const  getSmartElectricityHistory = data => {
  return post("/smartSocket/electricityHistory", data,{
    headers: { "content-type": "application/json" }
  })
}

// 设备使用导出
export function exportSmartElectricityHistory(data) {
  return request({
    url: "/smartSocket/electricityHistory/export",
    data,
    method: "POST",
    responseType: "blob"
  })
}

//
export const  postSmartElectricity = data => {
  return post("/smartSocket/electricity", data,{
    headers: { "content-type": "application/json" }
  })
}

// 设备管理器
export const  postDeviceExportSupervisor = data => {
  return post("/device/export/supervisor", data,{
    headers: { "content-type": "application/json" },
    responseType: "blob"
  })
}
