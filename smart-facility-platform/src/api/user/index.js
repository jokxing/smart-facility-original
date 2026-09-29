import { get, post } from "@/utils/axios.js";
import request from "@/utils/request";
//获取负责人列表
export function getEquipmentUserList(params) {
  return get("/equipmentUser/list", params);
}

// 获取房间/实验室设备负责人列表
export function getThingsUserList(params) {
  return get("/thingsUser/list", params);
}

// 获取员工列表
export function getUserList(query) {
  return get("/user/list", query);
}

// 轻量获取员工列表(id,name,loginId)
export function miniListUser(query) {
  return get("/user/miniList", query);
}
// 轻量获取员工列表(id,name,tel)
export function miniListUserIdNameTel(query) {
  return get("/user/miniListIdNameTelV1", query);
}

//创建智能硬件负责人
export function addEquipmentUser(data) {
  return post("/equipmentUser/add", data, {
    headers: { "content-type": "application/json" }
  });
}

// 智能硬件报警设置
export function updateEquipmentUser(data) {
  return post("/equipmentUser/alarmSetting", data, {
    headers: { "content-type": "application/json" }
  });
}

// 房间/实验室负责人报警设置
export function updateThingsUser(data) {
  return post("/thingsUser/alarm/set", data, {
    headers: { "content-type": "application/json" }
  });
}

// 设置房间/实验室设备负责人
export function addThingsConscientious(data) {
  return post("/thingsUser/add/conscientious", data, {
    headers: { "content-type": "application/json" }
  });
}

// 移除房间、实验室设备负责人
export function removeThingsUser(data) {
  return post("/thingsUser/remove", data, {
    headers: { "content-type": "application/json" }
  });
}

// 删除设备负责人
export function removeEquipmentUser(data) {
  return post("/equipmentUser/remove", data, {
    headers: { "content-type": "application/json" }
  });
}

// 获取当前用户信息
export function getUserInfo(params) {
  return get("/user/info", params);
}
// 更新员工信息
export function updateUserBasic(data) {
  return post("/user/update/basic", data, {
    headers: { "content-type": "application/json" }
  });
}

export function updateUserRole(data) {
  return post("/user/update/role", data, {
    headers: { "content-type": "application/json" }
  });
}

//新增员工
export function userAdd(data) {
  return post("/user/add", data, {
    headers: { "content-type": "application/json" }
  });
}

//操作离职
export const postLeaveJob = data => {
  return post("/user/delete/batch", data, {
    headers: { "content-type": "application/json" }
  });
};

//更改部门
export const postChangeDeptBatch = data => {
  return post("/user/update/department/batch", data, {
    headers: { "content-type": "application/json" },
  });
};

//解除企业微信
export const postUnBindQyWechat = data => {
  return post("/qyWechat/unBind/qy/wechat", data, {
    headers: { "content-type": "application/json" },
  });
};

// 绑定企业微信
export const postBindQyWechat = data => {
  return get("/qyWechat/bind/qy/wechat", data);
};

// 微信报警方式
export const getWechatAlarmType = data => {
  return get("/qyWechat/weixin/type", data);
};


// 微信绑定/api
export function getWeixinQrCodeUrl(params) {
  return get("/wx/getWeixinQrCodeUrl", params);
}

// 获取openId  /api
export function getBdWeiXinOpenId(params) {
  return get("wx/getWeiXinUserInfo", params);
}

//导出用户信息
export const postUserExport = data => {
  return post("/user/export", data, {
    headers: { "content-type": "application/json" },
    responseType: "blob"
  });
};

// 解除微信绑定/api
export function getWxUnbundle(params) {
  return get("wx/unbundle", params);
}

// 获取公司下的所有员工列表
export function getUserCompanyList(query) {
  return get("/user/company/list", query);
}

// 获取公司下的所有员工列表
export const getDepartmentHeadUser = data => {
  return post("/instrument/department/headUser", data, {
    headers: { "content-type": "application/json" },
  });
};