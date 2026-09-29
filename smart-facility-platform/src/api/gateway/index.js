import {get, post} from "@/utils/axios.js";

//获取集中器列表
export function getGateway(params) {
    return get("/gateway/list", params);
}

//删除集中器
export function deleteGateway(data) {
    return post(`/gateway/remove/${data.id}`, data, {
        headers: {"content-type": "application/json"}
    });
}

//集中器类型
export function getGatewayListAll() {
    return get("/gateway/gatewayTypeList");
}

//新增
export function addGateway(data) {
    return post("/gateway/add", data, {
        headers: {"content-type": "application/json"}
    });
}

//修改信息
export function updateGateway(data) {
    return post("/gateway/update", data, {
        headers: {"content-type": "application/json"}
    });
}

// 集中器详情
export function getGatewayDetail(params) {
    return get("/gateway/detail", params);
}

// 集中器周围记录仪
export function getGatewayAround(params) {
    return get("/gateway/around", params);
}
