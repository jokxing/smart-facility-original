import {get, post} from "@/utils/axios.js";


// 获取各个维度已分配的权限列表
export const postDataAuthDistributeList = data => {
    return post("/dataAuth/distributeList", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

// 分配权限
export const postDataAuthDistribute = data => {
    return post("/dataAuth/distribute", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

// 分配权限-智能硬件
export const postDataAuthDistributeDevice = data => {
    return post("/dataAuth/distributeDevice", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

// 已分配
export const postDataAuthDistributeSimpleList = data => {
    return post("/dataAuth/distributeSimpleList", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};