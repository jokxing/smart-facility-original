import {get, post} from "@/utils/axios";

// 园区列表
export const getGardenList = params => {
    return get("/map/garden/list", params);
};
// 获取园区楼宇
export const getBuilding = params => {
    return get("/map/building", params);
};