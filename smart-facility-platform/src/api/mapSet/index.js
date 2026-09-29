import {deleteFn, get, post, put} from "@/utils/axios";

// 获取园区列表
export const getMapGardenList = params => {
    return get("/map/garden", params);
};

// 修改园区
export const putMapGarden = data => {
    return put("/map/garden", data, {
        headers: { "content-type": "application/json" }
    });
};

// 新增园区
export const postMapGarden = data => {
    return post("/map/garden", data, {
        headers: { "content-type": "application/json" }
    });
};

// 删除园区
export const deleteMapGarden = params => {
    return deleteFn("/map/garden", params);
};

// 获取园区楼宇
export const getMapBuildingList = params => {
    return get("/map/building", params);
};

// 修改园区楼宇
export const putMapBuilding = data => {
    return put("/map/building", data, {
        headers: { "content-type": "application/json" }
    });
};

// 新增园区楼宇
export const postMapBuilding = data => {
    return post("/map/building", data, {
        headers: { "content-type": "application/json" }
    });
};

// 删除园区楼宇
export const deleteMapBuilding = params => {
    return deleteFn("/map/building", params);
};

// 获取园区楼层
export const getMapFloorList = params => {
    return get("/map/floor", params);
};

// 修改园区楼层
export const putMapFloor = data => {
    return put("/map/floor", data, {
        headers: { "content-type": "application/json" }
    });
};

// 新增园区楼层
export const postMapFloor = data => {
    return post("/map/floor", data, {
        headers: { "content-type": "application/json" }
    });
};

// 删除园区楼层
export const deleteMapFloor = params => {
    return deleteFn("/map/floor", params);
};

// 获取房间
export const getMapLabList = params => {
    return get("/map/lab", params);
};


export const postMapBoundLab = data => {
    return post("/map/bound/lab", data, {
        headers: { "content-type": "application/json" }
    });
};

// 解除房间绑定
export const unboundMapLab = data => {
    return put("/map/unbound/lab?labId="+data.labId, {
        headers: { "content-type": "application/json" }
    });
};
