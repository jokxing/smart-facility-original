import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";

export const getCompanyInfo = params => {
  return get("/company/info", params);
};
export const postCompanyUpdate = params => {
  return post("/company/update", params, {
    headers: { "content-type": "application/json" }
  });
};

/*************权限相关接口*************/
/*************获取菜单列表*************/
export const getRoleMenu = params => {
  return get("/role/menu", params);
};

/*************角色权限相关接口*************/
/*************角色列表*************/
export const getRoleList = params => {
  return get("/role/list", params);
};

/*************日志管理相关接口*************/
/*************日志列表*************/
export const getLogList = params => {
  return get("/log/list", params);
};

/*************日志操作人列表*************/
export const getLogUserList = params => {
  return get("/log/user/list", params);
};
/*************导出日志*************/
export const getLogExport = params => {
  return get("/log/export", params, {
    responseType: "blob"
  });
};

// 获取公司余额报警
export const getCompanyMoney = params => {
  return get("/company/getMoney", params);
};
//
export const postCompanyUpdateMoney = params => {
  return post("/company/updateMoney", params, {
    headers: { "content-type": "application/json" }
  });
};

/**************设备等级列表***************/
export const getGradeList = params => {
  return get("/grade/list", params);
};
/************设备等级群组选择***********/
export function queryGroup(data){
  return get("/noticeGroup/list",data);
}
/*********设备等级保存**************/
export function  insertGrade(data){
  return post("/grade/save",data,{
    headers: { "content-type": "application/json" }
  });
}
/*********设备等级更新*************/
export function updateGrade(data){
  return post("/grade/update",data,{
    headers: { "content-type": "application/json" }
  });
}
/********删除设备等级*************/
export function removeBatchGrade(data){
  return post("/grade/delete",data,{
    headers: { "content-type": "application/json" }
  });
}

/**************设备等级-下拉框***************/
export const getGradeGetList = params => {
  return get("/grade/getlist", params);
};

/*********群组列表***********/
export function getGroupList(data){
  return get("/noticeGroup/list",data);
}
/**********群组删除&批量删除********/
export function removeBatchGroup(data){
  return post("/noticeGroup/batchDelete",data,
  {
    headers : {"content-type":"application/json"}
  });
}
// 添加群组
export function postNoticeGroupAdd(data){
  return post("/noticeGroup/add",data,
      {
        headers : {"content-type":"application/json"}
      });
}
// 修改群组
export function postNoticeGroupUpdate(data){
  return post("/noticeGroup/update",data,
      {
        headers : {"content-type":"application/json"}
      });
}
// 群组详情
export function getGroupDetails(data){
  return get("/noticeGroup/details",data);
}
// 修改公司logo
export function postCompanyUpdateLogo(data){
  return post("/company/update/logo",data,
      {
        headers : {"content-type":"application/json"}
      });
}
// 获取当前公司logo
export function getCompanyGetLogo(data){
  return get("/company/getLogo",data);
}