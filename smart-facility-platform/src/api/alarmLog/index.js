import {post} from "@/utils/axios";
import request from "@/utils/request.js";

// 分页查询报警记录
export function getAlarmRecordList(params) {
  return post('/monitorIndicator/historyAlarmRecord/summary', params, {
    headers: {"content-type": "application/json"}
  })
}

// 导出
export function exportAlarmRecord(data) {
  return post("/monitorIndicator/historyAlarmRecord/summary/export", data, {
    headers: {
      "content-type": "application/json"
    },
    responseType: "blob"
  })
}

// 批量处理异常
export function batchHandleException(params) {
  return post('/monitorIndicator/exceptionHandle/batch', params, {
    headers: {"content-type": "application/json"}
  })
}

