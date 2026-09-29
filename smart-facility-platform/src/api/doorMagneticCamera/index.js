import { get, post } from '@/utils/axios.js'

// 列表
export function getDoorCameraList(data) {
  return post('/door/listcontact', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 创建
export function addDoorCamera(data) {
  return post('/door/addcontact', data, {
    headers: { 'content-type': 'application/json' }
  })
}
// 编辑
export function editDoorCamera(data) {
  return post('/door/editcontact', data, {
    headers: { 'content-type': 'application/json' }
  })
}


//批量删除
export function deletebatchcontact(data) {
  return post('/door/deletebatchcontact', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 查询门磁摄像头名称是否重复
export const existcontactname = (params) => {
  return post('/door/existcontactname', params)
}
// 查询门磁摄像头编码是否重复
export const existcontactno = (params) => {
  return post('/door/existcontactno', params)
}

// 首页统计
export const getDoorCameraDashboard = (params) => {
  return post('/door/dashboard', params)
}

// 查询门磁摄像头今日异常次数分页
export const queryErrorData = (data) => {
  return post('/door/doorTodayError/queryPage', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 根据硬件设备编号删除对应的今日异常次数数据
export const clearErrorData = (data) => {
  return post('/door/doorTodayError/deleteByContactNo', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 查询监控录像
export const queryDoorVideoMonitor = (data) => {
  return post('/door/doorVideoMonitor/queryForContactNo', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 查询开关纪录
export const querySwitchRecord = (data) => {
  return post('/door/doorRecordSwitch/queryPage', data, {
    headers: { 'content-type': 'application/json' }
  })
}

// 导出门磁摄像头列表
export const  postExportDoorCameraList = data => {
  return post("/door/export", data,{
    headers: { "content-type": "application/json" },
    responseType: "blob"
  })
}

// 导出开关纪录
export const  postExportDoorRecordSwitch = data => {
  return post("/door/doorRecordSwitch/exportExcel", data,{
    headers: { "content-type": "application/json" },
    responseType: "blob"
  })
}

// 获取门磁摄像头详情
export const  getDoorCameraDetail = params => {
  return get("/door/info", params)
}
