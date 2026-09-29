import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";

// 数据统计概览
export const getStatisticOverview = params => {
  return get("/statistic/overview", params);
};

// 报警统计
export const getStatisticEquipmentAlarm = params => {
  return get("/statistic/equipment/alarm", params);
};

export const getStatisticAlarm = params => {
  return get("/statistic/alarm", params);
};


export const getStatisticAlarmOverview = params => {
  return get("/statistic/alarm/overview", params);
};

// 使用排行
export const getStatisticInstrumentUse = params => {
  return get("/statistic/instrument/use", params);
};
// 使用率
export const getStatisticInstrumentUseRanKing = params => {
  return get("/statistic/instrument/useRanking", params);
};
// 设备使用图形统计
export const getStatisticInstrumentUseGraphStat = params => {
  return get("/statistic/instrument/useGraphStat", params);
};
//
export const getStatisticElectricity = params => {
  return get("/statistic/electricity", params);
};

// 功耗统计（图表）
export const getStatisticElectricityGraphStat = params => {
  return get("/statistic/electricity/graphStat", params);
};

// 设备状态
export const getStatisticStatus = params => {
  return get("/statistic/status", params);
};

// 获取清单列表
export const getRepertoireList = params => {
  return get("/repertoire/list", params);
};

export function postRepertoireAdd(data) {
  return post("/repertoire/add", data, {
    headers: {"content-type": "application/json"}
  });
}

export const getListEquipment = params => {
  return get("/repertoire/list/equipment", params);
};

export const getRepertoireDelete = params => {
  return get("/repertoire/delete", params);
};

export const getRepertoireEquipment = params => {
  return get("/repertoire/delete/equipment", params);
};
export const getRepertoireBatchEquipment = params => {
  return get("/repertoire/batch/delete/equipment", params);
};
//v5-设备使用情况
export const getStatisticUseRate = params => {
  return post("/statistic/instrument/useRate", params, {
    headers: {"content-type": "application/json"}
  });
};
// v5-设备使用情况导出
export function getStatisticUseRateExport(data) {
  return request({
    url: "/statistic/instrument/useRate/export",
    data,
    method: "POST",
    responseType: "blob"
  })
}

export function getStatisticInstrumentGradedStatisticsTableExport(data) {
  return request({
    url: "/statistic/instrument/gradedStatistics/table/export",
    data,
    method: "POST",
    responseType: "blob"
  })
}

// /statistic/instrument/gradedStatistics
export const getStatisticInstrumentGradedStatistics = params => {
  return post("/statistic/instrument/gradedStatistics", params, {
    headers: {"content-type": "application/json"}
  });
};
// /statistic/instrument/gradedStatistics/table
export const getStatisticInstrumentGradedStatisticsTable = params => {
  return post("/statistic/instrument/gradedStatistics/table", params, {
    headers: {"content-type": "application/json"}
  });
};
