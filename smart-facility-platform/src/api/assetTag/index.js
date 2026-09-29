import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

// 网关导出
export function postDeviceExportGateway(params) {
  return request({
    url: "/device/export/gateway",
    params,
    responseType: "blob"
  })
};

// 当前网关已绑定的标签列表
export const postLabelBindingList = data => {
  return post("/label/binding/list", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 标签统计
export const postLabelStatistics = data => {
  return post("/label/statistics", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 标签列表
export const postLabelList = data => {
  return post("/label/list", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 根据公司获取网关列表
export const getDeviceGatewayList = data => {
  return get("/device/gateway/list", data);
};

// 新增标签
export const postLabelSave = data => {
  return post("/label/save", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 编辑标签
export const postLabelEdit = data => {
  return post("/label/edit", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 删除标签
export const postLabelDelete = data => {
  return post("/label/delete", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};

// 标签导出
export function getLabelExport(params) {
  return request({
    url: "/label/export",
    params,
    responseType: "blob"
  })
};

// 批量修改标签绑定网关
export const postLabelUpdateGateway = data => {
  return post("/label/update/gateway", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};
// 批量设置网关网络模式
export const postWifiInputBatch = data => {
  return post("/device/wifi/inputBatch", data, {
    headers: {
      "content-type": "application/json"
    }
  });
};